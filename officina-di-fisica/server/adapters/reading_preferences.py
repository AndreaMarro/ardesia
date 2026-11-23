"""Account-bound reader settings. The HTTP writer already holds BEGIN IMMEDIATE."""
import json
import sqlite3

from .contracts import schema, validate
from ..domain.errors import require


def defaults() -> dict:
    return {key: field["default"] for key, field in schema("reading-preferences-v1")["properties"].items()}


def read(db: sqlite3.Connection, user_id: str | None) -> dict:
    profile = defaults()
    if user_id is not None:
        row = db.execute("SELECT preferences FROM reading_preferences WHERE user=?", (user_id,)).fetchone()
        if row:
            profile.update(json.loads(row[0]))
    return profile


def update(db: sqlite3.Connection, user_id: str, changes: dict) -> dict:
    initial = defaults()
    if set(changes) == {"reset"} and changes["reset"] is True:
        profile = initial
    else:
        require(bool(changes), "Scegli una preferenza da modificare.")
        profile = {**read(db, user_id), **changes}
        validate(profile, schema("reading-preferences-v1"))
    if profile == initial:
        db.execute("DELETE FROM reading_preferences WHERE user=?", (user_id,))
    else:
        db.execute(
            "INSERT INTO reading_preferences(user,preferences) VALUES(?,?) "
            "ON CONFLICT(user) DO UPDATE SET preferences=excluded.preferences",
            (user_id, json.dumps(profile, separators=(",", ":"))),
        )
    return profile
