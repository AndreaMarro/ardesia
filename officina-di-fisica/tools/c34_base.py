"""Costruzione editoriale di C3–C4. I dati restano modificabili direttamente in JSON."""

import json
import math
import unicodedata
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
records = []
current = {}
checks = []


def slug(text):
    plain = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    )
    return re.sub(r"[^a-z0-9]+", "-", plain).strip("-")


def txt(s):
    return {"type": "text", "text": s}


def eq(s):
    return {"type": "formula", "text": s}


def fig(name, caption):
    return {"type": "figure", "src": "/figures/" + name + ".svg", "text": caption}


def blocks(seq):
    return [txt(x) if isinstance(x, str) else x for x in seq]


def lesson(course, num, title, coverage, prereqs, *body):
    global current
    ident = f"{course}-L{num:02d}"
    current = dict(
        id=ident,
        kind="lesson",
        course=course,
        section=title,
        order=num,
        title=title,
        skill=ident,
        prerequisites=[f"{course}-L{i:02d}" for i in prereqs],
        version=1,
        coverage=coverage.split("|"),
        blocks=blocks(body),
        review="revisione editoriale e scientifica assistita; controllo strutturale automatico",
    )
    records.append(current)


def enter(course, num):
    global current
    current = next(r for r in records if r["id"] == f"{course}-L{num:02d}")


def item(kind, title, prompt, level, body):
    group = [
        r for r in records if r["course"] == current["course"] and r["kind"] == kind
    ]
    tag = "E" if kind == "example" else "Q"
    n = len(group) + 1
    rec = dict(
        id=f"{current['course']}-{tag}{n:03d}",
        kind=kind,
        course=current["course"],
        section=current["title"],
        order=n,
        title=title,
        skill=current["id"],
        prerequisites=list(current["prerequisites"]),
        version=1,
        blocks=blocks(body),
        prompt=prompt,
        difficulty=level,
        family=slug(title),
        review="revisione editoriale e scientifica assistita; controllo strutturale automatico",
    )
    records.append(rec)
    return rec


def ex(title, prompt, level, *body):
    return item("example", title, prompt, level, body)


def question(
    title, prompt, level, answer, guide, category, correction, body, lab=False
):
    r = item("question", title, prompt, level, body)
    r.update(
        answer=answer,
        hints=[guide],
        error={
            "category": category,
            "message": correction,
            "target": ("lab:" + current["course"]) if lab else current["id"],
        },
    )
    return r


def num(
    title,
    prompt,
    level,
    value,
    unit,
    tol,
    verification,
    guide,
    category,
    correction,
    *body,
    lab=False,
):
    r = question(
        title,
        prompt,
        level,
        dict(type="numeric", value=value, unit=unit, tolerance=tol),
        guide,
        category,
        correction,
        body,
        lab,
    )
    checks.append((r["id"], value, verification, tol))
    return r


def choice(
    title, prompt, level, yes, others, guide, category, correction, *body, lab=False
):
    n = sum(
        r["kind"] == "question" and r["course"] == current["course"] for r in records
    )
    opts = list(others)
    opts.insert((3 * n + 1) % (len(opts) + 1), yes)
    return question(
        title,
        prompt,
        level,
        dict(type="choice", value=yes, options=opts),
        guide,
        category,
        correction,
        body,
        lab,
    )


def word(
    title, prompt, level, yes, aliases, guide, category, correction, *body, lab=False
):
    return question(
        title,
        prompt,
        level,
        dict(type="text", value=yes, aliases=aliases),
        guide,
        category,
        correction,
        body,
        lab,
    )


def save_course(course):
    data = [r for r in records if r["course"] == course]
    for kind, minimum in [("lesson", 10), ("example", 20), ("question", 100)]:
        count = sum(r["kind"] == kind for r in data)
        assert count >= minimum, (course, kind, count)
    for id_, value, calc, tol in checks:
        if id_.startswith(course):
            assert math.isfinite(calc) and math.isclose(
                value, calc, abs_tol=tol, rel_tol=1e-10
            ), (id_, value, calc, tol)
    target = ROOT / "content" / f"{course}.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
