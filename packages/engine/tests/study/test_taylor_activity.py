"""Independent rational goldens and domain checks for the bounded exp model."""
from decimal import Decimal, localcontext
from fractions import Fraction
import math
import pytest
from lessonos.study.activities import evaluate_activity
from lessonos.study.coursepack import load_coursepack, validate_coursepack, review_manifest
from lessonos.study.models import StudyError


@pytest.mark.parametrize('x,n,expected,bound', [
    (0,0,1,0), (.5,3,79/48,1/128), (-.5,3,29/48,1/384),
    (1,5,163/60,1/240), (1,6,1957/720,1/1680), (.125,2,145/128,1/1024),
])
def test_taylor_rational_goldens_and_lagrange_bound(x,n,expected,bound):
    result = evaluate_activity('taylor-exp-v1', {'x':x,'degree':n})
    assert result['value'] == expected
    assert result['remainderBound'] >= bound
    assert result['remainderBound'] == pytest.approx(bound, abs=1e-15)
    assert result['terms'] == n+1 and result['unit'] == '1'
    assert result['editorialStatus'] == 'DRAFT' and result['scientificApproval'] == 'NOT_RUN'


@pytest.mark.parametrize('parameters', [
    None, [], {}, {'x':0}, {'degree':3}, {'x':True,'degree':3}, {'x':0,'degree':True},
    {'x':float('nan'),'degree':3}, {'x':float('inf'),'degree':3}, {'x':float('-inf'),'degree':3},
    {'x':1.01,'degree':3}, {'x':-1.01,'degree':3}, {'x':10**1000,'degree':3},
    {'x':'0.5','degree':3}, {'x':{},'degree':3}, {'x':0,'degree':-1}, {'x':0,'degree':13},
    {'x':0,'degree':1.5}, {'x':0,'degree':10**1000}, {'x':0,'degree':'3'},
    {'x':0,'degree':3,'center':1}, {'x':0,'degree':3,'function':'__import__'},
])
def test_taylor_invalid_domain_is_a_validation_error(parameters):
    with pytest.raises(StudyError) as error:
        evaluate_activity('taylor-exp-v1', parameters)
    assert error.value.status == 422 and error.value.code == 'invalid_parameters'


@pytest.mark.parametrize('x', [-1,-.75,-.5,-.01,0,.01,.5,.75,1])
@pytest.mark.parametrize('degree', [0,1,3,7,12])
def test_taylor_bound_encloses_independent_decimal_exponential(x,degree):
    result = evaluate_activity('taylor-exp-v1', {'x':x,'degree':degree})
    with localcontext() as context:
        context.prec = 90
        actual = Decimal.from_float(float(x)).exp()
        error = abs(actual-Decimal.from_float(result['value']))
        assert error <= Decimal.from_float(result['remainderBound'])
    assert math.isfinite(result['value']) and math.isfinite(result['remainderBound'])


@pytest.mark.parametrize('x', [5e-324,-5e-324,1e-20,-1e-20])
@pytest.mark.parametrize('degree', [0,1,12])
def test_taylor_bound_near_zero_includes_binary_conversion_error(x,degree):
    result = evaluate_activity('taylor-exp-v1', {'x':x,'degree':degree})
    assert result['value'] == 1 and result['remainderBound'] > 0
    if degree:
        # The rounded polynomial lost its linear term; its error is not zero.
        assert Fraction.from_float(result['remainderBound']) >= abs(Fraction.from_float(x))/2


def test_second_pack_is_original_draft_and_numeric_checks_do_not_approve_it():
    pack = load_coursepack('taylor-exp-v1', 1)
    report = validate_coursepack(pack)
    assert report['ok'] and report['exercises'] == 4 and report['transferTests'] == 2
    items = pack['exercises']+[item for group in pack['transferTests'] for item in group['items']]
    assert len({item['id'] for item in items}) == 6
    assert all(item['status']=='DRAFT' and item['reviewer'] is None for item in items)
    assert review_manifest(pack)['scientificApproval'] == 'NOT_RUN'
    pack['exercises'][0]['answer']['value'] += 1
    assert not validate_coursepack(pack)['ok']
    assert validate_coursepack(load_coursepack('taylor-exp-v1', 1))['ok']
