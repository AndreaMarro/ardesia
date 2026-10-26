import {useEffect,useMemo,useRef,useState,type RefObject} from 'react';
import {describeError} from '../../api';
import {subscribeStudySessionEnd} from '../../../../studio/src/study/sessionBoundary';
import {clock} from './model';
import {attachCaptionTrack} from './nativeCaptions';
import {parseCaptionReference,readCaptionDocument,type CaptionDocument,type PlaybackIdentity} from './playback';
import './replay-captions.css';

type Loaded={key:string;document:CaptionDocument};
export function ReplayCaptions({audioRef,seekRevision,identity,search,onSeek}:{audioRef:RefObject<HTMLAudioElement|null>;seekRevision:RefObject<number>;identity:PlaybackIdentity|null;search:string;onSeek:(epoch:number)=>void}){
  const reference=useMemo(()=>parseCaptionReference(search),[search]);
  const key=JSON.stringify([reference,identity]);
  const [loaded,setLoaded]=useState<Loaded|null>(null),[failure,setFailure]=useState<{key:string;text:string}|null>(null),[retry,setRetry]=useState(0);
  const [native,setNative]=useState<{key:string;ids:string[];failed:boolean}|null>(null),[seeking,setSeeking]=useState(false);
  const [seekNotice,setSeekNotice]=useState('');
  const readRef=useRef<(()=>Promise<CaptionDocument|null>)|null>(null),seekKey=useRef<string|null>(null);
  const currentKey=useRef(key);currentKey.current=key;
  const current=loaded?.key===key?loaded.document:null;
  const error=failure?.key===key?failure.text:'';
  const active=native?.key===key&&!native.failed?native.ids:[];
  useEffect(()=>{
    readRef.current=null;seekKey.current=null;setSeeking(false);setSeekNotice('');setLoaded(null);setFailure(null);
    if(!reference||!identity)return;
    let alive=true,sequence=0,pending:AbortController|null=null;
    const clear=()=>{sequence++;pending?.abort();seekKey.current=null;setSeeking(false);setLoaded(null);};
    async function read(clearFirst=false):Promise<CaptionDocument|null>{
      const turn=++sequence;pending?.abort();const controller=new AbortController();pending=controller;
      const timeout=setTimeout(()=>controller.abort(),5000);
      if(clearFirst)setLoaded(null);setFailure(null);
      try{
        const document=await readCaptionDocument(reference!,identity!,controller.signal);
        if(!alive||turn!==sequence)return null;
        setLoaded(previous=>previous?.key===key&&JSON.stringify(previous.document)===JSON.stringify(document)?previous:{key,document});
        return document;
      }catch(e){
        if(alive&&turn===sequence){setLoaded(null);setFailure({key,text:describeError(e,'Trascrizione non disponibile. La fonte, la connessione o i permessi possono essere cambiati.')});}
        return null;
      }finally{clearTimeout(timeout);}
    }
    readRef.current=()=>read();void read(true);
    const timer=setInterval(()=>{if(document.visibilityState!=='hidden'&&seekKey.current!==key)void read();},15000);
    const visibility=()=>{if(document.visibilityState==='hidden')clear();else void read(true);};
    const focus=()=>{if(document.visibilityState!=='hidden')void read(true);};
    const unsubscribe=subscribeStudySessionEnd(()=>{clear();setFailure({key,text:'La sessione è terminata. Riapri i Materiali dopo l’accesso.'});});
    document.addEventListener('visibilitychange',visibility);window.addEventListener('focus',focus);
    return()=>{alive=false;sequence++;pending?.abort();seekKey.current=null;clearInterval(timer);unsubscribe();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('focus',focus);readRef.current=null;};
  },[key,retry]);
  useEffect(()=>{
    setNative(null);const audio=audioRef.current;
    if(!current||!audio)return;
    try{return attachCaptionTrack(audio,current.index,ids=>setNative(previous=>previous?.key===key&&!previous.failed&&previous.ids.join('\0')===ids.join('\0')?previous:{key,ids,failed:false}),()=>setNative({key,ids:[],failed:true}));}
    catch{setNative({key,ids:[],failed:true});}
  },[current,audioRef,key]);
  async function seek(atMs:number){
    const read=readRef.current;
    if(!read||!identity||seekKey.current===key)return;
    const revision=seekRevision.current;
    seekKey.current=key;setSeeking(true);setSeekNotice('');
    try{
      const fresh=await read();
      if(fresh&&seekKey.current===key&&currentKey.current===key){
        if(seekRevision.current!==revision)setSeekNotice('La posizione è cambiata durante la verifica. Il salto precedente è stato annullato.');
        else if(Number.isSafeInteger(atMs)&&atMs>=0&&atMs<fresh.index.durationMs)onSeek(identity.startEpoch+atMs);
      }
    }finally{if(seekKey.current===key){seekKey.current=null;setSeeking(false);}}
  }
  if(reference===undefined)return null;
  return <section className="replay-captions" aria-label="Trascrizione sincronizzata">
    <header><h2>Le parole del passaggio</h2><span>Trascrizione manuale</span></header>
    {reference===null?<p role="alert">Il riferimento ai sottotitoli non è valido. Riapri il passaggio dai Materiali.</p>:!identity?<p>Seleziona la registrazione collegata per consultarne la trascrizione.</p>:error?<><p role="alert">{error}</p><button type="button" onClick={()=>setRetry(v=>v+1)}>Ricontrolla la fonte</button></>:!current?<p role="status">Verifico la revisione della trascrizione…</p>:<>
      <div className="rc-current" aria-live="off" aria-label="Frammento corrente">
        {active.length?current.index.cues.filter(c=>active.includes(c.id)).map(c=><p key={c.id}>{c.text}</p>):<p className="rc-hint">{native?.key===key&&native.failed?'Sottotitoli sincronizzati non disponibili in questo browser. Puoi consultare i frammenti qui sotto.':'Avvia o sposta l’audio per seguire il frammento corrente.'}</p>}
      </div>
      {seekNotice&&<p role="status">{seekNotice}</p>}
      <details className="rc-fragments"><summary>Trascrizione e capitoli · {current.index.cues.length} frammenti</summary>
        <div className="rc-scroll">
          {current.index.chapters.length>0&&<nav aria-label="Capitoli del passaggio">{current.index.chapters.map(c=><button type="button" key={c.id} disabled={seeking} onClick={()=>void seek(c.atMs)}>{clock(c.atMs)} · {c.title}</button>)}</nav>}
          <ol>{current.index.cues.map((c,i)=><li key={c.id} aria-current={active.includes(c.id)?'true':undefined}><button type="button" disabled={seeking} aria-label={`Apri frammento ${i+1} a ${clock(c.startMs)}`} onClick={()=>void seek(c.startMs)}>{clock(c.startMs)}–{clock(c.endMs)}</button><p>{c.text}</p></li>)}</ol>
        </div>
      </details>
      <details className="rc-source"><summary>Fonte e revisione</summary><p>{current.index.title}</p><p>Fonte {current.index.source.id} · {current.sourceRevision}</p><p>Indice {current.indexRevision??'trascrizione originale'}</p><p>Le correzioni si effettuano dalla scheda Materiali. Questa vista non salva una copia offline.</p></details>
    </>}
  </section>;
}
