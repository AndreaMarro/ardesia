"""S18 original bytes, exact revisions and selectors use the existing Core ledger."""
from copy import deepcopy
from io import BytesIO
import pytest
from pypdf import PdfWriter
from lessonos.study.store import StudyStore, digest
from lessonos.study.models import StudyError
from lessonos.study.assets import upload_asset
from lessonos.study.living_sources import save_source, read_source, read_original, save_annotation, read_annotation, export_bundle, import_bundle

@pytest.fixture
def scene(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    teacher = store.create_principal('s18-teacher', 'teacher')
    student = store.create_principal('s18-student', 'student')
    peer = store.create_principal('s18-peer', 'student')
    outsider = store.create_principal('s18-other', 'teacher')
    store.create_edition(teacher, 'fluidi')
    for p in [student, peer]: store.add_test_member(teacher, 'fluidi', p.id)
    pdf = PdfWriter()
    for _ in range(2): pdf.add_blank_page(width=300, height=400)
    output = BytesIO(); pdf.write(output)
    blobs = tmp_path / 'blobs'
    asset = upload_asset(store, teacher, 'fluidi', output.getvalue(), 'application/pdf', blobs, key='pdf')
    yield store, teacher, student, peer, outsider, blobs, asset
    store.close()

def create(s, visibility='group', **kw):
    store,t,_,_,_,blobs,asset=s
    return save_source(store,t,'fluidi', {'assetId':asset['id'],'sha256':asset['sha256'],'title':'Idrostatica','version':'1'},visibility,'source-'+visibility,blobs,**kw)

def target(source, page=2):
    return {'resourceId':source['id'],'revisionId':source['revisionId'],'contextId':source['contextId'],
            'documentSha256':source['document']['sha256'],'page':page,'rects':[[.1,.2,.4,.1]],'text':None}

def test_shared_source_gives_only_its_verified_original_and_private_annotation(scene):
    store,t,student,peer,outsider,blobs,asset=scene
    source=create(scene)
    assert read_original(store,student,source['id'],source['revisionId'],blobs)[1]['sha256']==asset['sha256']
    ann=save_annotation(store,student,'fluidi',{'target':target(source),'blocks':[{'kind':'explanation','text':'p = rho g h'}],'lesson':{'lessonId':'idrostatica','activityId':'poiseuille-v1'}},'private','ann',blobs)
    assert read_annotation(store,student,ann['id'],ann['revisionId'],blobs)['annotation']['target']==target(source)
    for p in [peer,t,outsider]:
        with pytest.raises(StudyError): read_annotation(store,p,ann['id'],ann['revisionId'],blobs)
    with pytest.raises(StudyError): read_original(store,outsider,source['id'],source['revisionId'],blobs)

def test_exact_old_revision_survives_source_update_and_never_substitutes(scene):
    store,t,student,_,_,blobs,asset=scene
    first=create(scene)
    body={**first['document'],'title':'Nuova edizione','version':'2'}
    second=save_source(store,t,'fluidi',body,'group','v2',blobs,resource_id=first['id'],expected_revision=first['revisionId'])
    assert second['revisionId']!=first['revisionId']
    assert read_source(store,student,first['id'],first['revisionId'],blobs)['document']['version']=='1'
    assert save_source(store,t,'fluidi',body,'group','v2',blobs,resource_id=first['id'],expected_revision=first['revisionId'])==second
    with pytest.raises(StudyError,match='stale_revision'): save_source(store,t,'fluidi',body,'group','v3',blobs,resource_id=first['id'],expected_revision=first['revisionId'])

def test_forged_asset_hash_page_and_deleted_bytes_fail_closed(scene):
    store,t,student,_,_,blobs,asset=scene
    source=create(scene)
    with pytest.raises(StudyError): save_source(store,student,'fluidi',source['document'],'private','stolen',blobs)
    for patch in [{'page':3},{'documentSha256':'a'*64},{'rects':[[.9,.1,.5,.1]]}]:
        with pytest.raises(StudyError): save_annotation(store,student,'fluidi',{'target':{**target(source),**patch},'blocks':[{'kind':'explanation','text':'x'}],'lesson':None},'private','invalid',blobs)
    store.connection.execute('UPDATE study_assets SET deleted=1 WHERE id=?',(asset['id'],));store.connection.commit()
    with pytest.raises(StudyError): read_source(store,student,source['id'],source['revisionId'],blobs)
    with pytest.raises(StudyError): create(scene)

def test_group_annotation_requires_teacher_and_private_source_never_becomes_group(scene):
    store,t,student,_,_,blobs,_=scene
    source=create(scene)
    body={'target':target(source),'blocks':[{'kind':'formula','text':'p=\\rho gh'}],'lesson':None}
    shared=save_annotation(store,t,'fluidi',body,'group','shared',blobs)
    assert read_annotation(store,student,shared['id'],shared['revisionId'],blobs)['visibility']=='group'
    with pytest.raises(StudyError): save_annotation(store,student,'fluidi',body,'group','bad',blobs)
    private=create(scene,'private')
    with pytest.raises(StudyError): save_annotation(store,t,'fluidi',{**body,'target':target(private)},'group','private-leak',blobs)

def test_export_import_restores_bytes_and_keeps_original_reference_not_a_grant(scene,tmp_path):
    store,t,student,_,_,blobs,_=scene
    source=create(scene)
    ann=save_annotation(store,student,'fluidi',{'target':target(source),'blocks':[{'kind':'explanation','text':'Una nota'}],'lesson':None},'private','note',blobs)
    bundle=export_bundle(store,student,ann['id'],ann['revisionId'],blobs)
    assert bundle['source']['revisionId']==source['revisionId']
    result=import_bundle(store,student,'fluidi',bundle,'import',blobs)
    assert result['annotation']['origin']['revisionId']==ann['revisionId']
    assert result['annotation']['target']['documentSha256']==source['document']['sha256']
    changed=deepcopy(bundle);changed['original']['base64']='AAAA'
    with pytest.raises(StudyError): import_bundle(store,student,'fluidi',changed,'tampered',blobs)
    reopened=StudyStore(store.path)
    try: assert read_annotation(reopened,student,result['id'],result['revisionId'],blobs)['annotation']==result['annotation']
    finally: reopened.close()

def test_generic_resource_cannot_launder_another_actors_asset_or_edition(scene):
    from lessonos.study.store import canonical
    store,t,student,peer,_,blobs,asset=scene
    source=create(scene)
    forged=store.create_resource(student,'fluidi','living-source',canonical(source['document']),'private')
    with pytest.raises(StudyError,match='source_original_mismatch'):
        read_original(store,student,forged['id'],forged['revisionId'],blobs)
    # A teacher's group JSON may not wrap an upload owned by a student.
    data,_=read_original(store,t,source['id'],source['revisionId'],blobs)
    other=upload_asset(store,peer,'fluidi',data,'application/pdf',blobs,key='peer-pdf')
    forged=store.create_resource(t,'fluidi','living-source',canonical({**source['document'],'assetId':other['id']}),'group')
    with pytest.raises(StudyError,match='source_original_mismatch'):
        read_original(store,student,forged['id'],forged['revisionId'],blobs)
    store.create_edition(t,'another')
    forged=store.create_resource(t,'another','living-source',canonical(source['document']),'group')
    with pytest.raises(StudyError,match='source_original_mismatch'):
        read_original(store,t,forged['id'],forged['revisionId'],blobs)
    forged=store.create_resource(t,'fluidi','living-source',canonical({**source['document'],'sha256':'f'*64}),'group')
    with pytest.raises(StudyError,match='source_original_mismatch'):
        read_original(store,student,forged['id'],forged['revisionId'],blobs)

def test_replayed_annotation_after_membership_revocation_is_denied(scene):
    store,t,student,_,_,blobs,_=scene
    source=create(scene);body={'target':target(source),'blocks':[{'kind':'explanation','text':'privata'}],'lesson':None}
    note=save_annotation(store,student,'fluidi',body,'private','retry',blobs)
    store.connection.execute('DELETE FROM study_members WHERE student_id=?',(student.id,));store.connection.commit()
    with pytest.raises(StudyError,match='forbidden'): save_annotation(store,student,'fluidi',body,'private','retry',blobs)
    with pytest.raises(StudyError,match='forbidden'): read_annotation(store,student,note['id'],note['revisionId'],blobs)

def test_distinct_document_bytes_and_text_selector_contract(scene):
    store,t,student,_,_,blobs,asset=scene
    first=create(scene)
    pdf=PdfWriter();pdf.add_blank_page(width=301,height=400);out=BytesIO();pdf.write(out)
    new=upload_asset(store,t,'fluidi',out.getvalue(),'application/pdf',blobs,key='different-pdf')
    second=save_source(store,t,'fluidi',{**first['document'],'assetId':new['id'],'sha256':new['sha256'],'version':'2'},'group','second',blobs,resource_id=first['id'],expected_revision=first['revisionId'])
    assert first['document']['sha256']!=second['document']['sha256']
    assert read_original(store,student,first['id'],first['revisionId'],blobs)[1]['sha256']==asset['sha256']
    selector={'model':'native-pdfjs-items-concat-utf16-v1','start':1,'end':3,'exact':'💧','prefix':'a','suffix':'b'}
    body={'target':{**target(first),'text':selector},'blocks':[{'kind':'explanation','text':'Unicode'}],'lesson':None}
    note=save_annotation(store,student,'fluidi',body,'private','unicode',blobs)
    assert note['annotation']['target']['text']==selector
    for patch in [{'model':'ocr'},{'end':2},{'start':True}]:
        with pytest.raises(StudyError):save_annotation(store,student,'fluidi',{**body,'target':{**body['target'],'text':{**selector,**patch}}},'private','invalid-text',blobs)

def test_missing_original_bytes_report_unavailable_without_latest_fallback(scene):
    store,t,student,_,_,blobs,asset=scene
    source=create(scene)
    (blobs/asset['id']).unlink()
    with pytest.raises(StudyError,match='source_original_unavailable'):
        read_original(store,student,source['id'],source['revisionId'],blobs)
