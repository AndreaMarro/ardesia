import {getLab} from './definitions';
import type {LabId,LabResult,Measurement,Parameters,Series} from './types';

export {getLab,defaultParameters,labDefinitions} from './definitions';
export const GAS_CONSTANT=8.31446261815324;
export const STEFAN_BOLTZMANN=5.670374419e-8;
export const WATER_FUSION_LATENT_HEAT=334000;
const CV=1.5*GAS_CONSTANT;
const GAMMA=5/3;
const m=(key:string,label:string,unit:string,value:number):Measurement=>({key,label,unit,value});
const sample=(fn:(x:number)=>number,start:number,end:number,count=41):[number,number][]=>
 Array.from({length:count},(_,i):[number,number]=>{const x=start+(end-start)*i/(count-1);return [x,fn(x)];});
const series=(label:string,unit:string,xUnit:string,points:[number,number][]):Series=>({label,unit,xUnit,points});
function result(primary:Measurement,measurements:Measurement[],curves:Series[]=[],warnings:string[]=[]):LabResult{
 const numbers=[primary.value,...measurements.map(v=>v.value),...curves.flatMap(s=>s.points.flat())];
 if(numbers.some(v=>!Number.isFinite(v)))throw new RangeError('Risultato fuori dal dominio numerico del modello.');
 return {primary,measurements,series:curves,warnings};
}

/** Strict SI parameter validation, before evaluating any formula. */
export function validateParameters(id:LabId,value:unknown):Parameters{
 const specification=getLab(id).parameters;
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)
  throw new RangeError('La configurazione deve contenere parametri numerici.');
 const data=value as Record<string,unknown>;
 if(Object.keys(data).length!==specification.length||Object.keys(data).some(key=>!specification.some(p=>p.key===key)))
  throw new RangeError('Parametri mancanti o non riconosciuti dal modello.');
 const validated:Parameters={};
 for(const p of specification){
  const n=data[p.key];
  if(typeof n!=='number'||!Number.isFinite(n)||n<p.min||n>p.max)
   throw new RangeError(`${p.label}: usare un numero finito fra ${p.min} e ${p.max} ${p.unit}.`);
  if(['path','topology','boundary','surfaceMode'].includes(p.key)&&!Number.isInteger(n))throw new RangeError(`${p.label}: selezionare una modalità intera.`);
  validated[p.key]=n;
 }
 return validated;
}

function thermalEquilibrium(p:Parameters){
 const c1=p.mass1*p.specificHeat1,c2=p.mass2*p.specificHeat2;
 const final=(c1*p.temperature1K+c2*p.temperature2K)/(c1+c2);
 return {c1,c2,final,q1:c1*(final-p.temperature1K),q2:c2*(final-p.temperature2K)};
}

export function evaluateLab(id:LabId,parameters:Parameters):LabResult{
 const p=validateParameters(id,parameters);
 switch(id){
  case 'manometer':{
   const pressure=p.density*p.gravity*p.heightDifference;
   const output=m('pressureDifference','Differenza di pressione p₁−p₂','Pa',pressure);
   return result(output,[output,m('density','Densità del liquido','kg/m³',p.density),m('heightDifference','Differenza di livello firmata','m',p.heightDifference)],
    [series('Differenza di pressione','Pa','m',sample(h=>p.density*p.gravity*h,-1,1))]);
  }
  case 'hydrostatic':{
   const gauge=p.density*p.gravity*p.depth;
   const output=m('absolutePressure','Pressione assoluta alla profondità scelta','Pa',p.surfacePressure+gauge);
   return result(output,[output,m('gaugePressure','Sovrapressione rispetto alla superficie','Pa',gauge)],
    [series('Pressione assoluta','Pa','m',sample(h=>p.surfacePressure+p.density*p.gravity*h,0,Math.max(1,p.depth))),
     series('Sovrapressione','Pa','m',sample(h=>p.density*p.gravity*h,0,Math.max(1,p.depth)))]);
  }
  case 'pascal':{
   const pressure=p.inputForce/p.inputArea,force=pressure*p.outputArea;
   const output=m('outputForce','Forza sul secondo pistone','N',force);
   return result(output,[output,m('pressure','Incremento di pressione','Pa',pressure),m('forceRatio','Rapporto delle forze F₂/F₁ (rapporto delle aree)','1',p.outputArea/p.inputArea),m('displacementRatio','Rapporto spostamenti Δx₂/Δx₁','1',p.inputArea/p.outputArea)],
    [series('Forza di uscita a forza di ingresso fissata','N','m²',sample(area=>pressure*area,.001,Math.min(1,Math.max(.01,p.outputArea*1.5))))]);
  }
  case 'buoyancy':{
   const displaced=p.volume*p.submergedFraction,buoyancy=p.fluidDensity*p.gravity*displaced,weight=p.bodyDensity*p.gravity*p.volume;
   const output=m('buoyancy','Spinta di Archimede','N',buoyancy);
   const equilibrium=p.bodyDensity/p.fluidDensity;
   return result(output,[output,m('weight','Peso del corpo','N',weight),m('netForce','Risultante verticale delle sole spinta e peso','N',buoyancy-weight),m('displacedVolume','Volume di fluido spostato','m³',displaced),m('equilibriumFraction','Frazione immersa richiesta per equilibrio','1',equilibrium)],
    [series('Spinta di Archimede','N','1',sample(f=>p.fluidDensity*p.gravity*p.volume*f,0,1)),series('Peso','N','1',[[0,weight],[1,weight]])],
    equilibrium>1?['La frazione di equilibrio supera 1: questo corpo non può galleggiare in equilibrio con le sole spinta e peso.']:Math.abs(buoyancy-weight)>1e-9?['Immersione imposta: le due forze non si equilibrano. Il corpo accelera o richiede un vincolo.']:[]);
  }
  case 'continuity':{
   const speed1=p.flowRate/p.area1,speed2=p.flowRate/p.area2;
   const output=m('speed2','Velocità media nella seconda sezione','m/s',speed2);
   return result(output,[output,m('speed1','Velocità media nella prima sezione','m/s',speed1),m('flowRate','Portata in entrambe le sezioni','m³/s',p.flowRate),m('radius1','Raggio circolare equivalente prima sezione','m',Math.sqrt(p.area1/Math.PI)),m('radius2','Raggio circolare equivalente seconda sezione','m',Math.sqrt(p.area2/Math.PI))],
    [series('Velocità media a portata fissata','m/s','m²',sample(a=>p.flowRate/a,.0001,.02))]);
  }
  case 'venturi':{
   const flow=p.area1*p.speed1,speed2=flow/p.area2;
   const pressure2=p.pressure1+.5*p.density*(p.speed1**2-speed2**2)+p.density*p.gravity*(p.height1-p.height2);
   if(pressure2<=0||pressure2>1e8||speed2>100)throw new RangeError('Configurazione esclusa: pressione assoluta non positiva/oltre 10⁸ Pa oppure velocità oltre 100 m/s.');
   const e1=p.pressure1+.5*p.density*p.speed1**2+p.density*p.gravity*p.height1;
   const e2=pressure2+.5*p.density*speed2**2+p.density*p.gravity*p.height2;
   const output=m('pressure2','Pressione assoluta nella seconda sezione','Pa',pressure2);
   return result(output,[output,m('speed2','Velocità nella seconda sezione','m/s',speed2),m('flowRate','Portata volumetrica','m³/s',flow),m('energyDensity1','Energia meccanica per unità di volume, sezione 1','Pa',e1),m('energyDensity2','Energia meccanica per unità di volume, sezione 2','Pa',e2)],
    [series('Pressione statica','Pa','1',[[1,p.pressure1],[2,pressure2]]),series('Termine cinetico','Pa','1',[[1,.5*p.density*p.speed1**2],[2,.5*p.density*speed2**2]]),series('Termine gravitazionale','Pa','1',[[1,p.density*p.gravity*p.height1],[2,p.density*p.gravity*p.height2]])]);
  }
  case 'poiseuille':{
   const resistance=8*p.viscosity*p.length/(Math.PI*p.radius**4);
   const flow=p.boundary===0?p.pressureDifference/resistance:p.flowRate;
   const pressure=p.boundary===0?p.pressureDifference:flow*resistance;
   const mean=flow/(Math.PI*p.radius**2),maximum=2*mean;
   const reynolds=p.density*mean*2*p.radius/p.viscosity;
   if(reynolds>2300)throw new RangeError('Re supera 2300: il modello laminare di Poiseuille non è applicabile a questa configurazione.');
   const output=p.boundary===0?m('flowRate','Portata a Δp fissata','m³/s',flow):m('pressureDifference','Differenza di pressione a Q fissata','Pa',pressure);
   return result(output,[m('flowRate','Portata volumetrica','m³/s',flow),m('pressureDifference','Differenza di pressione','Pa',pressure),m('resistance','Resistenza idraulica','Pa·s/m³',resistance),m('meanSpeed','Velocità media','m/s',mean),m('maxSpeed','Velocità sull’asse','m/s',maximum),m('reynolds','Numero di Reynolds','1',reynolds)],
    [series('Profilo locale di velocità lungo il diametro','m/s','m',sample(s=>maximum*(1-(s/p.radius)**2),-p.radius,p.radius))],
    ['Profilo analitico completamente sviluppato; nessun moto transitorio, turbolento o particellare è simulato.']);
  }
  case 'hydraulic-network':{
   const parallel=p.topology===1;
   const equivalent=parallel?p.resistance1*p.resistance2/(p.resistance1+p.resistance2):p.resistance1+p.resistance2;
   const total=p.pressureDifference/equivalent;
   const flow1=parallel?p.pressureDifference/p.resistance1:total,flow2=parallel?p.pressureDifference/p.resistance2:total;
   const drop1=p.resistance1*flow1,drop2=p.resistance2*flow2;
   const output=m('flowRate','Portata totale','m³/s',total);
   return result(output,[output,m('equivalentResistance','Resistenza equivalente','Pa·s/m³',equivalent),m('flow1','Portata nel primo resistore','m³/s',flow1),m('flow2','Portata nel secondo resistore','m³/s',flow2),m('pressureDrop1','Caduta sul primo resistore','Pa',drop1),m('pressureDrop2','Caduta sul secondo resistore','Pa',drop2)],
    [series('Cadute di pressione nei resistori','Pa','1',[[1,drop1],[2,drop2]])]);
  }
  case 'capillary':{
   const bond=p.density*p.gravity*p.radius**2/p.surfaceTension;
   if(p.surfaceMode!==0){
    const interfaces=p.surfaceMode===2?2:1;
    const pressure=interfaces*2*p.surfaceTension/p.radius;
    const output=m('pressureDifference','Sovrapressione interna rispetto all’esterno','Pa',pressure);
    return result(output,[output,m('rise','Nessuna risalita modellata in questa geometria','m',0),m('curvature','Curvatura sferica 1/r','1/m',1/p.radius),m('interfaces','Numero di interfacce','1',interfaces)],
     [series('Sovrapressione al variare del raggio','Pa','m',sample(r=>interfaces*2*p.surfaceTension/r,.00005,.002))],
     ['Geometria sferica: angolo di contatto, densità e gravità non entrano in questo bilancio di Laplace. Nessuna risalita capillare è calcolata.']);
   }
   if(bond>.25)throw new RangeError('Numero di Bond oltre 0,25: il menisco sferico sottile esce dal dominio didattico dichiarato.');
   // The exact right-angle case is geometrically planar, not a floating-point residual.
   const cosine=p.contactAngleDeg===90?0:Math.cos(p.contactAngleDeg*Math.PI/180);
   const curvature=cosine/p.radius,pressure=2*p.surfaceTension*curvature,rise=pressure/(p.density*p.gravity);
   const maximumRadius=Math.min(.002,Math.sqrt(.25*p.surfaceTension/(p.density*p.gravity)));
   const output=m('rise','Risalita capillare firmata','m',rise);
   return result(output,[output,m('pressureDifference','p_gas−p_liquido alla superficie','Pa',pressure),m('curvature','Curvatura sferica firmata 1/R','1/m',curvature),m('contactAngleDeg','Angolo di contatto nel liquido','°',p.contactAngleDeg),m('bondNumber','Numero di Bond','1',bond)],
    [series('Risalita al variare del raggio','m','m',sample(r=>2*p.surfaceTension*cosine/(p.density*p.gravity*r),.00005,maximumRadius))],
    ['Menisco sferico approssimato. La forma vicino al raccordo con il serbatoio e la dinamica non sono calcolate.']);
  }
  case 'ideal-gas':{
   const pressure=p.moles*GAS_CONSTANT*p.temperatureK/p.volume;
   if(pressure>1e8)throw new RangeError('Pressione oltre 10⁸ Pa: configurazione esclusa dal modello di gas ideale.');
   // Keep every isotherm sample inside the same pressure limit as the selected state.
   const minimumVolume=Math.max(.00001,p.volume/3,p.moles*GAS_CONSTANT*p.temperatureK/1e8*(1+4*Number.EPSILON));
   const output=m('pressure','Pressione assoluta','Pa',pressure);
   return result(output,[output,m('volume','Volume del gas','m³',p.volume),m('temperatureK','Temperatura assoluta','K',p.temperatureK),m('pv','Prodotto pV','J',pressure*p.volume),m('nrt','Prodotto nRT','J',p.moles*GAS_CONSTANT*p.temperatureK)],
    [series('Isoterma a n e T fissati','Pa','m³',sample(v=>p.moles*GAS_CONSTANT*p.temperatureK/v,minimumVolume,Math.min(.01,p.volume*3)))]);
  }
  case 'calorimetry':{
   const e=thermalEquilibrium(p),output=m('equilibriumTemperature','Temperatura di equilibrio','K',e.final);
   return result(output,[output,m('heat1','Calore ricevuto dal primo corpo','J',e.q1),m('heat2','Calore ricevuto dal secondo corpo','J',e.q2),m('energyBalance','Somma dei calori scambiati','J',e.q1+e.q2),m('heatCapacity1','Capacità termica primo corpo','J/K',e.c1),m('heatCapacity2','Capacità termica secondo corpo','J/K',e.c2)],
    [series('Temperatura iniziale','K','1',[[1,p.temperature1K],[2,p.temperature2K]]),series('Temperatura finale','K','1',[[1,e.final],[2,e.final]])]);
  }
  case 'phase-change':{
   const sensibleIce=p.mass*2100*(-p.initialTemperatureC),fusion=p.mass*WATER_FUSION_LATENT_HEAT;
   const end=sensibleIce+fusion+p.mass*4186*100;
   if(p.heat>end)throw new RangeError('Il calore supera l’inizio della vaporizzazione: questa esperienza termina a 100°C.');
   const temperature=(q:number)=>q<sensibleIce?p.initialTemperatureC+q/(p.mass*2100):q<=sensibleIce+fusion?0:(q-sensibleIce-fusion)/(p.mass*4186);
   const fraction=Math.max(0,Math.min(1,(p.heat-sensibleIce)/fusion));
   const maximumHeat=Math.min(end,3e6);
   const curve:[number,number][]=[[0,p.initialTemperatureC],[sensibleIce,0],[sensibleIce+fusion,0],[end,100]];
   const points=curve.filter(([q])=>q<=maximumHeat);
   if(points.at(-1)![0]<maximumHeat)points.push([maximumHeat,temperature(maximumHeat)]);
   const output=m('temperatureC','Temperatura del sistema','°C',temperature(p.heat));
   return result(output,[output,m('meltFraction','Frazione di massa fusa','1',fraction),m('heatToMeltStart','Calore per raggiungere 0°C','J',sensibleIce),m('fusionHeat','Calore per fondere tutta la massa','J',fusion),m('heatToMeltEnd','Calore totale per terminare la fusione','J',sensibleIce+fusion)],
    [series('Curva di riscaldamento','°C','J',points)]);
  }
  case 'heat-transfer':{
   const delta=p.hotTemperatureK-p.coldTemperatureK;
   const conduction=p.conductivity*p.area*delta/p.thickness;
   const convection=p.convectionCoefficient*p.area*delta;
   // Factorization is accurate at equal and nearly equal temperatures.
   const radiation=p.emissivity*STEFAN_BOLTZMANN*p.area*delta*(p.hotTemperatureK+p.coldTemperatureK)*(p.hotTemperatureK**2+p.coldTemperatureK**2);
   const output=m('conduction','Potenza per conduzione','W',conduction);
   return result(output,[output,m('convection','Potenza per convezione','W',convection),m('radiation','Potenza netta per irraggiamento','W',radiation)],
    [series('Potenze in tre configurazioni distinte','W','1',[[1,conduction],[2,convection],[3,radiation]])],
    [delta<0?'Il flusso netto è negativo nella convenzione superficie→ambiente: le temperature scelte invertono il verso del trasferimento.':'I tre valori si riferiscono a configurazioni diverse: non sono tre contributi da sommare senza un modello di accoppiamento.']);
  }
  case 'process':{
   const freeExpansion=p.path===4;
   if(p.path===2&&Math.abs(p.volume2-p.volume1)>1e-12*Math.max(p.volume1,p.volume2))
    throw new RangeError('La trasformazione isocora richiede volume finale uguale al volume iniziale.');
   if(freeExpansion&&p.volume2<=p.volume1)
    throw new RangeError('La libera espansione nel vuoto richiede volume finale maggiore del volume iniziale.');
   const startPressure=p.moles*GAS_CONSTANT*p.temperatureK/p.volume1;
   const finalVolume=p.path===2?p.volume1:p.volume2;
   const finalTemperature=p.path===0||freeExpansion?p.temperatureK:p.path===1?p.temperatureK*finalVolume/p.volume1:p.path===2?p.temperature2K:p.temperatureK*(p.volume1/finalVolume)**(GAMMA-1);
   const finalPressure=p.moles*GAS_CONSTANT*finalTemperature/finalVolume;
   if(finalTemperature<50||finalTemperature>2000||Math.max(startPressure,finalPressure)>1e8)
    throw new RangeError('Lo stato finale esce dal dominio: 50–2000 K e pressione assoluta non oltre 10⁸ Pa.');
   const internal=p.moles*CV*(finalTemperature-p.temperatureK);
   const work=p.path===0?p.moles*GAS_CONSTANT*p.temperatureK*Math.log(finalVolume/p.volume1):p.path===1?startPressure*(finalVolume-p.volume1):p.path===2||freeExpansion?0:-internal;
   const heat=p.path===3||freeExpansion?0:internal+work;
   const entropy=p.path===3?0:p.moles*CV*Math.log(finalTemperature/p.temperatureK)+p.moles*GAS_CONSTANT*Math.log(finalVolume/p.volume1);
   const pressureAt=(volume:number)=>p.path===0?p.moles*GAS_CONSTANT*p.temperatureK/volume:p.path===1?startPressure:startPressure*(p.volume1/volume)**GAMMA;
   const curves=freeExpansion?
    [series('Solo stato iniziale di equilibrio','Pa','m³',[[p.volume1,startPressure]]),series('Solo stato finale di equilibrio','Pa','m³',[[finalVolume,finalPressure]])]:
    [series('Cammino p–V','Pa','m³',p.path===2?[[p.volume1,startPressure],[p.volume1,finalPressure]]:sample(pressureAt,p.volume1,finalVolume,61))];
   const output=m('work','Lavoro compiuto dal gas','J',work);
   return result(output,[output,m('heat','Calore ricevuto dal gas','J',heat),m('internalEnergyChange','Variazione di energia interna','J',internal),m('finalTemperature','Temperatura finale','K',finalTemperature),m('finalPressure','Pressione finale','Pa',finalPressure),m('finalVolume','Volume finale effettivo','m³',finalVolume),m('entropyChange','Variazione di entropia del gas','J/K',entropy),m('totalEntropyChange','Variazione di entropia totale','J/K',freeExpansion?entropy:0)],
    curves,freeExpansion?['Libera espansione isolata nel vuoto: nessun cammino di equilibrio intermedio è definito. I due punti non vanno collegati; nessuna area del grafico rappresenta il lavoro, che è zero. ΔS_gas=ΔS_totale>0.']:
     p.path===2?['Cammino isocoro: il volume resta costante e la temperatura finale è quella impostata nei dati.']:['La temperatura finale è determinata dal cammino. Il controllo della temperatura finale si usa solo nell’isocora.']);
  }
  case 'carnot':{
   if(p.hotTemperatureK<=p.coldTemperatureK)throw new RangeError('Un motore di Carnot richiede T_h>T_c>0 in kelvin.');
   const efficiency=1-p.coldTemperatureK/p.hotTemperatureK,rejected=p.heatInput*p.coldTemperatureK/p.hotTemperatureK,work=p.heatInput-rejected;
   // A specific original cycle: V_B/V_A=2, monoatomic gas. n follows from Q_h=nRT_h ln2.
   const nr=p.heatInput/(p.hotTemperatureK*Math.log(2));
   const va=.001,vb=2*va,expansion=(p.hotTemperatureK/p.coldTemperatureK)**(1/(GAMMA-1)),vc=vb*expansion,vd=va*expansion;
   const hot=sample(v=>nr*p.hotTemperatureK/v,va,vb,31);
   const adiabatDown=sample(v=>nr*p.hotTemperatureK/vb*(vb/v)**GAMMA,vb,vc,31);
   const cold=sample(v=>nr*p.coldTemperatureK/v,vc,vd,31);
   const adiabatUp=sample(v=>nr*p.coldTemperatureK/vd*(vd/v)**GAMMA,vd,va,31);
   const output=m('efficiency','Rendimento reversibile massimo','1',efficiency);
   return result(output,[output,m('work','Lavoro netto per ciclo','J',work),m('heatInput','Calore assorbito dalla sorgente calda','J',p.heatInput),m('heatRejected','Calore ceduto alla sorgente fredda','J',rejected),m('hotReservoirEntropy','Entropia della sorgente calda','J/K',-p.heatInput/p.hotTemperatureK),m('coldReservoirEntropy','Entropia della sorgente fredda','J/K',rejected/p.coldTemperatureK)],
    [series('Isoterma calda: espansione','Pa','m³',hot),series('Adiabatica: espansione','Pa','m³',adiabatDown),series('Isoterma fredda: compressione','Pa','m³',cold),series('Adiabatica: compressione','Pa','m³',adiabatUp)],
    ['Il grafico costruisce un ciclo monoatomico reversibile con V_B/V_A=2 e quantità di sostanza scelta da Q_h=nRT_h ln2. Il gas ritorna allo stato iniziale.']);
  }
  case 'entropy':{
   const e=thermalEquilibrium(p);
   const first=e.c1*Math.log(e.final/p.temperature1K),second=e.c2*Math.log(e.final/p.temperature2K);
   const total=Math.max(0,first+second);
   const output=m('entropyChange','Variazione di entropia totale','J/K',total);
   const entropyAt=(fraction:number)=>e.c1*Math.log((p.temperature1K+(e.final-p.temperature1K)*fraction)/p.temperature1K)+e.c2*Math.log((p.temperature2K+(e.final-p.temperature2K)*fraction)/p.temperature2K);
   return result(output,[output,m('entropy1','Variazione di entropia primo corpo','J/K',first),m('entropy2','Variazione di entropia secondo corpo','J/K',second),m('equilibriumTemperature','Temperatura finale comune','K',e.final),m('heat1','Calore ricevuto primo corpo','J',e.q1),m('heat2','Calore ricevuto secondo corpo','J',e.q2)],
    [series('Entropia totale prodotta durante lo scambio','J/K','1',sample(x=>Math.max(0,entropyAt(x)),0,1))]);
  }
 }
}
