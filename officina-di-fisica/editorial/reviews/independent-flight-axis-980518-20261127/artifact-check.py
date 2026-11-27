"""Integrity of a bounded positive70case distinct peer; no activity admission."""
from pathlib import Path
import json,hashlib,gzip
BASE=Path(__file__).resolve().parent
INDEX='20c36af5a7604bc17ddfbd9cf48fd963d393290dcf4da53818d35047c4d2ebef'
RUNTIME='980518b78d0767d90f16322539852e7e79360e20f05078ceb6e9b0425e805301'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen bounded peer commitment differs')
 for name,pin in load(base/'actual-proof-index.json')['files'].items():
  p=base/name
  if p.is_symlink()or not p.is_file()or sha(p)!=pin:raise ValueError('Missing/changed actual peer bytes: '+name)
 ui=load(base/'actual-ui-70/report.json');term=load(base/'actual-ui-70/terminal-receipt.json');plan=load(base/'actual-ui-70/executed-plan.json');judgment=load(base/'independent-judgment.json')
 if term['actualExitCode']!=0 or term['error']is not None or term['before']!=term['after']or term['before']['sha256']!=RUNTIME or ui['runtimeBefore']!=term['before']or ui['runtimeAfter']!=term['after']or ui['errors']or ui.get('failure')or not ui['matrixComplete']:raise ValueError('Actual observed terminal/epoch failed')
 if len(ui['records'])!=70 or len(plan)!=70 or len({x['key']for x in ui['records']})!=70 or{x['key']for x in ui['records']}!={x['key']for x in plan}:raise ValueError('Actual case set incomplete/duplicate')
 if ui['protocolSha256']!=sha(base/'browser-canary.mjs')or term['protocolSha256']!=ui['protocolSha256']or term['supervisorSha256']!=sha(base/'run-bounded.py')or ui['planSha256']!=sha(base/'actual-ui-70/executed-plan.json'):raise ValueError('Actually executed protocol differs')
 if ui['sourceCommit']!='e02b0a767097f22ed66b7240432fc30b206217fd':raise ValueError('Immutable source provenance differs')
 for row in ui['records']:
  if row['actualPhase']!=row.get('phase',3)or not row['guide'].startswith('ESPLORA'if row['actualPhase']==2 else 'COMPRENDI'):raise ValueError('Actual requested stage differs')
  if not row['technicalOk']or row['actualSelectedView']!=row['view']or not row['legendOpened']or row['openedLegendAxe']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or row['clockObservation']!=row['independentExpected']or float(row['actualTime'])!=float(f"{row['requestedTime']:.5f}"):raise ValueError('Actual controls/clock/display/layout differ')
  if sha(base/'actual-ui-70'/row['png'])!=row['pngSha256']:raise ValueError('Original actual image changed')
 receipt=load(base/'actual-geometry-terminal.json');compressed=(base/'actual-full-glyph-geometry.json.gz').read_bytes();decoded=gzip.decompress(compressed)
 if receipt['actualExitCode']!=0 or receipt['stderr']or len(decoded)!=receipt['decodedStdoutBytes']or hashlib.sha256(decoded).hexdigest()!=receipt['decodedStdoutSha256']or hashlib.sha256(compressed).hexdigest()!=receipt['compressedSha256']:raise ValueError('Actual lossless geometry stdout differs')
 if receipt['protocolSha256']!=sha(base/'observe-gravity-full-glyph.mjs'):raise ValueError('Actual geometry protocol differs')
 source=load(base/'source-review-receipt.json')
 for name,pin in source['actualProductionDeltaFiles'].items():
  if sha(base/'candidate-source-snapshot'/name)!=pin or term['before']['files'].get(name)!=pin:raise ValueError('Acquired immutable source mismatch')
 for name,pin in source['unchangedBenchModelSourcePilotAndFormatSha256'].items():
  if term['before']['files'].get(name)!=pin:raise ValueError('Acquired unchanged model/format mismatch')
 geo=json.loads(decoded)
 for name,pin in geo['sourceHashes'].items():
  if term['before']['files'].get(name)!=pin:raise ValueError('Geometry/source fingerprint mismatch')
 if {r['case']for r in geo['results']}!={r['key']for r in ui['records']if not r['fallback']}:raise ValueError('Geometry actual UI set differs')
 if geo['actualUiStates']!=58 or len(geo['results'])!=58:raise ValueError('Actual native geometry set incomplete')
 for row in geo['results']:
  if row['outsideViewport']or row['occludedSampleCount']or row['renderedSolidOcclusionSamples']:raise ValueError('Acquired resolved solid/frame scope differs')
  policy=row['materialPolicy']
  if policy['shaftDepthTest']or policy['coneDepthTest']or policy['shaftDepthWrite']or policy['coneDepthWrite']or policy['shaftRenderOrder']!=4 or policy['coneRenderOrder']!=4:raise ValueError('Actual annotation policy differs')
  if row['labels']:raise ValueError('Opaque canvas labels unexpectedly emitted')
 for row in ui['records']:
  layout=row['openedLegendLayout']
  if layout['scroll']>layout['width']+1 or layout['documentWidth']>row['width']+1:raise ValueError('Opened actual legend overflow')
  if row['fallback']:
   if 'Nella vista Alto'in row['legend']:raise ValueError('Fallback requests disabled native control')
  elif row['actualTopDisabled']or not all(token in row['legend']for token in['più lunga indica x','più corta indica z','vista Alto']):raise ValueError('Native axis identity/control unavailable')
 if judgment['ok']is not True or judgment['decision']!='BOUNDED_LAB3D02_AXIS_GRAVITY_PEER_POSITIVE'or judgment['activityCredit']!=0 or judgment['humanApproval']!='NOT_RUN'or judgment['publicationAction']!='NONE':raise ValueError('Bounded peer scope altered')
 return{'ok':True,'technicalOk':True,'actualCases':70,'nativeGeometryStates':58,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
