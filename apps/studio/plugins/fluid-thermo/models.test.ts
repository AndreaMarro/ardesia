import {describe,expect,it} from 'vitest';
import {defaultParameters,evaluateLab,GAS_CONSTANT,labDefinitions} from './models';
import type {LabId,LabResult,Parameters} from './types';

const value=(result:LabResult,key:string)=>{
 const measurement=result.measurements.find(m=>m.key===key);
 if(!measurement)throw Error(`Missing measurement ${key}`);
 return measurement.value;
};
const run=(id:LabId,patch:Parameters={})=>evaluateLab(id,{...defaultParameters(id),...patch});

describe('Sixteen bounded, distinct analytical labs',()=>{
 it('has a valid reference and a reproducible different preset for every model',()=>{
  expect(labDefinitions).toHaveLength(16);
  expect(new Set(labDefinitions.map(d=>d.id)).size).toBe(16);
  for(const d of labDefinitions){
   expect(d.objectiveIds.length).toBeGreaterThan(0);
   expect(d.objectiveIds.every(id=>/^U[35]-\d{2}\.\d{2}$/.test(id))).toBe(true);
   expect(new Set(d.objectiveIds).size).toBe(d.objectiveIds.length);
   expect(d.presets.length).toBeGreaterThanOrEqual(2);
   expect(d.presets[0].parameters).not.toEqual(d.presets[1].parameters);
   for(const preset of d.presets){
    const a=evaluateLab(d.id,preset.parameters),b=evaluateLab(d.id,structuredClone(preset.parameters));
    expect(a).toEqual(b);expect(Number.isFinite(a.primary.value)).toBe(true);
    expect(a.measurements.length).toBeGreaterThan(1);
    expect(a.series.length).toBeGreaterThan(0);
   }
  }
 });
 it('rejects non-numbers, non-finite values, unknown keys, missing keys and fractional modes',()=>{
  const base=defaultParameters('hydrostatic');
  for(const bad of [NaN,Infinity,-Infinity,true,'2',null,{},[]])
   expect(()=>evaluateLab('hydrostatic',{...base,depth:bad} as unknown as Parameters)).toThrow(RangeError);
  expect(()=>evaluateLab('hydrostatic',{...base,unexpected:1})).toThrow(RangeError);
  const missing={...base};delete missing.depth;
  expect(()=>evaluateLab('hydrostatic',missing)).toThrow(RangeError);
  expect(()=>run('process',{path:.5})).toThrow(RangeError);
  expect(()=>run('hydraulic-network',{topology:.5})).toThrow(RangeError);
  expect(()=>run('poiseuille',{boundary:.5})).toThrow(RangeError);
 });
 it('rejects every scalar outside its declared interval and never mutates input',()=>{
  for(const d of labDefinitions){
   const original=defaultParameters(d.id),frozen=Object.freeze({...original});
   expect(()=>evaluateLab(d.id,frozen)).not.toThrow();
   expect(frozen).toEqual(original);
   for(const p of d.parameters){
    expect(()=>run(d.id,{[p.key]:p.min-Math.max(1,Math.abs(p.min))})).toThrow(RangeError);
    expect(()=>run(d.id,{[p.key]:p.max+Math.max(1,Math.abs(p.max))})).toThrow(RangeError);
   }
  }
 });
});

describe('Hydrostatics and hydraulic geometry',()=>{
 it('preserves manometer sign, zero and density scaling',()=>{
  const positive=run('manometer',{density:1000,gravity:10,heightDifference:.2});
  expect(positive.primary.value).toBe(2000);
  expect(run('manometer',{density:1000,gravity:10,heightDifference:-.2}).primary.value).toBe(-2000);
  expect(run('manometer',{heightDifference:0}).primary.value).toBe(0);
  expect(run('manometer',{density:2000,gravity:10,heightDifference:.2}).primary.value).toBe(4000);
 });
 it('returns surface pressure at zero depth and distinguishes absolute/gauge scaling',()=>{
  expect(run('hydrostatic',{depth:0,surfacePressure:100000}).primary.value).toBe(100000);
  const first=run('hydrostatic',{density:1000,gravity:10,depth:2,surfacePressure:100000});
  const twice=run('hydrostatic',{density:1000,gravity:10,depth:4,surfacePressure:100000});
  expect(first.primary.value).toBe(120000);
  expect(twice.primary.value).toBe(140000);
  expect(value(twice,'gaugePressure')).toBe(2*value(first,'gaugePressure'));
 });
 it('Pascal trades displacement for force without multiplying work',()=>{
  const r=run('pascal',{inputForce:100,inputArea:.01,outputArea:.05});
  expect(r.primary.value).toBe(500);
  expect(value(r,'pressure')).toBe(10000);
  expect(value(r,'displacementRatio')).toBeCloseTo(.2,12);
  expect(r.primary.value*value(r,'displacementRatio')).toBeCloseTo(100,12);
  expect(run('pascal',{inputForce:0}).primary.value).toBe(0);
  expect(run('pascal',{outputArea:1}).series[0].points.every(([area])=>area>=.001&&area<=1)).toBe(true);
 });
 it('Archimedes balances only at the appropriate immersed fraction',()=>{
  const equilibrium=run('buoyancy',{fluidDensity:1000,bodyDensity:600,volume:.001,submergedFraction:.6,gravity:10});
  expect(equilibrium.primary.value).toBeCloseTo(6,12);expect(value(equilibrium,'weight')).toBeCloseTo(6,12);
  expect(value(equilibrium,'netForce')).toBeCloseTo(0,12);
  expect(run('buoyancy',{submergedFraction:0}).primary.value).toBe(0);
  const sunk=run('buoyancy',{bodyDensity:1500,submergedFraction:1});
  expect(value(sunk,'netForce')).toBeLessThan(0);
  expect(value(sunk,'equilibriumFraction')).toBe(1.5);
  expect(sunk.warnings.join(' ')).toContain('non può galleggiare');
 });
 it('continuity preserves Q and quadruples speed when circular radius halves',()=>{
  const r=run('continuity',{flowRate:.001,area1:.002,area2:.0005});
  expect(value(r,'speed1')).toBe(.5);expect(value(r,'speed2')).toBe(2);
  expect(value(r,'speed1')*.002).toBeCloseTo(value(r,'speed2')*.0005,15);
  expect(run('continuity',{flowRate:0}).primary.value).toBe(0);
 });
 it('Venturi conserves mechanical energy including height and rejects impossible pressure',()=>{
  const r=run('venturi',{density:1000,gravity:10,area1:.002,area2:.001,speed1:1,pressure1:150000,height1:0,height2:2});
  expect(value(r,'speed2')).toBe(2);expect(r.primary.value).toBe(128500);
  expect(value(r,'energyDensity1')).toBeCloseTo(value(r,'energyDensity2'),10);
  expect(()=>run('venturi',{pressure1:1000,height1:0,height2:5})).toThrow(RangeError);
 });
});

describe('Viscosity, networks and surfaces',()=>{
 it('Poiseuille matches a golden and r⁴ at fixed Δp versus reciprocal r⁴ at fixed Q',()=>{
  const reference=run('poiseuille');
  // r=1mm,L=.5m,η=1mPa·s,Δp=100Pa gives π·2.5·10⁻⁸m³/s.
  expect(value(reference,'flowRate')).toBeCloseTo(7.853981633974483e-8,17);
  const larger=run('poiseuille',{radius:.002});
  expect(value(larger,'flowRate')/value(reference,'flowRate')).toBeCloseTo(16,12);
  const q=run('poiseuille',{boundary:1,radius:.001}),qLarger=run('poiseuille',{boundary:1,radius:.002});
  expect(value(qLarger,'flowRate')).toBe(value(q,'flowRate'));
  expect(value(qLarger,'pressureDifference')/value(q,'pressureDifference')).toBeCloseTo(1/16,14);
 });
 it('Poiseuille no-slip profile integrates to Q and flags a turbulent candidate',()=>{
  const r=run('poiseuille'),radius=defaultParameters('poiseuille').radius;
  expect(r.series[0].points[0][1]).toBeCloseTo(0,14);
  expect(r.series[0].points.at(-1)![1]).toBeCloseTo(0,14);
  expect(value(r,'maxSpeed')).toBe(2*value(r,'meanSpeed'));
  expect(r.series[0].points.every(([position,speed])=>Math.abs(position)<=radius*(1+1e-12)&&speed>=-1e-12&&speed<=value(r,'maxSpeed')*(1+1e-12))).toBe(true);
  // Disk-area average of the parabola is half its axis value.
  expect(.5*value(r,'maxSpeed')*Math.PI*radius**2).toBeCloseTo(value(r,'flowRate'),17);
  expect(()=>run('poiseuille',{radius:.005,pressureDifference:1000,viscosity:.0005})).toThrow(/Re supera 2300/);
 });
 it('series adds pressure drops; parallel adds branch flows and lowers resistance',()=>{
  const a=run('hydraulic-network',{resistance1:1e7,resistance2:1e7,pressureDifference:1000,topology:0});
  const b=run('hydraulic-network',{resistance1:1e7,resistance2:1e7,pressureDifference:1000,topology:1});
  expect(value(a,'equivalentResistance')).toBe(2e7);
  expect(value(b,'equivalentResistance')).toBe(5e6);
  expect(value(a,'pressureDrop1')+value(a,'pressureDrop2')).toBe(1000);
  expect(value(a,'flow1')).toBe(value(a,'flow2'));
  expect(value(b,'flow1')+value(b,'flow2')).toBe(value(b,'flowRate'));
  expect(value(b,'pressureDrop1')).toBe(1000);expect(value(b,'pressureDrop2')).toBe(1000);
 });
 it('capillary rise reverses at 90°, scales with inverse radius, and satisfies Laplace/Stevino',()=>{
  const a=run('capillary',{contactAngleDeg:60,radius:.0005});
  const b=run('capillary',{contactAngleDeg:120,radius:.0005});
  expect(a.primary.value).toBeGreaterThan(0);expect(b.primary.value).toBeLessThan(0);
  expect(a.primary.value).toBeCloseTo(-b.primary.value,12);
  expect(run('capillary',{contactAngleDeg:90}).primary.value).toBe(0);
  expect(run('capillary',{contactAngleDeg:60,radius:.001}).primary.value).toBeCloseTo(a.primary.value/2,12);
  expect(value(a,'pressureDifference')).toBeCloseTo(1000*9.81*a.primary.value,10);
  const drop=run('capillary',{surfaceMode:1,radius:.001,surfaceTension:.072});
  const bubble=run('capillary',{surfaceMode:2,radius:.001,surfaceTension:.072});
  expect(drop.primary.value).toBeCloseTo(144,12);expect(bubble.primary.value).toBeCloseTo(288,12);
  expect(value(drop,'rise')).toBe(0);expect(value(bubble,'rise')).toBe(0);
  expect(run('capillary',{surfaceMode:1,radius:.001,surfaceTension:.072,contactAngleDeg:120}).primary.value).toBe(drop.primary.value);
  expect(()=>run('capillary',{surfaceMode:.5})).toThrow(RangeError);
 });
 it('keeps every capillary curve sample inside its declared small-Bond domain',()=>{
  const r=run('capillary',{density:1000,gravity:10,surfaceTension:.072,radius:.001});
  expect(r.series[0].points.every(([radius])=>radius>=.00005&&radius<=.002&&1000*10*radius**2/.072<=.25+1e-12)).toBe(true);
  expect(r.series[0].points.at(-1)![0]).toBeLessThan(.002);
 });
});

describe('Thermodynamics and irreversibility',()=>{
 it('uses kelvin, preserves pV=nRT, and responds to volume and temperature ratios',()=>{
  const a=run('ideal-gas',{moles:1,temperatureK:300,volume:.01});
  expect(a.primary.value).toBeCloseTo(249433.8785445972,7);
  expect(value(a,'pv')).toBeCloseTo(GAS_CONSTANT*300,10);
  expect(run('ideal-gas',{moles:1,temperatureK:600,volume:.01}).primary.value).toBeCloseTo(2*a.primary.value,7);
  expect(run('ideal-gas',{moles:1,temperatureK:300,volume:.005}).primary.value).toBeCloseTo(2*a.primary.value,7);
 });
 it('keeps the entire ideal-gas isotherm within the declared pressure and volume domains',()=>{
  const r=run('ideal-gas',{moles:1,temperatureK:1500,volume:.000125});
  for(const [volume,pressure] of r.series[0].points){
   expect(volume).toBeGreaterThanOrEqual(.00001);expect(volume).toBeLessThanOrEqual(.01);
   expect(pressure).toBeLessThanOrEqual(1e8);
   expect(()=>run('ideal-gas',{moles:1,temperatureK:1500,volume})).not.toThrow();
  }
 });
 it('calorimetry weights heat capacities and conserves exchanged energy',()=>{
  const equal=run('calorimetry',{temperature1K:350,temperature2K:290});
  expect(equal.primary.value).toBeCloseTo(320,12);
  const unequal=run('calorimetry',{temperature1K:350,temperature2K:290,mass1:.2,mass2:.4});
  expect(unequal.primary.value).toBeCloseTo(310,12);
  expect(value(unequal,'heat1')+value(unequal,'heat2')).toBeCloseTo(0,8);
  expect(unequal.primary.value).toBeGreaterThanOrEqual(290);expect(unequal.primary.value).toBeLessThanOrEqual(350);
 });
 it('phase change holds at 0°C through latent heat and rejects vaporization',()=>{
  const half=run('phase-change',{mass:1,initialTemperatureC:-20,heat:209000});
  expect(half.primary.value).toBe(0);expect(value(half,'meltFraction')).toBe(.5);
  expect(run('phase-change',{mass:1,initialTemperatureC:-20,heat:0}).primary.value).toBe(-20);
  expect(run('phase-change',{mass:1,initialTemperatureC:-20,heat:417860}).primary.value).toBeCloseTo(10,12);
  expect(()=>run('phase-change',{mass:.1,initialTemperatureC:0,heat:1000000})).toThrow(/vaporizzazione/);
  const large=run('phase-change',{mass:5,initialTemperatureC:-50,heat:0});
  expect(large.series[0].points.every(([heat,temperature])=>heat<=3e6&&temperature<=100)).toBe(true);
 });
 it('heat transfer has zero net exchange at equal temperatures and reverses direction',()=>{
  const zero=run('heat-transfer',{hotTemperatureK:300,coldTemperatureK:300});
  expect(zero.measurements.every(m=>m.value===0)).toBe(true);
  const a=run('heat-transfer',{hotTemperatureK:400,coldTemperatureK:300});
  const b=run('heat-transfer',{hotTemperatureK:300,coldTemperatureK:400});
  for(const key of ['conduction','convection','radiation'])expect(value(b,key)).toBeCloseTo(-value(a,key),9);
  const thicker=run('heat-transfer',{hotTemperatureK:400,coldTemperatureK:300,thickness:.2});
  expect(value(thicker,'conduction')).toBe(value(a,'conduction')/2);
  expect(value(thicker,'convection')).toBe(value(a,'convection'));
  expect(value(thicker,'radiation')).toBe(value(a,'radiation'));
 });
 it('all four paths satisfy Q=ΔU+W and each named constraint',()=>{
  for(const path of [0,1,2,3]){
   const r=run('process',{path,volume2:path===2?.001:.002});
   expect(value(r,'heat')-value(r,'work')).toBeCloseTo(value(r,'internalEnergyChange'),10);
   expect(value(r,'totalEntropyChange')).toBe(0);
   const pressures=r.series.flatMap(curve=>curve.points.map(point=>point[1]));
   expect(pressures.every(pressure=>pressure>0&&pressure<=1e8)).toBe(true);
   expect(r.series.every(curve=>curve.points.every(([volume])=>volume>=.00001&&volume<=.1))).toBe(true);
  }
  const iso=run('process',{path:0});expect(value(iso,'internalEnergyChange')).toBe(0);
  expect(iso.primary.value).toBeCloseTo(.1*GAS_CONSTANT*300*Math.log(2),10);
  const isobar=run('process',{path:1});expect(value(isobar,'finalTemperature')).toBe(600);
  const isochor=run('process',{path:2,volume2:.001});expect(isochor.primary.value).toBe(0);expect(value(isochor,'finalVolume')).toBe(.001);
  expect(()=>run('process',{path:2,volume2:.002})).toThrow(/isocora richiede/);
  const adiabatic=run('process',{path:3});expect(value(adiabatic,'heat')).toBe(0);expect(value(adiabatic,'entropyChange')).toBeCloseTo(0,12);
  expect(value(adiabatic,'finalTemperature')).toBeLessThan(300);
 });
 it('isolated free expansion has zero work and heat but positive total entropy, with only two unconnected equilibrium points',()=>{
  const free=run('process',{path:4,moles:.1,temperatureK:300,volume1:.001,volume2:.002});
  expect(free.primary.value).toBe(0);
  expect(value(free,'heat')).toBe(0);expect(value(free,'internalEnergyChange')).toBe(0);
  expect(value(free,'finalTemperature')).toBe(300);
  expect(value(free,'finalPressure')).toBeCloseTo(124716.9392722986,7);
  expect(value(free,'entropyChange')).toBeCloseTo(.576314632164398,12);
  expect(value(free,'totalEntropyChange')).toBe(value(free,'entropyChange'));
  expect(free.series).toHaveLength(2);
  expect(free.series.every(curve=>curve.points.length===1)).toBe(true);
  expect(free.series[0].points[0][0]).toBe(.001);expect(free.series[1].points[0][0]).toBe(.002);
  expect(free.warnings.join(' ')).toContain('non vanno collegati');
  const reversible=run('process',{path:0,moles:.1,temperatureK:300,volume1:.001,volume2:.002});
  expect(reversible.primary.value).toBeGreaterThan(0);
  expect(value(reversible,'finalTemperature')).toBe(value(free,'finalTemperature'));
  expect(value(reversible,'finalPressure')).toBe(value(free,'finalPressure'));
  expect(value(reversible,'totalEntropyChange')).toBe(0);
  expect(()=>run('process',{path:4,volume2:.001})).toThrow(/maggiore/);
  expect(()=>run('process',{path:4,volume2:.0005})).toThrow(/maggiore/);
  // Independent 1B golden: one mole, 300 K, final volume twice the initial volume.
  const oneMole=run('process',{path:4,moles:1,temperatureK:300,volume1:.001,volume2:.002});
  expect(value(oneMole,'finalPressure')).toBeCloseTo(oneMole.series[0].points[0][1]/2,7);
  expect(value(oneMole,'finalTemperature')).toBe(300);
  expect(value(oneMole,'heat')).toBe(0);expect(value(oneMole,'work')).toBe(0);expect(value(oneMole,'internalEnergyChange')).toBe(0);
  expect(value(oneMole,'entropyChange')).toBeCloseTo(5.763146321644,12);
  expect(value(oneMole,'totalEntropyChange')).toBe(value(oneMole,'entropyChange'));
  expect(oneMole.series).toHaveLength(2);expect(oneMole.series.every(curve=>curve.points.length===1)).toBe(true);
 });
 it('isothermal compression has negative work; singular/unphysical final states are excluded',()=>{
  expect(run('process',{path:0,volume2:.0005}).primary.value).toBeLessThan(0);
  expect(()=>run('process',{path:1,volume2:.1})).toThrow(RangeError);
  expect(()=>run('process',{path:3,volume2:.00001})).toThrow(RangeError);
 });
 it('Carnot conserves cycle energy and reservoir entropy and closes its p–V cycle',()=>{
  const r=run('carnot',{hotTemperatureK:600,coldTemperatureK:300,heatInput:1000});
  expect(r.primary.value).toBe(.5);expect(value(r,'work')).toBe(500);expect(value(r,'heatRejected')).toBe(500);
  expect(value(r,'work')+value(r,'heatRejected')).toBe(value(r,'heatInput'));
  expect(value(r,'hotReservoirEntropy')+value(r,'coldReservoirEntropy')).toBeCloseTo(0,12);
  const first=r.series[0].points[0],last=r.series.at(-1)!.points.at(-1)!;
  expect(last[0]).toBeCloseTo(first[0],15);expect(last[1]).toBeCloseTo(first[1],8);
  expect(()=>run('carnot',{hotTemperatureK:300,coldTemperatureK:300})).toThrow(RangeError);
  expect(()=>run('carnot',{hotTemperatureK:200,coldTemperatureK:300})).toThrow(RangeError);
 });
 it('finite bodies produce nonnegative entropy with energy conserved and zero at equal temperatures',()=>{
  const r=run('entropy',{mass1:1,mass2:1,specificHeat1:1000,specificHeat2:1000,temperature1K:400,temperature2K:200});
  expect(value(r,'equilibriumTemperature')).toBe(300);
  expect(value(r,'entropy1')).toBeLessThan(0);expect(value(r,'entropy2')).toBeGreaterThan(0);
  expect(r.primary.value).toBeCloseTo(117.78303565638346,9);
  expect(value(r,'heat1')+value(r,'heat2')).toBeCloseTo(0,10);
  expect(run('entropy',{temperature1K:300,temperature2K:300}).primary.value).toBe(0);
  const points=r.series[0].points;
  expect(points.every((point,i)=>i===0||point[1]>=points[i-1][1]-1e-10)).toBe(true);
 });
});
