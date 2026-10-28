#!/usr/bin/env python3
"""Reconcile durable unfinished uploads; output counts only, never credentials.

Remote recovery uses the independent, expiring private operator worker. The
original loopback profile remains available with --env-file and --data-dir.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]


def main(argv=None):
    from lessonos.study.models import StudyError
    from lessonos.study.uploads import recover_uploads
    parser=argparse.ArgumentParser(description=__doc__)
    identity=parser.add_mutually_exclusive_group(required=True)
    identity.add_argument('--operator-file',type=Path,help='Private remote worker capability file, mode0600')
    identity.add_argument('--env-file',type=Path,help='Existing isolated loopback runtime environment')
    parser.add_argument('--data-dir',type=Path)
    parser.add_argument('--limit',type=int,default=100)
    parser.add_argument('--apply',action='store_true')
    args=parser.parse_args(argv)
    if args.operator_file:
        from study_api.upload_recovery import RemoteUploadRecovery
        try:
            operator=RemoteUploadRecovery.from_file(args.operator_file)
            result=({'applied':True,**recover_uploads(operator,operator,limit=args.limit)} if args.apply else
                    {'applied':False,'recoverable':len(operator.upload_recovery_candidates(args.limit))})
            print(json.dumps(result))
            return int(bool(result.get('failed')))
        except (ValueError,OSError,StudyError):
            print(json.dumps({'error':'upload_recovery_unavailable'}))
            return 1
    if not args.data_dir:parser.error('--data-dir is required with --env-file')
    from lessonos.study.postgres import PostgresStudyStore
    from study_api.runtime import SupabaseRuntime,SupabaseBlobs
    spec=importlib.util.spec_from_file_location('supabase_server',Path(__file__).with_name('serve-supabase.py'))
    server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)
    runtime=SupabaseRuntime(server.configuration(args.env_file),args.data_dir)
    store=PostgresStudyStore(runtime.database_url,args.data_dir,administrative=True)
    try:
        if args.apply:
            result=recover_uploads(store,SupabaseBlobs(runtime,''),limit=args.limit)
            print(json.dumps({'applied':True,**result}))
            return int(bool(result['failed']))
        count=store.connection.execute("SELECT COUNT(*) FROM study_upload_intents WHERE state='cleanup_required' OR (state='pending' AND expires_at<=?)",(store.clock(),)).fetchone()[0]
        print(json.dumps({'applied':False,'recoverable':count}))
        return 0
    finally:store.close()


if __name__=='__main__':raise SystemExit(main())
