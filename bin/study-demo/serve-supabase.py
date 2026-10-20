#!/usr/bin/env python3
"""Run the shared Core on real, isolated local Supabase infrastructure."""
import argparse
import os
from pathlib import Path
import shlex
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]


def configuration(path):
    values = {}
    for line in path.read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            values[key] = shlex.split(value)[0] if value else ''
    return values


if __name__ == '__main__':
    import uvicorn
    from study_api.app import create_app
    from study_api.runtime import SupabaseRuntime
    parser = argparse.ArgumentParser()
    parser.add_argument('--env-file', type=Path, required=True)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--port', type=int, default=5321)
    parser.add_argument('--frontend', type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    runtime = SupabaseRuntime(configuration(args.env_file), args.data_dir)
    app = create_app(args.data_dir / 'postgres.lock', demo=True, runtime=runtime, frontend=args.frontend)
    uvicorn.run(app, host='127.0.0.1', port=args.port, access_log=False)
