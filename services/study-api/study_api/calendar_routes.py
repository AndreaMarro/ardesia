"""Authenticated calendar projection endpoints; no administrative date input."""
from typing import Literal
from fastapi import Depends,Request,Response
from pydantic import BaseModel,ConfigDict,Field
from lessonos.study import calendar


class PreviewBody(BaseModel):
    model_config=ConfigDict(extra='forbid')
    editionId:str=Field(min_length=1,max_length=8192)
    provider:Literal['mock','ics','google']
    ttl:int=Field(default=300,ge=1,le=3600,strict=True)


class ConfirmBody(BaseModel):
    model_config=ConfigDict(extra='forbid')
    editionId:str=Field(min_length=1,max_length=8192)
    previewId:str=Field(pattern='^[0-9a-f]{32}$')
    previewHash:str=Field(pattern='^[0-9a-f]{64}$')
    sourceVersion:str=Field(pattern='^[0-9a-f]{64}$')
    confirmed:bool=Field(strict=True)


class ReconcileBody(BaseModel):
    model_config=ConfigDict(extra='forbid')
    editionId:str=Field(min_length=1,max_length=8192)
    targetId:str=Field(pattern='^[0-9a-f]{32}$')


def install_calendar_routes(app,store_dependency,authenticate,provider):
    @app.get('/study/calendar/capabilities')
    def capabilities(request:Request,store=Depends(store_dependency)):
        store._principal(authenticate(request,store))
        return calendar.capabilities(store)

    @app.post('/study/calendar/preview')
    def preview(body:PreviewBody,request:Request,store=Depends(store_dependency)):
        return calendar.preview_schedule(store,authenticate(request,store),body.editionId,body.provider,request.headers.get('Idempotency-Key',''),body.ttl)

    @app.post('/study/calendar/confirm')
    def confirm(body:ConfirmBody,request:Request,store=Depends(store_dependency)):
        return calendar.confirm_schedule(store,authenticate(request,store),body.editionId,body.previewId,body.previewHash,body.sourceVersion,body.confirmed,request.headers.get('Idempotency-Key',''),provider)

    @app.get('/study/calendar/ics')
    def ics(editionId:str,previewId:str,request:Request,store=Depends(store_dependency)):
        content=calendar.get_ics(store,authenticate(request,store),editionId,previewId)
        return Response(content,media_type='text/calendar',headers={'Content-Disposition':'attachment; filename="ardesia-sessions.ics"','Cache-Control':'no-store'})

    @app.post('/study/calendar/reconcile')
    def reconcile(body:ReconcileBody,request:Request,store=Depends(store_dependency)):
        return calendar.reconcile_calendar(store,authenticate(request,store),body.editionId,body.targetId,provider)
