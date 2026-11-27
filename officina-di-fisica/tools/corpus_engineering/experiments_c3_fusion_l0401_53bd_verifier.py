"""Distinct per-ID canonical bridge to sealed48 observations; no approval or registry writes."""
from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile
from .activity_observations import normalise_numbers,observed_answers,read_visual_decision
from .experiment_visibility_request import verify_report_bytes,planned_interactions,verify_planned_interaction
from .pipeline import digest,sha
from .c3_six_heat_phase_core6ae3_review_a import roundoff_only
from .c3_l0401_53bd_browser_a import verify_case,exact_instant_mass
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint
from .c3_six_heat_phase_primary_models_a import law,inverse
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/c3-fusion-l0401-canonical-53bd-delivery-a-20261127'
FOLDER='officina-di-fisica/editorial/reviews/c3-fusion-l0401-canonical-53bd-delivery-a-20261127/observations'
KEY='SIM-C3-L04-01'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
SOURCE_COMMIT='1b72b71a68a6023ab1c9fa189733947b03029914'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_SHA='b8617a4b32bb39a3e5efde0da37c56cf805bef4d92eecde607fe7e3968df10c9'
CANDIDATE='a2667583c98036f2adad2e25b78659628bad0a0b269b191b1112e080c50f6ba0'
SIGNATURE='e3e67e872ce8b12c653f78b5e813a928a1619d9a2825efef9ac1a7f1d4b2e2e6'
ARCHIVE='d16c7f483e66634b5d1f8f57e4a5454a58bbfa230cd8ff63ed05d1d0eff9eff0'
MANIFEST='fafedb306d62fd3567728e584f4a0e01887f573cff5ae337db0b169294f54381'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
MODEL_SHA='faf3583af19d0c8e9597de1e21280cf1152d96ddae1d2e3a58934c14c2450a76'
CONSUMER=r"""
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const rows=JSON.parse(await readFile(app+'/content/esperienze-C3.json','utf8'));
console.log(JSON.stringify((await esperienza(rows.find(r=>r.id==='SIM-C3-L04-01'))).record.assessment));
"""
def require(ok,message):
    if not ok:raise ValueError(message)

def terminal_identity(t):
    # Preserve the original receipt schema. No inferred supervisor result exists.
    require({'actualObservedExitCode','signal','timedOut','assistedTermination','intervention'}.issubset(t) and type(t.get('actualObservedExitCode'))is int and t['actualObservedExitCode']==0 and
            t.get('signal')is None and t.get('timedOut')is False and t.get('assistedTermination')is False and
            t.get('intervention')==[], 'Real browser terminal was unsuccessful, assisted, or incomplete')

def load_proof():
    manifest_raw=(PROOF/'observations-manifest.json').read_bytes()
    raw=(PROOF/'observations.zip').read_bytes()
    require(sha(manifest_raw)==MANIFEST and sha(raw)==ARCHIVE,'Sealed observation transport changed')
    manifest=json.loads(manifest_raw);require(manifest['archiveSha256']==ARCHIVE and manifest['runtimeSha256']==RUNTIME,'Wrong archive epoch')
    all_cases={};draft=None
    with ZipFile(PROOF/'observations.zip')as archive:
        require(len(archive.namelist())==len(set(archive.namelist())) and set(archive.namelist())==set(manifest['files']),'Missing or repeated archive members')
        def pinned(name):
            blob=archive.read(name);require(sha(blob)==manifest['files'][name],'Changed archive member: '+name);return blob
        for width in (320,1280):
            prefix=FOLDER+'/'+str(width);prepared_raw=pinned(prefix+'/prepared.json');prepared=json.loads(prepared_raw)
            run=verify_report_bytes(lambda name:pinned(prefix+'/actual/'+name),prepared,COLLECTOR)
            terminal_identity(json.loads(pinned(prefix+'/actual-terminal.json')))
            require(run['preparedSha256']==sha(prepared_raw) and run['sourceCommit']==SOURCE_COMMIT and
                    run['runtimeFingerprint']['sha256']==RUNTIME and not run['errors'] and
                    run['guestIsolation']=='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403','Wrong actual runtime or owner/guest isolation')
            require(len(prepared['records'])==1 and prepared['records'][0]['id']==KEY and prepared['records'][0]['variant']=='draft' and
                    prepared['records'][0]['sourceSha256']==SOURCE_SHA,'Wrong actual source/draft scope')
            selected=prepared['records'][0];complete=[r for r in prepared['draftRecords']if r['id']==KEY]
            require(len(complete)==1 and digest(complete[0])==CANDIDATE and
                    digest(normalise_numbers(complete[0]))==digest(normalise_numbers(selected['record'])) and
                    digest(selected['record'])==selected['candidateSha256'],'Complete owner record and selected record differ')
            require(any(r['id']==KEY and r['version']==2 for r in run['fullOwnerRecordIdentity']['records']),'Owner draft v2 absent')
            if draft is not None:require(draft==complete[0],'Group drafts differ')
            draft=complete[0];planned=planned_interactions(prepared)
            require(len(run['cases'])==40 and len(planned)==40,'Incomplete bounded width group')
            for entry in run['cases']:
                case=json.loads(pinned(prefix+'/actual/'+entry['file']));row,state=planned[case['caseKey']]
                verify_planned_interaction(case,row,state)
                require(case['id']==KEY and case['sourceSha256']==SOURCE_SHA and case['candidateSha256']==selected['candidateSha256'] and case['profile']['width']==width,'Case identity mismatch')
                if state is not None:
                    require(Fraction(str(case['model']['y']))==Fraction(law(KEY,Fraction(str(state['x'])))),'Observed mass differs from independent exact334J/g')
                    verify_case(case)
                else:
                    require(not case['axe'] and len(case['phases'])==4,'Missing accessibility/setup phase')
                require(case['caseKey']not in all_cases,'Duplicate case');all_cases[case['caseKey']]=case
        require(len(all_cases)==80 and observed_answers(all_cases,[('50',True),('55',True)])==8,'Actual assessment coverage incomplete')
        visual=read_visual_decision(archive,FOLDER,all_cases,KEY,'draft',2,CANDIDATE,RUNTIME,SOURCE_COMMIT)
        original_raw=pinned(FOLDER+'/source-independent-visual-review.verbatim.json');original=json.loads(original_raw)['records'][0]
        require(len(original['readFiles'])==80 and len(visual['readFiles'])==8 and visual['representativeSubsetOfRead80']is True and
                visual['all80ReadPngSha256']==[r['sha256']for r in original['readFiles']],'Eight profile examples must remain an explicit subset of80 read rasters')
        require(all(any(r['caseKey']==e['caseKey']and r['sha256']==e['sha256']for r in original['readFiles'])for e in visual['readFiles']),'New unreviewed image in canonical subset')
        for name in manifest['files']:pinned(name)
    return draft,all_cases,visual

PHASE_GUARD_SHA='4270eddd37e8c5ff612a3d5e09ad464da4d8c81a03a9d38e06af375e6d11f143'
BINARY_GUARD_SHA='5441a4e5fd29200ce792f129797e66bc850b401d7a96a216665cc985d1c28537'

def report(sources,package,bindings):
    require(set(sources)=={KEY} and digest(sources[KEY])==SOURCE_SHA and runtime_fingerprint(APP)['sha256']==RUNTIME,'Exact source and53bd required')
    for name,expected in [('c3_six_heat_phase_primary_models_a.py',MODEL_SHA),('c3_l0401_53bd_browser_a.py',PHASE_GUARD_SHA),('c3_six_heat_phase_core6ae3_review_a.py',BINARY_GUARD_SHA)]:
        require(sha((APP/'tools/corpus_engineering'/name).read_bytes())==expected,'Independent mathematical/phase/observation guard changed')
    draft,cases,visual=load_proof();rows=list(reviewed_rows(package,bindings,{KEY:SIGNATURE},{KEY},APP/'editorial/assets'))
    require(len(rows)==1,'Single bounded phase ID required');candidate,binding,signature,assets,errors=rows[0]
    require(not errors and not assets and candidate==draft and digest(candidate)==CANDIDATE and binding['sourceRef']==SOURCE_REF and binding['sourceSha256']==SOURCE_SHA,'Exact canonical draft/binding changed')
    for n in range(21):
        q=Fraction(167*n,100);require(law(KEY,q)==5*n and inverse(KEY,5*n)==q,'Exact latent-heat law/inverse failed')
    require([exact_instant_mass(Fraction(167,5),t)for t in [0,Fraction(1,8),10,20]]==[0,Fraction(5,8),50,100],'Exact current-clock masses failed')
    published=json.loads(subprocess.check_output(['node','--input-type=module','-',str(APP)],input=CONSUMER.encode(),cwd=APP,timeout=30))
    require(len(published)==2,'Retained original tasks missing')
    for task,want in zip(published,[50,55],strict=True):roundoff_only(task['value'],want)
    manual='Ghiaccio già a0C,Lf334J/g. Con16.7kJ:16700/334=50g. Con18.37kJ:18370/334=55g. Per100g servono33400J=33.4kJ. Il riscaldatore1.67kJ/s trasforma5g/s: con energia finale33.4kJ, a0,1/8,10,20s le masse già fuse sono0,5/8,50,100g. Distingui la massa finale assegnata dall’energia e la massa corrente al tempo impostato.'
    assumptions='100g iniziali di ghiaccio a0C,calorelatente assegnato costante334J/g,energia fornita0..33.4kJ. Riscaldatore ideale a potenza1.67kJ/s,senza dispersioni né tratto di riscaldamento prima della fusione. Temperatura fissa0C nella fase considerata. Quantità e volumi disegnati schematici; valori numerici dalle letture. Alto assiale alla colonna.'
    row=dict(id=KEY,ok=True,sourceSha256=SOURCE_SHA,sourceVersion=sources[KEY]['version'],candidateSha256=CANDIDATE,candidateVersion=2,baseVersion=1,reviewedSignature=signature,originalEditionRetained=True,failedPublishedEdition=False,
        publishedEditionReview=dict(ok=True,sourceSha256=SOURCE_SHA,actualAssignedTasks=published,judgmentScope='Retained original assigned arithmetic only; no new original interactive replay',humanApproval='NOT_RUN',publicationAction='NONE'),
        calculationScope='EXACT_MANUAL_CALCULATION',manualArithmetic=manual,physicalAssumptions=assumptions,pedagogicalReview='Source-first exact model frozen before Core6ae3; full authored text/manual read,80fresh53bd cases and all80whole PNG read.8 canonical examples explicitly subset of80.32 clock cases separate final/current mass, actual clock/readout/phase geometry and zero/full conditions.16 actual correct submissions. Original source retained and separately scoped, private preview separate. L04-03heat-arrow negative not adjudicated here.',
        actualBrowserCases=80,actualClockCases=32,actualAnswerSubmissions=16,visualScope=visual['scope'],humanApproval='NOT_RUN',publicationAction='DRAFT')
    return dict(schemaVersion='1.0.0',records=[row],acceptedCount=1,runtimeSha256=RUNTIME,sourceCommit=SOURCE_COMMIT,archiveSha256=ARCHIVE,evidenceManifestSha256=MANIFEST,verifierSha256=sha(Path(__file__).read_bytes()),phaseGuardSha256=PHASE_GUARD_SHA,activityCredit=0,humanApproval='NOT_RUN',publicationAction='NONE')
