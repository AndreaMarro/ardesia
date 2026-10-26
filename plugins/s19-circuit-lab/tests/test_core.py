from copy import deepcopy
import json
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study.submissions import get_receipt
from lessonos.study.context import revise_resource, delete_resource
from s19_circuit_lab.adapter import DEFAULT_DOCUMENT
from s19_circuit_lab.core import save, reopen, submit_attempt


@pytest.fixture
def core(tmp_path):
    s = StudyStore(tmp_path / "study.sqlite")
    tutor = s.create_principal("s19-tutor", "teacher")
    student = s.create_principal("s19-student", "student")
    peer = s.create_principal("s19-peer", "student")
    s.create_edition(
        tutor, "s19-dc", course_id="elettrotecnica-dc", pack_id="s19-circuit-dc-v1"
    )
    s.add_test_member(tutor, "s19-dc", student.id)
    s.add_test_member(tutor, "s19-dc", peer.id)
    yield s, tutor, student, peer
    s.close()


def test_core_resource_cas_cold_reopen_and_no_stored_answers(core):
    s, t, u, p = core
    d = deepcopy(DEFAULT_DOCUMENT)
    r = save(s, u, "s19-dc", d, "save-1")
    assert "answer" not in json.loads(r["text"])
    path = s.path
    fresh = StudyStore(path)
    try:
        assert reopen(fresh, u, r["id"])["result"]["lesson"]["answer"]["exact"] == "8"
    finally:
        fresh.close()
    changed = deepcopy(d)
    changed["components"][2]["value"] = "300"
    r2 = save(s, u, "s19-dc", changed, "save-2", r["id"], r["revisionId"])
    assert r2["revisionId"] != r["revisionId"]
    assert reopen(s, u, r["id"])["result"]["lesson"]["answer"]["exact"] == "9"
    with pytest.raises(StudyError, match="stale_revision"):
        save(s, u, "s19-dc", d, "save-3", r["id"], r["revisionId"])
    assert (
        s.connection.execute("SELECT COUNT(*) FROM study_revisions").fetchone()[0] == 2
    )


def test_submission_is_real_core_receipt_with_exact_refs_and_recomputed_evidence(core):
    s, t, u, p = core
    r = save(s, u, "s19-dc", deepcopy(DEFAULT_DOCUMENT), "save-1")
    receipt = submit_attempt(s, u, r["id"], r["revisionId"], "submit-1")
    assert receipt == get_receipt(s, u, receipt["receiptId"])
    assert receipt["activityId"] == "s19-kirchhoff-dc-v1"
    assert submit_attempt(s, u, r["id"], r["revisionId"], "submit-1") == receipt
    row = s.connection.execute(
        "SELECT text,source_refs FROM study_submissions"
    ).fetchone()
    evidence = json.loads(row["text"])
    assert evidence["answer"]["exact"] == "8"
    assert evidence["productVerified"] is False
    assert json.loads(row["source_refs"])[0]["revisionId"] == r["revisionId"]
    assert s.get_resource_revision(t, r["id"], r["revisionId"])["id"] == r["id"]


def test_peer_tutor_before_submit_wrong_edition_and_deleted_source_are_denied(core):
    s, t, u, p = core
    r = save(s, u, "s19-dc", deepcopy(DEFAULT_DOCUMENT), "save-1")
    for actor in (p, t):
        with pytest.raises(StudyError, match="forbidden"):
            reopen(s, actor, r["id"])
    with pytest.raises(StudyError):
        save(s, u, "fluidi", deepcopy(DEFAULT_DOCUMENT), "save-wrong")
    with pytest.raises(StudyError):
        submit_attempt(s, p, r["id"], r["revisionId"], "steal")
    delete_resource(s, u, r["id"])
    with pytest.raises(StudyError, match="not_found"):
        reopen(s, u, r["id"])


def test_revised_source_rejects_previous_receipt_attempt(core):
    s, t, u, p = core
    r = save(s, u, "s19-dc", deepcopy(DEFAULT_DOCUMENT), "save-1")
    d = deepcopy(DEFAULT_DOCUMENT)
    d["components"][1]["value"] = "50"
    save(s, u, "s19-dc", d, "save-2", r["id"], r["revisionId"])
    with pytest.raises(StudyError, match="stale_revision"):
        submit_attempt(s, u, r["id"], r["revisionId"], "submit-old")
    assert (
        s.connection.execute("SELECT COUNT(*) FROM study_submissions").fetchone()[0]
        == 0
    )


def test_teacher_review_reaches_existing_lessonos_projection_and_is_invalidated(core):
    from lessonos.study.feedback import propose_feedback, review_feedback
    from lessonos.study.context import retrieve_context

    s, t, u, p = core
    r = save(s, u, "s19-dc", deepcopy(DEFAULT_DOCUMENT), "save-1")
    receipt = submit_attempt(s, u, r["id"], r["revisionId"], "submit-1")
    draft = propose_feedback(s, t, receipt["submissionId"])
    review = review_feedback(
        s,
        t,
        draft["id"],
        1,
        "Hai dichiarato i versi dei rami nella KCL. Prova ora una sorgente di corrente.",
        "review-1",
    )
    context = retrieve_context(s, u, r["contextId"], "")
    assert context["observations"][0]["reviewId"] == review["reviewId"]
    assert context["observations"][0]["evidence"]["revisionId"] == r["revisionId"]
    d = deepcopy(DEFAULT_DOCUMENT)
    d["components"][2]["value"] = "400"
    save(s, u, "s19-dc", d, "save-2", r["id"], r["revisionId"])
    context = retrieve_context(s, u, r["contextId"], "")
    assert context["observations"] == [] and context["omittedStale"] == 1


def test_revision_save_retries_return_the_original_core_acknowledgement(core):
    s, t, u, p = core
    r = save(s, u, "s19-dc", deepcopy(DEFAULT_DOCUMENT), "create-1")
    d = deepcopy(DEFAULT_DOCUMENT)
    d["components"][2]["value"] = "400"
    first = save(s, u, "s19-dc", d, "update-once", r["id"], r["revisionId"])
    retry = save(s, u, "s19-dc", d, "update-once", r["id"], r["revisionId"])
    assert retry == first
    assert (
        s.connection.execute("SELECT COUNT(*) FROM study_revisions").fetchone()[0] == 2
    )
    changed = deepcopy(d)
    changed["notes"] = "different payload"
    with pytest.raises(StudyError, match="idempotency_conflict"):
        save(s, u, "s19-dc", changed, "update-once", r["id"], r["revisionId"])


def test_specialist_activity_does_not_claim_the_legacy_numeric_evaluator(core):
    from lessonos.study.catalog import edition_pack
    from lessonos.study.activities import evaluate_activity

    s, t, u, p = core
    descriptor = edition_pack(s, "s19-dc")
    assert descriptor["entryActivityId"] is None
    assert descriptor["questionBankIds"] == []
    with pytest.raises(StudyError, match="activity_not_supported"):
        evaluate_activity("s19-kirchhoff-dc-v1", {})


def test_unavailable_engine_preserves_core_inputs_notes_and_saving(monkeypatch, core):
    import s19_circuit_lab.core as module

    s, t, u, p = core
    d = deepcopy(DEFAULT_DOCUMENT)
    d["notes"] = "Conserva il ragionamento originale."
    r = save(s, u, "s19-dc", d, "save-1")

    def unavailable(document):
        raise ValueError("Engine pin unavailable")

    monkeypatch.setattr(module, "solve", unavailable)
    reopened = reopen(s, u, r["id"])
    assert reopened["document"] == d and reopened["result"] is None
    assert reopened["assessmentState"] == "UNAVAILABLE"
    d["notes"] = "Nota aggiornata anche senza confronto disponibile."
    r2 = save(s, u, "s19-dc", d, "save-2", r["id"], r["revisionId"])
    assert json.loads(r2["text"])["notes"] == d["notes"]
    with pytest.raises(ValueError, match="unavailable"):
        submit_attempt(s, u, r2["id"], r2["revisionId"], "submit-no-engine")
