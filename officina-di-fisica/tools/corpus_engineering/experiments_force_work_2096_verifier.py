"""Verify the six force/work experiments and their observed current presentation."""

from collections import Counter
from decimal import Decimal
import json
from pathlib import Path
from zipfile import ZipFile

from . import experiments_force_work_corrected_048_verifier as physics
from .experiment_visibility_request import planned_interactions, safe, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
SEAL = 'editorial/reviews/c1-work-energy-2096-acceptance-20261127/seal.json'
IDS = set(physics.SPECS)
REOPENED = {'SIM-C1-L006-03', 'SIM-C1-L007-01', 'SIM-C1-L007-02', 'SIM-C1-L007-03'}
HOOKE = 'SIM-C1-L006-02'
PROFILES = {(width, view) for width in (320, 1280) for view in ('orbit', 'side', 'top', 'fixed_projection')}


def checked(reference):
    file = safe(APP, reference['path'])
    payload = file.read_bytes()
    if sha(payload) != reference['sha256']:
        raise ValueError('C1 acceptance evidence bytes changed: ' + reference['path'])
    return file, payload


def browser(seal, fingerprint, source):
    _, terminal_raw = checked(seal['terminal'])
    _, prepared_raw = checked(seal['prepared'])
    archive_path, _ = checked(seal['archive'])
    terminal, prepared = map(json.loads, (terminal_raw, prepared_raw))
    if (terminal['observedExitCode'] != 0 or terminal['observedSignal'] is not None or terminal['plannedCases'] != 296
            or terminal['reportSha256'] != seal['reportSha256'] or terminal['runtimeSha256'] != fingerprint['sha256']
            or prepared['runtimeFingerprint'] != fingerprint or prepared['sourceCommit'] != seal['sourceCommit']):
        raise ValueError('C1 force and work require complete current browser evidence')
    with ZipFile(archive_path) as archive:
        members = archive.namelist()
        if len(members) != len(set(members)) or sha(archive.read('report.json')) != terminal['reportSha256']:
            raise ValueError('The C1 archive does not match the producer report')
        return browser_cases(archive.read, prepared, terminal, source, sha(prepared_raw))


def browser_cases(read, prepared, terminal, source, prepared_sha):
    visible = verify_report_bytes(read, prepared, terminal['collectorSha256'])
    if visible['preparedSha256'] != prepared_sha or visible['errors']:
        raise ValueError('The browser ran a different C1 plan')
    plan = planned_interactions(prepared)
    observed = {key:{'count':0, 'setups':set(), 'screens':{}, 'submitted':set()} for key in IDS}
    for entry in visible['cases']:
        row = json.loads(read(entry['file']))
        definition, state = plan[entry['caseKey']]
        verify_planned_interaction(row, definition, state)
        key = row['id']
        if row['variant'] != 'published' or row['sourceSha256'] != digest(source[key]):
            raise ValueError('Browser evidence uses a different C1 edition')
        witness = observed[key]
        witness['count'] += 1
        witness['screens'][row['caseKey']] = {image['sha256'] for image in row['screenshots']}
        if state is None:
            profile = (row['profile']['width'], row['profile']['view'])
            if (profile in witness['setups'] or row['axe'] or len(row['phases']) != 4 or len(row['questions']) != 2
                    or not all(q['status'].startswith('Corretto. ') and q['actualPrompt'] for q in row['questions'])):
                raise ValueError('C1 setup or exact assigned answer evidence incomplete: ' + key)
            witness['setups'].add(profile)
            witness['submitted'].add(tuple(Decimal(q['input'].replace(',', '.')) for q in row['questions']))
    if any(evidence['setups'] != PROFILES for evidence in observed.values()):
        raise ValueError('Missing a C1 visualization width or preset')
    return observed


def report(sources):
    fingerprint = runtime_fingerprint(APP)
    seal_path = APP / SEAL
    seal_raw = seal_path.read_bytes()
    seal = json.loads(seal_raw)
    if seal['runtimeSha256'] != fingerprint['sha256']:
        raise ValueError('Stale C1 force and work evidence')
    original = (APP / 'content/esperienze-C1.json').read_bytes()
    if (set(sources) != IDS or sha(original) != physics.SOURCE_FILE_SHA256
            or any(digest(sources[key]) != physics.READ_SOURCE_SHA256[key] for key in IDS)):
        raise ValueError('Unreviewed C1 force and work source')
    observations = browser(seal, fingerprint, sources)
    _, peer_raw = checked(seal['peer'])
    _, test_log = checked(seal['independentTestLog'])
    peer = json.loads(peer_raw)
    verdicts = {row['id']:row for row in peer['perID']}
    if (peer['reviewer'] != 'author_vectors_b' or peer['candidateCommit'] != seal['sourceCommit']
            or peer['runtimeSha256'] != fingerprint['sha256'] or peer['actualBrowser']['reportSha256'] != seal['reportSha256']
            or peer['actualIndependentTarget']['observedExitCode'] != 0
            or peer['actualIndependentTarget']['rawSha256'] != sha(test_log) or b'Ran 6 tests' not in test_log
            or peer['actualCases'] != 296 or peer['actualAcceptedQuestionSubmissions'] != 96
            or peer['activityCredit'] != 0 or peer['humanApproval'] != 'NOT_RUN' or set(verdicts) != IDS
            or len(verdicts) != len(peer['perID'])):
        raise ValueError('Missing distinct C1 runtime review')
    _, manual_raw = checked(seal['manual'])
    _, manual_peer_raw = checked(seal['manualPeer'])
    manual_peer = json.loads(manual_peer_raw)
    if (manual_peer['role'] != 'DISTINCT_REVIEWER_B_ROOT_AUTHOR_RECUSED' or manual_peer['reviewer'] == manual_peer['author']
            or manual_peer['finalSha256'] != sha(manual_raw) or manual_peer['actualWholeManualRead'] is not True
            or manual_peer['finalFourCorrectionsReread'] is not True
            or Counter(row['id'] for row in manual_peer['records']) != Counter(IDS)
            or any(row['manualReview'] != 'PASS' for row in manual_peer['records'])):
        raise ValueError('Missing distinct review of the manual C1 procedures')
    manual_tasks = {row['id']:tuple(map(Decimal, row['actualNumericInputs'])) for row in manual_peer['records']}
    _, raster_raw = checked(seal['rasterReader'])
    raster_read = json.loads(raster_raw)
    current_images = set().union(*(images for evidence in observations.values() for images in evidence['screens'].values()))
    actual_reads = raster_read['actuallyOpened']
    if (raster_read['pending'] or len(actual_reads) != 49 or len(current_images) != 280
            or any(row['imageSha256'] not in observations[row['key'].split('|')[0]]['screens'][row['key']]
                   for row in actual_reads)):
        raise ValueError('The current C1 raster reading refers to different observed images')
    chapters = {}
    for section in manual_raw.decode().split('\n## `')[1:]:
        key, text = section.split('` · ', 1)
        _, _, body = text.partition('\n\n')
        chapters[key] = body.strip()
    if set(chapters) != IDS or not all(chapters.values()):
        raise ValueError('Incomplete manual C1 procedures')

    actual = physics.runtime_values(sources)
    comparisons = physics.compare_runtime(actual)
    checks = physics.independent_checks()
    geometry = physics.corrected_scene_checks(actual)
    rows = []
    for key in sorted(IDS):
        verdict = verdicts[key]
        visual = 'MARGINAL_SHORT_CUE_320_NOT_OCCLUSION' if key == HOOKE else 'NO_RESIDUAL_IN_OBSERVED_CASES'
        proof = observations[key]
        if (verdict['visualVerdict'] != visual or verdict['currentSourceSha256'] != digest(sources[key])
                or verdict['currentActualCases'] != proof['count'] or verdict['currentSetupCases'] != 8
                or verdict['currentPriorityPNGsActuallyOpened'] < 8
                or proof['submitted'] != {manual_tasks[key]}
                or not comparisons[key]['ok'] or not all(row['ok'] for row in checks[key] + geometry[key])):
            raise ValueError('C1 independent control or observation failed: ' + key)
        rows.append({'id':key, 'ok':True, 'sourceSha256':digest(sources[key]), 'sourceVersion':sources[key].get('version',1),
            'sourceRef':physics.SOURCE_REF, 'sourcePath':physics.SOURCE_PATH, 'sourceFileSha256':physics.SOURCE_FILE_SHA256,
            'calculationScope':'EXACT_MANUAL_CALCULATION', 'manualArithmetic':chapters[key],
            'physicalAssumptions':physics.ASSUMPTIONS[key], 'pedagogicalReview':verdict.get('detail', verdict['math']),
            'mathematicalChecks':checks[key], 'geometryChecks':geometry[key], 'runtimeComparison':comparisons[key],
            'actualObservedCases':proof['count'], 'visualVerdict':visual, 'originalEditionRetained':True,
            'failedPublishedEdition':False, 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'})
    if runtime_fingerprint(APP) != fingerprint or seal_path.read_bytes() != seal_raw:
        raise ValueError('C1 current input changed during scientific replay')
    return {'schemaVersion':'1.0.0', 'batch':physics.BATCH, 'runtimeSha256':fingerprint['sha256'],
            'records':rows, 'acceptedCount':len(rows), 'explicitlyReopenedIds':sorted(REOPENED),
            'scientificReferenceSha256':sha(Path(physics.__file__).read_bytes()),
            'verifierSha256':sha(Path(__file__).read_bytes()), 'sealSha256':sha(seal_raw),
            'manualSha256':sha(manual_raw), 'manualPeerSha256':sha(manual_peer_raw),
            'rasterEvidence':peer['rasterEvidence'], 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
