"""Exercise the two remaining C1 reopenings and the other IDs in their families."""

import fcntl
import json
from pathlib import Path
import shutil
import subprocess
import time

from tools.corpus_engineering import experiments_foundations_revision_verifier as foundation
from tools.corpus_engineering import experiments_force_work_corrected_048_verifier as work
from tools.corpus_engineering.experiment_visibility_request import planned_interactions, verify_report
from tools.corpus_engineering.pipeline import canonical, digest, sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


BASE = 'aea9bf814e68a5c9340d930dd0698e7f12251d8b'
RUNTIME = 'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
DRAFT = 'experiment-projection-revision-118'


def write(file, data):
    file.write_text(canonical(data) + '\n')


def installed(relative):
    raw = Path(relative).read_bytes()
    git = subprocess.check_output(['git', 'show', BASE + ':officina-di-fisica/' + relative])
    if raw != git:
        raise ValueError('Input differs from the public checkpoint: ' + relative)
    return raw


def plan_records(source, draft):
    effective = dict(source)
    effective[draft['id']] = draft
    result = []
    for model in (foundation, work):
        actual = model.runtime_values(effective)
        comparison = model.compare_runtime(actual)
        exact_checks = model.independent_checks()
        for key, (lo, hi, _step, first, assessed, transfer, _unit) in model.SPECS.items():
            assert digest(source[key]) == model.READ_SOURCE_SHA256[key]
            assert comparison[key]['ok'] and all(check['ok'] for check in exact_checks[key])
            grid = sorted(set([lo, hi, first, assessed, transfer]))
            observed = {row['x']: row['output']['y'] for row in actual[key]['cases']}
            clock = actual[key].get('clock')
            clock_cases = []
            if clock:
                index = grid.index(first)
                clock_cases = [{'gridIndex': index, 'time': value} for value in (0.5, 1.5, 3.5)]
            answers = [format(float(model.exact_value(key, x)), '.8g') for x in (assessed, transfer)]
            if key == 'SIM-C1-L007-03':
                answers[1] = '2.83'  # The independent source report proves the 2.82–2.83 bracket by squaring.
            if key == 'SIM-C1-L006-03':
                answers[1] = '0.1322'  # 16/121; reviewer hand division lies within the existing grading interval.
            variant = 'draft' if key == draft['id'] else 'published'
            result.append({'id': key, 'course': 'C1', 'variant': variant, 'record': effective[key],
                           'sourceSha256': digest(source[key]), 'candidateSha256': digest(draft) if variant == 'draft' else None,
                           'grid': grid, 'expectedValues': [observed[x] for x in grid],
                           'clockCases': clock_cases, 'auxiliaryCases': [], 'hasClock': bool(clock),
                           'clockInput': bool((clock or {}).get('input')),
                           'sourcePrediction': actual[key]['prediction']['correct'],
                           'questions': [{'input': value, 'expectedAccepted': True, 'prompt': None} for value in answers],
                           'originalJudgment': {'sourceManualFailureRetained': key in foundation.SOURCE_ISSUES,
                                                'mathChecks': exact_checks[key], 'manualArithmetic': model.MANUAL[key]}})
    assert len({row['id'] for row in result}) == len(result) == 12
    return result


def main():
    app = Path.cwd()
    output = Path(__file__).resolve().parent / 'actual-ui'
    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        assert shutil.disk_usage(app).free >= 2 * 1024**3
        output.mkdir()
        observed_input = output / 'private-inputs'
        observed_input.mkdir()
        fingerprint = runtime_fingerprint(app)
        assert fingerprint['sha256'] == RUNTIME
        pinned = {}
        for suffix in ('.json', '-bindings.json'):
            name = DRAFT + suffix
            file = observed_input / name
            raw = installed('editorial/batches/' + name)
            file.write_bytes(raw)
            pinned[str(file)] = sha(raw)
        package = observed_input / (DRAFT + '.json')
        draft, = json.loads(package.read_bytes())['records']
        source_raw = installed('content/esperienze-C1.json')
        source = {row['id']: row for row in json.loads(source_raw)}
        records = plan_records(source, draft)
        collector = app / 'tools/corpus_engineering/experiment_visibility_ui.mjs'
        request = {'sourceCommit': BASE, 'runtimeSha256': RUNTIME, 'collectorSha256': sha(collector.read_bytes()),
                   'sourceSha256': sha(source_raw), 'packageFiles': pinned, 'effectiveIds': [row['id'] for row in records],
                   'scope': 'BOUND_CURRENT_TWO_C1_FAMILIES_EFFECTIVE_EDITION_ACTUAL_UI_ONLY', 'activityCredit': 0}
        request_file = output / 'request.json'
        write(request_file, request)
        profiles = [{'width': width, 'view': view, 'fallback': view == 'fixed_projection'}
                    for width in (320, 1280) for view in ('orbit', 'side', 'top', 'fixed_projection')]
        planned = {'schemaVersion': '1.0.0', 'requestSha256': sha(request_file.read_bytes()),
                   'runtimeFingerprint': fingerprint, 'sourceCommit': BASE, 'course': 'C1',
                   'scope': request['scope'], 'records': records, 'profiles': profiles,
                   'packageFiles': [str(package)], 'inputFiles': pinned, 'draftRecords': [draft]}
        keys = []
        for row in records:
            for profile in profiles:
                prefix = f"{row['id']}|{row['variant']}|{profile['width']}|{profile['view']}"
                keys.append(prefix + '|setup')
                keys.extend(prefix + '|grid|' + str(i) for i in range(len(row['grid'])))
                keys.extend(prefix + '|clock|' + str(i) for i in range(len(row['clockCases'])))
        planned['expectedCaseKeys'] = keys
        assert len(planned_interactions(planned)) == len(keys)
        prepared = output / 'prepared.json'
        write(prepared, planned)
        info = output / 'info.json'
        write(info, {'candidateApp': str(app), 'prepared': str(prepared), 'output': str(output)})
        start = time.monotonic()
        with (output / 'actual-process.txt').open('wb') as log:
            run = subprocess.run(['node', str(collector), str(info)], stdout=log, stderr=subprocess.STDOUT, timeout=900)
        assert runtime_fingerprint(app) == fingerprint
        report_file = output / 'report.json'
        receipt = {'observedExitCode': run.returncode, 'runtimeSha256': RUNTIME, 'preparedSha256': sha(prepared.read_bytes()),
                   'collectorSha256': request['collectorSha256'], 'durationSeconds': time.monotonic() - start,
                   'reportSha256': sha(report_file.read_bytes()) if report_file.exists() else None,
                   'plannedCases': len(keys), 'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
        write(output / 'terminal-receipt.json', receipt)
        print(receipt, flush=True)
        if run.returncode == 0:
            verify_report(output, planned, receipt['collectorSha256'])
        raise SystemExit(run.returncode)


if __name__ == '__main__':
    main()
