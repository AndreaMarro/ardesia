// @vitest-environment jsdom
import {afterEach, expect, test, vi} from 'vitest';
import {act, cleanup, configure, fireEvent, render, screen, within} from '@testing-library/react';
import {StrictMode} from 'react';
import {MemoryView} from './MemoryView';
import App from '../../App';

const me = {id:'student-memory', role:'student' as const, synthetic:true as const};
const reference = {resourceId:'source-one', revisionId:'original-revision'};
const first = {id:'one',version:1,title:'Lezione uno',text:'Il vincolo è la pressione.',classification:'hypothesis',
  sourceState:'HISTORICAL',concepts:['portata'],sourceRefs:[{...reference,quote:'Passaggio originale',start:0,end:19}],links:[]};
const second = {...first,id:'two',title:'Lezione due',text:'Non ho capito il confronto.',classification:'not_understood',links:['one']};
const packet = {notes:[first,second],nodes:[
  {id:'one',kind:'note',label:'Lezione uno'},{id:'two',kind:'note',label:'Lezione due'},
  {id:'source',kind:'source',label:'Fonte originale',reference}],edges:[
  {source:'two',target:'one',relation:'links_to'},{source:'one',target:'source',relation:'cites'}],limits:[]};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status});
configure({asyncUtilTimeout:10000});
afterEach(()=>{cleanup();vi.unstubAllGlobals();history.replaceState(null,'','/');});

test('second lesson opens the first and its exact historical source',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json(packet);
  if(path==='/study/memory/notes/two')return json({...second,backlinks:[]});
  if(path==='/study/memory/notes/one')return json({...first,backlinks:['two']});
  if(path==='/study/resources/source-one/revisions/original-revision')return json({
   id:'source-one',revisionId:'original-revision',contextId:'context',ownerId:me.id,editionId:'fluidi',
   kind:'notes',visibility:'private',text:'Passaggio originale',sha256:'a'.repeat(64)});
  throw Error(path);
 }));
 render(<MemoryView me={me}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Apri Lezione due'}));
 fireEvent.click(await screen.findByRole('button',{name:'Segui collegamento: Lezione uno'}));
 expect(await screen.findByRole('heading',{name:'Lezione uno',level:2})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Apri la fonte originale 1'}));
 expect(await screen.findByText('Passaggio originale',{selector:'.original-text'})).toBeTruthy();
 expect(screen.getByText(/original-revision/)).toBeTruthy();
});

test('saving not understood returns a persisted note to the visible list',async()=>{
 let saved=false;
 vi.stubGlobal('fetch',vi.fn(async(path:string,init?:RequestInit)=>{
  if(path==='/study/memory')return json(saved?{...packet,notes:[{...second,title:'Da chiarire'}]}:{...packet,notes:[],nodes:[],edges:[]});
  if(path==='/study/memory/notes'&&init?.body){
   const value=JSON.parse(String(init.body));
   if(value.title!=='Da chiarire'||value.text!=='Perché la pressione è fissata?'||value.classification!=='not_understood')return json({error:'invalid_memory_note'},400);
   saved=true;return json({...second,title:value.title,text:value.text});
  }
  throw Error(path);
 }));
 render(<StrictMode><MemoryView me={me}/></StrictMode>);
 await screen.findByText('Nessuna idea salvata.');
 fireEvent.click(screen.getByRole('button',{name:'Nuova idea'}));
 fireEvent.change(screen.getByLabelText('Titolo'),{target:{value:'Da chiarire'}});
 fireEvent.change(screen.getByLabelText('La tua nota'),{target:{value:'Perché la pressione è fissata?'}});
 fireEvent.change(screen.getByLabelText('Come descrivi questo passaggio?'),{target:{value:'not_understood'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva nel quaderno'}));
 expect(await screen.findByRole('button',{name:'Apri Da chiarire'})).toBeTruthy();
});

test('failed refresh removes previously visible private memory',async()=>{
 let unavailable=false;
 vi.stubGlobal('fetch',vi.fn(async()=>unavailable?json({error:'storage_unavailable'},503):json(packet)));
 render(<MemoryView me={me}/>);
 await screen.findByRole('button',{name:'Apri Lezione uno'});
 unavailable=true;fireEvent.click(screen.getByRole('button',{name:'Aggiorna memoria'}));
 await screen.findByRole('alert');
 expect(screen.queryByRole('button',{name:'Apri Lezione uno'})).toBeNull();
});

test('late response for another actor cannot replace current memory',async()=>{
 let resolve!:(r:Response)=>void;let calls=0;
 vi.stubGlobal('fetch',vi.fn(async()=>++calls===1?new Promise<Response>(r=>resolve=r):json({...packet,notes:[],nodes:[],edges:[]})));
 const view=render(<MemoryView me={me}/>);
 view.rerender(<MemoryView me={{...me,id:'student-peer'}}/>);
 await screen.findByText('Nessuna idea salvata.');
 await act(async()=>resolve(json(packet)));
 expect(screen.queryByRole('button',{name:'Apri Lezione uno'})).toBeNull();
});

test('personal memory is reachable from the authenticated app without an edition',async()=>{
 history.replaceState(null,'','/?view=memory');vi.stubGlobal('scrollTo',vi.fn());
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/me')return json(me);
  if(path.startsWith('/study/editions?'))return json({items:[],nextCursor:null});
  if(path==='/study/memory')return json({...packet,notes:[],nodes:[],edges:[]});
  throw Error(path);
 }));
 render(<App/>);
 expect(await screen.findByRole('heading',{name:'Memoria delle idee.'})).toBeTruthy();
 expect(screen.getByRole('button',{name:'Nuova idea'})).toBeTruthy();
});

test('refresh discards an editor snapshot when its source is no longer authorized',async()=>{
 let withdrawn=false;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json(withdrawn?{...packet,notes:[],nodes:[],edges:[]}:packet);
  if(path==='/study/memory/notes/one')return json({...first,backlinks:[]});
  throw Error(path);
 }));
 render(<MemoryView me={me}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Apri Lezione uno'}));
 fireEvent.click(await screen.findByRole('button',{name:'Modifica o rettifica'}));
 expect((screen.getByLabelText('La tua nota') as HTMLTextAreaElement).value).toBe('Il vincolo è la pressione.');
 withdrawn=true;fireEvent.click(screen.getByRole('button',{name:'Aggiorna memoria'}));
 await screen.findByText('Nessuna idea salvata.');
 expect(screen.queryByLabelText('La tua nota')).toBeNull();
});

test('changing graph node during an unfinished note read clears the spinner',async()=>{
 let finish!:(r:Response)=>void;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json(packet);
  if(path==='/study/memory/notes/one')return new Promise<Response>(r=>finish=r);
  if(path==='/study/resources/source-one/revisions/original-revision')return json({
   id:'source-one',revisionId:'original-revision',text:'Passaggio originale',kind:'notes',visibility:'private',sha256:'a'.repeat(64)});
  throw Error(path);
 }));
 render(<MemoryView me={me}/>);
 await screen.findByRole('button',{name:'Apri Lezione uno'});
 fireEvent.click(screen.getByRole('button',{name:'Grafo dei collegamenti'}));
 const nodes=within(screen.getByRole('list',{name:'Nodi del grafo'}));
 fireEvent.click(nodes.getByRole('button',{name:'Lezione uno'}));
 fireEvent.click(nodes.getByRole('button',{name:'Fonte originale'}));
 expect(await screen.findByRole('heading',{name:'Fonte originale',level:2})).toBeTruthy();
 await act(async()=>finish(json({...first,backlinks:[]})));
 expect(screen.queryByRole('heading',{name:'Lezione uno',level:2})).toBeNull();
});

test('cached workspace titles are reauthorized before being offered as sources',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json({...packet,notes:[],nodes:[],edges:[]});
  if(path.startsWith('/study/workspace?'))return json({resources:[]});
  throw Error(path);
 }));
 render(<MemoryView me={me} resources={[{id:'old-source',revisionId:'old-revision',contextId:'context',
   ownerId:'teacher',editionId:'fluidi',kind:'notes',visibility:'group',text:'TITOLO REVOCATO',sha256:'a'.repeat(64)}]}/>);
 await screen.findByText('Nessuna idea salvata.');
 fireEvent.click(screen.getByRole('button',{name:'Nuova idea'}));
 expect(screen.queryByRole('option',{name:'TITOLO REVOCATO'})).toBeNull();
});

test('opening a projected graph node rechecks access before showing its details',async()=>{
 let revoked=false;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json(revoked?{...packet,notes:[],nodes:[],edges:[]}:packet);
  throw Error(path);
 }));
 render(<MemoryView me={me}/>);await screen.findByRole('button',{name:'Apri Lezione uno'});
 fireEvent.click(screen.getByRole('button',{name:'Grafo dei collegamenti'}));
 revoked=true;fireEvent.click(within(screen.getByRole('list',{name:'Nodi del grafo'})).getByRole('button',{name:'Fonte originale'}));
 await screen.findByRole('alert');
 expect(screen.queryByRole('heading',{name:'Fonte originale',level:2})).toBeNull();
 expect(screen.queryByRole('list',{name:'Nodi del grafo'})).toBeNull();
});

test('a successful node read also retires other revoked labels in the graph',async()=>{
 const publicNode={id:'still-accessible',kind:'concept',label:'Concetto ancora accessibile'};
 let revoked=false;
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
  if(path==='/study/memory')return json({...packet,nodes:revoked?[publicNode]:[...packet.nodes,publicNode]});
  throw Error(path);
 }));
 render(<MemoryView me={me}/>);await screen.findByRole('button',{name:'Apri Lezione uno'});
 fireEvent.click(screen.getByRole('button',{name:'Grafo dei collegamenti'}));
 revoked=true;fireEvent.click(within(screen.getByRole('list',{name:'Nodi del grafo'})).getByRole('button',{name:publicNode.label}));
 await screen.findByRole('heading',{name:publicNode.label,level:2});
 expect(within(screen.getByRole('list',{name:'Nodi del grafo'})).queryByRole('button',{name:'Fonte originale'})).toBeNull();
 expect(screen.queryByRole('option',{name:'Fonte originale'})).toBeNull();
});
