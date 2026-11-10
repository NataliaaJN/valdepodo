"""Preparación de escena: reset, unidades, materiales básicos, cámara y render de validación."""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


def reset_scene() -> bpy.types.Scene:
    """Escena vacía en metros (los GLB se exportan en metros, Y-up)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    return scene


def hex_to_linear_rgba(hex_color: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    """Convierte '#RRGGBB' (sRGB) a RGBA lineal, que es lo que esperan los nodos de Blender."""
    value = hex_color.lstrip("#")
    srgb = [int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)]

    def to_linear(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (to_linear(c) for c in srgb)
    return (r, g, b, alpha)


def principled_material(name: str, hex_color: str, roughness: float = 0.5, metallic: float = 0.0) -> bpy.types.Material:
    """Material base (marcador). El aspecto final se define en la web con materiales de three.js."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        bsdf.inputs["Base Color"].default_value = hex_to_linear_rgba(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    mat.diffuse_color = hex_to_linear_rgba(hex_color)  # usado por Workbench
    return mat


def scene_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, float]:
    """Centro y radio aproximado del conjunto de objetos (en espacio mundo)."""
    points = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
    if not points:
        return Vector((0, 0, 0)), 1.0
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    center = (lo + hi) / 2
    radius = max((hi - lo).length / 2, 1e-4)
    return center, radius


def render_view(
    objects: list[bpy.types.Object],
    out_path: Path,
    *,
    azimuth_deg: float = 35.0,
    elevation_deg: float = 25.0,
    resolution: tuple[int, int] = (1200, 900),
    background: str = "#F5F8FC",
) -> Path:
    """Render Workbench de validación con una cámara orbitando el conjunto."""
    scene = bpy.context.scene
    center, radius = scene_bounds(objects)

    cam_data = bpy.data.cameras.new("validation_cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("validation_cam", cam_data)
    scene.collection.objects.link(cam)

    az, el = math.radians(azimuth_deg), math.radians(elevation_deg)
    distance = radius / math.tan(math.radians(18)) * 1.15
    cam.location = center + Vector(
        (distance * math.cos(el) * math.sin(az), -distance * math.cos(el) * math.cos(az), distance * math.sin(el))
    )
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_cavity = True
    scene.display.shading.show_object_outline = True
    if scene.world is None:
        scene.world = bpy.data.worlds.new("validation_world")
    scene.world.color = hex_to_linear_rgba(background)[:3]
    scene.display.shading.background_type = "WORLD"

    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    # Ruta absoluta: Blender no resuelve las relativas respecto al directorio de trabajo.
    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(out_path)
    bpy.ops.render.render(write_still=True)

    bpy.data.objects.remove(cam, do_unlink=True)
    bpy.data.cameras.remove(cam_data)
    return out_path
