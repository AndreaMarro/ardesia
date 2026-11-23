import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { equivalent } from '../static/js/espressioni.js';
import { passaggi } from '../static/js/lettura.js';

const read = (name) => JSON.parse(readFileSync(new URL('../content/' + name, import.meta.url)));
const c1 = read('C1.json'),
  records = read('metodo.json');
const correct = {
  '008': 'm/s²',
  '013': Math.hypot(5 - 2, 1 - -3),
  '023': 'Procede verso x minori e rallenta',
  '034': (10 * (2 ** 2 - 1 ** 2)) / 2,
  '044': 5 * 10 - 12,
  '056': 14 - (6 / 200) * 100,
  '064': ((2 + 10) * 0.4) / 2,
  '077': Math.sqrt(5 ** 2 - 2 * 10 * 0.8),
  '083': (-4 * 3) / 6,
  '095': (30 * 0.5) / 2,
};
test('Dieci chiavi indipendenti, una competenza per soluzione e due tavole consecutive', () => {
  const skills = new Set();
  for (const [suffix, value] of Object.entries(correct)) {
    const r = c1.find((r) => r.id === 'C1-Q' + suffix);
    if (typeof value === 'number') assert.ok(Math.abs(r.answer.value - value) < 1e-10);
    else assert.equal(r.answer.value, value);
    const spans = passaggi('worked', r.blocks);
    assert.equal(spans.length, 2);
    for (const [a, b] of spans) {
      const group = r.blocks.slice(a, b);
      assert.equal(group[0].type, 'figure');
      assert.ok(group[0].text && group.some((block) => block.type === 'text'));
      assert.ok(readFileSync(new URL('../static' + group[0].src, import.meta.url)).length);
    }
    skills.add(r.skill);
  }
  assert.equal(skills.size, 10);
});
const alternate = ['(2*F)/(a*2)', 'p/g/rho-p0/(rho*g)', 'V*p/R/n', '(U*2)/(2I)', 'v*(1/f)'];
const numeric = [12 / 3, (130000 - 100000) / (1000 * 10), (200 * 8.31) / (2 * 8.31), 6 / 0.3, 12 / 3];
const graphNumbers = [
  [6, (6 - 2) / 4, ((2 + 6) * 4) / 2],
  [30, 30 / 3, 100 + 4 * 10],
  [3, 6 - 2, 3 * (6 - 2)],
  [3, 3 / 6, 6 / 3],
  [2, 5 - 1, 2.5 - 0.5, 4 / 2],
];
test('Cinque derivazioni equivalenti, controlli numerici e tre fasi per grafico', () => {
  assert.equal(records.length, 10);
  for (let i = 0; i < 5; i++) {
    const [f, g] = records.filter((r) => r.course === 'C' + (i + 1));
    const expression = f.steps.find((s) => s.kind === 'expression').answer;
    assert.ok(equivalent(alternate[i], expression, f.symbols, f.target));
    assert.ok(!equivalent('1/(' + expression + ')', expression, f.symbols, f.target));
    assert.equal(f.steps.find((s) => s.kind === 'number').answer, numeric[i]);
    assert.deepEqual(
      g.steps.filter((s) => s.kind === 'number').map((s) => s.answer),
      graphNumbers[i],
    );
    assert.deepEqual([...new Set(g.steps.map((s) => s.stage))], [0, 1, 2]);
  }
});
test('Parentesi, segno, potenze e limiti espliciti del correttore', () => {
  const check = (s) => equivalent(s, '(p-p0)/(rho*g)', ['p', 'p0', 'rho', 'g'], 'h');
  for (const s of ['h=-(p0-p)/(ρ*g)', '(p-p0)*g/(g²*ρ)=h', '(p-p₀)/(gρ)']) assert.ok(check(s), s);
  for (const s of [
    'p-p0/rho*g',
    '(p-p0)/(rho*g)+1',
    'p/0',
    'p/(p-p)',
    '(p-p0)/(rho*g)*h/h',
    'foo',
    '1**2',
    'p^9',
    ')',
    '',
  ])
    assert.ok(!check(s), s);
});
