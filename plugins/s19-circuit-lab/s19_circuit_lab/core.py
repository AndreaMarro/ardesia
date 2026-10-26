"""Comandi S19 sopra risorse, revisioni e ricevute canoniche Study Core."""

import json
from lessonos.study.models import StudyError
from lessonos.study.catalog import edition_pack
from lessonos.study.context import revise_resource
from lessonos.study.submissions import submit
from lessonos.study.store import canonical
from .adapter import SOURCE_SHA, read_document, solve

PACK_ID = "s19-circuit-dc-v1"
ACTIVITY_ID = "s19-kirchhoff-dc-v1"
KIND = "s19-circuit"


def _scope(store, principal, edition_id):
    store._edition_access(principal, edition_id)
    if edition_pack(store, edition_id)["packId"] != PACK_ID:
        raise StudyError("s19_wrong_course", 403)


def _source(store, principal, resource_id, expected_revision=None):
    resource = store.get_resource(principal, resource_id)
    _scope(store, principal, resource["editionId"])
    if resource["kind"] != KIND:
        raise StudyError("s19_wrong_resource")
    if expected_revision is not None and resource["revisionId"] != expected_revision:
        raise StudyError("stale_revision", 409)
    return resource, read_document(json.loads(resource["text"]))


def save(
    store,
    principal,
    edition_id,
    document,
    key,
    resource_id=None,
    expected_revision=None,
):
    _scope(store, principal, edition_id)
    d = read_document(document)
    text = canonical(d)
    if resource_id:
        resource, _ = _source(store, principal, resource_id)
        if resource["editionId"] != edition_id:
            raise StudyError("forbidden", 403)
        if not expected_revision:
            raise StudyError("stale_revision", 409)
        return revise_resource(
            store, principal, resource_id, expected_revision, text, key=key
        )
    return store.create_resource(principal, edition_id, KIND, text, "private", key=key)


def reopen(store, principal, resource_id):
    resource, d = _source(store, principal, resource_id)
    try:
        result = solve(d)
    except (ValueError, RuntimeError, OSError, ImportError):
        return {
            "resource": resource,
            "document": d,
            "result": None,
            "assessmentState": "UNAVAILABLE",
        }
    return {
        "resource": resource,
        "document": d,
        "result": result,
        "assessmentState": "CURRENT",
    }


def submit_attempt(store, principal, resource_id, expected_revision, key):
    resource, d = _source(store, principal, resource_id, expected_revision)
    if resource["ownerId"] != principal.id:
        raise StudyError("forbidden", 403)
    result = solve(d)
    lesson = result["lesson"]
    # A refusal is evidence of a limit, not a completed verified lesson.
    evidence = {
        "schema": "s19-attempt.v1",
        "fingerprint": result["fingerprint"],
        "sourceSha": SOURCE_SHA,
        "lessonBuild": lesson.get("lesson_build"),
        "question": d["question"],
        "prediction": d["prediction"],
        "trace": d["trace"],
        "notes": d["notes"],
        "diagnosis": result["diagnosis"],
        "outcome": lesson["outcome"],
        "answer": lesson.get("answer"),
        "verification": lesson.get("verification"),
        "productVerified": False,
    }
    return submit(
        store,
        principal,
        resource["editionId"],
        ACTIVITY_ID,
        [],
        canonical(evidence),
        key,
        source_refs=[
            {
                "resourceId": resource["id"],
                "revisionId": resource["revisionId"],
                "contextId": resource["contextId"],
            }
        ],
    )
