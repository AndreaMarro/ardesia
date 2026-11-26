"""Final10 prompt-only source models in the three-part C4 preparation; no candidate review."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q041':3*4+1*6,'C4-Q044':q(8,10**6)/q(40,10**5)*1000,'C4-Q046':q(2)/(q(1,2)),'C4-Q048':q(2,10**8)*q(1,5)/(q(2,1000)*q(1,10000)),'C4-Q050':q(12-2,5)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(3,'milliampere')*u(4,'second')+u(1,'milliampere')*u(6,'second'),u(8,'microcoulomb')/u(q(2,5),'milliampere'),u(q(2,10**8),'ohm*meter')*u(q(1,5),'meter')/(u(2,'millimeter')*u(q(1,10),'millimeter'))]
def main():
 values=partial_source_predictions();expected={41:18,44:20,46:4,48:sp.Rational(1,50),50:2}
 for n,v in expected.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 for x,unit,v in zip(partial_dimensional_crosschecks(),['millicoulomb','millisecond','ohm'],[18,20,Fraction(1,50)]):assert x.to(unit).magnitude==v
 assert sp.Rational(1,sp.Rational(1,1000))!=sp.Rational(3,sp.Rational(2,1000))
 print('PARTIAL10_SOURCE_PROMPTS;5_exact_numeric_checks;3_Pint_checks;ONLY_Q041_050_MODELED;candidate_SCI_NOT_RUN',flush=True)
if __name__=='__main__':main()
