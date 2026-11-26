"""Fresh canonical source groups plus actual748 readers; failed layouts stay failed."""
from pathlib import Path
import importlib,json
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
from . import methods_renewal_748_verifier as methods
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-readers-179-748-20261127'
RUNTIME=methods.RUNTIME
PROOF_INDEX='fd80c0e3208965088b7c165cc0f32ca9ba160b1de638fdd3c506c369e81b804f'
def load(p):return json.loads(p.read_bytes())
def verify_source_dependencies(expected,root=APP):
    for name,pin in expected.items():
        if sha((Path(root)/name).read_bytes())!=pin:raise ValueError('Fresh source/math dependency changed; explicit renewal required')

def evidence(base=BASE):
    base=Path(base);index=load(base/'reader-proof-index.json')
    if sha((base/'reader-proof-index.json').read_bytes())!=PROOF_INDEX:raise ValueError('Actually reviewed reader index changed')
    for name,pin in index['files'].items():
        if sha((base/name).read_bytes())!=pin:raise ValueError('Frozen reader protocol/report changed')
    records=[]
    for cohort,count in[('catalogs',12),('C1',66),('C2',62),('C3',66),('C4',62),('C5',64),('C6',26)]:
        folder=base/('actual-catalogs-12'if cohort=='catalogs'else'actual-'+cohort+'-'+str(count));report=load(folder/'report.json');receipt=load(folder/'terminal-receipt.json')
        protocol=base/('executed-catalogs'if cohort=='catalogs'else'executed-'+cohort)/'browser-readers.mjs'
        if report['protocolSha256']!=sha(protocol.read_bytes())or report['runtimeFingerprint']['sha256']!=RUNTIME:raise ValueError('Actual runtime/protocol binding differs')
        if receipt['before']!=receipt['after']or receipt['before']!=report['runtimeFingerprint']or len(report['records'])!=count:raise ValueError('Runtime or exact case coverage changed')
        failed=any(not r['technicalOk']for r in report['records'])
        if receipt['observedExitCode']!=(1 if failed else 0)or report['errors']:raise ValueError('Terminal status does not match actual case failures')
        if report['protectedExamDenials']!=93 or report['guestDraftOriginalOrDenied']!=14 or not report['draftAssetDenials']:raise ValueError('Protected source evidence missing')
        gov=report['integration']
        if gov['publishedCount']!=991 or not gov['publishedUnchanged']or not gov['historyUnchanged']or sum(x['first']['saved']for x in gov['imports'])!=14 or any(x['repeat']['saved']for x in gov['imports']):raise ValueError('Canonical import/history evidence differs')
        for row in report['records']:
            for pin in [row[k]for k in['pngSha256','failureScreenshotSha256']if k in row]+[i['pngSha256']for i in row.get('figures',[])]:
                if sha((folder/(pin+'.png')).read_bytes())!=pin:raise ValueError('Actual reader image changed')
            records.append({**row,'reportSha256':sha((folder/'report.json').read_bytes()),'terminalSha256':sha((folder/'terminal-receipt.json').read_bytes())})
    blueprint=load(base/'reader-blueprint.json');ids={r['id']for r in blueprint['records']}
    if len(records)!=358 or len(ids)!=179 or{(r['id'],r['width'])for r in records}!={(k,w)for k in ids for w in[320,1280]}:raise ValueError('Exactly179 reader IDs at both widths required')
    return records

def report(sources,package=None,bindings=None,*,app=APP):
    if set(sources)==methods.IDS:
        result=methods.report(sources,package,bindings,app=app)
        result['dependencies'][str(Path(__file__).relative_to(APP))]=sha(Path(__file__).read_bytes())
        for row in result['records']:row['reviewDependencySha256']=digest(result['dependencies'])
        result['verifierSha256']=sha(Path(__file__).read_bytes())
        return result
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actual748 runtime required; no historical UI retag')
    wanted=set(sources);matches=[]
    for file in BASE.glob('*-math-only.json'):
        frozen=load(file)
        if {r['id']for r in frozen['selectedReaderRecords']}==wanted:matches.append(frozen)
    if len(matches)!=1:raise ValueError('Exactly one complete original canonical source group required')
    frozen=matches[0];specs=load(APP/'editorial/reviews/renewal-240-927-inventory-20261126/plan.json')['groups'];spec=next(g for g in specs if g['batchId']==frozen['batch'])
    verify_source_dependencies(frozen['dependencies'])
    module=importlib.import_module('.'+spec['verifier'],__package__);revision=spec.get('revisionPackage')
    if revision:
        if package is None or bindings is None:raise ValueError('Explicit reviewed revision package/bindings required')
        if package!=load(BASE/'canonical-package-inputs'/(revision+'.json'))or bindings!=load(BASE/'canonical-package-inputs'/(revision+'-bindings.json')):raise ValueError('Revised content differs from actually imported/read candidate')
        mathematical=module.report(sources,package,bindings)
    else:
        if package is not None or bindings is not None:raise ValueError('Unexpected revision package')
        mathematical=module.report(sources)
    if canonical(mathematical)!=canonical(frozen['mathematicalSourceReport']):raise ValueError('Fresh exact/manual review differs from executed frozen source reading')
    cases=evidence();by_id={k:[r for r in cases if r['id']==k]for k in wanted};rows=[]
    deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in[Path(__file__),Path(module.__file__),Path(__file__).with_name('pipeline.py'),Path(__file__).with_name('runtime_fingerprint.py'),BASE/'reader-proof-index.json']}
    deps={**frozen['dependencies'],**deps};dependency=digest(deps)
    for old in mathematical['records']:
        key=old['id'];actual=by_id[key];passed=len(actual)==2 and all(r['technicalOk']for r in actual);errors=list(old['errors'])
        if not passed:errors.append('Actual748 reader responsive/layout check failed; see preserved per-width evidence')
        row={**old,'ok':old['ok']and passed,'errors':errors,'sourceMathChecksOk':old['ok'],'consumerUI':'PASS_ACTUAL_BOUNDED_320_1280'if passed else'FAIL_ACTUAL_BOUNDED_READER_LAYOUT',
             'consumerObservedUiFailure':not passed,'sourceScientificFailureInferredFromUI':False,'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dependency,
             'consumerEvidence':{'scope':'Existing reader or declared private owner-only DRAFT transport; actual figures decoded/hash-checked and responsive/source text/accessibility gates. No GPU/raster-surface proof or historical1a observation inferred.',
                                 'caseCount':len(actual),'cases':[{k:r.get(k)for k in['width','variant','technicalOk','reportSha256','terminalSha256','error','formulas','violations','pngSha256','failureScreenshotSha256']}for r in actual]},
             'activityCredit':0,'registryOrLedgerAction':'NONE','humanApproval':'NOT_RUN'}
        rows.append(row)
    if len(rows)!=len(wanted)or{r['id']for r in rows}!=wanted:raise ValueError('Source group omitted or duplicated')
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime changed during fresh review')
    return{'schemaVersion':'1.0.0','batch':spec['batchId']+'-renewal-748','records':rows,'acceptedIndividualCount':sum(r['ok']for r in rows),'sourceMathOkCount':sum(r['sourceMathChecksOk']for r in rows),'runtimeSha256':RUNTIME,'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','limits':'Current reader layout failures stay FAIL. Frozen source physics/manual readings and all failed-published-edition judgments retained separately. No Root registry/ledger action.'}
