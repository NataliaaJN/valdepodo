"""
Plantilla conceptual por capas (Fase 4, docs/3d-pipeline.md §6.2, spec 08 §4).

Genera una plantilla paramétrica a partir de `config/insole.json`:
  1. Contorno 2D (talón y puntera redondeados, perfil de anchuras, puntera desplazada hacia el lado interno).
  2. Rejilla regular sobre el contorno (filas a lo largo, columnas a lo ancho).
  3. Superficie: arco interno (gaussiana en `arch_peak`), copa de talón y elevación de la puntera.
  4. Una malla cerrada por capa (`layer_<id>`), apilada sobre la anterior; la zona `rearfoot` se adelgaza
     hasta desaparecer en el mediopié.
  5. Export GLB (Y arriba, metros, centrada, apoyada en y = 0) + renders de validación (Workbench)
     + pósters de fallback (Eevee, fondo transparente, mismo encuadre que la web).

Es una REPRESENTACIÓN CONCEPTUAL: ni la forma ni los espesores representan un producto real, y no se
atribuyen materiales ni procesos de fabricación (spec 04 §2.2).

Uso:
  node tools/blender/run-blender.mjs tools/blender/build_insole.py -- \
      --config tools/blender/config/insole.json --out tools/out/insole.raw.glb [--no-render] [--posters]
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

from lib.cli import base_parser, load_config, script_argv  # noqa: E402
from lib.export import export_glb  # noqa: E402
from lib.report import write_report  # noqa: E402
from lib.scene import hex_to_linear_rgba, principled_material, render_view, reset_scene  # noqa: E402

MM = 0.001


def smoothstep(e0: float, e1: float, x: float) -> float:
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


# --------------------------------------------------------------------------------------------------
# Forma
# --------------------------------------------------------------------------------------------------


class InsoleShape:
    """Contorno y superficie en mm. u ∈ [0, 1] del talón a la puntera; v ∈ [-1, 1] de medial a lateral."""

    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg
        self.length = float(cfg["length_mm"])
        self.r_heel = float(cfg["heel_radius_mm"])
        self.r_toe = float(cfg["toe_radius_mm"])
        self.knots = [(float(u), float(w)) for u, w in cfg["width_profile"]]

    def width(self, u: float) -> float:
        s = u * self.length
        if s <= self.r_heel:
            return 2 * math.sqrt(max(0.0, self.r_heel**2 - (self.r_heel - s) ** 2))
        toe_start = self.length - self.r_toe
        if s >= toe_start:
            w_start = self._body_width(toe_start / self.length)
            ratio = w_start / (2 * self.r_toe)
            return 2 * math.sqrt(max(0.0, self.r_toe**2 - (s - toe_start) ** 2)) * ratio
        return self._body_width(u)

    def _body_width(self, u: float) -> float:
        """Interpolación cúbica monótona (Fritsch-Carlson): contorno suave, sin ondulaciones ni rebasamientos."""
        xs = [k[0] for k in self.knots]
        ys = [k[1] for k in self.knots]
        if u <= xs[0]:
            return ys[0]
        if u >= xs[-1]:
            return ys[-1]
        n = len(xs)
        d = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(n - 1)]
        m = [d[0]] + [0.0 if d[i - 1] * d[i] <= 0 else (d[i - 1] + d[i]) / 2 for i in range(1, n - 1)] + [d[-1]]
        for i in range(n - 1):
            if d[i] == 0:
                m[i] = m[i + 1] = 0.0
                continue
            a, b = m[i] / d[i], m[i + 1] / d[i]
            h = a * a + b * b
            if h > 9:
                t = 3 / math.sqrt(h)
                m[i], m[i + 1] = t * a * d[i], t * b * d[i]
        i = max(k for k in range(n - 1) if xs[k] <= u)
        h = xs[i + 1] - xs[i]
        t = (u - xs[i]) / h
        h00, h10 = 2 * t**3 - 3 * t**2 + 1, t**3 - 2 * t**2 + t
        h01, h11 = -2 * t**3 + 3 * t**2, t**3 - t**2
        return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1]

    def rim(self, u: float, v: float) -> float:
        """0 en el centro de la plantilla → 1 en el borde. En el talón se mide radialmente (sin picos en la punta)."""
        x, y = self.point(u, v)
        heel_cy = self.length / 2 - self.r_heel
        if y > heel_cy:
            d = math.hypot(x - self.center(0), y - heel_cy) / self.r_heel
        else:
            d = abs(v)
        return min(1.0, d)

    def center(self, u: float) -> float:
        """Desplazamiento lateral del eje: la puntera se va hacia el lado interno (dedo gordo más largo)."""
        return -float(self.cfg["toe_medial_shift_mm"]) * smoothstep(0.62, 1.0, u)

    def surface(self, u: float, v: float) -> float:
        """Altura de la cara inferior de la plantilla (mm)."""
        cfg = self.cfg
        medial = max(0.0, min(1.0, (0.25 - v) / 1.25)) ** 1.5
        arch = cfg["arch_height_mm"] * math.exp(-(((u - cfg["arch_peak"]) / cfg["arch_spread"]) ** 2)) * medial
        cup = cfg["heel_cup_depth_mm"] * (1 - smoothstep(0.1, 0.32, u)) * smoothstep(0.35, 1.0, self.rim(u, v)) ** 1.6
        spring = cfg["toe_spring_mm"] * smoothstep(0.8, 1.0, u) ** 2
        return arch + cup + spring

    def point(self, u: float, v: float) -> tuple[float, float]:
        """(x, y) en mm del plano: x a lo ancho (medial negativo), y a lo largo (talón en +y)."""
        x = self.center(u) + v * self.width(u) / 2
        y = self.length / 2 - u * self.length
        return x, y


def thickness(shape: InsoleShape, layer: dict, u: float) -> float:
    cfg = shape.cfg
    t = float(cfg["thickness_mm"]) * float(layer["thickness_ratio"])
    t *= 1 - 0.35 * smoothstep(0.62, 0.98, u)  # algo más fina en la puntera
    if layer["zone"] == "rearfoot":
        zone = cfg["zones"]["rearfoot"]
        t *= 1 - smoothstep(zone["fade_start"], zone["end"], u)
    return t


def u_range(shape: InsoleShape, layer: dict) -> tuple[float, float]:
    eps = 0.0015
    if layer["zone"] == "rearfoot":
        return eps, float(shape.cfg["zones"]["rearfoot"]["end"])
    return eps, 1 - eps


# --------------------------------------------------------------------------------------------------
# Mallas
# --------------------------------------------------------------------------------------------------


def build_layer_mesh(
    name: str,
    shape: InsoleShape,
    u0: float,
    u1: float,
    bottom_fn,
    top_fn,
    n_along: int,
    n_across: int,
) -> bpy.types.Object:
    """Malla cerrada: rejilla superior + inferior + paredes del perímetro."""
    bm = bmesh.new()
    rows = max(8, round(n_along * (u1 - u0)))
    grid_top: list[list[bmesh.types.BMVert]] = []
    grid_bot: list[list[bmesh.types.BMVert]] = []
    for i in range(rows + 1):
        # Más filas en los extremos (curvatura del talón y la puntera)
        t = i / rows
        u = u0 + (u1 - u0) * (0.5 - 0.5 * math.cos(math.pi * t))
        row_t, row_b = [], []
        for j in range(n_across + 1):
            v = -1 + 2 * j / n_across
            x, y = shape.point(u, v)
            zb = bottom_fn(u, v)
            zt = top_fn(u, v)
            row_b.append(bm.verts.new((x * MM, y * MM, zb * MM)))
            row_t.append(bm.verts.new((x * MM, y * MM, zt * MM)))
        grid_top.append(row_t)
        grid_bot.append(row_b)

    for i in range(rows):
        for j in range(n_across):
            # Caras superiores hacia +Z e inferiores hacia -Z
            bm.faces.new((grid_top[i][j], grid_top[i][j + 1], grid_top[i + 1][j + 1], grid_top[i + 1][j]))
            bm.faces.new((grid_bot[i][j], grid_bot[i + 1][j], grid_bot[i + 1][j + 1], grid_bot[i][j + 1]))

    def wall(a_top, b_top, a_bot, b_bot):
        if (a_top.co - a_bot.co).length < 1e-7 and (b_top.co - b_bot.co).length < 1e-7:
            return
        bm.faces.new((a_bot, b_bot, b_top, a_top))

    last = n_across
    for i in range(rows):
        wall(grid_top[i + 1][0], grid_top[i][0], grid_bot[i + 1][0], grid_bot[i][0])
        wall(grid_top[i][last], grid_top[i + 1][last], grid_bot[i][last], grid_bot[i + 1][last])
    for j in range(n_across):
        wall(grid_top[0][j], grid_top[0][j + 1], grid_bot[0][j], grid_bot[0][j + 1])
        wall(grid_top[rows][j + 1], grid_top[rows][j], grid_bot[rows][j + 1], grid_bot[rows][j])

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def smooth_shading(obj: bpy.types.Object, angle_deg: float = 50) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(angle_deg))
    except (AttributeError, RuntimeError, TypeError):
        bpy.ops.object.shade_smooth()


def build_insole(cfg: dict) -> list[bpy.types.Object]:
    shape = InsoleShape(cfg)
    n_along = int(cfg["grid"]["along"])
    n_across = int(cfg["grid"]["across"])
    # Apilado de abajo arriba: orden ascendente
    layers = sorted(cfg["layers"], key=lambda layer: layer["order"])

    objects: list[bpy.types.Object] = []
    below: list[dict] = []
    for layer in layers:
        stack = list(below)

        def bottom(u: float, v: float, stack=stack) -> float:
            return shape.surface(u, v) + sum(thickness(shape, lay, u) for lay in stack)

        def top(u: float, v: float, layer=layer, bottom=bottom) -> float:
            return bottom(u, v) + thickness(shape, layer, u)

        u0, u1 = u_range(shape, layer)
        obj = build_layer_mesh(f"layer_{layer['id']}", shape, u0, u1, bottom, top, n_along, n_across)
        smooth_shading(obj)
        obj.data.materials.append(principled_material(f"mat_{layer['id']}", layer["color"], roughness=0.5))
        # Custom properties → extras del GLB (spec 08 §4.1)
        obj["id"] = layer["id"]
        obj["order"] = int(layer["order"])
        obj["explodeOffset"] = float(layer["explode_offset_mm"]) * MM
        objects.append(obj)
        below.append(layer)
    return objects


def apply_explode(objects: list[bpy.types.Object], amount: float) -> None:
    for obj in objects:
        obj.location.z = amount * obj["explodeOffset"]


# --------------------------------------------------------------------------------------------------
# Pósters (Eevee, mismo encuadre que la escena web)
# --------------------------------------------------------------------------------------------------


def gltf_to_blender(p: list[float]) -> Vector:
    """(x, y, z) glTF Y-up → (x, -z, y) Blender Z-up."""
    return Vector((p[0], -p[2], p[1]))


def render_poster(objects: list[bpy.types.Object], cfg: dict, explode: float, out_path: Path) -> Path:
    view = cfg["view"]
    scene = bpy.context.scene
    apply_explode(objects, explode)

    # Rotación del modelo y órbita de cámara en la explosión (iguales que en la web)
    pivot = bpy.data.objects.new("insole_pivot", None)
    scene.collection.objects.link(pivot)
    for obj in objects:
        obj.parent = pivot
    pivot.rotation_euler.z = math.radians(view["explode"]["model_rotation_deg"]) * explode

    target = gltf_to_blender(view["target"])
    cam_pos = gltf_to_blender(view["position"])
    orbit = math.radians(view["explode"]["camera_orbit_deg"]) * explode
    rel = cam_pos - target
    rel = Vector((rel.x * math.cos(orbit) - rel.y * math.sin(orbit), rel.x * math.sin(orbit) + rel.y * math.cos(orbit), rel.z))

    cam_data = bpy.data.cameras.new("poster_cam")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.angle_y = math.radians(view["fov"])
    cam = bpy.data.objects.new("poster_cam", cam_data)
    scene.collection.objects.link(cam)
    cam.location = target + rel
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    # Luces aproximadas a la escena web: hemisférica (mundo) + principal + contraluz cian
    if scene.world is None:
        scene.world = bpy.data.worlds.new("poster_world")
    bg = scene.world.node_tree.nodes.get("Background")
    if bg is not None:
        bg.inputs["Color"].default_value = hex_to_linear_rgba("#EAF5FA")
        bg.inputs["Strength"].default_value = 0.9
    lights = []
    for name, hex_color, energy, direction in (
        ("key", "#FFFFFF", 3.2, (-2.5, 4, 3)),
        ("rim", "#1EABE1", 2.5, (3, 1.5, -3.5)),
    ):
        light_data = bpy.data.lights.new(name, "SUN")
        light_data.energy = energy
        light_data.color = hex_to_linear_rgba(hex_color)[:3]
        light = bpy.data.objects.new(name, light_data)
        scene.collection.objects.link(light)
        d = gltf_to_blender(list(direction)).normalized()
        light.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
        lights.append(light)

    engines = {item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX" if "AgX" in [
        i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items
    ] else "Standard"
    aspect = view["aspect"]
    width = int(cfg["render"]["poster_width"])
    scene.render.resolution_x = width
    scene.render.resolution_y = round(width * aspect[1] / aspect[0])
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(out_path)
    bpy.ops.render.render(write_still=True)

    # Limpieza: la escena vuelve a su estado (sin pivote, cámara ni luces; capas en reposo)
    for obj in objects:
        obj.parent = None
    bpy.data.objects.remove(pivot, do_unlink=True)
    bpy.data.objects.remove(cam, do_unlink=True)
    bpy.data.cameras.remove(cam_data)
    for light in lights:
        data = light.data
        bpy.data.objects.remove(light, do_unlink=True)
        bpy.data.lights.remove(data)
    apply_explode(objects, 0)
    return out_path


def main() -> None:
    parser = base_parser(__doc__ or "")
    parser.add_argument("--posters", action="store_true", help="Renderizar los pósters de fallback (Eevee)")
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)

    reset_scene()
    objects = build_insole(cfg)
    glb = export_glb(objects, args.out)
    print(f"[insole] GLB: {glb} ({glb.stat().st_size} bytes)")

    outputs: list[Path] = [glb]
    if not args.no_render:
        for explode in (0, 1):
            apply_explode(objects, explode)
            for view in cfg["render"]["validation"]:
                suffix = "exploded" if explode else "complete"
                out = Path("tools/out/validation") / f"insole-{suffix}-{view['name']}.png"
                outputs.append(render_view(objects, out, azimuth_deg=view["azimuth"], elevation_deg=view["elevation"]))
        apply_explode(objects, 0)

    if args.posters:
        for poster in cfg["render"]["posters"]:
            out = Path("tools/out/posters/insole") / f"{poster['name']}.png"
            outputs.append(render_poster(objects, cfg, float(poster["explode"]), out))

    write_report(
        Path("tools/out/reports/insole.json"),
        name="insole",
        config_path=args.config,
        objects=objects,
        outputs=outputs,
        extra={"configVersion": cfg["version"]},
    )


if __name__ == "__main__":
    main()
