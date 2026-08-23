"""Strict runtime checks for reproducible formal narration work."""

from __future__ import annotations

import json
import platform
import re
import subprocess
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path


def load_toolchain_lock(project_root: Path) -> dict:
    lock_path = project_root / "config/narration-toolchain.lock.json"
    return json.loads(lock_path.read_text(encoding="utf-8"))


def formal_book_policy(lock: dict) -> dict:
    formal = lock["formal"]
    models = lock["models"]
    return {
        "voice": formal["voice"],
        "formalCloneModel": models["tts"]["id"],
        "formalModelRevision": models["tts"]["revision"],
        "formalAsrModel": models["asr"]["id"],
        "formalAsrModelRevision": models["asr"]["revision"],
        "formalAlignmentModel": models["aligner"]["id"],
        "formalAlignmentModelRevision": models["aligner"]["revision"],
        "formalGenerationPolicy": formal["generationPolicy"],
        "formalReferenceId": formal["reference"]["id"],
        "formalReferenceSha256": formal["reference"]["sha256"],
    }


def validate_toolchain(project_root: Path) -> dict:
    lock = load_toolchain_lock(project_root)
    errors: list[str] = []

    requirements: dict[str, str] = {}
    for line in (project_root / "requirements-narration.lock").read_text(
        encoding="utf-8"
    ).splitlines():
        value = line.strip()
        if not value or value.startswith("#") or "==" not in value:
            continue
        package, expected = value.split("==", 1)
        requirements[package.lower()] = expected
    for package, expected in lock["packages"].items():
        if requirements.get(package.lower()) != expected:
            errors.append(
                f"requirements-narration.lock does not pin {package}=={expected}"
            )

    actual_platform = f"{platform.system().lower()}-{platform.machine().lower()}"
    if actual_platform != lock["platform"]:
        errors.append(f"platform {actual_platform} != {lock['platform']}")
    actual_python = platform.python_version()
    if actual_python != lock["python"]:
        errors.append(f"python {actual_python} != {lock['python']}")

    for package, expected in lock["packages"].items():
        try:
            actual = version(package)
        except PackageNotFoundError:
            errors.append(f"{package} is missing")
            continue
        if actual != expected:
            errors.append(f"{package} {actual} != {expected}")

    try:
        output = subprocess.run(
            ["ffmpeg", "-version"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        match = re.match(r"ffmpeg version ([^ ]+)", output)
        actual_ffmpeg = match.group(1) if match else "unknown"
    except (FileNotFoundError, subprocess.CalledProcessError):
        actual_ffmpeg = "missing"
    if actual_ffmpeg != lock["ffmpeg"]:
        errors.append(f"ffmpeg {actual_ffmpeg} != {lock['ffmpeg']}")

    if errors:
        detail = "\n  - ".join(errors)
        raise RuntimeError(
            "Narration toolchain differs from config/narration-toolchain.lock.json:\n"
            f"  - {detail}\n"
            "Rebuild .venv from requirements-narration.lock before formal generation."
        )
    return lock
