"""Collaudo scientifico di C3 e C4 senza scrivere nei contenuti pubblicati."""

import itertools
import json
import math
import re
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET
import c34_base as base
import c34_termo
import c34_qtermo
import c34_elettro
import c34_qelettro

ROOT = Path(__file__).resolve().parents[1]
records = {
    r["id"]: r
    for c in ("C3", "C4")
    for r in json.loads((ROOT / "content" / (c + ".json")).read_text())
}

# Ricalcolo delle chiavi a partire dai dati del problema nelle schede di verifica.
# La risposta letta qui è quella pubblicata nel JSON, indipendente dallo script generatore.
numeric = {key: calculated for key, _, calculated, _ in base.checks}
quant = {
    r["id"] for r in records.values() if r.get("answer", {}).get("type") == "numeric"
}
assert quant == numeric.keys()
for key, calc in numeric.items():
    answer = records[key]["answer"]
    assert abs(calc - answer["value"]) <= answer.get("tolerance", 0) + 1e-11, (
        key,
        calc,
        answer,
    )
    if answer["tolerance"]:
        assert not math.isclose(
            answer["value"] + 3 * answer["tolerance"],
            calc,
            abs_tol=answer["tolerance"],
            rel_tol=0,
        ), key


# Esempi numerici: risultato nel testo pubblicato, ricavato di nuovo da dati e leggi.
# Il confronto usa la precisione dichiarata nel passaggio stampato.
def pair(token, calc):
    found = re.search(r"[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?$", token)
    assert found, token
    digits = found.group().lstrip("+-")
    mantissa, _, exponent = digits.partition("e")
    last = 10 ** (int(exponent or "0") - len(mantissa.partition(".")[2]))
    return token, float(found.group()), calc, last / 2 + 1e-10


cases = {
    "C3-E001": [pair("=299.2", 26 + 273.15), pair("=+8.0", 26 - 18)],
    "C3-E003": [pair("0.499", 0.02 * 8.314 * 300 / 100000 * 1000)],
    "C3-E004": [pair("=54", (40 + 100) * 330 / 300 - 100)],
    "C3-E005": [pair("T_f=30", (100 * 60 + 300 * 20) / 400)],
    "C3-E006": [pair("=60", (960 - 180 * 4) / 4)],
    "C3-E007": [pair("=18.79", (0.05 * 334000 + 0.05 * 4180 * 10) / 1000)],
    "C3-E008": [
        pair("=30.0", 10.02 / 334 * 1000),
        pair("= 50", 80 - 10.02 / 334 * 1000),
    ],
    "C3-E009": [pair("=960", 0.2 * 0.02 * 10 / 0.005 * 120)],
    "C3-E010": [pair("=35", 20 + (40 - 20) / (3 + 1) * 3)],
    "C3-E011": [pair("=+110", -50 - 80000 * (0.002 - 0.004))],
    "C3-E012": [pair("=170", (240 - 160) + 90)],
    "C3-E013": [
        pair("=100", 200 * 2 / 4),
        pair("=75.8", 200 * math.exp(1.4 * math.log(0.5))),
    ],
    "C3-E015": [pair("=200", (200000 - 100000) * (0.003 - 0.001))],
    "C3-E016": [pair("=-25", -(130 - 90) + 15)],
    "C3-E017": [pair("=0.30", (800 - 560) / 800), pair("=0.25", 1 - 300 / 400)],
    "C3-E018": [pair("=30", 270 * (300 / 270 - 1))],
    "C3-E019": [pair("=+0.100", 120 * (1 / 300 - 1 / 400))],
    "C3-E020": [pair("=5.76", 8.314 * math.log(2))],
    "C4-E001": [pair("=6.0e-5", 9e9 * abs(2e-9 * -3e-9) / (0.03**2))],
    "C4-E002": [pair("=+3", (8 - 2) / 2)],
    "C4-E003": [pair("=1800", 2 * 9e9 * 1e-9 / 0.1**2)],
    "C4-E004": [pair("=0.20", 0.5 * (4e-8 * 500 / 2e-6) * 0.2**2)],
    "C4-E005": [pair("=-60", -2 * (40 - 10)), pair("=+60", 2 * (40 - 10))],
    "C4-E006": [
        pair(
            "=2.7e-7",
            sum(9e9 * 1e-9**2 / 0.1 for _ in itertools.combinations(range(3), 2)),
        )
    ],
    "C4-E009": [pair("=200", 4 / 0.02), pair("=30", 6 / (4 / 0.02) * 1000)],
    "C4-E010": [pair("=0.50", (1.7e-8 * 2 / 0.068) * 1e6)],
    "C4-E011": [pair("=0.270", 9**2 / (100 + 200))],
    "C4-E012": [pair("=40", 1 / (1 / 60 + 1 / 120))],
    "C4-E013": [pair("=20", 4 * 5), pair("=50", 0.5 * 4 * 5**2)],
    "C4-E014": [pair("=4", 24 / 6), pair("=48", (24**2) / (2 * 6))],
    "C4-E015": [
        pair("=8", 12 * (1 / 3) / (1 / 3 + 1 / 6)),
        pair("=4", 12 * (1 / 6) / (1 / 3 + 1 / 6)),
    ],
    "C4-E016": [
        pair("=3", (2 * 9) / (2 + 4)),
        pair("=27", (2 * 9) ** 2 / (2 * (2 + 4))),
    ],
    "C4-E017": [pair("=2.09", 100 * 1.67e-27 * 2e5 / (1.6e-19 * 0.1))],
    "C4-E018": [pair("=0.040", 2 * 0.08 * 0.25 * math.sin(math.pi / 2))],
    "C4-E019": [pair("=0.20", 40 * (0.30 - 0.10) * 5e-4 / 0.020)],
}


def writing(r):
    text = (
        " ".join(b["text"] for b in r["blocks"])
        .replace("{,}", ".")
        .replace(",", ".")
        .replace(r"\simeq", "=")
    )
    return re.sub(r"\\cdot10\^\{(-?\d+)\}", r"e\1", text)


for key, proofs in cases.items():
    written = writing(records[key])
    for token, value, calculated, half in proofs:
        assert token in written, (key, token)
        assert abs(value - calculated) <= half, (key, token, calculated)
# Controlli qualitativi distinti dai ricalcoli quantitativi.
facts = {
    "C3-E002": ["lavoro di espansione", "chiuso"],
    "C3-E014": ["irreversibile", "uguale all’iniziale"],
    "C4-E007": ["sfera resta negativa", "Interrompendo il collegamento"],
    "C4-E008": ["campo più intenso", "forze opposte"],
    "C4-E020": ["senso orario", "flusso entrante"],
}
for key, parts in facts.items():
    for part in parts:
        assert part in writing(records[key]), (key, part)
assert set(cases) | set(facts) == {
    r["id"] for r in records.values() if r["kind"] == "example"
}

# Controlli limite e orientazione vettoriale.
assert 1 - 300 / 300 == 0
assert all(0 < 1 - 300 / t < 1 for t in (301, 400, 600, 10000))
assert all((1 / 300 - 1 / t) > 0 for t in (301, 310, 1000))
for ratio in (1.1, 2, 4):
    assert 0 < ratio ** (-1.4) < ratio ** (-1) < 1
for a, b in ((1, 1), (1, 1000), (4, 12)):
    assert 0 < 1 / (1 / a + 1 / b) < min(a, b) < a + b


def cross(a, b):
    return tuple(a[i - 2] * b[i - 1] - a[i - 1] * b[i - 2] for i in range(3))


assert cross((1, 0, 0), (0, 0, -1)) == (0, 1, 0)
assert cross((1, 0, 0), (0, 1, 0)) == (0, 0, 1)
assert cross((1, 0, 0), (1, 0, 0)) == (0, 0, 0)


# Dal tracciato vettoriale effettivamente esportato si recuperano pV e pVᵞ.
def drawn_curve(name, color):
    path = ROOT / "static" / "figures" / name
    svg = ET.parse(path)
    el = next(
        el
        for el in svg.getroot()
        if el.tag.endswith("path")
        and el.get("stroke") == color
        and el.get("d", "").count(" L") > 10
    )
    return [tuple(map(float, p.split(","))) for p in el.get("d")[1:].split(" L")]


for suffix, coords, initial, height, power in [
    ("C3-isoterma.svg", (72, 211), 78, 126, 1),
    ("C3-percorsi.svg", (76, 205), 91, 119, 1),
    ("C3-percorsi.svg", (76, 205), 91, 119, 1.4),
]:
    points = drawn_curve(suffix, "#16736b" if power > 1 else "#ac3825")
    for x, y in points:
        invariant = ((x - coords[0]) / initial) ** power * ((coords[1] - y) / height)
        assert abs(invariant - 1) < 0.005, (suffix, power, invariant)

print(
    f"{len(quant)} risposte numeriche ricalcolate, {len(cases)} esempi quantitativi e {len(facts)} esempi qualitativi controllati."
)
print(
    "Passati i controlli di orientazione, casi limite e geometria numerica delle curve p–V."
)
print(
    "Distribuzione delle risposte",
    dict(
        Counter(
            r["answer"]["type"] for r in records.values() if r["kind"] == "question"
        )
    ),
)
