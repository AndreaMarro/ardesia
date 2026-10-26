import {useEffect,useMemo,useRef,useState} from 'react';
import {describeError,studyRequest,type StudyMe,type StudyResource,type Workspace} from '../../api';
import {readLessonPassage} from '../../components/lessonPassageReference';
import {SourceViewer} from '../../components/SourceViewer';
import {MediaIndexEditor} from './MediaIndexEditor';
import {clock,defaultIndex,INDEX_KIND,matchesSource,parseIndex,replayAt,toVtt} from './model';
import {captionReplayUrl} from './playback';
import './lesson-media.css';

function associated(resources:StudyResource[],source:StudyResource){
  return resources.filter(r=>r.kind===INDEX_KIND&&r.editionId===source.editionId).flatMap(resource=>{
    const index=parseIndex(resource.text);return index&&matchesSource(index,source)?[{resource,index}]:[];
  }).sort((a,b)=>a.resource.id.localeCompare(b.resource.id));
}
export function LessonMediaLibrary({me,data,onUpdate}:{me:StudyMe;data:Workspace;onUpdate:()=>Promise<void>}){
  const [query,setQuery]=useState(''),[selected,setSelected]=useState<string|null>(()=>new URLSearchParams(location.search).get('mediaSource'));
  const passages=data.resources.filter(r=>r.editionId===data.edition.id&&Boolean(defaultIndex(r)));
  const search=query.trim().toLocaleLowerCase('it-IT');
  const filtered=passages.filter(r=>{
    const indices=associated(data.resources,r);const p=readLessonPassage(r)!;
    return [p.transcript,...p.descriptor.objectRefs.map(o=>o.label),...indices.flatMap(v=>[v.index.title,...v.index.cues.map(c=>c.text),...v.index.chapters.map(c=>c.title)])].join('\n').toLocaleLowerCase('it-IT').includes(search);
  });
  const current=passages.find(r=>r.id===selected);
  function choose(id:string){setSelected(id);const url=new URL(location.href);url.searchParams.set('mediaSource',id);history.replaceState(null,'',url);}
  if(!passages.length)return null;
  return <section className="lesson-media" aria-labelledby="lm-title">
    <header className="lm-heading"><div><span className="eyebrow">Dalla lezione al quaderno</span><h2 id="lm-title">Ritrova un passaggio.</h2>
      <p>Registrazioni, parole e oggetti della lavagna restano collegati. Ogni apertura conserva la propria identità.</p></div><span className="lm-count">{passages.length} {passages.length===1?'passaggio':'passaggi'}</span></header>
    <label className="lm-search">Cerca nelle trascrizioni e nei capitoli<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Una parola, un vincolo, una spiegazione…"/></label>
    <div className="lm-layout"><nav aria-label="Passaggi registrati"><ul className="lm-list">
      {filtered.map(r=>{const p=readLessonPassage(r)!,index=associated(data.resources,r)[0]?.index??defaultIndex(r)!;
        return <li key={r.id}><button aria-pressed={selected===r.id} onClick={()=>choose(r.id)}><strong>{index.title}</strong><span>{clock(index.durationMs)} · {p.descriptor.recordingId.slice(0,12)}</span><small>{p.transcript.slice(0,120)}</small></button></li>;})}
    </ul>{!filtered.length&&<p role="status">Nessun passaggio corrisponde alla ricerca.</p>}</nav>
    {current?<MediaDetail key={`${me.id}:${current.id}:${current.revisionId}`} me={me} candidate={current} resources={data.resources} onUpdate={onUpdate}/>:<div className="lm-empty"><h3>Riprendi il filo della lezione.</h3><p>Scegli un passaggio. La trascrizione è leggibile anche quando l’audio resta in un altro archivio locale.</p></div>}
    </div>
  </section>;
}
function MediaDetail({me,candidate,resources,onUpdate}:{me:StudyMe;candidate:StudyResource;resources:StudyResource[];onUpdate:()=>Promise<void>}){
  const [source,setSource]=useState<StudyResource|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[notice,setNotice]=useState('');
  const [chosen,setChosen]=useState(''),[saved,setSaved]=useState<StudyResource|null>(null),[linked,setLinked]=useState<StudyResource|null>(null);
  const generation=useRef(0);const mounted=useRef(true);const [opening,setOpening]=useState(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;};},[]);
  useEffect(()=>{
    let active=true;const controller=new AbortController();setSource(null);setError('');
    void studyRequest<StudyResource>(`/resources/${encodeURIComponent(candidate.id)}/revisions/${encodeURIComponent(candidate.revisionId)}`,undefined,{signal:controller.signal}).then(r=>{
      if(!active)return;
      if(r.id!==candidate.id||r.revisionId!==candidate.revisionId||r.editionId!==candidate.editionId||r.sha256!==candidate.sha256||!defaultIndex(r))throw new Error('stale_source');
      setSource(r);
    }).catch(e=>{if(active)setError(describeError(e,'Il passaggio non è disponibile. La fonte non è stata sostituita.'));});
    return()=>{active=false;controller.abort();};
  },[candidate.id,candidate.revisionId,candidate.editionId,candidate.sha256,retry]);
  const choices=useMemo(()=>associated(saved?[...resources.filter(r=>r.id!==saved.id),saved]:resources,candidate),[resources,saved,candidate]);
  const selected=choices.find(r=>r.resource.id===chosen)??choices[0];
  const index=selected?.index??defaultIndex(candidate)!;
  const [exportText,setExportText]=useState('');
  async function checkSource(){
    if(selected){
      const freshIndex=await studyRequest<StudyResource>(`/resources/${encodeURIComponent(selected.resource.id)}/revisions/${encodeURIComponent(selected.resource.revisionId)}`);
      if(freshIndex.id!==selected.resource.id||freshIndex.revisionId!==selected.resource.revisionId||freshIndex.text!==selected.resource.text||freshIndex.editionId!==candidate.editionId)throw new Error('stale_source');
    }
    const r=await studyRequest<StudyResource>(`/resources/${encodeURIComponent(candidate.id)}/revisions/${encodeURIComponent(candidate.revisionId)}`);
    if(r.id!==candidate.id||r.editionId!==candidate.editionId||!matchesSource(index,r))throw new Error('stale_source');return r;
  }
  async function openReplay(position:number|null){
    if(opening)return;setOpening(true);setError('');const turn=++generation.current;
    // Opening synchronously preserves the browser's explicit user-gesture requirement.
    const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
    try{
      const r=await checkSource();
      if(!mounted.current||turn!==generation.current){popup?.close();return;}
      const url=position===null?readLessonPassage(r)?.descriptor.replayUrl:replayAt(r,position);if(!url)throw new Error('stale_source');
      if(!popup)throw new Error('popup_blocked');
      popup.location.replace(captionReplayUrl(url,r,selected?.resource??null));
      setNotice('Il player verifica i media nello Studio locale. I tempi aprono l’audio; il comando principale recupera anche la versione dell’oggetto collegato. Torna a questa scheda per continuare.');
    }catch(e){popup?.close();if(mounted.current){setError(describeError(e,e instanceof Error&&e.message==='popup_blocked'?'Consenti l’apertura del player in una nuova scheda e riprova.':'La fonte non è disponibile. Il player non è stato aperto.'));setSource(null);}}
    finally{if(mounted.current)setOpening(false);}
  }
  async function openLinked(resourceId:string,revisionId:string){
    setLinked(null);setError('');const turn=++generation.current;
    try{await checkSource();const r=await studyRequest<StudyResource>(`/resources/${encodeURIComponent(resourceId)}/revisions/${encodeURIComponent(revisionId)}`);
      if(!mounted.current||turn!==generation.current)return;
      if(r.id!==resourceId||r.revisionId!==revisionId||r.editionId!==candidate.editionId)throw new Error('forbidden');setLinked(r);
    }catch(e){if(mounted.current)setError(describeError(e,'La revisione collegata non è disponibile.'));}
  }
  async function exportCaptions(){
    const turn=++generation.current;setError('');try{await checkSource();if(mounted.current&&turn===generation.current)setExportText(toVtt(index));}
    catch(e){if(mounted.current&&turn===generation.current){setExportText('');setError(describeError(e,'Esportazione non consentita: la fonte non è disponibile.'));}}
  }
  if(error&&!source)return <div className="lm-detail"><p role="alert">{error}</p><button onClick={()=>setRetry(v=>v+1)}>Rileggi il passaggio dal Core</button></div>;
  if(!source)return <p role="status">Apro la revisione del passaggio…</p>;
  const passage=readLessonPassage(source)!;
  return <article className="lm-detail" aria-label="Passaggio selezionato">
    <div className="lm-detail-heading"><span className="lm-badge">Registrazione locale</span><h3>{index.title}</h3><p>{clock(index.durationMs)} · Trascrizione manuale</p></div>
    {choices.length>1&&<label>Indice da consultare<select value={selected?.resource.id} onChange={e=>{generation.current++;setChosen(e.target.value);setExportText('');setLinked(null);}}>{choices.map(v=><option key={v.resource.id} value={v.resource.id}>{v.index.title} · {v.resource.id.slice(0,8)}</option>)}</select></label>}
    <div className="lm-player"><p>Audio e quaderno si aprono insieme nel player Studio. Occorrono lo stesso browser e l’archivio che conserva la lezione, oppure il bundle .lesson importato.</p>
      <button className="button-primary" disabled={opening} onClick={()=>void openReplay(null)}>{opening?'Controllo della fonte…':'Apri player e quaderno'}</button>
      <p className="fine-print">La condivisione del testo non trasferisce i byte audio e non modifica il consenso. Lo Studio verifica registrazione, integrità e disponibilità; nessun microfono viene avviato da qui.</p>
    </div>
    <h4>Capitoli</h4><ol className="lm-chapters">{index.chapters.map(ch=><li key={ch.id}><button disabled={opening} onClick={()=>void openReplay(ch.atMs)}><span>{clock(ch.atMs)}</span> {ch.title}</button></li>)}</ol>
    <h4>Trascrizione</h4><p className="fine-print">Seleziona un tempo per recuperare il contesto nel quaderno. La visione o l’ascolto non attestano apprendimento.</p>
    <ol className="lm-transcript">{index.cues.map(c=><li key={c.id}><button disabled={opening} aria-label={`Apri frammento a ${clock(c.startMs)}`} onClick={()=>void openReplay(c.startMs)}>{clock(c.startMs)}–{clock(c.endMs)}</button><p>{c.text}</p></li>)}</ol>
    {index.links.length>0&&<><h4>Fonti e attività collegate</h4>{index.links.map(l=><button key={l.resourceId+l.revisionId} onClick={()=>void openLinked(l.resourceId,l.revisionId)}>{l.label}</button>)}</>}
    {linked&&<div className="lm-linked"><button onClick={()=>setLinked(null)}>Torna alla trascrizione</button><SourceViewer reference={{resourceId:linked.id,revisionId:linked.revisionId,contextId:linked.contextId}}/></div>}
    <details className="lm-provenance"><summary>Fonte e versione</summary><dl><dt>Lezione / registrazione</dt><dd>{passage.descriptor.lessonId} / {passage.descriptor.recordingId}</dd><dt>Fonte / revisione</dt><dd>{source.id} / {source.revisionId}</dd><dt>Oggetti collegati</dt><dd>{passage.descriptor.objectRefs.map(o=>`${o.label} (v${o.version})`).join(' · ')}</dd><dt>Indice editoriale</dt><dd>{selected?selected.resource.revisionId:'Nessun indice salvato; trascrizione originale'}</dd></dl></details>
    <details><summary>Esporta i sottotitoli manuali</summary><p>La verifica del Core precede l’esportazione. Le copie esportate non sono revocabili fisicamente.</p><button onClick={()=>void exportCaptions()}>Prepara WebVTT</button>{exportText&&<label>Sottotitoli WebVTT<textarea readOnly rows={7} value={exportText} onFocus={e=>e.target.select()}/></label>}</details>
    {me.role==='teacher'&&source.ownerId===me.id&&(!selected||selected.resource.ownerId===me.id)&&<details className="lm-edit"><summary>Modifica capitoli e trascrizione</summary><MediaIndexEditor key={selected?.resource.revisionId??source.revisionId} source={source} indexResource={selected?.resource??null} initial={index} resources={resources} onSaved={r=>{setSaved(r);setChosen(r.id);setExportText('');void onUpdate().catch(()=>setNotice('Indice salvato. Aggiorna i materiali per rileggerlo nel catalogo.'));}}/></details>}
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </article>;
}
