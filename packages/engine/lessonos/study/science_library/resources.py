"""Scientific configurations as private, versioned Study resources.

This is a domain payload, not a new identity, notebook table or submission
contract. Reopening never evaluates a model or restores a revealed answer.
"""
import json
import math
import re

from ..context import _invalidate_projection
from ..models import StudyError
from ..store import canonical, digest, identifier
from ..transactions import execute_command
from .models import evaluate, _HANDLERS
from . import _MODEL_IMPLEMENTATION_SHA256

KIND = 'science-resource'
_KEYS = {'schemaVersion', 'capabilityId', 'capabilityVersion',
         'implementationSha256', 'parameters', 'note', 'prediction'}


def implementation_sha256():
    # Identity of code loaded in this process, not later bytes on disk.
    return _MODEL_IMPLEMENTATION_SHA256


def _text(value, maximum, *, nonempty=False):
    if (not isinstance(value, str) or len(value) > maximum or '\x00' in value
            or nonempty and not value.strip()):
        raise StudyError('invalid_science_snapshot')
    try:
        value.encode('utf8')
    except UnicodeError:
        raise StudyError('invalid_science_snapshot') from None
    return value


def _validate(value):
    if not isinstance(value, dict) or not _KEYS <= set(value) or set(value) - (_KEYS | {'supportUsed', 'labSnapshot', 'courseLesson'}):
        raise StudyError('invalid_science_snapshot')
    if (type(value['schemaVersion']) is not int or value['schemaVersion'] != 1
            or type(value['capabilityVersion']) is not int or not 1 <= value['capabilityVersion'] <= 1_000_000
            or not isinstance(value['capabilityId'], str) or not re.fullmatch(r'[a-z0-9-]{1,80}', value['capabilityId'])
            or not isinstance(value['implementationSha256'], str)
            or not re.fullmatch(r'[a-f0-9]{64}', value['implementationSha256'])
            or not isinstance(value['parameters'], dict) or len(value['parameters']) > 20):
        raise StudyError('invalid_science_snapshot')
    for key, n in value['parameters'].items():
        if (not isinstance(key, str) or not re.fullmatch(r'[a-zA-Z0-9]{1,64}', key)
                or type(n) not in (int, float) or not -1e12 <= n <= 1e12 or not math.isfinite(n)):
            raise StudyError('invalid_science_snapshot')
    _text(value['note'], 4000)
    _text(value['prediction'], 200)
    if 'supportUsed' in value:
        used = value['supportUsed']
        if (not isinstance(used, list) or len(used) > 2
                or any(not isinstance(item, str) or item not in (('model', 'hint') if 'labSnapshot' in value else ('explanation', 'domain')) for item in used)
                or len(set(used)) != len(used)):
            raise StudyError('invalid_science_snapshot')
    from .lab_snapshot import validate
    try:
        validate(value)
        encoded = canonical(value)
        size = len(encoded.encode('utf8'))
    except (ValueError, TypeError, UnicodeError):
        raise StudyError('invalid_science_snapshot') from None
    if size > 20_000:
        raise StudyError('science_snapshot_too_large', 413)
    return json.loads(encoded)


def _supported(snapshot):
    return (snapshot['capabilityId'] in _HANDLERS and snapshot['capabilityVersion'] == 1
            and snapshot['implementationSha256'] == implementation_sha256()
            and snapshot.get('labSnapshot', {}).get('pluginVersion', '1.0.0') == '1.0.0')


def new_snapshot(capability_id, parameters, *, note='', prediction='', support_used=None):
    if support_used is not None and not isinstance(support_used, (list, tuple)):
        raise StudyError('invalid_science_snapshot')
    result = evaluate(capability_id, parameters)
    return _validate({'schemaVersion': 1, 'capabilityId': capability_id, 'capabilityVersion': 1,
                      'implementationSha256': implementation_sha256(),
                      'parameters': result['parameters'], 'note': note, 'prediction': prediction,
                      **({'supportUsed': list(support_used)} if support_used is not None else {})})


def _reference(value):
    if not isinstance(value, str) or not 1 <= len(value) <= 128 or '\x00' in value:
        raise StudyError('invalid_science_reference')
    try:
        value.encode('utf8')
    except UnicodeError:
        raise StudyError('invalid_science_reference') from None
    return value


def read(store, principal, resource_id, revision_id=None):
    _reference(resource_id)
    if revision_id is not None:
        _reference(revision_id)
    resource = (store.get_resource_revision(principal, resource_id, revision_id)
                if revision_id is not None else store.get_resource(principal, resource_id))
    if resource['kind'] != KIND:
        raise StudyError('not_science_resource')
    try:
        snapshot = _validate(json.loads(resource['text']))
    except (ValueError, TypeError):
        raise StudyError('invalid_science_snapshot') from None
    updated = store.connection.execute('SELECT created_at FROM study_revisions WHERE id=? AND resource_id=?', (resource['revisionId'], resource['id'])).fetchone()
    return {'resource': resource, 'snapshot': snapshot, 'supported': _supported(snapshot), 'updatedAt': updated['created_at']}


def save(store, principal, edition_id, snapshot, key, *, resource_id=None, expected_revision=None):
    store._edition_access(principal, edition_id)
    snapshot = _validate(snapshot)
    if not _supported(snapshot):
        raise StudyError('capability_version_unavailable', 409)
    from .lab_snapshot import authorize
    authorize(store, principal, edition_id, snapshot)
    result = evaluate(snapshot['capabilityId'], snapshot['parameters'])
    if 'labSnapshot' in snapshot and snapshot['parameters'] != result['parameters']:
        raise StudyError('invalid_science_snapshot')
    if 'labSnapshot' not in snapshot:
        snapshot['parameters'] = result['parameters']
    text = canonical(snapshot)
    if resource_id is None:
        if expected_revision is not None:
            raise StudyError('invalid_science_reference')
        resource = store.create_resource(principal, edition_id, KIND, text, 'private', key=key)
    else:
        _reference(resource_id)
        _reference(expected_revision)

        def authorize(c):
            store.lock_aggregate(c, 'resource', resource_id)
            resource = store.get_resource(principal, resource_id)
            if resource['ownerId'] != principal.id:
                raise StudyError('forbidden', 403)
            if resource['kind'] != KIND or resource['editionId'] != edition_id:
                raise StudyError('immutable_science_binding', 409)
            if resource['visibility'] != 'private':
                raise StudyError('private_science_resource_required', 409)

        def apply(c):
            current = c.execute('SELECT current_revision FROM study_resources WHERE id=? AND deleted=0',
                                (resource_id,)).fetchone()
            if current is None or current[0] != expected_revision:
                raise StudyError('stale_revision', 409)
            revision = identifier()
            c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)',
                      (revision, resource_id, text, digest(text), store.clock()))
            updated = c.execute('UPDATE study_resources SET current_revision=? WHERE id=? AND current_revision=? AND deleted=0',
                                (revision, resource_id, expected_revision))
            if updated.rowcount != 1:
                raise StudyError('stale_revision', 409)
            _invalidate_projection(c, resource_id)
            store._event(c, principal, 'resource.revised', resource_id, {'revisionId': revision})
            return store.get_resource_revision(principal, resource_id, revision)

        resource = execute_command(store, principal, 'science-resource.revised', key,
            {'resourceId': resource_id, 'expectedRevision': expected_revision,
             'editionId': edition_id, 'snapshot': snapshot}, apply, before_lookup=authorize)
    # A recorded receipt must not resurrect a deleted or unauthorized revision.
    return read(store, principal, resource['id'], resource['revisionId'])


def compare(store, principal, resource_id, revision_id, prediction):
    _reference(revision_id)
    saved = read(store, principal, resource_id, revision_id)
    if not isinstance(prediction, str) or not prediction.strip():
        raise StudyError('prediction_required')
    _text(prediction, 200, nonempty=True)
    if not saved['supported']:
        raise StudyError('capability_version_unavailable', 409)
    snapshot = saved['snapshot']
    return {'result': evaluate(snapshot['capabilityId'], snapshot['parameters']),
            'prediction': prediction,
            'resourceRef': {'resourceId': resource_id, 'revisionId': revision_id}}
