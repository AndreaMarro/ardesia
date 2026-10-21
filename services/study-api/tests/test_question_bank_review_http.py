"""Private review and publication are two deliberate, independently durable steps."""
import pytest

from test_question_bank_approval_http import base, login, world  # synthetic bank only


def review_body(world, *, status='APPROVED', previous=None):
    return {'questionId': 'fixture-0', 'questionVersion': 1,
            'contentSha256': world['bank'].approval_content_sha256('fixture-0'),
            'status': status, 'notes': 'Verificati i passaggi e le unità.',
            'expectedReviewId': previous}


def test_scientific_review_is_saved_but_never_publishes(world):
    login(world, 'owner')
    response = world['client'].post(base() + '/review/reviews', json=review_body(world))
    assert response.status_code == 200, response.text
    review = response.json()
    assert review['status'] == 'APPROVED'
    detail = world['client'].get(base() + '/review/questions/fixture-0').json()
    assert detail['state']['review']['reviewId'] == review['reviewId']
    assert detail['state']['servable'] is False
    assert detail['state']['approval'] is None
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 0
    assert world['client'].get(base() + '/questions/fixture-0').status_code == 404


def test_legacy_approval_requires_deliberate_editorial_confirmation(world):
    login(world, 'owner')
    body = review_body(world)
    response = world['client'].post(base() + '/review/approvals', json={
        'questionId': body['questionId'], 'questionVersion': body['questionVersion'],
        'contentSha256': body['contentSha256'], 'decision': 'APPROVED',
        'motivation': body['notes']})
    assert response.status_code == 409
    assert response.json()['error'] == 'publication_confirmation_required'
    assert world['client'].get(base() + '/questions').json()['total'] == 0


def test_saved_notes_then_decision_then_explicit_publication_and_revocation(world):
    login(world, 'owner')
    draft = world['client'].post(base() + '/review/reviews',
                                 json=review_body(world, status='PENDING')).json()
    # Reload reads the persisted notes, not browser-local state.
    detail = world['client'].get(base() + '/review/questions/fixture-0').json()
    assert detail['state']['review']['notes'] == 'Verificati i passaggi e le unità.'
    assert detail['state']['review']['status'] == 'PENDING'
    url = base() + f"/review/reviews/{draft['reviewId']}/publish"
    assert world['client'].post(url, json={'confirmPublication': True}).status_code == 409
    approved = world['client'].post(base() + '/review/reviews', json=review_body(
        world, previous=draft['reviewId'])).json()
    url = base() + f"/review/reviews/{approved['reviewId']}/publish"
    assert world['client'].post(url, json={'confirmPublication': False}).status_code == 409
    assert world['client'].post(url, json={}).status_code == 422
    assert world['client'].get(base() + '/questions').json()['total'] == 0
    publication = world['client'].post(url, json={'confirmPublication': True})
    assert publication.status_code == 200, publication.text
    approval_id = publication.json()['approvalId']
    assert world['client'].post(url, json={'confirmPublication': True}).json()['approvalId'] == approval_id
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 1
    assert 'Verificati' not in world['client'].get(base() + '/questions').text
    login(world, 'owner')
    revoked = world['client'].post(base() + f'/review/approvals/{approval_id}/revoke',
                                  json={'reason': 'Serve una nuova verifica.'})
    assert revoked.status_code == 200
    replay = world['client'].post(url, json={'confirmPublication': True})
    assert replay.status_code == 409
    assert replay.json()['error'] == 'review_publication_revoked'
    history = world['client'].get(base() + '/review/questions/fixture-0/history').json()
    assert [item['status'] for item in history['reviews']] == ['PENDING', 'APPROVED']
    assert history['approvals'][0]['events'][0]['reviewId'] == approved['reviewId']
    assert history['approvals'][0]['editorialStatus'] == 'REVOKED'
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 0


@pytest.mark.parametrize('actor', ['member', 'peer', 'outsider'])
def test_private_review_and_publication_deny_students_peers_and_other_teachers(world, actor):
    login(world, 'owner')
    review = world['client'].post(base() + '/review/reviews', json=review_body(world)).json()
    login(world, actor)
    for path in ('/review/questions', '/review/questions/fixture-0',
                 '/review/questions/fixture-0/history'):
        assert world['client'].get(base() + path).status_code == 403
    assert world['client'].post(base() + '/review/reviews',
                                json=review_body(world)).status_code == 403
    assert world['client'].post(base() + f"/review/reviews/{review['reviewId']}/publish",
                                json={'confirmPublication': True}).status_code == 403


def test_stale_review_cannot_overwrite_or_publish_and_cannot_cross_editions(world):
    login(world, 'owner')
    first = world['client'].post(base() + '/review/reviews', json=review_body(world)).json()
    stale_write = world['client'].post(base() + '/review/reviews', json=review_body(world))
    assert stale_write.status_code == 409
    assert stale_write.json()['error'] == 'question_review_conflict'
    rejected = world['client'].post(base() + '/review/reviews', json=review_body(
        world, status='REJECTED', previous=first['reviewId']))
    assert rejected.status_code == 200
    old = world['client'].post(base() + f"/review/reviews/{first['reviewId']}/publish",
                               json={'confirmPublication': True})
    assert old.status_code == 409 and old.json()['error'] == 'question_review_conflict'
    cross = world['client'].post(base('fluidi-b') + f"/review/reviews/{first['reviewId']}/publish",
                                 json={'confirmPublication': True})
    assert cross.status_code == 404
    stale_digest = world['client'].post(base() + '/review/reviews', json={
        **review_body(world, previous=rejected.json()['reviewId']), 'contentSha256': '0' * 64})
    assert stale_digest.status_code == 409
    assert world['client'].get(base() + '/questions').json()['total'] == 0


def test_body_cannot_smuggle_actor_or_publication_into_review(world):
    login(world, 'owner')
    for extra in ({'actorId': 'owner'}, {'editorialStatus': 'PUBLISHED'},
                  {'confirmPublication': True}, {'approvalId': 'made-up'}):
        response = world['client'].post(base() + '/review/reviews', json=review_body(world) | extra)
        assert response.status_code == 422
