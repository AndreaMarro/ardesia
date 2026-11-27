import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

const records = JSON.parse(readFileSync(new URL('../content/esperienze-C5.json', import.meta.url)));
const source = records.find(record => record.id === 'SIM-C5-L05-01');

test('the top view frames every circular front across the three media', async () => {
  const bench = await esperienza(source);
  for (const [medium, speed] of [[1, 340], [2, 1500], [3, 5000]]) {
    const expectedMilliseconds = 150000 / speed;
    assert.equal(bench.model.solve({x:medium}).y, expectedMilliseconds);
    for (const time of [0, expectedMilliseconds / 2, expectedMilliseconds]) {
      const geometry = bench.elements(medium, 2, time);
      const fronts = geometry.filter(element => element.kind === 'line' && element.c === colore.verde);
      assert.equal(fronts.length, 4);
      for (const aspect of [294 / 341, 839 / 451]) {
        const span = Math.max(bench.scene.spec.height, bench.scene.spec.width / aspect);
        for (const [x, , z] of fronts.flatMap(front => front.points)) {
          assert.ok(Math.abs(z) + 0.1 < span / 2, `top clipping in medium ${medium} at aspect ${aspect}`);
          assert.ok(Math.abs(x) + 0.1 < span * aspect / 2, `side clipping in medium ${medium} at aspect ${aspect}`);
        }
      }
    }
  }
});

test('one-way transmission identifies the pulse without labels on its path', async () => {
  const bench = await esperienza(source);
  for (const time of [0, 15, 30]) {
    const geometry = bench.elements(3, 2, time);
    assert.ok(geometry.some(element => element.kind === 'ball' && element.c === colore.viola));
    assert.deepEqual(geometry.filter(element => element.kind === 'label' && ['Sorgente','Ricevitore'].includes(element.text)), []);
  }
  for (const mode of ['orbit', 'side', 'top', 'diagram']) {
    const legend = bench.legend(2, mode);
    assert.match(legend, /sfera ocra.*sorgente/i);
    assert.match(legend, /punto viola/i);
    assert.match(legend, /solo l’andata/i);
    assert.doesNotMatch(legend, /eco|pressione|rifless/i);
  }
});

test('the fixed drawing keeps the pulse above the source and receiver markers', async () => {
  const bench = await esperienza(source);
  for (const [medium, speed] of [[1, 340], [2, 1500], [3, 5000]]) {
    const duration = 150000 / speed;
    const arrival = bench.elements(medium, 2, duration);
    const receiver = arrival.findIndex(element => element.kind === 'rod' &&
      element.c === colore.metallo && element.a[0] === 2.55);
    const pulse = arrival.findIndex(element => element.kind === 'ball' && element.c === colore.viola);
    assert.ok(receiver >= 0 && pulse > receiver, 'the receiver must precede the pulse in the flat drawing');
    assert.deepEqual(arrival[pulse].p, [2.55, 0.85, 0.15]);
    const departure = bench.elements(medium, 2, 0);
    const sourceBall = departure.findIndex(element => element.kind === 'ball' && element.c === colore.ocra);
    const departurePulse = departure.findIndex(element => element.kind === 'ball' && element.c === colore.viola);
    assert.ok(sourceBall >= 0 && departurePulse > sourceBall, 'the source must precede the pulse in the flat drawing');
  }
});
