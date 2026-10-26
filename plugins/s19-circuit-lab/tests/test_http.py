from copy import deepcopy
from fastapi.testclient import TestClient
from study_api.app import create_app
from s19_circuit_lab.adapter import DEFAULT_DOCUMENT
from test_core import core


def test_same_core_auth_cookie_route_reopen_receipt_and_revocation(core):
    s, t, u, p = core
    with TestClient(create_app(s.path, demo=True)) as c:
        url = "/study/s19/circuits"
        body = {"editionId": "s19-dc", "document": deepcopy(DEFAULT_DOCUMENT)}
        assert c.post(url + "/solve", json=body).status_code == 401
        assert (
            c.post("/study/session", json={"token": s.issue_session(u)}).status_code
            == 200
        )
        result = c.post(url + "/solve", json=body)
        assert (
            result.status_code == 200
            and result.json()["lesson"]["answer"]["exact"] == "8"
        )
        assert c.post(url + "/solve", json={**body, "actorId": p.id}).status_code == 422
        r = c.post(url, json=body, headers={"Idempotency-Key": "http-save"}).json()
        assert r["ownerId"] == u.id
        receipt = c.post(
            url + "/" + r["id"] + "/submit",
            json={"expectedRevision": r["revisionId"]},
            headers={"Idempotency-Key": "http-submit"},
        ).json()
        assert c.get("/study/receipts/" + receipt["receiptId"]).status_code == 200
        assert (
            c.get(url + "/" + r["id"]).json()["result"]["lesson"]["answer"]["exact"]
            == "8"
        )
        assert (
            c.post("/study/session", json={"token": s.issue_session(p)}).status_code
            == 200
        )
        assert c.get(url + "/" + r["id"]).status_code == 403
        c.post("/study/session", json={"token": s.issue_session(u)})
        assert c.post("/study/session/revoke-all").status_code == 200
        assert c.get(url + "/" + r["id"]).status_code == 401
        assert c.post(url + "/solve", json=body).status_code == 401


def test_wrong_course_origin_large_body_and_bad_document_fail_closed(core):
    s, t, u, p = core
    with TestClient(create_app(s.path, demo=True)) as c:
        c.post("/study/session", json={"token": s.issue_session(u)})
        base = {"editionId": "s19-dc", "document": deepcopy(DEFAULT_DOCUMENT)}
        assert (
            c.post(
                "/study/s19/circuits/solve",
                json=base,
                headers={"Origin": "https://evil.invalid"},
            ).status_code
            == 403
        )
        assert (
            c.post("/study/s19/circuits/solve", content="x" * 300000).status_code == 413
        )
        base["document"]["answer"] = {"exact": "666"}
        r = c.post("/study/s19/circuits/solve", json=base)
        assert r.status_code == 422 and r.json()["error"] == "s19_invalid_input"


def test_huge_layout_coordinate_is_http_422_and_service_recovers(core):
    s, t, u, p = core
    with TestClient(create_app(s.path, demo=True)) as c:
        c.post("/study/session", json={"token": s.issue_session(u)})
        d = deepcopy(DEFAULT_DOCUMENT)
        d["layout"] = {"a": {"x": 10**400, "y": 0}}
        assert (
            c.post(
                "/study/s19/circuits/solve", json={"editionId": "s19-dc", "document": d}
            ).status_code
            == 422
        )
        assert c.get("/study/me").status_code == 200


def test_missing_or_invalidated_engine_keeps_input_export_and_reports_unavailable(core, monkeypatch):
    from s19_circuit_lab import adapter
    s, _, student, _ = core
    def unavailable():
        raise ValueError("Pinned checkout unavailable")
    monkeypatch.setattr(adapter, "assert_engine", unavailable)
    with TestClient(create_app(s.path, demo=True)) as c:
        c.post("/study/session", json={"token": s.issue_session(student)})
        body = {"editionId": "s19-dc", "document": deepcopy(DEFAULT_DOCUMENT)}
        export = c.post("/study/s19/circuits/export/json", json=body)
        assert export.status_code == 200
        assert export.json() == body["document"]
        for route in ("solve", "export/spice", "export/circuitikz"):
            result = c.post("/study/s19/circuits/" + route, json=body)
            assert result.status_code == 503 and result.json()["error"] == "s19_engine_unavailable"


def test_exact_revision_route_preserves_teacher_receipt_after_private_revision(core):
    s, tutor, student, peer = core
    with TestClient(create_app(s.path, demo=True)) as c:
        c.post("/study/session", json={"token": s.issue_session(student)})
        base = "/study/s19/circuits"
        body = {"editionId": "s19-dc", "document": deepcopy(DEFAULT_DOCUMENT)}
        first = c.post(base, json=body, headers={"Idempotency-Key": "route-r1"}).json()
        submit_body = {"expectedRevision": first["revisionId"]}
        receipt = c.post(base + "/" + first["id"] + "/submit", json=submit_body, headers={"Idempotency-Key": "route-submit"})
        assert receipt.status_code == 200
        body["document"]["notes"] = "Private R2"
        second = c.post(base, json={**body, "resourceId": first["id"], "expectedRevision": first["revisionId"]}, headers={"Idempotency-Key": "route-r2"}).json()
        c.post("/study/session", json={"token": s.issue_session(tutor)})
        exact = c.get(base + "/" + first["id"], params={"revisionId": first["revisionId"]})
        assert exact.status_code == 200 and exact.json()["canRevise"] is False
        assert exact.json()["resource"]["revisionId"] == first["revisionId"]
        assert exact.json()["document"]["notes"] != "Private R2"
        assert c.get(base + "/" + first["id"], params={"revisionId": second["revisionId"]}).status_code == 403
        assert c.get(base + "/" + first["id"], params={"revisionId": ""}).status_code == 422
        assert c.get(base + "/" + first["id"], params={"revisionId": "unknown"}).status_code == 404
        c.post("/study/session", json={"token": s.issue_session(peer)})
        assert c.get(base + "/" + first["id"], params={"revisionId": first["revisionId"]}).status_code == 403
