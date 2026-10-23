"""Independent, deliberately RED publication-ledger regression probes.

Uses the real FastAPI TestClient and SQLite temporary store, with the two
synthetic questions provided by test_question_bank_approval_http. No real
corpus records or production services are modified.

Run on the exact tested SHA:
  PYTHONPATH=packages/engine:services/study-api uv run --project services/study-api \
    python -m pytest services/study-api/tests/test_pro_regia_review_ledger.py -q -rs
"""
from test_question_bank_approval_http import base, login, world  # noqa: F401


def legacy_payload(world):
    question = world['questions'][0]
    return {
        'questionId': question['id'],
        'questionVersion': question['version'],
        'contentSha256': world['bank'].approval_content_sha256(question['id']),
        'decision': 'APPROVED',
        'motivation': 'Conferma editoriale sintetica, senza scorciatoie scientifiche.',
        'confirmPublication': True,
    }


def test_legacy_confirmation_without_scientific_review_must_not_publish(world):
    login(world, 'owner')
    detail = world['client'].get(base() + '/review/questions/fixture-0')
    assert detail.status_code == 200
    assert detail.json()['state']['review'] is None
    assert detail.json()['state']['servable'] is False

    response = world['client'].post(
        base() + '/review/approvals', json=legacy_payload(world))
    assert response.status_code == 409, (
        'RED: legacy endpoint published without a saved scientific review: '
        f'{response.status_code} {response.text[:250]}')
    login(world, 'member')
    assert world['client'].get(base() + '/questions/fixture-0').status_code == 404
    assert world['client'].get(base() + '/questions').json()['total'] == 0


def test_revoked_publication_cannot_be_revived_through_legacy_endpoint(world):
    login(world, 'owner')
    payload = legacy_payload(world)
    review = world['client'].post(base() + '/review/reviews', json={
        'questionId': payload['questionId'],
        'questionVersion': payload['questionVersion'],
        'contentSha256': payload['contentSha256'],
        'status': 'APPROVED',
        'notes': 'Verifica scientifica sintetica; nessuna approvazione del corpus.',
        'expectedReviewId': None,
    })
    assert review.status_code == 200, review.text
    review_id = review.json()['reviewId']
    publication = world['client'].post(
        base() + f'/review/reviews/{review_id}/publish',
        json={'confirmPublication': True})
    assert publication.status_code == 200, publication.text
    approval_id = publication.json()['approvalId']
    revoke = world['client'].post(
        base() + f'/review/approvals/{approval_id}/revoke',
        json={'reason': 'Fixture synthetic scientific review withdrawn.'})
    assert revoke.status_code == 200, revoke.text
    assert revoke.json()['editorialStatus'] == 'REVOKED'

    # A retry cannot synthesize a new publication without a new positive review.
    retry = world['client'].post(base() + '/review/approvals', json=payload)
    assert retry.status_code == 409, (
        'RED: a revoked fixture was republished by the compatibility route: '
        f'{retry.status_code} {retry.text[:250]}')
    login(world, 'member')
    assert world['client'].get(base() + '/questions/fixture-0').status_code == 404
    assert world['client'].get(base() + '/questions').json()['total'] == 0
