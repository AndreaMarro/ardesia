"""Versioned adapter: explicit self reports become schedules, never grades.

The Core owns the card in its existing immutable resource revisions. No client
card, automatic correctness-to-rating conversion, duration tracking or training.
"""
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import math

from ..models import StudyError
from ..store import canonical, digest
from .vendor.pyfsrs import Card, Rating, Scheduler

VERSION = '6.3.2'
RATINGS = {'again': Rating.Again, 'hard': Rating.Hard, 'good': Rating.Good, 'easy': Rating.Easy}
LABELS = {'again': 'Da riprovare', 'hard': 'Difficile', 'good': 'Ricordato', 'easy': 'Facile'}


def _scheduler():
    # Deterministic replay; bounded horizon. Upstream weights/steps unchanged.
    return Scheduler(enable_fuzzing=False, maximum_interval=365)


POLICY_HASH = digest(canonical(_scheduler().to_dict()))


def _card_id(resource_id):
    return int(hashlib.sha256(resource_id.encode()).hexdigest()[:12], 16)


def _card(state, resource_id, now):
    at = datetime.fromtimestamp(now, timezone.utc)
    saved = state.get('scheduler')
    if saved is None:
        return Card(card_id=_card_id(resource_id), due=at), at
    if (not isinstance(saved, dict) or saved.get('engine') != 'py-fsrs'
            or saved.get('version') != VERSION or saved.get('adapterSchemaVersion') != 1
            or saved.get('policyHash') != POLICY_HASH):
        raise StudyError('study_scheduler_unavailable', 409)
    try:
        raw = saved['card']
        if (type(raw['card_id']) is not int or raw['card_id'] != _card_id(resource_id)
                or type(raw['state']) is not int or raw['state'] not in (1, 2, 3)
                or raw['step'] is not None and (type(raw['step']) is not int or not 0 <= raw['step'] <= 1)):
            raise ValueError('invalid card')
        for field in ('stability', 'difficulty'):
            number = raw[field]
            if number is not None and (type(number) not in (int, float) or not math.isfinite(number) or number <= 0):
                raise ValueError('invalid parameter')
        card = Card.from_dict(raw)
        if card.due.utcoffset() is None or card.last_review is None or card.last_review.utcoffset() is None:
            raise ValueError('naive or absent datetime')
    except (KeyError, TypeError, ValueError, OverflowError):
        raise StudyError('study_scheduler_unavailable', 409) from None
    if at < card.last_review:
        raise StudyError('study_clock_regressed', 409)
    return card, at


def preview(state, resource_id, now):
    card, at = _card(state, resource_id, now)
    saved = state.get('scheduler')
    rated = saved is not None and saved['ratedCycle'] == state['cycle']
    choices = []
    if not rated:
        for name, rating in RATINGS.items():
            scheduled, _ = _scheduler().review_card(card, rating, review_datetime=at)
            choices.append({'rating': name, 'label': LABELS[name], 'due': scheduled.due.timestamp()})
    return {'engine': 'py-fsrs', 'version': VERSION, 'basis': 'learner_self_report',
            'rated': rated, 'lastRating': saved['lastRating'] if rated else None,
            'canUndo': rated and 'previous' in saved, 'choices': choices,
            'manualOverride': deepcopy(state.get('reviewOverride')),
            'explanation': 'Scegli come hai ricordato: è un’autovalutazione per proporre la prossima data, non un voto o una certificazione.'}


def apply_rating(state, resource_id, now, rating):
    if type(rating) is not str or rating not in RATINGS:
        raise StudyError('invalid_study_rating')
    if state['phase'] != 'review':
        raise StudyError('study_phase_conflict', 409)
    card, at = _card(state, resource_id, now)
    saved = state.get('scheduler')
    if saved is not None and saved['ratedCycle'] == state['cycle']:
        raise StudyError('study_rating_already_recorded', 409)
    previous = deepcopy(saved)
    if previous is not None:
        previous.pop('previous', None)  # Bounded checkpoint; full audit is in Core revisions.
    scheduled, log = _scheduler().review_card(card, RATINGS[rating], review_datetime=at)
    value = deepcopy(state)
    value['scheduler'] = {'engine': 'py-fsrs', 'version': VERSION, 'adapterSchemaVersion': 1,
                          'policyHash': POLICY_HASH, 'card': scheduled.to_dict(), 'reviewLog': log.to_dict(),
                          'basis': 'learner_self_report', 'lastRating': rating, 'ratedCycle': state['cycle'],
                          'assistanceObserved': any(a['cycle'] == state['cycle'] for a in state['assistanceHistory']),
                          'previous': {'scheduler': previous, 'reviewAt': state['reviewAt'],
                                       'reviewReason': state['reviewReason'], 'reviewOverride': state.get('reviewOverride')}}
    value['reviewAt'] = scheduled.due.timestamp()
    value['reviewReason'] = 'Ripasso proposto da FSRS dopo la tua scelta «' + LABELS[rating] + '». Puoi modificare la data o annullare la scelta.'
    value.pop('reviewOverride', None)
    return value


def undo_rating(state):
    saved = state.get('scheduler')
    if not saved or saved.get('ratedCycle') != state['cycle'] or 'previous' not in saved:
        raise StudyError('study_rating_not_recorded', 409)
    value = deepcopy(state)
    before = saved['previous']
    for field in ('scheduler', 'reviewAt', 'reviewReason', 'reviewOverride'):
        value[field] = deepcopy(before[field])
    return value
