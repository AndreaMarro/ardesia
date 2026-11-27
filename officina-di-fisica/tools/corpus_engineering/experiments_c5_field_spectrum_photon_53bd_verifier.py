"""Distinct AI review of five exact C5 editions; bounded actual UI, no clock sweep."""
from fractions import Fraction
import json
from pathlib import Path
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint

APP=Path(__file__).resolve().parents[2]
DOSSIER=APP/'editorial/reviews/c5-field-spectrum-photon-independent-20261127'
RUNTIME='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
RUNTIME_REF='1b72b71a68a6023ab1c9fa189733947b03029914'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
AUTHOR_REF='8f29e69c1b43243666ba754c982bf89a90c26c2c'
BATCH='experiment-c5-field-spectrum-photon-reading-20261127'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
DOSSIER_MANIFEST='9ad3aec173ee2ceed8d6915f6fe4eb90cf2d33140d3d2ecf40d56fa8d059e045'
PACKAGE_SHA='9309be4bc63432002d8acfae0f15f67aec754d2833104d1636563731db8da616'
BINDING_SHA='c848ab53eb057966aaf88f97c87618e531e510a7ff6ed6ccadc065a1174f8ae9'
# Filled only after independent source-first, full text and actual raster reading.
PINS = {'SIM-C5-L06-01': {'source': '52545bf8b79e0714ef7f0966bb456baa4b764c77f07f92e8a059ee67fc2f5770', 'candidate': '9e71dad7fc9410ea066b524f1913ac58405d22e2e04b01c432a918370f15d81a', 'signature': '474aed9fd2a639cee029307f2679e74150252d9d48f2a333f1a3afcab0f9f216'}, 'SIM-C5-L06-02': {'source': '32e538825e7d81fb03092e855f3ab69b962d5c56120fb209d1f2f42bf6d9c85c', 'candidate': '199e4e8c7fda7d7131b9dceabca30c41d7587bd173480502a988c796100dc947', 'signature': 'e41db78256da3a2256270a8c38fccf13ea95c161d5fd6371598a2f799d2437d6'}, 'SIM-C5-L06-03': {'source': '8e8a5dcd204fe6de3fdd9e6d95a2b5b18b45c86a30874c04774afbba1341b5fe', 'candidate': '5e3bea7cc1de32be4c0b99d024ecfd85819f3c578c5de7b6a22514ce7c90ee29', 'signature': 'eeb998f663f70047bb77e718d60d6000736223b7fbd778f44e22cbbb32c7e481'}, 'SIM-C5-L07-01': {'source': 'ffffd7cbed5d697d9ff1f18ea4316288b24972b57437f9dd870db1fafe992614', 'candidate': '0634d1367d9ce292a8f44e2bd3ae669860040c59dcddf64ec2c33133ec2cf613', 'signature': '6b82c3a5d02398e8e543322b913ed9a6e7b3372d171fdc498b816c5183fa52eb'}, 'SIM-C5-L07-03': {'source': '4400b2e879d2a547486214da98f9f5dc351c536f622d0caa26340bc1fffc589b', 'candidate': '17eacd0fa88edac856913e8cbf654d1ff1c54408f4028b6370bffac3fc3c6e60', 'signature': '97721e807cfd0cde612d3c5cccb3c8317eca4424062adf4e82410eaa82320f15'}}
ORIGINAL_MANUAL={
 'SIM-C5-L06-01':'The assigned working c gives B_nT=10sin(phi); original270deg gives-10nT, transfer180deg gives0. Simultaneous E/B reversal preserves E cross B; zero has no direction.',
 'SIM-C5-L06-02':'Original4V/m gives(4/2)^2=4; transfer3 gives9/4=2.25. Same medium/frequency; wavelength is unchanged by amplitude in linear model.',
 'SIM-C5-L06-03':'Original displayed substitution provides lambda=10^-6.3m for visible and10^-7.3m for UV. The identity log10(10^s)=s yields-6.3/-7.3 without decimal log evaluation. Band labels alone do not determine these illustrative samples.',
 'SIM-C5-L07-01':'Using assigned rounded h,750THz gives1551/500=3.102eV; original transfer550 gives5687/2500=2.2748eV, by finite multiplication. Physical h approximation qualified separately from exact working arithmetic.',
 'SIM-C5-L07-03':'Original20eV minus assigned14eV gives6eV; transfer15 gives1eV. Below14 no emitted electron; at14 an ideal freed electron has zero kinetic energy. One-photon channel only.'}


def evidence():
    manifest_raw=(DOSSIER/'final-five-handoff.json').read_bytes()
    if sha(manifest_raw)!=DOSSIER_MANIFEST:raise ValueError('Independent five-C5 dossier manifest changed')
    manifest=json.loads(manifest_raw)
    for item in manifest['files']:
        relative=Path(item['path'])
        try:relative=relative.relative_to('officina-di-fisica')
        except ValueError as error:raise ValueError('Dossier path outside application')from error
        file=APP/relative
        if file.is_symlink()or not file.resolve().is_relative_to(APP.resolve())or sha(file.read_bytes())!=item['sha256']:
            raise ValueError('Independent C5 dossier file changed: '+str(relative))
    read=lambda name:json.loads((DOSSIER/name).read_bytes())
    review=read('independent-scientific-review.json');visual=read('bounded-120-clock-aware/independent-visual-review.json')
    plan=read('bounded-120-clock-aware/prepared.json');run=read('bounded-120-clock-aware/actual/report.json');terminal=read('bounded-120-clock-aware/actual-terminal.json')
    if (terminal['exitCode']!=0 or terminal['timeoutTriggered']or run['errors']or len(run['cases'])!=120
        or run['sourceCommit']!=RUNTIME_REF or run['protocolSha256']!=COLLECTOR
        or run['preparedSha256']!=sha((DOSSIER/'bounded-120-clock-aware/prepared.json').read_bytes())
        or run['runtimeFingerprint']!=plan['runtimeFingerprint']or run['runtimeFingerprint']['sha256']!=RUNTIME
        or review['draftCommit']!=AUTHOR_REF or visual['draftCommit']!=AUTHOR_REF
        or review['role']!='AI_INDEPENDENT_FROM_ROOT_AUTHOR'or visual['role']!='AI_INDEPENDENT_FROM_ROOT_AUTHOR'
        or review['newTextMathFindings']or visual['newFindings']):
        raise ValueError('Independent C5 scientific/actual UI authority differs')
    expected={f'{key}|draft|{width}|{view}|{kind}'for key in PINS for width in(320,1280)
              for view in('orbit','side','top','fixed_projection')for kind in('setup','grid|0','grid|1')}
    if set(plan['expectedCaseKeys'])!=expected or len(plan['expectedCaseKeys'])!=120:raise ValueError('C5 complete eight-profile scope changed')
    cases={}
    for index in run['cases']:
        key=index['caseKey'];raw=(DOSSIER/'bounded-120-clock-aware/actual'/index['file']).read_bytes()
        if key in cases or sha(raw)!=index['sha256']:raise ValueError('Duplicate or changed actual C5 case')
        case=json.loads(raw)
        if(case['caseKey']!=key or case['runtimeSha256']!=RUNTIME or not case['technicalOk']
           or case['candidateSha256']!=PINS[case['id']]['candidate']or case['sourceSha256']!=PINS[case['id']]['source']):
            raise ValueError('Actual C5 case differs from reviewed edition')
        for image in case['screenshots']:
            if sha((DOSSIER/'bounded-120-clock-aware/actual'/image['file']).read_bytes())!=image['sha256']:raise ValueError('C5 raster changed')
        cases[key]=case
    if set(cases)!=expected:raise ValueError('C5 actual case omissions')
    return review,visual,plan,run,cases


def report(sources,package,bindings):
    if set(sources)!=set(PINS):raise ValueError('Expected all five exact C5 IDs')
    profile=runtime_fingerprint(APP)
    if profile['sha256']!=RUNTIME:raise ValueError('Five-C5 current evidence requires runtime53bd')
    for suffix,pin in(('.json',PACKAGE_SHA),('-bindings.json',BINDING_SHA)):
        if sha((APP/'editorial/batches'/(BATCH+suffix)).read_bytes())!=pin:raise ValueError('Original Astra/1 package or binding bytes changed')
    if package!=json.loads((APP/'editorial/batches'/(BATCH+'.json')).read_bytes())or bindings!=json.loads((APP/'editorial/batches'/(BATCH+'-bindings.json')).read_bytes()):
        raise ValueError('Caller changed the exact reviewed Astra/1 package or binding set')
    review,visual,plan,run,cases=evidence()
    if run['runtimeFingerprint']!=profile:raise ValueError('C5 actual installed runtime changed')
    reviewed={key:value['signature']for key,value in PINS.items()}
    science={r['id']:r for r in review['records']};verdicts={r['id']:r for r in visual['perID']}
    if set(science)!=set(PINS)or set(verdicts)!=set(PINS):raise ValueError('Incomplete scientific or raster verdict')
    dependency=digest({'verifier':sha(Path(__file__).read_bytes()),'dossier':DOSSIER_MANIFEST,
      'modules':{name:sha(Path(__file__).with_name(name).read_bytes())for name in('pipeline.py','review_contract.py','runtime_fingerprint.py')},'runtime':RUNTIME})
    output=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,reviewed,set(PINS),APP/'editorial/assets'):
        key=row['id'];source=sources[key];pin=PINS[key];entry=science[key];verdict=verdicts[key]
        if(errors or assets or digest(source)!=pin['source']or digest(row)!=pin['candidate']
           or binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=key
           or row['baseVersion']!=source['version']or row['version']!=source['version']+1
           or entry['candidateSha256']!=pin['candidate']or entry['sourceSha256']!=pin['source']
           or entry['textMathManualDecision']!='PASS_INDEPENDENT_CPU_AND_READING'
           or verdict['boundedVisualDecision']!='POSITIVE_IN_ACTUALLY_READ_SELECTED_STATES'):
            raise ValueError('C5 independent content/version/source judgment changed: '+key)
        for field in('id','kind','course','skill','apparatus','control','measure','references','formula','substitution'):
            if row[field]!=source[field]:raise ValueError('C5 original physical/model identity changed: '+field)
        scoped=[case for case in cases.values()if case['id']==key];setups=[r for r in scoped if r['caseKey'].endswith('|setup')]
        tasks=entry['actualGeneratedTasks'];answers=[Fraction(q['input'])for q in next(r for r in plan['records']if r['id']==key)['questions']]
        if len(scoped)!=24 or len(setups)!=8:raise ValueError('Incomplete individual C5 actual UI')
        for setup in setups:
            if setup['axe']or len(setup['questions'])!=2:raise ValueError('C5 actual manual UI failed')
            for actual,expected,answer in zip(setup['questions'],tasks,answers,strict=True):
                if actual['actualPrompt']!=expected['prompt']or Fraction(actual['input'])!=answer or not actual['status'].startswith('Corretto.'):
                    raise ValueError('C5 actual response differs from independent exact entry')
        for case in scoped:
            if key in('SIM-C5-L06-02','SIM-C5-L07-01')and'index'in case.get('interaction',{}):
                if case['sourceReplayedClockTime']!=0 or float(case['clockReadout'])!=0:raise ValueError('C5 explicitly scoped zero clock drifted')
        original={'id':key,'ok':True,'sourceSha256':pin['source'],'sourceVersion':source['version'],
          'manualArithmetic':ORIGINAL_MANUAL[key],'judgmentScope':'Original published algebra/assigned numeric tasks only; not a full legal-grid/camera/clock acceptance',
          'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        output.append({'id':key,'ok':True,'verificationMode':'EXACT_ORACLE','sourceSha256':pin['source'],'sourceVersion':source['version'],
          'candidateSha256':pin['candidate'],'candidateVersion':row['version'],'baseVersion':row['baseVersion'],'reviewedSignature':signature,
          'originalEditionRetained':True,'failedPublishedEdition':False,'publishedEditionReview':original,
          'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':entry['manualDerivation'],'physicalAssumptions':entry['hypothesesAndUnits'],
          'pedagogicalReview':'Independent source-first derivation, all four blocks read, actual two Number inputs accepted in eight profiles; authored formula delivery fits and axe empty.',
          'visualScope':{'runtimeSha256':RUNTIME,'actualCases':24,'actualNumberSubmissions':16,'decision':verdict['boundedVisualDecision'],
            'scope':'Two assigned points in native orbit/side/top and fixed fallback at320/1280; clocked records explicitly reset0, no time sweep'},
          'clockLimitations':'L06-02/L07-01 periods and quarter-phase checked independently on CPU; actual UI here onlyt0, no clock sweep.',
          'reviewDependencySha256':dependency,'humanApproval':'NOT_RUN','publicationAction':'DRAFT'})
    return{'schemaVersion':'1.0.0','records':output,'acceptedCount':len(output),'runtimeSha256':RUNTIME,
      'independentDossierSha256':DOSSIER_MANIFEST,'verifierSha256':sha(Path(__file__).read_bytes()),
      'registryAction':'NONE_BUNDLE_ONLY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
