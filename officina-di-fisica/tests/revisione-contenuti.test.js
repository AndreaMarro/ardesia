import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const map = {
  C1: { id: 'C1-Q022', answer: 2.4, figure: 'C1-Q022-sequenza.svg' },
  C2: { id: 'C2-Q007', answer: 6, figure: 'C2-Q007-superficie.svg' },
  C3: { id: 'C3-Q051', answer: -25, figure: 'C3-Q051-bilancio.svg' },
  C4: { id: 'C4-Q055', answer: 6, figure: 'C4-Q055-parallelo.svg' },
  C5: { id: 'C5-Q045', answer: 340, figure: 'C5-Q045-eco.svg' },
};

test('Le prime cinque risoluzioni editoriali mantengono i risultati e mostrano il ragionamento', () => {
  for (const [course, expected] of Object.entries(map)) {
    const items = JSON.parse(readFileSync(new URL('content/' + course + '.json', root), 'utf8'));
    const record = items.find(r => r.id === expected.id);
    assert.ok(record && record.kind === 'question', expected.id);
    assert.equal(record.answer.type, 'numeric', expected.id);
    assert.equal(record.answer.value, expected.answer, expected.id);
    assert.ok(record.blocks.length >= 10, 'svolgimento esteso: ' + expected.id);
    const texts = record.blocks.filter(b => b.type === 'text').map(b => b.text).join(' ');
    assert.ok(texts.length >= 600, 'spiegazione discorsiva sostanziale: ' + expected.id);
    assert.match(texts, /controllo|verific[ao]/i, 'controllo del risultato: ' + expected.id);
    assert.match(texts, /Trucco|Errore/i, 'errore tipico o strategia: ' + expected.id);
    assert.ok(record.blocks.some(b => b.type === 'formula'), 'passaggi matematici: ' + expected.id);
    const fig = record.blocks.find(b => b.type === 'figure' && b.src?.endsWith(expected.figure));
    assert.ok(fig, 'disegno coerente: ' + expected.id);
    assert.ok(existsSync(new URL('static/figures/' + expected.figure, root)), expected.figure);
  }
});

test('L’accelerazione centripeta include correttamente il raggio al denominatore', () => {
  const records = JSON.parse(readFileSync(new URL('content/C1.json', root), 'utf8'));
  const record = records.find(r => r.id === 'C1-Q037');
  assert.equal(record.answer.value, 2);
  assert.ok(record.blocks.some(b => b.type === 'formula' && b.text.includes('a_c=\\frac{v^2}{r}')));
  assert.ok(!record.blocks.some(b => b.type === 'formula' && /^a_cr=v\^2\\quad/.test(b.text)));
  assert.ok(existsSync(new URL('static/figures/C1-Q037-centripeta.svg', root)));
});

test('Ogni file JSON mantiene gli identificatori unici nella propria banca', () => {
  const seen = new Set();
  for (const course of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']) {
    const records = JSON.parse(readFileSync(new URL('content/' + course + '.json', root), 'utf8'));
    for (const record of records) {
      assert.ok(!seen.has(record.id), 'ID duplicato: ' + record.id);
      seen.add(record.id);
    }
  }
});
