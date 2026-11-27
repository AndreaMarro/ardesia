"""Check the real canonical manometer import and the collector's owner identity."""

from hashlib import sha256
import json
import os
from pathlib import Path
import subprocess
import tempfile


APP = Path(__file__).resolve().parents[3]
COLLECTOR = APP/'tools/corpus_engineering/experiment_visibility_ui.mjs'
SUPERVISOR = APP/'tools/corpus_engineering/experiment_visibility_request.py'
PACKAGE = APP/'editorial/batches/experiment-c2-hydrostatic-reading-20261127.json'


def observe(home):
    os.environ['ASTRA_DATA'] = home
    from server import store
    from tools.corpus_engineering.draft_import import import_drafts

    package = json.loads(PACKAGE.read_bytes())
    candidate = next(row for row in package['records'] if row['id'] == 'SIM-C2-L002-04')
    package['records'] = [candidate]
    store.initialize()
    with store.connect() as db:
        before = store.encode(store.published(db))
        owner = {'id':'owner','role':'autore'}
        first = import_drafts(db, owner, package)
        repeated = import_drafts(db, owner, package)
        assert first == {'saved':1,'unchanged':0,'publication':'DRAFT'}
        assert repeated == {'saved':0,'unchanged':1,'publication':'DRAFT'}
        key = candidate['id']
        live, draft = db.execute('SELECT live,draft FROM heads WHERE id=?', (key,)).fetchone()
        assert (live, draft) == (2, 3) and before == store.encode(store.published(db))
        saved = json.loads(db.execute('SELECT payload FROM versions WHERE id=? AND v=?', (key, draft)).fetchone()[0])
    code = '''import fs from 'node:fs';
import assert from 'node:assert/strict';
import {assertOwnerRecord} from './tools/corpus_engineering/experiment_visibility_ui.mjs';
const {saved, prepared}=JSON.parse(fs.readFileSync(0,'utf8'));
assertOwnerRecord(saved,prepared);
assert.throws(()=>assertOwnerRecord({...saved,version:2},prepared));
assert.throws(()=>assertOwnerRecord({...saved,version:4},prepared));
assert.throws(()=>assertOwnerRecord({...saved,blocks:[]},prepared));'''
    result = subprocess.run(['node','--input-type=module','-e',code], cwd=APP,
                            input=json.dumps({'saved':saved,'prepared':candidate}), text=True, check=True, timeout=30)
    return {'id':key,'publishedVersion':live,'draftVersion':draft,'first':first,'repeated':repeated,
            'publishedByteIdentity':True,'actualNormalizedPayloadChecked':True,'wrongVersionOrContentRejected':3,
            'actualNodeExit':result.returncode,'collectorSha256':sha256(COLLECTOR.read_bytes()).hexdigest(),
            'supervisorSha256':sha256(SUPERVISOR.read_bytes()).hexdigest(),'actualBrowser':'NOT_RUN',
            'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0}


if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='cric-actual-v3-') as folder:
        print(json.dumps(observe(folder), indent=2))
