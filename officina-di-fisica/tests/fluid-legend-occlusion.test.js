import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {esperienza} from '../static/js/banchi/voci/esperimento.js';

const sources = JSON.parse(readFileSync(new URL('../content/esperienze-C2.json',import.meta.url)));
const transfers = {
  'Entrata': ['L005-01','L005-02','L005-03','L006-01','L006-02','L006-03','L006-04','L008-01','L008-02','L008-04'],
  'Presa frontale': ['L006-02'],
  'Uscita': ['L005-01','L005-02','L005-03','L006-01','L006-02','L006-03','L008-01'],
  'Sezione di misura': ['L005-04','L007-01','L007-02','L007-05'],
  'Sforzo sulla lastra': ['L007-03'],
  'Presa intermedia': ['L008-03','L009-03'],
  'In parallelo': ['L009-01'],
  'Goccia': ['L010-02'],
  'Film a due facce': ['L010-05'],
};

for (const [label, ids] of Object.entries(transfers)) {
  test(`${label} stays in the accessible legend and off the measured glyphs`, async () => {
    for (const suffix of ids) {
      const row = sources.find(entry => entry.id === 'SIM-C2-' + suffix);
      const bench = await esperienza(row);
      for (const view of ['orbit','side','top','diagram']) {
        assert.ok(bench.legend(2,view).toLowerCase().includes(label.toLowerCase()),row.id);
      }
      const {min,max,step} = row.control;
      const count = Math.round((max-min)/step)+1;
      for (let index=0; index<count; index+=1) {
        const x = min+index*step;
        const scene = bench.elements(x,2);
        assert.ok(!scene.some(element => element.kind === 'label' && element.text === label),row.id);
      }
    }
  });
}

test('unrelated labels keep their existing anchors', async () => {
  for (const [suffix,label] of [['L006-04','Uscita'],['L009-01','In serie'],['L001-02','Lastra mobile']]) {
    const row = sources.find(entry => entry.id === 'SIM-C2-' + suffix);
    const bench = await esperienza(row);
    assert.ok(bench.elements(row.references[0][0],2).some(element => element.kind === 'label' && element.text === label));
  }
});

test('the Pitot velocity arrows pass beside the probes with the same direction and scale', async () => {
  const row = sources.find(entry => entry.id === 'SIM-C2-L006-02');
  const bench = await esperienza(row);
  const { min, max, step } = row.control;
  for (let speed = min; speed <= max; speed += step) {
    const scene = bench.elements(speed, 2);
    const vectors = scene.filter(element => element.kind === 'arrow');
    assert.equal(vectors.length, speed === 0 ? 0 : 2);
    for (const {a, b} of vectors) {
      assert.equal(a[1], 1.05);
      assert.equal(b[1], a[1]);
      assert.equal(a[2], 0.23);
      assert.equal(b[2], a[2]);
      assert.ok(Math.abs(b[0] - a[0] - speed / 5) < 1e-12);
    }
    const intake = scene.find(({kind, r}) => kind === 'rod' && r === 0.088);
    assert.deepEqual(intake.a, [1.4, 1.05, 0]);
    assert.deepEqual(intake.b, [1.02, 1.05, 0]);
    if (vectors.length) assert.deepEqual(scene.slice(-2), vectors);
  }
});

test('press arrows show motion direction and disappear at zero stroke', async () => {
  const row = sources.find(({id}) => id === 'SIM-C2-L003-02');
  const bench = await esperienza(row);
  const arrows = x => bench.elements(x, 2).filter(({kind}) => kind === 'arrow');

  assert.deepEqual(arrows(0), []);
  for (const input of [0.5, 4, 8]) {
    const [down, up] = arrows(input);
    assert.equal(arrows(input).length, 2);
    assert.ok(down.a[0] < up.a[0] && down.b[1] < down.a[1] && up.b[1] > up.a[1]);
    assert.equal(bench.measurement(input).value, input / 4);
  }
  for (const view of ['orbit', 'side', 'top', 'diagram']) {
    assert.match(bench.legend(2, view), /solo i versi.*corsa zero.*un quarto/);
  }
  assert.match(bench.legend(2, 'top'), /vista Laterale/);
});
