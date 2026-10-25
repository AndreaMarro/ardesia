import { useEffect, useRef } from 'react'
import type { StudyResource } from './contracts'
export function ContextDrawer({resource,onClose}:{resource:StudyResource;onClose:()=>void}) {
  const close=useRef<HTMLButtonElement>(null)
  useEffect(()=>{close.current?.focus()},[])
  return <aside role="dialog" aria-modal="true" aria-label="Contesto della fonte" className="study-context"
    onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();onClose()}}}>
    <button ref={close} onClick={onClose}>Chiudi contesto</button>
    <h2>Fonte e provenienza</h2><p>Visibilità: {resource.visibility==='private'?'Privata':'Gruppo'}</p>
    <dl><dt>Risorsa</dt><dd>{resource.id}</dd><dt>Revisione</dt><dd>{resource.revisionId}</dd>
      <dt>Contesto</dt><dd>{resource.contextId}</dd><dt>Origine</dt><dd>{resource.ownerId}</dd></dl>
    <p>Il collegamento di una fonte conserva i suoi permessi.</p>
  </aside>
}
