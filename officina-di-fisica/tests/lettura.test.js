import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { passaggi } from '../static/js/lettura.js';

test('Ogni blocco del manoscritto resta nello stesso ordine e con la relativa didascalia', () => {
  const content = new URL('../content/', import.meta.url);
  let examples = 0, lessons = 0;
  for (const file of readdirSync(content).filter((name) => name.endsWith('.json'))) {
    const source = JSON.parse(readFileSync(new URL(file, content), 'utf8'));
    const rows = Array.isArray(source) ? source : source.records || [];
    for (const row of rows) {
      const storytelling = row.kind === 'lesson' && row.blocks.filter((b) => b.type === 'figure').length > 1;
      if (row.kind !== 'example' && !storytelling) continue;
      const ranges = passaggi(row.kind, row.blocks);
      if (!ranges.length) {
        assert.ok(!storytelling && !row.blocks.some((b, i) => i > 0 && b.type === 'formula'), row.id);
        continue;
      }
      assert.ok(ranges.length >= 2, row.id);
      let until = 0;
      for (const [from, end] of ranges) {
        assert.equal(from, until, row.id);
        assert.ok(from < end, row.id);
        if (from) assert.ok(row.blocks[from - 1].type !== 'figure' || row.blocks[from].type !== 'text', row.id);
        until = end;
      }
      assert.equal(until, row.blocks.length, row.id);
      if (storytelling) lessons++;
      else examples++;
    }
  }
  assert.ok(examples >= 100);
  assert.ok(lessons >= 1);
  console.log('Verificati ' + examples + ' esempi e ' + lessons + ' lezioni a più figure.');
});

test('Un breve blocco indivisibile e i quesiti si leggono in forma integrale', () => {
  assert.deepEqual(passaggi('example', [{ type: 'text' }]), []);
  assert.deepEqual(passaggi('example', [{ type: 'figure' }, { type: 'text' }]), []);
  assert.deepEqual(passaggi('question', [{ type: 'text' }, { type: 'formula' }, { type: 'text' }]), []);
});
