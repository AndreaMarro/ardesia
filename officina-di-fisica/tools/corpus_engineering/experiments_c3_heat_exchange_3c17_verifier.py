"""Distinct source-first heat-exchange review; actual bounded controls and clock."""
from fractions import Fraction as Q
from pathlib import Path
import json,re
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint

APP=Path(__file__).resolve().parents[2]
DOSSIER=APP/'editorial/reviews/c3-heat-exchange-final-3c17-20261127'
RUNTIME='3c174677e6b7fc585903dbb6a5bc6b9fa078b435375f9333a6a81897f1027dc2'
RUNTIME_REF='f30201defc4c77b472cd791bb0adea7e1d8e7810'
AUTHOR_REF='1413e2c41a8c7fec6b2a5ff421685dbed4e3ab8b'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH='experiment-c3-heat-exchange-reading-20261127'
DOSSIER_MANIFEST='6da22d1280a2dd66f3270d94b012b48776a7257fc972f2357cfaa90a16ce33e1'
COLLECTOR='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
# Filled only after source-first derivation, final text and actual184 raster reading.
PINS={'SIM-C3-L05-01':{'source':'20f725b8dda9bfffcbbbd3e5d120b5ca3c8562b8c5d909dd15e8858c06e7f988','candidate':'c6668cf3ea9c7a892a8e168427e052d6ac3f7079c5555e45f16c0deee2af62d8','signature':'b05e10200a672544dbe05ad6bf2b2e3cb9a99afa1bc0893caa9a824f2e841f46'},'SIM-C3-L05-02':{'source':'16cb138880c0509f85f26c36e1f6e4a33eac7c8b1058f0c1c93f43712e451b08','candidate':'52739cf2daacade04b0bc06c0c8fd1fb00236b3a86c6bfd91cdd02a49fc5a02f','signature':'1f4245d34ecaa7898deb8449fa36016a399ce08ab4adaa62ef4842407915b150'},'SIM-C3-L05-03':{'source':'9dfad569d14db6aaeecd08c0d959da1dd85a241ea83f82bb31120de92519fc05','candidate':'37cfc96add22d662a3585a89ad746d429ac2467cccdf4bb112a1ca0a0c95c9f3','signature':'e16eadb27080f95712728d2538fcf6684420e39b8349600903e141816514023a'}}
INPUTS={'SIM-C3-L05-01':([Q(2),Q(8)],[Q(10),Q(5,2)]),'SIM-C3-L05-02':([Q(2),Q(7,2)],[Q(84),Q(147)]),'SIM-C3-L05-03':([Q(200),Q(400)],[Q(-7371,20),Q(3969,4)])}
ORIGINAL_MANUAL={'SIM-C3-L05-01':'P=20/L_cm: original5cm gives4W; original transfer4.5cm gives40/9W, manual long division4.444... (worked presentation4.444 approximate). This is original assigned algebra, not whole-grid/camera acceptance.','SIM-C3-L05-02':'Each gram releases42J: original3g/s gives126W, actual original transfer2.5g/s gives105W. The source-primary initial2.75 enumeration was corrected additively before candidate reading; no original source rewritten.','SIM-C3-L05-03':'With assigned approximate sigma_work=567/10^10, original400K gives3969/4=992.25W/m2; transfer350K gives626535/1600=391.584375W/m2 (worked approximate391.6). Expand(7/2)^4 and subtract3^4 after factoring(100K)^4. Original arithmetic judgment only, not a universal UI/clock acceptance.'}


def _file(relative):
    p=Path(relative)
    if p.is_absolute()or'..'in p.parts:raise ValueError('Unsafe independent evidence path')
    file=DOSSIER/p
    if file.is_symlink()or not file.resolve().is_relative_to(DOSSIER.resolve()):raise ValueError('Independent evidence path escapes dossier')
    return file


def evidence():
    raw=_file('final-science-handoff.json').read_bytes()
    if sha(raw)!=DOSSIER_MANIFEST:raise ValueError('Independent heat-exchange dossier manifest changed')
    manifest=json.loads(raw)
    for item in manifest['files']:
        file=_file(item['path']);data=file.read_bytes()
        if len(data)!=item['bytes']or sha(data)!=item['sha256']:raise ValueError('Independent heat evidence changed: '+item['path'])
    read=lambda path:json.loads(_file(path).read_bytes())
    science=read('independent-scientific-review.json');visual=read('independent-visual-review.json');datasets={}
    if(science['role']!='AI_INDEPENDENT_FROM_ROOT_AUTHOR'or visual['role']!='AI_INDEPENDENT_FROM_ROOT_AUTHOR'
       or science['draftCommit']!=AUTHOR_REF or visual['draftCommit']!=AUTHOR_REF
       or science['runtimeSha256']!=RUNTIME or visual['runtimeSha256']!=RUNTIME
       or science['newTextMathFindings']or visual['newFindings']):raise ValueError('Independent thermal judgment changed')
    for name,total in(('controls-112',112),('convection-clock-72',72)):
        plan=read(name+'/prepared.json');run=read(name+'/actual/report.json');terminal=read(name+'/actual-terminal.json')
        if(terminal['exitCode']!=0 or terminal['timeoutTriggered']or run['errors']or len(run['cases'])!=total
           or run['sourceCommit']!=RUNTIME_REF or run['protocolSha256']!=COLLECTOR
           or run['runtimeFingerprint']!=plan['runtimeFingerprint']or run['runtimeFingerprint']['sha256']!=RUNTIME
           or run['preparedSha256']!=sha(_file(name+'/prepared.json').read_bytes())
           or run['guestIsolation']!='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403'
           or run['canonicalImport']['publishedCount']!=991):raise ValueError('Incomplete current thermal actual UI')
        expected=set(plan['expectedCaseKeys']);cases={}
        if len(expected)!=total:raise ValueError('Thermal duplicate planned cases')
        for index in run['cases']:
            key=index['caseKey'];raw=_file(name+'/actual/'+index['file']).read_bytes()
            if key in cases or sha(raw)!=index['sha256']:raise ValueError('Duplicate or changed thermal actual case')
            case=json.loads(raw);pin=PINS[case['id']]
            if(case['caseKey']!=key or not case['technicalOk']or case['runtimeSha256']!=RUNTIME
               or case['sourceSha256']!=pin['source']or case['candidateSha256']!=pin['candidate']):raise ValueError('Thermal observed edition changed')
            for image in case['screenshots']:
                if sha(_file(name+'/actual/'+image['file']).read_bytes())!=image['sha256']:raise ValueError('Thermal raster changed')
            cases[key]=case
        if set(cases)!=expected:raise ValueError('Thermal actual case omissions')
        datasets[name]=(plan,run,cases)
    return science,visual,datasets


def report(sources,package,bindings):
    if set(sources)!=set(PINS):raise ValueError('Expected all three reviewed heat-exchange IDs')
    profile=runtime_fingerprint(APP)
    if profile['sha256']!=RUNTIME:raise ValueError('Heat-exchange current evidence requires runtime3c17')
    for suffix in('.json','-bindings.json'):
        if (APP/'editorial/batches'/(BATCH+suffix)).read_bytes()!=_file('inputs/'+BATCH+suffix).read_bytes():raise ValueError('Reviewed thermal original package bytes changed')
    if package!=json.loads(_file('inputs/'+BATCH+'.json').read_bytes())or bindings!=json.loads(_file('inputs/'+BATCH+'-bindings.json').read_bytes()):raise ValueError('Caller changed exact reviewed thermal package or bindings')
    science,visual,datasets=evidence();entries={r['id']:r for r in science['records']};verdicts={r['id']:r for r in visual['perID']}
    if set(entries)!=set(PINS)or set(verdicts)!=set(PINS):raise ValueError('Incomplete per-ID thermal review')
    for plan,run,cases in datasets.values():
        if run['runtimeFingerprint']!=profile:raise ValueError('Actual thermal runtime fingerprint changed')
    dependency=digest({'verifier':sha(Path(__file__).read_bytes()),'dossier':DOSSIER_MANIFEST,'runtime':RUNTIME,
      'modules':{name:sha(Path(__file__).with_name(name).read_bytes())for name in('pipeline.py','review_contract.py','runtime_fingerprint.py')}})
    output=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,{k:v['signature']for k,v in PINS.items()},set(PINS),APP/'editorial/assets'):
        key=row['id'];source=sources[key];pin=PINS[key];entry=entries[key];verdict=verdicts[key]
        if(errors or assets or digest(source)!=pin['source']or digest(row)!=pin['candidate']
           or binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=key
           or row['baseVersion']!=source['version']or row['version']!=source['version']+1
           or entry['textMathManualDecision']!='PASS_INDEPENDENT_CPU_AND_READING'
           or entry['sourceSha256']!=pin['source']or entry['candidateSha256']!=pin['candidate']
           or verdict['boundedVisualDecision']!='POSITIVE_IN_ACTUALLY_READ_BOUNDED_STATES'):raise ValueError('Thermal scientific identity/version/judgment changed: '+key)
        for field in('id','kind','course','skill','apparatus','control','measure','references','substitution'):
            if row.get(field)!=source.get(field):raise ValueError('Original thermal physical/model identity changed: '+field)
        points,answers=INPUTS[key]
        if list(map(lambda x:Q(str(x)),row['assessmentSelection']['points']))!=points:raise ValueError('Reviewed thermal task selection changed')
        allcases=[r for plan,run,cases in datasets.values()for r in cases.values()if r['id']==key]
        setups=[r for r in allcases if r['caseKey'].endswith('|setup')]
        expected_count={'SIM-C3-L05-01':32,'SIM-C3-L05-02':112,'SIM-C3-L05-03':40}[key]
        if len(allcases)!=expected_count or len(setups)!=(16 if key.endswith('02')else 8):raise ValueError('Incomplete individual thermal observations')
        for setup in setups:
            if setup['axe']or len(setup['questions'])!=2:raise ValueError('Thermal actual manual UI failed')
            for actual,task,answer in zip(setup['questions'],entry['actualGeneratedTasks'],answers,strict=True):
                if actual['actualPrompt']!=task['prompt']or Q(actual['input'])!=answer or not actual['status'].startswith('Corretto.'):raise ValueError('Thermal actual answer differs from independent manual solution')
        for case in allcases:
            if 'sourceReplayedX'not in case:continue
            x=Q(str(case['sourceReplayedX']));expected=20/x if key.endswith('01')else 42*x if key.endswith('02')else Q.from_float(5.67e-8)*(x**4-300**4)
            if case['model']['y']!=float(expected):raise ValueError('Independent exact/explicit IEEE thermal oracle differs')
            if key.endswith('02'):
                time=Q(str(case['sourceReplayedClockTime']))
                match=re.search(r'Massa passata alla sezione([0-9.,]+)\s+g$',case['readings'])
                if Q(case['clockReadout'])!=time or not match or Q(match[1].replace(',','.'))!=x*time:raise ValueError('Thermal actual clock time or transported mass differs')
        original={'id':key,'ok':True,'sourceSha256':pin['source'],'sourceVersion':source['version'],'manualArithmetic':ORIGINAL_MANUAL[key],
          'judgmentScope':'Original assigned algebra and working-model assumptions only; not inherited full original UI/clock acceptance','humanApproval':'NOT_RUN','publicationAction':'NONE'}
        output.append({'id':key,'ok':True,'verificationMode':'EXACT_ORACLE','sourceSha256':pin['source'],'sourceVersion':source['version'],
          'candidateSha256':pin['candidate'],'candidateVersion':row['version'],'baseVersion':row['baseVersion'],'reviewedSignature':signature,
          'originalEditionRetained':True,'failedPublishedEdition':False,'publishedEditionReview':original,'calculationScope':'EXACT_MANUAL_CALCULATION',
          'manualArithmetic':entry['manualDerivation'],'physicalAssumptions':entry['hypothesesAndUnits'],
          'pedagogicalReview':'Independent source-first primary before drafts, final15blocks read across three records, six exact finite-decimal Number entries accepted; student gross-exchange drawing explicitly distinguished from net-flux apparatus.',
          'visualScope':{'runtimeSha256':RUNTIME,'actualCases':len(allcases),'actualNumberSubmissions':len(setups)*2,'decision':verdict['boundedVisualDecision'],'scope':verdict['scope']},
          'clockLimitations':visual['clockScope'],'geometryLimitations':visual['geometryScope'],'readoutPrecision':visual['readoutPrecision'],
          'reviewDependencySha256':dependency,'humanApproval':'NOT_RUN','publicationAction':'DRAFT'})
    return{'schemaVersion':'1.0.0','records':output,'acceptedCount':len(output),'runtimeSha256':RUNTIME,'independentDossierSha256':DOSSIER_MANIFEST,
      'verifierSha256':sha(Path(__file__).read_bytes()),'registryAction':'NONE_BUNDLE_ONLY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
