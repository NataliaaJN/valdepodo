"""Exportación GLB con parámetros fijados y filtrados contra la API real del exportador de Blender."""

from __future__ import annotations

from pathlib import Path

import bpy

# Parámetros deseados. Se filtran contra las propiedades que expone esta versión de Blender,
# para que un renombrado en el exportador no rompa el pipeline en silencio (se avisa).
DESIRED_GLTF_OPTIONS: dict[str, object] = {
    "export_format": "GLB",
    "use_selection": True,
    "export_apply": True,
    "export_yup": True,
    "export_normals": True,
    "export_texcoords": True,
    "export_materials": "EXPORT",
    "export_cameras": False,
    "export_lights": False,
    "export_extras": True,
    "export_animations": False,
    # La compresión (meshopt) se aplica después con gltf-transform: aquí nunca Draco.
    "export_draco_mesh_compression_enable": False,
}


def export_glb(objects: list[bpy.types.Object], out_path: Path) -> Path:
    available = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    options = {k: v for k, v in DESIRED_GLTF_OPTIONS.items() if k in available}
    missing = sorted(set(DESIRED_GLTF_OPTIONS) - available)
    if missing:
        print(f"[export] Aviso: el exportador de esta versión no tiene: {', '.join(missing)}")

    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active = objects[0]

    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    result = bpy.ops.export_scene.gltf(filepath=str(out_path), **options)
    if "FINISHED" not in result:
        raise RuntimeError(f"La exportación glTF falló: {result}")
    return out_path
