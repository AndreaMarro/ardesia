"""Synthetic local S05 acceptance server; never a production runtime."""
import json, os
from pathlib import Path
from lessonos.study.store import StudyStore
from lessonos.study import learning_memory as memory
from lessonos.study.submissions import submit
from lessonos.study.feedback import propose_feedback,review_feedback
from lessonos.study.diary import propose_error,confirm_error
from study_api.app import create_app

ROOT=Path(os.environ['ARDESIA_S05_DEMO_DIR']).resolve()
ROOT.mkdir(parents=True,exist_ok=True)
os.umask(0o077)
DB=ROOT/'s05-demo.sqlite'
if not DB.exists():
    store=StudyStore(DB)
    teacher=store.create_principal('tutor-s05-synthetic','teacher')
    student=store.create_principal('student-s05-synthetic','student')
    peer=store.create_principal('student-s05-peer','student')
    alone=store.create_principal('student-s05-alone','student')
    store.create_edition(teacher,'s05-fluidi')
    for actor in (student,peer):store.add_test_member(teacher,'s05-fluidi',actor.id)
    first=store.create_resource(student,'s05-fluidi','notes',
        'Lezione 1 · Il vincolo prima del calcolo\nA differenza di pressione fissata, nel modello ideale di Poiseuille la portata dipende dalla quarta potenza del raggio.')
    second=store.create_resource(student,'s05-fluidi','notes',
        'Lezione 2 · Un nuovo confronto\nIl raggio raddoppia. Quale grandezza rimane fissata? Prima di confrontare i risultati, torno alla prima lezione.')
    def ref(source):return {'resourceId':source['id'],'revisionId':source['revisionId']}
    body={'title':'Il vincolo prima del calcolo','text':'Avevo usato il quadrato del raggio. Torno alla spiegazione e verifico che cosa rimane costante.',
        'classification':'observation','concepts':['portata','vincoli'],'sourceRefs':[ref(first)],'links':[]}
    one=memory.save_note(store,student,body,'demo-note-one')
    two=memory.save_note(store,student,{**body,'title':'Riprendo il confronto della seconda lezione',
        'text':'Non ho capito perché cambiare il vincolo cambia il confronto. Riparto dal passaggio della prima lezione.',
        'classification':'not_understood','sourceRefs':[ref(second),ref(first)],'links':[one['id']]},'demo-note-two')
    memory.save_note(store,student,{**body,'title':'Un’idea per il prossimo esperimento',
        'text':'Confrontare due tubi, dichiarando prima il vincolo. Posso riusare questa domanda anche in elettricità.',
        'classification':'idea','concepts':['vincoli','riuso tra materie'],'sourceRefs':[],'links':[two['id']]},'demo-note-three')
    submitted=submit(store,student,'s05-fluidi','poiseuille-v1',[],'Q cresce come il quadrato del raggio','demo-submit',source_refs=[ref(first)])
    candidate=propose_feedback(store,teacher,submitted['submissionId'])
    review_feedback(store,teacher,candidate['id'],1,'Confronta la quarta potenza con la differenza di pressione fissata.','demo-review')
    anchor={**ref(first),'start':0,'end':len(first['text']),'quote':first['text']}
    thread=propose_error(store,teacher,submitted['submissionId'],'radius-power','model_selection',anchor,'demo-observe')
    confirm_error(store,teacher,thread['threadId'],{'criterion':'Dichiara il vincolo e giustifica la quarta potenza.','procedureRequired':True},
        'La dipendenza è alla quarta potenza soltanto nel modello e nel confronto dichiarati.',
        'Affronta un confronto con raggio doppio.','demo-confirm',transfer_exercise={
            'exerciseId':'s05-transfer','prompt':'A pressione fissata raddoppia il raggio e spiega il rapporto delle portate.',
            'originalParameters':{'radiusRatio':1.5,'boundary':'pressure'},'parameters':{'radiusRatio':2,'boundary':'pressure'}})
    memory.save_note(store,peer,{**body,'title':'NOTA PRIVATA DEL PEER','text':'Contenuto da non ritrovare con un altro account.','sourceRefs':[]},'peer-private')
    fixture={'tokens':{p.id:store.issue_session(p,ttl=14400) for p in (teacher,student,peer,alone)},
        'student':student.id,'peer':peer.id,'alone':alone.id,'firstNote':one['id'],'secondNote':two['id'],
        'firstSource':ref(first),'secondSource':ref(second)}
    target=ROOT/'s05-demo-fixture.json';target.write_text(json.dumps(fixture));target.chmod(0o600)
    store.close()

app=create_app(DB,demo=True)
