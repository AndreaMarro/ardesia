"""Ricontrolla i dati pubblicati C1/C2 senza riscrivere JSON o immagini.

I risultati degli esempi sono ricalcolati da input SI e confrontati sia con
l'arrotondamento dichiarato sia con l'espressione realmente stampata in scheda.
"""

import json
import math
from decimal import Decimal
from pathlib import Path

from c12_build import Course
from c12_fluidi import build as build_fluids
from c12_meccanica import build as build_mechanics

ROOT = Path(__file__).resolve().parents[1]
s = math.sqrt
ang = math.radians
area_impulse = 0.5 * 0.20 * 40
collision_speed = (2 * 3 - 1) / (2 + 1)
buoyancy_difference = 5 - 3
columns_drop = 0.5 * 1000 * (3**2 - 1**2)

# Each check pairs a fresh calculation with the value and a literal result
# marker from the typeset solution. Decimal precision sets the rounding band.
examples = {
    "C1-E001": [(1050 * 8e-6, "8.4e-3", r"=8{,}4\times10^{-3}\,\mathrm{kg}")],
    "C1-E002": [(0.025 * 0.012, "3.0e-4", r"=3{,}0\times10^{-4}\,\mathrm m^2")],
    "C1-E003": [
        (math.hypot(30, 40), "50", r"=50\,\mathrm m"),
        (math.degrees(math.atan2(40, 30)), "53.1", r"\simeq53{,}1^\circ"),
    ],
    "C1-E004": [
        (20 * math.cos(ang(30)), "17.3", r"\simeq17{,}3\,\mathrm N"),
        (20 * math.sin(ang(30)), "10", r"=10\,\mathrm N"),
    ],
    "C1-E005": [
        (abs(6) + abs(-4), "10", r"=10\,\mathrm m"),
        ((2 - 0) / (6 - 0), "0.33", r"=0{,}33\,\mathrm{m/s}"),
    ],
    "C1-E006": [
        (6 / 3, "2", r"=2\,\mathrm{m/s^2}"),
        (-6 / 3, "-2", r"=-2\,\mathrm{m/s^2}"),
        (3 * 3 + 3 * 3, "18", r"=18\,\mathrm m"),
    ],
    "C1-E007": [(2 * s(2 * 1.25 / 10), "1.0", r"=1{,}0\,\mathrm m")],
    "C1-E008": [
        (math.tau * 0.2 / 2, "0.628", r"=0{,}628\,\mathrm{m/s}"),
        ((math.tau / 2) ** 2 * 0.2, "1.97", r"=1{,}97\,\mathrm{m/s^2}"),
    ],
    "C1-E009": [((10 - 6) / 4, "1.0", r"=1{,}0\,\mathrm{m/s^2}")],
    "C1-E010": [(6 * 9.8 + 6 * 1.5, "67.8", r"=67{,}8\,\mathrm N")],
    "C1-E011": [
        (0.4 * 8 * 10, "32", r"=32\,\mathrm N"),
        (-min(20, 0.4 * 8 * 10), "-20", r"=-20\,\mathrm N"),
    ],
    "C1-E012": [(0.15 * 9.8 / 0.03, "49", r"=49\,\mathrm{N/m}")],
    "C1-E013": [(12 * 10 * 1.5 / 3, "60", r"=60\,\mathrm W")],
    "C1-E014": [(s(1**2 + 2 * (4 / 2) * 3), "3.61", r"\simeq3{,}61\,\mathrm{m/s}")],
    "C1-E015": [(s(2 * (2 * 10 * 1.8 - 11) / 2), "5.0", r"=5{,}0\,\mathrm{m/s}")],
    "C1-E016": [(0.04 * s(250 / 0.10), "2.0", r"=2{,}0\,\mathrm{m/s}")],
    "C1-E017": [
        (area_impulse, "4.0", r"=4{,}0\,\mathrm{N\,s}"),
        (area_impulse / 2, "2.0", r"=2{,}0\,\mathrm{m/s}"),
    ],
    "C1-E018": [
        (collision_speed, "1.666666666667", r"5/3\,\mathrm{m/s}"),
        (
            0.5 * (2 * 9 + 1) - 0.5 * 3 * collision_speed**2,
            "5.33",
            r"\simeq5{,}33\,\mathrm J",
        ),
    ],
    "C1-E019": [
        (18 * 0.30 / 0.045, "120", r"=120\,\mathrm N"),
        (18 - 18 * 0.30 / 0.045, "-102", r"=-102\,\mathrm N"),
    ],
    "C1-E020": [
        ((3 * (-0.20) + 0.60) / 4, "0", r"=0\,\mathrm m"),
        (3 * 10 * 0.2, "6", r"=6\,\mathrm{N\,m}"),
    ],
    "C2-E001": [((0.0495 - 0.024) / 30e-6, "850", r"=850\,\mathrm{kg/m^3}")],
    "C2-E002": [((104e3 - 100e3) * 6e-4, "2.4", r"=2{,}4\,\mathrm N")],
    "C2-E003": [(1000 * 9.8 * 0.12, "1176", r"=1176\,\mathrm{Pa}")],
    "C2-E004": [(10 * (800 * 0.10 + 1000 * 0.25), "3300", r"=3300\,\mathrm{Pa}")],
    "C2-E005": [
        (40 / 5 * 60, "480", r"=480\,\mathrm N"),
        (12 * 5 / 60, "1", r"=1\,\mathrm{cm}"),
    ],
    "C2-E006": [((18000 - 1000 * 10 * 0.4) * 20e-4, "28", r"=28\,\mathrm N")],
    "C2-E007": [(450 * (1 - 800 / 1000), "90", r"=90\,\mathrm{cm^3}")],
    "C2-E008": [
        (
            buoyancy_difference / (1000 * 10),
            "2.0e-4",
            r"=2{,}0\times10^{-4}\,\mathrm{m^3}",
        ),
        (
            (5 / 10) / (buoyancy_difference / (1000 * 10)),
            "2500",
            r"=2500\,\mathrm{kg/m^3}",
        ),
    ],
    "C2-E009": [
        (120 / 40, "3.0", r"=3{,}0\,\mathrm{mL/s}"),
        (120e-6 / (40 * 15e-6), "0.20", r"=0{,}20\,\mathrm{m/s}"),
    ],
    "C2-E010": [
        (
            0.45 * math.pi * 0.002**2 / (4 * math.pi * 0.0015**2),
            "0.20",
            r"=0{,}20\,\mathrm{m/s}",
        )
    ],
    "C2-E011": [
        (columns_drop, "4000", r"=4000\,\mathrm{Pa}"),
        (columns_drop / (1000 * 10), "0.40", r"=0{,}40\,\mathrm m"),
    ],
    "C2-E012": [(s(2 * 10 * 0.80), "4.0", r"=4{,}0\,\mathrm{m/s}")],
    "C2-E013": [(0.40 * (0.30 / 0.002) * 0.020, "1.2", r"=1{,}2\,\mathrm N")],
    "C2-E014": [
        (0.4 * (1 - (1 / 2) ** 2), "0.30", r"=0{,}30\,\mathrm{m/s}"),
        (0.4 / 2, "0.20", r"=0{,}20\,\mathrm{m/s}"),
    ],
    "C2-E015": [(4.8 * 0.5**4, "0.30", r"=0{,}30\,\mathrm{mL/s}")],
    "C2-E016": [
        (
            math.pi * (1e-3) ** 4 * 1000 / (8 * 0.20 * 0.50e-6),
            "3.9e-3",
            r"\simeq3{,}9\times10^{-3}\,\mathrm{Pa\,s}",
        )
    ],
    "C2-E017": [
        ((22 - 4) / (2 + 4), "3", r"=3\,\mathrm{mL/s}"),
        (4 + 4 * (22 - 4) / (2 + 4), "16", r"=16\,\mathrm{kPa}"),
    ],
    "C2-E018": [
        (12 / 3, "4", r"=4\,\mathrm{mL/s}"),
        (12 / 6, "2", r"=2\,\mathrm{mL/s}"),
        (1 / (1 / 3 + 1 / 6), "2", r"=2\,\mathrm{kPa\,s/mL}"),
    ],
    "C2-E019": [(2 * 0.072 / (1000 * 10 * 0.00050), "0.0288", r"=0{,}0288\,\mathrm m")],
    "C2-E020": [
        (2 * 0.030 / 0.002, "30", r"=30\,\mathrm{Pa}"),
        (4 * 0.030 / 0.002, "60", r"=60\,\mathrm{Pa}"),
    ],
}


def main():
    answer_count = 0
    rows = {}
    for course, builder in [("C1", build_mechanics), ("C2", build_fluids)]:
        stored = json.loads((ROOT / "content" / (course + ".json")).read_text())
        rows.update({r["id"]: r for r in stored})
        generated = Course(course)
        builder(generated)
        qs = [r for r in stored if r["kind"] == "question"]
        assert {x[0] for x in generated.numeric} == {
            r["id"] for r in qs if r["answer"]["type"] == "numeric"
        }
        for key, expected, calculated in generated.numeric:
            a = rows[key]["answer"]
            assert (
                a["value"] == expected
                and abs(a["value"] - calculated) <= a["tolerance"] + 1e-12
            ), key
            answer_count += 1
    assert set(examples) == {r["id"] for r in rows.values() if r["kind"] == "example"}
    for key, checks in examples.items():
        formulas = " ".join(
            b["text"] for b in rows[key]["blocks"] if b["type"] == "formula"
        )
        for calc, printed, token in checks:
            assert token in formulas, (key, "risultato pubblicato discordante", token)
            rounding = 10 ** Decimal(printed).as_tuple().exponent / 2
            assert math.isclose(
                calc, float(printed), abs_tol=rounding + 1e-12, rel_tol=0
            ), (key, calc, printed)
    print(
        f"{answer_count} chiavi numeriche e {sum(map(len, examples.values()))} risultati in {len(examples)} esempi C1/C2 ricalcolati."
    )


if __name__ == "__main__":
    main()
