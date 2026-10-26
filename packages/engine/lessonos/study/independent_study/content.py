"""Adapters over existing editorial packs; no copied bank or numerical solver."""
from copy import deepcopy
from ..catalog import edition_pack, load_pack
from ..four_courses import course_projection, DEMO_IDS
from ..models import StudyError
from ..store import canonical, digest
from ..course_models import GRIDS


def lessons(store, principal, edition_id):
    store._edition_access(principal, edition_id)
    if principal.role != 'student':
        raise StudyError('forbidden', 403)
    pin = edition_pack(store, edition_id)
    pack = load_pack(pin['packId'], pin['packVersion'])
    if pin['packId'] == 'taylor-exp-v1':
        first, second = pack['exercises'][:2]
        item = {'id': 'taylor-exp-original', 'title': 'Taylor: fattoriali, segni e resto',
                'objectiveIds': ['taylor-exp-remainder'], 'activityId': 'taylor-exp-v1',
                'explanation': [pack['activities'][0]['model'], pack['activities'][0]['skill']],
                'workedExample': {'prompt': first['prompt'], 'steps': [first['solution']], 'answerDisplay': ''},
                'practice': {**first, 'feedback': [first['solution']]},
                'transfer': {**second, 'feedback': [second['solution']]},
                'recap': [pack['scope']], 'transcript': pack['scope'],
                'editorialStatus': 'DRAFT', 'humanApproval': False, 'releaseScope': 'PRIVATE_ENROLLED_DRAFT'}
        item['lessonRef'] = {'id': item['id'], 'version': 1, 'sha256': digest(canonical(item))}
        items = [item]
    else:
        course = next((c for c in course_projection()['courses'] if c['packId'] == pin['packId']), None)
        if course is None:
            raise StudyError('independent_study_unavailable', 404)
        items = [deepcopy(l) for l in course['lessons'] if l['id'] in DEMO_IDS and l.get('activityId')]
    activities = {a['id']: a for a in pack['activities']}
    for item in items:
        # HTTP course projections also contain large numerical plot results.
        # Preserve editorial inputs; regenerate numerical results in the Core.
        for phase in ('practice', 'transfer'):
            item[phase] = {k: v for k, v in item[phase].items() if k in ('prompt', 'parameters', 'answer', 'feedback')}
        grid = deepcopy(GRIDS.get(item['activityId'], {'x': [-.5, 0, .5, 1], 'degree': [0, 1, 3, 5]}))
        for key, value in item['practice']['parameters'].items():
            if value not in grid.get(key, []):
                grid.setdefault(key, []).append(value)
        item['controls'] = grid
        item['prerequisites'] = activities.get(item['activityId'], {}).get('prerequisites', [])
    return {k: pin[k] for k in ('packId', 'packVersion', 'packSha256')}, items


def resolve(store, principal, edition_id, lesson_ref):
    pin, items = lessons(store, principal, edition_id)
    item = next((l for l in items if l['lessonRef'] == lesson_ref), None)
    if item is None:
        raise StudyError('lesson_unavailable', 409)
    return pin, item
