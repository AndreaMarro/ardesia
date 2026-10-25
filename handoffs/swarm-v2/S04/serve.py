"""Private loopback harness using the real bank and canonical synthetic actors."""
import argparse
import json
import os
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[3]
sys.path[:0]=[str(ROOT/'packages/engine'),str(ROOT/'services/study-api'),str(ROOT/'bin/study-demo')]
from seed import seed
from lessonos.study.store import StudyStore
from study_api.app import create_app
import uvicorn
from study_api import question_bank_routes
from lessonos.study.assessment_quality.routes import install_assessment_quality_routes
original_install=question_bank_routes.install_question_bank_routes
def install_validation_composition(app,store_dependency,authenticate):
    original_install(app,store_dependency,authenticate)
    install_assessment_quality_routes(app,store_dependency,authenticate)
question_bank_routes.install_question_bank_routes=install_validation_composition


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--data-dir',type=Path,required=True);parser.add_argument('--port',type=int,default=5454);args=parser.parse_args()
    os.umask(0o077)
    access=json.loads(seed(args.data_dir).read_text())
    store=StudyStore(args.data_dir/'study.sqlite')
    try:
        teacher=store.create_principal('tutor-synthetic','teacher');student=store.create_principal('student-01','student')
        members=store.connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',('fluidi',student.id)).fetchone()
        if not members:store.add_test_member(teacher,'fluidi',student.id)
    finally:store.close()
    uvicorn.run(create_app(args.data_dir/'study.sqlite',demo=True,frontend=ROOT/'apps/web/dist'),host='127.0.0.1',port=args.port,access_log=False,log_level='warning')
