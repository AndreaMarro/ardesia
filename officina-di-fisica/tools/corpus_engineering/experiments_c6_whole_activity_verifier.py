"""Bind the six original C6 activities to independent science and observed UI."""

from decimal import Decimal
import json
from pathlib import Path
import subprocess

from . import experiments_C6_code_partial_verifier as oracle
from .experiment_visibility_request import safe, verify_report
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
BATCH = 'experiments-c6-cross-domain-originals'
IDS = {'SIM-C6-' + key for key in oracle.DATA}
APPENDIX = 'editorial/reviews/c6-activities-exact-manual-solution-20261127.md'
APPENDIX_PEER = 'editorial/reviews/c6-manual-appendix-independent-20261127/independent-review.json'
PEER_SHA256 = 'ed1bd84ad7a7a116574539bfd423ba517fdb3fd421ba3012128063735ec9a41b'
SEAL = 'editorial/reviews/c6-0fdcc-whole-activity-evidence-20261127.json'
PROFILE_KEYS = {(width, view, view == 'fixed_projection') for width in (320, 1280)
                for view in ('orbit', 'side', 'top', 'fixed_projection')}


def checked_file(reference):
    file = safe(APP, reference['path'])
    raw = file.read_bytes()
    if sha(raw) != reference['sha256']:
        raise ValueError('C6 evidence bytes changed: ' + reference['path'])
    return file, raw


def current_science(sources):
    source_raw = subprocess.check_output(['git', 'show', oracle.REF + ':' + oracle.SOURCE], cwd=APP)
    records = {record['id']: record for record in json.loads(source_raw)}
    if sha(source_raw) != oracle.SOURCE_SHA or set(sources) != IDS or sources != records:
        raise ValueError('C6 source identities or original editions differ')
    appendix = (APP / APPENDIX).read_bytes()
    peer_raw = (APP / APPENDIX_PEER).read_bytes()
    if sha(peer_raw) != PEER_SHA256:
        raise ValueError('C6 manual text review changed')
    peer = json.loads(peer_raw)
    if (peer['author'] == peer['reviewer'] or peer['appendixSha256'] != sha(appendix)
            or peer['activityCredit'] != 0 or peer['humanApproval'] != 'NOT_RUN'):
        raise ValueError('Missing distinct review of current manual explanations')
    explanations = {}
    for part in appendix.decode().split('\n## `')[1:]:
        key, content = part.split('` · ', 1)
        title, _, paragraphs = content.partition('\n\n')
        paragraphs = paragraphs.split('\n\n[Edizioni sorgente]', 1)[0].strip().split('\n\n')
        if not title or len(paragraphs) < 2 or key in explanations:
            raise ValueError('Incomplete per-ID manual explanation: ' + key)
        explanations[key] = paragraphs
    if set(explanations) != IDS or {row['id'] for row in peer['records']} != IDS:
        raise ValueError('C6 manual review coverage differs')
    manual_answers = {row['id']: row for row in peer['records']}
    collector = 'tests/corpus/collect-C6-bounded-code-only.mjs'
    installed_bytes = subprocess.check_output(['node', collector, 'cross-domain'], cwd=APP, timeout=40)
    installed = json.loads(installed_bytes)
    if (installed['sourceFileSha256'] != oracle.SOURCE_SHA
            or installed['protocolSha256'] != sha((APP / collector).read_bytes())):
        raise ValueError('Current C6 installed collection has unknown provenance')
    checked = oracle.compare('cross-domain', installed, sources)
    for row in checked:
        independent = manual_answers[row['id']]
        if (not row['sourceMathAndActualTasksOk'] or row['ManualityFailure'] or row['ManualSupportGap']
                or row['CodeGeometryFailure'] or independent['textArithmeticAndUnits'] != 'CORRECT'):
            raise ValueError('C6 exact science/hand procedure failed: ' + row['id'])
        for task, peer_task in zip(row['actualTasks'], independent['tasks'], strict=True):
            unit = 'numero puro' if task['unit'] == '1' else task['unit']
            if (any(task[field] != peer_task[peer_field] for field, peer_field in (
                    ('input', 'inputExact'), ('independentExact', 'expectedExact'), ('prompt', 'actualPrompt')))
                    or unit != peer_task['unit']
                    or Decimal(task['manualNumericLiteral']) != Decimal(peer_task['manualLiteral'])
                    or not task['literalAcceptedByNumericRule'] or not peer_task['acceptedByUnchangedNumericRule']):
                raise ValueError('C6 actual task differs from independently read manual procedure: ' + row['id'])
    return checked, explanations, sha(appendix), sha(installed_bytes)


def browser_evidence(seal, fingerprint, science):
    verdict_file, verdict_raw = checked_file(seal['verdict'])
    prepared_file, prepared_raw = checked_file(seal['prepared'])
    report_file, report_raw = checked_file(seal['report'])
    _, terminal_raw = checked_file(seal['terminal'])
    _, collector_raw = checked_file(seal['collector'])
    prepared, terminal, verdict = map(json.loads, (prepared_raw, terminal_raw, verdict_raw))
    if (prepared['runtimeFingerprint'] != fingerprint or prepared['sourceCommit'] != seal['sourceCommit']
            or terminal['actualObservedExitCode'] != 0 or terminal['signal'] is not None
            or terminal['elapsedSeconds'] <= 0
            or verdict['sourceCommit'] != seal['sourceCommit'] or verdict['runtimeSha256'] != fingerprint['sha256']
            or verdict['role'] != 'DISTINCT_REVIEWER_A_LOCAL_VISUAL_SCOPE_NOT_GATE_CREDIT'
            or verdict['activityCredit'] != 0 or verdict['humanApproval'] != 'NOT_RUN'):
        raise ValueError('C6 requires complete real UI and a distinct reviewer on the current runtime')
    if verdict['artifactPins'] != {'actual/report.json': seal['report'], 'prepared.json': seal['prepared'],
                                  'actual-terminal.json': seal['terminal']}:
        raise ValueError('C6 visual verdict refers to different actual files')
    case_report = verify_report(report_file.parent, prepared, sha(collector_raw))
    if case_report['preparedSha256'] != sha(prepared_raw) or case_report['errors']:
        raise ValueError('C6 authentic UI failed or the plan changed')
    profiles = [(profile['width'], profile['view'], profile['fallback']) for profile in prepared['profiles']]
    plan = {row['id']: row for row in prepared['records']}
    by_id = {row['id']: row for row in verdict['records']}
    if (set(profiles) != PROFILE_KEYS or len(profiles) != len(PROFILE_KEYS)
            or set(plan) != IDS or len(prepared['records']) != len(IDS)
            or set(by_id) != IDS or len(verdict['records']) != len(IDS)):
        raise ValueError('C6 browser or independent visual coverage is incomplete')
    observed = {key: {'setups': [], 'caseCount': 0, 'screenshots': {p: set() for p in PROFILE_KEYS}}
                for key in IDS}
    for item in case_report['cases']:
        case = json.loads(safe(report_file.parent, item['file']).read_bytes())
        key = case['id']
        if case['sourceSha256'] != science[key]['sourceSha256'] or case['variant'] != 'published':
            raise ValueError('C6 UI proof does not show the original edition: ' + key)
        proof = observed[key]
        profile = case['profile']
        profile_key = (profile['width'], profile['view'], profile['fallback'])
        proof['caseCount'] += 1
        proof['screenshots'][profile_key].update(image['sha256'] for image in case['screenshots'])
        if item['caseKey'].endswith('|setup'):
            if case['axe'] or len(case['phases']) != 4 or any(not isinstance(phase, str) or not phase.strip() for phase in case['phases']):
                raise ValueError('C6 setup has no complete accessible learning sequence: ' + key)
            questions = case['questions']
            if len(questions) != 2:
                raise ValueError('C6 setup omitted an assigned question: ' + key)
            for actual, expected in zip(questions, science[key]['actualTasks'], strict=True):
                submitted = Decimal(actual['input'].replace(',', '.'))
                if (actual['actualPrompt'] != expected['prompt'] or submitted != Decimal(expected['manualNumericLiteral'])
                        or not actual['status'].startswith('Corretto')):
                    raise ValueError('C6 setup did not accept the independently calculated answer: ' + key)
            proof['setups'].append(profile_key)
    results = {}
    for key, proof in observed.items():
        verdict_row = by_id[key]
        grid = plan[key]['grid']
        control = plan[key]['record']['control']
        read = set(verdict_row['readPngSha256'])
        if (set(proof['setups']) != PROFILE_KEYS or len(proof['setups']) != len(PROFILE_KEYS)
                or {control['min'], control['max']} - set(grid) or plan[key]['sourceSha256'] != science[key]['sourceSha256']
                or verdict_row['visualReview'] != 'PASS' or not verdict_row['scope'] or not verdict_row['reason']
                or verdict_row['sourceRecordSha256'] != science[key]['sourceSha256']
                or verdict_row['sourceVersion'] != science[key]['sourceVersion']
                or verdict_row['runtimeSha256'] != fingerprint['sha256']
                or verdict_row['sourceCommit'] != seal['sourceCommit']
                or verdict_row['activityCredit'] != 0 or verdict_row['humanApproval'] != 'NOT_RUN'
                or not read.issubset(set().union(*proof['screenshots'].values()))
                or any(not (read & images) for images in proof['screenshots'].values())):
            raise ValueError('C6 lacks complete setup, source bounds or distinct visual review: ' + key)
        results[key] = {'actualCases': proof['caseCount'], 'profiles': [list(p) for p in sorted(proof['setups'])],
                        'visualReview': verdict_row, 'artifactEvidence': {
                            'preparedSha256': sha(prepared_raw), 'reportSha256': sha(report_raw),
                            'terminalSha256': sha(terminal_raw), 'verdictSha256': sha(verdict_raw),
                            'verdictPath': verdict_file.relative_to(APP).as_posix(),
                            'planPath': prepared_file.relative_to(APP).as_posix(),
                        }}
    return results


def report(sources):
    fingerprint = runtime_fingerprint(APP)
    seal_raw = (APP / SEAL).read_bytes()
    seal = json.loads(seal_raw)
    if seal['runtimeSha256'] != fingerprint['sha256']:
        raise ValueError('C6 independent consumer evidence is stale')
    science_rows, explanations, appendix_sha, installed_sha = current_science(sources)
    science = {row['id']: row for row in science_rows}
    browser = browser_evidence(seal, fingerprint, science)
    if runtime_fingerprint(APP) != fingerprint or (APP / SEAL).read_bytes() != seal_raw:
        raise ValueError('C6 verification inputs were modified during validation')
    rows = []
    for key in sorted(IDS):
        facts = science[key]
        text = explanations[key]
        rows.append({'id': key, 'sourceSha256': digest(sources[key]), 'sourceRef': oracle.REF, 'sourcePath': oracle.SOURCE,
                     'sourceVersion': sources[key]['version'], 'ok': True, 'errors': [],
                     'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': '\n\n'.join(text),
                     'physicalAssumptions': text[0], 'pedagogicalReview': browser[key]['visualReview']['reason'],
                     'manualFeasibility': 'PASS_AI_EXACT', 'scientificChecks': facts['actualTasks'],
                     'checkedControls': facts['gridCount'], 'clockSamples': facts['clockSampleCount'],
                     'consumerEvidence': browser[key], 'originalEditionRetained': True,
                     'failedPublishedEdition': False, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'sourceRef': oracle.REF, 'sourceFileSha256': oracle.SOURCE_SHA,
            'acceptedCount': len(rows), 'records': rows, 'runtimeSha256': fingerprint['sha256'],
            'verifierSha256': sha(Path(__file__).read_bytes()), 'manualAppendixSha256': appendix_sha,
            'manualPeerSha256': PEER_SHA256, 'installedCollectionSha256': installed_sha,
            'sealSha256': sha(seal_raw), 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
