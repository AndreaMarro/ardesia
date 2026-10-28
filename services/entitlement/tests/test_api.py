"""Contratto HTTP FastAPI: endpoint, auth authority-side, anti-enumerazione,
GDPR-ready tecnico (export/delete per soggetto pseudonimo, retention, audit
append-only con soli hash)."""

from __future__ import annotations

import json
import re

import pytest
from fastapi.testclient import TestClient

from entitlement_service.app import create_app
from entitlement_service.core import TOKEN_TTL_MS, sha256_hex, subject_hash, register_license_key
from entitlement_service.store import FileStore, read_json
from entitlement_service.settings import Settings

from .conftest import TEST_API_KEY

ADMIN = {"X-API-Key": TEST_API_KEY}
EMAIL = "docente@example.invalid"
SCOPE = {"schoolId": "scuola-1", "classId": "3B", "featureLookupKey": "tutor-monthly-15eur"}
INVALID_BODY = {"ok": False, "reason": "invalid"}


def register_license(client: TestClient, clock, days: int = 365) -> str:
    body = dict(SCOPE, expiresAt=clock.now_ms() + days * 24 * 3_600_000)
    resp = client.post("/license/register", json=body, headers=ADMIN)
    assert resp.status_code == 200
    return resp.json()["licenseKey"]


def redeem_license(client: TestClient, key: str) -> dict:
    resp = client.post("/license/redeem", json={"licenseKey": key})
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["ok"] is True
    return payload["entitlement"]


def issue_and_read_token(client: TestClient, settings: Settings, entitlement_id: str) -> str:
    resp = client.post("/token/issue", json={"entitlementId": entitlement_id, "email": EMAIL})
    assert resp.status_code == 200 and resp.json() == {"ok": True}
    lines = read_outbox(settings)
    return lines[-1]["token"]


def read_outbox(settings: Settings) -> list[dict]:
    outbox = settings.outbox_dir / "outbox.jsonl"
    if not outbox.exists():
        return []
    return [json.loads(line) for line in outbox.read_text().splitlines() if line.strip()]


# --- auth authority-side -----------------------------------------------------


def test_register_requires_api_key(client) -> None:
    resp = client.post("/license/register", json=dict(SCOPE, expiresAt=1))
    assert resp.status_code == 401


def test_register_rejects_wrong_api_key(client) -> None:
    resp = client.post(
        "/license/register",
        json=dict(SCOPE, expiresAt=1),
        headers={"X-API-Key": "wrong"},
    )
    assert resp.status_code == 401


def test_admin_endpoints_unavailable_without_configured_key(settings, clock) -> None:
    """Deny-by-default: senza ENTITLEMENT_API_KEY il piano authority è chiuso."""
    unconfigured = Settings(
        data_dir=settings.data_dir,
        outbox_dir=settings.outbox_dir,
        api_key=None,
        retention_days=30,
        clock_ms=clock.now_ms,
    )
    client = TestClient(create_app(unconfigured))
    resp = client.post("/license/register", json=dict(SCOPE, expiresAt=1), headers=ADMIN)
    assert resp.status_code == 503


# --- ciclo licenza -----------------------------------------------------------


def test_register_returns_key_and_persists_only_hash(client, settings, clock) -> None:
    key = register_license(client, clock)
    assert re.fullmatch(r"ARDESIA(-[A-HJ-NP-Z2-9]{4}){4}", key)
    persisted = "\n".join(
        p.read_text(errors="replace") for p in settings.data_dir.rglob("*") if p.is_file()
    )
    assert key not in persisted
    assert sha256_hex(key) in persisted


def test_license_redeem_returns_entitlement(client, clock) -> None:
    key = register_license(client, clock)
    ent = redeem_license(client, key)
    assert ent["schoolId"] == SCOPE["schoolId"]
    assert ent["featureLookupKey"] == "tutor-monthly-15eur"


def test_registered_legacy_distribution_key_cannot_create_entitlement(client, settings, clock) -> None:
    key = "ELAB-AAAA-BBBB-CCCC-DDDD"
    store = FileStore(settings.data_dir)
    key_hash = register_license_key(store, key, dict(SCOPE), expires_at=clock.now_ms() + 60_000)
    path = f"entitlements/licenses/{key_hash}.json"
    before = read_json(store, path)
    response = client.post("/license/redeem", json={"licenseKey": key})
    assert response.status_code == 200
    assert response.json() == INVALID_BODY
    assert read_json(store, path) == before
    assert not (settings.data_dir / "entitlements/records").exists()


def test_license_redeem_failures_uniform(client, clock) -> None:
    """Sconosciuta, riusata, malformata: stesso status e stesso body."""
    key = register_license(client, clock)
    redeem_license(client, key)
    responses = [
        client.post("/license/redeem", json={"licenseKey": "ELAB-AAAA-BBBB-CCCC-DDDD"}),
        client.post("/license/redeem", json={"licenseKey": key}),
        client.post("/license/redeem", json={"licenseKey": "x"}),
    ]
    assert {r.status_code for r in responses} == {200}
    assert all(r.json() == INVALID_BODY for r in responses)


# --- ciclo token -------------------------------------------------------------


def test_token_issue_writes_sandbox_outbox_without_email(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    resp = client.post("/token/issue", json={"entitlementId": ent["id"], "email": EMAIL})
    assert resp.json() == {"ok": True}
    entries = read_outbox(settings)
    assert len(entries) == 1
    assert entries[0]["toHash"] == subject_hash(EMAIL)
    raw = (settings.outbox_dir / "outbox.jsonl").read_text()
    assert EMAIL not in raw  # email MAI persistita, solo hash


def test_token_issue_failure_uniform(client) -> None:
    resp = client.post("/token/issue", json={"entitlementId": "manca", "email": EMAIL})
    assert resp.status_code == 200
    assert resp.json() == {"ok": False}


def test_token_redeem_returns_new_session(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    token = issue_and_read_token(client, settings, ent["id"])
    resp = client.post("/token/redeem", json={"token": token})
    session = resp.json()["session"]
    assert session["entitlementId"] == ent["id"]
    assert re.fullmatch(r"[0-9a-f]{32}", session["sessionId"])
    assert session["sessionId"] != token


def test_token_reuse_denied(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    token = issue_and_read_token(client, settings, ent["id"])
    assert client.post("/token/redeem", json={"token": token}).json()["ok"] is True
    second = client.post("/token/redeem", json={"token": token})
    assert second.status_code == 200
    assert second.json() == INVALID_BODY


def test_token_ttl_expiry_via_clock(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    token = issue_and_read_token(client, settings, ent["id"])
    clock.advance(TOKEN_TTL_MS)
    assert client.post("/token/redeem", json={"token": token}).json() == INVALID_BODY


# --- revoca e access ---------------------------------------------------------


def test_revoke_requires_api_key(client, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    assert client.post(f"/entitlement/{ent['id']}/revoke").status_code == 401


def test_revoke_denies_access_and_tokens(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    token = issue_and_read_token(client, settings, ent["id"])
    resp = client.post(f"/entitlement/{ent['id']}/revoke", headers=ADMIN)
    assert resp.json() == {"ok": True}
    assert client.post("/token/redeem", json={"token": token}).json() == INVALID_BODY
    access = client.get(
        "/access",
        params={"school_id": SCOPE["schoolId"], "class_id": SCOPE["classId"]},
    )
    assert access.json() == {"access": False}


def test_access_check_scope_and_default_feature(client, clock) -> None:
    redeem_license(client, register_license(client, clock))
    params = {"school_id": SCOPE["schoolId"], "class_id": SCOPE["classId"]}
    assert client.get("/access", params=params).json() == {"access": True}  # default feature
    explicit = dict(params, feature="tutor-monthly-15eur")
    assert client.get("/access", params=explicit).json() == {"access": True}
    other_class = dict(params, class_id="ALTRA")
    assert client.get("/access", params=other_class).json() == {"access": False}
    other_feature = dict(params, feature="altra-feature")
    assert client.get("/access", params=other_feature).json() == {"access": False}


# --- GDPR-ready tecnico ------------------------------------------------------


def test_gdpr_export_returns_subject_records(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    client.post("/token/issue", json={"entitlementId": ent["id"], "email": EMAIL})
    subject = subject_hash(EMAIL)
    resp = client.get("/gdpr/export", params={"subject_hash": subject}, headers=ADMIN)
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["subjectHash"] == subject
    assert len(payload["outbox"]) == 1
    assert any(e.get("subjectHash") == subject for e in payload["audit"])
    # l'export non rigurgita il token in chiaro
    assert "token" not in payload["outbox"][0]


def test_gdpr_export_requires_api_key(client) -> None:
    resp = client.get("/gdpr/export", params={"subject_hash": "00"})
    assert resp.status_code == 401


def test_gdpr_delete_erases_subject(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    client.post("/token/issue", json={"entitlementId": ent["id"], "email": EMAIL})
    subject = subject_hash(EMAIL)
    resp = client.request(
        "DELETE", "/gdpr/subject", params={"subject_hash": subject}, headers=ADMIN
    )
    assert resp.status_code == 200
    assert resp.json()["ok"] is True
    after = client.get("/gdpr/export", params={"subject_hash": subject}, headers=ADMIN).json()
    assert after["outbox"] == []
    # in audit resta SOLO l'evento di cancellazione (prova di erasure)
    assert [e["event"] for e in after["audit"]] == ["gdpr.delete"]


def test_audit_trail_is_hashes_only(client, settings, clock) -> None:
    """Nessuna email in chiaro né token in chiaro in TUTTO il persistito audit."""
    ent = redeem_license(client, register_license(client, clock))
    token = issue_and_read_token(client, settings, ent["id"])
    client.post("/token/redeem", json={"token": token})
    audit_path = settings.data_dir / "audit.jsonl"
    assert audit_path.exists()
    raw = audit_path.read_text()
    assert EMAIL not in raw
    assert token not in raw
    events = [json.loads(line)["event"] for line in raw.splitlines() if line.strip()]
    assert "license.register" in events
    assert "license.redeem" in events
    assert "token.issue" in events
    assert "token.redeem" in events


def test_retention_config_exposed(client) -> None:
    resp = client.get("/gdpr/retention")
    assert resp.status_code == 200
    assert resp.json() == {"retentionDays": 30}


def test_purge_removes_entries_older_than_retention(client, settings, clock) -> None:
    ent = redeem_license(client, register_license(client, clock))
    client.post("/token/issue", json={"entitlementId": ent["id"], "email": EMAIL})
    assert len(read_outbox(settings)) == 1
    clock.advance(31 * 24 * 3_600_000)  # oltre i 30 giorni di retention
    resp = client.post("/gdpr/purge", headers=ADMIN)
    assert resp.status_code == 200
    body = resp.json()
    assert body["removedOutbox"] == 1
    assert body["removedAudit"] >= 1
    assert read_outbox(settings) == []


def test_healthz(client) -> None:
    assert client.get("/healthz").json() == {"ok": True}
