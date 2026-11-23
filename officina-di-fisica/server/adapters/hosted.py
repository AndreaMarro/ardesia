"""Durable libSQL primary and synchronized SQLite read transactions on Vercel."""
import os
import sqlite3
import tempfile
import time
import threading
from pathlib import Path

_replication = threading.Lock()
_replica = None
_replica_path = None


def enabled():
    return os.environ.get("ASTRA_HOSTED") == "1"


def credentials():
    url, token = os.environ["TURSO_DATABASE_URL"], os.environ["TURSO_AUTH_TOKEN"]
    if not url.startswith("libsql://") or not token:
        raise RuntimeError("Archivio remoto non configurato.")
    return url, token


class NamedRow(tuple):
    def __new__(cls, values, columns):
        row = super().__new__(cls, values)
        row.columns = columns
        return row

    def keys(self):
        return self.columns.keys()

    def __getitem__(self, key):
        return super().__getitem__(self.columns[key] if isinstance(key, str) else key)


class Cursor:
    def __init__(self, cursor):
        self.cursor = cursor
        self.columns = {col[0]: i for i, col in enumerate(cursor.description or ())}

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def fetchone(self):
        values = self.cursor.fetchone()
        return NamedRow(values, self.columns) if values is not None else None

    def __iter__(self):
        return (NamedRow(row, self.columns) for row in self.cursor.fetchall())

    def fetchall(self):
        return list(self)


class Primary:
    def __init__(self):
        import libsql
        url, token = credentials()
        self.connection = libsql.connect(url, auth_token=token, isolation_level="DEFERRED")
        self.connection.execute("PRAGMA foreign_keys=ON")

    def execute(self, sql, values=()):
        # Turso reserves PRAGMA user_version. Keep the same migration number in the durable archive.
        if sql == "PRAGMA user_version":
            sql = "SELECT CAST(value AS INTEGER) FROM settings WHERE key='hosted_schema'"
        elif sql.startswith("PRAGMA user_version="):
            values = (str(int(sql.split("=", 1)[1])),)
            sql = "INSERT OR REPLACE INTO settings VALUES('hosted_schema',?)"
        for attempt in range(4):
            try:
                return Cursor(self.connection.execute(sql, tuple(values)))
            except ValueError as exc:
                detail = str(exc).lower()
                busy = any(word in detail for word in ("locked", "busy", "transaction timeout", "transaction timed out"))
                if sql == "BEGIN IMMEDIATE" and busy and attempt < 3:
                    time.sleep(0.06 * (2 ** attempt))
                    continue
                if busy:
                    from ..domain.errors import Problem
                    raise Problem("Archivio occupato. Riprova tra un momento.", 503) from exc
                raise RuntimeError("Operazione sull’archivio remoto interrotta.") from exc

    @property
    def in_transaction(self):
        return self.connection.in_transaction

    def commit(self):
        self.connection.commit()

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, kind, value, traceback):
        try:
            if self.in_transaction:
                if kind is None:
                    self.commit()
                else:
                    try:
                        self.connection.rollback()
                    except ValueError:
                        # A primary timeout already rolls back. Preserve the error that interrupted the request.
                        pass
        finally:
            self.close()


def reader(connection_factory):
    import libsql
    global _replica, _replica_path
    with _replication:
        if _replica is None:
            url, token = credentials()
            directory = Path(tempfile.mkdtemp(prefix="officina-replica-"))
            _replica_path = directory / "quaderni.sqlite3"
            _replica = libsql.connect(str(_replica_path), sync_url=url, auth_token=token)
        # A revocation or a logout on another instance must be visible before an authorized read.
        # Failure propagates. Serving the last cached authorization would disclose private work.
        _replica.sync()
        db = sqlite3.connect(_replica_path.as_uri() + "?mode=ro", uri=True, timeout=10, factory=connection_factory)
        db.row_factory = sqlite3.Row
        return db


FILES_SCHEMA = """CREATE TABLE IF NOT EXISTS hosted_file_parts (
    name TEXT NOT NULL, part INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY(name,part)
)"""


def save_bytes(db, name, data):
    # Assets and PDF editions are immutable. The enclosing transaction publishes every part together.
    if db.execute("SELECT 1 FROM hosted_file_parts WHERE name=? LIMIT 1", (name,)).fetchone():
        return
    size = 192 * 1024
    for i in range(0, len(data), size):
        db.execute("INSERT INTO hosted_file_parts VALUES(?,?,?)", (name, i // size, data[i:i+size]))


def load_bytes(db, name):
    parts = db.execute("SELECT data FROM hosted_file_parts WHERE name=? ORDER BY part", (name,))
    return b"".join(row[0] for row in parts)
