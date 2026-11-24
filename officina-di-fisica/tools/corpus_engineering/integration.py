"""Exercise the canonical import in disposable SQLite, preserving every published byte."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import re

from .pipeline import canonical, digest
from .runtime_fingerprint import assert_bundled_runtime

APP = Path(__file__).resolve().parents[2]
CODE = '''
import json,sys
from server import store
from tools.corpus_engineering.draft_import import import_drafts
from tools.corpus_engineering.pipeline import canonical,digest
store.initialize()
package=json.load(open(sys.argv[1]))
with store.connect() as db:
 before=store.published(db)
 ids=[r['id'] for r in package['records']]
 live_before={key:(head[0] if (head:=db.execute('SELECT live FROM heads WHERE id=?',(key,)).fetchone()) else None) for key in ids}
 versions_before={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 first=import_drafts(db,{'id':'owner','role':'autore'},package)
 second=import_drafts(db,{'id':'owner','role':'autore'},package)
 after=store.published(db)
 assert store.encode(before)==store.encode(after)
 count=len(package['records'])
 assert first['saved']==count and second['saved']==0 and second['unchanged']==count
 assert all(db.execute('SELECT live FROM heads WHERE id=?',(key,)).fetchone()[0]==live_before[key] for key in ids)
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==payload for key,payload in versions_before.items())
 print(canonical({'schemaVersion':'1.0.0','packageSha256':digest(package),
  'beforePublishedCount':len(before),'afterPublishedCount':len(after),
  'beforePublishedSha256':digest(before),'afterPublishedSha256':digest(after),
  'firstImport':first,'repeatedImport':second,'verifiedIds':ids,
  'preservedLiveHeads':sum(v is not None for v in live_before.values()),'preservedHistoricalVersions':len(versions_before),
  'publication':'DRAFT','database':'disposable_sqlite','humanApproval':'NOT_RUN'}))
'''


def exercise(batch="units-001"):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",batch):raise ValueError("Invalid batch ID")
    package=APP/"editorial/batches"/(batch+".json")
    return exercise_package(package)


def exercise_package(package):
    assert_bundled_runtime(APP)
    package=Path(package).resolve()
    with tempfile.TemporaryDirectory(prefix="cric-integration-") as home:
        run = subprocess.run([sys.executable, "-c", CODE, str(package)], cwd=APP,
            env={**os.environ, "ASTRA_DATA": home, "ASTRA_HOSTED": "0", "ASTRA_EXTENSIONS": str(APP/"extensions")}, capture_output=True, text=True, timeout=60)
    if run.returncode: raise ValueError(run.stdout + run.stderr)
    return json.loads(run.stdout)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch", default="units-001")
    args = parser.parse_args()
    result = exercise(args.batch)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result) + "\n")
    print(canonical({"drafts": result["firstImport"]["saved"], "unchangedPublished": result["afterPublishedCount"]}))
