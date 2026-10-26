"""Synthetic real Core + S18 installer. Repeatable restart uses the same SQLite/blobs."""
import os,json
from pathlib import Path
from lessonos.study.store import StudyStore
from composition import composed_factory
from make_fixture import fixture
from lessonos.study.assets import upload_asset
from lessonos.study.living_sources import save_source
root=Path(os.environ['ARDESIA_S18_STATE']);root.mkdir(parents=True,exist_ok=True)
if not (root/'identity.json').exists():
    s=StudyStore(root/'study.sqlite');t=s.create_principal('s18-teacher','teacher');u=s.create_principal('s18-student','student');p=s.create_principal('s18-peer','student')
    s.create_edition(t,'fluidi')
    for actor in [u,p]:s.add_test_member(t,'fluidi',actor.id)
    a=upload_asset(s,t,'fluidi',fixture(),'application/pdf',root/'blobs',key='fixture')
    source=save_source(s,t,'fluidi',{'assetId':a['id'],'sha256':a['sha256'],'title':'Equilibrio idrostatico','version':'1'},'group','fixture-source',root/'blobs')
    (root/'identity.json').write_text(json.dumps({'teacher':{'id':t.id,'token':s.issue_session(t)},'student':{'id':u.id,'token':s.issue_session(u)},'peer':{'id':p.id,'token':s.issue_session(p)},'source':source}))
    s.close()
app=composed_factory()(root/'study.sqlite',demo=True,frontend=Path(os.environ['ARDESIA_S18_FRONTEND']) if os.environ.get('ARDESIA_S18_FRONTEND') else None,auth_limit=1000)
@app.middleware('http')
async def csp(request,call_next):
    response=await call_next(request)
    response.headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:5418; object-src 'none'; frame-src 'none'; base-uri 'self'"
    return response
