"""
Script de prueba del pipeline (Fase 1, Gate 1).

Genera un bloque biselado de dos capas (objetos independientes `layer_<id>`), lo exporta a GLB,
escribe un informe JSON y un render de validación. Valida la cadena completa:
  Blender (headless) → GLB → gltf-transform (meshopt) → TresJS en /_lab/escena

Uso:
  node tools/blender/run-blender.mjs tools/blender/test_cube.py -- \
      --config tools/blender/config/test-cube.json --out tools/out/test-cube.raw.glb
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import bpy  # noqa: E402

from lib.cli import base_parser, load_config, script_argv  # noqa: E402
from lib.export import export_glb  # noqa: E402
from lib.report import write_report  # noqa: E402
from lib.scene import principled_material, render_view, reset_scene  # noqa: E402


def build_layers(cfg: dict) -> list[bpy.types.Object]:
    size = float(cfg["size_m"])
    bevel = float(cfg["bevel_m"])
    segments = int(cfg["bevel_segments"])
    objects: list[bpy.types.Object] = []
    z = 0.0
    for layer in cfg["layers"]:
        height = size * float(layer["height_ratio"])
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, z + height / 2))
        obj = bpy.context.active_object
        obj.name = f"layer_{layer['id']}"
        obj.scale = (size, size, height)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = min(bevel, height / 2.5)
        mod.segments = segments
        mod.limit_method = "ANGLE"
        bpy.ops.object.shade_smooth()

        obj.data.materials.append(principled_material(f"mat_{layer['id']}", layer["color"], roughness=0.35))
        obj["layer"] = layer["id"]  # custom property → extras en el GLB
        objects.append(obj)
        z += height
    return objects


def main() -> None:
    args = base_parser(__doc__ or "").parse_args(script_argv())
    cfg = load_config(args.config)

    reset_scene()
    objects = build_layers(cfg)
    glb = export_glb(objects, args.out)
    print(f"[test_cube] GLB: {glb} ({glb.stat().st_size} bytes)")

    renders: list[Path] = []
    if not args.no_render:
        for view in cfg["render"]["views"]:
            out = Path("tools/out/validation") / f"test-cube-{view['name']}.png"
            renders.append(render_view(objects, out, azimuth_deg=view["azimuth"], elevation_deg=view["elevation"]))

    write_report(
        Path("tools/out/reports/test-cube.json"),
        name="test-cube",
        config_path=args.config,
        objects=objects,
        outputs=[glb, *renders],
        extra={"configVersion": cfg["version"]},
    )


if __name__ == "__main__":
    main()
