"""Reconcile individually reviewed C5 drafts with current browser observations."""
from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from . import experiments_C5_code_partial_verifier as science
from .experiment_visibility_request import planned_interactions, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint

APP = Path(__file__).resolve().parents[2]
PROOF = APP / 'editorial/reviews/c5-nine-bounded-drafts-f357-20261127'
RUNTIME = 'f357b970906cb827c8e8046a42e45b35d8745179752f2a756b2affdf56bbe5f4'
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
OBSERVED_AT = '3be1ddfe5bbec66daa88127859e6c95ef5e25cd3'
PEER = '85b40b28ba73fb4c2a31d0cbceb5af970c5d796e'
AUTHOR = 'd20c200b8731739ef512f7e2820104a7bd755202'
ARCHIVE = 'ffa1780d209c17a74f57605b0db6251c67e4e639fc4dec436b29e75b628f20e7'
PRIOR = '72534f815e78e88b022f4bc39065981d1d6ac575f93d0c30cb7216decb40f4ae'
PINS = {
    'manifest.json':'58445cbd46736d5956c0a5cb0ab0456ef1e7713c7559669b784f79692d39f5f3',
    'visual-index.json':'95894aa999d1875d58cf615bb0e875f6d13fa747918338012eb392171c4a5ebc',
    'science-basis.json':'4c8d86871192331a98cd2157e28d7f7ce24c890279a89f22c8911a58743e94ca',
    'science-energy-sound.json':'35dec03d872d594740bac4f743f1cac5011d021998ae67cde20084a3d06805b8',
    'science-amendments.json':'f18e1cb6c256fe278a5a900eb3eb8faa88e2646c3ad867ebbec8c8d2265ecbc2',
    'c5-wave-basis-manual.md':'22c0764182253c3caaadbe1e55b4db3dc76d08d3ad7527c466dc702029b06210',
    'c5-wave-energy-sound-manual.md':'5a3cecebf437c6c8aa16d7ab80a058509b4019bdcd0e371f8c7eab1abcd715e2',
    'selected-packages.json':'dd08112c917509afcd59991165de3be265728e8f5bb3a2d264891c854528c46a',
    'actual-installed-assessments.json':'bdf6090dfa430f8b5815fa548b79b7482c30fc716bf4ac5afb9530a6560fc5e3',
}
DIFFERENT = 'SIM-C5-L05-02|draft|320|fixed_projection|grid|1'
OLD_IMAGE = '8c4d2225753d243fa4707b0c9a2480811edd9cbcaa601cdfad8f3c496707f840'
NEW_IMAGE = '64a9eb40cf67030c237fa486a34f046ea9408d38ab1f17a14832650f28fb85af'


def verified_bytes(name, checksum=None):
    raw = (PROOF / name).read_bytes()
    if sha(raw) != (checksum or PINS[name]):
        raise ValueError('C5 evidence changed: ' + name)
    return raw


def read(name):
    return json.loads(verified_bytes(name))


def observed():
    summary=read('manifest.json')
    if summary['rawArchiveSha256']!=ARCHIVE or summary['testedCandidateCommit']!=OBSERVED_AT:
        raise ValueError('C5 raw archive belongs to a different candidate')
    verified_bytes('actual-f357-runs.zip', ARCHIVE)
    cases={}
    with ZipFile(PROOF/'actual-f357-runs.zip') as archive:
        parent=json.loads(archive.read('prepared.json'))
        for width in (320,1280):
            prefix=f'width-{width}/'
            plan_raw=archive.read(prefix+'prepared.json')
            plan=json.loads(plan_raw)
            terminal=json.loads(archive.read(prefix+'terminal.json'))
            if terminal['observedExitCode']!=0 or terminal['timeoutTriggered']:
                raise ValueError('An actual C5 browser slice did not exit undisturbed')
            get=lambda filename: archive.read(prefix+'actual/'+filename)
            run=verify_report_bytes(get,plan,COLLECTOR)
            if (run['preparedSha256']!=sha(plan_raw) or run['sourceCommit']!=OBSERVED_AT
                or run['runtimeFingerprint']['sha256']!=RUNTIME or run['errors'] or len(run['cases'])!=108):
                raise ValueError('A current C5 browser scope changed')
            owner={row['id']:row['version'] for row in run['fullOwnerRecordIdentity']['records']}
            if owner!={row['id']:row['version'] for row in parent['draftRecords']}:
                raise ValueError('Current owner did not receive all expected owner-only drafts')
            if run['guestIsolation']!='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403':
                raise ValueError('Current privacy assertion is unavailable')
            keys=planned_interactions(plan)
            for item in run['cases']:
                k=item['caseKey']
                if k in cases:
                    raise ValueError('Two current slices contain the same C5 case')
                case=json.loads(get(item['file']))
                row,state=keys[k]
                verify_planned_interaction(case,row,state)
                if case['sourceSha256']!=row['sourceSha256'] or case['candidateSha256']!=row['candidateSha256']:
                    raise ValueError('Observed C5 case edition differs: ' + k)
                cases[k]=case
    if len(cases)!=216 or set(cases)!=set(parent['expectedCaseKeys']):
        raise ValueError('C5 scope exceeds or misses the nine frozen records')
    return cases, {row['id']:row for row in parent['draftRecords']}


def visual_for(key, visual_index, cases, candidate):
    verdict=visual_index[key]
    if (verdict['visualDecision']!='VISUAL_POSITIVE_BOUNDED' or verdict['candidateSha256']!=candidate
        or verdict['humanApproval']!='NOT_RUN' or len(verdict['currentCaseMetadata'])!=24
        or verdict['runtimeSha256']!='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'):
        raise ValueError('Distinct reading does not approve the precise bounded experience: '+key)
    same,different=0,[]
    with ZipFile(PROOF/'prior-independent-case-observations.zip') as prior:
        for meta in verdict['currentCaseMetadata']:
            blob=prior.read(meta['file'])
            if sha(blob)!=meta['sha256']:
                raise ValueError('Historical independently read case bytes changed')
            previous=json.loads(blob)
            case_key=meta['caseKey']
            current=cases[case_key]
            if (previous['caseKey']!=case_key or previous['candidateSha256']!=candidate
                or current['candidateSha256']!=candidate or current['id']!=key):
                raise ValueError('Visual scope or candidate mismatch')
            earlier=[image['sha256'] for image in previous['screenshots']]
            fresh=[image['sha256'] for image in current['screenshots']]
            if earlier==fresh:
                same+=1
            elif case_key==DIFFERENT and earlier==[OLD_IMAGE] and fresh==[NEW_IMAGE]:
                # The current case requires its own distinct whole-image verdict.
                peer_raw=(PROOF/'changed-raster-independent-reading.json').read_bytes()
                decision=json.loads(peer_raw)
                if (decision['caseKey']!=DIFFERENT or decision['currentSha256']!=NEW_IMAGE
                    or decision['previousSha256']!=OLD_IMAGE or decision['verdict']!='PASS_BOUNDED'
                    or decision['reviewer']=='Root' or decision['runtimeSha256']!=RUNTIME or not decision['observations']):
                    raise ValueError('The single changed C5 raster needs a positive independent reading')
                different.append({'caseKey':case_key,'freshReviewSha256':sha(peer_raw),'observations':decision['observations']})
            else:
                raise ValueError('A C5 raster differs without current independent scope: '+case_key)
    return {'independentReviewCommit':PEER,'identicalFreshRasters':same,'rereadOnCurrentRuntime':different,
            'measuredScope':verdict['actuallyReadScope'],'reason':verdict['reason']}


def report(sources,package,bindings):
    profile=runtime_fingerprint(APP)
    if profile['sha256']!=RUNTIME:
        raise ValueError('C5 technical and visual evidence is specific to f357')
    selected=read('selected-packages.json')
    keys=set(sources)
    batch=next((name for name,spec in selected.items() if set(spec['ids'])==keys),None)
    if batch is None:
        raise ValueError('Expected one exact reviewed C5 package')
    cases,actual_drafts=observed()
    verified_bytes('prior-independent-case-observations.zip',PRIOR)
    math_records={row['id']:row for name in ('science-basis.json','science-energy-sound.json') for row in read(name)['records']}
    updated=read('science-amendments.json')
    if updated['finalCandidateCommit']!=AUTHOR or updated['humanApproval']!='NOT_RUN':
        raise ValueError('Final scientific wording review belongs to a different package')
    final={r['id']:r for r in updated['finalRecords']}
    index={r['id']:r for r in read('visual-index.json')['records']}
    names=sorted(selected)
    receipt=read('actual-installed-assessments.json')
    same=json.loads(subprocess.check_output(['node',str(PROOF/'collect-assessments.mjs'),str(APP),*names],cwd=APP,timeout=45))
    if {r['id']:r for r in receipt['records']}!={r['id']:r for r in same['records']}:
        raise ValueError('Current experiment assessment drifted')
    installed={row['id']:row for row in receipt['records']}
    prose={}
    for name in ('c5-wave-basis-manual.md','c5-wave-energy-sound-manual.md'):
        for section in verified_bytes(name).decode().split('\n## `')[1:]:
            key,body=section.split('` · ',1)
            prose[key]=body.split('\n\n',1)[1].split('\n## ',1)[0].strip()
    expected={row['id']:digest({'record':row,'assets':{},'source':{'id':row['id'],
                   'ref':science.REF,'sha256':digest(sources[row['id']])}}) for row in package['records']}
    output=[]
    for record,binding,signature,assets,errors in reviewed_rows(package,bindings,expected,keys,APP/'editorial/assets'):
        key=record['id']
        suffix=key.removeprefix('SIM-C5-')
        source=sources[key]
        candidate_sha=digest(record)
        entry=math_records[key]
        pin=final[key]
        if (errors or assets or pin['candidateSha256']!=candidate_sha or digest(actual_drafts[key])!=candidate_sha
            or pin['scientificTextManualUnitsDomainsReview']!='PASS' or entry['sourceSha256']!=digest(source)
            or entry['mathUnitsDomainsAndManual']!='PASS' or source['version']!=record['baseVersion']
            or binding['sourceRef']!=science.REF or binding['sourceSha256']!=digest(source)):
            raise ValueError('Independent final scientific review or edition identity differs: '+key)
        code=installed[key]
        old_points= science.DATA[suffix][4:6]
        trials=[]
        for point,task in zip(old_points,code['sourceTasks'],strict=True):
            exact=science.exact(suffix,str(point))
            if not science.close(task['value'],exact):
                raise ValueError('Original assessment differs from exact derivation: '+key)
            trials.append({'point':str(point),'exact':str(exact),'observed':task,'scope':'published'})
        expected_answers=[]
        for point,task,peer in zip(record['assessmentSelection']['points'],code['draftTasks'],entry['tasks'],strict=True):
            exact=science.exact(suffix,str(point))
            if (not science.close(task['value'],exact) or Fraction(str(exact))!=Fraction(peer['independentlyDerivedExact'])
                or Fraction(str(point))!=Fraction(peer['inputExact']) or peer['manualArithmetic']!='PASS'):
                raise ValueError('Current assessment differs from distinct manual derivation: '+key)
            expected_answers.append((task['prompt'],Fraction(str(peer['numericEntry']))))
            trials.append({'point':str(point),'exact':str(exact),'observed':task,'scope':'draft'})
        scoped=[case for case in cases.values() if case['id']==key]
        setups=[case for case in scoped if case['caseKey'].endswith('|setup')]
        if len(scoped)!=24 or len(setups)!=8:
            raise ValueError('Current draft assessment lacks complete planned scope: '+key)
        for item in setups:
            replies=item['questions']
            if (item['axe'] or [(q['actualPrompt'],Fraction(q['input'].replace(',','.'))) for q in replies]!=expected_answers
                or not all(q['status'].startswith('Corretto.') for q in replies)):
                raise ValueError('Current consumer does not accept the two independently solved replies: '+key)
        original={'ok':True,'sourceSha256':digest(source),'sourceVersion':source['version'],
                  'manualArithmetic':science.MANUAL[suffix],'judgmentScope':'Original published numeric tasks and manual arithmetic only',
                  'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        output.append({'id':key,'ok':True,'sourceSha256':digest(source),'sourceVersion':source['version'],
                       'candidateSha256':candidate_sha,'candidateVersion':record['version'],'baseVersion':record['baseVersion'],
                       'reviewedSignature':signature,'originalEditionRetained':True,'failedPublishedEdition':False,
                       'publishedEditionReview':original,'calculationScope':'EXACT_MANUAL_CALCULATION',
                       'manualArithmetic':prose[key],'physicalAssumptions':prose[key].split('\n\n',1)[0],
                       'pedagogicalReview':'Distinct scientific reading, assigned-state reading and private canonical preview for this edition.',
                       'symbolicAssessmentChecks':trials,'visualScope':visual_for(key,index,cases,candidate_sha),
                       'actualBrowserCases':len(scoped),'actualAnswerSubmissions':2*len(setups),
                       'humanApproval':'NOT_RUN','publicationAction':'DRAFT'})
    return {'schemaVersion':'1.0.0','records':output,'acceptedCount':len(output),'runtimeSha256':RUNTIME,
            'casesArchiveSha256':ARCHIVE,'independentPeerCommit':PEER,'verifierSha256':sha(Path(__file__).read_bytes()),
            'humanApproval':'NOT_RUN','publicationAction':'NONE'}
