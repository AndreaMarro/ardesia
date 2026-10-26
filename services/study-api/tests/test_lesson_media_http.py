"""Real generic Core resource transport used by S08; no new route claimed."""
import json
from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore
from lessonos.study.lesson_media import validate_index


def test_media_index_persists_cas_history_and_core_access(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    tutor=store.create_principal('tutor-media','teacher')
    student=store.create_principal('student-media','student')
    other=store.create_principal('other-media','student')
    store.create_edition(tutor,'media',capacity=4)
    store.add_test_member(tutor,'media',student.id)
    tokens={p.id:store.issue_session(p) for p in (tutor,student,other)}
    descriptor={'schema':'ardesia.lesson-passage.v1','workspaceId':'local-default','lessonId':'media-room','sessionId':'session-one','recordingId':'take-one','startEpoch':1000,'endEpoch':11000,'sha256':'a'*64,'objectRefs':[{'elementId':'formula','version':1,'label':'Vincolo'}],'replayUrl':'http://127.0.0.1:5197/?vista=replay&at=11000&recording=take-one&object=formula&session=session-one&sha='+'a'*64+'&objectVersion=1#media-room'}
    with TestClient(create_app(store.path,demo=True)) as client:
        def login(p):assert client.post('/study/session',json={'token':tokens[p.id]}).status_code==200
        login(tutor)
        source=client.post('/study/resources',json={'editionId':'media','kind':'lesson-passage','visibility':'group','text':json.dumps({'schema':'ardesia.lesson-passage-source.v1','descriptor':descriptor,'transcript':'Q è costante.'})},headers={'Idempotency-Key':'passage'}).json()
        document=validate_index({'schema':'ardesia.lesson-media-index.v1','source':{k:source[k] for k in ('id','revisionId','sha256')},'title':'Vincolo','durationMs':10000,'cues':[{'id':'cue','startMs':0,'endMs':10000,'text':'Q è costante.'}],'chapters':[{'id':'chapter','atMs':0,'title':'Inizio'}],'links':[]})
        body={'editionId':'media','kind':'lesson-media-index','visibility':'group','text':json.dumps(document)}
        response=client.post('/study/resources',json=body,headers={'Idempotency-Key':'index'});assert response.status_code==200
        first=response.json()
        assert client.post('/study/resources',json=body,headers={'Idempotency-Key':'index'}).json()['id']==first['id']
        document['cues'][0]['text']='Q resta fissata; cambia Δp.'
        path='/study/resources/'+first['id']
        revised=client.post(path+'/revise',json={'expectedRevision':first['revisionId'],'text':json.dumps(document)})
        assert revised.status_code==200
        assert client.post(path+'/revise',json={'expectedRevision':first['revisionId'],'text':json.dumps(document)}).status_code==409
        login(student)
        assert client.get(path+'/revisions/'+first['revisionId']).json()['text']==first['text']
        assert json.loads(client.get(path).json()['text'])['cues'][0]=={'id':'cue','startMs':0,'endMs':10000,'text':'Q resta fissata; cambia Δp.'}
        assert client.post(path+'/revise',json={'expectedRevision':revised.json()['revisionId'],'text':'blocked'}).status_code==403
        login(other);assert client.get(path).status_code==403
        login(tutor);assert client.delete('/study/resources/'+source['id']).status_code==200
        login(student);assert client.get('/study/resources/'+source['id']+'/revisions/'+source['revisionId']).status_code==404
        # The generic API does not implement cascading deletion/typed media grants.
        # S08's consumer must recheck the source; accessible index != playable audio.
        assert client.get(path).status_code==200
        assert client.delete('/study/session').status_code==200
        assert client.get(path).status_code==401
    store.close()
    reopened=StudyStore(tmp_path/'study.sqlite')
    assert reopened.get_resource(tutor,first['id'])['revisionId']==revised.json()['revisionId']
    reopened.close()
