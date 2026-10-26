"""Acquire immutable upstream source without its datasets/board or wheel hooks."""

import argparse
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("--cache", type=Path, required=True)
parser.add_argument("--python", required=True)
parser.add_argument("--uv", default="uv")
args = parser.parse_args()
lock = json.loads(
    (Path(__file__).resolve().parents[1] / "engine.lock.json").read_text()
)
cache = args.cache.resolve()


def run(*cmd):
    return subprocess.check_output(cmd, text=True).strip()


if not cache.exists():
    subprocess.run(
        [
            "git",
            "clone",
            "--filter=blob:none",
            "--no-checkout",
            lock["repository"],
            str(cache),
        ],
        check=True,
    )
    subprocess.run(
        [
            "git",
            "-C",
            str(cache),
            "sparse-checkout",
            "set",
            "--no-cone",
            *lock["sparsePaths"],
        ],
        check=True,
    )
    subprocess.run(
        ["git", "-C", str(cache), "checkout", "--detach", lock["commit"]], check=True
    )
if run("git", "-C", str(cache), "rev-parse", "HEAD") != lock["commit"] or run(
    "git", "-C", str(cache), "status", "--porcelain"
):
    raise SystemExit(
        "Engine checkout must be clean at the locked commit. No reset is performed."
    )
subprocess.run(
    [args.uv, "pip", "install", "--python", args.python, "--no-deps", "-e", str(cache)],
    check=True,
)
print("Kirchhoff installed at verified commit " + lock["commit"])
