"""Whole canonical notebook lifecycle; the browser cannot choose authority."""
from copy import deepcopy
from io import BytesIO
import json

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter
from lessonos.study.store import canonical, digest, StudyStore
from study_api.app import create_app
from test_identity import setup_store


def state(text="La portata si conserva", formula="A_1 v_1=A_2 v_2"):
    return {"v": 1, "title": "Continuità", "annotations": [
        {"id": "note-1", "page": 2, "rect": [0.1, 0.2, 0.4, 0.1], "kind": "note", "content": text},
        {"id": "formula-1", "page": 2, "rect": [0.1, 0.4, 0.5, 0.2], "kind": "formula", "content": formula},
    ]}


def original():
    pdf = PdfWriter()
    for _ in range(2):
        pdf.add_blank_page(width=300, height=400)
    buffer = BytesIO()
    pdf.write(buffer)
    return buffer.getvalue()


@pytest.fixture
def notebook(tmp_path):
    store, tutor, owner, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        def login(actor):
            assert client.post("/study/session", json={"token": store.issue_session(actor)}).status_code == 200
        login(owner)
        asset = client.post("/study/assets?editionId=fluidi", content=original(), headers={
            "Content-Type": "application/pdf", "Idempotency-Key": "pdf",
        }).json()
        yield store, client, login, asset, tutor, owner, peer, other
    store.close()


def create(client, asset, **extra):
    return client.post("/study/scientific-notebooks", json={
        "editionId": "fluidi", "assetId": asset["id"], "assetSha256": asset["sha256"],
        "state": state(), **extra,
    }, headers={"Idempotency-Key": "create-notebook"})


def test_pdf_annotation_formula_revision_submit_export_reopen(notebook):
    store, client, login, asset, tutor, owner, peer, _ = notebook
    response = create(client, asset, actorId=peer.id)
    assert response.status_code == 200, response.text
    v1 = response.json()
    assert v1["ownerId"] == owner.id and v1["visibility"] == "private"
    assert v1["notebook"]["state"] == state()
    assert v1["notebook"]["source"] == {
        "assetId": asset["id"], "sha256": asset["sha256"], "pageCount": 2,
        "coordinates": "pdf-normalized-unrotated-top-left-v1",
    }
    assert create(client, asset, actorId=peer.id).json() == v1
    source_path = "/study/resources/" + v1["id"]
    for actor in [peer, tutor]:
        login(actor)
        assert client.get(source_path).status_code == 403
    login(owner)
    ref = {key: v1[key] for key in ("revisionId", "contextId")}
    ref["resourceId"] = v1["id"]
    submitted = client.post("/study/submissions", json={
        "editionId": "fluidi", "activityId": "poiseuille-v1", "text": "Procedimento",
        "sourceRefs": [ref], "assetRefs": [asset["id"]],
    }, headers={"Idempotency-Key": "submit-notebook"})
    assert submitted.status_code == 200, submitted.text
    revised = state("Revisione privata", "Q=Av")
    revision_body = {"expectedRevision": v1["revisionId"], "state": revised}
    revision_path = "/study/scientific-notebooks/" + v1["id"] + "/revisions"
    v2r = client.post(revision_path, json=revision_body, headers={"Idempotency-Key": "revise"})
    assert v2r.status_code == 200, v2r.text
    v2 = v2r.json()
    assert v2["revisionId"] != v1["revisionId"] and v2["notebook"]["state"] == revised
    assert client.post(revision_path, json=revision_body, headers={"Idempotency-Key": "revise"}).json() == v2
    assert client.post(revision_path, json=revision_body, headers={"Idempotency-Key": "other-revise"}).status_code == 409
    login(tutor)
    assert client.get(source_path).status_code == 403
    assert client.get(source_path + "/revisions/" + v1["revisionId"]).json()["notebook"] == v1["notebook"]
    bundle = client.get("/study/notebook?editionId=fluidi").json()
    assert all(r["revisionId"] != v2["revisionId"] for r in bundle["resources"] + bundle["resourceRevisions"])
    assert next(r for r in bundle["resourceRevisions"] if r["id"] == v1["id"])["notebook"] == v1["notebook"]
    assert client.post("/study/notebook/inspect", json=bundle).status_code == 200
    login(owner)
    # Export also includes an unsubmitted current notebook's exact PDF.
    mine = client.get("/study/notebook?editionId=fluidi").json()
    assert asset["id"] in {a["id"] for a in mine["assets"]}
    assert client.post("/study/notebook/inspect", json=mine).status_code == 200
    reopened = StudyStore(store.path, initialize=False)
    assert reopened.get_resource(owner, v1["id"])["notebook"] == v2["notebook"]
    reopened.close()


@pytest.mark.parametrize("change", [
    lambda s: s["annotations"][0].update(page=3),
    lambda s: s["annotations"][0].update(page=True),
    lambda s: s["annotations"][0].update(rect=[.9, 0, .2, .1]),
    lambda s: s["annotations"][0].update(rect=[0, 0, 0, .1]),
    lambda s: s["annotations"][0].update(kind="html"),
    lambda s: s["annotations"][1].update(id="note-1"),
    lambda s: s.update(v=2),
    lambda s: s.update(actorId="someone-else"),
])
def test_invalid_page_geometry_or_schema_never_commits(notebook, change):
    store, client, _, asset, *_ = notebook
    bad = state()
    change(bad)
    result = create(client, asset, state=bad)
    assert result.status_code == 422, result.text
    assert store.connection.execute("SELECT COUNT(*) FROM study_resources").fetchone()[0] == 0


def test_binding_cannot_be_forged_or_mutated_through_generic_routes(notebook):
    _, client, login, asset, tutor, owner, peer, _ = notebook
    assert create(client, asset, assetSha256="0" * 64).status_code == 409
    login(peer)
    assert create(client, asset).status_code == 403
    login(owner)
    v1 = create(client, asset).json()
    assert "revisionId" in v1
    assert client.post("/study/resources", json={
        "editionId": "fluidi", "kind": "scientific-notebook", "text": "unvalidated",
    }).status_code == 422
    assert client.post("/study/resources/" + v1["id"] + "/revise", json={
        "expectedRevision": v1["revisionId"], "text": "overwrite",
    }).status_code == 422
    # A notebook ref without its original would otherwise share a broken workflow.
    assert client.post("/study/submissions", json={
        "editionId": "fluidi", "activityId": "poiseuille-v1", "text": "Procedimento",
        "sourceRefs": [{"resourceId": v1["id"], "revisionId": v1["revisionId"]}],
        "assetRefs": [],
    }, headers={"Idempotency-Key": "missing-pdf"}).status_code == 422
    assert client.post("/study/submissions", json={
        "editionId": "fluidi", "activityId": "poiseuille-v1", "text": "Procedimento",
        "sourceRefs": [{"resourceId": v1["id"], "revisionId": v1["revisionId"], "contextId": "forged"}],
        "assetRefs": [asset["id"]],
    }, headers={"Idempotency-Key": "forged-context"}).status_code == 422
    # Receipt lookup must not resurrect private notebook state after revocation.
    client.delete("/study/resources/" + v1["id"])
    assert create(client, asset).status_code == 404
    login(tutor)
    assert client.get("/study/resources/" + v1["id"]).status_code == 404


def test_unsubmitted_export_and_tampered_geometry_are_checked(notebook):
    _, client, _, asset, *_ = notebook
    v1 = create(client, asset).json()
    assert "notebook" in v1
    bundle = client.get("/study/notebook?editionId=fluidi").json()
    assert [a["id"] for a in bundle["assets"]] == [asset["id"]]
    corrupt = deepcopy(bundle)
    corrupt["resources"][0]["notebook"]["state"]["annotations"][0]["rect"][0] = .4
    corrupt["sha256"] = digest(canonical({k: v for k, v in corrupt.items() if k != "sha256"}))
    assert client.post("/study/notebook/inspect", json=corrupt).status_code == 422


def resign(bundle):
    bundle["sha256"] = digest(canonical({k: v for k, v in bundle.items() if k != "sha256"}))


def test_extreme_numeric_geometry_is_a_client_error(notebook):
    _, client, _, asset, *_ = notebook
    bad = state()
    bad["annotations"][0]["rect"][0] = 10 ** 1000
    assert create(client, asset, state=bad).status_code == 422


def test_export_with_missing_original_mime_is_a_client_error(notebook):
    _, client, _, asset, *_ = notebook
    assert create(client, asset).status_code == 200
    bundle = client.get("/study/notebook?editionId=fluidi").json()
    del bundle["assets"][0]["mime"]
    resign(bundle)
    assert client.post("/study/notebook/inspect", json=bundle).status_code == 422


@pytest.mark.parametrize("mutation", ["original", "kind"])
def test_unsigned_export_still_requires_one_original_per_notebook_resource(notebook, mutation):
    _, client, _, asset, *_ = notebook
    first = create(client, asset).json()
    assert "notebook" in first
    response = client.post("/study/scientific-notebooks/" + first["id"] + "/revisions", json={
        "expectedRevision": first["revisionId"], "state": state("Versione due"),
    }, headers={"Idempotency-Key": "revise"})
    assert response.status_code == 200
    bundle = client.get("/study/notebook?editionId=fluidi").json()
    bundle["resourceRevisions"].append(first)
    # Both assets and snapshots are individually valid; the cross-revision binding is not.
    if mutation == "original":
        another_asset = {**bundle["assets"][0], "id": "f" * 32}
        bundle["assets"].append(another_asset)
        first["notebook"]["source"]["assetId"] = another_asset["id"]
        first["notebook"]["sha256"] = digest(canonical({k: v for k, v in first["notebook"].items() if k != "sha256"}))
    else:
        first["kind"] = "note"
        del first["notebook"]
    resign(bundle)
    assert client.post("/study/notebook/inspect", json=bundle).status_code == 422


@pytest.mark.parametrize("field", ["editionId", "assetId", "assetSha256", "expectedRevision"])
def test_surrogate_in_binding_or_cas_is_a_client_error(notebook, field):
    store, client, _, asset, *_ = notebook
    path = "/study/scientific-notebooks"
    body = {"editionId": "fluidi", "assetId": asset["id"], "assetSha256": asset["sha256"], "state": state()}
    if field == "expectedRevision":
        first = create(client, asset).json()
        path += "/" + first["id"] + "/revisions"
        body = {"state": state(), "expectedRevision": first["revisionId"]}
    before = store.connection.execute("SELECT COUNT(*) FROM study_revisions").fetchone()[0]
    body[field] = "\ud800"
    result = client.post(path, content=json.dumps(body, ensure_ascii=True), headers={
        "Idempotency-Key": "invalid-binding", "Content-Type": "application/json",
    })
    assert result.status_code == 422
    assert store.connection.execute("SELECT COUNT(*) FROM study_revisions").fetchone()[0] == before
