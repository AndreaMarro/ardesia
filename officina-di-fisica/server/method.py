"""Validate the two versioned workshop formats before a draft enters the library."""
import math
import re
from .store import require


def text(value):
    return isinstance(value, str) and bool(value.strip())


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def chart(data):
    require(isinstance(data, dict), "Mancano i dati del grafico.")
    low = data.get("ymin", 0)
    require(text(data.get("x")) and text(data.get("y")), "Indica grandezze e unità dei due assi.")
    require(number(data.get("xmax")) and data["xmax"] > 0 and number(low)
            and number(data.get("ymax")) and data["ymax"] > low, "Scale del grafico non valide.")
    pairs = data.get("points")
    require(isinstance(pairs, list) and len(pairs) == 2 and all(
        isinstance(pair, list) and len(pair) == 2 and all(number(v) for v in pair)
        and 0 <= pair[0] <= data["xmax"] and low <= pair[1] <= data["ymax"]
        for pair in pairs) and pairs[0][0] < pairs[1][0], "Servono due punti ordinati nel grafico.")
    if "wave" in data:
        require(number(data["wave"]) and data["wave"] > 0 and low == -data["ymax"],
                "Periodo spaziale o temporale e ampiezza non validi.")


def validate_method(record):
    steps = record.get("steps")
    require(isinstance(steps, list) and 1 <= len(steps) <= 30, "Controlla i passaggi dell’attività.")
    fmt = record.get("format")
    require(fmt in ("formula", "graph"), "Scegli formula o grafico.")
    if fmt == "formula":
        symbols = record.get("symbols")
        require(all(text(record.get(k)) for k in ("prompt", "relation", "target"))
                and isinstance(symbols, list) and 1 <= len(symbols) <= 12
                and all(text(s) and re.fullmatch(r"[A-Za-z]+[0-9]*", s) for s in symbols)
                and len(set(symbols)) == len(symbols) and record["target"] not in symbols,
                "Verifica consegna, relazione, incognita e simboli.")
    else:
        data = record.get("diagram")
        chart(data)
        require(isinstance(data.get("captions"), list) and len(data["captions"]) == 3
                and all(text(c) for c in data["captions"]), "Scrivi una didascalia per ciascuna fase.")
        if "comparison" in data:
            chart(data["comparison"])
    for step in steps:
        require(isinstance(step, dict) and all(text(step.get(k)) for k in ("prompt","hint","why")),
                "Ogni passaggio richiede domanda, suggerimento e spiegazione.")
        kind, answer = step.get("kind"), step.get("answer")
        if kind == "choice":
            choices = step.get("options")
            require(isinstance(choices, list) and len(choices) >= 2 and all(text(c) for c in choices)
                    and len(set(choices)) == len(choices) and answer in choices, "Controlla le alternative e la chiave.")
        elif kind == "number":
            require(number(answer), "Inserisci una risposta numerica finita.")
        else:
            require(fmt == "formula" and kind == "expression" and text(answer), "Tipo di risposta non valido.")
    if fmt == "graph":
        phases = [step.get("stage") for step in steps]
        require(all(type(p) is int for p in phases) and set(phases) == {0,1,2}
                and sorted(phases) == phases, "Servono le tre fasi in ordine.")
    else:
        require({"choice", "expression", "number"} <= {s["kind"] for s in steps},
                "Includi la scelta, la formula isolata e il calcolo.")
