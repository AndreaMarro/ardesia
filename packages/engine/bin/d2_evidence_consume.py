#!/usr/bin/env python3
"""D2 evidence consumer (CI lane, synthetic only).

Reads Studio-produced .lesson files from D2_EVIDENCE_DIR (written by the
kept Studio producer harness on the same runner) and drives the CURRENT
Engine through the real entry points:

    read_bundle -> manifest/identity/integrity -> segments -> digest
    -> compose_lesson_summary (MockProvider fixtures derived at runtime
       from the produced segments; the MODEL is mock, never the pipeline)
    -> export_summary_pdf (real pandoc/chromium/pdfinfo)

Also enforces fixture freshness (Option A): produced entry payloads must
match the committed text fixtures except the build-dependent
producer.commitSha, which is normalized with a documented reason.

Writes runtime-evidence.json + summary/pdf/txt into D2_EVIDENCE_OUT.
Fails loudly on any breach. No secrets, no network, no PII (synthetic
lessonIds only; privacy gate enforced before upload).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import time

ALLOWED_LESSONS = {"d2-lesson-a", "d2-lesson-b"}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+39[\s.]?\d[\d\s.]{7,}\d")

REPO_ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ENGINE)

from lessonos.capsule.assembly import assemble_lesson_capsule  # noqa: E402
from lessonos.capsule.extraction import build_extraction_prompt  # noqa: E402
from lessonos.capsule.segmentation import build_segmentation_prompt  # noqa: E402
from lessonos.compose import compose_lesson_material  # noqa: E402
from lessonos.export.browser_pdf import export_summary_pdf  # noqa: E402
from lessonos.ingest.bundle import journal_to_segments, read_bundle  # noqa: E402
from lessonos.llm.router import MockProvider, Router  # noqa: E402
from lessonos.store.sqlite import SQLiteStore  # noqa: E402
from lessonos.summarizer import _build_summary_prompt, _cited_seg_texts  # noqa: E402

FIXTURES = os.path.join(REPO_ENGINE, "tests", "fixtures", "studio_lesson_a")

commands: list[dict] = []


def record(command: str, exit_code: int, result: str = "") -> None:
    commands.append({"command": command, "exit_code": exit_code, "result": result})


def tool_version(argv: list[str]) -> str:
    try:
        r = subprocess.run(argv, capture_output=True, text=True, timeout=30)
        first = (r.stdout + r.stderr).strip().splitlines()
        return first[0][:120] if first and r.returncode == 0 else "unknown"
    except (OSError, subprocess.TimeoutExpired):
        return "unavailable"


def privacy_gate(text: str, where: str) -> None:
    if EMAIL_RE.search(text) or PHONE_RE.search(text):
        raise RuntimeError(f"privacy gate: contact pattern in {where}")
    if "student" in text.lower().replace("student_questions", ""):
        raise RuntimeError(f"privacy gate: unexpected student reference in {where}")


def fixture_entries() -> dict[str, bytes]:
    out = {}
    manifest = json.loads(open(os.path.join(FIXTURES, "manifest.json"), encoding="utf-8").read())
    out["manifest.json"] = open(os.path.join(FIXTURES, "manifest.json"), "rb").read()
    for entry in manifest["files"]:
        out[entry["path"]] = open(
            os.path.join(FIXTURES, entry["path"].replace("/", "__")), "rb").read()
    return out


def main() -> None:
    evidence_dir = os.environ.get("D2_EVIDENCE_DIR")
    out_dir = os.environ.get("D2_EVIDENCE_OUT", os.path.join(evidence_dir or ".", "out"))
    if not evidence_dir or not os.path.isdir(evidence_dir):
        raise RuntimeError("D2_EVIDENCE_DIR must point at the Studio-produced directory")
    os.makedirs(out_dir, exist_ok=True)

    t0 = time.monotonic()
    bundle_a = os.path.join(evidence_dir, "lesson-a.lesson")
    bundle_b = os.path.join(evidence_dir, "lesson-b.lesson")
    for p in (bundle_a, bundle_b):
        if not os.path.isfile(p):
            raise RuntimeError(f"producer output missing: {p}")
    record("studio producer artifacts present", 0, "lesson-a.lesson + lesson-b.lesson")

    # --- freshness Option A: produced entries vs committed fixtures ---
    import zipfile
    produced: dict[str, bytes] = {}
    with zipfile.ZipFile(bundle_a) as zf:
        for name in zf.namelist():
            if not name.endswith("/"):
                produced[name] = zf.read(name)
    committed = fixture_entries()
    committed_manifest = json.loads(committed["manifest.json"].decode("utf-8"))
    produced_manifest = json.loads(produced["manifest.json"].decode("utf-8"))
    produced_manifest.get("producer", {}).pop("commitSha", None)
    committed_manifest.get("producer", {}).pop("commitSha", None)
    if produced_manifest != committed_manifest:
        raise RuntimeError("fixture freshness: manifest drift (beyond producer.commitSha)")
    for name, payload in committed.items():
        if name == "manifest.json":
            continue
        if produced.get(name) != payload:
            raise RuntimeError(f"fixture freshness: entry drift in {name}")
    record("fixture freshness vs committed", 0, "manifest normalized on producer.commitSha only")

    # --- privacy gate on produced bytes (BOTH lessons) ---
    for name, payload in produced.items():
        privacy_gate(payload.decode("utf-8", errors="replace"), f"lesson-a:{name}")
    with zipfile.ZipFile(bundle_b) as _zb:
        for name in _zb.namelist():
            if name.endswith("/"):
                continue
            privacy_gate(_zb.read(name).decode("utf-8", errors="replace"), f"lesson-b:{name}")
    record("privacy gate (synthetic-only)", 0, "no contact patterns in A+B entries")

    # --- Engine consumes lesson-a through real entry points ---
    contents = read_bundle(bundle_a)
    assert contents.manifest and contents.manifest["lessonId"] == "d2-lesson-a"
    lesson = "d2-lesson-a"
    segments = journal_to_segments(contents.events_jsonl, lesson)
    ids = [s.seg_id for s in segments]
    seg_p = build_segmentation_prompt(segments)
    ext_p = build_extraction_prompt(segments)
    seg_r = json.dumps([{"topic": "serie", "seg_ids": ids}])
    ext_r = json.dumps({
        "concepts": [{"name": "serie", "status": "introduced", "prerequisites": [],
                      "citations": [{"seg_id": ids[0], "excerpt": "corrente"}]}],
        "exercises": [], "student_questions": [], "homework": []})
    tmp = SQLiteStore(":memory:")
    for s in segments:
        tmp.save_segment(s)
    p1 = Router()
    p1.register(MockProvider({seg_p: seg_r, ext_p: ext_r}))
    capsule = assemble_lesson_capsule(tmp, lesson, p1, provider="mock", defensive=True)
    summ_p = _build_summary_prompt(capsule, _cited_seg_texts(tmp, capsule))
    summ_r = json.dumps({"sections": [{"heading": "Sintesi", "paragraphs": [
        {"text": "La corrente same Conforme.", "citations": [{"seg_id": ids[0], "excerpt": "corrente"}]},
        {"text": "Legge di Ohm verificata.", "citations": [{"seg_id": ids[1], "excerpt": "Ohm"}]}]}]})
    router = Router()
    router.register(MockProvider({seg_p: seg_r, ext_p: ext_r, summ_p: summ_r}))
    tmp.close()
    store = SQLiteStore(":memory:")
    material = compose_lesson_material(bundle_a, lesson, store=store, router=router, provider="mock")
    md = material.pack.files[f"{lesson}.md"]
    assert material.digest is not None
    assert any(not e.corrected for e in material.digest.errors)
    assert any(e.corrected for e in material.digest.errors)
    assert "manual:d2:p1" in md
    assert "d2-lesson-b" not in md and "Errore di B" not in md
    record("engine compose lesson-a", 0, f"{len(segments)} segments, digest+appendix present")

    # --- lesson-b isolation at bundle level ---
    contents_b = read_bundle(bundle_b)
    assert contents_b.manifest["lessonId"] == "d2-lesson-b"
    assert "d2-lesson-a" not in contents_b.events_jsonl
    record("A/B isolation", 0, "no cross markers")

    # --- PDF with real renderer ---
    pdf = export_summary_pdf(material.pack, out_dir)
    data = pdf.read_bytes()
    assert data.startswith(b"%PDF-")
    info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True)
    pages = int([ln for ln in info.stdout.splitlines() if ln.startswith("Pages:")][0].split(":")[1])
    assert info.returncode == 0 and pages >= 1
    txt = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True).stdout
    for marker in ["Riepilogo: d2-lesson-a", "da rivedere", "corretto", "manual:d2:p1"]:
        assert marker in txt, marker
    record("pdf export+parse", 0, f"{len(data)} bytes, {pages} pages")
    (out_dir_path := __import__("pathlib").Path(out_dir))
    (out_dir_path / "summary-a.md").write_text(md, encoding="utf-8")
    (out_dir_path / "summary-a.txt").write_text(txt, encoding="utf-8")
    (out_dir_path / "page-count.txt").write_text(str(pages), encoding="utf-8")
    import shutil as _shutil
    for lesson_file in ("lesson-a.lesson", "lesson-b.lesson"):
        _shutil.copy2(os.path.join(evidence_dir, lesson_file), out_dir_path / lesson_file)
    # --- privacy gate over derived text outputs before upload ---
    html_text = (out_dir_path / "d2-lesson-a.html").read_text(encoding="utf-8")
    for name, text in {
        "summary-a.md": md,
        "summary-a.txt": txt,
        "page-count.txt": str(pages),
        "d2-lesson-a.html": html_text,
    }.items():
        privacy_gate(text, f"derived:{name}")
    record("privacy gate derived outputs", 0, "no contact patterns")

    import shutil
    evidence = {
        "schema": "ardesia.d2-runtime-evidence/1",
        "prHeadSha": os.environ.get("PR_HEAD_SHA", "UNKNOWN"),
        "checkoutSha": os.environ.get("CI_CHECKOUT_SHA", "UNKNOWN"),
        "baseSha": os.environ.get("BASE_SHA", "UNKNOWN"),
        "toolVersions": {
            "pandoc": tool_version([shutil.which("pandoc") or "pandoc", "--version"]),
            "chromium": tool_version([os.environ.get("ARDESIA_CHROMIUM", "chromium"), "--version"]),
            "pdfinfo": tool_version([shutil.which("pdfinfo") or "pdfinfo", "-v"]),
            "python": sys.version.split()[0],
        },
        "studioProducer": "exportLesson() Studio unit harness (synthetic, deterministic)",
        "engineConsumer": "read_bundle+compose+export_summary_pdf, MockProvider model-only",
        "lessonA": {"lessonId": lesson, "segments": len(segments),
                    "digestErrors": len(material.digest.errors),
                    "sha256": hashlib.sha256(open(bundle_a, "rb").read()).hexdigest()},
        "lessonB": {"lessonId": "d2-lesson-b",
                    "sha256": hashlib.sha256(open(bundle_b, "rb").read()).hexdigest()},
        "summary": {"bytes": len(md.encode("utf-8"))},
        "pdf": {"bytes": len(data), "pages": pages, "textChars": len(txt)},
        "commands": commands,
        "wallSeconds": round(time.monotonic() - t0, 2),
    }
    (out_dir_path / "runtime-evidence.json").write_text(
        json.dumps(evidence, indent=1), encoding="utf-8")
    print(f"EVIDENCE-OK pdf={pdf} pages={pages} wall={evidence['wallSeconds']}s")


if __name__ == "__main__":
    main()
