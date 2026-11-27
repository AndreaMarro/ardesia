"""Account for authored editions of open experiments without changing acceptance."""

import argparse
from collections import Counter
import json
from pathlib import Path
import subprocess

from tools.corpus_engineering.pipeline import digest, sha


PREFIX = 'officina-di-fisica/editorial/batches/'
STAGING = '8856555c00ec81dc093858346bc8ce57c11a2451'
STATUS = '3727fc034f722176eb5bfabd8662bdca25890390'
PHASES = '6ae3c2a177bcde74b2bebf8f22c1fa50850b0413'
RECOVERED = 'ce411b3cf35e0ddc1284dbf6f92031d336b3e929'
ACOUSTICS = 'd20c200b8731739ef512f7e2820104a7bd755202'
SOURCE = '5d1dc8dc7b601aef959d10d564c75462be74708d'
STAGING_PACKAGES = {
    'C2': ('bernoulli', 'flow-continuity', 'hydraulic-network', 'laminar-viscosity', 'poiseuille', 'surface-tension'),
    'C3': ('engines', 'entropy', 'first-law', 'heat-exchange', 'state-ideal-gas', 'thermal-cycles', 'thermal-paths'),
    'C4': ('circuit-capacitor', 'magnetism-induction', 'matter-circuits'),
    'C5': ('nuclei-optics',),
}


def blob(repository, ref, path):
    return subprocess.check_output(['git','show',f'{ref}:{path}'],cwd=repository,timeout=30)


def audit(integration, staging, historical):
    status_raw = blob(integration, STATUS, 'officina-di-fisica/editorial/reviews/full-corpus-work-status-20261126.json')
    status = json.loads(status_raw)
    pending = {row['id'] for row in status['activities'] if row['state'] == 'NOT_FULLY_REVIEWED'}
    if len(pending) != status['remainingActivities'] or any(not key.startswith('SIM-') for key in pending):
        raise ValueError('The exact remaining record cohort has changed')
    sources = {}
    for course in STAGING_PACKAGES:
        path = f'officina-di-fisica/content/esperienze-{course}.json'
        sources.update({row['id']: row for row in json.loads(blob(historical, SOURCE, path))})
    chosen = {}
    package_index = []
    packages = [(staging, STAGING, f'experiment-{course.lower()}-{kind}-reading-20261127')
                for course, kinds in STAGING_PACKAGES.items() for kind in kinds]
    packages += [
        (historical, PHASES, 'experiment-c3-heat-transformations-reading-20261127'),
        (historical, RECOVERED, 'experiments-manual-support-revision-263'),
        (historical, ACOUSTICS, 'experiment-c5-wave-energy-sound-reading-20261127'),
    ]
    for repository, ref, name in packages:
        path = PREFIX + name + '.json'
        raw = blob(repository, ref, path)
        bindings_raw = blob(repository, ref, PREFIX + name + '-bindings.json')
        package, bindings = json.loads(raw), json.loads(bindings_raw)
        by_id = {item['id']: item for item in bindings}
        if package['schema'] != 'astra/1' or len(by_id) != len(bindings) or len(by_id) != len(package['records']):
            raise ValueError('Invalid package identity: ' + name)
        selected = []
        for row in package['records']:
            key = row['id']
            if key not in pending:
                continue
            if name == 'experiment-c4-magnetism-induction-reading-20261127' and key == 'SIM-C4-L09-02':
                continue  # The distinct, previously reviewed edition recovered in 263 takes precedence.
            binding, original = by_id[key], sources[key]
            if (key in chosen or original['kind'] != 'experiment' or
                    binding['sourceId'] != key or binding['sourceRef'] != SOURCE or
                    binding['sourceSha256'] != digest(original) or binding['candidateSha256'] != digest(row) or
                    row['baseVersion'] != original['version'] or row['version'] != original['version']+1 or
                    row['skill'] != original['skill'] or row['course'] != original['course'] or
                    not any(block['type'] == 'text' for block in row['blocks']) or
                    not any(block['type'] == 'formula' for block in row['blocks'])):
                raise ValueError('Missing, conflicting or invalid draft source binding: ' + key)
            chosen[key] = {
                'id': key, 'course': row['course'], 'requiresVerification': True,
                'sourceSha256': binding['sourceSha256'], 'candidateSha256': binding['candidateSha256'],
                'baseVersion': row['baseVersion'], 'candidateVersion': row['version'],
                'draftPackage': name, 'draftAuthorityCommit': ref,
                'assetChecksums': binding['assetChecksums'],
            }
            selected.append(key)
        if selected:
            package_index.append({
                'name': name, 'commit': ref, 'path': path, 'packageSha256': sha(raw),
                'bindingsSha256': sha(bindings_raw), 'selectedIds': sorted(selected),
            })
    missing = sorted(pending - chosen.keys())
    assert len(chosen) + len(missing) == len(pending)
    return {
        'schemaVersion': '1.0.0', 'phase': 'OPEN_ACTIVITY_AUTHORING_COVERAGE',
        'sourceStatusCommit': STATUS, 'sourceStatusSha256': sha(status_raw),
        'registrySha256': status['registrySha256'], 'registeredActivities': status['reviewedActivities'],
        'remainingActivities': len(pending), 'openActivitiesWithDraft': len(chosen),
        'openActivitiesWithoutDraft': missing,
        'countsByCourse': dict(sorted(Counter(row['course'] for row in chosen.values()).items())),
        'draftPackages': package_index, 'records': [chosen[key] for key in sorted(chosen)],
        'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('integration', type=Path)
    parser.add_argument('staging', type=Path)
    parser.add_argument('historical', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    result = audit(args.integration, args.staging, args.historical)
    args.output.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + '\n')
    print(result['openActivitiesWithDraft'], result['openActivitiesWithoutDraft'])
