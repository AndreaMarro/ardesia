"""Optional HTTP adapter; the API owner supplies existing auth/store dependencies.

No independent app, session resolver, migrations or public release are started.
"""
from fastapi import Depends, Request

from ..models import StudyError
from .catalog import get_catalog
from .models import evaluate
from . import resources


def _keys(value, expected):
    if not isinstance(value, dict) or set(value) != set(expected):
        raise StudyError('invalid_science_request')


def install_science_library_routes(app, store_dependency, authenticate):
    @app.get('/study/editions/{edition_id}/science-library/catalog')
    def catalog(edition_id: str, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id)
        return get_catalog()

    @app.post('/study/editions/{edition_id}/science-library/evaluate')
    def evaluate_draft(edition_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id)
        _keys(body, ('capabilityId', 'capabilityVersion', 'implementationSha256', 'parameters', 'prediction'))
        if not isinstance(body['prediction'], str) or not body['prediction'].strip():
            raise StudyError('prediction_required')
        if (type(body['capabilityVersion']) is not int or body['capabilityVersion'] != 1
                or body['implementationSha256'] != resources.implementation_sha256()):
            raise StudyError('capability_version_unavailable', 409)
        snapshot = resources.new_snapshot(body['capabilityId'], body['parameters'], prediction=body['prediction'])
        return {'result': evaluate(snapshot['capabilityId'], snapshot['parameters']),
                'prediction': snapshot['prediction'], 'assessment': 'MODEL_COMPARISON_NOT_A_GRADE',
                'capabilityRef': {key: snapshot[key] for key in
                                  ('capabilityId', 'capabilityVersion', 'implementationSha256')}}

    @app.post('/study/editions/{edition_id}/science-library/resources')
    def create(edition_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _keys(body, ('snapshot',))
        return resources.save(store, principal, edition_id, body['snapshot'], request.headers.get('Idempotency-Key', ''))

    @app.post('/study/editions/{edition_id}/science-library/resources/{resource_id}/revise')
    def revise(edition_id: str, resource_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _keys(body, ('snapshot', 'expectedRevision'))
        return resources.save(store, principal, edition_id, body['snapshot'], request.headers.get('Idempotency-Key', ''),
                              resource_id=resource_id, expected_revision=body['expectedRevision'])

    @app.get('/study/science-library/resources/{resource_id}')
    def read(resource_id: str, revisionId: str, request: Request, store=Depends(store_dependency)):
        return resources.read(store, authenticate(request, store), resource_id, revisionId)

    @app.post('/study/science-library/resources/{resource_id}/compare')
    def compare(resource_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _keys(body, ('revisionId', 'prediction'))
        result = resources.compare(store, principal, resource_id, body['revisionId'], body['prediction'])
        return {**result, 'assessment': 'MODEL_COMPARISON_NOT_A_GRADE'}
