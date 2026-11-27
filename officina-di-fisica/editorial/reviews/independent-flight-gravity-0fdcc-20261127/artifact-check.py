"""Integrity of an explicitly negative70case distinct review; no activity admission."""
from pathlib import Path
import json,hashlib,gzip
BASE=Path(__file__).resolve().parent
INDEX='1708082868221d7110b1c218b76b1465ef1aa494aafb6cb5eedc789ccece518c'
RUNTIME='0fdcc3b04c869d75811a4e07b7b8d1d87210869d6087e12e01ee70b6c370e1d4'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen negative peer commitment differs')
 for name,pin in load(base/'actual-proof-index.json')['files'].items():
  p=base/name
  if p.is_symlink()or not p.is_file()or sha(p)!=pin:raise ValueError('Missing/changed actual peer bytes: '+name)
 ui=load(base/'actual-ui-70/report.json');term=load(base/'actual-ui-70/terminal-receipt.json');plan=load(base/'actual-ui-70/executed-plan.json');judgment=load(base/'independent-judgment.json')
 if term['actualExitCode']!=0 or term['error']is not None or term['before']!=term['after']or term['before']['sha256']!=RUNTIME or ui['runtimeBefore']!=term['before']or ui['runtimeAfter']!=term['after']or ui['errors']or ui.get('failure')or not ui['matrixComplete']:raise ValueError('Actual observed terminal/epoch failed')
 if len(ui['records'])!=70 or len(plan)!=70 or len({x['key']for x in ui['records']})!=70 or{x['key']for x in ui['records']}!={x['key']for x in plan}:raise ValueError('Actual case set incomplete/duplicate')
 if ui['protocolSha256']!=sha(base/'browser-canary.mjs')or term['protocolSha256']!=ui['protocolSha256']or term['supervisorSha256']!=sha(base/'run-bounded.py')or ui['planSha256']!=sha(base/'actual-ui-70/executed-plan.json'):raise ValueError('Actually executed protocol differs')
 if ui['sourceCommit']!='c3b03eb98cdafd706499ee64d6b3f5e356f27da8':raise ValueError('Immutable source provenance differs')
 for row in ui['records']:
  if row['actualPhase']!=row.get('phase',3)or not row['guide'].startswith('ESPLORA'if row['actualPhase']==2 else 'COMPRENDI'):raise ValueError('Actual requested stage differs')
  if not row['technicalOk']or row['actualSelectedView']!=row['view']or not row['legendOpened']or row['openedLegendAxe']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or row['clockObservation']!=row['independentExpected']or float(row['actualTime'])!=float(f"{row['requestedTime']:.5f}"):raise ValueError('Actual controls/clock/display/layout differ')
  if sha(base/'actual-ui-70'/row['png'])!=row['pngSha256']:raise ValueError('Original actual image changed')
 receipt=load(base/'geometry-process.json');compressed=(base/'actual-full-glyph-geometry.json.gz').read_bytes();decoded=gzip.decompress(compressed)
 if receipt['actualExitCode']!=0 or receipt['stderr']or len(decoded)!=receipt['decodedStdoutBytes']or hashlib.sha256(decoded).hexdigest()!=receipt['decodedStdoutSha256']or hashlib.sha256(compressed).hexdigest()!=receipt['compressedSha256']:raise ValueError('Actual lossless geometry stdout differs')
 geo=json.loads(decoded)
 if geo['actualUiStates']!=58 or len(geo['results'])!=58:raise ValueError('Actual native geometry set incomplete')
 for row in geo['results']:
  if row['outsideViewport']or row['occludedSampleCount']or row['renderedSolidOcclusionSamples']:raise ValueError('Acquired resolved solid/frame scope differs')
  policy=row['materialPolicy']
  if policy['shaftDepthTest']or policy['coneDepthTest']or policy['shaftDepthWrite']or policy['coneDepthWrite']or policy['shaftRenderOrder']!=4 or policy['coneRenderOrder']!=4:raise ValueError('Actual annotation policy differs')
 observation=load(base/'x-cart-observation.json')
 if len(observation['results'])!=4:raise ValueError('Two widths and stages required')
 for row in observation['results']:
  narrow='-320-'in row['case']
  if row['tipInsideConservativeOpaqueCore']is not narrow or row['coneSamplesInsideConservativeOpaqueCore']!=(633 if narrow else 182):raise ValueError('Bounded opaque-core mask witness differs')
 if judgment['ok']is not False or judgment['decision']!='NOT_ACCEPTED_RESIDUAL_X_CART_MASK'or judgment['activityCredit']!=0 or judgment['humanApproval']!='NOT_RUN'or judgment['publicationAction']!='NONE':raise ValueError('Negative epoch cannot become approval')
 return{'ok':False,'technicalOk':True,'actualCases':70,'particleOccludedUiCaptures':0,'axisMaskedUiCaptures':4,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
