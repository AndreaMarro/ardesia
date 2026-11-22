"""Apply numbered migrations inside the installation's existing SQLite transaction."""
import sqlite3
from collections.abc import Sequence


def migrate(db: sqlite3.Connection, scripts: Sequence[str]) -> None:
    if not db.in_transaction:
        raise RuntimeError("La migrazione richiede una transazione esclusiva di scrittura.")
    version = db.execute("PRAGMA user_version").fetchone()[0]
    if version > len(scripts):
        raise RuntimeError("L'archivio appartiene a una versione più recente.")
    for number, script in enumerate(scripts[version:], start=version + 1):
        statement = ""
        for char in script:
            statement += char
            if char == ";" and sqlite3.complete_statement(statement):
                db.execute(statement)
                statement = ""
        if statement.strip():
            raise ValueError("Migrazione SQL incompleta.")
        db.execute(f"PRAGMA user_version={number}")
