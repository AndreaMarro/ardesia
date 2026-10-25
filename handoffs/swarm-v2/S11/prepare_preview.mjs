// Generates a disposable local QA page outside the repository; no new product shell.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile,symlink,realpath} from 'node:fs/promises';
import path from 'node:path';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const require=createRequire(path.join(repo,'package.json'));
const output=path.resolve(process.argv[2]??'');
if(!process.argv[2]||output.startsWith(repo+path.sep))throw new Error('Choose a private output directory outside the repository');
await mkdir(output,{recursive:true});
const dependencies=await realpath(path.join(repo,'node_modules'));
try{await symlink(dependencies,path.join(output,'node_modules'));}catch(e){if(e.code!=='EEXIST')throw e;}
const source='/@fs/'+path.join(repo,'apps/web/src');
const session='/@fs/'+path.join(repo,'apps/studio/src/study/sessionBoundary');
await writeFile(path.join(output,'s11.html'),'<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ardesia · Evidenze del percorso</title><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module" src="/preview.tsx"></script></body></html>');
await writeFile(path.join(output,'preview.tsx'),`
import React from 'react';import {createRoot} from 'react-dom/client';
import {LearningInsights} from ${JSON.stringify(source+'/features/learning-insights/LearningInsights')};
import ${JSON.stringify(source+'/styles.css')};
import {activateStudySession,beginStudySessionCheck} from ${JSON.stringify(session)};
const response=await fetch('/study/me');const me=await response.json();
if(response.ok){activateStudySession(beginStudySessionCheck());createRoot(document.getElementById('root')!).render(<main style={{padding:'clamp(16px,4vw,48px)'}}><LearningInsights me={me} editionId="s11-fluidi"/></main>);}
else document.getElementById('root')!.textContent='Sessione di prova non attiva.';
`);
await writeFile(path.join(output,'vite.config.mjs'),`
import react from ${JSON.stringify(require.resolve('@vitejs/plugin-react'))};
export default {root:${JSON.stringify(output)},plugins:[react()],resolve:{dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:55610,strictPort:true,fs:{allow:${JSON.stringify([output,repo,dependencies])}},proxy:{'/study':{target:'http://127.0.0.1:55621',changeOrigin:false}}}};
`);
console.log('Private preview prepared; start existing Vite with --config '+path.join(output,'vite.config.mjs')+' --configLoader native');
