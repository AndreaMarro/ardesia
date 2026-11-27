"""Reconcile sealed experiment observations with individual draft acceptance."""
import json
from pathlib import PurePosixPath

from .pipeline import digest, sha


def read_json(archive, path, checksum=None):
    raw = archive.read(path)
    if checksum is not None and sha(raw) != checksum:
        raise ValueError('Observation checksum mismatch: ' + path)
    return json.loads(raw)


def normalise_numbers(value):
    """Use one JSON representation for integral numbers while preserving types otherwise."""
    if type(value) is float and value.is_integer():
        return int(value)
    if isinstance(value, list):
        return [normalise_numbers(item) for item in value]
    if isinstance(value, dict):
        return {key:normalise_numbers(item) for key, item in value.items()}
    return value


def read_slice(archive, folder, *, key, variant, version, source, candidate, runtime, collector, draft_record=None):
    report = read_json(archive, folder + '/actual/report.json')
    prepared = read_json(archive, folder + '/prepared.json', report['preparedSha256'])
    terminal = read_json(archive, folder + '/actual-terminal.json')
    if (terminal['actualObservedExitCode'], terminal['supervisorResultExitCode'], terminal['signal'],
        terminal['timedOut'], terminal['assistedTermination']) != (0, 0, None, False, False):
        raise ValueError('The real browser did not terminate successfully: ' + folder)
    if (report['technicalStatus'] != 'ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED'
        or report['errors'] or report['runtimeFingerprint']['sha256'] != runtime
        or report['protocolSha256'] != collector or report['humanApproval'] != 'NOT_RUN'
        or report['guestIsolation'] != 'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403'):
        raise ValueError('Observation runtime, isolation or status mismatch: ' + folder)
    scope = prepared['records']
    if len(scope) != 1 or any(scope[0].get(name) != value for name, value in {
        'id':key, 'variant':variant, 'sourceSha256':source,
    }.items()):
        raise ValueError('Prepared observation is for a different record: ' + folder)
    observed_candidate = scope[0].get('candidateSha256')
    if variant == 'draft':
        complete = [row for row in prepared['draftRecords'] if row['id'] == key]
        selected = scope[0]['record']
        if (len(complete) != 1 or draft_record is None or digest(draft_record) != candidate
            or digest(complete[0]) != candidate or digest(selected) != observed_candidate
            or digest(normalise_numbers(selected)) != digest(normalise_numbers(draft_record))):
            raise ValueError('Observed record differs from its complete canonical owner record: ' + key)
        owner = [row for row in report['fullOwnerRecordIdentity']['records'] if row['id'] == key]
        if len(owner) != 1 or owner[0]['version'] != version:
            raise ValueError('Owner did not receive the expected draft version: ' + key)
    elif observed_candidate is not None:
        raise ValueError('Published observation unexpectedly carries a draft identity: ' + key)
    planned = prepared['expectedCaseKeys']
    observed = [row['caseKey'] for row in report['cases']]
    if len(planned) != len(set(planned)) or len(observed) != len(set(observed)) or set(planned) != set(observed):
        raise ValueError('Missing, repeated or unplanned real cases: ' + folder)

    cases = {}
    screenshots = {}
    for entry in report['cases']:
        path = entry['file']
        if PurePosixPath(path).parent.as_posix() != 'cases' or not path.endswith('.json'):
            raise ValueError('Malformed observation location: ' + path)
        case = read_json(archive, folder + '/actual/' + path, entry['sha256'])
        if entry['technicalOk'] is not True or any(case.get(name) != value for name, value in {
            'caseKey':entry['caseKey'], 'technicalOk':True, 'id':key, 'variant':variant,
            'sourceSha256':source, 'candidateSha256':observed_candidate, 'runtimeSha256':runtime,
            'protocolSha256':collector, 'sourceCommit':report['sourceCommit'],
        }.items()):
            raise ValueError('Raw case is not bound to its report and edition: ' + path)
        cases[entry['caseKey']] = case
        for image in case.get('screenshots', []):
            relative = image['file']
            if relative != 'screens/' + image['sha256'] + '.png':
                raise ValueError('Malformed raster location: ' + relative)
            if relative not in screenshots:
                raw = archive.read(folder + '/actual/' + relative)
                if sha(raw) != image['sha256'] or not raw.startswith(b'\x89PNG\r\n\x1a\n'):
                    raise ValueError('Raster checksum or signature mismatch: ' + relative)
                screenshots[relative] = image['sha256']
    return report, cases, observed_candidate


def observed_answers(cases, expected):
    setups = [case for case in cases.values() if case['caseKey'].endswith('|setup')]
    if not setups:
        raise ValueError('No actual assessment interactions')
    for case in setups:
        questions = case['questions']
        if [(row['input'], row['expectedAccepted']) for row in questions] != expected:
            raise ValueError('Wrong submitted values or adjudication: ' + case['caseKey'])
        for question, (_, accepted) in zip(questions, expected):
            expected_prefix = 'Corretto.' if accepted else 'Rivedi il calcolo.'
            if question['actualPrompt'] != question['prompt'] or not question['status'].startswith(expected_prefix):
                raise ValueError('Actual prompt or feedback differs: ' + case['caseKey'])
    return len(setups)


def read_visual_decision(archive, folder, cases, key, variant, version, candidate, runtime, source_commit):
    review = read_json(archive, folder + '/visual-review-per-id.json')
    rows = review['records']
    if (review['runtimeSha256'], review['sourceCommit'], review['humanApproval']) != (runtime, source_commit, 'NOT_RUN'):
        raise ValueError('Independent reading belongs to a different observation epoch')
    if len(rows) != 1:
        raise ValueError('Expected a single independent visual decision')
    row = rows[0]
    if any(row.get(name) != value for name, value in {
        'id':key, 'variant':variant, 'reviewedVersion':version, 'candidateSha256':candidate, 'visualReview':'PASS',
    }.items()) or not row['reason']:
        raise ValueError('Independent positive visual decision is absent: ' + key)
    examples = row['readFiles']
    profiles = {tuple(sorted(case['profile'].items())) for case in cases.values()}
    if len(examples) != len(profiles) or {tuple(sorted(item['profile'].items())) for item in examples} != profiles:
        raise ValueError('Independent readings do not cover every profile: ' + key)
    if [item['sha256'] for item in examples] != row['readPngSha256']:
        raise ValueError('Independent reading raster list differs: ' + key)
    for item in examples:
        case = cases[item['caseKey']]
        screenshot = 'screens/' + item['sha256'] + '.png'
        if (item['path'] != (folder + '/actual/' + screenshot).removeprefix('officina-di-fisica/')
            or item['profile'] != case['profile']
            or {'file':screenshot, 'sha256':item['sha256']} not in case['screenshots']):
            raise ValueError('Independent reading is detached from the observed case: ' + item['caseKey'])
    return row
