"""Verify the independently positive C4 originals from the four browser slices."""

from fractions import Fraction
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from . import experiments_C4_code_partial_verifier as science
from .experiment_visibility_request import planned_interactions, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
REVIEWS = APP/'editorial/reviews'
BATCH = 'experiments-c4-three-originals'
PROOF = REVIEWS/'c4-three-originals-7c72-acceptance-20261127'
ACQUISITION = REVIEWS/'c4-composed-7c72-four-browser-slices-20261127'
IDS = {'SIM-C4-L01-01','SIM-C4-L01-02','SIM-C4-L03-01'}
RUNTIME = '7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
CANDIDATE = 'b9994b9116e87478905191d85cca8037d17ae4bd'
CANARIES = 'POSITIVE_OBSERVED_CANARIES_ONLY'


def read(path):
    return json.loads(path.read_bytes())


def controlled_file(name, pin):
    raw = (PROOF/name).read_bytes()
    if sha(raw) != pin:
        raise ValueError('C4 review evidence hash mismatch: ' + name)
    return raw


def observed(archive, summary, sources, manual):
    keys = set()
    counts = {key:{'cases':0,'setups':0,'rasters':{}} for key in IDS}
    collector = summary['collectorSha256']
    parent_raw = archive.read('prepared448.json')
    if sha(parent_raw) != summary['parentPlanSha256']:
        raise ValueError('Parent C4 observation plan changed')
    parent = json.loads(parent_raw)
    for index, report_pin in enumerate(summary['actualSlices']):
        directory = f'profiles-{index}/attempt-01/'
        terminal = json.loads(archive.read(directory+'terminal.json'))
        plan = json.loads(archive.read(directory+'plan.json'))
        if (terminal['observedExitCode'] != 0 or terminal['timeoutTriggered']
                or plan['sourceCommit'] != CANDIDATE or plan['runtimeFingerprint']['sha256'] != RUNTIME
                or plan['requestSha256'] != parent['requestSha256']):
            raise ValueError('C4 slice did not finish undisturbed on the declared candidate')
        raw = archive.read(directory+'actual/report.json')
        if sha(raw) != report_pin:
            raise ValueError('C4 slice raw report changed')
        get = lambda name: archive.read(directory+'actual/'+name)
        report = verify_report_bytes(get, plan, collector)
        slots = planned_interactions(plan)
        for item in report['cases']:
            case_key = item['caseKey']
            if case_key in keys:
                raise ValueError('Two slices observe the same C4 case identity')
            keys.add(case_key)
            case = json.loads(get(item['file']))
            key = case['id']
            if key not in IDS:
                continue
            row, state = slots[case_key]
            verify_planned_interaction(case, row, state)
            if case['sourceSha256'] != digest(sources[key]) or case['variant'] != 'published':
                raise ValueError('Observed C4 case lost its original edition identity')
            count = counts[key]
            count['cases'] += 1
            count['rasters'][case_key] = {image['sha256'] for image in case['screenshots']}
            if state is None:
                questions = case['questions']
                want = [Fraction(value) for value in manual[key]['independentExactTasks']]
                if (case['axe'] or len(case['phases']) != 4
                        or [Fraction(q['input'].replace(',', '.')) for q in questions] != want
                        or not all(q['status'].startswith('Corretto. ') for q in questions)):
                    raise ValueError('The reviewed C4 task differs from the actual accessible setup')
                count['setups'] += 1
    if len(keys) != 448 or keys != set(parent['expectedCaseKeys']):
        raise ValueError('The four C4 slices do not cover the full frozen request exactly once')
    return counts


def report(sources):
    profile = runtime_fingerprint(APP)
    if profile['sha256'] != RUNTIME:
        raise ValueError('The C4 positive scoped observations belong to runtime 7c72')
    raw_source = (APP/'content/esperienze-C4.json').read_bytes()
    full = {row['id']:row for row in json.loads(raw_source)}
    if sha(raw_source) != science.SOURCE_SHA or sources != {key:full[key] for key in IDS}:
        raise ValueError('Current C4 original sources changed')
    seal = read(PROOF/'seal.json')
    visual = json.loads(controlled_file('visual-peer.json', seal['visualPeerSha256']))
    manual = json.loads(controlled_file('manual-peer.json', seal['manualPeerSha256']))
    prose = controlled_file('manual-reviewed.md', seal['manualSha256'])
    selection = json.loads(controlled_file('selected-canaries.json', seal['canarySelectionSha256']))
    if (visual['role'] != 'INDEPENDENT_RASTER_REVIEW' or visual['runtimeSha256'] != RUNTIME
            or visual['candidateCommit'] != CANDIDATE or visual['reviewer'] == visual['candidateAuthor']
            or manual['role'] != 'INDEPENDENT_TEXT_AND_MANUAL_REVIEW' or manual['author'] == manual['reviewer']
            or manual['manualSha256'] != sha(prose) or manual['actualNodeExitCode'] != 0 or manual['findings']
            or manual['activityCredit'] != 0 or manual['humanApproval'] != 'NOT_RUN'):
        raise ValueError('C4 requires distinct pinned manual and raster review')
    selected_rasters = [entry for sheet in selection['sheets'] for entry in sheet['entries']]
    if len(selected_rasters) != len(selection['caseKeys']) or {row['caseKey'] for row in selected_rasters} != set(selection['caseKeys']):
        raise ValueError('The C4 reading selection is incomplete or duplicated')
    judgements = {row['id']:row for row in visual['perId']}
    manual_rows = {row['id']:row for row in manual['perId']}
    chapters = {}
    for section in prose.decode().split('\n## `')[1:]:
        key, body = section.split('` · ', 1)
        chapters[key] = body.partition('\n\n')[2].strip()
    script = APP/'tests/corpus/collect-C4-bounded-code-only.mjs'
    installed = json.loads(subprocess.check_output(['node',str(script),'electrostatics'],cwd=APP,timeout=45))
    interventions = {row['id']:row for row in science.compare('electrostatics', installed, full)}
    summary = read(ACQUISITION/'summary.json')
    if [row['sha256'] for row in visual['reports']] != summary['actualSlices']:
        raise ValueError('The independent raster review belongs to a different report')
    archive_path = ACQUISITION/'actual-four-slices.zip'
    if sha(archive_path.read_bytes()) != seal['archiveSha256']:
        raise ValueError('C4 actual archive changed')
    with ZipFile(archive_path) as archive:
        scope = observed(archive, summary, sources, manual_rows)
    records = []
    for key in sorted(IDS):
        judgement, text, math, scope_row = judgements[key], manual_rows[key], interventions[key], scope[key]
        relevant = [row for row in selected_rasters if row['caseKey'].split('|', 1)[0] == key]
        if (judgement['rasterVerdict'] != CANARIES or judgement['findings'] or text['textAndManualArithmetic'] != 'PASS'
                or judgement['twoManualTasksExact'] != text['independentExactTasks'] or not math['sourceMathAndActualTasksOk']
                or text['units'] != [sources[key]['measure']['unit']] * 2
                or scope_row['cases'] != judgement['recordsIntegrityAndScalarChecked'] or scope_row['setups'] != 8
                or len(relevant) != judgement['newPNGSourceFramesReadAsWholePanels']
                or not all(row['sha256'] in scope_row['rasters'][row['caseKey']] for row in relevant)):
            raise ValueError('C4 original lacks positive individual evidence: ' + key)
        records.append({'id':key,'ok':True,'sourceSha256':digest(sources[key]),'sourceVersion':sources[key]['version'],
            'sourceRef':science.REF,'sourcePath':science.SOURCE,'calculationScope':'EXACT_MANUAL_CALCULATION',
            'manualArithmetic':chapters[key],'physicalAssumptions':math['assumptionsAndDomain'],
            'pedagogicalReview':'The separately read whole manual covers both installed tasks with exact arithmetic, signs, units and an inverse check.',
            'freshScientificChecks':math,
            'positiveRasterScope':judgement,'actualObservedCases':scope_row['cases'],'originalEditionRetained':True,
            'failedPublishedEdition':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    if runtime_fingerprint(APP) != profile:
        raise ValueError('The C4 runtime changed during independent verification')
    return {'schemaVersion':'1.0.0','batch':BATCH,'runtimeSha256':RUNTIME,'records':records,
            'acceptedCount':len(records),'sealSha256':sha((PROOF/'seal.json').read_bytes()),
            'verifierSha256':sha(Path(__file__).read_bytes()),'humanApproval':'NOT_RUN','publicationAction':'NONE'}
