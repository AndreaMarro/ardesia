"""Technical-only experiment UI preparation. No ETL, registry or publication.

Source data, model code and the grader are pinned before any candidate runtime
executes. The UI collector records evidence; it never approves an activity.
"""
from fractions import Fraction
from pathlib import Path, PurePosixPath
import argparse
import fcntl
import hashlib
import json
import math
import os
import re
import signal
import shutil
import subprocess
import sys
import tempfile

from jsonschema import Draft202012Validator

APP=Path(__file__).resolve().parents[2]
REPO=APP.parent
ORIGINAL='5d1dc8dc7b601aef959d10d564c75462be74708d'
BASELINE='eb51d0e9bdc3f992e9ae0ae76810098376e2ab79'
COURSES=('C2','C3','C4','C5','C6')
PACKAGES=('experiments-manual-support-revision-263','experiment-stevino-revision-047')
SCHEMA=REPO/'.github/schemas/cric-experiment-visibility-request-v1.schema.json'
PROTOCOLS={'.github/workflows/cric-experiment-visibility.yml',
           '.github/schemas/cric-experiment-visibility-request-v1.schema.json',
           'officina-di-fisica/tools/corpus_engineering/experiment_visibility_request.py',
           'officina-di-fisica/tools/corpus_engineering/experiment_visibility_ui.mjs'}
BASELINE_HELPER='officina-di-fisica/tools/corpus_engineering/baseline_browser_reference.mjs'
HISTORICAL_REFERENCE_KIND='IMMUTABLE_BASELINE_SAME_BROWSER_SAME_INPUT_V1'
REFERENCE_KIND='IMMUTABLE_BASELINE_ISOLATED_BROWSER_CONTEXT_V2'
REFERENCE_ORIGIN='https://cric-baseline.invalid'


def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
def digest(value):return sha(canonical(value))
def load(path):return json.loads(Path(path).read_bytes())


def safe(root,name):
    if not isinstance(name,str):raise ValueError('Unsafe evidence path')
    p=PurePosixPath(name)
    if p.is_absolute()or'..'in p.parts or'\\'in name or':'in name or any(ord(c)<32 for c in name):
        raise ValueError('Unsafe evidence path')
    target=Path(root)/name
    if not target.resolve().is_relative_to(Path(root).resolve()):raise ValueError('External symlink')
    return target


def git_bytes(ref,name):
    safe(REPO,name)
    return subprocess.check_output(['git','show',ref+':'+name],cwd=REPO,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})


def validate(request_file):
    raw=Path(request_file).read_bytes();r=json.loads(raw)
    Draft202012Validator(load(SCHEMA)).validate(r)
    expected_protocols=PROTOCOLS|({BASELINE_HELPER}if r.get('numericalReference')else set())
    if set(r['protocolFiles'])!=expected_protocols:raise ValueError('Exact four protocol dependencies and any declared baseline helper required')
    if r.get('numericalReference'):
        ref=r['numericalReference']
        if digest(ref['files'])!=ref['manifestSha256']:raise ValueError('Baseline manifest rebound')
        if sha((APP/'node_modules/typescript/lib/typescript.js').read_bytes())!=ref['typescriptSha256']:raise ValueError('Baseline import parser changed')
    required={r['inventoryPath'],r['manualPrimaryPath'],*r['installedEvidencePaths']}
    if not required<=set(r['frozenFiles']):raise ValueError('Unpinned primary input')
    for path,pin in r['protocolFiles'].items():
        if sha(safe(REPO,path).read_bytes())!=pin:raise ValueError('Protocol drift: '+path)
    for path,pin in r['frozenFiles'].items():
        if sha(safe(REPO,path).read_bytes())!=pin:raise ValueError('Frozen input drift: '+path)
    if set(r['draftPackages'])!=set(PACKAGES):raise ValueError('Exactly the two reviewed packages are required')
    if r['sourceRef']!=ORIGINAL or r['baselineRuntimeRef']!=BASELINE:raise ValueError('Unknown baseline epoch')
    return r,sha(raw)


def baseline_manifest():
    """Every original static JS byte, read only from the immutable baseline."""
    prefix='officina-di-fisica/static/'
    entries=subprocess.check_output(['git','ls-tree','-r','-z',BASELINE,'--',prefix],cwd=REPO).split(b'\0')
    files={}
    for entry in entries:
        if not entry:continue
        meta,name=entry.split(b'\t',1);name=name.decode()
        if not name.endswith('.js'):continue
        mode,kind,_=meta.split()
        if kind!=b'blob'or mode not in(b'100644',b'100755'):raise ValueError('Unsafe baseline module')
        files[name]=sha(git_bytes(BASELINE,name))
    if not files or len(files)>200:raise ValueError('Unbounded baseline module set')
    return files


def prepare_baseline_bundle(request,root):
    ref=request.get('numericalReference')
    if ref is None:return None
    if ref['kind']!=REFERENCE_KIND or ref['baselineRuntimeRef']!=BASELINE or ref['files']!=baseline_manifest()or digest(ref['files'])!=ref['manifestSha256']:
        raise ValueError('Immutable baseline manifest differs from Git source')
    target=Path(root)/'baseline-static';target.mkdir()
    for name,pin in ref['files'].items():
        raw=git_bytes(BASELINE,name)
        if sha(raw)!=pin:raise ValueError('Immutable baseline bytes changed')
        p=safe(target,name.removeprefix('officina-di-fisica/static/'));p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
    return target


def verify_baseline_bundle(info,prepared,request):
    """The baseline stays outside the candidate and cannot acquire authority."""
    ref=request.get('numericalReference')
    if ref is None:
        if 'numericalReference'in prepared or'baselineBundleRoot'in prepared:raise ValueError('Undeclared baseline reference')
        return None
    if prepared.get('numericalReference')!=ref:raise ValueError('Baseline reference rebound after prepare')
    if ref['kind']!=REFERENCE_KIND or ref['baselineRuntimeRef']!=BASELINE or ref['files']!=baseline_manifest()or digest(ref['files'])!=ref['manifestSha256']:
        raise ValueError('Immutable baseline reference differs')
    if any(row['record'].get('engine')for row in prepared['records']):raise ValueError('External engine requires a separate pinned reference contract')
    expected=Path(info['candidateApp']).resolve().parent/'baseline-static';root=Path(prepared['baselineBundleRoot'])
    if root!=expected or root.is_symlink()or root.resolve()!=expected:raise ValueError('Baseline directory escaped its workspace')
    files={}
    for name,pin in ref['files'].items():
        p=safe(root,name.removeprefix('officina-di-fisica/static/'))
        if p.is_symlink()or p.resolve()!=p or not p.is_file()or sha(p.read_bytes())!=pin:raise ValueError('Baseline bytes drifted: '+name)
        files[str(p)]=pin
    if set(root.rglob('*.js'))!={Path(p)for p in files}or any(p.is_file()and str(p)not in files for p in root.rglob('*')):raise ValueError('Unexpected baseline input file')
    return {'kind':REFERENCE_KIND,'baselineRuntimeRef':BASELINE,'manifestSha256':ref['manifestSha256'],'files':files,'scientificAuthority':'NONE_TECHNICAL_REGRESSION_PARITY_ONLY'}


def grader_block(raw):
    text=raw.decode();start='const a = r.assessment[Number(form.dataset.check)]';end='let hint ='
    if text.count(start)!=1:raise ValueError('Unique actual grader required')
    a=text.index(start);b=text.index(end,a)
    return text[a:b].encode()


def numeric_literal(value):
    if isinstance(value,str):
        return str(float(Fraction(value)))
    raise ValueError('Frozen independent numeric entry unavailable')


def prepare(request_file,course,workspace):
    r,request_sha=validate(request_file)
    if course not in COURSES:raise ValueError('Unknown course')
    root=Path(workspace).resolve()
    if root==REPO or root==APP or APP.is_relative_to(root):raise ValueError('Workspace cannot contain the review checkout')
    root.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(root).free<2*1024**3:raise ValueError('Need at least2GiB free')
    target=root/'candidate-app'
    if target.exists():raise ValueError('Fresh runtime directory required')
    target.mkdir()
    candidate=r['candidateRef']
    baseline_bundle=prepare_baseline_bundle(r,root)
    for path,pin in r['modelFiles'].items():
        if sha(git_bytes(candidate,path))!=pin:raise ValueError('Model drift: '+path)
    sources=[];source_file_pins={}
    for c in COURSES:
        name='officina-di-fisica/content/esperienze-'+c+'.json';blob=git_bytes(ORIGINAL,name)
        if sha(blob)!=r['sourceFiles'][name]or git_bytes(candidate,name)!=blob:raise ValueError('Immutable source changed')
        source_file_pins[name]=sha(blob);sources+=json.loads(blob)
    if len(sources)!=139 or len({x['id']for x in sources})!=139:raise ValueError('Exactly139 unique original experiments required')
    inventory=load(safe(REPO,r['inventoryPath']))
    inv={x['id']:x for x in inventory['records']}
    if set(inv)!={x['id']for x in sources}:raise ValueError('Frozen139 inventory coverage differs')
    old={}
    for name in r['installedEvidencePaths']:
        data=load(safe(REPO,name))
        entries=data.get('records')if isinstance(data,dict)and'records'in data else[{'id':k,**v}for k,v in data.items()]
        for x in entries:
            if x['id']in old and old[x['id']]!=x:raise ValueError('Conflicting frozen installed records')
            old[x['id']]=x
    if set(old)!=set(inv):raise ValueError('All139 frozen installed producers are required')
    if grader_block(git_bytes(candidate,'officina-di-fisica/static/js/banchi/banco.js'))!=grader_block(git_bytes(BASELINE,'officina-di-fisica/static/js/banchi/banco.js')):
        raise ValueError('Grader changed')
    clock_name='officina-di-fisica/static/js/banchi/voci/orologi.js'
    if git_bytes(candidate,clock_name)!=git_bytes(BASELINE,clock_name):raise ValueError('Clock laws changed')
    # Reconstruct exactly the bundled runtime, not the current checkout app.
    folders=('server','static','content','contracts','migrations','policies','extensions')
    tree=subprocess.check_output(['git','ls-tree','-r','-z',candidate,'--',*['officina-di-fisica/'+x for x in folders]],cwd=REPO).split(b'\0')
    names=[]
    for entry in tree:
        if not entry:continue
        meta,name=entry.split(b'\t',1);mode,kind,_=meta.split()
        if mode not in(b'100644',b'100755')or kind!=b'blob':raise ValueError('Bundled runtime cannot contain symlinks')
        names.append(name.decode())
    runtime={}
    for name in names:
        rel=name.removeprefix('officina-di-fisica/');parts=PurePosixPath(rel).parts
        if any(p.startswith('.')or p=='__pycache__'for p in parts):continue
        if parts[0]=='contracts'and PurePosixPath(rel).name.startswith('corpus-'):continue
        blob=git_bytes(candidate,name);p=safe(target,rel);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(blob);runtime[rel]=sha(blob)
    for rel in ('package.json','package-lock.json','tools/corpus_engineering/draft_import.py'):
        blob=git_bytes(candidate,'officina-di-fisica/'+rel);p=safe(target,rel);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(blob);runtime[rel]=sha(blob)
    (target/'node_modules').symlink_to(APP/'node_modules',target_is_directory=True)
    for rel in ('node_modules/axe-core/axe.min.js','node_modules/axe-core/package.json','node_modules/playwright/package.json'):
        runtime[rel]=sha((APP/rel).read_bytes())
    protocol=git_bytes(candidate,'officina-di-fisica/tools/corpus_engineering/runtime_fingerprint.py')
    if sha(protocol)!=r['runtimeProtocolSha256']:raise ValueError('Runtime fingerprint protocol changed')
    (target/'tools/corpus_engineering/runtime_fingerprint.py').write_bytes(protocol)
    payload={'protocolSha256':sha(protocol),'files':runtime};fp={'sha256':digest(payload),**payload}
    if fp['sha256']!=r['runtimeSha256']:raise ValueError('Actual reconstructed runtime differs')
    packages=[];drafts={};input_files={}
    for batch,pins in r['draftPackages'].items():
        for suffix,key in (('.json','packageSha256'),('-bindings.json','bindingsSha256')):
            rel='editorial/batches/'+batch+suffix;blob=git_bytes(candidate,'officina-di-fisica/'+rel)
            if sha(blob)!=pins[key]:raise ValueError('Draft input changed')
            p=target/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(blob);input_files[str(p)]=sha(blob)
        package=load(target/'editorial/batches'/f'{batch}.json');packages.append(str(target/'editorial/batches'/f'{batch}.json'))
        for row in package['records']:
            if row['id']in drafts or row['id']not in inv or(row['version'],row['baseVersion'])!=(2,1):raise ValueError('Bad revision identity')
            base=next(s for s in sources if s['id']==row['id'])
            for field in ('control','measure','references','apparatus','course','kind','engine'):
                if row.get(field)!=base.get(field):raise ValueError('Physical source field changed: '+field)
            drafts[row['id']]=row
    if len(drafts)!=9:raise ValueError('Exactly9 private DRAFTs required')
    primary=load(safe(REPO,r['manualPrimaryPath']))
    manual={x['id']:x['finiteNumberExamples']for x in primary['records']}
    manual['SIM-C2-L002-01']=['19.62','14.715']  # 981/100 ×2 and ×3/2, independent frozen procedure.
    records=[];total_grid=0
    for source in sources:
        key=source['id'];frozen=inv[key]
        if digest(source)!=frozen['sourceSha256']:raise ValueError('Primary source rebound')
        a=source['control'];lo=Fraction(str(a['min']));hi=Fraction(str(a['max']));step=Fraction(str(a['step']))
        count=(hi-lo)/step
        if step<=0 or count.denominator!=1 or not 0<=count<=999:raise ValueError('Bounded exact control grid required')
        grid=[float(lo+i*step)for i in range(int(count)+1)];total_grid+=len(grid)
        samples=old[key]['cases']
        if len(samples)!=len(grid):raise ValueError('Frozen control count differs: '+key)
        expected=[];clock=[];seen=set()
        for i,(x,sample)in enumerate(zip(grid,samples)):
            if abs(sample['x']-x)>float(step)/1000000:raise ValueError('Frozen grid order differs')
            value=(sample.get('solve')or sample.get('output'))['y'];expected.append(value)
            for c in sample.get('clockSamples',[]):
                token=(i,c['time'])
                if token not in seen:seen.add(token);clock.append({'gridIndex':i,'time':c['time'],'duration':sample['duration']})
        tasks=[]
        for i,q in enumerate(frozen['actualAssignedTasks']):
            entry=q.get('manualNumericLiteral')
            if entry is None:entry=numeric_literal(q.get('requiredByDeliveredQuestion',q.get('independentExact')))
            tasks.append({'input':entry,'expectedAccepted':not(key=='SIM-C2-L002-01'and i==1),'sourceManualReadiness':not(frozen['sourceManualityFailure']or frozen['manualSupportGap']),
                          'prompt':q.get('actualPrompt',q.get('prompt'))})
        if key=='SIM-C4-L10-02':
            tasks += [{'input':'2','expectedAccepted':True,'sourceManualReadiness':True,'prompt':'In 0,2 s il flusso concatenato passa da +0,30 Wb a −0,10 Wb. Quanto vale la fem media con il segno?'},
                      {'input':'-0.5','expectedAccepted':True,'sourceManualReadiness':True,'prompt':'Chiudi una bobina su 8 Ω. Il flusso concatenato cresce di 0,4 Wb in 0,1 s. Qual è la corrente con il segno rispetto al verso positivo?'}]
        for variant,row in [('published',source)]+([('draft',drafts[key])]if key in drafts else[]):
            q=tasks if variant=='published'else[{'input':x,'expectedAccepted':True,'sourceManualReadiness':'SEPARATE_FROZEN_DRAFT_REVIEW','prompt':None}for x in manual[key]]
            records.append({'id':key,'course':source['course'],'variant':variant,'record':row,'sourceSha256':digest(source),'candidateSha256':digest(row)if variant=='draft'else None,
                            'grid':grid,'expectedValues':expected,'clockCases':clock,'questions':q,
                            'clockInput':bool((old[key].get('clock')or{}).get('input')),'hasClock':bool(old[key].get('clock'))or key=='SIM-C4-L10-02','originalJudgment':frozen,
                            'sourcePrediction':old[key]['prediction']['correct']})
    if total_grid!=2144:raise ValueError('Exactly2144 original grid inputs required')
    selected=[x for x in records if x['course']==course]
    out=root/'evidence';out.mkdir()
    prepared={'schemaVersion':'1.0.0','sourceCommit':candidate,'originalRef':ORIGINAL,'requestSha256':request_sha,'course':course,
              'runtimeFingerprint':fp,'records':selected,'packageFiles':packages,'sourceFiles':source_file_pins,
              'requestFile':str(Path(request_file).resolve()),'inputFiles':input_files,'draftRecords':list(drafts.values()),
              'profiles':[{'width':w,'fallback':f,'view':v}for w in (320,1280)for f,v in ((False,'orbit'),(False,'side'),(False,'top'),(True,'fixed_projection'))],
              'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    if baseline_bundle is not None:
        prepared['numericalReference']=r['numericalReference'];prepared['baselineBundleRoot']=str(baseline_bundle)
    prepared['expectedOriginalGridInputs']=sum(len(x['grid'])for x in selected if x['variant']=='published')
    prepared['expectedDraftGridInputs']=sum(len(x['grid'])for x in selected if x['variant']=='draft')
    prepared['expectedClockInteractions']=sum(len(x['clockCases'])for x in selected)
    for row in prepared['records']:
        row['auxiliaryCases']=[]
        if row['id']=='SIM-C4-L10-02':
            for x in row['grid']:
                for circuit in ('open','closed'):
                    for time in (0,1,2):row['auxiliaryCases'].append({'x':x,'middle':0,'circuit':circuit,'time':time,'scope':'full x grid, both switches, three times'})
            for i in range(17):
                for time in (0,1,2):row['auxiliaryCases'].append({'x':row['record']['references'][0][0],'middle':-2+i/4,'circuit':'open','time':time,'scope':'full middle-field grid at source reference slope'})
            for x in (-4,0,4):
                for middle in (-2,2):
                    for circuit in ('open','closed'):
                        for time in (0,1,2):row['auxiliaryCases'].append({'x':x,'middle':middle,'circuit':circuit,'time':time,'scope':'coupled sign/field/circuit corners; not all Cartesian combinations'})
    expected=[]
    for row in prepared['records']:
        for profile in prepared['profiles']:
            stem='|'.join((row['id'],row['variant'],str(profile['width']),profile['view']))
            expected.append(stem+'|setup')
            for kind,values in (('grid',row['grid']),('clock',row['clockCases']),('auxiliary',row['auxiliaryCases'])):
                expected.extend(stem+'|'+kind+'|'+str(i)for i in range(len(values)))
    if len(expected)!=len(set(expected)):raise ValueError('Duplicate planned UI cases')
    prepared['expectedCaseKeys']=expected
    (out/'prepared.json').write_bytes(canonical(prepared)+b'\n')
    return {'candidateApp':str(target),'prepared':str(out/'prepared.json'),'output':str(out),'course':course,
            'requestSha256':request_sha,'originalRecords':sum(x['variant']=='published'for x in selected),'draftRecords':sum(x['variant']=='draft'for x in selected)}



def planned_interactions(prepared):
    """Derive required state data from the plan, never from optional case fields."""
    planned={}
    for row in prepared['records']:
        states=[*({'kind':'grid','index':i,'x':x}for i,x in enumerate(row['grid'])),
                *({'kind':'clock','index':i,'x':row['grid'][c['gridIndex']],'time':c['time']}for i,c in enumerate(row['clockCases'])),
                *({'kind':'auxiliary','index':i,**c}for i,c in enumerate(row['auxiliaryCases']))]
        for profile in prepared['profiles']:
            stem='|'.join((row['id'],row['variant'],str(profile['width']),profile['view']))
            for key,state in [(stem+'|setup',None),*((stem+'|'+s['kind']+'|'+str(s['index']),s)for s in states)]:
                if key in planned:raise ValueError('Duplicate planned baseline state')
                planned[key]=(row,state)
    if set(planned)!=set(prepared['expectedCaseKeys']):raise ValueError('Prepared baseline state coverage differs')
    return planned


def verify_planned_interaction(case,row,state):
    actual=case.get('interaction')
    if state is None:
        if actual is not None:raise ValueError('Unexpected setup interaction')
        return
    if not isinstance(actual,dict)or actual!=state or type(actual.get('index'))is not int:
        raise ValueError('Missing or incongruent planned interaction')
    for key in ('x','time','middle'):
        if key in state and(type(actual[key])not in(int,float)or not math.isfinite(actual[key])):raise ValueError('Invalid planned numerical input')
    def bounded(a,b,step):
        # Same existing controller representation allowance; model parity has
        # zero tolerance. This does not permit another control-grid step.
        if type(a)not in(int,float)or not math.isfinite(a):raise ValueError('Nonfinite observed input')
        tolerance=min(abs(step)/4,8*sys.float_info.epsilon*max(1,abs(a),abs(b)))
        if abs(a-b)>tolerance:raise ValueError('Observed input differs from planned interaction')
    controls={c['name']:c for c in case.get('actualDOMControls',[])}
    expected_x=state['time']if row['clockInput']and'time'in state else state['x'];step=float(row['record']['control']['step'])
    try:bounded(float(controls['x']['value']),expected_x,step)
    except(KeyError,TypeError,OverflowError)as e:raise ValueError('Observed DOM x missing or invalid')from e
    bounded(case.get('sourceReplayedX'),expected_x,step)
    if state['kind']=='auxiliary':
        try:
            bounded(float(controls['middle']['value']),state['middle'],float(controls['middle']['step']))
            if controls['circuit']['value']!=state['circuit']:raise ValueError('Observed circuit differs')
        except(KeyError,TypeError,OverflowError)as e:raise ValueError('Observed auxiliary controls missing or invalid')from e
    if row['hasClock']:
        time=state.get('time',state['x']if row['clockInput']else 0)
        bounded(case.get('sourceReplayedClockTime'),time,max(step,1))


def verify_report(out,prepared,protocol_sha):
    """Fail closed on omitted/duplicated states or byte/provenance drift."""
    out=Path(out);report=load(out/'report.json')
    if report.get('technicalStatus')!='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':raise ValueError('No complete technical report')
    for name,value in {'sourceCommit':prepared['sourceCommit'],'requestSha256':prepared['requestSha256'],
                       'runtimeFingerprint':prepared['runtimeFingerprint'],'protocolSha256':protocol_sha,
                       'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}.items():
        if report.get(name)!=value:raise ValueError('Report provenance differs: '+name)
    reference=prepared.get('numericalReference')
    namespace=None
    planned=planned_interactions(prepared)if reference else None
    if reference:
        evidence=report.get('baselineReference',{})
        namespace='/__cric_baseline/'+BASELINE+'/'+reference['manifestSha256']+'/'
        kind=reference['kind']
        if kind not in(REFERENCE_KIND,HISTORICAL_REFERENCE_KIND):raise ValueError('Unknown numerical reference kind')
        expected={'kind':kind,'baselineRuntimeRef':BASELINE,'manifestSha256':reference['manifestSha256'],'namespace':namespace,
                  'allManifestBytesCheckedBeforeAndAfter':True,'scientificAuthority':'NONE_TECHNICAL_REGRESSION_PARITY_ONLY','activityCredit':0}
        if any(evidence.get(k)!=v for k,v in expected.items()):raise ValueError('Baseline report provenance differs')
        if kind==REFERENCE_KIND:
            realm_id=evidence.get('realmId')
            isolation={'isolation':'DISTINCT_CONTEXT_AND_ORIGIN','documentURL':REFERENCE_ORIGIN+namespace+'realm.html','serviceWorkers':'block'}
            if not isinstance(realm_id,str)or not re.fullmatch(r'[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}',realm_id):raise ValueError('Missing distinct baseline realm identity')
            if any(evidence.get(k)!=v for k,v in isolation.items()):raise ValueError('Baseline report lacks context isolation')
            isolation['realmId']=realm_id
        served=evidence.get('servedFiles',{})
        required={'js/banchi/voci/esperimento.js','js/banchi/quaderno.js'}
        if not required<=set(served)or any(reference['files'].get('officina-di-fisica/static/'+p)!=pin for p,pin in served.items()):raise ValueError('Baseline served module identity differs')
    cases=report['cases'];expected=prepared['expectedCaseKeys']
    if len(cases)!=len(expected)or len({c['caseKey']for c in cases})!=len(cases)or {c['caseKey']for c in cases}!=set(expected):raise ValueError('Missing/duplicate UI cases')
    for item in cases:
        case_bytes=safe(out,item['file']).read_bytes()
        if sha(case_bytes)!=item['sha256']:raise ValueError('Case bytes drift')
        case=json.loads(case_bytes)
        expected_fields={'caseKey':item['caseKey'],'technicalOk':True,'sourceCommit':prepared['sourceCommit'],
                         'requestSha256':prepared['requestSha256'],'runtimeSha256':prepared['runtimeFingerprint']['sha256'],
                         'protocolSha256':protocol_sha,'scientificApproval':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        if any(case.get(k)!=v for k,v in expected_fields.items()):raise ValueError('Case not observed or provenance/approval differs')
        if reference:
            row,state=planned[item['caseKey']];verify_planned_interaction(case,row,state)
        if reference and state is not None:
            b=case.get('baselineReference',{})
            if kind==REFERENCE_KIND:
                if any(b.get(k)!=v for k,v in isolation.items()):raise ValueError('Case baseline realm differs from report')
                if 'pilot'not in b or b['pilot']!=case.get('pilot')or 'clockTime'not in b or b['clockTime']!=case.get('sourceReplayedClockTime'):
                    raise ValueError('Case baseline pilot or clock input differs')
            elif b.get('distinctModuleIdentity')is not True or b.get('distinctSolveIdentity')is not True:
                raise ValueError('Historical baseline module identity differs')
            if(b.get('kind')!=kind or b.get('namespace')!=namespace
               or b.get('observedX')!=case.get('sourceReplayedX')or b.get('actualDOMControls')!=case.get('actualDOMControls')
               or canonical(b.get('model'))!=canonical(case.get('model'))):raise ValueError('Strict baseline case parity differs')
            values=[case.get('model',{}).get('y'),b.get('model',{}).get('y'),case.get('sourceReplayedX')]
            if any(type(v)not in(int,float)or not math.isfinite(v)for v in values):raise ValueError('Nonfinite baseline case')
        if not case.get('screenshots'):raise ValueError('Observed UI case has no actual PNG')
        for image in case['screenshots']:
            if sha(safe(out,image['file']).read_bytes())!=image['sha256']:raise ValueError('PNG bytes drift')
    return report



def verify_prepared_inputs(info,prepared):
    """Check declared request, runtime and package bytes before importing."""
    request,request_sha=validate(prepared['requestFile'])
    if request_sha!=prepared['requestSha256']or request['candidateRef']!=prepared['sourceCommit']or request['runtimeSha256']!=prepared['runtimeFingerprint']['sha256']:
        raise ValueError('Prepared request/epoch rebound')
    baseline=verify_baseline_bundle(info,prepared,request)
    app=Path(info['candidateApp']).resolve();directory=app/'editorial/batches'
    expected={}
    packages=[]
    for batch in PACKAGES:
        for suffix,key in (('.json','packageSha256'),('-bindings.json','bindingsSha256')):
            path=directory/(batch+suffix);expected[str(path)]=request['draftPackages'][batch][key]
            if suffix=='.json':packages.append(str(path))
    if prepared.get('inputFiles')!=expected or prepared['packageFiles']!=packages:
        raise ValueError('Prepared four-input file set differs')
    if set(directory.iterdir())!={Path(p)for p in expected}:raise ValueError('Unexpected or missing package/binding input')
    blobs={}
    for name,pin in expected.items():
        p=Path(name)
        if p.is_symlink()or not p.is_file()or sha(p.read_bytes())!=pin:raise ValueError('Package/binding bytes changed after preparation: '+p.name)
        blobs[name]=p.read_bytes()
        if sha(blobs[name])!=pin:raise ValueError('Package/binding changed during read')
    rows={}
    for name in packages:
        for row in json.loads(blobs[name])['records']:
            if row['id']in rows or(row['version'],row['baseVersion'])!=(2,1):raise ValueError('Private revision identity differs')
            rows[row['id']]=row
    planned=prepared.get('draftRecords',[])
    if len(rows)!=9 or len(planned)!=9 or len({x['id']for x in planned})!=9 or canonical({x['id']:x for x in planned})!=canonical(rows):
        raise ValueError('Prepared full draft candidates differ from pinned packages')
    for item in prepared['records']:
        if item['variant']=='draft'and(digest(item['record'])!=digest(rows.get(item['id']))or item['candidateSha256']!=digest(rows[item['id']])):
            raise ValueError('Cohort candidate rebound')
    normalized={key:{**{k:v for k,v in row.items()if k not in('baseVersion','review')},'version':2,'review':'bozza'}for key,row in rows.items()}
    result={'files':expected,'normalizedOwnerRecords':normalized,'activityCredit':0}
    if baseline is not None:result['baselineReference']=baseline
    return result


def run_prepared(prepared_file):
    info=load(prepared_file);out=Path(info['output']);app=Path(info['candidateApp']);prepared=load(info['prepared'])
    if shutil.disk_usage(out).free<2*1024**3:raise ValueError('Need at least2GiB free')
    checked=verify_prepared_inputs(info,prepared)
    (out/'input-preflight.json').write_bytes(canonical(checked)+b'\n')
    env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(app/'extensions')}
    script=APP/'tools/corpus_engineering/experiment_visibility_ui.mjs'
    command=['node',str(script),str(prepared_file)]
    def fingerprint():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=app,env=env))
    if fingerprint()!=prepared['runtimeFingerprint']:raise ValueError('Runtime drift before UI')
    lock_path=Path('/private/tmp/cric-bounded-local-work.lock')if sys.platform=='darwin'else Path(tempfile.gettempdir())/'cric-bounded-local-work.lock'
    code=None;error=None;process=None
    with open(lock_path,'a')as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        try:
            with (out/'actual-ui-process.log').open('wb')as log:
                process=subprocess.Popen(command,cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
                code=process.wait(timeout=170*60)
            if code!=0:raise ValueError('Actual UI process failed: '+str(code))
            verify_report(out,prepared,sha(script.read_bytes()))
            verify_prepared_inputs(info,prepared)
            if fingerprint()!=prepared['runtimeFingerprint']:raise ValueError('Runtime drift after UI')
        except BaseException as e:
            error=type(e).__name__+': '+str(e)
            if process is not None and process.poll()is None:
                process.terminate()
                try:process.wait(timeout=20)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=10)
                code=process.returncode
        receipt={'schemaVersion':'1.0.0','candidateRef':prepared['sourceCommit'],'requestSha256':prepared['requestSha256'],
                 'course':prepared['course'],'runtimeSha256':prepared['runtimeFingerprint']['sha256'],
                 'protocolSha256':sha(script.read_bytes()),'supervisorSha256':sha(Path(__file__).read_bytes()),
                 'preparedSha256':sha(Path(info['prepared']).read_bytes()),'observedExitCode':code,'error':error,
                 'scope':prepared.get('scope','COMPLETE_REQUESTED_COURSE'),'githubRunId':os.environ.get('GITHUB_RUN_ID'),
                 'githubSha':os.environ.get('GITHUB_SHA'),'githubWorkflow':os.environ.get('GITHUB_WORKFLOW'),
                 'terminalStatus':'COMPLETE_TECHNICAL_EVIDENCE_REQUIRES_SCI_REVIEW'if error is None else'FAIL',
                 'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        (out/'terminal-receipt.json').write_bytes(canonical(receipt)+b'\n')
        if error:raise ValueError(error)


def main():
    p=argparse.ArgumentParser();p.add_argument('command',choices=('validate','prepare','run'));p.add_argument('--request',type=Path)
    p.add_argument('--prepared',type=Path)
    p.add_argument('--course',choices=COURSES);p.add_argument('--workspace',type=Path);args=p.parse_args()
    if args.command=='run':
        if not args.prepared:p.error('run needs prepared info')
        run_prepared(args.prepared);return
    if not args.request:p.error('request required')
    if args.command=='validate':
        r,h=validate(args.request);print(json.dumps({'requestSha256':h,'candidateRef':r['candidateRef'],'runtimeSha256':r['runtimeSha256'],'activityCredit':0}));return
    if not args.course or not args.workspace:p.error('prepare needs course/workspace')
    print(json.dumps(prepare(args.request,args.course,args.workspace)))


if __name__=='__main__':main()
