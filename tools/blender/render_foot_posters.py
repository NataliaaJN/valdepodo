"""
Pósters de fallback del pie anatómico, uno por capa (Fase 5, spec 08 §5, docs/3d-pipeline.md §8).

Carga el GLB sin comprimir del prototipo (`model` en config/foot-view.json) y reproduce la escena web
(FootAnatomy.client.vue + FootAnatomyModel.vue): mismo centrado y escala (`fit`), misma rotación inicial,
cámara, luces aproximadas y el mismo papel de cada capa (activa, contexto atenuado o contorno fresnel).
Fondo transparente, Eevee + AgX.

Uso:
  node tools/blender/run-blender.mjs tools/blender/render_foot_posters.py -- \
      --config tools/blender/config/foot-view.json [--only skin]
Salida: tools/out/posters/foot/<capa>.png → `npm run 3d:posters -- foot`.
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

from lib.cli import load_config, script_argv  # noqa: E402
from lib.scene import hex_to_linear_rgba, reset_scene  # noqa: E402

LAYERS = ("skin", "bones", "muscles", "tendons", "ligaments")

# Materiales de la web (FootAnatomyModel.vue → activeMaterials)
ACTIVE = {
    "skin": {"color": "#CFEAF5", "roughness": 0.55, "coat": 0.35},
    "bones": {"color": "#F2F6FB", "roughness": 0.62},
    "muscles": {"color": "#1270B6", "roughness": 0.38, "coat": 0.5},
    "tendons": {"color": "#1EABE1", "roughness": 0.3, "emission": 0.25},
    "ligaments": {"color": "#B9E5F3", "roughness": 0.35, "emission": 0.15},
}
SHELL_COLOR = "#1EABE1"


def layer_roles(active: str) -> dict[str, str]:
    """Misma lógica que app/utils/foot-layers.ts → layerRoles()."""
    if active == "skin":
        return {layer: ("active" if layer == "skin" else "hidden") for layer in LAYERS}
    roles = {"skin": "shell", "bones": "context", "muscles": "hidden", "tendons": "hidden", "ligaments": "hidden"}
    roles[active] = "active"
    if active == "muscles":
        roles["tendons"] = "active"
    if active == "tendons":
        roles["muscles"] = "context"
    return roles


# --------------------------------------------------------------------------------------------------
# Materiales
# --------------------------------------------------------------------------------------------------


def surface_material(name: str, spec: dict, alpha: float = 1.0) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = hex_to_linear_rgba(spec["color"])
    bsdf.inputs["Roughness"].default_value = spec["roughness"]
    if "coat" in spec:
        bsdf.inputs["Coat Weight"].default_value = spec["coat"]
        bsdf.inputs["Coat Roughness"].default_value = 0.35
    if "emission" in spec:
        bsdf.inputs["Emission Color"].default_value = hex_to_linear_rgba("#1EABE1")
        bsdf.inputs["Emission Strength"].default_value = spec["emission"]
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.surface_render_method = "BLENDED"
        mat.use_transparency_overlap = False
    return mat


def shell_material() -> bpy.types.Material:
    """Contorno fresnel aditivo: emisión cian ∝ (1 - |N·V|)^2.6, sobre transparente (como el shader web)."""
    mat = bpy.data.materials.new("shell")
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    weight = nodes.new("ShaderNodeLayerWeight")
    weight.inputs["Blend"].default_value = 0.5
    power = nodes.new("ShaderNodeMath")
    power.operation = "POWER"
    power.inputs[1].default_value = 2.6
    scale = nodes.new("ShaderNodeMath")
    scale.operation = "MULTIPLY"
    scale.inputs[1].default_value = 0.85 * 2.2  # intensidad aproximada al blending aditivo de la web
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = hex_to_linear_rgba(SHELL_COLOR)
    transparent = nodes.new("ShaderNodeBsdfTransparent")
    add = nodes.new("ShaderNodeAddShader")
    links.new(weight.outputs["Facing"], power.inputs[0])
    links.new(power.outputs[0], scale.inputs[0])
    links.new(scale.outputs[0], emission.inputs["Strength"])
    links.new(transparent.outputs[0], add.inputs[0])
    links.new(emission.outputs[0], add.inputs[1])
    links.new(add.outputs[0], out.inputs["Surface"])
    mat.surface_render_method = "BLENDED"
    mat.use_backface_culling = True
    return mat


# --------------------------------------------------------------------------------------------------
# Escena
# --------------------------------------------------------------------------------------------------


def gltf_to_blender(p: list[float]) -> Vector:
    """(x, y, z) glTF Y-up → (x, -z, y) Blender Z-up."""
    return Vector((p[0], -p[2], p[1]))


def object_layer(obj: bpy.types.Object) -> str | None:
    for holder in (obj, obj.data):
        if holder is not None and "layer" in holder.keys():
            return str(holder["layer"])
    return None


def load_model(cfg: dict) -> dict[str, list[bpy.types.Object]]:
    bpy.ops.import_scene.gltf(filepath=str(Path(cfg["model"]).resolve()))
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    by_layer: dict[str, list[bpy.types.Object]] = {layer: [] for layer in LAYERS}
    for obj in meshes:
        layer = object_layer(obj)
        if layer in by_layer:
            by_layer[layer].append(obj)
        else:
            obj.hide_render = True

    # Centrado en la caja y escala a `fit`, como FootAnatomyModel.vue; rotación inicial en Y (glTF) = Z (Blender)
    bpy.context.view_layer.update()
    points = [o.matrix_world @ Vector(c) for objs in by_layer.values() for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    center, size = (lo + hi) / 2, hi - lo

    root = bpy.data.objects.new("foot_root", None)
    offset = bpy.data.objects.new("foot_offset", None)
    bpy.context.scene.collection.objects.link(root)
    bpy.context.scene.collection.objects.link(offset)
    offset.parent = root
    offset.location = -center
    root.scale = (cfg["fit"] / max(size),) * 3
    root.rotation_euler.z = cfg["rotationY"]
    for obj in bpy.context.scene.objects:
        if obj.parent is None and obj not in (root, offset) and obj.type in {"MESH", "EMPTY"}:
            world = obj.matrix_world.copy()
            obj.parent = offset
            obj.matrix_world = offset.matrix_world @ world  # mantiene la pose importada bajo el desplazamiento
    bpy.context.view_layer.update()
    return by_layer


def setup_camera_and_lights(cfg: dict) -> None:
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("poster_cam")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.angle_y = math.radians(cfg["fov"])
    cam = bpy.data.objects.new("poster_cam", cam_data)
    scene.collection.objects.link(cam)
    cam.location = gltf_to_blender(cfg["position"])
    target = gltf_to_blender(cfg["target"])
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    lights = cfg["lights"]
    if scene.world is None:
        scene.world = bpy.data.worlds.new("poster_world")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    hemi = lights["hemisphere"]
    bg.inputs["Color"].default_value = hex_to_linear_rgba(hemi["sky"])
    bg.inputs["Strength"].default_value = hemi["intensity"]
    for name in ("key", "rim"):
        spec = lights[name]
        data = bpy.data.lights.new(name, "SUN")
        data.energy = spec["intensity"] * 1.6
        data.color = hex_to_linear_rgba(spec["color"])[:3]
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        direction = gltf_to_blender(spec["position"]).normalized()
        light.rotation_euler = (-direction).to_track_quat("-Z", "Y").to_euler()

    engines = {item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    width = int(cfg["poster_width"])
    aspect = cfg["aspect"]
    scene.render.resolution_x = width
    scene.render.resolution_y = round(width * aspect[1] / aspect[0])
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"


def apply_roles(by_layer: dict[str, list[bpy.types.Object]], active: str, materials: dict) -> None:
    for layer, role in layer_roles(active).items():
        for obj in by_layer.get(layer, []):
            obj.hide_render = role == "hidden"
            if role == "hidden":
                continue
            mat = materials["shell"] if role == "shell" else materials[(role, layer)]
            obj.data.materials.clear()
            obj.data.materials.append(mat)
            for poly in obj.data.polygons:
                poly.material_index = 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--only", nargs="*", default=None, help="Solo estos pósters (por nombre)")
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)

    reset_scene()
    by_layer = load_model(cfg)
    setup_camera_and_lights(cfg)
    print("[foot-posters] capas:", {k: len(v) for k, v in by_layer.items()})

    materials: dict = {"shell": shell_material()}
    for layer, spec in ACTIVE.items():
        materials[("active", layer)] = surface_material(f"{layer}_active", spec)
        materials[("context", layer)] = surface_material(f"{layer}_context", spec, 0.55 if layer == "bones" else 0.18)

    out_dir = Path("tools/out/posters/foot").resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    for poster in cfg["posters"]:
        if args.only and poster["name"] not in args.only:
            continue
        apply_roles(by_layer, poster["layer"], materials)
        path = out_dir / f"{poster['name']}.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        print(f"[foot-posters] {path}")


if __name__ == "__main__":
    main()
