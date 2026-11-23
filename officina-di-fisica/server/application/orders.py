"""Offering and order transitions. All writes share the repository transaction."""
from collections.abc import Mapping
import json
import re
import secrets
from typing import Protocol

from ..domain.errors import require
from ..domain.identity import need_author, need_user
from ..domain.orders import OFFERS, cents, valid_iban


class Orders(Protocol):
    def config(self) -> dict: ...
    def courses(self) -> list: ...
    def set_config(self, settings: dict) -> None: ...
    def entitled(self, user: Mapping, rows: list, course: str) -> bool: ...
    def course_title(self, course: str) -> str: ...
    def existing(self, user: str, course: str, offer: str, mode: str) -> Mapping | None: ...
    def get(self, key: str) -> Mapping | None: ...
    def create(self, key: str, uid: str, course: str, offer: str, mode: str, cents: int, snapshot: dict) -> None: ...
    def cancel(self, key: str) -> None: ...
    def receive(self, key: str, received: int) -> None: ...
    def confirm(self, key: str, received: int) -> None: ...
    def grant(self, uid: str, course: str, mode: str) -> None: ...
    def audit(self, actor: str, event: str, target: str, detail: str = "") -> None: ...


def update(repo: Orders, user, d):
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
    rows = repo.courses()
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
    repo.set_config(conf)
    repo.audit(user["id"], "configurazione bonifici", mode)
    return {"ok": True}


def offers(repo: Orders, course):
    cfg = repo.config()
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


def create(repo: Orders, user, rows, d):
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
    cfg = repo.config()
    mode = cfg.get("mode", "verifica")
    proposal = next((o for o in offers(repo, course) if o["key"] == offer), None)
    require(proposal, "Questa offerta è chiusa.", 409)
    if offer == "digitale" and user["role"] != "autore":
        require(
            not repo.entitled(user, rows, course),
            "Hai già accesso a questo percorso.",
            409,
        )
    old = repo.existing(user["id"], course, offer, mode)
    if old:
        return public(old)
    require(d.get("accepted") is True, "Conferma di aver letto il riepilogo.")
    key = "AM-" + secrets.token_hex(5).upper()
    snap = {
        "courseTitle": repo.course_title(course),
        "label": proposal["label"],
        "description": proposal["description"],
        "holder": cfg.get("holder", "") if mode == "reale" else "",
        "iban": cfg.get("iban", "") if mode == "reale" else "",
        "terms": cfg.get("terms", "")
        if mode == "reale"
        else "Esercitazione con importo fittizio. Nessun bonifico da effettuare.",
        "reference": cfg.get("reference", "Officina {ordine}").replace("{ordine}", key),
    }
    repo.create(key, user["id"], course, offer, mode, proposal["cents"], snap)
    repo.audit(user["id"], "ordine creato", key, mode)
    return public(repo.get(key))


def public(row):
    r = dict(row)
    r["snapshot"] = json.loads(r["snapshot"])
    r.pop("user", None)
    return r


def operation(repo: Orders, user, key, d):
    need_user(user)
    row = repo.get(key)
    require(
        row and (row["user"] == user["id"] or user["role"] == "autore"),
        "Ordine non trovato.",
        404,
    )
    if d.get("action") == "cancel":
        require(row["state"] != "confermato", "Ordine già confermato.", 409)
        if row["state"] != "annullato":
            repo.cancel(key)
            repo.audit(user["id"], "ordine annullato", key)
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
            repo.receive(key, received)
            repo.audit(user["id"], "importo difforme", key, str(received))
            return {
                "ok": False,
                "state": "in attesa",
                "message": "Importo difforme registrato. L’ordine resta in attesa.",
            }
        repo.confirm(key, received)
        if row["offer"] in ("digitale", "combinata"):
            repo.grant(row["user"], row["course"], row["mode"])
        repo.audit(user["id"], "accredito confermato", key, str(received))
    return {"ok": True}
