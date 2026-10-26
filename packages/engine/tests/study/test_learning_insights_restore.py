"""Real installed operator: an old backup must not resurrect optional consent."""
import time
from lessonos.study import operations
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study.learning_insights import set_preferences,ingest,export
from test_identity_store import setup_store

NOTICE={'version':'synthetic-restore-v1','purpose':'Solo prova sintetica','retentionDays':30}


def test_installed_restore_discards_old_optional_state_and_keeps_core_receipts(tmp_path):
    store,_,student,*_=setup_store(tmp_path/'data')
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'synthetic original','attempt')
    token=store.issue_session(student)
    preference=set_preferences(store,student,'fluidi',True,NOTICE['version'],notice=NOTICE)
    ingest(store,student,'fluidi',[{'schemaVersion':1,'eventId':'before-backup','consentId':preference['consentId'],
        'receiptId':receipt['receiptId'],'kind':'difficulty.reported','occurredAt':time.time()}],notice=NOTICE)
    assert len(export(store,student,'fluidi',notice=NOTICE)['optionalEvents'])==1
    operations.backup_data(store.path.parent,tmp_path/'backup')
    set_preferences(store,student,'fluidi',False,None,notice=NOTICE)
    operations.restore_data(tmp_path/'backup',tmp_path/'restored',store.path.parent/'erasure-ledger.json')
    restored=StudyStore(tmp_path/'restored/study.sqlite')
    try:
        assert restored.principal_for_session(token) is None
        data=export(restored,student,'fluidi',notice=NOTICE)
        assert data['preferences']['enabled'] is False
        assert data['optionalEvents']==[]
        assert [row['receiptId'] for row in data['attempts']]==[receipt['receiptId']]
        assert restored.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind LIKE 'learning.insights.%'").fetchone()[0]==0
        # A new explicit choice creates a new lifetime; the old event cannot replay.
        fresh=set_preferences(restored,student,'fluidi',True,NOTICE['version'],notice=NOTICE)
        assert fresh['consentId']!=preference['consentId']
    finally:
        restored.close()
        store.close()
