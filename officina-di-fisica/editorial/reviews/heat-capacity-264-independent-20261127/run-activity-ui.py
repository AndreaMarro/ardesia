"""Observe both immutable heat-capacity editions with the existing UI producer."""

import argparse
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess

from tools.corpus_engineering import experiment_heat_capacity_264_independent_verifier as science
from tools.corpus_engineering import experiment_visibility_request as ui
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint

APP = Path(__file__).resolve().parents[3]
COLLECTOR = APP / 'tools/corpus_engineering/experiment_visibility_ui.mjs'
PACKAGE = 'experiment-heat-capacity-revision-264'
COURSE = 'C3'


def write(path, record):
    path.write_bytes(ui.canonical(record) + b'\n')


def installed(app, commit, name):
    payload = (app / name).read_bytes()
    committed = subprocess.check_output(['git', 'show', f'{commit}:officina-di-fisica/{name}'], cwd=app)
    if payload != committed:
        raise ValueError(f'Observed input differs from Git at {commit}: {name}')
    return payload


def prepare(app, commit, runtime, output):
    fp = runtime_fingerprint(app)
    if fp['sha256'] != runtime:
        raise ValueError('Current runtime differs from the requested fingerprint')
    source_ref = f'content/esperienze-{COURSE}.json'
    source_bytes = installed(app, commit, source_ref)
    sources = {row['id']: row for row in json.loads(source_bytes)}
    inputs = output / 'private-inputs'
    inputs.mkdir(parents=True)
    package, bindings = (inputs / (PACKAGE + ending) for ending in ('.json', '-bindings.json'))
    for target in (package, bindings):
        target.write_bytes(installed(app, commit, 'editorial/batches/' + target.name))
    package_data, binding_data = (json.loads(target.read_bytes()) for target in (package, bindings))
    historical = json.loads(Path(__file__).with_name('actual-code-probe.json').read_bytes())
    record, = science.report(sources, package_data, binding_data, historical)['records']
    draft, = package_data['records']
    if record['candidateTextMathManualReview']['ok'] is not True or record['publishedEditionReview']['ok'] is not False:
        raise ValueError('Expected independently reviewed draft and distinct source-edition finding')
    input_files = {str(file): ui.sha(file.read_bytes()) for file in (package, bindings)}
    protocol = ui.sha(COLLECTOR.read_bytes())
    request = {'sourceCommit':commit, 'runtimeSha256':runtime, 'collectorSha256':protocol,
               'sourceFileSha256':ui.sha(source_bytes), 'reviewSha256':ui.sha(Path(science.__file__).read_bytes()),
               'inputFiles':input_files, 'scope':'EXACT_HEAT_CAPACITY_SOURCE_AND_DRAFT_UI', 'activityCredit':0}
    request_file = output / 'request.json'
    write(request_file, request)

    profiles = [{'width':width, 'view':view, 'fallback':view == 'fixed_projection'}
                for width in (320, 1280) for view in ('orbit', 'side', 'top', 'fixed_projection')]
    grid = list(range(50, 301, 25))
    questions = [
        {'input':'100', 'expectedAccepted':True,
         'prompt':'Imposta «Massa del campione» su 250 g. Quale valore ottieni per «Capacità termica»?'},
        {'input':'70', 'expectedAccepted':True, 'prompt':draft['transferPrompt'].replace('{x}', '175 g')},
    ]
    common = {'id':science.KEY, 'course':COURSE, 'sourceSha256':science.SOURCE_SHA, 'grid':grid,
              'expectedValues':[float(science.capacity(mass)) for mass in grid], 'questions':questions,
              'clockCases':[], 'auxiliaryCases':[], 'hasClock':False, 'clockInput':False, 'sourcePrediction':2,
              'originalJudgment':record['publishedEditionReview']}
    published = {**common, 'variant':'published', 'record':sources[science.KEY], 'candidateSha256':None}
    revised = {**common, 'variant':'draft', 'record':draft, 'candidateSha256':record['candidateSha256']}
    keys = []
    for row in (published, revised):
        for profile in profiles:
            base = f"{science.KEY}|{row['variant']}|{profile['width']}|{profile['view']}"
            keys.append(base + '|setup')
            keys.extend(base + '|grid|' + str(index) for index in range(len(grid)))
    plan = {'schemaVersion':'1.0.0', 'course':COURSE, 'requestSha256':ui.sha(request_file.read_bytes()),
            'scope':request['scope'], 'sourceCommit':commit, 'runtimeFingerprint':fp, 'records':[published, revised],
            'profiles':profiles, 'expectedCaseKeys':keys, 'draftRecords':[draft], 'packageFiles':[str(package)],
            'inputFiles':input_files}
    assert len(ui.planned_interactions(plan)) == 192
    write(output / 'prepared.json', plan)
    write(output / 'info.json', {'candidateApp':str(app), 'prepared':str(output / 'prepared.json'), 'output':str(output)})
    return plan, protocol


def observe(app, plan, protocol, output):
    with (output / 'actual-process.txt').open('wb') as log:
        result = subprocess.run(['node', str(COLLECTOR), str(output / 'info.json')], cwd=APP,
                                env=os.environ.copy(), stdout=log, stderr=subprocess.STDOUT, timeout=480)
    report_file = output / 'report.json'
    write(output / 'terminal-receipt.json', {'observedExitCode':result.returncode,
          'sourceCommit':plan['sourceCommit'], 'runtimeSha256':plan['runtimeFingerprint']['sha256'],
          'collectorSha256':protocol, 'preparedSha256':ui.sha((output / 'prepared.json').read_bytes()),
          'plannedCases':len(plan['expectedCaseKeys']), 'reportSha256':ui.sha(report_file.read_bytes()) if report_file.exists() else None,
          'activityCredit':0, 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'})
    result.check_returncode()
    if runtime_fingerprint(app) != plan['runtimeFingerprint']:
        raise ValueError('Actual runtime changed during collection')
    report = ui.verify_report(output, plan, protocol)
    planned = ui.planned_interactions(plan)
    for entry in report['cases']:
        actual = json.loads((output / entry['file']).read_bytes())
        ui.verify_planned_interaction(actual, *planned[entry['caseKey']])
    print('192 verified technical cases across both editions. Separate review required.', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app', type=Path, required=True)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--runtime', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--prepare-only', action='store_true')
    args = parser.parse_args()

    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if shutil.disk_usage(args.app).free < 2 * 1024**3:
            raise ValueError('Need at least 2 GiB free')
        output = args.output.resolve()
        output.mkdir(parents=True)
        plan, protocol = prepare(args.app.resolve(strict=True), args.commit, args.runtime, output)
        if not args.prepare_only:
            observe(args.app, plan, protocol, output)
