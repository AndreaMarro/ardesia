"""New53bd bounded signed phase review; existing7c modules/globals remain frozen."""
from types import FunctionType,SimpleNamespace
from fractions import Fraction
import hashlib,json
from . import c3_draft_bounded_browser_review_a as legacy
APP=legacy.APP
BASE=APP/'editorial/reviews/c3-l0402-53bd-independent-a-20261127'
ID='SIM-C3-L04-02'
SOURCE='1b72b71a68a6023ab1c9fa189733947b03029914'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
COMMON_SHA256='20a408c56410aec0fd4c925a7d6772b53798f8508a4608dd1f8c63cf929370a1'
def bind():
 if hashlib.sha256((APP/'tools/corpus_engineering/c3_draft_bounded_browser_review_a.py').read_bytes()).hexdigest()!=COMMON_SHA256:raise ValueError('Frozen actual-observation guard changed')
 cpu=SimpleNamespace(**vars(legacy.cpu));cpu.SOURCE=SOURCE;cpu.RUNTIME=RUNTIME
 actual=FunctionType(legacy.actual.__code__,{**legacy.actual.__globals__,'cpu':cpu},'actual_53bd',legacy.actual.__defaults__)
 review=FunctionType(legacy.report.__code__,{**legacy.report.__globals__,'cpu':cpu,'actual':actual},'report_53bd',legacy.report.__defaults__)
 return actual,review

GRID=(-5,-2,0,3,5)
PARTICLES={-5:0,-2:4,0:7,3:11,5:14}
DISPLAY={-5:'-11,3',-2:'-4,52',0:'0',3:'6,78',5:'11,3'}
def require(ok,message):
 if not ok:raise ValueError(message)
def verify_case(c):
 if 'interaction'not in c:return
 state=c['interaction'];i=state.get('index');require(type(i)is int and 0<=i<5 and state==dict(kind='grid',index=i,x=GRID[i]),'Exact signed-grid interaction required')
 x=GRID[i];legacy.cpu.roundoff_only(c['sourceReplayedX'],x);legacy.cpu.roundoff_only(c['model']['y'],legacy.cpu.primary.law(ID,x))
 require(c['sourceReplayedClockTime']is None,'This signed phase model has no clock')
 f=(5-x)/10;e=c['elements'];liquid=[r for r in e if r['kind']=='rod'and r.get('r')==.87];vapor=[r for r in e if r['kind']=='ball'and r.get('r')==.07]
 require(len(liquid)==(1 if f>0 else 0)and len(vapor)==PARTICLES[x]and not any(r['kind']=='box'for r in e),'Schematic phase presence/count changed')
 if liquid:
  require(liquid[0]['a']==[0,.16,0],'Liquid datum moved')
  for got,want in zip(liquid[0]['b'],[0,.16+.99*f,0],strict=True):legacy.cpu.roundoff_only(got,want)
 labels=[r['text']for r in e if r['kind']=='label'];require(('Liquido'in labels)==(f>0),'Liquid label falsely present/absent')
 require('Calore assorbito dall’acqua'+DISPLAY[x]+' kJ'in c['readings'],'Actual heat sign or units differ from exact assigned latent heat')
 return dict(transformedMass=x,exactHeatKJ=str(legacy.cpu.primary.law(ID,x)),particleCount=len(vapor),schematicLiquidPresent=bool(liquid))
def report():
 actual,review=bind();visual=json.loads((BASE/'visual-review-per-id.json').read_bytes());require(visual['sourceCommit']==SOURCE and visual['runtimeSha256']==RUNTIME,'New epoch reading missing')
 r=review(BASE,ID)
 for width in(320,1280):
  rows=actual(BASE/str(width),ID);require(len(rows)==24,'Expected exactly24 per width')
  for c in rows:verify_case(c)
 r.update(legacyModuleDependencySha256=COMMON_SHA256,historicalExposure='Source-first independent model and all Core6ae3drafts already read; no new blindness claimed',particleRepresentation='Schematic phase comparison, not calibrated absolute inventory or molecule count')
 return r
