"""Port 1:1 della logica di apps/studio/src/entitlements/entitlementCore.ts.

Proprietà verificate (stesse del core TS):
- hash-only storage (chiavi e token MAI in chiaro nello store);
- contratto anti-enumerazione: ogni causa di fallimento -> IDENTICO
  {"ok": False, "reason": "invalid"};
- one-time redeem (chiave e token);
- TTL token 15 minuti;
- sessione NUOVA a ogni redeem valido (anti-fixation);
- revoca nega accesso e token;
- confronto constant-time.
"""

from __future__ import annotations

import re

from entitlement_service import core
from entitlement_service.core import (
    INVALID,
    LICENSE_KEY_PATTERN,
    TOKEN_TTL_MS,
    check_access,
    generate_license_key,
    issue_access_token,
    redeem_access_token,
    redeem_license_key,
    register_license_key,
    revoke_entitlement,
    sha256_hex,
    timing_safe_equal_hex,
)
from entitlement_service.mail import MemoryMailSink
from entitlement_service.store import FileStore, read_json, write_json

NOW = 1_760_000_000_000
SCOPE = {
    "schoolId": "scuola-1",
    "classId": "3B",
    "featureLookupKey": "tutor-monthly-15eur",
}
EXPIRES = NOW + 365 * 24 * 3_600_000


def make_store(tmp_path) -> FileStore:
    return FileStore(tmp_path / "data")


def scan_files(root) -> str:
    """Concatena il contenuto di tutti i file sotto root (audit del persistito)."""
    chunks = []
    if root.exists():
        for path in sorted(root.rglob("*")):
            if path.is_file():
                chunks.append(path.read_text(errors="replace"))
    return "\n".join(chunks)


def register(store, key: str) -> None:
    register_license_key(store, key, dict(SCOPE), expires_at=EXPIRES)


# --- chiavi di licenza -------------------------------------------------------


def test_generated_key_matches_pattern() -> None:
    for _ in range(20):
        key = generate_license_key()
        assert re.fullmatch(r"ARDESIA(-[A-HJ-NP-Z2-9]{4}){4}", key)
        assert re.fullmatch(LICENSE_KEY_PATTERN, key)


def test_register_stores_only_hash(tmp_path) -> None:
    store = make_store(tmp_path)
    key = generate_license_key()
    register(store, key)
    persisted = scan_files(tmp_path)
    assert key not in persisted
    assert sha256_hex(key) in persisted


def test_redeem_valid_key_returns_entitlement(tmp_path) -> None:
    store = make_store(tmp_path)
    key = generate_license_key()
    register(store, key)
    result = redeem_license_key(store, key, NOW)
    assert result["ok"] is True
    ent = result["entitlement"]
    assert ent["schoolId"] == SCOPE["schoolId"]
    assert ent["classId"] == SCOPE["classId"]
    assert ent["featureLookupKey"] == SCOPE["featureLookupKey"]
    assert ent["redeemedAt"] == NOW
    assert ent["expiresAt"] == EXPIRES
    assert ent["revokedAt"] is None


def test_redeem_unknown_key_invalid(tmp_path) -> None:
    store = make_store(tmp_path)
    assert redeem_license_key(store, generate_license_key(), NOW) == INVALID


def test_redeem_is_one_time(tmp_path) -> None:
    store = make_store(tmp_path)
    key = generate_license_key()
    register(store, key)
    assert redeem_license_key(store, key, NOW)["ok"] is True
    assert redeem_license_key(store, key, NOW) == INVALID


def test_redeem_expired_license_invalid(tmp_path) -> None:
    store = make_store(tmp_path)
    key = generate_license_key()
    register(store, key)
    assert redeem_license_key(store, key, EXPIRES) == INVALID


def test_key_failure_responses_identical(tmp_path) -> None:
    """Anti-enumerazione: sconosciuta, già usata, scaduta -> STESSA risposta."""
    store = make_store(tmp_path)
    used = generate_license_key()
    register(store, used)
    redeem_license_key(store, used, NOW)
    expired = generate_license_key()
    register(store, expired)

    responses = [
        redeem_license_key(store, generate_license_key(), NOW),  # sconosciuta
        redeem_license_key(store, used, NOW),  # già usata
        redeem_license_key(store, expired, EXPIRES + 1),  # scaduta
        redeem_license_key(store, "non-formato-valido", NOW),  # malformata
    ]
    assert all(r == INVALID for r in responses)
    assert len({tuple(sorted(r.items())) for r in responses}) == 1


# --- token di accesso --------------------------------------------------------


def redeemed_entitlement(tmp_path):
    store = make_store(tmp_path)
    key = generate_license_key()
    register(store, key)
    ent = redeem_license_key(store, key, NOW)["entitlement"]
    return store, ent


def test_issue_token_delivers_via_sink_and_stores_only_hash(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    result = issue_access_token(store, ent["id"], "docente@example.invalid", sink, NOW)
    assert result == {"ok": True}
    assert len(sink.deliveries) == 1
    token = sink.deliveries[0]["token"]
    assert re.fullmatch(r"[0-9a-f]{32}", token)  # 128 bit hex
    persisted = scan_files(tmp_path)
    assert token not in persisted  # mai il token in chiaro
    assert "docente@example.invalid" not in persisted  # mai l'email
    assert sha256_hex(token) in persisted


def test_issue_token_unknown_entitlement_fails(tmp_path) -> None:
    store = make_store(tmp_path)
    sink = MemoryMailSink()
    assert issue_access_token(store, "manca", "a@example.invalid", sink, NOW) == {"ok": False}
    assert sink.deliveries == []


def test_issue_token_revoked_entitlement_fails(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    revoke_entitlement(store, ent["id"], NOW)
    sink = MemoryMailSink()
    assert issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW) == {"ok": False}


def test_redeem_token_returns_new_session(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    token = sink.deliveries[0]["token"]
    result = redeem_access_token(store, token, NOW + 1_000)
    assert result["ok"] is True
    session = result["session"]
    assert session["entitlementId"] == ent["id"]
    assert re.fullmatch(r"[0-9a-f]{32}", session["sessionId"])
    assert session["sessionId"] != token  # anti-fixation: mai il token come sessione


def test_sessions_differ_between_redeems(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    sessions = set()
    for _ in range(2):
        issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
        token = sink.deliveries[-1]["token"]
        sessions.add(redeem_access_token(store, token, NOW)["session"]["sessionId"])
    assert len(sessions) == 2


def test_token_is_one_time(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    token = sink.deliveries[0]["token"]
    assert redeem_access_token(store, token, NOW)["ok"] is True
    assert redeem_access_token(store, token, NOW) == INVALID  # riuso negato


def test_token_expires_after_ttl(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    token = sink.deliveries[0]["token"]
    assert redeem_access_token(store, token, NOW + TOKEN_TTL_MS) == INVALID


def test_token_valid_just_before_ttl(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    token = sink.deliveries[0]["token"]
    assert redeem_access_token(store, token, NOW + TOKEN_TTL_MS - 1)["ok"] is True


def test_token_denied_after_revoke(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    token = sink.deliveries[0]["token"]
    revoke_entitlement(store, ent["id"], NOW)
    assert redeem_access_token(store, token, NOW) == INVALID


def test_token_failure_responses_identical(tmp_path) -> None:
    """Anti-enumerazione lato token: ogni causa -> IDENTICO invalid."""
    store, ent = redeemed_entitlement(tmp_path)
    sink = MemoryMailSink()
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    used = sink.deliveries[0]["token"]
    redeem_access_token(store, used, NOW)
    issue_access_token(store, ent["id"], "a@example.invalid", sink, NOW)
    expired = sink.deliveries[1]["token"]

    responses = [
        redeem_access_token(store, "0" * 32, NOW),  # sconosciuto
        redeem_access_token(store, used, NOW),  # già usato
        redeem_access_token(store, expired, NOW + TOKEN_TTL_MS),  # scaduto
        redeem_access_token(store, "garbage", NOW),  # malformato
    ]
    assert all(r == INVALID for r in responses)
    assert len({tuple(sorted(r.items())) for r in responses}) == 1


# --- revoca e access check ---------------------------------------------------


def test_check_access_active_scope(tmp_path) -> None:
    store, _ = redeemed_entitlement(tmp_path)
    assert check_access(store, dict(SCOPE), NOW) is True


def test_check_access_unknown_scope(tmp_path) -> None:
    store, _ = redeemed_entitlement(tmp_path)
    other = dict(SCOPE, classId="ALTRA")
    assert check_access(store, other, NOW) is False


def test_check_access_denied_after_revoke(tmp_path) -> None:
    store, ent = redeemed_entitlement(tmp_path)
    revoke_entitlement(store, ent["id"], NOW)
    assert check_access(store, dict(SCOPE), NOW) is False


def test_check_access_denied_after_expiry(tmp_path) -> None:
    store, _ = redeemed_entitlement(tmp_path)
    assert check_access(store, dict(SCOPE), EXPIRES) is False


def test_revoke_missing_entitlement_is_noop(tmp_path) -> None:
    store = make_store(tmp_path)
    revoke_entitlement(store, "inesistente", NOW)  # non deve sollevare


# --- primitive crittografiche ------------------------------------------------


def test_timing_safe_equal_hex() -> None:
    assert timing_safe_equal_hex("abcd", "abcd") is True
    assert timing_safe_equal_hex("abcd", "abce") is False
    assert timing_safe_equal_hex("abcd", "abc") is False


def test_compare_is_constant_time_primitive() -> None:
    """Il confronto deve poggiare su hmac.compare_digest (constant-time)."""
    import inspect

    source = inspect.getsource(core)
    assert "compare_digest" in source


# Distribution-format change does not migrate or rebind redeemed access records.
def test_rejects_registered_legacy_or_noncanonical_keys_without_writes(tmp_path) -> None:
    for key in ("ELAB-AAAA-BBBB-CCCC-DDDD", "ARDESIA-AAAA-BBBB-CCCC-DDDD\n"):
        store = make_store(tmp_path)
        register(store, key)
        before = scan_files(tmp_path)
        assert redeem_license_key(store, key, NOW) == INVALID
        assert redeem_license_key(store, key.replace("ELAB-", "ARDESIA-", 1), NOW) == INVALID
        assert scan_files(tmp_path) == before
        assert check_access(store, dict(SCOPE), NOW) is False


def test_pattern_rejects_legacy_prefix() -> None:
    assert LICENSE_KEY_PATTERN.fullmatch("ARDESIA-AAAA-BBBB-CCCC-DDDD")
    assert not LICENSE_KEY_PATTERN.fullmatch("ELAB-AAAA-BBBB-CCCC-DDDD")


def test_existing_grant_and_outstanding_token_remain_valid_without_rebind(tmp_path) -> None:
    store = make_store(tmp_path)
    key = "ELAB-AAAA-BBBB-CCCC-DDDD"
    key_hash = sha256_hex(key)
    raw_token = "0123456789abcdef" * 2
    token_hash = sha256_hex(raw_token)
    entitlement = dict(SCOPE, id="existing-grant", redeemedAt=NOW - 1000, expiresAt=EXPIRES, revokedAt=None)
    record_path = "entitlements/records/existing-grant.json"
    license_path = f"entitlements/licenses/{key_hash}.json"
    scope_path = "entitlements/by-scope/scuola-1/3B/tutor-monthly-15eur/latest.json"
    write_json(store, license_path, dict(SCOPE, v=1, keyHash=key_hash, expiresAt=EXPIRES, redeemed=True))
    write_json(store, record_path, entitlement)
    write_json(store, scope_path, {"id": entitlement["id"]})
    write_json(store, f"entitlements/tokens/{token_hash}.json", {"v": 1, "tokenHash": token_hash, "entitlementId": entitlement["id"], "issuedAt": NOW - 1000, "expiresAt": NOW + TOKEN_TTL_MS, "used": False})
    original_records = {path: read_json(store, path) for path in (record_path, license_path, scope_path)}
    assert redeem_license_key(store, key, NOW) == INVALID
    assert check_access(store, dict(SCOPE), NOW) is True
    result = redeem_access_token(store, raw_token, NOW)
    assert result["ok"] is True
    assert result["session"]["entitlementId"] == entitlement["id"]
    assert {path: read_json(store, path) for path in original_records} == original_records
    assert redeem_access_token(store, raw_token, NOW + 1) == INVALID
