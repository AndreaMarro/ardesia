"""Distinct current-epoch canonical bridge for one continuity DRAFT and its source.
Sealed real observations and independent raster receipts remain immutable.
"""
from decimal import Decimal
from fractions import Fraction
from pathlib import Path
from zipfile import ZipFile
import json,math,subprocess
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint
from .activity_observations import normalise_numbers,observed_answers,read_visual_decision
from .experiment_visibility_request import verify_report_bytes,planned_interactions,verify_planned_interaction
from .c2_continuity_exact_readout_b import expected_readout
from .c2_l00501_fe5d_capture_verifier import verify_case
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/c2-l00501-canonical-fe5d-delivery-b-20261127'
FOLDER='officina-di-fisica/editorial/reviews/c2-l00501-canonical-fe5d-delivery-b-20261127/observations'
KEY='SIM-C2-L005-01'
RUNTIME='fe5d26413e1aeb59987cc3fd6040adde3b01952b6e5e5c3951695b2e64d9166b'
SOURCE_COMMIT='8de7bd774c71841c4b744485b012abd6506f3645'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_SHA='2c1385b566f8fc10f826b0885738205ac0e1c02bc1e4d56265169433bfde8d06'
CANDIDATE='06eb0924b44574ea48b9e2211fa87c7ba6126c8905884184ae5c929ecf40ae9f'
SIGNATURE='15f77f790aeeec6a3b879eded5fd58c878915a0d853df13cf4072f92fe5a374e'
ARCHIVE='8ab943ba7d40d847aa05c205268980ea32a72d5c188932d3c6b20bb51a3ef072'
MANIFEST='9e4b83da7a396479da7b87156018d0a80cfba16b360482acb1c35897567aab28'
MODEL_SHA='78f00383f6de706742c28a9ef49e76c240da37e5477a41d67b829f1c986fe1a1'
CAPTURE_SHA='a7d591eb3b4129591c245269ed68d7d0a861f269ab10eaa48e2fc502d13d3db6'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
BATCH='experiment-c2-continuity-l00501-reading-fe5d-20261127'
CONSUMER=r'''
import {readFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';
const app=process.argv[2],packagePath=process.argv[3];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const source=JSON.parse(await readFile(app+'/content/esperienze-C2.json','utf8')).find(r=>r.id==='SIM-C2-L005-01');
const draft=JSON.parse(await readFile(packagePath,'utf8')).records[0];const results=[];
for(const [variant,record]of [['published',source],['draft',draft]]){
 const a=await esperienza(record);results.push({variant,states:Array.from({length:13},(_,x)=>({x,y:a.model.solve({x}).y})),questions:a.record.assessment});
}
console.log(JSON.stringify(results));
'''
def require(ok,message):
    if not ok:raise ValueError(message)

def terminal_identity(terminal):
    # Original source receipt is intentionally retained, never given invented fields.
    require(type(terminal.get('observedExitCode'))is int and terminal['observedExitCode']==0 and
            terminal.get('timeoutTriggered')is False and type(terminal.get('startingFreeBytes'))is int and
            terminal['startingFreeBytes']>=2*1024**3 and type(terminal.get('seconds'))in(int,float) and
            math.isfinite(terminal['seconds']) and terminal['seconds']>0,
            'Missing, failed or timed-out original collector terminal')

def load_proof():
    manifestRaw=(PROOF/'observations-manifest.json').read_bytes();archiveRaw=(PROOF/'observations.zip').read_bytes()
    require(sha(manifestRaw)==MANIFEST and sha(archiveRaw)==ARCHIVE,'Sealed continuity proof transport changed')
    manifest=json.loads(manifestRaw);require(manifest['archiveSha256']==ARCHIVE and manifest['runtimeSha256']==RUNTIME and manifest['sourceCommit']==SOURCE_COMMIT,'Wrong proof epoch')
    all_cases={};draft=None
    with ZipFile(PROOF/'observations.zip')as archive:
        require(len(archive.namelist())==len(set(archive.namelist()))and set(archive.namelist())==set(manifest['files']),'Archive members are missing or repeated')
        def pinned(name):
            raw=archive.read(name);require(sha(raw)==manifest['files'][name],'Changed proof member: '+name);return raw
        config=json.loads(pinned(FOLDER+'/source-verifier-input.json'))
        index=json.loads(pinned(FOLDER+'/source-verified-raw-index.json'))
        receipt=json.loads(pinned(FOLDER+'/source-per-case-instrument-and-raster-reading.json'))
        reading=json.loads(pinned(FOLDER+'/source-independent-raster-reading.json'))
        require(receipt['reviewer']=='author_vectors_b'and receipt['completeOccurrences']==160 and receipt['uniqueWholePngs']==66 and reading['runtimeSha256']==RUNTIME and reading['consumerCommit']==SOURCE_COMMIT and not reading['openFindings'],'Current independent raster receipt absent')
        readCases={r['caseKey']:r for r in receipt['cases']};require(len(readCases)==160,'Incomplete independent raster reading')
        for group in index['groups']:
            root=FOLDER+'/raw/'+group['group'];preparedRaw=pinned(root+'/prepared.json');prepared=json.loads(preparedRaw)
            run=verify_report_bytes(lambda name:pinned(root+'/actual/'+name),prepared,COLLECTOR)
            terminal_identity(json.loads(pinned(root+'/terminal.json')))
            require(run['preparedSha256']==sha(preparedRaw)and run['sourceCommit']==SOURCE_COMMIT and run['runtimeFingerprint']['sha256']==RUNTIME and not run['errors']and run['guestIsolation']=='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403','Wrong observed runtime, source or guest isolation')
            require(len(prepared['records'])==1,'Unexpected bounded record count');selected=prepared['records'][0];variant=selected['variant']
            require(selected['id']==KEY and selected['sourceSha256']==SOURCE_SHA and variant in('published','draft'),'Wrong selected source or edition')
            if variant=='draft':
                complete=[r for r in prepared['draftRecords']if r['id']==KEY]
                require(len(complete)==1 and digest(complete[0])==CANDIDATE and digest(normalise_numbers(complete[0]))==digest(normalise_numbers(selected['record']))and digest(selected['record'])==selected['candidateSha256'],'Complete owner record and selected DRAFT differ')
                require(any(r['id']==KEY and r['version']==2 for r in run['fullOwnerRecordIdentity']['records']),'Owner did not receive DRAFTv2')
                if draft is not None:require(draft==complete[0],'DRAFT differs across bounded groups')
                draft=complete[0]
            else:require(selected.get('candidateSha256')is None and digest(normalise_numbers(selected['record']))==digest(normalise_numbers(json.loads((PROOF/'original-source.verbatim.json').read_bytes())[0])),'Published source record changed')
            planned=planned_interactions(prepared);require(len(run['cases'])==len(planned)==group['cases'],'Incomplete planned group')
            for entry in run['cases']:
                raw=pinned(root+'/actual/'+entry['file']);case=json.loads(raw);row,state=planned[case['caseKey']];verify_planned_interaction(case,row,state)
                require(case['id']==KEY and case['sourceSha256']==SOURCE_SHA and case['candidateSha256']==selected.get('candidateSha256'),'Case edition identity changed')
                verify_case(json.loads(raw,parse_float=Decimal),config)
                read=readCases[case['caseKey']];require(read['rawCaseSha256']==sha(raw)and read['completePngRead']is True and any(s['sha256']==read['rawPngSha256']for s in case['screenshots']),'Independent reading detached from raw case')
                if state is None:require(not case['axe']and len(case['phases'])==4,'Missing setup/accessibility phase')
                require(case['caseKey']not in all_cases,'Repeated current case');all_cases[case['caseKey']]=case
        require(len(all_cases)==160 and observed_answers(all_cases,[('24',True),('28',True)])==16,'Actual answer coverage incomplete')
        visuals={}
        for variant,version,candidate in [('draft',2,CANDIDATE),('published',1,None)]:
            selected={k:c for k,c in all_cases.items()if c['variant']==variant};require(len(selected)==80,'Missing edition observations')
            visual=read_visual_decision(archive,FOLDER+'/'+variant,selected,KEY,variant,version,candidate,RUNTIME,SOURCE_COMMIT)
            require(visual['representativeSubsetOfRead160']is True and set(visual['allReadCaseKeys'])==set(selected) and visual['sourceFullReadReceiptSha256']==sha(pinned(FOLDER+'/source-per-case-instrument-and-raster-reading.json')),'Canonical examples are not explicit subsets of full current reading')
            for e in visual['readFiles']:require(e['caseKey']in readCases and readCases[e['caseKey']]['rawPngSha256']==e['sha256'],'Canonical example was not actually read')
            visuals[variant]=visual
        for name in manifest['files']:pinned(name)
    return draft,all_cases,visuals

def report(sources,package,bindings):
    require(set(sources)=={KEY}and digest(sources[KEY])==SOURCE_SHA and runtime_fingerprint(APP)['sha256']==RUNTIME,'Exact source and FE5D runtime required')
    for name,expected in [('c2_continuity_exact_readout_b.py',MODEL_SHA),('c2_l00501_fe5d_capture_verifier.py',CAPTURE_SHA)]:require(sha((APP/'tools/corpus_engineering'/name).read_bytes())==expected,'Independent continuity model or capture guard changed')
    draft,cases,visuals=load_proof();rows=list(reviewed_rows(package,bindings,{KEY:SIGNATURE},{KEY},APP/'editorial/assets'));require(len(rows)==1,'One independently reviewed continuity record required');candidate,binding,signature,assets,errors=rows[0]
    require(not errors and not assets and candidate==draft and digest(candidate)==CANDIDATE and binding['sourceRef']==SOURCE_REF and binding['sourceSha256']==SOURCE_SHA,'Canonical DRAFT/binding differs from observed complete owner record')
    for v in range(13):
        for t in(0,3,6):
            e=expected_readout(v,t);require(e['Q_mL_s']==4*v and e['distance_cm']==v*t and e['volume_mL']==4*v*t,'Exact continuity/displacement/integrated-volume identity failed')
    packageFile=APP/'editorial/batches'/(BATCH+'.json');installed=json.loads(subprocess.check_output(['node','--input-type=module','-',str(APP),str(packageFile)],input=CONSUMER.encode(),cwd=APP,timeout=30))
    require([r['variant']for r in installed]==['published','draft'],'Both actual installed editions required')
    for r in installed:
        require(len(r['states'])==13 and all(type(s['x'])is int and s['y']==4*s['x']for s in r['states']),'Actual installed flow law drift')
        require([q['value']for q in r['questions']]==[24,28]and all(q['unit']=='mL/s'for q in r['questions']),'Actual installed manual tasks drift')
    manual='Area 4 cm² and mean speed 6 cm/s give 24 cm³/s = 24 mL/s; at 7 cm/s the result is 28 mL/s. Exact clock distances for (v,t)=(0,6),(1,3),(7,3),(12,6) are 0,3,21,72 cm; derived volumes are 0,12,84,288 mL. Zero speed transports nothing. Integrated volumes are independent calculations, not asserted DOM fields.'
    assumptions='Stationary incompressible flow through equal fixed cross-sections of 4 cm². The displayed speed is the section mean; schematic tracers follow this mean and are not a resolved viscous velocity profile. Speed is held constant during each clock trial. Both directional arrows are offset in depth only for legibility; their x/y displacement, direction and common speed scale are unchanged. A periodic tracer pattern after 72 cm does not imply zero transport.'
    publishedReview=dict(ok=True,sourceSha256=SOURCE_SHA,actualBrowserCases=80,actualAssignedTasks=installed[0]['questions'],judgmentScope='Actual current original-edition readouts, 80 bounded cases and complete raster reading; no extension to unsampled states',humanApproval='NOT_RUN',publicationAction='NONE')
    row=dict(id=KEY,ok=True,sourceSha256=SOURCE_SHA,sourceVersion=sources[KEY]['version'],candidateSha256=CANDIDATE,candidateVersion=2,baseVersion=1,reviewedSignature=signature,originalEditionRetained=True,failedPublishedEdition=False,publishedEditionReview=publishedReview,calculationScope='EXACT_MANUAL_CALCULATION',manualArithmetic=manual,physicalAssumptions=assumptions,pedagogicalReview='Frozen independent mathematical primary and current instrument rubric precede this raw reading. All 160 current cases, both editions and 66 complete PNGs read; 8 fallback and 16 native historical witnesses resolved only on FE5D. Canonical eight-profile examples per edition are explicit subsets. Side projection can touch rear tracers; ray/draw-order/raster evidence establishes visible tips, not silhouette separation. Private author preview remains separate.',actualBrowserCases=160,actualAnswerSubmissions=32,visualScope=visuals['draft']['scope'],currentVisualReadIdentity=digest({'draft':visuals['draft'],'published':visuals['published']}),humanApproval='NOT_RUN',publicationAction='DRAFT')
    return dict(schemaVersion='1.0.0',records=[row],acceptedCount=1,runtimeSha256=RUNTIME,sourceCommit=SOURCE_COMMIT,archiveSha256=ARCHIVE,evidenceManifestSha256=MANIFEST,verifierSha256=sha(Path(__file__).read_bytes()),independentModelSha256=MODEL_SHA,captureGuardSha256=CAPTURE_SHA,installedExactFlowChecks=26,activityCredit=0,humanApproval='NOT_RUN',publicationAction='NONE')
