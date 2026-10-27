#!/usr/bin/env python3
"""Build the canonical protected Web + Studio preview into .vercel/output.

This is a build command, not a deploy command: project SSO and release approval
remain external gates. The public demo and DRAFT editorial preview use their
separate preparation commands. Requires Git, Python 3.12+ and installed npm
lockfiles; no Python package installation or remote backend is required.

Vercel consumes the generated Build Output API v3 configuration, including the
explicit /study 503 and closed route list. Do not add a root SPA rewrite.
https://vercel.com/docs/build-output-api
"""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
PRIVATE_PROJECT_ID = 'prj_DQN0u2e3diAelk0nZNFk4QofOqzs'


def exact_sha(value: str) -> str:
    if not re.fullmatch(r'[0-9a-f]{40}', value):
        raise ValueError('exact_release_refs_required')
    return value


def git_sha(ref: str) -> str:
    return exact_sha(subprocess.check_output(
        ['git', 'rev-parse', '--verify', ref], cwd=ROOT, text=True).strip())


def resolve_main_sha(explicit: str | None = None) -> str:
    """Resolve main without requiring a branch ref in a shallow Git checkout.

    Only the configured origin is queried; no fetch, ref update or credential
    setup is performed. Remote stderr may contain a credential-bearing URL, so
    diagnostics identify the failed operation and exit code without echoing it.
    """
    if explicit is not None:
        return exact_sha(explicit)
    local = subprocess.run(
        ['git', 'rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main^{commit}'],
        cwd=ROOT, text=True, capture_output=True, check=False)
    if local.returncode == 0:
        return exact_sha(local.stdout.strip())
    if local.returncode != 1:
        raise ValueError(f'local_origin_main_lookup_failed: git exit {local.returncode}')
    print('Local origin/main is absent; resolving refs/heads/main from the configured origin.',
          file=sys.stderr)
    try:
        remote = subprocess.run(
            ['git', 'ls-remote', '--exit-code', '--refs', 'origin', 'refs/heads/main'],
            cwd=ROOT, text=True, capture_output=True, check=False, timeout=30,
            env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'})
    except subprocess.TimeoutExpired:
        raise ValueError('origin_main_lookup_timed_out: git ls-remote exceeded 30 seconds') from None
    if remote.returncode == 2:
        raise ValueError('origin_main_missing: configured origin has no refs/heads/main')
    if remote.returncode:
        raise ValueError(f'origin_main_lookup_failed: git ls-remote exit {remote.returncode}')
    records = remote.stdout.splitlines()
    if len(records) != 1:
        raise ValueError('origin_main_missing_or_ambiguous: expected exactly one remote ref')
    fields = records[0].split('\t')
    if len(fields) != 2 or fields[1] != 'refs/heads/main':
        raise ValueError('origin_main_invalid: expected an exact refs/heads/main record')
    return exact_sha(fields[0])


def build(*, main_sha: str | None = None) -> dict:
    project = os.environ.get('VERCEL_PROJECT_ID')
    if project is not None and project != PRIVATE_PROJECT_ID:
        raise ValueError('private_vercel_project_required')
    # An ambient editorial alias must never change this client-only build.
    if os.environ.get('ARDESIA_COURSE_REVIEW_DATA'):
        raise ValueError('editorial_sidecar_not_allowed')
    head = git_sha('HEAD')
    main = resolve_main_sha(main_sha)
    vercel = ROOT / '.vercel'
    output = vercel / 'output'
    receipt_path = vercel / 'ardesia-preview-manifest.json'
    if any(path.is_symlink() for path in (vercel, output, receipt_path)):
        raise ValueError('linked_build_output_not_allowed')
    vercel.mkdir(exist_ok=True)
    # Only disposable build artifacts are replaced. Project links and other
    # Vercel metadata stay intact; failed builds leave no stale deployable tree.
    if output.exists():
        shutil.rmtree(output)
    receipt_path.unlink(missing_ok=True)
    with tempfile.TemporaryDirectory(prefix='ardesia-integrated-', dir=vercel) as scratch:
        staging = Path(scratch)
        candidate, prepared = staging / 'candidate', staging / 'prepared'
        subprocess.run([
            sys.executable, str(ROOT / 'bin/build_teaching_candidate.py'),
            '--output', str(candidate), '--include-private', '--learning-journey',
        ], cwd=ROOT, check=True)
        subprocess.run([
            sys.executable, str(ROOT / 'bin/web/prepare_vercel_preview.py'),
            '--candidate', str(candidate), '--output', str(prepared),
            '--private-integrated', '--main-sha', main, '--head-sha', head,
        ], cwd=ROOT, check=True)
        receipt = json.loads((prepared / 'preview-manifest.json').read_text())
        if (receipt.get('kind') != 'private-integrated-preview-preparation'
                or receipt.get('requiresProtectedPreview') is not True
                or receipt.get('deploymentPerformed') is not False):
            raise ValueError('protected_preview_preparation_required')
        # Staging is on the same filesystem: expose only the verified complete
        # tree, never a partially copied client or the public/editorial sidecar.
        (prepared / '.vercel/output').replace(output)
        (prepared / 'preview-manifest.json').replace(receipt_path)
    return receipt


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--main-sha', default=os.environ.get('ARDESIA_MAIN_SHA'),
                        help='Exact observed main SHA; defaults to ARDESIA_MAIN_SHA, local origin/main, or the configured origin')
    args = parser.parse_args()
    try:
        receipt = build(main_sha=args.main_sha)
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        # ValueError messages are controlled validation diagnostics. OSError and
        # subprocess errors can contain paths or command details: keep them terse.
        detail = str(error) if isinstance(error, ValueError) else type(error).__name__
        print('Integrated Vercel build failed: ' + detail, file=sys.stderr)
        return 1
    print(f"Prepared {len(receipt['staticAssetsSha256'])} protected Web + Studio assets in .vercel/output; "
          'backend NOT_CONFIGURED; no deployment performed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
