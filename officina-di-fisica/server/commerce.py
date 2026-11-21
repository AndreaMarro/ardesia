"""Transfer orders preserve the offer and beneficiary instructions at checkout."""

import json
import re
import secrets
from decimal import Decimal, InvalidOperation

from .store import (
    NOW,
    Problem,
    audit,
    config,
    encode,
    entitled,
    need_author,
    need_user,
    published,
    record,
    require,
)

OFFERS = {
    "digitale": "Materiali digitali",
    "incontri": "Incontri dal vivo",
    "combinata": "Materiali e incontri",
}


def cents(x):
    try:
        d = Decimal(str(x).replace(",", "."))
        require(
            d.is_finite() and 0 < d <= 1_000_000 and d == d.quantize(Decimal(".01")),
            "Importo positivo in euro, con al massimo due decimali.",
        )
        return int(d * 100)
    except (ValueError, InvalidOperation):
        raise Problem("Importo in euro non valido.")


def valid_iban(x):
    if not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]{11,30}", x):
        return False
    s = x[4:] + x[:4]
    return int("".join(str(ord(c) - 55) if c.isalpha() else c for c in s)) % 97 == 1


def update(db, user, d):
    mode = d.get("mode", "verifica")
    require(mode in ("verifica", "reale"), "Modalità non valida.")
    iban = re.sub(r"\s", "", d.get("iban", "")).upper()
    require(not iban or valid_iban(iban), "Controlla l’IBAN e le cifre di verifica.")
    conf = {
        "mode": mode,
        "iban": iban,
        "holder": str(d.get("holder", "")).strip(),
        "terms": str(d.get("terms", "")).strip(),
        "reference": str(d.get("reference", "Officina {ordine}")).strip(),
        "prices": {},
        "descriptions": {},
    }
    rows = published(db)
    for key, value in d.get("prices", {}).items():
        if value in ("", None):
            continue
        require(
            any(
                key == c["id"] + "|" + off
                for c in rows
                if c["kind"] == "course"
                for off in OFFERS
            ),
            "Offerta sconosciuta.",
        )
        conf["prices"][key] = cents(value)
        conf["descriptions"][key] = str(d.get("descriptions", {}).get(key, "")).strip()
        if key.split("|")[1] != "digitale":
            require(conf["descriptions"][key], "Descrivi gli incontri inclusi.")
    if mode == "reale":
        require(
            conf["holder"]
            and valid_iban(iban)
            and conf["terms"]
            and conf["prices"]
            and "{ordine}" in conf["reference"],
            "Per attivare i bonifici servono intestatario, IBAN, condizioni, prezzi e causale con {ordine}.",
        )
    db.execute("UPDATE settings SET value=? WHERE key='commerce'", (encode(conf),))
    audit(db, user["id"], "configurazione bonifici", mode)
    return {"ok": True}


def offers(db, course):
    cfg = config(db)
    mode = cfg.get("mode", "verifica")
    return [
        {
            "key": key,
            "label": label,
            "cents": 100
            if mode == "verifica"
            else cfg["prices"].get(course + "|" + key),
            "description": cfg.get("descriptions", {}).get(course + "|" + key, ""),
        }
        for key, label in OFFERS.items()
        if mode == "verifica" or course + "|" + key in cfg.get("prices", {})
    ]


def create(db, user, rows, d):
    need_user(user)
    require(
        user["role"] != "lettore",
        "Crea un account personale per verificare il flusso ordini.",
        403,
    )
    course, offer = d.get("course"), d.get("offer", "digitale")
    require(
        any(r["id"] == course and r["kind"] == "course" for r in rows),
        "Percorso non disponibile.",
    )
    cfg = config(db)
    mode = cfg.get("mode", "verifica")
    proposal = next((o for o in offers(db, course) if o["key"] == offer), None)
    require(proposal, "Questa offerta è chiusa.", 409)
    if offer == "digitale" and user["role"] != "autore":
        require(
            not entitled(db, user, rows, course),
            "Hai già accesso a questo percorso.",
            409,
        )
    old = db.execute(
        "SELECT * FROM orders WHERE user=? AND course=? AND offer=? AND mode=? AND state IN ('in attesa','confermato') ORDER BY stamp DESC",
        (user["id"], course, offer, mode),
    ).fetchone()
    if old:
        return public(old)
    require(d.get("accepted") is True, "Conferma di aver letto il riepilogo.")
    key = "AM-" + secrets.token_hex(5).upper()
    snap = {
        "courseTitle": record(db, course)["title"],
        "label": proposal["label"],
        "description": proposal["description"],
        "holder": cfg.get("holder", "") if mode == "reale" else "",
        "iban": cfg.get("iban", "") if mode == "reale" else "",
        "terms": cfg.get("terms", "")
        if mode == "reale"
        else "Esercitazione con importo fittizio. Nessun bonifico da effettuare.",
        "reference": cfg.get("reference", "Officina {ordine}").replace("{ordine}", key),
    }
    db.execute(
        "INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?)",
        (
            key,
            user["id"],
            course,
            offer,
            mode,
            proposal["cents"],
            encode(snap),
            "in attesa",
            None,
            NOW(),
        ),
    )
    audit(db, user["id"], "ordine creato", key, mode)
    return public(db.execute("SELECT * FROM orders WHERE id=?", (key,)).fetchone())


def public(row):
    r = dict(row)
    r["snapshot"] = json.loads(r["snapshot"])
    r.pop("user", None)
    return r


def operation(db, user, key, d):
    need_user(user)
    row = db.execute("SELECT * FROM orders WHERE id=?", (key,)).fetchone()
    require(
        row and (row["user"] == user["id"] or user["role"] == "autore"),
        "Ordine non trovato.",
        404,
    )
    if d.get("action") == "cancel":
        require(row["state"] != "confermato", "Ordine già confermato.", 409)
        if row["state"] != "annullato":
            db.execute("UPDATE orders SET state='annullato' WHERE id=?", (key,))
            audit(db, user["id"], "ordine annullato", key)
    else:
        need_author(user)
        require(
            d.get("action") == "confirm" and d.get("verified") is True,
            "Spunta la verifica dell’accredito.",
        )
        require(row["state"] != "annullato", "Ordine annullato.", 409)
        received = cents(d.get("amount", ""))
        if row["state"] == "confermato":
            require(
                received == row["received"], "Il valore registrato è differente.", 409
            )
            return {"ok": True, "state": "confermato"}
        if received != row["cents"]:
            db.execute("UPDATE orders SET received=? WHERE id=?", (received, key))
            audit(db, user["id"], "importo difforme", key, str(received))
            return {
                "ok": False,
                "state": "in attesa",
                "message": "Importo difforme registrato. L’ordine resta in attesa.",
            }
        db.execute(
            "UPDATE orders SET state='confermato',received=? WHERE id=?",
            (received, key),
        )
        if row["offer"] in ("digitale", "combinata"):
            db.execute(
                "INSERT OR IGNORE INTO access VALUES(?,?,?)",
                (row["user"], row["course"], row["mode"]),
            )
        audit(db, user["id"], "accredito confermato", key, str(received))
    return {"ok": True}
