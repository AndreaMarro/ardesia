"""Replay the frozen scientific checks and the current original grading path."""
from pathlib import Path
import hashlib
import json
import math
import subprocess

from tools.corpus_engineering import experiments_manual_support_revision_verifier as oracle
from tools.corpus_engineering.review_contract import reviewed_rows
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def run(app=Path.cwd()):
    app = app.resolve()
    output = Path(__file__).resolve().parent
    before = runtime_fingerprint(app)['sha256']
    assert before == '0fdcc3b04c869d75811a4e07b7b8d1d87210869d6087e12e01ee70b6c370e1d4'
    package_path = Path('editorial/batches') / (oracle.BATCH + '.json')
    binding_path = package_path.with_name(oracle.BATCH + '-bindings.json')
    package_bytes = (app / package_path).read_bytes()
    binding_bytes = (app / binding_path).read_bytes()
    assert digest(package_bytes) == 'ecd99ef570fe1756980243b80e0877cfc58454dbcae562c8837d8390a7ff75b3'
    assert digest(binding_bytes) == 'a846124d0aa4b160236658f231e8925af3bb283894dd73da60452cb42872acce'
    sources = oracle.source_records()
    package = json.loads(package_bytes)
    bindings = json.loads(binding_bytes)
    assets = app / 'editorial/assets'
    guide = app / 'editorial/reviews/independent-guide-runtime-d9d1-20261126'
    signature_bytes = (guide/'reviewed-candidate-signatures.json').read_bytes()
    scientific_bytes = (guide/'candidate-limited-review.json').read_bytes()
    assert digest(signature_bytes) == 'dc2304492744060c268f458e957dcfcf25dd6809335829ab7a4d196a94c1b895'
    assert digest(scientific_bytes) == 'cc17be8d234b03fc21f55375f32f1a32ef2127629f3f8f6af2b52d85bc474f82'
    signatures = json.loads(signature_bytes)
    revised = 'SIM-C5-L03-02'
    assert set(signatures) == oracle.IDS
    assert {key for key in signatures if signatures[key]!=oracle.REVIEWED_REVISIONS[key]} == {revised}
    guide_report = json.loads(scientific_bytes)
    assert guide_report['sourceCommit'] == 'cbc64655906e0a3c990c74cdd7fe613d57e130e9'
    guide_row, = (row for row in guide_report['records'] if row['id']==revised)
    assert guide_row['reviewedSignature'] == signatures[revised]
    raw = subprocess.check_output(['node', oracle.REVIEW_DIR + '/probe-effective-questions.mjs', str(package_path), '-'],
                                  cwd=app, timeout=60)
    actual = json.loads(raw)
    assert actual['packageFileSha256'] == digest(package_bytes)
    assert actual['actualGeneratedQuestions'] == 16 and actual['activityCredit'] == 0
    figures = oracle.figure_checks(assets)
    math_checks = oracle.independent_checks()
    by_id = {row['id']: row for row in actual['records']}
    records = []
    for row, binding, signature, checksums, errors in reviewed_rows(package, bindings, signatures, oracle.IDS, assets):
        key = row['id']
        source = sources[key]
        assert not errors, (key, errors)
        assert binding['sourceSha256'] == oracle.digest(source)
        if key==revised:
            assert binding['candidateSha256']==guide_row['candidateSha256'] and checksums==guide_row['assetChecksums']
            assert binding['sourceSha256']==guide_row['sourceSha256']
            read_checks=guide_row['candidateTextMathManualReview']['checks']
        else:
            read_checks=oracle.supplied_support_checks(row)
        checks = math_checks[key] + read_checks + figures[key]
        assert checks and all(item['ok'] for item in checks), key
        _, assigned_inputs, unit, _ = oracle.SPECS[key]
        installed = by_id[key]
        assert not installed['unitsDuplicatedInPrompt'], key
        for input_value, task in zip(assigned_inputs, installed['questions'], strict=True):
            expected = float(oracle.exact_value(key, input_value))
            assert math.isclose(task['value'], expected, rel_tol=1e-10, abs_tol=1e-10)
            assert task['unit'] == ('numero puro' if unit == '1' else unit)
            assert all(task[name] for name in ('finiteManualEntryAccepted', 'commaEntryAccepted',
                                               'displayNumberRoundtripAccepted', 'blankRejected', 'infiniteRejected'))
        records.append({'id':key,'sourceSha256':binding['sourceSha256'],'candidateSha256':binding['candidateSha256'],
                        'reviewedSignature':signature,'assetChecksums':checksums,'checks':checks,
                        'actualAssignedTasks':installed['questions'],'scientificActivityCredit':0})
    assert len(records) == 8 and runtime_fingerprint(app)['sha256'] == before
    assert package_bytes == (app/package_path).read_bytes() and binding_bytes == (app/binding_path).read_bytes()
    (output/'actual-assigned-tasks.json').write_bytes(raw)
    result={'scope':'FROZEN_SCIENTIFIC_CHECKS_AND_CURRENT_INSTALLED_TASKS','runtimeSha256':before,
            'reviewerContributions':'Use existing independent source, math and asset checks',
            'sourceRef':oracle.REF,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=app,text=True).strip(),
            'packageSha256':digest(package_bytes),'bindingsSha256':digest(binding_bytes),
            'reviewedSignatureFileSha256':digest(signature_bytes), 'laterIndependentReportSha256':digest(scientific_bytes),
            'installedProbeSha256':digest(raw),'records':records,'actualBrowserCases':0,
            'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0}
    (output/'receipt.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(len(records),actual['actualGeneratedQuestions'])


if __name__=='__main__':
    run()
