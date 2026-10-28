"""Stage canonical monorepo packages inside the Python function's bundle root.

This generated build artifact preserves package-relative content paths without
relying on outside-root ZIP entries or editable checkout .pth files at runtime.
"""
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
import subprocess

SERVICE_ROOT = Path(__file__).resolve().parent
REPOSITORY_ROOT = SERVICE_ROOT.parents[1]
PACKAGES = {
    'lessonos': Path('packages/engine/lessonos'),
    's19_circuit_lab': Path('plugins/s19-circuit-lab/s19_circuit_lab'),
}


def stage_shared_core(repository_root, destination):
    repository_root, destination = Path(repository_root), Path(destination)
    # Fail before replacing an existing artifact if a source is unavailable.
    for relative in PACKAGES.values():
        if not (repository_root / relative / '__init__.py').is_file():
            raise ValueError('canonical_core_package_missing')
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True)
    for name, relative in PACKAGES.items():
        shutil.copytree(repository_root / relative, destination / name,
                        ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))


def stage_frontend(source, destination, release_sha):
    source, destination = Path(source), Path(destination)
    if not re.fullmatch('[0-9a-f]{40}', release_sha or ''):
        raise ValueError('frontend_release_sha_required')
    if not (source / 'index.html').is_file():
        raise ValueError('frontend_build_missing')
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)
    metadata = {'sourceSha': release_sha, 'syntheticOnly': True,
                'mode': 'SYNTHETIC_ACCEPTANCE',
                'indexSha256': hashlib.sha256((source / 'index.html').read_bytes()).hexdigest()}
    (destination / 'acceptance-release.json').write_text(json.dumps(metadata, sort_keys=True) + '\n')


def build_web(repository_root, destination, release_sha, *, run=subprocess.run):
    # Root's sole npm workspace is apps/web. Studio sources imported by Web
    # remain ordinary source inputs; no Studio frontend/build is installed.
    repository_root = Path(repository_root)
    if not re.fullmatch('[0-9a-f]{40}', release_sha or ''):
        raise ValueError('frontend_release_sha_required')
    run(['npm', 'ci'], cwd=repository_root, check=True)
    run(['npm', 'run', 'build:web'], cwd=repository_root, check=True)
    stage_frontend(repository_root / 'apps/web/dist', destination, release_sha)


def build_studio(repository_root, destination, release_sha, *, run=subprocess.run):
    repository_root = Path(repository_root)
    if not re.fullmatch('[0-9a-f]{40}', release_sha or ''):
        raise ValueError('frontend_release_sha_required')
    environment = os.environ.copy()
    for key in ('ARDESIA_GIT_SHA', 'VERCEL_GIT_COMMIT_SHA', 'GITHUB_SHA', 'RENDER_GIT_COMMIT'):
        value = environment.get(key)
        if value and value.lower() != release_sha:
            raise ValueError('studio_build_provenance_mismatch')
    run(['npm', '--prefix', 'apps/studio', 'ci'], cwd=repository_root, check=True)
    environment.update(ARDESIA_STUDIO_BASE='/studio/', ARDESIA_GIT_SHA=release_sha)
    run(['npm', '--prefix', 'apps/studio', 'run', 'build', '--', '--base=/studio/'],
        cwd=repository_root, check=True, env=environment)
    stage_frontend(repository_root / 'apps/studio/dist', destination, release_sha)


def measure_bundle(service_root, *, dependency_roots=(), limit_bytes=250_000_000):
    """Count staged bytes and available dependencies; never discard assets.

    The hosted function's final uncompressed size still needs its platform
    receipt. Missing dependency roots are explicitly an incomplete estimate.
    """
    service_root = Path(service_root)
    def size(directory):
        return sum(path.stat().st_size for path in Path(directory).rglob('*') if path.is_file())
    components = {name: size(service_root / name) for name in ('_core', '_frontend', '_studio', 'study_api')}
    components['python_dependencies'] = sum(size(root) for root in dependency_roots)
    report = {'components': components, 'accountedBytes': sum(components.values()),
              'limitBytes': limit_bytes, 'pythonDependencyEstimateAvailable': bool(dependency_roots),
              'hostedFunctionSizeVerified': False, 'assetsExcluded': []}
    report['withinAccountedBudget'] = report['accountedBytes'] <= limit_bytes
    (service_root / '_bundle-size.json').write_text(json.dumps(report, sort_keys=True) + '\n')
    if not report['withinAccountedBudget']:
        raise ValueError('acceptance_bundle_budget_exceeded')
    return report


if __name__ == '__main__':
    stage_shared_core(REPOSITORY_ROOT, SERVICE_ROOT / '_core')
    print('Canonical Core packages staged for the acceptance function')

    if os.environ.get('ARDESIA_BUILD_WEB') == '1':
        build_web(REPOSITORY_ROOT, SERVICE_ROOT / '_frontend', os.environ.get('ARDESIA_RELEASE_SHA'))
        print('Web bundle staged for the same-origin acceptance function')
    elif (SERVICE_ROOT / '_frontend').exists():
        shutil.rmtree(SERVICE_ROOT / '_frontend')

    if os.environ.get('ARDESIA_BUILD_STUDIO') == '1':
        build_studio(REPOSITORY_ROOT, SERVICE_ROOT / '_studio', os.environ.get('ARDESIA_RELEASE_SHA'))
        print('Studio bundle staged at /studio/ for the same controlled origin')
    elif (SERVICE_ROOT / '_studio').exists():
        shutil.rmtree(SERVICE_ROOT / '_studio')

    measure_bundle(SERVICE_ROOT, dependency_roots=tuple((SERVICE_ROOT / '.venv/lib').glob('python*/site-packages')))
