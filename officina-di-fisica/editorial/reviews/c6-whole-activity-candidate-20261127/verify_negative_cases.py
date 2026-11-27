"""Reproduce four fail-closed checks against the authentic C6 family evidence."""
from copy import deepcopy
import json
from pathlib import Path
from unittest.mock import patch

from tools.corpus_engineering import experiments_c6_whole_activity_verifier as verifier


def require_failure(operation, message):
    try:
        operation()
    except ValueError as error:
        if message not in str(error):
            raise
        print(error)
    else:
        raise AssertionError('Expected rejection for: ' + message)


def main():
    app = verifier.APP
    sources = {row['id']: row for row in json.loads((app / 'content/esperienze-C6.json').read_bytes())}
    rows, _, _, _ = verifier.current_science(sources)
    science = {row['id']: row for row in rows}
    seal = json.loads((app / verifier.SEAL).read_bytes())
    profile = verifier.runtime_fingerprint(app)

    changed = deepcopy(sources)
    changed['SIM-C6-L06-01']['version'] += 1
    require_failure(lambda: verifier.current_science(changed), 'original editions differ')

    changed = deepcopy(seal)
    changed['report']['sha256'] = '0' * 64
    require_failure(lambda: verifier.browser_evidence(changed, profile, science), 'evidence bytes changed')

    checked_file = verifier.checked_file

    def omit_read_profiles(reference):
        path, raw = checked_file(reference)
        if reference == seal['verdict']:
            document = json.loads(raw)
            row = next(row for row in document['records'] if row['id'] == 'SIM-C6-L06-01')
            row['readPngSha256'] = row['readPngSha256'][:1]
            raw = json.dumps(document).encode()
        return path, raw

    with patch.object(verifier, 'checked_file', side_effect=omit_read_profiles):
        require_failure(lambda: verifier.browser_evidence(seal, profile, science), 'distinct visual review: SIM-C6-L06-01')

    with patch.object(verifier, 'runtime_fingerprint', return_value={**profile, 'sha256': '0' * 64}):
        require_failure(lambda: verifier.report(sources), 'consumer evidence is stale')


if __name__ == '__main__':
    main()
