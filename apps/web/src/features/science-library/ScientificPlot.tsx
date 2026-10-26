import {useEffect,useId,useRef,useState} from 'react';
import type {Board} from 'jsxgraph';
import type {ScienceResult} from './types';
import noticesUrl from './THIRD_PARTY_NOTICES.txt?url';

type Line={label:string;xs:number[];ys:number[];dashed?:boolean;categorical?:boolean};
const fmt=(n:number)=>n.toLocaleString('it-IT',{maximumSignificantDigits:4,useGrouping:false});
const scaleOf=(values:number[])=>{const max=Math.max(...values.map(Math.abs),0);if(!max)return 1;return 10**Math.floor(Math.log10(max))||max;};

export function ScientificPlot({result,plotId}:{result:ScienceResult;plotId:string}){
  const id='science-'+useId().replace(/[^a-z0-9]/gi,'');
  const node=useRef<HTMLDivElement>(null),board=useRef<Board|null>(null);
  const [mode,setMode]=useState<'loading'|'interactive'|'fallback'>('loading');
  const plot=result.plots.find(p=>p.id===plotId)||result.plots[0];
  const rays=plotId==='rays'&&result.raySegments;
  const label=rays?'Raggi e immagine della lente':plot?.label||'Rappresentazione scientifica';
  const lines:Line[]=rays?result.raySegments!.map(s=>({label:s.label,xs:s.points.map(p=>p[0]),ys:s.points.map(p=>p[1]),dashed:s.style==='dashed'})):
    (plot?.series||[]).map(s=>({label:s.label,xs:plot.x||s.values.map((_,i)=>i+1),ys:s.values,categorical:!!plot.categories}));
  const xs=lines.flatMap(l=>l.xs),ys=lines.flatMap(l=>l.ys);
  const sx=rays?scaleOf(xs):plot?.x?scaleOf(xs):1,sy=scaleOf(ys);
  const normalized=lines.map(l=>({...l,xs:l.xs.map(n=>n/sx),ys:l.ys.map(n=>n/sy)}));
  const nx=normalized.flatMap(l=>l.xs),ny=normalized.flatMap(l=>l.ys);
  const left=Math.min(...nx,0),right=Math.max(...nx,0),low=Math.min(...ny,0),high=Math.max(...ny,0);
  const dx=right-left||1,dy=high-low||1;
  const bounds:[number,number,number,number]=[left-.15*dx,high+.2*dy,right+.15*dx,low-.2*dy];
  const dependency=JSON.stringify({lines,plotId});
  useEffect(()=>{
    let active=true;let free:((b:Board)=>void)|null=null;setMode('loading');
    void import('jsxgraph').then(({default:JXG})=>{
      if(!active||!node.current)return;
      try{
        const b=JXG.JSXGraph.initBoard(id,{boundingbox:bounds,axis:true,renderer:'svg',showNavigation:false,
          showCopyright:false,pan:{enabled:false},zoom:{enabled:false},keyboard:{enabled:false}});
        board.current=b;free=value=>{JXG.JSXGraph.freeBoard(value);};
        const colors=['#a84b32','#2b6970','#565c69'];
        normalized.forEach((line,i)=>{
          const attributes={strokeColor:colors[i%colors.length],strokeWidth:2.5,fixed:true,highlight:false,dash:line.dashed?2 as const:0 as const};
          if(line.categorical)line.xs.forEach((x,j)=>b.create('segment',[[x,0],[x,line.ys[j]]],attributes));
          else b.create('curve',[line.xs,line.ys],attributes);
          line.xs.forEach((x,j)=>b.create('point',[x,line.ys[j]],{name:'',size:2,fillColor:colors[i%colors.length],strokeColor:colors[i%colors.length],fixed:true,highlight:false}));
        });
        if(active)setMode('interactive');
      }catch{if(board.current){free?.(board.current);board.current=null;}if(active)setMode('fallback');}
    }).catch(()=>{if(active)setMode('fallback');});
    return()=>{active=false;if(board.current){free?.(board.current);board.current=null;}};
  // Geometry is a projection of immutable canonical data; no physical equation runs here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dependency,id]);
  const px=(x:number)=>55+(x-bounds[0])/(bounds[2]-bounds[0])*390;
  const py=(y:number)=>280-(y-bounds[3])/(bounds[1]-bounds[3])*245;
  return <figure className="science-plot">
    <div className="science-plot-heading"><strong>{label}</strong><div className="science-zoom" aria-label="Vista del grafico">
      <button type="button" disabled={mode!=='interactive'} aria-label="Ingrandisci il grafico" onClick={()=>board.current?.zoomIn()}>+</button>
      <button type="button" disabled={mode!=='interactive'} aria-label="Riduci il grafico" onClick={()=>board.current?.zoomOut()}>−</button>
      <button type="button" disabled={mode!=='interactive'} onClick={()=>board.current?.setBoundingBox(bounds as [number,number,number,number])}>Ripristina vista</button></div></div>
    <div className="science-plot-area"><div ref={node} id={id} className="science-graph" role="img" aria-label={label} aria-hidden={mode!=='interactive'} style={{opacity:mode==='interactive'?1:0}}/>
    {mode!=='interactive'&&<svg viewBox="0 0 480 320" role="img" aria-label={label+' · vista statica equivalente'}>
      <path d={`M${px(0)} 30V280M55 ${py(0)}H445`} stroke="currentColor" fill="none" opacity=".4"/>
      {normalized.map((line,i)=><g key={i} className={'science-series science-series-'+i}>
        {line.categorical?line.xs.map((x,j)=><path key={j} d={`M${px(x)} ${py(0)}V${py(line.ys[j])}`} strokeWidth="5"/>):
          <polyline points={line.xs.map((x,j)=>`${px(x)},${py(line.ys[j])}`).join(' ')} fill="none" strokeDasharray={line.dashed?'6 5':undefined}/>}
        {line.xs.map((x,j)=><circle key={j} cx={px(x)} cy={py(line.ys[j])} r="3"/>)}</g>)}
    </svg>}</div>
    <figcaption><p>{mode==='fallback'?'Il grafico interattivo non è disponibile. Restano la vista statica e tutti i valori in tabella.':mode==='loading'?'Vista statica pronta; apro i controlli del grafico.':'Usa i controlli per esplorare il grafico; i dati del modello non cambiano.'}</p>
      <p>Scala verticale: 1 unità del grafico = {fmt(sy)} {rays?'m':plot?.unit}. {rays||plot?.x?`Scala orizzontale: 1 unità = ${fmt(sx)} ${rays?'m':plot?.xUnit||''}.`:'Le ascisse distinguono le categorie della tabella.'}</p>
      {rays&&<p>Schema paraassiale con scale diverse sui due assi. I tratti virtuali sono prolungamenti geometrici.</p>}
      <ul className="science-legend">{lines.map((line,i)=><li key={i}><span className={'science-swatch science-series-'+i}/>{line.label}{line.dashed?' · tratteggiato':''}</li>)}</ul>
      <a href={noticesUrl} target="_blank" rel="noreferrer">Licenze e attribuzione del grafico</a>
    </figcaption>
    <details className="science-values"><summary>Dati equivalenti del grafico</summary><table><thead><tr><th>{rays?'Punto':plot?.x?'Posizione ['+(plot.xUnit||'')+']':'Categoria'}</th>{lines.map((l,i)=><th key={i}>{l.label} [{rays?'m':plot?.unit}]</th>)}</tr></thead>
      <tbody>{rays?lines.flatMap((line,i)=>line.xs.map((x,j)=><tr key={i+'-'+j}><th>{line.label} · x={fmt(x)} m</th>{lines.map((_,k)=><td key={k}>{i===k?fmt(line.ys[j]):'—'}</td>)}</tr>)):
        (plot?.x||plot?.categories||[]).map((x,j)=><tr key={j}><th>{typeof x==='number'?fmt(x):x}</th>{lines.map((l,i)=><td key={i}>{fmt(l.ys[j])}</td>)}</tr>)}</tbody></table></details>
  </figure>;
}
