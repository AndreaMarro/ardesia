import { createRoot } from 'react-dom/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import '@excalidraw/excalidraw/index.css'
import { WorkspaceStore } from '../../../store/WorkspaceStore'
import { JournalRecorder } from '../../../store/JournalRecorder'
import { SessionAudioRecorder, revokeStoredAudioSession } from '../../../store/SessionAudioRecorder'
import { openLessonOsSession, type LessonOsSessionHandle } from '../../../lessonos/bootstrap'
import { roomPaths } from '../../../store/roomPaths'
import { loadReplayTimeline, type ReplayTimeline } from '../../../store/replayTimeline'
import { recordingSession, type AudioObjectReference, type AudioRecordingRef } from '../../../store/audioRecording'
import { prepareLessonPassage } from '../../../store/lessonPassage'
import SessionAudioControls from '../../../SessionAudioControls'
import LivingLessonReplay from '../LivingLessonReplay'
import CanonicalReplay from './CanonicalReplay'
import { attachEditorial, emptyEditorial, parseEditorial, resolveMoment, privateNoteFingerprint, type Editorial, type LessonAccess, type LessonMoment, type PrivateNotes, type SceneEnvelope } from '../model'
import './style.css'
import { createIntentFence } from '../intentFence'
import type { ActiveLessonRegistration } from '../../../store/lessonMutationLock'

const workspace=new WorkspaceStore()
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function App(){
 const [lesson,setLesson]=useState<string|null>(new URLSearchParams(location.search).get('lesson'))
 const [rooms,setRooms]=useState<Array<{room:string;name:string}>>([])
 const [error,setError]=useState('')
 const [closed,setClosed]=useState(false)
 useEffect(()=>{void workspace.init().then(()=>workspace.listRooms()).then(setRooms).catch(e=>setError(e.message))},[lesson])
 const open=(id:string)=>{history.replaceState(null,'',`?lesson=${encodeURIComponent(id)}`);setLesson(id)}
 async function create(){const id=`s17-${crypto.randomUUID()}`;await workspace.saveMeta(id,{v:1,name:'Forza e massa',createdAt:Date.now()});open(id)}
 async function importLesson(file:File){try{const result=await workspace.importLessonBlob(file);if(result.identity.kind!=='embedded')throw Error('Lezione senza identità: importazione esplicita richiesta');const id=result.identity.lessonId;await workspace.saveMeta(id,{v:1,name:'Forza e massa',createdAt:Date.now()});open(id)}catch(e){setError((e as Error).message)}}
 if(closed)return <main><h1>Sessione locale chiusa</h1><p>Microfono e riproduzione terminati.</p></main>
 return <main className="ll-app"><header><a href={location.pathname}>ARDESIA</a><span>Lezione viva · consumer S17</span></header><p className="ll-local">Prova locale con identità sintetica. Il collegamento non distribuisce media né concede accesso remoto.</p>{error && <p role="alert">{error}</p>}{lesson?<Lesson key={lesson} lessonId={lesson} onExit={()=>setClosed(true)}/>:<section className="ll-welcome"><p>RITROVARE UNA SPIEGAZIONE</p><h1>Una lezione conserva<br/>il proprio contesto.</h1><p>Scrittura, oggetti scientifici e voce tornano nello stesso passaggio.</p><button onClick={()=>void create().catch(e=>setError(e.message))}>Nuova lezione</button><label className="ll-import">Apri file .lesson<input aria-label="Apri file .lesson" type="file" accept=".lesson" onChange={e=>{const file=e.target.files?.[0];if(file)void importLesson(file)}}/></label>{rooms.map(r=><button key={r.room} onClick={()=>open(r.room)}>Apri {r.name}</button>)}</section>}</main>
}
function Lesson({lessonId,onExit}:{lessonId:string;onExit:()=>void}){
 const [recorder,setRecorder]=useState<SessionAudioRecorder|null>(null)
 const [ready,setReady]=useState(false)
 const [student,setStudent]=useState(()=>new URLSearchParams(location.search).get('mode')==='student')
 const [error,setError]=useState('')
 const [notice,setNotice]=useState('')
 const [refs,setRefs]=useState<readonly AudioObjectReference[]>([])
 const [editorial,setEditorial]=useState<Editorial>(()=>emptyEditorial(lessonId))
 const editorialRef=useRef(editorial);editorialRef.current=editorial
 const [timeline,setTimeline]=useState<ReplayTimeline|null>(null)
 const [selected,setSelected]=useState<LessonMoment|null>(null)
 const [title,setTitle]=useState('')
 const [showWave,setShowWave]=useState(true)
 const [at,setAt]=useState(0)
 const [recoveryError,setRecoveryError]=useState('')
 const api=useRef<ExcalidrawImperativeAPI|null>(null)
 const scene=useRef<SceneEnvelope>({elements:[],files:{}})
 const journal=useRef<JournalRecorder|null>(null)
 const session=useRef<LessonOsSessionHandle|null>(null)
 const audio=useRef<SessionAudioRecorder|null>(null)
 const chain=useRef(Promise.resolve())
 const permitted=useRef(true)
 const selection=useRef(createIntentFence())
 const registration=useRef<ActiveLessonRegistration|null>(null)
 const listeners=useRef(new Set<()=>void>())
 const access:LessonAccess=useMemo(()=>({allowed:()=>permitted.current,subscribe:fn=>{listeners.current.add(fn);return()=>{listeners.current.delete(fn)}},authorize:async moment=>permitted.current && moment.lessonId===lessonId}),[lessonId])
 const notes:PrivateNotes=useMemo(()=>{
  const path=async(m:LessonMoment)=>`derived/living-lesson/private/demo-student/${lessonId}/${await privateNoteFingerprint(m)}.txt`
  return {read:async m=>{if(!await access.authorize(m))throw Error('Nota non autorizzata');return (await workspace.read(await path(m)))?.text()??''},write:async(m,note)=>{if(!await access.authorize(m))throw Error('Nota non autorizzata');await workspace.write(await path(m),new Blob([note],{type:'text/plain'}))}}
 },[lessonId,access])
 const save=useCallback(()=>{
  const snapshot=JSON.stringify(attachEditorial(scene.current,editorialRef.current))
  const task=chain.current.then(()=>workspace.saveScene(lessonId,snapshot))
  chain.current=task.catch(e=>{setError(e.message)})
  return task
 },[lessonId])
 const refresh=useCallback(async()=>{await journal.current?.flush();await save();setTimeline(await loadReplayTimeline(workspace,lessonId))},[lessonId,save])
 useEffect(()=>{
  let cancelled=false
  const boot=async()=>{
   await workspace.init()
   registration.current=await workspace.registerActiveLesson(lessonId)
   const serialized=await workspace.loadScene(lessonId)
   scene.current=serialized?JSON.parse(serialized):{type:'excalidraw',version:2,source:'ardesia-s17',elements:convertToExcalidrawElements([{id:'force',type:'text',x:80,y:80,text:'Forza: F = m · a',fontFamily:2,fontSize:30},{id:'mass',type:'text',x:80,y:180,text:'Massa: m = 2 kg',fontFamily:2,fontSize:26},{id:'block',type:'rectangle',x:80,y:280,width:140,height:90},{id:'arrow',type:'arrow',x:240,y:325,width:160,height:0,points:[[0,0],[160,0]]}],{regenerateIds:false}) as unknown as Record<string,unknown>[],files:{},appState:{viewBackgroundColor:'#fcfbf7'}}
   const extension=parseEditorial(scene.current,lessonId);editorialRef.current=extension;setEditorial(extension)
   const handle=await openLessonOsSession({room:lessonId});session.current=handle
   const jr=new JournalRecorder({store:workspace,journalPath:roomPaths(lessonId).journal,identity:handle.identity,producer:handle.producer});journal.current=jr
   if(serialized)jr.seed(scene.current.elements??[]);else jr.recordChange(scene.current.elements??[])
   const capture=new SessionAudioRecorder({store:workspace,identity:handle.identity,journal:jr});audio.current=capture;await capture.initialize()
   if(cancelled){await capture.dispose();await jr.flush();await handle.close();await registration.current?.release();return}
   await refresh();setRecorder(capture);const requested=new URLSearchParams(location.search).get('moment');const restore=extension.moments.find(m=>m.id===requested);if(restore){setSelected(restore);setAt(restore.epoch)}setReady(true)
  }
  void boot().catch(e=>setError(e.message))
  return ()=>{cancelled=true;permitted.current=false;selection.current.invalidate();for(const fn of listeners.current)fn();void Promise.resolve(audio.current?.dispose()).then(()=>journal.current?.flush()).then(()=>session.current?.close()).then(()=>registration.current?.release()).catch(e=>console.error(e))}
 },[lessonId,refresh])
 const showScene=useCallback((elements:Record<string,unknown>[],files:Record<string,unknown>)=>{
  api.current?.addFiles(Object.values(files) as BinaryFiles[string][])
  api.current?.updateScene({elements:elements as unknown as ExcalidrawElement[]})
 },[])
 async function link(id:string){
  if(!journal.current)return
  journal.current.recordChange(scene.current.elements??[]);await journal.current.flush()
  const el=scene.current.elements?.find(el=>el.id===id)
  if(!el)throw Error('Oggetto mancante')
  const next=[{elementId:id,version:Number(el.version),label:id==='force'?'Forza':'Massa'}];setRefs(next);audio.current?.setObjectRefs(next);setNotice(`Collegato: ${next[0]!.label}`)
 }
 function fromRecording(recording:AudioRecordingRef,index:number):LessonMoment {
  return {id:`take-${recording.recordingId}`,title:`Segmento ${index+1}`,kind:'marker',...recordingSession(recording),recordingId:recording.recordingId,sha256:recording.sha256,epoch:recording.endEpoch,objectRefs:[...recording.objectRefs]}
 }
 async function select(moment:LessonMoment){
  const currentIntent=selection.current.begin();await save();if(!currentIntent()||!permitted.current)return;const current=await loadReplayTimeline(workspace,lessonId);if(!currentIntent()||!permitted.current)return;const resolved=resolveMoment(lessonId,current,moment,scene.current.files??{});if(resolved.recording.availability!=='available')throw Error(`Audio indisponibile: ${resolved.recording.availability}`);
  const params=new URLSearchParams({lesson:lessonId,mode:student?'student':'teacher',at:String(moment.epoch),recording:moment.recordingId,session:moment.sessionId,sha:moment.sha256,object:moment.objectRefs[0]!.elementId,objectVersion:String(moment.objectRefs[0]!.version)});if(editorialRef.current.moments.some(item=>item.id===moment.id))params.set('moment',moment.id);history.replaceState(null,'',`?${params}`);setRecoveryError('');setSelected(moment);setAt(moment.epoch)
 }
 async function marker(kind:'marker'|'chapter'){
  const markerIntent=selection.current.begin()
  if(!selected || !timeline)throw Error('Seleziona una registrazione')
  const moment={...selected,id:crypto.randomUUID(),title:title.trim()||'Passaggio',kind,epoch:Math.floor(at)}
  resolveMoment(lessonId,timeline,moment,scene.current.files??{})
  const next={...editorialRef.current,moments:[...editorialRef.current.moments,moment]};editorialRef.current=next;setEditorial(next);await save();if(!markerIntent()||!permitted.current)return;setTitle('');await select(moment)
 }
 function clearSelection(){selection.current.invalidate();setSelected(null);const params=new URLSearchParams(location.search);for(const key of ['moment','at','recording','session','sha','object','objectVersion'])params.delete(key);history.replaceState(null,'',`?${params}`);showScene([...(scene.current.elements??[])],scene.current.files??{})}
 async function changeMode(){const current=selection.current.begin();const next=!student;await audio.current?.stop();await refresh();if(!current()||!permitted.current)return;clearSelection();setStudent(next);const params=new URLSearchParams(location.search);params.set('mode',next?'student':'teacher');history.replaceState(null,'',`?${params}`)}
 async function correct(){const elements=scene.current.elements?.map(el=>el.id==='force'?{...el,text:'Forza risultante: F = m · a',originalText:'Forza risultante: F = m · a',version:Number(el.version)+1,versionNonce:Math.floor(Math.random()*2**30),updated:Date.now()}:el)??[];scene.current={...scene.current,elements};journal.current?.recordChange(elements);api.current?.updateScene({elements:elements as unknown as ExcalidrawElement[]});await refresh();setNotice('Correzione salvata; i passaggi precedenti conservano la propria revisione.')}
 async function prepare(){if(!selected || !timeline)return;const recording=timeline.recordings.find(r=>r.recordingId===selected.recordingId);if(!recording)return;const descriptor=await prepareLessonPassage(workspace,recording,location.href);download(new Blob([JSON.stringify(descriptor,null,2)],{type:'application/json'}),'passaggio.json');setNotice('Segmento preparato. La condivisione richiede conferma nel corso; marker e capitoli viaggiano nel file .lesson.')}
 async function exit(){selection.current.invalidate();permitted.current=false;for(const fn of listeners.current)fn();await audio.current?.dispose();await journal.current?.flush();await save();await session.current?.close();await registration.current?.release();onExit()}
 const run=(job:()=>Promise<unknown>)=>{setError('');void job().catch(e=>setError(e.message))}
 if(!ready)return <p role="status">{error||'Apertura lezione…'}</p>
 return <><div className="ll-heading"><div><p>FISICA · IL SECONDO PRINCIPIO</p><h1>Forza e massa</h1></div><nav><button onClick={()=>run(changeMode)}>{student?'Vista docente':'Vista studente'}</button><button onClick={()=>run(async()=>{await audio.current?.stop();await refresh();download(await workspace.exportLesson(lessonId,session.current?.store),'forza-e-massa.lesson')})}>Esporta .lesson</button><button onClick={()=>run(exit)}>Esci</button>{selected&&<button onClick={()=>setShowWave(v=>!v)}>{showWave?'Nascondi waveform':'Mostra waveform'}</button>}</nav></div>
 <div className="ll-layout"><section className="ll-material"><div className="ll-board" aria-label="Lavagna della lezione">{selected ? recoveryError ? <p role="alert">{recoveryError}</p> : <CanonicalReplay key={selected.id} store={workspace} room={lessonId} selectedRecordingId={selected.recordingId} replayFiles={scene.current.files??{}} range={{start:timeline?.recordings.find(r=>r.recordingId===selected.recordingId)?.startEpoch??selected.epoch,end:timeline?.recordings.find(r=>r.recordingId===selected.recordingId)?.endEpoch??selected.epoch}} renderExtension={cursor=><><EpochObserver epoch={cursor.epoch} onEpoch={setAt}/><LivingLessonReplay showWaveform={showWave} store={workspace} lessonId={lessonId} moment={selected} editorial={editorial} access={access} notes={student?notes:undefined} cursor={cursor} onUnavailable={setRecoveryError}/></>}/> : <Excalidraw excalidrawAPI={value=>{api.current=value}} initialData={{elements:scene.current.elements as unknown as ExcalidrawElement[],files:scene.current.files as BinaryFiles,appState:{viewBackgroundColor:'#fcfbf7'}}} viewModeEnabled={student||!!selected} handleKeyboardGlobally={false} onChange={(elements,appState,files)=>{if(student||selected)return;scene.current={...scene.current,elements:elements as unknown as readonly Record<string,unknown>[],files,appState:{viewBackgroundColor:appState.viewBackgroundColor}};journal.current?.recordChange(scene.current.elements??[]);void save().catch(e=>setError(e.message))}}/>}</div><p>Il contesto visualizzato segue il journal all’istante audio selezionato.</p></section>
 <aside>{!student && <section><h2>Durante la lezione</h2><div className="ll-actions"><button onClick={()=>run(()=>link('force'))}>Collega Forza</button><button onClick={()=>run(()=>link('mass'))}>Collega Massa</button><button onClick={()=>run(correct)}>Correggi forza</button><button onClick={clearSelection}>Torna alla scrittura</button></div><p>{refs.length?refs.map(r=>`${r.label} · revisione ${r.version}`).join(', '):'Collega un oggetto prima di registrare.'}</p>{recorder && <SessionAudioControls recorder={recorder} objectRefs={refs} onSaved={()=>{run(refresh)}}/>}<p>Fermare salva il segmento. Riprendi con Registra audio dopo una pausa o una correzione.</p></section>}
 <section><h2>Passaggi e capitoli</h2>{timeline?.recordings.map((r,i)=><button className="ll-passage" key={r.recordingId} disabled={!r.objectRefs.length} aria-label={`Riproduci segmento ${i+1}`} onClick={()=>run(()=>select(fromRecording(r,i)))}>Segmento {i+1}<small>{r.objectRefs.map(r=>r.label).join(', ')} · {r.availability==='available'?'audio salvato':r.availability}</small></button>)}{!student&&timeline?.recordings.map((r,i)=><button key={`revoke-${r.recordingId}`} disabled={r.availability==='revoked'} onClick={()=>run(async()=>{await revokeStoredAudioSession(workspace,recordingSession(r));await refresh()})}>Revoca segmento {i+1}</button>)}{editorial.moments.map(m=><button className="ll-passage" key={m.id} aria-label={m.title} onClick={()=>run(()=>select(m))}>{m.title}<small>{m.kind==='chapter'?'Capitolo':'Marker'} · collegamento del docente</small></button>)}{!timeline?.recordings.length&&<p>Nessuna registrazione. Il microfono è spento.</p>}</section>

 {!student&&selected&&<section><label>Titolo del marker<input aria-label="Titolo del marker" value={title} maxLength={240} onChange={e=>setTitle(e.target.value)}/></label><div className="ll-actions"><button onClick={()=>run(()=>marker('marker'))}>Aggiungi marker</button><button onClick={()=>run(()=>marker('chapter'))}>Aggiungi capitolo</button><button onClick={()=>run(prepare)}>Prepara segmento per l’Aula</button></div></section>}
 {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}</aside></div></>
}
function EpochObserver({epoch,onEpoch}:{epoch:number|null;onEpoch:(epoch:number)=>void}){useEffect(()=>{if(epoch!==null)onEpoch(epoch)},[epoch,onEpoch]);return null}
createRoot(document.getElementById('root')!).render(<App/> )
