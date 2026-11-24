"""Actual canonical importer in an isolated process; no simulated publication."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

APP = Path(__file__).resolve().parents[2]


class DraftIntegration(unittest.TestCase):
    def test_import_is_idempotent_private_and_keeps_existing_edition(self):
        code = '''
import json
from server import store, editor
from tools.corpus_engineering.draft_import import import_drafts
store.initialize()
package=json.load(open('editorial/batches/units-001.json'))
with store.connect() as db:
    published=store.published(db)
    before=store.encode(published)
    old_versions=db.execute('SELECT count(*) FROM versions').fetchone()[0]
    a=import_drafts(db,{'id':'owner','role':'autore'},package)
    assert a['saved']==32, a
    assert store.encode(store.published(db))==before
    b=import_drafts(db,{'id':'owner','role':'autore'},package)
    assert b['saved']==0 and b['unchanged']==32, b
    assert db.execute('SELECT count(*) FROM versions').fetchone()[0]==old_versions+32
    assert db.execute("SELECT count(*) FROM heads WHERE id LIKE 'AR-%' AND live IS NOT NULL").fetchone()[0]==0
    broken=json.loads(json.dumps(package)); broken['records'][0]['prompt']='A changed concurrent draft'
    try: import_drafts(db,{'id':'owner','role':'autore'},broken)
    except ValueError: pass
    else: raise AssertionError('Concurrent draft was overwritten')
    assert store.encode(store.published(db))==before
print('32 drafts; repeated import writes 0; 991 published objects unchanged; no draft live')
'''
        with tempfile.TemporaryDirectory() as home:
            run = subprocess.run([sys.executable, "-c", code], cwd=APP,
                env={**os.environ, "ASTRA_DATA": home, "ASTRA_HOSTED": "0"}, capture_output=True, text=True, timeout=40)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)


if __name__ == "__main__": unittest.main()
