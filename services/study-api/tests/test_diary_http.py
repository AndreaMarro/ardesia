from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store


def test_diary_http_private_error_review_new_problem_and_transfer(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        def login(actor):
            assert client.post('/study/session', json={'token':store.issue_session(actor)}).status_code == 200
        def post(path, body, key):
            response = client.post('/study/'+path, json=body, headers={'Idempotency-Key':key})
            assert response.status_code == 200, response.text
            return response.json()
        login(student)
        source = post('resources', {'editionId':'fluidi','text':'Q cresce come r²'}, 'source')
        submitted = post('submissions', {'editionId':'fluidi','activityId':'poiseuille-v1','text':'Q cresce come r²',
            'sourceRefs':[{'resourceId':source['id'],'revisionId':source['revisionId']}]}, 'submit')
        login(tutor)
        thread = post('diary/observations', {'submissionId':submitted['submissionId'],'conceptId':'radius-power','category':'model_selection',
            'anchor':{'resourceId':source['id'],'revisionId':source['revisionId'],'start':0,'end':16,'quote':'Q cresce come r²'}}, 'observe')
        assert thread['status'] == 'CANDIDATE'
        criterion = 'Usa la quarta potenza a pressione fissata'
        thread = post('diary/threads/'+thread['threadId']+'/confirm', {
            'rubric':{'criterion':criterion,'procedureRequired':True},'explanation':'La dipendenza è alla quarta potenza.',
            'nextStep':'Spiega che cosa accade raddoppiando il raggio.',
            'transferExercise':{'exerciseId':'poiseuille-transfer-v1','originalParameters':{'radiusRatio':1.5,'boundary':'pressure'},
                'parameters':{'radiusRatio':2,'boundary':'pressure'},'prompt':'A pressione fissata raddoppia il raggio e spiega.'}}, 'confirm')
        assert thread['status'] == 'OPEN'
        for actor in (peer,other):
            login(actor)
            denied=client.get('/study/diary/threads/'+thread['threadId'])
            assert denied.status_code in (403,404)
            assert 'Q cresce' not in denied.text
        login(student)
        answer='A pressione fissata Q/Q0 = 2^4 = 16, perché la portata dipende dalla quarta potenza del raggio.'
        transfer=post('submissions',{'editionId':'fluidi','activityId':'poiseuille-transfer-v1','text':answer,
            'diaryThreadId':thread['threadId'],'activityParameters':{'radiusRatio':2,'boundary':'pressure'}},'transfer')
        assert transfer['activityContext']['threadId']==thread['threadId']
        thread=post('diary/threads/'+thread['threadId']+'/practice',{'submissionId':transfer['submissionId'],
            'exerciseId':'poiseuille-transfer-v1','parameters':{'radiusRatio':2,'boundary':'pressure'}},'practice')
        attempt=thread['attempts'][-1]
        assert thread['status']=='PRACTISING'
        assert client.post('/study/diary/threads/'+thread['threadId']+'/verify',json={},headers={'Idempotency-Key':'self-certify'}).status_code==403
        login(tutor)
        thread=post('diary/threads/'+thread['threadId']+'/verify',{'attemptId':attempt['attemptId'],'rubricEvidence':{
            'criterion':criterion,'procedureQuote':answer,'reasoning':'Il procedimento usa correttamente la legge di Poiseuille.',
            'variationReason':'Raggio doppio anziché una volta e mezza.'}},'verify')
        assert thread['status']=='VERIFIED_RESOLVED'
        login(student)
        diary=client.get('/study/diary').json()
        assert diary['confirmedOpenCount']==0 and diary['threads'][0]['latestVerification']
