import {useRef,useState} from 'react';
import {describeError,requestKey,studyRequest,type StudyResource} from '../../api';
import {matchesSource,parseIndex,INDEX_KIND,type MediaIndex} from './model';
import {CaptionImport} from './CaptionImport';

export function MediaIndexEditor({source,indexResource,initial,resources,onSaved}:{source:StudyResource;indexResource:StudyResource|null;initial:MediaIndex;resources:StudyResource[];onSaved:(r:StudyResource)=>void}){
  const [draft,setDraft]=useState<MediaIndex>(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [attachment,setAttachment]=useState('');
  const pending=useRef<{text:string;key:string}|null>(null);
  const valid=parseIndex(JSON.stringify(draft));
  const frozen=busy||Boolean(pending.current);
  const patch=(next:MediaIndex)=>{setDraft(next);setNotice('');};
  async function save(){
    if(busy||!valid)return;
    const attempt=pending.current??{text:JSON.stringify(valid),key:requestKey()};pending.current=attempt;
    setBusy(true);setError('');setNotice('');let writeAttempted=false;
    try{
      const fresh=await studyRequest<StudyResource>(`/resources/${encodeURIComponent(source.id)}/revisions/${encodeURIComponent(source.revisionId)}`);
      if(fresh.editionId!==source.editionId||!matchesSource(valid,fresh))throw new Error('stale_source');
      for(const link of valid.links){
        const linked=await studyRequest<StudyResource>(`/resources/${encodeURIComponent(link.resourceId)}/revisions/${encodeURIComponent(link.revisionId)}`);
        if(linked.editionId!==source.editionId||linked.visibility!=='group')throw new Error('forbidden');
      }
      writeAttempted=true;
      const result=await studyRequest<StudyResource>(indexResource?`/resources/${encodeURIComponent(indexResource.id)}/revise`:'/resources',
        indexResource?{expectedRevision:indexResource.revisionId,text:attempt.text}:{editionId:source.editionId,kind:INDEX_KIND,visibility:'group',text:attempt.text},
        indexResource?undefined:{headers:{'Idempotency-Key':attempt.key}});
      if(result.kind!==INDEX_KIND||result.editionId!==source.editionId||result.text!==attempt.text)throw new Error('invalid_media_index');
      pending.current=null;onSaved(result);setNotice('Indice salvato. I tempi e la fonte originale restano nella loro versione.');
    }catch(e){if(!writeAttempted)pending.current=null;setError(describeError(e,'Salvataggio non confermato. Riprova lo stesso indice; se esiste una revisione più recente, riapri il passaggio.'));}
    finally{setBusy(false);}
  }
  return <form className="lm-editor" onSubmit={e=>{e.preventDefault();void save();}}>
    <h4>Prepara il passaggio per il riuso</h4>
    <p>Correggi il testo liberamente. I tempi cambiano solo nei campi dedicati, in secondi dall’inizio di questa registrazione.</p>
    <label>Titolo del passaggio<input value={draft.title} maxLength={160} disabled={frozen} onChange={e=>patch({...draft,title:e.target.value})}/></label>
    <CaptionImport draft={draft} disabled={frozen} onApply={patch}/>
    {draft.cues.map((cue,i)=><fieldset key={cue.id} disabled={frozen}>
      <legend>Frammento {i+1}</legend>
      <div className="lm-time-fields">
        <label>Inizio {i+1} (secondi)<input type="number" step="0.001" min="0" max={draft.durationMs/1000} value={cue.startMs/1000} onChange={e=>patch({...draft,cues:draft.cues.map((c,n)=>n===i?{...c,startMs:Math.round(Number(e.target.value)*1000)}:c)})}/></label>
        <label>Fine {i+1} (secondi)<input type="number" step="0.001" min="0" max={draft.durationMs/1000} value={cue.endMs/1000} onChange={e=>patch({...draft,cues:draft.cues.map((c,n)=>n===i?{...c,endMs:Math.round(Number(e.target.value)*1000)}:c)})}/></label>
      </div>
      <label>Trascrizione {i+1}<textarea rows={3} maxLength={8000} value={cue.text} onChange={e=>patch({...draft,cues:draft.cues.map((c,n)=>n===i?{...c,text:e.target.value}:c)})}/></label>
      {draft.cues.length>1&&<button type="button" onClick={()=>patch({...draft,cues:draft.cues.filter((_,n)=>n!==i)})}>Rimuovi frammento {i+1}</button>}
    </fieldset>)}
    <button type="button" disabled={frozen||draft.cues.length>=100} onClick={()=>patch({...draft,cues:[...draft.cues,{id:crypto.randomUUID(),startMs:draft.cues.at(-1)?.endMs??0,endMs:draft.durationMs,text:''}]})}>Aggiungi frammento con tempi espliciti</button>
    <h4>Capitoli</h4>
    {draft.chapters.map((chapter,i)=><fieldset key={chapter.id} disabled={frozen}>
      <legend>Capitolo {i+1}</legend>
      <label>Nome capitolo {i+1}<input maxLength={160} value={chapter.title} onChange={e=>patch({...draft,chapters:draft.chapters.map((c,n)=>n===i?{...c,title:e.target.value}:c)})}/></label>
      <label>Posizione capitolo {i+1} (secondi)<input type="number" min="0" step="0.001" max={draft.durationMs/1000} value={chapter.atMs/1000} onChange={e=>patch({...draft,chapters:draft.chapters.map((c,n)=>n===i?{...c,atMs:Math.round(Number(e.target.value)*1000)}:c)})}/></label>
      <button type="button" onClick={()=>patch({...draft,chapters:draft.chapters.filter((_,n)=>n!==i)})}>Rimuovi capitolo {i+1}</button>
    </fieldset>)}
    <button type="button" disabled={frozen||draft.chapters.length>=50} onClick={()=>patch({...draft,chapters:[...draft.chapters,{id:crypto.randomUUID(),atMs:(draft.chapters.at(-1)?.atMs??-1)+1,title:''}]})}>Aggiungi capitolo</button>
    <h4>Fonti, allegati e attività collegate</h4>
    <label>Collega una fonte del gruppo<select value={attachment} disabled={frozen} onChange={e=>setAttachment(e.target.value)}>
      <option value="">Scegli una fonte…</option>
      {resources.filter(r=>r.id!==source.id&&r.visibility==='group'&&r.kind!==INDEX_KIND).map(r=><option key={r.id} value={r.id}>{r.kind} · {r.id.slice(0,8)}</option>)}
    </select></label>
    <button type="button" disabled={frozen||!attachment||draft.links.length>=20} onClick={()=>{
      const r=resources.find(r=>r.id===attachment);if(!r)return;
      if(!draft.links.some(l=>l.resourceId===r.id&&l.revisionId===r.revisionId))patch({...draft,links:[...draft.links,{resourceId:r.id,revisionId:r.revisionId,label:r.kind==='lesson-passage'?'Altro passaggio della lezione':r.text.split('\n')[0].slice(0,160)||'Fonte collegata'}]});setAttachment('');
    }}>Collega la revisione selezionata</button>
    {draft.links.map((link,i)=><p key={link.resourceId+link.revisionId}>{link.label} <button type="button" disabled={frozen} onClick={()=>patch({...draft,links:draft.links.filter((_,n)=>n!==i)})}>Rimuovi collegamento {i+1}</button></p>)}
    {!valid&&<p role="status">Controlla titolo, testi e tempi: i frammenti devono essere ordinati, senza sovrapposizioni e dentro la registrazione; i capitoli devono avere tempi distinti e crescenti.</p>}
    <button className="button-primary" disabled={busy||!valid}>{busy?'Salvataggio…':pending.current?'Riprova lo stesso indice':'Salva indice e trascrizione'}</button>
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </form>;
}
