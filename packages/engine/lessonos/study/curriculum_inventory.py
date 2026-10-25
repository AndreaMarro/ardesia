"""Read-only teacher inventory derived from the existing pack and bank registries.

This projection adds no course identity, publication decision or persisted state.
The caller must authorize the teacher before loading potentially large banks.
"""
from . import catalog, question_bank
from .curriculum_pathways import build_pathways, inventory_collections, load_pathways_config


def _programme(descriptor):
    pack = catalog.load_pack(descriptor['packId'], descriptor['packVersion'])
    activities = pack.get('activities', [])
    exercises = pack.get('exercises', [])
    transfers = [item for group in pack.get('transferTests', []) for item in group['items']]
    prerequisites = sorted({label for activity in activities for label in activity.get('prerequisites', [])
                            if isinstance(label, str) and label})
    objectives = sorted({activity['skill'] for activity in activities
                         if isinstance(activity.get('skill'), str) and activity['skill']})
    gaps = ['Revisione scientifica umana e decisione editoriale da completare.',
            'Adeguatezza e collaudo dell’edizione da verificare.']
    if descriptor['entryActivityId'] is None:
        gaps.append('Attività iniziale non collegata.')
    if not exercises:
        gaps.append('Esercizi non presenti nel CoursePack.')
    solutions = sum(bool(item.get('solution')) for item in exercises + transfers)
    if solutions < len(exercises) + len(transfers):
        gaps.append('Soluzioni mancanti per alcuni esercizi o prove di trasferimento.')
    return {
        'id': f"{descriptor['packId']}@{descriptor['packVersion']}",
        **{key: descriptor[key] for key in ('title', 'subject', 'packId', 'packVersion',
                                           'packSha256', 'entryActivityId')},
        'scope': pack['scope'], 'prerequisites': prerequisites, 'learningObjectives': objectives,
        'activities': [{'id': activity['id'], 'title': activity.get('title', activity['id'])}
                       for activity in activities],
        'exerciseCount': len(exercises), 'transferCount': len(transfers), 'solutionCount': solutions,
        'editorialStatus': pack['status'], 'scientificReview': 'NOT_ATTESTED', 'creatable': True,
        'rights': pack.get('rights', 'NOT_DOCUMENTED'),
        'sources': [{key: source[key] for key in ('title', 'url', 'scope') if key in source}
                    for source in pack.get('sources', [])],
        'gaps': gaps,
    }


def build_inventory(descriptors):
    programmes = [_programme(descriptor) for descriptor in descriptors]
    collections = [collection for bank_id in sorted(question_bank.BANK_PATHS)
                   for collection in inventory_collections(question_bank.load_bank(bank_id))]
    shared = {}
    for entry in programmes + collections:
        for label in entry['prerequisites']:
            shared.setdefault(label, set()).add(entry['id'])
    # An unavailable/obsolete composition is explicit, without hiding existing
    # packs or choosing an arbitrary bank when a configured pin no longer fits.
    from .models import StudyError
    try:
        pathways = build_pathways()
        pathways_error = None
    except StudyError as error:
        pathways, pathways_error = None, error.code
    return {
        'pathways': pathways, 'pathwaysError': pathways_error,
        'programmes': programmes, 'collections': collections,
        'sharedPrerequisites': [{'label': label, 'entryIds': sorted(ids)}
                                for label, ids in sorted(shared.items()) if len(ids) >= 2],
    }
