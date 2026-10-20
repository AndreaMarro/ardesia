import { useRef, useState } from 'react'
import type { PostitReference, StudyResource } from './contracts'
import type { StudyPostitView } from './postit'
import { ContextDrawer } from './ContextDrawer'
export function StudyPostit({view,resource,onSubmit}:{view:StudyPostitView;resource:StudyResource;onSubmit:(ref:PostitReference)=>void}) {
  const [open,setOpen]=useState(false)
  const trigger=useRef<HTMLButtonElement>(null)
  const valid=view.pluginState.resourceId===resource.id && view.pluginState.revisionId===resource.revisionId
  return <article className="study-postit" data-instance-id={view.instanceId}>
    <small>{resource.kind} · {resource.visibility==='private'?'Privata':'Gruppo'}</small>
    <h3>La tua fonte</h3><p>{resource.text}</p>
    {!valid&&<p role="alert">La fonte ha una nuova revisione. Riapri il contesto prima di consegnare.</p>}
    <button ref={trigger} onClick={()=>setOpen(true)}>Contesto della fonte</button>
    <button disabled={!valid} onClick={()=>onSubmit(view.pluginState)}>Usa nella consegna</button>
    {open&&<ContextDrawer resource={resource} onClose={()=>{setOpen(false);trigger.current?.focus()}}/>}
  </article>
}
