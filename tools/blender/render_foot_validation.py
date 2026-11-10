"""
Renders de validación del pie (Fase 2, Gate 2) a partir del inventario de inspect_source.py.

- Importa SOLO las mallas del inventario de las capas pedidas (sin crear geometría nueva).
- Recorta cada malla con la caja de la región del pie (para quitar pierna, otro pie, resto del cuerpo).
- Mide la calidad de cada malla recortada (triángulos, aristas no-manifold, piezas sueltas).
- Renderiza cada capa y la combinación de capas en vistas lateral, medial, plantar, dorsal y 3/4.

Salida: tools/out/validation/foot/*.png y tools/out/inventory/bodyparts3d-foot-quality.json

Uso:
  node tools/blender/run-blender.mjs tools/blender/render_foot_validation.py -- --config tools/blender/config/foot.json
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.cli import load_config, script_argv  # noqa: E402
from lib.anatomy import MM, crop_to_box, import_obj, mesh_quality, weld  # noqa: E402
from lib.scene import hex_to_linear_rgba, reset_scene  # noqa: E402

INVENTORY = Path("tools/out/inventory/bodyparts3d-foot.json")
OUT_DIR = Path("tools/out/validation/foot").resolve()


def material(name: str, hex_color: str) -> bpy.types.Material:
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color = hex_to_linear_rgba(hex_color)
    return mat


def setup_render(scene: bpy.types.Scene) -> None:
    scene.render.engine = "BLENDER_WORKBENCH"
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "MATERIAL"
    shading.show_cavity = True
    shading.cavity_type = "BOTH"
    shading.show_object_outline = False
    shading.show_specular_highlight = True
    # El render final de Workbench usa el color del "world" como fondo.
    world = scene.world or bpy.data.worlds.new("validation_world")
    scene.world = world
    world.color = hex_to_linear_rgba("#F5F8FC")[:3]
    shading.background_type = "WORLD"
    scene.view_settings.view_transform = "Standard"  # colores de marca sin el lavado de AgX
    scene.render.resolution_x, scene.render.resolution_y = 1400, 1000
    # JPEG ligero: los renders se comparten con la clínica para la validación anatómica.
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 88
    scene.render.film_transparent = False


def place_camera(scene, center: Vector, direction: Vector, distance: float, up: Vector) -> None:
    """Cámara mirando al centro desde `direction`, con `up` como parte superior de la imagen."""
    from mathutils import Matrix

    cam = scene.camera
    cam.location = center + direction.normalized() * distance
    forward = (center - cam.location).normalized()
    right = forward.cross(up).normalized()
    cam_up = right.cross(forward).normalized()
    rot = Matrix((right, cam_up, -forward)).transposed()
    cam.rotation_euler = rot.to_euler()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--layers", nargs="*", default=None)
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    layers = args.layers or cfg["layersForWeb"]

    scene = reset_scene()
    setup_render(scene)
    lo = Vector(inventory["regionMm"]["min"]) * MM
    hi = Vector(inventory["regionMm"]["max"]) * MM

    objects_by_layer: dict[str, list[bpy.types.Object]] = {layer: [] for layer in layers}
    quality = []
    for entry in inventory["entries"]:
        if entry["layer"] not in layers:
            continue
        obj = import_obj(Path(entry["file"]))
        obj.name = f"{entry['layer']}__{entry['element']}"
        raw = mesh_quality(obj)
        welded = weld(obj)
        crop_to_box(obj, lo, hi)
        if len(obj.data.polygons) == 0:
            bpy.data.objects.remove(obj, do_unlink=True)
            continue
        obj.data.materials.clear()
        obj.data.materials.append(material(f"mat_{entry['layer']}", cfg["colors"][entry["layer"]]))
        objects_by_layer[entry["layer"]].append(obj)
        quality.append(
            {
                "element": entry["element"],
                "name": entry["name"],
                "layer": entry["layer"],
                "raw": raw,
                "weldedVertices": welded,
                **mesh_quality(obj),
            }
        )
        print(f"[validation] {entry['layer']:9} {entry['name']} → {quality[-1]['triangles']} tri")

    (Path("tools/out/inventory") / "bodyparts3d-foot-quality.json").write_text(
        json.dumps(
            {
                "summary": {
                    layer: {
                        "meshes": sum(1 for q in quality if q["layer"] == layer),
                        "triangles": sum(q["triangles"] for q in quality if q["layer"] == layer),
                        "meshesWithNonManifold": sum(1 for q in quality if q["layer"] == layer and q["nonManifoldEdges"]),
                        "nonManifoldEdges": sum(q["nonManifoldEdges"] for q in quality if q["layer"] == layer),
                    }
                    for layer in layers
                },
                "meshes": quality,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # Ejes anatómicos del pie a partir de los huesos (talón → dedos, medial → lateral)
    def centroid(names: list[str]) -> Vector:
        objs = [o for o in objects_by_layer.get("bones", []) if any(n in o.name for n in names)]
        pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
        return sum(pts, Vector()) / len(pts) if pts else Vector()

    by_name = {e["element"]: e["name"] for e in inventory["entries"]}

    def elements(substr: str) -> list[str]:
        return [el for el, n in by_name.items() if substr in n]

    heel = centroid(elements("right calcaneus"))
    big_toe = centroid(elements("right big toe"))
    little_toe = centroid(elements("right little toe"))
    forward = Vector((big_toe.x + little_toe.x, big_toe.y + little_toe.y, 0)) / 2 - Vector((heel.x, heel.y, 0))
    lateral = Vector((little_toe.x - big_toe.x, little_toe.y - big_toe.y, 0))
    lateral = (lateral - lateral.project(forward)).normalized()
    forward.normalize()
    up = Vector((0, 0, 1))

    all_objs = [o for objs in objects_by_layer.values() for o in objs]
    pts = [o.matrix_world @ Vector(c) for o in all_objs for c in o.bound_box]
    center = sum(pts, Vector()) / len(pts)
    radius = max((p - center).length for p in pts)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 70
    scene.camera = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(scene.camera)
    distance = radius / math.tan(math.atan(18 / 70)) * 0.82

    views = {
        "3q": (lateral * 0.8 - forward * 0.35 + up * 0.55, up),
        "lateral": (lateral, up),
        "medial": (-lateral, up),
        "plantar": (-up, forward),
        "dorsal": (up, forward),
    }

    def render(tag: str, visible: list[bpy.types.Object], view: str) -> None:
        for o in all_objs:
            o.hide_render = o not in visible
        direction, view_up = views[view]
        place_camera(scene, center, direction, distance, view_up)
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        scene.render.filepath = str(OUT_DIR / f"{tag}-{view}.jpg")
        bpy.ops.render.render(write_still=True)

    for layer, objs in objects_by_layer.items():
        if objs:
            for view in ("3q", "medial", "plantar"):
                render(layer, objs, view)
    internal = [o for layer in ("bones", "muscles", "tendons", "ligaments") for o in objects_by_layer.get(layer, [])]
    for view in views:
        render("internal", internal, view)
    print(f"[validation] → {OUT_DIR}")


if __name__ == "__main__":
    main()
