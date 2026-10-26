import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import type {InsightAttempt} from './contracts';
import {aggregateEvidence,HELP_LABELS,OUTCOME_LABELS,type EvidenceCount} from './explorer';
const SourceViewer=lazy(()=>import('../../components/SourceViewer').then(module=>({default:module.SourceViewer})));

function EvidencePlot({rows}:{rows:EvidenceCount[]}){
 const host=useRef<HTMLDivElement>(null);const [width,setWidth]=useState(640);const [error,setError]=useState('');const [ready,setReady]=useState(false);
 useEffect(()=>{
  if(!host.current||typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(([entry])=>setWidth(Math.max(280,Math.floor(entry.contentRect.width))));
  observer.observe(host.current);return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  let active=true;const element=host.current;if(!element)return;
  element.replaceChildren();setError('');setReady(false);const start=performance.now();
  void import('./vendor/plot-engine.mjs').then(Plot=>{
   if(!active)return;const renderStart=performance.now();
   const totals=new Map<string,number>();for(const row of rows)totals.set(row.outcome,(totals.get(row.outcome)??0)+row.count);
   const maximum=Math.max(1,...totals.values());const step=Math.max(1,Math.ceil(maximum/5));
   const ticks=Array.from({length:Math.floor(maximum/step)+1},(_,i)=>i*step);if(ticks.at(-1)!==maximum)ticks.push(maximum);
   const svg=Plot.plot({width,height:230,marginLeft:148,marginRight:24,ariaLabel:'Prove conservate per verifica e aiuti richiesti',
    ariaDescription:'Conteggi delle prove selezionate; la tabella riporta ogni ricevuta. Non è una misura di apprendimento.',
    x:{label:'Numero di prove',grid:true,tickFormat:'d',domain:[0,maximum],ticks},
    y:{label:null,domain:['Da confrontare','Concorde con il modello','Non verificato'],tickSize:0},
    color:{domain:Object.values(HELP_LABELS),range:['#b56735','#355d4e','#69736c'],legend:false},
    marks:[Plot.barX(rows,{x:'count',y:'outcome',fill:'assistance',title:d=>`${d.outcome}; ${d.assistance}: ${d.count}`,tip:true}),Plot.ruleX([0])]});
   svg.setAttribute('role','img');element.replaceChildren(svg);
   element.dataset.renderMs=(performance.now()-renderStart).toFixed(2);element.dataset.loadAndRenderMs=(performance.now()-start).toFixed(2);
   setReady(true);
  }).catch(()=>{if(active)setError('Il grafico non è disponibile. La tabella conserva tutte le evidenze autorizzate.');});
  return ()=>{active=false;element.replaceChildren();};
 },[rows,width]);
 return <>{error&&<p role="status">{error}</p>}<div ref={host} className="insights-plot" aria-busy={!error&&!ready}/></>;
}

export function EvidenceExplorer({attempts,role}:{attempts:InsightAttempt[];role:string}){
 const {rows,suppressed}=aggregateEvidence(attempts,role);
 const [selected,setSelected]=useState<string|null>(null);const [page,setPage]=useState(0);
 const [openSource,setOpenSource]=useState(false);
 const current=attempts.find(a=>a.receiptId===selected);
 const pages=Math.max(1,Math.ceil(attempts.length/25));const visiblePage=Math.min(page,pages-1);
 const visible=attempts.slice(visiblePage*25,(visiblePage+1)*25);
 return <section className="insights-explorer" aria-labelledby="explorer-title">
  <h2 id="explorer-title">Le prove, a colpo d’occhio</h2>
  <p>Confronta gli esiti registrati distinguendo gli aiuti richiesti. Ogni barra conta prove, non persone o livelli di apprendimento.</p>
  {suppressed?<p className="insights-note">Grafico nascosto: il filtro comprende meno di cinque studenti. Le singole evidenze restano accessibili secondo i permessi Core.</p>:
   rows.length?<><ul className="insights-key" aria-label="Legenda degli aiuti">{Object.values(HELP_LABELS).map((h,i)=><li key={h}><span className={`insights-swatch insights-swatch-${i}`} aria-hidden="true"/>{h}</li>)}</ul><EvidencePlot rows={rows}/>
    <details><summary>Valori del grafico</summary><ul>{rows.map(r=><li key={r.outcome+r.assistance}>{r.outcome} · {r.assistance}: {r.count}</li>)}</ul></details></>:
   <p>Nessuna prova corrisponde ai filtri. Puoi cambiarli o ripristinare la vista completa.</p>}
  <details><summary>Tabella delle prove ({attempts.length})</summary>
   <div className="insights-table-scroll"><table><caption>Ricevute autorizzate nella vista corrente</caption><thead><tr><th>Modello</th><th>Verifica</th><th>Aiuti</th><th>Evidenza</th></tr></thead>
    <tbody>{visible.map((a,i)=><tr key={a.receiptId}><td>{a.activityId}</td><td>{OUTCOME_LABELS[a.outcome]}</td><td>{HELP_LABELS[a.assistance]}</td><td><button onClick={()=>{setSelected(a.receiptId);setOpenSource(false);}}>Apri prova {visiblePage*25+i+1}</button></td></tr>)}</tbody></table></div>
   {pages>1&&<nav aria-label="Pagine delle prove"><button disabled={visiblePage===0} onClick={()=>setPage(visiblePage-1)}>Precedenti</button><span>Pagina {visiblePage+1} di {pages}</span><button disabled={visiblePage===pages-1} onClick={()=>setPage(visiblePage+1)}>Successive</button></nav>}
  </details>
  {current&&<section className="insights-selected" role="region" aria-label="Evidenza selezionata"><h3>{current.activityId} · versione {current.modelVersion??'non registrata'}</h3>
   <p>Ricevuta Core: {current.receiptId}</p><p>{current.packRef.packId} · versione {current.packRef.packVersion}</p>
   <p>{current.sourceState==='CURRENT'?'Revisione originale corrente.':'Revisione storica: la fonte è stata aggiornata.'}</p>
   {current.sourceRefs.map(ref=><p key={ref.resourceId}>{ref.resourceId} · {ref.revisionId}</p>)}
   {current.sourceRefs[0]?.contextId&&<button onClick={()=>setOpenSource(!openSource)}>{openSource?'Chiudi fonte originale':'Apri fonte originale'}</button>}
   {openSource&&current.sourceRefs[0]?.contextId&&<Suspense fallback={<p role="status">Apertura della fonte originale…</p>}><SourceViewer key={current.receiptId} reference={{...current.sourceRefs[0],contextId:current.sourceRefs[0].contextId}}/></Suspense>}
  </section>}
 </section>;
}
