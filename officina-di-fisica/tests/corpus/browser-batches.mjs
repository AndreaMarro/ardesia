// The registry determines the actual batches to render; no fixed pilot-only list.
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const registry=JSON.parse(await readFile(path.join(root,'editorial/batches/registry.json'),'utf8'));
if(registry.schemaVersion!=='1.0.0'||!registry.batches?.length)throw Error('Invalid batch registry');
const output=process.env.ASTRA_RESULTS||path.join(root,'var/corpus-browser');
const seen=new Set();
for(const batch of registry.batches){
 if(!/^[a-z][a-z0-9-]{0,63}$/.test(batch.id)||seen.has(batch.id))throw Error('Invalid or duplicate batch ID');
 seen.add(batch.id);
 execFileSync(process.execPath,[path.join(root,'tests/corpus/browser-drafts.mjs'),batch.id],{
  cwd:root,stdio:'inherit',env:{...process.env,ASTRA_RESULTS:path.resolve(root,output,batch.id)}
 });
}
