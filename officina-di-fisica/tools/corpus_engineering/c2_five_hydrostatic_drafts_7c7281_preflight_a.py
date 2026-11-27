"""Independent source/model preflight. Known collector blocker; no UI closure."""
from pathlib import Path
from fractions import Fraction
import json,math,hashlib
import sympy as sp
import pint
from .pipeline import digest
from . import c2_hydrostatic_reading_four_draft_review_a as four
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-five-hydrostatic-drafts-7c7281-preflight-a-20261127'
SOURCE='b9994b9116e87478905191d85cca8037d17ae4bd'
RUNTIME='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
FIRST='SIM-C2-L002-01';IDS=(FIRST,*four.IDS)
def law(key,x):
 if key==FIRST:
  x=four.exact(x)
  if not 0<=x<=3:raise ValueError('Outside depth domain')
  return sp.Rational(981,100)*x
 return four.law(key,x)
def original_transfer(x):
 x=four.exact(x)
 if not 0<=x<=3:raise ValueError('Outside original depth domain')
 return 10*x
def validate_bundle(p,b):
 old=json.loads((BASE/'draft047.verbatim.json').read_bytes());oldb=json.loads((BASE/'binding047.verbatim.json').read_bytes());other=json.loads((BASE/'four-drafts.verbatim.json').read_bytes());otherb=json.loads((BASE/'four-bindings.verbatim.json').read_bytes())
 if p!={'schema':'astra/1','records':old['records']+other['records'],'assets':[]}or b!=oldb+otherb:raise ValueError('Only verbatim record/binding composition is authorized')
 originals={r['id']:r for r in json.loads((BASE/'original-source.json').read_bytes())}
 for r,link in zip(p['records'],b,strict=True):
  if r['version']!=originals[r['id']]['version']+1 or r['baseVersion']!=originals[r['id']]['version']or link['candidateSha256']!=digest(r)or link['sourceSha256']!=digest(originals[r['id']]):raise ValueError('Individual source/draft editions drifted')
 return originals
def report():
 p=json.loads((BASE/'canonical-inputs/experiment-c2-five-hydrostatic-drafts.json').read_bytes());b=json.loads((BASE/'canonical-inputs/experiment-c2-five-hydrostatic-drafts-bindings.json').read_bytes());sources=validate_bundle(p,b);node=json.loads((BASE/'current-installed-source.json').read_bytes());fp=json.loads((BASE/'current-runtime-fingerprint.json').read_bytes())
 if fp['sha256']!=RUNTIME or node['sourceCommit']!=SOURCE or node['browser']!='NOT_RUN':raise ValueError('Exact current source scope required')
 out=[]
 for row in node['records']:
  key=row['id'];r=row['record'];tasks=[]
  for task,point in zip(row['assessment'],r.get('assessmentSelection',{}).get('points',[2,Fraction(3,2)]),strict=True):
   actual=four.exact(Fraction(str(task['value'])));want=law(key,Fraction(str(point)))
   if sp.simplify(actual-want)!=0:raise ValueError('Actual installed task differs from independent source model')
   tasks.append(dict(inputLexeme=str(point),modelExact=str(want),actualInstalled=task,deliveredPhysicsExact=str(original_transfer(Fraction(str(point))))if key==FIRST and row['variant']=='published'and len(tasks)==1 else str(want)))
  for c in row['cases']:
   want=law(key,Fraction(str(c['x'])))
   if not math.isclose(float(want),c['y'],rel_tol=1e-12,abs_tol=1e-12):raise ValueError('Current source scalar differs')
  out.append(dict(id=key,edition=row['variant'],sourceVersion=sources[key]['version'],candidateVersion=r['version'],tasks=tasks,legalStates=len(row['cases']),sourceMath='SOURCE_CONTRACT_CONFLICT_RETAINED'if key==FIRST and row['variant']=='published'else'POSITIVE_PREFLIGHT_ONLY',UI='NOT_RUN',activityCredit=0))
 U=pint.UnitRegistry(non_int_type=sp.Rational);Q=U.Quantity
 checks=[(Q(1000,'kg/m**3')*Q(sp.Rational(981,100),'m/s**2')*Q(2,'m')).to('kPa'),(Q(1000,'kg/m**3')*Q(10,'m/s**2')*Q(sp.Rational(3,2),'m')).to('kPa')]
 negative=json.loads((BASE/'owner-v3-negative-terminal.json').read_bytes())
 if negative['actualObservedExitCode']!=1 or 'Full normalized owner record differs'not in(BASE/'owner-v3-negative.stderr.txt').read_text():raise ValueError('Authentic owner-v3 counterexample must remain negative')
 return dict(schemaVersion='1.0.0',sourceCommit=SOURCE,runtimeSha256=RUNTIME,phase='PREFLIGHT_BLOCKED_COLLECTOR_OWNER_VERSION_PIN',draftCount=5,sourceEditionCount=6,sourceStates=sum(x['legalStates']for x in out),physicalConversions=[str(x)for x in checks],records=out,knownCollectorBlocker=dict(fileSha256='e24c46b4c11403821b026c304875f68edc76b679aa6928b1716bd597c5d15e55',id='SIM-C2-L002-04',originalVersion=2,correctDraftVersion=3,incorrectHardcodedOwnerVersion=2,actualCounterexampleExit=1,productFailure=False),ownerGuestGate='REQUIRED_REAL_CANONICAL_HTTP_IN_FUTURE_BROWSER_NOT_RUN',browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
