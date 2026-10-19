// Local synthetic product/restore proof. No production connection or provider.
import {spawn,spawnSync} from 'node:child_process'
import {mkdirSync,openSync,writeFileSync,readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')
const runId=`run-${new Date().toISOString().replaceAll(/[:.]/g,'-')}`
const output=path.join(root,'artifacts/study-m2',runId);mkdirSync(output,{recursive:true})
const sha=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim()
if(spawnSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).stdout.trim())throw new Error('clean_tree_required')
const env={...process.env,STUDY_EXPECTED_SHA:sha,STUDY_VERIFY_PORT:'5228'}
const commands=[]
function run(command,args,name){const file=path.join(output,name+'.log');const fd=openSync(file,'w');const result=spawnSync(command,args,{cwd:root,env,stdio:['ignore',fd,fd]});commands.push({command:[command,...args],exit:result.status,log:file});if(result.status!==0)throw new Error(name+' failed; '+file);return readFileSync(file,'utf8')}
let server,passed=false,m1,operations
try{
 const text=run(process.execPath,['bin/study-demo/verify.mjs'],'integrated-M1-regression')
 const result=JSON.parse(text.trim().split('\n').at(-1));m1=JSON.parse(readFileSync(path.join(result.output,'manifest.json'),'utf8'))
 if(!m1.passed)throw new Error('M1 regression not accepted')
 const data=path.join(root,'.study-demo',m1.runId);env.STUDY_DEMO_DATA_DIR=data;env.ARDESIA_STUDIO_E2E_BASE_URL='http://127.0.0.1:5230'
 server=spawn(path.join(root,'services/study-api/.venv/bin/python'),['bin/study-demo/serve.py','--data-dir',data,'--port','5230','--no-seed'],{cwd:root,env,stdio:['ignore',openSync(path.join(output,'server.log'),'a'),openSync(path.join(output,'server.log'),'a')]})
 let ready=false;for(let i=0;i<100;i++){try{const health=await (await fetch('http://127.0.0.1:5230/study/health')).json();if(health.processId===server.pid){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,100))}if(!ready)throw new Error('M2 server did not become ready')
 run('npm',['--prefix','apps/studio','run','e2e','--','e2e/study-m2-preparation.spec.ts','--workers=1','--output',path.join(output,'browser')],'M2-browser')
 server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>server.once('exit',resolve));server=undefined
 run(path.join(root,'services/study-api/.venv/bin/python'),['bin/study-demo/prove-operations.py',data,path.join(output,'operations')],'cold-restore-erasure')
 operations=JSON.parse(readFileSync(path.join(output,'operations/report.json'),'utf8'))
 run(path.join(root,'services/study-api/.venv/bin/python'),['bin/study-demo/review-content.py',path.join(output,'content-review')],'content-review-export')
 passed=operations.passed&&spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim()===sha&&!spawnSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).stdout.trim()
}finally{
 if(server){server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>server.once('exit',resolve))}
 writeFileSync(path.join(output,'manifest.json'),JSON.stringify({runId,sha,passed,synthetic:true,apiSpendUsd:0,humanPilot:'NOT_RUN',launchAllowed:false,m1Regression:m1,operations,commands},null,2))
 console.log(JSON.stringify({output,passed}));if(!passed)process.exitCode=1
}
