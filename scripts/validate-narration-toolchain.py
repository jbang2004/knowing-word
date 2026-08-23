#!/usr/bin/env python3
"""Validate the formal narration Python/MLX/FFmpeg toolchain."""

from pathlib import Path

from narration_toolchain import validate_toolchain


project_root = Path(__file__).resolve().parents[1]
lock = validate_toolchain(project_root)
print(f"Narration toolchain {lock['version']} is locked and ready.")
