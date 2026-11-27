"""Fresh bounded per-ID renewal, reusing old exact models, never their old UI approval.

The author of the six native-vector apparatus corrections is recused from allsix IDs. Existing
family verify/report pins remain1a and intentionally reject this new epoch.
This module is evidence for five IDs, not a full-family or registry closure.
"""
from pathlib import Path
import importlib,importlib.util,importlib.machinery,json,types,zipfile,sys
from fractions import Fraction
from .pipeline import digest,sha
from .runtime_fingerprint import runtime_fingerprint
from .review_contract import reviewed_rows
from .experiment_visibility_request import verify_report
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c1-five-closures-cb9-renewal-20261127'
RUNTIME='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
PROOF='e35b17770e78b4e74cfe7572cc2856b83d068eeb21351e5d41bcd7b7dd8a2de6'
GEOMETRY='565c40e5d7896692913ce223f119e29aa2ce441dc0ce831bfae05dcf9817461f'
IMAGES='f86e8700bf72c4972b8b98cb820828cb634c63b47db97d412308a076de490dc8'
CONVEX='809c9087f7b3e531d3bf38542baeec84cb9bd7f405ff024ff041b3125ffd00e9'
EXCLUDED='SIM-C1-L007-01'
EXCLUDED_IDS={'SIM-C1-L001-06','SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04',EXCLUDED}
MESH_SUPPORTS='f14f5dd11573bf58f166255daf3439158ca8b106fe3bcb2eabca3cda0b5fc5e7'
MESH_ARCHIVE='1a6003b811ff3a2143caab1d381c493b21556da37e2dfc57311f87b5d94ed4da'
RECONSTRUCTION_GUARD='35c361be311e4f16548842d9d0e848cd50f9bd3d4970a09d59143399ad2e8ae3'
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
    if {r['id']for r in plan['records']}!=IDS or any(r['id']in EXCLUDED_IDS for r in plan['records'])or len(plan['records'])!=6:raise ValueError('Exact independent five-ID coverage required')
    if report['runtimeFingerprint']['sha256']!=RUNTIME or len(report['cases'])!=576 or load(out/'terminal-receipt.json')['observedExitCode']!=0:raise ValueError('Actual new runtime proof incomplete')
    if sha((out/'prepared.json').read_bytes())!=report['preparedSha256']:raise ValueError('Executed prepared bytes changed')
    if sha((BASE/'review-request.json').read_bytes())!=plan['requestSha256']:raise ValueError('Frozen reviewer request changed')
    if sha((out/'terminal-receipt.json').read_bytes())!='df2eef737a80e1eafdfa678104bb0ed61dda31d14b3c0036748bc1a7ee5e0d8c':raise ValueError('Observed terminal receipt changed')
    if load(out/'terminal-receipt.json')['supervisorSha256']!=sha((BASE/'run-five.py').read_bytes()):raise ValueError('Executed supervisor bytes changed')
    verify_report(out,plan,sha((BASE/'collector-c1-derived.mjs').read_bytes()))
    helper=sha((BASE/'numerical-observation.mjs').read_bytes())
    if plan['numericalHelperSha256']!=helper:raise ValueError('Numerical witness helper changed')
    if sha((BASE/'complete-convex-certificates.json').read_bytes())!=CONVEX:raise ValueError('Complete convex source-mesh proof changed')
    complete=load(BASE/'complete-convex-certificates.json')
    if len(complete['parts'])!=1332 or complete['unresolved']or not all(p['tableAndFeetWholeMeshSeparated']and all(c['wholeConvexMeshAndAllForwardRaysSeparated']for c in p['certificates'])for p in complete['parts']):raise ValueError('Incomplete whole-mesh/viewer-ray separation')
    if sha((BASE/'actual-mesh-supports.json').read_bytes())!=MESH_SUPPORTS or sha((BASE/'actual-float32-meshes.zip').read_bytes())!=MESH_ARCHIVE or sha((BASE/'guarded-reconstruction-repeat.json').read_bytes())!=RECONSTRUCTION_GUARD:raise ValueError('Fresh actual Float32 source mesh evidence changed')
    receipt=load(BASE/'reconstruction-receipt.json');guard=load(BASE/'guarded-reconstruction-repeat.json');supports=load(BASE/'actual-mesh-supports.json')
    if receipt['sourceRuntime']!=RUNTIME or guard['before']!=report['runtimeFingerprint']or guard['after']!=guard['before']or guard['actualExitCode']!=0 or not guard['outputIdentical']:raise ValueError('Actual mesh reconstruction not bound to current runtime')
    with zipfile.ZipFile(BASE/'actual-float32-meshes.zip')as archive:
        if archive.namelist()!=['actual-float32-meshes.jsonl']or sha(archive.read('actual-float32-meshes.jsonl'))!=receipt['nativeMeshJsonlSha256']:raise ValueError('Raw actual mesh archive drift')
    if supports['sourceRuntimeSha256']!=RUNTIME or supports['sourceMeshPartCount']!=1332 or supports['physicalSupportComparisonCount']!=8040 or supports['actualBaseSupportComparisonCount']!=6660 or supports['unresolved']:raise ValueError('Actual source whole-mesh supports incomplete')
    for p in supports['parts']:
        if p['sourcePositionBufferType']!='Float32Array' or not all(c['ok']and Fraction(c['strictExactSupportGap'])>0 and Fraction(c['exactViewerDot'])>=0 for c in p['physicalMeshSupportChecks'])or not all(c['ok']and Fraction(c['strictExactGap'])>0 for c in p['actualBaseSupportChecks']):raise ValueError('Whole Float32 mesh/viewer separation failed')
    geometry=load(out/'geometry-observations.json')
    if len(geometry['cases'])!=528 or geometry['observationsRequiringReview']:raise ValueError('Unreviewed geometry observation')
    for item in report['cases']:
        c=load(out/item['file'])
        if c.get('interaction') and c.get('actualSelectedView')!=('diagram' if c['profile']['fallback'] else c['profile']['view']):raise ValueError('Actual selected view not bound to source camera')
        if c['reviewDependencySha256']!=helper:raise ValueError('Per-case helper provenance differs')
    return report

def family_module(name):
    if name != 'experiments_forces_revision_verifier':
        return importlib.import_module('.'+name,__package__)
    path=BASE/'frozen-canonical-force140.py.txt'
    if sha(path.read_bytes())!='d1e1757bdc47312dd77b3ecafa242dd370c17535bcaaeb318bd6e44cd61f0187':raise ValueError('Canonical frozen mathematical helper drift')
    fullname=__package__+'._cb9_frozen_force140'
    if fullname not in sys.modules:
        spec=importlib.util.spec_from_file_location(fullname,path,loader=importlib.machinery.SourceFileLoader(fullname,str(path)))
        module=importlib.util.module_from_spec(spec);sys.modules[fullname]=module;spec.loader.exec_module(module)
    return sys.modules[fullname]

def report(sources,package=None,bindings=None,*,app=APP):
    app=Path(app);profile=runtime_fingerprint(app)
    if profile['sha256']!=RUNTIME:raise ValueError('Fresh actualcb9 runtime required; no927/95769/1a retag')
    proof=evidence();raw=(app/'content/esperienze-C1.json').read_bytes()
    if sha(raw)!='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3':raise ValueError('Immutable original C1 file changed')
    full={r['id']:r for r in json.loads(raw)}
    if not IDS<=set(sources)or any(sources[k]!=full[k]for k in IDS):raise ValueError('Unreviewed selected source')
    package=package or load(app/'editorial/batches/experiment-normal-revision-140.json')
    bindings=bindings or load(app/'editorial/batches/experiment-normal-revision-140-bindings.json')
    records=[];raw_results={};dependencies={Path(__file__).name:sha(Path(__file__).read_bytes())}
    for name,selected in FAMILIES.items():
        m=family_module(name);dependencies[name+'.py']=sha(Path(m.__file__).read_bytes())
        specs={k:v for k,v in m.SPECS.items()if k not in EXCLUDED_IDS};effective={k:full[k]for k in specs};draft=None
        if name=='experiments_forces_revision_verifier':
            draft=reviewed_rows(package,bindings,m.REVIEWED_REVISIONS,{'SIM-C1-L005-05'},app/'editorial/assets')[0]
            row,binding,signature,assets,errors=draft
            if errors or binding['sourceRef']!=m.SOURCE_REF or binding['sourceSha256']!=digest(full[row['id']])or row['version']!=2 or row['baseVersion']!=1:raise ValueError('Unreviewed normal DRAFT')
            effective[row['id']]=row
        actual=bind(m.runtime_values,app,specs)(effective)
        if EXCLUDED_IDS & set(actual):raise ValueError('Authored ID must never be judged by this reviewer')
        summaries=bind(m.compare_runtime,app,specs)(actual);math=m.independent_checks();extras=bind(m.corrected_scene_checks,app,specs)(actual)if hasattr(m,'corrected_scene_checks')else m.force_diagram_checks(actual)if hasattr(m,'force_diagram_checks')else{}
        raw_results[name]={'actual':{k:actual[k]for k in selected},'selectedIndependentChecks':{k:math[k]for k in selected},'selectedComparisons':{k:summaries[k]for k in selected}}
        for key in selected:
            if digest(full[key])!=m.READ_SOURCE_SHA256[key]:raise ValueError('Previously read source rebound')
            checks=math[key]+extras.get(key,[]);summary=summaries[key];errors=[]
            if not checks or not all(c['ok']for c in checks):errors.append('Fresh independent exact physics/geometry checks failed')
            if not summary['ok']:errors+=summary['errors']
            cases=[c for c in proof['cases']if c['caseKey'].startswith(key+'|')]
            result={'id':key,'sourceSha256':digest(full[key]),'sourceVersion':1,'sourceRef':m.SOURCE_REF,'sourcePath':m.SOURCE_PATH,'sourceFileSha256':m.SOURCE_FILE_SHA256,'ok':not errors,'errors':errors,'checks':checks,'runtimeComparison':summary,'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':m.MANUAL[key],'manualFeasibility':'PASS_AI_EXACT_ASSIGNED_TASKS'if not errors else'FAIL','physicalAssumptions':m.ASSUMPTIONS[key],'pedagogicalReview':m.PEDAGOGY[key],'runtimeProfileSha256':RUNTIME,'reviewedRuntimeProfileSha256':RUNTIME,'consumerEvidence':{'proofSha256':PROOF,'actualObservedCaseCountForId':len(cases),'geometrySha256':GEOMETRY,'completeConvexCertificatesSha256':CONVEX,'actualFloat32MeshSupportsSha256':MESH_SUPPORTS,'actualMeshArchiveSha256':MESH_ARCHIVE,'guardedMeshReconstructionSha256':RECONSTRUCTION_GUARD,'imagesReadSha256':IMAGES,'scientificApproval':False,'scope':'Fresh bounded matrix, fresh actual Float32-buffer/CPU-world convex mesh/viewer-ray separation and sixteen critical native/fallback PNGs read; GPU matrix upload/shader/raster and arbitrary camera excluded'},'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0,'wholeFamilyAcceptance':False,'registryOrLedgerAction':'NONE'}
            if draft and key=='SIM-C1-L005-05':
                row,binding,signature,assets,_=draft
                result.update(candidateSha256=digest(row),candidateVersion=2,baseVersion=1,reviewedSignature=signature,assetChecksums=assets,failedPublishedEdition=True,publicationAction='DRAFT',publishedEditionReview={'id':key,'sourceSha256':digest(full[key]),'ok':False,'errors':[m.SOURCE_ISSUES[key]],'manualArithmetic':'Original40degree Number-only task remains unsupported; exact symbolic expression is not accepted by Number input. Corrected DRAFT assigns60/0 only.','humanApproval':'NOT_RUN','publicationAction':'NONE'})
            records.append(result)
    for name in ['pipeline.py','runtime_fingerprint.py','review_contract.py','experiments_revision_review.py','experiment_visibility_request.py']:
        dependencies[name]=sha(Path(__file__).with_name(name).read_bytes())
    dependencies['numerical-observation.mjs']=sha((BASE/'numerical-observation.mjs').read_bytes());dependencies['certify-convex-glyphs.py']=sha((BASE/'certify-convex-glyphs.py').read_bytes())
    for name in ['reconstruct-production-meshes.mjs','check-actual-mesh-supports.py','analyze-five.py','hull-geometry.py']:dependencies[name]=sha((BASE/name).read_bytes())
    for name in ['run-five.py','run-current-mesh-analysis.py','generate-fresh-reports.py','frozen-canonical-force140.py.txt','frozen-canonical-force140-origin.json']:
        dependencies[name]=sha((BASE/name).read_bytes())
    dep=digest(dependencies)
    for row in records:row['reviewDependencySha256']=dep
    if runtime_fingerprint(app)!=profile:raise ValueError('Runtime drift during fresh mathematical/engine replay')
    return {'schemaVersion':'1.0.0','batch':'independent-five-c1-closure-renewal-cb9','records':records,'acceptedIndividualCount':sum(r['ok']for r in records),'runtimeSha256':RUNTIME,'verifierSha256':sha(Path(__file__).read_bytes()),'dependencies':dependencies,'excludedAuthorId':EXCLUDED,'recusedAuthorIds':sorted(EXCLUDED_IDS),'rawFreshEngineResults':raw_results,'limits':'Five individual proofs only. Existing full-family1a gates and all historical reports remain unchanged. No Root ledger closure or registered completion credit.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
