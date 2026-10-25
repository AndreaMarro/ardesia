#!/usr/bin/env python3
"""Inspect/reconcile only durable unfinished uploads in the isolated runtime.

No browser endpoint. No token, original content or object ID is printed.
Expired pending intents have a ten-minute grace beyond normal provider timeouts;
never run immediately after killing an in-flight external upload request.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]
spec = importlib.util.spec_from_file_location('supabase_server', Path(__file__).with_name('serve-supabase.py'))
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


if __name__ == '__main__':
    from lessonos.study.postgres import PostgresStudyStore
    from lessonos.study.uploads import recover_uploads
    from study_api.runtime import SupabaseRuntime, SupabaseBlobs
    parser = argparse.ArgumentParser()
    parser.add_argument('--env-file', type=Path, required=True)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--limit', type=int, default=100)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    runtime = SupabaseRuntime(server.configuration(args.env_file), args.data_dir)
    store = PostgresStudyStore(runtime.database_url, args.data_dir, administrative=True)
    try:
        if args.apply:
            result = recover_uploads(store, SupabaseBlobs(runtime, ''), limit=args.limit)
            print(json.dumps({'applied': True, **result}))
            if result['failed']:
                sys.exit(1)
        else:
            count = store.connection.execute("SELECT COUNT(*) FROM study_upload_intents WHERE state='cleanup_required' OR (state='pending' AND expires_at<=?)", (store.clock(),)).fetchone()[0]
            print(json.dumps({'applied': False, 'recoverable': count}))
    finally:
        store.close()
