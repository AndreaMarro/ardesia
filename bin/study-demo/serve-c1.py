#!/usr/bin/env python3
"""Synthetic C1 browser harness: real Study API, disposable SQLite bank."""
import argparse
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]

from exam_c1_fixture import prepare
from lessonos.study import question_bank
from study_api.app import create_app
import uvicorn

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, default=ROOT / '.study-demo-c1')
    parser.add_argument('--port', type=int, default=5321)
    args = parser.parse_args()
    os.umask(0o077)
    prepare(args.data_dir)
    question_bank.BANK_PATHS[question_bank.BANK_ID] = args.data_dir / 'synthetic-bank'
    question_bank.clear_bank_cache()
    app = create_app(args.data_dir / 'study.sqlite', demo=True)
    print(f'Ardesia C1 synthetic API: http://127.0.0.1:{args.port}', flush=True)
    uvicorn.run(app, host='127.0.0.1', port=args.port, access_log=False,
                log_level='warning')
