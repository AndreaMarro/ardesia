"""Counterproof on patched copies of actual shared sources; owners still install.

Run explicitly, not part of the installed-product CI acceptance claim.
"""
import importlib.util
from pathlib import Path
import sys
import time
from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study.learning_insights import set_preferences, ingest, export

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from prepare_integration import prepare
sys.path.insert(0,str(HERE.parents[2]/'packages/engine/tests/study'))
from test_identity_store import setup_store
NOTICE={'version':'proposed-synthetic-v1','purpose':'Prova sintetica locale','retentionDays':30}


def load_copy(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_proposed_shared_api_uses_actual_cookie_and_admission_dependencies(tmp_path):
    prepare(copies=tmp_path/'copies')
    module=load_copy('study_api.s11_proposed_app',tmp_path/'copies/services/study-api/study_api/app.py')
    store,tutor,student,peer,other=setup_store(tmp_path/'data')
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'synthetic original','a')
    with TestClient(module.create_app(store.path,demo=True)) as client:
        path='/study/learning-insights?editionId=fluidi'
        assert client.get(path).status_code==401
        client.post('/study/session',json={'token':store.issue_session(student)})
        value=client.get(path)
        assert value.status_code==200
        assert value.json()['attempts'][0]['receiptId']==receipt['receiptId']
        assert value.json()['preferences']['notice'] is None
        assert value.headers['cache-control']=='no-store'
        assert client.put('/study/learning-insights/preferences',json={'editionId':'fluidi','enabled':True,'noticeVersion':'invented'}).status_code==409
        client.post('/study/session',json={'token':store.issue_session(peer)})
        assert client.get(path).json()['attempts']==[]
        client.post('/study/session',json={'token':store.issue_session(other)})
        assert client.get(path).status_code==403
        client.post('/study/session',json={'token':store.issue_session(student)})
        store.revoke_all_sessions(student)
        rejected=client.get(path)
        assert rejected.status_code==401
        assert rejected.headers['x-study-session-rejected']=='cookie'
        assert client.get('/study/learning-insights/export?editionId=fluidi').status_code==401


def test_proposed_real_backup_withdraw_restore_discards_optional_history(tmp_path):
    prepare(copies=tmp_path/'copies')
    ops=load_copy('lessonos.study.s11_proposed_operations',tmp_path/'copies/packages/engine/lessonos/study/operations.py')
    store,_,student,*_=setup_store(tmp_path/'data')
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'synthetic original','a')
    preference=set_preferences(store,student,'fluidi',True,NOTICE['version'],notice=NOTICE)
    ingest(store,student,'fluidi',[{'schemaVersion':1,'eventId':'before-backup','consentId':preference['consentId'],
        'receiptId':receipt['receiptId'],'kind':'difficulty.reported','occurredAt':time.time()}],notice=NOTICE)
    assert len(export(store,student,'fluidi',notice=NOTICE)['optionalEvents'])==1
    ops.backup_data(store.path.parent,tmp_path/'backup')
    set_preferences(store,student,'fluidi',False,None,notice=NOTICE)
    restored=tmp_path/'restored'
    ops.restore_data(tmp_path/'backup',restored,store.path.parent/'erasure-ledger.json')
    reopened=StudyStore(restored/'study.sqlite')
    data=export(reopened,student,'fluidi',notice=NOTICE)
    assert data['preferences']['enabled'] is False
    assert data['optionalEvents']==[]
    assert len(data['attempts'])==1
    assert reopened.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind LIKE 'learning.insights.%'").fetchone()[0]==0
