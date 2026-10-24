#!/usr/bin/env python3
"""Check an explicitly approved remote origin without credentials or data writes."""
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'services/study-api'))
from study_api.beta_probe import MAX_BODY_BYTES, run_probe


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, help='Sanitized target manifest; no credentials.')
    parser.add_argument('--allow-origin', action='append', default=[],
                        help='Exact operator-approved HTTPS origin, supplied separately from the manifest.')
    args = parser.parse_args()
    manifest = None
    if args.target is not None:
        try:
            with args.target.open('rb') as stream:
                raw = stream.read(MAX_BODY_BYTES + 1)
            if len(raw) > MAX_BODY_BYTES:
                raise ValueError
            # Duplicated manifest fields must not silently select another target.
            def unique(items):
                result = {}
                for key, value in items:
                    if key in result:
                        raise ValueError
                    result[key] = value
                return result
            manifest = json.loads(raw, object_pairs_hook=unique)
        except (OSError, ValueError, UnicodeError, RecursionError):
            manifest = {}  # Constant failure code; never echo file content or path.
    print(json.dumps(run_probe(manifest, args.allow_origin), ensure_ascii=False, indent=2))
    # The authenticated operator journey and human gates are always NOT_RUN here.
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
