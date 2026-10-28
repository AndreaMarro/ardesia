import {useEffect,useState} from 'react';
import {studyRequest,describeError,type StudyMe} from '../api';
import {QuestionCard,type Question} from './PhysicsQuestionBank';
import {ReviewEditor} from './QuestionBankReview';
export type CuratedRef={id:string;version:number;sha256:string;lessonId:string;difficulty?:string;role?:string};
export type CuratedMaterials={curatedPractice?:{bankId:string;bankVersion:number;manifestSha256:string;questionRefs:CuratedRef[]};workedProblemRefs?:CuratedRef[];examSimulations?:{id:string;title:string;scopeWarning:string;durationSeconds:number;questionRefs:CuratedRef[]}[]};
/** Reuses the existing bank transport; timed simulations use the existing exam runner. */
export function CuratedCoursePractice({materials,editionId,me,lessonId}:{materials:CuratedMaterials;editionId:string;me:StudyMe;lessonId:string}){
 const [open,setOpen]=useState(false);
 if(!materials.curatedPractice)return null;
 return <details className="disclosure-panel course-curated" onToggle={e=>setOpen(e.currentTarget.open)}><summary>Problemi scelti per questa lezione e allenamenti tematici</summary>
  {open&&<CuratedReader materials={materials} editionId={editionId} me={me} lessonId={lessonId}/>}
 </details>;
}
function CuratedReader({materials,editionId,me,lessonId}:{materials:CuratedMaterials;editionId:string;me:StudyMe;lessonId:string}){
 const practice=materials.curatedPractice!;
 const groups=[{id:'practice',title:'Pratica della lezione',refs:practice.questionRefs.filter(r=>r.lessonId===lessonId)},
  {id:'worked',title:'Problemi con svolgimento',refs:(materials.workedProblemRefs||[]).filter(r=>r.lessonId===lessonId)},
  ...(me.role==='teacher'?(materials.examSimulations||[]).map(e=>({id:e.id,title:e.title,refs:e.questionRefs,warning:e.scopeWarning,minutes:e.durationSeconds/60})):[])];
 const [groupId,setGroupId]=useState('practice'),[index,setIndex]=useState(0),[reload,setReload]=useState(0),[busy,setBusy]=useState(false);
 const [question,setQuestion]=useState<Question|null>(null),[error,setError]=useState(''),[verified,setVerified]=useState(false);
 const group=groups.find(g=>g.id===groupId)!,ref=group.refs[index];
 const base='/editions/'+encodeURIComponent(editionId)+'/question-banks/'+encodeURIComponent(practice.bankId);
 useEffect(()=>{const controller=new AbortController();setVerified(false);setQuestion(null);setError('');
  void studyRequest<{bankSha256:string}>(base,undefined,{signal:controller.signal}).then(async catalog=>{
   if(catalog.bankSha256!==practice.manifestSha256)throw Error('question_bank_changed');
   if(!ref)return;
   if(me.role==='teacher'){if(!controller.signal.aborted)setVerified(true);return;}
   const result=await studyRequest<{bankSha256:string;question:Question&{version:number}}>(base+'/questions/'+encodeURIComponent(ref.id),undefined,{signal:controller.signal});
   if(result.bankSha256!==practice.manifestSha256||result.question.id!==ref.id||result.question.version!==ref.version)throw Error('question_bank_changed');
   if(!controller.signal.aborted){setQuestion(result.question);setVerified(true);}
  }).catch(failure=>{if(!controller.signal.aborted){const code=failure instanceof Error?failure.message:'';setError(code==='question_not_found'?'Questo quesito non è disponibile per l’edizione. Il docente può verificare la revisione e la pubblicazione.':code==='question_bank_changed'?'La banca è stata aggiornata. Questa selezione conserva la sua versione: riapri il corso prima di continuare.':describeError(failure,'Non riesco ad aprire il problema. Puoi riprovare.'));}});
  return()=>controller.abort();
 },[base,practice.manifestSha256,ref?.id,ref?.version,me.role,reload]);
 return <section aria-label="Problemi selezionati"><p>{practice.questionRefs.length} quesiti selezionati nel corso, {(materials.workedProblemRefs||[]).length} svolgimenti e {(materials.examSimulations||[]).length} allenamenti tematici. Il servizio verifica la disponibilità e la versione dei quesiti per questa edizione.</p>
  <label>Attività<select disabled={busy} value={groupId} onChange={e=>{setGroupId(e.target.value);setIndex(0);}}>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
  {'warning' in group&&<p>{group.warning} Consultazione docente dei quesiti originali; la prova temporizzata usa il percorso studente.</p>}
  {me.role==='student'&&Boolean(materials.examSimulations?.length)&&<section aria-label="Simulazioni temporizzate"><h3>Due simulazioni tematiche</h3><p>DRAFT · ambito privato sintetico · approvazione umana non eseguita. Le correzioni compaiono dopo la consegna o la scadenza.</p><ul>{materials.examSimulations!.map(item=><li key={item.id}><a href={'/?'+new URLSearchParams({view:'exam',edition:editionId,simulation:item.id})}>{item.title}</a><p>{item.questionRefs.length} quesiti · {item.durationSeconds/60} minuti. {item.scopeWarning}</p></li>)}</ul></section>}
  {ref?<><p>Problema {index+1} di {group.refs.length}{ref.difficulty?' · '+ref.difficulty:''}</p>
   <nav aria-label="Problemi dell’attività"><button disabled={busy||index===0} onClick={()=>setIndex(n=>n-1)}>Problema precedente</button><button disabled={busy||index===group.refs.length-1} onClick={()=>setIndex(n=>n+1)}>Problema successivo</button></nav>
   {error?<><p role="status">{error}</p><button onClick={()=>setReload(n=>n+1)}>Riprova il caricamento</button></>:!verified?<p role="status">Apro la versione del problema…</p>:me.role==='teacher'?<ReviewEditor key={ref.id} base={base} questionId={ref.id} onChange={()=>{}} onBusy={setBusy}/>:question&&<QuestionCard key={ref.id} question={question} base={base} bankSha256={practice.manifestSha256} index={index}/>}
  </>:<p>Nessun problema selezionato per questa lezione.</p>}
 </section>;
}
