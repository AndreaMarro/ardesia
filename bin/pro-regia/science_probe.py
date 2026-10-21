#!/usr/bin/env python3
"""Independent, read-only checks of the 31-item demo pack; never approves content.

Only Python stdlib Fraction/Decimal is used. Source pack is never modified.
Run: python3 science_probe.py --pack PATH_TO_PACK --output-dir OUTPUT_DIRECTORY
"""
import argparse
import collections
from decimal import Decimal, localcontext
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path
import re
import statistics
import subprocess

REVIEWED_PACK_SHA256 = '3e732c79578efcaa27b23e10072338758a24c5970108dfb475a7dd49bf368fa9'


def git_evidence(path, source_hash, expected_commit=None):
    """Record the observed repository and verify its committed source bytes."""
    def git(*args):
        return subprocess.check_output(['git', '-C', str(path.parent), *args],
                                       stderr=subprocess.DEVNULL)
    try:
        root = Path(git('rev-parse', '--show-toplevel').decode().strip())
        head = git('rev-parse', 'HEAD').decode().strip()
        relative = path.relative_to(root).as_posix()
        committed_hash = hashlib.sha256(git('show', f'{head}:{relative}')).hexdigest()
        evidence = {'status': 'OBSERVED', 'head': head, 'sourceRelativePath': relative,
                    'sourceAtHEADSHA256': committed_hash,
                    'sourceBytesMatchHEAD': committed_hash == source_hash,
                    'expectedCommit': expected_commit,
                    'expectedCommitMatches': None if expected_commit is None else head == expected_commit}
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError):
        evidence = {'status': 'NOT_AVAILABLE', 'head': None,
                    'sourceBytesMatchHEAD': None, 'expectedCommit': expected_commit,
                    'expectedCommitMatches': None}
    if expected_commit is not None and evidence['head'] != expected_commit:
        raise ValueError('Source repository HEAD does not match --expected-commit')
    return evidence


def run(path, expected_commit=None):
    path = path.resolve(strict=True)
    raw = path.read_bytes()
    source_hash = hashlib.sha256(raw).hexdigest()
    if source_hash != REVIEWED_PACK_SHA256:
        raise ValueError('Pack bytes differ from the reviewed source; do not reuse this review for a changed pack')
    provenance = git_evidence(path, source_hash, expected_commit)
    pack = json.loads(raw)
    if pack['id'] != 'fisica-semestre-filtro-v1' or pack['version'] != 1:
        raise ValueError('Review is scoped to fisica-semestre-filtro-v1 pack version 1')
    items = pack['questions']
    by_id = {q['id']: q for q in items}
    checks = []

    def answer(qid):
        q = by_id[qid]
        return q['options'][q['answer']] if q['type'] == 'mcq' else q['accepted'][0]

    def num(text):
        found = re.search(r'[-+]?\d+(?:[.,]\d+)?(?:/\d+)?', text)
        if not found:
            raise ValueError(text)
        return F(found.group().replace(',', '.'))

    def check(qid, equation, calculated, observed=None, condition=None):
        if observed is None:
            observed = num(answer(qid))
        ok = calculated == observed
        checks.append(dict(id=qid, packVersion=pack['version'], questionRevision=by_id[qid].get('revision'), equation=equation,
                           calculated=str(calculated), answerObserved=answer(qid),
                           valueCompared=str(observed), consistentUnderModel=ok,
                           condition=condition))
        assert ok, checks[-1]

    check('fis-mecc-01', '(v0+v1)*t/2', (F(0)+F(20))*F(8)/2)
    check('fis-mecc-02', 'a=F/m', F(6)/2)
    with localcontext() as ctx:
        ctx.prec = 40
        v = (Decimal(2)*Decimal('9.8')*Decimal('0.80')).sqrt()
        check('fis-mecc-03', 'v=sqrt(2gh), rounded to 0.1 m/s',
              v.quantize(Decimal('0.1')), Decimal(str(float(num(answer('fis-mecc-03'))))),
              'Approximate answer at two significant digits; exact result is ' + str(v))
    # Normalize the equal masses and incident speed to one. Conservation scales.
    collision = [(F(1,2),F(1,2)),(F(0),F(1)),(F(0),F(0)),(F(-1),F(2))]
    physical = [i for i,(u,w) in enumerate(collision)
                if u+w == 1 and (u*u+w*w)/2 == F(1,2)]
    check('fis-mecc-04', 'p_before=1; K_before=1/2; test every offered outcome',
          physical, [by_id['fis-mecc-04']['answer']], 'Central 1D elastic collision')
    check('fis-mecc-05', 'a_c=v^2/r', F(10)**2/50)
    check('fis-termo-06', 'Q/R=n*(3/2)*deltaT', F(2)*F(3,2)*(400-300),
          condition='Numerical coefficient in mol*K; heat capacity model Cv=3R/2')
    check('fis-termo-08', 'V2/V1=p1/p2 at fixed n,T', F(1,3),
          F(1,3) if answer('fis-termo-08') == 'Diventa un terzo del valore iniziale.' else None,
          'Quantity of gas fixed; premise is absent from prompt')
    check('fis-elettro-09', 'F2/F1=(r1/r2)^2', F(1,2)**2,
          F(1, int(answer('fis-elettro-09').split('/')[1])))
    circuit = by_id['fis-elettro-10']
    rc = 1/(1/F(6)+1/F(6))
    chosen = circuit['options'][circuit['answer']]
    numbers = [F(n) for n in re.findall(r'\d+', chosen)]
    check('fis-elettro-10', 'Req=1/(1/R1+1/R2); Itotal=V/Req', [rc,F(12)/rc], numbers)
    cap_answer = answer('fis-elettro-11')
    check('fis-elettro-11', 'C2/C1=d1/d2; V2/V1=C1/C2 for fixed Q',
          [F(1,2),F(2)], [F(1,2),F(2)] if 'capacità si dimezza' in cap_answer and
          'potenziale raddoppia' in cap_answer else [],
          'Ideal parallel plates, fixed area/dielectric, negligible leakage/fringing; not stated')
    check('fis-onde-14', 'v=lambda*f', F(2)*50)
    check('fis-onde-15', 'd=v*t; nearest offered approximate kilometre',
          round(F(340)*3/1000), num(answer('fis-onde-15')),
          'Exact distance is 1020 m; approximation is explicit in selected option')
    q = 1/(1/F(10)-1/F(20))
    magnification = -q/F(20)
    check('fis-onde-16', 'q=1/(1/f-1/p); m=-q/p', [q,magnification],
          [F(20),F(-1)] if 'reale, capovolta e della stessa dimensione' in answer('fis-onde-16') else [],
          'Thin-lens approximation; implicit')
    check('fis-fluid-18', 'v2/v1=A1/A2', F(2),
          F(2) if answer('fis-fluid-18') == 'raddoppia.' else None,
          'Mean speed through two sections of a filled rigid tube without branches/leaks')
    check('fis-mod-21', 'N/N0=(1/2)^(15/5)', F(1,2)**3)
    check('fis-comp-22', 'v=v0+a*t', F(0)+F(2)*5)
    check('fis-comp-23', 'W=F*delta_x for same direction AND sense', F(10)*3,
          condition='Same sense must be added to prompt; opposite sense gives -30 J')
    check('fis-comp-24', 'rho=m/V', F(300)/100)
    assert F(300)/100*1000 == 3000  # g/cm^3 -> kg/m^3
    check('fis-comp-25', 'V2=V1*T2/T1', F(2)*600/300,
          condition='Fixed amount of gas; implicit')
    check('fis-comp-26', 'V=R*I', F(10)*F(1,2))
    check('fis-comp-27', 'v=lambda*f', F(1,2)*4)
    check('fis-comp-28', 'N/N0=(1/2)^3', F(1,2)**3)
    check('fis-comp-29', 'delta_p=rho*g*h', F(1000)*10*2)
    assert len(checks) == 23

    # Independent limiting-case counterexamples. These are NOT the engine grader.
    edge_cases = {
        'fis-comp-23': {
            'sameLinePositiveSense': str(F(10)*3),
            'sameLineOppositeSense': str(F(10)*(-3)),
            'unit': 'J',
            'interpretation': 'Direction (line) alone does not fix the sign of work.'},
        'fis-onde-17': {
            'thetaIncidentDegrees': '0', 'thetaRefractedDegrees': '0',
            'snellLeft': str(F(1)*0), 'snellRight': str(F(3,2)*0),
            'interpretation': 'At normal incidence both frequency and angle are unchanged.'},
        'fis-elettro-13': {
            'magneticDipole': [1,0,0], 'loopNormal': [0,0,1],
            'geometry': 'Source and displacement stay in loop plane z=0; m_z=r_z=0.',
            'normalDipoleFieldNumerator': str(F(3)*F(2)*F(0)-F(0)),
            'interpretation': 'B_normal=0 over the loop; flux and induced loop emf are zero.'},
        'fis-comp-22': {
            'validUnitDimensions': {'m/s': {'L':1,'T':-1}},
            'invalidListedUnitDimensions': {'m/s⁻¹': {'L':1,'T':1}},
            'interpretation': 'm divided by s^-1 equals m*s, not velocity.'}
    }

    review = {
      'fis-mecc-01': 'Intended result consistent; explain why average speed applies only to constant acceleration.',
      'fis-mecc-02': 'Intended result consistent; mention vertical balance and net horizontal force.',
      'fis-mecc-03': 'Correct rounded value; approximation 15.68~16 is feasible mentally but should be explained.',
      'fis-mecc-04': 'Correct for the 1D central collision imposed by the track; no conservation-equation derivation.',
      'fis-mecc-05': 'Correct; constant speed means constant magnitude, not constant velocity vector.',
      'fis-termo-06': 'Correct numerical coefficient; write energy units and explain W=0 and Cv convention.',
      'fis-termo-07': 'Correct in intended macroscopic thermodynamics; distractors deserve separate explanation.',
      'fis-termo-08': 'State fixed amount of gas; without n fixed PV/T permits other outcomes.',
      'fis-elettro-09': 'Correct inverse-square ratio assuming unchanged charges and medium.',
      'fis-elettro-10': 'Correct parallel resistance and total current.',
      'fis-elettro-11': 'Requires ideal parallel plates, fixed area/dielectric, negligible fringing/leakage; absent in prompt.',
      'fis-elettro-12': 'Correct for isolated long straight wire, ignoring external fields/end effects.',
      'fis-elettro-13': 'Geometry/closed loop missing; an in-plane magnetic dipole can approach with identically zero normal flux.',
      'fis-onde-14': 'Correct speed and dimensional relation.',
      'fis-onde-15': 'Correct distance and explicit approximation.',
      'fis-onde-16': 'Correct under thin-lens model; state the approximation.',
      'fis-onde-17': 'At normal incidence angle is also unchanged; explanation unconditionally says it changes.',
      'fis-fluid-18': 'Correct for section-averaged speed in filled rigid tube; avoid implying local pointwise speed.',
      'fis-fluid-19': 'Correct for homogeneous connected liquid under uniform gravity with same surface pressure.',
      'fis-mod-20': 'Correct ideal photoelectric result at fixed frequency; explicit photoelectric effect is not listed in 2026 syllabus.',
      'fis-mod-21': '1/8 is correct for undecayed original nuclei, not necessarily remaining total sample mass; near-duplicate of comp-28.',
      'fis-comp-22': '10 m/s correct, but numeric.units contains dimensionally invalid m/s⁻¹.',
      'fis-comp-23': 'Missing same sense: collinear opposite displacement gives -30 J; define W=F·delta r.',
      'fis-comp-24': 'Density and SI conversion correct.',
      'fis-comp-25': 'Correct for fixed amount of gas; state closed system/fixed n.',
      'fis-comp-26': 'Correct Ohm-law value.',
      'fis-comp-27': 'Correct value; explanation only 10 whitespace-delimited words.',
      'fis-comp-28': 'Correct fraction and percentage; same three-half-lives task as mod-21.',
      'fis-comp-29': '20000 Pa =20 kPa correct; unit scale issue separately reviewed by parent.',
      'fis-comp-30': 'Same across components is correct; accepted costante can imply time-constant current, not guaranteed.',
      'fis-comp-31': 'Correct frequency definition.'
    }
    assert set(review) == set(by_id)
    words = [len(q['explanation'].split()) for q in items]
    meta_required = ['unit', 'macroarea', 'microarea', 'competence', 'difficulty', 'revision']
    findings = {
      'fis-elettro-11': ('P2', 'MISSING_PHYSICAL_ASSUMPTIONS', 'MODEL_REVIEW_REQUIRED', 161),
      'fis-elettro-13': ('P2', 'GEOMETRY_AMBIGUITY', 'LIMITING_CASE_REVIEW_REQUIRED', 189),
      'fis-onde-17': ('P2', 'NORMAL_INCIDENCE_AMBIGUITY', 'LIMITING_CASE_REVIEW_REQUIRED', 245),
      'fis-comp-22': ('P1', 'UNIT_DIMENSION_ERROR', 'VERIFIED_FROM_SOURCE_AND_DIMENSIONAL_ALGEBRA', 315),
      'fis-comp-23': ('P2', 'FORCE_DISPLACEMENT_SIGN_AMBIGUITY', 'LIMITING_CASE_REVIEW_REQUIRED', 341),
      'fis-comp-29': ('P1', 'UNIT_SCALE_GRADING_ERROR', 'VERIFIED_BY_SEPARATE_SOFTWARE_REVIEWER', 479)
    }
    quarantine = []
    for qid, (severity, kind, evidence, line) in findings.items():
        q = by_id[qid]
        quarantine.append({
          'questionId': qid, 'questionRevision': q.get('revision'),
          'packId': pack['id'], 'packVersion': pack['version'], 'packSHA256': source_hash,
          'questionContentSHA256': hashlib.sha256(json.dumps(q, sort_keys=True, ensure_ascii=False,
                                                            separators=(',', ':')).encode()).hexdigest(),
          'state': 'HOLD', 'scope': 'PRO_REGIA_INTEGRATION_VERIFICATION_ONLY',
          'humanReviewRequired': True, 'severity': severity, 'findingType': kind,
          'evidenceLevel': evidence, 'reason': review[qid], 'sourceLine': line,
          'productionOrDatabaseMutation': False,
          'gradingRuntimeProbeDuplicatedHere': False,
          'releaseCondition': 'Authorized human review plus a separately versioned corrected candidate and regression evidence'
        })
    return {
      'scope':'Existing 31-item demo, NOT the requested 4000-item corpus.',
      'sourcePath':str(path), 'sourceSHA256':source_hash,
      'reviewedSourceSHA256':REVIEWED_PACK_SHA256, 'sourceHashMatchesReviewedBytes': True,
      'gitHEAD':provenance['head'], 'gitEvidence':provenance,
      'packId':pack['id'], 'packVersion':pack['version'], 'questionRevisionPolicy':'Absent in source: null, never inferred from pack version',
      'counts':{'receivedDemoItems':len(items),'uniqueIds':len(by_id),
        'mcq':sum(q['type']=='mcq' for q in items),'completion':sum(q['type']=='completion' for q in items),
        'readByModel':len(review),'independentCalculations':len(checks),
        'calculationsConsistentUnderIntendedModel':sum(x['consistentUnderModel'] for x in checks),
        'conceptualItemsWithoutIndependentNumericalAnswerCheck':len(items)-len(checks),
        'humanScientificApprovalsIssued':0,'pipelineTransitionsPerformed':0,
        'newQuestionsGenerated':0,'sourceFilesChanged':0},
      'limits':['JSON schema success does not imply physical validity.',
        'These model reviews do not authorize SCIENCE_REVIEWED or publication.',
        'The arithmetic passes are conditional on the explicitly recorded physical models.',
        'No automatic plagiarism or semantic deduplication over an external corpus was performed.',
        'No student data, external AI call or network access is used by this probe.'],
      'mcqOptionCounts':dict(collections.Counter(len(q['options']) for q in items if q['type']=='mcq')),
      'murFiveOptionFormat':'FAIL: all 21 MCQ have 4 choices',
      'explanationWordCounts':{'min':min(words),'median':statistics.median(words),'max':max(words),'total':sum(words)},
      'wordCountInterpretation':'Descriptive only, not an editorial approval threshold. Reading finds compact feedback, not step-by-step tutoring.',
      'metadataKeyPresence':{k:sum(k in q for q in items) for k in meta_required},
      'checks':checks,'edgeCases':edge_cases,
      'integrationHolds':quarantine,
      'editorialFlags':[{'id':k,'packVersion':1,'questionRevision':by_id[k].get('revision'),'reason':review[k]} for k in
        ['fis-termo-06','fis-termo-08','fis-mod-20','fis-mod-21','fis-comp-25','fis-comp-28','fis-comp-30']],
      'nearDuplicateCandidates':[{'ids':['fis-mod-21','fis-comp-28'],'reason':'Both ask remaining parent-nucleus fraction after exactly three half-lives: 1/8.','review':'manual model comparison, not semantic corpus scan'}],
      'perItemReading':[{'id':q['id'],'packVersion':1,'questionRevision':q.get('revision'),'explanationWords':len(q['explanation'].split()),
        'note':review[q['id']]} for q in items]
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pack', type=Path, required=True, help='Source JSON; reviewed SHA-256 is pinned by this probe')
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--expected-commit', help='Optional exact git HEAD guard; fails when unobservable or different')
    args = parser.parse_args()
    report = run(args.pack, args.expected_commit)
    destination = args.output_dir.resolve()
    destination.mkdir(parents=True, exist_ok=True)
    report_path = destination / 'science-report.json'
    quarantine_path = destination / 'quarantine.json'
    if args.pack.resolve() in (report_path, quarantine_path):
        raise ValueError('Output path must not overwrite the source pack')
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    quarantine = {'reportVersion':1, 'scope':'PRO_REGIA_INTEGRATION_VERIFICATION_ONLY',
      'packId':report['packId'],'packVersion':report['packVersion'],'packSHA256':report['sourceSHA256'],
      'sourceCommit':report['gitHEAD'],'humanReviewRequired':True,'items':report['integrationHolds'],
      'productionOrDatabaseMutation':False,'itemsRemovedFromProduct':False,
      'note':'Six items remain HOLD in this integration review. No product, pack, database or publication state was changed.'}
    quarantine_path.write_text(json.dumps(quarantine,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'counts':report['counts'],'format':report['murFiveOptionFormat'],
      'explanationWords':report['explanationWordCounts'],'sourceSHA256':report['sourceSHA256'],
      'gitEvidence':report['gitEvidence'],
      'integrationHolds':[q['questionId'] for q in report['integrationHolds']]},ensure_ascii=False,indent=2))
