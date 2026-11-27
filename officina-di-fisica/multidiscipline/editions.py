"""Install immutable discipline editions inside the existing notebook transaction."""
import hashlib
import json

from .pack import PHYSICS, fields, load_pack
from server.domain.errors import require
from server.domain.identity import encode

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


# Rebuildable projection of the append-only evidence, maintained in the writer transaction.
STATS = """CREATE TABLE discipline_skill_stats(
    user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, discipline TEXT NOT NULL, skill TEXT NOT NULL,
    exposures INTEGER, completions INTEGER, assisted INTEGER, independent INTEGER, transfer INTEGER,
    retention INTEGER, errors INTEGER, lastIndependent INTEGER, lastError INTEGER, lastSuccess INTEGER,
    PRIMARY KEY(user,discipline,skill))"""
BACKFILL = """INSERT INTO discipline_skill_stats
    SELECT user,discipline,skill,SUM(kind='open'),COUNT(DISTINCT CASE WHEN kind='complete' THEN unit END),
    SUM(CASE WHEN correct AND assisted THEN 1 ELSE 0 END),SUM(CASE WHEN correct AND NOT assisted THEN 1 ELSE 0 END),
    COALESCE(SUM(transfer),0),COALESCE(SUM(retention),0),SUM(CASE WHEN correct=0 THEN 1 ELSE 0 END),
    MAX(CASE WHEN correct AND NOT assisted THEN stamp END), MAX(CASE WHEN correct=0 THEN seq END),
    MAX(CASE WHEN correct AND NOT assisted THEN seq END)
    FROM discipline_events GROUP BY user,discipline,skill"""
ON_EVIDENCE = """CREATE TRIGGER discipline_project_evidence AFTER INSERT ON discipline_events BEGIN
    INSERT INTO discipline_skill_stats VALUES (
        NEW.user, NEW.discipline, NEW.skill, NEW.kind='open',
        NEW.kind='complete' AND NOT EXISTS (
            SELECT 1 FROM discipline_events WHERE user=NEW.user AND discipline=NEW.discipline
            AND unit=NEW.unit AND kind='complete' AND seq<NEW.seq),
        COALESCE(NEW.correct AND NEW.assisted,0), COALESCE(NEW.correct AND NOT NEW.assisted,0),
        COALESCE(NEW.transfer,0), COALESCE(NEW.retention,0), COALESCE(NEW.correct=0,0),
        CASE WHEN NEW.correct AND NOT NEW.assisted THEN NEW.stamp END,
        CASE WHEN NEW.correct=0 THEN NEW.seq END, CASE WHEN NEW.correct AND NOT NEW.assisted THEN NEW.seq END)
    ON CONFLICT(user,discipline,skill) DO UPDATE SET exposures=exposures+excluded.exposures,
        completions=completions+excluded.completions, assisted=assisted+excluded.assisted,
        independent=independent+excluded.independent, transfer=transfer+excluded.transfer,
        retention=retention+excluded.retention, errors=errors+excluded.errors,
        lastIndependent=CASE WHEN excluded.lastIndependent IS NULL THEN lastIndependent
            WHEN lastIndependent IS NULL THEN excluded.lastIndependent ELSE MAX(lastIndependent,excluded.lastIndependent) END,
        lastError=COALESCE(excluded.lastError,lastError), lastSuccess=COALESCE(excluded.lastSuccess,lastSuccess);
END"""


def prepare_stats(db):
    db.execute("CREATE INDEX IF NOT EXISTS discipline_independent ON discipline_events(user,discipline,skill,seq) "
               "WHERE kind='answer' AND correct=1 AND assisted=0")
    if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='discipline_skill_stats'").fetchone():
        return
    db.execute("CREATE INDEX IF NOT EXISTS discipline_completions ON discipline_events(user,discipline,unit) WHERE kind='complete'")
    db.execute("CREATE INDEX IF NOT EXISTS discipline_seen ON discipline_events(user,discipline,activity) WHERE kind IN ('answer','hint')")
    db.execute(STATS)
    db.execute(BACKFILL)
    db.execute(ON_EVIDENCE)


def stable_ids(db, discipline, units):
    current = {a["id"]: u["id"] for u in units.values() for a in u["activities"]}
    activities = {a["id"]: a for u in units.values() for a in u["activities"]}
    for row in db.execute("SELECT payload FROM discipline_units WHERE discipline=?", (discipline,)):
        old = json.loads(row[0])
        if old["id"] in units:
            new = units[old["id"]]
            require((new["courseId"], new["skillId"]) == (old["courseId"], old["skillId"]),
                    "Un’unità che cambia microcorso o competenza richiede un nuovo ID.", 409)
        for item in old["activities"]:
            require(current.get(item["id"], old["id"]) == old["id"], "Un quesito trasferito a un’altra unità richiede un nuovo ID.",409)
            if item.get("familyId") and item["id"] in activities:
                require(activities[item["id"]].get("familyId") == item["familyId"],
                        "Un quesito che cambia famiglia richiede un nuovo ID.", 409)


def install(db, catalog_path, status="preview", activate=False):
    require(db.in_transaction, "Installare il pacchetto in una transazione di scrittura.")
    require(status in ("preview", "published"), "Stato non valido.")
    catalog, units = load_pack(catalog_path)
    discipline, version = catalog["id"], catalog["version"]
    signature = hashlib.sha256(encode([catalog, units]).encode()).hexdigest()
    for sql in SCHEMA:
        db.execute(sql)
    prepare_stats(db)
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
        stable_ids(db, discipline, units)
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
