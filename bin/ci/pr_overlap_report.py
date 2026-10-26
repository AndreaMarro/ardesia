#!/usr/bin/env python3
"""Read-only inventory of overlapping files in open Ardesia PRs.

Run: python3 bin/ci/pr_overlap_report.py --repo AndreaMarro/ardesia
Requires authenticated gh CLI for live GitHub calls; --fixture works offline.
A shared path is a review lead, NOT a proven merge conflict or a release gate.
Complements bin/state/project_state.py without changing generated state.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
import sys

SEAMS = {'apps/web/src/App.tsx', 'apps/web/src/components/Shell.tsx',
         'apps/studio/src/Room.tsx', 'apps/web/package.json',
         'apps/web/package-lock.json', 'apps/studio/package.json',
         'apps/studio/package-lock.json'}


def impact(path):
    if path in SEAMS or path.endswith('/api/app.py'):
        return 'INTEGRATION_SEAM'
    if path.startswith(('apps/', 'packages/', 'bin/')) and not (
        '/__tests__/' in path or '/tests/' in path or path.endswith('.test.tsx')):
        return 'IMPLEMENTATION'
    return 'TEST_OR_DOCUMENTATION'


def summarize(snapshot):
    prs = snapshot.get('pullRequests')
    if not isinstance(prs, list):
        raise ValueError('missing pullRequests list')
    owners, seen = defaultdict(set), set()
    for pr in prs:
        n, paths = pr.get('number'), pr.get('files')
        if type(n) is not int or n < 1 or n in seen or not isinstance(paths, list):
            raise ValueError('duplicate/invalid PR or missing file list')
        if not all(isinstance(p, str) and p and not p.startswith('/') for p in paths):
            raise ValueError('invalid file path')
        seen.add(n)
        for path in set(paths):
            owners[path].add(n)
    rows = [{'path': path, 'prs': sorted(nums), 'kind': impact(path)}
            for path, nums in owners.items() if len(nums) > 1]
    rows.sort(key=lambda r: (['INTEGRATION_SEAM', 'IMPLEMENTATION',
                              'TEST_OR_DOCUMENTATION'].index(r['kind']), r['path']))
    return {'status': snapshot.get('status', 'UNVERIFIED'),
            'observedAt': snapshot.get('observedAt'),
            'baseShaBefore': snapshot.get('baseShaBefore'),
            'baseShaAfter': snapshot.get('baseShaAfter'),
            'openPrs': len(prs), 'overlaps': rows,
            'prs': [{'number': pr['number'], 'headSha': pr.get('headSha'),
                     'draft': pr.get('draft', False), 'baseRef': pr.get('baseRef')}
                    for pr in sorted(prs, key=lambda p: p['number'])],
            'limits': ['Overlaps are not proof of Git conflicts.',
                       'Disjoint file sets do not prove compatible APIs or consumers.',
                       'CI of individual PRs cannot certify their composed merge tree.']}


def gh(path, pages=False):
    command = ['gh', 'api', path]
    if pages:
        command.extend(['--paginate', '--slurp'])
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=90)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError(f'gh unavailable: {type(exc).__name__}') from None
    if result.returncode:
        raise RuntimeError(f'gh api request failed (exit {result.returncode}), no results claimed')
    parsed = json.loads(result.stdout)
    if pages:
        if not isinstance(parsed, list):
            raise ValueError('gh paged response is not an array')
        return [row for batch in parsed for row in batch]
    return parsed


def live(repo, base):
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repo):
        raise ValueError('invalid owner/repo')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+', base):
        raise ValueError('base must be a simple branch name')
    root = f'repos/{repo}'
    sha = lambda: gh(f'{root}/branches/{base}')['commit']['sha']
    before = sha()
    entries = gh(f'{root}/pulls?state=open&per_page=100', pages=True)
    prs = []
    unstable = []
    for pr in entries:
        if pr['base']['ref'] != base:
            continue
        files = gh(f"{root}/pulls/{pr['number']}/files?per_page=100", pages=True)
        paths = []
        for file in files:
            paths.append(file['filename'])
            if file.get('status') == 'renamed' and file.get('previous_filename'):
                paths.append(file['previous_filename'])
        if gh(f"{root}/pulls/{pr['number']}")['head']['sha'] != pr['head']['sha']:
            unstable.append(pr['number'])
        prs.append({'number': pr['number'], 'files': paths,
                    'headSha': pr['head']['sha'], 'baseRef': base, 'draft': pr['draft']})
    after = sha()
    return {'status': 'MEASURED' if before == after and not unstable else 'STALE_SNAPSHOT_RETRY',
            'unstablePrs': unstable,
            'observedAt': datetime.now(timezone.utc).isoformat(),
            'baseShaBefore': before, 'baseShaAfter': after, 'pullRequests': prs}


def format_markdown(result):
    lines = ['# Concurrent PR file overlaps', '',
             f"State: **{result['status']}**; open PRs: **{result['openPrs']}**",
             f"Base before/after: {result['baseShaBefore']} / {result['baseShaAfter']}",
             '', '| Path | PRs | Kind |', '|---|---|---|']
    for r in result['overlaps']:
        lines.append(f"| {r['path']} | {', '.join('#'+str(n) for n in r['prs'])} | {r['kind']} |")
    if not result['overlaps']:
        lines.append('| (no overlap observed) | — | not a compatibility proof |')
    return '\n'.join(lines + ['', *('- '+limit for limit in result['limits'])]) + '\n'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='AndreaMarro/ardesia')
    parser.add_argument('--base', default='main')
    parser.add_argument('--fixture')
    parser.add_argument('--format', choices=['markdown', 'json'], default='markdown')
    args = parser.parse_args(argv)
    try:
        source = json.loads(Path(args.fixture).read_text(encoding='utf-8')) if args.fixture else live(args.repo, args.base)
        output = summarize(source)
    except (ValueError, RuntimeError, OSError, KeyError, json.JSONDecodeError) as exc:
        print(f'UNAVAILABLE: {exc}', file=sys.stderr)
        return 2
    print(json.dumps(output, ensure_ascii=False, indent=2) if args.format == 'json' else format_markdown(output))
    return 0 if output['status'] in ('MEASURED', 'UNVERIFIED') else 3


if __name__ == '__main__':
    raise SystemExit(main())
