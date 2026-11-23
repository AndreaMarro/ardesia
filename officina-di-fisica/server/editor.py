"""Editorial transactions. Each save creates an immutable revision."""

import base64
import binascii
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from .store import (
    DATA,
    NOW,
    ROOT,
    Problem,
    audit,
    encode,
    record,
    require,
    safe_key,
)

from .adapters.engines import validate_experiment
from .adapters.exam_policies import exam_policy
from .domain.pathway import prerequisites, unique_experiments
from .adapters.contracts import schema, validate as validate_contract
from .editorial.service import EditorialWorkspace
from .domain.authoring import ContentPolicy, KINDS, validate_record
from .application.publication import publish as publish_graph
from .adapters.publication import SQLitePublication

LAB_SPEC = json.loads((ROOT / "static" / "lab-models.json").read_text())
EXPERIMENTS = {r["id"]: r for path in (ROOT / "content").glob("esperienze-C*.json")
               for r in json.loads(path.read_text())}
def heads(db):
    return {r["id"]: dict(r) for r in db.execute("SELECT * FROM heads")}


def next_v(db, key):
    return db.execute(
        "SELECT coalesce(max(v),0)+1 FROM versions WHERE id=?", (key,)
    ).fetchone()[0]


def write_draft(db, user, rec, expected):
    key = rec["id"]
    head = db.execute("SELECT live,draft FROM heads WHERE id=?", (key,)).fetchone()
    latest = next_v(db, key) - 1
    require(
        expected == latest,
        "La versione è cambiata. Riapri il materiale e confronta la tua copia locale.",
        409,
    )
    v = latest + 1
    rec = dict(rec, version=v, review="bozza")
    if not head:
        db.execute("INSERT INTO heads VALUES(?,NULL,NULL)", (key,))
    db.execute(
        "INSERT INTO versions VALUES(?,?,?,?,?)",
        (key, v, encode(rec), user["id"], NOW()),
    )
    db.execute("UPDATE heads SET draft=? WHERE id=?", (v, key))
    audit(db, user["id"], "salvataggio bozza", key, str(v))
    return v


def valid_src(db, src, extra):
    if not isinstance(src, str):
        return False
    if re.fullmatch(r"/figures/[\w.-]+\.svg", src):
        return (ROOT / "static" / src.lstrip("/")).is_file()
    if re.fullmatch(r"/asset/[a-f0-9]{64}", src):
        key = src.split("/")[-1]
        return key in extra or bool(
            db.execute("SELECT 1 FROM assets WHERE id=?", (key,)).fetchone()
        )
    return False


def validate(db, r, objects, extra=()):
    policy = ContentPolicy(EXPERIMENTS, LAB_SPEC, exam_policy, validate_experiment,
                           lambda src: valid_src(db, src, extra))
    return validate_record(r, objects, policy)


def workspace(db):
    hs = heads(db)
    rows = db.execute(
        "SELECT payload FROM versions JOIN heads USING(id) WHERE v=coalesce(draft,live,(SELECT max(v2.v) FROM versions v2 WHERE v2.id=heads.id))"
    )
    return {r["id"]: r for r in (json.loads(z[0]) for z in rows)}, hs


def asset_bytes(a):
    raw = base64.b64decode(a["data"], validate=True)
    require(0 < len(raw) <= 4 * 1024 * 1024, "Il file deve pesare al massimo 4 MiB.")
    mime = a["mime"]
    if mime == "image/svg+xml":
        require(
            b"<!DOCTYPE" not in raw.upper() and b"<!ENTITY" not in raw.upper(),
            "SVG non ammesso.",
        )
        root = ET.fromstring(raw)
        require(
            root.tag.split("}")[-1] == "svg", "Il file SVG deve contenere un disegno."
        )
        for el in root.iter():
            tag = el.tag.split("}")[-1].lower()
            require(
                tag
                not in {
                    "script",
                    "foreignobject",
                    "iframe",
                    "a",
                    "image",
                    "use",
                    "animate",
                    "animatemotion",
                    "animatetransform",
                    "set",
                    "style",
                },
                "Esporta SVG senza script, stili incorporati o risorse esterne.",
            )
            for attr, value in el.attrib.items():
                require(
                    not attr.split("}")[-1].lower().startswith("on")
                    and "href" not in attr.lower()
                    and not re.search(
                        r"(javascript|data|https?|file):|@import", value, re.I
                    ),
                    "Riferimento esterno non ammesso nel disegno.",
                )
    else:
        magic = {
            "image/png": b"\x89PNG\r\n\x1a\n",
            "image/jpeg": b"\xff\xd8\xff",
            "application/pdf": b"%PDF-",
            "image/webp": b"RIFF",
        }
        require(
            mime in magic and raw.startswith(magic[mime]),
            "Formato file non riconosciuto.",
        )
        if mime == "image/webp":
            require(raw[8:12] == b"WEBP", "WebP non valido.")
    return hashlib.sha256(raw).hexdigest(), raw


def save_asset(db, a):
    try:
        key, raw = asset_bytes(a)
    except (ValueError, KeyError, ET.ParseError, binascii.Error):
        raise Problem("File o codifica non validi.")
    path = DATA / "uploads" / key
    from .adapters import hosted
    if hosted.enabled():
        hosted.save_bytes(db, "asset/" + key, raw)
    elif not path.exists():
        temp = path.with_suffix(".tmp")
        temp.write_bytes(raw)
        temp.replace(path)
    db.execute(
        "INSERT OR IGNORE INTO assets VALUES(?,?,?,?)",
        (key, Path(a.get("name", "allegato")).name[:160], a["mime"], len(raw)),
    )
    return {"src": "/asset/" + key}


def read_asset(db, key):
    from .adapters import hosted
    if hosted.enabled():
        raw = hosted.load_bytes(db, "asset/" + key)
        require(raw, "Allegato non disponibile.", 404)
        return raw
    return (DATA / "uploads" / key).read_bytes()


def imported(db, user, pkg, commit):
    require(
        isinstance(pkg, dict)
        and pkg.get("schema") == "astra/1"
        and isinstance(pkg.get("records"), list)
        and 1 <= len(pkg["records"]) <= 2500,
        "Il file deve essere un lotto astra/1 con un elenco di materiali.",
    )
    obj, hs = workspace(db)
    extra = set()
    errors = []
    clean = []
    seen = set()
    for a in pkg.get("assets", []):
        try:
            key, _ = asset_bytes(a)
            require(a.get("id") == key, "Impronta del file diversa dal riferimento.")
            extra.add(key)
        except Exception as e:
            errors.append("Allegato: " + str(e))
    for row in pkg["records"]:
        try:
            require(isinstance(row, dict) and safe_key(row.get("id")), "ID non valido.")
            k = row["id"]
            require(k not in seen, "ID duplicato " + k)
            seen.add(k)
            expected = row.get("baseVersion", 0)
            if pkg.get("origin") == "archivio" and k not in hs:
                expected = 0
            require(
                expected == next_v(db, k) - 1,
                "Versione di partenza errata per " + k + ".",
            )
            r = {
                key: value
                for key, value in row.items()
                if key not in ("baseVersion", "review")
            }
            if k in obj:
                require(
                    r.get("kind") == obj[k]["kind"],
                    "Il tipo del materiale esistente è stabile: " + k,
                )
            obj[k] = r
            clean.append((r, expected))
        except Exception as e:
            errors.append(str(e))
    for r, _ in clean:
        try:
            validate(db, r, obj, extra)
        except Exception as e:
            errors.append(r["id"] + " · " + str(e))
    if not errors:
        try:
            prerequisites(obj)
            prerequisites(obj, "course")
            unique_experiments(obj)
        except Problem as error:
            errors.append(str(error))
    if errors or not commit:
        return {"errors": errors, "count": len(clean), "saved": False}
    for a in pkg.get("assets", []):
        save_asset(db, a)
    for r, expected in clean:
        write_draft(db, user, r, expected)
    return {"errors": [], "count": len(clean), "saved": True}


def publish(db, user, targets):
    return publish_graph(SQLitePublication(db, validate), user["id"], targets)


def review_scaffold(db, author, proposal, commit=False):
    validate_contract(proposal, schema("proposal-v1"))
    key, version = proposal["objectId"], proposal["version"]
    head = db.execute("SELECT live,draft FROM heads WHERE id=?", (key,)).fetchone()
    require(head and head["live"] == version and head["draft"] is None and next_v(db, key) == version + 1,
            "La lezione è cambiata. Riparti dall’edizione attuale.", 409)
    source = record(db, key, version)
    workspace = EditorialWorkspace([source], {source["course"]}, {}, {"propose"})
    reviewed = workspace.validate_proposal(proposal, lambda value: validate_contract(value, schema("proposal-v1")))
    if commit:
        draft = {**source, "scaffold": {"strategy": proposal["strategy"], "citation": reviewed["citation"]}}
        reviewed["draftVersion"] = write_draft(db, author, draft, version)
        reviewed["status"] = "bozza salvata"
    return reviewed


def export(db):
    obj, _ = workspace(db)
    records = [dict(x, baseVersion=next_v(db, x["id"]) - 1) for x in obj.values()]
    assets = []
    for row in db.execute("SELECT * FROM assets"):
        assets.append(
            dict(
                id=row["id"],
                name=row["name"],
                mime=row["mime"],
                data=base64.b64encode(
                    read_asset(db, row["id"])
                ).decode(),
            )
        )
    return {
        "schema": "astra/1",
        "origin": "archivio",
        "records": records,
        "assets": assets,
    }
