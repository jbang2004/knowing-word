#!/usr/bin/env python3
"""ASR round-trip check for generated Qwen3 narration; human listening is still required."""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import subprocess
from pathlib import Path

from mlx_audio.stt import load as load_stt_model
from mlx_audio.stt.generate import generate_transcription
from mlx_audio.stt.utils import load_model


MODEL_ID = "mlx-community/whisper-large-v3-turbo-asr-fp16"
ALIGNER_ID = "mlx-community/Qwen3-ForcedAligner-0.6B-8bit"
PHONETIC_POLICY = "pinyin-pro-3.28.1-tone-number-v1"
PHONETIC_HELPER = Path(__file__).with_name("qwen3-phonetic-signature.mjs")


def normalize(text: str) -> str:
    return re.sub(r"[^\w\u3400-\u9fff]", "", text, flags=re.UNICODE).lower()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def phonetic_similarity(record_id: str, expected: str, actual: str) -> float:
    result = subprocess.run(
        ["node", str(PHONETIC_HELPER)],
        input=json.dumps(
            {"recordId": record_id, "expected": expected, "actual": actual},
            ensure_ascii=False,
        ),
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "phonetic scorer failed")
    payload = json.loads(result.stdout)
    return difflib.SequenceMatcher(None, payload["expected"], payload["actual"]).ratio()


def group_zero_duration_intervals(
    aligned: list[tuple[str, float, float]],
) -> tuple[list[dict], list[dict]]:
    """Preserve model boundaries by grouping an unresolvable token with one neighbour."""
    marks = [
        {"index": index, "char": char, "start": start, "end": end}
        for index, (char, start, end) in enumerate(aligned)
    ]
    groups: list[dict] = []
    index = 0
    while index < len(marks):
        mark = marks[index]
        if mark["end"] > mark["start"]:
            index += 1
            continue
        if mark["end"] < mark["start"]:
            raise ValueError(
                f"Forced aligner returned a negative interval for {mark['char']!r}: "
                f"{mark['start']}..{mark['end']}"
            )

        anchor = mark["start"]
        run_end = index
        while (
            run_end < len(marks)
            and marks[run_end]["start"] == anchor
            and marks[run_end]["end"] == anchor
        ):
            run_end += 1

        if (
            run_end < len(marks)
            and marks[run_end]["start"] == anchor
            and marks[run_end]["end"] > anchor
        ):
            member_indices = list(range(index, run_end + 1))
            span_start = anchor
            span_end = marks[run_end]["end"]
            method = "shared-right-model-interval"
            next_index = run_end + 1
        elif (
            index > 0
            and marks[index - 1]["end"] == anchor
            and marks[index - 1]["start"] < anchor
            and not marks[index - 1].get("alignment_group")
        ):
            member_indices = list(range(index - 1, run_end))
            span_start = marks[index - 1]["start"]
            span_end = anchor
            method = "shared-left-model-interval"
            next_index = run_end
        elif (
            run_end < len(marks)
            and marks[run_end]["start"] > anchor
            and marks[run_end]["end"] > marks[run_end]["start"]
        ):
            member_indices = list(range(index, run_end + 1))
            span_start = anchor
            span_end = marks[run_end]["end"]
            method = "zero-anchor-right-envelope"
            next_index = run_end + 1
        elif (
            index > 0
            and marks[index - 1]["end"] < anchor
            and marks[index - 1]["start"] < marks[index - 1]["end"]
            and not marks[index - 1].get("alignment_group")
        ):
            member_indices = list(range(index - 1, run_end))
            span_start = marks[index - 1]["start"]
            span_end = anchor
            method = "zero-anchor-left-envelope"
            next_index = run_end
        else:
            raise ValueError(
                "Forced aligner returned a zero-duration token without an adjacent model interval; "
                "refusing to invent an internal boundary"
            )

        group_id = f"align-group-{member_indices[0]}-{member_indices[-1]}"
        group_text = "".join(str(marks[item]["char"]) for item in member_indices)
        raw_intervals = [
            {
                "index": item,
                "char": marks[item]["char"],
                "start": round(float(marks[item]["start"]), 5),
                "end": round(float(marks[item]["end"]), 5),
            }
            for item in member_indices
        ]
        for item in member_indices:
            marks[item]["start"] = span_start
            marks[item]["end"] = span_end
            marks[item]["alignment_group"] = group_id
            marks[item]["alignment_group_text"] = group_text
        groups.append(
            {
                "id": group_id,
                "text": group_text,
                "indices": member_indices,
                "start": round(float(span_start), 5),
                "end": round(float(span_end), 5),
                "method": method,
                "rawIntervals": raw_intervals,
            }
        )
        index = next_index

    return marks, groups


def forced_alignment_marks(text: str, result) -> tuple[list[dict], list[dict]]:
    items = getattr(result, "items", result)
    expected = [char for char in text if re.match(r"[\w\u3400-\u9fff]", char, re.UNICODE)]
    aligned: list[tuple[str, float, float]] = []
    for item in items:
        item_text = getattr(item, "text", item.get("text", "") if isinstance(item, dict) else "")
        start = float(getattr(item, "start_time", item.get("start_time", 0) if isinstance(item, dict) else 0))
        end = float(getattr(item, "end_time", item.get("end_time", start) if isinstance(item, dict) else start))
        chars = [char for char in item_text if re.match(r"[\w\u3400-\u9fff]", char, re.UNICODE)]
        if not chars:
            continue
        duration = max(0.0, end - start)
        unit = duration / len(chars) if duration else 0.0
        for index, char in enumerate(chars):
            char_start = start + unit * index
            char_end = start + unit * (index + 1)
            aligned.append((char, char_start, char_end))
    actual = [char for char, _, _ in aligned]
    if actual != expected:
        raise ValueError("Forced aligner output does not exactly match the approved transcript")
    marks, groups = group_zero_duration_intervals(aligned)
    previous_end = -1.0
    previous_group = None
    previous_start = -1.0
    for mark in marks:
        char = str(mark["char"])
        start = float(mark["start"])
        end = float(mark["end"])
        if start < 0 or end <= start:
            raise ValueError(f"Forced aligner returned an invalid interval for {char!r}: {start}..{end}")
        same_group_overlap = (
            mark.get("alignment_group")
            and mark.get("alignment_group") == previous_group
            and start == previous_start
            and end == previous_end
        )
        if start < previous_end and not same_group_overlap:
            raise ValueError(
                f"Forced aligner returned overlapping or non-monotonic intervals at {char!r}: "
                f"{start} < {previous_end}"
            )
        previous_start = start
        previous_end = max(previous_end, end)
        previous_group = mark.get("alignment_group")
    for mark in marks:
        mark["start"] = round(float(mark["start"]), 3)
        mark["end"] = round(float(mark["end"]), 3)
    previous_end = -1.0
    previous_start = -1.0
    previous_group = None
    for mark in marks:
        same_group_overlap = (
            mark.get("alignment_group")
            and mark.get("alignment_group") == previous_group
            and mark["start"] == previous_start
            and mark["end"] == previous_end
        )
        if mark["end"] <= mark["start"] or (mark["start"] < previous_end and not same_group_overlap):
            raise ValueError("Rounded forced-alignment marks are zero-width, overlapping, or non-monotonic")
        previous_start = mark["start"]
        previous_end = max(previous_end, mark["end"])
        previous_group = mark.get("alignment_group")
    return marks, groups


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--model", default=MODEL_ID)
    parser.add_argument("--minimum-similarity", type=float, default=0.88)
    parser.add_argument("--aligner-model", default=ALIGNER_ID)
    parser.add_argument("--write-aligned-marks", action="store_true")
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Reuse ASR text and aligned marks only when they are newer than, and bound to, the current audio.",
    )
    args = parser.parse_args()

    manifest_path = args.manifest.resolve()
    root = manifest_path.parent
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    model = load_model(args.model)
    aligner = load_stt_model(args.aligner_model) if args.write_aligned_marks else None
    checks = []

    for record_id, record in manifest["records"].items():
        marks_path = root / record["audioMarks"]
        marks = json.loads(marks_path.read_text(encoding="utf-8"))
        audio_path = root / record["audio"]
        audio_hash = sha256_file(audio_path)
        asr_path = root / "asr" / f"{record['contentHash']}.txt"
        asr_reused = bool(
            args.resume
            and asr_path.exists()
            and asr_path.stat().st_mtime_ns >= audio_path.stat().st_mtime_ns
        )
        if asr_reused:
            transcript = asr_path.read_text(encoding="utf-8").strip()
        else:
            output = generate_transcription(
                model=model,
                audio=str(audio_path),
                output_path=str(root / "asr" / record["contentHash"]),
                format="txt",
                language="zh",
                verbose=False,
            )
            transcript = output.text.strip()
        expected = marks["transcript"]
        similarity = difflib.SequenceMatcher(
            None,
            normalize(expected),
            normalize(transcript),
        ).ratio()
        phonetic_score = None
        phonetic_error = None
        if similarity < args.minimum_similarity:
            try:
                phonetic_score = phonetic_similarity(record_id, expected, transcript)
            except (json.JSONDecodeError, OSError, RuntimeError, TypeError, ValueError) as error:
                phonetic_error = str(error)
        asr_pass = similarity >= args.minimum_similarity or (
            phonetic_score is not None and phonetic_score >= args.minimum_similarity
        )
        alignment_written = False
        alignment_reused = False
        alignment_error = None
        alignment_groups: list[dict] = []
        if aligner is not None and asr_pass:
            alignment_reused = bool(
                args.resume
                and marks.get("timing_source") == "qwen3-forced-aligner"
                and marks.get("alignment_model") == args.aligner_model
                and marks.get("aligned_audio_sha256") == audio_hash
                and isinstance(marks.get("alignment_groups"), list)
            )
            if alignment_reused:
                alignment_groups = marks["alignment_groups"]
                alignment_written = True
            else:
                try:
                    alignment = aligner.generate(str(audio_path), text=expected, language="Chinese")
                    marks["marks"], alignment_groups = forced_alignment_marks(expected, alignment)
                    marks["timing_source"] = "qwen3-forced-aligner"
                    marks["alignment_model"] = args.aligner_model
                    marks["aligned_audio_sha256"] = audio_hash
                    marks["alignment_groups"] = alignment_groups
                    marks_path.write_text(
                        json.dumps(marks, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8",
                    )
                    alignment_written = True
                except (RuntimeError, TypeError, ValueError) as error:
                    alignment_error = str(error)
        automated_pass = asr_pass and (aligner is None or alignment_written)
        checks.append(
            {
                "recordId": record_id,
                "glyph": record["glyph"],
                "word": record["word"],
                "contentHash": record["contentHash"],
                "expected": expected,
                "asrTranscript": transcript,
                "similarity": round(similarity, 4),
                "phoneticSimilarity": round(phonetic_score, 4) if phonetic_score is not None else None,
                "phoneticPolicy": PHONETIC_POLICY if phonetic_score is not None else None,
                "phoneticError": phonetic_error,
                "audioSha256": audio_hash,
                "asrPass": asr_pass,
                "asrReused": asr_reused,
                "automatedPass": automated_pass,
                "specialPronunciationReview": (
                    "required" if record.get("requiresPronunciationReview") else "not-required"
                ),
                "humanListening": "pending",
                "alignmentWritten": alignment_written,
                "alignmentReused": alignment_reused,
                "alignmentError": alignment_error,
                "alignmentGroupCount": len(alignment_groups),
            }
        )
        phonetic_note = f", phonetic={phonetic_score:.3f}" if phonetic_score is not None else ""
        alignment_note = f", alignment-error={alignment_error}" if alignment_error else ""
        print(
            f"{record['glyph']} {record['word']}: similarity={similarity:.3f}"
            f"{phonetic_note}{alignment_note}",
            flush=True,
        )

    result = {
        "version": "narration-v3-qwen3-asr-roundtrip",
        "model": args.model,
        "minimumSimilarity": args.minimum_similarity,
        "phoneticPolicy": PHONETIC_POLICY,
        "alignmentModel": args.aligner_model if args.write_aligned_marks else None,
        "checks": checks,
        "automatedPass": all(check["automatedPass"] for check in checks),
        "humanListening": "pending",
    }
    (root / "asr-verification.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if not result["automatedPass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
