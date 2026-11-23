import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { field } from '../static/js/banchi/modelli/campo.js';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';

const read = file => JSON.parse(readFileSync(new URL('../content/' + file, import.meta.url)));
const course = read('C4.json');
const close = (measured, expected) => assert.ok(Math.abs(measured - expected) < 1e-9 * Math.max(1, Math.abs(expected)));

test('C4 · misura virtuale della forza su due prove opposte, a 1 e 2 m', () => {
  const problem = read('banchi.json').find(r => r.id === 'LAB3D-07').assessment[0];
  const source = [{pos:[0,0,0], q:1}];
  for (const radius of [1, 2]) {
    const result = field(source,[radius,0,0]);
    for (const probe of [-2e-9, 2e-9]) {
      const potentialEnergy = x => 9e9 * 1e-9 * probe / x;
      const h = radius * 1e-5;
      const measuredForce = -(potentialEnergy(radius+h)-potentialEnergy(radius-h))/(2*h);
      close(measuredForce/probe, result.E[0]);
      assert.equal(Math.sign(measuredForce), Math.sign(probe));
    }
    close(result.magnitude, problem.value / radius ** 2);
  }
  assert.match(problem.worked,/9 N\/C/);
  assert.match(problem.worked,/2,25 N\/C/);
});

test('C4 · flusso da una superficie orientata e dalla geometria della figura', () => {
  const problem = course.find(r => r.id === 'C4-Q091');
  const svg = readFileSync(new URL('../static' + problem.blocks.find(b=>b.type === 'figure').src, import.meta.url),'utf8');
  const vector = svg.match(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)" stroke="#086461"/);
  assert.ok(vector);
  const [ox,oy,bx,by] = vector.slice(1).map(Number);
  const direction = [bx-ox, oy-by];
  const projection = direction[1]/Math.hypot(...direction);
  assert.ok(Math.abs(Math.acos(projection)*180/Math.PI-60) < 0.03);
  assert.ok(Math.abs(projection*0.30*0.020*1000-problem.answer.value)<0.002);
  // Rectangle spanned by a tilted side and a perpendicular one; field along the z axis.
  const a = [0.20*0.5,0,0.20*Math.sqrt(3)/2], b = [0,0.10,0];
  const normalZ = (u,v) => u[0]*v[1]-u[1]*v[0];
  close(1000*0.30*normalZ(a,b), problem.answer.value);
  close(1000*0.30*normalZ(b,a), -problem.answer.value);
  const faraday = course.find(r=>r.id==='C4-E019');
  assert.match(faraday.title,/tensione media/);
  close(40*5e-4*(0.30-0.10)/0.020,0.20);
});

test('C4 · raggio positivo per entrambe le polarità e per tutto il controllo magnetico', async () => {
  const record = read('esperienze-C4.json').find(r=>r.id==='SIM-C4-L09-03');
  assert.match(record.formula,/\|q\|/);
  const simulation = await esperienza(record);
  for (let B=record.control.min; B<=record.control.max; B+=record.control.step) {
    const cm = simulation.measurement(B).value;
    const mass=2e-6, speed=30;
    for (const charge of [-5e-4,5e-4]) {
      close(mass*speed**2/(cm/100), Math.abs(charge)*speed*B);
    }
  }
  const example = course.find(r=>r.id==='C4-E017');
  assert.match(example.blocks.at(-1).text,/2,1 cm/);
  assert.equal(Number((100*1.67e-27*2e5/(1.60e-19*0.10)).toPrecision(2)),2.1);
});
