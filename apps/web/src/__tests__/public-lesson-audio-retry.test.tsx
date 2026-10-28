// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {PublicLessonDemo} from '../components/PublicLessonDemo';
const lesson={audioPath:'courses/audio/fluidi-termodinamica.wav',transcript:'Trascrizione originale conservata e leggibile.',authorship:'Voce sintetica originale'};
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('resets a failed native media source before retrying play after reconnect',async()=>{
 let mediaError:MediaError|null=null;
 const sequence:string[]=[];
 const load=vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{sequence.push('load');mediaError=null;});
 const play=vi.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(async()=>{sequence.push('play');if(play.mock.calls.length===1){mediaError={code:4,message:'Offline'} as MediaError;throw new Error('Offline');}if(mediaError)throw new Error('Failed source still selected');});
 const {container}=render(<PublicLessonDemo lesson={lesson} onShowFormula={()=>{}}/>);
 const audio=container.querySelector('audio')!;
 Object.defineProperty(audio,'error',{get:()=>mediaError});Object.defineProperty(audio,'networkState',{get:()=>mediaError?3:0});
 const originalSrc=audio.getAttribute('src');
 expect(play).not.toHaveBeenCalled();expect(load).not.toHaveBeenCalled();expect(audio.preload).toBe('none');expect(audio.autoplay).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Ascolta il passaggio'}));
 await screen.findByRole('alert');expect(screen.getByText(lesson.transcript)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Ascolta il passaggio'}));
 await screen.findByRole('button',{name:'Ascolta il passaggio'});
 expect(sequence).toEqual(['play','load','play']);expect(screen.queryByRole('alert')).toBeNull();expect(audio.getAttribute('src')).toBe(originalSrc);expect(screen.getByText(lesson.transcript)).toBeTruthy();
});
it('keeps an unsuccessful retry understandable on hosted media and leaves transcript readable',async()=>{
 vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
 vi.spyOn(HTMLMediaElement.prototype,'play').mockRejectedValue(new Error('Unavailable'));
 const {container}=render(<PublicLessonDemo lesson={lesson} onShowFormula={()=>{}}/>);
 Object.defineProperty(container.querySelector('audio')!,'error',{get:()=>({code:4})});
 fireEvent.click(screen.getByRole('button',{name:'Ascolta il passaggio'}));
 const alert=await screen.findByRole('alert');expect(alert.textContent).toContain('trascrizione');expect(alert.textContent).not.toContain('locale');expect(screen.getByText(lesson.transcript)).toBeTruthy();
});
it('does not reset healthy playback and pauses native media on unmount',async()=>{
 const load=vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{}),play=vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(),pause=vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
 const mounted=render(<PublicLessonDemo lesson={lesson} onShowFormula={()=>{}}/>),audio=mounted.container.querySelector('audio')!;
 fireEvent.click(screen.getByRole('button',{name:'Ascolta il passaggio'}));await screen.findByRole('button',{name:'Ascolta il passaggio'});expect(play).toHaveBeenCalledOnce();expect(load).not.toHaveBeenCalled();
 Object.defineProperty(audio,'paused',{get:()=>false});fireEvent.play(audio);expect(screen.getByRole('button',{name:'Pausa audio'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Pausa audio'}));expect(pause).toHaveBeenCalledOnce();mounted.unmount();expect(pause).toHaveBeenCalledTimes(2);
});
