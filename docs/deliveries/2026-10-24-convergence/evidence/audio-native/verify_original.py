"""Check retained original file integrity and recorded assertions, offline.

This does not rerun Chromium and must not be described as a new native run.
"""
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
original = HERE / 'original-run'
manifest = json.loads((original / 'audio-recorder-native-manifest.json').read_text())
for record in manifest['files']:
    data = (original / record['path']).read_bytes()
    if len(data) != record['bytes'] or hashlib.sha256(data).hexdigest() != record['sha256']:
        raise ValueError('Original file identity mismatch: ' + record['path'])
result = json.loads((original / 'audio-recorder-native-result.json').read_text())
provenance = json.loads((HERE / 'runner-provenance.json').read_text())
for record in (provenance['original_script'], provenance['portable_script']):
    if hashlib.sha256((HERE / record['path']).read_bytes()).hexdigest() != record['sha256']:
        raise ValueError('Script identity mismatch: ' + record['path'])
if result['metadata']['scriptSha256'] != provenance['original_script']['sha256']:
    raise ValueError('Original result belongs to a different runner')
if result['metadata']['sourceSha256Before'] != result['metadata']['sourceSha256After']:
    raise ValueError('Source changed during original run')
if not result['passed'] or len(result['checks']) != 20 or not all(check['pass'] for check in result['checks']):
    raise ValueError('Original native assertions did not all pass')
if not result['cleanup']['everyTrackEnded'] or result['cleanup']['audioContext'] != 'closed' or not result['metadata']['browserClosed']:
    raise ValueError('Original run cleanup was incomplete')
audio = (original / 'audio-recorder-native-tail.webm').read_bytes()
if hashlib.sha256(audio).hexdigest() != result['normal']['chunk']['sha256']:
    raise ValueError('Synthetic audio identity differs from original result')
print(json.dumps({'verification': 'offline integrity of retained original run; no browser started', 'original_files_verified': len(manifest['files']), 'recorded_assertions_passed': len(result['checks']), 'audio_bytes': len(audio), 'original_script_sha256': provenance['original_script']['sha256'], 'portable_script_sha256': provenance['portable_script']['sha256'], 'source_sha256': result['metadata']['sourceSha256After']}, indent=2))
