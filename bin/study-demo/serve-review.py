#!/usr/bin/env python3
"""C2-B browser harness: synthetic private reviews, no initial publications."""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'packages/engine'), str(ROOT / 'services/study-api')]

from exam_c1_fixture import write_bank
from lessonos.study import question_bank
from lessonos.study.store import StudyStore
from seed import seed
from study_api.app import create_app
import uvicorn


def prepare(data_dir):
    """Reuse synthetic actors/bank without the C1 fixture's publication seed."""
    access = json.loads(seed(data_dir).read_text())
    if access.get('synthetic') is not True:
        raise ValueError('synthetic_actors_required')
    store = StudyStore(data_dir / 'study.sqlite')
    try:
        teacher = store.create_principal('tutor-synthetic', 'teacher')
        student = store.create_principal('student-01', 'student')
        if not store.connection.execute(
                'SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',
                ('fluidi', student.id)).fetchone():
            store.add_test_member(teacher, 'fluidi', student.id)
        write_bank(data_dir / 'synthetic-bank')
        actor_path = data_dir / 'review-actors.json'
        actor_path.write_text(json.dumps({
            'synthetic': True,
            'teacherToken': access['tokens'][teacher.id],
            'studentToken': access['tokens'][student.id],
            'bankId': question_bank.BANK_ID,
        }, indent=2))
        actor_path.chmod(0o600)
    finally:
        store.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, default=ROOT / '.study-demo-c2b')
    parser.add_argument('--port', type=int, default=5441)
    args = parser.parse_args()
    os.umask(0o077)
    prepare(args.data_dir)
    question_bank.BANK_PATHS[question_bank.BANK_ID] = args.data_dir / 'synthetic-bank'
    question_bank.clear_bank_cache()
    app = create_app(args.data_dir / 'study.sqlite', demo=True,
                     frontend=ROOT / 'apps/web/dist')
    print(f'Ardesia C2-B synthetic Web/API: http://127.0.0.1:{args.port}', flush=True)
    uvicorn.run(app, host='127.0.0.1', port=args.port, access_log=False,
                log_level='warning')
