"""Preserve the failed full preview and verify all authentic completion markers."""

import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import tempfile
from zipfile import ZipFile


RUN = 45919159272
COMMIT = 'bfb62aacef6fab6d374b5b6a5fdc5eb37aceb6fc'
ARTIFACT = 15164608805
PIN = 'a1a0ede0adb56525eb3cab4c46b4e3206f8745cdee11dba2009df600c273e584'
BYTES = 142722509


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('original_zip', type=Path)
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    job = json.loads((folder/'job-metadata.json').read_bytes())
    assert job['run_id'] == RUN and job['conclusion'] == 'failure' and job['head_sha'] == COMMIT
    assert args.original_zip.stat().st_size == BYTES
    with args.original_zip.open('rb') as stream:
        assert hashlib.file_digest(stream,'sha256').hexdigest() == PIN
    helper = runpy.run_path(str(folder.parent/'archive-visibility-course-artifact.py'))
    with ZipFile(args.original_zip) as archive, tempfile.TemporaryDirectory(prefix='cric-preview-marker-replay-') as home:
        names = helper['inspect_members'](archive)
        for name in names:
            if name.endswith(('/completion.json','/report.json')):
                dest = Path(home)/name
                dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_bytes(archive.read(name))
        run = subprocess.run(['node',str(folder/'verify-terminal-markers.mjs'),COMMIT,home],
                             capture_output=True,timeout=180)
        if run.stderr:
            (folder/'actual-verifier-stderr.txt').write_bytes(run.stderr)
        if run.returncode:
            raise RuntimeError('Existing marker validator failed: '+run.stderr.decode(errors='replace'))
        proof = json.loads(run.stdout)
        assert proof['sourceCommit'] == COMMIT and proof['positiveTerminalMarkers'] + 1 == proof['packagesExpected']
        (folder/'verified-terminal-markers.json').write_bytes(run.stdout)
        failed = folder/'original-failed-case'
        failed.mkdir(exist_ok=True)
        (failed/'report.json').write_bytes(archive.read('cric-c2-l002/report.json'))
        (failed/'C2-Q013-320.png').write_bytes(archive.read('cric-c2-l002/C2-Q013-320.png'))
    parts = []
    with args.original_zip.open('rb') as stream:
        while data := stream.read(helper['PART_BYTES']):
            part = folder/f'upstream-artifact.zip.part-{len(parts)+1:03d}'
            part.write_bytes(data)
            assert part.read_bytes() == data
            parts.append({'file':part.name,'bytes':len(data),'sha256':sha(data)})
    receipt = {'runId':RUN,'sourceCommit':COMMIT,'conclusion':'failure','artifactId':ARTIFACT,
               'upstreamZipSha256':PIN,'upstreamZipBytes':BYTES,'zipMemberCount':len(names),
               'archiveParts':parts,'markerEvidenceSha256':sha(run.stdout),
               'positiveTerminalMarkers':proof['positiveTerminalMarkers'],
               'actualBrowserCasesInPositiveMarkers':proof['actualBrowserCasesInPositiveMarkers'],
               'failedBatch':'cric-c2-l002','failedId':'C2-Q013','failedViewport':320,
               'fullPreviewApproval':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (folder/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(proof['positiveTerminalMarkers'], 'authentic passing markers, one distinct failed batch; no full preview PASS')


if __name__ == '__main__':
    main()
