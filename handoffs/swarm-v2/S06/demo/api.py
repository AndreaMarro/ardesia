"""Synthetic local composition only; production hook remains S10/S00-owned."""
from pathlib import Path
import json,os
from study_api import admin_routes
from study_api.app import create_app
from lessonos.study.store import StudyStore
from lessonos.study.independent_study.routes import install_routes
ROOT=Path(__file__).parent
old=admin_routes.install_admin_routes
def install(app, store_dependency, authenticate):
    old(app,store_dependency,authenticate)
    install_routes(app,store_dependency,authenticate)
admin_routes.install_admin_routes=install
path=ROOT/('study-'+os.environ.get('S06_DEMO_RUN','first')+'.sqlite')
if not path.exists():
    s=StudyStore(path)
    t=s.create_principal('tutor-s06','teacher');a=s.create_principal('student-s06-a','student');b=s.create_principal('student-s06-b','student')
    for slug in ['strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni','analisi-1']:
        s.create_edition(t,slug,course_id=slug,pack_id='taylor-exp-v1' if slug=='analisi-1' else 'sf-'+slug+'-v1',pack_version=1)
        s.add_test_member(t,slug,a.id);s.add_test_member(t,slug,b.id)
    (ROOT/'access.json').write_text(json.dumps({'student':s.issue_session(a,ttl=86400),'peer':s.issue_session(b,ttl=86400)}))
    (ROOT/'access.json').chmod(0o600);s.close()
app=create_app(path,demo=True)
