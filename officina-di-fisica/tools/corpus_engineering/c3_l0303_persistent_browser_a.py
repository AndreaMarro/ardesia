from pathlib import Path
import json
from . import c3_draft_bounded_browser_review_a as common
APP=common.APP
BASE=APP/'editorial/reviews/c3-l0303-persistent-independent-a-20261127'
ID='SIM-C3-L03-03'
def report():
 r=common.report(BASE,ID)
 for width in (320,1280):
  for c in common.actual(BASE/str(width),ID):
   if 'interaction'not in c:continue
   x=c['sourceReplayedX'];h=.14+2.08*(.5+x/50)
   arrows=[e for e in c['elements']if e['kind']=='arrow']
   if len(arrows)!=1:raise ValueError('Single constant-pressure cue required')
   for got,want in zip(arrows[0]['a'],[.95,h+.92,0],strict=True):common.cpu.roundoff_only(got,want)
   for got,want in zip(arrows[0]['b'],[.95,h+.92-.6*.7,0],strict=True):common.cpu.roundoff_only(got,want)
 return r
