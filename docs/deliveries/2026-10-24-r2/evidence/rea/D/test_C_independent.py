"""Read-only product review: exact pins and assistance across evidence generations."""
from copy import deepcopy
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import json
import pytest
from lessonos.study.learning_experiences import list_experiences
from lessonos.study.submissions import submit
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def scalar(store, actor):
    e = list_experiences(store, actor, 'fluidi', format='composable')['experiences'][0]
    return e, e['steps'][0]


def send(store, actor, e, s, key, **changes):
    evidence = {'schemaVersion': 2, 'experienceRef': e['experienceRef'], 'stepId': s['id'],
                'prediction': {'kind': 'scalar', 'value': 19620, 'unit': 'Pa'}, 'supportUsed': []}
    evidence.update(changes)
    return submit(store, actor, 'fluidi', s['activityId'], [], 'Procedimento sintetico indipendente.', key,
                  activity_parameters=s['parameters'], activity_evidence=evidence)


def test_content_change_without_version_bump_invalidates_exact_pin_atomically(tmp_path, monkeypatch):
    store, _, actor, *_ = setup_store(tmp_path)
    e, s = scalar(store, actor)
    original = Path.read_text
    def changed(path, *args, **kwargs):
        raw = original(path, *args, **kwargs)
        if path.name == 'learning-compositions-v1.json':
            data = json.loads(raw)
            data['experiences'][0]['steps'][0]['hints'][0] += ' Mutazione indipendente.'
            return json.dumps(data)
        return raw
    monkeypatch.setattr(Path, 'read_text', changed)
    current, _ = scalar(store, actor)
    assert current['experienceRef']['id'] == e['experienceRef']['id']
    assert current['experienceRef']['version'] == e['experienceRef']['version']
    assert current['experienceRef']['sha256'] != e['experienceRef']['sha256']
    with pytest.raises(StudyError, match='invalid_activity_evidence'):
        send(store, actor, e, s, 'stale-content')
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
    assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 0


def ratio_manifest(monkeypatch):
    original = Path.read_text
    def changed(path, *args, **kwargs):
        raw = original(path, *args, **kwargs)
        if path.name == 'learning-compositions-v1.json':
            data = json.loads(raw)
            e = deepcopy(data['experiences'][0])
            e['id'] = 'independent-ratio-v1'
            e['steps'] = [dict(e['steps'][0], id='fixed-flow', activityId='poiseuille-v1',
                               parameters={'radiusRatio': 2, 'boundary': 'flow'},
                               prediction={'kind': 'ratio', 'fixedQuantityRequired': True})]
            data['experiences'].append(e)
            return json.dumps(data)
        return raw
    monkeypatch.setattr(Path, 'read_text', changed)


def test_legacy_and_composable_ratio_share_the_same_concurrent_assistance_fence(tmp_path, monkeypatch):
    ratio_manifest(monkeypatch)
    store, _, actor, *_ = setup_store(tmp_path)
    e = next(x for x in list_experiences(store, actor, 'fluidi', format='composable')['experiences'] if x['id'] == 'independent-ratio-v1')
    p = {'radiusRatio': 2, 'boundary': 'flow'}
    filename = store.path
    store.close()
    barrier = Barrier(2)
    def post(index):
        independent = StudyStore(filename)
        try:
            evidence = ({'schemaVersion': 1, 'experienceId': 'poiseuille-boundary-v1', 'stepId': 'fixed-flow',
                         'prediction': {'ratio': .0625, 'fixedQuantity': 'flow'}, 'supportUsed': []} if index == 0 else
                        {'schemaVersion': 2, 'experienceRef': e['experienceRef'], 'stepId': 'fixed-flow',
                         'prediction': {'kind': 'ratio', 'ratio': .0625, 'fixedQuantity': 'flow'}, 'supportUsed': []})
            barrier.wait(timeout=5)
            return submit(independent, actor, 'fluidi', 'poiseuille-v1', [],
                          'Procedimento indipendente tra generazioni.', f'cross-generation-{index}',
                          activity_parameters=p, activity_evidence=evidence)
        finally:
            independent.close()
    with ThreadPoolExecutor(2) as pool:
        receipts = list(pool.map(post, [0, 1]))
    assert sorted(r['activityEvidence']['assistance'] for r in receipts) == ['NO_SUPPORT_REQUESTED', 'SUPPORT_REQUESTED']
    assert all(r['activityEvidence']['result']['ratio'] == .0625 for r in receipts)


def test_unit_is_feedback_not_success_and_idempotency_cannot_replace_it(tmp_path):
    store, _, actor, peer, *_ = setup_store(tmp_path)
    e, s = scalar(store, actor)
    wrong = {'kind': 'scalar', 'value': 19620, 'unit': 'kPa'}
    first = send(store, actor, e, s, 'unit-key', prediction=wrong)
    assert first['activityEvidence']['check'] == {'kind': 'scalar', 'valueMatches': True, 'unitMatches': False}
    assert send(store, actor, e, s, 'unit-key', prediction=wrong) == first
    with pytest.raises(StudyError):
        send(store, actor, e, s, 'unit-key')
    correction = send(store, actor, e, s, 'unit-new-key')
    assert correction['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
    assert correction['activityEvidence']['check']['unitMatches']
    assert send(store, peer, e, s, 'peer-key')['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    stored = json.loads(store.connection.execute('SELECT body FROM study_receipts WHERE id=?', (first['receiptId'],)).fetchone()[0])
    assert stored == first
