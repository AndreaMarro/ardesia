"""Single-database adapter. Study facts and LessonOS projections commit together.

One SQLite connection per logical unit of work. Never call legacy auto-commit save
methods inside a study transaction; the adapter owns its complete transaction.
"""
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import secrets
import sqlite3
import time
import uuid

from lessonos.models.crm import assert_pseudonymous
from lessonos.store.sqlite import SQLiteStore
from .models import Principal, StudyError
from .lock import data_lock

MAX_EDITION_IDENTIFIER_LENGTH = 128
# Historic identifiers were unbounded. Keep a bounded compatibility cursor
# without changing or truncating their persisted identity.
MAX_EDITION_CURSOR_LENGTH = 8192


def identifier():
    return uuid.uuid4().hex


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(value: str | bytes):
    return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()


class StudyStore:
    def __init__(self, path: str | Path, clock=time.time, *, check_same_thread=True):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.clock = clock
        with data_lock(self.path):
            if self.path.exists() and self.path.stat().st_size<100:
                raise StudyError('database_integrity_failure',503)
            self.legacy = SQLiteStore(str(self.path), check_same_thread=check_same_thread)
            self.connection = self.legacy._conn
            self.connection.execute('PRAGMA foreign_keys=ON')
            self.connection.execute('PRAGMA busy_timeout=5000')
            self.connection.execute('PRAGMA journal_mode=WAL')
            present = self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_schema'").fetchone()
            if present and self.connection.execute('SELECT version FROM study_schema').fetchone()[0] > 3:
                self.close()
                raise StudyError('newer_schema', 503)
            if present and self.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 3:
                required={'study_calendar_targets','study_calendar_intents','study_calendar_mappings','study_calendar_cache','study_calendar_deliveries'}
                actual={row[0] for row in self.connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'study_calendar_%'")}
                if not required.issubset(actual):
                    self.close()
                    raise StudyError('database_integrity_failure',503)
            catalog_present = self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_edition_packs'").fetchone()
            self.connection.executescript(Path(__file__).with_name('schema.sql').read_text())
            if not catalog_present:
                from .catalog import DEFAULT_COURSE, DEFAULT_PACK, LEGACY_PACK_SHA256
                self.connection.execute('INSERT INTO study_edition_packs SELECT id,?,?,1,? FROM study_editions',
                    (DEFAULT_COURSE, DEFAULT_PACK, LEGACY_PACK_SHA256))
                self.connection.commit()

    def close(self):
        self.legacy.close()

    @contextmanager
    def transaction(self):
        if self.connection.in_transaction:
            raise RuntimeError('nested study transaction')
        with data_lock(self.path):
            self.connection.execute('BEGIN IMMEDIATE')
            try:
                yield self.connection
                self.connection.commit()
            except BaseException:
                self.connection.rollback()
                raise

    def backup(self, target: Path):
        with sqlite3.connect(target) as destination:
            self.connection.backup(destination)

    def lock_command(self, connection, actor_id, operation, key):
        """SQLite's BEGIN IMMEDIATE already serializes all writes."""

    def lock_aggregate(self, connection, namespace, aggregate_id):
        """Serialize one domain aggregate independently of request keys."""

    def lock_edition(self, connection, edition_id):
        """Dialect hook: PostgreSQL locks this aggregate, SQLite its writer."""

    def lock_teacher(self, connection, teacher_id):
        """Serialize calendar decisions for one tutor across their editions."""

    def create_principal(self, actor_id, role):
        assert_pseudonymous(actor_id, 'actor_id')
        if role not in ('teacher', 'student'):
            raise StudyError('invalid_role')
        with self.transaction() as c:
            if c.execute('SELECT 1 FROM study_erased_actors WHERE id=?',(actor_id,)).fetchone():
                raise StudyError('erased_identity',409)
            existing = c.execute('SELECT role FROM study_principals WHERE id=?', (actor_id,)).fetchone()
            if existing and existing['role'] != role:
                raise StudyError('identity_conflict', 409)
            c.execute('INSERT OR IGNORE INTO study_principals VALUES(?,?)', (actor_id, role))
            if role == 'teacher':
                c.execute('INSERT OR IGNORE INTO teachers VALUES(?)', (actor_id,))
            else:
                c.execute('INSERT OR IGNORE INTO students VALUES(?)', (actor_id,))
        return Principal(actor_id, role)

    def _principal(self, principal):
        row = self.connection.execute('SELECT * FROM study_principals WHERE id=?', (principal.id,)).fetchone()
        if row is None or row['role'] != principal.role:
            raise StudyError('unauthenticated', 401)
        return principal

    def issue_session(self, principal, ttl=3600):
        self._principal(principal)
        token = secrets.token_urlsafe(32)
        with self.transaction() as c:
            c.execute('INSERT INTO study_sessions VALUES(?,?,?)', (digest(token), principal.id, self.clock()+ttl))
        return token

    def principal_for_session(self, token):
        row = self.connection.execute('SELECT p.* FROM study_principals p JOIN study_sessions s ON s.actor_id=p.id WHERE s.token_hash=? AND s.expires_at>?', (digest(token), self.clock())).fetchone()
        return Principal(row['id'], row['role']) if row else None

    def revoke_session(self, token):
        with self.transaction() as c:
            c.execute('DELETE FROM study_sessions WHERE token_hash=?', (digest(token),))

    def revoke_all_sessions(self, principal):
        self._principal(principal)
        with self.transaction() as c:
            c.execute('DELETE FROM study_sessions WHERE actor_id=?', (principal.id,))
            c.execute("UPDATE study_invitations SET state='revoked' WHERE actor_id=? AND state='pending'", (principal.id,))

    def create_invitation(self, principal, edition_id, actor_id, ttl=900):
        self._edition_access(principal, edition_id, teacher_only=True)
        if type(ttl) not in (int,float) or not 0 < ttl <= 86400:
            raise StudyError('invalid_invitation_ttl')
        if not self.connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?', (edition_id,actor_id)).fetchone():
            raise StudyError('forbidden',403)
        token=secrets.token_urlsafe(32); invite_id=identifier(); expires=self.clock()+ttl
        with self.transaction() as c:
            c.execute('INSERT INTO study_invitations VALUES(?,?,?,?,?,?)', (invite_id,digest(token),actor_id,edition_id,expires,'pending'))
        return {'id':invite_id,'token':token,'expiresAt':expires,'singleUse':True}

    def revoke_invitation(self, principal, invitation_id):
        row=self.connection.execute('SELECT edition_id FROM study_invitations WHERE id=?',(invitation_id,)).fetchone()
        if not row:raise StudyError('not_found',404)
        self._edition_access(principal,row[0],teacher_only=True)
        with self.transaction() as c:
            c.execute("UPDATE study_invitations SET state='revoked' WHERE id=? AND state='pending'",(invitation_id,))

    def accept_invitation(self, token):
        session=secrets.token_urlsafe(32)
        with self.transaction() as c:
            row=c.execute("SELECT * FROM study_invitations WHERE token_hash=? AND expires_at>? AND state='pending'",(digest(token),self.clock())).fetchone()
            if not row:raise StudyError('invalid_invitation',401)
            if not c.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',(row['edition_id'],row['actor_id'])).fetchone():
                raise StudyError('invalid_invitation',401)
            c.execute("UPDATE study_invitations SET state='used' WHERE id=?",(row['id'],))
            c.execute('INSERT INTO study_sessions VALUES(?,?,?)',(digest(session),row['actor_id'],self.clock()+3600))
        return session

    def allow_request(self, bucket, limit, window=60):
        """Persistent, bounded counters; caller supplies a hash, never raw tokens."""
        now=self.clock()
        with self.transaction() as c:
            self.lock_command(c, 'anonymous', 'rate.limit', bucket)
            c.execute('DELETE FROM study_rate_limits WHERE expires_at<=?',(now,))
            row=c.execute('SELECT * FROM study_rate_limits WHERE bucket=?',(bucket,)).fetchone()
            if row and row['attempts']>=limit:return False,max(1,int(row['expires_at']-now)+1)
            c.execute('INSERT INTO study_rate_limits VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=study_rate_limits.attempts+1',(bucket,now+window))
        return True,window

    def create_edition(self, principal, edition_id, capacity=10, price_minor=4900, *,
                       course_id='fisica-fluidi', pack_id='relazioni-fluidi-v1', pack_version=1):
        self._principal(principal)
        if principal.role != 'teacher':
            raise StudyError('forbidden', 403)
        if type(capacity) is not int or not 1 <= capacity <= 10 or type(price_minor) is not int or price_minor < 0:
            raise StudyError('invalid_edition')
        if not isinstance(edition_id, str) or not 1 <= len(edition_id) <= MAX_EDITION_IDENTIFIER_LENGTH:
            raise StudyError('invalid_edition')
        assert_pseudonymous(edition_id, 'edition_id')
        from .catalog import validate_binding
        binding = validate_binding(course_id, pack_id, pack_version)
        with self.transaction() as c:
            c.execute('INSERT INTO classes VALUES(?,?,?)', (edition_id, principal.id, binding['title']))
            c.execute('INSERT INTO study_editions(id,teacher_id,capacity,price_minor) VALUES(?,?,?,?)', (edition_id, principal.id, capacity, price_minor))
            c.execute('INSERT INTO study_edition_packs VALUES(?,?,?,?,?)',
                (edition_id, course_id, pack_id, pack_version, binding['packSha256']))
        return self.get_edition(edition_id)

    def get_edition(self, edition_id):
        row = self.connection.execute('SELECT * FROM study_editions WHERE id=?', (edition_id,)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        from .catalog import edition_pack
        return {**edition_pack(self, edition_id), 'id': row['id'], 'teacherId': row['teacher_id'], 'capacity': row['capacity'], 'priceMinor': row['price_minor'], 'state': row['state'], 'sessions': json.loads(row['sessions']), 'timezone': row['timezone']}

    def list_editions(self, principal, *, limit=50, after=None):
        """Discover only owned/member editions; decode only the bounded page."""
        self._principal(principal)
        if type(limit) is not int or not 1 <= limit <= 100:
            raise StudyError('invalid_edition_pagination')
        if after is not None and (not isinstance(after, str) or not 1 <= len(after) <= MAX_EDITION_CURSOR_LENGTH):
            raise StudyError('invalid_edition_pagination')
        if principal.role == 'teacher':
            query = 'SELECT e.id FROM study_editions e WHERE e.teacher_id=?'
        else:
            query = ('SELECT e.id FROM study_editions e JOIN study_members m ON m.edition_id=e.id '
                     'WHERE m.student_id=?')
        parameters = [principal.id]
        if after is not None:
            query += ' AND e.id>?'
            parameters.append(after)
        query += ' ORDER BY e.id LIMIT ?'
        rows = self.connection.execute(query, (*parameters, limit + 1)).fetchall()
        page = rows[:limit]
        cursor = page[-1]['id'] if len(rows) > limit else None
        if cursor is not None and len(cursor) > MAX_EDITION_CURSOR_LENGTH:
            raise StudyError('legacy_edition_identifier_requires_migration', 409)
        return {'items': [self.get_edition(row['id']) for row in page],
                'nextCursor': cursor}

    def _edition_access(self, principal, edition_id, teacher_only=False):
        self._principal(principal)
        edition = self.get_edition(edition_id)
        if principal.role == 'teacher' and edition['teacherId'] == principal.id:
            return edition
        if not teacher_only and principal.role == 'student' and self.connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?', (edition_id, principal.id)).fetchone():
            return edition
        raise StudyError('forbidden', 403)

    def add_test_member(self, principal, edition_id, student_id):
        """Seed/confirmation primitive; still checks real transaction capacity."""
        self._edition_access(principal, edition_id, teacher_only=True)
        with self.transaction() as c:
            self.lock_edition(c, edition_id)
            if c.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?', (edition_id, student_id)).fetchone():
                return
            count = c.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?', (edition_id,)).fetchone()[0]
            if count >= self.get_edition(edition_id)['capacity']:
                raise StudyError('group_full', 409)
            c.execute('INSERT INTO study_members VALUES(?,?)', (edition_id, student_id))
            c.execute('INSERT INTO enrollments VALUES(?,?,?)', (identifier(), edition_id, student_id))

    def _event(self, c, principal, kind, resource_id, payload):
        c.execute('INSERT INTO study_events(id,actor_id,kind,resource_id,payload,created_at) VALUES(?,?,?,?,?,?)', (identifier(), principal.id, kind, resource_id, canonical(payload), self.clock()))

    def create_resource(self, principal, edition_id, kind, text, visibility='private', *, key=None):
        self._edition_access(principal, edition_id)
        if not isinstance(text, str) or len(text) > 20_000 or not text.strip():
            raise StudyError('invalid_text')
        if visibility not in ('private', 'group') or visibility == 'group' and principal.role != 'teacher':
            raise StudyError('forbidden', 403)
        resource_id, revision_id, context_id = identifier(), identifier(), identifier()
        def apply(c):
            c.execute('INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)', (resource_id, edition_id, principal.id, kind, visibility, context_id, revision_id))
            c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)', (revision_id, resource_id, text, digest(text), self.clock()))
            return self.get_resource(principal, resource_id)
        if key is not None:
            from .transactions import transact
            return transact(self,principal,'resource.created',key,{'editionId':edition_id,'kind':kind,'text':text,'visibility':visibility},apply)
        with self.transaction() as c:
            resource=apply(c)
            self._event(c,principal,'resource.created',resource_id,{'revisionId':revision_id})
            return resource

    def get_resource(self, principal, resource_id):
        row = self.connection.execute('SELECT current_revision FROM study_resources WHERE id=? AND deleted=0', (resource_id,)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        return self.get_resource_revision(principal, resource_id, row['current_revision'])

    def _submitted_reference(self, edition_id, owner_id, reference_id, revision_id=None):
        """A committed submission grants only its explicit immutable references.

        Membership and possession of an object ID are never sharing decisions.
        Joining the receipt excludes incomplete/rolled-back submission attempts.
        """
        refs = 'source_refs' if revision_id is not None else 'asset_refs'
        query = f'''SELECT s.{refs} FROM study_submissions s
            JOIN study_receipts r ON r.id=s.receipt_id
            AND r.actor_id=s.student_id AND r.operation='submission.received'
            WHERE s.edition_id=? AND s.student_id=?'''
        for row in self.connection.execute(query, (edition_id, owner_id)):
            references = json.loads(row[0])
            if revision_id is None:
                if reference_id in references:
                    return True
            elif any(ref.get('resourceId') == reference_id and ref.get('revisionId') == revision_id for ref in references):
                return True
        return False

    def get_resource_revision(self, principal, resource_id, revision_id):
        self._principal(principal)
        row = self.connection.execute('SELECT r.*,v.id AS revision_id,v.text,v.sha256 FROM study_resources r JOIN study_revisions v ON v.resource_id=r.id WHERE r.id=? AND v.id=? AND r.deleted=0', (resource_id, revision_id)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        edition = self._edition_access(principal, row['edition_id'])
        owner = row['owner_id'] == principal.id
        published = row['visibility'] == 'group'
        submitted = edition['teacherId'] == principal.id and self._submitted_reference(row['edition_id'], row['owner_id'], resource_id, revision_id)
        if not (owner or published or submitted):
            raise StudyError('forbidden', 403)
        return {'id':row['id'], 'revisionId':row['revision_id'], 'contextId':row['context_id'], 'ownerId':row['owner_id'], 'editionId':row['edition_id'], 'kind':row['kind'], 'visibility':row['visibility'], 'text':row['text'], 'sha256':row['sha256']}
