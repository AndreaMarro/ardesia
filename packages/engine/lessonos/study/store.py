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


def _edition_view(row, descriptor):
    return {**descriptor, 'id': row['id'], 'teacherId': row['teacher_id'],
            'capacity': row['capacity'], 'priceMinor': row['price_minor'], 'state': row['state'],
            'sessions': json.loads(row['sessions']), 'timezone': row['timezone']}


class StudyStore:
    """Operator initialization is explicit; HTTP opens only a current existing DB.

    initialize=False never runs either legacy or Study schema migrations.
    """
    is_postgres = False

    def __init__(self, path: str | Path, clock=time.time, *, check_same_thread=True, initialize=True):
        self.path = Path(path)
        if not initialize and not self.path.is_file():
            raise StudyError('database_schema_not_ready',503)
        if initialize:self.path.parent.mkdir(parents=True, exist_ok=True)
        self.clock = clock
        with data_lock(self.path):
            if self.path.exists() and self.path.stat().st_size<100:
                raise StudyError('database_integrity_failure',503)
            self.legacy = SQLiteStore(str(self.path), check_same_thread=check_same_thread, initialize=initialize)
            self.connection = self.legacy._conn
            self.connection.execute('PRAGMA foreign_keys=ON')
            self.connection.execute('PRAGMA busy_timeout=5000')
            if initialize:self.connection.execute('PRAGMA journal_mode=WAL')
            present = self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_schema'").fetchone()
            if not present and self.connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name GLOB 'study_*' LIMIT 1"
            ).fetchone():
                self.close()
                raise StudyError('database_integrity_failure',503)
            if present:
                from .schema_contract import validate_schema, ADMIN_COLUMNS, APPROVAL_COLUMNS, EXAM_COLUMNS, QUESTION_REVIEW_COLUMNS
                from .scientific_notebook import NOTEBOOK_COLUMNS
                versions=self.connection.execute('SELECT version FROM study_schema').fetchall()
                tables={row[0] for row in self.connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
                columns={row[1] for row in self.connection.execute('PRAGMA table_info(study_editions)')}
                try:
                    validate_schema(versions[0][0] if len(versions)==1 else None,tables,columns,
                        {row[1] for row in self.connection.execute('PRAGMA table_info(study_holds)')},allow_upgrade=initialize,admin_columns={table:{row[1] for row in self.connection.execute(f'PRAGMA table_info({table})')} for table in ADMIN_COLUMNS},
                        notebook_columns={table:{row[1] for row in self.connection.execute(f'PRAGMA table_info({table})')} for table in NOTEBOOK_COLUMNS},
                        approval_columns={table:{row[1] for row in self.connection.execute(f'PRAGMA table_info({table})')} for table in APPROVAL_COLUMNS},
                        exam_columns={table:{row[1] for row in self.connection.execute(f'PRAGMA table_info({table})')} for table in EXAM_COLUMNS},
                        question_review_columns={table:{row[1] for row in self.connection.execute(f'PRAGMA table_info({table})')} for table in QUESTION_REVIEW_COLUMNS})
                    if initialize and versions[0][0] < 6 and self.connection.execute(
                            "SELECT 1 FROM study_resources WHERE kind='scientific-notebook' LIMIT 1").fetchone():
                        raise StudyError('notebook_kind_migration_conflict',503)
                except BaseException:
                    self.close()
                    raise
            if not initialize:
                from lessonos.store.sqlite import SCHEMA_VERSION
                if not present or self.connection.execute('PRAGMA user_version').fetchone()[0]!=SCHEMA_VERSION:
                    self.close()
                    raise StudyError('database_schema_not_ready',503)
                return
            editions_present = self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_editions'").fetchone()
            if editions_present:
                columns={row[1] for row in self.connection.execute('PRAGMA table_info(study_editions)')}
                if 'management_revision' not in columns:
                    if present and self.connection.execute('SELECT version FROM study_schema').fetchone()[0] >= 4:
                        self.close()
                        raise StudyError('database_integrity_failure',503)
                    self.connection.execute('ALTER TABLE study_editions ADD COLUMN management_revision INTEGER NOT NULL DEFAULT 0 CHECK(management_revision>=0)')
                    self.connection.commit()
            if self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_holds'").fetchone():
                if 'offer_revision' not in {row[1] for row in self.connection.execute('PRAGMA table_info(study_holds)')}:
                    self.connection.execute('ALTER TABLE study_holds ADD COLUMN offer_revision INTEGER CHECK(offer_revision>=0)')
                    self.connection.commit()
            catalog_present = self.connection.execute("SELECT 1 FROM sqlite_master WHERE name='study_edition_packs'").fetchone()
            if present:
                schema_version = self.connection.execute('SELECT version FROM study_schema').fetchone()[0]
                exam_columns = {row[1] for row in self.connection.execute('PRAGMA table_info(study_exam_attempts)')}
                if schema_version in (7,8) and exam_columns and 'answer_revision' not in exam_columns:
                    self.connection.execute(
                        'ALTER TABLE study_exam_attempts ADD COLUMN answer_revision INTEGER NOT NULL DEFAULT 0 CHECK(answer_revision>=0)')
                    self.connection.execute('UPDATE study_schema SET version=9 WHERE version=8')
                    self.connection.commit()
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

    def _insert_edition(self, c, principal, edition_id, capacity=10, price_minor=4900, *,
                        course_id='fisica-fluidi', pack_id='relazioni-fluidi-v1', pack_version=1,
                        initial_state='collecting'):
        self._principal(principal)
        if principal.role != 'teacher':
            raise StudyError('forbidden', 403)
        if type(capacity) is not int or not 1 <= capacity <= 10 or type(price_minor) is not int or price_minor < 0:
            raise StudyError('invalid_edition')
        if initial_state not in ('collecting','draft'):
            raise StudyError('invalid_edition')
        if not isinstance(edition_id, str) or not 1 <= len(edition_id) <= MAX_EDITION_IDENTIFIER_LENGTH:
            raise StudyError('invalid_edition')
        assert_pseudonymous(edition_id, 'edition_id')
        from .catalog import validate_binding
        binding = validate_binding(course_id, pack_id, pack_version)
        c.execute('INSERT INTO classes VALUES(?,?,?)', (edition_id, principal.id, binding['title']))
        c.execute('INSERT INTO study_editions(id,teacher_id,capacity,price_minor,state) VALUES(?,?,?,?,?)',
                  (edition_id, principal.id, capacity, price_minor, initial_state))
        c.execute('INSERT INTO study_edition_packs VALUES(?,?,?,?,?)',
                  (edition_id, course_id, pack_id, pack_version, binding['packSha256']))
        return self.get_edition(edition_id)

    def create_edition(self, principal, edition_id, capacity=10, price_minor=4900, *,
                       course_id='fisica-fluidi', pack_id='relazioni-fluidi-v1', pack_version=1):
        # Existing direct callers collect interest. HTTP management explicitly
        # chooses draft; neither state can reserve a seat before an offer.
        with self.transaction() as c:
            return self._insert_edition(c,principal,edition_id,capacity,price_minor,
                course_id=course_id,pack_id=pack_id,pack_version=pack_version)

    def get_edition(self, edition_id, *, allow_unavailable=False):
        row = self.connection.execute('SELECT * FROM study_editions WHERE id=?', (edition_id,)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        from .catalog import edition_pack, readable_descriptor
        if allow_unavailable:
            pin = self.connection.execute('SELECT * FROM study_edition_packs WHERE edition_id=?', (edition_id,)).fetchone()
            return _edition_view(row, readable_descriptor(pin))
        return _edition_view(row, edition_pack(self, edition_id))

    def list_editions(self, principal, *, limit=50, after=None, edition_id=None):
        """Discover only owned/member editions; decode only the bounded page."""
        self._principal(principal)
        if type(limit) is not int or not 1 <= limit <= 100:
            raise StudyError('invalid_edition_pagination')
        if after is not None and (not isinstance(after, str) or not 1 <= len(after) <= MAX_EDITION_CURSOR_LENGTH):
            raise StudyError('invalid_edition_pagination')
        if edition_id is not None and (not isinstance(edition_id, str) or
                not 1 <= len(edition_id) <= MAX_EDITION_CURSOR_LENGTH or after is not None):
            raise StudyError('invalid_edition_pagination')
        query = ('SELECT e.id,e.teacher_id,e.capacity,e.price_minor,e.state,e.sessions,e.timezone,'
                 'p.course_id,p.pack_id,p.pack_version,p.pack_sha256 FROM study_editions e '
                 'LEFT JOIN study_edition_packs p ON p.edition_id=e.id ')
        # A LEFT JOIN keeps an authorized row with a missing pin in the page,
        # so validation fails closed instead of silently omitting that edition.
        if principal.role == 'teacher':
            query += 'WHERE e.teacher_id=?'
        else:
            query += 'JOIN study_members m ON m.edition_id=e.id WHERE m.student_id=?'
        parameters = [principal.id]
        if edition_id is not None:
            query += ' AND e.id=?'
            parameters.append(edition_id)
        if after is not None:
            query += ' AND e.id>?'
            parameters.append(after)
        query += ' ORDER BY e.id LIMIT ?'
        rows = self.connection.execute(query, (*parameters, 1 if edition_id is not None else limit + 1)).fetchall()
        page = rows[:limit]
        cursor = page[-1]['id'] if edition_id is None and len(rows) > limit else None
        if cursor is not None and len(cursor) > MAX_EDITION_CURSOR_LENGTH:
            raise StudyError('legacy_edition_identifier_requires_migration', 409)
        from .catalog import readable_descriptor
        descriptors = {}
        return {'items': [_edition_view(row, readable_descriptor(row, descriptors=descriptors)) for row in page],
                'nextCursor': cursor}

    def _edition_access(self, principal, edition_id, teacher_only=False, *, allow_unavailable=False):
        self._principal(principal)
        edition = self.get_edition(edition_id, allow_unavailable=allow_unavailable)
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
        if kind == 'scientific-notebook':
            raise StudyError('notebook_command_required')
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

    def get_resource(self, principal, resource_id, *, allow_unavailable=False):
        row = self.connection.execute('SELECT current_revision FROM study_resources WHERE id=? AND deleted=0', (resource_id,)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        return self.get_resource_revision(principal, resource_id, row['current_revision'], allow_unavailable=allow_unavailable)

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

    def get_resource_revision(self, principal, resource_id, revision_id, *, allow_unavailable=False):
        self._principal(principal)
        row = self.connection.execute('SELECT r.*,v.id AS revision_id,v.text,v.sha256 FROM study_resources r JOIN study_revisions v ON v.resource_id=r.id WHERE r.id=? AND v.id=? AND r.deleted=0', (resource_id, revision_id)).fetchone()
        if row is None:
            raise StudyError('not_found', 404)
        edition = self._edition_access(principal, row['edition_id'], allow_unavailable=allow_unavailable)
        owner = row['owner_id'] == principal.id
        published = row['visibility'] == 'group'
        submitted = edition['teacherId'] == principal.id and self._submitted_reference(row['edition_id'], row['owner_id'], resource_id, revision_id)
        if not (owner or published or submitted):
            raise StudyError('forbidden', 403)
        resource = {'id':row['id'], 'revisionId':row['revision_id'], 'contextId':row['context_id'], 'ownerId':row['owner_id'], 'editionId':row['edition_id'], 'kind':row['kind'], 'visibility':row['visibility'], 'text':row['text'], 'sha256':row['sha256']}
        if row['kind'] == 'scientific-notebook':
            from .scientific_notebook import read_snapshot
            resource['notebook'] = read_snapshot(self, resource)
        return resource
