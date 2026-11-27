"""Validate a complete preview's exact artifact with the existing marker validator."""

import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile


RUN = 45929961994
COMMIT = '728474c72f069e87ab8528549bb31f172ed5608a'
ARTIFACT = 15169766169
DIGEST = '431c9d0581da6fb9203ed2f2ff4296d45cb6cf1be753878adb547ad6d4a9bca5'
SIZE = 142681374


def hash_bytes(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--exact-app', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--run', type=int, default=RUN)
    parser.add_argument('--commit', default=COMMIT)
    parser.add_argument('--artifact', type=int, default=ARTIFACT)
    parser.add_argument('--digest', default=DIGEST)
    parser.add_argument('--size', type=int, default=SIZE)
    parser.add_argument('--packages', type=int, default=316)
    parser.add_argument('--cases', type=int, default=13869)
    args = parser.parse_args()
    reviews = Path(__file__).resolve().parent.parent
    out = args.output
    job_metadata = (out / 'job-metadata.json').read_bytes()
    artifact_metadata = (out / 'artifacts-metadata.json').read_bytes()
    job = json.loads(job_metadata)
    assert job['run_id'] == args.run and job['head_sha'] == args.commit and job['conclusion'] == 'success'
    artifact, = (row for row in json.loads(artifact_metadata)['artifacts'] if row['id'] == args.artifact)
    assert artifact['workflow_run']['head_sha'] == args.commit
    assert artifact['workflow_run']['id'] == args.run and artifact['size_in_bytes'] == args.size
    assert artifact['digest'] == f'sha256:{args.digest}'
    assert args.archive.stat().st_size == args.size
    with args.archive.open('rb') as stream:
        assert hashlib.file_digest(stream, 'sha256').hexdigest() == args.digest
    archive_helpers = runpy.run_path(str(reviews / 'archive-visibility-course-artifact.py'))
    verifier = reviews / 'full-preview-45919159272-20261127/verify-terminal-markers.mjs'
    with ZipFile(args.archive) as archive, TemporaryDirectory(prefix='cric-positive-markers-') as workspace:
        names = archive_helpers['inspect_members'](archive)
        for name in sorted(names):
            if name.endswith(('/completion.json', '/report.json')):
                destination = Path(workspace) / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.read(name))
        validation = subprocess.run(['node', str(verifier), args.commit, workspace, 'all-positive'],
                                    cwd=args.exact_app, capture_output=True, timeout=240)
        (out / 'actual-verifier-stderr.txt').write_bytes(validation.stderr)
        if validation.returncode:
            raise RuntimeError(validation.stderr.decode(errors='replace'))
        evidence = json.loads(validation.stdout)
        assert evidence['sourceCommit'] == args.commit and not evidence['failed']
        assert evidence['positiveTerminalMarkers'] == evidence['packagesExpected'] == args.packages
        assert evidence['actualBrowserCasesInPositiveMarkers'] == args.cases
        (out / 'verified-terminal-markers.json').write_bytes(validation.stdout)
    parts = []
    with args.archive.open('rb') as stream:
        while data := stream.read(archive_helpers['PART_BYTES']):
            part = out / f'upstream-artifact.zip.part-{len(parts) + 1:03d}'
            part.write_bytes(data)
            assert part.read_bytes() == data
            parts.append({'file': part.name, 'bytes': len(data), 'sha256': hash_bytes(data)})
    result = {'runId': args.run, 'sourceCommit': args.commit, 'conclusion': 'success', 'artifactId': args.artifact,
              'upstreamZipSha256': args.digest, 'upstreamZipBytes': args.size, 'zipMemberCount': len(names), 'archiveParts': parts,
              'markerEvidenceSha256': hash_bytes(validation.stdout), 'verificationScriptSha256': hash_bytes(verifier.read_bytes()),
              'jobId': job['id'], 'jobMetadataSha256': hash_bytes(job_metadata),
              'artifactMetadataSha256': hash_bytes(artifact_metadata), 'jobLogGzipSha256': hash_bytes((out / 'job.log.gz').read_bytes()),
              'runtimeSha256': evidence['runtimeSha256'], 'registrySha256': evidence['registrySha256'],
              'positiveTerminalMarkers': evidence['positiveTerminalMarkers'], 'cases': evidence['actualBrowserCasesInPositiveMarkers'],
              'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    (out / 'receipt.json').write_text(json.dumps(result, indent=2) + '\n')
    print(result['positiveTerminalMarkers'], result['cases'], 'actual private preview cases verified')


if __name__ == '__main__':
    main()
