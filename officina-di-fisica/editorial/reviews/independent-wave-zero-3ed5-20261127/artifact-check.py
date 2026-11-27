from pathlib import Path
import json,hashlib,gzip
BASE=Path(__file__).resolve().parent
INDEX='c8a46b8cc5879d5afbf05f842d59be79ed07d86f848e2543af819aa45deab3b7'
RUNTIME='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Focused reading commitment differs')
 for name,pin in load(base/'actual-proof-index.json')['files'].items():
  p=base/name
  if p.is_symlink()or not p.is_file()or sha(p)!=pin:raise ValueError('Missing/altered actual focused proof:'+name)
 ui=load(base/'actual-ui-98/report.json');term=load(base/'actual-ui-98/terminal-receipt.json');plan=load(base/'actual-ui-98/executed-plan.json')
 if term['actualExitCode']!=0 or term['error']is not None or term['before']!=term['after']or term['before']['sha256']!=RUNTIME or ui['runtimeBefore']!=term['before']or ui['runtimeAfter']!=term['after']or ui['errors']or ui.get('failure')or not ui['matrixComplete']:raise ValueError('Actual terminal/runtime incomplete')
 if len(ui['records'])!=98 or len(plan)!=98 or{r['key']for r in ui['records']}!={r['key']for r in plan}or len({r['key']for r in ui['records']})!=98:raise ValueError('Actual focused set duplicate/partial')
 if ui['protocolSha256']!=sha(base/'browser-canary.mjs')or term['protocolSha256']!=ui['protocolSha256']or term['supervisorSha256']!=sha(base/'run-bounded.py')or ui['planSha256']!=sha(base/'actual-ui-98/executed-plan.json'):raise ValueError('Actually executed protocol differs')
 for r in ui['records']:
  if not r['technicalOk']or float(r['actualInput'])!=r['time']or r['actualSelectedView']!=r['view']or r['displacement']!=r['expected']or r['actualAmplitude']!=r['amplitude']or r['expected']not in r['accessibleReadings']or r['layout']['axe']or r['layout']['documentWidth']>r['width']+1 or r['freeBytesBeforeCapture']<2147483648:raise ValueError('Actual input/display/AX/layout/resource differs')
  if r['fallback']and 'Spostamento in P · '+r['expected']not in r['diagramTexts']:raise ValueError('Actual fallback SVG text differs')
  if sha(base/'actual-ui-98'/r['png'])!=r['pngSha256']:raise ValueError('Original actual PNG differs')
 if len(ui['gradedProfiles'])!=14 or{(r['width'],r['entryView'],r['view'])for r in ui['gradedProfiles']}!={(r['width'],r['entryView'],r['view'])for r in plan}:raise ValueError('Actual task/profile set incomplete')
 for r in ui['gradedProfiles']:
  if[r['answer']for r in r['tasks']]!=[4,0,1,0]or any(t['wrong'].startswith('Corretto')or not t['correct'].startswith('Corretto')for t in r['tasks']):raise ValueError('Actual independently solved task differs')
 rec=load(base/'actual-model-terminal.json');compressed=(base/'actual-model-observation.json.gz').read_bytes();raw=gzip.decompress(compressed)
 if rec['actualExitCode']!=0 or rec['stderr']or rec['protocolSha256']!=sha(base/'observe-independent-model.mjs')or sha(base/'actual-model-observation.json.gz')!=rec['compressedSha256']or hashlib.sha256(raw).hexdigest()!=rec['decodedSha256']or len(raw)!=rec['decodedBytes']:raise ValueError('Actual exact model observation differs')
 model=json.loads(raw)
 if not model['rawModelExactlyInvariant']or not model['onlyDeclaredDisplaySourceDelta']or model['actualSolveCases']!=240 or model['actualRawSampleCases']!=2160 or model['oldCounterexample']['oldMillimetres']==0 or model['oldCounterexample']['newMillimetres']!=0:raise ValueError('Before/after display/physical distinction differs')
 j=load(base/'independent-judgment.json')
 if not j['ok']or j['decision']!='FOCUSED_DISPLAY_FIX_POSITIVE_ONLY'or j['activityCredit']!=0 or j['humanApproval']!='NOT_RUN'or j['publicationAction']!='NONE':raise ValueError('Focused scope cannot become familyadmission')
 return{'ok':True,'scope':'FOCUSED_ONLY','actualCases':98,'actualPaths':14,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
