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
