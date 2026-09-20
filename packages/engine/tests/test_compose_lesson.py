"""Tests for lessonos/compose — D2-J3C-HARDENING H1/H2 composition root.

Single explicit use case reusing the real entry points:

    bundle file -> read_bundle (validated once) -> digest projected +
    validated BEFORE any store write or router call -> ingest_bundle ->
    generate_lesson_summary(digest=...) -> LessonMaterial (inspectable)

PDF stays an explicit caller-side step (fake subprocess here). No real
LLM, no network, no corpus, no .env. All fixtures synthetic.
"""

from __future__ import annotations

import json
import os
import zipfile
from pathlib import Path

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.compose import LessonMaterial, compose_lesson_material
from lessonos.ingest.bundle import journal_to_segments, read_bundle
from lessonos.llm.router import MockProvider, Router
from lessonos.store.sqlite import SQLiteStore
from lessonos.summarizer import _build_summary_prompt, _cited_seg_texts

L = "vertical-prova"
S = "22222222-2222-4222-8222-222222222222"

SEG_TEXTS = (
    "La derivata \u00e8 il tasso di variazione istantanea.",
    "Il rapporto incrementale al limite definisce la derivata prima.",
    "Regola della potenza per x^n e codice ```x = 1```.",
)


def _journal() -> str:
    evs = [
        {"t": 1000, "type": "element.add",
         "element": {"id": "a", "type": "text", "text": SEG_TEXTS[0], "version": 1}},
        {"t": 2000, "type": "element.add",
         "element": {"id": "b", "type": "text", "text": SEG_TEXTS[1], "version": 1}},
        {"t": 3000, "type": "element.add",
         "element": {"id": "c", "type": "text", "text": SEG_TEXTS[2], "version": 1}},
    ]
    return "\n".join(json.dumps(e) for e in evs)


_n = 0


def _env(kind: str, payload: dict, lesson_id: str = L) -> dict:
    global _n
    _n += 1
    return {
        "seq": _n, "schemaVersion": 2,
        "eventId": f"80000000-0000-4000-8000-{_n:012d}",
        "lessonId": lesson_id, "sessionId": S, "kind": kind,
        "occurredAt": "2026-09-19T10:00:00Z",
        "actor": {"type": "teacher", "id": "synthetic-teacher"},
        "producer": {"id": "test", "version": "0.0.0", "commitSha": "b" * 40},
        "causationId": None, "idempotencyKey": f"vert:{_n}",
        "evidence": [{"ref": f"lesson:{lesson_id}@{_n}", "resolution": "verified"}],
        "payload": payload,
    }


def _snapshot_same_lesson() -> str:
    rows = [
        _env("concept.introduced",
             {"conceptId": "ck:potenza", "labels": {"it": "Regola registrata LessonOS"}}),
        _env("error.observed",
             {"errorId": "err:aperto", "conceptId": "ck:potenza",
              "labels": {"it": "Limite non impostato"}}),
        _env("error.observed",
             {"errorId": "err:chiuso", "conceptId": "ck:potenza",
              "labels": {"it": "Potenza confusa"}}),
        _env("exercise.completed",
             {"exerciseId": "ex:1", "correctsErrorId": "err:chiuso",
              "labels": {"it": "Esercizio correttivo"}}),
    ]
    for r in rows:
        r["evidence"] = [{"ref": "manual:verticale:p3", "resolution": "verified"}]
    return "\n".join(json.dumps(r) for r in rows)


def _write_bundle(path: Path, journal: str, snapshot: str | None) -> str:
    """Legacy manifest-less bundle (explicitly supported path)."""
    with zipfile.ZipFile(path, "w") as zf:
        zf.writestr("raw/events.jsonl", journal)
        if snapshot is not None:
            zf.writestr("raw/lessonos-events.jsonl", snapshot)
        zf.writestr("raw/board.excalidraw", "{}")
    return str(path)


def _write_manifest_bundle(path: Path, journal: str, snapshot: str | None) -> str:
    """Modern manifest bundle with exact file inventory (bijection)."""
    import hashlib

    members: dict[str, bytes] = {
        "raw/board.excalidraw": b"{}",
        "raw/events.jsonl": journal.encode("utf-8"),
        "raw/session.yaml": b"audioConsent: false\n",
    }
    if snapshot is not None:
        members["raw/lessonos-events.jsonl"] = snapshot.encode("utf-8")
    manifest = {
        "bundleVersion": 1,
        "schemaVersion": 1,
        "lessonId": L,
        "files": [
            {"path": name, "bytes": len(payload),
             "sha256": hashlib.sha256(payload).hexdigest()}
            for name, payload in sorted(members.items())
        ],
    }
    with zipfile.ZipFile(path, "w") as zf:
        zf.writestr("manifest.json", json.dumps(manifest))
        for name, payload in members.items():
            zf.writestr(name, payload)
    return str(path)


def _seg_response(seg_ids: list[str]) -> list[dict]:
    return [{"topic": "derivate", "seg_ids": seg_ids}]


def _ext_response() -> dict:
    return {
        "concepts": [{
            "name": "derivata", "status": "introduced", "prerequisites": [],
            "citations": [{"seg_id": f"{L}#s1", "excerpt": "tasso di variazione"}],
        }],
        "exercises": [
            {"prompt": "Calcola la derivata.",
             "solution": "2x, dal rapporto incrementale.",
             "citations": [{"seg_id": f"{L}#s2", "excerpt": "rapporto incrementale"}]},
            {"prompt": "Esercizio fantasma.",
             "solution": "Mai esistita.",
             "citations": [{"seg_id": f"{L}#s999", "excerpt": "mai"}]},
        ],
        "student_questions": [],
        "homework": [],
    }


def _summary_response() -> dict:
    return {"sections": [
        {"heading": "Sintesi", "paragraphs": [
            {"text": "La derivata \u00e8 il tasso di variazione istantanea.",
             "citations": [{"seg_id": f"{L}#s1", "excerpt": "tasso di variazione"}]},
            {"text": "Il rapporto incrementale al limite definisce la derivata prima.",
             "citations": [{"seg_id": f"{L}#s2", "excerpt": "rapporto incrementale"}]},
        ]},
        {"heading": "Chiave", "paragraphs": [
            {"text": "Vedi [manuale](https://example.com/p) e codice ```x = 1```.",
             "citations": [{"seg_id": f"{L}#s3", "excerpt": "codice"}]},
        ]},
    ]}


def _full_router(bundle_path: str) -> Router:
    """Exact-prompt MockProvider built from the real builders (no ordering)."""
    contents = read_bundle(bundle_path)
    segments = journal_to_segments(contents.events_jsonl, L)
    seg_prompt = build_segmentation_prompt(segments)
    ext_prompt = build_extraction_prompt(segments)
    phase1 = Router()
    phase1.register(MockProvider({
        seg_prompt: json.dumps(_seg_response([s.seg_id for s in segments])),
        ext_prompt: json.dumps(_ext_response()),
    }))
    from lessonos.capsule.assembly import assemble_lesson_capsule
    tmp_store = SQLiteStore(":memory:")
    for seg in segments:
        tmp_store.save_segment(seg)
    capsule = assemble_lesson_capsule(
        tmp_store, L, phase1, provider="mock", defensive=True)
    summ_prompt = _build_summary_prompt(capsule, _cited_seg_texts(tmp_store, capsule))
    router = Router()
    router.register(MockProvider({
        seg_prompt: json.dumps(_seg_response([s.seg_id for s in segments])),
        ext_prompt: json.dumps(_ext_response()),
        summ_prompt: json.dumps(_summary_response()),
    }))
    tmp_store.close()
    return router


class _StrictCountingProvider:
    """Test double: counts router calls, refuses every completion."""

    name = "mock"

    def __init__(self) -> None:
        self.calls = 0

    def complete(self, prompt: str, *, model: str | None = None):
        self.calls += 1
        raise KeyError("no fixture: composition must fail before the router")


# ── H1: composition root ──────────────────────────────────────────────


class TestComposeContract:
    def test_same_acquisition_summary_has_digest_errors(
        self, tmp_path: Path
    ) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), _snapshot_same_lesson())
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            bundle, L, store=store, router=_full_router(bundle), provider="mock")
        assert isinstance(material, LessonMaterial)
        md = material.pack.files[f"{L}.md"]
        assert "Limite non impostato" in md and "da rivedere" in md
        assert "Potenza confusa" in md and "corretto" in md
        assert "Provenienza: manual:verticale:p3" in md
        assert material.digest is not None and material.digest.lesson_id == L
        store.close()

    def test_absent_snapshot_gives_none_digest(self, tmp_path: Path) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), None)
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            bundle, L, store=store, router=_full_router(bundle), provider="mock")
        assert material.digest is None
        store.close()

    def test_empty_snapshot_gives_empty_digest_not_none(self, tmp_path: Path) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), "")
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            bundle, L, store=store, router=_full_router(bundle), provider="mock")
        assert material.digest is not None
        assert material.digest.errors == () and material.digest.concepts == ()
        store.close()

    def test_foreign_digest_rejected_before_router_and_writes(
        self, tmp_path: Path
    ) -> None:
        foreign = _snapshot_same_lesson().replace(f'"lessonId": "{L}"', '"lessonId": "altra"')
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), foreign)
        store = SQLiteStore(":memory:")
        spy = _StrictCountingProvider()
        router = Router()
        router.register(spy)
        with pytest.raises(ValueError, match="does not match"):
            compose_lesson_material(bundle, L, store=store, router=router, provider="mock")
        assert spy.calls == 0
        assert store.segments_for_lesson(L) == ()
        store.close()

    def test_malformed_snapshot_rejected_before_writes(self, tmp_path: Path) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), "not json\n")
        store = SQLiteStore(":memory:")
        spy = _StrictCountingProvider()
        router = Router()
        router.register(spy)
        with pytest.raises(ValueError):
            compose_lesson_material(bundle, L, store=store, router=router, provider="mock")
        assert spy.calls == 0
        assert store.segments_for_lesson(L) == ()
        store.close()

    def test_missing_bundle_is_file_not_found(self, tmp_path: Path) -> None:
        store = SQLiteStore(":memory:")
        with pytest.raises(FileNotFoundError):
            compose_lesson_material(
                str(tmp_path / "assente.lesson"), L,
                store=store, router=Router(), provider="mock")
        store.close()

    def test_relative_path_with_spaces_from_other_cwd(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        spaced = tmp_path / "dir con spazi"
        spaced.mkdir()
        bundle = _write_bundle(spaced / "lez uno.lesson", _journal(), _snapshot_same_lesson())
        rel = os.path.relpath(bundle, tmp_path)
        monkeypatch.chdir(tmp_path)
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            rel, L, store=store, router=_full_router(bundle), provider="mock")
        assert f"{L}.md" in material.pack.files
        store.close()

    def test_lesson_id_mismatch_rejected(self, tmp_path: Path) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), _snapshot_same_lesson())
        store = SQLiteStore(":memory:")
        with pytest.raises(ValueError):
            compose_lesson_material(
                bundle, "altra-lezione", store=store,
                router=_full_router(bundle), provider="mock")
        store.close()

    def test_manifest_identity_enforced(self, tmp_path: Path) -> None:
        bundle = _write_manifest_bundle(
            tmp_path / "lez.lesson", _journal(), _snapshot_same_lesson())
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            bundle, L, store=store, router=_full_router(bundle), provider="mock")
        assert f"{L}.md" in material.pack.files
        with pytest.raises(ValueError):
            compose_lesson_material(
                bundle, "altra-lezione", store=store,
                router=_full_router(bundle), provider="mock")
        store.close()


def _variant_journal(marker: str) -> str:
    evs = [
        {"t": 1000, "type": "element.add",
         "element": {"id": "a", "type": "text", "text": f"{marker} uno.", "version": 1}},
        {"t": 2000, "type": "element.add",
         "element": {"id": "b", "type": "text", "text": f"{marker} due.", "version": 1}},
        {"t": 3000, "type": "element.add",
         "element": {"id": "c", "type": "text", "text": f"{marker} tre.", "version": 1}},
    ]
    return "\n".join(json.dumps(e) for e in evs)


def _variant_snapshot(marker: str, error_label: str) -> str:
    rows = [
        _env("concept.introduced",
             {"conceptId": "ck:x", "labels": {"it": f"Concetto {marker}"}}),
        _env("error.observed",
             {"errorId": "err:x", "conceptId": "ck:x",
              "labels": {"it": error_label}}),
    ]
    for r in rows:
        r["evidence"] = [{"ref": "board:vert", "resolution": "verified"}]
    return "\n".join(json.dumps(r) for r in rows)


def _variant_fixtures(bundle_path: str, marker: str) -> dict:
    """Exact-prompt fixtures for one bundle variant (order-independent)."""
    from lessonos.capsule.assembly import assemble_lesson_capsule

    contents = read_bundle(bundle_path)
    segments = journal_to_segments(contents.events_jsonl, L)
    ids = [s.seg_id for s in segments]
    seg_prompt = build_segmentation_prompt(segments)
    ext_prompt = build_extraction_prompt(segments)
    seg_r = json.dumps([{"topic": "t", "seg_ids": ids}])
    ext_r = json.dumps({
        "concepts": [{"name": f"concetto-{marker}", "status": "introduced",
                      "prerequisites": [],
                      "citations": [{"seg_id": ids[0], "excerpt": f"{marker} uno"}]}],
        "exercises": [], "student_questions": [], "homework": []})
    tmp = SQLiteStore(":memory:")
    for seg in segments:
        tmp.save_segment(seg)
    p1 = Router()
    p1.register(MockProvider({seg_prompt: seg_r, ext_prompt: ext_r}))
    capsule = assemble_lesson_capsule(tmp, L, p1, provider="mock")
    summ_prompt = _build_summary_prompt(capsule, _cited_seg_texts(tmp, capsule))
    summ_r = json.dumps({"sections": [{"heading": "S", "paragraphs": [
        {"text": f"{marker} uno.",
         "citations": [{"seg_id": ids[0], "excerpt": f"{marker} uno"}]}]}]})
    tmp.close()
    return {seg_prompt: seg_r, ext_prompt: ext_r, summ_prompt: summ_r}


class TestSingleAcquisition:
    """R1: the bundle must be acquired exactly once (TOCTOU).

    Bundle A and B share identity but differ in content. A swap planted
    after the first validated acquisition must be unobservable: digest
    facts and segments must come from ONE version.
    """

    def test_swap_between_acquisitions_cannot_mix_versions(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        import lessonos.compose as compose_mod
        from lessonos.ingest.bundle import read_bundle as real_read_bundle

        path = tmp_path / "lez.lesson"
        path.write_bytes(
            _bundle_bytes(_variant_journal("Alfa"), _variant_snapshot("Alfa", "Errore alfa")))
        path_b = tmp_path / "lezb.lesson"
        path_b.write_bytes(
            _bundle_bytes(_variant_journal("Beta"), _variant_snapshot("Beta", "Errore beta")))

        fixtures = {}
        fixtures.update(_variant_fixtures(str(path), "Alfa"))
        fixtures.update(_variant_fixtures(str(path_b), "Beta"))
        router = Router()
        router.register(MockProvider(fixtures))

        acquisitions: list[bytes] = []
        first = True

        def swapping_read(zip_path: str):
            nonlocal first
            contents = real_read_bundle(zip_path)
            acquisitions.append(Path(zip_path).read_bytes())
            if first:
                first = False
                # TOCTOU: replace the file AFTER the validated acquisition.
                Path(zip_path).write_bytes(path_b.read_bytes())
            return contents

        monkeypatch.setattr(compose_mod, "read_bundle", swapping_read)
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            str(path), L, store=store, router=router, provider="mock")
        digest_labels = sorted(e.label for e in material.digest.errors)
        seg_texts = sorted(s.text for s in store.segments_for_lesson(L))
        digest_is_alfa = digest_labels == ["Errore alfa"]
        segments_are_alfa = seg_texts == sorted([f"Alfa {w}." for w in ("uno", "due", "tre")])
        # Same version on both sides — never digest-from-A with segments-from-B.
        assert digest_is_alfa == segments_are_alfa
        # Secondary: a single validated acquisition happened.
        assert len(acquisitions) == 1
        store.close()


def _bundle_bytes(journal: str, snapshot: str | None) -> bytes:
    import io

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("raw/events.jsonl", journal)
        if snapshot is not None:
            zf.writestr("raw/lessonos-events.jsonl", snapshot)
        zf.writestr("raw/board.excalidraw", "{}")
    return buf.getvalue()


# ── H2: vertical retention matrix ─────────────────────────────────────


class TestVerticalRetention:
    """One synthetic bundle through the real entry points.

    preserved: journal concept, valid exercise+solution, open/corrected
      errors, EvidenceRef provenance, inline/display math, textual link,
      fenced code.
    intentionally_omitted: exercise with unresolvable citation (dropped,
      reason recorded — absence is policy, not loss).
    """

    def test_full_chain_bundle_to_pack(self, tmp_path: Path) -> None:
        bundle = _write_bundle(tmp_path / "lez.lesson", _journal(), _snapshot_same_lesson())
        store = SQLiteStore(":memory:")
        material = compose_lesson_material(
            bundle, L, store=store, router=_full_router(bundle), provider="mock")
        md = material.pack.files[f"{L}.md"]
        # journal concept + valid exercise preserved
        assert "derivata" in md
        assert "Calcola la derivata." in md
        assert "Soluzione estratta dalla lezione" in md
        # intentionally omitted exercise: dropped with reason, never rendered
        assert "Esercizio fantasma" not in md
        assert any("s999" in str(d) for d in material.capsule.dropped)
        # digest-only concept retained deterministically (N01)
        assert "Regola registrata LessonOS" in md
        assert "](manual:verticale:p3)" not in md
        # errors + provenance
        assert "da rivedere" in md and "corretto" in md
        # allowed material converted: textual link + inert code stay text
        assert "[manuale](https://example.com/p)" in md
        assert "x = 1" in md
        store.close()
