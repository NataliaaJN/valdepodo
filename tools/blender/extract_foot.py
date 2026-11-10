"""
Extracción del pie anatómico a GLB (Fase 2 · prototipo) — docs/3d-pipeline.md §6.1, spec 08 §2.1.

Toma SOLO las mallas del inventario (inspect_source.py) de las capas indicadas, las limpia (une vértices),
las recorta por la región del pie y las exporta a GLB con un nodo por estructura:

  Foot
  ├─ skin            · exterior
  ├─ bones           · <slug> por hueso
  ├─ muscles         · <slug> por músculo (incluye sus tendones distales: así vienen en la fuente)
  ├─ tendons         · tendón calcáneo
  └─ ligaments       · ligamento plantar largo

Cada malla lleva custom properties: layer, sourceId (elemento BodyParts3D), name (nombre FMA).
Ejes: se rota para que el GLB sea Y-arriba con los dedos hacia -Z (convención three.js), y se centra en el origen.

Uso:
  node tools/blender/run-blender.mjs tools/blender/extract_foot.py -- --config tools/blender/config/foot.json --out tools/out/foot-proto.raw.glb
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.anatomy import crop_to_box, import_obj, load_region, slug, weld  # noqa: E402
from lib.cli import load_config, script_argv  # noqa: E402
from lib.export import export_glb  # noqa: E402
from lib.report import write_report  # noqa: E402
from lib.scene import principled_material, reset_scene  # noqa: E402

INVENTORY = Path("tools/out/inventory/bodyparts3d-foot.json")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--layers", nargs="*", default=None)
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    layers = args.layers or cfg["layersForWeb"]

    reset_scene()
    lo, hi = load_region(inventory)
    root = bpy.data.objects.new("Foot", None)
    bpy.context.scene.collection.objects.link(root)
    groups = {}
    for layer in layers:
        empty = bpy.data.objects.new(layer, None)
        bpy.context.scene.collection.objects.link(empty)
        empty.parent = root
        groups[layer] = empty

    meshes: list[bpy.types.Object] = []
    for entry in inventory["entries"]:
        if entry["layer"] not in layers:
            continue
        obj = import_obj(Path(entry["file"]))
        weld(obj)
        crop_to_box(obj, lo, hi)
        if not obj.data.polygons:
            bpy.data.objects.remove(obj, do_unlink=True)
            continue
        base = slug(entry["name"].replace("right ", "").replace("of right foot", "").replace(" of foot", ""))
        name = base if base not in {m.name for m in meshes} else f"{base}_{entry['element'].lower()}"
        obj.name = name
        obj.data.name = name
        obj["layer"] = entry["layer"]
        obj["sourceId"] = entry["element"]
        obj["fmaName"] = entry["name"]
        obj.data.materials.clear()
        obj.data.materials.append(
            bpy.data.materials.get(f"mat_{entry['layer']}")
            or principled_material(f"mat_{entry['layer']}", cfg["colors"][entry["layer"]], roughness=0.5)
        )
        obj.parent = groups[entry["layer"]]
        for poly in obj.data.polygons:
            poly.use_smooth = True
        meshes.append(obj)

    # Centrar en el origen (pie apoyado en Y=0 tras la rotación) y pasar de Z-arriba a Y-arriba vía exportador.
    pts = [m.matrix_world @ Vector(c) for m in meshes for c in m.bound_box]
    center = sum(pts, Vector()) / len(pts)
    floor = min(p.z for p in pts)
    offset = Matrix.Translation(Vector((-center.x, -center.y, -floor)))
    for m in meshes:
        m.data.transform(offset)
    # Orientación horizontal: alinear talón→dedos con -Y de Blender (→ -Z en glTF tras export_yup).
    heel = next(m for m in meshes if m["fmaName"] == "right calcaneus")
    toe = next(m for m in meshes if m["fmaName"] == "distal phalanx of right big toe")
    hc = sum((Vector(c) for c in heel.bound_box), Vector()) / 8
    tc = sum((Vector(c) for c in toe.bound_box), Vector()) / 8
    forward = Vector((tc.x - hc.x, tc.y - hc.y, 0)).normalized()
    angle = math.atan2(forward.x, -forward.y)
    rot = Matrix.Rotation(angle, 4, "Z")
    for m in meshes:
        m.data.transform(rot)

    selection = [root, *groups.values(), *meshes]
    glb = export_glb(selection, args.out)
    tri_by_layer = {
        layer: sum(len(m.data.polygons) for m in meshes if m["layer"] == layer) for layer in layers
    }
    print(f"[extract] {len(meshes)} mallas · {tri_by_layer} → {glb} ({glb.stat().st_size / 1024:.0f} KB)")
    write_report(
        Path("tools/out/reports/foot-proto.json"),
        name="foot-proto",
        config_path=args.config,
        objects=meshes,
        outputs=[glb],
        extra={
            "source": inventory["source"],
            "license": inventory["license"],
            "attribution": inventory["attribution"],
            "trianglesByLayer": tri_by_layer,
            "structures": [{"name": m.name, "layer": m["layer"], "sourceId": m["sourceId"], "fmaName": m["fmaName"]} for m in meshes],
        },
    )


if __name__ == "__main__":
    main()
