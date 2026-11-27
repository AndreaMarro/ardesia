"""Verify the revised Stevino experiment and retain its original scientific failure."""
from decimal import Decimal
from math import isclose
from pathlib import Path
from zipfile import ZipFile

from . import experiment_stevino_revision_047_math_verifier as science
from .activity_observations import observed_answers, read_json, read_slice, read_visual_decision
from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
BATCH = 'experiment-stevino-revision-047-current'
PROOF = APP / 'editorial/reviews/c2-stevino-7c72-acceptance-20261127'
SOURCE = 'b9994b9116e87478905191d85cca8037d17ae4bd'
PEER = 'f4fb3b5704c5d08ada0232e56e50d416ec59024c'
FOLDER = 'officina-di-fisica/editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127'
BROWSER_ARCHIVE_SHA = '050c7ecd5614a97cacaf1e0e6793d10c7092bfbc6dfb8fbb7bffd61828fffcac'
RUNTIME = '7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
COLLECTOR = '719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'


def observations(source, draft_record, proof=PROOF):
    candidate = digest(draft_record)
    archive_path = proof / 'independent-observations.zip'
    if sha(archive_path.read_bytes()) != BROWSER_ARCHIVE_SHA:
        raise ValueError('Pinned independent observation archive changed')
    with ZipFile(archive_path) as archive:
        handoff = read_json(archive, FOLDER + '/handoff.json', '157642d98b24b385c4bb212849b871e927b158426e2ef22e2de11e9b772efae0')
        if (handoff['sourceCommit'] != SOURCE or handoff['runtimeSha256'] != RUNTIME
            or handoff['collectorSha256'] != COLLECTOR or science.KEY not in handoff['localPositiveDraftIds']):
            raise ValueError('The distinct reviewer did not attest this draft and epoch')
        groups = [
            ('draft-l002-01', 'draft', candidate, '14.715', True, 48),
            ('original-stevino-correct-physics-rejected', 'published', None, '15', False, 48),
            ('original-stevino-installed-grader-accepted', 'published', None, '14.715', True, 24),
        ]
        output = []
        for name, variant, identity, transfer_input, accepted, count in groups:
            folder = FOLDER + '/groups/' + name
            version = 2 if variant == 'draft' else 1
            actual, cases, observed_candidate = read_slice(archive, folder, key=science.KEY, variant=variant, version=version,
                                       source=source, candidate=identity, runtime=RUNTIME, collector=COLLECTOR,
                                       draft_record=draft_record if variant == 'draft' else None)
            if actual['sourceCommit'] != SOURCE or len(cases) != count:
                raise ValueError('Observed Stevino scope changed: ' + name)
            setup_count = observed_answers(cases, [('19.62', True), (transfer_input, accepted)])
            if setup_count != 8:
                raise ValueError('Expected eight observed assessment profiles: ' + name)
            for case in cases.values():
                if 'model' not in case:
                    continue
                model = case['model']
                exact = Decimal('9.81') * Decimal(str(model['x']))
                # Compare the binary reading against the exact quantity within rounding
                # at the representation boundary; this is independent of the grader.
                if not isclose(model['y'], float(exact), rel_tol=1e-15, abs_tol=0):
                    raise ValueError('The observed pressure departs from hydrostatics: ' + case['caseKey'])
            decision = read_visual_decision(archive, folder, cases, science.KEY, variant, version, observed_candidate, RUNTIME, SOURCE)
            output.append({'group':name, 'variant':variant, 'cases':len(cases),
                           'canonicalCandidateSha256':identity, 'observedCandidateSha256':observed_candidate,
                           'actualAnswerSubmissions':setup_count * 2, 'transferInput':transfer_input,
                           'transferAccepted':accepted, 'peerReading':decision['reason'],
                           'readPngSha256':decision['readPngSha256']})
    return output


def report(sources, package, bindings):
    if set(sources) != {science.KEY}:
        raise ValueError('Expected the original Stevino record only')
    source = sources[science.KEY]
    checked = science.report(source, package, bindings)
    text = checked['scientificTextMathReview']
    if text['ok'] is not True or checked['publishedEditionReview']['ok'] is not False:
        raise ValueError('Stevino candidate or historical scientific evidence changed')
    evidence = observations(digest(source), package['records'][0])
    published = {**checked['publishedEditionReview'], 'freshObservedCounterexamples':evidence[1:]}
    row = {'id':science.KEY, 'ok':True, 'sourceVersion':checked['sourceVersion'],
           'sourceSha256':checked['sourceSha256'], 'candidateSha256':checked['candidateSha256'],
           'candidateVersion':checked['candidateVersion'], 'baseVersion':checked['baseVersion'],
           'reviewedSignature':checked['reviewedSignature'], 'publicationAction':'DRAFT',
           'humanApproval':'NOT_RUN', 'originalEditionRetained':True,
           'calculationScope':'EXACT_MANUAL_CALCULATION', 'manualArithmetic':text['manualArithmetic'],
           'physicalAssumptions':'Acqua uniforme in quiete, gravità assegnata 981/100 m/s² e pressione relativa al pelo libero.',
           'pedagogicalReview':'Il bilancio della colonna motiva la legge e il doppio riferimento distingue profondità da pressione. Il banco può mostrare 14,72 kPa arrotondati, mentre consegna e svolgimento ricavano e accettano 14,715 kPa esatti.',
           'publishedEditionReview':published, 'failedPublishedEdition':True,
           'symbolicDimensionalChecks':text['checks'], 'observedDraft':evidence[0]}
    return {'schemaVersion':'1.0.0', 'records':[row], 'acceptedCount':1,
            'runtimeSha256':RUNTIME, 'observedSourceCommit':SOURCE, 'independentPeerCommit':PEER,
            'browserArchiveSha256':BROWSER_ARCHIVE_SHA, 'collectorSha256':COLLECTOR,
            'scienceVerifierSha256':checked['verifierSha256'], 'dependencyVersions':checked['dependencyVersions'],
            'observationVerifierSha256':sha(Path(__file__).with_name('activity_observations.py').read_bytes()),
            'verifierSha256':sha(Path(__file__).read_bytes()), 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
