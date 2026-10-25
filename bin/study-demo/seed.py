#!/usr/bin/env python3
"""Idempotent synthetic identity seed, never pre-publishes review/enrollment."""
import argparse,json,os,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.store import StudyStore
from lessonos.study.groups import configure_sessions


def seed(data_dir):
    os.umask(0o077)
    data_dir=Path(data_dir);data_dir.mkdir(parents=True,exist_ok=True,mode=0o700)
    credentials=data_dir/'demo-access.json'
    if credentials.exists():return credentials
    store=StudyStore(data_dir/'study.sqlite')
    tutor=store.create_principal('tutor-synthetic','teacher')
    other=store.create_principal('tutor-other','teacher')
    if not store.connection.execute("SELECT 1 FROM study_editions WHERE id='fluidi'").fetchone():
        store.create_edition(tutor,'fluidi')
        sessions=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in [3,5,10,12]]
        configure_sessions(store,tutor,'fluidi',sessions)
    access={tutor.id:store.issue_session(tutor,ttl=7*86400),other.id:store.issue_session(other,ttl=7*86400)}
    for i in range(1,13):
        student=store.create_principal(f'student-{i:02}','student')
        access[student.id]=store.issue_session(student,ttl=7*86400)
    credentials.write_text(json.dumps({'synthetic':True,'tokens':access},indent=2))
    credentials.chmod(0o600);store.close()
    return credentials

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--data-dir',type=Path,default=ROOT/'.study-demo');args=parser.parse_args()
    path=seed(args.data_dir);print(f'Synthetic access file: {path} (private; never commit or share)')
