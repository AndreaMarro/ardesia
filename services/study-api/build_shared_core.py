"""Stage canonical monorepo packages inside the Python function's bundle root.

This generated build artifact preserves package-relative content paths without
relying on outside-root ZIP entries or editable checkout .pth files at runtime.
"""
from pathlib import Path
import shutil

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


if __name__ == '__main__':
    stage_shared_core(REPOSITORY_ROOT, SERVICE_ROOT / '_core')
    print('Canonical Core packages staged for the acceptance function')
