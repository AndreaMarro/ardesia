#!/usr/bin/env python3
"""Convert verified public Build Output v3 into a static Vercel API file upload.

No API request, project mutation or publication. Credentials never belong here.
The uploader submits this request through its authenticated Vercel connection.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path

PROJECT = 'prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8'
TEAM = 'team_23uD0RgdInaTaOPEL0EGltup'


def prepare(directory):
    directory = Path(directory)
    receipt = json.loads((directory / 'preview-manifest.json').read_text())
    output = directory / '.vercel/output'
    config_bytes = (output / 'config.json').read_bytes()
    if hashlib.sha256(config_bytes).hexdigest() != receipt['configSha256']:
        raise ValueError('changed_config')
    config = json.loads(config_bytes)
    if config['version'] != 3 or receipt['privateBetaIncluded'] is not False:
        raise ValueError('public_output_required')
    static = output / 'static'
    entries = sorted(static.rglob('*'))
    if any(p.is_symlink() for p in entries):
        raise ValueError('linked_public_asset')
    actual = {p.relative_to(static).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
              for p in entries if p.is_file()}
    if actual != receipt['publicAssetsSha256']:
        raise ValueError('changed_public_assets')
    marketing = json.loads((static / 'source-manifest.json').read_text())
    if marketing['examples'] or any(p.startswith(('esempi/', 'studio/', 'beta/', 'study/')) for p in actual):
        raise ValueError('unreleased_editorial_or_private_content')
    files = [{'file': 'public/' + name, 'data': base64.b64encode((static / name).read_bytes()).decode(),
              'encoding': 'base64'} for name in actual]
    # The source-file API consumes vercel.json v2; v3 is reserved for prebuilt
    # output. Same routes/headers, same static bytes; no build or runtime env.
    files.append({'file': 'vercel.json', 'data': json.dumps({'version': 2, 'routes': config['routes']})})
    return {'teamId': TEAM, 'requestBody': {
        'name': 'ardesia-fisica-preview', 'project': PROJECT, 'files': files,
        'projectSettings': {'framework': None, 'rootDirectory': None, 'buildCommand': '',
                            'installCommand': '', 'outputDirectory': 'public', 'nodeVersion': '24.x'},
        'gitMetadata': {'commitSha': receipt['binding']['sourceCommit'],
                        'commitRef': 'codex/ardesia-public-demo-20261025',
                        'remoteUrl': 'https://github.com/AndreaMarro/ardesia.git'},
        'meta': {'candidateManifestSha256': receipt['binding']['candidateManifestSha256'],
                 'sourceTreeSha256': receipt['binding']['sourceTreeSha256'],
                 'scope': 'original-public-demo-no-editorial-bank-no-private-beta'},
    }}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepared', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    payload = prepare(args.prepared)
    with args.output.open('x') as target:
        json.dump(payload, target, separators=(',', ':'))
    print(f'Prepared {len(payload["requestBody"]["files"])} source files for {PROJECT}; no deployment')


if __name__ == '__main__':
    main()
