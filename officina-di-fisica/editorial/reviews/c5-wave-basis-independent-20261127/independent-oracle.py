"""Independent exact mathematics/read judgment; no candidate authors imported."""
from pathlib import Path
from fractions import Fraction as F
import hashlib,json,subprocess,math,sys
FOLDER=Path(__file__).resolve().parent
EXPECTED={
'SIM-C5-L01-02':[(F(2),F(1,2)),(F(5,2),F(2,5))],
'SIM-C5-L02-01':[(F(2),F(4)),(F(3,2),F(3))],
'SIM-C5-L02-02':[(F(4),F(3,2)),(F(3),F(2))],
'SIM-C5-L02-04':[(F(270),F(-2)),(F(180),F(0))],
'SIM-C5-L03-01':[(F(2),F(4)),(F(0),F(2))],
}
# Frozen after complete individual reading; independent of author-generated bindings.
REVIEWED_ROWS={
'SIM-C5-L01-02':'e9aa81f9fe91779f74b7a3b3f1dda86b11c4441feef8197b951b87b7c1613dfc',
'SIM-C5-L02-01':'5c712d4c4034dc229a2331559624132840e89d83fd6ebf5cac252e60774402fe',
'SIM-C5-L02-02':'242f9054c7ea03907e8732ee937f8f8cdd8f5bc97e1f2bf7d34888acdb0c2f7d',
'SIM-C5-L02-04':'56271b5baf937d92657171d7d358e3ce7ae895af54437ce344f88921153c7a65',
'SIM-C5-L03-01':'415b5cc78b1fca249666e27186a737aa662fd1038cecf0b9fb6ab912ebdd6a24',
}
canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
digest=lambda x:hashlib.sha256(canonical(x).encode()).hexdigest()
def report():
 import sympy as s
 import pint
 u=pint.UnitRegistry();assert ((6*u.meter/u.second)/(4/u.second)).to('m').magnitude==1.5
 assert (2*u.meter/u.second*1.5*u.second).to('m').magnitude==3
 assert (1/(2*u.second)).check('1/[time]')
 pkg=json.loads((FOLDER/'experiment-c5-wave-basis-reading-20261127.json').read_text());bindings=json.loads((FOLDER/'experiment-c5-wave-basis-reading-20261127-bindings.json').read_text());originals={r['id']:r for r in json.loads((FOLDER/'original-records.json').read_text())};obs=json.loads((FOLDER/'actual-consumer-observation.json').read_text());observations={r['id']:r for r in obs['records']}
 assert len(pkg['records'])==len(EXPECTED)==5 and {r['id']for r in pkg['records']}==set(EXPECTED)
 assert len(bindings)==5 and {r['id']for r in bindings}==set(EXPECTED)
 result=[]
 for row,binding in zip(pkg['records'],bindings):
  key=row['id'];assert digest(row)==binding['candidateSha256']==REVIEWED_ROWS[key]
  assert binding['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d' and binding['sourceId']==key and digest(originals[key])==binding['sourceSha256']
  assert row['baseVersion']==originals[key]['version'] and row['version']==row['baseVersion']+1
  tasks=[]
  for (x,y),actual in zip(EXPECTED[key],observations[key]['tasks']):
   if key.endswith('L01-02'):derived=1/x
   elif key.endswith('L02-01'):derived=2*x
   elif key.endswith('L02-02'):derived=6/x
   elif key.endswith('L02-04'):derived=F(s.sin(s.pi*s.Rational(x.numerator,x.denominator)/180)*2)
   else:derived=2+x
   assert derived==y and actual['input']==float(x) and actual['exactManualNumericEntry']==float(y) and actual['modelOutput']==float(y)
   tasks.append({'inputExact':str(x),'inputUnit':row['control']['unit'],'independentlyDerivedExact':str(y),'outputUnit':row['measure']['unit'],'numericEntry':float(y),'CPUObserved':actual['modelOutput'],'manualArithmetic':'PASS'})
  for control in observations[key]['controls']:
   x=F(str(control['x']))
   if key.endswith('L01-02'):v=1/x
   elif key.endswith('L02-01'):v=2*x
   elif key.endswith('L02-02'):v=6/x
   elif key.endswith('L02-04'):v=s.sin(s.pi*s.Rational(x.numerator,x.denominator)/180)*2
   else:v=2+x
   exactfloat=float(v);actual=control['output']
   # Scientific evaluation of sin15deg grid against exact SymPy radical value;
   # original wrapper maps |raw|<1e-11 to0. Not a candidate/baseline parity tolerance.
   if exactfloat==0:assert actual==0
   else:assert abs(actual-exactfloat)<=8*math.ulp(max(abs(exactfloat),1.0))
   if key.endswith('L01-02'):
    for clock in control['clocks']:
     phase=s.Rational(str(clock['time']))/s.Rational(x.numerator,x.denominator)
     expected=3*s.cos(2*s.pi*phase)
     assert abs(clock['signal']-float(expected))<1e-12
  finding=[]
  if key=='SIM-C5-L03-01':finding=[{'priority':'P3','field':'blocks[4].text','finding':'Amplitude is nonnegative; source says strictly positive while allowed zero second contribution gives zero-amplitude second curve. Replace positive by nonnegative.','status':'OPEN_AUTHOR_CORRECTION_PENDING','mathValuesContested':False}]
  result.append({'id':key,'candidateSha256':digest(row),'sourceSha256':binding['sourceSha256'],'mathUnitsDomainsAndManual':'PASS','tasks':tasks,'editorialFindings':finding,'reviewStatus':'NEEDS_WORDING_CORRECTION'if finding else'SCIENTIFIC_TEXT_REVIEW_PASS_UI_PENDING','productUI':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0})
 return {'role':'INDEPENDENT_AI_SCIENTIFIC_REVIEW','candidateCommit':'4691a70e6d51535b85822a32f3e29143c2c64316','records':result,'CPUGridChecks':obs['gridCount'],'CPUClockSamples':obs['clockCount'],'primaryCommit':'de913aa3','primarySha256':'6f27bdca847bf0c0601b05ee2ef8de36bbc857711fd3573673507194a958be6a','groupScientificAcceptance':False,'reason':'One minor amplitude-zero wording finding; no browser evidence from this review.','productUI':'NOT_RUN','humanApproval':'NOT_RUN','activityCredit':0,'publicationAction':'NONE'}
if __name__=='__main__':
 result=report();(FOLDER/'independent-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'records':len(result['records']),'grid':result['CPUGridChecks'],'clock':result['CPUClockSamples'],'math':5,'openEditorial':1,'activityCredit':0}))
