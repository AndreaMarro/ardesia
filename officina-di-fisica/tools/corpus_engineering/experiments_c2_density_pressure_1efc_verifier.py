"""Combine exact independent manual derivations and fresh first-five C2 UI evidence."""

from fractions import Fraction
import json
from pathlib import Path

from . import c2_density_pressure_five_1efc_actual_review_a as visual
from . import experiments_pressure_hydrostatics_047_verifier as installed
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
BATCH = 'experiments-c2-density-pressure-five'
PROOF = APP / 'editorial/reviews/c2-density-pressure-1efc-acceptance-20261127'
IDS = set(visual.IDS)
PINS = {
    visual.BASE/'visual-review-per-id.json': 'c3b2a5ec108ca321b5649a3d4e26321cc43198313addd668f2edbaecce49ff9c',
    visual.BASE/'verified-author-manual.verbatim.md': 'd8ae8d076a9f734a5681ff22d42d66722265f1c15d21286636169d25df03d126',
    visual.BASE/'handoff.json': '75e61abe35c0d78e320c09451f978b15398920c7fc73b5d5141a15d123a26959',
    PROOF/'manual-peer-per-id.json': '567467e7bcc669abacb333ca37bd7c9f4848d3ae3f19f2d2f4d2b6ee033eb2ab',
}


def exact_input(text):
    return Fraction(text.replace(',', '.'))


def report(sources):
    runtime = runtime_fingerprint(APP)
    if runtime['sha256'] != visual.RUNTIME:
        raise ValueError('The independent first-five C2 matrix needs its exact observed runtime')
    raw_source = (APP/'content/esperienze-C2.json').read_bytes()
    originals = {row['id']:row for row in json.loads(raw_source)}
    if sha(raw_source) != installed.SOURCE_FILE_SHA256 or sources != {key:originals[key] for key in IDS}:
        raise ValueError('The original first-five C2 editions differ')
    evidence = {path:path.read_bytes() for path in PINS}
    if {path:sha(raw) for path, raw in evidence.items()} != PINS:
        raise ValueError('An independent first-five C2 artifact changed')
    manual_raw = evidence[visual.BASE/'verified-author-manual.verbatim.md']
    manual = json.loads(evidence[PROOF/'manual-peer-per-id.json'])
    manual_rows = {row['id']:row for row in manual['records']}
    if (manual['role'] != 'DISTINCT_REVIEWER_B_ROOT_AUTHOR_RECUSED' or set(manual_rows) != IDS
            or len(manual['records']) != len(IDS) or manual['finalSha256'] != sha(manual_raw)
            or manual['actualInstalledTasks'] != 10 or not manual['finalTwoCorrectionsReread']
            or not manual['actualWholeManualRead'] or manual['author'] == manual['reviewer']):
        raise ValueError('A separately reviewed manual method is required per original C2 ID')
    chapters = {}
    for section in manual_raw.decode().split('\n## `')[1:]:
        key, body = section.split('` · ', 1)
        chapters[key] = body.partition('\n\n')[2].strip()
    if set(chapters) != IDS or not all(chapters.values()):
        raise ValueError('The manual reading does not cover all five C2 IDs')

    verdict = json.loads(evidence[visual.BASE/'visual-review-per-id.json'])
    visual.assert_visual_review(verdict)
    cases = visual.actual()
    fresh = installed.runtime_values({key:originals[key] for key in installed.SPECS})
    comparisons = installed.compare_runtime(fresh)
    checks = installed.independent_checks()
    decisions = {row['id']:row for row in verdict['records']}
    records = []
    for key in sorted(IDS):
        text, view = manual_rows[key], decisions[key]
        tasks = fresh[key]['assessment']
        prompts = text['actualInstalledTaskPrompts']
        answers = [Fraction(answer) for answer in text['actualInstalledTaskAnswersExact']]
        inputs = [exact_input(value) for value in text['numericInputs']]
        if (text['manualReview'] != 'PASS' or view['visualReview'] != 'PASS'
                or view['sourceRecordSha256'] != digest(sources[key])
                or not comparisons[key]['ok'] or not all(row['ok'] for row in checks[key])
                or [row['prompt'] for row in tasks] != prompts
                or [row['unit'] for row in tasks] != [text['unit']] * 2
                or not all(installed.near(row['value'], answer) for row, answer in zip(tasks, answers, strict=True))):
            raise ValueError('A current assigned experiment differs from its manual or visual review: ' + key)
        scoped = [case for case in cases if case['id'] == key]
        setups = [case for case in scoped if 'interaction' not in case]
        if len(setups) != 8 or any(
            [row['actualPrompt'] for row in setup['questions']] != prompts
            or [exact_input(row['input']) for row in setup['questions']] != inputs
            for setup in setups
        ):
            raise ValueError('Current browser submissions do not match the reviewed manual tasks: ' + key)
        records.append({'id':key, 'ok':True, 'sourceSha256':digest(sources[key]), 'sourceVersion':sources[key]['version'],
                        'sourceRef':installed.SOURCE_REF, 'sourcePath':installed.SOURCE_PATH,
                        'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':chapters[key],
                        'physicalAssumptions':chapters[key].split('\n\n')[0], 'pedagogicalReview':view['reason'],
                        'exactChecks':checks[key], 'installedChecks':comparisons[key], 'actualObservedCases':len(scoped),
                        'manualPeer':text['reason'], 'originalEditionRetained':True, 'failedPublishedEdition':False,
                        'humanApproval':'NOT_RUN', 'publicationAction':'NONE'})
    if runtime_fingerprint(APP) != runtime or any(path.read_bytes() != raw for path, raw in evidence.items()):
        raise ValueError('A first-five C2 proof input changed during verification')
    return {'schemaVersion':'1.0.0','batch':BATCH,'runtimeSha256':runtime['sha256'],'records':records,
            'acceptedCount':len(records),'evidenceSha256':{str(path.relative_to(APP)):value for path,value in PINS.items()},
            'verifierSha256':sha(Path(__file__).read_bytes()),'humanApproval':'NOT_RUN','publicationAction':'NONE'}
