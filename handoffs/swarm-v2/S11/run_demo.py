"""Private synthetic fixture using the installed create_app, no alternate routes."""
import argparse
import json
from pathlib import Path
import uvicorn
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study import diary
from study_api.app import create_app

parser=argparse.ArgumentParser()
parser.add_argument('--data-dir',type=Path,required=True)
parser.add_argument('--port',type=int,default=55621)
parser.add_argument('--frontend',type=Path,help='Serve the actual compiled Web artifact from this API')
parser.add_argument('--synthetic-notice',action='store_true',help='Enable the notice only for this disposable synthetic fixture')
args=parser.parse_args()
args.data_dir.mkdir(parents=True,exist_ok=True)
path=args.data_dir/'study.sqlite'
store=StudyStore(path)
tutor=store.create_principal('s11-synthetic-tutor','teacher')
student=store.create_principal('s11-synthetic-learner','student')
peer=store.create_principal('s11-synthetic-peer','student')
if not store.connection.execute('SELECT 1 FROM study_editions WHERE id=?',('s11-fluidi',)).fetchone():
    store.create_edition(tutor,'s11-fluidi')
    store.add_test_member(tutor,'s11-fluidi',student.id)
    store.add_test_member(tutor,'s11-fluidi',peer.id)
    text='Previsione sintetica: a portata fissata la pressione cresce con il raggio.'
    first=submit(store,student,'s11-fluidi','poiseuille-v1',[],text,'s11-first',
        activity_parameters={'radiusRatio':2,'boundary':'flow'},
        activity_evidence={'schemaVersion':1,'experienceId':'poiseuille-boundary-v1','stepId':'fixed-flow',
                           'prediction':{'ratio':16,'fixedQuantity':'pressure'},'supportUsed':['constraint-hint']})
    refs=json.loads(store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?',(first['submissionId'],)).fetchone()[0])
    anchor={**refs[0],'start':0,'end':len(text),'quote':text}
    thread=diary.propose_error(store,tutor,first['submissionId'],'radius-power','model_selection',anchor,'s11-propose')
    diary.confirm_error(store,tutor,thread['threadId'],{'criterion':'Esplicita il vincolo','procedureRequired':True},
        'A portata fissata la pressione richiesta diminuisce se il raggio cresce.','Confronta il reciproco.','s11-confirm',
        transfer_exercise={'exerciseId':'poiseuille-transfer-v1','originalParameters':{'radiusRatio':2,'boundary':'flow'},
                          'parameters':{'radiusRatio':.5,'boundary':'flow'},'prompt':'Dimezza il raggio a portata fissata.'})
    submit(store,student,'s11-fluidi','poiseuille-v1',[],'Nuova previsione sintetica.','s11-transfer',
        activity_parameters={'radiusRatio':.5,'boundary':'flow'},
        activity_evidence={'schemaVersion':1,'experienceId':'poiseuille-boundary-v1','stepId':'transfer',
                           'prediction':{'ratio':16,'fixedQuantity':'flow'},'supportUsed':[]})
access={'editionId':'s11-fluidi','studentToken':store.issue_session(student),'peerToken':store.issue_session(peer),
        'teacherToken':store.issue_session(tutor)}
access_path=args.data_dir/'access.json'
access_path.write_text(json.dumps(access))
access_path.chmod(0o600)
if not store.connection.execute('SELECT 1 FROM study_editions WHERE id=?',('fluidi',)).fetchone():
    store.create_edition(tutor,'fluidi')
store.close()
notice={'version':'s11-synthetic-usage-v1','purpose':'Osservazioni facoltative per la sola prova sintetica locale','retentionDays':30} if args.synthetic_notice else None
app=create_app(path,demo=True,frontend=args.frontend,learning_insights_notice=notice)
print('S11 installed Core/API fixture; synthetic notice enabled: '+str(args.synthetic_notice),flush=True)
uvicorn.run(app,host='127.0.0.1',port=args.port,log_level='warning')
