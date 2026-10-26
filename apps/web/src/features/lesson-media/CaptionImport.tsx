import {useEffect,useRef,useState} from 'react';
import {CAPTION_BYTES,importCaptions,type CaptionDestination,type CaptionFormat} from './captions';
import type {MediaIndex} from './model';

type Preview={base:MediaIndex;index:MediaIndex;count:number};
const licenseUrl=new URL('./media-captions.LICENSE.txt',import.meta.url).href;
function readFile(file:File):Promise<ArrayBuffer>{
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>reader.result instanceof ArrayBuffer?resolve(reader.result):reject(new Error('File non leggibile.'));
    reader.onerror=()=>reject(new Error('File non leggibile. Riprova oppure incolla il testo.'));
    reader.onabort=()=>reject(new Error('Lettura annullata.'));
    reader.readAsArrayBuffer(file);
  });
}
export function CaptionImport({draft,disabled,onApply}:{draft:MediaIndex;disabled:boolean;onApply:(next:MediaIndex)=>void}){
  const [text,setText]=useState(''),[format,setFormat]=useState<CaptionFormat>('vtt'),[destination,setDestination]=useState<CaptionDestination>('transcript');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[preview,setPreview]=useState<Preview|null>(null);
  const generation=useRef(0);
  useEffect(()=>{generation.current++;setPreview(null);setBusy(false);},[draft,disabled]);
  useEffect(()=>()=>{generation.current++;},[]);
  function invalidate(){generation.current++;setPreview(null);setError('');setNotice('');setBusy(false);}
  async function load(file:File){
    invalidate();setText('');
    const extension=file.name.split('.').at(-1)?.toLowerCase();
    if(extension!=='vtt'&&extension!=='srt'){setError('Scegli un file .vtt o .srt in UTF-8, oppure incolla il testo.');return;}
    if(file.size>CAPTION_BYTES){setError('Il file supera 64 KiB. Dividilo in passaggi più brevi.');return;}
    setFormat(extension);setBusy(true);const turn=generation.current;
    try{
      const bytes=await readFile(file);
      const value=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      if(turn===generation.current){setText(value);setNotice(`File letto: ${file.name}. Analizza i sottotitoli per controllare l’anteprima.`);}
    }catch{if(turn===generation.current)setError('Il file non è leggibile come testo UTF-8. Esportalo in UTF-8 e riprova.');}
    finally{if(turn===generation.current)setBusy(false);}
  }
  async function analyze(){
    if(disabled||busy)return;
    invalidate();setBusy(true);const turn=generation.current;
    try{
      const result=await importCaptions(text,format,draft,destination);
      if(turn===generation.current)setPreview({base:draft,...result});
    }catch(e){if(turn===generation.current)setError(e instanceof Error?e.message:'Sottotitoli non leggibili. La bozza non è cambiata.');}
    finally{if(turn===generation.current)setBusy(false);}
  }
  const current=preview?.base===draft&&!disabled?preview:null;
  return <details className="lm-import">
    <summary>Importa sottotitoli o capitoli</summary>
    <p>Apri un file WebVTT o SRT, oppure incolla il testo. I tempi sono relativi all’inizio di questa registrazione. Controlla l’anteprima prima di sostituire la trascrizione o i capitoli.</p>
    <p className="fine-print">Massimo 64 KiB, 100 frammenti o 50 capitoli. Testo semplice e nomi dei parlanti vengono conservati; stili, posizione e commenti del file non entrano nell’indice. Salvando l’indice, condividi il testo con il gruppo.</p>
    <p className="fine-print">Parser media-captions · <a href={licenseUrl} download="media-captions-LICENSE.txt">Licenza MIT (.txt)</a></p>
    <label>File dei sottotitoli<input type="file" accept=".vtt,.srt" disabled={disabled||busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void load(file);}}/></label>
    <div className="lm-time-fields">
      <label>Formato dei sottotitoli<select value={format} disabled={disabled||busy} onChange={e=>{invalidate();setFormat(e.target.value as CaptionFormat);}}><option value="vtt">WebVTT (.vtt)</option><option value="srt">SubRip (.srt)</option></select></label>
      <label>Importa come<select value={destination} disabled={disabled||busy} onChange={e=>{invalidate();setDestination(e.target.value as CaptionDestination);}}><option value="transcript">Trascrizione</option><option value="chapters">Capitoli</option></select></label>
    </div>
    <label>Testo dei sottotitoli<textarea rows={6} value={text} disabled={disabled||busy} onChange={e=>{invalidate();setText(e.target.value);}} placeholder={'WEBVTT\n\n00:00.000 --> 00:02.500\nLa spiegazione del passaggio.'}/></label>
    <div className="lm-import-actions"><button type="button" disabled={disabled||busy||!text.trim()} onClick={()=>void analyze()}>{busy?'Lettura dei sottotitoli…':'Analizza i sottotitoli'}</button>
      {(busy||current)&&<button type="button" disabled={disabled} onClick={invalidate}>Annulla anteprima</button>}</div>
    {current&&<section className="lm-import-preview" aria-label="Anteprima importazione">
      <h5>{current.count} {destination==='chapters'?'capitoli':'frammenti'} da importare</h5>
      <ol>{(destination==='chapters'?current.index.chapters.map(c=>({id:c.id,time:`${(c.atMs/1000).toFixed(3)} s`,text:c.title})):current.index.cues.map(c=>({id:c.id,time:`${(c.startMs/1000).toFixed(3)}–${(c.endMs/1000).toFixed(3)} s`,text:c.text}))).map(c=><li key={c.id}><span>{c.time}</span><p>{c.text}</p></li>)}</ol>
      <button type="button" onClick={()=>{onApply(current.index);setPreview(null);setNotice('Bozza aggiornata. Usa «Salva indice e trascrizione» per conservarla nel Core.');}}>{destination==='chapters'?'Sostituisci i capitoli nella bozza':'Sostituisci la trascrizione nella bozza'}</button>
    </section>}
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </details>;
}
