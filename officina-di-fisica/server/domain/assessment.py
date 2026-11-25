"""Grading and observable mastery. All inputs are supplied by the caller."""

import unicodedata
from collections import defaultdict
from collections.abc import Iterable, Mapping
from decimal import Decimal, InvalidOperation


def normalized(s):
    return " ".join(
        unicodedata.normalize("NFKC", str(s))
        .casefold()
        .replace("’", "'")
        .strip()
        .split()
    )


def matches(answer, value):
    if answer["type"] == "numeric":
        try:
            number = Decimal(str(value).strip().replace("−", "-").replace(",", "."))
            expected = Decimal(str(answer["value"]))
            tolerance = Decimal(str(answer.get("tolerance", 0)))
            return (
                number.is_finite()
                and expected - tolerance <= number <= expected + tolerance
            )
        except (InvalidOperation, ValueError, TypeError):
            return False
    if answer["type"] == "choice":
        # A selected option is an identity: M/m and V/v may denote different
        # physical quantities. Preserve legacy text normalization only when it
        # identifies one option unambiguously.
        options = answer.get("options", [])
        if value in options:
            return value == answer["value"]
        candidates = {option for option in options if normalized(option) == normalized(value)}
        if candidates:
            return candidates == {answer["value"]}
    return normalized(value) in {
        normalized(x) for x in [answer["value"], *answer.get("aliases", [])]
    }


def trace(history: Iterable[Mapping]) -> dict:
    groups = defaultdict(list)
    for a in history:
        groups[a["skill"]].append(a)
    result = {}
    for skill, attempts in groups.items():
        distinct = {}
        for a in attempts:
            # A later unaided attempt on a different family gives independent evidence.
            if a["aided"] == 0:
                distinct[a["family"]] = a
        recent = list(sorted(distinct.values(), key=lambda a: a["stamp"]))[-5:]
        good = sum(a["correct"] for a in recent)
        failures = len(recent) - good
        state = "da esplorare"
        if recent:
            state = "prima evidenza"
            if failures >= 2:
                state = "da consolidare"
            elif good >= 3 and good / len(recent) >= 0.75:
                state = "risultati stabili"
        last = max((a["stamp"] for a in recent), default=attempts[-1]["stamp"])
        days = 7 if state == "risultati stabili" else 3 if good and not failures else 1
        result[skill] = {
            "state": state,
            "families": len(recent),
            "good": good,
            "wrong": failures,
            "due": last + days * 86400,
            "last": last,
            "aided": sum(a["aided"] for a in attempts),
        }
    return result
