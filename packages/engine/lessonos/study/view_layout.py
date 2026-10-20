"""Authorized view references and optimistic layout persistence.

Layout is per actor/edition. It references immutable originals and carries no
source text or authority. The content version detects competing browser edits.
"""
import json
import math
import re
from .models import StudyError
from .store import canonical, digest

INSTANCE = re.compile(r'[a-z0-9][a-z0-9-]{0,63}')
VERSION = re.compile(r'[a-f0-9]{64}')


def load_layout(store, principal, edition_id):
    store._edition_access(principal, edition_id)
    row = store.connection.execute('SELECT data FROM study_layouts WHERE actor_id=? AND edition_id=?', (principal.id, edition_id)).fetchone()
    views = json.loads(row['data']) if row else []
    return {'layouts': views, 'layoutSaved': row is not None, 'layoutVersion': digest(canonical(views))}


def _validate_view(store, principal, edition_id, view, seen):
    if not isinstance(view, dict):
        raise StudyError('invalid_layout')
    ref, bounds, instance = view.get('pluginState'), view.get('bounds'), view.get('instanceId')
    if not isinstance(ref, dict) or not isinstance(bounds, dict) or not isinstance(instance, str) or not INSTANCE.fullmatch(instance) or instance in seen:
        raise StudyError('invalid_layout')
    seen.add(instance)
    if view.get('kind') != 'plugin-postit-object' or view.get('pluginId') != 'ardesia.study':
        raise StudyError('invalid_layout')
    if type(view.get('selected')) is not bool or type(view.get('hovered')) is not bool or view.get('proximity') not in ('far', 'near', 'active'):
        raise StudyError('invalid_layout')
    z_index = view.get('zIndex')
    if type(z_index) is not int or abs(z_index) > 2**53 - 1:
        raise StudyError('invalid_layout')
    for key in ('x', 'y', 'width', 'height'):
        value = bounds.get(key)
        if type(value) not in (int, float) or not math.isfinite(value) or not -10000 < value < 10000:
            raise StudyError('invalid_layout')
        if key in ('width', 'height') and value <= 0:
            raise StudyError('invalid_layout')
    if any(not isinstance(ref.get(key), str) or not 1 <= len(ref[key]) <= 128 for key in ('resourceId', 'revisionId', 'contextId')):
        raise StudyError('invalid_layout')
    resource = store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])
    if resource['editionId'] != edition_id or resource['contextId'] != ref['contextId']:
        raise StudyError('invalid_layout')


def save_layout(store, principal, edition_id, views, expected_version=None):
    store._edition_access(principal, edition_id)
    if not isinstance(views, list) or len(views) > 50:
        raise StudyError('invalid_layout')
    if expected_version is not None and (not isinstance(expected_version, str) or not VERSION.fullmatch(expected_version)):
        raise StudyError('invalid_layout')
    with store.transaction() as c:
        store.lock_aggregate(c, 'layout', [principal.id, edition_id])
        seen = set()
        for view in views:
            _validate_view(store, principal, edition_id, view, seen)
        current = load_layout(store, principal, edition_id)
        version = digest(canonical(views))
        # A response lost after the same snapshot committed is safe to retry.
        if expected_version is not None and expected_version != current['layoutVersion'] and version != current['layoutVersion']:
            raise StudyError('stale_layout', 409)
        c.execute('INSERT INTO study_layouts VALUES(?,?,?) ON CONFLICT(actor_id,edition_id) DO UPDATE SET data=excluded.data', (principal.id, edition_id, canonical(views)))
    return {'saved': True, 'layoutVersion': version}
