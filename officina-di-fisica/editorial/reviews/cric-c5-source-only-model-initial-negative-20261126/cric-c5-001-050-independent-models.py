"""Source-only C5 A50 preparation:26 exact numeric/symbolic predictions, concepts in primary."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
def source_only_predictions():
 q=sp.Rational
 return {'C5-Q001':7,'C5-Q002':(q(85,100)-q(10,100))/5,'C5-Q003':1/(2*q(18,1000)),
 'C5-Q006':3*sp.pi/(2*sp.pi),'C5-Q009':sp.sqrt(4),'C5-Q011':2*18,
 'C5-Q014':2*sp.pi*q(12,100)/q(48,100),'C5-Q015':(q(160,100)-q(40,100))/(q(24,100)-q(16,100)),
 'C5-Q017':2*sp.pi/q(25,10),'C5-Q019':q(12,6)*q(30,100),'C5-Q021':q(12,10)+q(8,10),
 'C5-Q023':abs(5-3),'C5-Q025':q(3)-q(5,2),'C5-Q027':(2*1)**2/1**2,'C5-Q029':q(102,100)/340*1000,
 'C5-Q031':q(12,1000)/(3*q(2,10000)),'C5-Q032':q(2,2**2),'C5-Q033':q(80,100)*sp.sqrt(9),
 'C5-Q037':4*q(2,10),'C5-Q038':q(3),'C5-Q039':5*4*sp.cos(sp.pi/3),'C5-Q041':q(1,10**12)*10**5*10**6,
 'C5-Q043':10*sp.log(q(1,100))/sp.log(10),'C5-Q045':2*q(51)/q(30,100),
 'C5-Q048':q(1480,1000),'C5-Q050':10*sp.log(3)/sp.log(10)}
def dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(q(3,4),'second')/5,1/u(36,'millisecond'),u(q(6,5),'meter')/u(q(2,25),'second'),u(4,'watt')*u(2,'millisecond')/u(10,'millisecond'),u(102,'meter')/u(q(3,10),'second'),u(1480,'meter/second')/u(1,'kilohertz'),u(12,'millijoule')/(u(3,'second')*u(2,'centimeter**2')),u(5,'watt/meter**2')*u(4,'meter**2')*q(1,2)]
def main():
 q=sp.Rational;values=source_only_predictions();expected={1:7,2:q(3,20),3:q(250,9),6:q(3,2),9:2,11:36,14:sp.pi/2,15:15,17:4*sp.pi/5,19:q(3,5),21:2,23:2,25:q(1,2),27:4,29:3,31:20,32:q(1,2),33:q(12,5),37:q(4,5),38:3,39:10,41:q(1,10),43:-20,45:340,48:q(37,25),50:10*sp.log(3)/sp.log(10)}
 for n,wanted in expected.items():assert sp.simplify(values[f'C5-Q{n:03}']-wanted)==0,(n,values[f'C5-Q{n:03}'],wanted)
 for x,unit,wanted in zip(dimensional_crosschecks(),['second','hertz','meter/second','watt','meter/second','meter','watt/meter**2','watt'],[Fraction(3,20),Fraction(250,9),15,Fraction(4,5),340,Fraction(37,25),20,10]):assert x.to(unit).magnitude==wanted
 assert sp.log(3)/sp.log(10)>0
 print('50_PROMPTS_INDIVIDUALLY_DERIVED;26_EXACT_NUMERIC_SYMBOLIC_CHECKS;8_PINT_CHECKS;NO_CANDIDATE_KEYS_OPENED;NO_CANDIDATE_SCI_PASS',flush=True)
if __name__=='__main__':main()
