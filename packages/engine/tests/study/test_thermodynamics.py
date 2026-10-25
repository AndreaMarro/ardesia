import math
import pytest
from lessonos.study.activities import evaluate_activity
from lessonos.study.models import StudyError


def test_si_oracle_and_isothermal_inverse_pressure():
    a=evaluate_activity('ideal-gas-v1',{'moles':1,'temperatureK':300,'pressurePa':100000})
    # Independent Avogadro * Boltzmann SI constants, not the implementation R.
    expected=(6.02214076e23 * 1.380649e-23)*300/100000
    assert math.isclose(a['value'],expected,rel_tol=1e-12)
    assert a['unit']=='m³' and a['editorialStatus']=='DRAFT'
    b=evaluate_activity('ideal-gas-v1',{'moles':1,'temperatureK':300,'pressurePa':200000})
    assert math.isclose(a['value']/b['value'],2)
    assert math.isclose(a['volumeL'],24.94338785445972,rel_tol=1e-12)


@pytest.mark.parametrize('p',[None,[],{'temperatureK':0},{'temperatureK':-5},{'temperatureK':True},
 {'temperatureK':float('nan')},{'pressurePa':0},{'pressurePa':float('inf')},{'moles':0},
 {'moles':10**1000},{'temperatureC':25}])
def test_invalid_domain(p):
    with pytest.raises(StudyError):evaluate_activity('ideal-gas-v1',p)
