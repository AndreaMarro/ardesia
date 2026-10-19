import { useEffect, useRef, useState } from 'react'
import { requestKey, studyRequest } from './apiClient'
import type { PostitReference, StudyMe } from './contracts'
type SubmissionPayload={editionId:string;activityId:string;text:string;assetRefs:string[];parentId:string|null;sourceRefs:PostitReference[]}
type Draft={text:string;assetRefs:string[];key:string;parentId:string|null;pending?:SubmissionPayload}
export function SubmissionPanel({me,source,parentId,onUpdate}:{me:StudyMe;source:PostitReference|null;parentId:string|null;onUpdate:()=>Promise<void>}){
  const storageKey=`ardesia-study-draft:${me.id}`
  function load():Draft{try{const value=JSON.parse(localStorage.getItem(storageKey)??'null') as Draft|null;return value??{text:'',assetRefs:[],key:requestKey(),parentId}}catch{return {text:'',assetRefs:[],key:requestKey(),parentId}}}
  const [draft,setDraft]=useState<Draft>(load)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const pending=useRef(false)
  useEffect(()=>{if(parentId!==null)setDraft(previous=>previous.parentId===parentId||previous.pending?previous:{...previous,parentId,key:requestKey()})},[parentId])
  useEffect(()=>{localStorage.setItem(storageKey,JSON.stringify(draft))},[draft,storageKey])
  async function upload(files:FileList|null){if(!files?.length)return;setBusy(true);setMessage('Caricamento privato in corso…');try{
    const accepted=[...draft.assetRefs]
    for(const file of Array.from(files)){
      const response=await fetch('/study/assets?editionId=fluidi',{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file})
      if(!response.ok)throw new Error('upload_failed')
      const asset=await response.json() as {id:string};accepted.push(asset.id)
    }
    setDraft(previous=>({...previous,assetRefs:accepted,key:requestKey()}));setMessage('Originale caricato in privato. La consegna deve ancora essere inviata.')
  }catch{setMessage('File non accettato. Verifica formato, dimensione e connessione.')}finally{setBusy(false)}}
  async function send(event:React.FormEvent){event.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setMessage('')
    try{
      const payload=draft.pending??{editionId:'fluidi',activityId:'poiseuille-v1',text:draft.text,assetRefs:draft.assetRefs,parentId:draft.parentId,sourceRefs:source?[source]:[]}
      const pendingDraft={...draft,pending:payload}
      localStorage.setItem(storageKey,JSON.stringify(pendingDraft));setDraft(pendingDraft)
      const receipt=await studyRequest<{receiptId:string;revision:number}>('/submissions',payload,{headers:{'Idempotency-Key':draft.key}})
      setMessage(`Consegnato · ricevuta ${receipt.receiptId} · tentativo ${receipt.revision}`)
      setDraft({text:'',assetRefs:[],key:requestKey(),parentId:null});localStorage.removeItem(storageKey);await onUpdate()
    }catch{setMessage('Salvato su questo dispositivo, non ancora confermato. Riprova: la stessa richiesta recupera la ricevuta senza duplicati.')}
    finally{pending.current=false;setBusy(false)}
  }
  return <section className="study-submission"><h2>{parentId?'Nuovo tentativo':'Consegna il tuo tentativo'}</h2><p>Testo, PNG/JPEG/WebP, PDF o MP3/M4A/WebM. Immagini: 10 MiB; PDF/audio: 20 MiB; massimo 5 allegati e 50 MiB complessivi. PDF fino a 20 pagine, audio fino a 3 minuti.</p>
    <form onSubmit={event=>void send(event)}><label>La tua spiegazione<textarea rows={5} disabled={Boolean(draft.pending)} value={draft.text} maxLength={20000} onChange={event=>setDraft(previous=>({...previous,text:event.target.value,key:requestKey()}))}/></label>
      <label>Aggiungi originale privato<input type="file" disabled={Boolean(draft.pending)} multiple accept="image/png,image/jpeg,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/webm" onChange={event=>void upload(event.target.files)}/></label>
      <p>{draft.assetRefs.length} allegati privati · {source?'Fonte contestuale collegata':'Nessuna fonte contestuale selezionata'}</p>
      <button className="study-primary" disabled={busy||(!draft.text.trim()&&!draft.assetRefs.length)}>Consegna</button>
      <p role="status" data-testid="submission-status">{message}</p></form>
    <p>Originali conservati. OCR e ASR live non eseguiti: il tutor può rivedere il file e chiedere chiarimenti.</p>
  </section>
}
