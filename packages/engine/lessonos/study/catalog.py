"""Closed bundled pack registry and immutable edition bindings, in the same DB."""
import hashlib
import json
from pathlib import Path
from .models import StudyError

DEFAULT_COURSE = 'fisica-fluidi'
DEFAULT_PACK = 'relazioni-fluidi-v1'
LEGACY_PACK_SHA256 = '3e0589e3647cc8d45e006c58839f2b83b06a13451f5d2985ac01eee8efaa321f'
_PACKS = {
    (DEFAULT_PACK, 1): ('relazioni-fluidi-v1.json', DEFAULT_COURSE, 'Fisica: relazioni e fluidi', 'fisica',
                       '4 incontri da 90 minuti', 'poiseuille-v1', ('physics-semestre-2026',)),
    ('taylor-exp-v1', 1): ('taylor-exp-v1.json', 'analisi-1', 'Analisi 1: Taylor e resto', 'analisi',
                         'Modulo DRAFT, durata non deliberata', 'taylor-exp-v1', ()),
}


def _entry(pack_id, version):
    if not isinstance(pack_id, str) or type(version) is not int or (pack_id, version) not in _PACKS:
        raise StudyError('invalid_coursepack')
    return _PACKS[(pack_id, version)]


def load_pack(pack_id=DEFAULT_PACK, version=1):
    filename, *_ = _entry(pack_id, version)
    return json.loads((Path(__file__).parent / 'content' / filename).read_text())


def describe_pack(pack_id=DEFAULT_PACK, version=1):
    _, course_id, title, subject, duration, *capabilities = _entry(pack_id, version)
    # Metadata alone grants no laboratory or bank. Bindings belong to the exact
    # registered revision; neither the subject nor the first activity selects one.
    if capabilities and len(capabilities) != 2:
        raise StudyError('coursepack_unavailable', 409)
    entry_activity_id, bank_ids = capabilities or (None, ())
    if (not isinstance(bank_ids, tuple)
            or any(not isinstance(bank_id, str) or not bank_id for bank_id in bank_ids)
            or len(set(bank_ids)) != len(bank_ids)):
        raise StudyError('coursepack_unavailable', 409)
    pack = load_pack(pack_id, version)
    if pack['id'] != pack_id or pack['version'] != version:
        raise StudyError('coursepack_unavailable', 409)
    if entry_activity_id is not None:
        activities = pack.get('activities')
        if (not isinstance(entry_activity_id, str) or not entry_activity_id
                or not isinstance(activities, list)
                or sum(isinstance(item, dict) and item.get('id') == entry_activity_id
                       for item in activities) != 1):
            raise StudyError('coursepack_unavailable', 409)
    canonical = json.dumps(pack, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)
    return {'courseId': course_id, 'packId': pack_id, 'packVersion': version,
            'packSha256': hashlib.sha256(canonical.encode()).hexdigest(), 'title': title, 'subject': subject, 'duration': duration,
            # Supplementary practice does not rewrite the immutable CoursePack
            # JSON or its persisted edition pin. Access remains edition-scoped.
            'questionBankIds': list(bank_ids), 'entryActivityId': entry_activity_id}


def validate_binding(course_id, pack_id, version):
    descriptor = describe_pack(pack_id, version)
    if course_id != descriptor['courseId']:
        raise StudyError('invalid_coursepack')
    return descriptor


def bound_descriptor(row, *, descriptors=None):
    """Validate every pin; a caller may share resolved packs within one page.

    The optional dictionary belongs to that single call, never the process:
    a later page must read/parse/hash the bundled file again.
    """
    if row is None:
        raise StudyError('coursepack_unavailable', 409)
    try:
        pack_id, version = row['pack_id'], row['pack_version']
        _entry(pack_id, version)
        key = (pack_id, version)
        if descriptors is None:
            descriptor = describe_pack(pack_id, version)
        else:
            if key not in descriptors:
                descriptors[key] = describe_pack(pack_id, version)
            descriptor = descriptors[key]
        if row['course_id'] != descriptor['courseId'] or row['pack_sha256'] != descriptor['packSha256']:
            raise StudyError('coursepack_unavailable', 409)
    except (StudyError, OSError, ValueError, KeyError, TypeError):
        raise StudyError('coursepack_unavailable', 409) from None
    return descriptor


def edition_pack(store, edition_id):
    row = store.connection.execute('SELECT * FROM study_edition_packs WHERE edition_id=?', (edition_id,)).fetchone()
    return bound_descriptor(row)


def activity_metadata(store, edition_id, activity_id):
    descriptor = edition_pack(store, edition_id)
    pack = load_pack(descriptor['packId'], descriptor['packVersion'])
    activity = next((item for item in pack['activities'] if item['id'] == activity_id), None)
    # Pack transfer IDs identify exercises; their solver is still the same model.
    if activity is None:
        exercise = next((item for group in pack['transferTests'] for item in group['items']
                         if item['id'] == activity_id), None)
        if exercise:
            activity = next((item for item in pack['activities'] if item['id'] == exercise['activityId']), None)
    return descriptor, activity


def submission_course_context(store, edition_id, activity_id, parameters, transfer_context=None):
    descriptor, activity = activity_metadata(store, edition_id, activity_id)
    effective = transfer_context['parameters'] if transfer_context else parameters
    if activity:
        if activity.get('parametersRequired') or effective is not None:
            from .activities import evaluate_activity
            evaluate_activity(activity['id'], effective)
    return {**{key: descriptor[key] for key in ('courseId','packId','packVersion','packSha256')},
            'modelId': activity['id'] if activity else None,
            'modelVersion': activity.get('version',1) if activity else None,
            'parameters': effective}


def list_pack_descriptors():
    return [{**describe_pack(pack_id,version),
             'editorialStatus':load_pack(pack_id,version)['status'],
             'scope':load_pack(pack_id,version)['scope']}
            for pack_id,version in sorted(_PACKS)]
