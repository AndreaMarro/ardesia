"""Finite JSON integer must fail as validation, without a 500 or partial write."""
import pytest
from test_identity_store import setup_store
from lessonos.study.learning_experiences import list_experiences
from lessonos.study.submissions import submit
from lessonos.study.models import StudyError

def test_composable_scalar_huge_json_integer_is_validation_not_overflow(tmp_path):
    store,_,actor,*_=setup_store(tmp_path)
    e=list_experiences(store,actor,'fluidi',format='composable')['experiences'][0];s=e['steps'][0]
    with pytest.raises(StudyError) as error:
        submit(store,actor,'fluidi',s['activityId'],[],'Procedimento sintetico indipendente.','huge-scalar',
            activity_parameters=s['parameters'],activity_evidence={'schemaVersion':2,'experienceRef':e['experienceRef'],
            'stepId':s['id'],'prediction':{'kind':'scalar','value':10**1000,'unit':'Pa'},'supportUsed':[]})
    assert error.value.status==422
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
