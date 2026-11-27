"""Fail-closed integrity of a negative distinct targeted review, not activity admission."""
from pathlib import Path
import hashlib,json
BASE=Path(__file__).resolve().parent
INDEX='ebf97f90c626fdf9504f9ea189d541358b91eb0bdfc0dee05f608275f995b877'
RUNTIME='4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def load(path):return json.loads(path.read_bytes())
def check(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Frozen independent commitment changed')
 index=load(base/'actual-proof-index.json')
 for name,pin in index['files'].items():
  path=base/name
  if not path.is_file()or path.is_symlink()or sha(path)!=pin:raise ValueError('Missing/changed actual peer bytes: '+name)
 report=load(base/'actual-ui-22/report.json');terminal=load(base/'actual-ui-22/terminal-receipt.json');plan=load(base/'actual-ui-22/executed-plan.json');judgment=load(base/'independent-judgment.json');source=load(base/'source-review-receipt.json')
 if terminal['actualExitCode']!=0 or terminal['error']is not None or terminal['before']!=terminal['after']or terminal['before']['sha256']!=RUNTIME or report['runtimeBefore']!=terminal['before']or report['runtimeAfter']!=terminal['after']:raise ValueError('Actual terminal or epoch differs')
 if report['sourceCommit']!='03f9634d7d6a8dcfe9161990c4d5dbc62e3773f5'or not report['matrixComplete']or report['errors']or report.get('failure')or len(report['records'])!=22 or len(plan)!=22 or len({x['key']for x in report['records']})!=22 or{x['key']for x in report['records']}!={x['key']for x in plan}:raise ValueError('Incomplete or duplicated actual cases')
 if report['protocolSha256']!=sha(base/'browser-canary.mjs')or terminal['protocolSha256']!=report['protocolSha256']or terminal['supervisorSha256']!=sha(base/'run-bounded.py')or report['planSha256']!=sha(base/'actual-ui-22/executed-plan.json'):raise ValueError('Executed protocol differs')
 for row in report['records']:
  if not row['technicalOk']or not row['legendOpened']or row['openedLegendAxe']or row['actualSelectedView']!=row['view']or row['observed']['axe']or row['observed']['documentWidth']>row['width']+1 or('time'in row and float(row['actualTime'])!=row['time']):raise ValueError('Actual controls/layout/legend differ')
  if sha(base/'actual-ui-22'/row['png'])!=row['pngSha256']:raise ValueError('Actual original screenshot differs')
 if source['actualProductionDeltaFiles']!=12 or len(source['unchangedBenchModelSourcePilotAndFormatSha256'])!=13:raise ValueError('Declared source scope differs')
 for name,pin in source['sourceSnapshotAndLiveCandidateFileSha256'].items():
  if sha(base/'candidate-source-snapshot'/name)!=pin:raise ValueError('Actually read source changed')
 summary=load(base/'flight-label-framing-summary.json')
 if len(summary['results'])!=2:raise ValueError('Flight witness incomplete')
 for result in summary['results']:
  primary=next(x for x in result['vectors']if x['kind']=='full-v');detail=next(x for x in result['vectors']if x['kind']=='detail-v-times16')
  if not primary['sourceVisible']or primary['lengthFactor']<=0 or not primary['tipUnderMeasuredCartRectangle']or primary['projectedVerticesInsideCart']!=primary['vertexCount']or primary['vertexCount']!=327 or not .30399999999999<detail['lengthFactor']<.30400000000001:raise ValueError('Actual nonzero mask witness differs')
  if result['case'].endswith('1280')and(detail['outsideViewport']!=229 or detail['tip']['inside']):raise ValueError('Actual clipped detail witness differs')
 planes=[x for x in report['records']if x['key'].startswith('plane-old-tip')]
 if len(planes)!=2 or any('monte'in x['legend']for x in planes):raise ValueError('Original missing actual legend observation differs')
 if judgment['ok']is not False or judgment['decision']!='NOT_ACCEPTED_RESIDUAL_FLIGHT_AND_PLANE_LEGEND'or set(judgment['unresolvedIds'])!={'LAB3D-01','LAB3D-02'}or judgment['activityCredit']!=0 or judgment['humanApproval']!='NOT_RUN'or judgment['publicationAction']!='NONE':raise ValueError('Negative review cannot become approval')
 return {'ok':False,'technicalOk':True,'actualCases':22,'unresolvedIds':judgment['unresolvedIds'],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(check()))
