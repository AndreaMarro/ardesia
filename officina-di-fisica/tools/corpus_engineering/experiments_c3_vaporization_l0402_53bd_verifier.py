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
from .c3_l0402_53bd_browser_a import verify_case
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint
from .c3_six_heat_phase_primary_models_a import law,inverse
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/c3-vaporization-l0402-canonical-53bd-delivery-a-20261127'
FOLDER='officina-di-fisica/editorial/reviews/c3-vaporization-l0402-canonical-53bd-delivery-a-20261127/observations'
KEY='SIM-C3-L04-02'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
SOURCE_COMMIT='1b72b71a68a6023ab1c9fa189733947b03029914'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_SHA='54420428cc7e93d78fdaed52ee0a282cf50ffccd0808d8bcdaca65af4803c42c'
CANDIDATE='a7268eadc74f1819f3bd2798d03b1209207492502f9491fabb30c0f8f414c466'
SIGNATURE='09e7f23c0a8cc3bca40ac651448089b14c934a42ed07265463f61e35ee26274e'
ARCHIVE='3db44bb9c58ac0753daa5a707bf9a4623934ee064dd82a36163c4a79364a5f4c'
MANIFEST='b766dcc6341c85241219fa8e17b483e23a928c7b4566a6eca884cc7e61231417'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
MODEL_SHA='faf3583af19d0c8e9597de1e21280cf1152d96ddae1d2e3a58934c14c2450a76'
CONSUMER=r"""
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const rows=JSON.parse(await readFile(app+'/content/esperienze-C3.json','utf8'));
console.log(JSON.stringify((await esperienza(rows.find(r=>r.id==='SIM-C3-L04-02'))).record.assessment));
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
            require(len(run['cases'])==24 and len(planned)==24,'Incomplete bounded width group')
            for entry in run['cases']:
                case=json.loads(pinned(prefix+'/actual/'+entry['file']));row,state=planned[case['caseKey']]
                verify_planned_interaction(case,row,state)
                require(case['id']==KEY and case['sourceSha256']==SOURCE_SHA and case['candidateSha256']==selected['candidateSha256'] and case['profile']['width']==width,'Case identity mismatch')
                if state is not None:
                    roundoff_only(case['model']['y'],law(KEY,Fraction(str(state['x']))))
                    verify_case(case)
                else:
                    require(not case['axe'] and len(case['phases'])==4,'Missing accessibility/setup phase')
                require(case['caseKey']not in all_cases,'Duplicate case');all_cases[case['caseKey']]=case
        require(len(all_cases)==48 and observed_answers(all_cases,[('6.78',True),('0',True)])==8,'Actual assessment coverage incomplete')
        visual=read_visual_decision(archive,FOLDER,all_cases,KEY,'draft',2,CANDIDATE,RUNTIME,SOURCE_COMMIT)
        original_raw=pinned(FOLDER+'/source-independent-visual-review.verbatim.json');original=json.loads(original_raw)['records'][0]
        require(len(original['readFiles'])==48 and len(visual['readFiles'])==8 and visual['representativeSubsetOfRead48']is True and
                visual['all48ReadPngSha256']==[r['sha256']for r in original['readFiles']],'Eight profile examples must remain an explicit subset of48 read rasters')
        require(all(any(r['caseKey']==e['caseKey']and r['sha256']==e['sha256']for r in original['readFiles'])for e in visual['readFiles']),'New unreviewed image in canonical subset')
        for name in manifest['files']:pinned(name)
    return draft,all_cases,visual

PHASE_GUARD_SHA='22f61c635a0a0cf51a4aa619ad9ccdedc2bdb20154ab08bd238ebc9a9b67e179'
BINARY_GUARD_SHA='5441a4e5fd29200ce792f129797e66bc850b401d7a96a216665cc985d1c28537'

def report(sources,package,bindings):
    require(set(sources)=={KEY} and digest(sources[KEY])==SOURCE_SHA and runtime_fingerprint(APP)['sha256']==RUNTIME,'Exact source and53bd required')
    for name,expected in [('c3_six_heat_phase_primary_models_a.py',MODEL_SHA),('c3_l0402_53bd_browser_a.py',PHASE_GUARD_SHA),('c3_six_heat_phase_core6ae3_review_a.py',BINARY_GUARD_SHA)]:require(sha((APP/'tools/corpus_engineering'/name).read_bytes())==expected,'Independent mathematical/phase/observation guard changed')
    draft,cases,visual=load_proof();rows=list(reviewed_rows(package,bindings,{KEY:SIGNATURE},{KEY},APP/'editorial/assets'));require(len(rows)==1,'One signed phase ID required');candidate,binding,signature,assets,errors=rows[0]
    require(not errors and not assets and candidate==draft and digest(candidate)==CANDIDATE and binding['sourceRef']==SOURCE_REF and binding['sourceSha256']==SOURCE_SHA,'Exact canonical draft/binding changed')
    for n in range(-10,11):
        m=Fraction(n,2);q=law(KEY,m);require(50*q==113*m and inverse(KEY,q)==m,'Exact signed latent-heat balance/inverse failed')
    published=json.loads(subprocess.check_output(['node','--input-type=module','-',str(APP)],input=CONSUMER.encode(),cwd=APP,timeout=30));require(len(published)==2,'Retained original tasks absent')
    for task,want in zip(published,[Fraction(339,50),0],strict=True):roundoff_only(task['value'],want)
    manual='Q=m_sLv,conLv2.26kJ/g=(113/50)kJ/g. Per+3g:2×3=6 e0.26×3=0.78,totale+6.78kJ. Per0g,Qlatente0. Per−2g,−4.52kJ:calore ceduto dall’acqua. L’inversaQ/Lv mantiene il segno; non si tratta di massa fisica totale negativa.'
    assumptions='Acqua alle condizioni di coesistenza e pressione scelte;Lv2.26kJ/g assegnato come valore arrotondato vicino all’ebollizione atmosferica. Massa trasformata con segno−5..5g,totale materiale positivo. Qpositivo entrante nell’acqua. Zero trasferimento latente non afferma zero calore per qualunque altro processo. Particelle/livello schematici,non inventario assoluto o conteggio molecole. Non si identifica automaticamenteQcon solaDeltaU.'
    row=dict(id=KEY,ok=True,sourceSha256=SOURCE_SHA,sourceVersion=sources[KEY]['version'],candidateSha256=CANDIDATE,candidateVersion=2,baseVersion=1,reviewedSignature=signature,originalEditionRetained=True,failedPublishedEdition=False,
        publishedEditionReview=dict(ok=True,sourceSha256=SOURCE_SHA,actualAssignedTasks=published,judgmentScope='Retained original assigned arithmetic only; no new original interactive replay',humanApproval='NOT_RUN',publicationAction='NONE'),
        calculationScope='EXACT_MANUAL_CALCULATION',manualArithmetic=manual,physicalAssumptions=assumptions,pedagogicalReview='Source-first exact model before Core6ae3,full authored text/manual read,48fresh53bd cases and all48wholePNG read.8 canonical examples explicitly subset48. Actual signed endpoints,zero,phase representation,readout signs/units and16 actual correct submissions checked. Alto axial and schematic limitations retained; private preview separate. No L04-03heat-arrow judgment here.',actualBrowserCases=48,actualAnswerSubmissions=16,visualScope=visual['scope'],humanApproval='NOT_RUN',publicationAction='DRAFT')
    return dict(schemaVersion='1.0.0',records=[row],acceptedCount=1,runtimeSha256=RUNTIME,sourceCommit=SOURCE_COMMIT,archiveSha256=ARCHIVE,evidenceManifestSha256=MANIFEST,verifierSha256=sha(Path(__file__).read_bytes()),phaseGuardSha256=PHASE_GUARD_SHA,activityCredit=0,humanApproval='NOT_RUN',publicationAction='NONE')
