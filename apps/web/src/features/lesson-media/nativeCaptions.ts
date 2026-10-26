import {toVtt,type MediaIndex} from './model';

/** Own one removable native text track. The browser handles seek/pause/end cue timing;
 * renderers receive only IDs into the validated plain-text Core document. */
export function attachCaptionTrack(audio:HTMLAudioElement,index:MediaIndex,onActive:(ids:string[])=>void,onError:()=>void):()=>void{
  const element=document.createElement('track');
  if(!element.track||typeof URL.createObjectURL!=='function')throw new Error('text_track_unavailable');
  const url=URL.createObjectURL(new Blob([toVtt(index)],{type:'text/vtt'}));
  let alive=true,valid=true;
  element.kind='subtitles';element.srclang='it';element.label='Trascrizione del passaggio';element.src=url;
  const update=()=>{
    if(!alive||!valid)return;
    const cues=Array.from(element.track.activeCues??[]);
    onActive(cues.flatMap(c=>/^[1-9]\d*$/.test(c.id)&&index.cues[Number(c.id)-1]?[index.cues[Number(c.id)-1].id]:[]));
  };
  const failed=()=>{if(alive&&valid){valid=false;clearTimeout(timeout);element.track.mode='disabled';onActive([]);onError();}};
  const loaded=()=>{if(alive&&valid){clearTimeout(timeout);element.track.mode='hidden';update();}};
  const timeout=setTimeout(failed,5000);
  element.addEventListener('load',loaded);element.addEventListener('error',failed);
  element.track.addEventListener('cuechange',update);
  audio.addEventListener('seeked',update);audio.addEventListener('ended',update);
  audio.append(element);element.track.mode='hidden';
  return()=>{
    alive=false;clearTimeout(timeout);element.track.mode='disabled';
    element.removeEventListener('load',loaded);element.removeEventListener('error',failed);
    element.track.removeEventListener('cuechange',update);
    audio.removeEventListener('seeked',update);audio.removeEventListener('ended',update);
    element.remove();URL.revokeObjectURL(url);
  };
}
