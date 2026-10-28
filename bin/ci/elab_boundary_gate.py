#!/usr/bin/env python3
"""Reject any reintroduction of the removed product into a build or runtime.

Historical prose and journal evidence are intentionally not rewritten. This
checks physical absence plus executable references, without a shrinking baseline.
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
EXECUTABLE_SUFFIXES = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.sh', '.yml', '.yaml'}
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
    for directory in ('apps/studio/src', 'apps/studio/build', 'apps/studio/plugins', 'apps/studio/sim', 'apps/web/src'):
        base = root / directory
        if not base.exists():
            continue
        for path in sorted(base.rglob('*')):
            if not path.is_file() or path.suffix not in EXECUTABLE_SUFFIXES:
                continue
            if path.relative_to(root).as_posix() == 'apps/studio/src/toolhost/retiredPlugins.ts':
                continue
            if '__tests__' in path.parts or path.name.endswith(('.test.ts', '.test.tsx')):
                continue
            for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
                if line.lstrip().startswith(('//', '*', '/*')):
                    continue
                if FORBIDDEN_REFERENCE.search(line):
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
