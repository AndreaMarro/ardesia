"""Bounded original-only adapter around the verbatim existing UI collector/validators."""
from pathlib import Path
import hashlib,importlib.util,json,os,subprocess,sys,time
D=Path(__file__).resolve().parent
ROOT=D.parent
APP=Path('/private/tmp/cric-flight-axis-legend-20261127/officina-di-fisica')
REF='e02b0a767097f22ed66b7240432fc30b206217fd'
RUNTIME='980518b78d0767d90f16322539852e7e79360e20f05078ceb6e9b0425e805301'
sha=lambda b:hashlib.sha256(b).hexdigest()
canonical=lambda v:json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module

def main():
    started=time.monotonic()
    deps=json.loads((ROOT/'frozen-dependencies.json').read_text())
    for item in deps['files']:
        assert sha((ROOT/item['snapshot']).read_bytes())==item['sha256']
    models=load_module('independent_electrostatics_models',ROOT/'independent_models.py')
    validator=load_module('frozen_visibility_request',ROOT/'canonical-experiment_visibility_request.py')
    collector=ROOT/'canonical-experiment_visibility_ui.mjs'
    env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':'/private/tmp/cric-recovery-venv/bin'+os.pathsep+os.environ.get('PATH','')}
    def fingerprint():
        return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
    before=fingerprint();assert before['sha256']==RUNTIME
    source_raw=(APP/'content/esperienze-C4.json').read_bytes()
    assert sha(source_raw)=='b56b6df61c44009e1508cf0e2cb7992b936db985e37f8c21fc9afd51b811e58d'
    source=next(x for x in json.loads(source_raw)if x['id']=='SIM-C4-L02-02')
    request={'schemaVersion':'1.0.0','scope':'BOUND_ORIGINAL_MIDPOINT_FIELD24_NOT_CANONICAL139_ACCEPTANCE',
             'sourceCommit':REF,'runtimeSha256':RUNTIME,'sourceFileSha256':sha(source_raw),
             'id':source['id'],'points':[.5,1,1.5],'profiles':['top','orbit','fixed_projection'],
             'widths':[320,1280],'collectorSha256':sha(collector.read_bytes()),
             'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    request_raw=canonical(request)+b'\n';(D/'request.json').write_bytes(request_raw)
    grid=request['points'];expected=[float(models.value(source['id'],str(x),require_grid=True))for x in grid]
    row={'id':source['id'],'course':'C4','variant':'published','record':source,
         'sourceSha256':validator.digest(source),'candidateSha256':None,
         'grid':grid,'expectedValues':expected,'clockCases':[],'auxiliaryCases':[],
         'questions':[
             {'input':'0','expectedAccepted':True,'sourceManualReadiness':True,
              'prompt':'Imposta «Carica di destra» su 1 nC. Quale valore ottieni per «Campo al punto medio lungo x»?'},
             {'input':'22.5','expectedAccepted':True,'sourceManualReadiness':True,
              'prompt':source['transferPrompt'].replace('{x}','0 nC')}],
         'clockInput':False,'hasClock':False,'sourcePrediction':0,
         'originalJudgment':{'scope':'Independent rational midpoint superposition',
             'formula':'E_x=(45/2)(1-q_right_nC) kN/C',
             'physicalZeros':'q_right=+1 gives cancellation of two nonzero source fields',
             'exactPlannedValues':['45/4','0','-45/4'],
             'actualTaskExactValues':['0','45/2'],'UI':'NOT_RUN_BEFORE_THIS_COLLECTION'}}
    profiles=[{'width':w,'view':v,'fallback':v=='fixed_projection'}for w in[320,1280]for v in['top','orbit','fixed_projection']]
    keys=[]
    for p in profiles:
        stem='|'.join((row['id'],row['variant'],str(p['width']),p['view']))
        keys.append(stem+'|setup')
        keys.extend(stem+'|grid|'+str(i)for i in range(3))
    prepared={'schemaVersion':'1.0.0','scope':request['scope'],'sourceCommit':REF,
              'originalRef':'5d1dc8dc7b601aef959d10d564c75462be74708d',
              'requestSha256':sha(request_raw),'course':'C4','runtimeFingerprint':before,
              'records':[row],'profiles':profiles,'expectedCaseKeys':keys,
              'inputFiles':{},'packageFiles':[],'draftRecords':[]}
    assert len(keys)==24
    (D/'prepared.json').write_bytes(canonical(prepared)+b'\n')
    out=D/'actual-browser';assert not out.exists(),'Do not overwrite a previous run'
    info={'candidateApp':str(APP),'prepared':str(D/'prepared.json'),'output':str(out)}
    (D/'info.json').write_bytes(canonical(info)+b'\n')
    with(D/'actual-browser-process.txt').open('w')as log:
        run=subprocess.run(['node',str(collector),str(D/'info.json')],cwd=ROOT.parents[2],env=env,stdout=log,stderr=subprocess.STDOUT)
    receipt={'observedExitCode':run.returncode if run.returncode>=0 else None,
             'observedSignal':-run.returncode if run.returncode<0 else None,
             'durationSeconds':time.monotonic()-started,'runtimeSha256':RUNTIME,
             'collectorSha256':sha(collector.read_bytes()),'plannedCases':24,
             'reportSha256':sha((out/'report.json').read_bytes())if(out/'report.json').exists()else None,
             'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (D/'terminal-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if run.returncode:
        raise SystemExit(run.returncode)
    report=validator.verify_report(out,prepared,sha(collector.read_bytes()))
    planned=validator.planned_interactions(prepared)
    values=[]
    for entry in report['cases']:
        case=json.loads((out/entry['file']).read_bytes());planned_row,state=planned[entry['caseKey']]
        validator.verify_planned_interaction(case,planned_row,state)
        if state is not None:
            exact=models.value(source['id'],str(state['x']),require_grid=True)
            actual=models.rational(str(case['model']['y']))
            assert actual==exact,('Actual midpoint scalar differs',actual,exact)
            values.append({'caseKey':entry['caseKey'],'input':str(state['x']),'independentExact':str(exact),'unit':'kN/C'})
        else:
            assert len(case['questions'])==2 and all(x['status'].startswith('Corretto. ')for x in case['questions'])
    assert fingerprint()==before
    (D/'actual-validator-receipt.json').write_text(json.dumps({'actualProcessExitCode':0,
         'canonicalReportAndPlannedInteractionValidation':'COMPLETE','exactNonzeroAndZeroStates':values,
         'currentRuntimeBeforeAfterIdentical':True,'setupCasesWithTwoActualTasks':6,
         'UIAcceptance':'NOT_GRANTED; PNG reading and physical review pending',
         'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
    print(json.dumps(receipt))

if __name__=='__main__':main()
