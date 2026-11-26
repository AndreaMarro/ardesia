"""Offline collector-v1 test context; never aliases an application runtime.

The original actual UI receipts and test bodies stay unchanged. Only the four
historical collector sources and their already frozen JSON inputs are read from
an explicit, hash-checked temporary protocol tree.
"""
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch
import hashlib
import json
import shutil
import tempfile

APP=Path(__file__).resolve().parents[2]
PROPOSAL=APP/'editorial/reviews/experiment-visibility-macro-proposal-20261126'
ARCHIVE=APP/'editorial/reviews/experiment-visibility-protocol-integrity-followup-20261126/historical-protocol-sources'

@contextmanager
def collector_v1(module):
    request=json.loads((PROPOSAL/'request-example.json').read_bytes())
    archived={'.github/workflows/cric-experiment-visibility.yml':ARCHIVE/'workflow.yml',
              '.github/schemas/cric-experiment-visibility-request-v1.schema.json':ARCHIVE/'schema.json',
              'officina-di-fisica/tools/corpus_engineering/experiment_visibility_request.py':ARCHIVE/'experiment_visibility_request.py',
              'officina-di-fisica/tools/corpus_engineering/experiment_visibility_ui.mjs':ARCHIVE/'experiment_visibility_ui.mjs'}
    if set(archived)!=set(request['protocolFiles']):raise ValueError('Unknown collector epoch')
    with tempfile.TemporaryDirectory(prefix='cric-collector-v1-')as tmp:
        repo=Path(tmp).resolve();app=repo/'officina-di-fisica'
        for name,pin in {**request['protocolFiles'],**request['frozenFiles']}.items():
            source=archived.get(name,APP.parent/name);blob=source.read_bytes()
            if hashlib.sha256(blob).hexdigest()!=pin:raise ValueError('Historical collector/input drift: '+name)
            target=repo/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(blob)
        (app/'node_modules').symlink_to(APP/'node_modules',target_is_directory=True)
        # APP here resolves the offline collector source assertion only. No
        # runtime fingerprint or current production app is replaced or retagged.
        with patch.object(module,'APP',app),patch.object(module.v,'APP',app),patch.object(module.v,'REPO',repo),patch.object(module.v,'SCHEMA',repo/'.github/schemas/cric-experiment-visibility-request-v1.schema.json'):
            yield
