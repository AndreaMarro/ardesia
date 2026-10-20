import math,pytest
from lessonos.study.activities import evaluate_activity
from lessonos.study.models import StudyError


def test_four_original_models_respect_physics_and_declared_constraints():
    area=evaluate_activity('units-v1',{'value':2.5,'fromUnit':'m','toUnit':'cm','dimension':2})
    assert area['value']==25000 and area['unit']=='cm²'
    volume=evaluate_activity('units-v1',{'value':.004,'fromUnit':'m','toUnit':'cm','dimension':3})
    assert volume['value']==4000
    gauge=evaluate_activity('hydrostatic-v1',{'density':1000,'depth':2,'g':9.81,'reference':'gauge','surfacePressure':101325})
    absolute=evaluate_activity('hydrostatic-v1',{'density':1000,'depth':2,'g':9.81,'reference':'absolute','surfacePressure':101325})
    assert gauge['value']==19620 and absolute['value']-gauge['value']==101325
    floatation=evaluate_activity('buoyancy-v1',{'liquidDensity':1000,'objectDensity':600,'volume':.002,'g':9.81})
    assert floatation['value']==pytest.approx(19.62) and floatation['regime']=='floating'
    assert floatation['immersedFraction']==.6
    sinking=evaluate_activity('buoyancy-v1',{'liquidDensity':1000,'objectDensity':1200,'volume':.002,'g':9.81})
    assert sinking['regime']=='sinking' and sinking['immersedFraction'] is None


@pytest.mark.parametrize('activity,parameters',[
 ('units-v1',{'value':float('nan')}),('units-v1',{'dimension':True}),
 ('units-v1',{'fromUnit':'m','toUnit':'L'}),('hydrostatic-v1',{'depth':-1}),
 ('hydrostatic-v1',{'density':True}),('hydrostatic-v1',{'reference':'unknown'}),
 ('buoyancy-v1',{'volume':0}),('buoyancy-v1',{'objectDensity':float('inf')})])
def test_models_reject_invalid_or_ambiguous_domain(activity,parameters):
    with pytest.raises(StudyError,match="invalid_"):evaluate_activity(activity,parameters)


def test_original_coursepack_has_24_checked_drafts_and_distinct_transfer_tasks():
    from lessonos.study.coursepack import load_coursepack,validate_coursepack,review_manifest
    pack=load_coursepack();report=validate_coursepack(pack)
    assert report['ok'] and report['exercises']==24 and report['activities']==4 and report['transferTests']==2
    assert len({item['id'] for item in pack['exercises']})==24
    assert all(item['status']=='DRAFT' and item['reviewer'] is None for item in pack['exercises'])
    regular={item['id'] for item in pack['exercises']}
    assert not regular.intersection(item['id'] for group in pack['transferTests'] for item in group['items'])
    manifest=review_manifest(pack)
    assert manifest['scientificApproval']=='NOT_RUN' and len(manifest['sha256'])==64
    pack['exercises'][0]['answer']['value']+=1
    assert validate_coursepack(pack)['ok'] is False
