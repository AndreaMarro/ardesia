import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {esperienza} from '../static/js/banchi/voci/esperimento.js';

const read = relative => readFileSync(new URL(relative,import.meta.url),'utf8');
const records = file => new Map(JSON.parse(read('../content/'+file+'.json')).map(r=>[r.id,r]));
const course = records('C2');
const benches = records('esperienze-C2');
const answer = id => course.get('C2-'+id).answer.value;
function close(value,expected,tolerance=1e-9) {
  assert.ok(Math.abs(value-expected)<=tolerance, value+' rispetto a '+expected);
}

// I campioni hanno uguale area nel piano cartesiano; non usano l'integrale già risolto sulle corone.
function section(n, velocity) {
  const sum=[0,0], count=[0,0];
  for (let j=0;j<n;j++) for(let i=0;i<n;i++) {
    const x=(i+.5)*2/n-1, y=(j+.5)*2/n-1, radial=x*x+y*y;
    if (radial>1) continue;
    const zone=radial<=.5?0:1;
    sum[zone]+=velocity(radial);
    count[zone]++;
  }
  return {mean:(sum[0]+sum[1])/(count[0]+count[1]),inner:sum[0]/count[0],
    outer:sum[1]/count[1],flow:(sum[0]+sum[1])*4/(n*n)};
}

test('la sezione illustrata e la media per unità di area riproducono la lettura della sonda',()=>{
  const row=course.get('C2-Q062');
  const plate=read('../static'+row.blocks.find(b=>b.type==='figure').src);
  function radius(id) {
    return Number(plate.match(new RegExp('<circle id="'+id+'"[^>]* r="([^"]+)"'))[1]);
  }
  close((radius('disco-centrale')/radius('sezione-intera'))**2,.5,1e-9);
  const velocity=u=>.56*(1-u);
  const coarse=section(64,velocity), fine=section(512,velocity);
  close(fine.mean,answer('Q062'),6e-5);
  close(fine.inner,.42,8e-5);
  close(fine.outer,.14,8e-5);
  assert.ok(Math.abs(fine.mean-.28)<Math.abs(coarse.mean-.28));
  close((fine.inner+fine.outer)/2,fine.mean,5e-5);
  const caption=row.blocks.find(b=>b.type==='figure').text;
  assert.match(caption,/disco centrale e la corona esterna hanno la stessa area/);
  assert.match(caption,/da 0,56 a 0,28 m\/s/);
});

test('il lavoro sulla piastra bilancia la dissipazione e il flusso ricostruisce la viscosità inversa',()=>{
  const speed=.30, gap=.0020, eta=.40, area=.020;
  const volume=gap*area, dissipation=eta*(speed/gap)**2*volume;
  close(dissipation,.36);
  close(dissipation/speed,1.2);
  assert.match(course.get('C2-E013').prompt,/pressione uniforme/);
  const radius=.001, length=.20, pressure=1000, quoted=.0039;
  function flow(viscosity) {
    // In ogni punto lo sforzo viscoso bilancia la pressione sulla colonna interna.
    const axis=pressure*radius**2/(4*length*viscosity);
    return section(256,u=>axis*(1-u)).flow*radius**2;
  }
  const measured=.5e-6;
  close(flow(quoted),measured,.008*measured);
  let lo=.002,hi=.007;
  for(let i=0;i<40;i++) {
    const middle=(lo+hi)/2;
    if(flow(middle)>measured) lo=middle; else hi=middle;
  }
  close((lo+hi)/2,.0039269908,1e-8);
  assert.ok(course.get('C2-E016').blocks.some(b=>b.text.includes('Pa\\,s')));
});

test('pressioni, forze e portate restituiscono le chiavi con il segno e le unità del sistema',()=>{
  close(45/(.015*1000),answer('Q002'));
  const g=10, water=1000, h=.20;
  close(4000/(water*g),answer('Q011'));
  assert.ok(answer('Q014').includes('Diminuisce') && water*g*(0-h)<0);
  let force=0;
  for(let i=0;i<200;i++) {
    const absolute=101325+water*g*(i+.5)*h/200;
    force+=(absolute-101325)*.40*h/200;
  }
  close(force,answer('Q015'));
  close(150000*(2/10000),answer('Q029'));
  const buoyancy=water*g*.001;
  const tension=mass=>mass*g-buoyancy;
  assert.ok(tension(3)>tension(2) && tension(2)>0);
  assert.equal(answer('Q037'),'Spinte uguali e tensioni diverse');
  close((2400/180)*answer('Q049'),120);
  close(8e8*2.5e-6/1000,answer('Q076'));
  const drops=[3,6].map(resistance=>resistance*4);
  close(drops[1]/drops[0],2);
  close(drops[1]/(drops[0]+drops[1]),2/3);
  assert.equal(answer('Q089'),'Il più resistente, con caduta doppia');
  close(.050*3e-4*1e6,answer('Q092'));
});

test('il manometro ricompone la pressione nelle due colonne a ogni posizione e a pressione uguale',async()=>{
  const row=benches.get('SIM-C2-L002-04'),sim=await esperienza(row);
  assert.match(row.transferPrompt,/destro meno quello sinistro/);
  const surfaces=x=>sim.elements(x,1).filter(e=>e.kind==='line' && e.dash)
    .sort((a,b)=>a.points[0][0]-b.points[0][0]).map(e=>e.points[0][1]);
  const [zeroLeft,zeroRight]=surfaces(0);
  close(zeroLeft,zeroRight);
  const max=surfaces(2), sceneUnitsPerCm=(max[1]-max[0])/20;
  for(let tick=-10;tick<=10;tick++) {
    const dp=tick/5;
    const [left,right]=surfaces(dp), measured=sim.measurement(dp).value;
    close((right-left)/sceneUnitsPerCm,measured);
    close(left+right,zeroLeft+zeroRight);
    const leftDepth=.30+(left-zeroLeft)/(100*sceneUnitsPerCm);
    const rightDepth=.30+(right-zeroRight)/(100*sceneUnitsPerCm);
    close(101325+dp*1000+1000*10*leftDepth,101325+1000*10*rightDepth);
    close(measured,-sim.measurement(-dp).value);
  }
});

test('la geometria del galleggiante dà il volume che equilibra il peso, anche a densità uguale',async()=>{
  const row=benches.get('SIM-C2-L004-03'),sim=await esperienza(row);
  assert.match(row.summary,/immersa/);
  assert.match(row.interpretation,/qualsiasi profondità/);
  const gravity=9.81;
  for(let rho=200;rho<=1000;rho+=50) {
    const scene=sim.elements(rho,1);
    const [fluid,block]=scene.filter(e=>e.kind==='box').sort((a,b)=>a.alpha-b.alpha);
    const surface=fluid.p[1]+fluid.size[1]/2, bottom=block.p[1]-block.size[1]/2;
    const immersed=Math.min(block.size[1],Math.max(0,surface-bottom));
    close(100*immersed/block.size[1],sim.measurement(rho).value);
    const base=block.size[0]*block.size[2];
    close(rho*base*block.size[1]*gravity,1000*base*immersed*gravity);
    if(rho===1000) {
      for(const shift of [.02,.12,.25]) {
        assert.ok(bottom-shift>0 && bottom+block.size[1]-shift<surface);
        close(1000*gravity*base*block.size[1],rho*gravity*base*block.size[1]);
      }
    }
  }
});
