"""Validate the three closed C2 Bernoulli drafts against exact runtime observations."""

from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from .activity_observations import observed_answers
from .experiment_visibility_request import planned_interactions, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .review_contract import reviewed_rows
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
PROOF = APP / 'editorial/reviews/converged-runtime-53bd-20261127'
ARCHIVE = 'e494cbf8c958033d0cc2731b122ff248f26147ebc8715f35985b95294a9a8d8c'
MANIFEST = '221b73257acf8cbbf32b882de82ccae68f2115421905e04e2751f93640e02d2d'
RUNTIME = '53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a'
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
CANDIDATE = '1b72b71a68a6023ab1c9fa189733947b03029914'
IDS = {'SIM-C2-L006-01', 'SIM-C2-L006-03', 'SIM-C2-L006-04'}
CLOSED_CASES = {'SIM-C2-L006-01': 24, 'SIM-C2-L006-03': 32, 'SIM-C2-L006-04': 24}
PUBLISHED = {
    'SIM-C2-L006-01': (['3', '5/2'], 'Con 3 m/s fai 20 + (1 − 9)/2 = 16 kPa. Con 5/2 m/s il quadrato vale 25/4. La correzione è −21/8 kPa e il risultato è 139/8 = 17,375 kPa.'),
    'SIM-C2-L006-03': (['2', '5/4'], 'Con area doppia dimezzi 2 m/s e ottieni 1 m/s. Per area 5/4 di quella a monte, 2 × 4/5 dà 8/5 = 1,6 m/s.'),
    'SIM-C2-L006-04': (['6', '4'], 'La perdita sottrae pressione a velocità e quota uguali. Calcola 15 − 6 = 9 kPa e 15 − 4 = 11 kPa.'),
}
CONSUMER = r"""
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const app = process.argv[2];
const { esperienza } = await import(pathToFileURL(app + '/static/js/banchi/voci/esperimento.js'));
const source = JSON.parse(await readFile(app + '/content/esperienze-C2.json', 'utf8'));
const selected = await Promise.all(JSON.parse(process.argv[3]).map(async id => [
  id, (await esperienza(source.find(row => row.id === id))).record.assessment,
]));
console.log(JSON.stringify(Object.fromEntries(selected)));
"""


def exact(key, input_value):
    x = Fraction(str(input_value))
    if key == 'SIM-C2-L006-01':
        return 20 + (1 - x * x) / 2
    if key == 'SIM-C2-L006-03':
        return 2 / x
    if key == 'SIM-C2-L006-04':
        return 15 - x
    raise ValueError('Unknown C2 exact law: ' + key)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load_proof():
    manifest_raw = (PROOF / 'bernoulli-120-actual-parity-manifest.json').read_bytes()
    archive_path = PROOF / 'bernoulli-120-actual-parity.zip'
    require(sha(manifest_raw) == MANIFEST and sha(archive_path.read_bytes()) == ARCHIVE,
            'Bernoulli archive or file manifest changed')
    manifest = json.loads(manifest_raw)
    require(manifest['archiveSha256'] == ARCHIVE and manifest['runtimeSha256'] == RUNTIME,
            'Bernoulli evidence belongs to another runtime')
    with ZipFile(archive_path) as archive:
        require(sorted(archive.namelist()) == sorted(manifest['files']), 'Bernoulli archive has a missing or repeated member')

        def pinned(name):
            raw = archive.read(name)
            require(sha(raw) == manifest['files'][name], 'Changed Bernoulli evidence member: ' + name)
            return raw

        plan_raw = pinned('current-53bd/prepared.json')
        plan = json.loads(plan_raw)
        run = verify_report_bytes(lambda name: pinned('current-53bd/actual/' + name), plan, COLLECTOR)
        terminal = json.loads(pinned('current-53bd/terminal.json'))
        require(run['preparedSha256'] == sha(plan_raw) and run['sourceCommit'] == CANDIDATE and
                run['runtimeFingerprint']['sha256'] == RUNTIME and
                run['guestIsolation'] == 'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403' and
                terminal['observedExitCode'] == 0 and not terminal['timeoutTriggered'],
                'Bernoulli browser did not complete in the recorded configuration')
        plan_cases = planned_interactions(plan)
        prior_run = json.loads(pinned('peer-c39/actual/report.json'))
        prior = {item['caseKey']: item for item in prior_run['cases']}
        require(len(run['cases']) == len(prior) == 120, 'Incomplete Bernoulli paired observations')
        visual = json.loads(pinned('peer-c39/independent-review.json'))
        require(visual['runtimeSha256'].startswith('c39f7c') and not visual['newFindings'],
                'Independent bounded visual review changed')
        cases = {}
        for item in run['cases']:
            key = item['caseKey']
            case = json.loads(pinned('current-53bd/actual/' + item['file']))
            previous_metadata = prior[key]
            earlier_raw = pinned('peer-c39/actual/' + previous_metadata['file'])
            earlier = json.loads(earlier_raw)
            row, state = plan_cases[key]
            verify_planned_interaction(case, row, state)
            require(sha(earlier_raw) == previous_metadata['sha256'] and earlier['caseKey'] == key and
                    case['screenshots'] == earlier['screenshots'] and case['profile'] == earlier['profile'] and
                    case['candidateSha256'] == earlier['candidateSha256'] == row['candidateSha256'] and
                    case['sourceSha256'] == earlier['sourceSha256'] == row['sourceSha256'],
                    'Raster or edition differs from independently read observation: ' + key)
            if state is not None:
                require(Fraction(str(case['model']['y'])) == exact(case['id'], state['x']) if case['id'] in IDS else True,
                        'Bernoulli observed endpoint differs from the exact law: ' + key)
            cases[key] = case
        science = json.loads(pinned('peer-science/independent-review.json'))
        primary_raw = pinned('peer-science/source-primary.json')
        require(science['primarySha256'] == sha(primary_raw) and science['candidateCommit'] == plan['draftCandidateCommit'],
                'Independent source-first reasoning does not bind this author candidate')
        source_first = json.loads(primary_raw)
    return manifest, plan, cases, science, source_first, visual, run['fullOwnerRecordIdentity']


def report(sources, package, bindings):
    require(set(sources) == IDS and runtime_fingerprint(APP)['sha256'] == RUNTIME,
            'Expected the three safely scoped Bernoulli records and the exact composed runtime')
    manifest, plan, cases, science, source_first, visual, owner = load_proof()
    scientific = {row['id']: row for row in science['records']}
    primary = {row['id']: row for row in source_first['records']}
    reread = {row['id']: row for row in visual['perID']}
    actual_drafts = {row['id']: row for row in plan['draftRecords']}
    owned = {row['id']: row['version'] for row in owner['records']}
    published_tasks = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-', str(APP), json.dumps(sorted(IDS))],
        input=CONSUMER.encode(), cwd=APP, timeout=30,
    ))
    expected_signatures = {
        row['id']: digest({'record': actual_drafts[row['id']], 'assets': {},
                          'source': {'id': row['id'], 'ref': SOURCE_REF, 'sha256': digest(sources[row['id']])}})
        for row in package['records']
    }
    accepted = []
    for candidate, binding, signature, assets, errors in reviewed_rows(
        package, bindings, expected_signatures, IDS, APP / 'editorial/assets',
    ):
        key = candidate['id']
        source_hash = digest(sources[key])
        candidate_hash = digest(candidate)
        science_row, primary_row, visual_row = scientific[key], primary[key], reread[key]
        require(not errors and not assets and binding['sourceRef'] == SOURCE_REF and binding['sourceSha256'] == source_hash and
                science_row['sourceSha256'] == visual_row['sourceSha256'] == source_hash and
                science_row['candidateSha256'] == visual_row['candidateSha256'] == candidate_hash == digest(actual_drafts[key]) and
                science_row['scientificTextManualUnitsAndHypotheses'] == 'PASS' and
                visual_row['boundedVisualDecision'] == 'POSITIVE_IN_ACTUALLY_READ_8PROFILE_STATES' and
                owned[key] == candidate['version'], 'Invalid distinct review or actual draft identity: ' + key)
        subset = {name: row for name, row in cases.items() if row['id'] == key}
        require(len(subset) == CLOSED_CASES[key], 'Incomplete image scope: ' + key)
        setups = [row for row in subset.values() if row['caseKey'].endswith('|setup')]
        prepared_answers = [(task['input'], task['expectedAccepted']) for task in setups[0]['questions']]
        require(len(setups) == 8 and len(prepared_answers) == 2 and not any(row['axe'] for row in setups),
                'Missing setup or accessibility evidence: ' + key)
        numeric = []
        for point, oracle, peer, (entry, correct) in zip(candidate['assessmentSelection']['points'],
            primary_row['exactAnswers'], science_row['tasks'], prepared_answers, strict=True):
            answer = exact(key, point)
            require(Fraction(str(point)) == Fraction(oracle['input']) == Fraction(peer['inputExact']) and
                    answer == Fraction(oracle['outputExact']) == Fraction(peer['independentExact']) == Fraction(entry) and
                    peer['actualNumberAccepted'] and correct, 'Scientific or manual assessment drifted: ' + key)
            numeric.append({'input': str(point), 'exact': str(answer), 'numericEntry': entry})
        observed_answers(subset, prepared_answers)
        original_points, original_manual = PUBLISHED[key]
        for point, task in zip(original_points, published_tasks[key], strict=True):
            require(Fraction(str(task['value'])) == exact(key, point), 'Retained source assessment drifted: ' + key)
        accepted.append({
            'id': key, 'ok': True, 'sourceSha256': source_hash, 'sourceVersion': sources[key]['version'],
            'candidateSha256': candidate_hash, 'candidateVersion': candidate['version'], 'baseVersion': candidate['baseVersion'],
            'reviewedSignature': signature, 'originalEditionRetained': True, 'failedPublishedEdition': False,
            'publishedEditionReview': {'ok': True, 'sourceSha256': source_hash, 'sourceVersion': sources[key]['version'],
                'actualAssignedTasks': published_tasks[key], 'manualArithmetic': original_manual,
                'judgmentScope': 'Retained published assigned arithmetic on 53bd', 'humanApproval': 'NOT_RUN',
                'publicationAction': 'NONE'},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': primary_row['manualProcedureAndInverse'],
            'physicalAssumptions': primary_row['hypothesesAndDomain'],
            'pedagogicalReview': 'Independent source-first derivation and reading of the same authored bytes. Actual assigned states and eight renderer/viewport profiles. Canonical owner preview is required separately.',
            'symbolicAssessmentChecks': numeric, 'actualBrowserCases': len(subset), 'actualAnswerSubmissions': len(setups)*2,
            'identicalIndependentlyReadRasters': len(subset), 'humanApproval': 'NOT_RUN', 'publicationAction': 'DRAFT',
        })
    return {'schemaVersion': '1.0.0', 'records': accepted, 'acceptedCount': len(accepted), 'runtimeSha256': RUNTIME,
            'archiveSha256': ARCHIVE, 'evidenceManifestSha256': MANIFEST,
            'independentSourceCommit': manifest['independentScienceCommit'], 'independentVisualCommit': manifest['independentBrowserCommit'],
            'verifierSha256': sha(Path(__file__).read_bytes()), 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
