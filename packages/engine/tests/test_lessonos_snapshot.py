"""Tests for D2-J3A — LessonOS snapshot → engine pedagogical facts.

Pure deterministic projector over canonical EventEnvelope v2 rows from
``raw/lessonos-events.jsonl``. Semantics mirror Studio ``buildLessonStudyDigest``
(materializer + studyDigest): concepts, errors, error→concept relation,
corrected state, EvidenceRef provenance, lesson identity. All fixtures
synthetic, no PII.
"""

from __future__ import annotations

import json

import pytest

from lessonos.ingest.lessonos_snapshot import (
    LessonOsStudyDigest,
    project_lessonos_study_digest,
)

L = "lezione-sintetica"
S = "11111111-1111-4111-8111-111111111111"

_n = 0


def _env(kind: str, occurred_at: str, payload: dict, lesson_id: str = L,
         session_id: str = S) -> dict:
    global _n
    _n += 1
    return {
        "seq": _n,
        "schemaVersion": 2,
        "eventId": f"70000000-0000-4000-8000-{_n:012d}",
        "lessonId": lesson_id,
        "sessionId": session_id,
        "kind": kind,
        "occurredAt": occurred_at,
        "actor": {"type": "teacher", "id": "founder-beta-teacher"},
        "producer": {
            "id": "com.github.andreamarro.ardesia.studio",
            "version": "0.0.0",
            "commitSha": "a" * 40,
        },
        "causationId": None,
        "idempotencyKey": f"d2j3a:{_n}",
        "evidence": [{"ref": f"lesson:{lesson_id}@{_n}", "resolution": "verified"}],
        "payload": payload,
    }


def _snapshot(*rows: dict) -> str:
    return "\n".join(json.dumps(r) for r in rows)


def _concept(cid: str, label: str, t: str, evidence=None) -> dict:
    return _env("concept.introduced", t, {
        "conceptId": cid, "labels": {"it": label},
    })


def _error(eid: str, cid: str, label: str, t: str, evidence=None) -> dict:
    return _env("error.observed", t, {
        "errorId": eid, "conceptId": cid, "labels": {"it": label},
    })


def _sim_error(eid: str, cid: str, label: str, t: str) -> dict:
    return _env("simulation.error.observed", t, {
        "errorId": eid, "conceptId": cid, "labels": {"it": label},
        "sceneId": "scene:test", "experimentId": "exp:test",
    })


def _correct(exid: str, corrects: str, t: str) -> dict:
    return _env("exercise.completed", t, {
        "exerciseId": exid, "correctsErrorId": corrects,
        "labels": {"it": "Esercizio"},
    })


class TestLessonOsStudyDigest:
    def test_t2_empty_relevant_projection_is_available_empty(self) -> None:
        snap = _snapshot(
            _env("lesson.started", "2026-08-01T00:00:00.000Z",
                 {"room": L}),
            _env("quiz.attempted", "2026-08-01T00:01:00.000Z",
                 {"quizId": "q", "correct": 1, "total": 2,
                  "labels": {"it": "Quiz"}}),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert isinstance(digest, LessonOsStudyDigest)
        assert digest.lesson_id == L
        assert digest.concepts == ()
        assert digest.errors == ()

    def test_t3_concept_with_evidence(self) -> None:
        snap = _snapshot(_env(
            "concept.introduced", "2026-08-01T00:00:00.000Z",
            {"conceptId": "circuito_chiuso",
             "labels": {"it": "Circuito chiuso"}},
        ))
        # evidence del row di default: lesson:L@n (sostituita qui sotto)
        rows = [json.loads(snap)]
        rows[0]["evidence"] = [
            {"ref": "manual:test:p10", "resolution": "verified"},
            {"ref": "board:test-element", "resolution": "verified"},
        ]
        digest = project_lessonos_study_digest(_snapshot(*rows), L)
        assert [(c.id, c.label) for c in digest.concepts] == [
            ("circuito_chiuso", "Circuito chiuso")]
        assert digest.concepts[0].evidence_refs == (
            "manual:test:p10", "board:test-element")

    def test_t4_uncorrected_error(self) -> None:
        snap = _snapshot(
            _concept("circuito_chiuso", "Circuito chiuso",
                     "2026-08-01T00:00:00.000Z"),
            _error("err:aperto", "circuito_chiuso", "Circuito aperto",
                   "2026-08-01T00:01:00.000Z"),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert [(e.id, e.concept_id, e.corrected)
                for e in digest.errors] == [
            ("err:aperto", "circuito_chiuso", False)]

    def test_t5_corrected_error(self) -> None:
        snap = _snapshot(
            _concept("circuito_chiuso", "Circuito chiuso",
                     "2026-08-01T00:00:00.000Z"),
            _error("err:aperto", "circuito_chiuso", "Circuito aperto",
                   "2026-08-01T00:01:00.000Z"),
            _correct("ex:ricollega", "err:aperto",
                     "2026-08-01T00:02:00.000Z"),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert [(e.id, e.corrected) for e in digest.errors] == [
            ("err:aperto", True)]

    def test_orphan_correction_invents_no_error(self) -> None:
        snap = _snapshot(
            _correct("ex:orfano", "err:mai-osservato",
                     "2026-08-01T00:01:00.000Z"),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert digest.errors == ()

    def test_t6_simulation_error_behaves_like_error(self) -> None:
        snap = _snapshot(
            _concept("circuito_chiuso", "Circuito chiuso",
                     "2026-08-01T00:00:00.000Z"),
            _sim_error("sim-error:aperto", "circuito_chiuso",
                       "Circuito aperto (sim)",
                       "2026-08-01T00:01:00.000Z"),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert [(e.id, e.concept_id, e.corrected)
                for e in digest.errors] == [
            ("sim-error:aperto", "circuito_chiuso", False)]

    def test_material_cited_contributes_concept_evidence(self) -> None:
        # Come Studio: il concetto derivato nasce con labels vuote (label =
        # fallback id); l'evidence del material si unisce al nodo.
        row = _env(
            "material.cited", "2026-08-01T00:00:00.000Z",
            {"materialId": "man:vol1-p30", "conceptId": "circuito_chiuso",
             "labels": {"it": "Pagina 30"}},
        )
        row["evidence"] = [{"ref": "manual:test:p10", "resolution": "verified"}]
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert [(c.id, c.label) for c in digest.concepts] == [
            ("circuito_chiuso", "circuito_chiuso")]
        assert digest.concepts[0].evidence_refs == ("manual:test:p10",)

    def test_t8_lesson_mismatch_rejected(self) -> None:
        snap = _snapshot(
            _error("err:a", "c", "Errore A",
                   "2026-08-01T00:01:00.000Z", ),
            _env("error.observed", "2026-08-01T00:02:00.000Z", {
                "errorId": "err:b", "conceptId": "c",
                "labels": {"it": "Errore B"},
            }, lesson_id="altra-lezione"),
        )
        with pytest.raises(ValueError, match="lessonId"):
            project_lessonos_study_digest(snap, L)

    def test_t9_malformed_factual_envelope_rejected(self) -> None:
        bad = _error("err:a", "circuito", "Errore",
                     "2026-08-01T00:01:00.000Z")
        del bad["payload"]["labels"]
        with pytest.raises(ValueError, match="labels|payload|malformed"):
            project_lessonos_study_digest(_snapshot(bad), L)

    def test_t10_unknown_advisory_ignored(self) -> None:
        snap = _snapshot(
            _env("session.heartbeat", "2026-08-01T00:00:00.000Z", {}),
            _error("err:a", "c", "Errore A",
                   "2026-08-01T00:01:00.000Z"),
        )
        digest = project_lessonos_study_digest(snap, L)
        assert [e.id for e in digest.errors] == ["err:a"]
        assert [c.id for c in digest.concepts] == ["c"]

    def test_label_fallback_first_available_then_id(self) -> None:
        snap = _snapshot(_env(
            "concept.introduced", "2026-08-01T00:00:00.000Z",
            {"conceptId": "cid", "labels": {"en": "Closed circuit"}},
        ))
        digest = project_lessonos_study_digest(snap, L)
        assert digest.concepts[0].label == "Closed circuit"
        snap2 = _snapshot(_env(
            "concept.introduced", "2026-08-01T00:00:00.000Z",
            {"conceptId": "cid2", "labels": {}},
        ))
        digest2 = project_lessonos_study_digest(snap2, L)
        assert digest2.concepts[0].label == "cid2"

    def test_older_labels_win_and_evidence_merges_in_order(self) -> None:
        # Il material crea il concetto (labels vuote); concept.introduced
        # aggiunge le sue labels; l'evidence si unisce in ordine di seq.
        rows = [
            _env("material.cited", "2026-08-01T00:00:00.000Z",
                 {"materialId": "man:p30", "conceptId": "c",
                  "labels": {"it": "Pagina 30"}}),
            _env("concept.introduced", "2026-08-01T00:01:00.000Z",
                 {"conceptId": "c", "labels": {"it": "Concetto C"}}),
        ]
        rows[0]["evidence"] = [{"ref": "manual:test:p10", "resolution": "verified"}]
        rows[1]["evidence"] = [{"ref": "board:test", "resolution": "verified"}]
        digest = project_lessonos_study_digest(_snapshot(*rows), L)
        assert digest.concepts[0].label == "Concetto C"
        assert digest.concepts[0].evidence_refs == ("manual:test:p10", "board:test")

    def test_older_labels_win_on_conflict(self) -> None:
        rows = [
            _env("concept.introduced", "2026-08-01T00:00:00.000Z",
                 {"conceptId": "c", "labels": {"it": "Prima"}}),
            _env("concept.introduced", "2026-08-01T00:01:00.000Z",
                 {"conceptId": "c", "labels": {"it": "Dopo", "en": "After"}}),
        ]
        digest = project_lessonos_study_digest(_snapshot(*rows), L)
        assert digest.concepts[0].label == "Prima"

    def test_student_id_never_propagated(self) -> None:
        row = _error("err:a", "c", "Errore A", "2026-08-01T00:01:00.000Z")
        row["payload"]["studentId"] = "studente-1"
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert "studente-1" not in json.dumps({
            "c": [(c.id, c.label, c.evidence_refs) for c in digest.concepts],
            "e": [(e.id, e.label, e.concept_id, e.evidence_refs) for e in digest.errors],
        })
