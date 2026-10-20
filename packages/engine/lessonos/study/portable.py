"""Read-only notebook: unsigned content integrity, never canonical authenticity."""
import base64
import binascii
import json
from .assets import read_asset
from .models import StudyError
from .store import canonical, digest
from .submissions import list_submissions
from .feedback import list_feedback

MAX_ITEMS = 100
MAX_REVISIONS = 500
MAX_BYTES = 50 * 1024 * 1024


def _list(bundle, key, limit):
    values = bundle.get(key, [])
    if not isinstance(values, list) or len(values) > limit:
        raise StudyError('notebook_budget_exceeded')
    return values


def _identifier(value):
    return isinstance(value, str) and 1 <= len(value) <= 128


def _reference(ref):
    if not isinstance(ref, dict) or not _identifier(ref.get('resourceId')) or not _identifier(ref.get('revisionId')):
        raise StudyError('reference_integrity_failure')
    if 'contextId' in ref and not _identifier(ref['contextId']):
        raise StudyError('reference_integrity_failure')
    return ref['resourceId'], ref['revisionId']


def _references(submissions, layout):
    refs = []
    for submission in submissions:
        if not isinstance(submission, dict):
            raise StudyError('reference_integrity_failure')
        for ref in _list(submission, 'source_refs', 5):
            _reference(ref)
            refs.append(ref)
    for view in layout:
        if not isinstance(view, dict):
            raise StudyError('reference_integrity_failure')
        ref = view.get('pluginState')
        _reference(ref)
        refs.append(ref)
    return refs


def export_notebook(store, principal, edition_id, blob_dir):
    store._edition_access(principal, edition_id)
    resources = []
    for row in store.connection.execute('SELECT id FROM study_resources WHERE edition_id=? AND deleted=0', (edition_id,)):
        try:
            resources.append(store.get_resource(principal, row['id']))
        except StudyError as error:
            if error.status not in (403, 404):
                raise
        if len(resources) > MAX_ITEMS:
            raise StudyError('notebook_budget_exceeded')
    submissions = list_submissions(store, principal, edition_id)
    if len(submissions) > MAX_ITEMS:
        raise StudyError('notebook_budget_exceeded')
    for row in submissions:
        row['feedback'] = list_feedback(store, principal, row['id'])
    saved = store.connection.execute('SELECT data FROM study_layouts WHERE actor_id=? AND edition_id=?', (principal.id, edition_id)).fetchone()
    layout = json.loads(saved[0]) if saved else []
    if not isinstance(layout, list) or len(layout) > 50:
        raise StudyError('notebook_budget_exceeded')
    omissions = [
        'Read-only notebook: does not restore server sessions, enrollment, live collaboration or payment state.',
        'The legacy Excalidraw/audio journal is not represented by this notebook.',
        'No live OCR, ASR or AI result is certified by this export.',
    ]
    # Only references already in this authorized export are candidates. Never
    # enumerate all revisions, or use the current head instead of an old pin.
    snapshots, unavailable = {}, {}
    for ref in _references(submissions, layout):
        key = _reference(ref)
        if key in unavailable:
            continue
        if key not in snapshots:
            try:
                source = store.get_resource_revision(principal, *key)
                if source['editionId'] != edition_id:
                    raise StudyError('forbidden', 403)
                snapshots[key] = source
            except StudyError as error:
                if error.status not in (403, 404):
                    raise
                unavailable[key] = {'resourceId': key[0], 'revisionId': key[1], 'reason': 'unavailable'}
                omissions.append('Source revision unavailable: ' + key[0] + '@' + key[1])
                continue
        if 'contextId' in ref and ref['contextId'] != snapshots[key]['contextId']:
            raise StudyError('reference_integrity_failure')
        if len(snapshots) > MAX_REVISIONS:
            raise StudyError('notebook_budget_exceeded')
    assets, total = [], 0
    asset_ids = sorted({ref for row in submissions for ref in row['asset_refs']})
    if len(asset_ids) > MAX_ITEMS:
        raise StudyError('notebook_budget_exceeded')
    for asset_id in asset_ids:
        data, mime = read_asset(store, principal, asset_id, blob_dir)
        total += len(data)
        if total > MAX_BYTES:
            omissions.append('Attachment omitted by 50 MiB notebook budget: ' + asset_id)
            continue
        assets.append({'id': asset_id, 'mime': mime, 'sha256': digest(data), 'bytes': len(data), 'base64': base64.b64encode(data).decode()})
    bundle = {'format': 'ardesia-study-notebook-v1', 'schemaVersion': 1, 'synthetic': True,
              'resources': resources, 'resourceRevisions': [snapshots[key] for key in sorted(snapshots)],
              'unavailableResourceRefs': [unavailable[key] for key in sorted(unavailable)],
              'submissions': submissions, 'assets': assets, 'layout': layout, 'omissions': omissions}
    bundle['sha256'] = digest(canonical(bundle))
    return bundle


def _source_hash(resource):
    if not isinstance(resource, dict) or not isinstance(resource.get('text'), str) or len(resource['text']) > 20_000:
        raise StudyError('source_integrity_failure')
    if digest(resource['text']) != resource.get('sha256'):
        raise StudyError('source_integrity_failure')


def _revision_index(resources, revisions):
    index = {}
    for source in resources + revisions:
        _source_hash(source)
        if not all(_identifier(source.get(key)) for key in ('id', 'revisionId', 'contextId')):
            raise StudyError('reference_integrity_failure')
        key = source['id'], source['revisionId']
        if key in index and index[key] != source:
            raise StudyError('reference_integrity_failure')
        index[key] = source
    return index


def _inspect_references(bundle, resources, revisions, submissions):
    index = _revision_index(resources, revisions)
    refs = _references(submissions, _list(bundle, 'layout', 50))
    requested = {_reference(ref) for ref in refs}
    unavailable = set()
    for loss in _list(bundle, 'unavailableResourceRefs', 600):
        key = _reference(loss)
        if set(loss) != {'resourceId', 'revisionId', 'reason'} or loss['reason'] != 'unavailable' or key in unavailable or key in index or key not in requested:
            raise StudyError('reference_integrity_failure')
        unavailable.add(key)
    for ref in refs:
        key = _reference(ref)
        if key not in index and key not in unavailable:
            raise StudyError('reference_integrity_failure')
        if key in index and 'contextId' in ref and ref['contextId'] != index[key]['contextId']:
            raise StudyError('reference_integrity_failure')
    return unavailable


def inspect_notebook(bundle):
    if not isinstance(bundle, dict) or bundle.get('format') != 'ardesia-study-notebook-v1' or type(bundle.get('schemaVersion')) is not int or bundle['schemaVersion'] != 1:
        raise StudyError('unsupported_notebook')
    resources = _list(bundle, 'resources', MAX_ITEMS)
    submissions = _list(bundle, 'submissions', MAX_ITEMS)
    assets = _list(bundle, 'assets', MAX_ITEMS)
    revisions = _list(bundle, 'resourceRevisions', MAX_REVISIONS)
    omissions = bundle.get('omissions', [])
    if not isinstance(omissions, list) or any(not isinstance(item, str) or len(item) > 1000 for item in omissions):
        raise StudyError('invalid_notebook')
    if len(omissions) > 1000:
        raise StudyError('notebook_budget_exceeded')
    try:
        payload = {key: value for key, value in bundle.items() if key != 'sha256'}
        intact = digest(canonical(payload)) == bundle.get('sha256')
    except (TypeError, ValueError):
        intact = False
    if not intact:
        raise StudyError('notebook_integrity_failure')
    for resource in resources + revisions:
        _source_hash(resource)
    total = 0
    for asset in assets:
        try:
            if not isinstance(asset, dict) or not isinstance(asset.get('base64'), str) or type(asset.get('bytes')) is not int:
                raise ValueError()
            data = base64.b64decode(asset['base64'], validate=True)
            total += len(data)
            if total > MAX_BYTES or len(data) != asset['bytes'] or digest(data) != asset.get('sha256'):
                raise ValueError()
        except (ValueError, TypeError, binascii.Error):
            raise StudyError('asset_integrity_failure') from None
    revision_aware = 'resourceRevisions' in bundle
    unavailable = _inspect_references(bundle, resources, revisions, submissions) if revision_aware else set()
    return {'valid': True, 'resources': len(resources), 'resourceRevisions': len(revisions),
            'submissions': len(submissions), 'assets': len(assets), 'unavailableResourceRefs': len(unavailable),
            'referencesComplete': not unavailable if revision_aware else None,
            'referenceIntegrity': ('CHECKED_WITH_DECLARED_LOSSES' if unavailable else 'CHECKED_INTERNALLY') if revision_aware else 'NOT_CHECKED_LEGACY',
            'referenceIntegrityScope': 'RESOURCE_REVISION_REFERENCES',
            'canonicalAuthenticity': 'NOT_VERIFIED', 'integrityScope': 'UNSIGNED_INTERNAL_CONTENT_AND_REFERENCES',
            'omissions': omissions, 'sha256': bundle['sha256']}
