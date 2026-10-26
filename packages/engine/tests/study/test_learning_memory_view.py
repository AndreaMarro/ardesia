import json
import pytest
from lessonos.study import learning_memory as memory
from lessonos.study.context import delete_resource
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def create_note(store,actor,source=None):
    return memory.save_note(store,actor,{'title':'Idea personale','text':'Riprendo il confronto.',
        'classification':'idea','concepts':[],
        'sourceRefs':[] if source is None else [{'resourceId':source['id'],'revisionId':source['revisionId']}],
        'links':[]},'note')


def view(note,version=0):
    return {'expectedVersion':version,'layout':'grid','positions':[{'id':note['id'],'x':120,'y':80}],
        'zoom':1.5,'pan':{'x':22,'y':33}}


def test_graph_view_is_persistent_personal_and_reopens_without_course(tmp_path):
    store=StudyStore(tmp_path/'memory.sqlite')
    actor=store.create_principal('student-alone','student');peer=store.create_principal('student-peer','student')
    note=create_note(store,actor)
    saved=memory.save_view(store,actor,view(note),'save-view')
    reopened=StudyStore(store.path)
    assert memory.get_view(reopened,actor)==saved
    assert saved['positions']==[{'id':note['id'],'x':120,'y':80}]
    assert saved['version']==1 and saved['zoom']==1.5
    assert memory.get_view(reopened,peer)['positions']==[]
    assert memory.get_memory(reopened,actor)['view']==saved
    reopened.close()


def test_view_compare_and_swap_and_retry_do_not_duplicate_events(tmp_path):
    store,_,actor,*_=setup_store(tmp_path);note=create_note(store,actor)
    first=memory.save_view(store,actor,view(note),'once')
    assert memory.save_view(store,actor,view(note),'once')==first
    with pytest.raises(StudyError,match='stale_revision'):
        memory.save_view(store,actor,view(note),'new-key')
    with pytest.raises(StudyError,match='idempotency_conflict'):
        memory.save_view(store,actor,{**view(note),'zoom':2},'once')


@pytest.mark.parametrize('change',[{'zoom':float('nan')},{'zoom':9},{'zoom':10**400},{'pan':{'x':10**400,'y':0}},{'pan':{'x':0,'y':float('inf')}},
    {'positions':[{'id':'someone-else','x':1,'y':2}]},{'layout':'javascript'},{'positions':[{'id':'x','x':0,'y':0,'text':'SECRET'}]}])
def test_graph_view_rejects_invalid_coordinates_unknown_nodes_and_content_fields(tmp_path,change):
    store,_,actor,*_=setup_store(tmp_path);note=create_note(store,actor)
    with pytest.raises(StudyError):memory.save_view(store,actor,{**view(note),**change},'bad')
    assert memory.get_view(store,actor)['version']==0


def test_retired_source_layout_is_filtered_on_reads_and_idempotent_replay(tmp_path):
    store,teacher,actor,*_=setup_store(tmp_path)
    source=store.create_resource(teacher,'fluidi','notes','Fonte che sarà ritirata','group')
    note=create_note(store,actor,source)
    graph=memory.get_memory(store,actor);source_id=next(n['id'] for n in graph['nodes'] if n['kind']=='source')
    payload={**view(note),'positions':[{'id':source_id,'x':120,'y':80}]}
    memory.save_view(store,actor,payload,'save')
    delete_resource(store,teacher,source['id'])
    for result in (memory.get_view(store,actor),memory.save_view(store,actor,payload,'save')):
        assert result['positions']==[] and source_id not in json.dumps(result)


def test_lost_response_retry_cannot_silently_adopt_a_newer_windows_version(tmp_path):
    store,_,actor,*_=setup_store(tmp_path);note=create_note(store,actor)
    first=view(note)
    memory.save_view(store,actor,first,'window-a')  # Response lost on the network.
    second={**view(note,1),'positions':[{'id':note['id'],'x':444,'y':555}]}
    saved=memory.save_view(store,actor,second,'window-b')
    with pytest.raises(StudyError,match='stale_revision'):
        memory.save_view(store,actor,first,'window-a')
    assert memory.get_view(store,actor)==saved
