"""Preserve a completed bounded probe with its content-addressed images."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


def digest(data):
    return hashlib.sha256(data).hexdigest()


def archive_probe(source, output):
    terminal = json.loads((source / 'terminal-receipt.json').read_bytes())
    report_bytes = (source / 'report.json').read_bytes()
    assert terminal['observedExitCode'] == 0 and digest(report_bytes) == terminal['reportSha256']
    report = json.loads(report_bytes)
    prepared = json.loads((source / 'prepared.json').read_bytes())
    assert report['sourceCommit'] == prepared['sourceCommit']
    assert report['runtimeFingerprint']['sha256'] == terminal['runtimeSha256']
    assert report['errors'] == []
    assert report['cases'] == [json.loads(line) for line in (source / 'completed-cases.jsonl').read_bytes().splitlines()]
    assert set(prepared['expectedCaseKeys']) == {row['caseKey'] for row in report['cases']}
    assert len(report['cases']) == len(prepared['expectedCaseKeys']) == terminal['plannedCases']
    files = {
        name: digest((source / name).read_bytes())
        for name in ['actual-process.txt', 'completed-cases.jsonl', 'info.json', 'prepared.json',
                     'report.json', 'request.json', 'terminal-receipt.json']
    }
    screenshots = set()
    for row in report['cases']:
        filename = PurePosixPath(row['file'])
        assert filename.parent == PurePosixPath('cases') and filename.suffix == '.json'
        raw = (source / filename).read_bytes()
        case = json.loads(raw)
        assert digest(raw) == row['sha256'] and row['technicalOk'] and case['technicalOk']
        assert case['caseKey'] == row['caseKey'] and case['sourceCommit'] == report['sourceCommit']
        assert case['runtimeSha256'] == terminal['runtimeSha256']
        files[filename.as_posix()] = row['sha256']
        for screenshot in case.get('screenshots', []):
            image = PurePosixPath(screenshot['file'])
            assert image.parent == PurePosixPath('screens') and image.suffix == '.png'
            assert image.stem == screenshot['sha256']
            screenshots.add(image.as_posix())
            files[image.as_posix()] = screenshot['sha256']
    assert screenshots == {p.relative_to(source).as_posix() for p in (source / 'screens').glob('*.png')}
    assert len(report['cases']) == len(list((source / 'cases').glob('*.json')))
    for p in sorted((source / 'private-inputs').glob('*.json')):
        files[p.relative_to(source).as_posix()] = digest(p.read_bytes())
    manifest = output / 'members-sha256.json'
    manifest.write_text(json.dumps(dict(sorted(files.items())), indent=2) + '\n')
    zip_path = output / 'actual-ui.zip'
    with ZipFile(zip_path, 'w') as archive:
        for name, sha in sorted(files.items()):
            raw = (source / name).read_bytes()
            assert digest(raw) == sha
            member = ZipInfo(name)
            member.compress_type = ZIP_DEFLATED
            archive.writestr(member, raw)
    with ZipFile(zip_path) as archive:
        assert archive.testzip() is None and set(archive.namelist()) == set(files)
        assert all(digest(archive.read(name)) == sha for name, sha in files.items())
    with zip_path.open('rb') as stream:
        archive_sha = hashlib.file_digest(stream, 'sha256').hexdigest()
    receipt = dict(terminal, sourceCommit=report['sourceCommit'], actualCases=len(report['cases']),
                   uniqueScreenshots=len(screenshots), artifactMembers=len(files),
                   archiveSha256=archive_sha, membersManifestSha256=digest(manifest.read_bytes()),
                   independentVisualReview='PENDING')
    (output / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(receipt['actualCases'], receipt['uniqueScreenshots'], archive_sha)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent)
    params = parser.parse_args()
    params.output.mkdir(parents=True, exist_ok=True)
    archive_probe(params.source, params.output)
