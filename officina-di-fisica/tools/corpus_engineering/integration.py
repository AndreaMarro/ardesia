"""Exercise the canonical import in disposable SQLite, preserving every published byte."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

from .pipeline import canonical, digest

APP = Path(__file__).resolve().parents[2]
CODE = '''
import json
from server import store
from tools.corpus_engineering.draft_import import import_drafts
from tools.corpus_engineering.pipeline import canonical,digest
store.initialize()
package=json.load(open('editorial/batches/units-001.json'))
with store.connect() as db:
 before=store.published(db)
 first=import_drafts(db,{'id':'owner','role':'autore'},package)
 second=import_drafts(db,{'id':'owner','role':'autore'},package)
 after=store.published(db)
 assert store.encode(before)==store.encode(after)
 assert first['saved']==32 and second['saved']==0 and second['unchanged']==32
 ids=[r['id'] for r in package['records']]
 assert all(db.execute('SELECT live FROM heads WHERE id=?',(key,)).fetchone()[0] is None for key in ids)
 print(canonical({'schemaVersion':'1.0.0','packageSha256':digest(package),
  'beforePublishedCount':len(before),'afterPublishedCount':len(after),
  'beforePublishedSha256':digest(before),'afterPublishedSha256':digest(after),
  'firstImport':first,'repeatedImport':second,'verifiedIds':ids,
  'publication':'DRAFT','database':'disposable_sqlite','humanApproval':'NOT_RUN'}))
'''


def exercise():
    with tempfile.TemporaryDirectory(prefix="cric-integration-") as home:
        run = subprocess.run([sys.executable, "-c", CODE], cwd=APP,
            env={**os.environ, "ASTRA_DATA": home, "ASTRA_HOSTED": "0"}, capture_output=True, text=True, timeout=60)
    if run.returncode: raise ValueError(run.stdout + run.stderr)
    return json.loads(run.stdout)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = exercise()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result) + "\n")
    print(canonical({"drafts": result["firstImport"]["saved"], "unchangedPublished": result["afterPublishedCount"]}))
