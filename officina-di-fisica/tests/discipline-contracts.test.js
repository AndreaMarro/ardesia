import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = fileURLToPath(new URL('../', import.meta.url));

test('Contratti HTTP, consenso sul quaderno e biblioteca MCP di una disciplina installata', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'cric-contract-'));
  const env = {...process.env, ASTRA_HOSTED: '0', ASTRA_DATA: tmp};
  const install = (...args) => execFileSync('python3', ['app.py', 'install-discipline', 'examples/discipline/catalog.json', ...args], {cwd: root, env});
  const boot = [
    'from server.store import connect, digest, NOW',
    'from server.web import Handler, ThreadingHTTPServer',
    'with connect() as db: db.execute("INSERT INTO tickets VALUES(?,?)",(digest("example-only"),NOW()+60))',
    's=ThreadingHTTPServer(("127.0.0.1",0),Handler)',
    'print(s.server_port,flush=True)',
    's.serve_forever()',
  ].join('\n');
  let child, client;
  try {
    install();
    child = spawn('python3', ['-uc', boot], {cwd: root, env, stdio: ['ignore', 'pipe', 'inherit']});
    const lines = createInterface({input: child.stdout});
    const [port] = await Promise.race([once(lines, 'line'), once(child, 'exit').then(() => { throw Error('Server non avviato'); })]);
    lines.close();
    const url = 'http://127.0.0.1:' + port + '/api';
    const api = (route, data, cookie) => fetch(url + route, {
      method: data ? 'POST' : 'GET', headers: {...(data ? {'Content-Type': 'application/json', 'X-Astra-Request': '1'} : {}), ...(cookie ? {Cookie: cookie} : {})},
      body: data ? JSON.stringify(data) : undefined,
    });
    const ajv = new Ajv2020();
    const schema = await (await api('/v1/schemas/disciplines-v1.schema.json')).json();
    ajv.addSchema(schema, 'cric');
    const check = (which, data) => {
      const validate = ajv.getSchema('cric#/$defs/' + which);
      assert.ok(validate(data), JSON.stringify(validate.errors));
      return data;
    };
    const dir = '/v1/disciplines', subject = dir + '/misure';
    check('directory', await (await api(dir)).json());
    check('catalog', await (await api(dir+'/fisica')).json());
    check('catalog', await (await api(subject)).json());
    assert.equal((await api(subject + '/units/tessere')).status, 401);
    const cookie = (await api('/demo', {})).headers.get('set-cookie').split(';')[0];
    const unit = check('unit', await (await api(subject + '/units/tessere', null, cookie)).json());
    const event = {requestId:'sample-attempt', version:unit.version, unitId:unit.id, activityId:'griglia',kind:'answer',optionId:'a'};
    check('event',event);
    const receipt = check('receipt',await (await api(subject + '/events', event, cookie)).json());
    assert.equal(receipt.correct,true);
    check('notebook',await (await api(subject + '/me',null,cookie)).json());
    const context = {unitId:unit.id,version:unit.version,scopes:['objective']};
    check('contextRequest',context);
    const download = check('context',await (await api(subject+'/context',context,cookie)).json());
    assert.equal(download.objective,unit.objective);
    assert.equal('evidence' in download,false);
    assert.equal((await api(subject+'/context',{...context,scopes:['unregistered']},cookie)).status,400);
    const calc = {operation:'equivalent',expression:'x/x',candidate:'1'};
    check('comparison',calc);
    assert.equal(check('verdict',await (await api('/v1/mathematics/compare',calc)).json()).verdict,'different-domain');
    const owner = (await api('/owner',{ticket:'example-only'})).headers.get('set-cookie').split(';')[0];
    const libraryRoute = subject + '/courses/rettangoli/editorial-library';
    assert.equal((await api(libraryRoute,null,owner)).status,403);
    install('--activate','--publish-reviewed');
    assert.equal((await api(libraryRoute,null,cookie)).status,403);
    const library = await (await api(libraryRoute,null,owner)).json();
    const validate = ajv.compile(JSON.parse(await readFile(path.join(root,'contracts/library-v1.schema.json'))));
    assert.ok(validate(library),JSON.stringify(validate.errors));
    assert.equal(JSON.stringify(library).includes('correctOptionId'),false);
    const file = path.join(tmp,'library.json');
    await writeFile(file, JSON.stringify(library));
    client = new Client({name:'cric-discipline-contract',version:'1.0'});
    await client.connect(new StdioClientTransport({command:'python3',cwd:root,args:[
      '-m','tools.assistente_editoriale','mcp','--library',file,'--course','rettangoli','--allow','read'
    ]}));
    assert.deepEqual((await client.listTools()).tools.map(t => t.name), ['read']);
    const lesson = await client.callTool({name:'read',arguments:{id:unit.id}});
    assert.equal(JSON.parse(lesson.content[0].text).passages[0],unit.lesson[0].body);
    assert.ok((await client.callTool({name:'read',arguments:{id:'C6-L01'}})).isError);
  } finally {
    if (client) await client.close();
    if (child && child.exitCode === null) {
      const stopped=once(child,'exit'); child.kill(); await stopped;
    }
    await rm(tmp,{recursive:true,force:true});
  }
});
