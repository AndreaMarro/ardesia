"""Proiezione S19; soluzione e diagnosi appartengono al solo Kirchhoff."""

from copy import deepcopy
from fractions import Fraction
from hashlib import sha256
import json
import math
import re

from .engine import SOURCE_SHA, assert_engine

SCHEMA = "s19-circuit.v1"
DEFAULT_DOCUMENT = {
    "schema": SCHEMA,
    "components": [
        {"id": "V1", "kind": "V", "a": "b", "b": "0", "value": "12"},
        {"id": "R1", "kind": "R", "a": "b", "b": "a", "value": "100"},
        {"id": "R2", "kind": "R", "a": "a", "b": "0", "value": "200"},
    ],
    "question": {"quantity": "voltage", "target": "R2"},
    "prediction": "",
    "trace": None,
    "notes": "",
    "layout": {},
}
_NAME = re.compile(r"^[A-Za-z0-9_]{1,24}$")
_EXACT = re.compile(r"^[+-]?(?:\d{1,16}(?:\.\d{0,16})?|\.\d{1,16})(?:/\d{1,16})?$")


def read_document(value):
    """Input esclusivamente dichiarativi: un risultato importato non è prova."""
    if (
        not isinstance(value, dict)
        or set(value) != set(DEFAULT_DOCUMENT)
        or value["schema"] != SCHEMA
    ):
        raise ValueError(
            "Documento S19 non riconosciuto; importa solo gli input della versione v1."
        )
    d = deepcopy(value)
    if not isinstance(d["components"], list) or not 1 <= len(d["components"]) <= 32:
        raise ValueError("Indica da uno a 32 componenti.")
    ids = set()
    nodes = set()
    for c in d["components"]:
        if not isinstance(c, dict) or set(c) != {"id", "kind", "a", "b", "value"}:
            raise ValueError("Componente non riconosciuto.")
        if any(not isinstance(c[k], str) for k in c) or c["kind"] not in (
            "R",
            "V",
            "I",
        ):
            raise ValueError(
                "La prima lezione supporta resistori e sorgenti DC indipendenti."
            )
        if any(not _NAME.fullmatch(c[k]) for k in ("id", "a", "b")) or not c[
            "id"
        ].startswith(c["kind"]):
            raise ValueError(
                "Identificatori non validi; usa la lettera del componente e nomi semplici."
            )
        if c["id"] in ids or c["a"] == c["b"]:
            raise ValueError(
                "Identificatore duplicato o componente in corto sui propri morsetti."
            )
        if not _EXACT.fullmatch(c["value"]):
            raise ValueError("Usa un intero, un decimale o una frazione esatta.")
        try:
            number = Fraction(c["value"])
        except (ValueError, ZeroDivisionError):
            raise ValueError("Valore esatto non valido.") from None
        if (
            number.denominator > 10**16
            or abs(number) > 10**9
            or (c["kind"] == "R" and number < Fraction(1, 10**6))
        ):
            raise ValueError("Valore fuori dal dominio DC S19.")
        if c["kind"] in ("V", "I") and abs(number) > 1000:
            raise ValueError("Sorgente fuori dal dominio DC S19.")
        ids.add(c["id"])
        nodes.update((c["a"], c["b"]))
    if len(nodes) > 24 or "0" not in nodes:
        raise ValueError("Servono il riferimento 0 e al massimo 24 nodi.")
    q = d["question"]
    if (
        not isinstance(q, dict)
        or set(q) != {"quantity", "target"}
        or q["quantity"] not in ("voltage", "current")
        or q["target"] not in ids
    ):
        raise ValueError("Indica una tensione o corrente e un componente esistente.")
    if (
        not isinstance(d["prediction"], str)
        or len(d["prediction"]) > 100
        or not isinstance(d["notes"], str)
        or len(d["notes"]) > 2000
    ):
        raise ValueError("Previsione o note troppo lunghe.")
    if d["trace"] is not None:
        t = d["trace"]
        if (
            not isinstance(t, dict)
            or set(t) != {"schema", "circuit_fingerprint", "steps"}
            or t["schema"] != "student-trace.v1"
            or not isinstance(t["steps"], list)
            or not 1 <= len(t["steps"]) <= 32
        ):
            raise ValueError("Procedimento strutturato non riconosciuto.")
        fingerprint = t.get("circuit_fingerprint")
        if not isinstance(fingerprint, str) or not re.fullmatch(
            r"[0-9a-f]{64}", fingerprint
        ):
            raise ValueError("Impronta del procedimento non valida.")
        for step in t["steps"]:
            if not isinstance(step, dict):
                raise ValueError("Passaggio non strutturato.")
            if set(step) - {
                "transcription",
                "operation",
                "first",
                "second",
                "claimed_value",
                "reading",
            } or any(
                not isinstance(step.get(k), str) or len(step[k]) > 500
                for k in ("transcription", "operation", "first", "second")
            ):
                raise ValueError("Riferimenti del passaggio non validi.")
            claim = step.get("claimed_value")
            if claim is not None and (
                not isinstance(claim, str)
                or len(claim) > 100
                or "e" in claim.lower()
                or sum(c.isdigit() for c in claim) > 32
            ):
                raise ValueError(
                    "Indica il valore con decimali o frazioni entro 32 cifre, senza esponenti."
                )
        if len(json.dumps(t)) > 12000:
            raise ValueError("Procedimento troppo lungo.")
    if not isinstance(d["layout"], dict) or set(d["layout"]) - nodes:
        raise ValueError("Posizione riferita a un nodo assente.")
    for pos in d["layout"].values():
        if (
            not isinstance(pos, dict)
            or set(pos) != {"x", "y"}
            or any(
                type(x) not in (float, int) or abs(x) > 10000 or not math.isfinite(x)
                for x in pos.values()
            )
        ):
            raise ValueError("Posizione non valida.")
    if d["trace"] is not None:
        units = {"R": "ohm", "V": "volt", "I": "ampere"}
        lines = [
            f"{c['id']} {c['a']} {c['b']} {c['value']} {units[c['kind']]}"
            for c in d["components"]
        ]
        text = "\n".join(lines + [f"? {q['quantity']} {q['target']}"])
        if d["trace"]["circuit_fingerprint"] != sha256(text.encode()).hexdigest():
            raise ValueError(
                "Il circuito è cambiato: ricontrolla i passaggi sulla revisione attuale."
            )
    if len(json.dumps(d, ensure_ascii=False)) > 16000:
        raise ValueError("Documento troppo grande.")
    return d


def netlist(document):
    d = read_document(document)
    units = {"R": "ohm", "V": "volt", "I": "ampere"}
    lines = [
        f"{c['id']} {c['a']} {c['b']} {c['value']} {units[c['kind']]}"
        for c in d["components"]
    ]
    return "\n".join(
        lines + [f"? {d['question']['quantity']} {d['question']['target']}"]
    )


def diagnose(document):
    return solve(document)["diagnosis"]


def solve(document):
    assert_engine()
    from kirchhoff.pipeline.lesson import create_lesson
    from kirchhoff.pipeline.student_trace import diagnose_payload

    d = read_document(document)
    text = netlist(d)
    lesson = create_lesson(text, method="nodal", source_sha=SOURCE_SHA)
    diagnosis = None
    if d["trace"] is not None:
        if lesson["outcome"] == "solved":
            diagnosis = diagnose_payload(text, d["trace"])
        else:
            diagnosis = {
                "schema": "student-diagnosis.v1",
                "outcome": "not_assessable",
                "category": "proof",
                "message": "La lezione DC non è risolta sul circuito attuale: il procedimento non viene valutato.",
            }
    return {
        "fingerprint": sha256(text.encode()).hexdigest(),
        "lesson": lesson,
        "diagnosis": diagnosis,
    }


def export_document(document, format):
    assert_engine()
    d = read_document(document)
    if format == "json":
        return json.dumps(d, ensure_ascii=False, sort_keys=True, indent=2)
    if format == "spice":
        from kirchhoff.pipeline.spice import export_spice

        return export_spice(netlist(d))
    if format == "circuitikz":
        from kirchhoff.pipeline.circuitikz import export_circuitikz

        return export_circuitikz(netlist(d))
    raise ValueError("Formato di esportazione non supportato.")
