import { useState } from 'react'
import { requestKey, studyRequest } from './apiClient'
import type { Submission,StudyResource } from './contracts'
export function ReviewPanel({submissions,resources,onUpdate}:{submissions:Submission[];resources:StudyResource[];onUpdate:()=>Promise<void>}){
  const [selected,setSelected]=useState<string|null>(null)
  const [text,setText]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const current=submissions.find(item=>item.id===selected)
  const candidate=current?.feedback[0]
  async function propose(){if(!current)return;setBusy(true);try{const result=await studyRequest<{text:string}>('/feedback/drafts',{submissionId:current.id});setText(result.text);await onUpdate()}catch{setMessage('Proposta non disponibile: controlla la versione delle fonti.')}finally{setBusy(false)}}
  async function publish(decision:string){if(!candidate)return;setBusy(true);try{await studyRequest(`/feedback/${candidate.id}/publish`,{expectedRevision:current?.revision,text,decision},{headers:{'Idempotency-Key':requestKey()}});setMessage(decision==='returned'?'Feedback revisionato e restituito.':'Chiarimento richiesto, senza voto.');await onUpdate()}catch{setMessage('Review non pubblicata. La fonte o il tentativo potrebbero essere cambiati.')}finally{setBusy(false)}}
  return <section><h2>Da correggere</h2><div className="study-review-list">{submissions.map(item=><button key={item.id} onClick={()=>{setSelected(item.id);setText(item.feedback[0]?.review?.text??item.feedback[0]?.text??'');setMessage('')}}>Apri consegna {item.student_id} · tentativo {item.revision}</button>)}</div>
    {current&&<div className="study-review-grid"><article><h3>Originale · tentativo {current.revision}</h3><p className="study-original">{current.text}</p>{current.source_refs.map(ref=><p key={ref.resourceId}>{resources.find(item=>item.id===ref.resourceId)?.text??'Fonte non più disponibile'}<small> · revisione {ref.revisionId}</small></p>)}
      {current.asset_refs.map(id=><p key={id}><a href={`/study/assets/${id}`} target="_blank" rel="noreferrer">Apri originale privato</a></p>)}<p>Ricevuta: {current.receipt_id}</p></article>
      <article><h3>Proposta e revisione</h3>{!candidate?<button onClick={()=>void propose()} disabled={busy}>Genera proposta sintetica</button>:<><p>Proposta deterministica fittizia · non è una correzione AI verificata</p>{candidate.stale&&<p role="alert">Fonte cambiata: proposta obsoleta.</p>}<label>Revisione del tutor<textarea rows={7} value={text} onChange={event=>setText(event.target.value)}/></label><button className="study-primary" disabled={busy||candidate.stale||candidate.state==='reviewed'||!text.trim()} onClick={()=>void publish('returned')}>Approva e restituisci</button><button disabled={busy||candidate.stale||candidate.state==='reviewed'||!text.trim()} onClick={()=>void publish('needs_clarification')}>Richiedi chiarimento</button></>}
      <p role="status">{message}</p></article></div>}
  </section>
}
