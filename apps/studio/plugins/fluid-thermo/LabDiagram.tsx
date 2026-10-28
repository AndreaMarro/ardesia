import {useId} from 'react';
import type {ReactNode} from 'react';
import type {LabDefinition,LabResult,Parameters,Series} from './types';

const ink='var(--lab-ink, #263b41)',water='var(--lab-water, #2b6970)',accent='var(--lab-accent, #a84b32)',soft='var(--lab-soft, #eae8df)';
const palette=[accent,water,ink,'#716145'];
const fmt=(value:number)=>Number.isFinite(value)?value.toLocaleString('it-IT',{maximumSignificantDigits:4,useGrouping:false}):'—';
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const value=(result:LabResult,key:string)=>result.measurements.find(m=>m.key===key)?.value??NaN;
const metric=(result:LabResult,key:string)=>{const m=result.measurements.find(item=>item.key===key);return m?`${fmt(m.value)} ${m.unit}`:'—';};

function Arrow({x1,y1,x2,y2,marker,color=accent,width=2.5}:{x1:number;y1:number;x2:number;y2:number;marker:string;color?:string;width?:number}){
 if(Math.hypot(x2-x1,y2-y1)<.5)return null;
 return <path d={`M${x1} ${y1}L${x2} ${y2}`} fill="none" stroke={color} strokeWidth={width} markerEnd={`url(#${marker})`}/>;
}
function Label({x,y,children,anchor='middle',color=ink,size=13}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end';color?:string;size?:number}){
 return <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size}>{children}</text>;
}
function Vessel({x,y,width,height,fill=water}:{x:number;y:number;width:number;height:number;fill?:string}){
 return <g><rect x={x+3} y={y+20} width={width-6} height={height-23} fill={fill} opacity=".13"/>
  <path d={`M${x} ${y}V${y+height}H${x+width}V${y}`} fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round"/></g>;
}

/** Quantitative curves use only samples produced by the analytical model. */
function Chart({series,labels,marker,point,fillArea=false,xLabel,yLabel,footer}:{series:Series[];labels?:string[];marker:string;point?:[number,number];fillArea?:boolean;xLabel:string;yLabel:string;footer?:ReactNode}){
 const data=series.flatMap(s=>s.points).filter(p=>p.every(Number.isFinite));
 if(point?.every(Number.isFinite))data.push(point);
 if(!data.length)return <Label x={300} y={165}>Dati del modello non disponibili.</Label>;
 const xs=data.map(p=>p[0]),ys=data.map(p=>p[1]);
 const minimumX=Math.min(...xs),maximumX=Math.max(...xs),minimumY=Math.min(0,...ys),maximumY=Math.max(0,...ys);
 const dx=maximumX-minimumX||Math.max(1,Math.abs(maximumX))*.1,dy=maximumY-minimumY||1;
 const minX=minimumX-.035*dx,maxX=maximumX+.035*dx,minY=minimumY-.04*dy,maxY=maximumY+.08*dy;
 const px=(n:number)=>90+(n-minX)/(maxX-minX)*455,py=(n:number)=>245-(n-minY)/(maxY-minY)*190;
 const zeroY=py(0),poly=(s:Series)=>s.points.map(([x,y])=>`${px(x)},${py(y)}`).join(' ');
 const fill=series.flatMap(s=>s.points);
 return <g>
  {[0,.5,1].map(t=>{const y=minimumY+(maximumY-minimumY)*t;return <g key={'y'+t}><path d={`M85 ${py(y)}H550`} stroke={ink} opacity=".12"/><Label x={78} y={py(y)+4} anchor="end" size={11}>{fmt(y)}</Label></g>;})}
  {[0,.5,1].map(t=>{const x=minimumX+(maximumX-minimumX)*t;return <g key={'x'+t}><path d={`M${px(x)} 248v4`} stroke={ink}/><Label x={px(x)} y={267} size={11}>{fmt(x)}</Label></g>;})}
  <path d="M85 40V250H558" stroke={ink} strokeWidth="1.5" fill="none"/>
  <Label x={87} y={24} anchor="start" size={12}>{yLabel}</Label><Label x={550} y={289} anchor="end" size={12}>{xLabel}</Label>
  {fillArea&&fill.length>1&&<polygon points={`${px(fill[0][0])},${zeroY} ${fill.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')} ${px(fill[fill.length-1][0])},${zeroY}`} fill={accent} opacity=".12"/>}
  {series.map((s,i)=><g key={s.label}><polyline points={poly(s)} fill="none" stroke={palette[i%palette.length]} strokeWidth="2.5" strokeDasharray={i===2?'7 4':undefined} strokeLinejoin="round"/>
   {series.length>1&&s.points.length>2&&<path d={`M${px(s.points[Math.floor(s.points.length/2)][0])} ${py(s.points[Math.floor(s.points.length/2)][1])}L${px(s.points[Math.floor(s.points.length/2)+1][0])} ${py(s.points[Math.floor(s.points.length/2)+1][1])}`} stroke={palette[i%palette.length]} markerEnd={`url(#${marker})`}/>}</g>)}
  {point&&<g><circle cx={px(point[0])} cy={py(point[1])} r="6" fill={accent} stroke="white" strokeWidth="2"/><path d={`M${px(point[0])} ${py(point[1])+8}V248`} stroke={accent} opacity=".5" strokeDasharray="3 4"/></g>}
  {series.length>1&&series.map((s,i)=><g key={'legend'+i}><path d={`M${90+(i%2)*240} ${305+Math.floor(i/2)*20}h18`} stroke={palette[i%palette.length]} strokeWidth="3" strokeDasharray={i===2?'7 4':undefined}/><Label x={115+(i%2)*240} y={309+Math.floor(i/2)*20} anchor="start" size={11}>{labels?.[i]||s.label}</Label></g>)}
  {footer&&<Label x={300} y={329} size={12}>{footer}</Label>}
 </g>;
}

function Diagram({definition:d,parameters:p,result:r,marker}:{definition:LabDefinition;parameters:Parameters;result:LabResult;marker:string}){
 switch(d.id){
  case 'manometer':{
   const left=145+p.heightDifference*65,right=145-p.heightDifference*65;
   return <g><path d="M170 45V225Q170 265 225 265H315Q370 265 370 225V45" fill="none" stroke={soft} strokeWidth="44"/>
    <path d={`M170 ${left}V225Q170 265 225 265H315Q370 265 370 225V${right}`} fill="none" stroke={water} strokeWidth="30" opacity=".6"/>
    <path d={`M147 ${left}h46M347 ${right}h46`} stroke={water} strokeWidth="3"/>
    <Label x={170} y={29}>p₁</Label><Label x={370} y={29}>p₂</Label>
    <Arrow x1={170} y1={50} x2={170} y2={left-13} marker={marker}/><Arrow x1={370} y1={50} x2={370} y2={right-13} marker={marker}/>
    <path d={`M395 ${left}H475M395 ${right}H475M460 ${left}V${right}`} fill="none" stroke={ink} strokeDasharray="4 4"/>
    <Label x={488} y={(left+right)/2-9} anchor="start">Δh</Label><Label x={488} y={(left+right)/2+13} anchor="start" size={12}>{fmt(p.heightDifference)} m</Label>
    <Label x={285} y={306} color={accent}>p₁ − p₂ = {metric(r,'pressureDifference')}</Label>
    <Label x={285} y={327} size={11}>Le quote, non la lunghezza della colonna, determinano il confronto.</Label></g>;
  }
  case 'hydrostatic':{
   const probe=76+clamp(p.depth/20,0,1)*165;
   return <g><Vessel x={115} y={40} width={240} height={222}/><path d="M118 72H352" stroke={water} strokeWidth="2"/>
    <Label x={235} y={28}>Superficie: p₀ = {fmt(p.surfacePressure)} Pa</Label>
    <path d={`M90 72v${probe-72}m-6 0h12M84 72h12`} stroke={ink} fill="none"/>
    <Label x={75} y={(72+probe)/2} anchor="end">h</Label><circle cx={275} cy={probe} r="5" fill={accent}/>
    <path d={`M280 ${probe}H388`} stroke={accent} strokeDasharray="4 4"/><Label x={398} y={probe-8} anchor="start" color={accent}>p = {metric(r,'absolutePressure')}</Label>
    {[.2,.4,.6,.8,1].map((f,i)=><Arrow key={i} x1={355} y1={82+f*170} x2={355+f*110} y2={82+f*170} color={water} marker={marker}/>)}
    <Label x={457} y={77} size={12}>Sovrapressione</Label><Label x={457} y={96} size={12}>crescente con h</Label>
    <Label x={300} y={305}>Δp = {metric(r,'gaugePressure')}</Label><Label x={300} y={327} size={11}>Schema della distribuzione; la tabella conserva valori e unità esatti.</Label></g>;
  }
  case 'pascal':{
   const maxArea=Math.max(p.inputArea,p.outputArea),w1=45+90*Math.sqrt(p.inputArea/maxArea),w2=45+90*Math.sqrt(p.outputArea/maxArea);
   const maxForce=Math.max(p.inputForce,value(r,'outputForce'),1e-12),inputArrow=80*p.inputForce/maxForce,outputArrow=80*value(r,'outputForce')/maxForce;
   return <g><path d="M150 210V255H430V210" fill="none" stroke={water} strokeWidth="26" opacity=".3"/>
    {[{x:150,w:w1,label:'1'},{x:430,w:w2,label:'2'}].map(s=><g key={s.label}><Vessel x={s.x-s.w/2} y={100} width={s.w} height={125}/><rect x={s.x-s.w/2+3} y={120} width={s.w-6} height={12} fill={ink}/><Label x={s.x} y={88}>A{s.label} = {fmt(s.label==='1'?p.inputArea:p.outputArea)} m²</Label></g>)}
    <Arrow x1={150} y1={115-inputArrow} x2={150} y2={115} marker={marker}/><Arrow x1={430} y1={115} x2={430} y2={115-outputArrow} marker={marker}/>
    <Label x={150} y={26} color={accent}>F₁ = {fmt(p.inputForce)} N</Label><Label x={430} y={26} color={accent}>F₂ = {metric(r,'outputForce')}</Label>
    <Label x={290} y={222} size={12}>Stesso incremento di pressione</Label>
    <Label x={300} y={297}>Δx₂/Δx₁ = {metric(r,'displacementRatio')}</Label><Label x={300} y={322} size={11}>La forza maggiore corrisponde a uno spostamento minore: nessun lavoro creato.</Label></g>;
  }
  case 'buoyancy':{
   const side=110,top=155-(1-p.submergedFraction)*side;
   const force=Math.max(value(r,'buoyancy'),value(r,'weight'),1),up=75*value(r,'buoyancy')/force,down=75*value(r,'weight')/force;
   return <g><Vessel x={110} y={38} width={300} height={242}/><rect x={113} y={155} width={294} height={122} fill={water} opacity=".18"/>
    <rect x={210} y={top} width={side} height={side} fill={soft} stroke={ink} strokeWidth="2"/><rect x={210} y={155} width={side} height={side*p.submergedFraction} fill={water} opacity=".4"/>
    <path d="M113 155H407" stroke={water} strokeWidth="2" strokeDasharray="5 4"/>
    <Arrow x1={350} y1={190} x2={350} y2={190-up} color={water} marker={marker}/><Arrow x1={370} y1={190} x2={370} y2={190+down} marker={marker}/>
    <Label x={432} y={107} anchor="start" color={water}>F_A = {metric(r,'buoyancy')}</Label><Label x={432} y={131} anchor="start" color={accent}>P = {metric(r,'weight')}</Label>
    <Label x={432} y={193} anchor="start">f = {fmt(p.submergedFraction)}</Label><Label x={432} y={215} anchor="start" size={11}>Immersione imposta</Label>
    <Label x={275} y={307}>V spostato = {metric(r,'displacedVolume')}</Label><Label x={275} y={329} size={11}>Le frecce confrontano le forze; il modello non simula il moto.</Label></g>;
  }
  case 'continuity':
  case 'venturi':{
   const venturi=d.id==='venturi',maxArea=Math.max(p.area1,p.area2),r1=25+40*Math.sqrt(p.area1/maxArea),r2=25+40*Math.sqrt(p.area2/maxArea);
   const y1=160,y2=venturi?160-clamp(p.height2-p.height1,-5,5)*13:160;
   const speed1=venturi?p.speed1:value(r,'speed1'),speed2=value(r,'speed2'),maxSpeed=Math.max(speed1,speed2,1e-12);
   return <g><path d={`M80 ${y1-r1}H210L340 ${y2-r2}H515V${y2+r2}H340L210 ${y1+r1}H80Z`} fill={water} fillOpacity=".1" stroke={ink} strokeWidth="2.5"/>
    <path d={`M180 ${y1-r1}V${y1+r1}M420 ${y2-r2}V${y2+r2}`} stroke={water} strokeDasharray="5 4"/>
    <Arrow x1={105} y1={y1} x2={105+70*speed1/maxSpeed} y2={y1} marker={marker} color={water}/><Arrow x1={380} y1={y2} x2={380+70*speed2/maxSpeed} y2={y2} marker={marker} color={water}/>
    <Label x={150} y={y1-r1-18}>A₁ = {fmt(p.area1)} m²</Label><Label x={420} y={y2-r2-18}>A₂ = {fmt(p.area2)} m²</Label>
    <Label x={150} y={y1+r1+25}>v₁ = {fmt(speed1)} m/s</Label><Label x={420} y={y2+r2+25}>v₂ = {fmt(speed2)} m/s</Label>
    {venturi?<><Label x={150} y={28} color={accent}>p₁ = {fmt(p.pressure1)} Pa</Label><Label x={420} y={28} color={accent}>p₂ = {metric(r,'pressure2')}</Label><Label x={300} y={306}>p + ½ρv² + ρgh = costante</Label></>:<Label x={300} y={306}>Stessa portata: Q = {metric(r,'flowRate')}</Label>}
    <Label x={300} y={329} size={11}>Sezioni circolari schematizzate; le frecce indicano velocità medie.</Label></g>;
  }
  case 'poiseuille':{
   const profile=r.series[0],maxSpeed=Math.max(value(r,'maxSpeed'),1e-12),radius=p.radius;
   const py=(x:number)=>160-x/radius*95,px=(u:number)=>120+u/maxSpeed*335;
   return <g><rect x={113} y={65} width={355} height={190} fill={water} opacity=".08"/><path d="M105 65H480M105 255H480" stroke={ink} strokeWidth="5"/>
    <path d="M110 160H485" stroke={ink} opacity=".3" strokeDasharray="5 5"/>
    {profile?.points.filter((_,i)=>i%5===0).map(([s,u],i)=><Arrow key={i} x1={120} y1={py(s)} x2={px(u)} y2={py(s)} marker={marker} color={water} width={1.8}/>)}
    {profile&&<polyline points={profile.points.map(([s,u])=>`${px(u)},${py(s)}`).join(' ')} fill="none" stroke={accent} strokeWidth="3"/>}
    <Label x={95} y={69} anchor="end" size={12}>+r</Label><Label x={95} y={164} anchor="end" size={12}>asse</Label><Label x={95} y={259} anchor="end" size={12}>−r</Label>
    <Label x={300} y={29}>Profilo locale u(s) — velocità massima sull’asse</Label><Label x={490} y={164} anchor="start" color={accent} size={11}>{metric(r,'maxSpeed')}</Label>
    <Label x={300} y={285}>u parete = 0 · u asse = 2 × u media</Label><Label x={300} y={308}>Re = {metric(r,'reynolds')} · {p.boundary===0?'Δp fissata':'Q fissata'}</Label>
    <Label x={300} y={330} size={11}>Lunghezze delle frecce in scala relativa; profilo analitico, non particelle simulate.</Label></g>;
  }
  case 'hydraulic-network':{
   const parallel=p.topology===1;
   const resistor=(x:number,y:number,n:number)=><g><rect x={x} y={y-18} width={100} height={36} rx="5" fill={soft} stroke={ink} strokeWidth="2"/><Label x={x+50} y={y+5}>R{n}</Label><Label x={x+50} y={y+44} size={11}>{metric(r,'pressureDrop'+n)}</Label></g>;
   return <g><Label x={300} y={28}>{parallel?'Parallelo: stessa caduta ai capi dei rami':'Serie: stessa portata nei due resistori'}</Label>
    {parallel?<><path d="M80 160H155V95H445V225H155V160M445 160H520" fill="none" stroke={water} strokeWidth="3"/>{resistor(245,95,1)}{resistor(245,225,2)}<Arrow x1={170} y1={95} x2={218} y2={95} marker={marker} color={water}/><Arrow x1={170} y1={225} x2={218} y2={225} marker={marker} color={water}/><Label x={433} y={76} anchor="end" size={11}>Q₁ {metric(r,'flow1')}</Label><Label x={433} y={206} anchor="end" size={11}>Q₂ {metric(r,'flow2')}</Label></>:
     <><path d="M80 160H520" stroke={water} strokeWidth="3"/>{resistor(155,160,1)}{resistor(345,160,2)}<Arrow x1={270} y1={160} x2={325} y2={160} marker={marker} color={water}/></>}
    <circle cx={80} cy={160} r="5" fill={accent}/><circle cx={520} cy={160} r="5" fill={ink}/><Label x={80} y={140}>p_in</Label><Label x={520} y={140}>p_out</Label>
    <Label x={300} y={294}>Q totale = {metric(r,'flowRate')}</Label><Label x={300} y={320}>R equivalente = {metric(r,'equivalentResistance')}</Label></g>;
  }
  case 'capillary':{
   if(p.surfaceMode===1||p.surfaceMode===2)return <g><circle cx={285} cy={160} r="98" fill={water} fillOpacity={p.surfaceMode===1?'.13':'.04'} stroke={water} strokeWidth="3"/>
    {p.surfaceMode===2&&<circle cx={285} cy={160} r="91" fill="none" stroke={water} strokeWidth="2"/>}
    <Arrow x1={285} y1={160} x2={380} y2={160} marker={marker} color={ink}/><Label x={330} y={148}>r</Label><Label x={285} y={127}>p_in</Label><Label x={430} y={125}>p_out</Label>
    <Label x={285} y={28}>{p.surfaceMode===1?'Goccia: una superficie curva':'Bolla saponosa: due superfici curve'}</Label><Label x={285} y={291} color={accent}>p_in − p_out = {metric(r,'pressureDifference')}</Label><Label x={285} y={321} size={12}>Raggio = {fmt(p.radius)} m · sezione della superficie sferica</Label></g>;
   const h=value(r,'rise'),risePixels=h===0?0:Math.sign(h)*clamp(Math.abs(h)*1800,8,95),level=210-risePixels;
   const sag=12*Math.cos(p.contactAngleDeg*Math.PI/180);
   return <g><Vessel x={115} y={170} width={360} height={112}/><rect x={118} y={210} width={354} height={69} fill={water} opacity=".15"/>
    <path d="M275 45V274M325 45V274" fill="none" stroke={ink} strokeWidth="3"/><path d={`M278 ${level}Q300 ${level+sag}322 ${level}V279H278Z`} fill={water} opacity=".32"/>
    <path d={`M278 ${level}Q300 ${level+sag}322 ${level}`} fill="none" stroke={water} strokeWidth="2.5"/><path d="M120 210H270M330 210H470" stroke={water} strokeDasharray="5 4"/>
    <path d={`M330 ${level}H394M365 ${level}V210M353 210h26`} stroke={ink} fill="none" strokeDasharray="4 4"/><Label x={408} y={(level+210)/2-6} anchor="start">h = {metric(r,'rise')}</Label>
    <Label x={190} y={48} size={12}>θ = {fmt(p.contactAngleDeg)}°</Label><Label x={300} y={305}>p_gas − p_liquido = {metric(r,'pressureDifference')}</Label><Label x={300} y={329} size={11}>Menisco sferico approssimato, schema non in scala; h conserva il segno.</Label></g>;
  }
  case 'ideal-gas':
   return <Chart series={r.series} marker={marker} point={[p.volume,value(r,'pressure')]} xLabel="Volume V [m³]" yLabel="Pressione assoluta p [Pa]" footer={`Stato selezionato · T = ${fmt(p.temperatureK)} K · n = ${fmt(p.moles)} mol`}/>;
  case 'calorimetry':{
   const final=value(r,'equilibriumTemperature'),heat1=value(r,'heat1');
   return <g><Label x={300} y={27}>Sistema isolato: il calore ceduto è quello ricevuto</Label><Vessel x={70} y={80} width={130} height={155}/><Vessel x={390} y={80} width={130} height={155}/>
    <Label x={135} y={63}>Corpo 1</Label><Label x={455} y={63}>Corpo 2</Label><Label x={135} y={139}>{fmt(p.temperature1K)} K</Label><Label x={455} y={139}>{fmt(p.temperature2K)} K</Label>
    <Label x={135} y={166} size={12}>{fmt(p.mass1)} kg</Label><Label x={455} y={166} size={12}>{fmt(p.mass2)} kg</Label>
    {Math.abs(heat1)>1e-9&&<Arrow x1={heat1>0?376:215} y1={155} x2={heat1>0?215:376} y2={155} marker={marker}/>}<Label x={295} y={119} size={12}>{Math.abs(heat1)>1e-9?'Trasferimento di calore':'Già in equilibrio'}</Label>
    <path d="M90 255H500" stroke={water} strokeDasharray="4 4"/><Label x={300} y={278} color={water}>Equilibrio comune: {fmt(final)} K</Label><Label x={300} y={308}>Q₁ + Q₂ = {metric(r,'energyBalance')}</Label><Label x={300} y={329} size={11}>Capacità termiche costanti; i recipienti illustrano due corpi, non la cinetica.</Label></g>;
  }
  case 'phase-change':
   return <Chart series={r.series} marker={marker} point={[p.heat,value(r,'temperatureC')]} xLabel="Calore fornito Q [J]" yLabel="Temperatura T [°C]" footer={`Punto selezionato · frazione fusa = ${metric(r,'meltFraction')}`}/>;
  case 'heat-transfer':{
   const modes=[{title:'Conduzione',key:'conduction',x:100},{title:'Convezione',key:'convection',x:300},{title:'Irraggiamento',key:'radiation',x:500}];
   return <g><Label x={300} y={26}>Tre configurazioni distinte, con la stessa area e temperature</Label>
    {modes.map((mode,i)=><g key={mode.key}><rect x={mode.x-72} y={55} width={144} height={194} rx="10" fill={soft} opacity=".45"/>
     <Label x={mode.x} y={78}>{mode.title}</Label>
     {i===0?<><rect x={mode.x-18} y={103} width={36} height={96} fill={ink} opacity=".3"/><path d={`M${mode.x-18} 103v96M${mode.x+18} 103v96`} stroke={ink} strokeWidth="3"/></>:
      i===1?<><path d={`M${mode.x-35} 180C${mode.x-65} 115 ${mode.x+65} 115 ${mode.x+35} 180`} fill="none" stroke={water} strokeWidth="2.5" markerEnd={`url(#${marker})`}/><path d={`M${mode.x+35} 186C${mode.x+65} 220 ${mode.x-65} 220 ${mode.x-35} 186`} fill="none" stroke={water} strokeWidth="2.5" markerEnd={`url(#${marker})`}/></>:
       [-1,0,1].map(n=><path key={n} d={`M${mode.x-48} ${145+n*24}q12 -10 24 0t24 0t24 0t24 0`} transform={value(r,mode.key)<0?`translate(${2*mode.x} 0) scale(-1 1)`:undefined} fill="none" stroke={accent} strokeWidth="2" markerEnd={value(r,mode.key)!==0?`url(#${marker})`:undefined}/>)}
     {i!==2&&value(r,mode.key)!==0&&<Arrow x1={mode.x+(value(r,mode.key)>0?-55:55)} y1={153} x2={mode.x+(value(r,mode.key)>0?55:-55)} y2={153} marker={marker} color={accent}/>}
     <Label x={mode.x} y={232} color={accent} size={12}>{metric(r,mode.key)}</Label></g>)}
    <Label x={300} y={283}>Superficie: {fmt(p.hotTemperatureK)} K · ambiente: {fmt(p.coldTemperatureK)} K</Label><Label x={300} y={309} size={12}>Potenza firmata nella convenzione superficie → ambiente.</Label><Label x={300} y={330} size={11}>I tre valori non si sommano senza un modello di accoppiamento.</Label></g>;
  }
  case 'process':
   return <Chart series={r.series} marker={marker} point={[value(r,'finalVolume'),value(r,'finalPressure')]} xLabel="Volume V [m³]" yLabel="Pressione assoluta p [Pa]" fillArea footer={`W = ${metric(r,'work')} · Q = ${metric(r,'heat')} · ΔU = ${metric(r,'internalEnergyChange')}`}/>;
  case 'carnot':
   return <Chart series={r.series} marker={marker} labels={['Isoterma calda','Adiabatica: espansione','Isoterma fredda','Adiabatica: compressione']} xLabel="Volume V [m³]" yLabel="Pressione assoluta p [Pa]"/>;
  case 'entropy':
   return <Chart series={r.series} marker={marker} xLabel="Frazione dello scambio [1] — non tempo" yLabel="Entropia totale prodotta [J/K]" footer={`ΔS₁ = ${metric(r,'entropy1')} · ΔS₂ = ${metric(r,'entropy2')}`}/>;
 }
}

/** Accessible 2D projection; every number comes from the same model result. */
export function LabDiagram({definition,parameters,result}:{definition:LabDefinition;parameters:Parameters;result:LabResult}){
 const id='lab-diagram-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 const descriptions:Partial<Record<LabDefinition['id'],string>>={
  manometer:'Due rami comunicanti mostrano livelli diversi. Il dislivello firmato corrisponde alla differenza di pressione.',
  hydrostatic:'La pressione aumenta scendendo nella colonna. La sonda distingue pressione assoluta e sovrapressione.',
  pascal:'Due pistoni collegati trasmettono lo stesso incremento di pressione. Aree, forze e rapporto degli spostamenti sono collegati.',
  buoyancy:'Il corpo attraversa la superficie: il volume immerso determina la spinta, confrontata con il peso.',
  continuity:'Due sezioni di uno stesso condotto confrontano la velocità media a portata conservata.',
  venturi:'Il condotto cambia sezione e quota. Pressione e velocità sono confrontate a energia meccanica conservata.',
  poiseuille:'Profilo parabolico delle velocità lungo il diametro: massimo sull’asse, nullo sulle pareti.',
  'hydraulic-network':'Due resistenze sono collegate in serie o parallelo. Il diagramma distingue portate e cadute di pressione.',
  capillary:'La vista distingue risalita in un tubo, goccia sferica e bolla con due interfacce.',
  'ideal-gas':'Il grafico mostra l’isoterma del gas ideale con punto sullo stato selezionato.',
  calorimetry:'Due corpi a temperature iniziali diverse raggiungono una temperatura comune conservando l’energia.',
  'phase-change':'La curva temperatura-calore mostra il riscaldamento del ghiaccio, il plateau di fusione e quello dell’acqua liquida.',
  'heat-transfer':'Tre configurazioni separate illustrano conduzione, convezione e irraggiamento senza sommarle.',
  process:'Il cammino pressione-volume mostra gli stati e l’area del lavoro, confrontata con calore ed energia interna.',
  carnot:'Quattro tratti orientati formano un ciclo reversibile nel piano pressione-volume.',
  entropy:'L’entropia totale cresce durante uno scambio isolato. L’ascissa è frazione dello scambio e non tempo.',
 };
 return <svg className="lab-diagram" viewBox="0 0 600 345" width="100%" role="img" aria-labelledby={`${id}-title ${id}-desc`} style={{display:'block',fontFamily:'inherit',color:ink}}>
  <title id={`${id}-title`}>{definition.title} · rappresentazione 2D</title><desc id={`${id}-desc`}>{descriptions[definition.id]} Misure esatte e dati equivalenti sono disponibili nella tabella del laboratorio.</desc>
  <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
  <Diagram definition={definition} parameters={parameters} result={result} marker={`${id}-arrow`}/>
 </svg>;
}
