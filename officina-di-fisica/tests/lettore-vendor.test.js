import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

test('Il pacchetto italiano offline rispetta impronte e budget della distribuzione verificata', () => {
  const root = new URL('../static/vendor/sre-4.1.5/',import.meta.url);
  const proof = JSON.parse(readFileSync(new URL('../docs/verifica-prodotto/prove/lettore-sre.json',import.meta.url)));
  let bytes = 0;
  for (const [name, file] of Object.entries(proof.serviti)) {
    const data = readFileSync(new URL(name.replace(/^lib\//,''),root));
    assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);
    assert.equal(data.length,file.bytes);
    if (name.endsWith('.json')) assert.ok(Object.keys(JSON.parse(data)).length>0);
    bytes+=data.length;
  }
  assert.equal(bytes,proof.byteServitiSuRichiesta);
  assert.ok(bytes < 1024*1024);
});
