import { useEffect, useState } from 'react'
import { GroupEditionView } from './GroupEditionView'
import { SubmissionPanel } from './SubmissionPanel'
import { NotebookPanel } from './NotebookPanel'
import { ReviewPanel } from './ReviewPanel'
import { StudyPostit } from './StudyPostit'
import { PhysicsActivity } from './PhysicsActivity'
import { createStudyPostit,moveStudyPostit,type StudyPostitView } from './postit'
import { requestKey,studyRequest } from './apiClient'
import type { StudyMe,Workspace,StudyResource,PostitReference,ContextPacket } from './contracts'

export function StudyWorkspace({me}:{me:StudyMe}){
  const [data,setData]=useState<Workspace|null>(null)
  const [views,setViews]=useState<StudyPostitView[]>([])
  const [tab,setTab]=useState('Lezione')
  const [text,setText]=useState('')
  const [source,setSource]=useState<PostitReference|null>(null)
  const [parent,setParent]=useState<string|null>(null)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [packet,setPacket]=useState<ContextPacket|null>(null)
  const [interests,setInterests]=useState<{id:string;contact:string;topic:string}[]>([])
  async function refresh(){
    const workspace=await studyRequest<Workspace>('/workspace?editionId=fluidi');setData(workspace)
    const loaded=workspace.layouts.length?workspace.layouts:workspace.resources.map((resource,index)=>createStudyPostit(`study-${resource.id}`,resource,{x:(index%3)*340,y:Math.floor(index/3)*260,width:320,height:240}))
    const missing=workspace.resources.filter(resource=>!loaded.some(view=>view.pluginState.resourceId===resource.id))
    setViews([...loaded,...missing.map(resource=>createStudyPostit(`study-${resource.id}`,resource,{x:0,y:0,width:320,height:240}))])
    if(me.role==='teacher')setInterests(await studyRequest('/interests?editionId=fluidi'))
  }
  useEffect(()=>{void refresh().catch(()=>setError('Lezione non disponibile. Riprova con Aggiorna.'))},[me.id]) // eslint-disable-line react-hooks/exhaustive-deps
  async function saveSource(){setError('');try{const resource=await studyRequest<StudyResource>('/resources',{editionId:'fluidi',kind:me.role==='teacher'?'activity':'notes',visibility:me.role==='teacher'?'group':'private',text});setSource({resourceId:resource.id,revisionId:resource.revisionId,contextId:resource.contextId});setText('');setMessage(me.role==='teacher'?'Attività assegnata al gruppo.':'Fonte privata salvata.');await refresh()}catch{setError('Fonte non salvata.')}}
  async function saveLayout(next:StudyPostitView[]){setViews(next);try{await studyRequest('/layout',{editionId:'fluidi',views:next});setMessage('Disposizione salvata.')}catch{setError('Disposizione non salvata sul server.')}}
  async function hint(){const chosen=source??(data?.resources.find(item=>item.ownerId===me.id)?{resourceId:data.resources.find(item=>item.ownerId===me.id)!.id}:null);if(!chosen){setMessage('Seleziona prima una fonte con “Usa nella consegna”.');return}try{const value=await studyRequest<{text:string}>('/hints',{resourceId:chosen.resourceId,level:1},{headers:{'Idempotency-Key':requestKey()}});setMessage(`Aiuto deterministico: ${value.text}`)}catch{setError('Aiuto non disponibile per questa fonte.')}}
  async function memory(){const chosen=source??data?.resources.find(item=>item.ownerId===me.id)??data?.resources[0];if(!chosen)return;const contextId='contextId' in chosen?chosen.contextId:null;if(!contextId)return;try{setPacket(await studyRequest<ContextPacket>(`/context/${contextId}`));setTab('Continuità')}catch{setError('Contesto non disponibile o fonte rimossa.')}}
  if(!data)return <section><p role="status">Caricamento della lezione…</p>{error&&<p role="alert">{error}</p>}</section>
  return <>
    <section className="study-workspace-header"><p className="study-eyebrow">{me.role==='teacher'?'Tutor sintetico':'Studente sintetico'} · {me.id}</p><h1>Fisica. Un’idea alla prova.</h1><button onClick={()=>void refresh().catch(()=>setError('Aggiornamento non riuscito.'))}>Aggiorna</button></section>
    <nav className="study-tabs" aria-label="Spazio di studio">{['Lezione','Continuità','Materiali','Gruppo',...(me.role==='teacher'?['Da correggere']:[])].map(name=><button key={name} aria-current={tab===name?'page':undefined} onClick={()=>{setTab(name);if(name==='Continuità')void memory()}}>{name}</button>)}</nav>
    {error&&<p className="study-message" role="alert">{error}</p>}<p className="study-message" role="status">{message}</p>
    {(!data.enrolled||tab==='Gruppo')&&<><GroupEditionView edition={data.edition} teacher={me.role==='teacher'} enrolled={data.enrolled} onUpdate={refresh}/>{me.role==='teacher'&&<section><h2>Richieste ricevute</h2>{interests.map(interest=><p key={interest.id}>{interest.contact} · {interest.topic}</p>)}</section>}</>}
    {data.enrolled&&tab==='Lezione'&&<>
      <section className="study-source-form"><h2>{me.role==='teacher'?'Assegna un’attività':'Aggiungi una fonte'}</h2><label>{me.role==='teacher'?'Istruzioni per il gruppo':'Nota o testo originale'}<textarea rows={3} value={text} onChange={event=>setText(event.target.value)} maxLength={20000}/></label><button onClick={()=>void saveSource()} disabled={!text.trim()}>{me.role==='teacher'?'Assegna al gruppo':'Salva fonte privata'}</button><button onClick={()=>void hint()}>Aiuto sul contesto</button><button onClick={()=>void memory()}>Apri memoria LessonOS</button></section>
      <section className="study-board" aria-label="Post-it contestuali">{views.map(view=>{const resource=data.resources.find(item=>item.id===view.pluginState.resourceId);return resource?<div key={view.instanceId} className="study-card-wrap" style={{order:Math.round(view.bounds.x/340)}}><StudyPostit view={view} resource={resource} onSubmit={ref=>{setSource(ref);setMessage('Fonte collegata alla consegna.')}}/><div className="study-layout-controls"><button aria-label={`Sposta post-it ${view.instanceId}`} onClick={()=>void saveLayout(views.map(item=>item.instanceId===view.instanceId?moveStudyPostit(item,{x:item.bounds.x+340}):item))}>Sposta</button><button aria-label={`Duplica vista ${view.instanceId}`} onClick={()=>void saveLayout([...views,createStudyPostit(`copy-${crypto.randomUUID().replaceAll('-','')}`,resource,{x:0,y:0,width:320,height:240})])}>Altra vista</button></div></div>:null})}</section>
      <PhysicsActivity/>{me.role==='student'&&<SubmissionPanel me={me} source={source} parentId={parent} onUpdate={refresh}/>}
    </>}
    {data.enrolled&&(tab==='Materiali'||tab==='Continuità')&&<section><h2>{tab}</h2>{tab==='Continuità'&&<><button onClick={()=>void memory()}>Recupera osservazioni revisionate</button>{packet&&<><p>{packet.resource.text}</p><p>{packet.observations.length} osservazioni · {packet.omittedStale} derivate obsolete omesse</p>{packet.observations.map(observation=><article className="study-postit" key={observation.id}><h3>Da dove ripartire</h3><p>{observation.text}</p><blockquote>{observation.evidence.text}</blockquote><p>Fonte {observation.evidence.sourceId} · revisione {observation.evidence.revisionId}</p><p>Tentativo → review → proporzioni e grandezze fissate</p></article>)}{packet.limits.map(limit=><p key={limit}>{limit}</p>)}</>}</>}
      {tab==='Materiali'&&<NotebookPanel/>}
      {data.submissions.map(item=><article className="study-postit" key={item.id}><h3>{item.student_id} · tentativo {item.revision}</h3><p>{item.text}</p><p>Ricevuta: {item.receipt_id}</p>{item.asset_refs.map(id=><p key={id}><a href={`/study/assets/${id}`} target="_blank" rel="noreferrer">Originale privato</a></p>)}{item.feedback.map(feedback=>feedback.review&&<div key={feedback.id}><h4>{feedback.review.decision==='needs_clarification'?'Chiarimento richiesto':'Revisione del tutor sintetico'}</h4><p>{feedback.review.text}</p>{feedback.stale&&<p>Derivato obsoleto: la fonte è cambiata.</p>}</div>)}{me.role==='student'&&<button onClick={()=>{setParent(item.id);setTab('Lezione')}}>Nuovo tentativo dopo il {item.revision}</button>}</article>)}
    </section>}
    {me.role==='teacher'&&tab==='Da correggere'&&<ReviewPanel submissions={data.submissions} resources={data.resources} onUpdate={refresh}/>}
  </>
}
