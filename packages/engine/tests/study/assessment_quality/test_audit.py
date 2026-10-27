from copy import deepcopy
from fractions import Fraction
import pytest
from lessonos.study.assessment_quality.audit import audit_records, rational_expression


def record(identifier='one', unit='U2', answer='4', expression='x*z'):
    return {'id': identifier, 'version': 1, 'bankId': 'physics-semestre-2026',
            'activityId': 'physics-question-bank-v1', 'title': 'Moto uniforme',
            'prompt': 'v=2 m/s, t=2 s: calcola lo spostamento in metri.',
            'format': 'completion', 'options': [], 'answer': {'kind':'rational','exact':answer,'unit':'m','text':answer+' m','accepted':[answer]},
            'solution':'Integra la velocità costante per due secondi.',
            'solutionSteps':[{'title':'Intervallo','explanation':'Due intervalli da due metri.'}],
            'taxonomy':{'unitId':unit,'macroarea':'Fisica','microarea':'Moto','topic':'MRU'},
            'difficulty':{'level':'base','rank':1},'descriptors':{'calculatorAllowed':False},
            'familyId':'uniform-motion','status':'DRAFT','reviewer':None,
            'provenance':{'kind':'original_authored_model_expansion','sources':[{'sourceId':'MUR-SYLLABUS-2026','locator':'U2'}]},
            'verification':{'automaticChecks':[{'kind':'substitution','expression':expression,
                'values':{'x':'2','z':'2','y':'4'},'residual':'0'}]}}


def test_rechecks_answer_instead_of_trusting_declared_residual():
    report = audit_records([record(answer='5')])
    assert report['summary']['records'] == 1
    assert report['summary']['quarantined'] == 1
    assert 'answer_mismatch' in report['items'][0]['issues']
    assert report['items'][0]['numericStatus'] == 'FAILED'


def test_duplicates_keep_both_records_and_historical_denominators():
    report = audit_records([record(), record('two')])
    assert report['summary']['records'] == 2
    assert report['summary']['quarantined'] == 2
    assert report['summary']['distinctRecords'] == 1
    assert [row['requiredObjectives'] for row in report['courses']] == [52,57,33,58]
    assert sum(row['records'] for row in report['courses']) == 2
    assert all('duplicate_content' in row['issues'] for row in report['items'])


def test_missing_provenance_and_unsupported_math_never_claim_pass():
    q = record(expression='sin(x)'); q.pop('provenance')
    report = audit_records([q])
    assert report['summary']['verifiedNumeric'] == 0
    assert report['summary']['unverifiedNumeric'] == 1
    assert report['items'][0]['numericStatus'] == 'NOT_VERIFIED'
    assert 'missing_provenance' in report['items'][0]['issues']
    assert 'unsupported_check' in report['items'][0]['issues']


def test_audit_is_read_only_and_report_has_no_answer_or_solution():
    source = record(); before = deepcopy(source)
    report = audit_records([source])
    assert source == before
    assert report['summary']['verifiedNumeric'] == 1
    assert report['items'][0]['contentSha256']
    assert not {'answer','solution','verification','options'} & report['items'][0].keys()


@pytest.mark.parametrize('expression,expected', [('1/3+2/3',Fraction(1)),('sqrt(9/16)',Fraction(3,4)),('-2**2',Fraction(-4))])
def test_exact_bounded_arithmetic(expression, expected):
    assert rational_expression(expression, {}) == expected


@pytest.mark.parametrize('expression', ['__import__("os").system("touch marker")','(1).__class__','2**1000000','x/0','sqrt(-1)','nan','[x for x in [1]]'])
def test_unsafe_or_degenerate_expressions_are_not_evaluated(expression):
    with pytest.raises(ValueError): rational_expression(expression, {'x':'1'})


def test_duplicate_normalization_preserves_case_sensitive_physical_prefixes():
    first=record();first['prompt']='Un manometro indica 2 mPa: converti in Pa.'
    second=record('two');second['prompt']='Un manometro indica 2 MPa: converti in Pa.'
    report=audit_records([first,second])
    assert report['summary']['distinctRecords']==2
    assert not any('duplicate_content' in item['issues'] for item in report['items'])


def test_duplicate_normalization_preserves_negative_signs_and_exponents():
    prompts=['v=-2 m/s','v=2 m/s','A=2 m²','A=2 m2']
    records=[]
    for index,prompt in enumerate(prompts):
        q=record(str(index));q['prompt']=prompt;records.append(q)
    assert audit_records(records)['summary']['distinctRecords']==4
