import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {esperienza} from '../static/js/banchi/voci/esperimento.js';

const sources = JSON.parse(readFileSync(new URL('../content/esperienze-C2.json',import.meta.url)));
const transfers = {
  'Entrata': ['L005-01','L005-02','L005-03','L006-01','L006-02','L006-03','L006-04','L008-01','L008-02','L008-04'],
  'Presa frontale': ['L006-02'],
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
  for (const [suffix,label] of [['L006-02','Uscita'],['L009-01','In serie'],['L001-02','Lastra mobile']]) {
    const row = sources.find(entry => entry.id === 'SIM-C2-' + suffix);
    const bench = await esperienza(row);
    assert.ok(bench.elements(row.references[0][0],2).some(element => element.kind === 'label' && element.text === label));
  }
});
