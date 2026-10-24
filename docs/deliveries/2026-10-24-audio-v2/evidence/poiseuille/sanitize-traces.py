#!/usr/bin/env python3
"""Redact authentication headers from local synthetic Playwright trace copies.

Keeps the raw files outside the repository, records both digests, and refuses
to publish a copy if any observed session credential remains in its entries.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
import zipfile

source = Path(sys.argv[1])
destination = Path(sys.argv[2])
destination.mkdir(parents=True, exist_ok=True)
manifest = []
for archive in sorted(source.glob('*trace.zip')):
    secrets = set()
    redacted_count = [0]
    def redact(value):
        if isinstance(value, dict):
            named = str(value.get('name', '')).lower()
            if named in ('cookie', 'set-cookie', 'authorization', 'proxy-authorization', 'study_session') and isinstance(value.get('value'), str):
                secret = value['value']
                if secret:
                    secrets.add(secret)
                    secrets.update(re.findall(r'(?:^|[;,]\s*)study_session=([^;\s,]+)', secret))
                value = {**value, 'value': '[REDACTED]'}
                redacted_count[0] += 1
            return {key: '[REDACTED]' if key.lower() in ('cookie', 'set-cookie', 'authorization', 'proxy-authorization')
                    else redact(item) for key, item in value.items()}
        if isinstance(value, list):
            return [redact(item) for item in value]
        return value
    entries = {}
    with zipfile.ZipFile(archive) as original:
        infos = original.infolist()
        for info in infos:
            data = original.read(info.filename)
            if info.filename.endswith(('.trace', '.network', '.stacks')):
                data = ('\n'.join(json.dumps(redact(json.loads(line)), separators=(',', ':'))
                                  for line in data.decode().splitlines()) + '\n').encode()
            entries[info.filename] = data
    if any(secret.encode() in data for secret in secrets if len(secret) >= 12 for data in entries.values()):
        raise ValueError('Observed credential remains in trace: ' + archive.name)
    target = destination / archive.name
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as sanitized:
        for info in infos:
            sanitized.writestr(info, entries[info.filename])
    manifest.append({'file': archive.name, 'rawSha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                     'sanitizedSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                     'redactedAuthenticationEntries': redacted_count[0], 'observedCredentialsRemaining': 0})
(destination / 'sanitization-manifest.json').write_text(json.dumps({
    'schema': 'ardesia.qa.trace-redaction.v1',
    'scope': 'Authentication header/cookie values redacted; these copies are not byte-identical raw traces.',
    'traces': manifest}, indent=2) + '\n')
print(json.dumps({'sanitizedTraces': len(manifest), 'destination': str(destination)}))
