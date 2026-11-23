import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {esperienza} from '../static/js/banchi/voci/esperimento.js';

const load = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const index = file => new Map(JSON.parse(load(file)).map(row => [row.id, row]));
const course = index('../content/C1.json');
const benches = index('../content/esperienze-C1.json');
const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} (atteso ${expected})`);

test('il grafico della posizione e l’impulso triangolare ricostruiscono i risultati degli esempi', () => {
  const vertices = [[0,0],[2,6],[4,6],[6,2]];
  let travelled = 0;
  let displacement = 0;
  for (let i=1; i<vertices.length; i++) {
    const [priorTime, priorX] = vertices[i-1], [time, x] = vertices[i];
    const velocity = (x-priorX)/(time-priorTime);
    travelled += Math.abs(velocity)*(time-priorTime);
    displacement += velocity*(time-priorTime);
  }
  close(travelled,10);
  close(displacement/6,1/3);
  assert.match(course.get('C1-E005').blocks.map(b => b.text).join(' '), /\\tfrac13/);
  const dt=.0001;
  let momentum=0;
  for(let i=0; i<2000; i++) {
    const t=(i+.5)*dt;
    momentum+=400*Math.min(t,.2-t)*dt;
  }
  close(momentum,4);
  close(momentum/2,2);
  const acceleration=4/2;
  const finalVelocity=Math.sqrt(1+2*acceleration*3);
  close(finalVelocity**2,13);
  assert.match(course.get('C1-E014').blocks.map(b => b.text).join(' '), /\\sqrt\{13\}/);
});

test('una somma di anelli sferici verifica il campo interno ed esterno e la soglia per il coefficiente riguarda |a|', () => {
  // Massa, raggio del guscio e G unitari. Anelli di massa uguale in cos θ.
  function attraction(radius, rings) {
    let inward=0;
    for(let i=0;i<rings;i++) {
      const cosine=-1+2*(i+.5)/rings;
      const separation=Math.sqrt(1+radius**2-2*radius*cosine);
      inward+=(radius-cosine)/(rings*separation**3);
    }
    return inward;
  }
  for (const r of [0,.25,.5,1.5,2,3]) {
    const exact=r<1 ? 0 : 1/r**2;
    close(attraction(r,20000),exact,1e-7);
    if (r!==0) assert.ok(Math.abs(attraction(r,20000)-exact)<Math.abs(attraction(r,100)-exact));
  }
  assert.match(course.get('C1-L006').blocks.map(b=>b.text).join(' '),/massa racchiusa/);
  for (const value of [-.003,-10,.0011,1,9.99,10]) {
    const power=Math.floor(Math.log10(Math.abs(value)));
    const coefficient=value/10**power;
    assert.ok(Math.abs(coefficient)>=1 && Math.abs(coefficient)<10);
    close(coefficient*10**power,value);
  }
  const text=course.get('C1-L001').blocks.map(b=>b.text).join(' ');
  assert.ok(text.includes('|a|') && text.includes('misura nulla'));
});

test('il verso delle forze nella tavola determina il lavoro sul blocco', () => {
  const source=load('../static'+course.get('C1-Q078').blocks.find(b=>b.type==='figure').src);
  function direction(name) {
    const match=source.match(new RegExp('id="'+name+'" d="M([0-9.]+) [0-9.]+H([0-9.]+)"'));
    assert.ok(match,name);
    return Math.sign(Number(match[2])-Number(match[1]));
  }
  for (const [name,surfaceSpeed] of [['attrito-piano',0],['attrito-nastro',3]]) {
    const blockSpeed=1, force=-2*Math.sign(blockSpeed-surfaceSpeed);
    assert.equal(direction(name),Math.sign(force));
    close(force*blockSpeed*1,2*direction(name));
    assert.ok(force*blockSpeed-force*surfaceSpeed<0, 'potenza dissipata dalla coppia di attriti durante lo slittamento');
  }
  const loop=[[1,1],[-1,-1]];
  close(loop.reduce((sum,[v,dx])=>sum-2*Math.sign(v)*dx,0),-4);
  close((54.6e-3-.042)*1000,course.get('C1-Q007').answer.value);
  close(18/60,course.get('C1-Q051').answer.value);
  close((25*.8*3)/3,course.get('C1-Q067').answer.value);
});

test('equazione radiale, quantità di moto e momento di una coppia reggono i cambi di massa e di polo', () => {
  const g=9.81,length=2;
  for(const m of [.2,1,4]) for(const height of [0,.5,1]) {
    const speed=Math.sqrt(2*g*height);
    const tension=m*g+2*m*g*height/length;
    close((tension-m*g)/m,speed**2/length);
  }
  for(const p of [0,2,-5]) {
    const energies=[1,2,3].map(m=>m*(p/m)**2/2);
    if(p===0) assert.deepEqual(energies,[0,0,0]);
    else assert.ok(energies[0]>energies[1] && energies[1]>energies[2]);
  }
  for(const pole of [-3,0,.5,1,7]) close(-(0-pole)*4-(2-pole)*(-4),8);
  // Velocità tangente in (1,0), variazione radiale verso l’origine.
  const dt=1e-4;
  const velocity=t=>[-Math.sin(t),Math.cos(t)];
  close((velocity(dt)[0]-velocity(-dt)[0])/(2*dt),-1,1e-8);
  close((velocity(dt)[1]-velocity(-dt)[1])/(2*dt),0);
});

test('le sette misure pubblicate e le unità delle secanti sono riproducibili in tutte le posizioni del controllo', async () => {
  const position=t=>t*t;
  const speed=t=>t*t;
  // Leggi indipendenti in unità SI, avendo fissato t₀ a 1 s.
  const checks=[
    ['L001-04','kg',side=>Array.from({length:side**3},()=>1000).reduce((a,b)=>a+b,0)],
    ['L002-03','m',delta=>3+delta],
    ['L003-03','m/s',dt=>(position(1+dt)-position(1))/dt],
    ['L003-04','m/s²',dt=>(speed(1+dt)-speed(1))/dt],
    ['L003-06','m',time=>2*Math.min(time,2)-2*Math.max(time-2,0)],
    ['L007-03','m/s',work=>{const acceleration=1/2,time=Math.sqrt(2*work/acceleration);return acceleration*time;}],
    ['L009-02','m/s',initial=>{const mass=3;return mass*initial/(2*mass);}],
  ];
  for (const [suffix,unit,oracle] of checks) {
    const row=benches.get('SIM-C1-'+suffix), sim=await esperienza(row);
    assert.equal(row.measure.unit,unit);
    const {min,max,step}=row.control;
    for(let i=0;i<=Math.round((max-min)/step);i++) {
      const x=min+i*step;
      close(sim.measurement(x).value,oracle(x));
      if(suffix==='L003-03' || suffix==='L003-04') {
        const chart=sim.model.graphs({x},sim.model.solve({x})).find(g=>g.track==='time');
        const [signal,chord]=chart.series;
        assert.ok(chord.dash);
        assert.deepEqual(chord.points,[signal.points[0],signal.points.at(-1)]);
        const [[ta,ya],[tb,yb]]=chord.points;
        close((yb-ya)/(tb-ta),oracle(x));
        assert.equal(chart.x,'Tempo dalla prima lettura (s)');
      }
      if(suffix==='L009-02') {
        const energy=sim.model.readings({x},sim.model.solve({x})).find(r=>r[0].startsWith('Energia cinetica finale'));
        if(x===0) assert.equal(energy[1],'Entrambe nulle');
        else close(energy[1],2*sim.measurement(x).value**2/x**2);
      }
    }
  }
});
