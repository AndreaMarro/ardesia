"""Integrity/report boundary for the three independently read experiment revisions.

Only exact oracle calculations may be reused. Actual engine is executed on every
report; current consumer proof remains byte- and protocol-bound. No authoring imports.
"""
from pathlib import Path
import json
import math
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint

REVIEWED_RUNTIME='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
PROOF='experiments-revisions-118-119-140-independent-browser.json'
PROTOCOL='browser-experiment-revisions-independent.mjs'
# Filled only after observing the complete terminal replay of the exact protocol.
READ_PROOF_SHA256='beaab749fa681a3dee74185e8749bc3c7f98d379fd13729cf22a0a18c6873fd7'
READ_PROTOCOL_SHA256='ab78a9ace3b5de16d7286c08d918e19105a521180c294c6543c6181eb9138de6'
ALL_IDS=tuple('SIM-C1-L%03d-%02d'%(lesson,index) for lesson,count in ((1,6),(2,4),(5,6)) for index in range(1,count+1))
TARGETS={'SIM-C1-L001-06','SIM-C1-L002-04','SIM-C1-L005-05'}
PACKAGE_FILES={'experiment-projection-revision-118':'38c312f80c4c2051be7b39cf79880fe58a87d0f189ccb40ab306b20d87e5095d',
'experiment-products-revision-119':'873dd6596f0f99ea17c287f0c4628aa65530bff8d038ab11dae6b005bc356fa1',
'experiment-normal-revision-140':'0340553cd6587882ba278e0c6efc18a2bb30b83973dfc0629ce48804c57d0a0c'}


def consumer_evidence(app):
    file=app/'editorial/reviews'/PROOF;tool=app/'tests/corpus'/PROTOCOL
    if not file.is_file() or not tool.is_file():return {'ok':False,'errors':['Independent current consumer proof missing']}
    raw=file.read_bytes();protocol=sha(tool.read_bytes());p=json.loads(raw);errors=[]
    if sha(raw)!=READ_PROOF_SHA256 or protocol!=READ_PROTOCOL_SHA256 or p.get('protocolSha256')!=protocol:errors.append('Consumer evidence/protocol differs from terminal reviewed replay')
    if (p.get('terminalStatus')!='PASS' or p.get('errors') or p.get('scientificApproval') is not False
        or p.get('humanApproval')!='NOT_RUN' or p.get('publicationAction')!='NONE'
        or p.get('expectedEffectiveIds')!=list(ALL_IDS) or p.get('runtimeFingerprint',{}).get('sha256')!=REVIEWED_RUNTIME
        or p.get('packageFileSha256ByBatch')!=PACKAGE_FILES or p.get('bareGuestAuthorAndDraftAssetsForbidden') is not True):errors.append('Incomplete or stale observed consumer evidence')
    if {n:sha((app/'editorial/batches'/(n+'.json')).read_bytes()) for n in PACKAGE_FILES}!=PACKAGE_FILES:errors.append('Actual package bytes changed')
    cases=p.get('cases',[])
    expected={(key,width,mode) for key in ALL_IDS for width in ([1440,768,320] if key in TARGETS else [1280]) for mode in (False,True)}
    observed=[(r.get('id'),r.get('width'),r.get('noWebGL')) for r in cases if r.get('kind')=='effective_bench']
    if len(observed)!=len(expected) or set(observed)!=expected or len(cases)!=58:errors.append('Incomplete or duplicated effective consumer matrix')
    for row in cases:
        if row.get('kind')=='effective_bench':
            mode=row.get('renderMode','')
            if not (('Tavola di misura' in mode) if row.get('noWebGL') else ('3D interattivo' in mode)):errors.append('Requested rendering mode was not actually observed')
        if row.get('kind')=='effective_bench' and row['id'] in TARGETS:
            reading=row.get('reading',{}) or {}
            if not reading.get('allBlocksReachable') or not reading.get('progressPreservedAfterInput') or not reading.get('statuses'):errors.append('Authored reading was not delivered completely')
    imports=p.get('canonicalImport',{});post=p.get('afterConsumer',{})
    if (imports.get('beforePublishedCount')!=post.get('publishedCount') or imports.get('publishedSha256')!=post.get('publishedSha256')
        or imports.get('attemptsBefore')!=post.get('attemptsAfter') or len(imports.get('imports',[]))!=3
        or len(p.get('accessChecks',[]))!=3):errors.append('Canonical import/publication/access isolation evidence missing')
    for row in imports.get('imports',[]):
        if row.get('first',{}).get('saved')!=1 or row.get('second',{}).get('saved')!=0 or row.get('second',{}).get('unchanged')!=1:errors.append('Draft import was not idempotent')
    return {'ok':not errors,'errors':errors,'proofSha256':sha(raw),'protocolSha256':protocol,'runtimeProfileSha256':REVIEWED_RUNTIME,'observedCaseCount':len(cases),
        'transport':'Three canonical owner-fetched DRAFT records mounted only by an explicitly private exact-item transport fixture; other13 use native published port. Guest denied author401 and draft assets403; demo learner still receives original v1. No public draft route or publication claimed.',
        'scope':'44 effective bench cases plus14 independent formatter/zero/force-scale closure cases; historical f897 negatives retained separately; not empirical student calibration'}


def verify_family(module,sources,package=None,bindings=None):
    app=module.APP;keys=set(module.SPECS)
    if not keys.issubset(sources):raise ValueError('Missing complete independently read family')
    valid=all(sources[k].get('kind')=='experiment' and digest(sources[k])==module.READ_SOURCE_SHA256[k] for k in keys)
    effective={k:sources[k] for k in keys};draft=None
    if package is not None:
        if bindings is None:raise ValueError('Revision requires bindings')
        draft=reviewed_rows(package,bindings,module.REVIEWED_REVISIONS,{module.REVISION_ID},app/'editorial/assets')[0]
        row,binding,signature,assets,errors=draft
        if not valid:errors.append('Unreviewed source; no engine execution')
        if binding.get('sourceId')!=module.REVISION_ID or binding.get('sourceRef')!=module.SOURCE_REF or binding.get('sourceSha256')!=module.READ_SOURCE_SHA256[module.REVISION_ID]:errors.append('Original provenance rebound')
        base=sources[module.REVISION_ID]
        if type(row.get('version')) is not int or type(row.get('baseVersion')) is not int or row['version']!=base.get('version',1)+1 or row['baseVersion']!=base.get('version',1):errors.append('Expected next additive edition and original base')
        allowed={'title','summary','anchor','blocks','prerequisites','review','version','baseVersion','assessmentSelection'}
        if {k:v for k,v in base.items() if k not in allowed}!={k:v for k,v in row.items() if k not in allowed}:errors.append('Immutable apparatus/control/physics/reference changed')
        if row.get('assessmentSelection')!={'schemaVersion':'1.0.0','points':list(module.SPECS[module.REVISION_ID][4:6])}:errors.append('Reviewed exact assigned points changed')
        effective[module.REVISION_ID]=row
    elif bindings is not None:raise ValueError('Bindings require package')
    profile=runtime_fingerprint(app)['sha256'];proof=consumer_evidence(app);actual=None;comparison={};runtime_errors=[]
    if not valid:runtime_errors.append('Unreviewed source; engine not executed')
    elif profile!=REVIEWED_RUNTIME:runtime_errors.append('Actual runtime changed; no cached approval')
    elif draft and draft[-1]:runtime_errors.append('Unreviewed candidate; engine not executed')
    else:
        actual=module.runtime_values(effective);comparison=module.compare_runtime(actual)
        if runtime_fingerprint(app)['sha256']!=profile:runtime_errors.append('Runtime changed during fresh oracle execution')
    math=module.independent_checks();records=[]
    for key in sorted(keys):
        source=sources[key];checks=list(math[key]);errors=list(runtime_errors)
        if not valid:errors.append('Source differs from independently read immutable Git record')
        if not proof['ok']:errors.extend(proof['errors'])
        if not checks or not all(c['ok'] for c in checks):errors.append('Independent exact mathematics failed')
        comp=comparison.get(key)
        if comp:
            checks.append({'claim':'fresh actual law/domain/graph/apparatus/generated-task comparison','ok':comp['ok'],'dimension':{},'caseCount':comp['caseCount'],'errors':comp['errors']})
            if not comp['ok']:errors.extend(comp['errors'])
            for index,(echo,x) in enumerate(zip(comp['formatRoundtrip'],module.SPECS[key][4:6])):
                expected=float(module.exact_value(key,x));got=echo.get('parsed')
                ok=type(got) in (int,float) and math_isfinite(got) and abs(got-expected)<=max(.000001,abs(expected)*.005)
                checks.append({'claim':'actual numeric display/input roundtrip'+str(index),'ok':ok,'dimension':{},'actual':echo,'independentExact':str(module.exact_value(key,x))})
                if not ok:errors.append('Numeric display/input roundtrip fails')
        if key==module.REVISION_ID and draft is None:errors.append(module.SOURCE_ISSUES[key])
        record={'id':key,'sourceSha256':digest(source),'sourceVersion':source.get('version',1),'sourceRef':module.SOURCE_REF,'sourcePath':module.SOURCE_PATH,'sourceFileSha256':module.SOURCE_FILE_SHA256,
          'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c.get('dimension',{}) for c in checks},
          'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':module.MANUAL[key],'manualFeasibility':'PASS_AI_EXACT' if not errors else 'FAIL',
          'physicalAssumptions':module.ASSUMPTIONS[key],'pedagogicalReview':module.PEDAGOGY[key], 'figureReview':module.VISUAL_REVIEW[key],
          'runtimeComparison':comp,'runtimeProfileSha256':profile,'reviewedRuntimeProfileSha256':REVIEWED_RUNTIME,'consumerEvidence':proof,
          'oracleDependencySha256':sha(Path(__file__).read_bytes()),'assetChecksums':{},'verificationMode':'INDEPENDENT_EXISTING_EDITION',
          'failedPublishedEdition':False,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        if key==module.REVISION_ID:
            published={'id':key,'sourceSha256':digest(source),'ok':False,'errors':[module.SOURCE_ISSUES[key]],'humanApproval':'NOT_RUN','publicationAction':'NONE','calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':'Original legacy numeric transfer requires a nonnotable trigonometric value without a supplied manual approximation, while the actual Number-only grader rejects the exact symbolic expression. Scalar law remains correct. Historical negative evidence is preserved, not overwritten.'}
            if draft:
                row,binding,signature,assets,candidate_errors=draft
                record.update(errors=errors+candidate_errors,ok=not(errors+candidate_errors),candidateSha256=digest(row),candidateVersion=row['version'],baseVersion=row['baseVersion'],reviewedSignature=signature,assetChecksums=assets,
                    publishedEditionReview=published,failedPublishedEdition=True,reviewedEdition='NEW_DRAFT',verificationMode='EXACT_ORACLE',publicationAction='DRAFT')
            else:record.update(failedPublishedEdition=True,publishedEditionReview=published,manualArithmetic=published['manualArithmetic'],figureReview='Original source has no authored blocks or uploaded new-edition asset. Current installed interactive apparatus is replayed, but the legacy generated numerical transfer remains unsupported. New draft reading is not attributed to the original source.')
        records.append(record)
    return records


def math_isfinite(value):return math.isfinite(value)


def family_report(module,sources,package=None,bindings=None):
    records=verify_family(module,sources,package,bindings)
    return {'schemaVersion':'1.0.0','batch':module.BATCH,'records':records,'verifierSha256':sha(Path(module.__file__).read_bytes()),
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'sourceRef':module.SOURCE_REF,'sourcePath':module.SOURCE_PATH,'sourceFileSha256':module.SOURCE_FILE_SHA256,
        'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),'draftReviewedCount':sum(r['publicationAction']=='DRAFT' for r in records),
        'failedPublishedEditionIds':[module.REVISION_ID],'dependencyVersions':{'sympy':module.sp.__version__,'pint':module.pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_or_revision_author','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
