import type {VTTNode} from './vendor/media-captions/server.js';
import {parseIndex,type MediaIndex} from './model';

export type CaptionFormat='vtt'|'srt';
export type CaptionDestination='transcript'|'chapters';
export const CAPTION_BYTES=65536;

/** SRT frequently contains unescaped comparisons. Only caption markup may be
 * consumed by the VTT tokenizer; preserve every other '<' as literal text. */
function preserveLiteralAngles(text:string,format:CaptionFormat):string{
  return text.replace(/<[^<>]*>|</g,part=>{
    const known=format==='srt'?/^<\/?(?:b|i|u|font)(?:\s+[^<>]*|\s*)>$/i.test(part):
      /^<\/?(?:b|i|u|c|ruby|rt)(?:\.[^\s<>/]+)*\s*>$/.test(part)||
      /^<(?:v|lang)(?:\.[^\s<>/]+)*(?:[\t ]+[^<>]+)?>$/.test(part)||/^<\/(?:v|lang)>$/.test(part)||
      /^<(?:\d{2,}:)?\d{2}:\d{2}\.\d{3}>$/.test(part);
    if(!known)return part.replace(/</g,'&lt;');
    return format==='srt'?part.replace(/^<(\/?)([A-Za-z]+)/,(_,slash:string,tag:string)=>`<${slash}${tag.toLowerCase()}`):part;
  });
}

/** Preserve text and voice labels without creating HTML, styles or external resources. */
function plainText(nodes:VTTNode[]):string{
  const pending=[...nodes].reverse(),parts:string[]=[];
  while(pending.length){
    const node=pending.pop()!;
    if(node.type==='text')parts.push(node.data);
    else{
      if(node.type==='v'&&node.voice)parts.push(`${node.voice}: `);
      for(let i=node.children.length-1;i>=0;i--)pending.push(node.children[i]);
    }
  }
  return parts.join('').trim();
}

/** The donor deliberately ignores unknown blocks even in strict mode. Account for
 * every block before parsing so a partly damaged file cannot become a partial import.
 * Timestamp syntax/values and cue tokenization remain the donor's responsibility. */
function cueBlockCount(text:string,format:CaptionFormat):number{
  const blocks=text.trimEnd().split(/\n[\t ]*\n+/);
  if(format==='vtt'){
    const header=blocks.shift()??'';
    if(!/^WEBVTT(?:[\t ].*)?(?:\n|$)/.test(header)||header.includes('-->'))throw new Error('Il file WebVTT deve iniziare con WEBVTT, seguito da una riga vuota.');
  }
  let count=0;
  for(const block of blocks){
    if(!block.trim())continue;
    if(format==='vtt'&&/^(NOTE(?:[\t ]|\n|$)|STYLE(?:\n|$)|REGION(?:\n|$))/.test(block))continue;
    const lines=block.split('\n'),at=lines[0].includes('-->')?0:1;
    if(!lines[at]?.includes('-->')||!lines.slice(at+1).join('\n').trim()||
      (format==='srt'&&at===1&&!/^\d+$/.test(lines[0])))throw new Error('Un blocco non contiene tempi e testo validi. Nessun frammento è stato importato.');
    count++;
  }
  return count;
}

/** Atomic projection into the existing Core index; no writes and no timeline repair. */
export async function importCaptions(raw:string,format:CaptionFormat,base:MediaIndex,destination:CaptionDestination):Promise<{index:MediaIndex;count:number}>{
  if(new TextEncoder().encode(raw).length>CAPTION_BYTES)throw new Error('Il file supera 64 KiB. Dividilo in passaggi più brevi.');
  if(raw.includes('\u0000'))throw new Error('Il file contiene caratteri non validi. Usa un file di testo UTF-8.');
  const text=raw.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const count=cueBlockCount(text,format),limit=destination==='chapters'?50:100;
  if(!count||count>limit)throw new Error(`Occorrono da 1 a ${limit} frammenti. Nessun frammento è stato importato.`);
  const {parseText,tokenizeVTTCue}=await import('./vendor/media-captions/server.js');
  let parsed;
  try{parsed=await parseText(text,{type:format,strict:true,errors:true});}
  catch{throw new Error('Tempi o formato dei sottotitoli non validi. Correggi il file e riprova.');}
  if(parsed.errors.length||parsed.cues.length!==count)throw new Error('Il file non è stato letto integralmente. Nessun frammento è stato importato.');
  let previousEnd=0;
  const cues=parsed.cues.map((cue,i)=>{
    const startMs=Math.round(cue.startTime*1000),endMs=Math.round(cue.endTime*1000);
    if(!Number.isSafeInteger(startMs)||!Number.isSafeInteger(endMs)||startMs<previousEnd||endMs<=startMs||endMs>base.durationMs)throw new Error('I tempi devono essere ordinati, senza sovrapposizioni e dentro questa registrazione. I tempi non vengono spostati.');
    previousEnd=endMs;
    cue.text=preserveLiteralAngles(cue.text,format);
    return {id:`caption-${i+1}`,startMs,endMs,text:plainText(tokenizeVTTCue(cue))};
  });
  const candidate:MediaIndex=destination==='chapters'?{...base,chapters:cues.map(c=>({id:c.id,atMs:c.startMs,title:c.text.replace(/\s*\n\s*/g,' ')}))}:{...base,cues};
  const index=parseIndex(JSON.stringify(candidate));
  if(!index)throw new Error(destination==='chapters'?'I titoli devono contenere da 1 a 160 caratteri e l’indice deve rientrare nei limiti del Core.':'Testi vuoti, troppo lunghi o indice oltre i limiti del Core. Dividi il file in passaggi più brevi.');
  return {index,count};
}
