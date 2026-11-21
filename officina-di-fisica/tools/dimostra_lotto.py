"""Importa lotti reali su una copia usa-e-getta, verifica lo storico ed esporta il seed."""

import argparse
import json
import math
import os
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))
p = argparse.ArgumentParser()
p.add_argument("--congela", action="store_true")
args = p.parse_args()
with tempfile.TemporaryDirectory() as scratch:
    os.environ["ASTRA_DATA"] = scratch
    from server import store, editor, learning

    store.initialize()
    pkg = json.loads((root / "docs/lotti/lotto-001.json").read_text())
    keys = [r["id"] for r in pkg["records"]]
    with store.connect() as db:
        # Reconstruct the pre-import edition only inside the temporary database.
        for k in keys:
            db.execute("delete from versions where id=?", (k,))
            db.execute("delete from heads where id=?", (k,))
        owner = db.execute("select * from users where id='owner'").fetchone()
        rows = store.published(db)
        run = learning.start(
            db,
            owner,
            rows,
            dict(
                requestId="verifica-contenuti",
                mode="practice",
                course="C1",
                item="C1-Q001",
            ),
        )
        q = store.record(db, "C1-Q001")
        learning.details(
            db,
            owner,
            rows,
            run["id"],
            dict(action="answer", idx=0, value=q["answer"]["value"]),
        )
        old = [tuple(r) for r in db.execute("select * from attempts")]
        pre = editor.imported(db, owner, pkg, False)
        assert not pre["errors"] and not pre["saved"]
        saved = editor.imported(db, owner, pkg, True)
        assert saved["saved"]
        assert all(k not in {r["id"] for r in store.published(db)} for k in keys)
        assert editor.publish(db, owner, {k: 1 for k in keys})["count"] == 2
        projected = [store.record(db, k) for k in keys]
        buoy, calorimeter = (
            next(r for r in projected if r["kind"] == k)
            for k in ("example", "question")
        )
        area = 20 * (1e-2) ** 2
        stiffness = 1000 * 9.81 * area
        immersion = 0.32 / (1000 * area)
        period = 2 * math.pi * math.sqrt(0.32 / stiffness)
        assert math.isclose(immersion, 0.16) and immersion + 0.01 < 0.30
        assert round(-stiffness * 0.01, 3) == -0.196
        assert (
            "0{,}80" in " ".join(b["text"] for b in buoy["blocks"])
            and round(period, 2) == 0.80
        )
        flow_ml_s = 8.0 / (4000 * 0.50) / 1000 * 1e6
        assert calorimeter["answer"]["unit"] == "mL/s"
        assert learning.matches(calorimeter["answer"], flow_ml_s)
        assert old == [tuple(r) for r in db.execute("select * from attempts")]
        assert learning.details(db, owner, store.published(db), run["id"])["items"][0][
            "correct"
        ]
        duplicate = editor.imported(db, owner, pkg, False)
        assert duplicate["errors"]
        if args.congela:
            for item in projected:
                item["review"] = "controlli strutturali e ricalcolo del lotto 001"
            (root / "content/lotto-001.json").write_text(
                json.dumps(projected, ensure_ascii=False, indent=2) + "\n"
            )
        print(
            "2 record importati in bozza e pubblicati. Ricalcolati periodo del galleggiante e portata calorimetrica. Verificati storico del tentativo e rifiuto dei duplicati."
        )
