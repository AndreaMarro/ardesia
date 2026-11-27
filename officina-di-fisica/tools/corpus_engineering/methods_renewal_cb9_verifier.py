"""Fresh16 method/catalog records with actualcb9 UI; historical1a/927 gates unchanged."""
from pathlib import Path
import json
from . import method_activity_verifier as physics
from .pipeline import sha,digest
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-readers-179-cb9-20261127'
WORKSHEETS=APP/'editorial/reviews/renewal-method-worksheets-cb9-20261127'
RUNTIME='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
CATALOG_REPORT='541ffcf3484bc4cb0c98f1e217289495db31e7bf33afe5c51459618959f051f0'
CATALOG_TERMINAL='b35928b9ac97d3c3796b57782bb1eeba302c73dfa68bdbe105ecda06f2dc0cae'
WORKSHEET_REPORT='2b5647faaa6eb7bc1485293012e82fa2a9722221cc59ecbab7501115e48667a5'
WORKSHEET_TERMINAL='843db3c511490d5d156453010eb2e544cea3b9d894069f9aaeaf782a11d92029'
CATALOGS={'C'+str(i)for i in range(1,7)}
IDS=set(physics.REVIEWED_SOURCES)
def load(p):return json.loads(p.read_bytes())

AUTHOR=BASE/'verified-author-source'
AUTHOR_MANIFEST=AUTHOR/'full-reader-cb9-author-handoff.json'
AUTHOR_MANIFEST_SHA='7bf9688b33442df99009fcee75538afbda5844def74f7b2234ae698bc7c6ce4e'
AUTHOR_ADOPTION_SHA='4f7cd74308d0854188ee0e47bd6693631af5a2591d2f2a0c44219d55d11039c1'
AUTHOR_REF='585a8f8b1afa99de4e1fd67a1909c215b3e0d46a'

def author_cohort(cohort,base=BASE):
    base=Path(base);author=base/'verified-author-source';handoff=author/'full-reader-cb9-author-handoff.json';adoption=base/'author-input-adoption.json'
    if sha(handoff.read_bytes())!=AUTHOR_MANIFEST_SHA or sha(adoption.read_bytes())!=AUTHOR_ADOPTION_SHA:raise ValueError('Immutable author replay commitment changed')
    manifest=load(handoff);inputs=load(adoption)
    if inputs['immutableCommit']!=AUTHOR_REF or manifest['sourceCommit']!='cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc' or manifest['runtimeSha256']!=RUNTIME or manifest['cases']!=358 or manifest['passed']!=358 or manifest['activitiesExamined']!=179:raise ValueError('Author replay epoch or coverage differs')
    expectedCounts={'catalogs':12,'C1':66,'C2':62,'C3':66,'C4':62,'C5':64,'C6':26}
    if cohort not in expectedCounts:raise ValueError('Unknown actual cohort')
    def checked(relative):
        file=author/relative;pin=inputs['files'].get(relative)
        if not pin or file.is_symlink() or sha(file.read_bytes())!=pin['sha256'] or file.stat().st_size!=pin['bytes']:raise ValueError('Verified author file changed: '+relative)
        return file
    for relative in inputs['files']:
        if relative.startswith('fixture-cb9/'):checked(relative)
    root=author/'full-reader-replay-cb9'/cohort
    terminal=checked('full-reader-replay-cb9/cohort-results.json');terminals=load(terminal)
    if len(terminals)!=7 or {x['cohort']for x in terminals}!=set(expectedCounts):raise ValueError('Author terminal cohort omitted/duplicated')
    observed=next(x for x in terminals if x['cohort']==cohort)
    if observed['exitCode']!=0 or observed['cases']!=expectedCounts[cohort] or observed['pass']!=observed['cases']or observed['runtime']!=RUNTIME:raise ValueError('Author-recorded terminal is not complete0')
    recorded=next(x for x in manifest['cohorts']if x['cohort']==cohort)
    reportFile=checked('full-reader-replay-cb9/'+cohort+'/report.json');report=load(reportFile)
    if sha(reportFile.read_bytes())!=recorded['reportSha256']:raise ValueError('Author report not immutable handoff bytes')
    process=checked('full-reader-replay-cb9/'+cohort+'-process.txt')
    if sha(process.read_bytes())!=recorded['actualProcessSha256']:raise ValueError('Author stdout differs')
    protocol=checked('fixture-cb9/browser-readers.mjs');blueprint=checked('fixture-cb9/reader-blueprint.json');rows=load(blueprint)['records']
    ids={r['id']for r in rows if (cohort=='catalogs'and not r['effectiveRecord'].get('kind'))or(cohort!='catalogs'and r['effectiveRecord'].get('course')==cohort)}
    if (report['sourceCommit']!=manifest['sourceCommit']or report['runtimeFingerprint']['sha256']!=RUNTIME or report['finalRuntimeFingerprint']!=report['runtimeFingerprint']or report['protocolSha256']!=sha(protocol.read_bytes())or report['blueprintSha256']!=sha(blueprint.read_bytes())or report['errors']or report['status']!='BOUNDED_ACTUAL_UI_COMPLETE_REQUIRES_INDEPENDENT_PER_ID_REVIEW'):raise ValueError('Actual reader protocol/runtime/status differs')
    if len(report['records'])!=expectedCounts[cohort]or len(report['expectedIds'])!=len(ids)or set(report['expectedIds'])!=ids or {(r['id'],r['width'])for r in report['records']}!={(k,w)for k in ids for w in[320,1280]}:raise ValueError('Actual cohort ID/viewport omitted/duplicated')
    if report['protectedExamDenials']!=93 or report['guestDraftOriginalOrDenied']!=14 or report['draftAssetDenials']!=16:raise ValueError('Protected-source evidence missing')
    gov=report['integration']
    if gov['publishedCount']!=991 or not gov['publishedUnchanged']or not gov['historyUnchanged']or sum(x['first']['saved']for x in gov['imports'])!=14 or any(x['repeat']['saved']for x in gov['imports']):raise ValueError('Import/history proof differs')
    for row in report['records']:
        expected=next(r for r in rows if r['id']==row['id']);record=expected['effectiveRecord'];blocks=record.get('promptBlocks',[])+record.get('blocks',[])
        if not row['technicalOk']or row['variant']!=expected['variant']or row['sourceSha256']!=expected['source']['sourceSha256']or row['effectiveVersion']!=expected['effectiveVersion']or row['violations']or row['documentWidth']>row['width']+1:raise ValueError('Observed current case differs or failed')
        if len(row['formulas'])<sum(b.get('type')=='formula'for b in blocks)or any(not(f['typeset']>0 and f['scroll']<=f['width']+1 and f['typeset']<=f['width']+1)for f in row['formulas']):raise ValueError('Observed reader formula failure/omission')
        if len(row['figures'])<sum(b.get('type')=='figure'for b in blocks):raise ValueError('Observed reader figure omitted')
        for pin in [row['pngSha256']]+[x['pngSha256']for x in row['figures']]:
            image=checked('full-reader-replay-cb9/'+cohort+'/'+pin+'.png')
            if sha(image.read_bytes())!=pin:raise ValueError('Observed PNG bytes drift')
    return report,root,sha(terminal.read_bytes())

def evidence(base=BASE,worksheets=WORKSHEETS):
    catalog,folder,catalogTerminal=author_cohort('catalogs',base);work=Path(worksheets)/'actual-ui-20'
    if sha((folder/'report.json').read_bytes())!=CATALOG_REPORT or catalogTerminal!=CATALOG_TERMINAL or sha((work/'report.json').read_bytes())!=WORKSHEET_REPORT or sha((work/'terminal-receipt.json').read_bytes())!=WORKSHEET_TERMINAL:raise ValueError('Actually reviewed current evidence changed')
    sheet=load(work/'report.json');receipt=load(work/'terminal-receipt.json')
    if receipt['observedExitCode']!=0 or receipt['error']is not None or receipt['before']!=receipt['after']or receipt['before']['sha256']!=RUNTIME:raise ValueError('Actual worksheet terminal proof incomplete')
    if sheet['runtimeFingerprint']!=receipt['before']or sheet['finalRuntimeFingerprint']!=receipt['after']or sheet['protocolSha256']!=sha((Path(worksheets)/'browser-worksheets-peer.mjs').read_bytes())or sheet['errors']or any(not r['technicalOk']for r in sheet['records']):raise ValueError('Worksheet executed runtime/protocol/outcome differs')
    for row in sheet['records']:
        names=[row[k]for k in ['pngSha256','screenshotSha256','staticMathScreenshotSha256','expressionScreenshotSha256']if k in row]+list(row.get('diagramStageScreenshots',{}).values())
        for pin in names:
            if sha((work/(pin+'.png')).read_bytes())!=pin:raise ValueError('Actual worksheet PNG changed')
    methods=IDS-CATALOGS
    if len(sheet['records'])!=20 or{(r['id'],r['width'])for r in sheet['records']}!={(k,w)for k in methods for w in[320,1280]}or sum(len(r['steps'])for r in sheet['records'])!=98:raise ValueError('Exact worksheet sequence coverage required')
    for row in sheet['records']:
        if not(row['sequenceComplete']and row['switchSheetProgressPreserved']and row['resetToFirstStep'])or row.get('layoutFailures')or row['axe']:raise ValueError('Worksheet flow/layout/accessibility evidence failed')
        if len(row['staticFormulaLayout'])!=5 or any(not f['ok']or f['scrollWidth']>f['clientWidth']+1 for f in row['staticFormulaLayout']):raise ValueError('Static formula width failure')
        if any(s['activeAxe']or not s['accepted'].startswith('Corretto. ')or not s['rejected'].startswith('Riprova. ')or any(not f['ok']for f in s['dynamicMath'])for s in row['steps']):raise ValueError('Per-step response or formula failure')
    return catalog,sheet

def report(sources,package=None,bindings=None,*,app=APP):
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actualcb9 runtime required; no historical UI retag')
    if set(sources)!=IDS:raise ValueError('Exactly16 unique catalog/method sources required')
    catalog,sheet=evidence();mathematical=physics.report(sources)
    if len(mathematical['records'])!=16 or{r['id']for r in mathematical['records']}!=IDS or any(not r['ok']for r in mathematical['records']):raise ValueError('Fresh exact/manual source review failed')
    deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in[Path(__file__),Path(physics.__file__),Path(__file__).with_name('pipeline.py'),Path(__file__).with_name('runtime_fingerprint.py'),AUTHOR/'fixture-cb9/browser-readers.mjs',WORKSHEETS/'browser-worksheets-peer.mjs']};dep=digest(deps)
    for p in [BASE/'author-input-adoption.json',AUTHOR_MANIFEST,AUTHOR/'full-reader-replay-cb9/cohort-results.json']:
        deps[str(p.relative_to(APP))]=sha(p.read_bytes())
    dep=digest(deps)
    rows=[]
    for original in mathematical['records']:
        key=original['id'];proof=catalog if key in CATALOGS else sheet;cases=[r for r in proof['records']if r['id']==key]
        row={**original,'sourceVersion':1,'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dep,
             'consumerUI':'PASS_ACTUAL_BOUNDED_320_1280','consumerEvidence':{'reportSha256':CATALOG_REPORT if key in CATALOGS else WORKSHEET_REPORT,'terminalSha256':CATALOG_TERMINAL if key in CATALOGS else WORKSHEET_TERMINAL,'terminalObservationSource':'AUTHOR_RECORDED_COHORT_EXIT_CODE_IN_IMMUTABLE585A8F8B'if key in CATALOGS else'INDEPENDENT_ACTUAL_TERMINAL_RECEIPT','actualCaseCount':len(cases),'scope':'Actual title/summary/navigation only; linked materials reviewed separately'if key in CATALOGS else'Actual worksheet full independent inputs, wrong/correct feedback, progress/reset, static/dynamic formulas and axe'},
             'verificationMode':'INDEPENDENT_EXISTING_EDITION','activityCredit':0,'registryOrLedgerAction':'NONE','humanApproval':'NOT_RUN','publicationAction':'NONE'}
        rows.append(row)
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime changed during fresh review')
    return{'schemaVersion':'1.0.0','batch':'methods-activities-001-renewal-cb9','records':rows,'acceptedIndividualCount':16,'runtimeSha256':RUNTIME,'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','limits':'Fresh source math plus bounded actual16 UI. No linked-activity certification, Root registry/ledger closure or publication.'}
