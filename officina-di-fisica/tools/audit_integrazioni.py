"""Audit in sola lettura dei dieci esempi che completano la matrice 2026/27."""

import json
import math
import re
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "content" / "esempi-di-copertura.json").read_text())
bank = {r["id"]: r for r in rows}


def results(ident, values):
    text = (
        " ".join(b["text"] for b in bank[ident]["blocks"])
        .replace("{,}", ".")
        .replace(",", ".")
        .replace(r"\simeq", "=")
    )
    text = re.sub(r"\\cdot10\^\{(-?\d+)\}", r"e\1", text)
    for token, calc, tol in values:
        assert token in text, (ident, token)
        value = float(re.search(r"[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?$", token).group())
        assert abs(value - calc) <= tol + 1e-12, (ident, token, calc)


calcs = {
    "C1-E021": [
        ("=24", 0.8 * 30, 0.001),
        ("=56", 0.8 * 70, 0.001),
        ("=80", 0.8 * (30 + 70), 0.001),
        ("=0.80", (0.8 * 30 + 0.8 * 70) / (30 + 70), 0.001),
    ],
    "C1-E022": [
        ("=0", 4 - 4, 0.0001),
        ("=+0.80", 0.8 + 3 * (4 - 4), 0.001),
        ("=+2.4", 0.8 * 3, 0.001),
    ],
    "C1-E023": [
        ("=24", 120 * 0.20, 0.01),
        ("=-0.60", -120 / 40 * 0.20, 0.001),
        ("=+0.40", 120 / 60 * 0.20, 0.001),
    ],
    "C2-E021": [("=0.040", (0.30 - 0.18) / 3, 0.0001)],
    "C3-E021": [
        ("=40", 100 / (0.2 * 12.5), 0.01),
        ("=24.0", 100 / (0.2 * 20.8), 0.05),
        ("=60.1", 100 / (0.2 * 20.8) * 0.2 * 12.5, 0.05),
        ("=39.9", 0.2 * 8.3 * (100 / (0.2 * 20.8)), 0.05),
    ],
    "C3-E022": [
        ("=+5.89e-4", (998 * 20e-6 - 995 * 20e-6) * 9.81, 5e-7),
        ("=+0.59", (998 - 995) * 2e-5 * 9.81 * 1000, 0.005),
    ],
    "C3-E023": [
        ("=4.189", 0.008 * 5.67e-8 * 310**4, 0.0005),
        ("=3.674", 0.008 * 5.67e-8 * 300**4, 0.0005),
        ("=0.515", 0.008 * 5.67e-8 * (310**4 - 300**4), 0.0005),
    ],
    "C4-E021": [
        ("=25", math.hypot(15, 20), 0.001),
        ("=36.9", math.degrees(math.atan2(15, 20)), 0.05),
    ],
    "C5-E021": [
        ("=6.46", (340 - 17) * 0.020, 0.0001),
        ("=7.14", (340 + 17) * 0.020, 0.0001),
        ("=0.0190", 0.020 * (1 - 17 / 340), 0.00001),
        ("=0.0210", 0.020 * (1 + 17 / 340), 0.00001),
    ],
    "C5-E022": [
        ("=3.00e13", 3e8 / 10e-6, 1),
        ("=6.00e14", 3e8 / 500e-9, 1),
        ("=1.00e15", 3e8 / 300e-9, 1),
        ("=3.00e18", 3e8 / 0.10e-9, 1000),
        ("=3.00e20", 3e8 / 1e-12, 1e5),
    ],
}
assert set(calcs) == set(bank) and len(bank) == len(rows) == 10
for key, values in calcs.items():
    results(key, values)
    rec = bank[key]
    assert rec["kind"] == "example" and rec["family"] and rec["difficulty"] in (1, 2, 3)
    assert len(rec["blocks"]) >= 5
    for b in rec["blocks"]:
        if b["type"] == "figure":
            ElementTree.parse(ROOT / "static" / b["src"].lstrip("/"))
# Confronta il disegno in scala con gli intervalli calcolati da c e velocità della sorgente.
svg = ElementTree.parse(ROOT / "static" / "figures" / "C5-due-fronti.svg")
point = next(
    v for v in svg.getroot() if v.tag.endswith("circle") and v.get("cy") == "101"
)
assert math.isclose((float(point.get("cx")) - 115) / 25, (340 + 17) * 0.020)
assert math.isclose((455 - float(point.get("cx"))) / 25, (340 - 17) * 0.020)
print(
    f"{len(bank)} esempi autonomi, {sum(map(len, calcs.values()))} risultati fisici e riferimenti alle tavole verificati."
)
