"""Fresh bounded per-ID renewal, reusing old exact models, never their old UI approval.

The author of the current00701 label repair is recused from that ID. Existing
family verify/report pins remain1a and intentionally reject this new epoch.
This module is evidence for five IDs, not a full-family or registry closure.
"""
from pathlib import Path
import importlib,json,types
from .pipeline import digest,sha
from .runtime_fingerprint import runtime_fingerprint
from .review_contract import reviewed_rows
from .experiment_visibility_request import verify_report
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c1-five-closures-95769-renewal-20261126'
RUNTIME='95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d'
PROOF='9231bd1c86d42aa2d37bd152781dc0acdec37f82190161b3a84a9c1b86ca13d3'
GEOMETRY='565c40e5d7896692913ce223f119e29aa2ce441dc0ce831bfae05dcf9817461f'
IMAGES='a6e3acddca88865142716bb3f50c98e441e4bc135d05c441fb697dd0b56f05d5'
CONVEX='809c9087f7b3e531d3bf38542baeec84cb9bd7f405ff024ff041b3125ffd00e9'
EXCLUDED='SIM-C1-L007-01'
FAMILIES={
 'experiments_accelerated_activity_verifier':['SIM-C1-L004-02','SIM-C1-L004-04'],
 'experiments_forces_revision_verifier':['SIM-C1-L005-05'],
 'experiments_force_work_corrected_048_verifier':['SIM-C1-L006-02'],
 'experiments_energy_momentum_corrected_049_verifier':['SIM-C1-L008-03']}
IDS=set(sum(FAMILIES.values(),[]))
def load(p):return json.loads(p.read_bytes())
def bind(fn,app,specs):
    # New function object binds only actual execution path/explicit ID scope.
    # Old module globals, old verify/report functions and old pins are untouched.
    return types.FunctionType(fn.__code__,{**fn.__globals__,'APP':app,'SPECS':specs},fn.__name__,fn.__defaults__,fn.__closure__)
def evidence():
    out=BASE/'actual-ui-576';report=load(out/'report.json');plan=load(out/'prepared.json')
    if sha((out/'report.json').read_bytes())!=PROOF or sha((out/'geometry-observations.json').read_bytes())!=GEOMETRY or sha((BASE/'images-read.json').read_bytes())!=IMAGES:raise ValueError('Actually read evidence drift')
    if {r['id']for r in plan['records']}!=IDS or any(r['id']==EXCLUDED for r in plan['records'])or len(plan['records'])!=6:raise ValueError('Exact independent five-ID coverage required')
    if report['runtimeFingerprint']['sha256']!=RUNTIME or len(report['cases'])!=576 or load(out/'terminal-receipt.json')['observedExitCode']!=0:raise ValueError('Actual new runtime proof incomplete')
    if sha((out/'prepared.json').read_bytes())!=report['preparedSha256']:raise ValueError('Executed prepared bytes changed')
    if sha((BASE/'review-request.json').read_bytes())!=plan['requestSha256']:raise ValueError('Frozen reviewer request changed')
    if sha((out/'terminal-receipt.json').read_bytes())!='46bdbd8c757459edcd9d62ebacf4d774304c13450102768c82c44c0775abdafa':raise ValueError('Observed terminal receipt changed')
    verify_report(out,plan,sha((BASE/'collector-c1-derived.mjs').read_bytes()))
    helper=sha((BASE/'numerical-observation.mjs').read_bytes())
    if plan['numericalHelperSha256']!=helper:raise ValueError('Numerical witness helper changed')
    if sha((BASE/'complete-convex-certificates.json').read_bytes())!=CONVEX:raise ValueError('Complete convex source-mesh proof changed')
    complete=load(BASE/'complete-convex-certificates.json')
    if len(complete['parts'])!=1332 or complete['unresolved']or not all(p['tableAndFeetWholeMeshSeparated']and all(c['wholeConvexMeshAndAllForwardRaysSeparated']for c in p['certificates'])for p in complete['parts']):raise ValueError('Incomplete whole-mesh/viewer-ray separation')
    geometry=load(out/'geometry-observations.json')
    if len(geometry['cases'])!=528 or geometry['observationsRequiringReview']:raise ValueError('Unreviewed geometry observation')
    for item in report['cases']:
        c=load(out/item['file'])
        if c['reviewDependencySha256']!=helper:raise ValueError('Per-case helper provenance differs')
    return report

def report(sources,package=None,bindings=None,*,app=APP):
    app=Path(app);profile=runtime_fingerprint(app)
    if profile['sha256']!=RUNTIME:raise ValueError('Fresh actual95769 runtime required; no1a retag')
    proof=evidence();raw=(app/'content/esperienze-C1.json').read_bytes()
    if sha(raw)!='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3':raise ValueError('Immutable original C1 file changed')
    full={r['id']:r for r in json.loads(raw)}
    if not IDS<=set(sources)or any(sources[k]!=full[k]for k in IDS):raise ValueError('Unreviewed selected source')
    package=package or load(app/'editorial/batches/experiment-normal-revision-140.json')
    bindings=bindings or load(app/'editorial/batches/experiment-normal-revision-140-bindings.json')
    records=[];raw_results={};dependencies={Path(__file__).name:sha(Path(__file__).read_bytes())}
    for name,selected in FAMILIES.items():
        m=importlib.import_module('.'+name,__package__);dependencies[name+'.py']=sha(Path(m.__file__).read_bytes())
        specs={k:v for k,v in m.SPECS.items()if k!=EXCLUDED};effective={k:full[k]for k in specs};draft=None
        if name=='experiments_forces_revision_verifier':
            draft=reviewed_rows(package,bindings,m.REVIEWED_REVISIONS,{'SIM-C1-L005-05'},app/'editorial/assets')[0]
            row,binding,signature,assets,errors=draft
            if errors or binding['sourceRef']!=m.SOURCE_REF or binding['sourceSha256']!=digest(full[row['id']])or row['version']!=2 or row['baseVersion']!=1:raise ValueError('Unreviewed normal DRAFT')
            effective[row['id']]=row
        actual=bind(m.runtime_values,app,specs)(effective)
        if EXCLUDED in actual:raise ValueError('Authored ID must never be judged by this reviewer')
        summaries=bind(m.compare_runtime,app,specs)(actual);math=m.independent_checks();extras=bind(m.corrected_scene_checks,app,specs)(actual)if hasattr(m,'corrected_scene_checks')else m.force_diagram_checks(actual)if hasattr(m,'force_diagram_checks')else{}
        raw_results[name]={'actual':actual,'selectedIndependentChecks':{k:math[k]for k in selected},'selectedComparisons':{k:summaries[k]for k in selected}}
        for key in selected:
            if digest(full[key])!=m.READ_SOURCE_SHA256[key]:raise ValueError('Previously read source rebound')
            checks=math[key]+extras.get(key,[]);summary=summaries[key];errors=[]
            if not checks or not all(c['ok']for c in checks):errors.append('Fresh independent exact physics/geometry checks failed')
            if not summary['ok']:errors+=summary['errors']
            cases=[c for c in proof['cases']if c['caseKey'].startswith(key+'|')]
            result={'id':key,'sourceSha256':digest(full[key]),'sourceVersion':1,'sourceRef':m.SOURCE_REF,'sourcePath':m.SOURCE_PATH,'sourceFileSha256':m.SOURCE_FILE_SHA256,'ok':not errors,'errors':errors,'checks':checks,'runtimeComparison':summary,'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':m.MANUAL[key],'manualFeasibility':'PASS_AI_EXACT_ASSIGNED_TASKS'if not errors else'FAIL','physicalAssumptions':m.ASSUMPTIONS[key],'pedagogicalReview':m.PEDAGOGY[key],'runtimeProfileSha256':RUNTIME,'reviewedRuntimeProfileSha256':RUNTIME,'consumerEvidence':{'proofSha256':PROOF,'actualObservedCaseCountForId':len(cases),'geometrySha256':GEOMETRY,'completeConvexCertificatesSha256':CONVEX,'imagesReadSha256':IMAGES,'scientificApproval':False,'scope':'Fresh bounded matrix, exact complete-convex32facet mesh/viewer-ray separation and ten critical PNGs read; no arbitrary-camera/rasterization guarantee'},'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0,'wholeFamilyAcceptance':False,'registryOrLedgerAction':'NONE'}
            if draft and key=='SIM-C1-L005-05':
                row,binding,signature,assets,_=draft
                result.update(candidateSha256=digest(row),candidateVersion=2,baseVersion=1,reviewedSignature=signature,assetChecksums=assets,failedPublishedEdition=True,publicationAction='DRAFT',publishedEditionReview={'id':key,'sourceSha256':digest(full[key]),'ok':False,'errors':[m.SOURCE_ISSUES[key]],'manualArithmetic':'Original40degree Number-only task remains unsupported; exact symbolic expression is not accepted by Number input. Corrected DRAFT assigns60/0 only.','humanApproval':'NOT_RUN','publicationAction':'NONE'})
            records.append(result)
    for name in ['pipeline.py','runtime_fingerprint.py','review_contract.py','experiments_revision_review.py','experiment_visibility_request.py']:
        dependencies[name]=sha(Path(__file__).with_name(name).read_bytes())
    dependencies['numerical-observation.mjs']=sha((BASE/'numerical-observation.mjs').read_bytes());dependencies['certify-convex-glyphs.py']=sha((BASE/'certify-convex-glyphs.py').read_bytes());dep=digest(dependencies)
    for row in records:row['reviewDependencySha256']=dep
    if runtime_fingerprint(app)!=profile:raise ValueError('Runtime drift during fresh mathematical/engine replay')
    return {'schemaVersion':'1.0.0','batch':'independent-five-c1-closure-renewal-95769','records':records,'acceptedIndividualCount':sum(r['ok']for r in records),'runtimeSha256':RUNTIME,'verifierSha256':sha(Path(__file__).read_bytes()),'dependencies':dependencies,'excludedAuthorId':EXCLUDED,'rawFreshEngineResults':raw_results,'limits':'Five individual proofs only. Existing full-family1a gates and all historical reports remain unchanged. No Root ledger closure or registered completion credit.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
