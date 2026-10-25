"""Versioned editorial media indices over existing Core resources.

This module owns no media bytes, membership, consent or session authority.
Generic resource HTTP transport is reused by the web projection; this service
is available to Core consumers, not a claim of new HTTP routes.
"""
import json
import re
from ..models import StudyError
from ..store import canonical
from ..context import revise_resource

SCHEMA = 'ardesia.lesson-media-index.v1'
KIND = 'lesson-media-index'


def _exact(value, keys):
    if not isinstance(value, dict) or set(value) != set(keys):
        raise StudyError('invalid_media_index')


def _text(value, maximum):
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise StudyError('invalid_media_index')


def _time(value, maximum):
    if type(value) is not int or not 0 <= value <= maximum:
        raise StudyError('invalid_media_index')


def validate_index(value):
    _exact(value, ('schema','source','title','durationMs','cues','chapters','links'))
    if value['schema'] != SCHEMA:raise StudyError('invalid_media_index')
    _exact(value['source'], ('id','revisionId','sha256'))
    for key in ('id','revisionId'):_text(value['source'][key],128)
    if not isinstance(value['source']['sha256'],str) or not re.fullmatch('[a-f0-9]{64}',value['source']['sha256']):raise StudyError('invalid_media_index')
    _text(value['title'],160)
    duration=value['durationMs'];_time(duration,86_400_000)
    if duration==0:raise StudyError('invalid_media_index')
    for key,maximum in (('cues',100),('chapters',50),('links',20)):
        if not isinstance(value[key],list) or len(value[key])>maximum:raise StudyError('invalid_media_index')
    if not value['cues']:raise StudyError('invalid_media_index')
    ids=set();end=0
    for cue in value['cues']:
        _exact(cue,('id','startMs','endMs','text'));_text(cue['id'],128);_text(cue['text'],8000)
        _time(cue['startMs'],duration);_time(cue['endMs'],duration)
        if cue['id'] in ids or cue['startMs']<end or cue['endMs']<=cue['startMs']:raise StudyError('invalid_media_index')
        ids.add(cue['id']);end=cue['endMs']
    ids=set();at=-1
    for chapter in value['chapters']:
        _exact(chapter,('id','atMs','title'));_text(chapter['id'],128);_text(chapter['title'],160);_time(chapter['atMs'],duration-1)
        if chapter['id'] in ids or chapter['atMs']<=at:raise StudyError('invalid_media_index')
        ids.add(chapter['id']);at=chapter['atMs']
    ids=set()
    for link in value['links']:
        _exact(link,('resourceId','revisionId','label'))
        for key in ('resourceId','revisionId'):_text(link[key],128)
        _text(link['label'],160)
        identity=(link['resourceId'],link['revisionId'])
        if identity in ids:raise StudyError('invalid_media_index')
        ids.add(identity)
    if len(canonical(value))>20_000:raise StudyError('invalid_media_index')
    return json.loads(canonical(value))


def _source(store, principal, edition_id, value):
    ref=value['source']
    source=store.get_resource_revision(principal,ref['id'],ref['revisionId'])
    if source['editionId']!=edition_id or source['sha256']!=ref['sha256'] or source['kind']!='lesson-passage':raise StudyError('media_source_mismatch')
    from ..learning_experiences import lesson_passage_resource
    try:
        lesson_passage_resource(store,principal,edition_id,{'resourceId':ref['id'],'revisionId':ref['revisionId']})
        descriptor=json.loads(source['text'])['descriptor']
        if descriptor['endEpoch']-descriptor['startEpoch']!=value['durationMs']:raise ValueError()
    except (KeyError,TypeError,ValueError):raise StudyError('media_source_mismatch') from None
    return source


def _references(store, principal, edition_id, value, shared):
    source=_source(store,principal,edition_id,value)
    if shared and source['visibility']!='group':raise StudyError('media_link_not_shared')
    for ref in value['links']:
        linked=store.get_resource_revision(principal,ref['resourceId'],ref['revisionId'])
        if linked['editionId']!=edition_id or shared and linked['visibility']!='group':raise StudyError('media_link_not_shared')
    return source


def create_index(store, principal, edition_id, document, *, key):
    value=validate_index(document)
    # Group publication uses Core's teacher authority; student indices stay private.
    shared=principal.role=='teacher'
    _references(store,principal,edition_id,value,shared)
    return store.create_resource(principal,edition_id,KIND,canonical(value),'group' if shared else 'private',key=key)


def read_index(store, principal, resource_id, revision_id):
    resource=store.get_resource_revision(principal,resource_id,revision_id)
    if resource['kind']!=KIND:raise StudyError('invalid_media_index')
    try:value=validate_index(json.loads(resource['text']))
    except (ValueError,TypeError):raise StudyError('invalid_media_index') from None
    source=_references(store,principal,resource['editionId'],value,resource['visibility']=='group')
    return {'resource':resource,'document':value,'source':source}


def revise_index(store, principal, resource_id, expected_revision, document):
    previous=read_index(store,principal,resource_id,expected_revision)
    value=validate_index(document)
    # Repointing would silently move existing captions to a different recording.
    if value['source']!=previous['document']['source'] or value['durationMs']!=previous['document']['durationMs']:raise StudyError('media_source_mismatch')
    _references(store,principal,previous['resource']['editionId'],value,previous['resource']['visibility']=='group')
    return revise_resource(store,principal,resource_id,expected_revision,canonical(value))
