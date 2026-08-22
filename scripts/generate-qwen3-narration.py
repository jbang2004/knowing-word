#!/usr/bin/env python3
"""Generate approved narration-v3 assets with the local Qwen3-TTS MLX model."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

import mlx.core as mx
import numpy as np
import soundfile as sf
from mlx_audio.tts.utils import load_model


MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit"
MODEL_REVISION = "37e955a1deb861c088ae5f3a67043185f3d1a60c"
SAMPLE_RATE = 24_000
VOICE_NAME = "封"
SEED = 20260822
GENERATION_POLICY = "qwen3-clone-2026-08-22-v3"
REFERENCE_ID = "019f0554-ea22-762e-966c-32d678fd6bf6"
REFERENCE_SHA256 = "eb07e06ee13a20ee4577b1b481df6d33d42127c1b3876bfa5d5e5362ae349f19"
REFERENCE_TEXT = "封，封锁的封。会意字，左右结构，本义是地界，左边的圭。"
SPOKEN_PATTERN = re.compile(r"[\w\u3400-\u9fff]", re.UNICODE)


def trim_silence(audio: np.ndarray) -> np.ndarray:
    threshold = 10 ** (-55 / 20)
    active = np.flatnonzero(np.abs(audio) >= threshold)
    if active.size == 0:
        return audio
    keep = round(0.08 * SAMPLE_RATE)
    return audio[
        max(0, int(active[0]) - keep) : min(audio.size, int(active[-1]) + keep + 1)
    ]


def spoken_count(text: str) -> int:
    return sum(1 for char in text if SPOKEN_PATTERN.match(char))


def duration_is_natural(text: str, duration: float) -> bool:
    count = spoken_count(text)
    return max(2.0, count * 0.11) <= duration <= max(6.0, count * 0.66 + 1.5)


def estimated_marks(text: str, duration: float) -> list[dict[str, float | int | str]]:
    chars = list(text)
    count = spoken_count(text)
    leading = min(0.28, duration * 0.02)
    trailing = min(0.2, duration * 0.015)
    raw_pause = sum(
        0.34 if char in "。！？!?" else 0.18 if char in "，；、,;" else 0.28 if char in "…" else 0
        for char in chars
    )
    pause_scale = min(1.0, duration * 0.28 / raw_pause) if raw_pause else 1.0
    unit = max(0.1, duration - leading - trailing - raw_pause * pause_scale) / max(1, count)
    marks: list[dict[str, float | int | str]] = []
    cursor = leading
    for char in chars:
        if SPOKEN_PATTERN.match(char):
            marks.append(
                {
                    "index": len(marks),
                    "char": char,
                    "start": round(cursor + unit * 0.06, 3),
                    "end": round(cursor + unit * 0.9, 3),
                }
            )
            cursor += unit
        elif char in "。！？!?":
            cursor += 0.34 * pause_scale
        elif char in "，；、,;":
            cursor += 0.18 * pause_scale
        elif char == "…":
            cursor += 0.28 * pause_scale
    return marks


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def content_hash(text: str, reference_hash: str, model_id: str) -> str:
    payload = json.dumps(
        {
            "text": text,
            "reference": reference_hash,
            "model": model_id,
            "modelRevision": MODEL_REVISION,
            "voice": VOICE_NAME,
            "policy": GENERATION_POLICY,
            "seed": SEED,
        },
        ensure_ascii=False,
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()[:20]


def prepare_reference(source: Path, target: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-t",
            "7.95",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "1",
            str(target),
        ],
        check=True,
    )


def encode_audio(source: Path, target: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-fflags",
            "+bitexact",
            "-i",
            str(source),
            "-map_metadata",
            "-1",
            "-map_chapters",
            "-1",
            "-af",
            "loudnorm=I=-18:LRA=7:TP=-1.5",
            "-c:a",
            "libopus",
            "-flags:a",
            "+bitexact",
            "-application",
            "voip",
            "-vbr",
            "on",
            "-compression_level",
            "10",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "1",
            "-b:a",
            "24k",
            "-fflags",
            "+bitexact",
            str(target),
        ],
        check=True,
    )


def load_records(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload if isinstance(payload, list) else payload.get("records")
    if not isinstance(records, list):
        raise ValueError("Input must be an array or an object with a records array")
    return records


def generate_take(model, text: str, reference: Path, digest: str) -> tuple[np.ndarray, dict]:
    max_tokens = min(1100, max(320, len(text) * 5 + 100))
    for attempt, temperature in enumerate((0.54, 0.60, 0.48, 0.64)):
        mx.random.seed(SEED + int(digest[:8], 16) + attempt * 37)
        print(f"  attempt {attempt + 1}, temperature {temperature}", flush=True)
        results = list(
            model.generate(
                text=text,
                lang_code="Chinese",
                ref_audio=str(reference.resolve()),
                ref_text=REFERENCE_TEXT,
                temperature=temperature,
                top_k=50,
                top_p=0.95,
                repetition_penalty=1.35,
                max_tokens=max_tokens,
                split_pattern="",
                verbose=False,
            )
        )
        token_count = sum(int(result.token_count or 0) for result in results)
        if not results or token_count >= max_tokens - 1:
            continue
        audio = trim_silence(
            np.concatenate(
                [np.asarray(result.audio, dtype=np.float32).reshape(-1) for result in results]
            )
        )
        duration = len(audio) / SAMPLE_RATE
        if duration_is_natural(text, duration):
            return audio, {
                "attempt": attempt + 1,
                "temperature": temperature,
                "tokenCount": token_count,
                "duration": round(duration, 3),
            }
        print(f"  rejected duration {duration:.2f}s", flush=True)
    raise RuntimeError("Qwen3-TTS did not produce a natural-duration take")


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--record", action="append", default=[])
    parser.add_argument("--glyph", action="append", default=[])
    parser.add_argument("--model", default=MODEL_ID)
    parser.add_argument(
        "--reference",
        type=Path,
        default=project_root / f"public/heritage/{REFERENCE_ID}/audio.mp3",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=project_root / "artifacts/narration-v3/qwen-v3-4bit-master",
    )
    parser.add_argument("--allow-draft", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    if args.model != MODEL_ID:
        raise ValueError(
            "Formal narration is locked to Qwen3-TTS 1.7B Base 4bit; "
            "use a separate experimental script for other checkpoints"
        )

    records = load_records(args.input.resolve())
    selected_ids = set(args.record)
    selected_glyphs = set(args.glyph)
    selected = [
        record
        for record in records
        if (not selected_ids and not selected_glyphs)
        or record.get("recordId") in selected_ids
        or record.get("glyph") in selected_glyphs
    ]
    if not selected:
        raise ValueError("No records matched --record/--glyph")
    for record in selected:
        if record.get("status") != "approved" and not args.allow_draft:
            raise ValueError(f"{record.get('recordId')} is not approved")
        spoken_text = record.get("ttsText") or record.get("script", "")
        if re.search(r"[A-Za-z]", spoken_text):
            raise ValueError(
                f"{record.get('recordId')} still contains Latin text; provide a reviewed ttsText"
            )

    output_root = args.output_root.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    reference_hash = sha256_file(args.reference.resolve())
    if reference_hash != REFERENCE_SHA256:
        raise ValueError("Formal narration reference audio sha256 does not match the locked Feng take")
    reference_wav = output_root / "feng-reference-7.95s.wav"
    # The model consumes this derived WAV, not the source MP3. Rebuild it from the
    # locked source on every invocation so a stale or replaced cache can never be
    # mislabeled with the approved reference hash.
    prepare_reference(args.reference.resolve(), reference_wav)

    index_path = output_root / "manifest.json"
    manifest = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {
        "version": "narration-v3-qwen3",
        "model": args.model,
        "modelRevision": MODEL_REVISION,
        "generationPolicy": GENERATION_POLICY,
        "voice": VOICE_NAME,
        "mode": "same-language ICL voice cloning",
        "reference": {
            "id": REFERENCE_ID,
            "source": str(args.reference.resolve()),
            "sha256": reference_hash,
            "text": REFERENCE_TEXT,
            "duration": 7.95,
        },
        "records": {},
    }
    if manifest.get("model") != args.model:
        raise ValueError("Existing manifest uses a different model")
    if manifest.get("modelRevision") != MODEL_REVISION:
        raise ValueError("Existing manifest uses a different model revision")
    if manifest.get("generationPolicy") != GENERATION_POLICY:
        raise ValueError("Existing manifest uses a different generation policy; use a new output root")
    if manifest.get("reference", {}).get("sha256") != reference_hash:
        raise ValueError("Existing manifest uses a different voice reference")

    prepared: list[tuple[dict, str, str, Path]] = []
    for record in selected:
        text = record.get("ttsText") or record["script"]
        digest = content_hash(text, reference_hash, args.model)
        folder = output_root / "by-content" / digest
        prepared.append((record, text, digest, folder))

    missing = [item for item in prepared if args.force or not (item[3] / "audio.webm").exists()]
    model = load_model(args.model, revision=MODEL_REVISION) if missing else None
    for index, (record, text, digest, folder) in enumerate(prepared):
        folder.mkdir(parents=True, exist_ok=True)
        wav_path = folder / "audio.wav"
        webm_path = folder / "audio.webm"
        marks_path = folder / "audio-marks.json"
        metadata = None
        if args.force or not webm_path.exists() or not marks_path.exists():
            print(f"[{index + 1}/{len(prepared)}] {record['glyph']} · {record['word']}", flush=True)
            audio, metadata = generate_take(model, text, reference_wav, digest)
            sf.write(wav_path, audio, SAMPLE_RATE, subtype="PCM_24")
            encode_audio(wav_path, webm_path)
            duration = len(audio) / SAMPLE_RATE
            marks_path.write_text(
                json.dumps(
                    {
                        "marks": estimated_marks(text, duration),
                        "transcript": text,
                        "voice_reference": VOICE_NAME,
                        "reference_id": REFERENCE_ID,
                        "reference_sha256": REFERENCE_SHA256,
                        "timing_source": "provisional-punctuation-estimate",
                        "script_version": "narration-v3",
                        "model": args.model,
                        "model_revision": MODEL_REVISION,
                        "generation_policy": GENERATION_POLICY,
                        "seed": SEED,
                        "content_hash": digest,
                        "duration": round(duration, 3),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
                + "\n",
                encoding="utf-8",
            )
        else:
            print(f"[{index + 1}/{len(prepared)}] {record['glyph']} · reused {digest}", flush=True)
        previous = manifest["records"].get(record["recordId"], {})
        manifest["records"][record["recordId"]] = {
            "glyph": record["glyph"],
            "word": record["word"],
            "requiresPronunciationReview": any(
                marker in str(risk)
                for risk in record.get("risks", [])
                for marker in ("多音", "读音", "误读", "声调")
            )
            or bool(re.search(r"多音|不读|读[‘’“\"]|第[一二三四]声|声调", text))
            or record["glyph"] in {"拗", "识", "哼", "贾"},
            "contentHash": digest,
            "audio": f"by-content/{digest}/audio.webm",
            "audioMarks": f"by-content/{digest}/audio-marks.json",
            "generation": metadata if metadata is not None else previous.get("generation"),
        }

    index_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(prepared)} record mappings to {index_path}", flush=True)


if __name__ == "__main__":
    main()
