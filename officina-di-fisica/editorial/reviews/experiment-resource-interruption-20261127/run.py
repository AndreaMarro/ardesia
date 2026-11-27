"""Exercise a resource interruption on real browser cases without filling the disk."""

import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess


HERE = Path(__file__).resolve().parent
COLLECTOR = HERE.parents[2] / 'tools/corpus_engineering/experiment_visibility_ui.mjs'
SIMULATION = HERE / 'simulate-depleted-disk.mjs'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def observe(app, plan, out):
    out.mkdir(parents=True)
    prepared = out / 'prepared.json'
    prepared.write_bytes(plan.read_bytes())
    info = out / 'info.json'
    info.write_text(json.dumps({'candidateApp':str(app), 'prepared':str(prepared), 'output':str(out)}) + '\n')
    with (out / 'actual-process.txt').open('wb') as log:
        with subprocess.Popen(['node', '--import', str(SIMULATION), str(COLLECTOR), str(info)],
                              stdout=log, stderr=subprocess.STDOUT, start_new_session=True) as child:
            try:
                code = child.wait(timeout=180)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(child.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                child.wait()
                raise
    report_raw = (out / 'report.json').read_bytes()
    report = json.loads(report_raw)
    completed = report['cases']
    if (code != 1 or report['technicalStatus'] != 'FAIL' or 'Free disk below2GiB' not in report['failure']
            or len(completed) != 25 or len({row['caseKey'] for row in completed}) != 25
            or len(list((out / 'cases').glob('*.json'))) != 25 or not all(row['technicalOk'] for row in completed)):
        raise ValueError('The simulated resource stop did not preserve an exact 25-case prefix')
    recorded = [json.loads(line) for line in (out / 'completed-cases.jsonl').read_bytes().splitlines()]
    if recorded != completed or any(sha((out / row['file']).read_bytes()) != row['sha256'] for row in completed):
        raise ValueError('The report and raw files differ after the resource stop')
    receipt = {'realCollectorExitCode':code, 'failure':report['failure'], 'observedCasesBeforeStop':len(completed),
               'allObservedCaseKeysUnique':True, 'reportSha256':sha(report_raw), 'planSha256':sha(prepared.read_bytes()),
               'collectorSha256':sha(COLLECTOR.read_bytes()), 'injectionSha256':sha(SIMULATION.read_bytes()),
               'resourceExhaustionSimulatedAfterRealInitialDiskCheck':True, 'activityCredit':0,
               'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('app', type=Path)
    parser.add_argument('prepared', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if shutil.disk_usage(args.output.parent).free < 2 * 1024**3:
            raise ValueError('Need at least 2 GiB to start the real browser')
        observe(args.app.resolve(), args.prepared.resolve(), args.output.resolve())
