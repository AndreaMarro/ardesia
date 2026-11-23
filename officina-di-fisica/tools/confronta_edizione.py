"""Compare an editorial revision to an actual previous application directory."""
import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server import store


def catalog(root):
    with patch.object(store, "BASE", root / "content"):
        return {r["id"]: r for r in store.catalog_seed()}


def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compare(previous, current, decisions):
    with decisions.open() as stream:
        expected = {r["id"] for r in csv.DictReader(stream, delimiter="\t") if r["esito_editoriale"] != "conserva"}
    old, new = catalog(previous), catalog(current)
    assert old.keys() == new.keys(), "È cambiato l'insieme degli identificativi"
    changed = {k for k in old if old[k] != new[k]}
    assert changed == expected, sorted(changed ^ expected)
    counts = {"question": 0, "experiment": 0, "benchProblems": 0}
    for key, first in old.items():
        second = new[key]
        if key in changed:
            assert second["version"] == first["version"] + 1, key
        for field in ("kind","course","skill","family","prerequisites","answer","difficulty","exam","assessmentProfile"):
            assert first.get(field) == second.get(field), (key, field)
        if first["kind"] == "question":
            counts["question"] += 1
        if first["kind"] == "experiment":
            counts["experiment"] += 1
            for field in ("anchor","topic","apparatus","engine","control","measure","references","substitution"):
                assert first.get(field) == second.get(field), (key, field)
        if first["kind"] == "bench":
            for a, b in zip(first["assessment"],second["assessment"], strict=True):
                assert (a["value"],a["unit"]) == (b["value"],b["unit"]), key
                counts["benchProblems"] += 1
    old_figures = list((previous / "static/figures").glob("*.svg"))
    for figure in old_figures:
        assert file_hash(figure) == file_hash(current / "static/figures" / figure.name), figure.name
    books = sorted((previous / "materials").glob("*.pdf"))
    new_books = {f.name for f in (current / "materials").glob("*.pdf")}
    assert {f.name for f in books} == new_books
    changed_books = [f.name for f in books if file_hash(f) != file_hash(current / "materials" / f.name)]
    return {"catalogue":len(old),"changed":len(changed),"unchanged":len(old)-len(changed),
            **counts, "historicalFigures":len(old_figures),"books":len(books),"changedBooks":changed_books}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("previous", type=Path, help="Cartella officina-di-fisica dell’edizione precedente")
    parser.add_argument("decisions", type=Path, help="Registro TSV delle decisioni editoriali per ID")
    args = parser.parse_args()
    print(json.dumps(compare(args.previous, ROOT, args.decisions), ensure_ascii=False, indent=2))
