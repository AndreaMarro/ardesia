"""Verify one complete scope of eight original electrostatics activities."""
from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from . import experiments_C4_code_partial_verifier as science
from .experiment_visibility_request import planned_interactions, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint

APP = Path(__file__).resolve().parents[2]
REVIEWS = APP / 'editorial/reviews'
BATCH = 'experiments-c4-eight-originals'
PROOF = REVIEWS / 'c4-eight-originals-f357-acceptance-20261127'
EARLIER = REVIEWS / 'c4-three-originals-7c72-acceptance-20261127'
RUNTIME = 'f357b970906cb827c8e8046a42e45b35d8745179752f2a756b2affdf56bbe5f4'
COMMIT = '1dbd137840444b5a38ae49f17b00b6591f27f7d0'
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
EARLIER_IDS = {'SIM-C4-L01-01','SIM-C4-L01-02','SIM-C4-L03-01'}
CAMERA_IDS = {'SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03'}
FIELD = 'SIM-C4-L02-01'
MIDPOINT = 'SIM-C4-L02-02'
IDS = EARLIER_IDS | CAMERA_IDS | {FIELD, MIDPOINT}
FOCUSED_PATH = 'officina-di-fisica/editorial/reviews/C4-L02-01-f357-independent-b-20261127/'
PINS = {
    'actual-four-slices.zip':'619a371361afd9acea18e6ebb69356943c080bdab410fa3705ecdae022794970',
    'focused-field-observations.zip':'2afcd422ed29dd5989c92581fdcb073e6b69d5449784eae6e9b7700ef1c6d8ab',
    'sliced-terminal.json':'8235ae72d6129fadf0af4d2ce813458d25140de145067be739ee0375dee77a4d',
    'fresh-visual-peer.json':'d07a373ad40ee342a78bda371c4843cdeb5d919b0f7402a7ee8a97513421b5f2',
    'fresh-camera-visual-selection.json':'b55ae03d5c8a9e817a7d0ef6be2a2f5f9453c91b77fba0cd74162b669f092d45',
    'SIM-C4-L02-02-review.json':'e131bbd935641a9e008d9aa8222766a079f2ecc6a11834baaf31a71c48d5ac98',
    'native-panels-index.json':'38678a3181fceab87d9d76abffc5322561b0e1fde14b4d17625ef03154876ca9',
}


def pinned(path, checksum):
    raw = path.read_bytes()
    if sha(raw) != checksum:
        raise ValueError('C4 evidence SHA-256 changed: ' + path.name)
    return raw


def local(name):
    return json.loads(pinned(PROOF / name, PINS[name]))


def valid_cases(archive, directory, plan, report_sha, sources, tasks):
    read = lambda name: archive.read(directory + 'actual/' + name)
    if sha(read('report.json')) != report_sha or plan['sourceCommit'] != COMMIT or plan['runtimeFingerprint']['sha256'] != RUNTIME:
        raise ValueError('A browser slice belongs to a different runtime or source')
    report = verify_report_bytes(read, plan, COLLECTOR)
    plan_entries = planned_interactions(plan)
    cases = {}
    for entry in report['cases']:
        key = entry['caseKey']
        case = json.loads(read(entry['file']))
        row, state = plan_entries[key]
        verify_planned_interaction(case, row, state)
        activity = case['id']
        if case['sourceSha256'] != digest(sources[activity]) or case['variant'] != 'published':
            raise ValueError('An observation is detached from its published record: ' + key)
        if state is None:
            answers = case['questions']
            if (case['axe'] or len(case['phases']) != 4
                or [Fraction(item['input'].replace(',', '.')) for item in answers] != tasks[activity]
                or not all(item['status'].startswith('Corretto. ') for item in answers)):
                raise ValueError('The user-visible setup did not accept the independently solved tasks: ' + key)
        cases[key] = case
    return cases


def combined_observations(sources, tasks):
    summary = local('sliced-terminal.json')
    if len(summary['actualSlices']) != 4 or (summary['runtimeSha256'], summary['exactCandidateCommit']) != (RUNTIME, COMMIT):
        raise ValueError('The actual four-slice scope is missing')
    pinned(PROOF / 'actual-four-slices.zip', PINS['actual-four-slices.zip'])
    output = {}
    with ZipFile(PROOF / 'actual-four-slices.zip') as archive:
        parent_raw = archive.read('prepared448.json')
        if sha(parent_raw) != summary['parentPlanSha256']:
            raise ValueError('C4 parent plan changed')
        for index, report_sha in enumerate(summary['actualSlices']):
            folder = f'profiles-{index}/attempt-01/'
            terminal = json.loads(archive.read(folder + 'terminal.json'))
            if terminal['observedExitCode'] != 0 or terminal['timeoutTriggered']:
                raise ValueError('The actual C4 acquisition did not complete without interruption')
            plan = json.loads(archive.read(folder + 'plan.json'))
            cases = valid_cases(archive, folder, plan, report_sha, sources, tasks)
            if len(cases) != 112 or set(cases).intersection(output):
                raise ValueError('The browser slices overlap or one is incomplete')
            output.update(cases)
        if len(output) != 448 or set(output) != set(json.loads(parent_raw)['expectedCaseKeys']):
            raise ValueError('The fresh acquisitions do not cover the complete frozen plan exactly once')
    return output


def image_present(cases, key, checksum):
    if key not in cases or checksum not in {entry['sha256'] for entry in cases[key]['screenshots']}:
        raise ValueError('A distinct visual reading is not linked to a real acquisition: ' + key)


def focused_field(sources, tasks):
    name = 'focused-field-observations.zip'
    pinned(PROOF / name, PINS[name])
    with ZipFile(PROOF / name) as archive:
        read = lambda name: json.loads(archive.read(FOCUSED_PATH + name))
        decision = read('independent-review.json')
        terminal = read('terminal.json')
        if (decision['reviewer'] == decision['author'] or decision['id'] != FIELD
            or decision['verdict'] != 'NO_RESIDUAL_IN_SELECTED_CANARIES'
            or decision['runtimeSha256'] != RUNTIME or decision['candidateCommit'] != COMMIT
            or terminal['observedExitCode'] != 0 or terminal['signal'] is not None
            or decision['browserTerminal'] != terminal or decision['humanApproval'] != 'NOT_RUN'):
            raise ValueError('The focused field review is not positive, distinct and current')
        cases = valid_cases(archive, FOCUSED_PATH, read('prepared56.json'), terminal['reportSha256'], sources, tasks)
        selected = [row for row in read('case-index.json') if row['read']]
        reported = decision['rasterReading']
        if len(cases) != 56 or len(selected) != reported['uniqueFullFramesRead'] or len(selected) != 32:
            raise ValueError('The focused field proof has incomplete case or visual coverage')
        for row in selected:
            image_present(cases, row['caseKey'], Path(row['screenshots'][0]).stem)
        return {'scope':'Independent same-runtime 56-case run with 32 whole frames read, including 2.5, 3 and 8 cm.',
                'focusedBrowserCases':56, 'focusedActualAnswerSubmissions':16, 'caseKeysRead':[row['caseKey'] for row in selected],
                'independentPeerCommit':'f17690501d9192d59989de54041779f6fb484054',
                'priorNegativeCommit':'a8dffa5fca22d1437df2638c0c1cc89c7092e0a7'}


def scoped_visual_review(cases, sources, tasks):
    decisions = {FIELD:focused_field(sources, tasks)}
    positive_camera = local('fresh-visual-peer.json')
    selected_camera = local('fresh-camera-visual-selection.json')
    if (set(selected_camera) != CAMERA_IDS or positive_camera['runtimeSha256'] != RUNTIME
        or positive_camera['candidateCommit'] != COMMIT or positive_camera['reviewer'] == positive_camera['cameraAuthor']
        or positive_camera['observerIsDistinctFromCameraAuthor'] is not True):
        raise ValueError('The final camera raster reading is not distinct and current')
    for key, selected in selected_camera.items():
        verdict = positive_camera['observations'][key]
        profiles = {(row['width'],row['view']) for row in selected}
        if len(profiles) != 8 or verdict['status'] != 'POSITIVE_BOUNDED' or not verdict['allSelectedOrbitOriginalsRead']:
            raise ValueError('Missing positive camera evidence: ' + key)
        if [row['caseKey'] for row in selected] != verdict['caseKeys']:
            raise ValueError('Camera selection differs from recorded reading: ' + key)
        for row in selected:
            image_present(cases, row['caseKey'], row['sha256'])
        decisions[key] = {'scope':verdict['interpretation'], 'selectedCurrentCases':verdict['caseKeys']}

    midpoint = local('SIM-C4-L02-02-review.json')
    if (midpoint['reviewer'] == midpoint['author'] or midpoint['currentVerdict'] != 'NO_FINDING_IN_SELECTED_CANARIES'
        or midpoint['newFinding'] is not None or midpoint['id'] != MIDPOINT):
        raise ValueError('Distinct midpoint judgment is missing')
    selected_midpoint = [(key,Path(file).stem) for panel in local('native-panels-index.json') if panel['opened']
                         for key,file in zip(panel['cases'],panel['sourceImages'],strict=True) if key.startswith(MIDPOINT + '|')]
    if len(selected_midpoint) != midpoint['newFullFramePNGsRead'] or len({key for key,_ in selected_midpoint}) != 18:
        raise ValueError('Midpoint visual selection changed')
    for key, checksum in selected_midpoint:
        image_present(cases, key, checksum)
    decisions[MIDPOINT] = {'scope':'Eighteen independently read 1209 rasters freshly acquired as identical PNG bytes in f357; this is a confirmed image-level reproduction.',
                           'identicalFreshRasterCases':[key for key,_ in selected_midpoint],
                           'independentPeerCommit':'a8dffa5fca22d1437df2638c0c1cc89c7092e0a7'}

    old_selection = json.loads(pinned(EARLIER/'selected-canaries.json','57357f51977f3d0aa60901ebb3574195a951ee4526bbceb0156f497a2fdfdd65'))
    old_peer = json.loads(pinned(EARLIER/'visual-peer.json','a7a8be27afd6cd2f8eeaad9202b7882896293b9f378238842c4e82c4a14fc8ef'))
    verdicts = {row['id']:row for row in old_peer['perId']}
    reread = positive_camera['historicalSetupReopened']
    image_present(cases, reread['caseKey'], reread['sha256'])
    for key in EARLIER_IDS:
        relevant = [entry for sheet in old_selection['sheets'] for entry in sheet['entries'] if entry['caseKey'].startswith(key+'|')]
        verdict = verdicts[key]
        if (old_peer['reviewer'] == old_peer['candidateAuthor'] or verdict['rasterVerdict'] != 'POSITIVE_OBSERVED_CANARIES_ONLY'
            or len(relevant) != verdict['newPNGSourceFramesReadAsWholePanels']):
            raise ValueError('Earlier distinct positive coverage missing: ' + key)
        for entry in relevant:
            if entry['caseKey'] != reread['caseKey']:
                image_present(cases, entry['caseKey'], entry['sha256'])
        decisions[key] = {'scope':'Earlier whole-image judgments bound through fresh identical rasters; the changed triangle setup was read again on f357.',
                          'caseKeys':[entry['caseKey'] for entry in relevant],
                          'rereadOnThisCandidate':reread if key=='SIM-C4-L03-01' else None}
    return decisions


def report(sources):
    profile = runtime_fingerprint(APP)
    if profile['sha256'] != RUNTIME:
        raise ValueError('This C4 evidence requires the exact f357 runtime')
    source_raw = (APP / 'content/esperienze-C4.json').read_bytes()
    full = {row['id']:row for row in json.loads(source_raw)}
    if sha(source_raw) != science.SOURCE_SHA or set(sources) != IDS or sources != {key:full[key] for key in IDS}:
        raise ValueError('The eight exact original records changed')
    peer = json.loads(pinned(EARLIER/'manual-peer.json','49420cba38995afa65960302ef9e2576c23760760062571bcb3f24bcadb8a99c'))
    prose = pinned(EARLIER/'manual-reviewed.md','733d368cd630d35a2fdda679f02fea6459f924cadbe777aa73cf1a964c8e7240')
    if peer['author'] == peer['reviewer'] or peer['findings'] or peer['manualSha256'] != sha(prose):
        raise ValueError('Distinct exact-arithmetic review is missing')
    manual_rows = {row['id']:row for row in peer['perId']}
    tasks = {key:[Fraction(value) for value in manual_rows[key]['independentExactTasks']] for key in IDS}
    cases = combined_observations(sources, tasks)
    visual = scoped_visual_review(cases, sources, tasks)
    collector = APP / 'tests/corpus/collect-C4-bounded-code-only.mjs'
    installed = json.loads(subprocess.check_output(['node',str(collector),'electrostatics'],cwd=APP,timeout=45))
    math = {row['id']:row for row in science.compare('electrostatics',installed,full)}
    chapters = {}
    for section in prose.decode().split('\n## `')[1:]:
        key, body = section.split('` · ',1)
        chapters[key] = body.partition('\n\n')[2].strip()
    records = []
    for key in sorted(IDS):
        exact, count = manual_rows[key], sum(row['id']==key for row in cases.values())
        if (exact['textAndManualArithmetic'] != 'PASS' or not math[key]['sourceMathAndActualTasksOk']
            or exact['units'] != [sources[key]['measure']['unit']] * 2 or count==0):
            raise ValueError('Required individual scientific evidence missing: ' + key)
        records.append({'id':key,'ok':True,'sourceSha256':digest(sources[key]),'sourceVersion':sources[key]['version'],
                        'sourceRef':science.REF,'sourcePath':science.SOURCE,'calculationScope':'EXACT_MANUAL_CALCULATION',
                        'manualArithmetic':chapters[key],'physicalAssumptions':math[key]['assumptionsAndDomain'],
                        'pedagogicalReview':'Independent manual reading verified both real tasks with signs, units and an inverse check.',
                        'freshScientificChecks':math[key],'positiveRasterScope':visual[key],'actualObservedCases':count,
                        'originalEditionRetained':True,'failedPublishedEdition':False,
                        'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    if runtime_fingerprint(APP) != profile:
        raise ValueError('The active runtime changed during C4 verification')
    return {'schemaVersion':'1.0.0','batch':BATCH,'runtimeSha256':RUNTIME,'observedSourceCommit':COMMIT,
            'acceptedCount':len(records),'records':records,'actualBrowserCases':len(cases),
            'fullObservationArchiveSha256':PINS['actual-four-slices.zip'],
            'focusedObservationArchiveSha256':PINS['focused-field-observations.zip'],
            'verifierSha256':sha(Path(__file__).read_bytes()),'humanApproval':'NOT_RUN','publicationAction':'NONE'}
