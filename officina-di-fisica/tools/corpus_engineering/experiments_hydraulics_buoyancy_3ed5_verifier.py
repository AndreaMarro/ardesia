"""Verify five original hydraulics activities on the observed current runtime."""

from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from . import experiments_hydraulics_buoyancy_code_verifier as physics
from .experiment_visibility_request import planned_interactions, safe, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
BATCH = 'experiments-hydraulics-buoyancy-five'
PROOF = APP / 'editorial/reviews/c2-hydraulics-3ed5-acceptance-20261127'
IDS = set(physics.SPECS)
PROFILES = {(width, view) for width in (320, 1280) for view in ('orbit', 'side', 'top', 'fixed_projection')}


def checked(reference):
    file = safe(APP, reference['path'])
    raw = file.read_bytes()
    if sha(raw) != reference['sha256']:
        raise ValueError('Hydraulics evidence bytes changed: ' + reference['path'])
    return file, raw


def observe(seal, fingerprint, sources, reviewed):
    archive_path, _ = checked(seal['archive'])
    _, plan_raw = checked(seal['prepared'])
    _, terminal_raw = checked(seal['terminal'])
    _, verdict_raw = checked(seal['visualPeer'])
    plan, terminal, verdict = map(json.loads, (plan_raw, terminal_raw, verdict_raw))
    if (terminal['actualObservedExitCode'] != 0 or terminal['signal'] is not None or terminal['timedOut']
            or terminal['assistedTermination'] or terminal['intervention']
            or plan['runtimeFingerprint'] != fingerprint or plan['sourceCommit'] != seal['sourceCommit']
            or verdict['sourceCommit'] != seal['sourceCommit'] or verdict['runtimeSha256'] != fingerprint['sha256']
            or verdict['role'] != 'DISTINCT_REVIEWER_A_LOCAL_BOUNDED_NEW_EPOCH' or verdict['activityCredit'] != 0
            or verdict['artifactPins']['actual/report.json']['sha256'] != seal['reportSha256']
            or verdict['artifactPins']['prepared.json']['sha256'] != sha(plan_raw)
            or verdict['artifactPins']['actual-terminal.json']['sha256'] != sha(terminal_raw)):
        raise ValueError('Hydraulics needs current observed UI and distinct visual review')
    observed = {key:{'setup':set(), 'images':{}, 'count':0} for key in IDS}
    with ZipFile(archive_path) as archive:
        if len(archive.namelist()) != len(set(archive.namelist())) or sha(archive.read('report.json')) != seal['reportSha256']:
            raise ValueError('Hydraulics archive identifies a different producer')
        actual = verify_report_bytes(archive.read, plan, seal['collectorSha256'])
        if len(actual['cases']) != 240 or actual['preparedSha256'] != sha(plan_raw) or actual['errors']:
            raise ValueError('The current experiment plan did not run to completion')
        stages = planned_interactions(plan)
        for item in actual['cases']:
            row = json.loads(archive.read(item['file']))
            definition, state = stages[item['caseKey']]
            verify_planned_interaction(row, definition, state)
            key = row['id']
            if row['sourceSha256'] != digest(sources[key]) or row['variant'] != 'published':
                raise ValueError('The observed experiment differs from its original edition')
            result = observed[key]
            result['count'] += 1
            result['images'][item['caseKey']] = {image['sha256'] for image in row['screenshots']}
            if state is not None:
                if not physics.near(row['model']['y'], physics.exact_value(key, state['x'])):
                    raise ValueError('Observed reading differs from the exact law: ' + key)
                continue
            profile = (row['profile']['width'], row['profile']['view'])
            tasks = reviewed[key]['actualAssignedTasks']
            if (profile in result['setup'] or row['axe'] or len(row['phases']) != 4 or len(row['questions']) != len(tasks)
                    or any(q['actualPrompt'] != t['actualPrompt'] or not q['status'].startswith('Corretto. ')
                           or Fraction(q['input'].replace(',', '.')) != Fraction(t['independentExact'])
                           for q, t in zip(row['questions'], tasks, strict=True))):
                raise ValueError('An actual assigned manual answer or accessible setup failed: ' + key)
            result['setup'].add(profile)
    decisions = {row['id']:row for row in verdict['records']}
    if set(decisions) != IDS or len(verdict['records']) != len(IDS):
        raise ValueError('Missing individual hydraulics visual verdict')
    for key, review in decisions.items():
        files = review['readFiles']
        observed_cases = observed[key]
        if (review['visualReview'] != 'PASS' or review['openFindingIds'] or review['sourceRecordSha256'] != digest(sources[key])
                or review['sourceVersion'] != sources[key]['version'] or review['scope']['actualCaseCount'] != observed_cases['count']
                or review['manualSupportFinalSha256'] != seal['manual']['sha256'] or observed_cases['setup'] != PROFILES
                or len(files) != len(PROFILES) or {(r['profile']['width'], r['profile']['view']) for r in files} != PROFILES
                or any(row['wholeRawPngOpenedAndRead'] is not True
                       or row['sha256'] not in observed_cases['images'][row['caseKey']] for row in files)):
            raise ValueError('Hydraulics visual review does not cover the observed activity: ' + key)
    return decisions


def report(sources):
    fingerprint = runtime_fingerprint(APP)
    seal_file = PROOF / 'seal.json'
    raw_seal = seal_file.read_bytes()
    seal = json.loads(raw_seal)
    if seal['runtimeSha256'] != fingerprint['sha256']:
        raise ValueError('The hydraulics activity proof uses a stale runtime')
    raw_source = (APP / 'content/esperienze-C2.json').read_bytes()
    original = {row['id']:row for row in json.loads(raw_source) if row['id'] in IDS}
    if sources != original or sha(raw_source) != physics.SOURCE_FILE_SHA256:
        raise ValueError('The original five hydraulics records changed')
    _, manual_raw = checked(seal['manual'])
    _, peer_raw = checked(seal['manualPeer'])
    manual_review = json.loads(peer_raw)
    manual_records = {row['id']:row for row in manual_review['records']}
    if (manual_review['role'] != 'DISTINCT_REVIEWER_A_ROOT_AUTHOR_RECUSED' or manual_review['finalSha256'] != sha(manual_raw)
            or manual_review['actualWholeManualRead'] is not True or not manual_review['finalTwoCorrectionsReread']
            or set(manual_records) != IDS or len(manual_review['records']) != len(IDS)):
        raise ValueError('The current manual procedures lack distinct review')
    chapters = {}
    for chapter in manual_raw.decode().split('\n## `')[1:]:
        key, body = chapter.split('` · ', 1)
        _, _, text = body.partition('\n\n')
        chapters[key] = text.strip()
    if set(chapters) != IDS or not all(chapters.values()):
        raise ValueError('Missing a manual hydraulics procedure')
    protocol, protocol_raw = checked(seal['installedCollector'])
    installed_raw = subprocess.check_output(['node', str(protocol)], cwd=APP, timeout=45)
    installed = json.loads(installed_raw)
    if (installed['sourceRef'] != physics.SOURCE_REF or installed['sourcePath'] != physics.SOURCE_PATH
            or installed['sourceFileSha256'] != physics.SOURCE_FILE_SHA256 or installed['protocolSha256'] != sha(protocol_raw)
            or set(installed['sourceIds']) != IDS):
        raise ValueError('Installed hydraulics sampler changed provenance')
    exact = physics.exact_checks()
    fresh = physics.compare_installed(installed)
    for key, reviewed in manual_records.items():
        tasks = fresh[key]['actualAssignedTasks']
        if (reviewed['manualReview'] != 'PASS' or not fresh[key]['ok'] or not all(x['ok'] for x in exact[key])
                or [task['independentExact'] for task in tasks] != reviewed['actualInstalledTaskAnswersExact']
                or any(task['unit'] != reviewed['unit'] for task in tasks)):
            raise ValueError('The actual assigned task differs from the reviewed manual method: ' + key)
    decisions = observe(seal, fingerprint, sources, fresh)
    if runtime_fingerprint(APP) != fingerprint or seal_file.read_bytes() != raw_seal:
        raise ValueError('Hydraulics inputs were modified during verification')
    records = []
    for key in sorted(IDS):
        records.append({'id':key, 'ok':True, 'sourceSha256':digest(sources[key]), 'sourceVersion':sources[key]['version'],
            'sourceRef':physics.SOURCE_REF, 'sourcePath':physics.SOURCE_PATH, 'calculationScope':'EXACT_MANUAL_CALCULATION',
            'manualArithmetic':chapters[key], 'physicalAssumptions':chapters[key].split('\n\n')[0],
            'pedagogicalReview':decisions[key]['reason'], 'scientificChecks':exact[key], 'installedChecks':fresh[key],
            'actualObservedCases':decisions[key]['scope']['actualCaseCount'], 'originalEditionRetained':True,
            'failedPublishedEdition':False, 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'})
    return {'schemaVersion':'1.0.0', 'batch':BATCH, 'runtimeSha256':fingerprint['sha256'], 'records':records,
            'acceptedCount':len(records), 'sealSha256':sha(raw_seal), 'manualPeerSha256':sha(peer_raw),
            'installedCollectionSha256':sha(installed_raw), 'verifierSha256':sha(Path(__file__).read_bytes()),
            'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
