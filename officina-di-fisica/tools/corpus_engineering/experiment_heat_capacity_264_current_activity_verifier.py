"""Bind reviewed heat-capacity text to the current private bench and reader."""

import json
from pathlib import Path
from zipfile import ZipFile

from . import experiment_heat_capacity_264_independent_verifier as science
from .experiment_visibility_request import planned_interactions, safe, verify_planned_interaction, verify_report_bytes
from .pipeline import digest, sha
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]
BATCH = 'experiment-heat-capacity-264-current-activity'
SEAL = 'editorial/reviews/heat-capacity-264-2096-actual-20261127/scientific-seal.json'
PROBE = 'editorial/reviews/heat-capacity-264-independent-20261127/actual-code-probe.json'
PROFILES = {(width, view) for width in (320, 1280) for view in ('orbit', 'side', 'top', 'fixed_projection')}


def checked_reference(reference):
    path = safe(APP, reference['path'])
    if sha(path.read_bytes()) != reference['sha256']:
        raise ValueError('Heat-capacity evidence checksum differs: ' + reference['path'])
    return path


def validate_browser(seal, fingerprint, reviewed):
    archive_path = checked_reference(seal['archive'])
    with ZipFile(archive_path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError('Duplicate heat-capacity evidence files')
        prepared_raw = archive.read('prepared.json')
        prepared = json.loads(prepared_raw)
        terminal = json.loads(archive.read('terminal-receipt.json'))
        report_sha = sha(archive.read('report.json'))
        if (prepared['runtimeFingerprint'] != fingerprint or prepared['sourceCommit'] != seal['sourceCommit']
                or terminal['observedExitCode'] != 0 or terminal['supervisorTimedOut']
                or terminal['preparedSha256'] != sha(prepared_raw) or terminal['reportSha256'] != report_sha
                or terminal['plannedCases'] != 192 or terminal['collectorSha256'] != seal['collectorSha256']):
            raise ValueError('Missing current terminal evidence for both heat-capacity editions')
        report = verify_report_bytes(archive.read, prepared, terminal['collectorSha256'])
        if (report['preparedSha256'] != sha(prepared_raw) or report['errors']
                or report['guestIsolation'] != 'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403'):
            raise ValueError('The heat-capacity reader evidence is unbound or not private')
        owner_versions = [(row['id'], row['version']) for row in report['fullOwnerRecordIdentity']['records']]
        if owner_versions != [(science.KEY, reviewed['candidateVersion'])]:
            raise ValueError('Owner evidence no longer identifies the reviewed draft')
        states = planned_interactions(prepared)
        by_variant = {'published': {}, 'draft': {}}
        for item in report['cases']:
            case = json.loads(archive.read(item['file']))
            plan_row, state = states[item['caseKey']]
            verify_planned_interaction(case, plan_row, state)
            variant = case['variant']
            candidate = reviewed['candidateSha256'] if variant == 'draft' else None
            if (case['id'], case['sourceSha256'], case['candidateSha256']) != (science.KEY, science.SOURCE_SHA, candidate):
                raise ValueError('Browser case has the wrong heat-capacity edition')
            if state is not None:
                if case['model']['y'] != science.capacity(state['x']):
                    raise ValueError('A recorded browser reading differs from exact 2m/5')
                continue
            profile = case['profile']['width'], case['profile']['view']
            if profile in by_variant[variant] or case['axe'] or len(case['phases']) != 4:
                raise ValueError('Heat-capacity setup is missing or inaccessible')
            phase = case['phases'][0]
            if variant == 'draft':
                formulas = case['reading']['formulas']
                if ('5/2' not in phase or not all(text in phase for text in ('40 J con 100 g', '100 J con 250 g'))
                        or len(formulas) != 3
                        or any(row['scroll'] > row['width'] + 1 or row['typeset'] > row['width'] + 1 for row in formulas)):
                    raise ValueError('Draft prose or formulas differ in the actual learner reader')
            elif 'raddoppia l’energia necessaria' not in phase:
                raise ValueError('The original-edition finding is no longer observable')
            tasks = case['questions']
            if ([row['input'] for row in tasks] != ['100', '70']
                    or not all(row['actualPrompt'] == row['prompt'] and row['status'].startswith('Corretto. ') for row in tasks)):
                raise ValueError('An installed assigned question differs from the exact reviewed tasks')
            by_variant[variant][profile] = {row['sha256'] for row in case['screenshots']}
        if any(set(profiles) != PROFILES for profiles in by_variant.values()):
            raise ValueError('Incomplete independent-profile source for the heat-capacity visual review')
    return by_variant, report_sha


def report(sources, package, bindings):
    fingerprint = runtime_fingerprint(APP)
    seal_file = APP / SEAL
    seal_bytes = seal_file.read_bytes()
    seal = json.loads(seal_bytes)
    if seal['runtimeSha256'] != fingerprint['sha256']:
        raise ValueError('Stale heat-capacity browser proof')
    historical = json.loads((APP / PROBE).read_bytes())
    original_review = science.report(sources, package, bindings, historical)
    reviewed, = original_review['records']
    screenshots, report_sha = validate_browser(seal, fingerprint, reviewed)
    peer_raw = checked_reference(seal['visualPeer']).read_bytes()
    peer = json.loads(peer_raw)
    if (peer['sourceCommit'] != seal['sourceCommit'] or peer['runtimeSha256'] != fingerprint['sha256']
            or peer['artifactPins']['report.json']['sha256'] != report_sha
            or peer['role'] != 'DISTINCT_REVIEWER_A_ROOT_AUTHOR_RECUSED'
            or peer['humanApproval'] != 'NOT_RUN' or peer['activityCredit'] != 0):
        raise ValueError('Distinct heat-capacity visual review is unavailable on this runtime')
    visual = {row['variant']:row for row in peer['records']}
    if set(visual) != set(screenshots) or len(peer['records']) != len(screenshots):
        raise ValueError('Review both rendered heat-capacity editions')
    for variant, profiles in screenshots.items():
        observed = visual[variant]
        observed_files = observed['readFiles']
        read = {(row['profile']['width'], row['profile']['view']):row['sha256'] for row in observed_files}
        expected_text = 'PASS' if variant == 'draft' else 'FAIL'
        candidate = reviewed['candidateSha256'] if variant == 'draft' else None
        if (observed['id'] != science.KEY or observed['sourceSha256'] != science.SOURCE_SHA
                or observed['candidateSha256'] != candidate or observed['pedagogicalTextReview'] != expected_text
                or observed['visualReview'] != 'PASS' or not observed['reason'] or len(observed_files) != len(PROFILES)
                or set(read) != PROFILES or any(value not in profiles[profile] for profile, value in read.items())
                or any(row['wholeRawPngOpenedAndRead'] is not True for row in observed_files)):
            raise ValueError('Heat-capacity visual reading is incomplete: ' + variant)
    formula_peer_raw = checked_reference(seal['formulaPeer']).read_bytes()
    formula_peer = json.loads(formula_peer_raw)
    preview = APP / 'editorial/reviews/experiment-heat-capacity-revision-264-browser.json'
    formula_rasters = formula_peer['readFiles']
    if (formula_peer['sourceCommit'] != seal['sourceCommit'] or formula_peer['runtimeSha256'] != fingerprint['sha256']
            or formula_peer['role'] != 'DISTINCT_REVIEWER_A_ADDENDUM_NO_NEW_BROWSER'
            or formula_peer['producerReportSha256'] != sha(preview.read_bytes())
            or formula_peer['id'] != science.KEY or formula_peer['variant'] != 'draft'
            or formula_peer['humanApproval'] != 'NOT_RUN' or formula_peer['activityCredit'] != 0
            or len(formula_rasters) != 2 or {row['width'] for row in formula_rasters} != {320, 1440}
            or any(row['wholePngActuallyOpenedAndRead'] is not True or not row['visibleFormulaScope']
                   or row['visualReview'] != 'PASS_WITH_DECLARED_VIEWPORT_SCOPE' for row in formula_rasters)):
        raise ValueError('Independent formula reading does not identify the current private preview')
    for raster in formula_rasters:
        checked_reference(raster)
    if runtime_fingerprint(APP) != fingerprint or seal_file.read_bytes() != seal_bytes:
        raise ValueError('Heat-capacity verification inputs changed during replay')
    record = {**{name:value for name,value in reviewed.items() if name != 'activityCredit'},
              'ok':True, 'calculationScope':'EXACT_MANUAL_CALCULATION',
              'manualArithmetic':('C = 2m/5. Dividi per cinque le masse assegnate di 250 g e 175 g, poi raddoppia. '
                                  'Ottieni 100 J/K e 70 J/K. Il rapporto 250/100 tra le masse si riduce a 5/2, come '
                                  '100/40 tra le capacità termiche. A parità di aumento di temperatura, anche il '
                                  'calore assorbito cresce di quel fattore. Per risalire alla massa da 70 J/K, '
                                  'moltiplica il valore per 5/2 e ottieni 175 g.'),
              'physicalAssumptions':reviewed['candidateTextMathManualReview']['physicalAssumptions'],
              'pedagogicalReview':visual['draft']['reason'], 'failedPublishedEdition':True,
              'originalEditionRetained':True, 'newProductUiReview':'PASS_CURRENT_DRAFT',
              'overallAcceptance':'PASS_AI_DRAFT_ACTIVITY', 'publicationAction':'DRAFT', 'humanApproval':'NOT_RUN'}
    return {'schemaVersion':'1.0.0', 'batch':BATCH, 'runtimeSha256':fingerprint['sha256'], 'records':[record],
            'acceptedCount':1, 'reportSha256':report_sha, 'sealSha256':sha(seal_bytes), 'visualPeerSha256':sha(peer_raw),
            'formulaPeerSha256':sha(formula_peer_raw), 'formulaRasterScope':formula_peer['formulaRasterScope'],
            'historicalScientificVerifierSha256':original_review['verifierSha256'], 'verifierSha256':sha(Path(__file__).read_bytes()),
            'humanApproval':'NOT_RUN', 'publicationAction':'DRAFT'}
