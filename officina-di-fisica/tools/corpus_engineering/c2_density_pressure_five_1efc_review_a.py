"""Read-only first-five C2 preflight; no browser or approval is inferred."""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math,types
from . import c2_41_static_cb9_verifier_a as frozen
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-density-pressure-five-1efc-independent-a-20261127'
CANDIDATE='3abd7dce2c2d837c903c9e17ac1d7fd0aa08dcca'
RUNTIME='1efcd26bbb078453b75be5fbd1502b95cf07c0ffabb4112a4e4cf78170ff46aa'
IDS=tuple('SIM-C2-L001-0'+str(i)for i in range(1,6))
LIMITS=dict(zip(IDS,[(1,3),(0,8),(1,8),(1,10),(70,110)]))
def model():return frozen.model_for(IDS[0])
def exact_value(key,x):
 if key not in IDS:raise ValueError('Outside assigned five activities')
 v=frozen.exact_number(x);lo,hi=LIMITS[key]
 if not lo<=v<=hi:raise ValueError('Outside original domain')
 if key==IDS[0]and v.is_integer is not True:raise ValueError('Three discrete assigned states only')
 return model().exact_value(key,v)
def observed(key,x,y):
 if type(x)not in(int,float)or not math.isfinite(x)or type(y)not in(int,float)or not math.isfinite(y):raise ValueError('Finite actual numeric observation required')
 want=exact_value(key,Fraction(str(x)))
 if not math.isclose(y,float(want),rel_tol=1e-12,abs_tol=1e-12):raise ValueError('Observed scalar differs')
 return want
def source_geometry(key,x,elements):
 if key not in IDS or not model().geometry_semantics(key,x,elements):raise ValueError('Original geometric semantics differ')
 if key==IDS[1]:
  arrows=[e for e in elements if e['kind']=='arrow'and e['c']==0x147979]
  for e in arrows:
   if e['a'][2]!=1.1 or e['b'][2]!=1.1:raise ValueError('Layer arrows must be in front of both opaque plates')
  # Native cone maximum radius .028*2.9 stays beyond plate half-depth .9.
  if 1.1-.028*2.9<=.9:raise ValueError('Insufficient cone clearance from plate')
 return True
def static_report():
 raw=(BASE/'current-node.json').read_bytes();p=json.loads(raw)
 if p['sourceCommit']!=CANDIDATE or p['runtimeSha256']!=RUNTIME or p['UI']!='NOT_RUN':raise ValueError('Current read-only source collection required')
 m=model();subset={key:m.SPECS[key]for key in IDS};namespace={**m.compare_runtime.__globals__,'SPECS':subset}
 compare=types.FunctionType(m.compare_runtime.__code__,namespace,name='compare_first_five_without_mutating_legacy')
 comparisons=compare({r['id']:r for r in p['records']});checks=m.independent_checks();rows=[]
 for r in p['records']:
  key=r['id'];exact=checks[key]
  if not all(c['ok']for c in exact)or not comparisons[key]['ok']:raise ValueError('Independent first-five math/code comparison failed: '+key)
  for c in r['cases']:
   observed(key,c['x'],c['output']['y'])
   for stage in c['stages']:source_geometry(key,c['x'],stage['elements'])
  rows.append(dict(id=key,originalVersion=r['record']['version'],exactChecks=exact,currentCode=comparisons[key],legalControlCount=len(r['cases']),sourceStageCount=sum(len(c['stages'])for c in r['cases']),legacyNegative=m.VISUAL_ISSUES.get(key),legacyNegativeRuntime=m.READ_RUNTIME_PROFILE_SHA256,physicalAssumptions=m.ASSUMPTIONS[key],priorManualDerivation=m.MANUAL[key],legacyReportNotRetagged=True,currentUI='NOT_RUN',visualReview='PENDING_NEW_BROWSER_AND_RASTER_READING',activityCredit=0,humanApproval='NOT_RUN'))
 if len(rows)!=5 or {r['id']for r in rows}!=set(IDS):raise ValueError('Exactly five source rows required')
 return dict(schemaVersion='1.0.0',phase='CURRENT_PREFLIGHT_ONLY_NOT_REGISTRABLE',sourceCommit=CANDIDATE,runtimeSha256=RUNTIME,sourceCaseCount=sum(r['legalControlCount']for r in rows),sourceStageCount=sum(r['sourceStageCount']for r in rows),exactCheckCount=sum(len(r['exactChecks'])for r in rows),records=rows,browser='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
