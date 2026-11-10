"""
Inventario de Z-Anatomy para el pie (Fase 2). Abre el .blend de Z-Anatomy SIN ejecutar sus scripts
(run-blender.mjs pasa --disable-autoexec) y lista los objetos cuyo nombre corresponde a estructuras del pie
y tobillo, con su colección, nº de triángulos y lado.

No modifica ni exporta nada. Salida: tools/out/inventory/zanatomy-foot.{json,md}
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.cli import load_config, script_argv  # noqa: E402

OUT_DIR = Path("tools/out/inventory")
FOOT_TERMS = re.compile(
    r"calcane|talus|talar|navicular|cuboid|cuneiform|metatars|phalan|hallu|digiti minimi.*ped|pedis|"
    r"plantar|tibialis|fibular|peroneus|peroneal|lumbrical|interosse.*ped|quadratus plantae|"
    r"achilles|tendo calcaneus|calcaneal|tarsal|tarsi|sesamoid|ankle|talocrural|deltoid lig|"
    r"retinacul|aponeurosis plantaris|plantar aponeurosis|sole|foot|toe|malleol",
    re.IGNORECASE,
)


def collection_path(obj: bpy.types.Object) -> str:
    paths = []
    for coll in obj.users_collection:
        chain = [coll.name]
        parent = next((c for c in bpy.data.collections if coll.name in c.children), None)
        while parent:
            chain.insert(0, parent.name)
            parent = next((c for c in bpy.data.collections if parent.name in c.children), None)
        paths.append(" / ".join(chain))
    return " | ".join(paths)


def triangles(obj: bpy.types.Object) -> int:
    if obj.type != "MESH":
        return 0
    return sum(max(len(p.vertices) - 2, 0) for p in obj.data.polygons)


def evaluated_triangles(obj: bpy.types.Object, depsgraph) -> int:
    """Triángulos tras aplicar modificadores (curvas con grosor, solidify, subdivisión…)."""
    try:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
    except RuntimeError:
        return 0
    try:
        if mesh is None:
            return 0
        mesh.calc_loop_triangles()
        return len(mesh.loop_triangles)
    finally:
        evaluated.to_mesh_clear()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)
    root = Path(cfg["sources"]["zanatomy"]["dir"])
    blends = sorted(root.rglob("*.blend"), key=lambda p: p.stat().st_size, reverse=True)
    if not blends:
        raise SystemExit(f"[za] No hay .blend en {root}")
    blend = blends[0]
    print(f"[za] Abriendo {blend} ({blend.stat().st_size / 1e6:.1f} MB) sin autoejecución de scripts")
    bpy.ops.wm.open_mainfile(filepath=str(blend.resolve()), load_ui=False)

    total = len(bpy.data.objects)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    skin_like = [
        {"name": o.name, "type": o.type, "collection": collection_path(o), "evaluatedTriangles": evaluated_triangles(o, depsgraph)}
        for o in bpy.data.objects
        if re.search(r"skin|integument|cutis|body surface|surface of body", o.name, re.IGNORECASE)
    ]
    rows = []
    for obj in bpy.data.objects:
        if obj.type not in {"MESH", "CURVE"} or not FOOT_TERMS.search(obj.name):
            continue
        side = "right" if re.search(r"(\.r$|right|\bR\b|_r$|\.r\.)", obj.name) else (
            "left" if re.search(r"(\.l$|left|\bL\b|_l$|\.l\.)", obj.name) else "?"
        )
        rows.append(
            {
                "name": obj.name,
                "collection": collection_path(obj),
                "side": side,
                "type": obj.type,
                "triangles": triangles(obj),
                "evaluatedTriangles": evaluated_triangles(obj, depsgraph),
                "modifiers": [m.type for m in obj.modifiers],
            }
        )
    rows.sort(key=lambda r: (r["collection"], r["name"]))

    by_coll: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_coll[r["collection"].split(" | ")[0]].append(r)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "zanatomy-foot.json").write_text(
        json.dumps(
            {"blend": blend.as_posix(), "objectsTotal": total, "skinLike": skin_like, "matches": rows},
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    lines = [f"# Inventario Z-Anatomy — estructuras de pie/tobillo", "", f"Archivo: `{blend.as_posix()}` · objetos totales: {total} · coincidencias: {len(rows)}", ""]
    for coll, items in sorted(by_coll.items()):
        lines += [
            f"## {coll} ({len(items)})",
            "",
            "| Objeto | Tipo | Lado | Triángulos base | Triángulos evaluados | Modificadores |",
            "|---|---|---|---|---|---|",
        ]
        lines += [
            f"| {r['name']} | {r['type']} | {r['side']} | {r['triangles']:,} | {r['evaluatedTriangles']:,} | {', '.join(r['modifiers'])} |"
            for r in items
        ]
        lines.append("")
    (OUT_DIR / "zanatomy-foot.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"[za] {len(rows)} coincidencias de {total} objetos → {OUT_DIR / 'zanatomy-foot.md'}")
    for coll, items in sorted(by_coll.items()):
        print(f"  {coll[:60]:60} {len(items):4}")


if __name__ == "__main__":
    main()
