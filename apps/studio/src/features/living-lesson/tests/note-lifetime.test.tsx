// @vitest-environment jsdom
import { it,expect,vi } from 'vitest'
import { render,fireEvent,waitFor,cleanup,act } from '@testing-library/react'
import LivingLessonReplay from '../LivingLessonReplay'
import type { LessonMoment,PrivateNotes } from '../model'
import type { WorkspaceStore } from '../../../store/WorkspaceStore'
import type { ReplayCursor } from '../replayCursor'
const a:LessonMoment={id:'a',title:'A',kind:'marker',lessonId:'notes',sessionId:'11111111-1111-4111-8111-111111111111',recordingId:'22222222-2222-4222-8222-222222222222',sha256:'a'.repeat(64),epoch:1000,objectRefs:[{elementId:'x',version:1,label:'x'}]}
const cursor:ReplayCursor={media:null,recording:null,timeline:{events:[],recordings:[],audioChunks:[],firstEventTime:null,lastEventTime:null},epoch:null,seekEpoch:()=>{}}
const access={allowed:()=>true,subscribe:()=>()=>{},authorize:async()=>true}
it('waits for note load and ignores a save rejection from the previous context',async()=>{
 let load!:(value:string)=>void,rejectSave!:(cause:Error)=>void
 const notes:PrivateNotes={read:()=>new Promise(r=>{load=r}),write:()=>new Promise((_r,j)=>{rejectSave=j})}
 const failed=vi.fn()
 const props={store:{} as WorkspaceStore,lessonId:'notes',moment:a,editorial:{v:1 as const,lessonId:'notes',moments:[a]},access,cursor,notes,onUnavailable:failed}
 const view=render(<LivingLessonReplay {...props}/>)
 expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).disabled).toBe(true)
 load('existing note');await waitFor(()=>expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).disabled).toBe(false))
 fireEvent.change(view.getByLabelText('Nota privata'),{target:{value:'draft A'}});fireEvent.click(view.getByText('Salva nota privata'))
 await waitFor(()=>expect(rejectSave).toBeTypeOf('function'))
 view.rerender(<LivingLessonReplay {...props} moment={{...a,id:'b',title:'B'}}/>)
 load('note B');await waitFor(()=>expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).value).toBe('note B'))
 rejectSave(Error('late A failure'));await Promise.resolve()
 expect(failed).not.toHaveBeenCalled();expect(view.queryByText('late A failure')).toBeNull();expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).value).toBe('note B')
 cleanup()
})

it('clears private text when access is invalidated before a media element exists',async()=>{
 let allowed=true;const listeners=new Set<()=>void>()
 const scopedAccess={allowed:()=>allowed,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}},authorize:async()=>allowed}
 const view=render(<LivingLessonReplay store={{} as WorkspaceStore} lessonId='notes' moment={a} editorial={{v:1,lessonId:'notes',moments:[a]}} access={scopedAccess} cursor={cursor} notes={{read:async()=> 'private A',write:async()=>{}}} onUnavailable={()=>{}}/>)
 await waitFor(()=>expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).value).toBe('private A'))
 act(()=>{allowed=false;for(const fn of listeners)fn()})
 expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).value).toBe('')
 expect((view.getByLabelText('Nota privata') as HTMLTextAreaElement).disabled).toBe(true)
 cleanup()
})
