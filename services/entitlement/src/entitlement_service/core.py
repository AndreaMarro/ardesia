"""Port 1:1 di apps/studio/src/entitlements/entitlementCore.ts (NOTTE-11).

Catena: license key ARDESIA-XXXX-XXXX-XXXX-XXXX -> redeem_license_key ->
EntitlementRecord {schoolId, classId, featureLookupKey, expiresAt} ->
issue_access_token (token 128-bit CSPRNG consegnato SOLO via MailSink;
nello store solo SHA-256 + TTL 15 min + used) -> redeem_access_token ->
sessione NUOVA (anti-fixation).

Proprietà di sicurezza (stesse del core TS, verificate in tests/test_core.py):
- chiavi e token MAI in chiaro nello store (solo hash sha256);
- confronto hash constant-time (hmac.compare_digest);
- one-time: used=True al primo redeem valido;
- risposta di errore IDENTICA per ogni causa (anti-enumeration);
- revoca entitlement nega accesso e token;
- nessuna PII persistita (l'email attraversa solo il MailSink).

I record su disco usano gli STESSI path e le STESSE shape camelCase del
core TS: i due store sono interscambiabili.
"""

from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from typing import Any
from urllib.parse import quote

from .mail import MailSink
from .store import Store, read_json, write_json

# Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L) — pattern classroom.
KEY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
KEY_GROUPS = 4
KEY_GROUP_LEN = 4
LICENSE_KEY_PATTERN = re.compile(r"^ARDESIA(-[A-HJ-NP-Z2-9]{4}){4}$")

TOKEN_TTL_MS = 15 * 60_000  # norma magic-link 10-15 min (OWASP-aligned)
TOKEN_BYTES = 16  # 128 bit


def invalid() -> dict[str, Any]:
    """Risposta generica UNICA per ogni fallimento (anti-enumeration)."""
    return {"ok": False, "reason": "invalid"}


INVALID = invalid()

Scope = dict[str, str]  # schoolId, classId, featureLookupKey


def license_path(key_hash: str) -> str:
    return f"entitlements/licenses/{key_hash}.json"


def entitlement_path(entitlement_id: str) -> str:
    return f"entitlements/records/{entitlement_id}.json"


def token_path(token_hash: str) -> str:
    return f"entitlements/tokens/{token_hash}.json"


def scope_latest_path(scope: Scope) -> str:
    # encodeURIComponent-equivalente: quote con safe="" (come il core TS).
    parts = (
        quote(scope["schoolId"], safe=""),
        quote(scope["classId"], safe=""),
        quote(scope["featureLookupKey"], safe=""),
    )
    return f"entitlements/by-scope/{parts[0]}/{parts[1]}/{parts[2]}/latest.json"


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def subject_hash(email: str) -> str:
    """Pseudonimo GDPR del soggetto: sha256 dell'email normalizzata.
    L'email in chiaro non lascia mai il processo."""
    return sha256_hex(email.strip().lower())


def timing_safe_equal_hex(a: str, b: str) -> bool:
    """Confronto constant-time (stesso contratto di timingSafeEqualHex TS)."""
    return hmac.compare_digest(a.encode(), b.encode())


def generate_license_key() -> str:
    groups = (
        "".join(secrets.choice(KEY_ALPHABET) for _ in range(KEY_GROUP_LEN))
        for _ in range(KEY_GROUPS)
    )
    return "ARDESIA-" + "-".join(groups)


def register_license_key(store: Store, raw_key: str, scope: Scope, expires_at: int) -> str:
    """Registra una chiave emessa: nello store SOLO l'hash + scope + scadenza."""
    key_hash = sha256_hex(raw_key)
    write_json(
        store,
        license_path(key_hash),
        {
            "v": 1,
            "keyHash": key_hash,
            "schoolId": scope["schoolId"],
            "classId": scope["classId"],
            "featureLookupKey": scope["featureLookupKey"],
            "expiresAt": expires_at,
            "redeemed": False,
        },
    )
    return key_hash


def redeem_license_key(store: Store, raw_key: str, now: int) -> dict[str, Any]:
    """Redeem one-time della chiave -> EntitlementRecord attivo.
    Ogni fallimento (sconosciuta, già usata, scaduta, corrotta) restituisce la
    STESSA risposta generica: mai rivelare quale controllo è fallito."""
    # Retired distribution formats cannot grant access; existing records stay intact.
    if LICENSE_KEY_PATTERN.fullmatch(raw_key) is None:
        return invalid()
    key_hash = sha256_hex(raw_key)
    license_record = read_json(store, license_path(key_hash))
    if (
        license_record is None
        or license_record.get("v") != 1
        or not timing_safe_equal_hex(str(license_record.get("keyHash", "")), key_hash)
        or license_record.get("redeemed")
        or license_record.get("expiresAt", 0) <= now
    ):
        return invalid()

    entitlement = {
        "id": secrets.token_hex(8),
        "schoolId": license_record["schoolId"],
        "classId": license_record["classId"],
        "featureLookupKey": license_record["featureLookupKey"],
        "redeemedAt": now,
        "expiresAt": license_record["expiresAt"],
        "revokedAt": None,
    }
    write_json(store, license_path(key_hash), {**license_record, "redeemed": True})
    write_json(store, entitlement_path(entitlement["id"]), entitlement)
    write_json(store, scope_latest_path(entitlement), {"id": entitlement["id"]})
    return {"ok": True, "entitlement": entitlement}


def _read_active_entitlement(store: Store, entitlement_id: str, now: int) -> dict | None:
    record = read_json(store, entitlement_path(entitlement_id))
    if record is None or record.get("revokedAt") is not None or record.get("expiresAt", 0) <= now:
        return None
    return record


def issue_access_token(
    store: Store, entitlement_id: str, email: str, sink: MailSink, now: int
) -> dict[str, Any]:
    """Emette un token one-time e lo consegna SOLO al MailSink.
    Nello store finisce l'hash, mai il token né l'email."""
    if _read_active_entitlement(store, entitlement_id, now) is None:
        return {"ok": False}

    token = secrets.token_hex(TOKEN_BYTES)
    write_json(
        store,
        token_path(sha256_hex(token)),
        {
            "v": 1,
            "tokenHash": sha256_hex(token),
            "entitlementId": entitlement_id,
            "issuedAt": now,
            "expiresAt": now + TOKEN_TTL_MS,
            "used": False,
        },
    )
    sink.deliver_token(to=email, token=token)
    return {"ok": True}


def redeem_access_token(store: Store, raw_token: str, now: int) -> dict[str, Any]:
    """Redeem one-time del token: hash del presentato, confronto constant-time,
    TTL, used-flag, entitlement ancora attivo. Sessione NUOVA a ogni redeem
    valido (mai riusare il token come identificatore di sessione)."""
    token_hash = sha256_hex(raw_token)
    stored = read_json(store, token_path(token_hash))
    if (
        stored is None
        or stored.get("v") != 1
        or not timing_safe_equal_hex(str(stored.get("tokenHash", "")), token_hash)
        or stored.get("used")
        or stored.get("expiresAt", 0) <= now
    ):
        return invalid()
    if _read_active_entitlement(store, stored["entitlementId"], now) is None:
        return invalid()

    write_json(store, token_path(token_hash), {**stored, "used": True})
    return {
        "ok": True,
        "session": {
            "sessionId": secrets.token_hex(TOKEN_BYTES),
            "entitlementId": stored["entitlementId"],
        },
    }


def revoke_entitlement(store: Store, entitlement_id: str, now: int) -> None:
    """Revoca immediata: nega check_access e ogni token futuro. Idempotente."""
    record = read_json(store, entitlement_path(entitlement_id))
    if record is None:
        return
    write_json(store, entitlement_path(entitlement_id), {**record, "revokedAt": now})


def check_access(store: Store, scope: Scope, now: int) -> bool:
    """Accesso per scope: esiste un entitlement attivo (non revocato, non scaduto)."""
    latest = read_json(store, scope_latest_path(scope))
    if latest is None or "id" not in latest:
        return False
    return _read_active_entitlement(store, str(latest["id"]), now) is not None
