"""T8 — GIUNTO: ingest a Studio ``.lesson`` bundle into the LessonOS engine.

Closes the M0 vertical thread on ONE path:

    lavagna → .lesson (raw/events.jsonl + raw/session.yaml + raw/board.excalidraw
    + raw/audio/*) → ingest-bundle → Segments → capsule → graph → summary

The "segments" are the TEXT the teacher wrote on the board: each Excalidraw
``text`` element becomes one Segment whose text is the element's final text and
whose ``[start,end]`` come from the journal timestamps (seconds relative to the
first event). This is the lavagna-che-registra thesis — the board content IS the
lesson record. Audio (Mode A, optional) is NOT transcribed here; ASR-from-bundle
is a later step. From Segments on, the EXISTING pipeline runs unchanged (same
windowed capsule + grounded graph + summary as the ASR path).

Security / GDPR:
  * **ZipSlip** — every archived member is validated before any read: no
    absolute path, no ``..`` traversal, must live under ``raw/``.
  * **Revoked audio** — a bundle that carries ``raw/audio/*`` while
    ``session.yaml`` says ``audioConsent != true`` is an integrity violation
    (the Studio export must have filtered it) and is REFUSED: revoked audio
    must never be ingested.

No content is read from the archive until the whole member list passes the
ZipSlip check (validate-then-act).
"""

from __future__ import annotations

import json
import re
import zipfile
from dataclasses import dataclass

from lessonos.models.entities import Segment

LESSON_PATHS = {
    "SCENE": "raw/board.excalidraw",
    "JOURNAL": "raw/events.jsonl",
    "SESSION": "raw/session.yaml",
    "AUDIO_DIR": "raw/audio/",
}


@dataclass(frozen=True)
class BundleContents:
    """The validated, in-memory contents of a ``.lesson`` bundle."""

    events_jsonl: str
    session: dict
    audio_members: tuple[str, ...]


def _is_safe_member(name: str) -> bool:
    """ZipSlip guard: reject absolute paths, parent traversal, and anything
    outside ``raw/``. A path is safe iff it starts with ``raw/`` and no segment
    is ``..`` (and it is not absolute)."""
    if not name or name.startswith("/") or name.startswith("\\"):
        return False
    parts = name.replace("\\", "/").split("/")
    if any(p == ".." for p in parts):
        return False
    return name.startswith("raw/")


def parse_session_yaml(text: str) -> dict:
    """Minimal mirror of Studio ``AudioRecorder.parseSessionYaml``.

    Reads the two GDPR-relevant keys; unknown keys are ignored.
    """
    data: dict = {}
    m = re.search(r"^audioConsent:\s*(true|false)\s*$", text, re.M)
    if m:
        data["audioConsent"] = m.group(1) == "true"
    m = re.search(r"^audioStartEpoch:\s*(\d+)\s*$", text, re.M)
    if m:
        data["audioStartEpoch"] = int(m.group(1))
    return data


def read_bundle(zip_path: str) -> BundleContents:
    """Open a ``.lesson`` zip, validate every member (ZipSlip), and return the
    journal + parsed session + audio member list.

    Raises ``ValueError`` on an unsafe member, a missing journal, or a
    revoked-consent bundle that still carries audio (GDPR).
    """
    with zipfile.ZipFile(zip_path) as zf:
        names = [n for n in zf.namelist() if not n.endswith("/")]
        # validate-then-act: check EVERY member before reading anything
        for name in names:
            if not _is_safe_member(name):
                raise ValueError(
                    f"unsafe bundle member (ZipSlip/out-of-scope): {name!r}"
                )
        if LESSON_PATHS["JOURNAL"] not in names:
            raise ValueError(f"bundle missing {LESSON_PATHS['JOURNAL']!r}")
        events_jsonl = zf.read(LESSON_PATHS["JOURNAL"]).decode("utf-8")
        session: dict = {}
        if LESSON_PATHS["SESSION"] in names:
            session = parse_session_yaml(
                zf.read(LESSON_PATHS["SESSION"]).decode("utf-8")
            )
        audio_members = tuple(
            n for n in names if n.startswith(LESSON_PATHS["AUDIO_DIR"])
        )

    if audio_members and session.get("audioConsent") is not True:
        raise ValueError(
            f"bundle carries {len(audio_members)} audio file(s) but "
            f"audioConsent != true — revoked audio must not be ingested (GDPR)"
        )
    return BundleContents(
        events_jsonl=events_jsonl, session=session, audio_members=audio_members
    )


def journal_to_segments(events_jsonl: str, lesson_id: str) -> list[Segment]:
    """Extract whiteboard TEXT segments from the journal events.

    Each Excalidraw ``text`` element becomes one Segment: the element's final
    text (last add/update wins), ``[start,end]`` from the first/last journal
    event touching it, in **seconds relative to the first event**. Deleted
    elements are dropped; empty text is skipped. Segments are ordered by start
    and ``seg_id`` is 1-indexed (``<lesson>#sN``) — the same contract as the ASR
    adapter (``adapter.py``). Malformed JSONL lines are skipped (defensive).
    """
    events: list[dict] = []
    for line in events_jsonl.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    if not events:
        return []

    t0 = min(int(ev.get("t", 0)) for ev in events)

    texts: dict[str, dict] = {}  # element id → {text, start, end}
    deleted: set[str] = set()
    for ev in events:
        typ = ev.get("type")
        t = int(ev.get("t", t0))
        if typ in ("element.add", "element.update"):
            el = ev.get("element") or {}
            if el.get("type") != "text":
                continue
            eid = el.get("id")
            if not eid:
                continue
            text = (el.get("text") or "").strip()
            rec = texts.get(eid)
            if rec is None:
                texts[eid] = {"text": text, "start": t, "end": t}
            else:
                rec["text"] = text  # last write wins
                rec["end"] = max(rec["end"], t)
        elif typ == "element.delete":
            eid = ev.get("elementId")
            if eid:
                deleted.add(eid)

    rows = [
        (rec["start"], rec["end"], rec["text"])
        for eid, rec in texts.items()
        if eid not in deleted and rec["text"]
    ]
    rows.sort(key=lambda r: (r[0], r[1]))

    segments: list[Segment] = []
    for i, (start, end, text) in enumerate(rows, start=1):
        segments.append(
            Segment(
                seg_id=f"{lesson_id}#s{i}",
                lesson_id=lesson_id,
                start=max(0, (start - t0) // 1000),  # epoch ms → relative s
                end=max(0, (end - t0) // 1000),
                text=text,
            )
        )
    return segments


def ingest_bundle(
    zip_path: str,
    store,
    lesson_id: str,
    *,
    router,
    provider: str = "mock",
    model: str | None = None,
    defensive: bool = True,
    save: bool = True,
):
    """Ingest a ``.lesson`` bundle end-to-end: read+validate → text Segments →
    persist → assemble capsule (windowed, grounded) → return ``(segments,
    capsule)``. Graph + summary are composed by the caller (same shape as
    ``bin/run_lesson_full.sh``), reusing the unchanged pipeline.

    Raises ``ValueError`` on an unsafe/GDPR-invalid bundle, or when the board
    carried no text (nothing to ingest).
    """
    from lessonos.capsule.assembly import assemble_lesson_capsule

    contents = read_bundle(zip_path)
    segments = journal_to_segments(contents.events_jsonl, lesson_id)
    if not segments:
        raise ValueError(
            f"bundle {zip_path!r} yielded no whiteboard text segments "
            f"(no text written on the board)"
        )
    for seg in segments:
        store.save_segment(seg)
    capsule = assemble_lesson_capsule(
        store, lesson_id, router,
        provider=provider, model=model, defensive=defensive, save=save,
    )
    return segments, capsule
