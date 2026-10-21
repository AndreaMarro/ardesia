#!/usr/bin/env python3
"""Validate the delivered JSON, actual runtime projection, grading and samples."""
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys
import time

import jsonschema

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
PACK=ROOT/'packs/semestre-filtro-2026-27'
BANK=ROOT/'packages/engine/lessonos/study/content/physics-semestre-2026-bank'
sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.question_bank import QuestionBank, parse_rational


def main():
    started=time.perf_counter()
    manifest=json.loads((BANK/'manifest.json').read_text())
    schema=json.loads((BANK/'question.schema.json').read_text())
    jsonschema.Draft202012Validator.check_schema(schema)
    validator=jsonschema.Draft202012Validator(schema)
    questions=[]
    errors=[]
    for shard in manifest['shards']:
        raw=(BANK/shard['path']).read_bytes()
        if hashlib.sha256(raw).hexdigest()!=shard['sha256']:
            errors.append('checksum: '+shard['path'])
        part=json.loads(raw)
        if len(part)!=shard['count']:
            errors.append('shard count: '+shard['path'])
        for question in part:
            for error in validator.iter_errors(question):
                errors.append(question.get('id','?')+': '+'.'.join(map(str,error.path))+': '+error.message)
        questions.extend(part)
    if len(questions)!=4000:
        errors.append('expected 4000 questions')
    counts=Counter(q['difficulty']['level'] for q in questions)
    if counts!={level:1000 for level in ('base','facile','medio','difficile')}:
        errors.append('difficulty quotas')
    by_id={q['id']:q for q in questions}
    if len(by_id)!=4000:
        errors.append('duplicate IDs')
    bank=QuestionBank(BANK)
    for question in questions:
        qid=question['id']
        projected=bank.question(qid)
        if any(key in projected for key in ('answer','solution','solutionSteps','verification','provenance')):
            errors.append(qid+': leaked solution')
        if any('exact' in option for option in projected['options']):
            errors.append(qid+': leaked option value')
        answer=question['answer']
        response=answer['correctOptionId'] if question['format']=='multiple_choice' else answer['exact']
        result=bank.attempt(qid,response,expected_sha256=bank.sha256)
        if result['outcome']!='correct' or result['solution']!=question['solution']:
            errors.append(qid+': grading/solution round trip')
        if result['persisted'] is not False:
            errors.append(qid+': unexpected persistence claim')
        if question['format']=='completion' and parse_rational(answer['exact']) is None:
            errors.append(qid+': non-exact completion')
        if answer['kind']=='rational' and any(parse_rational(alias)!=parse_rational(answer['exact'])
                                              for alias in answer['accepted']):
            errors.append(qid+': inexact accepted alias')
        if len(re.findall(r'\w+',question['solution']))<170:
            errors.append(qid+': short solution')
    exam_samples=[]
    for profile in manifest['examProfiles']:
        for seed in ('coverage-1','coverage-2','coverage-3','coverage-4','coverage-5'):
            exam=bank.exam(seed,profile_id=profile['id'],expected_sha256=bank.sha256)
            ids=[q['id'] for q in exam['questions']]
            actual=[by_id[qid] for qid in ids]
            formats=Counter(q['format'] for q in actual)
            if len(actual)!=profile['questionCount'] or len(ids)!=len(set(ids)):
                errors.append('exam count/ID repetition: '+profile['id'])
            if formats!={'multiple_choice':profile['multipleChoice'],'completion':profile['completion']}:
                errors.append('exam format mix: '+profile['id'])
            if len({q['lawFamily'] for q in actual})!=len(actual):
                errors.append('exam repeated law family: '+profile['id'])
            if profile['id']=='semestre-2026' and any(q['descriptors']['scope']!='syllabus_core' for q in actual):
                errors.append('extension in core exam')
            repeated=bank.exam(seed,profile_id=profile['id'],expected_sha256=bank.sha256)
            if [q['id'] for q in repeated['questions']]!=ids:
                errors.append('non-deterministic exam')
            exam_samples.append({'profileId':profile['id'],'seed':seed,'questionIds':ids,
                'formats':dict(formats),'units':dict(Counter(q['taxonomy']['unitId'] for q in actual)),
                'distinctLawFamilies':len({q['lawFamily'] for q in actual})})
    families={q['familyId'] for q in questions}
    matched_topics=set()
    question_references=set()
    def coverage_walk(value, unit_id=None):
        if isinstance(value,dict):
            unit_id=value.get('unitId',unit_id)
            for field in ('officialTopic','syllabusTopic','topic'):
                if unit_id and isinstance(value.get(field),str):
                    matched_topics.add((unit_id,value[field]))
            for field,item in value.items():
                if field in ('questionIds','specificQuestionIds','bankQuestionIds'):
                    for qid in item:
                        question_references.add(qid)
                        if qid not in by_id:errors.append('unresolved coverage question: '+qid)
                if field in ('familyIds','modelIds','bankModelIds'):
                    for family in item:
                        if family not in families:errors.append('unresolved coverage family: '+family)
                coverage_walk(item,unit_id)
        elif isinstance(value,list):
            for item in value:coverage_walk(item,unit_id)
    for path in sorted((PACK/'sources').glob('coverage-u*.json')):
        coverage_walk(json.loads(path.read_text()))
    syllabus=json.loads((PACK/'sources/taxonomy-2026.json').read_text())
    required_topics={(unit['id'],topic) for unit in syllabus['units'] for topic in unit['topics']}
    for unit_id,topic in sorted(required_topics-matched_topics):
        errors.append('unmapped syllabus topic: '+unit_id+' '+topic)
    historical=json.loads((PACK/'sources/exams-2025-coverage.json').read_text())
    coverage_walk(historical)
    historical_keys={(entry['paper'],entry['historicalQuestionNumber']) for entry in historical['entries']}
    if len(historical_keys)!=62 or historical.get('unmappedHistoricalQuestions'):
        errors.append('historical coverage incomplete')
    report={'ok':not errors,'errors':errors,'questionCount':len(questions),
        'jsonSchemaValidated':len(questions),'studentProjectionChecked':len(questions),
        'gradingRoundTrips':len(questions),'countsByDifficulty':dict(counts),
        'countsByFormat':dict(Counter(q['format'] for q in questions)),
        'countsByScope':dict(Counter(q['descriptors']['scope'] for q in questions)),
        'coverage':{'syllabusTopics':len(required_topics),'mappedSyllabusTopics':len(required_topics&matched_topics),
                    'historicalObjectives':len(historical_keys),'distinctQuestionReferences':len(question_references),
                    'historicalCoverageKinds':historical['counts']},
        'examSamples':exam_samples,'elapsedSeconds':round(time.perf_counter()-started,3),
        'manifestSha256':bank.sha256,'humanScientificReview':'NOT_RUN',
        'note':'Verifica tecnica completa dei record; non certifica da sola correttezza scientifica o unicità semantica.'}
    destination=PACK/'reports/delivery-validation.json'
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='examSamples'},ensure_ascii=False,indent=2))
    if errors:
        raise SystemExit(1)


if __name__=='__main__':
    main()
