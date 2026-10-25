from fastapi.testclient import TestClient
from lessonos.study.assets import upload_asset
from lessonos.study.submissions import submit
from study_api.app import create_app
from test_identity import setup_store
from io import BytesIO
from PIL import Image


def test_private_draft_is_hidden_from_tutor_workspace_export_and_bytes(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'DO NOT DISCLOSE')
    data = BytesIO()
    Image.new('RGB', (8, 8), 'white').save(data, format='PNG')
    asset = upload_asset(store, student, 'fluidi', data.getvalue(), 'image/png', tmp_path/'blobs')
    app = create_app(store.path, demo=True)
    with TestClient(app) as client:
        for actor in (tutor, peer, other):
            client.post('/study/session', json={'token':store.issue_session(actor)})
            response = client.get('/study/resources/'+source['id'])
            assert response.status_code in (403,404)
            assert 'DO NOT DISCLOSE' not in response.text
            assert client.get('/study/assets/'+asset['id']).status_code in (403,404)
        client.post('/study/session', json={'token':store.issue_session(tutor)})
        workspace = client.get('/study/workspace', params={'editionId':'fluidi'})
        assert workspace.status_code == 200
        assert source['id'] not in workspace.text
        submit(store, student, 'fluidi', 'poiseuille-v1', [asset['id']], 'shared', 'http-share',
               source_refs=[{'resourceId':source['id'],'revisionId':source['revisionId']}])
        assert client.get('/study/resources/'+source['id']).status_code == 200
        assert client.get('/study/assets/'+asset['id']).content == data.getvalue()
