"""Compatibility facade for existing exercise, editor and HTTP callers."""
from .adapters.study_repository import SQLiteStudy
from .application import study
from .application.study import assessment, outline, recovery_resource
from .domain.assessment import matches, normalized


def evidence(db, uid):
    return study.evidence(SQLiteStudy(db), uid)


def choose(db, user, rows, d):
    return study.choose(SQLiteStudy(db), user, rows, d)


def start(db, user, rows, d):
    return study.start(SQLiteStudy(db), user, rows, d)


def mark_exposed(db, user, q, item):
    return study.mark_exposed(SQLiteStudy(db), user, q, item)


def note(db, user, run, idx, q, item):
    return study.note(SQLiteStudy(db), user, run, idx, q, item)


def details(db, user, rows, rid, d=None):
    return study.details(SQLiteStudy(db), user, rows, rid, d)


def recommendations(db, user, rows, observations):
    return study.recommendations(SQLiteStudy(db), user, rows, observations)


def stats(db, user, rows=None):
    return study.stats(SQLiteStudy(db), user, rows)


def historical_asset(db, user, rows, src):
    return study.historical_asset(SQLiteStudy(db), user, rows, src)
