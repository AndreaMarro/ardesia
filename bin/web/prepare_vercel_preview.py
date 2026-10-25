#!/usr/bin/env python3
"""Prepare a Vercel Build Output API v3 directory, without any deployment.

Only the verified public tree is copied. No project is linked, created or changed;
human scientific/editorial and publication gates remain open.
Reference: https://vercel.com/docs/build-output-api/configuration
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

from check_teaching_candidate import check
from teaching_policy import HEADERS


def prepare(candidate: Path, destination: Path) -> dict:
    candidate, destination = candidate.resolve(), destination.resolve()
    if destination.exists() or destination.is_relative_to(candidate):
        raise ValueError('fresh_output_outside_candidate_required')
    verification = check(candidate)
    if verification['technicalStatus'] != 'PASS':
        raise ValueError('candidate_technical_verification_required')
    if not (candidate / 'public/404.html').is_file():
        raise ValueError('custom_404_required')
    manifest_bytes = (candidate / 'candidate-manifest.json').read_bytes()
    if hashlib.sha256(manifest_bytes).hexdigest() != verification['binding']['candidateManifestSha256']:
        raise ValueError('candidate_changed_after_verification')
    manifest = json.loads(manifest_bytes)
    public_assets = {name.removeprefix('public/'): digest for name, digest in manifest['assetsSha256'].items() if name.startswith('public/')}
    routes = [{'src': '/.*', 'headers': HEADERS, 'continue': True}]
    for name in sorted(public_assets):
        if name == 'index.html':
            routes.append({'src': '/$', 'dest': '/index.html'})
        elif name.endswith('/index.html'):
            route = '/' + name.removesuffix('/index.html')
            routes.append({'src': re.escape(route) + '/?$', 'dest': '/' + name})
    routes.extend([{'handle': 'filesystem'}, {'src': '/.*', 'status': 404, 'dest': '/404.html'}])
    config = {'version': 3, 'routes': routes}
    output = destination / '.vercel/output'
    try:
        output.mkdir(parents=True)
        shutil.copytree(candidate / 'public', output / 'static', symlinks=True,
                        copy_function=lambda source, target: shutil.copy2(source, target, follow_symlinks=False))
        # Verify the copied bytes, too. The source package may have changed since
        # the first read; no unchecked copy is declared ready for an operator.
        copied = {p.relative_to(output / 'static').as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in (output / 'static').rglob('*') if p.is_file() and not p.is_symlink()}
        if copied != public_assets or any(p.is_symlink() for p in (output / 'static').rglob('*')):
            raise ValueError('public_copy_changed')
        (output / 'config.json').write_text(json.dumps(config, indent=2) + '\n')
        receipt = {'schemaVersion': 1, 'kind': 'local-vercel-preview-preparation',
                   'binding': verification['binding'], 'releaseStatus': 'BLOCKED',
                   'deploymentPerformed': False, 'projectLinked': False,
                   'privateBetaIncluded': False, 'publicAssetsSha256': copied,
                   'configSha256': hashlib.sha256((output / 'config.json').read_bytes()).hexdigest(),
                   'providerRuntimeValidation': 'NOT_RUN', 'releaseGates': verification['releaseGates']}
        (destination / 'preview-manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
        return receipt
    except Exception:
        shutil.rmtree(destination)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        value = prepare(args.candidate, args.output)
    except (ValueError, OSError, KeyError) as error:
        print('Preview preparation failed: ' + type(error).__name__)
        return 1
    print(f"Prepared {len(value['publicAssetsSha256'])} public files; no deployment; release BLOCKED")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
