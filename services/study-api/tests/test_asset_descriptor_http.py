"""An original's descriptor and bytes share the existing authorization path."""
from hashlib import sha256
from io import BytesIO
import json

from fastapi.testclient import TestClient
from pypdf import PdfWriter
from study_api.app import create_app
from test_identity import setup_store


def pdf_bytes():
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=400)
    out = BytesIO()
    writer.write(out)
    return out.getvalue()


def test_exact_original_descriptor_is_only_disclosed_with_authorized_bytes(tmp_path):
    store, tutor, owner, peer, other = setup_store(tmp_path)
    original = pdf_bytes()
    with TestClient(create_app(store.path, demo=True)) as client:
        def login(actor):
            assert client.post('/study/session', json={'token': store.issue_session(actor)}).status_code == 200

        login(owner)
        uploaded = client.post('/study/assets?editionId=fluidi', content=original,
                               headers={'Content-Type': 'application/pdf', 'Idempotency-Key': 'original'})
        assert uploaded.status_code == 200
        asset_id = uploaded.json()['id']
        path = '/study/assets/' + asset_id
        response = client.get(path)
        assert response.status_code == 200 and response.content == original
        descriptor = json.loads(response.headers['X-Study-Asset-Descriptor'])
        assert descriptor == {
            'id': asset_id, 'editionId': 'fluidi', 'kind': 'immutable-upload',
            'mime': 'application/pdf', 'bytes': len(original),
            'sha256': sha256(original).hexdigest(), 'extractionStatus': 'needs_clarification',
        }
        assert response.headers['cache-control'] == 'no-store'
        assert 'attachment' in response.headers['content-disposition']
        assert 'blob_ref' not in str(descriptor)
        for actor in [peer, other, tutor]:
            login(actor)
            denied = client.get(path)
            assert denied.status_code == 403
            assert 'X-Study-Asset-Descriptor' not in denied.headers

        login(owner)
        submission = client.post('/study/submissions', json={
            'editionId': 'fluidi', 'activityId': 'poiseuille-v1',
            'text': 'Procedimento originale sintetico', 'assetRefs': [asset_id],
        }, headers={'Idempotency-Key': 'submit-original'})
        assert submission.status_code == 200
        login(tutor)
        shared = client.get(path)
        assert shared.content == original
        assert json.loads(shared.headers['X-Study-Asset-Descriptor']) == descriptor
        login(peer)
        assert client.get(path).status_code == 403
        client.delete('/study/session')
        anonymous = client.get(path)
        assert anonymous.status_code == 401
        assert 'X-Study-Asset-Descriptor' not in anonymous.headers


def test_missing_or_corrupt_original_never_returns_a_successful_descriptor(tmp_path):
    store, _, owner, *_ = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token': store.issue_session(owner)})
        uploaded = client.post('/study/assets?editionId=fluidi', content=pdf_bytes(),
                               headers={'Content-Type': 'application/pdf', 'Idempotency-Key': 'original'}).json()
        asset_id = uploaded['id']
        file = tmp_path / 'blobs' / asset_id
        file.write_bytes(b'corrupt bytes')
        response = client.get('/study/assets/' + asset_id)
        assert response.status_code == 503
        assert 'X-Study-Asset-Descriptor' not in response.headers
        file.unlink()
        response = client.get('/study/assets/' + asset_id)
        assert response.status_code == 503
        assert 'X-Study-Asset-Descriptor' not in response.headers
