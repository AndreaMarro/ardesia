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
OBSERVATION_ARITHMETIC_SHA='5441a4e5fd29200ce792f129797e66bc850b401d7a96a216665cc985d1c28537'
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint
from .c3_six_heat_phase_primary_models_a import law,inverse
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/c3-mayer-mixing-canonical-53bd-delivery-a-20261127'
FOLDER='officina-di-fisica/editorial/reviews/c3-mayer-mixing-canonical-53bd-delivery-a-20261127/observations'
SPECS={'SIM-C3-L03-03': {'candidate': 'b9f4aa6dcd873f95bc1b7484aab03e95dffee9777818e4b5f2ff25cd6c8c49ca', 'signature': '2a1595a61f560c010cc6f970e1f7957a4d3b2487926086a02b81fc4dbaf4c44f', 'source': 'd2f0fec12e9334a74da3bdbaaeb4d9a93c7a338952d5e66423d55ba51ae87c4d'}, 'SIM-C3-L03-04': {'candidate': '41eaa8dab7c6cfb407f858e091d882b66805a5e719fb88590383b5993058eb06', 'signature': 'feeda600ffe5d67c193c6e3656877a253090a83a237772d66bbfbdfabc35b578', 'source': '9253bd7c27605ca7b2cfc465b309727e59818ba99532dc4a2b1d5c631a5b7a3a'}}
IDS=set(SPECS)
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
SOURCE_COMMIT='1b72b71a68a6023ab1c9fa189733947b03029914'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
ARCHIVE='c44ba774fd28f6e3daa6b0c79d37836181cdb13845c922a4c61b67670e2da0b7'
MANIFEST='4786cbde5652d5b823e2fd341df976e2e85cde0cac9f248d07f0068188edc202'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
MODEL_SHA='faf3583af19d0c8e9597de1e21280cf1152d96ddae1d2e3a58934c14c2450a76'
INPUTS={'SIM-C3-L03-03':(10,11),'SIM-C3-L03-04':(200,175)}
ENTRIES={'SIM-C3-L03-03':[('83.14',True),('91.454',True)],'SIM-C3-L03-04':[('50',True),('48',True)]}
CONSUMER=r"""
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const rows=JSON.parse(await readFile(app+'/content/esperienze-C3.json','utf8'));
const result={};for(const key of JSON.parse(process.argv[3]))result[key]=(await esperienza(rows.find(r=>r.id===key))).record.assessment;
console.log(JSON.stringify(result));
"""
def require(ok,message):
    if not ok:raise ValueError(message)

def terminal_identity(t):
    # Preserve the original receipt schema. No inferred supervisor result exists.
    require({'actualObservedExitCode','signal','timedOut','assistedTermination','intervention'}.issubset(t) and type(t.get('actualObservedExitCode'))is int and t['actualObservedExitCode']==0 and
            t.get('signal')is None and t.get('timedOut')is False and t.get('assistedTermination')is False and
            t.get('intervention')==[], 'Real browser terminal was unsuccessful, assisted, or incomplete')

def load_proof(KEY):
    spec=SPECS[KEY];SOURCE_SHA=spec['source'];CANDIDATE=spec['candidate'];FOLDER='officina-di-fisica/editorial/reviews/c3-mayer-mixing-canonical-53bd-delivery-a-20261127/observations/'+KEY
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
                else:
                    require(not case['axe'] and len(case['phases'])==4,'Missing accessibility/setup phase')
                require(case['caseKey']not in all_cases,'Duplicate case');all_cases[case['caseKey']]=case
        require(len(all_cases)==48 and observed_answers(all_cases,ENTRIES[KEY])==8,'Actual assessment coverage incomplete')
        visual=read_visual_decision(archive,FOLDER,all_cases,KEY,'draft',2,CANDIDATE,RUNTIME,SOURCE_COMMIT)
        original_raw=pinned(FOLDER+'/source-independent-visual-review.verbatim.json');original=json.loads(original_raw)['records'][0]
        require(len(original['readFiles'])==48 and len(visual['readFiles'])==8 and visual['representativeSubsetOfRead48']is True and
                visual['all48ReadPngSha256']==[r['sha256']for r in original['readFiles']],'Eight profile examples must remain an explicit subset of48 read rasters')
        require(all(any(r['caseKey']==e['caseKey']and r['sha256']==e['sha256']for r in original['readFiles'])for e in visual['readFiles']),'New unreviewed image in canonical subset')
        for name in manifest['files']:pinned(name)
    return draft,all_cases,visual

MANUAL={
'SIM-C3-L03-03':'Per una mole, Qp−Qv=nRΔT. Con10K:8.314×10=83.14J. Con11K aggiungi8.314J:91.454J. I valori assegnati sono decimali esatti del modello; ΔT=(Qp−Qv)/8.314 è l’inversa. Non serve scegliere un gas monoatomico né assegnare separatamente Cp e Cv.',
'SIM-C3-L03-04':'Bilancio m c(80−Tf)=200 c(Tf−20). Cancella c comune e ottieni Tf=(80m+4000)/(m+200). Con200g masse uguali:50C. Con175g,80×175=14000;aggiungi4000 e dividi18000/375=48C. Controprova175×32=200×28=5600gK. Inversa m=200(Tf−20)/(80−Tf), nel dominio fisico20<Tf<80C e nel sottointervallo del controllo32..56C.'}
ASSUMPTIONS={
'SIM-C3-L03-03':'Una mole di gas perfetto;stessa variazione di temperatura da uno stesso stato;soltanto lavoro pV quasistatico;capacità molari costanti nell’intervallo. Differenza Cp−Cv=R=8.314J/(molK).0≤ΔT≤20K. Pistone e indicatore di pressione qualitativi, non scala dei Cp/Cv o della differenza di calore.',
'SIM-C3-L03-04':'Acqua calda80C,200g fredda20C;stesso calore specifico positivo costante. Recipiente isolato,capacità trascurabile;nessuna evaporazione. Massa calda50..300g. Differenze Celsius=kelvin;media affine,nessun rapporto di temperature assolute. Scatola,colore e livello fisso sono schematici.'}

def report(sources,package,bindings):
    require(set(sources)==IDS and runtime_fingerprint(APP)['sha256']==RUNTIME,'Exact two disjoint sources and53bd runtime required')
    require(sha((APP/'tools/corpus_engineering/c3_six_heat_phase_primary_models_a.py').read_bytes())==MODEL_SHA,'Pre-key independent exact model changed')
    require(sha((APP/'tools/corpus_engineering/c3_six_heat_phase_core6ae3_review_a.py').read_bytes())==OBSERVATION_ARITHMETIC_SHA,'Frozen finite/binary observation guard changed')
    published=json.loads(subprocess.check_output(['node','--input-type=module','-',str(APP),json.dumps(sorted(IDS))],input=CONSUMER.encode(),cwd=APP,timeout=30))
    actual={key:load_proof(key)for key in sorted(IDS)};accepted=[]
    for candidate,binding,signature,assets,errors in reviewed_rows(package,bindings,{k:s['signature']for k,s in SPECS.items()},IDS,APP/'editorial/assets'):
        key=candidate['id'];spec=SPECS[key];draft,cases,visual=actual[key]
        require(not errors and not assets and candidate==draft and digest(candidate)==spec['candidate'] and digest(sources[key])==spec['source'] and binding['sourceRef']==SOURCE_REF and binding['sourceSha256']==spec['source'],'Exact source/draft/binding mismatch: '+key)
        expected=[law(key,x)for x in INPUTS[key]]
        require(len(published[key])==2,'Retained published tasks absent')
        for task,want in zip(published[key],expected,strict=True):roundoff_only(task['value'],want)
        # Exact independent identities, before the separate binary observation comparison.
        if key.endswith('03-03'):
            for x in range(21):require(inverse(key,law(key,x))==x,'Mayer inverse identity')
        else:
            for x in range(50,301,25):
                t=law(key,x);require(x*(80-t)==200*(t-20) and inverse(key,t)==x,'Mixture exact heat balance/inverse')
        accepted.append(dict(id=key,ok=True,sourceSha256=spec['source'],sourceVersion=sources[key]['version'],candidateSha256=spec['candidate'],candidateVersion=2,baseVersion=1,reviewedSignature=signature,originalEditionRetained=True,failedPublishedEdition=False,
            publishedEditionReview=dict(ok=True,sourceSha256=spec['source'],actualAssignedTasks=published[key],judgmentScope='Retained published assigned arithmetic only; no new interactive original replay',humanApproval='NOT_RUN',publicationAction='NONE'),
            calculationScope='EXACT_MANUAL_CALCULATION',manualArithmetic=MANUAL[key],physicalAssumptions=ASSUMPTIONS[key],pedagogicalReview='Source-first model frozen before opening Core6ae3, full authored text/manual read,48fresh53bd cases and all48whole PNG read for this ID. Eight canonical examples are an explicit subset. Two installed tasks actually submitted per profile. Native axial and schematic limitations preserved; canonical private preview separate.',
            exactAssignedAnswers=[str(x)for x in expected],actualBrowserCases=48,actualAnswerSubmissions=16,visualScope=visual['scope'],humanApproval='NOT_RUN',publicationAction='DRAFT'))
    return dict(schemaVersion='1.0.0',records=accepted,acceptedCount=len(accepted),runtimeSha256=RUNTIME,sourceCommit=SOURCE_COMMIT,archiveSha256=ARCHIVE,evidenceManifestSha256=MANIFEST,verifierSha256=sha(Path(__file__).read_bytes()),activityCredit=0,humanApproval='NOT_RUN',publicationAction='NONE')
