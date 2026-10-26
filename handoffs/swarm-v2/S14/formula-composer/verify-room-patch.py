#!/usr/bin/env python3
"""Execute candidate Room/test copies through a Vite loader, leaving source intact.

--control loads only the new tests; expected RED against the original Room.
Default loads patched Room and tests; expected GREEN. This proves the proposed
patch locally, never that its consumer has been integrated into main.
"""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--control", action="store_true")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[4]
    studio = repo / "apps/studio"
    patch = Path(__file__).with_name("room-insert-math-v3.patch").resolve()
    sources = ["apps/studio/src/Room.tsx", "apps/studio/src/__tests__/Room.integration.test.tsx"]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="s14-room-proof-", dir=repo.parent) as temp:
        scratch = Path(temp)
        for source in sources:
            target = scratch / source
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(repo / source, target)
        subprocess.run(["patch", "-p1", "--batch", "-i", str(patch)], cwd=scratch, check=True)
        selected = sources[1:] if args.control else sources
        mapping = {str(repo / source): str(scratch / source) for source in selected}
        config = scratch / "vitest.config.ts"
        config.write_text(
            f'import base from {json.dumps(str(studio / "vitest.config.ts"))}\n'
            'import { readFileSync } from "node:fs"\n'
            f'const copies = {json.dumps(mapping)}\n'
            'export default { ...base, plugins: [{ name: "s14-room-candidate-copy", enforce: "pre", '
            'load(id) { const copy = copies[id.split("?")[0]]; '
            'if (copy) return readFileSync(copy, "utf8") } }, ...(base.plugins ?? [])] }\n'
        )
        command = [str(repo / "node_modules/.bin/vitest"), "run", "--config", str(config),
                   "src/__tests__/Room.integration.test.tsx", "-t", "insertMath",
                   "--pool=threads", "--maxWorkers=1", "--no-file-parallelism",
                   "--testTimeout=30000", "--hookTimeout=30000", "--teardownTimeout=30000"]
        result = subprocess.run(command, cwd=studio, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        args.output.write_text(result.stdout)
        print(result.stdout[-7500:])
        print(f"control={args.control} exit={result.returncode} log={args.output}")
        return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
