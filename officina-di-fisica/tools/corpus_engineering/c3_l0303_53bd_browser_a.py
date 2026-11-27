"""Explicit53bd epoch adapter; legacy7c module/globals are immutable."""
from types import FunctionType,SimpleNamespace
import hashlib,json
from . import c3_draft_bounded_browser_review_a as legacy
APP=legacy.APP
BASE=APP/'editorial/reviews/c3-l0303-53bd-independent-a-20261127'
OLD=APP/'editorial/reviews/c3-l0303-persistent-independent-a-20261127'
ID='SIM-C3-L03-03'
SOURCE='1b72b71a68a6023ab1c9fa189733947b03029914'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
COMMON_SHA256='20a408c56410aec0fd4c925a7d6772b53798f8508a4608dd1f8c63cf929370a1'
def bind():
 if hashlib.sha256((APP/'tools/corpus_engineering/c3_draft_bounded_browser_review_a.py').read_bytes()).hexdigest()!=COMMON_SHA256:raise ValueError('Reviewed legacy boundary function source changed')
 cpu=SimpleNamespace(**vars(legacy.cpu));cpu.SOURCE=SOURCE;cpu.RUNTIME=RUNTIME
 actual=FunctionType(legacy.actual.__code__,{**legacy.actual.__globals__,'cpu':cpu},'actual_53bd',legacy.actual.__defaults__)
 report=FunctionType(legacy.report.__code__,{**legacy.report.__globals__,'cpu':cpu,'actual':actual},'report_53bd',legacy.report.__defaults__)
 return actual,report

def compare():
 actual,_=bind();rows=[]
 for width in (320,1280):
  old={c['caseKey']:c for c in legacy.actual(OLD/str(width),ID)};new={c['caseKey']:c for c in actual(BASE/str(width),ID)}
  if old.keys()!=new.keys():raise ValueError('Exact same bounded case coverage required')
  for key in old:
   a,b=old[key],new[key];fields=('model','elements','spec','sourceReplayedX','actualDOMControls','legend','readings')if'interaction'in a else('phases','questions','reading','axe')
   if any(a.get(f)!=b.get(f)for f in fields):raise ValueError('Observed physical/setup delta requires independent investigation')
   rows.append(dict(caseKey=key,rasterBytesEqual=[x['sha256']for x in a['screenshots']]==[x['sha256']for x in b['screenshots']]))
 return dict(pairedCases=len(rows),equalFields=len(rows),equalRasterPairs=sum(r['rasterBytesEqual']for r in rows))

def report():
 _,fn=bind();visual=json.loads((BASE/'visual-review-per-id.json').read_bytes())
 if visual['sourceCommit']!=SOURCE or visual['runtimeSha256']!=RUNTIME:raise ValueError('New epoch visual verdict must be explicit')
 r=fn(BASE,ID);verify_pressure_cue();r['comparisonWith7c']=compare();r['legacyModuleDependencySha256']=COMMON_SHA256;r['historicalExposure']='Own7c proof and source-first model reused, disclosed';return r


def verify_pressure_cue():
 actual,_=bind()
 for width in (320,1280):
  for c in actual(BASE/str(width),ID):
   if 'interaction'not in c:continue
   x=c['sourceReplayedX'];h=.14+2.08*(.5+x/50)
   arrows=[e for e in c['elements']if e['kind']=='arrow']
   if len(arrows)!=1:raise ValueError('Single constant-pressure cue required')
   for got,want in zip(arrows[0]['a'],[.95,h+.92,0],strict=True):legacy.cpu.roundoff_only(got,want)
   for got,want in zip(arrows[0]['b'],[.95,h+.92-.6*.7,0],strict=True):legacy.cpu.roundoff_only(got,want)
