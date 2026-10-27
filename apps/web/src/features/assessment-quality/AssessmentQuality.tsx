import {lazy,Suspense,useEffect,useState} from 'react';
import {describeError,studyRequest} from '../../api';
import {ErrorNotice,Loading} from '../../components/Feedback';
import './assessment-quality.css';

type Item={id:string;title:string;unitId:string;familyId:string;contentSha256:string;numericStatus:string;quarantined:boolean;issues:string[]};
type Dossier={id:string;title:string;questionId:string;seedRange:number[];distinctParameterSets:number;previewVersion:number;previewSha256:string;limits:string;preview:{prompt:string;answer:string;unit:string;domain:string;steps:string[];distractors:{answer:string;feedback:string}[];transfer:{prompt:string;answer:string;feedback:string}}};
type Report={dossiers?:Dossier[];auditVersion:string;bankSha256:string;publishedRecords:number;
 editorialBaseline:{total:number};summary:{records:number;distinctRecords:number;templateFamilies:number;quarantined:number;verifiedNumeric:number;unverifiedNumeric:number;failedNumeric:number;notApplicableNumeric:number};
 courses:{id:string;title:string;requiredObjectives:number;records:number;quarantined:number}[];
 limitations:string[];items:Item[];total:number;nextCursor:string|null};
const labels:Record<string,string>={invalid_schema:'Struttura da correggere',answer_mismatch:'Risposta diversa dal ricalcolo',duplicate_content:'Testo duplicato',missing_provenance:'Provenienza incompleta',missing_unit:'Unità mancante',missing_solution_steps:'Passaggio senza spiegazione',unsupported_check:'Controprova non eseguita'};
const count=(value:number)=>value.toLocaleString('it-IT');
const CasWorkbench=lazy(()=>import('./CasWorkbench'));

function Dashboard({base,onSelect,disabled,onOpenCas,casOpen}:{base:string;onSelect:(id:string)=>void;disabled:boolean;onOpenCas:(id:string)=>void;casOpen:boolean}){
 const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(''),[scope,setScope]=useState('quarantined');
 const [cursors,setCursors]=useState<(string|null)[]>([null]),[refresh,setRefresh]=useState(0);
 const cursor=cursors[cursors.length-1];
 useEffect(()=>{
  const controller=new AbortController();setReport(null);setError('');
  const params=new URLSearchParams({scope,limit:'20'});if(cursor)params.set('after',cursor);
  void studyRequest<Report>(`${base}/review/quality?${params}`,undefined,{signal:controller.signal})
   .then(value=>{if(!controller.signal.aborted)setReport(value)})
   .catch(failure=>{if(!controller.signal.aborted)setError(describeError(failure,'Audit non disponibile. Controlla la connessione o riprova.'))});
  return()=>controller.abort();
 },[base,scope,cursor,refresh]);
 return <section className='assessment-quality' aria-label='Audit qualità della banca'>
  <header><h3>Che cosa richiede una verifica.</h3><p>Controlli automatici di struttura, provenienza e aritmetica. La revisione e la pubblicazione restano decisioni separate del docente.</p>
   <button type='button' disabled={disabled||(!report&&!error)} onClick={()=>setRefresh(value=>value+1)}>Aggiorna audit</button></header>
  {error&&<ErrorNotice message={error} onRetry={()=>setRefresh(value=>value+1)}/>}
  {!error&&!report&&<Loading>Ricalcolo l’inventario della banca…</Loading>}
  {report&&<>
   {Boolean(report.dossiers?.length)&&<section aria-label='Primo batch editoriale'><h4>Quattro famiglie, una per corso</h4><p>Proposte originali per la revisione: 32 seed per famiglia, separati dai 4.000 record esistenti. Il quesito di riferimento mantiene la propria versione e il proprio gate.</p>{report.dossiers?.map(dossier=><details key={dossier.id}><summary>{dossier.title} · bozza di autore</summary><p>Seed 0–31 · {dossier.distinctParameterSets} combinazioni di parametri distinte.</p><p>{dossier.preview.prompt}</p><p>{dossier.preview.domain}</p><ol>{dossier.preview.steps.map(step=><li key={step}>{step}</li>)}</ol><p>Risposta proposta: {dossier.preview.answer} {dossier.preview.unit}</p><h5>Distrattori e feedback</h5><ul>{dossier.preview.distractors.map(item=><li key={item.answer}>{item.answer}: {item.feedback}</li>)}</ul><h5>Problema di trasferimento</h5><p>{dossier.preview.transfer.prompt}</p><p>{dossier.preview.transfer.answer}</p><p>{dossier.preview.transfer.feedback}</p><p>{dossier.limits}</p><p className='assessment-quality-hash'>Bozza v{dossier.previewVersion} · SHA-256 {dossier.previewSha256}</p><button type='button' disabled={disabled} onClick={()=>onSelect(dossier.questionId)}>Apri il quesito di riferimento · {dossier.title}</button></details>)}</section>}
   <dl className='assessment-quality-metrics'>
    <div><dt>Record inventariati</dt><dd>{count(report.summary.records)}</dd></div>
    <div><dt>Famiglie di generazione</dt><dd>{count(report.summary.templateFamilies)}</dd></div>
    <div><dt>Casi in quarantena</dt><dd>{count(report.summary.quarantined)}</dd></div>
    <div><dt>Risposte numeriche ricontrollate</dt><dd>{count(report.summary.verifiedNumeric)}</dd></div>
   </dl>
   <p>{count(report.summary.unverifiedNumeric)} risposte numeriche non verificate da questo audit; {count(report.summary.notApplicableNumeric)} risposte di altro tipo. {count(report.summary.failedNumeric)} discrepanze aritmetiche rilevate. {count(report.publishedRecords)} record pubblicati per questa edizione.</p>
   <p>{report.editorialBaseline.total} sotto-obiettivi editoriali interni: il numero non è un elenco ufficiale MUR. I casi in quarantena restano nel denominatore.</p>
   <div className='assessment-quality-table'><table><caption>Copertura dei quattro corsi</caption><thead><tr><th scope='col'>Corso</th><th scope='col'>Record</th><th scope='col'>Quarantena</th><th scope='col'>Obiettivi interni</th></tr></thead><tbody>{report.courses.map(course=><tr key={course.id}><th scope='row'>{course.title}</th><td>{count(course.records)}</td><td>{count(course.quarantined)}</td><td>{course.requiredObjectives}</td></tr>)}</tbody></table></div>
   <label>Mostra i casi<select value={scope} disabled={disabled} onChange={event=>{setScope(event.target.value);setCursors([null])}}>
    <option value='quarantined'>In quarantena</option><option value='unverified'>Numerici non verificati</option><option value='all'>Tutti i record</option></select></label>
   <p role='status'>{count(report.total)} record con questo filtro · pagina {cursors.length}</p>
   <ul className='assessment-quality-queue'>{report.items.map(item=><li key={item.id}><div><strong>{item.title}</strong><p>{item.unitId} · {item.issues.length?item.issues.map(issue=>labels[issue]??issue).join(' · '):'Nessun problema rilevato dai controlli eseguiti.'}</p></div>
    <div className='aq-queue-actions'><button type='button' disabled={disabled} onClick={()=>onSelect(item.id)}>Rivedi {item.title}</button><button type='button' disabled={disabled||casOpen} onClick={()=>onOpenCas(item.id)}>Controprova matematica · {item.title}</button></div></li>)}</ul>
   {!report.items.length&&<p>Nessun caso con questo filtro. I limiti dell’audit restano validi.</p>}
   <nav className='button-row' aria-label='Pagine dell’audit'><button type='button' disabled={disabled||cursors.length===1} onClick={()=>setCursors(previous=>previous.slice(0,-1))}>Audit precedenti</button><button type='button' disabled={disabled||!report.nextCursor} onClick={()=>setCursors(previous=>[...previous,report.nextCursor])}>Audit successivi</button></nav>
   <details><summary>Metodo, versione e limiti</summary><p>{report.auditVersion}</p><p className='assessment-quality-hash'>Banca SHA-256: {report.bankSha256}</p><ul>{report.limitations.map(limit=><li key={limit}>{limit}</li>)}</ul><p>La quarantena è una segnalazione per la revisione; questo audit non modifica il gate di pubblicazione.</p></details>
  </>}
 </section>;
}

export function AssessmentQuality(props:{base:string;onSelect:(id:string)=>void;selectedQuestionId?:string|null;disabled:boolean}){
 const [open,setOpen]=useState(false);
 const [question,setQuestion]=useState<string|null>(null);
 return <>
  <div className='aq-direct'><button type='button' disabled={props.disabled||!props.selectedQuestionId||Boolean(question)} onClick={()=>setQuestion(props.selectedQuestionId??null)}>Controprova del quesito selezionato</button>{!props.selectedQuestionId&&<p>Seleziona un quesito nella coda per aprire il laboratorio matematico privato.</p>}</div>
  {question&&<Suspense fallback={<Loading>Carico il laboratorio matematico…</Loading>}><CasWorkbench key={`${props.base}/${question}`} base={props.base} questionId={question} onClose={()=>setQuestion(null)}/></Suspense>}
  <details className='assessment-quality-disclosure' onToggle={event=>setOpen(event.currentTarget.open)}><summary>Qualità della banca e casi da verificare</summary>{open&&<Dashboard key={props.base} {...props} onOpenCas={setQuestion} casOpen={Boolean(question)}/>}</details>
 </>;
}
