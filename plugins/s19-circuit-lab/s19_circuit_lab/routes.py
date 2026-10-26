"""Installer additivo: identità, store, errori e revoca sono dell'host."""

from pathlib import Path
from typing import Literal
from fastapi import Depends, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from lessonos.study.models import StudyError
from . import core
from .adapter import solve, export_document


class CircuitBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    editionId: str = Field(min_length=1, max_length=128)
    document: dict
    resourceId: str | None = None
    expectedRevision: str | None = None


class SubmissionBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expectedRevision: str = Field(min_length=1, max_length=128)


def _run(function, *args):
    try:
        return function(*args)
    except (ValueError, TypeError, KeyError, ZeroDivisionError) as exc:
        if isinstance(exc, StudyError):
            raise
        raise StudyError("s19_invalid_input", 422) from exc


def install(app, store_dependency, authenticate):
    """Stesso punto di innesto delle altre capacità; autenticazione solo Core."""
    base = "/study/s19/circuits"

    @app.post(base + "/solve")
    def calculate(body: CircuitBody, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        core._scope(store, principal, body.editionId)
        return _run(solve, body.document)

    @app.post(base)
    def save(body: CircuitBody, request: Request, store=Depends(store_dependency)):
        return _run(
            core.save,
            store,
            authenticate(request, store),
            body.editionId,
            body.document,
            request.headers.get("Idempotency-Key", ""),
            body.resourceId,
            body.expectedRevision,
        )

    @app.get(base + "/{resource_id}")
    def reopen(resource_id: str, request: Request, store=Depends(store_dependency)):
        return _run(core.reopen, store, authenticate(request, store), resource_id)

    @app.post(base + "/{resource_id}/submit")
    def submit(
        resource_id: str,
        body: SubmissionBody,
        request: Request,
        store=Depends(store_dependency),
    ):
        return _run(
            core.submit_attempt,
            store,
            authenticate(request, store),
            resource_id,
            body.expectedRevision,
            request.headers.get("Idempotency-Key", ""),
        )

    @app.post(base + "/export/{format}")
    def export(
        format: Literal["json", "spice", "circuitikz"],
        body: CircuitBody,
        request: Request,
        store=Depends(store_dependency),
    ):
        principal = authenticate(request, store)
        core._scope(store, principal, body.editionId)
        content = _run(export_document, body.document, format)
        return Response(
            content, media_type="text/plain", headers={"Cache-Control": "no-store"}
        )

    frontend = Path(__file__).resolve().parents[1] / "web/dist"
    if frontend.is_dir():
        app.mount(
            "/s19/circuit-lab",
            StaticFiles(directory=frontend, html=True),
            name="s19-circuit-lab",
        )
