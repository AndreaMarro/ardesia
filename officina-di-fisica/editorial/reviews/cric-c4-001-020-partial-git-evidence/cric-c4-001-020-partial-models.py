"""PARTIAL source-only C4 preparation:20 prompts read; ten numerical checks, no candidate credit."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q001':q(480,100)*q(1,10**15)/(q(160,100)*q(1,10**19)),
 'C4-Q004':4*3,'C4-Q005':q(-25,10)-q(12,10),'C4-Q008':q(3,4),
 'C4-Q010':-q(9,10**6)*q(1,5)**2/(9*10**9*q(2,10**9))*10**9,
 'C4-Q012':q(12,10**7)/q(4,10**9),'C4-Q014':q(30,1+2),
 'C4-Q016':q(1,2)*6*(q(80,100)/4)**2*100,
 'C4-Q018':sp.sqrt(300**2+400**2),'C4-Q020':q(6,3)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(q(48,10**16),'coulomb')/u(q(16,10**20),'coulomb'),
 u(q(12,10**7),'newton')/u(q(4,10**9),'coulomb'),
 u(q(9,10**6),'newton')*u(q(1,5),'meter')**2/(u(9*10**9,'newton*meter**2/coulomb**2')*u(q(2,10**9),'coulomb')),
 u(q(1,2))*u(6,'meter/second**2')*(u(q(4,5),'meter')/u(4,'meter/second'))**2]
def main():
 values=partial_source_predictions();q=sp.Rational;wanted={1:30000,4:12,5:q(-37,10),8:q(3,4),10:-20,12:300,14:10,16:12,18:500,20:2}
 for n,v in wanted.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 checks=partial_dimensional_crosschecks();units=['','newton/coulomb','nanocoulomb','centimeter'];expected=[30000,300,20,12]
 for x,unit,v in zip(checks,units,expected):assert x.to(unit).magnitude==v
 print('PARTIAL20_PROMPTS;10_exact_numeric_checks;4_Pint_checks;ONLY_Q001_020_MODELED;candidate_SCI_NOT_RUN',flush=True)
if __name__=='__main__':main()
