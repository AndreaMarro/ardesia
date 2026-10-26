import atexit
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[3]
sys.path[:0] = [
    str(ROOT / "packages/engine"),
    str(ROOT / "services/study-api"),
    str(ROOT / "plugins/s19-circuit-lab"),
]
_sandbox = tempfile.TemporaryDirectory(prefix="s19-integration-")
atexit.register(_sandbox.cleanup)
COMPOSED = Path(_sandbox.name)
for relative in (
    "packages/engine/lessonos/study/catalog.py",
    "services/study-api/study_api/app.py",
    "packages/engine/lessonos/study/context.py",
):
    target = COMPOSED / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((ROOT / relative).read_bytes())
(COMPOSED / "packages/engine/lessonos/study/content").symlink_to(
    ROOT / "packages/engine/lessonos/study/content", target_is_directory=True
)
patch = str(ROOT / "handoffs/swarm-v2/S19/integration.patch")
forward = subprocess.run(
    ["git", "apply", "--check", patch], cwd=COMPOSED, capture_output=True, text=True
)
if forward.returncode == 0:
    subprocess.run(["git", "apply", patch], cwd=COMPOSED, check=True)
else:
    integrated = subprocess.run(
        ["git", "apply", "--reverse", "--check", patch],
        cwd=COMPOSED,
        capture_output=True,
        text=True,
    )
    if integrated.returncode:
        raise RuntimeError(
            "S19 owner patch does not match this base or its exact integrated form. Refresh the handoff: "
            + forward.stderr
        )


# Only the three patched owner modules come from the temporary tree. All other
# Core/auth/storage code and the CoursePack content remain the real repository.
def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, COMPOSED / relative)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    parent, _, attr = name.rpartition(".")
    setattr(sys.modules[parent], attr, module)
    return module


import lessonos.study

load("lessonos.study.catalog", "packages/engine/lessonos/study/catalog.py")
load("lessonos.study.context", "packages/engine/lessonos/study/context.py")
import study_api

load("study_api.app", "services/study-api/study_api/app.py")
