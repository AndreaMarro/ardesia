"""Default-deny publication of bundled questions.

The corpus is immutable input. A question may reach a student only when an
owning teacher of that edition has persisted an approval bound to the exact
question revision and the SHA-256 of its authored content. Revocation is a new
durable state, never a deletion; the transition trail is append-only.

This module never rewrites the bank JSON, never attributes an approval to the
4.000 authored records and never exposes answers on a preview list.
"""
from .models import StudyError
from .store import canonical, identifier

GATE_ID = 'scientific-editorial-approval-v1'
SCIENTIFIC_STATUSES = ('APPROVED', 'REJECTED')
EDITORIAL_PUBLISHED = 'PUBLISHED'
EDITORIAL_WITHHELD = 'WITHHELD'
EDITORIAL_REVOKED = 'REVOKED'
MAX_MOTIVATION = 2000


def _text(value, *, field, maximum=MAX_MOTIVATION, required=False):
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise StudyError(f'invalid_{field}')
    return value


def _approval(row):
    return {
        'approvalId': row['id'], 'editionId': row['edition_id'],
        'bankId': row['bank_id'], 'questionId': row['question_id'],
        'questionVersion': row['question_version'], 'contentSha256': row['content_sha256'],
        'bankSha256': row['bank_sha256'], 'scientificStatus': row['scientific_status'],
        'editorialStatus': row['editorial_status'], 'actorId': row['actor_id'],
        'createdAt': row['created_at'], 'motivation': row['motivation'],
        'revokedAt': row['revoked_at'], 'revokedBy': row['revoked_by'],
        'revocationReason': row['revocation_reason'], 'supersedesId': row['supersedes_id'],
    }


def _event(row):
    return {
        'eventId': row['id'], 'approvalId': row['approval_id'],
        'questionId': row['question_id'], 'questionVersion': row['question_version'],
        'contentSha256': row['content_sha256'], 'event': row['event'],
        'actorId': row['actor_id'], 'createdAt': row['created_at'],
        'motivation': row['motivation'],
    }


class ApprovalGate:
    """One edition's view of the persisted publication decisions for one bank."""

    def __init__(self, store, bank, edition_id):
        if not isinstance(edition_id, str) or not edition_id:
            raise StudyError('invalid_edition')
        self.store = store
        self.bank = bank
        self.edition_id = edition_id
        self.bank_id = bank.manifest['id']

    def _teacher_edition(self, principal):
        edition = self.store._edition_access(principal, self.edition_id, teacher_only=True)
        if self.bank_id not in edition.get('questionBankIds', []):
            raise StudyError('question_bank_not_available_for_edition', 404)
        return edition

    def _matches(self, row):
        try:
            return (row['question_version'] == self.bank.question_version(row['question_id'])
                    and row['content_sha256'] == self.bank.approval_content_sha256(row['question_id']))
        except StudyError:
            return False

    def _latest_by_question(self):
        """Newest decision per question, following the supersedes chain.

        Wall-clock timestamps can tie and random ids do not order; the durable
        ``supersedes_id`` chain is the only authoritative sequence. A corrupt
        chain falls back to the last row in (created_at, id) order, fail-closed
        for publication because the latest decision is still the one served.
        """
        rows = self.store.connection.execute(
            'SELECT * FROM study_question_bank_approvals WHERE edition_id=? AND bank_id=? '
            'ORDER BY created_at, id', (self.edition_id, self.bank_id)).fetchall()
        superseded = {row['supersedes_id'] for row in rows if row['supersedes_id']}
        latest = {}
        for row in rows:
            if row['id'] not in superseded:
                latest[row['question_id']] = row
        for row in rows:
            latest.setdefault(row['question_id'], row)
        return latest

    def _latest_for(self, question_id):
        return self._latest_by_question().get(question_id)

    def _active_by_question(self):
        """Current-content approvals only: a reverted byte-identical text is
        still covered by the decision that approved those exact bytes."""
        rows = self.store.connection.execute(
            'SELECT * FROM study_question_bank_approvals WHERE edition_id=? AND bank_id=? '
            "AND scientific_status='APPROVED' AND editorial_status='PUBLISHED'",
            (self.edition_id, self.bank_id)).fetchall()
        return {row['question_id']: row for row in rows if self._matches(row)}

    def servable_ids(self):
        """Ids with an active approval for the current revision and content."""
        return frozenset(self._active_by_question())

    def _latest_active(self, question_id, question_version, content_sha256):
        return self.store.connection.execute(
            'SELECT * FROM study_question_bank_approvals WHERE edition_id=? AND bank_id=? '
            'AND question_id=? AND question_version=? AND content_sha256=? '
            "AND scientific_status='APPROVED' AND editorial_status='PUBLISHED'",
            (self.edition_id, self.bank_id, question_id, question_version,
             content_sha256)).fetchone()

    def _latest_any(self, question_id):
        return self._latest_for(question_id)

    def approve(self, principal, *, question_id, question_version, content_sha256,
                decision, motivation=None):
        """Persist one binding decision. A stale revision or digest is rejected."""
        self._teacher_edition(principal)
        if not isinstance(question_id, str) or not question_id:
            raise StudyError('invalid_question_id')
        if type(question_version) is not int or question_version < 1:
            raise StudyError('invalid_question_revision')
        if not isinstance(content_sha256, str) or len(content_sha256) != 64:
            raise StudyError('invalid_question_content_hash')
        if decision not in SCIENTIFIC_STATUSES:
            raise StudyError('invalid_scientific_decision')
        motivation = _text(motivation, field='motivation', required=True)
        expected_version = self.bank.question_version(question_id)
        expected_digest = self.bank.approval_content_sha256(question_id)
        if question_version != expected_version or content_sha256 != expected_digest:
            # The reviewer read something else: approve nothing, reveal nothing.
            raise StudyError('question_revision_changed', 409)
        with self.store.transaction() as connection:
            self.store.lock_aggregate(connection, 'question-bank-approval',
                                      f'{self.edition_id}:{self.bank_id}:{question_id}')
            active = self._latest_active(question_id, question_version, content_sha256)
            if decision == 'APPROVED' and active is not None:
                return _approval(active)
            if decision == 'REJECTED' and active is not None:
                raise StudyError('approval_active_requires_revocation', 409)
            previous = self._latest_any(question_id)
            approval_id = identifier()
            created_at = self.store.clock()
            editorial = EDITORIAL_PUBLISHED if decision == 'APPROVED' else EDITORIAL_WITHHELD
            connection.execute(
                'INSERT INTO study_question_bank_approvals('
                'id,edition_id,bank_id,question_id,question_version,content_sha256,bank_sha256,'
                'scientific_status,editorial_status,actor_id,created_at,motivation,supersedes_id) '
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                (approval_id, self.edition_id, self.bank_id, question_id, question_version,
                 content_sha256, self.bank.sha256, decision, editorial, principal.id, created_at,
                 motivation, previous['id'] if previous else None))
            self._append_event(connection, approval_id, question_id, question_version,
                               content_sha256, decision, principal.id, created_at, motivation)
            row = connection.execute('SELECT * FROM study_question_bank_approvals WHERE id=?',
                                     (approval_id,)).fetchone()
        return _approval(row)

    def revoke(self, principal, approval_id, *, reason):
        """Withdraw publication without deleting the decision or its trail."""
        self._teacher_edition(principal)
        if not isinstance(approval_id, str) or not approval_id:
            raise StudyError('invalid_approval_id')
        reason = _text(reason, field='revocation_reason', required=True)
        with self.store.transaction() as connection:
            row = connection.execute(
                'SELECT * FROM study_question_bank_approvals WHERE id=? AND edition_id=? AND bank_id=?',
                (approval_id, self.edition_id, self.bank_id)).fetchone()
            if row is None:
                raise StudyError('approval_not_found', 404)
            if row['editorial_status'] == EDITORIAL_REVOKED:
                raise StudyError('approval_already_revoked', 409)
            if row['scientific_status'] != 'APPROVED' or row['editorial_status'] != EDITORIAL_PUBLISHED:
                raise StudyError('approval_not_published', 409)
            revoked_at = self.store.clock()
            changed = connection.execute(
                'UPDATE study_question_bank_approvals SET editorial_status=?,revoked_at=?,'
                'revoked_by=?,revocation_reason=? WHERE id=? AND editorial_status=?',
                (EDITORIAL_REVOKED, revoked_at, principal.id, reason, approval_id,
                 EDITORIAL_PUBLISHED))
            if changed.rowcount != 1:
                raise StudyError('approval_conflict', 409)
            self._append_event(connection, approval_id, row['question_id'], row['question_version'],
                               row['content_sha256'], 'REVOKED', principal.id, revoked_at, reason)
            updated = connection.execute('SELECT * FROM study_question_bank_approvals WHERE id=?',
                                         (approval_id,)).fetchone()
        return _approval(updated)

    def _append_event(self, connection, approval_id, question_id, question_version,
                      content_sha256, event, actor_id, created_at, motivation):
        payload = canonical({
            'gate': GATE_ID, 'event': event, 'questionId': question_id,
            'questionVersion': question_version, 'contentSha256': content_sha256,
            'actorId': actor_id, 'createdAt': created_at,
        })
        connection.execute(
            'INSERT INTO study_question_bank_approval_events('
            'id,approval_id,edition_id,bank_id,question_id,question_version,content_sha256,'
            'event,actor_id,created_at,motivation,payload) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
            (identifier(), approval_id, self.edition_id, self.bank_id, question_id,
             question_version, content_sha256, event, actor_id, created_at, motivation, payload))

    def review_state(self, question_id):
        """Private reviewer view: the current-content decision when it exists."""
        current = self._active_by_question().get(question_id)
        row = current or self._latest_for(question_id)
        state = {'questionId': question_id,
                 'questionVersion': self.bank.question_version(question_id),
                 'contentSha256': self.bank.approval_content_sha256(question_id),
                 'servable': current is not None, 'approval': None}
        if row is not None:
            state['approval'] = _approval(row)
        return state

    def _history_rows(self, question_id):
        """Chronological rows for one question, following the supersedes chain."""
        rows = self.store.connection.execute(
            'SELECT * FROM study_question_bank_approvals WHERE edition_id=? AND bank_id=? '
            'AND question_id=? ORDER BY created_at, id',
            (self.edition_id, self.bank_id, question_id)).fetchall()
        by_id = {row['id']: row for row in rows}
        children, roots = {}, []
        for row in rows:
            parent = row['supersedes_id'] if row['supersedes_id'] in by_id else None
            if parent is None:
                roots.append(row)
            else:
                children[parent] = row
        ordered, seen = [], set()
        for root in roots:
            current = root
            while current is not None and current['id'] not in seen:
                ordered.append(current)
                seen.add(current['id'])
                current = children.get(current['id'])
        ordered.extend(row for row in rows if row['id'] not in seen)
        return ordered

    def history(self, principal, question_id):
        """Teacher-only audit trail for one question, oldest decision first."""
        self._teacher_edition(principal)
        if question_id not in self.bank._by_id:
            raise StudyError('question_not_found', 404)
        items = []
        for row in self._history_rows(question_id):
            events = self.store.connection.execute(
                'SELECT * FROM study_question_bank_approval_events WHERE approval_id=? '
                "ORDER BY created_at, CASE event WHEN 'REVOKED' THEN 1 ELSE 0 END, id",
                (row['id'],)).fetchall()
            items.append({**_approval(row), 'events': [_event(event) for event in events]})
        return {'questionId': question_id, 'approvals': items}

    def approval_events(self, principal, approval_id):
        self._teacher_edition(principal)
        row = self.store.connection.execute(
            'SELECT * FROM study_question_bank_approvals WHERE id=? AND edition_id=? AND bank_id=?',
            (approval_id, self.edition_id, self.bank_id)).fetchone()
        if row is None:
            raise StudyError('approval_not_found', 404)
        events = self.store.connection.execute(
            'SELECT * FROM study_question_bank_approval_events WHERE approval_id=? '
            "ORDER BY created_at, CASE event WHEN 'REVOKED' THEN 1 ELSE 0 END, id",
            (approval_id,)).fetchall()
        return {'approvalId': approval_id, 'events': [_event(event) for event in events]}

    def pending_questions(self, *, limit=20, after=None, pending=True, **filters):
        """Reviewer list: metadata plus approval state, never answer or solution.

        ``pending`` keeps only records without a currently servable approval,
        which is what a reviewer has left to decide. Pagination and totals are
        computed after that filter so a page never hides pending work.
        """
        if type(limit) is not int or not 1 <= limit <= 100:
            raise StudyError('invalid_question_pagination')
        if after is not None and (not isinstance(after, str) or not 1 <= len(after) <= 128):
            raise StudyError('invalid_question_pagination')
        latest = self._latest_by_question()
        active = self._active_by_question()
        questions = self.bank._filtered(**filters)
        records = []
        for question in questions:
            current = active.get(question['id'])
            servable = current is not None
            if pending and servable:
                continue
            records.append((question, current or latest.get(question['id']), servable))
        total = len(records)
        if after is not None:
            if not any(question['id'] == after for question, _, _ in records):
                raise StudyError('invalid_question_cursor')
            records = [record for record in records if record[0]['id'] > after]
        page = records[:limit]
        items = []
        for question, row, servable in page:
            items.append({'id': question['id'], 'version': question['version'],
                          'title': question['title'], 'prompt': question['prompt'],
                          'format': question['format'], 'taxonomy': dict(question['taxonomy']),
                          'difficulty': dict(question['difficulty']),
                          'contentSha256': self.bank.approval_content_sha256(question['id']),
                          'servable': servable,
                          'approval': _approval(row) if row is not None else None})
        return {'bankId': self.bank_id, 'bankSha256': self.bank.sha256, 'total': total,
                'items': items, 'nextCursor': page[-1][0]['id'] if len(records) > limit else None}
