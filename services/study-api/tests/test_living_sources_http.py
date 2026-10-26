"""Living sources cross the real application factory, cookie and Core boundary."""
from io import BytesIO
import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter
from study_api.app import create_app
from test_identity import setup_store


def test_http_shared_original_private_note_revocation_and_deleted_source(tmp_path):
    store,t,student,peer,_=setup_store(tmp_path)
    app=create_app(store.path,demo=True)
    with TestClient(app) as client:
        def login(p): assert client.post('/study/session',json={'token':store.issue_session(p)}).status_code==200
        login(t)
        pdf=PdfWriter();pdf.add_blank_page(width=300,height=400);out=BytesIO();pdf.write(out)
        asset=client.post('/study/assets?editionId=fluidi',content=out.getvalue(),headers={'Content-Type':'application/pdf','Idempotency-Key':'original'}).json()
        body={'editionId':'fluidi','document':{'title':'Idrostatica','version':'1','assetId':asset['id'],'sha256':asset['sha256']},'visibility':'group'}
        source=client.post('/study/living-sources',json=body,headers={'Idempotency-Key':'source'}).json()
        assert 'document' in source,source
        path=f"/study/living-sources/{source['id']}/revisions/{source['revisionId']}"
        login(student)
        assert client.get('/study/assets/'+asset['id']).status_code==403
        actual=client.get(path+'/original');assert actual.status_code==200 and actual.content==out.getvalue()
        target={k:source[k] for k in ['revisionId','contextId']};target.update(resourceId=source['id'],documentSha256=asset['sha256'],page=1,rects=[[.1,.1,.5,.1]],text=None)
        note_body={'editionId':'fluidi','visibility':'private','annotation':{'target':target,'blocks':[{'kind':'explanation','text':'PERSONAL-SECRET'}],'lesson':{'lessonId':'idrostatica','activityId':'poiseuille-v1'}}}
        note=client.post('/study/living-annotations',json=note_body,headers={'Idempotency-Key':'note'}).json()
        note_path=f"/study/living-annotations/{note['id']}/revisions/{note['revisionId']}"
        login(peer);denied=client.get(note_path);assert denied.status_code==403 and 'PERSONAL-SECRET' not in denied.text
        login(student)
        exported=client.get(note_path+'/export');assert exported.status_code==200
        import base64
        bundle=exported.json();upload=client.post('/study/assets?editionId=fluidi',content=base64.b64decode(bundle['original'].pop('base64')),headers={'Content-Type':'application/pdf','Idempotency-Key':'import-pdf'}).json();bundle['original']['assetId']=upload['id']
        imported=client.post('/study/living-sources/import',json={'editionId':'fluidi','bundle':bundle},headers={'Idempotency-Key':'import'})
        assert imported.status_code==200,imported.text
        store.connection.execute('DELETE FROM study_members WHERE student_id=?',(student.id,));store.connection.commit()
        assert client.post('/study/living-annotations',json=note_body,headers={'Idempotency-Key':'note'}).status_code==403
        assert client.get(path+'/original').status_code==403
        login(t);client.delete('/study/resources/'+source['id']);assert client.get(path).status_code==404
    store.close()

def test_large_portable_pdf_uses_original_upload_and_small_manifest_under_body_admission(tmp_path):
    import base64
    store,t,student,_,_=setup_store(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.post('/study/session',json={'token':store.issue_session(t)}).status_code==200
        pdf=PdfWriter();pdf.add_blank_page(width=300,height=400);pdf.add_metadata({'/S18Padding':'x'*300000});out=BytesIO();pdf.write(out);data=out.getvalue()
        asset=client.post('/study/assets?editionId=fluidi',content=data,headers={'Content-Type':'application/pdf','Idempotency-Key':'large-pdf'}).json()
        source=client.post('/study/living-sources',json={'editionId':'fluidi','document':{'title':'Large fixture','version':'1','assetId':asset['id'],'sha256':asset['sha256']},'visibility':'group'},headers={'Idempotency-Key':'large-source'}).json()
        target={k:source[k] for k in ['revisionId','contextId']};target.update(resourceId=source['id'],documentSha256=asset['sha256'],page=1,rects=[[.1,.1,.4,.2]],text=None)
        note=client.post('/study/living-annotations',json={'editionId':'fluidi','annotation':{'target':target,'blocks':[{'kind':'explanation','text':'Large fixture note'}],'lesson':None},'visibility':'group'},headers={'Idempotency-Key':'large-note'}).json()
        client.post('/study/session',json={'token':store.issue_session(student)})
        bundle=client.get(f"/study/living-annotations/{note['id']}/revisions/{note['revisionId']}/export").json()
        assert len(bundle['original']['base64'])>256*1024
        # Bytes use the existing admitted asset transport, not an enlarged JSON route.
        uploaded=client.post('/study/assets?editionId=fluidi',content=base64.b64decode(bundle['original']['base64']),headers={'Content-Type':'application/pdf','Idempotency-Key':'import-large-pdf'}).json()
        bundle['original'].pop('base64');bundle['original']['assetId']=uploaded['id']
        imported=client.post('/study/living-sources/import',json={'editionId':'fluidi','bundle':bundle},headers={'Idempotency-Key':'import-large'})
        assert imported.status_code==200,imported.text
        assert imported.json()['annotation']['origin']['revisionId']==note['revisionId']
    store.close()
