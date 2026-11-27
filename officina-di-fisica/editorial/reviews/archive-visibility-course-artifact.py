"""Archive one exact GitHub experiment-course ZIP and replay the existing verifier."""

import argparse
import hashlib
import json
import re
import shutil
import stat
import tempfile
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

from tools.corpus_engineering.experiment_visibility_request import verify_report


COURSES = {'C2': 7440, 'C3': 11808, 'C4': 7872, 'C5': 14464, 'C6': 3992}
PART_BYTES = 40 * 1024**2
COLLECTOR = 'officina-di-fisica/tools/corpus_engineering/experiment_visibility_ui.mjs'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_member(name):
    path = PurePosixPath(name)
    require(not path.is_absolute() and '..' not in path.parts and '\\' not in name, name)
    require(name.rstrip('/') == str(path), name)
    return path


def inspect_members(archive):
    parts = archive.infolist()
    names = {part.filename for part in parts}
    require(len(parts) == len(names), 'Duplicate ZIP member')
    for part in parts:
        safe_member(part.filename)
        require(not stat.S_ISLNK(part.external_attr >> 16), part.filename)
    require(archive.testzip() is None, 'ZIP CRC failure')
    return names


def evidence(archive, names, workspace, course, request, request_sha, run_id, head, protocol_sha):
    directory = f'_temp/experiment-{course}/evidence/'
    prepared_raw = archive.read(directory + 'prepared.json')
    plan = json.loads(prepared_raw)
    pin = sha(prepared_raw)
    require(plan['requestSha256'] == request_sha, 'Wrong prepared request')
    require(plan['sourceCommit'] == request['candidateRef'], 'Wrong candidate source')
    require(plan['runtimeFingerprint']['sha256'] == request['runtimeSha256'], 'Wrong runtime')
    rows = {item['id'] for item in plan['records']}
    planned_cases = set(plan['expectedCaseKeys'])
    require(len(planned_cases) == len(plan['expectedCaseKeys']) == COURSES[course], 'Wrong case count')
    summaries = {'prepared.json': prepared_raw}
    result = {'plannedCases': len(planned_cases), 'recordIds': sorted(rows), 'observedCases': 0,
              'technicalPass': 0, 'technicalFail': 0, 'caseAndPngHashesVerified': False,
              'fullCanonicalTechnicalVerification': False, 'terminalStatus': 'NO_TERMINAL_RECEIPT'}
    terminal_path = directory + 'terminal-receipt.json'
    if terminal_path in names:
        raw = archive.read(terminal_path)
        terminal = json.loads(raw)
        expected = {'candidateRef': request['candidateRef'], 'requestSha256': request_sha, 'course': course,
                    'runtimeSha256': request['runtimeSha256'], 'protocolSha256': protocol_sha,
                    'preparedSha256': pin, 'githubRunId': str(run_id), 'githubSha': head,
                    'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
        require(all(terminal.get(k) == v for k, v in expected.items()), 'Wrong terminal provenance')
        result['terminalStatus'] = terminal['terminalStatus']
        result['observedExitCode'] = terminal['observedExitCode']
        summaries['terminal-receipt.json'] = raw
    report_path = directory + 'report.json'
    if report_path not in names:
        return result, summaries
    raw = summaries['report.json'] = archive.read(report_path)
    report = json.loads(raw)
    expected = {'preparedSha256': pin, 'requestSha256': request_sha, 'sourceCommit': request['candidateRef'],
                'runtimeFingerprint': plan['runtimeFingerprint'], 'protocolSha256': protocol_sha,
                'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    require(all(report.get(k) == v for k, v in expected.items()), 'Wrong report provenance')
    seen, images, failures = set(), {}, []
    positive = result['terminalStatus'] == 'COMPLETE_TECHNICAL_EVIDENCE_REQUIRES_SCI_REVIEW'
    if positive:
        (workspace / 'report.json').write_bytes(raw)
    for item in report['cases']:
        key = item['caseKey']
        filename = safe_member(item['file'])
        payload = archive.read(directory + str(filename))
        case = json.loads(payload)
        require(key in planned_cases and key not in seen, 'Unexpected or duplicate case: ' + key)
        case_expected = {'caseKey': key, 'technicalOk': item['technicalOk'],
                         'sourceCommit': request['candidateRef'], 'requestSha256': request_sha,
                         'runtimeSha256': request['runtimeSha256'], 'protocolSha256': protocol_sha,
                         'activityCredit': 0, 'scientificApproval': False, 'humanApproval': 'NOT_RUN',
                         'publicationAction': 'NONE'}
        require(sha(payload) == item['sha256'] and type(item['technicalOk']) is bool
                and all(case.get(k) == v for k, v in case_expected.items()), 'Case provenance: ' + key)
        seen.add(key)
        if positive:
            target = workspace / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
        if item['technicalOk']:
            require(bool(case.get('screenshots')), 'Observed case without PNG: ' + key)
        else:
            failures.append({'caseKey': key, 'error': case.get('error'), 'modelRecorded': 'model' in case})
        for image in case.get('screenshots', []):
            relative = safe_member(image['file'])
            if relative not in images:
                png = archive.read(directory + str(relative))
                require(sha(png) == image['sha256'] and png.startswith(b'\x89PNG\r\n\x1a\n'), str(relative))
                images[relative] = image['sha256']
                if positive:
                    target = workspace / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(png)
            require(images[relative] == image['sha256'], str(relative))
    if positive:
        require(result['observedExitCode'] == 0 and seen == planned_cases and not failures, 'Incomplete successful run')
        verify_report(workspace, plan, protocol_sha)
    result.update(observedCases=len(seen), technicalPass=len(seen) - len(failures), technicalFail=len(failures),
                  caseAndPngHashesVerified=True, fullCanonicalTechnicalVerification=positive,
                  reportSha256=sha(raw), failures=failures, verifiedPngCount=len(images))
    return result, summaries


def archive_course(args):
    require(re.fullmatch(r'[a-f0-9]{40}', args.head) is not None, 'Expected an immutable Git commit')
    with args.zip.open('rb') as stream:
        require(hashlib.file_digest(stream, 'sha256').hexdigest() == args.sha256, 'Upstream ZIP hash differs')
    request_raw = args.request.read_bytes()
    request = json.loads(request_raw)
    require(request['protocolFiles'][COLLECTOR] == args.protocol_sha256, 'Collector differs from declared request')
    with ZipFile(args.zip) as archive, tempfile.TemporaryDirectory(prefix='cric-archive-course-') as workspace:
        names = inspect_members(archive)
        require(shutil.disk_usage(workspace).free >= sum(part.file_size for part in archive.infolist()),
                'Insufficient space to revalidate actual evidence')
        request_name = '.github/cric-experiment-visibility-request.json'
        matches = [name for name in names if name == request_name or name.endswith('/' + request_name)]
        require(len(matches) == 1 and archive.read(matches[0]) == request_raw, 'Wrong upstream request')
        result, summaries = evidence(archive, names, Path(workspace), args.course, request,
                                     sha(request_raw), args.run, args.head, args.protocol_sha256)
    args.output.mkdir(parents=True, exist_ok=True)
    for name, raw in summaries.items():
        (args.output / name).write_bytes(raw)
    parts = []
    with args.zip.open('rb') as stream:
        while payload := stream.read(PART_BYTES):
            file = args.output / f'upstream-artifact.zip.part-{len(parts)+1:03d}'
            file.write_bytes(payload)
            recorded = file.read_bytes()
            require(recorded == payload, 'Written archive part differs')
            parts.append({'file': file.name, 'bytes': len(recorded), 'sha256': sha(recorded)})
    result.update(runId=args.run, runCommit=args.head, course=args.course, artifactId=args.artifact_id,
                  upstreamSha256=args.sha256, upstreamBytes=args.zip.stat().st_size, upstreamMemberCount=len(names),
                  parts=parts, activityCredit=0, humanApproval='NOT_RUN', publicationAction='NONE')
    (args.output / 'receipt.json').write_text(json.dumps(result, indent=2) + '\n')
    print(args.course, result['terminalStatus'], result['observedCases'], 'observed cases, zero approval credit')


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--run', type=int, required=True)
    parser.add_argument('--head', required=True)
    parser.add_argument('--course', choices=COURSES, required=True)
    parser.add_argument('--artifact-id', type=int, required=True)
    parser.add_argument('--zip', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--request', type=Path, required=True)
    parser.add_argument('--protocol-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    archive_course(parser.parse_args())


if __name__ == '__main__':
    main()
