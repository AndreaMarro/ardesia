"""Assembla le schede C1/C2 scritte in italiano ed esegue i controlli editoriali."""

import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]


def slug(text):
    plain = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    )
    return re.sub(r"[^a-z0-9]+", "-", plain).strip("-")


def blocks(lines):
    result = []
    for raw in lines.strip().replace("~", "\n").split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("$"):
            result.append(dict(type="formula", text=line[1:]))
        elif line.startswith("@"):
            stem, caption = line[1:].split("|", 1)
            result.append(dict(type="figure", src=f"/figures/{stem}.svg", text=caption))
        else:
            result.append(dict(type="text", text=line))
    return result


class Course:
    def __init__(self, code):
        self.code = code
        self.rows = []
        self.counts = Counter()
        self.skill = None
        self.numeric = []

    def add(self, kind, title, lines, extra):
        self.counts[kind] += 1
        prefix = {"lesson": "L", "example": "E", "question": "Q"}[kind]
        rid = f"{self.code}-{prefix}{self.counts[kind]:03d}"
        if kind == "lesson":
            self.skill = rid
        order = self.counts[kind]
        row = dict(
            id=rid,
            kind=kind,
            course=self.code,
            section=self.section,
            order=order,
            title=title,
            skill=self.skill,
            prerequisites=self.prereqs if kind == "lesson" else [self.skill],
            version=1,
            blocks=blocks(lines),
            **extra,
        )
        self.rows.append(row)
        return row

    def lesson(self, title, section, coverage, lines, prereqs=()):
        self.section = section
        self.prereqs = [f"{self.code}-L{i:03d}" for i in prereqs]
        return self.add("lesson", title, lines, dict(coverage=coverage.split("|")))

    def example(self, title, difficulty, prompt, lines):
        return self.add(
            "example",
            title,
            lines,
            dict(difficulty=difficulty, prompt=prompt, family=slug(title)),
        )

    def _q(self, title, prompt, answer, hint, lines, issue, level):
        category, feedback = issue.split("|", 1)
        row = self.add(
            "question",
            title,
            lines,
            dict(
                difficulty=level,
                prompt=prompt,
                family=slug(title),
                answer=answer,
                hints=[hint],
                error=dict(category=category, message=feedback, target=self.skill),
            ),
        )
        return row

    def num(self, title, prompt, value, unit, tol, check, hint, why, issue, level=2):
        assert math.isclose(value, check, abs_tol=tol, rel_tol=1e-9), (
            title,
            value,
            check,
        )
        row = self._q(
            title,
            prompt,
            dict(type="numeric", value=value, unit=unit, tolerance=tol),
            hint,
            why,
            issue,
            level,
        )
        self.numeric.append((row["id"], value, check))

    def choice(self, title, prompt, correct, wrong, hint, why, issue, level=2):
        options = [correct] + wrong.split("|")
        k = (self.counts["question"] * 7 + 1) % len(options)
        options = options[k:] + options[:k]
        return self._q(
            title,
            prompt,
            dict(type="choice", value=correct, options=options),
            hint,
            why,
            issue,
            level,
        )

    def word(self, title, prompt, word, aliases, hint, why, issue, level=1):
        return self._q(
            title,
            prompt,
            dict(type="text", value=word, aliases=[a for a in aliases.split("|") if a]),
            hint,
            why,
            issue,
            level,
        )

    def save(self):
        assert len({r["id"] for r in self.rows}) == len(self.rows)
        qs = [r for r in self.rows if r["kind"] == "question"]
        assert len({q["prompt"] for q in qs}) == len(qs)
        assert len({q["family"] for q in qs}) == len(qs)
        for r in self.rows:
            assert len(r["blocks"]) >= 1
            for b in r["blocks"] + r.get("promptBlocks", []):
                if b["type"] == "figure":
                    path = ROOT / "static" / b["src"].lstrip("/")
                    ElementTree.parse(path)
                if b["type"] == "formula":
                    assert b["text"].count("{") == b["text"].count("}"), (
                        r["id"],
                        b["text"],
                    )
        dest = ROOT / "content" / f"{self.code}.json"
        tmp = dest.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(self.rows, ensure_ascii=False, indent=2) + "\n")
        tmp.replace(dest)
        print(self.code, dict(self.counts), "calcoli ricalcolati", len(self.numeric))


if __name__ == "__main__":
    from c12_figures import generate
    from c12_supplement import generate as more_figures, enrich
    from c12_meccanica import build as mech
    from c12_fluidi import build as fluid

    generate()
    more_figures()
    for code, build in [("C1", mech), ("C2", fluid)]:
        c = Course(code)
        build(c)
        enrich(c)
        assert c.counts["example"] >= 20 and c.counts["question"] >= 100
        c.save()
