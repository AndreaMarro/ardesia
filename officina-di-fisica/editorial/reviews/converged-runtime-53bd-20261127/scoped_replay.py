"""Replay frozen C2 scope and acoustics clock states on the composed runtime."""

import argparse
import fcntl
from hashlib import sha256
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time

from tools.corpus_engineering.experiment_visibility_request import (
    planned_interactions, verify_planned_interaction, verify_report,
)
from tools.corpus_engineering.pipeline import canonical, digest
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


CANDIDATE = '1b72b71a68a6023ab1c9fa189733947b03029914'
RUNTIME = '53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
CONTINUITY_PEER = '08a45e287e998f41d60a67f33c0ba46a7a5a7607'
CONTINUITY_PATH = 'officina-di-fisica/editorial/reviews/c2-draft-browser719-preflight-b-20261127'
C2_PEER = '89a653b76c5162442d9489f5f250aad6d7c116d0'
C5_PEER = '5cba6bd89e20a4bdf3b973c732b3fc031a86b192'
C2_PATH = 'officina-di-fisica/editorial/reviews/c2-c39-recovery-and-192-20261127'
C5_PATH = 'officina-di-fisica/editorial/reviews/c5-eleven-drafts-canary-7c7281-20261127'
C5_AUTHOR = 'd20c200b8731739ef512f7e2820104a7bd755202'
PULSE_FIX = ('593c82a93a1dd635461a33297d84ee8634db3fcd',
             '6efcc26c2b698fd7c1c89bde711f568359ffd5d3465780f9e9c673deae7fdbb2')
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
C2_SCOPES = {'bernoulli-120': 120, 'continuity-32': 32, 'branches-40': 40}
CONTINUITY_SCOPES = {'continuity-l00501-320': 320, 'continuity-l00501-1280': 1280}
PITOT_SCOPE = 'pitot-targeted'
C5_SCOPES = {'sound-01': 'SIM-C5-L05-01', 'sound-03': 'SIM-C5-L05-03'}


def pin(raw):
    return sha256(raw).hexdigest()


def read(path):
    return json.loads(path.read_bytes())


def freeze(path, raw):
    if path.exists():
        if path.read_bytes() != raw:
            raise ValueError('Previously frozen bytes differ: ' + str(path))
    else:
        with path.open('xb') as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    return pin(raw)


def write(path, value):
    return freeze(path, (canonical(value) + '\n').encode())


def git_blob(repo, commit, path):
    return subprocess.check_output(['git', 'show', f'{commit}:{path}'], cwd=repo, timeout=30)


def profile(app, runtime):
    fingerprint = runtime_fingerprint(app)
    collector = app / 'tools/corpus_engineering/experiment_visibility_ui.mjs'
    if fingerprint['sha256'] != runtime or pin(collector.read_bytes()) != COLLECTOR:
        raise ValueError('Runtime or collector drifted')
    return fingerprint, collector


def sound_inputs(app, repo, directory, scope):
    key = C5_SCOPES[scope]
    template = git_blob(repo, C5_PEER, C5_PATH + '/prepared.json')
    plan = json.loads(template)
    source = 'experiment-c5-wave-energy-sound-reading-20261127'
    package, bindings = [
        json.loads(git_blob(repo, C5_AUTHOR, 'officina-di-fisica/editorial/batches/' + source + suffix + '.json'))
        for suffix in ('', '-bindings')
    ]
    record, = [row for row in package['records'] if row['id'] == key]
    binding, = [row for row in bindings if row['id'] == key]
    original, = [row for row in read(app / 'content/esperienze-C5.json') if row['id'] == key]
    row, = [row for row in plan['records'] if row['id'] == key]
    assert row['candidateSha256'] == binding['candidateSha256'] == digest(record) == digest(row['record'])
    assert row['sourceSha256'] == binding['sourceSha256'] == digest(original)
    assert row['hasClock'] and not row['clockInput']
    if scope == 'sound-01':
        # Identical scalar law for the third medium. Steel at zero, half time,
        # and arrival explicitly replays the earlier clipping finding.
        grid, values = [3, 1, 2], [30, 7500 / 17, 100]
        clocks = [(0, 0, 30), (0, 15, 30), (0, 30, 30), (2, 50, 100)]
    else:
        grid, values = [30, -20, 40, 0], [1000 / 3, 1125 / 4, 4500 / 13, 300]
        clocks = [(1, 5, 20), (1, 15, 20), (2, 20, 20)]
    assert row['grid'] == grid[:2] and row['expectedValues'] == values[:2]
    clock_cases = [{'gridIndex': index, 'time': instant, 'duration': duration}
                   for index, instant, duration in clocks]
    rows = [{**row, 'grid': grid, 'expectedValues': values, 'clockCases': clock_cases}]
    batch = 'experiment-c5-' + scope + '-clock-review-20261127'
    package_file = directory / (batch + '.json')
    bindings_file = directory / (batch + '-bindings.json')
    files = {
        str(package_file): write(package_file, {**package, 'records': [record]}),
        str(bindings_file): write(bindings_file, [binding]),
    }
    profiles = plan['profiles']
    keys = []
    for projection in profiles:
        stem = '|'.join((key, 'draft', str(projection['width']), projection['view']))
        keys.extend([stem + '|setup', *(stem + f'|grid|{i}' for i in range(len(grid))),
                     *(stem + f'|clock|{i}' for i in range(len(clock_cases)))])
    return template, {**plan, 'records': rows, 'draftRecords': [record], 'expectedCaseKeys': keys,
                      'expectedDraftGridInputs': len(grid), 'expectedClockInteractions': len(clock_cases),
                      'inputFiles': files, 'packageFiles': [str(package_file)]}


def c2_inputs(repo, directory, scope):
    template = git_blob(repo, C2_PEER, f'{C2_PATH}/{scope}/prepared.json')
    plan = json.loads(template)
    assert len(plan['expectedCaseKeys']) == C2_SCOPES[scope]
    batch = 'experiment-c2-bernoulli-reading-20261127'
    files = {}
    for suffix in ('', '-bindings'):
        name = batch + suffix + '.json'
        raw = git_blob(repo, C2_PEER, f'{C2_PATH}/inputs/{name}')
        assert pin(raw) == {Path(path).name: sha for path, sha in plan['inputFiles'].items()}[name]
        file = directory / name
        files[str(file)] = freeze(file, raw)
    return template, {**plan, 'inputFiles': files, 'packageFiles': [str(directory / (batch + '.json'))]}



def continuity_inputs(repo, directory, scope):
    width = CONTINUITY_SCOPES[scope]
    template = git_blob(repo, CONTINUITY_PEER, f'{CONTINUITY_PATH}/blocks/01-{width}/prepared.json')
    plan = json.loads(template)
    assert len(plan['expectedCaseKeys']) == 80
    assert all(row['id'] == 'SIM-C2-L005-01' for row in plan['records'])
    originals = {Path(name).name: checksum for name, checksum in plan['inputFiles'].items()}
    batch = 'experiment-c2-flow-continuity-reading-20261127'
    files = {}
    for suffix in ('', '-bindings'):
        name = batch + suffix + '.json'
        raw = git_blob(repo, CONTINUITY_PEER, f'{CONTINUITY_PATH}/inputs/{name}')
        assert pin(raw) == originals[name]
        file = directory / name
        files[str(file)] = freeze(file, raw)
    return template, {**plan, 'inputFiles': files, 'packageFiles': [str(directory / (batch + '.json'))]}


def pitot_inputs(app, repo, directory):
    template = git_blob(repo, C2_PEER, f'{C2_PATH}/bernoulli-120/prepared.json')
    plan = json.loads(template)
    package, bindings = [
        json.loads(git_blob(repo, C2_PEER, f'{C2_PATH}/inputs/experiment-c2-bernoulli-reading-20261127{suffix}.json'))
        for suffix in ('', '-bindings')
    ]
    key = 'SIM-C2-L006-02'
    original, = [row for row in read(app / 'content/esperienze-C2.json') if row['id'] == key]
    draft, = [row for row in package['records'] if row['id'] == key]
    binding, = [row for row in bindings if row['id'] == key]
    prepared_draft, = [row for row in plan['records'] if row['id'] == key]
    assert prepared_draft['candidateSha256'] == binding['candidateSha256'] == digest(draft)
    assert prepared_draft['sourceSha256'] == binding['sourceSha256'] == digest(original)
    grid = [0, 0.25, 5]
    base = {**prepared_draft, 'grid': grid, 'expectedValues': [0, 1 / 32, 25 / 2]}
    published = {**base, 'variant': 'published', 'record': original, 'candidateSha256': None,
                 'questions': [
                     {'input': '8', 'expectedAccepted': True, 'sourceManualReadiness': 'MANUAL_EXACT_ORIGINAL',
                      'prompt': 'Imposta «Velocità dell’acqua» su 4 m/s. Quale valore ottieni per «Pressione dinamica»?'},
                     {'input': '3.125', 'expectedAccepted': True, 'sourceManualReadiness': 'MANUAL_EXACT_ORIGINAL',
                      'prompt': 'Su un tubo di Pitot in acqua che scorre a 2,5 m/s, di quanti kPa la pressione di ristagno supera quella statica?'},
                 ]}
    keys = []
    for row in (published, base):
        for profile in plan['profiles']:
            stem = '|'.join((key, row['variant'], str(profile['width']), profile['view']))
            keys.extend([stem+'|setup', *(stem+f'|grid|{index}' for index in range(len(grid)))])
    batch = 'experiment-c2-pitot-targeted-53bd-20261127'
    package_file = directory / (batch + '.json')
    bindings_file = directory / (batch + '-bindings.json')
    files = {str(package_file): write(package_file, {**package, 'records': [draft]}),
             str(bindings_file): write(bindings_file, [binding])}
    return template, {**plan, 'records': [published, base], 'draftRecords': [draft],
                      'expectedCaseKeys': keys, 'expectedOriginalGridInputs': len(grid),
                      'expectedDraftGridInputs': len(grid), 'inputFiles': files, 'packageFiles': [str(package_file)]}

def prepare(app, directory, repo, scope, candidate, runtime):
    directory.mkdir(parents=True, exist_ok=True)
    inputs = directory / 'inputs'
    inputs.mkdir(exist_ok=True)
    if scope in C2_SCOPES:
        template, plan = c2_inputs(repo, inputs, scope)
        template_ref = C2_PEER
    elif scope in CONTINUITY_SCOPES:
        template, plan = continuity_inputs(repo, inputs, scope)
        template_ref = CONTINUITY_PEER
    elif scope == PITOT_SCOPE:
        template, plan = pitot_inputs(app, repo, inputs)
        template_ref = C2_PEER
    else:
        template, plan = sound_inputs(app, repo, inputs, scope)
        template_ref = C5_PEER
    fingerprint, _ = profile(app, runtime)
    request = {'schemaVersion': '1.0.0', 'scope': scope, 'sourceCommit': candidate,
               'runtimeSha256': runtime, 'templateCommit': template_ref,
               'templateSha256': freeze(directory / 'earlier-prepared.json', template),
               'inputFiles': plan['inputFiles'], 'activityCredit': 0,
               'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    request_file = directory / 'request.json'
    plan = {**plan, 'scope': scope, 'sourceCommit': candidate, 'runtimeFingerprint': fingerprint,
            'requestFile': str(request_file), 'requestSha256': write(request_file, request)}
    planned_interactions(plan)
    prepared = directory / 'prepared.json'
    write(prepared, plan)
    write(directory / 'browser-info.json',
          {'candidateApp': str(app), 'prepared': str(prepared), 'output': str(directory / 'actual')})
    print(scope, len(plan['expectedCaseKeys']), pin(prepared.read_bytes()), flush=True)


def run(app, directory, lock_file, candidate, runtime):
    fingerprint, collector = profile(app, runtime)
    plan = read(directory / 'prepared.json')
    assert plan['runtimeFingerprint'] == fingerprint and plan['sourceCommit'] == candidate
    assert all(pin(Path(name).read_bytes()) == pin_value for name, pin_value in plan['inputFiles'].items())
    terminal_file = directory / 'terminal.json'
    if not terminal_file.exists():
        with lock_file.open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            free_bytes = shutil.disk_usage(directory).free
            if free_bytes < 2 * 1024**3:
                raise ValueError('Insufficient free disk for bounded browser')
            start = time.monotonic()
            timed_out = False
            env = {**os.environ, 'PYTHONDONTWRITEBYTECODE': '1',
                   'PATH': str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH']}
            with (directory / 'process.txt').open('xb') as log, subprocess.Popen(
                ['node', str(collector), str(directory / 'browser-info.json')], cwd=app, env=env,
                stdout=log, stderr=subprocess.STDOUT, start_new_session=True,
            ) as process:
                try:
                    code = process.wait(timeout=220)
                except subprocess.TimeoutExpired:
                    timed_out = True
                    os.killpg(process.pid, signal.SIGTERM)
                    try:
                        code = process.wait(timeout=8)
                    except subprocess.TimeoutExpired:
                        os.killpg(process.pid, signal.SIGKILL)
                        code = process.wait()
            write(terminal_file, {'observedExitCode': code, 'timeoutTriggered': timed_out,
                                  'seconds': time.monotonic() - start, 'startingFreeBytes': free_bytes})
    terminal = read(terminal_file)
    if terminal['observedExitCode'] or terminal['timeoutTriggered']:
        raise ValueError('Actual browser failure preserved in ' + str(directory))
    assert profile(app, runtime)[0] == fingerprint
    actual = directory / 'actual'
    report = verify_report(actual, plan, COLLECTOR)
    assert report['preparedSha256'] == pin((directory / 'prepared.json').read_bytes())
    required = planned_interactions(plan)
    responses = 0
    for meta in report['cases']:
        case = read(actual / meta['file'])
        row, state = required[meta['caseKey']]
        verify_planned_interaction(case, row, state)
        assert case['sourceSha256'] == row['sourceSha256'] and case['candidateSha256'] == row['candidateSha256']
        if state is None and row['variant'] == 'draft':
            assert not case['axe'] and len(case['questions']) == 2
            assert all(task['status'].startswith('Corretto.') for task in case['questions'])
            responses += len(case['questions'])
    result = {'scope': plan['scope'], 'technicalCases': len(report['cases']), 'draftResponses': responses,
              'reportSha256': pin((actual / 'report.json').read_bytes()), 'runtimeSha256': runtime,
              'activityCredit': 0, 'publicationAction': 'NONE', 'humanApproval': 'NOT_RUN'}
    write(directory / 'actual-summary.json', result)
    print(json.dumps(result), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=('prepare', 'run'))
    parser.add_argument('scope', choices=(*C2_SCOPES, *CONTINUITY_SCOPES, PITOT_SCOPE, *C5_SCOPES))
    parser.add_argument('app', type=Path)
    parser.add_argument('directory', type=Path)
    parser.add_argument('source', type=Path, help='Input Git repository for prepare, shared lock file for run')
    parser.add_argument('--pulse-layer-fix', action='store_true', help='Use the exact isolated acoustic correction')
    args = parser.parse_args()
    if args.pulse_layer_fix and args.scope != 'sound-01':
        parser.error('The pulse-layer correction replay applies only to sound-01')
    candidate, runtime = PULSE_FIX if args.pulse_layer_fix else (CANDIDATE, RUNTIME)
    if args.phase == 'prepare':
        prepare(args.app.resolve(), args.directory.resolve(), args.source.resolve(), args.scope, candidate, runtime)
    else:
        run(args.app.resolve(), args.directory.resolve(), args.source.resolve(), candidate, runtime)
