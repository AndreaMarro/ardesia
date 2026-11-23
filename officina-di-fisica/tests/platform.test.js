import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {resolveEngine} from '../static/js/banchi/voci/engines.js';
import * as engine from '../examples/extensions/area-rettangolo/1.0.0/engine.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const schema = async (name) => new Ajv2020().compile(await read('contracts/' + name + '-v1.schema.json'));

test('I contratti pubblicati accettano il pacchetto di geometria e respingono una legge incompleta', async () => {
  const manifest = await read('examples/extensions/area-rettangolo/1.0.0/manifest.json');
  const record = (await read('examples/geometria.json')).records.at(-1);
  assert.ok((await schema('engine-ref'))(record.engine));
  const validate = await schema('engine');
  assert.ok(validate(manifest), JSON.stringify(validate.errors));
  assert.equal(validate({...manifest, law: {op: 'multiply', left: {input: true}}}), false);
  assert.equal(manifest.sha256, createHash('sha256').update(await readFile(path.join(root,
    'examples/extensions/area-rettangolo/1.0.0/engine.js'))).digest('hex'));
  const checkpoints = Array.from({length: 8}, (_, i) => [i + 1, 3 * (i + 1)]);
  record.engineSpec = {...manifest, checkpoints};
  const result = await resolveEngine(record, async (url) => {
    assert.equal(url, '/api/v1/engines/area-rettangolo/1.0.0/' + manifest.sha256 + '.js');
    return engine;
  });
  for (let i = 0; i <= 280; i++) assert.equal(result.law.measure(1+i/40), 3*(1+i/40));
  await assert.rejects(resolveEngine(record, async () => ({
    ...engine, measure: (x) => x === 7 ? 17 : engine.measure(x),
  })), /misura/);
  const openapi = await read('contracts/openapi.json');
  for (const name of ['engine', 'engine-ref', 'pathway', 'proposal', 'exam', 'catalog-search', 'error-diary']) assert.equal(typeof await schema(name), 'function');
  assert.equal(openapi.openapi, '3.1.1');
  assert.ok(openapi.paths['/v1/courses/{course}/learning-path'].get.security.length);
});

test('Il client MCP ufficiale negozia il protocollo e invoca solo gli strumenti autorizzati', async () => {
  const client = new Client({name:'cric-client-contract',version:'1.0.0'});
  const transport = new StdioClientTransport({command:'python3', cwd:root, args:[
    '-m','tools.assistente_editoriale','mcp','--course','C6','--allow','search','--allow','read']});
  try {
    await client.connect(transport);
    assert.deepEqual((await client.listTools()).tools.map((r) => r.name), ['search','read']);
    const search = await client.callTool({name:'search',arguments:{query:'rimbalzo del suono'}});
    const key = JSON.parse(search.content[0].text)[0].id;
    assert.equal(key, 'C6-L01');
    const lesson = await client.callTool({name:'read',arguments:{id:key}});
    assert.ok(JSON.parse(lesson.content[0].text).passages.length);
    const denied = await client.callTool({name:'read',arguments:{id:'C1-L001'}});
    assert.ok(denied.isError);
    await assert.rejects(client.callTool({name:'propose',arguments:{}}));
  } finally {
    await client.close();
  }
});
