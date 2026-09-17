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

import hashlib
import json
import re
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone

from lessonos.models.entities import Segment

LESSON_PATHS = {
    "MANIFEST": "manifest.json",
    "SCENE": "raw/board.excalidraw",
    "JOURNAL": "raw/events.jsonl",
    "SESSION": "raw/session.yaml",
    "AUDIO_DIR": "raw/audio/",
}

SUPPORTED_BUNDLE_VERSION = 1
SUPPORTED_SCHEMA_VERSION = 1

# Mirror di Studio validateRoomId (roomPaths.ts): l'identita' dichiarata dal
# manifest deve avere la stessa forma di un lessonId canonico.
_ROOM_ID_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")

# Gli unici kind EventEnvelope v2 necessari a ricostruire i segmenti di testo.
# Altri kind v2 (pointer, math, pdf, lesson.*) sono ignorati: non servono qui.
V2_JOURNAL_KINDS = frozenset({
    "journal.element.add",
    "journal.element.update",
    "journal.element.delete",
})
_V2_KIND_TO_LEGACY_TYPE = {
    "journal.element.add": "element.add",
    "journal.element.update": "element.update",
    "journal.element.delete": "element.delete",
}


@dataclass(frozen=True)
class BundleContents:
    """The validated, in-memory contents of a ``.lesson`` bundle."""

    events_jsonl: str
    session: dict
    audio_members: tuple[str, ...]
    # Manifest Studio v1 parsato quando presente, altrimenti None (bundle
    # legacy manifest-less: percorso storico preservato). Solo le chiavi
    # usate dal motore (lessonId) sono contrattuali qui.
    manifest: dict | None = None


def _is_safe_member(name: str) -> bool:
    """ZipSlip guard: reject absolute paths, parent traversal, and anything
    outside ``raw/`` — with ONE exact exception: the Studio root manifest
    (``manifest.json``). A path is safe iff it is exactly ``manifest.json``
    or it starts with ``raw/`` and no segment is ``..`` (and it is not
    absolute). Anything else at root is rejected: the allowlist is NOT
    widened to ``*``."""
    if not name or name.startswith("/") or name.startswith("\\"):
        return False
    if name == LESSON_PATHS["MANIFEST"]:
        return True
    parts = name.replace("\\", "/").split("/")
    if any(p == ".." for p in parts):
        return False
    return name.startswith("raw/")


def parse_session_yaml(text: str) -> dict:
    """Minimal mirror of Studio ``AudioRecorder.parseSessionYaml``.

    Reads the two GDPR-relevant keys; unknown keys are ignored.
    """
    # LAST-WINS su chiave duplicata (deepreview: era first-match). Semantica
    # YAML + GDPR-critica: un bundle con `audioConsent: true` seguito da
    # `audioConsent: false` (revoca registrata dopo) DEVE leggere `false`, mai
    # `true` — altrimenti audio revocato verrebbe processato.
    data: dict = {}
    consents = re.findall(r"^audioConsent:\s*(true|false)\s*$", text, re.M)
    if consents:
        data["audioConsent"] = consents[-1] == "true"
    epochs = re.findall(r"^audioStartEpoch:\s*(\d+)\s*$", text, re.M)
    if epochs:
        data["audioStartEpoch"] = int(epochs[-1])
    return data


def read_bundle(zip_path: str) -> BundleContents:
    """Open a ``.lesson`` zip, validate every member (ZipSlip), and return the
    journal + parsed session + audio member list + parsed manifest (if any).

    Two flavours, no new abstraction:
      * ``manifest-v1`` — modern Studio export: ``manifest.json`` at root is
        parsed and cross-checked (versions, lessonId, required files,
        files[] bytes+sha256 inventory). Coherence, NOT signature.
      * ``legacy`` — manifest-less bundle: historical path preserved
        (manifest is None).

    Raises ``ValueError`` on an unsafe member, a missing journal, a revoked-
    consent bundle that still carries audio (GDPR), or a manifest that
    disagrees with the payload.
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
        manifest = _read_manifest(zf, names)
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
        events_jsonl=events_jsonl, session=session, audio_members=audio_members,
        manifest=manifest,
    )


def _read_manifest(zf: zipfile.ZipFile, names: list[str]) -> dict | None:
    """Parse and cross-check ``manifest.json``; None when the bundle is a
    legacy manifest-less one. Every check raises ``ValueError``."""
    if LESSON_PATHS["MANIFEST"] not in names:
        return None
    try:
        manifest = json.loads(zf.read(LESSON_PATHS["MANIFEST"]).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError(f"bundle manifest malformed: {exc}") from exc
    if not isinstance(manifest, dict):
        raise ValueError("bundle manifest root must be an object")
    if manifest.get("bundleVersion") != SUPPORTED_BUNDLE_VERSION:
        raise ValueError(
            f"unsupported manifest bundleVersion: {manifest.get('bundleVersion')!r}"
        )
    if manifest.get("schemaVersion") != SUPPORTED_SCHEMA_VERSION:
        raise ValueError(
            f"unsupported manifest schemaVersion: {manifest.get('schemaVersion')!r}"
        )
    lesson_id = manifest.get("lessonId")
    if not isinstance(lesson_id, str) or not _ROOM_ID_RE.match(lesson_id):
        raise ValueError("bundle manifest lessonId missing or invalid")
    for required in ("raw/board.excalidraw", LESSON_PATHS["JOURNAL"], LESSON_PATHS["SESSION"]):
        if required not in names:
            raise ValueError(f"bundle manifest requires missing file {required!r}")
    files = manifest.get("files")
    if not isinstance(files, list) or not files:
        raise ValueError("bundle manifest files inventory missing")
    for entry in files:
        if not isinstance(entry, dict):
            raise ValueError("bundle manifest files entry must be an object")
        path = entry.get("path")
        if not isinstance(path, str) or path not in names:
            raise ValueError(f"bundle manifest lists absent file {path!r}")
        payload = zf.read(path)
        if len(payload) != entry.get("bytes"):
            raise ValueError(f"bundle manifest bytes mismatch ({path})")
        digest = hashlib.sha256(payload).hexdigest()
        if digest != entry.get("sha256"):
            raise ValueError(f"bundle manifest SHA-256 mismatch ({path})")
    return manifest


def _v2_occurred_at_ms(value: object, line_no: int) -> int:
    """Deterministic ISO-8601 → epoch ms. No synthetic timestamps: an
    unparseable occurredAt is a corrupt canonical line, not a legacy one."""
    if not isinstance(value, str):
        raise ValueError(f"journal v2 line {line_no}: occurredAt missing")
    try:
        moment = datetime.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"journal v2 line {line_no}: bad occurredAt {value!r}") from exc
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return int(moment.timestamp() * 1000)


def _normalize_journal_v2(obj: dict, lesson_id: str, line_no: int) -> dict | None:
    """Map ONE canonical EventEnvelope v2 journal row to its legacy
    equivalent (``{"t", "type", "element"/"elementId"}``) so the segment
    logic below runs ONCE, identically for both formats.

    Returns None for v2 kinds this junction does not need (pointer, math,
    pdf, lesson.* …). Raises ValueError on a recognisable-but-corrupt v2
    row (never silently skipped as "unknown legacy"), on a v2 row from
    another lesson (no renaming B as A), and on unsupported schemaVersion.
    """
    if obj.get("schemaVersion") != 2:
        raise ValueError(
            f"journal v2 line {line_no}: unsupported schemaVersion {obj.get('schemaVersion')!r}"
        )
    kind = obj.get("kind")
    if kind not in V2_JOURNAL_KINDS:
        return None
    row_lesson = obj.get("lessonId")
    if row_lesson != lesson_id:
        raise ValueError(
            f"journal v2 line {line_no}: lessonId {row_lesson!r} "
            f"does not match bundle lesson {lesson_id!r}"
        )
    t = _v2_occurred_at_ms(obj.get("occurredAt"), line_no)
    payload = obj.get("payload")
    if not isinstance(payload, dict):
        raise ValueError(f"journal v2 line {line_no}: malformed payload for {kind}")
    legacy_type = _V2_KIND_TO_LEGACY_TYPE[kind]
    if legacy_type == "element.delete":
        element_id = payload.get("elementId")
        if not isinstance(element_id, str) or not element_id:
            raise ValueError(f"journal v2 line {line_no}: malformed elementId for delete")
        return {"t": t, "type": legacy_type, "elementId": element_id}
    element = payload.get("element")
    if not isinstance(element, dict):
        raise ValueError(f"journal v2 line {line_no}: malformed element for {kind}")
    return {"t": t, "type": legacy_type, "element": element}


def journal_to_segments(events_jsonl: str, lesson_id: str) -> list[Segment]:
    """Extract whiteboard TEXT segments from the journal events.

    Accepts BOTH the legacy journal (``{"t", "type": "element.*", ...}``)
    and the canonical Studio EventEnvelope v2 journal
    (``journal.element.add/update/delete``): v2 rows are normalised to the
    legacy shape first, so update/delete/ordering semantics run once.

    Each Excalidraw ``text`` element becomes one Segment: the element's final
    text (last add/update wins), ``[start,end]`` from the first/last journal
    event touching it, in **seconds relative to the first event**. Deleted
    elements are dropped; empty text is skipped. Segments are ordered by start
    and ``seg_id`` is 1-indexed (``<lesson>#sN``) — the same contract as the ASR
    adapter (``adapter.py``). Malformed JSONL lines are skipped (defensive,
    historical legacy contract preserved).
    """
    events: list[dict] = []
    for line_no, line in enumerate(events_jsonl.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict) and "schemaVersion" in parsed:
            normalised = _normalize_journal_v2(parsed, lesson_id, line_no)
            if normalised is not None:
                events.append(normalised)
            continue
        events.append(parsed)
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
            # delete -> re-add resurrects (Excalidraw UNDO restores the SAME
            # element id): a permanent `deleted` set would lose the text
            # forever (deepreview B2). Re-add starts a fresh record at the
            # undo time — the pre-delete timestamps belong to a text the
            # teacher chose to remove.
            deleted.discard(eid)
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
                texts.pop(eid, None)  # gone; a later re-add records fresh

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

    Raises ``ValueError`` on an unsafe/GDPR-invalid bundle, on a manifest
    whose declared lessonId disagrees with the requested one, or when the
    board carried no text (nothing to ingest).
    """
    from lessonos.capsule.assembly import assemble_lesson_capsule

    contents = read_bundle(zip_path)
    if contents.manifest is not None and contents.manifest["lessonId"] != lesson_id:
        raise ValueError(
            f"bundle manifest lessonId {contents.manifest['lessonId']!r} "
            f"does not match requested lesson {lesson_id!r}"
        )
    segments = journal_to_segments(contents.events_jsonl, lesson_id)
    if not segments:
        raise ValueError(
            f"bundle {zip_path!r} yielded no whiteboard text segments "
            f"(no text written on the board)"
        )
    # Bug-hunt #6: purge PRIMA del re-ingest, DENTRO la funzione (il runner
    # T8 lo dimenticava): un re-export con meno elementi lasciava righe stale
    # e shift posizionale dei seg_id (classe B3).
    store.delete_segments_for_lesson(lesson_id)
    for seg in segments:
        store.save_segment(seg)
    capsule = assemble_lesson_capsule(
        store, lesson_id, router,
        provider=provider, model=model, defensive=defensive, save=save,
    )
    return segments, capsule
