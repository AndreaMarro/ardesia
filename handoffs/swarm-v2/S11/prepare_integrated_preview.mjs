// Private QA composition of the proposed shared App patch; shared sources untouched.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const output=path.resolve(process.argv[2]??'');
if(!process.argv[2]||output.startsWith(repo+path.sep))throw Error('Private output outside repository required');
const result=spawnSync(process.execPath,[path.join(repo,'handoffs/swarm-v2/S11/prepare_preview.mjs'),output],{stdio:'inherit'});
if(result.status)process.exit(result.status);
let app=await readFile(path.join(output,'copies/apps/web/src/App.tsx'),'utf8');
// Resolve only the relative module specifiers of the private App copy back to real sources.
app=app.replace(/(from\s+|import\()(["'])(\.[^"']+)\2/g,(_,prefix,quote,spec)=>{
 const base=path.resolve(repo,'apps/web/src',spec);
 const target=[base,...['.tsx','.ts','.jsx','.js','.mjs'].map(ext=>base+ext)].find(file=>existsSync(file));
 if(!target)throw Error('Missing original module: '+spec);
 return prefix+quote+'/@fs'+target+quote;
});
await writeFile(path.join(output,'proposed-app.tsx'),app);
const source='/@fs/'+path.join(repo,'apps/web/src');
await writeFile(path.join(output,'preview.tsx'),`import React from 'react';import {createRoot} from 'react-dom/client';import App from './proposed-app';import ${JSON.stringify(source+'/styles.css')};createRoot(document.getElementById('root')!).render(<App/>);`);
console.log('Proposed real shell composition prepared; not a shared-source installation.');
