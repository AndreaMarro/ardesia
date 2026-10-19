// @vitest-environment jsdom
import {afterEach,beforeEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {SubmissionPanel} from '../SubmissionPanel'
const memory=new Map<string,string>()
beforeEach(()=>{memory.clear();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key)}})})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
const me={id:'student-01',role:'student' as const,synthetic:true as const}
const source={resourceId:'resource-1',revisionId:'rev-1',contextId:'context-1'}

test('lost commit response followed by remount retries exact persisted payload and key',async()=>{
 const requests:{key:string;body:unknown}[]=[]
 const fetcher=vi.fn(async(_url:string,options:RequestInit)=>{requests.push({key:(options.headers as Record<string,string>)['Idempotency-Key'],body:JSON.parse(options.body as string)});if(requests.length===1)throw new Error('response lost after commit');return new Response(JSON.stringify({receiptId:'receipt-same',revision:1}),{status:200})})
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
