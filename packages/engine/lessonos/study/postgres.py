"""PostgreSQL persistence adapter for the existing, single Study Core.

The adapter translates parameter markers and two historical SQLite spellings;
domain commands, receipts, diary projection and authorization stay shared.
Migrations are explicit administrative operations, never request side effects.
"""
from collections.abc import Mapping
from contextlib import contextmanager
import json
from pathlib import Path
import re
import time

from lessonos.models.entities import Segment
from .models import StudyError
from .store import StudyStore


def postgres_sql(statement):
    def json_path(match):
        path = match.group(1).split('.')
        if len(path) == 1:
            return f"(payload::jsonb ->> '{path[0]}')"
        return "(payload::jsonb #>> '{" + ','.join(path) + "}')"
    statement = re.sub(r"json_extract\(payload,'\$\.([A-Za-z][A-Za-z0-9_.]*)'\)", json_path, statement)
    ignore = bool(re.match(r'INSERT OR IGNORE\b', statement, re.I))
    if ignore:
        statement = re.sub(r'^INSERT OR IGNORE\b', 'INSERT', statement, flags=re.I)
        statement = statement.rstrip().rstrip(';') + ' ON CONFLICT DO NOTHING'
    # qmark is a parameter only outside SQL string literals/quoted identifiers.
    result = []
    quote = None
    index = 0
    while index < len(statement):
        char = statement[index]
        if quote:
            result.append(char)
            if char == quote:
                if index + 1 < len(statement) and statement[index + 1] == quote:
                    index += 1
                    result.append(statement[index])
                else:
                    quote = None
        elif char in ("'", '"'):
            quote = char
            result.append(char)
        else:
            result.append('%s' if char == '?' else char)
        index += 1
    return ''.join(result)


class Record(Mapping):
    """Preserve the existing Core's named and positional row access."""
    def __init__(self, values):
        self._values = values
        self._ordered = tuple(values.values())

    def __getitem__(self, key):
        return self._ordered[key] if isinstance(key, (int, slice)) else self._values[key]

    def __iter__(self):
        return iter(self._values)

    def __len__(self):
        return len(self._values)


class Rows:
    def __init__(self, cursor):
        self.cursor = cursor

    def fetchone(self):
        row = self.cursor.fetchone()
        return Record(row) if row is not None else None

    def fetchall(self):
        return [Record(row) for row in self.cursor.fetchall()]

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def __iter__(self):
        for row in self.cursor:
            yield Record(row)


class Connection:
    def __init__(self, raw):
        self.raw = raw

    def execute(self, statement, parameters=None):
        return Rows(self.raw.execute(postgres_sql(statement), parameters))


class LegacyProjection:
    """Read the canonical legacy table; never maintain a second projection DB."""
    def __init__(self, connection):
        self.connection = connection

    def get_segment(self, segment_id):
        row = self.connection.execute('SELECT * FROM segments WHERE seg_id=?', (segment_id,)).fetchone()
        return Segment(seg_id=row['seg_id'], lesson_id=row['lesson_id'], start=row['start'],
            end=row['end'], text=row['text']) if row else None


def migrate(database_url):
    import psycopg
    root = Path(__file__).resolve().parents[4]
    with psycopg.connect(database_url, autocommit=True) as connection:
        connection.execute('CREATE SCHEMA IF NOT EXISTS ardesia_private')
        connection.execute('CREATE TABLE IF NOT EXISTS ardesia_private.migrations(name TEXT PRIMARY KEY)')
        for migration in sorted((root / 'supabase/migrations').glob('*.sql')):
            if connection.execute('SELECT 1 FROM ardesia_private.migrations WHERE name=%s', (migration.name,)).fetchone():
                continue
            with connection.transaction():
                connection.execute(migration.read_text())
                connection.execute('INSERT INTO ardesia_private.migrations VALUES(%s)', (migration.name,))


class PostgresStudyStore(StudyStore):
    def __init__(self, database_url, data_directory, *, clock=None,
                 administrative=False, auth_user_id=None, auth_session_id=None):
        import psycopg
        from psycopg.rows import dict_row
        self.path = Path(data_directory) / 'postgres.lock'
        self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        self._raw = psycopg.connect(database_url, autocommit=True, row_factory=dict_row)
        self.connection = Connection(self._raw)
        self.clock = clock or self.database_clock
        self.legacy = LegacyProjection(self.connection)
        self._administrative = administrative
        if not administrative:
            claims = {'role': 'authenticated'}
            if auth_user_id:
                claims['sub'] = str(auth_user_id)
            if auth_session_id:
                claims['session_id'] = str(auth_session_id)
            self._raw.execute("SELECT set_config('request.jwt.claims', %s, false)", (json.dumps(claims),))
            self._raw.execute('SET ROLE ardesia_app')
        # A missing migration is a named availability boundary, never a later
        # KeyError/partially reconstructed canonical table. Do not repair PG.
        try:
            from .schema_contract import validate_schema, ADMIN_COLUMNS
            from .scientific_notebook import NOTEBOOK_COLUMNS
            tables={row[0] for row in self.connection.execute("SELECT tablename FROM pg_tables WHERE schemaname='public'")}
            columns={row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='study_editions'")}
            hold_columns={row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='study_holds'")}
            admin_columns={table:{row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=?",(table,))} for table in ADMIN_COLUMNS}
            notebook_columns={table:{row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=?",(table,))} for table in NOTEBOOK_COLUMNS}
            if 'study_schema' not in tables:
                validate_schema(None,tables,columns,hold_columns)
            versions=self.connection.execute('SELECT version FROM study_schema').fetchall()
            validate_schema(versions[0][0] if len(versions)==1 else None,tables,columns,hold_columns,admin_columns=admin_columns,notebook_columns=notebook_columns)
        except BaseException:
            self.close()
            raise


    def close(self):
        self._raw.close()

    def database_clock(self):
        return float(self._raw.execute('SELECT extract(epoch FROM clock_timestamp()) AS now').fetchone()['now'])

    def lock_aggregate(self, connection, namespace, aggregate_id):
        connection.execute('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))',
            (json.dumps([namespace, aggregate_id]),))

    @contextmanager
    def transaction(self):
        from psycopg.pq import TransactionStatus
        if self._raw.info.transaction_status != TransactionStatus.IDLE:
            raise RuntimeError('nested study transaction')
        with self._raw.transaction():
            yield self.connection

    def lock_command(self, connection, actor_id, operation, key):
        self.lock_aggregate(connection, 'command', [actor_id, operation, key])

    def lock_edition(self, connection, edition_id):
        connection.execute('SELECT id FROM study_editions WHERE id=? FOR UPDATE', (edition_id,))

    def lock_teacher(self, connection, teacher_id):
        connection.execute('SELECT teacher_id FROM teachers WHERE teacher_id=? FOR UPDATE', (teacher_id,))

    def backup(self, target):
        raise StudyError('postgres_backup_requires_pg_dump', 503)
