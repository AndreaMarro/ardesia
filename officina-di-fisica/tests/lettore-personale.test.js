import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import { passaggi } from '../static/js/lettura.js';
import { italianVoice, speechChunks } from '../static/js/ascolto.js';

test('Il lettore ricompone ogni lezione ed esempio dalle stesse unità editoriali', () => {
  const folder = new URL('../content/', import.meta.url);
  const rows = readdirSync(folder).filter(name => name.endsWith('.json') && name !== 'catalog.json')
    .flatMap(name => JSON.parse(readFileSync(new URL(name, folder))));
  const count = {lesson:0, example:0};
  for (const record of rows.filter(row => row.kind in count)) {
    const ranges = passaggi(record.kind, record.blocks);
    assert.ok(ranges.length >= 2, record.id);
    const assembled = ranges.flatMap(([from,to]) => { assert.ok(from < to); return record.blocks.slice(from,to); });
    assert.deepEqual(assembled, record.blocks, record.id);
    count[record.kind]++;
  }
  assert.deepEqual(count, {lesson:56, example:117});
});
test('Le voci tardive o remote lasciano sempre sotto controllo l’ascolto', () => {
  const remote = {lang:'it-IT',localService:false};
  const en = {lang:'en-US',localService:true};
  const local = {lang:'it_CH',localService:true};
  assert.equal(italianVoice([remote,en]), undefined);
  assert.equal(italianVoice([en,remote,local]), local);
  const words = ['Andata e ritorno. La distanza si dimezza.', 'Il segno meno indica il verso. '.repeat(42).trim()];
  const chunks = speechChunks(words);
  assert.ok(chunks.every(chunk => chunk.length <= 210));
  assert.equal(chunks.join(' '), words.join(' '));
});
