"""Argumentos de línea de comandos para scripts ejecutados con `blender -b -P script.py -- ...`."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def script_argv() -> list[str]:
    """Devuelve solo los argumentos posteriores a `--` (los anteriores son de Blender)."""
    argv = sys.argv
    return argv[argv.index("--") + 1 :] if "--" in argv else []


def base_parser(description: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--config", required=True, type=Path, help="Ruta al JSON de configuración")
    parser.add_argument("--out", required=True, type=Path, help="Ruta del GLB de salida (sin optimizar)")
    parser.add_argument("--no-render", action="store_true", help="No generar renders de validación")
    return parser


def load_config(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)
