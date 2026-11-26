"""PARTIAL prompt-only preparation for20 further Cric C4 original questions."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q021':9*10**9*(q(2,10**9)-q(1,10**9))/q(1,10),'C4-Q024':q(12)/q(3,100),'C4-Q026':17-2,'C4-Q028':sp.sqrt(2*q(4,10**6)*9/q(2,10**6)),'C4-Q030':sp.binomial(4,2),'C4-Q033':-(-6),'C4-Q035':42-42,'C4-Q039':q(12,3)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(9*10**9,'newton*meter**2/coulomb**2')*u(q(1,10**9),'coulomb')/u(q(1,10),'meter'),u(12,'volt')/u(q(3,100),'meter'),u(2)*u(q(4,10**6),'coulomb')*u(9,'volt')/u(q(2,10**6),'kilogram'),u(12,'kilovolt/meter')/u(3)]
def main():
 values=partial_source_predictions();wanted={21:90,24:400,26:15,28:6,30:6,33:6,35:0,39:4}
 for n,v in wanted.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 for x,unit,v in zip(partial_dimensional_crosschecks(),['volt','volt/meter','meter**2/second**2','kilovolt/meter'],[90,400,36,4]):assert x.to(unit).magnitude==v
 assert 30-10==2*10
 print('PARTIAL20_SOURCE_PROMPTS;8_exact_numeric_checks;4_Pint_checks;ONLY_Q021_040_MODELED;candidate_SCI_NOT_RUN',flush=True)
if __name__=='__main__':main()
