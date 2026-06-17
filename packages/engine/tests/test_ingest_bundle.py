"""Tests for T8 — GIUNTO ingest-bundle (studio .lesson → engine).

Covers the security guards (ZipSlip, revoked-audio GDPR), the whiteboard-text →
Segment extraction (ordering, 1-indexed, relative time, delete/empty handling),
and the end-to-end orchestration into the existing capsule pipeline (mock LLM).
"""

from __future__ import annotations

import json
import zipfile

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
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
                  audio: tuple[str, ...] = (), extra: dict | None = None):
    """Write a synthetic .lesson zip and return its path."""
    p = tmp_path / "lesson.lesson"
    with zipfile.ZipFile(p, "w") as zf:
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
