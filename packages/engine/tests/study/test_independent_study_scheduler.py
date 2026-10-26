"""Adapter contracts for an acquired scheduler, not an automatic learner grade."""
import copy
import pytest
from lessonos.study.models import StudyError
from lessonos.study.independent_study.review_scheduler import preview, apply_rating, undo_rating

NOW=1761436800.0

def state():
    return {'phase':'review','cycle':0,'reviewAt':NOW+86400,'reviewReason':'Ripasso proposto domani.',
            'assistanceHistory':[{'cycle':0,'phase':'practice','support':'hint-1'}]}

def test_preview_uses_all_four_fsrs_ratings_without_mutating_navigation():
    original=state(); before=copy.deepcopy(original)
    result=preview(original,'a'*32,NOW)
    assert [o['rating'] for o in result['choices']]==['again','hard','good','easy']
    assert [o['due']-NOW for o in result['choices'][:3]]==[60,330,600]
    assert result['version']=='6.3.2' and result['basis']=='learner_self_report'
    assert original==before

def test_explicit_rating_roundtrips_undo_and_preserves_assistance():
    original=state();value=apply_rating(original,'a'*32,NOW,'good')
    assert value['reviewAt']==NOW+600
    assert value['scheduler']['lastRating']=='good'
    assert value['scheduler']['basis']=='learner_self_report'
    assert value['scheduler']['reviewLog']['review_duration'] is None
    assert value['scheduler']['assistanceObserved'] is True
    assert value['assistanceHistory']==original['assistanceHistory']
    assert 'mastery' not in value['scheduler'] and 'score' not in value['scheduler']
    with pytest.raises(StudyError,match='study_rating_already_recorded'):
        apply_rating(value,'a'*32,NOW,'easy')
    restored=undo_rating(value)
    assert restored['reviewAt']==original['reviewAt'] and restored['reviewReason']==original['reviewReason']
    assert restored.get('scheduler') is None
    assert restored['assistanceHistory']==original['assistanceHistory']

@pytest.mark.parametrize('rating',[True,3,None,'correct','GOOD',{},''])
def test_wrong_rating_never_becomes_a_review(rating):
    with pytest.raises(StudyError,match='invalid_study_rating'):apply_rating(state(),'a'*32,NOW,rating)

def test_time_regression_and_unknown_persisted_scheduler_fail_explicitly():
    first=apply_rating(state(),'a'*32,NOW,'again');first['cycle']=1
    with pytest.raises(StudyError,match='study_clock_regressed'):apply_rating(first,'a'*32,NOW-1,'good')
    first['scheduler']['version']='999'
    with pytest.raises(StudyError,match='study_scheduler_unavailable'):preview(first,'a'*32,NOW+1000)

def test_next_cycle_advances_same_card_and_undo_restores_only_the_previous_schedule():
    first=apply_rating(state(),'a'*32,NOW,'good');first['cycle']=1
    second=apply_rating(first,'a'*32,NOW+600,'good')
    assert second['scheduler']['card']['card_id']==first['scheduler']['card']['card_id']
    assert second['scheduler']['card']!=first['scheduler']['card']
    assert 'previous' not in second['scheduler']['previous']['scheduler']
    restored=undo_rating(second)
    assert restored['scheduler']['card']==first['scheduler']['card']
    assert restored['cycle']==1 and restored['assistanceHistory']==first['assistanceHistory']
    assert not preview(restored,'a'*32,NOW+601)['rated']
