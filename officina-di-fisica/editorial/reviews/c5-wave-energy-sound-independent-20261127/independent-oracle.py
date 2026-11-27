"""Independent six-model exact oracle and individual read judgment, no author import."""
from pathlib import Path
from fractions import Fraction as F
import json,hashlib,math
FOLDER=Path(__file__).resolve().parent
EXPECTED={
'SIM-C5-L04-01':[(F(2),F(4)),(F(3,2),F(9,4))],
'SIM-C5-L04-02':[(F(4),F(8)),(F(3),F(6))],
'SIM-C5-L04-03':[(F(4),F(1,16)),(F(3),F(1,9))],
'SIM-C5-L05-01':[(F(3),F(30)),(F(1),F(7500,17))],
'SIM-C5-L05-02':[(F(6),F(60)),(F(4),F(40))],
'SIM-C5-L05-03':[(F(30),F(1000,3)),(F(-20),F(1125,4))],
}
REVIEWED_ROWS={
'SIM-C5-L04-01':'48b8e26c856fe8e0bedccdb99d98689bf2ed7fb59d0c1bb87b6a500bb5a19963',
'SIM-C5-L04-02':'de6ca9ce12eed1212adf1b2c50e56a47861aa7e870c1414de008dba97a892854',
'SIM-C5-L04-03':'3c0ca720123de5b7664e26414cdca5e76816a489eaf7830aa499905df26e0939',
'SIM-C5-L05-01':'cf72965bce5b1fb6eb7bb95c27b1219c04d5db66a0d445e20d33b7954c8e5a7e',
'SIM-C5-L05-02':'5aaa13e0a18e5734e7b5edb5b5922e86a9bf7cee40bd7d4a465addf9c2988b36',
'SIM-C5-L05-03':'503579de6ebd86390e7cc0e45a7d3b22e44efdd9582f29af331b5e4dcc5f6379',
}
canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
digest=lambda x:hashlib.sha256(canonical(x).encode()).hexdigest()
def model(key,x):
 if key.endswith('L04-01'):return x*x
 if key.endswith('L04-02'):return 2*x
 if key.endswith('L04-03'):return 1/(x*x)
 if key.endswith('L05-01'):return F(150000)/[340,1500,5000][int(x)-1]
 if key.endswith('L05-02'):return 10*x
 return F(90000)/(300-x)
def report():
 import sympy as s
 import pint
 u=pint.UnitRegistry()
 assert ((1*u.kg/u.m)*(1*u.m/u.s)*(1/u.s**2)*(1*u.m**2)).check('[power]')
 assert (10*u.W/u.m**2*4*u.cm**2*2*u.s).to('mJ').magnitude==8
 assert ((150*u.m)/(5000*u.m/u.s)).to('ms').magnitude==30
 assert ((4*s.pi)/(4*s.pi*4**2))==s.Rational(1,16)
 assert s.log(10**6,10)*10==60 and s.log(10**4,10)*10==40
 pkg=json.loads((FOLDER/'experiment-c5-wave-energy-sound-reading-20261127.json').read_text());bindings=json.loads((FOLDER/'experiment-c5-wave-energy-sound-reading-20261127-bindings.json').read_text());originals={r['id']:r for r in json.loads((FOLDER/'original-records.json').read_text())};obs=json.loads((FOLDER/'actual-consumer-observation.json').read_text());observations={r['id']:r for r in obs['records']}
 assert len(pkg['records'])==len(EXPECTED)==6 and {r['id']for r in pkg['records']}==set(EXPECTED)
 assert len(bindings)==6 and {r['id']for r in bindings}==set(EXPECTED)
 result=[]
 for row,binding in zip(pkg['records'],bindings):
  key=row['id'];assert digest(row)==binding['candidateSha256']==REVIEWED_ROWS[key]
  assert binding['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d' and binding['sourceId']==key and digest(originals[key])==binding['sourceSha256']
  assert row['baseVersion']==originals[key]['version'] and row['version']==row['baseVersion']+1
  tasks=[]
  for (x,y),actual in zip(EXPECTED[key],observations[key]['tasks']):
   assert model(key,x)==y and actual['input']==float(x) and actual['modelOutput']==float(y)
   entry=F(str(actual['exactManualNumericEntry']));error=abs(entry-y)
   assert float(error)<=max(.000001,.005*abs(float(y)))
   tasks.append({'inputExact':str(x),'inputUnit':row['control']['unit'],'independentlyDerivedExact':str(y),'outputUnit':row['measure']['unit'],'numericEntry':str(entry),'numericEntryExactError':str(error),'CPUObserved':actual['modelOutput'],'manualArithmetic':'PASS'})
  for control in observations[key]['controls']:
   x=F(str(control['x']));assert control['output']==float(model(key,x))
   for clock in control['clocks']:
    time=F(str(clock['time']))
    if key.endswith('L05-01'):
     # Travel clock in milliseconds, one-way path over150m.
     expected=150*time/model(key,x);assert abs(clock['signal']-float(expected))<=8*math.ulp(max(abs(float(expected)),1))
    elif key.endswith('L05-03'):
     # Retarded emission time from source moving in medium; t inms.
     emitted=(s.Rational(3,10)*s.Rational(time.numerator,time.denominator)-3)/(s.Rational(3,10)-s.Rational(x.numerator,x.denominator)/1000)
     expected=s.cos(2*s.pi*s.Rational(3,10)*emitted)
     assert abs(clock['signal']-float(expected))<1e-12
  findings=[]
  if key=='SIM-C5-L05-02':findings=[{'priority':'P3','field':'blocks[4].text','finding':'Exponent greater than one is ambiguous; intended exponent increment by one. Counterexample n0→n1 gives+10dB withnewexponentequal1. Write aumentato di una unita.','status':'OPEN_AUTHOR_WORDING_PENDING','mathValuesContested':False}]
  result.append({'id':key,'candidateSha256':digest(row),'sourceSha256':binding['sourceSha256'],'mathUnitsDomainsAndManual':'PASS','tasks':tasks,'editorialFindings':findings,'reviewStatus':'NEEDS_WORDING_CLARIFICATION'if findings else'SCIENTIFIC_TEXT_REVIEW_PASS_UI_PENDING','productUI':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0})
 return {'role':'INDEPENDENT_AI_SCIENTIFIC_REVIEW','candidateCommit':'c5ae34ddeec000a36082c5ce620dc3ff8f018a06','records':result,'CPUGridChecks':obs['gridCount'],'CPUClockSamples':obs['clockCount'],'primaryCommit':'de913aa3','primarySha256':'6f27bdca847bf0c0601b05ee2ef8de36bbc857711fd3573673507194a958be6a','groupScientificAcceptance':False,'reason':'One minor dB wording clarification; no new browser or canonicalregistration evidence.','productUI':'NOT_RUN','humanApproval':'NOT_RUN','activityCredit':0,'publicationAction':'NONE'}
if __name__=='__main__':
 result=report();(FOLDER/'independent-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'records':len(result['records']),'grid':result['CPUGridChecks'],'clock':result['CPUClockSamples'],'math':6,'openEditorial':1,'activityCredit':0}))
