"""Integrity of an explicitly negative48case distinct review; no activity admission."""
from pathlib import Path
import json,hashlib,gzip
BASE=Path(__file__).resolve().parent
INDEX='c90f2f168f847f1f313c057759ef0b33ea098b07530391f46a36fab3b69fef85'
RUNTIME='91f08d7f0e253778ebf36d8c2241b644e7809ee43884ca9b87d8a854aba650cf'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen negative peer commitment differs')
 for name,pin in load(base/'actual-proof-index.json')['files'].items():
  p=base/name
  if p.is_symlink()or not p.is_file()or sha(p)!=pin:raise ValueError('Missing/changed actual peer bytes: '+name)
 ui=load(base/'actual-ui-48/report.json');term=load(base/'actual-ui-48/terminal-receipt.json');plan=load(base/'actual-ui-48/executed-plan.json');judgment=load(base/'independent-judgment.json')
 if term['actualExitCode']!=0 or term['error']is not None or term['before']!=term['after']or term['before']['sha256']!=RUNTIME or ui['runtimeBefore']!=term['before']or ui['runtimeAfter']!=term['after']or ui['errors']or ui.get('failure')or not ui['matrixComplete']:raise ValueError('Actual observed terminal/epoch failed')
 if len(ui['records'])!=48 or len(plan)!=48 or len({x['key']for x in ui['records']})!=48 or{x['key']for x in ui['records']}!={x['key']for x in plan}:raise ValueError('Actual case set incomplete/duplicate')
 if ui['protocolSha256']!=sha(base/'browser-canary.mjs')or term['protocolSha256']!=ui['protocolSha256']or term['supervisorSha256']!=sha(base/'run-bounded.py')or ui['planSha256']!=sha(base/'actual-ui-48/executed-plan.json'):raise ValueError('Actually executed protocol differs')
 for row in ui['records']:
  if not row['technicalOk']or row['actualSelectedView']!=row['view']or not row['legendOpened']or row['openedLegendAxe']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or row['clockObservation']!=row['independentExpected']or float(row['actualTime'])!=float(f"{row['requestedTime']:.5f}"):raise ValueError('Actual controls/clock/display/layout differ')
  if sha(base/'actual-ui-48'/row['png'])!=row['pngSha256']:raise ValueError('Original actual image changed')
 receipt=load(base/'geometry-process.json');compressed=(base/'actual-full-glyph-geometry.json.gz').read_bytes();decoded=gzip.decompress(compressed)
 if receipt['actualExitCode']!=0 or receipt['stderr']or len(decoded)!=receipt['decodedStdoutBytes']or hashlib.sha256(decoded).hexdigest()!=receipt['decodedStdoutSha256']or hashlib.sha256(compressed).hexdigest()!=receipt['compressedSha256']:raise ValueError('Actual lossless geometry stdout differs')
 geo=json.loads(decoded)
 if geo['actualUiStates']!=36 or len(geo['results'])!=36:raise ValueError('Actual native geometry set incomplete')
 expected={f'vertical-{state}-{width}-orbit'for state in['apex','near-apex','late']for width in[320,1280]};failed={r['case']for r in geo['results']if r['occludedSampleCount']}
 if failed!=expected or any(r['outsideViewport']or r['occlusionBySolid']['base']for r in geo['results']):raise ValueError('Specific acquired negative/positive scope differs')
 for row in geo['results']:
  if row['case']in expected:
   want=443 if '-late-' in row['case'] else 371
   if row['occludedSampleCount']!=want or row['occlusionBySolid']['particle']!=want:raise ValueError('Actual particle mask witness differs')
 z=load(base/'z-cart-observation.json')
 if z['tipInsideCart']or z['projectedConeSurfaceSamplesInsideCart']!=71 or z['actualOpaqueZCartRectangle']!=[59,575,74,594]:raise ValueError('Partial rim must not become tip/whole-cone claim')
 if judgment['ok']is not False or judgment['decision']!='NOT_ACCEPTED_RESIDUAL_PARTICLE_AND_AXIS_CART_MASKS'or judgment['activityCredit']!=0 or judgment['humanApproval']!='NOT_RUN'or judgment['publicationAction']!='NONE':raise ValueError('Negative epoch cannot become approval')
 return{'ok':False,'technicalOk':True,'actualCases':48,'particleOccludedUiCaptures':6,'axisPartialRimUiCaptures':1,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
