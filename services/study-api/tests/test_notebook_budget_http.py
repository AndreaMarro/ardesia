"""HTTP framing and Core compact encoding use the same notebook byte limit."""
from fastapi.testclient import TestClient
from lessonos.study import portable
from lessonos.study.store import canonical, digest
from study_api.app import create_app
from test_identity import setup_store


def notebook(padding=''):
    value={'format':'ardesia-study-notebook-v1','schemaVersion':1,'resources':[],
           'resourceRevisions':[],'submissions':[],'assets':[],'layout':[],'omissions':[],'padding':padding}
    value['sha256']=digest(canonical(value));return value


def test_http_inspect_accepts_exact_boundary_and_refuses_one_extra_byte(tmp_path,monkeypatch):
    store,_,student,*_=setup_store(tmp_path)
    encoded=canonical(notebook('é🧪')).encode()
    monkeypatch.setattr(portable,'MAX_ENCODED_BYTES',len(encoded),raising=False)
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.post('/study/session',json={'token':store.issue_session(student)}).status_code==200
        headers={'Content-Type':'application/json'}
        assert client.post('/study/notebook/inspect',content=encoded,headers=headers).status_code==200
        response=client.post('/study/notebook/inspect',content=encoded+b' ',headers=headers)
        assert response.status_code==413
        assert response.json()=={'error':'notebook_budget_exceeded'}
    store.close()


def test_http_export_is_the_explicit_stable_compact_representation_and_budget_error_is_atomic(tmp_path,monkeypatch):
    store,_,student,*_=setup_store(tmp_path)
    source=store.create_resource(student,'fluidi','notes','É: una fonte originale 🧪.')
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.post('/study/session',json={'token':store.issue_session(student)}).status_code==200
        response=client.get('/study/notebook?editionId=fluidi')
        assert response.status_code==200
        assert response.content==canonical(response.json()).encode()
        monkeypatch.setattr(portable,'MAX_ENCODED_BYTES',len(response.content)-1,raising=False)
        denied=client.get('/study/notebook?editionId=fluidi')
        assert denied.status_code==413
        assert denied.json()=={'error':'notebook_budget_exceeded'}
        assert source['text'] not in denied.text
        assert store.get_resource(student,source['id'])['revisionId']==source['revisionId']
    store.close()
