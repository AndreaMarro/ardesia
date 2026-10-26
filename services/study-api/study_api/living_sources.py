"""S18 additive installer. S00 supplies the existing request-store/auth boundaries."""
import json
from pathlib import Path
from fastapi import Depends, Request, Response
from lessonos.study import living_sources as core


def install_living_sources(app, authenticate, store_dependency, blob_dir: Path):
    @app.post('/study/living-sources')
    def create(body: dict, request: Request, store=Depends(store_dependency)):
        return core.save_source(store,authenticate(request,store),body.get('editionId'),body.get('document'),
            body.get('visibility','private'),request.headers.get('Idempotency-Key',''),blob_dir)

    @app.post('/study/living-sources/{rid}/revisions')
    def revise(rid: str,body: dict,request: Request,store=Depends(store_dependency)):
        principal=authenticate(request,store);current=store.get_resource(principal,rid)
        return core.save_source(store,principal,current['editionId'],body.get('document'),current['visibility'],
            request.headers.get('Idempotency-Key',''),blob_dir,resource_id=rid,expected_revision=body.get('expectedRevision'))

    @app.get('/study/living-sources/{rid}/revisions/{revision}')
    def source(rid: str,revision: str,request: Request,store=Depends(store_dependency)):
        return core.read_source(store,authenticate(request,store),rid,revision,blob_dir)

    @app.get('/study/living-sources/{rid}/revisions/{revision}/original')
    def original(rid: str,revision: str,request: Request,store=Depends(store_dependency)):
        data,descriptor=core.read_original(store,authenticate(request,store),rid,revision,blob_dir)
        return Response(data,media_type='application/pdf',headers={
            'Content-Disposition':'attachment; filename="original.pdf"','Cache-Control':'no-store',
            'X-Content-Type-Options':'nosniff','X-Study-Asset-Descriptor':json.dumps(descriptor,separators=(',',':'))})

    @app.post('/study/living-annotations')
    def annotate(body: dict,request: Request,store=Depends(store_dependency)):
        return core.save_annotation(store,authenticate(request,store),body.get('editionId'),body.get('annotation'),
            body.get('visibility','private'),request.headers.get('Idempotency-Key',''),blob_dir)

    @app.post('/study/living-annotations/{rid}/revisions')
    def revise_annotation(rid: str,body: dict,request: Request,store=Depends(store_dependency)):
        principal=authenticate(request,store);current=store.get_resource(principal,rid)
        return core.save_annotation(store,principal,current['editionId'],body.get('annotation'),current['visibility'],
            request.headers.get('Idempotency-Key',''),blob_dir,resource_id=rid,expected_revision=body.get('expectedRevision'))

    @app.get('/study/living-annotations/{rid}/revisions/{revision}')
    def annotation(rid: str,revision: str,request: Request,store=Depends(store_dependency)):
        return core.read_annotation(store,authenticate(request,store),rid,revision,blob_dir)

    @app.get('/study/living-annotations/{rid}/revisions/{revision}/export')
    def export(rid: str,revision: str,request: Request,store=Depends(store_dependency)):
        return core.export_bundle(store,authenticate(request,store),rid,revision,blob_dir)

    @app.post('/study/living-sources/import')
    def import_copy(body: dict,request: Request,store=Depends(store_dependency)):
        if isinstance(body.get('bundle'),dict) and isinstance(body['bundle'].get('original'),dict) and 'base64' in body['bundle']['original']:
            core.fail('source_original_upload_required',422)
        return core.import_bundle(store,authenticate(request,store),body.get('editionId'),body.get('bundle'),
            request.headers.get('Idempotency-Key',''),blob_dir)
