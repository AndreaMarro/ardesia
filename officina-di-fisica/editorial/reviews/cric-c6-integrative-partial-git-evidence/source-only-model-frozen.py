"""Prompt-only model for 13 practice problems, not the protected exam cohort."""
from fractions import Fraction
import sympy as sp
import pint

def predictions():
    q=sp.Rational
    values={
        'C6-Q001':q(30,100)/1500*10**6,
        'C6-Q002':q(2,10**4)*25000/10,
        'C6-Q003':sp.Integer(90-30-12),
        'C6-Q004':q(12,60)*5,
        'C6-Q005':sp.Integer(30-24),
        'C6-Q006':sp.Integer(900-600)*q(4,5),
        'C6-Q007':q(1,2**4),
        'C6-Q008':sp.Integer(2*3**2),
        'C6-Q009':q(3,10)*4-q(1,10)*5,
        'C6-Q010':q(2000)/(10*q(1,4)),
        'C6-Q011':'Frequenza invariata, con geometria e risposta del sensore invariati',
        'C6-Q012':sp.Integer(5)*q(1,5)*q(1,50)*3*1000,
        'C6-AQ01':q(8)/(4000*q(1,2))/1000*10**6,
    }
    for value in values.values():
        if not isinstance(value,str):
            assert value.is_real is True and value.is_finite is True
            assert not value.has(sp.Float)
    return values

def dimensional_crosschecks():
    u=pint.UnitRegistry(non_int_type=Fraction)
    def quantity(n,unit):return u.Quantity(Fraction(n),unit)
    cases=[
        (quantity('3/10','m')/quantity(1500,'m/s'),'microsecond',Fraction(200)),
        (quantity(25000,'Pa')*quantity('1/5000','m^2')/quantity(10,'m/s^2'),'kg',Fraction(1,2)),
        (quantity(12,'C')/quantity(1,'minute')*quantity(5,'V'),'W',Fraction(1)),
        (quantity('3/10','A')*quantity(4,'s')-quantity('1/10','A')*quantity(5,'s'),'C',Fraction(7,10)),
        (quantity(2000,'Pa')/(quantity(10,'m/s^2')*quantity('1/4','m')),'kg/m^3',Fraction(800)),
        (quantity(5,'W')*Fraction(1,5)*Fraction(1,50)*quantity(3,'s'),'mJ',Fraction(60)),
        (quantity(8,'W')/(quantity(4000,'J/kg/K')*quantity('1/2','K'))/quantity(1000,'kg/m^3'),'mL/s',Fraction(4)),
    ]
    outputs=[]
    for value,unit,wanted in cases:
        converted=value.to(unit)
        assert isinstance(converted.magnitude,(int,Fraction))
        assert converted.magnitude==wanted
        outputs.append({'magnitude':str(converted.magnitude),'unit':unit})
    return outputs

def main():
    values=predictions()
    expected=[200,sp.Rational(1,2),48,1,6,240,sp.Rational(1,16),18,sp.Rational(7,10),800,60,4]
    assert [v for v in values.values() if not isinstance(v,str)]==expected
    dimensions=dimensional_crosschecks()
    print({'scope':'partial source-only practice preparation, no SCI credit','exactNumericDerivations':12,'distinctConceptualDerivations':1,'exactPintChecks':len(dimensions),'values':{k:str(v) for k,v in values.items()},'dimensions':dimensions})
if __name__=='__main__':main()
