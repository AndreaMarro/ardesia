"""Reopenable resource cases and small curated collections in the existing notebook.

These are user documents, not learning evidence or a publication authority. Every
open rechecks the current publication and access rules; a share token never grants
access to a protected resource. The first supported instrument is Poiseuille.
"""
import hashlib
import json
import math
import re
import secrets
from pathlib import Path

from server import store
from server.domain.errors import Problem, require
from server.domain.identity import encode, need_user, safe_key

SCHEMA_NAME = "cric.resource-case/1"
ROOT = Path(__file__).resolve().parents[1]
RESOURCE_ID = "LAB3D-04"
VIEWS = ("orbit", "top", "side", "diagram")
PARAMETERS = (
    {"key": "mode", "label": "Regolazione della pompa", "options": [["pressure", "Pressione fissata"], ["flow", "Portata fissata"]], "value": "pressure"},
    {"key": "r", "label": "Raggio interno R", "unit": "mm", "min": .5, "max": 4, "step": .1, "value": 1.5},
    {"key": "probe", "label": "Posizione della sonda r/R", "unit": "", "min": 0, "max": 1, "step": .05, "value": .5},
    {"key": "mu", "label": "Viscosità μ", "unit": "mPa·s", "min": 1, "max": 12, "step": .5, "value": 4},
    {"key": "length", "label": "Lunghezza L", "unit": "cm", "min": 5, "max": 50, "step": 1, "value": 20},
    {"key": "dp", "label": "Caduta di pressione Δp", "unit": "Pa", "min": 5, "max": 500, "step": 5, "value": 80},
    {"key": "flow", "label": "Portata imposta Q", "unit": "mL/s", "min": .1, "max": 12, "step": .1, "value": 1},
)
SCHEMA = (
    """CREATE TABLE IF NOT EXISTS resource_case_documents(
        id TEXT PRIMARY KEY, user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        request_id TEXT NOT NULL, request TEXT NOT NULL, title TEXT NOT NULL, note TEXT NOT NULL,
        payload TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE(user,request_id))""",
    """CREATE TABLE IF NOT EXISTS resource_collections(
        id TEXT PRIMARY KEY, user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        request_id TEXT NOT NULL, request TEXT NOT NULL, title TEXT NOT NULL, note TEXT NOT NULL,
        case_ids TEXT NOT NULL, revision INTEGER NOT NULL, share_token TEXT UNIQUE,
        created INTEGER NOT NULL, updated INTEGER NOT NULL, UNIQUE(user,request_id))""",
    "CREATE INDEX IF NOT EXISTS resource_cases_owner ON resource_case_documents(user,created)",
    "CREATE INDEX IF NOT EXISTS resource_collections_owner ON resource_collections(user,updated)",
)


def _fields(value, required, optional=()):
    require(isinstance(value, dict), "Oggetto JSON richiesto.")
    require(set(required).issubset(value) and not set(value).difference((*required, *optional)),
            "Campi del caso o della raccolta non validi.")


def _text(value, label, limit, empty=False):
    require(isinstance(value, str), label + " non valido.")
    value = value.strip()
    require((empty or bool(value)) and len(value) <= limit and "\0" not in value,
            label + " non valido o troppo lungo.")
    return value


def _finite(value):
    try:
        return type(value) in (int, float) and math.isfinite(value)
    except OverflowError:
        return False


def _digest(value):
    return hashlib.sha256(encode(value).encode()).hexdigest()


def _model():
    # Changing model mathematics or its shared numeric helpers invalidates a saved
    # case explicitly. No historical case silently acquires a different model.
    paths = ("static/js/banchi/modelli/tubo.js", "static/js/banchi/misure.js")
    signature = hashlib.sha256()
    for name in paths:
        signature.update(name.encode() + b"\0" + (ROOT / name).read_bytes() + b"\0")
    return {"id": "tubo", "sha256": signature.hexdigest()}


def specification(db, user, resource_id):
    require(resource_id == RESOURCE_ID, "Questo strumento non supporta ancora i casi salvati.", 404)
    rows = store.published(db)
    resource = next((r for r in rows if r["id"] == resource_id), None)
    require(resource and resource["kind"] == "bench" and resource.get("model") == "tubo",
            "Risorsa ritirata o non disponibile.", 404)
    require(store.can_read(db, user, rows, resource), "Accedi al percorso per aprire questo caso.", 403)
    ref = {"id": resource_id, "version": resource["version"], "sha256": _digest(resource)}
    model = _model()
    return {"schema": SCHEMA_NAME,
            "resource": dict(ref, title=resource["title"], course=resource["course"], skill=resource["skill"]),
            "model": model, "parameters": list(PARAMETERS), "views": list(VIEWS),
            "initialCase": {"schema": SCHEMA_NAME, "resource": ref, "model": model,
                            "parameters": {p["key"]: p["value"] for p in PARAMETERS}, "time": 0, "view": "orbit"}}


def _duration(p):
    """Validate clock bounds, never grade an answer or provide a second solver.

    This Poiseuille domain bound is checked against the actual JS model in the
    contract test. Laminar flow has duration L / mean; outside it, time is zero.
    """
    radius, length, viscosity = p["r"] / 1000, p["length"] / 100, p["mu"] / 1000
    mean = (p["flow"] / 1e6 / (math.pi * radius * radius) if p["mode"] == "flow"
            else radius * radius * p["dp"] / (8 * viscosity * length))
    reynolds = 1000 * mean * 2 * radius / viscosity
    return length / mean if reynolds < 2300 else 0


def validate(db, user, value, current_spec=None):
    _fields(value, ("schema", "resource", "model", "parameters", "time", "view"))
    require(value["schema"] == SCHEMA_NAME, "Versione del caso non supportata.", 409)
    _fields(value["resource"], ("id", "version", "sha256"))
    _fields(value["model"], ("id", "sha256"))
    require(type(value["resource"]["version"]) is int, "Edizione della risorsa non valida.")
    spec = current_spec or specification(db, user, value["resource"]["id"])
    expected = spec["initialCase"]
    require(value["resource"] == expected["resource"],
            "L’edizione della risorsa è cambiata. Il caso precedente non è stato modificato; apri la risorsa aggiornata.", 409)
    require(value["model"] == expected["model"],
            "La versione del modello è cambiata. Questo caso richiede una verifica prima della riapertura.", 409)
    parameters = value["parameters"]
    _fields(parameters, tuple(p["key"] for p in PARAMETERS))
    for p in PARAMETERS:
        v = parameters[p["key"]]
        if "options" in p:
            require(isinstance(v, str) and v in {option[0] for option in p["options"]}, "Regolazione della pompa non valida.")
        else:
            require(_finite(v) and p["min"] <= v <= p["max"], "Parametro fuori intervallo: " + p["key"] + ".")
            increment = (v - p["min"]) / p["step"]
            require(abs(increment - round(increment)) <= 1e-7,
                    "Il caso richiede un valore rappresentabile dal controllo: " + p["key"] + ".")
    require(_finite(value["time"]) and 0 <= value["time"] <= _duration(parameters) + 1e-10,
            "Istante fuori dall’intervallo del modello.")
    require(isinstance(value["view"], str) and value["view"] in VIEWS, "Vista non supportata.")
    # Reconstruct the public contract rather than retaining untrusted extra state.
    return {"case": {"schema": SCHEMA_NAME, "resource": dict(expected["resource"]), "model": dict(expected["model"]),
                     "parameters": dict(parameters), "time": value["time"], "view": value["view"]},
            "resource": spec["resource"]}


def installed(db):
    return bool(db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='resource_case_documents'").fetchone())


def prepare(db):
    require(db.in_transaction, "Salvare in una transazione di scrittura.")
    for sql in SCHEMA:
        db.execute(sql)


def _key(value):
    require(safe_key(value), "Identificatore della richiesta non valido.")
    return value


def _owned_case(db, user, case_id):
    require(isinstance(case_id, str) and bool(re.fullmatch(r"rcase-[a-f0-9]{32}", case_id)), "Caso non trovato.", 404)
    row = db.execute("SELECT * FROM resource_case_documents WHERE user=? AND id=?", (user["id"], case_id)).fetchone() if installed(db) else None
    require(row, "Caso non trovato.", 404)
    return row


def _snapshot(db, user):
    # A list or collection checks the resource once in this database transaction,
    # not once per saved case. Never cache authorization across requests or users.
    try:
        return specification(db, user, RESOURCE_ID), None
    except Problem as exc:
        return None, exc


def _case_document(db, user, row, shared=False, snapshot=None):
    result = {"id": row["id"], "title": row["title"], "created": row["created"]}
    if not shared:
        result["note"] = row["note"]
    try:
        spec, problem = snapshot or _snapshot(db, user)
        if problem:
            raise problem
        result.update(validate(db, user, json.loads(row["payload"]), spec), available=True)
    except Problem as exc:
        result.update(available=False, case=None, reason=str(exc))
    return result


def save_case(db, user, data):
    need_user(user)
    _fields(data, ("requestId", "title", "case"), ("note",))
    request_id = _key(data["requestId"])
    title = _text(data["title"], "Titolo", 120)
    note = _text(data.get("note", ""), "Nota", 2000, True)
    request = encode({"title": title, "note": note, "case": data["case"]})
    old = db.execute("SELECT * FROM resource_case_documents WHERE user=? AND request_id=?", (user["id"], request_id)).fetchone() if installed(db) else None
    if old:
        require(old["request"] == request, "La richiesta è già associata a un altro caso.", 409)
        return _case_document(db, user, old)
    checked = validate(db, user, data["case"])["case"]
    prepare(db)
    case_id = "rcase-" + secrets.token_hex(16)
    db.execute("INSERT INTO resource_case_documents VALUES(?,?,?,?,?,?,?,?)",
               (case_id, user["id"], request_id, request, title, note, encode(checked), store.NOW()))
    return _case_document(db, user, _owned_case(db, user, case_id))


def _owned_collection(db, user, collection_id):
    require(isinstance(collection_id, str) and bool(re.fullmatch(r"rcol-[a-f0-9]{32}", collection_id)), "Raccolta non trovata.", 404)
    row = db.execute("SELECT * FROM resource_collections WHERE user=? AND id=?", (user["id"], collection_id)).fetchone() if installed(db) else None
    require(row, "Raccolta non trovata.", 404)
    return row


def _collection_document(db, user, row, shared=False, snapshot=None):
    entries = []
    snapshot = snapshot or _snapshot(db, user)
    for case_id in json.loads(row["case_ids"]):
        case = db.execute("SELECT * FROM resource_case_documents WHERE id=? AND user=?", (case_id, row["user"])).fetchone()
        require(case, "Un riferimento della raccolta non è disponibile.", 409)
        entries.append(_case_document(db, user, case, shared, snapshot))
    result = {"id": row["id"], "title": row["title"], "note": row["note"], "revision": row["revision"],
              "created": row["created"], "updated": row["updated"], "cases": entries,
              "shared": bool(row["share_token"])}
    if not shared:
        result.update(caseIds=json.loads(row["case_ids"]), shareToken=row["share_token"])
    return result


def _collection_input(data):
    title = _text(data["title"], "Titolo", 120)
    note = _text(data.get("note", ""), "Nota", 2000, True)
    ids = data["caseIds"]
    require(isinstance(ids, list) and len(ids) <= 24 and all(isinstance(i, str) for i in ids)
            and len(set(ids)) == len(ids), "Una raccolta contiene fino a 24 casi distinti.")
    return {"title": title, "note": note, "caseIds": ids}


def save_collection(db, user, data, collection_id=None):
    need_user(user)
    _fields(data, ("revision" if collection_id else "requestId", "title", "caseIds"), ("note",))
    cleaned = _collection_input(data)
    request = encode(cleaned)
    if not collection_id:
        request_id = _key(data["requestId"])
        old = db.execute("SELECT * FROM resource_collections WHERE user=? AND request_id=?", (user["id"], request_id)).fetchone() if installed(db) else None
        if old:
            require(old["request"] == request, "La richiesta è già associata a un’altra raccolta.", 409)
            return _collection_document(db, user, old)
    for key in cleaned["caseIds"]:
        row = _owned_case(db, user, key)
        validate(db, user, json.loads(row["payload"]))
    if collection_id:
        old = _owned_collection(db, user, collection_id)
        require(cleaned["caseIds"] or not old["share_token"],
                "Revoca il link prima di svuotare una raccolta condivisa.", 409)
        revision = data["revision"]
        require(type(revision) is int and revision == old["revision"], "La raccolta è cambiata. Riaprila prima di salvarla.", 409)
        db.execute("UPDATE resource_collections SET title=?,note=?,case_ids=?,revision=revision+1,updated=? WHERE id=? AND user=?",
                   (cleaned["title"], cleaned["note"], encode(cleaned["caseIds"]), store.NOW(), collection_id, user["id"]))
    else:
        prepare(db)
        collection_id = "rcol-" + secrets.token_hex(16)
        now = store.NOW()
        db.execute("INSERT INTO resource_collections VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                   (collection_id, user["id"], request_id, request, cleaned["title"], cleaned["note"], encode(cleaned["caseIds"]), 1, None, now, now))
    return _collection_document(db, user, _owned_collection(db, user, collection_id))


def share_collection(db, user, collection_id, data):
    need_user(user)
    _fields(data, ("revision", "shared"))
    old = _owned_collection(db, user, collection_id)
    require(type(data["revision"]) is int and data["revision"] == old["revision"],
            "La raccolta è cambiata. Riaprila prima di condividerla.", 409)
    require(type(data["shared"]) is bool, "Scelta di condivisione non valida.")
    require(not data["shared"] or json.loads(old["case_ids"]), "Aggiungi almeno un caso prima di condividere la raccolta.")
    token = (old["share_token"] or secrets.token_hex(24)) if data["shared"] else None
    if token != old["share_token"]:
        db.execute("UPDATE resource_collections SET share_token=?,revision=revision+1,updated=? WHERE id=? AND user=?",
                   (token, store.NOW(), collection_id, user["id"]))
    return _collection_document(db, user, _owned_collection(db, user, collection_id))


def route(db, user, parts, data, post):
    if not post and len(parts) == 2 and parts[0] == "spec":
        return specification(db, user, parts[1])
    if post and parts == ["validate"]:
        _fields(data, ("case",))
        return validate(db, user, data["case"])
    if not post and len(parts) == 2 and parts[0] == "shared":
        require(bool(re.fullmatch(r"[a-f0-9]{48}", parts[1])), "Raccolta non disponibile.", 404)
        row = db.execute("SELECT * FROM resource_collections WHERE share_token=?", (parts[1],)).fetchone() if installed(db) else None
        require(row, "Raccolta non disponibile o condivisione revocata.", 404)
        return _collection_document(db, user, row, shared=True)
    need_user(user)
    if not post and parts == ["me"]:
        if not installed(db):
            return {"cases": [], "collections": [], "totalCases": 0, "totalCollections": 0}
        cases = db.execute("SELECT * FROM resource_case_documents WHERE user=? ORDER BY created DESC,rowid DESC LIMIT 200", (user["id"],))
        collections = db.execute("SELECT * FROM resource_collections WHERE user=? ORDER BY updated DESC,rowid DESC LIMIT 100", (user["id"],))
        snapshot = _snapshot(db, user)
        return {"cases": [_case_document(db, user, row, snapshot=snapshot) for row in cases],
                "collections": [_collection_document(db, user, row, snapshot=snapshot) for row in collections],
                "totalCases": db.execute("SELECT COUNT(*) FROM resource_case_documents WHERE user=?", (user["id"],)).fetchone()[0],
                "totalCollections": db.execute("SELECT COUNT(*) FROM resource_collections WHERE user=?", (user["id"],)).fetchone()[0]}
    if post and parts == ["cases"]:
        return save_case(db, user, data)
    if not post and len(parts) == 2 and parts[0] == "cases":
        return _case_document(db, user, _owned_case(db, user, parts[1]))
    if post and parts == ["collections"]:
        return save_collection(db, user, data)
    if len(parts) == 2 and parts[0] == "collections":
        return (save_collection(db, user, data, parts[1]) if post
                else _collection_document(db, user, _owned_collection(db, user, parts[1])))
    if post and len(parts) == 3 and parts[0] == "collections" and parts[2] == "share":
        return share_collection(db, user, parts[1], data)
    raise Problem("Fonzione non disponibile.", 404)
