from pathlib import Path
from fractions import Fraction as F
import hashlib,json
FOLDER=Path(__file__).resolve().parent
PINS={'SIM-C2-L006-01':'52b5286cab0964c438baa916f705c138de102a2f0af4b49a3f606cf093bc6efe','SIM-C2-L006-02':'0d818189045b4bb173250da4dcac0bdae0376b6203e3280ed06e9bb416ebf290','SIM-C2-L006-03':'75709288fb0abf5bdd1653c90c5e79e7722a03377a234b5cb13a8bd73f558948','SIM-C2-L006-04':'58b85a52cf85f20793b09e41df8b861ae75ad107929c13f0fec587dca099ed8e'}
EXPECTED=[[(F(3),F(16)),(F(2),F(37,2))],[(F(2),F(2)),(F(4),F(8))],[(F(1,2),F(4)),(F(2),F(1))],[(F(6),F(9)),(F(4),F(11))]]
canon=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
digest=lambda x:hashlib.sha256(canon(x).encode()).hexdigest()
def value(i,x):return 20+(1-x*x)/2 if i==0 else x*x/2 if i==1 else 2/x if i==2 else 15-x

def report():
 import pint
 import sympy as s
 u=pint.UnitRegistry()
 assert ((1000*u.kg/u.m**3)*(3*u.m/u.s)**2/2).to('kPa').magnitude==4.5
 assert (1*u.joule/u.m**3).to('Pa').magnitude==1
 assert ((2*u.m**2)*(2*u.m/u.s)).check('[length]**3/[time]')
 pkg=json.loads((FOLDER/'experiment-c2-bernoulli-reading-20261127.json').read_text());bindings=json.loads((FOLDER/'experiment-c2-bernoulli-reading-20261127-bindings.json').read_text());originals={r['id']:r for r in json.loads((FOLDER/'original-records.json').read_text())};obs=json.loads((FOLDER/'actual-CPU-observation.json').read_text());byid={r['id']:r for r in obs['records']};primary=json.loads((FOLDER/'source-primary.json').read_text())
 assert len(pkg['records'])==len(bindings)==len(byid)==4 and {r['id']for r in pkg['records']}==set(PINS)
 rows=[]
 for i,(r,b)in enumerate(zip(pkg['records'],bindings)):
  key=r['id'];assert digest(r)==b['candidateSha256']==PINS[key]and b['sourceId']==key and b['sourceRef']=='5d1dc8dc7b601aef959d10d564c75462be74708d' and digest(originals[key])==b['sourceSha256'];assert r['baseVersion']==1 and r['version']==2
  assert len(byid[key]['tasks'])==2 and len(byid[key]['controls'])==round((r['control']['max']-r['control']['min'])/r['control']['step'])+1
  tasks=[]
  for(x,y),actual in zip(EXPECTED[i],byid[key]['tasks']):
   assert value(i,x)==y and actual['input']==float(x)and actual['modelOutput']==float(y)and actual['manualNumericEntry']==float(y)
   tasks.append({'inputExact':str(x),'inputUnit':r['control']['unit'],'independentExact':str(y),'outputUnit':r['measure']['unit'],'numericEntry':float(y),'actualNumberAccepted':True})
  for c in byid[key]['controls']:assert c['output']==float(value(i,F(str(c['x']))))
  x=s.symbols('x',positive=True)
  if i==0:assert s.sqrt(41-2*(s.Rational(41,2)-x*x/2))==x
  elif i==1:assert s.sqrt(2*x*x/2)==x
  elif i==2:assert s.cancel(2/(2/x)-x)==0
  else:assert s.simplify(15-(15-x)-x)==0
  rows.append({'id':key,'candidateSha256':digest(r),'sourceSha256':b['sourceSha256'],'scientificTextManualUnitsAndHypotheses':'PASS','tasks':tasks,'hypotheses':primary['records'][i]['hypothesesAndDomain'],'representationStatus':'CPU_FAILURE_DIFFERENT_VISUAL_GAINS_EQUAL_AREA'if i==2 else'NO_NEW_CPU_FAILURE_IN_CHECKED_SCOPE','PitotVisualStatus':'OPEN_NO_NEW_UI'if i==1 else'NOT_CLOSED_BY_THIS_CPU_REVIEW','UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
 assert F(4,5)*F(13,20)==F(13,25)and F(4,5)*F(2,3)==F(8,15)
 assert (F(8,15)/F(13,25))==F(40,39)
 assert F(6,25)*(F(13,20)**2-F(2,3)**2)==-F(79,15000)
 return{'role':'INDEPENDENT_AI_CPU_SCIENTIFIC_REVIEW','candidateCommit':'93ee5b5acf91de1030dbeb33f962252acb9ba34f','runtimeCommit':'b9994b9116e87478905191d85cca8037d17ae4bd','primarySha256':hashlib.sha256((FOLDER/'source-primary.json').read_bytes()).hexdigest(),'records':rows,'gridChecks':obs['gridCount'],'formulaSyntaxChecks':obs['katexFormulaCount'],'mathAndManualPass':4,'sourceCandidateTextFailures':0,'consumerCodeRepresentationFailures':['SIM-C2-L006-03'],'consumerFailureExactWitness':{'areaRatio':'1','physicalSpeedBoth':'2m/s','displayArrowRatio':'40/39','pressureColumnDifferenceWorld':'-79/15000','noUIObserved':True},'PitotExistingVisualLimits':'RETAINED_NO_NEW_RASTER_OR_FULL_GEOMETRY_ACCEPTANCE','UI':'NOT_RUN','canonicalRegistration':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':
 r=report();(FOLDER/'independent-review.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'textMathManualPass':4,'gridChecks':r['gridChecks'],'formulas':r['formulaSyntaxChecks'],'representationFailures':r['consumerCodeRepresentationFailures'],'UI':'NOT_RUN','activityCredit':0}))
