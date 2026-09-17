"""Tests for T8 — GIUNTO ingest-bundle (studio .lesson → engine).

Covers the security guards (ZipSlip, revoked-audio GDPR), the whiteboard-text →
Segment extraction (ordering, 1-indexed, relative time, delete/empty handling),
and the end-to-end orchestration into the existing capsule pipeline (mock LLM).
"""

from __future__ import annotations

import hashlib
import json
import zipfile

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.capsule.assembly import load_capsule
from lessonos.ingest.bundle import (
    BundleContents,
    _is_safe_member,
    ingest_bundle,
    journal_to_segments,
    parse_session_yaml,
    read_bundle,
)
from lessonos.llm.router import MockProvider, Router
from lessonos.store.sqlite import SQLiteStore

L = "lavagna_test"


def _events(*evs: dict) -> str:
    return "\n".join(json.dumps(e) for e in evs)


def _text_add(t: int, eid: str, text: str, version: int = 1) -> dict:
    return {"t": t, "type": "element.add",
            "element": {"id": eid, "type": "text", "text": text, "version": version}}


def _write_lesson(tmp_path, events_jsonl: str, *, session: str | None = None,
                   audio: tuple[str, ...] = (), extra: dict | None = None,
                   manifest: str | None = None):
    """Write a synthetic .lesson zip and return its path."""
    p = tmp_path / "lesson.lesson"
    with zipfile.ZipFile(p, "w") as zf:
        if manifest is not None:
            zf.writestr("manifest.json", manifest)
        zf.writestr("raw/events.jsonl", events_jsonl)
        if session is not None:
            zf.writestr("raw/session.yaml", session)
        zf.writestr("raw/board.excalidraw", "{}")
        for a in audio:
            zf.writestr(f"raw/audio/{a}", b"\x00\x01webm")
        for name, content in (extra or {}).items():
            zf.writestr(name, content)
    return str(p)


# ── parse_session_yaml ────────────────────────────────────────────────


class TestParseSessionYaml:
    def test_consent_true_and_epoch(self) -> None:
        d = parse_session_yaml("audioConsent: true\naudioStartEpoch: 1700000000000\n")
        assert d == {"audioConsent": True, "audioStartEpoch": 1700000000000}

    def test_consent_false(self) -> None:
        assert parse_session_yaml("audioConsent: false\n") == {"audioConsent": False}

    def test_empty(self) -> None:
        assert parse_session_yaml("") == {}

    def test_duplicate_consent_last_wins_gdpr(self) -> None:
        """Chiave duplicata → vince l'ULTIMA (YAML + GDPR): consenso revocato
        DOPO non deve essere mascherato da un `true` precedente."""
        d = parse_session_yaml("audioConsent: true\naudioStartEpoch: 100\naudioConsent: false\n")
        assert d["audioConsent"] is False  # mai True
        d2 = parse_session_yaml("audioConsent: false\naudioConsent: true\n")
        assert d2["audioConsent"] is True

    def test_duplicate_epoch_last_wins(self) -> None:
        d = parse_session_yaml("audioStartEpoch: 100\naudioStartEpoch: 200\n")
        assert d["audioStartEpoch"] == 200


# ── ZipSlip guard ─────────────────────────────────────────────────────


class TestSafeMember:
    @pytest.mark.parametrize("name", [
        "raw/events.jsonl", "raw/session.yaml", "raw/audio/chunk-0.webm",
    ])
    def test_safe(self, name: str) -> None:
        assert _is_safe_member(name) is True

    @pytest.mark.parametrize("name", [
        "/etc/passwd", "raw/../etc/passwd", "../raw/events.jsonl",
        "raw/../../x", "etc/passwd", "", "C:\\evil",
    ])
    def test_unsafe(self, name: str) -> None:
        assert _is_safe_member(name) is False


# ── journal_to_segments ───────────────────────────────────────────────


class TestJournalToSegments:
    def test_text_elements_become_ordered_1indexed_segments(self) -> None:
        ev = _events(
            _text_add(1000, "a", "Definizione di segnale"),
            _text_add(5000, "b", "Energia di un segnale"),
            _text_add(9000, "c", "Esercizio: calcola la potenza"),
        )
        segs = journal_to_segments(ev, L)
        assert [s.seg_id for s in segs] == [f"{L}#s1", f"{L}#s2", f"{L}#s3"]
        assert [s.text for s in segs] == [
            "Definizione di segnale", "Energia di un segnale",
            "Esercizio: calcola la potenza",
        ]
        # relative seconds from first event (t0=1000ms)
        assert segs[0].start == 0
        assert segs[1].start == 4
        assert segs[2].start == 8

    def test_update_keeps_last_text(self) -> None:
        ev = _events(
            _text_add(1000, "a", "Defi", version=1),
            {"t": 3000, "type": "element.update",
             "element": {"id": "a", "type": "text", "text": "Definizione completa", "version": 2}},
        )
        segs = journal_to_segments(ev, L)
        assert len(segs) == 1
        assert segs[0].text == "Definizione completa"
        assert segs[0].end == 2  # last touch at 3000ms → 2s relative

    def test_deleted_element_dropped(self) -> None:
        ev = _events(
            _text_add(1000, "a", "tieni"),
            _text_add(2000, "b", "cancella"),
            {"t": 3000, "type": "element.delete", "elementId": "b"},
        )
        segs = journal_to_segments(ev, L)
        assert [s.text for s in segs] == ["tieni"]

    def test_delete_then_readd_resurrects(self) -> None:
        """Excalidraw UNDO restores the SAME element id: delete -> re-add must
        keep the re-added text (deepreview B2: permanent `deleted` set lost it
        — with a single-text board the whole ingest failed)."""
        ev = _events(
            _text_add(1000, "a", "testo originale"),
            {"t": 2000, "type": "element.delete", "elementId": "a"},
            _text_add(5000, "a", "testo ripristinato"),
        )
        segs = journal_to_segments(ev, L)
        assert [s.text for s in segs] == ["testo ripristinato"]
        # fresh record: timing restarts at the undo moment (4s after t0)
        assert segs[0].start == 4

    def test_delete_without_readd_stays_deleted(self) -> None:
        ev = _events(
            _text_add(1000, "a", "sparisce"),
            {"t": 2000, "type": "element.delete", "elementId": "a"},
            _text_add(3000, "b", "resta."),
        )
        segs = journal_to_segments(ev, L)
        assert [s.text for s in segs] == ["resta."]

    def test_non_text_and_empty_skipped(self) -> None:
        ev = _events(
            {"t": 1000, "type": "element.add",
             "element": {"id": "d", "type": "rectangle", "version": 1}},
            _text_add(2000, "e", "   "),  # whitespace-only
            _text_add(3000, "f", "reale"),
        )
        segs = journal_to_segments(ev, L)
        assert [s.text for s in segs] == ["reale"]

    def test_malformed_line_skipped(self) -> None:
        ev = "not json\n" + json.dumps(_text_add(1000, "a", "ok"))
        segs = journal_to_segments(ev, L)
        assert [s.text for s in segs] == ["ok"]

    def test_empty_journal(self) -> None:
        assert journal_to_segments("", L) == []


# ── read_bundle (GDPR + ZipSlip + structure) ──────────────────────────


class TestReadBundle:
    def test_reads_journal_and_session(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: false\n")
        c = read_bundle(p)
        assert isinstance(c, BundleContents)
        assert "element.add" in c.events_jsonl
        assert c.session == {"audioConsent": False}
        assert c.audio_members == ()

    def test_audio_with_consent_true_ok(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: true\n", audio=("chunk-0.webm",))
        c = read_bundle(p)
        assert c.audio_members == ("raw/audio/chunk-0.webm",)

    def test_audio_with_consent_false_refused(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: false\n", audio=("chunk-0.webm",))
        with pytest.raises(ValueError, match="revoked audio"):
            read_bundle(p)

    def test_audio_without_session_refused(self, tmp_path) -> None:
        # no session.yaml at all → consent unknown → audio must be refused
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session=None, audio=("chunk-0.webm",))
        with pytest.raises(ValueError, match="revoked audio"):
            read_bundle(p)

    def test_zipslip_member_refused(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: false\n",
                          extra={"raw/../evil.txt": "pwned"})
        with pytest.raises(ValueError, match="ZipSlip|unsafe"):
            read_bundle(p)

    def test_missing_journal_refused(self, tmp_path) -> None:
        p = tmp_path / "x.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("raw/session.yaml", "audioConsent: false\n")
        with pytest.raises(ValueError, match="missing"):
            read_bundle(str(p))


# ── ingest_bundle (end-to-end, mock LLM) ──────────────────────────────


class TestIngestBundle:
    def test_ingest_end_to_end(self, tmp_path) -> None:
        events_jsonl = _events(
            _text_add(1000, "a", "Definizione di segnale"),
            _text_add(5000, "b", "Energia di un segnale"),
            _text_add(9000, "c", "Esercizio: calcola la potenza"),
        )
        p = _write_lesson(tmp_path, events_jsonl, session="audioConsent: false\n")

        # Build mock fixtures from the deterministic segments.
        segs = journal_to_segments(events_jsonl, L)
        tmp = SQLiteStore(":memory:")
        for s in segs:
            tmp.save_segment(s)
        seg_prompt = build_segmentation_prompt(tmp.segments_for_lesson(L))
        ext_prompt = build_extraction_prompt(tmp.segments_for_lesson(L))
        seg_json = json.dumps([
            {"topic": "Segnali", "seg_ids": [f"{L}#s1", f"{L}#s2"]},
            {"topic": "Esercizi", "seg_ids": [f"{L}#s3"]},
        ])
        ext_json = json.dumps({
            "concepts": [
                {"name": "segnale", "status": "introduced",
                 "citations": [{"seg_id": f"{L}#s1", "excerpt": "Definizione di segnale"}]},
                {"name": "energia", "status": "introduced",
                 "citations": [{"seg_id": f"{L}#s2", "excerpt": "Energia di un segnale"}]},
            ],
            "exercises": [
                {"prompt": "Calcola la potenza",
                 "citations": [{"seg_id": f"{L}#s3", "excerpt": "Esercizio: calcola la potenza"}]},
            ],
            "student_questions": [], "homework": [],
        })
        router = Router()
        router.register(MockProvider({seg_prompt: seg_json, ext_prompt: ext_json}))

        store = SQLiteStore(":memory:")
        segments, capsule = ingest_bundle(p, store, L, router=router, provider="mock")

        # segments persisted from the board text
        assert [s.seg_id for s in segments] == [f"{L}#s1", f"{L}#s2", f"{L}#s3"]
        assert store.get_segment(f"{L}#s1").text == "Definizione di segnale"
        # capsule assembled + grounded
        assert capsule.lesson_id == L
        assert {c.name for c in capsule.content.concepts} == {"segnale", "energia"}
        assert capsule.content.concepts[0].citations[0].excerpt == "Definizione di segnale"
        assert len(capsule.timeline) == 2

    def test_empty_board_refused(self, tmp_path) -> None:
        # journal with only non-text elements → no segments → ValueError
        p = _write_lesson(
            tmp_path,
            _events({"t": 1000, "type": "element.add",
                     "element": {"id": "r", "type": "rectangle", "version": 1}}),
            session="audioConsent: false\n",
        )
        store = SQLiteStore(":memory:")
        router = Router()
        router.register(MockProvider({}))
        with pytest.raises(ValueError, match="no whiteboard text"):
            ingest_bundle(p, store, L, router=router, provider="mock")


# ── M1-4c test #3: re-export fewer elements ───────────────────────────


class TestReexportFewerElements:
    """Bug-hunt §4 test #3: re-ingest a bundle with FEWER whiteboard text
    elements — old segments MUST be purged before re-ingest, and the
    new capsule must not cite v1-only text.

    Relies on the bug-hunt #6 fix: ``ingest_bundle`` calls
    ``delete_segments_for_lesson`` before re-saving segments.
    """

    def test_same_store_ingest_fewer_segments(self, tmp_path) -> None:
        """Re-ingest in the SAME store: old segments purged, new count=7."""
        def _write_bundle(texts: tuple[str, ...]) -> str:
            evs = "\n".join(
                json.dumps({"t": 1000 + i, "type": "element.add",
                            "element": {"id": f"t{i}", "type": "text",
                                        "text": t, "version": 1}})
                for i, t in enumerate(texts)
            )
            return _write_lesson(tmp_path, evs, session="audioConsent: false\n")

        # Run 1: 10 elements → generate proper prompts
        v1_texts = tuple(f"V1 element {i}" for i in range(10))
        p1 = _write_bundle(v1_texts)
        segs1 = journal_to_segments(_events(
            *[{"t": 1000 + i, "type": "element.add",
               "element": {"id": f"t{i}", "type": "text",
                           "text": t, "version": 1}}
              for i, t in enumerate(v1_texts)]
        ), L)
        tmp1 = SQLiteStore(":memory:")
        for s in segs1:
            tmp1.save_segment(s)
        seg_key1 = build_segmentation_prompt(tmp1.segments_for_lesson(L))
        ext_key1 = build_extraction_prompt(tmp1.segments_for_lesson(L))
        seg_json1 = json.dumps([
            {"topic": "t", "seg_ids": [f"{L}#s{i}" for i in range(1, 11)]},
        ])
        ext_json1 = json.dumps({
            "concepts": [
                {"name": "X", "status": "introduced",
                 "citations": [{"seg_id": f"{L}#s1", "excerpt": v1_texts[0]}]},
            ],
            "exercises": [], "student_questions": [], "homework": [],
        })
        router1 = Router()
        router1.register(MockProvider({seg_key1: seg_json1, ext_key1: ext_json1}))
        store = SQLiteStore(":memory:")
        ingest_bundle(p1, store, L, router=router1, provider="mock")
        assert len(store.segments_for_lesson(L)) == 10

        # Run 2: 7 elements, SAME store
        v2_texts = tuple(f"V2 element {i}" for i in range(7))
        p2 = _write_bundle(v2_texts)
        segs2 = journal_to_segments(_events(
            *[{"t": 1000 + i, "type": "element.add",
               "element": {"id": f"t{i}", "type": "text",
                           "text": t, "version": 1}}
              for i, t in enumerate(v2_texts)]
        ), L)
        tmp2 = SQLiteStore(":memory:")
        for s in segs2:
            tmp2.save_segment(s)
        seg_key2 = build_segmentation_prompt(tmp2.segments_for_lesson(L))
        ext_key2 = build_extraction_prompt(tmp2.segments_for_lesson(L))
        seg_json2 = json.dumps([
            {"topic": "t", "seg_ids": [f"{L}#s{i}" for i in range(1, 8)]},
        ])
        ext_json2 = json.dumps({
            "concepts": [
                {"name": "Y", "status": "introduced",
                 "citations": [{"seg_id": f"{L}#s1", "excerpt": v2_texts[0]}]},
            ],
            "exercises": [], "student_questions": [], "homework": [],
        })
        router2 = Router()
        router2.register(MockProvider({seg_key2: seg_json2, ext_key2: ext_json2}))

        segments, capsule = ingest_bundle(
            p2, store, L, router=router2, provider="mock")

        assert len(segments) == 7
        assert len(store.segments_for_lesson(L)) == 7
        store.close()
        tmp1.close()
        tmp2.close()


# ── D2-J1: canonical Studio bundles (manifest.json + v2 journal) ──────

ML = "lezione-moderna"
MSESSION = "11111111-1111-4111-8111-111111111111"

_V2_PRODUCER = {
    "id": "com.github.andreamarro.ardesia.studio",
    "version": "0.0.0",
    "commitSha": "a" * 40,
}


def _v2_envelope(lesson_id: str, session_id: str, kind: str, occurred_at: str,
                 payload: dict, seq: int) -> dict:
    return {
        "schemaVersion": 2,
        "eventId": f"70000000-0000-4000-8000-{seq:012d}",
        "lessonId": lesson_id,
        "sessionId": session_id,
        "kind": kind,
        "occurredAt": occurred_at,
        "actor": {"type": "teacher", "id": "founder-beta-teacher"},
        "producer": dict(_V2_PRODUCER),
        "causationId": None,
        "idempotencyKey": f"d2j1:{seq}",
        "evidence": [{"ref": f"lesson:{lesson_id}@{seq}", "resolution": "verified"}],
        "payload": payload,
    }


def _v2_add(lesson_id: str, eid: str, text: str, occurred_at: str,
            seq: int, session_id: str = MSESSION) -> dict:
    return _v2_envelope(lesson_id, session_id, "journal.element.add", occurred_at,
                        {"element": {"id": eid, "type": "text", "text": text}}, seq)


def _v2_update(lesson_id: str, eid: str, text: str, occurred_at: str,
               seq: int, session_id: str = MSESSION) -> dict:
    return _v2_envelope(lesson_id, session_id, "journal.element.update", occurred_at,
                        {"element": {"id": eid, "type": "text", "text": text}}, seq)


def _v2_delete(lesson_id: str, eid: str, occurred_at: str,
               seq: int, session_id: str = MSESSION) -> dict:
    return _v2_envelope(lesson_id, session_id, "journal.element.delete", occurred_at,
                        {"elementId": eid}, seq)


def _modern_manifest(lesson_id: str, files: dict[str, bytes], **overrides) -> str:
    """Manifest shaped like Studio buildLessonBundleManifest (v1)."""
    doc: dict = {
        "bundleVersion": 1,
        "schemaVersion": 1,
        "lessonId": lesson_id,
        "sessionIds": [MSESSION],
        "producer": dict(_V2_PRODUCER),
        "requiredArtifacts": ["raw/board.excalidraw", "raw/events.jsonl", "raw/session.yaml"],
        "optionalArtifacts": ["raw/lessonos-events.jsonl", "raw/audio/*"],
        "files": [
            {"path": path,
             "bytes": len(payload),
             "sha256": hashlib.sha256(payload).hexdigest(),
             "required": path in ("raw/board.excalidraw", "raw/events.jsonl", "raw/session.yaml")}
            for path, payload in sorted(files.items())
        ],
        "lessonOs": {"status": "missing", "warnings": []},
        "compatibility": {"minimumReaderSchemaVersion": 1, "migrations": []},
    }
    doc.update(overrides)
    return json.dumps(doc)


def _modern_files(events_jsonl: str) -> dict[str, bytes]:
    return {
        "raw/board.excalidraw": b"{}",
        "raw/events.jsonl": events_jsonl.encode("utf-8"),
        "raw/session.yaml": b"audioConsent: false\n",
    }


class TestModernManifest:
    def test_t1_root_manifest_accepted(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                          session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files))
        c = read_bundle(p)
        assert c.manifest is not None
        assert c.manifest["lessonId"] == ML
        assert "element.add" in c.events_jsonl

    def test_t2_unexpected_root_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                          session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files),
                          extra={"evil.txt": "pwned"})
        with pytest.raises(ValueError, match="unsafe"):
            read_bundle(p)

    def test_t3_traversal_rejected(self, tmp_path) -> None:
        for bad in ("../foo.lesson", "/abs/path.lesson"):
            p = tmp_path / "x.lesson"
            with zipfile.ZipFile(p, "w") as zf:
                zf.writestr("raw/events.jsonl", "{}")
                zf.writestr(bad, "pwned")
            with pytest.raises(ValueError, match="unsafe"):
                read_bundle(str(p))

    def test_t4_unsupported_version_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        for field, value in (("bundleVersion", 2), ("schemaVersion", 2)):
            p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                              session="audioConsent: false\n",
                              manifest=_modern_manifest(ML, files, **{field: value}))
            with pytest.raises(ValueError, match="unsupported manifest"):
                read_bundle(p)

    def test_t5_manifest_requested_identity_mismatch_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                          session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files))
        store = SQLiteStore(":memory:")
        router = Router()
        router.register(MockProvider({}))
        with pytest.raises(ValueError, match="does not match requested lesson"):
            ingest_bundle(p, store, "altra-lezione", router=router, provider="mock")

    def test_t6_legacy_manifest_less_preserved(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: false\n")
        c = read_bundle(p)
        assert c.manifest is None
        assert "element.add" in c.events_jsonl

    def test_manifest_hash_mismatch_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        tampered = dict(files)
        # Stessa lunghezza (i bytes coincidono), contenuto diverso: solo lo
        # SHA-256 puo' accorgersene.
        tampered["raw/events.jsonl"] = _events(_text_add(1000, "a", "y")).encode("utf-8")
        p = tmp_path / "tampered.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("manifest.json", _modern_manifest(ML, files))
            for path, payload in tampered.items():
                zf.writestr(path, payload)
        with pytest.raises(ValueError, match="SHA-256 mismatch"):
            read_bundle(str(p))


class TestV2Journal:
    def test_t7_v2_add_extracts_text(self) -> None:
        ev = _events(
            _v2_add(ML, "a", "Definizione sintetica", "2026-08-01T00:00:01.000Z", 1),
            _v2_add(ML, "b", "Energia sintetica", "2026-08-01T00:00:02.000Z", 2),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.seg_id for s in segs] == [f"{ML}#s1", f"{ML}#s2"]
        assert [s.text for s in segs] == ["Definizione sintetica", "Energia sintetica"]
        assert segs[0].start == 0
        assert segs[1].start == 1

    def test_t8_v2_update_last_wins(self) -> None:
        ev = _events(
            _v2_add(ML, "a", "Bozza", "2026-08-01T00:00:01.000Z", 1),
            _v2_update(ML, "a", "Versione finale", "2026-08-01T00:00:03.000Z", 2),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["Versione finale"]
        assert segs[0].end == 2

    def test_t9_v2_delete_readd_resurrects(self) -> None:
        ev = _events(
            _v2_add(ML, "a", "originale", "2026-08-01T00:00:01.000Z", 1),
            _v2_delete(ML, "a", "2026-08-01T00:00:02.000Z", 2),
            _v2_add(ML, "a", "ripristinato", "2026-08-01T00:00:05.000Z", 3),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["ripristinato"]
        assert segs[0].start == 4

    def test_t10_v2_lesson_mismatch_rejected(self) -> None:
        ev = _events(
            _v2_add("altra-lezione", "a", "testo altrui", "2026-08-01T00:00:01.000Z", 1),
        )
        with pytest.raises(ValueError, match="does not match bundle lesson"):
            journal_to_segments(ev, ML)

    def test_t10b_manifest_journal_identity_mismatch_rejected(self, tmp_path) -> None:
        ev = _events(
            _v2_add("altra-lezione", "a", "testo altrui", "2026-08-01T00:00:01.000Z", 1),
        )
        files = _modern_files(ev)
        p = _write_lesson(tmp_path, ev, session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files))
        store = SQLiteStore(":memory:")
        router = Router()
        router.register(MockProvider({}))
        with pytest.raises(ValueError, match="does not match bundle lesson"):
            ingest_bundle(p, store, ML, router=router, provider="mock")

    def test_v2_other_kinds_ignored(self) -> None:
        ev = _events(
            _v2_envelope(ML, MSESSION, "journal.pointer.down", "2026-08-01T00:00:01.000Z", {}, 1),
            _v2_envelope(ML, MSESSION, "journal.math.insert", "2026-08-01T00:00:02.000Z",
                         {"latex": "x"}, 2),
            _v2_add(ML, "a", "solo testo", "2026-08-01T00:00:03.000Z", 3),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["solo testo"]

    def test_v2_corrupt_envelope_rejected_not_skipped(self) -> None:
        bad = _v2_add(ML, "a", "x", "2026-08-01T00:00:01.000Z", 1)
        del bad["payload"]["element"]
        with pytest.raises(ValueError, match="malformed element"):
            journal_to_segments(_events(bad), ML)

    def test_legacy_lines_still_supported_alongside_v2(self) -> None:
        ev = _events(
            _text_add(1000, "a", "legacy"),
            _v2_add(ML, "b", "moderno", "2026-08-01T00:00:02.000Z", 1),
        )
        segs = journal_to_segments(ev, ML)
        assert sorted(s.text for s in segs) == ["legacy", "moderno"]


class TestModernEndToEnd:
    def test_t11_manifest_v2_end_to_end(self, tmp_path) -> None:
        ev = _events(
            _v2_add(ML, "a", "Definizione sintetica di segnale", "2026-08-01T00:00:01.000Z", 1),
            _v2_add(ML, "b", "Energia sintetica di un segnale", "2026-08-01T00:00:05.000Z", 2),
            _v2_add(ML, "c", "Esercizio sintetico", "2026-08-01T00:00:09.000Z", 3),
        )
        files = _modern_files(ev)
        p = _write_lesson(tmp_path, ev, session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files))
        segs = journal_to_segments(ev, ML)
        tmp = SQLiteStore(":memory:")
        for s in segs:
            tmp.save_segment(s)
        seg_prompt = build_segmentation_prompt(tmp.segments_for_lesson(ML))
        ext_prompt = build_extraction_prompt(tmp.segments_for_lesson(ML))
        router = Router()
        router.register(MockProvider({
            seg_prompt: json.dumps([{"topic": "t", "seg_ids": [f"{ML}#s1", f"{ML}#s2", f"{ML}#s3"]}]),
            ext_prompt: json.dumps({
                "concepts": [
                    {"name": "segnale", "status": "introduced",
                     "citations": [{"seg_id": f"{ML}#s1", "excerpt": "Definizione sintetica di segnale"}]},
                ],
                "exercises": [], "student_questions": [], "homework": [],
            }),
        }))
        store = SQLiteStore(":memory:")
        segments, capsule = ingest_bundle(p, store, ML, router=router, provider="mock")
        assert [s.seg_id for s in segments] == [f"{ML}#s{i}" for i in (1, 2, 3)]
        assert capsule.lesson_id == ML
        assert {c.name for c in capsule.content.concepts} == {"segnale"}
        store.close()
        tmp.close()


# ── D2-J1.1 hardening ─────────────────────────────────────────────────


class TestManifestInventoryBijection:
    def test_f1_unlisted_payload_rejected(self, tmp_path) -> None:
        """raw/events.jsonl nello ZIP ma assente da manifest.files[]: il
        journal verrebbe letto senza verifica bytes/sha256."""
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        declared = {k: v for k, v in files.items() if k != "raw/events.jsonl"}
        p = tmp_path / "unlisted.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("manifest.json", _modern_manifest(ML, declared))
            for path, payload in files.items():
                zf.writestr(path, payload)
        with pytest.raises(ValueError, match="inventory"):
            read_bundle(str(p))

    def test_f1_extra_unlisted_member_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = tmp_path / "extra.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("manifest.json", _modern_manifest(ML, files))
            for path, payload in files.items():
                zf.writestr(path, payload)
            zf.writestr("raw/extra.bin", b"unlisted")
        with pytest.raises(ValueError, match="inventory"):
            read_bundle(str(p))

    def test_f1_manifest_entry_without_payload_rejected(self, tmp_path) -> None:
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = tmp_path / "ghost.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("manifest.json", _modern_manifest(ML, files))
            for path, payload in files.items():
                if path == "raw/session.yaml":
                    continue
                zf.writestr(path, payload)
        with pytest.raises(ValueError, match="inventory|absent|missing"):
            read_bundle(str(p))

    def test_failed_reingest_keeps_capsule_consistent(self, tmp_path) -> None:
        """Round 1 ok, round 2 raises in assembly: capsule citations must
        still resolve verbatim against persisted segments."""
        def _bundle(text: str) -> str:
            # _write_lesson riusa lo stesso path: round sequenziali, mai
            # concorrenti — il secondo write avviene dopo il primo ingest.
            ev = _events(_text_add(1000, "a", text))
            return _write_lesson(tmp_path, ev, session="audioConsent: false\n")

        p1 = _bundle("Testo stabile v1")
        segs = journal_to_segments(
            _events(_text_add(1000, "a", "Testo stabile v1")), ML)
        tmp = SQLiteStore(":memory:")
        for s in segs:
            tmp.save_segment(s)
        router_ok = Router()
        router_ok.register(MockProvider({
            build_segmentation_prompt(tmp.segments_for_lesson(ML)): json.dumps(
                [{"topic": "t", "seg_ids": [f"{ML}#s1"]}]),
            build_extraction_prompt(tmp.segments_for_lesson(ML)): json.dumps({
                "concepts": [{
                    "name": "c", "status": "introduced",
                    "citations": [{"seg_id": f"{ML}#s1",
                                   "excerpt": "Testo stabile v1"}],
                }],
                "exercises": [], "student_questions": [], "homework": [],
            }),
        }))
        store = SQLiteStore(":memory:")
        ingest_bundle(p1, store, ML, router=router_ok, provider="mock")

        p2 = _bundle("Testo NUOVO v2")
        router_ko = Router()
        router_ko.register(MockProvider({}))
        with pytest.raises(Exception):
            ingest_bundle(p2, store, ML, router=router_ko, provider="mock")

        texts = [s.text for s in store.segments_for_lesson(ML)]
        excerpts = [
            cite.excerpt
            for concept in load_capsule(store, ML).content.concepts
            for cite in concept.citations
        ]
        for excerpt in excerpts:
            assert any(excerpt in text for text in texts), (
                "stale capsule cites text absent from persisted segments")
        store.close()
        tmp.close()

    @pytest.mark.parametrize("bad_version", [True, 1.0, "1", None])
    def test_f5_manifest_versions_are_strict_ints(self, tmp_path, bad_version) -> None:
        """bundleVersion/schemaVersion: True == 1 in Python, ma il contratto
        Studio richiede l'intero esatto: true/1.0/"1"/null → reject."""
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        for field in ("bundleVersion", "schemaVersion"):
            p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                              session="audioConsent: false\n",
                              manifest=_modern_manifest(ML, files, **{field: bad_version}))
            with pytest.raises(ValueError, match="unsupported manifest|version"):
                read_bundle(p)

    def test_f8_non_object_journal_row_rejected_explicitly(self) -> None:
        """Riga JSON valida ma non-oggetto: ValueError chiaro, mai AttributeError opaco."""
        with pytest.raises(ValueError, match="not a JSON object"):
            journal_to_segments(_events(5, "x", [1]), ML)

    def test_f9_v2_element_without_id_rejected(self) -> None:
        row = _v2_add(ML, "a", "x", "2026-08-01T00:00:01.000Z", 1)
        del row["payload"]["element"]["id"]
        with pytest.raises(ValueError, match="without id"):
            journal_to_segments(_events(row), ML)


class TestDuplicateMembers:
    @pytest.mark.parametrize("dup", [
        "manifest.json", "raw/events.jsonl", "raw/session.yaml",
    ])
    def test_f2_duplicate_file_member_rejected(self, tmp_path, dup: str) -> None:
        """zipfile e' last-wins sui duplicati; Studio li rifiuta: anche qui."""
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = tmp_path / "dup.lesson"
        with zipfile.ZipFile(p, "w") as zf:
            zf.writestr("manifest.json", _modern_manifest(ML, files))
            for path, payload in files.items():
                zf.writestr(path, payload)
            extra = b"{}" if dup == "manifest.json" else files.get(dup, b"x")
            zf.writestr(dup, extra)
        with pytest.raises(ValueError, match="[Dd]uplicate"):
            read_bundle(str(p))


class TestV2HintDetection:
    def test_f3_v2_like_without_schema_version_rejected(self) -> None:
        """kind+lessonId+occurredAt+payload senza schemaVersion: sembra v2,
        quindi va validato come v2 — mai ricadere nel legacy silenzioso."""
        row = {
            "kind": "journal.element.add",
            "lessonId": ML,
            "occurredAt": "2026-08-01T00:00:01.000Z",
            "payload": {"element": {"id": "a", "type": "text", "text": "x"}},
        }
        with pytest.raises(ValueError, match="v2|schemaVersion|envelope"):
            journal_to_segments(_events(row), ML)

    def test_f3_v2_unsupported_schema_version_rejected(self) -> None:
        row = dict(_v2_add(ML, "a", "x", "2026-08-01T00:00:01.000Z", 1))
        row["schemaVersion"] = 3
        with pytest.raises(ValueError, match="schemaVersion"):
            journal_to_segments(_events(row), ML)

    def test_pure_legacy_without_v2_hints_still_ignored(self) -> None:
        """Legacy puro {t,type} senza hint v2: contratto storico invariato."""
        ev = _events(
            {"t": 1000, "type": "unknown.future.kind"},
            _text_add(2000, "a", "reale"),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["reale"]


class TestTemporalBaseline:
    def test_f4_pointer_before_element_legacy(self) -> None:
        """pointer @0s, add @60s: la baseline e' di TUTTI gli eventi (60)."""
        ev = _events(
            {"t": 0, "type": "t0"},
            _text_add(60_000, "a", "testo"),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["testo"]
        assert segs[0].start == 60

    def test_f4_pointer_before_element_v2(self) -> None:
        """Stesso caso in v2: il pointer non-element contribuisce a t0."""
        ev = _events(
            _v2_envelope(ML, MSESSION, "journal.pointer.down", "2026-08-01T00:00:00.000Z", {}, 1),
            _v2_add(ML, "a", "testo", "2026-08-01T00:01:00.000Z", 2),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["testo"]
        assert segs[0].start == 60

    def test_f4_out_of_order_update_before_add(self) -> None:
        """update@60 visto prima di add@30: start=min, end=max, per formato.
        Tempi relativi a t0=30: (0, 30)."""
        legacy = _events(
            {"t": 60_000, "type": "element.update",
             "element": {"id": "a", "type": "text", "text": "finale"}},
            _text_add(30_000, "a", "bozza"),
        )
        segs = journal_to_segments(legacy, ML)
        assert [s.text for s in segs] == ["finale"]
        assert (segs[0].start, segs[0].end) == (0, 30)

        v2 = _events(
            _v2_update(ML, "a", "finale", "2026-08-01T00:01:00.000Z", 1),
            _v2_add(ML, "a", "bozza", "2026-08-01T00:00:30.000Z", 2),
        )
        segs = journal_to_segments(v2, ML)
        assert [s.text for s in segs] == ["finale"]
        assert (segs[0].start, segs[0].end) == (0, 30)

    def test_f4_delete_readd_resets_life(self) -> None:
        """delete→re-add resta una vita nuova anche fuori ordine apparente
        (relativo a t0=10: (40, 40))."""
        ev = _events(
            _text_add(10_000, "a", "vecchio"),
            {"t": 20_000, "type": "element.delete", "elementId": "a"},
            _text_add(50_000, "a", "nuovo"),
        )
        segs = journal_to_segments(ev, ML)
        assert [s.text for s in segs] == ["nuovo"]
        assert (segs[0].start, segs[0].end) == (40, 40)


class TestLessonOsSnapshotSurfaced:
    def test_snapshot_bytes_surfaced_when_present(self, tmp_path) -> None:
        """raw/lessonos-events.jsonl presente → bytes disponibili, non consumati qui."""
        snap = (
            '{"seq": 1, "schemaVersion": 2, "kind": "lesson.started"}\n'
        )
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        files["raw/lessonos-events.jsonl"] = snap.encode("utf-8")
        p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                          session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files),
                          extra={"raw/lessonos-events.jsonl": snap})
        c = read_bundle(p)
        assert c.lessonos_events_jsonl == snap

    def test_snapshot_absent_is_none_not_empty(self, tmp_path) -> None:
        """Assente != presente-vuoto: None, mai stringa vuota ambigua."""
        files = _modern_files(_events(_text_add(1000, "a", "x")))
        p = _write_lesson(tmp_path, files["raw/events.jsonl"].decode("utf-8"),
                          session="audioConsent: false\n",
                          manifest=_modern_manifest(ML, files))
        c = read_bundle(p)
        assert c.lessonos_events_jsonl is None

    def test_legacy_bundle_has_no_snapshot(self, tmp_path) -> None:
        p = _write_lesson(tmp_path, _events(_text_add(1000, "a", "x")),
                          session="audioConsent: false\n")
        c = read_bundle(p)
        assert c.manifest is None
        assert c.lessonos_events_jsonl is None
