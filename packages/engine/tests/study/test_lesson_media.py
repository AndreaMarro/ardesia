import copy
import json
import pytest
from lessonos.study.lesson_media import validate_index, create_index, read_index, revise_index
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study.context import delete_resource


def index(source):
    return {'schema':'ardesia.lesson-media-index.v1',
        'source':{k:source[k] for k in ('id','revisionId','sha256')}, 'title':'Il vincolo di portata', 'durationMs':10000,
        'cues':[{'id':'cue-1','startMs':0,'endMs':10000,'text':'La portata è fissata.'}],
        'chapters':[{'id':'chapter-1','atMs':0,'title':'Il vincolo'}], 'links':[]}


def fixture(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    teacher=store.create_principal('tutor-media','teacher')
    student=store.create_principal('student-media','student')
    peer=store.create_principal('peer-media','student')
    store.create_edition(teacher,'media',capacity=4,price_minor=0)
    store.add_test_member(teacher,'media',student.id)
    descriptor={'schema':'ardesia.lesson-passage.v1','workspaceId':'local-default','lessonId':'aula-media','sessionId':'session-one',
        'recordingId':'take-one','startEpoch':1000,'endEpoch':11000,'sha256':'a'*64,
        'objectRefs':[{'elementId':'formula','version':1,'label':'Il vincolo'}],
        'replayUrl':'http://127.0.0.1:5320/studio/?vista=replay&at=11000&recording=take-one&object=formula&session=session-one&sha='+'a'*64+'&objectVersion=1#aula-media'}
    source=store.create_resource(teacher,'media','lesson-passage',json.dumps({'schema':'ardesia.lesson-passage-source.v1','descriptor':descriptor,'transcript':'La portata è fissata.'}),'group')
    return store,teacher,student,peer,source


def test_reopen_revision_edit_preserves_times_and_source_removal_blocks(tmp_path):
    store,teacher,student,peer,source=fixture(tmp_path)
    document=index(source)
    resource=create_index(store,teacher,'media',document,key='media-create')
    assert create_index(store,teacher,'media',document,key='media-create')['id']==resource['id']
    changed=copy.deepcopy(document);changed['cues'][0]['text']='La portata Q resta costante.'
    updated=revise_index(store,teacher,resource['id'],resource['revisionId'],changed)
    with pytest.raises(StudyError,match='stale_revision'):
        revise_index(store,teacher,resource['id'],resource['revisionId'],changed)
    store.close()
    store=StudyStore(tmp_path/'study.sqlite')
    assert read_index(store,student,resource['id'],updated['revisionId'])['document']['cues'][0]['endMs']==10000
    assert read_index(store,student,resource['id'],resource['revisionId'])['document']['cues'][0]['text']=='La portata è fissata.'
    with pytest.raises(StudyError):read_index(store,peer,resource['id'],updated['revisionId'])
    delete_resource(store,teacher,source['id'])
    with pytest.raises(StudyError,match='not_found'):read_index(store,student,resource['id'],updated['revisionId'])
    store.close()


@pytest.mark.parametrize('change',[
    lambda d:d['cues'][0].update(endMs=10001),
    lambda d:d['cues'][0].update(startMs=True),
    lambda d:d['cues'].append(dict(d['cues'][0],id='overlap')),
    lambda d:d['chapters'].append(dict(d['chapters'][0],id='duplicate-time')),
    lambda d:d.update(unexpected='ignored'),
    lambda d:d.update(durationMs=0),
])
def test_invalid_timing_or_unknown_fields_rejected(change):
    d=index({'id':'source','revisionId':'revision','sha256':'a'*64});change(d)
    with pytest.raises(StudyError,match='invalid_media_index'):validate_index(d)


def test_recording_duration_identity_and_link_access_cannot_be_forged(tmp_path):
    store,teacher,student,peer,source=fixture(tmp_path)
    d=index(source);d['durationMs']=20000
    with pytest.raises(StudyError,match='media_source_mismatch'):create_index(store,teacher,'media',d,key='bad-duration')
    private=store.create_resource(teacher,'media','notes','Annotazione privata')
    d=index(source);d['links']=[{'resourceId':private['id'],'revisionId':private['revisionId'],'label':'Quaderno privato'}]
    with pytest.raises(StudyError,match='media_link_not_shared'):create_index(store,teacher,'media',d,key='private-link')
    d=index(source);d['source']['sha256']='b'*64
    with pytest.raises(StudyError,match='media_source_mismatch'):create_index(store,teacher,'media',d,key='wrong-hash')
    store.close()
