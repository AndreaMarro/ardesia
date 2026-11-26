"""Fresh16 method/catalog records with actual748 UI; historical1a/927 gates unchanged."""
from pathlib import Path
import json
from . import method_activity_verifier as physics
from .pipeline import sha,digest
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-readers-179-748-20261127'
WORKSHEETS=APP/'editorial/reviews/independent-method-css-748-20261126'
RUNTIME='748b31decc821162f9631e619747cf8d273202b35ebe9ca993e7e0b2a0e2ebc4'
CATALOG_REPORT='6ad7a3e9e34b6e0d696e7b671c55c9e26788b4d0e79c70d6f9b4e1a77467cbb2'
CATALOG_TERMINAL='7175cd81047b1f3bc429ed74b789d306a9146024d3b0cf960196477761cbbf9c'
WORKSHEET_REPORT='fdcc99dd48670464ec06c3fbc103b8dd3d41513e9c66f39d15235bde2c35a6e3'
WORKSHEET_TERMINAL='1a7f8cbbd0802f49de21834f131984509007cb5dfb080353025a2a1d7ca8ed69'
CATALOGS={'C'+str(i)for i in range(1,7)}
IDS=set(physics.REVIEWED_SOURCES)
def load(p):return json.loads(p.read_bytes())

def evidence(base=BASE,worksheets=WORKSHEETS):
    folder=Path(base)/'actual-catalogs-12';work=Path(worksheets)/'actual-ui-20'
    for file,pin in[(folder/'report.json',CATALOG_REPORT),(folder/'terminal-receipt.json',CATALOG_TERMINAL),(work/'report.json',WORKSHEET_REPORT),(work/'terminal-receipt.json',WORKSHEET_TERMINAL)]:
        if sha(file.read_bytes())!=pin:raise ValueError('Actually reviewed UI evidence changed')
    catalog=load(folder/'report.json');sheet=load(work/'report.json')
    for report,root,protocol in[(catalog,folder,Path(base)/'executed-catalogs/browser-readers.mjs'),(sheet,work,Path(worksheets)/'browser-worksheets-peer.mjs')]:
        receipt=load(root/'terminal-receipt.json')
        if receipt['observedExitCode']!=0 or receipt['error']is not None or receipt['before']!=receipt['after']or receipt['before']['sha256']!=RUNTIME:raise ValueError('Actual new-epoch terminal proof incomplete')
        if report['runtimeFingerprint']!=receipt['before']or report['finalRuntimeFingerprint']!=receipt['after']or report['protocolSha256']!=sha(protocol.read_bytes()):raise ValueError('Executed runtime/protocol differs')
        if any(not r['technicalOk']for r in report['records'])or report['errors']:raise ValueError('Observed UI failed')
        for row in report['records']:
            names=[row[k]for k in['pngSha256','screenshotSha256','staticMathScreenshotSha256','expressionScreenshotSha256']if k in row]+list(row.get('diagramStageScreenshots',{}).values())
            for pin in names:
                if sha((root/(pin+'.png')).read_bytes())!=pin:raise ValueError('Actually observed image changed')
    if len(catalog['records'])!=12 or{(r['id'],r['width'])for r in catalog['records']}!={(k,w)for k in CATALOGS for w in[320,1280]}:raise ValueError('Catalog cases omitted or duplicated')
    if catalog['protectedExamDenials']!=93 or catalog['guestDraftOriginalOrDenied']!=14 or not catalog['draftAssetDenials']:raise ValueError('Default-deny evidence missing')
    integration=catalog['integration']
    if integration['publishedCount']!=991 or not integration['publishedUnchanged']or not integration['historyUnchanged']or sum(x['first']['saved']for x in integration['imports'])!=14 or any(x['repeat']['saved']for x in integration['imports']):raise ValueError('Canonical import/governance evidence differs')
    methods=IDS-CATALOGS
    if len(sheet['records'])!=20 or{(r['id'],r['width'])for r in sheet['records']}!={(k,w)for k in methods for w in[320,1280]}or sum(len(r['steps'])for r in sheet['records'])!=98:raise ValueError('Exact worksheet sequence coverage required')
    for row in sheet['records']:
        if not(row['sequenceComplete']and row['switchSheetProgressPreserved']and row['resetToFirstStep'])or row.get('layoutFailures')or row['axe']:raise ValueError('Worksheet flow/layout/accessibility evidence failed')
        if len(row['staticFormulaLayout'])!=5 or any(not f['ok']or f['scrollWidth']>f['clientWidth']+1 for f in row['staticFormulaLayout']):raise ValueError('Static formula width failure')
        if any(s['activeAxe']or not s['accepted'].startswith('Corretto. ')or not s['rejected'].startswith('Riprova. ')or any(not f['ok']for f in s['dynamicMath'])for s in row['steps']):raise ValueError('Per-step response or formula failure')
    return catalog,sheet

def report(sources,package=None,bindings=None,*,app=APP):
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actual748 runtime required; no historical UI retag')
    if set(sources)!=IDS:raise ValueError('Exactly16 unique catalog/method sources required')
    catalog,sheet=evidence();mathematical=physics.report(sources)
    if len(mathematical['records'])!=16 or{r['id']for r in mathematical['records']}!=IDS or any(not r['ok']for r in mathematical['records']):raise ValueError('Fresh exact/manual source review failed')
    deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in[Path(__file__),Path(physics.__file__),Path(__file__).with_name('pipeline.py'),Path(__file__).with_name('runtime_fingerprint.py'),BASE/'executed-catalogs/browser-readers.mjs',WORKSHEETS/'browser-worksheets-peer.mjs']};dep=digest(deps)
    rows=[]
    for original in mathematical['records']:
        key=original['id'];proof=catalog if key in CATALOGS else sheet;cases=[r for r in proof['records']if r['id']==key]
        row={**original,'sourceVersion':1,'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dep,
             'consumerUI':'PASS_ACTUAL_BOUNDED_320_1280','consumerEvidence':{'reportSha256':CATALOG_REPORT if key in CATALOGS else WORKSHEET_REPORT,'terminalSha256':CATALOG_TERMINAL if key in CATALOGS else WORKSHEET_TERMINAL,'actualCaseCount':len(cases),'scope':'Actual title/summary/navigation only; linked materials reviewed separately'if key in CATALOGS else'Actual worksheet full independent inputs, wrong/correct feedback, progress/reset, static/dynamic formulas and axe'},
             'verificationMode':'INDEPENDENT_EXISTING_EDITION','activityCredit':0,'registryOrLedgerAction':'NONE','humanApproval':'NOT_RUN','publicationAction':'NONE'}
        rows.append(row)
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime changed during fresh review')
    return{'schemaVersion':'1.0.0','batch':'methods-activities-001-renewal-748','records':rows,'acceptedIndividualCount':16,'runtimeSha256':RUNTIME,'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','limits':'Fresh source math plus bounded actual16 UI. No linked-activity certification, Root registry/ledger closure or publication.'}
