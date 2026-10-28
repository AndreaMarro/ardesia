#!/usr/bin/env python3
"""Reject any reintroduction of the removed product into a build or runtime.

Historical prose and journal evidence are intentionally not rewritten. This
checks physical absence plus executable references, without a shrinking baseline.
The independent packs-wide data/method boundary remains zero tolerance.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REMOVED_ROOTS = (
    'plugins/elab-tutor', 'packs/elab-tutor', 'apps/studio/public/elab',
    'apps/studio/sim/elab', 'apps/studio/sim/solver',
)
# Retain the original generic protection for every pack, regardless of product.
PACK_STANDALONE_RULES = (
    re.compile(r"(^|/)App\.jsx$"),
    re.compile(r"(^|/)main\.jsx$"),
    re.compile(r"/supabase/functions/"),
    re.compile(r"auth", re.IGNORECASE),
    re.compile(r"dashboard", re.IGNORECASE),
)
EXECUTABLE_SUFFIXES = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.sh', '.yml', '.yaml'}
# QA may mention retired IDs in negative assertions, but it must not read or
# import deleted source/data/assets (including path.join + dynamic import).
FORBIDDEN_DEPENDENCY = re.compile(
    r'@elab(?:-tutor-plugin|-pack)(?:/|[\"\'])|'
    r'(?:plugins|packs)/elab-tutor(?:/|[\"\'])|'
    r'(?:sim/|\.\./)(?:elab/|solver/elabSolver)|'
    r'public/elab/'
)
FORBIDDEN_REFERENCE = re.compile(
    r'@elab(?:-tutor-plugin|-pack)(?:/|[\"\'])|'
    r'(?:plugins|packs)/elab-tutor(?:/|[\"\'])|'
    r'(?:sim/|\.\./)(?:elab/|solver/elabSolver)|'
    r'[\"\'][^\"\']*(?:ElabLab|elabScene|elabExperimentCatalog)[^\"\']*[\"\']|'
    r'(?<![A-Za-z])data-elab-(?:canvas|lab|core-canvas)|'
    r'io\.elab\.tutor'
)


def violations(root: Path = ROOT) -> list[str]:
    found = [f'removed source or assets exist: {path}' for path in REMOVED_ROOTS if (root / path).exists()]
    packs = root / 'packs'
    if packs.exists():
        for path in sorted(packs.rglob('*')):
            relative = path.relative_to(root).as_posix()
            if path.is_file() and any(rule.search(relative) for rule in PACK_STANDALONE_RULES):
                found.append(f'{relative}: standalone/auth/dashboard/cloud functions forbidden in data/method packs')
    for directory in ('apps/studio/src', 'apps/studio/build', 'apps/studio/plugins', 'apps/studio/sim', 'apps/web/src', 'apps/studio/scripts', 'apps/studio/e2e'):
        base = root / directory
        if not base.exists():
            continue
        for path in sorted(base.rglob('*')):
            if not path.is_file() or path.suffix not in EXECUTABLE_SUFFIXES:
                continue
            if path.relative_to(root).as_posix() == 'apps/studio/src/toolhost/retiredPlugins.ts':
                continue
            qa_source = '__tests__' in path.parts or path.name.endswith(('.test.ts', '.test.tsx')) or directory in ('apps/studio/scripts', 'apps/studio/e2e')
            forbidden = FORBIDDEN_DEPENDENCY if qa_source else FORBIDDEN_REFERENCE
            for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
                if line.lstrip().startswith(('//', '*', '/*')):
                    continue
                if forbidden.search(line):
                    found.append(f'{path.relative_to(root)}:{number}: forbidden removed-product reference')
    for rel in ('package.json', 'apps/studio/vite.config.ts', 'apps/studio/vitest.config.ts', 'bin/monorepo.sh'):
        path = root / rel
        if path.exists() and FORBIDDEN_REFERENCE.search(path.read_text()):
            found.append(f'{rel}: removed-product build dependency')
    return found


def main() -> int:
    found = violations()
    if found:
        print('\n'.join(found))
        return 1
    print('elab_boundary_gate: OK (removed source, assets and runtime imports absent)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
