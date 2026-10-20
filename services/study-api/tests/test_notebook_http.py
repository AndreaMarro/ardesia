"""Real JSON roundtrip retains exact authorized history, without claiming origin."""
import pytest
from fastapi.testclient import TestClient
from lessonos.study.context import revise_resource
from lessonos.study.submissions import submit
from lessonos.study.view_layout import save_layout
from study_api.app import create_app
from test_identity import setup_store
from test_layout_http import view


@pytest.mark.parametrize('actor_role',['student','teacher'])
def test_http_notebook_old_pin_roundtrip_respects_exact_revision_permission(tmp_path,actor_role):
    store,teacher,student,*_=setup_store(tmp_path)
    source=store.create_resource(student,'fluidi','notes','Versione originale consegnata.')
    submit(store,student,'fluidi','poiseuille-v1',[],'Procedura','submit',
        source_refs=[{'resourceId':source['id'],'revisionId':source['revisionId']}])
    actor=student if actor_role=='student' else teacher
    save_layout(store,actor,'fluidi',[view(source)])
    private=revise_resource(store,student,source['id'],source['revisionId'],'Nuova bozza privata non consegnata.')
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.post('/study/session',json={'token':store.issue_session(actor)}).status_code==200
        exported=client.get('/study/notebook?editionId=fluidi')
        assert exported.status_code==200
        bundle=exported.json()
        assert bundle['resourceRevisions'][0]['revisionId']==source['revisionId']
        assert (private['text'] in exported.text)==(actor_role=='student')
        inspected=client.post('/study/notebook/inspect',json=bundle)
        assert inspected.status_code==200
        assert inspected.json()['sha256']==bundle['sha256']
        assert inspected.json()['referencesComplete'] is True
        assert inspected.json()['canonicalAuthenticity']=='NOT_VERIFIED'
    store.close()
