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


class TestSnapshotContractHardening:
    def test_a11_truncated_line_rejected_not_empty(self) -> None:
        """Riga troncata: mai un digest apparentemente valido e vuoto."""
        snap = '{"seq": 1, "schemaVersion": 2, "kind": "error.observed"'
        with pytest.raises(ValueError, match="malformed|truncat|JSON|snapshot"):
            project_lessonos_study_digest(snap, L)

    def test_a12_truncated_correction_rejected(self) -> None:
        """Correzione troncata: mai concludere corrected=false in silenzio."""
        good = _error("err:e", "c", "Errore",
                      "2026-08-01T00:01:00.000Z")
        bad = _env("exercise.completed", "2026-08-01T00:02:00.000Z", {
            "exerciseId": "ex:x", "correctsErrorId": "err:e",
            "labels": {"it": "X"},
        })
        snap = _snapshot(good) + "\n" + json.dumps(bad)[:60]
        with pytest.raises(ValueError, match="malformed|truncat|JSON|snapshot"):
            project_lessonos_study_digest(snap, L)

    def test_a13_v2_like_without_schema_version_rejected(self) -> None:
        """Riga v2-like (kind/lessonId/occurredAt/payload) senza
        schemaVersion: riconoscibile come canonica corrotta, mai legacy."""
        row = {
            "kind": "journal.element.add",
            "lessonId": L,
            "occurredAt": "2026-08-01T00:00:00.000Z",
            "payload": {"element": {"id": "a", "type": "text", "text": "x"}},
        }
        with pytest.raises(ValueError, match="schemaVersion|v2|canonical"):
            project_lessonos_study_digest(_snapshot(row), L)

    def test_a3_empty_it_label_is_empty_like_studio(self) -> None:
        """labels.it='' → Studio labelOf rende '' (?? salta solo
        null/undefined), NON fallback. Misurato via probe, non dedotto."""
        row = _env("concept.introduced", "2026-08-01T00:00:00.000Z", {
            "conceptId": "c", "labels": {"it": "", "en": "Concept"},
        })
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert digest.concepts[0].label == ""

    def test_a3b_non_string_label_rejected(self) -> None:
        """labels {it: 123}: Studio assertLegacyPayloadField rifiuta
        (misurato). Mirror: reject, mai coerce."""
        row = _env("concept.introduced", "2026-08-01T00:00:00.000Z", {
            "conceptId": "c", "labels": {"it": 123},
        })
        with pytest.raises(ValueError, match="labels"):
            project_lessonos_study_digest(_snapshot(row), L)

    def test_a3c_bool_seq_rejected(self) -> None:
        """seq=true: Studio Number.isInteger rifiuta; isinstance Python
        accetterebbe. Type-strict."""
        row = _env("concept.introduced", "2026-08-01T00:00:00.000Z", {
            "conceptId": "c", "labels": {"it": "C"},
        })
        row["seq"] = True
        with pytest.raises(ValueError, match="seq"):
            project_lessonos_study_digest(_snapshot(row), L)

    def test_a21_same_id_concept_and_error_rejected(self) -> None:
        """conceptId = errorId = 'same': Studio rifiuta concetto vs errore."""
        snap = _snapshot(
            _concept("same", "Stesso", "2026-08-01T00:00:00.000Z"),
            _error("same", "same", "Stesso errore",
                   "2026-08-01T00:01:00.000Z"),
        )
        with pytest.raises(ValueError, match="kind|role|riusato|conflict"):
            project_lessonos_study_digest(snap, L)

    def test_a22_exercise_id_reused_as_error_id_rejected(self) -> None:
        """exerciseId = errorId = 'e': Studio rifiuta errore vs esercizio;
        mai trasformarlo in e.corrected = true."""
        snap = _snapshot(
            _error("e", "c", "Errore", "2026-08-01T00:00:00.000Z"),
            _env("exercise.completed", "2026-08-01T00:01:00.000Z", {
                "exerciseId": "e", "correctsErrorId": "e",
                "labels": {"it": "Esercizio"},
            }),
        )
        with pytest.raises(ValueError, match="kind|role|riusato|conflict"):
            project_lessonos_study_digest(snap, L)

    def test_differential_parity_full_relevant_subset(self) -> None:
        """Tripwire permanente di parità Studio (D2-J3A + J3A.1): gli 11 kind
        rilevanti proiettati devono coincidere con buildLessonStudyDigest.
        Fixture condivisa con probe vitest /tmp/d2j31-full.jsonl (procedura
        nel body PR #251/#252): se Studio cambia semantica, rigenerare
        l'atteso con lo stesso snapshot."""
        L2 = "lezione-j31x"
        S2 = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1"

        def row(seq: int, kind: str, secs: int, payload: dict, ev: str) -> dict:
            return {
                "seq": seq, "schemaVersion": 2,
                "eventId": f"70000000-0000-4000-8000-{seq:012d}",
                "lessonId": L2, "sessionId": S2, "kind": kind,
                "occurredAt": f"2026-08-01T00:{secs // 60:02d}:{secs % 60:02d}.000Z",
                "actor": {"type": "teacher", "id": "founder-beta-teacher"},
                "producer": {"id": "com.github.andreamarro.ardesia.studio",
                             "version": "0.0.0", "commitSha": "a" * 40},
                "causationId": None, "idempotencyKey": f"j31x:{seq}",
                "evidence": [{"ref": ev, "resolution": "verified"}],
                "payload": payload,
            }

        rows = [
            row(1, "lesson.started", 0, {"room": L2}, f"lesson:{L2}@0"),
            row(2, "concept.introduced", 10,
                {"conceptId": "ohm", "labels": {"it": "Legge di Ohm"}},
                "manual:x:p1"),
            row(3, "material.cited", 20,
                {"materialId": "man:p2", "conceptId": "ohm",
                 "labels": {"it": "Pagina 2"}}, "manual:x:p2"),
            row(4, "error.observed", 30,
                {"errorId": "err:e", "conceptId": "ohm",
                 "labels": {"it": "Errore E"}}, "board:e"),
            row(5, "exercise.completed", 40,
                {"exerciseId": "ex:fix", "conceptId": "ohm",
                 "correctsErrorId": "err:e", "labels": {"it": "Esercizio fix"}},
                "board:fix"),
            row(6, "simulation.error.observed", 50,
                {"errorId": "sim:s", "conceptId": "ohm",
                 "labels": {"it": "Errore S"}, "sceneId": "s",
                 "experimentId": "e"}, "simulation:s"),
            row(7, "simulation.step.completed", 60,
                {"stepId": "step:1", "conceptId": "ohm",
                 "labels": {"it": "Passo"}}, "board:step"),
            row(8, "simulation.circuit.solved", 70,
                {"experimentId": "exp:1", "conceptId": "ohm",
                 "labels": {"it": "Circuito ok"}}, "plugin:sok"),
            row(9, "lesson.ended", 80, {"room": L2}, f"lesson:{L2}@80"),
            row(10, "quiz.attempted", 90,
                {"quizId": "q", "correct": 1, "total": 2,
                 "labels": {"it": "Quiz"}}, "board:q"),
            row(11, "session.heartbeat", 95, {}, "session:h"),
        ]
        snap = "\n".join(json.dumps(r) for r in rows)
        digest = project_lessonos_study_digest(snap, L2)
        assert [(c.id, c.label) for c in digest.concepts] == [("ohm", "Legge di Ohm")]
        assert digest.concepts[0].evidence_refs == (
            "manual:x:p1", "manual:x:p2", "board:e", "board:fix",
            "simulation:s", "board:step", "plugin:sok")
        assert [(e.id, e.label, e.concept_id, e.corrected)
                for e in digest.errors] == [
            ("err:e", "Errore E", "ohm", True),
            ("sim:s", "Errore S", "ohm", False),
        ]
        assert digest.errors[0].evidence_refs == ("board:e",)
        assert digest.errors[1].evidence_refs == ("simulation:s",)

    def test_t1_simulation_step_completed_yields_concept(self) -> None:
        """Studio crea il nodo concetto (labels {}) anche da step: il digest
        puo' contenerlo, Python non deve perderlo."""
        row = _env("simulation.step.completed", "2026-08-01T00:00:00.000Z", {
            "stepId": "step-1", "conceptId": "ohm",
            "labels": {"it": "Passo circuito"},
        })
        row["evidence"] = [{"ref": "board:step-1", "resolution": "verified"}]
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert [(c.id, c.label) for c in digest.concepts] == [("ohm", "ohm")]
        assert digest.concepts[0].evidence_refs == ("board:step-1",)

    def test_t2_exercise_concept_keeps_empty_labels(self) -> None:
        """Le labels dell'exercise restano al nodo esercizio: il concetto
        derivato nasce vuoto (label = fallback id)."""
        row = _env("exercise.completed", "2026-08-01T00:00:00.000Z", {
            "exerciseId": "ex-1", "conceptId": "ohm",
            "labels": {"it": "Esercizio sulla legge di Ohm"},
        })
        row["evidence"] = [{"ref": "board:ex-1", "resolution": "verified"}]
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert [(c.id, c.label) for c in digest.concepts] == [("ohm", "ohm")]
        assert digest.concepts[0].evidence_refs == ("board:ex-1",)

    def test_t3_circuit_solved_concept_keeps_empty_labels(self) -> None:
        row = _env("simulation.circuit.solved", "2026-08-01T00:00:00.000Z", {
            "experimentId": "exp-1", "conceptId": "ohm",
            "labels": {"it": "Circuito risolto"},
        })
        row["evidence"] = [{"ref": "plugin:sim@1", "resolution": "verified"}]
        digest = project_lessonos_study_digest(_snapshot(row), L)
        assert [(c.id, c.label) for c in digest.concepts] == [("ohm", "ohm")]
        assert digest.concepts[0].evidence_refs == ("plugin:sim@1",)

    def test_merge_exercise_then_introduced_and_reverse(self) -> None:
        """Labels vuote derivate non cancellano ne' inventano: chi arriva
        prima fissa, chi arriva dopo arricchisce senza riscrivere."""
        ex_row = _env("exercise.completed", "2026-08-01T00:00:00.000Z", {
            "exerciseId": "ex-1", "conceptId": "ohm",
            "labels": {"it": "Esercizio"}},
        )
        ex_row["evidence"] = [{"ref": "board:ex-1", "resolution": "verified"}]
        in_row = _env("concept.introduced", "2026-08-01T00:01:00.000Z", {
            "conceptId": "ohm", "labels": {"it": "Legge di Ohm"}})
        in_row["evidence"] = [{"ref": "manual:test:p10", "resolution": "verified"}]
        digest = project_lessonos_study_digest(
            _snapshot(ex_row, in_row), L)
        assert digest.concepts[0].label == "Legge di Ohm"
        assert digest.concepts[0].evidence_refs == ("board:ex-1", "manual:test:p10")
        digest = project_lessonos_study_digest(
            _snapshot(in_row, ex_row), L)
        # L'ordine canonico e' seq (non riga di file): ex_row ha seq minore,
        # quindi l'evidence resta (board, manual) in entrambi i casi.
        assert digest.concepts[0].label == "Legge di Ohm"
        assert digest.concepts[0].evidence_refs == ("board:ex-1", "manual:test:p10")


def _single_event_row(kind: str, payload: dict) -> dict:
    return _env(kind, "2026-08-01T00:00:00.000Z", payload)


@pytest.mark.parametrize("kind,payload", [
    ("error.observed", {"errorId": "same", "conceptId": "same",
                        "labels": {"it": "X"}}),
    ("simulation.error.observed", {"errorId": "same", "conceptId": "same",
                                   "sceneId": "s", "experimentId": "e",
                                   "labels": {"it": "X"}}),
    ("material.cited", {"materialId": "same", "conceptId": "same",
                        "labels": {"it": "X"}}),
    ("exercise.completed", {"exerciseId": "same", "conceptId": "same",
                            "labels": {"it": "X"}}),
    ("simulation.step.completed", {"stepId": "same", "conceptId": "same",
                                   "labels": {"it": "X"}}),
    ("simulation.circuit.solved", {"experimentId": "same",
                                   "conceptId": "same",
                                   "labels": {"it": "X"}}),
])
def test_derived_concept_claims_concetto_role(kind: str, payload: dict) -> None:
    """Concetto creato IMPLICITAMENTE nello stesso evento deve reclamare il
    ruolo concetto: se l'id e' gia' di altro ruolo (qui: se stesso come
    errore/esercizio/materiale), Studio rifiuta la collisione e anche noi.
    Distingue dal caso pre-claimato (concept.introduced in evento separato,
    gia' coperto da test_a21/a22)."""
    with pytest.raises(ValueError, match="kind|role|riusato|conflict"):
        project_lessonos_study_digest(
            _snapshot(_single_event_row(kind, payload)), L)
