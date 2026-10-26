// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {StrictMode} from 'react';
import GraphExplorer from './GraphExplorer';
import type {MemoryPacket} from './model';

const data:MemoryPacket={notes:[],limits:[],nodes:[
 {id:'one',kind:'note',label:'Lezione uno'},{id:'two',kind:'note',label:'Lezione due'},
 {id:'source',kind:'source',label:'Fonte esatta'}],edges:[
 {source:'one',target:'source',relation:'cites'},{source:'two',target:'one',relation:'links_to'}],
 view:{version:3,layout:'circle',positions:[{id:'one',x:14,y:28}],zoom:1.4,pan:{x:10,y:20}}};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

test('real Cytoscape supports keyboard paths, neighborhoods and canonical save of restored coordinates',async()=>{
 const opened=vi.fn();let command:Record<string,any>|undefined;
 vi.stubGlobal('fetch',vi.fn(async(path:string,init?:RequestInit)=>{
  expect(path).toBe('/study/memory/view');command=JSON.parse(String(init?.body));
  return json({...command,version:4});
 }));
 render(<StrictMode><GraphExplorer data={data} onOpen={opened} onReload={vi.fn()}/></StrictMode>);
 expect((screen.getByLabelText('Disposizione del grafo') as HTMLSelectElement).value).toBe('circle');
 fireEvent.change(screen.getByLabelText('Nodo da esplorare'),{target:{value:'source'}});
 fireEvent.click(screen.getByRole('button',{name:'Apri nodo selezionato'}));expect(opened).toHaveBeenCalledWith(data.nodes[2]);
 fireEvent.click(screen.getByRole('button',{name:'Mostra vicinanze'}));expect(screen.getByRole('status').textContent).toContain('2 nodi');
 fireEvent.change(screen.getByLabelText('Da · percorso nel grafo'),{target:{value:'two'}});
 fireEvent.change(screen.getByLabelText('A · percorso nel grafo'),{target:{value:'source'}});
 fireEvent.click(screen.getByRole('button',{name:'Trova collegamento'}));
 expect(within(screen.getByRole('list',{name:'Percorso fra i nodi'})).getAllByRole('button').map(node=>node.textContent)).toEqual(['Lezione due','Lezione uno','Fonte esatta']);
 fireEvent.click(screen.getByRole('button',{name:'Salva disposizione'}));
 await screen.findByText('Disposizione salvata · revisione 4.');
 expect(command?.expectedVersion).toBe(3);expect(command?.positions.find((p:any)=>p.id==='one')).toEqual({id:'one',x:14,y:28});
 expect(command?.zoom).toBe(1.4);expect(command?.pan).toEqual({x:10,y:20});
 expect(JSON.stringify(command)).not.toContain('Lezione');
});

test('uncertain save freezes edits and retries byte-identical command/key; conflict requires a fresh server view',async()=>{
 const requests:{body:unknown;key:string|null}[]=[];let attempt=0;const reload=vi.fn();
 vi.stubGlobal('fetch',vi.fn(async(_path:string,init?:RequestInit)=>{
  requests.push({body:init?.body,key:new Headers(init?.headers).get('Idempotency-Key')});
  if(++attempt===1)throw Error('offline');return json({error:'stale_revision'},409);
 }));
 render(<GraphExplorer data={data} onOpen={vi.fn()} onReload={reload}/>);
 fireEvent.change(screen.getByLabelText('Disposizione del grafo'),{target:{value:'grid'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva disposizione'}));await screen.findByRole('alert');
 expect((screen.getByRole('group',{name:'Disposizione e collegamenti'}) as HTMLFieldSetElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Riprova salvataggio disposizione'}));
 await screen.findByText(/Un’altra finestra/);expect(requests[0]).toEqual(requests[1]);
 expect((screen.getByRole('button',{name:'Riprova salvataggio disposizione'}) as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Ricarica disposizione'}));expect(reload).toHaveBeenCalledTimes(1);
});

test('unmount during save cannot report success in a replacement actor graph',async()=>{
 let finish!:(response:Response)=>void;
 vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>finish=resolve)));
 const view=render(<GraphExplorer data={data} onOpen={vi.fn()} onReload={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'Salva disposizione'}));view.unmount();
 render(<GraphExplorer data={{...data,nodes:[],edges:[],view:undefined}} onOpen={vi.fn()} onReload={vi.fn()}/>);
 await act(async()=>finish(json({version:4})));
 expect(screen.queryByText('Disposizione salvata · revisione 4.')).toBeNull();
 expect(screen.queryByRole('option',{name:'Lezione uno'})).toBeNull();
});
