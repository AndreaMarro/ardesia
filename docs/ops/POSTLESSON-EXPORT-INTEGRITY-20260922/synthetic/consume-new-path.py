#!/usr/bin/env python3
"""Prova sintetica integrata (§7): bundle dal nuovo percorso corretto
(Room C + export rigoroso, salvato dal browser) nel consumer Engine corrente.

Guida gli entry point reali: read_bundle -> manifest/identità/integrità ->
segments -> digest -> compose_lesson_material (MockProvider: solo il MODELLO
è mock, mai la pipeline) -> export_summary_pdf (pandoc/chromium/pdfinfo reali).

Uso: NEW_PATH_BUNDLE=... OUT_DIR=... packages/engine/.venv/bin/python
docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/consume-new-path.py
Sintetico, offline, nessun segreto, nessuna PII.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import time
import zipfile

REPO = os.environ.get(
    "ARDESIA_CHECKOUT",
    "/Users/andreamarro/VOLUME 3/ardesia-postlesson-integrity-20260922",
)
sys.path.insert(0, os.path.join(REPO, "packages", "engine"))

from lessonos.capsule.assembly import assemble_lesson_capsule  # noqa: E402
from lessonos.capsule.extraction import build_extraction_prompt  # noqa: E402
from lessonos.capsule.segmentation import build_segmentation_prompt  # noqa: E402
from lessonos.compose import compose_lesson_material  # noqa: E402
from lessonos.export.browser_pdf import export_summary_pdf  # noqa: E402
from lessonos.ingest.bundle import journal_to_segments, read_bundle  # noqa: E402
from lessonos.llm.router import MockProvider, Router  # noqa: E402
from lessonos.store.sqlite import SQLiteStore  # noqa: E402
from lessonos.summarizer import _build_summary_prompt, _cited_seg_texts  # noqa: E402

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+39[\s.]?\d[\d\s.]{7,}\d")
LESSON = "bw-room-a"


def privacy_gate(text: str, where: str) -> None:
    if EMAIL_RE.search(text) or PHONE_RE.search(text):
        raise RuntimeError(f"privacy gate: contact pattern in {where}")


def main() -> None:
    bundle = os.environ["NEW_PATH_BUNDLE"]
    out_dir = os.environ.get("OUT_DIR", os.path.join(os.path.dirname(bundle), "out"))
    os.makedirs(out_dir, exist_ok=True)
    t0 = time.monotonic()
    bundle_sha = hashlib.sha256(open(bundle, "rb").read()).hexdigest()
    print(f"input bundle sha256={bundle_sha}")

    with zipfile.ZipFile(bundle) as zf:
        for name in zf.namelist():
            if name.endswith("/"):
                continue
            privacy_gate(zf.read(name).decode("utf-8", errors="replace"), f"bundle:{name}")

    contents = read_bundle(bundle)
    assert contents.manifest and contents.manifest["lessonId"] == LESSON, "manifest identity"
    assert contents.lessonos_events_jsonl, "LessonOS memory missing from bundle"
    rows = [json.loads(line) for line in contents.lessonos_events_jsonl.splitlines() if line.strip()]
    assert rows, "empty LessonOS memory"
    assert {row["lessonId"] for row in rows} == {LESSON}, "foreign lesson in memory"
    seqs = [row["seq"] for row in rows]
    assert seqs == sorted(seqs), "non-monotonic seq"
    last = rows[-1]
    assert last["kind"] == "simulation.circuit.solved", f"last event kind: {last['kind']}"
    assert last["payload"]["experimentId"] == "synth-exp-bw", "last action missing"
    print(f"bundle ok: {len(rows)} rows, last=solved(synth-exp-bw), lesson={LESSON}")

    segments = journal_to_segments(contents.events_jsonl, LESSON)
    # I segmenti nascono dal journal (formula V = R I); la memoria LessonOS
    # (solved) è verificata nel bundle e nel digest, non inventata nel testo.
    assert segments, "no segments from journal"
    ids = [s.seg_id for s in segments]
    print(f"segments: {len(segments)} ({', '.join(ids)})")

    excerpt_of = {s.seg_id: s.text[:24] for s in segments}
    seg_p = build_segmentation_prompt(segments)
    ext_p = build_extraction_prompt(segments)
    seg_r = json.dumps([{"topic": "legge-di-ohm", "seg_ids": ids}])
    ext_r = json.dumps({
        "concepts": [{"name": "legge-di-ohm", "status": "introduced", "prerequisites": [],
                      "citations": [{"seg_id": ids[0], "excerpt": excerpt_of[ids[0]]}]}],
        "exercises": [], "student_questions": [], "homework": []})
    tmp = SQLiteStore(":memory:")
    for s in segments:
        tmp.save_segment(s)
    p1 = Router()
    p1.register(MockProvider({seg_p: seg_r, ext_p: ext_r}))
    capsule = assemble_lesson_capsule(tmp, LESSON, p1, provider="mock", defensive=True)
    summ_p = _build_summary_prompt(capsule, _cited_seg_texts(tmp, capsule))
    summ_r = json.dumps({"sections": [{"heading": "Sintesi", "paragraphs": [
        {"text": f"Lezione {LESSON}: formula registrata alla lavagna.",
         "citations": [{"seg_id": sid, "excerpt": excerpt_of[sid]} for sid in ids]}]}]})
    router = Router()
    router.register(MockProvider({seg_p: seg_r, ext_p: ext_r, summ_p: summ_r}))
    tmp.close()

    store = SQLiteStore(":memory:")
    material = compose_lesson_material(bundle, LESSON, store=store, router=router, provider="mock")
    md = material.pack.files[f"{LESSON}.md"]
    assert material.digest is not None, "missing digest"
    assert LESSON in md, "lesson marker missing from material"
    # Il solved vive verificato nel bundle e nei row assert sopra; il testo
    # proiettato nasce dal journal: qui si vieta il leak estraneo, non si
    # inventa proiezione.
    assert "cls-foreign" not in md and "FOREIGN" not in md, "foreign leak in material"
    print(f"compose ok: digest errors={len(material.digest.errors)}, md={len(md)} chars")

    pdf = export_summary_pdf(material.pack, out_dir)
    data = pdf.read_bytes()
    assert data.startswith(b"%PDF-"), "not a pdf"
    info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True)
    pages = int([ln for ln in info.stdout.splitlines() if ln.startswith("Pages:")][0].split(":")[1])
    assert info.returncode == 0 and pages >= 1
    txt = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True).stdout
    assert f"Riepilogo: {LESSON}" in txt, "lesson marker missing from pdf text"
    print(f"pdf ok: {len(data)} bytes, {pages} pages")

    evidence = {
        "schema": "ardesia.postlesson-integrated-evidence/1",
        "lesson": LESSON,
        "inputBundleSha256": bundle_sha,
        "rows": len(rows),
        "lastEvent": {"kind": last["kind"], "experimentId": last["payload"]["experimentId"], "seq": last["seq"]},
        "segments": len(segments),
        "digestErrors": len(material.digest.errors),
        "pdf": {"bytes": len(data), "pages": pages, "textChars": len(txt)},
        "provider": "mock (model only)",
        "wallSeconds": round(time.monotonic() - t0, 2),
    }
    with open(os.path.join(out_dir, "runtime-evidence.json"), "w", encoding="utf-8") as fh:
        json.dump(evidence, fh, indent=1)
    print(f"EVIDENCE-OK pdf={pdf} pages={pages}")


if __name__ == "__main__":
    main()
