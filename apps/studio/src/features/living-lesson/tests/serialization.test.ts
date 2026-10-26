// @vitest-environment jsdom
import { it,expect,vi } from 'vitest'
import { serializeAsJSON,convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { WorkspaceStore } from '../../../store/WorkspaceStore'
import { attachEditorial,parseEditorial } from '../model'
import { preserveEditorial } from '../serialization'
vi.hoisted(()=>{HTMLCanvasElement.prototype.getContext=(()=>({filter:''})) as never})
const lessonId='s17-roundtrip'
const editorial={v:1 as const,lessonId,moments:[]}
it('preserves editorial data through actual serializer and canonical .lesson import in a cold store',async()=>{
 const elements=convertToExcalidrawElements([{id:'a',type:'rectangle',x:0,y:0,width:100,height:100}],{regenerateIds:false})
 const source=attachEditorial({elements,files:{},privateInk:{secret:'must not be copied'}},editorial)
 const legacy=serializeAsJSON(elements,{} as never,{},'local')
 expect(JSON.parse(legacy).livingLesson).toBeUndefined() // Actual old writer drops extension.
 const saved=preserveEditorial(legacy,source,lessonId)
 expect(JSON.parse(saved).privateInk).toBeUndefined()
 expect(parseEditorial(JSON.parse(saved),lessonId)).toEqual(editorial)
 const a=new WorkspaceStore();await a.init();await a.saveScene(lessonId,saved);await a.write(`raw/${lessonId}/events.jsonl`,new Blob(['']))
 const exported=await a.exportLesson(lessonId)
 localStorage.clear()
 const b=new WorkspaceStore();await b.init();const result=await b.importLessonBlobForRoom(exported,lessonId)
 expect(result.identity).toMatchObject({lessonId})
 expect(parseEditorial(JSON.parse((await b.loadScene(lessonId))!),lessonId)).toEqual(editorial)
})
it('does not silently replace a malformed or foreign extension',()=>{
 expect(()=>preserveEditorial('{}',{livingLesson:{v:9}},lessonId)).toThrow()
 expect(()=>preserveEditorial('{}',{livingLesson:{...editorial,lessonId:'other'}},lessonId)).toThrow()
})
