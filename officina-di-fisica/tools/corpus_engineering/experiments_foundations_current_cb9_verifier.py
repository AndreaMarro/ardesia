"""Renew the foundations family against the actual current visual report."""

import json
from pathlib import Path, PurePosixPath
from tempfile import TemporaryDirectory
from types import FunctionType
from zipfile import ZipFile

from . import experiments_foundations_revision_verifier as foundation
from . import experiments_revision_review as shared
from .experiment_visibility_request import verify_report
from .pipeline import sha


BATCH = foundation.BATCH
DRAFT = 'experiment-projection-revision-118'
RUNTIME = 'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
AUDIT = 'editorial/reviews/c1-foundation-work-current-audit-20261127'
INDEX_SHA = 'c43e486c19886f711f282450dbf5332cc7cc78a6c6d26b0f76b0d43135715bad'
IMAGE_REVIEW_SHA = '687529392285e313140fbcc4f60fea7c984695486cd52bb749f30858e8692787'
GRID_SCREEN_SHA = '1c049e5655331cb69ebaa7ca822bf507946391f03922a2f2672677c06765f0fc'


def load_pinned(path, pin):
    data = path.read_bytes()
    if sha(data) != pin:
        raise ValueError('Current foundations evidence differs: ' + path.name)
    return json.loads(data)


def consumer_evidence(app):
    location = app / AUDIT
    index = load_pinned(location / 'actual-ui-552-index.json', INDEX_SHA)
    reading = load_pinned(location / 'actual-selected-image-read.json', IMAGE_REVIEW_SHA)
    screen = load_pinned(location / 'actual-geometry-screen.json', GRID_SCREEN_SHA)
    keys = set(foundation.SPECS)
    selected = [row for row in reading['samples'] if row['id'] in keys]
    expected = {(key, view) for key in keys for view in ('side', 'fixed_projection')}
    if len(selected) != len(expected) or {(r['id'], r['view']) for r in selected} != expected:
        raise ValueError('Current foundations representative reading incomplete')
    if any(row.get('wholePngOpenedAndRead') is not True or row.get('finding') for row in selected):
        raise ValueError('Foundations visual evidence missing or negative')
    if any(row['id'] in keys for row in screen['wholeGlyphCandidates']):
        raise ValueError('A foundations label covers a measured glyph')
    archive = location / 'actual-ui-552.zip'
    if sha(archive.read_bytes()) != index['archiveSha256']:
        raise ValueError('Current foundations browser archive differs')
    expected_files = {item['file']: item for item in index['files']}
    terminal = index['terminal']
    if terminal['observedExitCode'] != 0 or terminal['runtimeSha256'] != RUNTIME or terminal['plannedCases'] != 552:
        raise ValueError('The actual browser run was incomplete or stale')
    with TemporaryDirectory(prefix='cric-foundations-current-') as temporary, ZipFile(archive) as source:
        output = Path(temporary)
        if len(source.namelist()) != len(expected_files) or set(source.namelist()) != set(expected_files):
            raise ValueError('Unexpected browser archive contents')
        for name, item in expected_files.items():
            rel = PurePosixPath(name)
            data = source.read(name)
            if rel.is_absolute() or '..' in rel.parts or len(data) != item['bytes'] or sha(data) != item['sha256']:
                raise ValueError('Missing, unsafe or altered actual file: ' + name)
            target = output / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        for row in selected:
            path = row['png']['file']
            if expected_files[path]['sha256'] != row['png']['sha256']:
                raise ValueError('Read frame differs from the actual archive')
        planned = load_pinned(output / 'prepared.json', terminal['preparedSha256'])
        load_pinned(output / 'report.json', terminal['reportSha256'])
        report = verify_report(output, planned, terminal['collectorSha256'])
        source_rows = {r['id']: r for r in planned['records'] if r['id'] in keys}
        if set(source_rows) != keys or source_rows[foundation.REVISION_ID]['variant'] != 'draft':
            raise ValueError('Current foundations effective records differ')
        candidate = source_rows[foundation.REVISION_ID]['record']
        package = json.loads((app / 'editorial/batches' / (DRAFT + '.json')).read_bytes())
        if package['records'] != [candidate]:
            raise ValueError('The observed owner edition differs from the current draft')
        import_result, = report['canonicalImport']['imports']
        if (import_result['first']['saved'], import_result['second']['saved'], import_result['second']['unchanged']) != (1, 0, 1):
            raise ValueError('Owner fixture failed to preserve the import contract')
        if report['canonicalImport']['publishedCount'] != 991 or report['guestIsolation'] != 'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403':
            raise ValueError('Published fixture or DRAFT isolation differs')
        counts = {key: sum(item['caseKey'].startswith(key + '|') for item in report['cases']) for key in sorted(keys)}
    return {'ok': True, 'errors': [], 'observedCasesById': counts, 'totalMatrixCases': 552,
            'representativeWholeImagesRead': len(selected), 'terminalReportSha256': terminal['reportSha256'],
            'reviewIndexSha256': INDEX_SHA, 'runtimeProfileSha256': RUNTIME,
            'scope': 'Current preset-view cases and independent exact source checks. Force/work scope excluded from this family gate.'}


def report(sources, package, bindings):
    if set(sources) != set(foundation.SPECS):
        raise ValueError('Foundations whole-family coverage differs')
    verify = FunctionType(shared.verify_family.__code__, {
        **vars(shared), 'REVIEWED_RUNTIME': RUNTIME, 'consumer_evidence': consumer_evidence,
    }, shared.verify_family.__name__, shared.verify_family.__defaults__, shared.verify_family.__closure__)
    records = verify(foundation, sources, package, bindings)
    if len(records) != 6 or not all(row['ok'] for row in records):
        raise ValueError('Current foundations family requires positive individual reports')
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
            'runtimeSha256': RUNTIME, 'verifierSha256': sha(Path(__file__).read_bytes()),
            'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
