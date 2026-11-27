"""Archive completed local browser scopes byte-for-byte, without granting editorial credit."""

import argparse
from hashlib import sha256
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED, ZIP_STORED


def pin(raw):
    return sha256(raw).hexdigest()


def seal(output, scopes):
    archives = {}
    run_receipts = {}
    for scope in scopes:
        summary = json.loads((scope / 'actual-summary.json').read_bytes())
        terminal = json.loads((scope / 'terminal.json').read_bytes())
        report = scope / 'actual/report.json'
        if terminal['observedExitCode'] != 0 or terminal['timeoutTriggered']:
            raise ValueError('A scope did not terminate successfully: ' + str(scope))
        if pin(report.read_bytes()) != summary['reportSha256']:
            raise ValueError('Browser report changed: ' + str(scope))
        run_receipts[scope.name] = {'technicalSummary': summary, 'terminal': terminal}
        for file in sorted(scope.rglob('*')):
            if file.is_symlink():
                raise ValueError('Unexpected symbolic link in browser artifacts: ' + str(file))
            if file.is_file():
                local = scope.name + '/' + file.relative_to(scope).as_posix()
                if local in archives:
                    raise ValueError('Two scope files have the same archive key: ' + local)
                archives[local] = (file, pin(file.read_bytes()))
    if not output.exists():
        with ZipFile(output, 'x') as archive:
            for name, (file, checksum) in archives.items():
                raw = file.read_bytes()
                if pin(raw) != checksum:
                    raise ValueError('Evidence changed during sealing: ' + str(file))
                entry = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                entry.compress_type = ZIP_STORED if file.suffix == '.png' else ZIP_DEFLATED
                archive.writestr(entry, raw)
    with ZipFile(output) as archive:
        if sorted(archive.namelist()) != sorted(archives) or archive.testzip():
            raise ValueError('Scope archive is incomplete')
        for name, (_, checksum) in archives.items():
            if pin(archive.read(name)) != checksum:
                raise ValueError('An archived file digest differs: ' + name)
    receipt = {
        'schemaVersion': '1.0.0',
        'phase': 'SCOPED_TECHNICAL_OBSERVATIONS',
        'archiveSha256': pin(output.read_bytes()),
        'files': {name: checksum for name, (_, checksum) in archives.items()},
        'runs': run_receipts,
        'activityCredit': 0,
        'humanApproval': 'NOT_RUN',
        'publicationAction': 'NONE',
    }
    manifest = output.with_name(output.stem + '-manifest.json')
    raw = (json.dumps(receipt, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode()
    if manifest.exists():
        if manifest.read_bytes() != raw:
            raise ValueError('A prior sealed manifest differs')
    else:
        with manifest.open('xb') as file:
            file.write(raw)
    print(len(archives), pin(raw))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    parser.add_argument('folders', nargs='+', type=Path)
    args = parser.parse_args()
    seal(args.output, args.folders)
