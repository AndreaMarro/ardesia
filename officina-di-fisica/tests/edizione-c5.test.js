import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';

const load = file => readFileSync(new URL(file, import.meta.url),'utf8');
const course = new Map(JSON.parse(load('../content/C5.json')).map(row => [row.id,row]));
const key = id => course.get(id).answer.value;
const close = (actual,expected,tolerance=1e-9) =>
  assert.ok(Math.abs(actual-expected) <= tolerance, 'misura '+actual+' · atteso '+expected);

test('il segnale attraversa il centro ogni 18 ms e la densità di energia della corda scala con la massa per metro', () => {
  const frequency=key('C5-Q003'), period=1/frequency;
  const position=time=>Math.sin(2*Math.PI*frequency*time);
  close(position(0.018),0,3e-6);
  assert.ok(position(.017)>0 && position(.019)<0);
  // Gli attraversamenti opposti di x=A/2 sono a T/12 e 5T/12.
  const first=period/12, returning=5*period/12, interval=period/1000;
  close(position(first),.5);
  close(position(returning),.5);
  assert.ok(position(first+interval)>position(first-interval));
  assert.ok(position(returning+interval)<position(returning-interval));
  close(returning-first, period/3);
  close(position(first+period/2),-.5);
  const velocity=3, wavelength=2, dt=1e-5, dx=1e-4;
  const displacement=(x,time)=>.004*Math.sin(2*Math.PI*(x-velocity*time)/wavelength);
  function energyPerWavelength(mu) {
    const tension=mu*velocity**2;
    let total=0;
    for(let i=0;i<200;i++) {
      const x=(i+.5)*wavelength/200;
      const transverse=(displacement(x,dt)-displacement(x,-dt))/(2*dt);
      const slope=(displacement(x+dx,0)-displacement(x-dx,0))/(2*dx);
      total+=(mu*transverse**2+tension*slope**2)/2*wavelength/200;
    }
    return total;
  }
  // Ogni lunghezza d’onda attraversa la sezione nello stesso intervallo di tempo.
  close(energyPerWavelength(.06)/energyPerWavelength(.02),key('C5-Q038'));
});

test('la geometria della figura predice la potenza intercettata e l’angolo solido verifica l’esempio', () => {
  const record=course.get('C5-Q039');
  const svg=load('../static'+record.blocks.find(b=>b.type==='figure').src);
  function ends(id) {
    const match=svg.match(new RegExp('id="'+id+'" d="M([\\d.]+) ([\\d.]+)L([\\d.]+) ([\\d.]+)"'));
    assert.ok(match,id);
    const [x1,y1,x2,y2]=match.slice(1).map(Number);
    return [x2-x1,y1-y2];
  }
  const [dx,dy]=ends('sensore'), [nx,ny]=ends('normale');
  close(Math.acos(nx/Math.hypot(nx,ny))*180/Math.PI,60,.002);
  close((nx*dx+ny*dy)/(Math.hypot(nx,ny)*Math.hypot(dx,dy)),0,.0001);
  const projection=svg.match(/id="proiezione" d="M[\d.]+ ([\d.]+)V([\d.]+)"/);
  assert.ok(projection);
  const height=Math.abs(Number(projection[2])-Number(projection[1]));
  close(height,Math.abs(dy));
  const length=Math.hypot(dx,dy);
  const received=(crossSection)=>5*4*crossSection/length;
  close(received(height),key('C5-Q039'),.001);
  close(received(length),20);
  close(received(0),0);
  const radius=2, halfSide=Math.sqrt(3e-4)/2;
  const solidAngle=4*Math.atan(halfSide**2/(radius*Math.sqrt(radius**2+2*halfSide**2)));
  const intercepted=.40*5*solidAngle/(4*Math.PI);
  close(intercepted,1.2e-5,.05e-5);
  assert.match(course.get('C5-E007').blocks.findLast(b=>b.type==='formula').text,/1\{,\}2\\times10\^\{-5\}/);
});

test('la conversione acustica, il passo della radioonda e la rifrazione superano il controllo inverso', () => {
  close(10*Math.log10(key('C5-Q041')*1e-6/1e-12),50);
  close(key('C5-Q052')*150e6,3e8);
  // Componenti tangenziali del vettore d’onda ai due lati dell’interfaccia.
  close(key('C5-Q084')*.5,1/Math.sqrt(2),1e-5);
  for (const focalLength of [-12,12]) {
    const outgoing=(height,slope)=>slope-height/focalLength;
    close(outgoing(0,.05),.05);
    const height=2, exitSlope=outgoing(height,0);
    close(height+focalLength*exitSlope,0);
    assert.equal(Math.sign(-height/exitSlope),Math.sign(focalLength));
  }
  assert.equal(key('C5-Q096'),'In linea retta');
  assert.match(course.get('C5-Q096').blocks[1].text,/divergente.*prolungamento/i);
});

test('la componente magnetica e la direzione dei vettori nel banco attraversano lo zero insieme', async () => {
  const record=JSON.parse(load('../content/esperienze-C5.json')).find(r=>r.id==='SIM-C5-L06-01');
  const sim=await esperienza(record);
  for(let phase=0;phase<=360;phase+=15) {
    const e=3*Math.cos((90-phase)*Math.PI/180);
    const b=sim.measurement(phase).value*1e-9;
    close(3e8*b,e,1e-10);
    assert.ok(e*b>=-1e-23);
    const state=sim.model.solve({x:phase});
    const field=sim.model.readings({x:phase},state).find(([label])=>label==='Campo elettrico in P');
    assert.equal(field[2],'V/m');
    close(field[1],e,1e-12);
    const elements=sim.elements(phase,1);
    const probe=elements.find(node=>node.kind==='ball');
    const arrows=elements.filter(n=>n.kind==='arrow' && n.a.every((x,i)=>x===probe.p[i]));
    assert.ok(elements.some(n=>n.kind==='label' && n.text==='P'));
    if (phase%180===0) {
      assert.equal(field[1],0);
      assert.equal(arrows.length,0);
      assert.ok(elements.some(n=>n.kind==='line' && n.points.length>100
        && n.points.some((pt,i)=>Math.abs(pt[1]-n.points[0][1])>.5)), 'profilo non nullo lontano dalla sonda');
    } else {
      assert.equal(arrows.length,2);
      close((arrows[0].b[1]-probe.p[1])/.7,e/3);
      close((arrows[1].b[2]-probe.p[2])/.7,e/3);
    }
  }
  assert.match(record.interpretation,/180° entrambi i campi sono nulli/);
  assert.match(record.interpretation,/flusso istantaneo è zero/);
});
