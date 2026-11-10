"""Informe JSON por ejecución: objetos, triángulos, versión de Blender y configuración usada."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
from pathlib import Path
from typing import Any

import bpy


def triangle_count(obj: bpy.types.Object) -> int:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        return len(mesh.loop_triangles)
    finally:
        evaluated.to_mesh_clear()


def _relative(path: Path) -> str:
    """Ruta relativa al directorio de trabajo (raíz del proyecto), en formato POSIX."""
    resolved = path.resolve()
    try:
        return resolved.relative_to(Path.cwd().resolve()).as_posix()
    except ValueError:
        return resolved.as_posix()


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_report(
    out_path: Path,
    *,
    name: str,
    config_path: Path,
    objects: list[bpy.types.Object],
    outputs: list[Path],
    extra: dict[str, Any] | None = None,
) -> Path:
    report = {
        "name": name,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "blenderVersion": bpy.app.version_string,
        "config": {"path": config_path.as_posix(), "sha256": file_sha256(config_path)},
        "objects": [
            {"name": o.name, "type": o.type, "triangles": triangle_count(o) if o.type == "MESH" else 0}
            for o in objects
        ],
        "triangles": sum(triangle_count(o) for o in objects if o.type == "MESH"),
        "outputs": [{"file": _relative(p), "bytes": p.stat().st_size} for p in outputs if p.exists()],
        **(extra or {}),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[report] {out_path}")
    return out_path
