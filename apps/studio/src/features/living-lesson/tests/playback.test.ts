import { it, expect } from 'vitest'
import { createPlaybackLease } from '../playbackLease'
import type { LessonAccess, LessonMoment } from '../model'
it('invalidates pending selection on logout and ignores late authorization',async()=>{
 let allowed=true;let changed=()=>{};let finish!:(v:boolean)=>void
 const access:LessonAccess={allowed:()=>allowed,subscribe:fn=>{changed=fn;return ()=>{changed=()=>{}}},authorize:()=>new Promise(r=>{finish=r})}
 let stopped=0
 const lease=createPlaybackLease(access,()=>{stopped++})
 const request=lease.authorize({} as LessonMoment)
 allowed=false;changed();finish(true)
 expect(await request).toBe(false);expect(stopped).toBe(1)
 lease.dispose();expect(stopped).toBe(2)
})
it('only the newest pending selection can play',async()=>{
 const resolves:Array<(v:boolean)=>void>=[]
 const access:LessonAccess={allowed:()=>true,subscribe:()=>()=>{},authorize:()=>new Promise(r=>resolves.push(r))}
 const lease=createPlaybackLease(access,()=>{})
 const a=lease.authorize({} as LessonMoment);const b=lease.authorize({} as LessonMoment)
 resolves[1]!(true);expect(await b).toBe(true);resolves[0]!(true);expect(await a).toBe(false);lease.dispose()
})
