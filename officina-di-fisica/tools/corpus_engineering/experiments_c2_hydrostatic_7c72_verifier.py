"""Accept the four individually reviewed hydrostatic draft editions."""
from fractions import Fraction
import json
from pathlib import Path
from zipfile import ZipFile

from . import c2_hydrostatic_reading_four_draft_review_a as science
from .activity_observations import observed_answers, read_json, read_slice, read_visual_decision
from .experiment_stevino_7c72_verifier import COLLECTOR, RUNTIME, SOURCE
from .pipeline import digest, sha
from .review_contract import reviewed_rows


APP = Path(__file__).resolve().parents[2]
BATCH = 'experiments-c2-hydrostatic-reading-current'
PACKAGE = 'experiment-c2-hydrostatic-reading-20261127'
PROOF = APP / 'editorial/reviews/c2-hydrostatic-reading-7c72-acceptance-20261127'
PEER_SCIENCE = '39b82327267ef8576049848aa32965df61efd786'
PEER_QUOTA_TORRICELLI = 'f4fb3b5704c5d08ada0232e56e50d416ec59024c'
PEER_MANOMETER = '8ae4fe9d790189f333298024f250532da2f7b9c1'
PEER_PASCAL = 'a6faf94441d21e08159d53d95e31937603cf8d6e'
PASSED_PASCAL_SHA = 'cdbc3d74e2f7c19a9aea2b87171936ad34b5715393d9b21001ede15dbe69b5de'
PASSED_PASCAL_MANUAL_SHA = '71622ee3ae11df3f55e2869fc23648fb8e77939ea2c78e8e21fd8552b718a5b5'
PINNED_BUNDLE = {
    'quota-torricelli-observations.zip':'e73523888d5eac54452e2866cb095961948bfd1c89ec21c6f1cb907973c0401b',
    'manometer-observations.zip':'807608f477dce59cd1bc66750f35461bfc4568c84ac617948efaf4d57ef5b45b',
    'pascal-observations.zip':'fba54b261f8a2bb62a27b95f711f15638d631c7a3c03581a0858e6b0571705da',
}
REVIEWS = 'officina-di-fisica/editorial/reviews/'
EARLY = REVIEWS + 'c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/'
SCOPES = {
    'SIM-C2-L002-02':('quota-torricelli-observations.zip', EARLY + 'draft-l002-02', PEER_QUOTA_TORRICELLI),
    'SIM-C2-L002-03':('quota-torricelli-observations.zip', EARLY + 'draft-l002-03', PEER_QUOTA_TORRICELLI),
    'SIM-C2-L002-04':('manometer-observations.zip', REVIEWS + 'c2-manometro-v3-7c7281-independent-a-20261127', PEER_MANOMETER),
    'SIM-C2-L003-01':('pascal-observations.zip', REVIEWS + 'c2-pascal-increment-height-fixed-7c7281-independent-a-20261127', PEER_PASCAL),
}
PAS = 'SIM-C2-L003-01'
MANOMETER = 'SIM-C2-L002-04'
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
MATH_PIN = 'd1d4b5a94e865f7cac26d654252421373ebf6a1e1a6184236bd73642e0823bb2'
READING_PIN = '2610a3be97ebff7617f7900dfc2393ac2af53ab80a6a1445d8125e8830a97f40'
ORIGINAL_PIN = '32ef90d2393511097a0caa5497090e2abf78094117b2e3cc80d6604ac13f8859'
MANUAL = {
    'SIM-C2-L002-02': 'Sottrai la quota dalla superficie a 3 m. Per z=2, h=1 e Δp=10 kPa. Per z=3/2, h=3/2 e Δp=15 kPa. Dividendo per 10 si recupera h, e quindi z=3−h.',
    'SIM-C2-L002-03': 'Un centimetro di Hg equivale a 34/25 kPa. A 102 kPa, dividi per 34 e moltiplica per 25: 3×25=75 cm. A 88,4 kPa, usa 442/(5×34)=13/5, quindi 25×13/5=65 cm.',
    MANOMETER: 'Con acqua e g=10, 1 kPa dà 10 cm di dislivello. +2 kPa dà +20 cm e 0 kPa dà 0 cm. La differenza firmata è destra meno sinistra. A sezioni uguali le due superfici si spostano di metà del dislivello.',
    PAS: '20 cm² = 1/500 m². Un kPa è 1000 Pa, quindi ogni kPa aggiunto dà 2 N. A 6 kPa l’incremento è 12 N, a 5 kPa è 10 N. Inversamente, dividi l’incremento di forza per 2 per ritrovare i kPa aggiunti.',
}


def checked_json(path, checksum):
    raw = path.read_bytes()
    if sha(raw) != checksum:
        raise ValueError('Independent evidence changed: ' + path.name)
    return json.loads(raw)


def edition_visual_decision(archive, folder, cases, key, version, candidate):
    """The version-aware peer sheet labels the version as draftVersion."""
    review = read_json(archive, folder + '/visual-review-per-id.json')
    rows = review['records']
    if (review['runtimeSha256'], review['sourceCommit'], review['humanApproval']) != (RUNTIME, SOURCE, 'NOT_RUN'):
        raise ValueError('Independent edition decision belongs to a different epoch')
    if len(rows) != 1:
        raise ValueError('Expected one distinct edition decision')
    row = rows[0]
    if (row['id'], row['draftVersion'], row['candidateSha256'], row['visualReview']) != (key, version, candidate, 'PASS'):
        raise ValueError('Positive visual evidence for the actual additive version missing: ' + key)
    examples = row['readFiles']
    profiles = {tuple(sorted(case['profile'].items())) for case in cases.values()}
    if len(examples) != len(profiles) or {tuple(sorted(item['profile'].items())) for item in examples} != profiles:
        raise ValueError('Independent readings do not cover every profile: ' + key)
    if [item['sha256'] for item in examples] != row['readPngSha256']:
        raise ValueError('Independent raster list changed: ' + key)
    for item in examples:
        case = cases[item['caseKey']]
        image = {'file':'screens/' + item['sha256'] + '.png', 'sha256':item['sha256']}
        if item['profile'] != case['profile'] or image not in case['screenshots']:
            raise ValueError('Independent reading is detached from the observed case: ' + item['caseKey'])
    return row


def observed_draft(key, source, record, tasks):
    filename, folder, reviewer_commit = SCOPES[key]
    path = PROOF / filename
    archive_sha = sha(path.read_bytes())
    if archive_sha != PINNED_BUNDLE[filename]:
        raise ValueError('Pinned hydrostatic observations changed: ' + key)
    with ZipFile(path) as archive:
        actual, cases, observed_sha = read_slice(
            archive, folder, key=key, variant='draft', version=record['version'], source=digest(source),
            candidate=digest(record), runtime=RUNTIME, collector=COLLECTOR, draft_record=record,
        )
        if actual['sourceCommit'] != SOURCE or len(cases) != 48:
            raise ValueError('Expected 48 current runtime cases: ' + key)
        answered_profiles = observed_answers(cases, [(task['independentExact'], True) for task in tasks])
        grids = [case for case in cases.values() if 'model' in case]
        if answered_profiles != 8 or len(grids) != 40:
            raise ValueError('Expected eight actual setups and forty observations: ' + key)
        for case in grids:
            science.compare_observation(key, case['model']['x'], case['model']['y'])
        version = record['version']
        if key in (MANOMETER, PAS):
            decision = edition_visual_decision(archive, folder, cases, key, version, observed_sha)
        else:
            decision = read_visual_decision(archive, folder, cases, key, 'draft', version, observed_sha, RUNTIME, SOURCE)
        extra = {}
        if key == MANOMETER:
            gate = read_json(archive, folder + '/actual-owner-guest-http.json')
            if (gate['canonicalPublishedLiveVersion'], gate['owner']['version'], gate['owner']['status'], gate['guest']['status']) != (2, 3, 200, 403):
                raise ValueError('Owner, guest and canonical live versions are no longer distinct')
            if not (gate['publishedUnchanged'] and gate['owner']['completeNormalizedPayloadEqualsPrepared']
                    and gate['guest']['anonymousDenied'] and gate['guest']['authoredBlocksReturned'] == 0):
                raise ValueError('Manometer privacy or published-byte assertion missing')
            extra['manometerOwnerAndGuest'] = gate
        if key == PAS:
            raw_manual = archive.read(folder + '/manual-final-71622.verbatim.md')
            old = read_json(archive, folder + '/strict-record-diff.json')
            if (sha(raw_manual) != PASSED_PASCAL_MANUAL_SHA or decision['manualFinalSha256'] != PASSED_PASCAL_MANUAL_SHA
                or decision['sourceScientificReview'] != 'PASS_INCREMENTAL_PRESSURE_THEORY_ALIGNED_WITH_DIFFERENT_DRAWING_HEIGHTS'
                or decision['previousNegativeCommit'] != PEER_QUOTA_TORRICELLI
                or not old['allFormulasDataKeysDomainsAndGeometryUnchanged']):
                raise ValueError('Corrected Pascal reading is unavailable')
            extra['priorDraftNegativeRetainedAt'] = decision['previousNegativeCommit']
    return {'browserCases':48, 'answeredProfiles':answered_profiles, 'actualAnswerSubmissions':2 * answered_profiles,
            'actualGridValuesCheckedAgainstIndependentModel':len(grids),
            'rawSelectionCandidateSha256':observed_sha, 'canonicalCandidateSha256':digest(record),
            'peerReading':decision['reason'], 'readPngSha256':decision['readPngSha256'],
            'peerBrowserCommit':reviewer_commit, 'observationArchiveSha256':archive_sha, **extra}


def report(sources, package, bindings):
    keys = set(SCOPES)
    if set(sources) != keys:
        raise ValueError('Expected the complete four-record hydrostatic cohort')
    math = checked_json(PROOF / 'independent-report.json', MATH_PIN)
    notes = checked_json(PROOF / 'reading-notes-per-id.json', READING_PIN)
    if math['reviewer'] != 'A_distinct_from_Root_author' or math['actualTaskCount'] != 8 or math['humanApproval'] != 'NOT_RUN':
        raise ValueError('Distinct exact derivation receipt is unavailable')
    math_rows = {row['id']:row for row in math['records']}
    text_rows = {row['id']:row for row in notes['records']}
    published = {row['id']:row for row in checked_json(APP/'editorial/reviews/experiments-pressure-hydrostatics-047-originals.json', ORIGINAL_PIN)['records']}
    historical = {**science.PINS, PAS:PASSED_PASCAL_SHA}
    canonical_signatures = {
        row['id']:digest({'record':row, 'assets':{}, 'source':{'id':row['id'], 'ref':SOURCE_REF, 'sha256':digest(sources[row['id']])}})
        for row in package['records']
    }
    records = []
    for record, binding, signature, assets, errors in reviewed_rows(package, bindings, canonical_signatures, keys, APP/'editorial/assets'):
        key = record['id']
        source, math_row = sources[key], math_rows[key]
        if (errors or assets or digest(record) != historical[key] or binding['sourceId'] != key
            or binding['sourceRef'] != SOURCE_REF or binding['sourceSha256'] != digest(source)
            or math_row['sourceSha256'] != digest(source) or math_row['candidateSha256'] != science.PINS[key]
            or record['baseVersion'] != source['version'] or record['version'] != math_row['draftVersion']
            or math_row['manualAndTextReview'] != 'PASS_DISTINCT_AI_WITH_MODELS_REUSED_DISCLOSED'):
            raise ValueError('The exact individual edition and its independent scientific evidence differ: ' + key)
        tasks = math_row['tasks']
        if len(tasks) != 2:
            raise ValueError('Expected two independently solved assigned tasks: ' + key)
        for point, task in zip(record['assessmentSelection']['points'], tasks, strict=True):
            supplied = Fraction(str(point))
            exact = science.law(key, supplied)
            if (exact != Fraction(task['independentExact']) or science.inverse(key, exact) != supplied
                or task['unit'] != record['measure']['unit'] or not task['manualFeasible']):
                raise ValueError('Exact answer or inverse mismatch: ' + key)
        observed = observed_draft(key, source, record, tasks)
        original = {**published[key], 'judgmentScope':'Historical published-edition assessment; the current acceptance belongs to the additive draft.'}
        records.append({'id':key, 'ok':True, 'sourceSha256':digest(source), 'sourceVersion':source['version'],
                        'candidateSha256':digest(record), 'candidateVersion':record['version'], 'baseVersion':record['baseVersion'],
                        'reviewedSignature':signature, 'originalEditionRetained':True, 'publishedEditionReview':original,
                        'failedPublishedEdition':not original['ok'], 'calculationScope':'EXACT_MANUAL_CALCULATION',
                        'manualArithmetic':MANUAL[key], 'physicalAssumptions':text_rows[key]['reason'],
                        'pedagogicalReview':observed['peerReading'], 'dimensionalCheck':math_row['physicalDimensionCheck'],
                        'independentExactTasks':tasks, 'observedDraft':observed,
                        'publicationAction':'DRAFT', 'humanApproval':'NOT_RUN'})
    return {'schemaVersion':'1.0.0', 'runtimeSha256':RUNTIME, 'observedSourceCommit':SOURCE,
            'collectorSha256':COLLECTOR, 'records':records, 'acceptedCount':len(records),
            'independentScienceCommit':PEER_SCIENCE, 'independentScienceReportSha256':MATH_PIN,
            'independentScienceVerifierSha256':sha(Path(science.__file__).read_bytes()),
            'verifierSha256':sha(Path(__file__).read_bytes()), 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
