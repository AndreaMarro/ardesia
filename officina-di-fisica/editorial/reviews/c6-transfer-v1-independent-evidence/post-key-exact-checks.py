"""Post-key computation backing the separately frozen manual primary; no blind claim."""
from pathlib import Path
from fractions import Fraction
import json,hashlib
import sympy as s
import pint
from tools.corpus_engineering import exact_arithmetic_literals as literal
app=Path.cwd();home=app/'editorial/reviews/c6-transfer-v1-independent-evidence';q=s.Rational
assert hashlib.sha256(Path(literal.__file__).read_bytes()).hexdigest()=='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
values={'C6-TR02':s.Tuple(18/(s.Integer(600)/10000),18/(s.Integer(300)/10000)),'C6-TR03':s.Integer(12-3)*5,'C6-TR04':s.sqrt(q(1,16)),'C6-TR05':q(2+6,2)*6,'C6-TR06':s.sqrt(q(20-4,8-4))}
assert values=={'C6-TR02':s.Tuple(300,600),'C6-TR03':45,'C6-TR04':q(1,4),'C6-TR05':24,'C6-TR06':2}
p=json.loads((home/'final-package.json').read_bytes());false=0
for row in p['records']:
 key=row['id'];suffix=' J'if key in('C6-TR03','C6-TR05')else''
 def parse(option):
  if key=='C6-TR02':return s.Tuple(*(literal.exact_literal(v.replace(',','.'))for v in option.split(' e ')))
  if suffix:assert option.endswith(suffix)
  return literal.exact_literal({'√(5/2)':'r(10)/2'}.get(option.removesuffix(suffix),option.removesuffix(suffix)))
 parsed=[parse(v)for v in row['answer']['options']];expected=values[key]
 assert sum(v==expected for v in parsed)==1 and parse(row['answer']['value'])==expected
 assert len(set(parsed))==len(parsed)==4;false+=sum(v!=expected for v in parsed)
assert false==15
u=pint.UnitRegistry(non_int_type=Fraction)
checks=[((u.Quantity(18,'W')/u.Quantity(600,'cm**2')).to('W/m**2'),300),((u.Quantity(18,'W')/u.Quantity(300,'cm**2')).to('W/m**2'),600),((u.Quantity(12-3,'W')*u.Quantity(5,'s')).to('J'),45),((u.Quantity(Fraction(2+6,2),'N')*u.Quantity(6,'m')).to('J'),24),((u.Quantity(20-4,'nW/m**2')/u.Quantity(8-4,'nW/m**2')).to('dimensionless'),4)]
for value,expected in checks:assert isinstance(value.magnitude,(int,Fraction)) and value.magnitude==expected
assert q(1,8)**2==q(1,64)
result={'scope':'Actual exact computation after candidate reading, supporting earlier frozen manual primary; not a new pre-key run','records':{key:str(value)for key,value in values.items()},'exactDimensionChecks':[{'value':str(v.magnitude),'dimensions':{str(key):str(power)for key,power in v.dimensionality.items()}}for v,_ in checks],'all15FalseChoicesRejected':false,'floatApproximationOrTolerance':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(home/'post-key-exact-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
