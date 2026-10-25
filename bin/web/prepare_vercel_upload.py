#!/usr/bin/env python3
"""Convert verified public Build Output v3 into a static Vercel API file upload.

No API request, project mutation or publication. Credentials never belong here.
The uploader submits this request through its authenticated Vercel connection.
"""
import argparse
import base64
import hashlib
import json
import os
import re
import sys
from pathlib import Path

PROJECT = 'prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8'
TEAM = 'team_23uD0RgdInaTaOPEL0EGltup'
sys.path.insert(0,str(Path(__file__).resolve().parent))
from teaching_policy import integrated_routes


def asset_bytes(path, root):
    if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('linked_public_asset')
    # Hash and encode the same snapshot; do not reread paths after validation.
    descriptor = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
    with os.fdopen(descriptor, 'rb') as source:
        return source.read()


def prepare(directory,protected_review=False,*,protected_integrated=False):
    directory = Path(directory)
    receipt = json.loads((directory / 'preview-manifest.json').read_text())
    output = directory / '.vercel/output'
    config_bytes = (output / 'config.json').read_bytes()
    if hashlib.sha256(config_bytes).hexdigest() != receipt['configSha256']:
        raise ValueError('changed_config')
    config = json.loads(config_bytes)
    if config['version'] != 3:
        raise ValueError('public_output_required')
    static = output / 'static'
    entries = sorted(static.rglob('*'))
    if any(p.is_symlink() for p in entries):
        raise ValueError('linked_public_asset')
    snapshot = {p.relative_to(static).as_posix(): asset_bytes(p, static)
                for p in entries if p.is_file()}
    actual = {name: hashlib.sha256(content).hexdigest() for name, content in snapshot.items()}
    integrated=(receipt.get('privateBetaIncluded') is True or 'staticAssetsSha256' in receipt or (static/'release-manifest.json').exists())
    if integrated and not protected_integrated:
        raise ValueError('private_integrated_preview_required')
    inventory=receipt.get('staticAssetsSha256') if integrated else receipt.get('publicAssetsSha256')
    if actual != inventory:
        raise ValueError('changed_public_assets')
    if integrated:
        marker=static/'release-manifest.json'
        if (not marker.is_file() or receipt.get('privateBetaIncluded') is not True
                or receipt.get('requiresProtectedPreview') is not True
                or receipt.get('kind')!='private-integrated-preview-preparation'):
            raise ValueError('invalid_private_integrated_receipt')
        release=json.loads(snapshot['release-manifest.json'])
        if (release.get('scope')!='PRIVATE_INTEGRATED_PREVIEW'
                or release.get('publicReleaseAllowed') is not False
                or release.get('sourceProduct')!=receipt['binding']['sourceCommit']
                or release.get('sourceTreeSha256')!=receipt['binding']['sourceTreeSha256']
                or release.get('candidateManifestSha256')!=receipt['binding']['candidateManifestSha256']
                or actual['release-manifest.json']!=receipt.get('releaseManifestSha256')):
            raise ValueError('invalid_private_integrated_receipt')
        if config.get('routes')!=integrated_routes():
            raise ValueError('integrated_host_policy_changed')
        if not all(name in actual for name in ('index.html','studio/index.html','ops/release/index.html','_integration/backend-unavailable.json')):
            raise ValueError('paired_private_clients_required')
        if any(name.startswith(('beta/','study/','esempi/','esperienza/')) or name in ('courses-manifest.json','source-manifest.json') for name in actual):
            raise ValueError('separate_editorial_preview_required')
        scope='PRIVATE_INTEGRATED_PREVIEW'
    else:
        if protected_integrated:raise ValueError('private_integrated_preview_required')
        if receipt.get('privateBetaIncluded') is not False:raise ValueError('public_output_required')
        marketing = json.loads(snapshot['source-manifest.json'])
        if marketing['examples'] or any(p.startswith(('esempi/', 'studio/', 'beta/', 'study/','_integration/','ops/release/')) for p in actual):
            raise ValueError('unreleased_editorial_or_private_content')
        course_marker=static/'courses-manifest.json'
        scope=json.loads(snapshot['courses-manifest.json']).get('releaseScope') if course_marker.is_file() else 'PUBLIC_DEMONSTRATION'
        if scope not in ('PUBLIC_DEMONSTRATION','PRIVATE_EDITORIAL_REVIEW') or (scope=='PRIVATE_EDITORIAL_REVIEW' and not protected_review):
            raise ValueError('protected_editorial_preview_required')
    files = [{'file': 'public/' + name, 'data': base64.b64encode(content).decode(),
              'encoding': 'base64'} for name, content in snapshot.items()]
    # The source-file API consumes vercel.json v2; v3 is reserved for prebuilt
    # output. Same routes/headers, same static bytes; no build or runtime env.
    files.append({'file': 'vercel.json', 'data': json.dumps({'version': 2, 'routes': config['routes']})})
    return {'teamId': TEAM, 'requestBody': {
        'name': 'ardesia-fisica-preview', 'project': PROJECT, 'files': files,
        'projectSettings': {'framework': None, 'rootDirectory': None, 'buildCommand': '',
                            'installCommand': '', 'outputDirectory': 'public', 'nodeVersion': '24.x'},
        'gitMetadata': {'commitSha': receipt['binding']['sourceCommit'],
                        'remoteUrl': 'https://github.com/AndreaMarro/ardesia.git'},
        'meta': {'candidateManifestSha256': receipt['binding']['candidateManifestSha256'],
                 'sourceTreeSha256': receipt['binding']['sourceTreeSha256'],
                 'scope': scope},
    }}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepared', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--protected-integrated-preview',action='store_true',help='Private Web+Studio client preview; target stays Preview and remote backend is not certified')
    parser.add_argument('--protected-editorial-review',action='store_true',help='Permit original draft-course preview upload, target remains Preview; never set production')
    args = parser.parse_args()
    payload = prepare(args.prepared,args.protected_editorial_review,protected_integrated=args.protected_integrated_preview)
    with args.output.open('x') as target:
        json.dump(payload, target, separators=(',', ':'))
    print(f'Prepared {len(payload["requestBody"]["files"])} source files for {PROJECT}; no deployment')


if __name__ == '__main__':
    main()
