"""Editorial transactions. Each save creates an immutable revision."""

import base64
import binascii
import hashlib
import json
import math
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
    published,
    record,
    require,
    safe_key,
)

from .method import validate_method

KINDS = {"course", "section", "lesson", "example", "question", "lab", "method", "bench", "experiment"}
TYPES = {"text", "formula", "figure", "attachment", "example", "question", "lab"}
LAB_SPEC = json.loads((ROOT / "static" / "lab-models.json").read_text())
EXPERIMENTS = {r["id"]: r for path in (ROOT / "content").glob("esperienze-C*.json")
               for r in json.loads(path.read_text())}
CATEGORIES = {"concetto", "calcolo", "algebra", "unità", "testo", "modello"}


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
    require(isinstance(r, dict) and safe_key(r.get("id")), "ID assente o non valido.")
    require(r.get("kind") in KINDS, "Tipo di materiale non valido.")
    require(
        isinstance(r.get("title"), str) and bool(r["title"].strip()),
        "Inserisci il titolo.",
    )
    require(
        isinstance(r.get("order"), (int, float)) and math.isfinite(r["order"]),
        "Posizione non valida.",
    )
    require(isinstance(r.get("section", ""), str), "Sezione non valida.")

    def ref(key, kinds):
        require(
            isinstance(key, str) and key in objects and objects[key]["kind"] in kinds,
            "Riferimento non disponibile: " + str(key),
        )

    kind = r["kind"]
    ref(r.get("course"), {"course"})
    if kind == "course":
        require(
            r["course"] == r["id"],
            "L’ID del corso deve coincidere con il corso principale.",
        )
        for k in r.get("includes", []):
            ref(k, {"course"})

        def walk(k, path):
            require(k not in path, "I corsi inclusi formano un ciclo.")
            for sub in objects[k].get("includes", []):
                walk(sub, path | {k})

        walk(r["id"], set())
    for k in r.get("reuse", []):
        ref(k, {"course"})
    if r.get("skill"):
        ref(r["skill"], {"lesson"})
    for k in r.get("prerequisites", []):
        ref(k, {"lesson"})
    require(isinstance(r.get("blocks"), list), "Blocchi mancanti.")
    for b in r["blocks"] + r.get("promptBlocks", []):
        require(
            isinstance(b, dict)
            and b.get("type") in TYPES
            and isinstance(b.get("text", ""), str),
            "Blocco non valido.",
        )
        if b["type"] in ("figure", "attachment"):
            require(
                valid_src(db, b.get("src"), extra),
                "File assente o percorso non valido: " + str(b.get("src")),
            )
        if b["type"] in ("example", "lab", "question"):
            ref(b.get("ref"), {b["type"]})
    if kind in ("example", "question"):
        require(
            r.get("prompt") and r.get("family") and r.get("skill") and r["blocks"],
            "Servono consegna, famiglia, competenza e svolgimento.",
        )
        require(r.get("difficulty") in (1, 2, 3), "Difficoltà da 1 a 3.")
    if kind == "method":
        validate_method(r)
    if kind == "experiment":
        ref(r.get("skill"), {"lesson"})
        lesson = objects[r["skill"]]
        require(
            lesson["course"] == r["course"] and r.get("topic") in lesson.get("coverage", ()),
            "Collega la simulazione a una voce della sua lezione.",
        )
        anchor = r.get("anchor")
        require(
            isinstance(anchor, str) and anchor.strip()
            and any(b["type"] == "text" and b["text"].startswith(anchor) for b in lesson["blocks"]),
            "Il paragrafo associato è assente.",
        )
        require(
            all(isinstance(r.get(k), str) and r[k].strip()
                for k in ("formula", "interpretation", "summary", "transferPrompt")),
            "Completa il percorso sperimentale.",
        )
        require(r["transferPrompt"].count("{x}") == 1,
                "Indica il dato del problema di trasferimento con {x}.")
        source = EXPERIMENTS.get(r["id"])
        physics = ("skill", "topic", "apparatus", "control", "measure", "references", "substitution", "discrete")
        require(
            source is not None and all(r.get(k) == source.get(k) for k in physics),
            "Misure e parametri devono corrispondere al modello fisico installato.",
        )
    if kind == "bench":
        require(r.get("model") in ("piano", "volo", "stevino", "tubo", "gas", "calore",
                                   "campo", "circuito", "lente", "onde"), "Scena 3D sconosciuta.")
        def text(value):
            return isinstance(value, str) and bool(value.strip())

        related = r.get("related")
        require(text(r.get("summary")) and isinstance(related, list) and related,
                "Completa obiettivo e collegamenti.")
        for target in related:
            ref(target, {"lesson", "example", "question"})
        topics = r.get("topics")
        require(isinstance(topics, list), "Voci di lezione mancanti.")
        for topic in topics:
            require(isinstance(topic, dict) and all(text(topic.get(k)) for k in
                    ("lesson", "anchor", "topic", "question")), "Voce della lezione incompleta.")
            ref(topic["lesson"], {"lesson"})
            require(topic["lesson"] in related, "Collega anche la lezione della voce.")
        prediction = r.get("prediction")
        require(isinstance(prediction, dict), "Previsione del banco mancante.")
        options = prediction.get("options")
        require(text(prediction.get("question")) and text(prediction.get("why"))
                and isinstance(options, list) and 2 <= len(options) <= 8
                and all(text(o) for o in options) and len(set(options)) == len(options)
                and type(prediction.get("correct")) is int and 0 <= prediction["correct"] < len(options),
                "Completa la previsione del banco.")
        checks = r.get("assessment")
        require(isinstance(checks, list) and len(checks) == 2 and
                all(isinstance(a, dict) and all(text(a.get(k)) for k in ("prompt", "unit", "worked"))
                    and type(a.get("value")) in (float, int) and math.isfinite(a["value"]) for a in checks),
                "Completa verifica e problema di trasferimento.")
    if kind == "lab":
        model = r.get("model")
        require(model in LAB_SPEC["parameters"], "Modello di laboratorio sconosciuto.")
        defaults = r.get("defaults", {})
        require(
            isinstance(defaults, dict), "Configurazione iniziale del banco non valida."
        )
        bounds = {row[0]: row[3:6] for row in LAB_SPEC["parameters"][model]}
        for param, value in defaults.items():
            if param == "mode":
                require(
                    value in LAB_SPEC["modes"].get(model, []),
                    "Trasformazione o collegamento non valido.",
                )
                continue
            require(param in bounds, "Parametro non supportato dal modello: " + param)
            lo, hi, step = bounds[param]
            require(
                type(value) in (int, float)
                and math.isfinite(value)
                and lo <= value <= hi
                and abs((value - lo) / step - round((value - lo) / step)) < 1e-7,
                "Valore iniziale fuori intervallo o passo non valido: " + param,
            )
        for field in ("prediction", "observation", "interpretation"):
            require(
                isinstance(r.get(field), str) and r[field].strip(),
                "Completa previsione, osservazione e interpretazione.",
            )
    if kind == "question":
        a = r.get("answer", {})
        require(
            a.get("type") in ("choice", "numeric", "text"),
            "Tipo di risposta non valido.",
        )
        require("value" in a and str(a["value"]).strip(), "Risposta corretta mancante.")
        if a["type"] == "choice":
            ops = a.get("options", [])
            require(
                2 <= len(ops) <= 8
                and len(set(ops)) == len(ops)
                and a["value"] in ops
                and all(isinstance(x, str) and x.strip() for x in ops),
                "Controlla opzioni distinte e chiave.",
            )
        if a["type"] == "numeric":
            require(
                isinstance(a["value"], (int, float))
                and math.isfinite(a["value"])
                and isinstance(a.get("tolerance"), (float, int))
                and 0 <= a["tolerance"] < math.inf
                and isinstance(a.get("unit", ""), str),
                "Valore, unità e tolleranza assoluta richiesti.",
            )
        if r.get("exam"):
            require(
                r["course"] == "C6" and r["exam"] in (1, 2, 3),
                "Fascicolo d’esame non valido.",
            )
            require(
                a["type"] != "choice" or len(a["options"]) == 5,
                "Una scelta della simulazione richiede cinque risposte.",
            )
        require(
            isinstance(a.get("aliases", []), list)
            and all(isinstance(v, str) for v in a.get("aliases", [])),
            "Sinonimi non validi.",
        )
        require(
            isinstance(r.get("hints"), list)
            and all(isinstance(v, str) and v.strip() for v in r["hints"]),
            "Suggerimenti non validi.",
        )
        er = r.get("error", {})
        require(
            r.get("hints") and er.get("message") and er.get("category") in CATEGORIES,
            "Inserisci suggerimento, categoria e feedback.",
        )
        target = er.get("target", "")
        if target.startswith("lab:"):
            require(
                any(
                    t.get("kind") == "lab" and t.get("course") == target[4:]
                    for t in objects.values()
                ),
                "Laboratorio di recupero non disponibile.",
            )
        else:
            ref(target, {"lesson", "lab"})
    return True


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
    if not path.exists():
        temp = path.with_suffix(".tmp")
        temp.write_bytes(raw)
        temp.replace(path)
    db.execute(
        "INSERT OR IGNORE INTO assets VALUES(?,?,?,?)",
        (key, Path(a.get("name", "allegato")).name[:160], a["mime"], len(raw)),
    )
    return {"src": "/asset/" + key}


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
    if errors or not commit:
        return {"errors": errors, "count": len(clean), "saved": False}
    for a in pkg.get("assets", []):
        save_asset(db, a)
    for r, expected in clean:
        write_draft(db, user, r, expected)
    return {"errors": [], "count": len(clean), "saved": True}


def publish(db, user, targets):
    require(isinstance(targets, dict) and targets, "Seleziona almeno una bozza.")
    objs = {r["id"]: r for r in published(db)}
    for key, ver in targets.items():
        h = db.execute("SELECT draft FROM heads WHERE id=?", (key,)).fetchone()
        require(
            h and h[0] and h[0] == ver, "La bozza è cambiata o è assente: " + key, 409
        )
        objs[key] = record(db, key, ver)
    for key in targets:
        validate(db, objs[key], objs)
    for key, v in targets.items():
        db.execute("UPDATE heads SET live=?,draft=NULL WHERE id=?", (v, key))
        audit(db, user["id"], "pubblicazione", key, str(v))
    return {"count": len(targets)}


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
                    (DATA / "uploads" / row["id"]).read_bytes()
                ).decode(),
            )
        )
    return {
        "schema": "astra/1",
        "origin": "archivio",
        "records": records,
        "assets": assets,
    }
