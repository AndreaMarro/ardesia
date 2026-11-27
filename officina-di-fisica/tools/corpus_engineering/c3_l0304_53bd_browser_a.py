"""New53bd bounded mixture review; existing7c modules/globals remain frozen."""
from types import FunctionType,SimpleNamespace
import hashlib,json
from . import c3_draft_bounded_browser_review_a as legacy
APP=legacy.APP
BASE=APP/'editorial/reviews/c3-l0304-53bd-independent-a-20261127'
ID='SIM-C3-L03-04'
SOURCE='1b72b71a68a6023ab1c9fa189733947b03029914'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
COMMON_SHA256='20a408c56410aec0fd4c925a7d6772b53798f8508a4608dd1f8c63cf929370a1'
def bind():
 if hashlib.sha256((APP/'tools/corpus_engineering/c3_draft_bounded_browser_review_a.py').read_bytes()).hexdigest()!=COMMON_SHA256:raise ValueError('Frozen actual-observation guard changed')
 cpu=SimpleNamespace(**vars(legacy.cpu));cpu.SOURCE=SOURCE;cpu.RUNTIME=RUNTIME
 actual=FunctionType(legacy.actual.__code__,{**legacy.actual.__globals__,'cpu':cpu},'actual_53bd',legacy.actual.__defaults__)
 review=FunctionType(legacy.report.__code__,{**legacy.report.__globals__,'cpu':cpu,'actual':actual},'report_53bd',legacy.report.__defaults__)
 return actual,review

def verify_mixture_cues():
 actual,_=bind()
 for width in (320,1280):
  for c in actual(BASE/str(width),ID):
   if 'interaction'not in c:continue
   x=c['sourceReplayedX'];y=c['model']['y'];rods=[e for e in c['elements']if e['kind']=='rod'and e.get('r')==.044];boxes=[e for e in c['elements']if e['kind']=='box']
   if len(rods)!=1 or rods[0]['a']!=[.4,.46,0]or len(boxes)!=1:raise ValueError('Expected mixture sample and one distinct thermometer column')
   for got,want in zip(rods[0]['b'],[.4,.64+1.51*((y-20)/60),0],strict=True):legacy.cpu.roundoff_only(got,want)
   # The box is a declared schematic mass cue, not a measured water volume.
   e=boxes[0]
   for got,want in zip(e['p'],[-1.39,.17+.37*x/300,0],strict=True):legacy.cpu.roundoff_only(got,want)
   for got,want in zip(e['size'],[.62,.18+.74*x/300,.58],strict=True):legacy.cpu.roundoff_only(got,want)

def report():
 _,review=bind();visual=json.loads((BASE/'visual-review-per-id.json').read_bytes())
 if visual['sourceCommit']!=SOURCE or visual['runtimeSha256']!=RUNTIME:raise ValueError('New epoch independent visual judgment required')
 r=review(BASE,ID);verify_mixture_cues();r['legacyModuleDependencySha256']=COMMON_SHA256;r['historicalExposure']='Source-first independent six-model proof and full Core draft already read in CPU stage; no fresh blindness claimed';return r
