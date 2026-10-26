// @vitest-environment jsdom
import { it,expect,vi } from 'vitest'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { serializeAsJSON,convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { preserveEditorial } from '../serialization'
vi.hoisted(()=>{HTMLCanvasElement.prototype.getContext=(()=>({filter:''})) as never})
it('composes the exact S07 legacyBoardScene filter with editorial preservation without copying private projections',()=>{
 const source=readFileSync('src/features/living-lesson/evidence/s07-sceneBoundary.ts.txt','utf8')
 const compiled=ts.transpileModule(source.replaceAll('export ',''),{compilerOptions:{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.None}}).outputText
 const filter=new Function(compiled+'\nreturn legacyBoardScene')() as (elements:readonly {id:string;type:string;customData?:Record<string,unknown>}[])=>{id:string;type:string}[]
 const publicElement=convertToExcalidrawElements([{id:'force',type:'rectangle',x:0,y:0,width:100,height:100}],{regenerateIds:false})[0]!
 const projection={...publicElement,id:'private-projection',customData:{ardesiaInkV1:{owner:'private-owner',audience:'personal'}}}
 const filtered=filter([publicElement,projection])
 const previous={elements:[publicElement,projection],privateInk:'private-owner',files:{privateFile:'private bytes'},livingLesson:{v:1,lessonId:'s07-proof',moments:[]}}
 const serialized=preserveEditorial(serializeAsJSON(filtered as never,{} as never,{},'local'),previous,'s07-proof')
 expect(JSON.parse(serialized).livingLesson).toEqual(previous.livingLesson)
 for(const secret of ['private-owner','private-projection','private bytes','ardesiaInkV1'])expect(serialized).not.toContain(secret)
 expect(JSON.parse(serialized).elements.map((e:{id:string})=>e.id)).toEqual(['force'])
})
