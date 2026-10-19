"""Portable, read-only study notebook. It is explicitly not the legacy .lesson format."""
import base64,json
from .assets import read_asset
from .models import StudyError
from .store import canonical,digest
from .submissions import list_submissions
from .feedback import list_feedback


def export_notebook(store,principal,edition_id,blob_dir):
    store._edition_access(principal,edition_id)
    resources=[]
    for row in store.connection.execute('SELECT id FROM study_resources WHERE edition_id=? AND deleted=0',(edition_id,)):
        try:resources.append(store.get_resource(principal,row['id']))
        except StudyError:pass
    submissions=list_submissions(store,principal,edition_id)
    for row in submissions:row['feedback']=list_feedback(store,principal,row['id'])
    assets=[];total=0
    omissions=['Read-only notebook: does not restore server sessions, enrollment, live collaboration or payment state.','Historical source revisions and the legacy Excalidraw/audio journal use the separate .lesson export.','No live OCR, ASR or AI result is certified by this export.']
    for asset_id in sorted({ref for row in submissions for ref in row['asset_refs']}):
        data,mime=read_asset(store,principal,asset_id,blob_dir)
        total+=len(data)
        if total>50*1024*1024:omissions.append('Attachment omitted by 50 MiB notebook budget: '+asset_id);continue
        assets.append({'id':asset_id,'mime':mime,'sha256':digest(data),'bytes':len(data),'base64':base64.b64encode(data).decode()})
    layout=store.connection.execute('SELECT data FROM study_layouts WHERE actor_id=? AND edition_id=?',(principal.id,edition_id)).fetchone()
    bundle={'format':'ardesia-study-notebook-v1','schemaVersion':1,'synthetic':True,'resources':resources,'submissions':submissions,'assets':assets,'layout':json.loads(layout[0]) if layout else [],'omissions':omissions}
    bundle['sha256']=digest(canonical(bundle))
    return bundle


def inspect_notebook(bundle):
    if not isinstance(bundle,dict) or bundle.get('format')!='ardesia-study-notebook-v1' or bundle.get('schemaVersion')!=1:raise StudyError('unsupported_notebook')
    payload={key:value for key,value in bundle.items() if key!='sha256'}
    if digest(canonical(payload))!=bundle.get('sha256'):raise StudyError('notebook_integrity_failure')
    resources=bundle.get('resources',[]);submissions=bundle.get('submissions',[]);assets=bundle.get('assets',[])
    if not isinstance(resources,list) or len(resources)>100 or not isinstance(submissions,list) or len(submissions)>100 or not isinstance(assets,list) or len(assets)>100:raise StudyError('notebook_budget_exceeded')
    for resource in resources:
        if digest(resource['text'])!=resource['sha256']:raise StudyError('source_integrity_failure')
    total=0
    for asset in assets:
        data=base64.b64decode(asset['base64'],validate=True);total+=len(data)
        if total>50*1024*1024 or len(data)!=asset['bytes'] or digest(data)!=asset['sha256']:raise StudyError('asset_integrity_failure')
    return {'valid':True,'resources':len(resources),'submissions':len(submissions),'assets':len(assets),'omissions':bundle.get('omissions',[]),'sha256':bundle['sha256']}
