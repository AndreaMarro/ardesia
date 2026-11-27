import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {esperienza} from '../static/js/banchi/voci/esperimento.js';
import {affected,records,contract} from './helpers/c4-probe-contract.mjs';

const baseline=JSON.parse(readFileSync(new URL('./fixtures/c4-probe-labels/baseline-contract.json',import.meta.url)));
const observed=JSON.parse(readFileSync(new URL('./fixtures/c4-probe-labels/observed-eight.json',import.meta.url)));

for (const id of affected) {
  test(`${id}: the moving point and plate labels cannot mask a field arrow`,async()=>{
    const row=records.find(r=>r.id===id), a=await esperienza(row);
    const {min,max,step}=row.control;
    for(let i=0;i<=Math.round((max-min)/step);i++) {
      const x=min+i*step;
      for(const stage of [0,2]) {
        const scene=a.elements(x,stage);
        assert.deepEqual(scene.filter(e=>e.kind==='label'),[],`${id}, x=${x}, stage=${stage}`);
        assert.equal(scene.filter(e=>e.kind==='arrow').length,3);
        if(a.clock) {
          const duration=a.clock.duration(x,a.model.solve({x}).y);
          for(const fraction of [0,.25,.5,.75,1]) {
            const animated=a.elements(x,stage,duration*fraction);
            assert.deepEqual(animated.filter(e=>e.kind==='label'),[],`${id}, x=${x}, clock=${fraction}`);
            assert.equal(animated.filter(e=>e.kind==='arrow').length,3);
          }
        }
      }
    }
  });
}

test('all eight observed positions preserve the field, moving point and scalar exactly',async()=>{
  for(const old of observed.cases) {
    const a=await esperienza(records.find(r=>r.id===old.id));
    const {x,time}=old.interaction;
    const current=a.elements(x,2,time);
    assert.deepEqual(current.filter(e=>e.kind!=='label'),old.elements.filter(e=>e.kind!=='label'),old.caseKey);
    assert.deepEqual(a.model.solve({x:time??x}),old.model,old.caseKey);
    assert.equal(current.filter(e=>e.kind==='label').length,0,old.caseKey);
  }
});

test('all 29 C4 controls, teaching outputs, clocks, geometry and unrelated legends retain the frozen baseline',async()=>{
  assert.deepEqual(await contract(),baseline.records);
});

test('the accessible descriptions identify the point without assigning a charge to the voltmeter probe',async()=>{
  for(const id of affected) {
    const a=await esperienza(records.find(r=>r.id===id));
    for(const view of ['orbit','side','top','diagram']) {
      const text=a.legend(2,view);
      assert.match(text,/positiva a sinistra.*negativa a destra/);
      assert.match(text,/ocra.*campo.*uniforme/);
      assert.match(text,/punto viola/);
      if(id==='SIM-C4-L02-03') assert.match(text,/particella positiva/);
      if(id==='SIM-C4-L03-02') {
        assert.match(text,/sonda.*riferimento centrale/);
        assert.doesNotMatch(text,/carica positiva|particella positiva|3 µC/);
      }
      if(id==='SIM-C4-L03-03') assert.match(text,/carica positiva di 3 µC/);
    }
  }
});

test('zero displacement and zero energy gain leave the nonzero uniform field visible',async()=>{
  for(const id of affected) {
    const a=await esperienza(records.find(r=>r.id===id));
    assert.equal(a.model.solve({x:0}).y,0);
    const arrows=a.elements(0,2).filter(e=>e.kind==='arrow');
    assert.equal(arrows.length,3);
    for(const e of arrows) {
      assert.ok(e.b[0]>e.a[0]);
      assert.equal(e.b[1],e.a[1]);
      assert.equal(e.b[2],e.a[2]);
    }
  }
});
