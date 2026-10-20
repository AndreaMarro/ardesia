// @vitest-environment jsdom
import {afterEach,beforeEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {SubmissionPanel} from '../SubmissionPanel'
import { webcrypto } from 'node:crypto'
import { Buffer } from 'node:buffer'
const memory=new Map<string,string>()
beforeEach(()=>{memory.clear();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key)}})})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
const me={id:'student-01',role:'student' as const,synthetic:true as const}
const source={resourceId:'resource-1',revisionId:'rev-1',contextId:'context-1'}

test('lost commit response followed by remount retries exact persisted payload and key',async()=>{
 const requests:{key:string;body:unknown}[]=[]
 const fetcher=vi.fn(async(_url:string,options:RequestInit)=>{requests.push({key:new Headers(options.headers).get('Idempotency-Key')!,body:JSON.parse(options.body as string)});if(requests.length===1)throw new Error('response lost after commit');return new Response(JSON.stringify({receiptId:'receipt-same',revision:1}),{status:200})})
 vi.stubGlobal('fetch',fetcher)
 const first=render(<SubmissionPanel me={me} source={source} parentId={null} onUpdate={async()=>{}}/>)
 fireEvent.change(screen.getByRole('textbox',{name:'La tua spiegazione'}),{target:{value:'A fixed pressure Q scales with radius to the fourth'}})
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}))
 await screen.findByText(/non ancora confermato/)
 first.unmount()
 render(<SubmissionPanel me={me} source={null} parentId={null} onUpdate={async()=>{}}/>)
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}))
 await waitFor(()=>expect(requests).toHaveLength(2))
 expect(requests[1]).toEqual(requests[0])
 await screen.findByText(/Consegnato · ricevuta receipt-same/)
})

test('partial upload retains acknowledged originals and remount retries the lost file with the same key',async()=>{
 vi.stubGlobal('crypto',webcrypto)
 const requests:{key:string;body:unknown}[]=[]
 vi.stubGlobal('fetch',vi.fn(async(_url:string,options:RequestInit)=>{
  requests.push({key:new Headers(options.headers).get('Idempotency-Key')!,body:options.body})
  if(requests.length===2)throw new Error('lost response')
  return new Response(JSON.stringify({id:requests.length===1?'asset-a':'asset-b'}),{status:200})
 }))
 function file(name:string,bytes:number[]){
  const value=new File([new Uint8Array(bytes)],name,{type:'image/png'})
  // jsdom File lacks Blob.arrayBuffer; use the same real bytes for WebCrypto.
  Object.defineProperty(value,'arrayBuffer',{value:async()=>{const out=Buffer.alloc(bytes.length);out.set(bytes);return out.buffer}})
  return value
 }
 const first=render(<SubmissionPanel me={me} source={null} parentId={null} onUpdate={async()=>{}}/>)
 fireEvent.change(screen.getByLabelText('Aggiungi originale privato'),{target:{files:[file('a.png',[1,2]),file('b.png',[3,4])]}})
 await screen.findByText(/Gli originali già confermati sono conservati/)
 expect(screen.getByText(/1 allegati privati/)).toBeTruthy()
 first.unmount()
 render(<SubmissionPanel me={me} source={null} parentId={null} onUpdate={async()=>{}}/>)
 fireEvent.change(screen.getByLabelText('Aggiungi originale privato'),{target:{files:[file('b.png',[3,4])]}})
 await screen.findByText(/Originale caricato in privato/)
 expect(screen.getByText(/2 allegati privati/)).toBeTruthy()
 expect(requests[2].key).toBe(requests[1].key)
 expect(requests[0].key).not.toBe(requests[1].key)
})

test('a failed list refresh cannot turn an acknowledged receipt into an unconfirmed delivery',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({receiptId:'receipt-confirmed',revision:1}),{status:200})))
 render(<SubmissionPanel me={me} source={null} parentId={null} onUpdate={async()=>{throw new Error('refresh offline')}}/>)
 fireEvent.change(screen.getByRole('textbox',{name:'La tua spiegazione'}),{target:{value:'La procedura'}})
 fireEvent.click(screen.getByRole('button',{name:'Consegna'}))
 await screen.findByText(/receipt-confirmed/)
 expect(screen.queryByText(/non ancora confermato/)).toBeNull()
 expect(screen.getByRole('textbox',{name:'La tua spiegazione'})).toHaveProperty('value','')
})
