"""FastAPI entitlement service — sandbox GDPR-ready.

Piani:
- pubblico: /license/redeem, /token/issue, /token/redeem, /access, /healthz,
  /gdpr/retention. Ogni fallimento risponde con lo STESSO status 200 e lo
  STESSO body generico (anti-enumeration: nessun oracolo su quale controllo
  è fallito).
- authority (header X-API-Key == env ENTITLEMENT_API_KEY, confronto
  constant-time): /license/register, /entitlement/{id}/revoke, /gdpr/export,
  /gdpr/subject (DELETE), /gdpr/purge. Senza chiave configurata il piano
  authority risponde 503 (deny-by-default, nessuna chiave di fabbrica).
"""

from __future__ import annotations

import hmac

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from pydantic import BaseModel, Field

from . import core
from .audit import AuditLog
from .jsonl import read_entries, rewrite_keeping
from .mail import JsonlMailSink
from .settings import Settings
from .store import FileStore

DEFAULT_FEATURE = "tutor-monthly-15eur"  # featureLookupKey sandbox


class RegisterLicenseBody(BaseModel):
    schoolId: str = Field(min_length=1)
    classId: str = Field(min_length=1)
    featureLookupKey: str = DEFAULT_FEATURE
    expiresAt: int


class RedeemLicenseBody(BaseModel):
    licenseKey: str


class IssueTokenBody(BaseModel):
    entitlementId: str
    email: str


class RedeemTokenBody(BaseModel):
    token: str


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    store = FileStore(settings.data_dir)
    audit = AuditLog(settings.data_dir / "audit.jsonl", settings.clock_ms)
    sink = JsonlMailSink(settings.outbox_dir, settings.clock_ms, core.subject_hash)

    def now() -> int:
        return settings.clock_ms()

    def require_api_key(
        x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    ) -> None:
        if settings.api_key is None:
            # Deny-by-default: piano authority non configurato.
            raise HTTPException(status_code=503, detail="authority plane not configured")
        presented = x_api_key or ""
        # Confronto constant-time su digest a lunghezza fissa (niente leak
        # di lunghezza della chiave).
        if not hmac.compare_digest(
            core.sha256_hex(presented), core.sha256_hex(settings.api_key)
        ):
            raise HTTPException(status_code=401, detail="unauthorized")

    authority = Depends(require_api_key)
    app = FastAPI(title="ARDESIA Entitlement Service (sandbox)", version="0.1.0")

    @app.get("/healthz")
    def healthz() -> dict:
        return {"ok": True}

    # --- piano authority -----------------------------------------------------

    @app.post("/license/register", dependencies=[authority])
    def register_license(body: RegisterLicenseBody) -> dict:
        raw_key = core.generate_license_key()
        key_hash = core.register_license_key(
            store,
            raw_key,
            {
                "schoolId": body.schoolId,
                "classId": body.classId,
                "featureLookupKey": body.featureLookupKey,
            },
            expires_at=body.expiresAt,
        )
        audit.append("license.register", keyHash=key_hash)
        # Unico momento in cui la chiave in chiaro esiste: la risposta
        # all'authority. Nello store resta solo l'hash.
        return {"ok": True, "licenseKey": raw_key, "keyHash": key_hash}

    @app.post("/entitlement/{entitlement_id}/revoke", dependencies=[authority])
    def revoke(entitlement_id: str) -> dict:
        core.revoke_entitlement(store, entitlement_id, now())
        audit.append("entitlement.revoke", entitlementId=entitlement_id)
        return {"ok": True}

    # --- piano pubblico ------------------------------------------------------

    @app.post("/license/redeem")
    def redeem_license(body: RedeemLicenseBody) -> dict:
        result = core.redeem_license_key(store, body.licenseKey, now())
        audit.append(
            "license.redeem", ok=result["ok"], keyHash=core.sha256_hex(body.licenseKey)
        )
        return result

    @app.post("/token/issue")
    def issue_token(body: IssueTokenBody) -> dict:
        result = core.issue_access_token(store, body.entitlementId, body.email, sink, now())
        audit.append(
            "token.issue",
            ok=result["ok"],
            entitlementId=body.entitlementId,
            subjectHash=core.subject_hash(body.email),
        )
        return result

    @app.post("/token/redeem")
    def redeem_token(body: RedeemTokenBody) -> dict:
        result = core.redeem_access_token(store, body.token, now())
        audit.append("token.redeem", ok=result["ok"], tokenHash=core.sha256_hex(body.token))
        return result

    @app.get("/access")
    def access(
        school_id: str = Query(min_length=1),
        class_id: str = Query(min_length=1),
        feature: str = Query(default=DEFAULT_FEATURE),
    ) -> dict:
        scope = {"schoolId": school_id, "classId": class_id, "featureLookupKey": feature}
        return {"access": core.check_access(store, scope, now())}

    # --- GDPR-ready tecnico ---------------------------------------------------

    @app.get("/gdpr/retention")
    def retention() -> dict:
        return {"retentionDays": settings.retention_days}

    @app.get("/gdpr/export", dependencies=[authority])
    def gdpr_export(subject_hash: str = Query(min_length=1)) -> dict:
        outbox_entries = [
            {
                "ts": e.get("ts"),
                "toHash": e.get("toHash"),
                # mai rigurgitare il token in chiaro fuori dall'outbox
                "tokenHash": core.sha256_hex(str(e.get("token", ""))),
            }
            for e in read_entries(sink.path)
            if e.get("toHash") == subject_hash
        ]
        audit_entries = audit.for_subject(subject_hash)
        audit.append("gdpr.export", subjectHash=subject_hash)
        return {
            "subjectHash": subject_hash,
            "outbox": outbox_entries,
            "audit": audit_entries,
        }

    @app.delete("/gdpr/subject", dependencies=[authority])
    def gdpr_delete(subject_hash: str = Query(min_length=1)) -> dict:
        removed_outbox = rewrite_keeping(
            sink.path, lambda e: e.get("toHash") != subject_hash
        )
        removed_audit = audit.erase_subject(subject_hash)
        return {"ok": True, "removedOutbox": removed_outbox, "removedAudit": removed_audit}

    @app.post("/gdpr/purge", dependencies=[authority])
    def gdpr_purge() -> dict:
        cutoff = now() - settings.retention_days * 24 * 3_600_000
        removed_outbox = rewrite_keeping(sink.path, lambda e: e.get("ts", 0) >= cutoff)
        removed_audit = audit.purge_older_than(cutoff)
        audit.append(
            "gdpr.purge", removedOutbox=removed_outbox, removedAudit=removed_audit
        )
        return {"ok": True, "removedOutbox": removed_outbox, "removedAudit": removed_audit}

    return app


# Entry point uvicorn: uv run uvicorn entitlement_service.app:app
app = create_app()
