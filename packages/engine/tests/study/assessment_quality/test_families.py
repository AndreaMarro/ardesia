from fractions import Fraction
import pytest
from lessonos.study.assessment_quality.families import family_variants, batch_dossiers
from lessonos.study.question_bank import load_bank


def test_four_families_have_correct_distinct_transfer_for_every_declared_seed():
    for seed in range(32):
        variants=family_variants(seed)
        assert len(variants)==4
        for variant in variants:
            p=variant['parameters'];answer=Fraction(variant['answer'])
            if variant['id']=='mru': assert answer==sum([Fraction(p['speed'])]*p['seconds'])
            if variant['id']=='continuity': assert Fraction(p['outletArea'])*answer==Fraction(p['inletArea'])*Fraction(p['inletSpeed'])
            if variant['id']=='ohm': assert Fraction(p['voltage'])*answer==Fraction(p['resistance'])*answer**2 and answer>0
            if variant['id']=='wave': assert sum([answer]*p['frequency'])==Fraction(p['speed'])
            assert variant['prompt']!=variant['transfer']['prompt']
            assert variant['unit'] and len(variant['steps'])>=3
            assert len(variant['distractors'])==2
            assert variant['status']=='DRAFT' and variant['humanApproval'] is False


@pytest.mark.parametrize('seed',[-1,32,True,1.5,'1',10**9])
def test_seed_domain_is_bounded(seed):
    with pytest.raises(ValueError):family_variants(seed)


def test_dossiers_bind_exact_existing_questions_and_never_publish():
    bank=load_bank();dossiers=batch_dossiers(bank)
    assert len(dossiers)==4
    assert {x['id']:x['distinctParameterSets'] for x in dossiers}=={'mru':20,'continuity':32,'ohm':32,'wave':28}
    assert {x['courseId'] for x in dossiers}=={'strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni'}
    for dossier in dossiers:
        assert dossier['questionVersion']==bank.question_version(dossier['questionId'])
        assert dossier['contentSha256']==bank.approval_content_sha256(dossier['questionId'])
        assert dossier['seedRange']==[0,31]
        assert dossier['preview']['transfer']['answer']


def test_all_seed_distractors_are_distinct_and_never_the_correct_numeric_answer():
    for seed in range(32):
        for variant in family_variants(seed):
            answers=[Fraction(item['answer']) for item in variant['distractors']]
            assert len(set(answers))==2
            assert Fraction(variant['answer']) not in answers


def test_seed_zero_transfer_goldens():
    by_id={v['id']:v['transfer']['answer'] for v in family_variants(0)}
    assert by_id=={'mru':'Δx=2 m; cammino=6 m.', 'continuity':'1 cm/s',
                   'ohm':'I=3/2 A; P=9 W.', 'wave':'f=2 Hz; λ=12 m.'}
