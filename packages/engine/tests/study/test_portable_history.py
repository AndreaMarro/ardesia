"""Notebook history is resolved with the same exact-revision authorization."""
from copy import deepcopy
import json
import pytest
from lessonos.study.context import revise_resource, delete_resource
from lessonos.study.models import StudyError
from lessonos.study.portable import export_notebook, inspect_notebook
from lessonos.study.store import canonical, digest
from lessonos.study.submissions import submit
from lessonos.study.view_layout import save_layout
from test_identity_store import setup_store


def resign(bundle):
    bundle['sha256']=digest(canonical({key:value for key,value in bundle.items() if key!='sha256'}))
    return bundle


def pin(resource):
    return {'kind':'plugin-postit-object','pluginId':'ardesia.study','instanceId':'old-pin',
        'bounds':{'x':0,'y':0,'width':320,'height':240},'zIndex':0,
        'selected':False,'hovered':False,'proximity':'far',
        'pluginState':{'resourceId':resource['id'],'revisionId':resource['revisionId'],'contextId':resource['contextId']}}


def history(tmp_path):
    store,tutor,student,peer,*_=setup_store(tmp_path)
    older=store.create_resource(student,'fluidi','notes','V0 non consegnata né pinned.')
    shared=revise_resource(store,student,older['id'],older['revisionId'],'V1 consegnata e pinned.')
    submit(store,student,'fluidi','poiseuille-v1',[],'Procedimento consegnato.','shared',
        source_refs=[{'resourceId':shared['id'],'revisionId':shared['revisionId']}])
    for actor in (student,tutor):save_layout(store,actor,'fluidi',[pin(shared)])
    private=revise_resource(store,student,shared['id'],shared['revisionId'],'V2 NUOVA BOZZA PRIVATA.')
    return store,tutor,student,peer,older,shared,private


def test_owner_export_contains_old_exact_pin_and_current_source_without_unreferenced_history(tmp_path):
    store,tutor,student,peer,older,shared,private=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    assert bundle['resources'][0]['revisionId']==private['revisionId']
    revisions={(item['id'],item['revisionId']):item for item in bundle['resourceRevisions']}
    assert revisions[(shared['id'],shared['revisionId'])]['text']==shared['text']
    assert (older['id'],older['revisionId']) not in revisions
    assert bundle['layout']==[pin(shared)]
    inspected=inspect_notebook(bundle)
    assert inspected['referencesComplete'] is True and inspected['resourceRevisions']==len(revisions)
    assert inspected['sha256']==bundle['sha256']
    assert 'Historical source revisions' not in ' '.join(bundle['omissions'])
    store.close()


def test_tutor_export_preserves_only_submitted_revision_and_does_not_export_private_head(tmp_path):
    store,tutor,student,peer,older,shared,private=history(tmp_path)
    bundle=export_notebook(store,tutor,'fluidi',tmp_path/'blobs')
    assert bundle['resources']==[]
    assert [item['revisionId'] for item in bundle['resourceRevisions']]==[shared['revisionId']]
    assert bundle['resourceRevisions'][0]['text']==shared['text']
    assert private['text'] not in str(bundle) and older['text'] not in str(bundle)
    assert inspect_notebook(bundle)['referencesComplete'] is True
    assert not export_notebook(store,peer,'fluidi',tmp_path/'blobs')['resourceRevisions']
    store.close()


def test_unavailable_revision_has_only_known_reference_ids_and_explicit_loss(tmp_path):
    store,tutor,student,peer,older,shared,private=history(tmp_path)
    delete_resource(store,student,shared['id'])
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    assert bundle['resourceRevisions']==[]
    assert bundle['unavailableResourceRefs']==[{'resourceId':shared['id'],'revisionId':shared['revisionId'],'reason':'unavailable'}]
    assert all(text not in str(bundle) for text in (older['text'],shared['text'],private['text']))
    inspected=inspect_notebook(bundle)
    assert inspected['referencesComplete'] is False and inspected['unavailableResourceRefs']==1
    assert any('unavailable' in item.lower() for item in inspected['omissions'])
    store.close()


def test_inspect_checks_snapshot_hashes_even_when_outer_digest_is_recomputed(tmp_path):
    store,_,student,*_=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    bundle['resourceRevisions'][0]['text']='Alterato senza aggiornare hash dello snapshot.'
    resign(bundle)
    with pytest.raises(StudyError,match='source_integrity_failure'):inspect_notebook(bundle)
    store.close()


@pytest.mark.parametrize('location',['layout','submission'])
def test_inspect_rejects_dangling_exact_revision_references_with_a_valid_bundle_digest(tmp_path,location):
    store,_,student,*_=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    reference=bundle['layout'][0]['pluginState'] if location=='layout' else bundle['submissions'][0]['source_refs'][0]
    reference['revisionId']='nonexistent-revision'
    resign(bundle)
    with pytest.raises(StudyError,match='reference_integrity_failure'):inspect_notebook(bundle)
    store.close()


def test_unsigned_consistently_rehashed_content_is_not_claimed_canonical_or_authorized(tmp_path):
    store,_,student,*_=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    snapshot=bundle['resourceRevisions'][0]
    snapshot['text']='Un artefatto può essere rifirmato da chi lo possiede.'
    snapshot['sha256']=digest(snapshot['text']);resign(bundle)
    inspected=inspect_notebook(bundle)
    assert inspected['valid'] is True
    assert inspected['canonicalAuthenticity']=='NOT_VERIFIED'
    assert inspected['integrityScope']=='UNSIGNED_INTERNAL_CONTENT_AND_REFERENCES'
    store.close()


def test_inspect_legacy_v1_does_not_claim_history_reference_completeness(tmp_path):
    store,_,student,*_=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    bundle.pop('resourceRevisions');bundle.pop('unavailableResourceRefs');resign(bundle)
    inspected=inspect_notebook(bundle)
    assert inspected['valid'] and inspected['referencesComplete'] is None
    assert inspected['referenceIntegrity']=='NOT_CHECKED_LEGACY'
    store.close()


def test_inspect_duplicate_revision_identity_cannot_resolve_to_different_content(tmp_path):
    store,_,student,*_=history(tmp_path)
    bundle=export_notebook(store,student,'fluidi',tmp_path/'blobs')
    duplicate=deepcopy(bundle['resourceRevisions'][0]);duplicate['text']='Altro contenuto con stesso ID/versione.';duplicate['sha256']=digest(duplicate['text'])
    bundle['resourceRevisions'].append(duplicate);resign(bundle)
    with pytest.raises(StudyError,match='reference_integrity_failure'):inspect_notebook(bundle)
    store.close()


def test_inspect_revision_budget_and_bad_base64_fail_as_domain_errors():
    base={'format':'ardesia-study-notebook-v1','schemaVersion':1,'resources':[],'submissions':[],'assets':[],'layout':[],'omissions':[]}
    with pytest.raises(StudyError,match='notebook_budget_exceeded'):
        inspect_notebook(resign({**base,'resourceRevisions':[{}]*501}))
    bad={'id':'synthetic','mime':'image/png','sha256':digest(b'x'),'bytes':1,'base64':'@@@'}
    with pytest.raises(StudyError,match='asset_integrity_failure'):
        inspect_notebook(resign({**base,'assets':[bad]}))


@pytest.mark.parametrize('omissions',['not-a-list',[{'untrusted':'object'}]])
def test_inspect_rejects_malformed_loss_metadata(omissions):
    bundle={'format':'ardesia-study-notebook-v1','schemaVersion':1,'resources':[],'submissions':[],
        'assets':[],'layout':[],'resourceRevisions':[],'omissions':omissions}
    with pytest.raises(StudyError,match='invalid_notebook'):
        inspect_notebook(resign(bundle))
