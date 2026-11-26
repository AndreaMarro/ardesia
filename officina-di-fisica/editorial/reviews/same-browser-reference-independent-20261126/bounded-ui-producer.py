"""Bounded existing-runner checks, not a second pipeline or activity acceptance."""
from pathlib import Path
from copy import deepcopy
from unittest.mock import patch
import fcntl,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
HERE=Path(__file__).resolve().parent
ROOT=Path(os.environ.get('CRIC_REFERENCE_REVIEW_REPO','/private/tmp/cric-resident-integrator')).resolve()
APP=ROOT/'officina-di-fisica'
REF='b1f566b714c9e99d2869d16d046f723bc8e51062'
WORK=Path('/private/tmp/cric-139-independent-bounded-b1').resolve()
WORK.mkdir(exist_ok=True)
PINS=json.loads((HERE/'fixed-five-protocol-pins.json').read_bytes())['files']
for name,pin in PINS.items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==pin,name
spec=importlib.util.spec_from_file_location('canonical_visibility_under_review',APP/'tools/corpus_engineering/experiment_visibility_request.py')
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
request_rel='officina-di-fisica/editorial/reviews/same-browser-reference-contract-20261126/actual-ui7-planned-state-fix/executed-request.json'
request_raw=subprocess.check_output(['git','show',REF+':'+request_rel],cwd=ROOT)
request=json.loads(request_raw)
request_file=WORK/'opt-in-request.json';request_file.write_bytes(request_raw)
assert request['protocolFiles']==PINS
assert request['runtimeSha256']=='4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907'
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
    fcntl.flock(lock,fcntl.LOCK_EX)
    assert shutil.disk_usage(WORK).free>=2*1024**3
    info=v.prepare(request_file,'C4',WORK/'runtime')
full=json.loads(Path(info['prepared']).read_bytes())
old_c6=Path('/private/tmp/cric-root-visibility-bootstrap-final-c6-20261126/evidence/prepared.json')
c6=json.loads(old_c6.read_bytes())
assert c6['runtimeFingerprint']==full['runtimeFingerprint'] and c6['sourceCommit']==full['sourceCommit']
source={r['id']:r for r in json.loads(v.git_bytes(v.ORIGINAL,'officina-di-fisica/content/esperienze-C6.json'))}
clock_rows=[]
for key in ('SIM-C6-L01-01','SIM-C6-L03-01'):
    row=deepcopy(next(r for r in c6['records'] if r['id']==key and r['variant']=='published'))
    assert v.digest(row['record'])==v.digest(source[key])==row['sourceSha256']
    choices=[c for c in row['clockCases'] if c['time']>0]
    assert choices
    if row['clockInput']:
        a=row['record']['control']
        from fractions import Fraction
        choices=[c for c in choices if ((Fraction(str(c['time']))-Fraction(str(a['min'])))/Fraction(str(a['step']))).denominator==1]
        assert choices
    chosen=next((c for c in choices if c['time']!=row['grid'][c['gridIndex']]),choices[0])
    index=chosen['gridIndex'];row['grid']=[row['grid'][index]];row['expectedValues']=[row['expectedValues'][index]];row['clockCases']=[{**chosen,'gridIndex':0}];row['auxiliaryCases']=[];clock_rows.append(row)

def choose_grid(row,x):
    row=deepcopy(row);index=row['grid'].index(x);row['grid']=[x];row['expectedValues']=[row['expectedValues'][index]];row['clockCases']=[];row['auxiliaryCases']=[];return row

draft_base=next(r for r in full['records'] if r['id']=='SIM-C4-L09-02'and r['variant']=='draft')
pilot_base=next(r for r in full['records'] if r['id']=='SIM-C4-L10-02'and r['variant']=='published')

def plan_for(rows,request_file,request_sha,output,with_reference):
    plan=deepcopy(full);plan['records']=rows;plan['profiles']=[{'width':320,'fallback':False,'view':'orbit'}];plan['course']='INDEPENDENT_BOUNDARY_ONLY_NO_COURSE_ACCEPTANCE';plan['scope']='ONLY_DECLARED_CLOCK_AUXILIARY_DRAFT_CASES;NO_FULL139_OR_SCI_CREDIT';plan['requestFile']=str(request_file);plan['requestSha256']=request_sha
    if not with_reference:
        plan.pop('numericalReference');plan.pop('baselineBundleRoot')
    keys=[]
    for row in rows:
        stem='|'.join((row['id'],row['variant'],'320','orbit'));keys.append(stem+'|setup')
        for kind,data in [('grid',row['grid']),('clock',row['clockCases']),('auxiliary',row['auxiliaryCases'])]:keys.extend(stem+'|'+kind+'|'+str(i)for i in range(len(data)))
    plan['expectedCaseKeys']=keys
    if with_reference:assert set(v.planned_interactions(plan))==set(keys)
    output.mkdir(parents=True,exist_ok=True);p=output/'prepared.json';p.write_bytes(v.canonical(plan)+b'\n');i={**info,'prepared':str(p),'output':str(output),'course':plan['course'],'requestSha256':request_sha};ip=output/'prepared-info.json';ip.write_text(json.dumps(i,indent=2)+'\n');return ip,plan

# Same collector bytes, isolated execution location; legacy deliberately has no helper file.
execution_app=WORK/'protocol-execution'/'officina-di-fisica'
for name,pin in PINS.items():
    target=WORK/'protocol-execution'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/name).read_bytes());assert hashlib.sha256(target.read_bytes()).hexdigest()==pin
(execution_app/'node_modules').symlink_to(APP/'node_modules',target_is_directory=True)
real_popen=subprocess.Popen

def guarded_popen(*args,**kwargs):
    # run_prepared owns the real mutex when it reaches the actual Node child.
    if args and args[0]and args[0][0]=='node':
        assert shutil.disk_usage(WORK).free>=2*1024**3
    return real_popen(*args,**kwargs)

for mode in ('opt-in11','legacy-no-helper5'):
    pilot=choose_grid(pilot_base,0)
    pilot['auxiliaryCases']=[{'x':4,'middle':2,'circuit':'closed','time':1,'scope':'independent coupled auxiliary boundary'}]
    selected=[choose_grid(draft_base,55 if mode=='opt-in11'else 0),pilot]
    if mode=='opt-in11':selected+=deepcopy(clock_rows);rfile=request_file;rsha=v.sha(request_raw)
    else:
        legacy=deepcopy(request);legacy.pop('numericalReference');legacy['protocolFiles'].pop(v.BASELINE_HELPER);rfile=WORK/'legacy-request.json';rfile.write_bytes(v.canonical(legacy)+b'\n');rsha=v.sha(rfile.read_bytes());(execution_app/'tools/corpus_engineering/baseline_browser_reference.mjs').unlink();assert not(execution_app/'tools/corpus_engineering/baseline_browser_reference.mjs').exists()
    output=WORK/mode;ip,plan=plan_for(selected,rfile,rsha,output,mode=='opt-in11');assert len(plan['expectedCaseKeys'])==(11 if mode=='opt-in11'else 5)
    destination=HERE/('actual-'+mode)
    assert not destination.exists(),'Do not overwrite an actual prior run'
    error=None;started=time.monotonic()
    try:
        with patch.object(v,'APP',execution_app),patch.object(v.subprocess,'Popen',side_effect=guarded_popen):v.run_prepared(ip)
    except BaseException as exc:error=repr(exc)
    finally:
        shutil.copytree(output,destination)
        (destination/'executed-request.json').write_bytes(rfile.read_bytes())
        (destination/'independent-launch.json').write_text(json.dumps({'scope':'actual bounded existing runner;not full139 or scientific acceptance','proposalCommit':REF,'mode':mode,'collectorCopySha256':v.sha((execution_app/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes()),'helperAbsentAtLegacyLaunch':mode=='legacy-no-helper5'and not(execution_app/'tools/corpus_engineering/baseline_browser_reference.mjs').exists(),'expectedCases':len(plan['expectedCaseKeys']),'elapsedSeconds':time.monotonic()-started,'exception':error,'sourceCodeRootUnchanged':all(v.sha((ROOT/name).read_bytes())==pin for name,pin in PINS.items()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
    if error:raise RuntimeError(error)
    terminal=json.loads((destination/'terminal-receipt.json').read_bytes());assert terminal['observedExitCode']==0 and terminal['error']is None
    print('ACTUAL',mode,len(plan['expectedCaseKeys']),'terminal0',flush=True)
for name,pin in PINS.items():assert v.sha((ROOT/name).read_bytes())==pin
print('ONLY11+5_ACTUAL_BOUNDARIES_COMPLETE;NO_FULL139_OR_SCI_APPROVAL',flush=True)
