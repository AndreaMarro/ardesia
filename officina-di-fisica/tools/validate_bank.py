"""Full-bank structural checks including the normal author import validator."""

import json
import os
import re
import sys
import tempfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
with tempfile.TemporaryDirectory() as home:
    os.environ["ASTRA_DATA"] = home
    from server import editor, learning, store

    store.initialize()
    raw = list(store.catalog_seed())
    objs = {r["id"]: r for r in raw}
    assert len(raw) == len(objs), "ID duplicato"
    errors = []
    with store.connect() as db:
        for r in raw:
            try:
                editor.validate(db, r, objs)
                for block in r["blocks"] + r.get("promptBlocks", []):
                    if block["type"] == "figure":
                        tree = ElementTree.parse(ROOT / "static" / block["src"][1:])
                        assert tree.getroot().tag.endswith("svg")
                    if block["type"] == "text":
                        assert block["text"].strip()
                if r["kind"] == "question":
                    assert learning.matches(r["answer"], r["answer"]["value"])
            except Exception as e:
                errors.append(r["id"] + " · " + str(e))
        for i in range(1, 6):
            group = [r for r in raw if r["course"] == "C" + str(i)]
            count = Counter(r["kind"] for r in group)
            qs = [r for r in group if r["kind"] == "question"]
            assert len({q["family"] for q in qs}) >= 100
            assert len({q["prompt"] for q in qs}) == len(qs)
            assert count["example"] >= 20 and count["lesson"] >= 1 and count["lab"] >= 1
            print("C" + str(i), dict(count))
        for n in (1, 2, 3):
            qs = [r for r in raw if r.get("exam") == n]
            assert len(qs) == 31 and len({r["order"] for r in qs}) == 31
            assert (
                sum(
                    r["answer"]["type"] == "choice" and len(r["answer"]["options"]) == 5
                    for r in qs
                )
                == 21
            )
            assert len({r["id"] for r in qs}) == 31
        if errors:
            sys.exit("\n".join(errors))
        print(len(raw), "record validati con riferimenti e chiavi coerenti.")
