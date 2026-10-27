"""Private loopback: production create_app, no quality hook or mocked responses."""
import argparse
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
sys.path[:0] = [str(ROOT / path) for path in
               ('packages/engine', 'services/study-api', 'bin/study-demo')]
from seed import seed
from lessonos.study.store import StudyStore
from study_api.app import create_app
import uvicorn

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--port', type=int, default=5454)
    args = parser.parse_args()
    os.umask(0o077)
    seed(args.data_dir)
    store = StudyStore(args.data_dir / 'study.sqlite')
    try:
        teacher = store.create_principal('tutor-synthetic', 'teacher')
        student = store.create_principal('student-01', 'student')
        member = store.connection.execute(
            'SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',
            ('fluidi', student.id)).fetchone()
        if not member:
            store.add_test_member(teacher, 'fluidi', student.id)
    finally:
        store.close()
    uvicorn.run(create_app(args.data_dir / 'study.sqlite', demo=True,
                          frontend=ROOT / 'apps/web/dist'),
                host='127.0.0.1', port=args.port, access_log=False,
                log_level='warning')
