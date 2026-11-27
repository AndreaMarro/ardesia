"""Fresh canonical source groups plus actualcb9 readers; failed layouts stay failed."""
from pathlib import Path
import importlib,json
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
from . import methods_renewal_cb9_verifier as methods
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-readers-179-cb9-20261127'
RUNTIME=methods.RUNTIME
PROOF_INDEX='fcfd293c3ad07b08e508c920397a1e60615679eaba7ff3c4b046fb787d215085'
def load(p):return json.loads(p.read_bytes())
def verify_source_dependencies(expected,root=APP):
    for name,pin in expected.items():
        if sha((Path(root)/name).read_bytes())!=pin:raise ValueError('Fresh source/math dependency changed; explicit renewal required')

def evidence(base=BASE):
    base=Path(base);index=load(base/'reader-proof-index.json')
    if sha((base/'reader-proof-index.json').read_bytes())!=PROOF_INDEX:raise ValueError('Actually reviewed reader index changed')
    for name,pin in index['files'].items():
        if sha((base/name).read_bytes())!=pin:raise ValueError('Frozen author reader bytes changed')
    records=[]
    for cohort in ['catalogs','C1','C2','C3','C4','C5','C6']:
        report,folder,terminal=methods.author_cohort(cohort,base)
        for row in report['records']:
            records.append({**row,'reportSha256':sha((folder/'report.json').read_bytes()),'terminalSha256':terminal,'terminalObservationSource':'AUTHOR_RECORDED_COHORT_EXIT_CODE_IN_IMMUTABLE585A8F8B'})
    blueprint=load(base/'reader-blueprint.json');ids={r['id']for r in blueprint['records']}
    if len(records)!=358 or len(ids)!=179 or {(r['id'],r['width'])for r in records}!={(k,w)for k in ids for w in[320,1280]}:raise ValueError('Exactly179 reader IDs at both widths required')
    return records

def report(sources,package=None,bindings=None,*,app=APP):
    if set(sources)==methods.IDS:
        result=methods.report(sources,package,bindings,app=app)
        result['dependencies'][str(Path(__file__).relative_to(APP))]=sha(Path(__file__).read_bytes())
        for row in result['records']:row['reviewDependencySha256']=digest(result['dependencies'])
        result['verifierSha256']=sha(Path(__file__).read_bytes())
        return result
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actualcb9 runtime required; no historical UI retag')
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
    deps[str(Path(methods.__file__).relative_to(APP))]=sha(Path(methods.__file__).read_bytes())
    deps={**frozen['dependencies'],**deps};dependency=digest(deps)
    for old in mathematical['records']:
        key=old['id'];actual=by_id[key];passed=len(actual)==2 and all(r['technicalOk']for r in actual);errors=list(old['errors'])
        if not passed:errors.append('Actualcb9 reader responsive/layout check failed; see preserved per-width evidence')
        row={**old,'ok':old['ok']and passed,'errors':errors,'sourceMathChecksOk':old['ok'],'consumerUI':'PASS_ACTUAL_BOUNDED_320_1280'if passed else'FAIL_ACTUAL_BOUNDED_READER_LAYOUT',
             'consumerObservedUiFailure':not passed,'sourceScientificFailureInferredFromUI':False,'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dependency,
             'consumerEvidence':{'scope':'Existing reader or declared private owner-only DRAFT transport; actual figures decoded/hash-checked and responsive/source text/accessibility gates. No GPU/raster-surface proof or historical1a observation inferred.',
                                 'independentVisualReviewSha256':sha((BASE/'reader-images-read.json').read_bytes()),'caseCount':len(actual),'cases':[{k:r.get(k)for k in['width','variant','technicalOk','reportSha256','terminalSha256','terminalObservationSource','error','formulas','violations','pngSha256','failureScreenshotSha256']}for r in actual]},
             'activityCredit':0,'registryOrLedgerAction':'NONE','humanApproval':'NOT_RUN'}
        rows.append(row)
    if len(rows)!=len(wanted)or{r['id']for r in rows}!=wanted:raise ValueError('Source group omitted or duplicated')
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime changed during fresh review')
    return{'schemaVersion':'1.0.0','batch':spec['batchId']+'-renewal-cb9','records':rows,'acceptedIndividualCount':sum(r['ok']for r in rows),'sourceMathOkCount':sum(r['sourceMathChecksOk']for r in rows),'runtimeSha256':RUNTIME,'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','limits':'Current reader layout failures stay FAIL. Frozen source physics/manual readings and all failed-published-edition judgments retained separately. No Root registry/ledger action.'}
