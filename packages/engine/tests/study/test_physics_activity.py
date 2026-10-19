import pytest
from lessonos.study.activities import evaluate_activity
from lessonos.study.interests import record_interest, list_interests
from test_identity_store import setup_store

@pytest.mark.parametrize('boundary,want,variable', [('pressure',5.0625,'Q/Q0'),('flow',0.19753086419753085,'Δp/Δp0')])
def test_fixed_quantity_changes_result_and_description(boundary,want,variable):
    result=evaluate_activity('poiseuille-v1', {'radiusRatio':1.5,'boundary':boundary})
    assert result['ratio']==pytest.approx(want)
    assert result['calculatedVariable']==variable
    assert result['fixedQuantity']==boundary

@pytest.mark.parametrize('parameters',[{'radiusRatio':0},{'radiusRatio':-1},{'radiusRatio':float('nan')},{'radiusRatio':1,'boundary':'unknown'},{'radiusRatio':1,'viscosity':0}])
def test_invalid_physical_domain_is_rejected(parameters):
    with pytest.raises(ValueError):evaluate_activity('poiseuille-v1', parameters)

def test_interest_survives_reopen_and_retry_does_not_duplicate(tmp_path):
    from lessonos.study.store import StudyStore
    store,teacher,*_=setup_store(tmp_path)
    request={'contact':'synthetic-01@example.invalid','topic':'fluidi','slots':['slot-a'],'consent':True}
    receipt=record_interest(store,request,'interest-key')
    assert receipt['status']=='received'
    assert record_interest(StudyStore(store.path),request,'interest-key')==receipt
    assert len(list_interests(store,teacher,'fluidi'))==1
    with pytest.raises(ValueError):record_interest(store,{**request,'topic':'altro'},'interest-key')

@pytest.mark.parametrize('contact,consent',[('real@example.com',True),('synthetic@example.invalid',False)])
def test_demo_accepts_only_synthetic_contact_with_consent(tmp_path,contact,consent):
    store,*_=setup_store(tmp_path)
    with pytest.raises(ValueError):record_interest(store,{'contact':contact,'consent':consent,'topic':'fluidi','slots':[]},'key')

def test_interest_contact_is_scoped_to_edition_tutor(tmp_path):
    store,teacher,first,peer,other=setup_store(tmp_path)
    store.create_edition(other,'other-fluidi')
    record_interest(store,{'contact':'synthetic@example.invalid','topic':'fluidi','slots':['a'],'consent':True},'key')
    assert list_interests(store,other,'other-fluidi')==[]
