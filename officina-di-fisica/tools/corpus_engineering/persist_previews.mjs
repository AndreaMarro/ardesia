// Persist authentic terminal evidence through the existing canonical validators.
// Partial collection is archive-only; no standard reports are changed on missing evidence.
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sha256,validateBatchSpec,validateCompletion} from '../../tests/corpus/browser-batches-resume.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const [output,expectedRuntime,epoch=expectedRuntime?.slice(0,12),mode='standard']=process.argv.slice(2);
if(!output||!/^[a-f0-9]{64}$/.test(expectedRuntime||''))throw Error('Usage: persist_previews.mjs OUTPUT EXPECTED_RUNTIME_SHA256 [EPOCH] [standard|archive-only]');
if(!/^[a-f0-9]{4,64}$/.test(epoch)||!expectedRuntime.startsWith(epoch)||!['standard','archive-only'].includes(mode))throw Error('Explicit runtime epoch and persistence mode required');
const registryBytes=await readFile(`${root}/editorial/batches/registry.json`),registry=JSON.parse(registryBytes);
const runtimeFingerprint=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
if(runtimeFingerprint.sha256!==expectedRuntime)throw Error('Wrong runtime');
const common={runtimeFingerprint};
for(const [key,file] of [['protocolSha256','browser-drafts.mjs'],['runnerSha256','browser-batches.mjs'],['helperSha256','browser-batches-resume.mjs']])common[key]=sha256(await readFile(`${root}/tests/corpus/${file}`));
const archiveRel=`editorial/reviews/runtime${epoch}-terminal-evidence`;
const archive=`${root}/${archiveRel}`;
await mkdir(archive,{recursive:true});
const batches=[...registry.batches.map(b=>({id:b.id,questionIds:b.questionIds})),...(registry.activityBatches||[]).flatMap(b=>b.revisionPackage?[{id:b.revisionPackage,activityIds:b.activityIds}]:[])];
const entries=[];const writes=[];
for(const batch of batches){
 let markerBytes;
 try{markerBytes=await readFile(`${output}/${batch.id}/completion.json`);}catch(error){if(error.code==='ENOENT')continue;throw error;}
 const [packageBytes,reportBytes]=await Promise.all([readFile(`${root}/editorial/batches/${batch.id}.json`),readFile(`${output}/${batch.id}/report.json`)]);
 const marker=JSON.parse(markerBytes),pkg=JSON.parse(packageBytes);
 validateBatchSpec(pkg,batch);
 validateCompletion(marker,reportBytes,pkg,{batch:batch.id,packageFileSha256:sha256(packageBytes),...common});
 if(mode==='standard')writes.push([`${root}/editorial/reviews/${batch.id}-browser.json`,reportBytes]);
 writes.push([`${archive}/${batch.id}-report.json`,reportBytes],[`${archive}/${batch.id}-completion.json`,markerBytes]);
 entries.push({batch:batch.id,caseCount:marker.caseCount,packageFileSha256:marker.packageFileSha256,reportPath:`${archiveRel}/${batch.id}-report.json`,reportSha256:sha256(reportBytes),terminalMarkerPath:`${archiveRel}/${batch.id}-completion.json`,terminalMarkerSha256:sha256(markerBytes),terminalExitCode:0});
}
if(mode==='standard'&&entries.length!==batches.length)throw Error('Incomplete terminal evidence: standard persistence requires every registered package');
if(!registryBytes.equals(await readFile(`${root}/editorial/batches/registry.json`)))throw Error('Registry changed');
const after=JSON.parse(execFileSync('python3',['-m','tools.corpus_engineering.runtime_fingerprint'],{cwd:root,encoding:'utf8'}));
if(JSON.stringify(after)!==JSON.stringify(runtimeFingerprint))throw Error('Runtime changed');
for(const [key,file] of [['protocolSha256','browser-drafts.mjs'],['runnerSha256','browser-batches.mjs'],['helperSha256','browser-batches-resume.mjs']])if(sha256(await readFile(`${root}/tests/corpus/${file}`))!==common[key])throw Error('Preview protocol changed');
for(const [file,bytes] of writes){const temporary=file+'.tmp';await writeFile(temporary,bytes);await rename(temporary,file);}
const index={schemaVersion:'1.0.0',status:entries.length===batches.length?'ALL_TERMINAL_EVIDENCE_SAVED_GLOBAL_GATE_STILL_REQUIRED':'PARTIAL_TERMINAL_EVIDENCE_SAVED_NOT_A_GLOBAL_PASS',registrySha256:sha256(registryBytes),runtimeSha256:runtimeFingerprint.sha256,protocolSha256:common.protocolSha256,runnerSha256:common.runnerSha256,helperSha256:common.helperSha256,expectedBatches:batches.length,savedBatches:entries.length,savedCases:entries.reduce((n,e)=>n+e.caseCount,0),checkpointCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE',entries};
await writeFile(`${archive}/index.json`,JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({savedBatches:index.savedBatches,savedCases:index.savedCases,status:index.status}));
