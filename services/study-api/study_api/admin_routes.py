"""Teacher management, over the same authenticated request store and Core."""
from typing import Literal,Annotated
from fastapi import Depends,Request,Path
from pydantic import BaseModel,ConfigDict,Field
from lessonos.study import editions


EditionIdentifier=Annotated[str,Path(min_length=1,max_length=8192)]


class StrictBody(BaseModel):
    model_config=ConfigDict(extra='forbid')


class CreateBody(StrictBody):
    packId:str=Field(strict=True,min_length=1,max_length=128)
    packVersion:int=Field(strict=True,ge=1,le=2**31-1)
    capacity:int=Field(strict=True,ge=1,le=10)
    priceMinor:int=Field(strict=True,ge=3900,le=4900)


class StartBody(StrictBody):
    localStart:str=Field(strict=True,pattern=r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$')
    occurrence:Literal['earlier','later']|None=None


class EditBody(StrictBody):
    expectedRevision:int=Field(strict=True,ge=0,le=editions.MAX_REVISION)
    capacity:int=Field(strict=True,ge=1,le=10)
    priceMinor:int=Field(strict=True,ge=3900,le=4900)
    starts:list[StartBody]=Field(min_length=4,max_length=4)


class PreviewBody(StrictBody):
    expectedRevision:int=Field(strict=True,ge=0,le=editions.MAX_REVISION)
    ttl:int=Field(strict=True,default=300,ge=1,le=900)


class ConfirmBody(StrictBody):
    previewId:str=Field(strict=True,pattern='^[0-9a-f]{32}$')
    previewHash:str=Field(strict=True,pattern='^[0-9a-f]{64}$')
    expectedRevision:int=Field(strict=True,ge=0,le=editions.MAX_REVISION)
    confirmed:bool=Field(strict=True)


def install_admin_routes(app,store_dependency,authenticate):
    @app.get('/study/admin/coursepacks')
    def coursepacks(request:Request,includeInventory:bool=False,store=Depends(store_dependency)):
        return editions.registry(store,authenticate(request,store),include_inventory=includeInventory)

    @app.post('/study/admin/editions')
    def create(body:CreateBody,request:Request,store=Depends(store_dependency)):
        return editions.create_draft(store,authenticate(request,store),body.packId,body.packVersion,
            body.capacity,body.priceMinor,request.headers.get('Idempotency-Key',''))

    @app.get('/study/admin/editions/{edition_id}')
    def get(edition_id:EditionIdentifier,request:Request,store=Depends(store_dependency)):
        return editions.admin_edition(store,authenticate(request,store),edition_id)

    @app.patch('/study/admin/editions/{edition_id}')
    def edit(edition_id:EditionIdentifier,body:EditBody,request:Request,store=Depends(store_dependency)):
        return editions.edit_draft(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),
            revision=body.expectedRevision,capacity=body.capacity,price_minor=body.priceMinor,
            starts=[item.model_dump(exclude_none=True) for item in body.starts])

    @app.post('/study/admin/editions/{edition_id}/offer/preview')
    def preview(edition_id:EditionIdentifier,body:PreviewBody,request:Request,store=Depends(store_dependency)):
        return editions.preview_offer(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),
            revision=body.expectedRevision,ttl=body.ttl)

    @app.post('/study/admin/editions/{edition_id}/offer/confirm')
    def confirm(edition_id:EditionIdentifier,body:ConfirmBody,request:Request,store=Depends(store_dependency)):
        return editions.offer_edition(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),
            confirmed=body.confirmed,preview_id=body.previewId,preview_hash=body.previewHash,revision=body.expectedRevision)
