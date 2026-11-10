"""Operaciones sobre mallas anatómicas de la fuente: importar, limpiar, recortar y medir.

Ninguna función crea anatomía: solo importa geometría existente, une vértices duplicados y recorta
por la región del pie (cerrando el corte con una tapa plana).
"""

from __future__ import annotations

import re
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

MM = 0.001


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def import_obj(path: Path) -> bpy.types.Object:
    """Importa un OBJ de BodyParts3D (mm, Z arriba) y lo deja en metros con los ejes originales."""
    before = set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=str(path.resolve()), forward_axis="Y", up_axis="Z")
    new = [o for o in bpy.data.objects if o not in before]
    bpy.ops.object.select_all(action="DESELECT")
    for o in new:
        o.select_set(True)
    bpy.context.view_layer.objects.active = new[0]
    if len(new) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.scale = (MM, MM, MM)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def weld(obj: bpy.types.Object, distance_m: float = 1e-5) -> int:
    """Une vértices duplicados (limpieza; no altera la forma). Devuelve cuántos se han unido."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    before = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=distance_m)
    removed = before - len(bm.verts)
    bm.to_mesh(obj.data)
    bm.free()
    return removed


def crop_to_box(obj: bpy.types.Object, lo: Vector, hi: Vector) -> None:
    """Corta la malla con los planos de la caja (excepto el suelo) y cierra los huecos del corte."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    planes = [
        (Vector((0, 0, hi.z)), Vector((0, 0, 1))),
        (Vector((lo.x, 0, 0)), Vector((-1, 0, 0))),
        (Vector((hi.x, 0, 0)), Vector((1, 0, 0))),
        (Vector((0, lo.y, 0)), Vector((0, -1, 0))),
        (Vector((0, hi.y, 0)), Vector((0, 1, 0))),
    ]
    for co, no in planes:
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no, clear_outer=True)
        cut_edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
        if cut_edges:
            bmesh.ops.holes_fill(bm, edges=cut_edges, sides=0)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(obj.data)
    bm.free()


def mesh_quality(obj: bpy.types.Object) -> dict:
    """Triángulos, aristas no-manifold y piezas sueltas."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    non_manifold = sum(1 for e in bm.edges if not e.is_manifold)
    seen: set[int] = set()
    islands = 0
    for v in bm.verts:
        if v.index in seen:
            continue
        islands += 1
        stack = [v]
        while stack:
            cur = stack.pop()
            if cur.index in seen:
                continue
            seen.add(cur.index)
            stack.extend(e.other_vert(cur) for e in cur.link_edges if e.other_vert(cur).index not in seen)
    tris = sum(max(len(f.verts) - 2, 0) for f in bm.faces)
    bm.free()
    return {"triangles": tris, "nonManifoldEdges": non_manifold, "islands": islands}


def load_region(inventory: dict) -> tuple[Vector, Vector]:
    return Vector(inventory["regionMm"]["min"]) * MM, Vector(inventory["regionMm"]["max"]) * MM
