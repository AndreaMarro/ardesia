"""Independent physics and editorial checks for the supplied C5/C6 edition.

Run: python3 tools/c56_audit.py
The numerical formulae use the inputs printed in the problems. No network,
PDF renderer, student database or mutable author draft is required.
"""

import json
import math
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
pi = math.pi


def read(course):
    return json.loads((ROOT / "content" / f"{course}.json").read_text())


def close(a, b, delta):
    assert abs(a - b) <= delta + 1e-10 * max(1, abs(a)), (a, b, delta)


def unique(values):
    assert len(set(values)) == len(values), values


# Reference values extracted from the stated physical inputs, in the requested units.
NUM5 = {
    1: (7 - (-7)) / 2,
    2: (0.85 - 0.10) / (6 - 1),
    3: 1 / (2 * 18e-3),
    6: 3 * pi / (2 * pi),
    11: 18 * 2,
    14: 2 * pi * 0.12 / 0.48,
    15: (1.60 - 0.40) / (0.24 - 0.16),
    17: 2 * pi / 2.5,
    19: 12 / 6 * 0.30,
    21: 1.2 + 0.8,
    23: abs(5 - 3),
    25: min(3 - 2.5, 2.5 - 2),
    29: 1.02 / 340 * 1000,
    31: 0.012 / (3 * 2e-4),
    32: 2 / (2**2),
    33: 0.80 * math.sqrt(9),
    37: 4 * 0.002 / 0.010,
    38: 3 * 1 * 1**2 * 1**2,
    39: 5 * 4 * math.cos(math.radians(60)),
    41: 1e-12 * 10**5 * 1e6,
    43: 10 * math.log10(1 / 100),
    45: 2 * 51 / 0.30,
    48: 1480 / 1000,
    50: 10 * math.log10(3),
    52: 3e8 / 150e6,
    56: (3 / 1) ** 2,
    57: 3e8 * 12e-9 / 2,
    59: 660 / 440,
    64: 0.8 * 0.25 * 100,
    65: -(0 - 2.1) / (3 - 0),
    66: (1 - 0.35) * 100,
    67: 2 * 3 / 10,
    68: 3e15 * 4e-19 * 1000,
    72: (210 - 4) - (84 - 2),
    73: 7 - 1,
    75: 0.693 / 0.231,
    76: 5e7 * 2e-5 / 1000,
    77: (1 - 2 ** (-4)) * 100,
    79: 180 / 0.25,
    81: 90 - 25,
    84: math.sin(pi / 4) / math.sin(pi / 6),
    85: 3e8 / 1.875e8,
    87: 50,
    89: 2 * 30,
    90: 2 * 4,
    91: 1 / (1 / 8 - 1 / 16),
    94: 1 / (1 / 24 + 1 / 40),
    95: -30 / 12,
    98: 10 * (1 + 1 / 2),
}
NUM6 = {
    1: 0.30 / 1500 * 1e6,
    2: 2e-4 * 25e3 / 10,
    3: 90 - 30 - 12,
    4: (12 / 60) * 5,
    5: 30 - 24,
    6: (900 - 600) * 0.8,
    7: 1 / 2**4,
    8: 1 / (0.5 / 3**2),
    9: 0.30 * 4 - 0.10 * 5,
    10: 2e3 / (10 * 0.25),
    12: 5 * 0.2 * 0.02 * 3 * 1000,
}
# ID, an independently derived output, its published rounded value, permitted
# rounding, and a text fragment that identifies the corresponding result.
EXAMPLES = {
    "C5-E001": (2 * pi / 0.50, 12.6, 0.05, "12{,}6"),
    "C5-E002": (-(5**2) * 12e-3, -0.30, 0.0001, "-0{,}30"),
    "C5-E003": (0.8 * 4 / 0.4 * 0.25, 2.0, 0.0001, "2{,}0"),
    "C5-E004": (-20 * pi / (4 * pi), -5.0, 0.0001, "-5{,}0"),
    "C5-E005": ((2 - 1) / 2, 0.5, 0.0001, "+0{,}5"),
    "C5-E006": (2 * ((2.7 - 2.1) / 0.40), 3, 0.0001, "3\\pi"),
    "C5-E007": (0.4 / (4 * pi * 2**2) * 3e-4 * 5, 1.2e-5, 1e-7, "1{,}2\\times10^{-5}"),
    "C5-E008": ((3 / 2) ** 2 * (40 / 80) ** 2, 0.5625, 0.0001, "0{,}5625"),
    "C5-E009": (1500 * (68 - 40) * 1e-6 / 2 * 100, 2.1, 0.001, "2{,}1"),
    "C5-E010": (10 * math.log10(10**6 + 10**7), 70.4, 0.05, "70{,}4"),
    "C5-E011": (600 / 1.5, 400, 0.01, "400"),
    "C5-E012": (30 / 3e8, 1e-7, 1e-12, "1{,}0\\times10^{-7}"),
    "C5-E013": (0.002 * 0.003 / (6.63e-34 * 5e14), 1.8e13, 5e11, "1{,}8\\times10^{13}"),
    "C5-E014": (math.log(2) / (-math.log(0.25) / 3), 1.5, 0.001, "1{,}50"),
    "C5-E015": (9 / math.log2((820 - 20) / (120 - 20)), 3.0, 0.001, "3{,}0"),
    "C5-E016": (24 - (11 + 1), 12, 0, "neutroni,f}=12"),
    "C5-E017": (math.degrees(math.asin(math.sin(pi / 4) / 1.5)), 28.1, 0.05, "28{,}1"),
    "C5-E018": (math.degrees(math.asin(1 / 1.33)), 48.8, 0.05, "48{,}8"),
    "C5-E019": (-3 * (1 / (1 / 10 - 1 / 30)) / 30, -1.5, 0.001, "-1{,}5"),
    "C5-E020": (-1 / ((1 / 12 - 1 / 6) * 6), 2, 0.001, "=+2"),
    "C6-E001": (2 * 0.60 / (0.60 / 3e-9) * 1e9, 6, 0.001, "6{,}0"),
    "C6-E002": (1000 * 0.0012 * 10 * 2 / (6 * 0.2 * 60) * 100, 33, 0.5, "33\\%"),
    "C6-E003": (0.75 * 0.5**2 * 8 * 120 / (0.050 * 4200), 0.86, 0.005, "0{,}86"),
    "C6-E004": (0.60 * (1 / 2) ** 2, 0.15, 0.001, "0{,}15"),
    "C6-E005": (85 - 120e3 * (2.5 - 2) * 1e-3, 25, 0.001, "+25"),
    "C6-E006": (200 * 10e-4 * 20 * 0.5 / 4, 0.5, 0.001, "0{,}50"),
}
# The numeric options have labels instead of raw floats. The label and its
# independently computed physical value are checked together.
EXAM_KEYS = {
    (1, 1): ("+2 m/s", (12 - 4) / (3 + 1), 2),
    (1, 3): ("+85 J", 60 + 25, 85),
    (1, 6): ("13 N", math.hypot(5, 12), 13),
    (1, 7): ("3 N verso il basso", 9 - 6, 3),
    (1, 8): ("3 Ω", 1 / (1 / 6 + 1 / (3 + 3)), 3),
    (1, 10): ("5 h", 15 / math.log2(960 / 120), 5),
    (1, 11): ("6 m/s", math.sqrt(2 * 10 * 1.8), 6),
    (1, 15): ("180 N", 18 * 0.30 / 0.03, 180),
    (1, 16): ("40%", (1 - 300 / 500) * 100, 40),
    (1, 20): ("3,0 N·s", 0.5 * 0.5 * 12, 3),
    (1, 21): ("30 °C", (15 + 45) / 2, 30),
    (2, 3): ("90 kPa", 180 / (1 + 1), 90),
    (2, 4): ("7,0 m", 2 * 1 + 0.5 * 10 * 1**2, 7),
    (2, 6): ("200 N", 8 * 100 / 4, 200),
    (2, 10): ("16 cm", 1 / (2 / (64 / 2)), 16),
    (2, 14): ("−37 J", -12 - (40 - 15), -37),
    (2, 16): ("6 cm/s", (12 - 2 - 7) / 0.5, 6),
    (2, 17): ("5 s", 80 / (8**2 / 4), 5),
    (2, 18): ("−3,0 m/s", -60 * 2 / 40, -3),
    (2, 19): ("−0,50 J/K", -(60 / 300 + 120 / 400), -0.5),
    (3, 2): ("2,5 × 10⁻⁴ m³", 250e-6, 0.00025),
    (3, 3): ("3/2", 3 / 2, 1.5),
    (3, 4): ("+400 Pa", 800 * 10 * 0.05, 400),
    (3, 5): ("180°", math.degrees(math.acos(-1)), 180),
    (3, 6): ("30 cm", 3 * 40 / (1 + 3), 30),
    (3, 8): ("24 µC", 12 / (1 / 3 + 1 / 6), 24),
    (3, 9): ("25%", (1 - 750 / 1000) * 100, 25),
    (3, 11): ("72 N", 48 * 6 / 4, 72),
    (3, 12): ("8,0 kJ", 0.004 * 2e6 / 1000, 8),
    (3, 14): ("3", 1 / (1 / 3), 3),
    (3, 15): ("49%", 100 * 0.70**2, 49),
    (3, 16): ("3 N", min(3, 7), 3),
    (3, 17): ("0,60 V", 20 * 0.003 / 0.1, 0.6),
    (3, 19): ("−10 J", 10 * 2 * math.cos(2 * pi / 3), -10),
    (3, 21): ("0 A", (8 / 2 - 8 / 2) / 2, 0),
}


def main():
    c5, c6 = read("C5"), read("C6")
    allrows = c5 + c6
    ids = {r["id"]: r for r in allrows}
    unique([r["id"] for r in allrows])
    unique([r["prompt"] for r in allrows if "prompt" in r])
    for course, data, expected in [("C5", c5, NUM5), ("C6", c6, NUM6)]:
        questions = [r for r in data if r["kind"] == "question"]
        actual = {
            int(r["id"].split("-Q")[1]): r["answer"]
            for r in questions
            if r["answer"]["type"] == "numeric"
        }
        assert actual.keys() == expected.keys()
        for i, a in actual.items():
            close(a["value"], expected[i], a["tolerance"])
            assert a["unit"]
        for r in questions:
            assert r["hints"] and r["error"]["message"] and r["blocks"]
            if r["answer"]["type"] == "choice":
                opts = r["answer"]["options"]
                unique(opts)
                assert opts.count(r["answer"]["value"]) == 1
    assert set(EXAMPLES) == {r["id"] for r in allrows if r["kind"] == "example"}
    for key, (calc, value, tol, fragment) in EXAMPLES.items():
        close(calc, value, tol)
        assert fragment in " ".join(b["text"] for b in ids[key]["blocks"]), key
    exams = {(r["exam"], r["order"]): r for r in c6 if r.get("exam")}
    for (sim, n), (key, calc, ref) in EXAM_KEYS.items():
        assert exams[(sim, n)]["answer"]["value"] == key, (sim, n)
        close(calc, ref, 1e-9)
    for sim in (1, 2, 3):
        for n in range(1, 32):
            a = exams[(sim, n)]["answer"]
            assert (
                (a["type"] == "choice" and len(a["options"]) == 5)
                if n <= 21
                else a["type"] == "text"
            )
        assert {r["skill"][:2] for r in exams.values() if r["exam"] == sim} == {
            "C1",
            "C2",
            "C3",
            "C4",
            "C5",
        }
    art = {
        b["src"]
        for r in allrows
        for b in r["blocks"] + r.get("promptBlocks", [])
        if b["type"] == "figure"
    }
    for src in art:
        svg = ElementTree.parse(ROOT / "static" / src.lstrip("/")).getroot()
        assert svg.get("viewBox") and svg.find("{http://www.w3.org/2000/svg}title").text
    # Cases corresponding to the two ray constructions in C5.
    for p, q in [(3, 1.5), (0.5, -1)]:
        close(1 / p + 1 / q, 1, 1e-12)
        parallel_ray_height = 1 - q
        axial_ray_height = -q / p
        close(parallel_ray_height, axial_ray_height, 1e-12)
    assert Counter(q["skill"] for q in c5 if q["kind"] == "question") == {
        f"C5-L{n:02}": 10 for n in range(1, 11)
    }
    unique([r["family"] for r in c5 if r["kind"] == "question"])
    unique([r["family"] for r in c6 if r["kind"] == "question"])
    print(
        f"{len(NUM5) + len(NUM6)} risposte numeriche, {len(EXAMPLES)} esempi, {len(EXAM_KEYS)} scelte quantitative verificate per ricalcolo."
    )
    print(
        f"3 fascicoli × 31 quesiti, 5 aree per fascicolo, {len(art)} figure referenziate e due costruzioni di raggi verificate."
    )


if __name__ == "__main__":
    main()
