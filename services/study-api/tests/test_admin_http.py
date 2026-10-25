"""Tutor management uses the same verified session and canonical Core."""
from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from study_api.app import create_app


def test_teacher_creates_configures_previews_and_explicitly_offers_without_charging(tmp_path):
    store=StudyStore(tmp_path/'management.sqlite')
    tutor=store.create_principal('management-tutor','teacher')
    token=store.issue_session(tutor)
    app=create_app(store.path,demo=True)
    with TestClient(app) as client:
        assert client.post('/study/session',json={'token':token}).status_code==200
        registry=client.get('/study/admin/coursepacks')
        assert registry.status_code==200
        assert {pack['packId'] for pack in registry.json()['items']}=={'relazioni-fluidi-v1','taylor-exp-v1',*(f'sf-{path}-v1' for path in ('strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni'))}
        body={'packId':'taylor-exp-v1','packVersion':1,'capacity':10,'priceMinor':3900}
        headers={'Idempotency-Key':'create-management'}
        created=client.post('/study/admin/editions',json=body,headers=headers)
        assert created.status_code==200
        edition=created.json()['edition'];eid=edition['id']
        assert edition['state']=='draft' and edition['managementRevision']==0
        assert client.post('/study/admin/editions',json=body,headers=headers).json()==created.json()
        dates=[{'localStart':f'2026-11-{day:02}T18:00'} for day in (3,5,10,12)]
        configured=client.patch('/study/admin/editions/'+eid,json={'capacity':10,'priceMinor':3900,'expectedRevision':0,'starts':dates},headers={'Idempotency-Key':'configure-management'})
        assert configured.status_code==200
        edition=configured.json()['edition']
        assert edition['managementRevision']==1 and len(edition['sessions'])==4
        assert edition['sessions'][0]=={'start':'2026-11-03T18:00:00+01:00','end':'2026-11-03T19:30:00+01:00'}
        preview=client.post('/study/admin/editions/'+eid+'/offer/preview',json={'expectedRevision':1},headers={'Idempotency-Key':'preview-management'})
        assert preview.status_code==200
        plan=preview.json()
        confirmed=client.post('/study/admin/editions/'+eid+'/offer/confirm',json={'previewId':plan['previewId'],'previewHash':plan['previewHash'],'expectedRevision':1,'confirmed':True},headers={'Idempotency-Key':'confirm-management'})
        assert confirmed.status_code==200
        result=confirmed.json()
        assert result['edition']['state']=='offered' and result['edition']['managementRevision']==2
        assert result['scientificApproval']=='NOT_ATTESTED' and result['paymentMode']=='test'
        legacy=client.post('/study/editions/'+eid+'/approve',headers={'Idempotency-Key':'legacy-bypass'})
        assert legacy.status_code==409 and legacy.json()['error']=='offer_preview_required'
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_holds').fetchone()[0]==0
    store.close()


def test_admin_dto_ownership_draft_visibility_and_revocation_fail_closed(tmp_path):
    store=StudyStore(tmp_path/'scope.sqlite')
    actors=[store.create_principal(actor,role) for actor,role in [('owner','teacher'),('other','teacher'),('learner','student')]]
    tokens=[store.issue_session(actor) for actor in actors]
    app=create_app(store.path,demo=True)
    body={'packId':'relazioni-fluidi-v1','packVersion':1,'capacity':10,'priceMinor':4900}
    with TestClient(app) as client:
        assert client.get('/study/admin/coursepacks').status_code==401
        client.post('/study/session',json={'token':tokens[0]})
        for extra in ({'actorId':'other'},{'role':'teacher'},{'state':'offered'},{'packSha256':'0'*64}):
            assert client.post('/study/admin/editions',json=body|extra,headers={'Idempotency-Key':'forged'}).status_code==422
        for changes in ({'capacity':True},{'capacity':11},{'capacity':10**1000},{'priceMinor':3900.0},{'packVersion':True}):
            assert client.post('/study/admin/editions',json=body|changes,headers={'Idempotency-Key':'invalid'}).status_code==422
        assert client.post('/study/admin/editions',json=body).status_code==422
        created=client.post('/study/admin/editions',json=body,headers={'Idempotency-Key':'owned'}).json()
        eid=created['edition']['id']
        assert client.get('/study/course?editionId='+eid).status_code==200
        client.cookies.clear()
        assert client.get('/study/course?editionId='+eid).status_code==404
        assert client.get('/study/coursepack?editionId='+eid).status_code==404
        interest={'editionId':eid,'contact':'fixture@example.invalid','consent':True,'topic':'Fluidi','slots':['evening']}
        assert client.post('/study/interests',json=interest,headers={'Idempotency-Key':'hidden-draft'}).status_code==404
        for index in (1,2):
            client.post('/study/session',json={'token':tokens[index]})
            assert client.get('/study/admin/editions/'+eid).status_code==403
            assert client.get('/study/workspace?editionId='+eid).status_code==404
        assert client.get('/study/admin/coursepacks').status_code==403
        client.post('/study/session',json={'token':tokens[0]})
        store.revoke_session(client.cookies.get('study_session'))
        assert client.get('/study/admin/editions/'+eid).status_code==401
    assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0]==1
    assert store.connection.execute('SELECT COUNT(*) FROM study_interests').fetchone()[0]==0
    store.close()
