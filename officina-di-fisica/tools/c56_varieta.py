"""Compare the three C6 examination booklets with each other and the five banks."""

import itertools
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def tokenize(s):
    return tuple(re.findall(r"\w+", unicodedata.normalize("NFKC", s).casefold()))


def fours(tokens):
    return frozenset(tuple(tokens[k : k + 4]) for k in range(len(tokens) - 3))


def main():
    records = [
        r
        for path in sorted((ROOT / "content").glob("*.json"))
        for r in json.loads(path.read_text())
        if "prompt" in r
    ]
    exam = [r for r in records if r.get("exam")]
    modules = [r for r in records if r["course"] in {"C1", "C2", "C3", "C4", "C5"}]
    assert len(exam) == 93 and len(modules) >= 600
    indices = {
        r["id"]: (tokenize(r["prompt"]), fours(tokenize(r["prompt"])))
        for r in exam + modules
    }
    for name, pairs in [
        ("Fascicoli rispetto ai cinque moduli", itertools.product(exam, modules)),
        ("Confronti interni ai fascicoli", itertools.combinations(exam, 2)),
    ]:
        hits = []
        strongest = (0, None, None)
        count = 0
        for a, b in pairs:
            count += 1
            wa, sa = indices[a["id"]]
            wb, sb = indices[b["id"]]
            if wa == wb:
                hits.append((a["id"], b["id"]))
            union = sa | sb
            sim = len(sa & sb) / len(union) if union else 0
            strongest = (
                max(strongest, (sim, a["id"], b["id"]))
                if strongest[1]
                else (sim, a["id"], b["id"])
            )
        print(
            f"{name}: {count} coppie, {len(hits)} enunciati identici; massimo Jaccard di gruppi di 4 parole {strongest[0]:.3f} per {strongest[1]}, {strongest[2]}."
        )
        assert not hits, hits
    for n in (1, 2, 3):
        group = [r for r in exam if r["exam"] == n]
        print(
            f"Fascicolo {n}: {dict(sorted(Counter(r['skill'][:2] for r in group).items()))}; difficoltà {dict(sorted(Counter(r['difficulty'] for r in group).items()))}."
        )


if __name__ == "__main__":
    main()
