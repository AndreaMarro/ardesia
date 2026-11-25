"""Install immutable discipline editions inside the existing notebook transaction."""
import hashlib
import json

from .discipline_pack import PHYSICS, fields, load_pack
from ..domain.errors import require
from ..domain.identity import encode

SCHEMA = (
    """CREATE TABLE IF NOT EXISTS discipline_editions(
        discipline TEXT NOT NULL, version TEXT NOT NULL, digest TEXT NOT NULL, catalog TEXT NOT NULL, revision INTEGER NOT NULL,
        UNIQUE(discipline,revision),
        PRIMARY KEY(discipline,version))""",
    """CREATE TABLE IF NOT EXISTS discipline_active(
        discipline TEXT PRIMARY KEY NOT NULL, version TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('preview','published')),
        FOREIGN KEY(discipline,version) REFERENCES discipline_editions(discipline,version))""",
    """CREATE TABLE IF NOT EXISTS discipline_units(
        discipline TEXT NOT NULL, version TEXT NOT NULL, unit TEXT NOT NULL, course TEXT NOT NULL, payload TEXT NOT NULL,
        PRIMARY KEY(discipline,version,unit), FOREIGN KEY(discipline,version) REFERENCES discipline_editions(discipline,version))""",
    """CREATE TABLE IF NOT EXISTS discipline_events(
        seq INTEGER PRIMARY KEY, user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, request_id TEXT NOT NULL,
        discipline TEXT NOT NULL, version TEXT NOT NULL, unit TEXT NOT NULL, activity TEXT, skill TEXT NOT NULL,
        kind TEXT NOT NULL, request TEXT NOT NULL, correct INTEGER, assisted INTEGER, transfer INTEGER, retention INTEGER,
        stamp INTEGER NOT NULL, UNIQUE(user,discipline,request_id),
        FOREIGN KEY(discipline,version,unit) REFERENCES discipline_units(discipline,version,unit))""",
    "CREATE INDEX IF NOT EXISTS discipline_history ON discipline_events(user,discipline,seq)",
    "CREATE INDEX IF NOT EXISTS discipline_practice ON discipline_events(user,discipline,activity,kind)",
)


def install(db, catalog_path, status="preview", activate=False):
    require(db.in_transaction, "Installare il pacchetto in una transazione di scrittura.")
    require(status in ("preview", "published"), "Stato non valido.")
    catalog, units = load_pack(catalog_path)
    discipline, version = catalog["id"], catalog["version"]
    signature = hashlib.sha256(encode([catalog, units]).encode()).hexdigest()
    for sql in SCHEMA:
        db.execute(sql)
    current = db.execute("SELECT version,status FROM discipline_active WHERE discipline=?", (discipline,)).fetchone()
    previous = db.execute("SELECT digest FROM discipline_editions WHERE discipline=? AND version=?",
                          (discipline, version)).fetchone()
    if previous:
        require(previous[0] == signature, "La stessa versione identifica contenuti diversi.", 409)
        require(activate or not current or tuple(current) == (version, status),
                "Per riattivare un’edizione archiviata o variarne la visibilità occorre una scelta esplicita.", 409)
        if current and tuple(current) == (version, status):
            return {"id": discipline, "version": version, "sha256": signature, "changed": False}
    else:
        revision = db.execute("SELECT COALESCE(MAX(revision),0)+1 FROM discipline_editions WHERE discipline=?", (discipline,)).fetchone()[0]
        db.execute("INSERT INTO discipline_editions VALUES(?,?,?,?,?)", (discipline, version, signature, encode(catalog), revision))
        for key, unit in units.items():
            db.execute("INSERT INTO discipline_units VALUES(?,?,?,?,?)",
                       (discipline, version, key, unit["courseId"], encode(unit)))
    db.execute("INSERT INTO discipline_active VALUES(?,?,?) ON CONFLICT(discipline) DO UPDATE SET version=excluded.version,status=excluded.status",
               (discipline, version, status))
    return {"id": discipline, "version": version, "sha256": signature, "changed": True}


def installed(db):
    return bool(db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='discipline_active'").fetchone())


def current(db, discipline):
    if installed(db):
        row = db.execute("SELECT e.catalog,a.status FROM discipline_active a JOIN discipline_editions e USING(discipline,version) "
                         "WHERE a.discipline=?", (discipline,)).fetchone()
        if row:
            return dict(json.loads(row[0]), status=row[1])
    return None


def editions(db):
    if not installed(db):
        return []
    return [dict(json.loads(r[0]), status=r[1]) for r in db.execute(
        "SELECT e.catalog,a.status FROM discipline_active a JOIN discipline_editions e USING(discipline,version) ORDER BY a.discipline")]


def get_unit(db, discipline, version, unit_id):
    row = db.execute("SELECT payload FROM discipline_units WHERE discipline=? AND version=? AND unit=?",
                     (discipline, version, unit_id)).fetchone()
    require(row, "Unità non disponibile.", 404)
    return json.loads(row[0])


def order_key(discipline, course):
    return f"D~{discipline}~{course}"


def sale_courses(db):
    return [dict(id=order_key(pack["id"], c["id"]), kind="course", title=c["title"],
                 summary=c.get("summary", ""), disciplineRoute=f"disciplina/{pack['id']}/{c['id']}")
            for pack in editions(db) if pack["status"] == "published" for c in pack["courses"]]


def visible(pack, user, review_local):
    return pack["status"] == "published" or review_local or bool(user and user["role"] == "autore")


def access_keys(db, user, mode):
    if not user:
        return set()
    return {r[0] for r in db.execute("SELECT course FROM access WHERE user=? AND mode=?", (user["id"], mode))}


def can_study(pack, course, user, mode, grants, review_local):
    if not user:
        return False
    if user["role"] == "autore":
        return True
    if pack["status"] == "preview":
        return review_local and mode == "verifica"
    return ((user["role"] == "lettore" and mode == "verifica")
            or order_key(pack["id"], course) in grants)


def physics(db):
    # Load the published course heads from the existing publication authority on every read.
    rows = db.execute("SELECT payload FROM versions JOIN heads USING(id) WHERE v=live AND json_extract(payload,'$.kind')='course'")
    courses = sorted((json.loads(row[0]) for row in rows), key=lambda course: course["order"])
    return {"id": PHYSICS, "title": "Fisica per Medicina", "summary": "I percorsi, le simulazioni e i quaderni di Fisica.",
            "route": "percorsi", "coursesCount": len(courses), "courses": [fields(c, "id", "title", "summary") for c in courses]}
