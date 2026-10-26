import {useEffect,useRef,useState} from 'react';
import {describeError,requestKey,studyRequest} from '../../api';
import {arrangeGraph,captureGraphView,connectionPath,createMemoryGraph,focusNeighborhood,restoreGraphView} from './graphAdapter';
import type {Core} from './vendor/cytoscape-3.34.0/cytoscape.mjs';
import type {GraphView,MemoryNode,MemoryPacket} from './model';
import cytoscapeLicense from './vendor/cytoscape-3.34.0/LICENSE?raw';

export default function GraphExplorer({data,onOpen,onReload}:{data:MemoryPacket;onOpen:(node:MemoryNode)=>void;onReload:()=>void}) {
 const container=useRef<HTMLDivElement>(null),graph=useRef<Core|null>(null),mounted=useRef(false);
 const open=useRef(onOpen);open.current=onOpen;
 const version=useRef(data.view?.version??0),pending=useRef<{body:ReturnType<typeof captureGraphView>;key:string}|null>(null);
 const [layout,setLayout]=useState<GraphView['layout']>(data.view?.layout??'grid');
 const [selected,setSelected]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[path,setPath]=useState<string[]>([]);
 const [notice,setNotice]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[frozen,setFrozen]=useState(false),[conflict,setConflict]=useState(false);
 const canvasAvailable=typeof CanvasRenderingContext2D!=='undefined';
 useEffect(()=>{
  mounted.current=true;let observer:ResizeObserver|undefined;let cy:Core|undefined;
  try {
   cy=createMemoryGraph(data,canvasAvailable&&container.current?container.current:undefined);graph.current=cy;
   if(data.view?.positions.length)restoreGraphView(cy,data.view);
   else arrangeGraph(cy,data.view?.layout??'grid');
   cy.on('tap','node',event=>{
    const node=data.nodes.find(item=>item.id===event.target.id());
    if(node){setSelected(node.id);open.current(node);}
   });
   if(canvasAvailable&&container.current&&typeof ResizeObserver!=='undefined'){
    observer=new ResizeObserver(()=>cy?.resize());observer.observe(container.current);
   }
  }catch{cy?.destroy();graph.current=null;setError('Il disegno non è disponibile. Puoi aprire gli stessi collegamenti dall’elenco.');}
  return()=>{mounted.current=false;observer?.disconnect();cy?.destroy();graph.current=null;};
 },[data,canvasAvailable]);
 const nodes=new Map(data.nodes.map(node=>[node.id,node]));
 function moveLayout(value:GraphView['layout']) {
  setLayout(value);if(graph.current)arrangeGraph(graph.current,value);setNotice('Disposizione modificata. Salvala per ritrovarla alla riapertura.');
 }
 function neighbors(){if(graph.current){const ids=focusNeighborhood(graph.current,selected||null);setNotice(`${ids.length} nodi nel collegamento selezionato.`);}}
 function findPath(){
  if(!graph.current)return;
  focusNeighborhood(graph.current,null);const ids=connectionPath(graph.current,from,to);setPath(ids);
  setNotice(ids.length?`${ids.length} nodi nel percorso. Le relazioni non indicano prerequisiti o competenze.`:'Non c’è un percorso fra questi nodi nei collegamenti disponibili.');
 }
 async function save(){
  if(busy||conflict||!graph.current)return;
  const command=pending.current??{body:captureGraphView(graph.current,layout,version.current),key:requestKey()};
  if(command.body.positions.length>1024){setError('La disposizione supera 1024 nodi. Restringi la ricerca prima di salvarla.');return;}
  pending.current=command;setBusy(true);setFrozen(true);setError('');setNotice('');
  graph.current.autoungrabify(true);graph.current.userPanningEnabled(false);graph.current.userZoomingEnabled(false);
  try {
   const saved=await studyRequest<GraphView>('/memory/view',command.body,{headers:{'Idempotency-Key':command.key}});
   if(mounted.current){
    if(command.body.positions.some(point=>!saved.positions.some(current=>current.id===point.id))){onReload();return;}
    version.current=saved.version;pending.current=null;setFrozen(false);setNotice(`Disposizione salvata · revisione ${saved.version}.`);
    graph.current?.autoungrabify(false);graph.current?.userPanningEnabled(true);graph.current?.userZoomingEnabled(true);}
  }catch(e){if(mounted.current){
   if(e instanceof Error&&e.message==='forbidden'){onReload();return;}
   const stale=e instanceof Error&&e.message==='stale_revision';setConflict(stale);
   setError(stale?'Un’altra finestra ha salvato una disposizione più recente. Ricarica per ripartire da quella revisione.':describeError(e,'Salvataggio non confermato. Riprova lo stesso tentativo oppure ricarica la disposizione dal server.'));
  }}finally{if(mounted.current)setBusy(false);}
 }
 return <section className="memory-explorer" aria-label="Esplora il grafo">
  <p>Trascina i nodi, esplora le vicinanze o cerca un percorso. Puoi aprire ogni oggetto anche dall’elenco sotto il disegno.</p>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <fieldset disabled={frozen} className="memory-graph-controls"><legend>Disposizione e collegamenti</legend>
   <label>Disposizione del grafo<select value={layout} onChange={e=>moveLayout(e.target.value as GraphView['layout'])}>
    <option value="grid">Griglia</option><option value="breadthfirst">Livelli</option><option value="circle">Cerchio</option></select></label>
   <div className="memory-actions"><button onClick={()=>graph.current?.fit(undefined,32)}>Inquadra tutto</button>
    <button aria-label="Ingrandisci grafo" onClick={()=>{const cy=graph.current;if(cy)cy.zoom(Math.min(4,cy.zoom()*1.25));}}>+</button>
    <button aria-label="Riduci grafo" onClick={()=>{const cy=graph.current;if(cy)cy.zoom(Math.max(.2,cy.zoom()/1.25));}}>−</button></div>
   <label>Nodo da esplorare<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Tutti i nodi</option>
    {data.nodes.map(node=><option key={node.id} value={node.id}>{node.label}</option>)}</select></label>
   <div className="memory-actions"><button disabled={!selected} onClick={()=>{const node=nodes.get(selected);if(node)onOpen(node);}}>Apri nodo selezionato</button>
    <button disabled={!selected} onClick={neighbors}>Mostra vicinanze</button>
    <button onClick={()=>{if(graph.current){focusNeighborhood(graph.current,null);connectionPath(graph.current,'','');}setPath([]);setSelected('');setNotice('Tutti i collegamenti sono visibili.');}}>Mostra tutti i collegamenti</button></div>
   <div className="memory-form-grid">{([['Da',from,setFrom],['A',to,setTo]] as const).map(([label,value,change])=><label key={label}>{label} · percorso nel grafo<select value={value} onChange={e=>change(e.target.value)}>
    <option value="">Scegli un nodo</option>{data.nodes.map(node=><option key={node.id} value={node.id}>{node.label}</option>)}</select></label>)}</div>
   <button disabled={!from||!to} onClick={findPath}>Trova collegamento</button>
  </fieldset>
  {canvasAvailable?<div ref={container} className="memory-graph-canvas" aria-hidden="true"/>:<p className="fine-print">Disegno non disponibile in questo ambiente. I controlli e l’elenco dei collegamenti rimangono utilizzabili.</p>}
  {path.length>0&&<ol aria-label="Percorso fra i nodi">{path.map(id=><li key={id}><button onClick={()=>{const node=nodes.get(id);if(node)onOpen(node);}}>{nodes.get(id)?.label}</button></li>)}</ol>}
  <div className="memory-actions"><button disabled={busy||conflict} onClick={()=>void save()}>{busy?'Salvataggio disposizione…':pending.current?'Riprova salvataggio disposizione':'Salva disposizione'}</button>
   <button disabled={busy} onClick={onReload}>Ricarica disposizione</button></div>
  <p className="fine-print">La disposizione è personale e salvata nel tuo account. Una ricerca salva solo le posizioni dei nodi visibili; gli altri verranno ridisposti alla riapertura.</p>
  <details className="memory-graph-license"><summary>Licenza del grafo · Cytoscape 3.34.0</summary><pre>{cytoscapeLicense}</pre></details>
 </section>;
}
