"""Distinct phase80 reviewer: final energy result and current-clock mass are separate."""
from types import FunctionType,SimpleNamespace
from fractions import Fraction
import hashlib,json
from . import c3_draft_bounded_browser_review_a as legacy
APP=legacy.APP;BASE=APP/'editorial/reviews/c3-l0401-53bd-independent-a-20261127'
ID='SIM-C3-L04-01';SOURCE='1b72b71a68a6023ab1c9fa189733947b03029914';RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
COMMON_SHA256='20a408c56410aec0fd4c925a7d6772b53798f8508a4608dd1f8c63cf929370a1'
GRID=(0,Fraction(167,100),Fraction(167,10),Fraction(1837,100),Fraction(167,5))
TIMES=(0,Fraction(1,8),10,20)
def require(ok,message):
 if not ok:raise ValueError(message)
def bind():
 require(hashlib.sha256((APP/'tools/corpus_engineering/c3_draft_bounded_browser_review_a.py').read_bytes()).hexdigest()==COMMON_SHA256,'Frozen actual guard changed')
 cpu=SimpleNamespace(**vars(legacy.cpu));cpu.SOURCE=SOURCE;cpu.RUNTIME=RUNTIME
 actual=FunctionType(legacy.actual.__code__,{**legacy.actual.__globals__,'cpu':cpu},'actual_53bd',legacy.actual.__defaults__)
 review=FunctionType(legacy.report.__code__,{**legacy.report.__globals__,'cpu':cpu,'actual':actual},'report_53bd',legacy.report.__defaults__)
 return actual,review

def exact_instant_mass(q,time):
 q=legacy.cpu.primary.exact(q);time=legacy.cpu.primary.exact(time)
 require(0<=q<=Fraction(167,5) and 0<=time<=20,'Phase control/time outside bounded physical model')
 return min(legacy.cpu.primary.law(ID,q),5*time)

def verify_case(c):
 if 'interaction'not in c:return
 state=c['interaction'];kind=state.get('kind');index=state.get('index')
 require(type(index)is int and kind in('grid','clock'),'Missing exact planned phase interaction')
 if kind=='grid':
  require(0<=index<5,'Unplanned phase grid');q=GRID[index];time=0;expected=dict(kind='grid',index=index,x=float(q))
 else:
  require(0<=index<4,'Unplanned phase clock');q=GRID[4];time=TIMES[index];expected=dict(kind='clock',index=index,x=float(q),time=float(time))
 require(state==expected,'Case interaction differs from the frozen grid/clock plan')
 legacy.cpu.roundoff_only(c['sourceReplayedX'],q);legacy.cpu.roundoff_only(c['sourceReplayedClockTime'],time)
 require(Fraction(c['clockReadout'])==Fraction(time),'Actual displayed clock differs from requested instant')
 final=legacy.cpu.primary.law(ID,q);legacy.cpu.roundoff_only(c['model']['y'],final)
 mass=exact_instant_mass(q,time);fraction=float(mass)/100
 elements=c['elements'];liquid=[e for e in elements if e['kind']=='rod'and e.get('r')==.87];solid=[e for e in elements if e['kind']=='box'];thermo=[e for e in elements if e['kind']=='rod'and e.get('r')==.047]
 require(len(liquid)==(1 if mass>0 else 0) and len(solid)==(1 if mass<100 else 0),'A phase is missing or falsely persists at zero/full transformation')
 require(len(thermo)==1 and thermo[0]['a']==[1.4,.38,0],'Fixed coexistence thermometer missing')
 for got,want in zip(thermo[0]['b'],[1.4,.88,0],strict=True):legacy.cpu.roundoff_only(got,want)
 if liquid:
  require(liquid[0]['a']==[0,.16,0],'Liquid datum moved')
  for got,want in zip(liquid[0]['b'],[0,.16+.99*fraction,0],strict=True):legacy.cpu.roundoff_only(got,want)
 if solid:
  side=.95*(1-fraction)**(1/3)
  for got,want in zip(solid[0]['size'],[side]*3,strict=True):legacy.cpu.roundoff_only(got,want)
  for got,want in zip(solid[0]['p'],[0,.16+.97*fraction+side/2,0],strict=True):legacy.cpu.roundoff_only(got,want)
 require(not any(e['kind']=='arrow'for e in elements),'L04-01 has no heat-arrow claim; keep separate from L04-03')
 display={0:'0',Fraction(5,8):'0,625',50:'50',100:'100'}[Fraction(mass)]
 final=legacy.cpu.primary.law(ID,q);readings=c['readings']
 require('Massa già fusa'+display+' g'in readings and'Massa fusa (a fine prova)'+str(final)+' g'in readings and'Temperatura nella coesistenza0 °C'in readings,'Final/current mass or0C displayed reading changed')
 return dict(kind=kind,inputExact=str(q),timeExact=str(time),finalMassExact=str(final),instantMassExact=str(mass))

def verify_width(width):
 actual,_=bind();cases=actual(BASE/str(width),ID);require(len(cases)==40,'Expected one complete40-case tranche')
 prepared=json.loads((BASE/str(width)/'prepared.json').read_bytes());row=prepared['records'][0]
 require(row['hasClock']is True and row['clockInput']is False and row['clockCases']==[dict(gridIndex=4,time=float(t))for t in TIMES],'Clock control plan changed')
 results=[verify_case(c)for c in cases if'interaction'in c];require(len(results)==36,'Four setup and36 state cases per width required');return results

def report():
 _,review=bind();visual=json.loads((BASE/'visual-review-per-id.json').read_bytes());require(visual['sourceCommit']==SOURCE and visual['runtimeSha256']==RUNTIME,'New epoch visual judgment missing')
 r=review(BASE,ID)
 for width in(320,1280):verify_width(width)
 r.update(actualClockCases=32,exactInstantMassAtFourTimes=['0','5/8','50','100'],finalAndCurrentMassSeparated=True,legacyModuleDependencySha256=COMMON_SHA256,historicalExposure='Independent source-first phase model and all Core drafts already read; literal-plan Node preflight distinct; no fresh blindness claimed')
 return r
