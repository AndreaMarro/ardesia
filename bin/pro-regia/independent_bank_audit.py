#!/usr/bin/env python3
"""Independent inventory, integrity, exact-duplicate and ten-calculation audit.

Reads a delivered bank without importing its generator or grader. Writes only
the explicitly supplied output directory. Does not approve or publish content.
"""
import argparse
from collections import Counter, defaultdict
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata


def duplicate_groups(items, key):
    groups=defaultdict(list)
    for q in items: groups[key(q)].append(q['id'])
    return [ids for ids in groups.values() if len(ids)>1]


def main():
    cli=argparse.ArgumentParser()
    cli.add_argument('--repo',type=Path,required=True)
    cli.add_argument('--output-dir',type=Path,required=True)
    cli.add_argument('--expected-commit',required=True)
    args=cli.parse_args()
    root=args.repo.resolve(strict=True)
    out=args.output_dir.resolve()
    if out.is_relative_to(root): raise ValueError('Output must be outside reviewed worktree')
    commit=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
    if commit!=args.expected_commit: raise ValueError('Unexpected source HEAD')
    bank=root/'packages/engine/lessonos/study/content/physics-semestre-2026-bank'
    manifest_bytes=(bank/'manifest.json').read_bytes()
    manifest=json.loads(manifest_bytes)
    questions=[]; shards=[]; errors=[]; locations={}
    for shard in manifest['shards']:
        p=(bank/shard['path']).resolve(strict=True)
        if not p.is_relative_to(bank): raise ValueError('Shard escapes bank')
        raw=p.read_bytes(); records=json.loads(raw)
        checksum=hashlib.sha256(raw).hexdigest()
        match=checksum==shard['sha256'] and len(records)==shard['count']
        if not match: errors.append('shard_integrity:'+shard['path'])
        shards.append({'path':shard['path'],'count':len(records),'sha256':checksum,'matchesManifest':match})
        for q in records: locations[q['id']]=shard['path']
        questions.extend(records)
    by_id={q['id']:q for q in questions}
    norm=lambda s: ' '.join(unicodedata.normalize('NFKC',s).casefold().split())
    digit_norm=lambda s: re.sub(r'\d+(?:[.,]\d+)?','#',norm(s))
    exact_duplicates=duplicate_groups(questions,lambda q:q['prompt'])
    normalized_duplicates=duplicate_groups(questions,lambda q:norm(q['prompt']))
    digit_duplicates=duplicate_groups(questions,lambda q:digit_norm(q['prompt']))
    signature_duplicates=duplicate_groups(questions,lambda q:q['semanticSignature'])
    numeric_options_checked=0; numeric_option_failures=[]
    for q in questions:
        if q['format']!='multiple_choice' or q['answer']['kind']!='rational': continue
        try:
            target=F(q['answer']['exact'])
            values=[F(o['exact']) for o in q['options']]
        except (KeyError,ValueError,ZeroDivisionError): continue
        numeric_options_checked+=1
        equal=[o['id'] for o,v in zip(q['options'],values) if v==target]
        if equal != [q['answer']['correctOptionId']] or len(set(values)) != 5:
            numeric_option_failures.append({'id':q['id'],'equivalentToAnswer':equal,'uniqueOptionValues':len(set(values))})

    # Constants and physical operations below were independently transcribed
    # from ten prompts, never evaluated from verification.expression.
    sample_spec=[
      ('u1-area-conversion-01','Area scale: 2 square old units * (2 new lengths/old length)^2',F(2)*2**2),
      ('u2-uniform-displacement-01','Uniform displacement: 2 m/s * 2 s',F(2)*2),
      ('u3-pressure-area-01','Gauge pressure: 12 N / 3 m^2',F(12)/3),
      ('u4-wave-wavelength-01','Wavelength: (12 m/s)/(3 Hz)',F(12)/3),
      ('u5-temperature-difference-01','Temperature difference: (40+273.15)-(20+273.15) K',(F(40)+F('273.15'))-(F(20)+F('273.15'))),
      ('u6-coulomb-force-01','Coulomb SI: 9e9*(1e-6 C)*(1e-6 C)/(3e-2 m)^2',F(9*10**9)*F(1,10**6)*F(1,10**6)/F(3,100)**2),
      ('u7-wavelength-in-medium-01','Fixed frequency: 600 nm / index 2',F(600)/2),
      ('u3-pressure-area-13','pA=12/3; pB=(5/4)pA; AB=20/pB; AB/AA',F(20)/(F(5,4)*(F(12)/3))/3),
      ('u5-temperature-difference-13','deltaTA=40-20; deltaTB=(5/2)deltaTA; TfB=60-deltaTB; Celsius numeric ratio TfB/20',(F(60)-F(5,2)*(40-20))/20),
      ('u6-coulomb-force-13','FB/FA=2*(rA/rB)^2=18; positive ratio rB/rA=1/3',F(1,3))
    ]
    samples=[]
    for qid,derivation,value in sample_spec:
        q=by_id[qid]; expected=F(q['answer']['exact'])
        matches=value==expected
        if qid=='u6-coulomb-force-13': matches=matches and F(2)/(value**2)==18
        samples.append({'questionId':qid,'questionVersion':q['version'],'shard':locations[qid],
          'derivation':derivation,'independentValue':str(value),'answerExact':q['answer']['exact'],
          'arithmeticConsistent':matches,'sourceQuestionSHA256':hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
          'humanScientificApproval':'NOT_RUN',
          'caveat':'Prompt says without ratios between temperatures, then asks ratio of Celsius values; mathematical result is not an absolute-temperature ratio.' if qid=='u5-temperature-difference-13' else None})
        if not matches: errors.append('independent_calculation:'+qid)
    words=[len(re.findall(r'\w+',q['solution'])) for q in questions]
    n_options=Counter(len(q['options']) for q in questions if q['format']=='multiple_choice')
    checks_count=Counter(len(q['verification']['automaticChecks']) for q in questions)
    arithmetic_claims=Counter(q['verification']['arithmetic'] for q in questions)
    counts={
      'questionsReceived':len(questions),'uniqueIds':len(by_id),
      'countsByDifficulty':dict(Counter(q['difficulty']['level'] for q in questions)),
      'countsByUnit':dict(Counter(q['taxonomy']['unitId'] for q in questions)),
      'countsByFormat':dict(Counter(q['format'] for q in questions)),
      'countsByScope':dict(Counter(q['descriptors']['scope'] for q in questions)),
      'countsByQuestionVersion':dict(Counter(q['version'] for q in questions)),
      'countsByStatus':dict(Counter(q['status'] for q in questions)),
      'nullReviewers':sum(q['reviewer'] is None for q in questions),
      'humanReviewNotRun':sum(q['verification']['humanScientificReview']=='NOT_RUN' for q in questions),
      'humanScientificApprovals':0,'pipelineTransitionsPerformed':0,
      'independentQuestionCalculations':len(samples),
      'independentQuestionCalculationsConsistent':sum(s['arithmeticConsistent'] for s in samples),
      'rationalMCQOptionSetsChecked':numeric_options_checked,
      'rationalMCQOptionSetFailures':len(numeric_option_failures),
      'familyCount':len({q['familyId'] for q in questions}),
      'lawFamilyCount':len({q['lawFamily'] for q in questions}),
      'individualAuthoredCount':sum(q['provenance']['kind']=='original_individually_authored_task' for q in questions)
    }
    if len(questions)!=4000 or len(by_id)!=4000:errors.append('question_count_or_unique_ids')
    if counts['countsByDifficulty']!={k:1000 for k in ('base','facile','medio','difficile')}:errors.append('difficulty_quota')
    if n_options != {5:counts['countsByFormat']['multiple_choice']}:errors.append('not_all_mcq_have_five_options')
    if exact_duplicates:errors.append('exact_prompt_duplicates')
    report={
      'reviewer':'PRO-REGIA-INTEGRAZIONE independent read-only probe',
      'sourceCommit':commit,'bankId':manifest['id'],'bankVersion':manifest['version'],
      'manifestSHA256':hashlib.sha256(manifest_bytes).hexdigest(),
      'questionSchemaSHA256':hashlib.sha256((bank/'question.schema.json').read_bytes()).hexdigest(),
      'manifestStatus':manifest['status'],'manifestReviewer':manifest['reviewer'],
      'counts':counts,'shards':shards,'listedShardCount':len(shards),
      'unlistedShardFiles':sorted(str(p.relative_to(bank)) for p in (bank/'questions').glob('*.json') if str(p.relative_to(bank)) not in {s['path'] for s in shards}),
      'mcqOptionCounts':dict(n_options),'exactPromptDuplicateGroups':exact_duplicates,
      'normalizedPromptDuplicateGroups':normalized_duplicates,
      'digitNormalizedPromptDuplicateGroups':digit_duplicates,
      'semanticSignatureDuplicateGroups':signature_duplicates,
      'rationalOptionFailures':numeric_option_failures,
      'solutionWords':{'min':min(words),'max':max(words),'total':sum(words)},
      'declaredArithmeticMethods':dict(arithmetic_claims),
      'declaredAutomaticCheckCountsPerQuestion':dict(checks_count),
      'exactSympyClaimWithEmptyCheckArray':sum(q['verification']['arithmetic']=='exact_sympy' and not q['verification']['automaticChecks'] for q in questions),
      'independentScienceSample':samples,'errors':errors,'inventoryChecksPassed':not errors,
      'limits':['Schema validation is performed by a separate rerun; not claimed from this stdlib inventory.',
        'Only ten independent physical calculations, not 4000 scientific validations.',
        'Exact/normalized equality and signature uniqueness do not prove semantic originality.',
        'Declared SymPy residuals were read, not independently recalculated for all records.',
        'All content remains DRAFT; no human approval, import or publication action performed.',
        'No generator, AI model, network call or database mutation was run by this audit.']
    }
    out.mkdir(parents=True,exist_ok=True)
    (out/'independent-inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ['sourceCommit','manifestSHA256','counts','listedShardCount','mcqOptionCounts','solutionWords','exactSympyClaimWithEmptyCheckArray','errors']},ensure_ascii=False,indent=2))
    print('DUPLICATES',json.dumps({k:len(report[k]) for k in ['exactPromptDuplicateGroups','normalizedPromptDuplicateGroups','digitNormalizedPromptDuplicateGroups','semanticSignatureDuplicateGroups']}))


if __name__=='__main__':main()
