"""Collaudo HTTP di una nuova edizione, da un vero checkout precedente su dati sintetici."""
import argparse
import csv
import json
import sqlite3
import subprocess
import sys
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def commit(directory):
    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=directory, text=True).strip()


def snapshot(database):
    with closing(sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)) as db:
        assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        return {name: list(db.execute(f'SELECT * FROM "{name}" ORDER BY rowid')) for (name,) in tables}


def expected_changes(course):
    decisions = ROOT / "docs/verifica-prodotto" / f"revisione-{course.lower()}.tsv"
    with decisions.open() as stream:
        return {r["id"] for r in csv.DictReader(stream, delimiter="\t") if r["esito_editoriale"] != "conserva"}


def compare_tables(previous, current, expected):
    assert previous.keys() == current.keys()
    for table, old in previous.items():
        new = current[table]
        if table == "versions":
            assert set(old) <= set(new)
            assert {(row[0], row[1]) for row in set(new) - set(old)} == {(key, 2) for key in expected}
        elif table == "heads":
            changes = [(a, b) for a, b in zip(old, new, strict=True) if a != b]
            assert {a[0] for a, _ in changes} == expected
            assert all(a[0] == b[0] and (a[1], b[1]) == (1, 2) and a[2:] == b[2:] for a, b in changes)
        else:
            assert old == new, table


def result(detail):
    return {key: detail[key] for key in ("items", "result")}


def verify(previous, item, answer):
    # Questa prova usa le API e lo schema della vecchia installazione per creare i dati.
    sys.path.insert(0, str(previous / "tests"))
    import test_workflows as old_app

    course = item.split("-")[0]
    expected = expected_changes(course)
    assert item in expected
    workflow = old_app.Workflows()
    try:
        workflow.setUp()
        workflow.grant(course)
        old_run = workflow.start_run(course=course, item=item)
        workflow.view(old_run, {"action": "answer", "idx": 0, "value": answer})
        first = result(workflow.view(old_run, {"action": "finish"}))
        assert first["items"][0]["correct"] and first["items"][0]["version"] == 1
        other = workflow.client().register("secondo-quaderno@example.test")
        workflow.view(old_run, client=other, expected=404)
        before_commerce = workflow.admin.fetch("/api/author/commerce")
        workflow.stop_server()
        database = workflow.data / "officina.sqlite3"
        before = snapshot(database)
        old_app.ROOT = ROOT

        def reopen():
            workflow.open_server()
            for client in (workflow.student, workflow.admin, other):
                client.base = workflow.base

        first_boot = None
        for _ in range(2):
            reopen()
            assert result(workflow.view(old_run)) == first
            assert workflow.admin.fetch("/api/author/commerce") == before_commerce
            workflow.view(old_run, client=other, expected=404)
            workflow.stop_server()
            after = snapshot(database)
            compare_tables(before, after, expected)
            if first_boot is not None:
                assert after == first_boot
            first_boot = after

        reopen()
        new_run = workflow.start_run(course=course, item=item)
        workflow.view(new_run, {"action": "answer", "idx": 0, "value": answer})
        latest = result(workflow.view(new_run, {"action": "finish"}))
        assert latest["items"][0]["version"] == 2 and latest["items"][0]["correct"]
        assert latest["items"][0]["solution"] != first["items"][0]["solution"]
        assert first["result"]["score"] == latest["result"]["score"] == 1
        assert first["result"]["right"] == latest["result"]["right"] == 1
        workflow.view(new_run, client=other, expected=404)
        assert result(workflow.view(old_run)) == first
        return {"before": commit(previous), "examined": commit(ROOT), "item": item,
                "tables": len(after), "historicalVersions": len(before["versions"]), "editionsAdded": len(expected),
                "previousAttempts": len(before["attempts"]), "grants": len(before["access"]),
                "orders": len(before["orders"]), "pinnedVersions": [1, 2], "score": latest["result"]["score"],
                "twoIdenticalBoots": True, "separateLearners": True}
    finally:
        workflow.doCleanups()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("previous", type=Path, help="Directory officina-di-fisica della precedente edizione")
    parser.add_argument("item", help="ID di un quesito di allenamento con nuovo svolgimento")
    parser.add_argument("answer", help="Risposta dell’allievo sintetico")
    args = parser.parse_args()
    print(json.dumps(verify(args.previous.resolve(), args.item, args.answer), ensure_ascii=False, indent=2))
