#!/usr/bin/env python3
"""Assemble the published manifest, schema, catalogue and coverage counts."""
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
PACK=HERE.parent
ROOT=HERE.parents[2]
BANK=ROOT/'packages/engine/lessonos/study/content/physics-semestre-2026-bank'


def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2,allow_nan=False)+'\n')


def main():
    shard_list=BANK/'shards-built.json'
    shards=(json.loads(shard_list.read_text()) if shard_list.exists()
            else json.loads((BANK/'manifest.json').read_text())['shards'])
    report=json.loads((BANK/'validation-report.json').read_text())
    if not report['ok'] or report['questionCount']!=4000:
        raise SystemExit('Refusing to assemble an incomplete bank')
    records=[]
    for shard in shards:
        raw=(BANK/shard['path']).read_bytes()
        if hashlib.sha256(raw).hexdigest()!=shard['sha256']:
            raise SystemExit('Shard changed after validation: '+shard['path'])
        records.extend(json.loads(raw))
    official=json.loads((PACK/'sources/taxonomy-2026.json').read_text())
    source_registry=[
        {'id':'MUR-SYLLABUS-2026','type':'official_syllabus','title':'Syllabus di Fisica, semestre aperto 2026/2027',
         'url':official['syllabus_url'],'publishedOn':'2026-06-19','verifiedOn':'2026-10-21',
         'accessNote':'PDF MUR individuato; accesso diretto 403. Contenuto verificato nella pagina ufficiale UniBo del medesimo insegnamento 2026/27.'},
        {'id':'UNIBO-SYLLABUS-2026','type':'primary_university_programme','title':'Università di Bologna, FISICA (A), 2026/2027',
         'url':official['full_text_primary_mirror'],'verifiedOn':'2026-10-21'},
        {'id':'SAPIENZA-RULES-2026','type':'primary_university_exam_rules','title':'Sapienza, guida al semestre aperto 2026/2027',
         'url':official['exam_2026']['source'],'verifiedOn':'2026-10-21'},
        {'id':'MUR-DM941-2026','type':'ministerial_decree_reference','title':'Decreto ministeriale n. 941 del 10 luglio 2026',
         'url':official['exam_2026']['decree'],'verifiedOn':'2026-10-21',
         'accessNote':'Identità e disposizioni pertinenti riscontrate sulla guida ufficiale Sapienza; nessuna pretesa di accesso integrale al PDF MUR.'},
        {'id':'EXAM-2025-1','type':'historical_exam_private_mirror','title':'Primo appello Fisica, 20 novembre 2025',
         'url':'https://testammissione.com/wp-content/uploads/2026/08/semestre-medicina-2025-fisica-primo-appello.pdf',
         'accessNote':'Analisi dei 31 obiettivi dal fascicolo ripubblicato; sito ospitante non ministeriale. Non costituisce chiave ufficiale MUR.'},
        {'id':'EXAM-2025-2','type':'historical_exam_private_mirror','title':'Secondo appello Fisica, 10 dicembre 2025',
         'url':'https://testammissione.com/wp-content/uploads/2026/08/semestre-medicina-2025-fisica-secondo-appello.pdf',
         'accessNote':'Analisi dei 31 obiettivi dal fascicolo ripubblicato; sito ospitante non ministeriale. Non costituisce chiave ufficiale MUR.'},
        {'id':'UPLOAD-VALDES','type':'user_supplied_reference','title':'Valdes, Fisica generale con applicazioni alla medicina',
         'pdfPages':429,'consultation':'Indice, testo e campioni mirati; verifica visiva delle pagine problematiche.',
         'reproducedInRepository':False},
        {'id':'UPLOAD-RAGOZZINO','type':'user_supplied_reference','title':'Ragozzino/Velotta, Manuale di fisica generale per il semestre filtro',
         'pdfPages':576,'consultation':'Indice e campioni mirati.','reproducedInRepository':False},
        {'id':'UPLOAD-SCANNICCHIO','type':'user_supplied_reference','title':'Scannicchio, Manuale di fisica generale e biomedica per il semestre filtro',
         'pdfPages':768,'consultation':'Indice e campioni mirati.','reproducedInRepository':False},
        {'id':'UPLOAD-FISICATB','type':'user_supplied_reference','title':'FisicaTB.pdf',
         'pdfPages':133,'consultation':'Scansione a doppia pagina, esame visivo e OCR selettivo.',
         'reproducedInRepository':False},
    ]
    sources={source['id'] for source in source_registry}
    for q in records:
        for source in q['provenance']['sources']:
            if source['sourceId'] not in sources:
                raise SystemExit('Unregistered source: '+source['sourceId'])
    write(PACK/'sources/source-registry.json',source_registry)
    taxonomy=[]
    for unit in official['units']:
        items=[q for q in records if q['taxonomy']['unitId']==unit['id']]
        taxonomy.append({**unit,'questionCount':len(items),
            'countsByDifficulty':dict(Counter(q['difficulty']['level'] for q in items)),
            'microareas':sorted({q['taxonomy']['microarea'] for q in items}),
            'topics':sorted({q['taxonomy']['topic'] for q in items})})
    mini_courses=[{
        'id':'sf-'+unit['id'].lower(),'title':unit['name'],'unitIds':[unit['id']],
        'bankId':'physics-semestre-2026','questionCount':unit['questionCount'],
        'progression':['base','facile','medio','difficile'],
        'selectionPolicy':'Preferire famiglie diverse; scegliere un compito successivo della stessa famiglia per recupero mirato.'
    } for unit in taxonomy]
    mini_courses.append({'id':'sf-fisica-simulazioni','title':'Allenamento trasversale di Fisica',
        'bankId':'physics-semestre-2026','unitIds':[unit['id'] for unit in taxonomy],
        'profileId':'semestre-2026','questionCount':4000})
    manifest={
        'id':'physics-semestre-2026','version':1,'schemaVersion':'1.0.0',
        'title':'Fisica — 4.000 quesiti per il semestre filtro 2026/27',
        'language':'it-IT','academicYear':'2026/2027','createdOn':'2026-10-21',
        'status':'DRAFT','reviewer':None,'questionCount':4000,'calculatorAllowed':False,
        'questionSchema':'question.schema.json','shards':shards,
        'taxonomy':taxonomy,'miniCourses':mini_courses,
        'difficultyRubric':{
            'base':{'count':1000,'rank':1,'description':'Riconoscere grandezze e condizioni; applicare una relazione con un breve calcolo.'},
            'facile':{'count':1000,'rank':2,'description':'Scegliere l’incognita, confrontare due stati o collegare due passaggi elementari.'},
            'medio':{'count':1000,'rank':3,'description':'Manipolare simboli, combinare variazioni o tenere separate più misure.'},
            'difficile':{'count':1000,'rank':4,'description':'Ricostruire vincoli o tarature e controllare l’unicità della soluzione.'},
            'calibrationStatus':'editorial_not_student_calibrated'
        },
        'examProfiles':[
            {'id':'semestre-2026','academicYear':'2026/2027','questionCount':31,
             'multipleChoice':21,'completion':10,'optionsPerChoice':5,'durationSeconds':3000,
             'scoring':{'correct':1,'incorrect':-0.1,'omitted':0},
             'includedScopes':['syllabus_core'],'sourceId':'SAPIENZA-RULES-2026',
             'dates':['2026-12-10','2027-01-11']},
            {'id':'semestre-2025-historical','academicYear':'2025/2026','questionCount':31,
             'multipleChoice':15,'completion':16,'optionsPerChoice':5,'durationSeconds':2700,
             'scoring':{'correct':1,'incorrect':-0.1,'omitted':0},
             'sourceIds':['EXAM-2025-1','EXAM-2025-2'],
             'note':'Formato storico per allenamento con quesiti originali; non ricostruzione dei fascicoli ufficiali.'}
        ],
        'sources':source_registry,
        'quality':{
            'buildValidation':report,
            'countsByScope':dict(Counter(q['descriptors']['scope'] for q in records)),
            'lawFamilyCount':len({q['lawFamily'] for q in records}),
            'individuallyAuthoredTaskCount':sum(q['provenance']['kind']=='original_individually_authored_task' for q in records),
            'humanScientificReview':'NOT_RUN','studentDifficultyCalibration':'NOT_RUN',
            'uniquenessLimit':'250 famiglie fisiche con richieste cognitive distinte. Controlli testuali, normalizzati e firme di ragionamento; nessuna prova esaustiva di unicità semantica.',
            'cfuPolicy':'I CFU orientano la distribuzione editoriale; non sono quote ministeriali di domande.',
            'manualReadingPolicy':'Fonti consultate tramite indice e campioni mirati, non dichiarate lette integralmente.',
            'missingSource':'Testbustes Eseriziario Completo Semestre Filtro.pdf non disponibile nella sessione; non utilizzato.'
        },
        'integration':{
            'courseSubject':'fisica','activityId':'physics-question-bank-v1',
            'editionBinding':'questionBankIds nel descrittore del CoursePack esistente; SHA del CoursePack conservato.',
            'miniCourseMeaning':'Percorsi didattici definiti in questo manifest, filtrabili tramite miniCourseId; non nuovi CoursePack immutabili.',
            'runtime':'JSON statico, nessun LLM e nessun CAS a runtime.',
            'apiPrefix':'/study/editions/{editionId}/question-banks/physics-semestre-2026',
            'attemptsPersisted':False,'studentProjectionExcludes':['answer','solution','solutionSteps','verification','option.exact'],
            'answerPolicy':'Scelta multipla per simboli; completamento numerico esatto con frazioni e virgola decimale.'
        }
    }
    write(BANK/'manifest.json',manifest)
    with (PACK/'catalog.csv').open('w',newline='') as stream:
        writer=csv.writer(stream)
        writer.writerow(['id','unitId','macroarea','microarea','topic','difficulty','format','reasoningTask','familyId','lawFamily','scope','estimatedSeconds'])
        for q in records:
            writer.writerow([q['id'],*(q['taxonomy'][k] for k in ('unitId','macroarea','microarea','topic')),
                q['difficulty']['level'],q['format'],q['descriptors']['reasoningTask'],q['familyId'],q['lawFamily'],
                q['descriptors']['scope'],q['descriptors']['estimatedSeconds']])
    # The intermediate shard list is now incorporated, byte for byte, in the manifest.
    shard_list.unlink(missing_ok=True)
    print(json.dumps({'questionCount':4000,'shards':len(shards),'scopeCounts':manifest['quality']['countsByScope'],
        'solutionWords':report['solutionWords'],'manifestSha256':hashlib.sha256((BANK/'manifest.json').read_bytes()).hexdigest()},indent=2))


if __name__=='__main__':
    main()
