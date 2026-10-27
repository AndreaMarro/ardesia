import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {describeError,requestKey,studyRequest,type StudyMe,type StudyResource} from '../../api';
import {ErrorNotice,Loading} from '../../components/Feedback';
import {SourceViewer} from '../../components/SourceViewer';
import {displaySourceTitle,readLessonPassage} from '../../components/lessonPassageReference';
import {classifications,relations,diaryStates,noteBody,type MemoryNote,type MemoryNode,type MemoryPacket,type MemoryReference,type NoteBody} from './model';
import './memory.css';
const GraphExplorer=lazy(()=>import('./GraphExplorer'));

export function MemoryView(props:{me:StudyMe;resources?:StudyResource[]}) {
  return <MemoryScope key={props.me.id} {...props}/>;
}
function MemoryScope({resources=[]}:{me:StudyMe;resources?:StudyResource[]}) {
  const [data,setData]=useState<MemoryPacket|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true);
  const [query,setQuery]=useState(''),[search,setSearch]=useState(''),[mode,setMode]=useState('notes');
  const [detail,setDetail]=useState<MemoryNote|null>(null),[node,setNode]=useState<MemoryNode|null>(null);
  const [source,setSource]=useState<MemoryReference|null>(null),[versions,setVersions]=useState<MemoryNote[]|null>(null);
  const [editing,setEditing]=useState<MemoryNote|null|undefined>(undefined),[notice,setNotice]=useState(''),[actionBusy,setActionBusy]=useState(false);
  const [refresh,setRefresh]=useState(0),[detailBusy,setDetailBusy]=useState(false);
  const [projection,setProjection]=useState(0);
  const request=useRef(0),detailRequest=useRef(0),mounted=useRef(true),heading=useRef<HTMLHeadingElement>(null);
  const importPending=useRef<{archive:unknown;key:string}|null>(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;detailRequest.current++;};},[]);
  useEffect(()=>{
    const controller=new AbortController(),sequence=++request.current;
    detailRequest.current++;setData(null);setDetail(null);setNode(null);setSource(null);setVersions(null);setEditing(undefined);setDetailBusy(false);setError('');setBusy(true);
    void studyRequest<MemoryPacket>('/memory'+(search?'?'+new URLSearchParams({query:search}):''),undefined,{signal:controller.signal})
      .then(value=>{if(sequence===request.current&&!controller.signal.aborted)setData(value);})
      .catch(e=>{if(!controller.signal.aborted&&sequence===request.current)setError(describeError(e,'La memoria non è disponibile. Riprova quando torna la connessione.'));})
      .finally(()=>{if(!controller.signal.aborted&&sequence===request.current)setBusy(false);});
    return()=>{controller.abort();request.current++;};
  },[search,refresh]);
  useEffect(()=>{if(detail||node)heading.current?.focus();},[detail,node]);
  async function openNote(id:string) {
    const sequence=++detailRequest.current;
    setDetail(null);setNode(null);setVersions(null);setSource(null);setDetailBusy(true);setError('');setEditing(undefined);
    try {
      const value=await studyRequest<MemoryNote>('/memory/notes/'+encodeURIComponent(id));
      if(mounted.current&&detailRequest.current===sequence)setDetail(value);
    }catch(e){if(mounted.current&&detailRequest.current===sequence)setError(describeError(e,'Questa idea non è disponibile. Aggiorna la memoria.'));}
    finally{if(mounted.current&&detailRequest.current===sequence)setDetailBusy(false);}
  }
  async function openNode(value:MemoryNode) {
    if(value.kind==='note'){void openNote(value.id);return;}
    const sequence=++detailRequest.current;
    setDetailBusy(true);setDetail(null);setVersions(null);setNode(null);setSource(null);setEditing(undefined);setError('');
    try {
      const current=await studyRequest<MemoryPacket>('/memory'+(search?'?'+new URLSearchParams({query:search}):''));
      if(!mounted.current||sequence!==detailRequest.current)return;
      const authorized=current.nodes.find(item=>item.id===value.id);
      if(JSON.stringify(current)!==JSON.stringify(data)){setData(current);setProjection(v=>v+1);}
      if(!authorized){setError('Questo collegamento non è più disponibile. La memoria è stata aggiornata.');return;}
      setNode(authorized);setSource(authorized.reference??null);
    }catch(e){if(mounted.current&&sequence===detailRequest.current){setData(null);setError(describeError(e,'Il collegamento non è disponibile. Aggiorna la memoria.'));}}
    finally{if(mounted.current&&sequence===detailRequest.current)setDetailBusy(false);}
  }
  async function history() {
    if(!detail)return;
    const sequence=detailRequest.current;setError('');
    try{const result=await studyRequest<{revisions:MemoryNote[]}>('/memory/notes/'+encodeURIComponent(detail.id)+'/history');
      if(mounted.current&&sequence===detailRequest.current)setVersions(result.revisions);
    }catch(e){if(mounted.current&&sequence===detailRequest.current)setError(describeError(e));}
  }
  async function remove() {
    if(!detail||actionBusy)return;setActionBusy(true);setError('');
    try{await studyRequest('/memory/notes/'+encodeURIComponent(detail.id)+'/delete',{expectedVersion:detail.version},
      {headers:{'Idempotency-Key':requestKey()}});
      if(mounted.current){setDetail(null);setRefresh(v=>v+1);setNotice('Idea rimossa dal quaderno.');}
    }catch(e){if(mounted.current)setError(describeError(e));}
    finally{if(mounted.current)setActionBusy(false);}
  }
  async function exportNotes() {
    setActionBusy(true);setError('');
    try{const archive=await studyRequest<unknown>('/memory/export');if(!mounted.current)return;
      const url=URL.createObjectURL(new Blob([JSON.stringify(archive)],{type:'application/json'}));
      const anchor=document.createElement('a');anchor.href=url;anchor.download='ardesia-memoria.json';anchor.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Export preparato con i collegamenti attualmente autorizzati.');
    }catch(e){if(mounted.current)setError(describeError(e,'Export non riuscito. Il quaderno resta disponibile.'));}
    finally{if(mounted.current)setActionBusy(false);}
  }
  async function importNotes(file?:File) {
    if(actionBusy)return;setActionBusy(true);setError('');setNotice('');
    try{
      if(!importPending.current){
        if(!file)return;
        if(file.size>240000)throw Error('memory_archive_too_large');
        importPending.current={archive:JSON.parse(await file.text()),key:requestKey()};
      }
      const pending=importPending.current;
      const result=await studyRequest<{importedCount:number}>('/memory/import',{archive:pending.archive},
        {headers:{'Idempotency-Key':pending.key}});
      if(mounted.current){importPending.current=null;setRefresh(v=>v+1);setNotice(`${result.importedCount} idee importate. I permessi delle fonti sono stati verificati.`);}
    }catch(e){if(mounted.current)setError(describeError(e,'Import non confermato. Puoi riprovare lo stesso file oppure annullare il tentativo.'));}
    finally{if(mounted.current)setActionBusy(false);}
  }
  const notes=data?.notes??[],lookup=new Map(notes.map(n=>[n.id,n]));
  const title=(id:string)=>lookup.get(id)?.title??'Idea collegata';
  return <div className="learning-memory">
    <header className="page-heading memory-heading"><span className="memory-eyebrow">IL TUO QUADERNO PERSONALE</span>
      <h1>Memoria delle idee.</h1><p>Ritrova una spiegazione, riprendi una domanda, cambia idea. Ogni collegamento conserva la sua fonte.</p>
      <div className="memory-actions"><button className="button-primary" onClick={()=>{setEditing(null);setDetailBusy(false);setDetail(null);setNode(null);setSource(null);setVersions(null);detailRequest.current++;}}>Nuova idea</button>
        <button disabled={actionBusy} onClick={()=>void exportNotes()}>Esporta quaderno</button>
        <label className="memory-import">Importa quaderno<input type="file" accept="application/json,.json" disabled={actionBusy||Boolean(importPending.current)}
          onChange={e=>{const file=e.target.files?.[0];e.target.value='';void importNotes(file);}}/></label>
        <button onClick={()=>setRefresh(v=>v+1)}>Aggiorna memoria</button></div>
      <p className="fine-print">Privato, anche senza un corso. Le classificazioni sono tue annotazioni: non certificano competenze.</p>
    </header>
    {notice&&<p className="memory-notice" role="status">{notice}</p>}
    {error&&<ErrorNotice message={error} onRetry={()=>setRefresh(v=>v+1)}/>}
    {importPending.current&&<div className="memory-actions"><button disabled={actionBusy} onClick={()=>void importNotes()}>Riprova import</button>
      <button disabled={actionBusy} onClick={()=>{importPending.current=null;setNotice('Import annullato sul browser. Se il server lo aveva già ricevuto, aggiorna il quaderno.');}}>Annulla tentativo di import</button></div>}
    <form className="memory-search" onSubmit={e=>{e.preventDefault();setSearch(query.trim());}}>
      <label htmlFor="memory-query">Cerca nelle idee e nelle fonti</label><div><input id="memory-query" type="search" value={query} maxLength={200} placeholder="Un concetto, una domanda, un passaggio…" onChange={e=>setQuery(e.target.value)}/>
      <button type="submit">Cerca</button>{search&&<button type="button" onClick={()=>{setQuery('');setSearch('');}}>Mostra tutto</button>}</div>
    </form>
    {editing!==undefined&&<NoteEditor key={editing?.id??'new'} note={editing} notes={notes} resources={resources}
      onCancel={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);setRefresh(v=>v+1);setNotice('Idea salvata nel quaderno.');}}/>}
    {busy?<Loading>Sto ricostruendo i collegamenti autorizzati…</Loading>:data&&<>
      <div className="memory-toolbar"><p>{notes.length} {notes.length===1?'idea':'idee'} · {data.nodes.filter(n=>n.kind==='source').length} fonti · {data.edges.length} relazioni</p>
        <nav aria-label="Vista della memoria"><button aria-pressed={mode==='notes'} onClick={()=>setMode('notes')}>Quaderno</button>
        <button aria-pressed={mode==='graph'} onClick={()=>setMode('graph')}>Grafo dei collegamenti</button></nav></div>
      <div className="memory-layout"><section aria-label="Idee e collegamenti">
        {notes.length===0&&(mode==='notes'||data.nodes.length===0)?<div className="memory-empty"><h2>{search?'Nessun risultato autorizzato.':'Nessuna idea salvata.'}</h2><p>Una domanda aperta è un buon punto da cui ripartire.</p></div>:
          mode==='notes'?<div className="memory-cards">{notes.map(note=><article className="memory-card" key={note.id}>
            <span className={'memory-class memory-class-'+note.classification}>{classifications[note.classification]??note.classification}</span>
            <h2><button aria-label={'Apri '+note.title} onClick={()=>void openNote(note.id)}>{note.title}</button></h2>
            <p>{note.text.slice(0,180)}</p><div className="memory-tags">{note.concepts.map(c=><span key={c}>{c}</span>)}</div>
            <small>{note.sourceState==='UNAVAILABLE'?'Fonte ritirata o accesso revocato':note.sourceState==='HISTORICAL'?'Collegata a una revisione storica':`${note.sourceRefs.length} fonti · revisione ${note.version}`}</small>
          </article>)}</div>:<MemoryGraph key={projection} data={data} onOpen={openNode} onReload={()=>setRefresh(v=>v+1)}/>}</section>
        {(detail||node||detailBusy)&&<aside className="memory-detail" aria-label="Dettaglio del collegamento">
          {detailBusy?<Loading>Apertura dell’idea…</Loading>:detail?<>
            <span className="memory-eyebrow">{classifications[detail.classification]} · REVISIONE {detail.version}</span><h2 ref={heading} tabIndex={-1}>{detail.title}</h2>
            {detail.sourceState==='HISTORICAL'&&<p className="source-warning">La fonte ha una revisione più recente. Qui rimane il passaggio originale.</p>}
            {detail.sourceState==='UNAVAILABLE'?<p>Contenuto nascosto perché una fonte non è più disponibile.</p>:<>
              <p className="original-text">{detail.text}</p><div className="memory-actions"><button onClick={()=>setEditing(detail)}>Modifica o rettifica</button>
                <button onClick={()=>void history()}>Storia delle revisioni</button></div>
              {detail.links.length>0&&<section><h3>Riprende queste idee</h3>{detail.links.map(id=><button className="memory-link" key={id} onClick={()=>void openNote(id)}>Segui collegamento: {title(id)}</button>)}</section>}
              {Boolean(detail.backlinks?.length)&&<section><h3>Idee che tornano qui</h3>{detail.backlinks!.map(id=><button className="memory-link" key={id} onClick={()=>void openNote(id)}>{title(id)}</button>)}</section>}
              {detail.sourceRefs.map((ref,i)=><section key={ref.resourceId+ref.revisionId}><h3>Fonte {i+1}</h3>{ref.quote&&<blockquote>{ref.quote}</blockquote>}
                <button onClick={()=>setSource(ref)}>Apri la fonte originale {i+1}</button></section>)}
            </>}
            <details><summary>Rimuovi dal quaderno</summary><p>La nota scompare dalla vista corrente. Questo comando non cancella gli originali delle fonti.</p>
              <button disabled={actionBusy} onClick={()=>void remove()}>Rimuovi questa idea</button></details>
          </>:node&&<><span className="memory-eyebrow">COLLEGAMENTO</span><h2 ref={heading} tabIndex={-1}>{node.label}</h2><p className="original-text">{node.text}</p>
            {node.status&&<p>Stato nel diario: {diaryStates[node.status]??'Non determinato'}{node.contested?' · contestato':''}</p>}
            {node.kind==='review'&&<p className="fine-print">Review del tutor sintetico, non approvazione scientifica umana.</p>}
            {data.edges.filter(e=>e.source===node.id||e.target===node.id).map((edge,i)=>{
              const other=data.nodes.find(n=>n.id===(edge.source===node.id?edge.target:edge.source));
              return other&&<button key={i} className="memory-link" onClick={()=>openNode(other)}>{relations[edge.relation]??edge.relation}: {other.label}</button>;
            })}</>}
          {versions&&<section className="memory-history"><h3>Revisioni conservate</h3>{versions.map(version=><article key={version.version}>
            <h4>Revisione {version.version} · {classifications[version.classification]}</h4><p className="original-text">{version.text||'Fonte non disponibile'}</p>
            <p className="fine-print">Stato storico della nota; non sostituisce la revisione corrente.</p></article>)}</section>}
          {source&&<PinnedSource key={source.resourceId+source.revisionId} reference={source}/>}
        </aside>}
      </div>
    </>}
  </div>;
}

function PinnedSource({reference}:{reference:MemoryReference}) {
  const [resource,setResource]=useState<StudyResource|null>(null);
  const passage=resource&&resource.id===reference.resourceId&&resource.revisionId===reference.revisionId?readLessonPassage(resource):null;
  return <><SourceViewer reference={reference} onLoaded={setResource}/>{passage&&<div className="entry-explanation">
    <a href={passage.descriptor.replayUrl} target="_blank" rel="noopener noreferrer">Torna a questo istante nello Studio</a>
    <p className="fine-print">Occorrono lo stesso browser e l’archivio locale della lezione. Il collegamento conserva registrazione, intervallo e versione; non trasferisce l’audio.</p>
  </div>}</>;
}

function MemoryGraph({data,onOpen,onReload}:{data:MemoryPacket;onOpen:(node:MemoryNode)=>void;onReload:()=>void}) {
  return <div className="memory-graph"><p>Segui una relazione per aprire l’oggetto e la sua revisione. Gli stessi collegamenti sono disponibili da tastiera.</p>
    <Suspense fallback={<Loading>Apertura del grafo…</Loading>}><GraphExplorer data={data} onOpen={onOpen} onReload={onReload}/></Suspense>
    <ul className="memory-graph-nodes" aria-label="Nodi del grafo">{data.nodes.map(node=><li key={node.id} className={'memory-node memory-node-'+node.kind}>
      <span>{({note:'Idea',concept:'Concetto',source:'Fonte',attempt:'Tentativo',review:'Review',observation:'Osservazione'} as Record<string,string>)[node.kind]}</span>
      <button onClick={()=>onOpen(node)}>{node.label}</button></li>)}</ul>
    <ul className="memory-graph-edges" aria-label="Relazioni del grafo">{data.edges.map((edge,i)=>{
      const from=data.nodes.find(n=>n.id===edge.source),to=data.nodes.find(n=>n.id===edge.target);
      return from&&to&&<li key={i}><button onClick={()=>onOpen(from)}>{from.label}</button><span> → {relations[edge.relation]??edge.relation} → </span>
        <button onClick={()=>onOpen(to)}>{to.label}</button></li>;
    })}</ul>
  </div>;
}

function NoteEditor({note,notes,resources,onCancel,onSaved}:{note:MemoryNote|null;notes:MemoryNote[];resources:StudyResource[];onCancel:()=>void;onSaved:()=>void}) {
  const [draft,setDraft]=useState<NoteBody>(note?noteBody(note):{title:'',text:'',classification:'idea',concepts:[],sourceRefs:[],links:[]});
  const [concepts,setConcepts]=useState(note?.concepts.join(', ')??''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [selected,setSelected]=useState<MemoryReference|null>(null),[original,setOriginal]=useState<StudyResource|null>(null);
  const [availableSources,setAvailableSources]=useState<StudyResource[]>([]);
  const pending=useRef<{body:NoteBody;key:string}|null>(null),mounted=useRef(true),guard=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  const editionId=resources[0]?.editionId;
  useEffect(()=>{
    const controller=new AbortController();setAvailableSources([]);
    if(editionId)void studyRequest<{resources:StudyResource[]}>('/workspace?'+new URLSearchParams({editionId}),undefined,{signal:controller.signal})
      .then(value=>{if(!controller.signal.aborted)setAvailableSources(value.resources);})
      .catch(()=>{if(!controller.signal.aborted)setError('Le fonti dell’edizione non sono disponibili. Puoi salvare un’idea personale oppure riaprire il quaderno per riprovare.');});
    return()=>controller.abort();
  },[editionId]);
  const patch=(value:Partial<NoteBody>)=>setDraft(d=>({...d,...value}));
  async function save(){
    if(guard.current)return;guard.current=true;setBusy(true);setError('');
    const command=pending.current??{body:{...draft,concepts:concepts.split(',').map(c=>c.trim()).filter(Boolean)},key:requestKey()};
    pending.current=command;
    try{await studyRequest(note?'/memory/notes/'+encodeURIComponent(note.id):'/memory/notes',note?{note:command.body,expectedVersion:note.version}:command.body,
      {headers:{'Idempotency-Key':command.key}});
      if(mounted.current){pending.current=null;onSaved();}
    }catch(e){if(mounted.current){
      if(e instanceof Error&&['stale_revision','invalid_memory_note','invalid_memory_classification','anchor_quote_mismatch','forbidden','not_found'].includes(e.message))pending.current=null;
      setError(describeError(e,'Salvataggio non confermato. Riprova lo stesso contenuto oppure annulla per modificarlo.'));}}
    finally{guard.current=false;if(mounted.current)setBusy(false);}
  }
  const frozen=busy||Boolean(pending.current);
  return <form className="memory-editor" aria-label="Scrivi nel quaderno" onSubmit={e=>{e.preventDefault();void save();}}>
    <h2>{note?'Rivedi questa idea':'Da dove riparti?'}</h2>
    {error&&<ErrorNotice message={error}/>}
    <fieldset disabled={frozen}><legend className="sr-only">Contenuto dell’idea</legend>
      <label>Titolo<input required value={draft.title} maxLength={160} onChange={e=>patch({title:e.target.value})}/></label>
      <label htmlFor="memory-note-text">La tua nota</label><textarea id="memory-note-text" required rows={4} value={draft.text} maxLength={4000} onChange={e=>patch({text:e.target.value})}/>
      <div className="memory-form-grid"><label>Come descrivi questo passaggio?<select value={draft.classification} onChange={e=>patch({classification:e.target.value})}>
        {Object.entries(classifications).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label>Concetti, separati da virgola<input value={concepts} maxLength={780} onChange={e=>setConcepts(e.target.value)}/></label></div>
      <label>Collega una fonte dell’edizione aperta<select value={selected?.resourceId??''} onChange={e=>{
        const resource=availableSources.find(r=>r.id===e.target.value);setOriginal(null);setSelected(resource?{resourceId:resource.id,revisionId:resource.revisionId}:null);
      }}><option value="">Scegli una fonte per aggiungerla</option>{availableSources.map(r=><option key={r.id} value={r.id}>{displaySourceTitle(r,90)}</option>)}</select></label>
      {draft.sourceRefs.map((ref,i)=><p className="memory-source-chip" key={ref.resourceId+ref.revisionId}>{ref.quote||'Fonte '+(i+1)}
        <button type="button" aria-label={'Rimuovi riferimento '+(i+1)} onClick={()=>patch({sourceRefs:draft.sourceRefs.filter((_,n)=>n!==i)})}>Rimuovi riferimento</button></p>)}
      {selected&&<div><SourceViewer key={selected.resourceId+selected.revisionId} reference={selected} onLoaded={setOriginal} onSelect={(start,end,quote)=>{
        if(!original||original.id!==selected.resourceId||original.revisionId!==selected.revisionId)return;
        const ref={...selected,start:Array.from(original.text.slice(0,start)).length,end:Array.from(original.text.slice(0,end)).length,quote};
        patch({sourceRefs:[...draft.sourceRefs.filter(r=>r.resourceId!==ref.resourceId||r.revisionId!==ref.revisionId),ref]});
      }}/><button type="button" disabled={!original} onClick={()=>patch({sourceRefs:[...draft.sourceRefs.filter(r=>r.resourceId!==selected.resourceId||r.revisionId!==selected.revisionId),selected]})}>Collega questa revisione</button>
        <p className="fine-print">Per citare un frammento, selezionalo nell’originale. Nessun testo viene ricostruito o spostato su una revisione diversa.</p></div>}
      {notes.filter(n=>n.id!==note?.id&&n.sourceState!=='UNAVAILABLE').length>0&&<fieldset><legend>Riprende queste idee</legend>
        {notes.filter(n=>n.id!==note?.id&&n.sourceState!=='UNAVAILABLE').map(n=><label className="memory-check" key={n.id}><input type="checkbox" checked={draft.links.includes(n.id)}
          onChange={e=>patch({links:e.target.checked?[...draft.links,n.id]:draft.links.filter(id=>id!==n.id)})}/>{n.title}</label>)}</fieldset>}
    </fieldset>
    <div className="memory-actions"><button className="button-primary" type="submit" disabled={busy||!draft.title.trim()||!draft.text.trim()}>{busy?'Salvataggio…':pending.current?'Riprova salvataggio':'Salva nel quaderno'}</button>
      <button type="button" disabled={busy} onClick={onCancel}>Annulla</button></div>
  </form>;
}
