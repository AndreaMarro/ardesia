"""CoursePack projections for the four existing Physics pathways.

No new attempts, grades, publication authority or learner database. Draft
coverage is deliberately separate from complete released objectives.
"""
from copy import deepcopy
import hashlib
import json
import math
from pathlib import Path
from .activities import evaluate_activity
from .catalog import load_pack,describe_pack
from .models import StudyError
from .store import canonical,digest

PATHS=('strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni')
BASELINE=Path(__file__).parent/'content/physics-curriculum-2026-v1.json'
DEMO_IDS={'original-demo-u2-02','original-demo-u5-01','original-demo-u6-04','original-demo-u4-01','original-demo-kinematics'}


def lesson_reference(lesson):
    """One exact reference format for the reader and canonical receipts."""
    return {'id': lesson['id'], 'version': 1, 'sha256': digest(canonical(lesson))}


def learner_assessment_items(pack):
    """Original atomic prompts only; assessment keys and rubrics stay private."""
    from .assessment_support import authored_hints
    return [{'id':item['id'], 'objectiveId':item['objectiveId'], 'prompt':item['prompt'],
             'hintCount':len(authored_hints(item,'practice')),
             'transfer':{'prompt':item['transfer']['prompt'],'hintCount':len(authored_hints(item,'transfer'))},
             'assessmentRef':{'id':item['id'], 'version':1, 'sha256':digest(canonical(item))}}
            for item in pack.get('atomicFinalAssessment', [])
            if isinstance(item.get('transfer'), dict) and isinstance(item['transfer'].get('prompt'), str)]


def learner_diagnostic_items(pack):
    """Only authored entry prompts and exact recovery provenance, no answer key."""
    lessons = {lesson['id']:lesson for lesson in pack['lessons']}
    result = []
    for item in pack.get('diagnostic', []):
        target = item['recoveryTarget']
        lesson = lessons.get(target['lessonId'])
        if (lesson is None or target['objectiveId'] != item['objectiveId']
                or item['objectiveId'] not in lesson['objectiveIds']):
            raise StudyError('course_assessment_objective_mismatch',409)
        result.append({'id':item['id'],'objectiveId':item['objectiveId'],'prompt':item['prompt'],
                       'recoveryTarget':{key:target[key] for key in ('objectiveId','lessonId')},
                       'assessmentRef':{'id':item['id'],'version':1,'sha256':digest(canonical(item))},
                       'lessonRef':lesson_reference(lesson)})
    return result


def synthetic_learner(store, principal):
    """Server-owned policy. Request payloads and role names cannot enable it."""
    return principal.role == 'student' and getattr(store, 'synthetic_acceptance', False) is True


def learner_material(value, *, assessment=False):
    """Keep learner prose/references; omit reserved assessment keys at any depth."""
    reserved = {'expectedAnswer', 'expectedAnswers', 'answerKey', 'answerKeys',
                'rubric', 'rubrics', 'teacherRubric', 'reviewRubric', 'teacherOnly', 'bankContent'}
    if assessment:
        reserved |= {'answer', 'answerDisplay', 'feedback', 'errorFeedback', 'solution', 'solutionSteps'}
    if isinstance(value, dict):
        return {k: learner_material(v, assessment=assessment) for k, v in value.items() if k not in reserved}
    if isinstance(value, list):
        return [learner_material(v, assessment=assessment) for v in value]
    return deepcopy(value)


def learner_lesson(item):
    lesson = learner_material(item)
    lesson['lessonRef'] = lesson_reference(item)
    lesson.setdefault('activityId', 'course-reasoning-v1')
    for phase in ('practice', 'transfer'):
        lesson[phase] = learner_material(lesson[phase], assessment=True)
        lesson[phase].pop('result', None)
    return lesson


def supplementary_materials(pack, *, review=False):
    return {key: (deepcopy(pack[key]) if review else learner_material(pack[key], assessment=True))
            for key in ('curatedPractice', 'workedProblemRefs', 'examSimulations') if key in pack}


def course_projection(*,review=False,synthetic=False):
    baseline=json.loads(BASELINE.read_text())
    courses=[]
    for path in PATHS:
        pack_id='sf-'+path+'-v1'
        pack=load_pack(pack_id,1);descriptor=describe_pack(pack_id,1)
        if pack.get('baselineRef',{}).get('sha256')!=hashlib.sha256(BASELINE.read_bytes()).hexdigest():
            raise StudyError('curriculum_baseline_mismatch',409)
        families=[f for f in baseline['families'] if f['pathId']==path]
        target_ids={s['id'] for f in families for s in f['subtargets']}
        lessons=[]
        for item in pack['lessons']:
            if not (review or synthetic) and (item.get('releaseScope')!='PUBLIC_DEMONSTRATION' or item['id'] not in DEMO_IDS):continue
            lesson=deepcopy(item)
            if not set(lesson['objectiveIds'])<=target_ids or lesson['editorialStatus']!='DRAFT' or lesson['humanApproval'] is not False:
                raise StudyError('invalid_course_lesson',409)
            for kind in ('practice','transfer'):
                case=lesson[kind]
                if 'parameters' in case:
                    result=evaluate_activity(lesson['activityId'],case['parameters'])
                    if not math.isclose(result['value'],case['answer']['value'],rel_tol=1e-10,abs_tol=1e-12) or result['unit']!=case['answer']['unit']:
                        raise StudyError('course_lesson_oracle_mismatch',409)
                    case['result']=result
            lesson['lessonRef']=lesson_reference(item)
            if synthetic and not review:lesson=learner_lesson(item)
            elif 'activityId' not in lesson:lesson['activityId']='course-reasoning-v1'
            lessons.append(lesson)
        courses.append({**({'assessmentItems':learner_assessment_items(pack),'diagnosticItems':learner_diagnostic_items(pack)} if synthetic and not review else {}),**(supplementary_materials(pack,review=review) if review or synthetic else {}),'pathId':path,'packId':pack_id,'packRef':{k:descriptor[k] for k in ('packId','packVersion','packSha256')},
                        'title':pack['title'],'unitIds':list(dict.fromkeys(f['unitId'] for f in families)),
                        'requiredObjectives':len(target_ids),'completedObjectives':0,
                        'objectiveFamilies':families,'availableLessons':len(lessons),'lessons':lessons,
                        'status':'INCOMPLETE','editorialStatus':'DRAFT','humanApproval':False,
                        'requirements':deepcopy(pack['courseRequirements']),
                        'draftAssessmentCount':len(pack.get('atomicFinalAssessment',[])),
                        'editorialMaterials':{k:deepcopy(pack.get(k,[])) for k in ('diagnostic','formulaSheet','finalAssessment','atomicFinalAssessment','recoveryTargets')} if review else ({k:deepcopy(pack.get(k,[])) for k in ('formulaSheet','recoveryTargets')} if synthetic else None),
                        'gaps':['Copertura e prove per ciascuno dei '+str(len(target_ids))+' sotto-obiettivi da certificare.',
                                'Approvazione scientifica/editoriale umana assente.',
                                'Continuità remota docente-studente non certificata.']})
    return {'schemaVersion':1,'releaseScope':'PRIVATE_EDITORIAL_REVIEW' if review else ('PRIVATE_SYNTHETIC_ACCEPTANCE' if synthetic else 'PUBLIC_DEMONSTRATION'),
            'baseline':{'id':'physics-curriculum-2026-v1','sha256':hashlib.sha256(BASELINE.read_bytes()).hexdigest(),
                        'year':'2026/27','familyCount':baseline['familyCount'],'requiredObjectives':baseline['atomicSubtargetCount'],
                        'source':baseline['source']},'courses':courses,'bankIncluded':False}


def course_projection_for_edition(store,principal,edition_id):
    store._edition_access(principal,edition_id)
    from .catalog import edition_pack
    binding=edition_pack(store,edition_id)
    data=course_projection(review=principal.role=='teacher',synthetic=synthetic_learner(store,principal))
    course=next((c for c in data['courses'] if c['packId']==binding['packId']),None)
    if course is None:raise StudyError('course_learning_unavailable',404)
    if course['packRef']['packSha256']!=binding['packSha256']:raise StudyError('coursepack_unavailable',409)
    # Shared finite model projection is generated by the same evaluator for HTTP.
    from .course_models import attach_model_cases
    attach_model_cases(course)
    return {'schemaVersion':1,'course':course,'baseline':data['baseline'],'releaseScope':data['releaseScope'],'bankIncluded':False}


def coursepack_for_edition(store,principal,edition_id):
    """New SF packs: membership grants public examples, not editorial answers.

    The owning teacher can review original drafts. The returned student view is
    explicitly a projection; its JSON is not the canonical pack bytes.
    """
    store._edition_access(principal,edition_id)
    from .catalog import edition_pack
    binding=edition_pack(store,edition_id)
    if binding['packId'] not in {'sf-'+path+'-v1' for path in PATHS}:
        raise StudyError('course_learning_unavailable',404)
    pack=load_pack(binding['packId'],binding['packVersion'])
    if principal.role=='teacher':return pack
    if synthetic_learner(store,principal):
        return {**supplementary_materials(pack), **{k:deepcopy(pack[k]) for k in ('id','version','title','status','reviewer','scope','rights')},
                'activities': deepcopy(pack['activities']), 'exercises': [], 'transferTests': [],
                'lessons': [learner_lesson(l) for l in pack['lessons']],
                'assessmentItems':learner_assessment_items(pack),
                'diagnosticItems':learner_diagnostic_items(pack),
                'formulaSheet':deepcopy(pack.get('formulaSheet',[])),
                'projectionScope':'PRIVATE_SYNTHETIC_ACCEPTANCE', 'bankIncluded':False,
                'packRef':{k:binding[k] for k in ('packId','packVersion','packSha256')}}
    projected={k:deepcopy(pack[k]) for k in ('id','version','title','status','reviewer','scope','rights','activities','exercises','transferTests','reviewRubric')}
    projected['lessons']=[deepcopy(l) for l in pack['lessons'] if l.get('releaseScope')=='PUBLIC_DEMONSTRATION' and l['id'] in DEMO_IDS]
    projected['projectionScope']='PUBLIC_DEMONSTRATION'
    projected['packRef']={k:binding[k] for k in ('packId','packVersion','packSha256')}
    return projected
