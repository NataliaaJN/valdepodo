"""
Inventario de la fuente anatómica para el pie derecho (Fase 2, Gate 2) — docs/3d-pipeline.md §6.1.

BodyParts3D: selecciona las mallas por POSICIÓN (no solo por nombre). Calcula la región del pie a partir de
huesos ancla y recorre todas las mallas OBJ de la fuente quedándose con las que tienen vértices dentro de esa
región. Cada malla se nombra con su concepto FMA más específico y se clasifica en una capa.

No crea ni modifica geometría. Salida:
  tools/out/inventory/bodyparts3d-foot.json   (datos completos)
  tools/out/inventory/bodyparts3d-foot.md     (resumen legible)

Uso:
  node tools/blender/run-blender.mjs tools/blender/inspect_source.py -- --config tools/blender/config/foot.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.cli import load_config, script_argv  # noqa: E402

OUT_DIR = Path("tools/out/inventory")


# ---------------------------------------------------------------------------------------------- datos
def read_tsv(path: Path) -> list[list[str]]:
    rows = path.read_text(encoding="utf-8", errors="replace").splitlines()[1:]
    return [r.split("\t") for r in rows if r.strip()]


def element_names(src: Path, cfg: dict) -> tuple[dict[str, str], dict[str, list[str]], dict[str, list[str]]]:
    """Devuelve: nombre más específico por elemento, conceptos por elemento y elementos por nombre de concepto."""
    concept_elements: dict[tuple[str, str], list[str]] = defaultdict(list)
    for concept, name, element in read_tsv(src / cfg["elementParts"]):
        concept_elements[(concept, name)].append(element)

    per_element: dict[str, list[tuple[int, str]]] = defaultdict(list)
    by_name: dict[str, list[str]] = {}
    for (concept, name), elements in concept_elements.items():
        by_name[name] = elements
        for el in elements:
            per_element[el].append((len(elements), name))

    best = {el: sorted(options)[0][1] for el, options in per_element.items()}
    concepts = {el: [n for _, n in sorted(options)][:4] for el, options in per_element.items()}
    return best, concepts, by_name


def load_obj(path: Path) -> tuple[np.ndarray, int]:
    """Vértices (N×3, mm) y número de caras de un OBJ."""
    vertices: list[str] = []
    faces = 0
    with path.open(encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if line.startswith("v "):
                vertices.append(line[2:])
            elif line.startswith("f "):
                n = len(line.split()) - 1
                faces += max(n - 2, 0)  # triángulos equivalentes
    if not vertices:
        return np.zeros((0, 3)), faces
    arr = np.array(" ".join(vertices).split(), dtype=np.float64).reshape(-1, 3)
    return arr, faces


# ---------------------------------------------------------------------------------------------- lógica
def classify(name: str, rules: list[dict]) -> str:
    for rule in rules:
        if re.search(rule["pattern"], name, flags=re.IGNORECASE):
            return rule["layer"]
    return "other"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    args = parser.parse_args(script_argv())
    cfg = load_config(args.config)
    bp = cfg["sources"]["bodyparts3d"]
    src = Path(bp["dir"])
    obj_dir = Path(bp["objDir"])
    region_cfg = cfg["region"]

    obj_files = {p.stem: p for p in obj_dir.rglob("*.obj")}
    print(f"[inspect] {len(obj_files)} mallas OBJ en {obj_dir}")
    best_name, concepts, by_name = element_names(src, bp)

    # 1) Región a partir de los huesos ancla
    anchor_points = []
    for anchor in region_cfg["anchors"]:
        elements = by_name.get(anchor)
        if not elements:
            raise SystemExit(f"[inspect] Ancla no encontrada en la fuente: {anchor!r}")
        for el in elements:
            verts, _ = load_obj(obj_files[el])
            anchor_points.append(verts)
    pts = np.vstack(anchor_points)
    lo, hi = pts.min(axis=0), pts.max(axis=0)
    margin = float(region_cfg["marginMm"])
    region_lo = lo - margin
    region_hi = hi + margin
    # Eje vertical: el de mayor extensión en el cuerpo completo es Z en BodyParts3D; se verifica abajo.
    region_hi[2] = hi[2] + float(region_cfg["ankleHeightMm"])
    print(f"[inspect] Región pie derecho (mm): min={region_lo.round(1).tolist()} max={region_hi.round(1).tolist()}")

    # 2) Barrido espacial de todas las mallas
    entries = []
    for i, (element, path) in enumerate(sorted(obj_files.items())):
        verts, tris = load_obj(path)
        if len(verts) == 0:
            continue
        vmin, vmax = verts.min(axis=0), verts.max(axis=0)
        if np.any(vmax < region_lo) or np.any(vmin > region_hi):
            continue
        inside = np.all((verts >= region_lo) & (verts <= region_hi), axis=1)
        n_inside = int(inside.sum())
        fraction = n_inside / len(verts)
        if n_inside < region_cfg["minVerticesInside"] or fraction < region_cfg["minFractionInside"]:
            continue
        name = best_name.get(element, "(sin nombre)")
        entries.append(
            {
                "element": element,
                "name": name,
                "concepts": concepts.get(element, []),
                "layer": classify(name, cfg["classification"]),
                "vertices": int(len(verts)),
                "triangles": int(tris),
                "verticesInside": n_inside,
                "fractionInside": round(fraction, 3),
                "bboxMm": [vmin.round(1).tolist(), vmax.round(1).tolist()],
                "file": path.as_posix(),
            }
        )
        if (i + 1) % 500 == 0:
            print(f"[inspect] {i + 1}/{len(obj_files)} mallas revisadas…")

    entries.sort(key=lambda e: (e["layer"], e["name"]))
    by_layer: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        by_layer[e["layer"]].append(e)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    result = {
        "source": "BodyParts3D 4.0 (isa_BP3D_4.0_obj_99)",
        "license": bp["license"],
        "attribution": bp["attribution"],
        "config": args.config.as_posix(),
        "regionMm": {"min": region_lo.round(1).tolist(), "max": region_hi.round(1).tolist()},
        "summary": {
            layer: {
                "meshes": len(items),
                "triangles": sum(x["triangles"] for x in items),
                "trianglesInsideApprox": int(sum(x["triangles"] * x["fractionInside"] for x in items)),
            }
            for layer, items in sorted(by_layer.items())
        },
        "entries": entries,
    }
    (OUT_DIR / "bodyparts3d-foot.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Inventario BodyParts3D 4.0 — pie derecho",
        "",
        f"Región (mm): min {result['regionMm']['min']} · max {result['regionMm']['max']}",
        "",
        "| Capa | Mallas | Triángulos (malla completa) | Triángulos dentro de la región (aprox.) |",
        "|---|---|---|---|",
    ]
    for layer, s in result["summary"].items():
        lines.append(f"| {layer} | {s['meshes']} | {s['triangles']:,} | {s['trianglesInsideApprox']:,} |")
    for layer, items in sorted(by_layer.items()):
        lines += ["", f"## {layer} ({len(items)})", "", "| Elemento | Nombre | Triángulos | % dentro |", "|---|---|---|---|"]
        for e in items:
            lines.append(f"| {e['element']} | {e['name']} | {e['triangles']:,} | {round(e['fractionInside'] * 100)} % |")
    (OUT_DIR / "bodyparts3d-foot.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("[inspect] Resumen por capa:")
    for layer, s in result["summary"].items():
        print(f"  {layer:10} {s['meshes']:4} mallas · {s['trianglesInsideApprox']:>9,} triángulos en la región")
    print(f"[inspect] → {OUT_DIR / 'bodyparts3d-foot.md'}")


if __name__ == "__main__":
    main()
