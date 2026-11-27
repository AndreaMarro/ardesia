"""Reproduce the scoped nine-record C5 checks with recoverable raw outputs."""
import argparse
import fcntl
from hashlib import sha256
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time

from tools.corpus_engineering.experiment_visibility_request import planned_interactions, verify_planned_interaction, verify_report
from tools.corpus_engineering.pipeline import canonical,digest
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent/'cric-resume-276'
APP = REPO/'officina-di-fisica'
LOCK = ROOT.parent/'.cric-browser.lock'
F357 = 'f357b970906cb827c8e8046a42e45b35d8745179752f2a756b2affdf56bbe5f4'
CANDIDATE = '3be1ddfe5bbec66daa88127859e6c95ef5e25cd3'
AUTHOR = 'd20c200b8731739ef512f7e2820104a7bd755202'
CORE = '5cba6bd89e20a4bdf3b973c732b3fc031a86b192'
SOURCE_PLAN = 'officina-di-fisica/editorial/reviews/c5-eleven-drafts-canary-7c7281-20261127/prepared.json'
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
BATCHES = [('wave-basis','wave-basis',set()),('wave-energy-sound','wave-energy-decibels',{'SIM-C5-L05-01','SIM-C5-L05-03'})]
ENV = {**os.environ,'PATH':str(Path(sys.executable).parent)+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1'}


def read(path):
    return json.loads(path.read_bytes())


def pin(raw):
    return sha256(raw).hexdigest()


def write(path,payload):
    raw=(canonical(payload)+'\n').encode()
    if path.exists():
        assert path.read_bytes()==raw
    else:
        path.write_bytes(raw)
    return raw


def git_blob(ref,path):
    return subprocess.check_output(['git','show',f'{ref}:{path}'],cwd=REPO)


def scope():
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()==CANDIDATE
    fingerprint=runtime_fingerprint(APP)
    assert fingerprint['sha256']==F357
    protocol=APP/'tools/corpus_engineering/experiment_visibility_ui.mjs'
    assert pin(protocol.read_bytes())==COLLECTOR
    return fingerprint,protocol


def prepare():
    fingerprint,_=scope()
    old_raw=git_blob(CORE,SOURCE_PLAN)
    origin=json.loads(old_raw)
    assert origin['draftCandidateCommit']==AUTHOR and origin['runtimeFingerprint']['sha256'].startswith('7c7281')
    sources={row['id']:row for row in read(APP/'content/esperienze-C5.json')}
    inputs=ROOT/'inputs'
    inputs.mkdir(exist_ok=True)
    selected, files, packages, kept = {}, {}, [], {}
    for family,target,excluded in BATCHES:
        source=f'experiment-c5-{family}-reading-20261127'
        batch=f'experiment-c5-{target}-reading-20261127'
        r,b=(git_blob(AUTHOR,f'officina-di-fisica/editorial/batches/{source}{suffix}.json') for suffix in ('','-bindings'))
        pkg,bind=map(json.loads,(r,b))
        records=[row for row in pkg['records'] if row['id'] not in excluded]
        bindings=[row for row in bind if row['id'] not in excluded]
        assert len(pkg['records'])==len(records)+len(excluded)
        for row,binding in zip(records,bindings,strict=True):
            key=row['id']
            source_row=sources[key]
            assert binding['id']==binding['sourceId']==key and key not in kept
            assert binding['candidateSha256']==digest(row) and binding['sourceSha256']==digest(source_row)
            assert row['baseVersion']==source_row['version']
            kept[key]=row
        selected[batch]={'ids':[row['id'] for row in records],'excludedOpenIds':sorted(excluded),'authorCommit':AUTHOR,
                         'sourcePackageSha256':pin(r),'sourceBindingsSha256':pin(b)}
        for suffix,raw,value in [('',r,{**pkg,'records':records}),('-bindings',b,bindings)]:
            file=inputs/(batch+suffix+'.json')
            if excluded:
                raw=(json.dumps(value,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
            file.write_bytes(raw)
            canonical_file=APP/'editorial/batches'/file.name
            canonical_file.write_bytes(raw)
            files[str(file)]=pin(raw)
            selected[batch][suffix or 'package']=pin(raw)
            if not suffix:packages.append(str(file))
    assert len(kept)==9 and set(inputs.iterdir())=={Path(name) for name in files}
    records=[]
    for template in origin['records']:
        key=template['id']
        if key not in kept:continue
        assert template['sourceSha256']==digest(sources[key])
        assert template['candidateSha256']==digest(template['record'])==digest(kept[key])
        records.append({**template,'record':kept[key]})
    keys=[key for key in origin['expectedCaseKeys'] if key.split('|')[0] in kept]
    assert len(keys)==len(set(keys))==216 and len(records)==9
    request={'schemaVersion':'1.0.0','scope':'C5_NINE_DRAFTS_BOUNDED_ON_F357','sourceCommit':CANDIDATE,
             'runtimeSha256':F357,'earlierIndependentPlanSha256':pin(old_raw),'earlierIndependentCommit':CORE,
             'draftAuthorCommit':AUTHOR,'collectorSha256':COLLECTOR,'expectedCases':216,'inputFiles':files,
             'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    plan={**origin,'scope':request['scope'],'sourceCommit':CANDIDATE,'runtimeFingerprint':fingerprint,
          'requestSha256':pin(write(ROOT/'request.json',request)),'records':records,
          'expectedCaseKeys':keys,'inputFiles':files,'packageFiles':packages,'draftRecords':list(kept.values())}
    write(ROOT/'prepared.json',plan)
    write(ROOT/'selected-packages.json',selected)
    for width in (320,1280):
        directory=ROOT/f'width-{width}'
        directory.mkdir(exist_ok=True)
        selected_keys=[key for key in keys if key.split('|')[2]==str(width)]
        assert len(selected_keys)==108
        write(directory/'prepared.json',{**plan,'profiles':[row for row in plan['profiles'] if row['width']==width],
                                          'expectedCaseKeys':selected_keys})
        write(directory/'browser-info.json',{'candidateApp':str(APP),'prepared':str(directory/'prepared.json'),
                                           'output':str(directory/'actual')})
    print(json.dumps({'preparedCases':216,'manifest':pin((ROOT/'prepared.json').read_bytes()),'browserStarted':False}))


def child(args,folder,timeout,updates=None):
    folder.mkdir(exist_ok=True)
    with LOCK.open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        free=shutil.disk_usage(folder).free
        if free<2*1024**3:raise ValueError('Insufficient free disk for bounded browser')
        start=time.monotonic()
        timed=False
        with (folder/'process.txt').open('xb') as log, subprocess.Popen(
            args,cwd=APP,env={**ENV,**(updates or {})},stdout=log,stderr=subprocess.STDOUT,start_new_session=True) as process:
            try:code=process.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                timed=True
                os.killpg(process.pid,signal.SIGTERM)
                try:code=process.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid,signal.SIGKILL)
                    code=process.wait()
        write(folder/'terminal.json',{'observedExitCode':code,'timeoutTriggered':timed,
                                      'seconds':time.monotonic()-start,'startingFreeBytes':free,'activityCredit':0})
    if code or timed:raise ValueError('Preserved real browser failure in ' + str(folder))


def run_previews():
    fingerprint,_=scope()
    for batch,entry in read(ROOT/'selected-packages.json').items():
        folder=ROOT/batch
        if not (folder/'terminal.json').exists():
            child(['node','tests/corpus/browser-drafts.mjs',batch],folder,180,{'ASTRA_RESULTS':str(folder/'actual')})
        raw=(folder/'actual'/'report.json').read_bytes()
        report=json.loads(raw)
        assert read(folder/'terminal.json')['observedExitCode']==0
        assert report['runtimeFingerprint']==fingerprint and report['packageFileSha256']==entry['package']
        assert len(report['records'])==len(entry['ids'])*3 and not any(row['violations'] for row in report['records'])
        write(folder/'completion.json',{'batch':batch,'cases':len(report['records']),'reportSha256':pin(raw),
                                        'runtimeSha256':F357,'scientificActivityCredit':0})
        print(batch,len(report['records']),pin(raw),flush=True)


def run_slices():
    fingerprint,protocol=scope()
    request=read(ROOT/'request.json')
    assert all(pin(Path(name).read_bytes())==expected for name,expected in request['inputFiles'].items())
    all_keys=[]
    for width in (320,1280):
        folder=ROOT/f'width-{width}'
        if not (folder/'terminal.json').exists():
            child(['node',str(protocol),str(folder/'browser-info.json')],folder,220)
        assert read(folder/'terminal.json')['observedExitCode']==0
        plan=read(folder/'prepared.json')
        report=verify_report(folder/'actual',plan,COLLECTOR)
        assert plan['runtimeFingerprint']==fingerprint and report['preparedSha256']==pin((folder/'prepared.json').read_bytes())
        planned=planned_interactions(plan)
        keys=[]
        for entry in report['cases']:
            case=read(folder/'actual'/entry['file'])
            row,state=planned[entry['caseKey']]
            verify_planned_interaction(case,row,state)
            if state is None:
                assert not case['axe'] and len(case['questions'])==2 and all(q['status'].startswith('Corretto.') for q in case['questions'])
            assert case['candidateSha256']==row['candidateSha256'] and case['sourceSha256']==row['sourceSha256']
            keys.append(entry['caseKey'])
        assert len(keys)==len(set(keys))==108 and runtime_fingerprint(APP)==fingerprint
        all_keys.extend(keys)
        result={'width':width,'cases':108,'answerSubmissions':72,'runtimeSha256':F357,
                'reportSha256':pin((folder/'actual'/'report.json').read_bytes()),'activityCredit':0}
        write(folder/'completion.json',result)
        print(json.dumps(result),flush=True)
    assert len(all_keys)==len(set(all_keys))==216 and set(all_keys)==set(read(ROOT/'prepared.json')['expectedCaseKeys'])
    write(ROOT/'technical-terminal.json',{'cases':216,'observedAnswerSubmissions':144,'runtimeSha256':F357,
                                         'verification':'ACTUAL_BROWSER_SCOPE_COMPLETE','activityCredit':0})


if __name__=='__main__':
    parser=argparse.ArgumentParser(__doc__)
    parser.add_argument('phase',choices=('prepare','previews','slices'))
    mode=parser.parse_args().phase
    {'prepare':prepare,'previews':run_previews,'slices':run_slices}[mode]()
