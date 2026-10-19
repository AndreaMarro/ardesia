// Builds once, uses an isolated synthetic DB, restarts the real service, then reopens.
import {spawn,spawnSync} from 'node:child_process'
import {mkdirSync,openSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {createHash} from 'node:crypto'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')
const runId=`run-${new Date().toISOString().replaceAll(/[:.]/g,'-')}`
const output=path.join(root,'artifacts/study-demo',runId)
const data=path.join(root,'.study-demo',runId)
mkdirSync(output,{recursive:true});mkdirSync(data,{recursive:true,mode:0o700})
const uv=process.env.ARDESIA_UV??path.join(process.env.HOME,'.local/bin/uv')
const port=Number(process.env.STUDY_VERIFY_PORT??5228)
const env={...process.env,STUDY_DEMO_DATA_DIR:data,ARDESIA_STUDIO_E2E_BASE_URL:`http://127.0.0.1:${port}`,STUDY_EXPECTED_SHA:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim()}
const startSha=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim()
const dirtyAtStart=spawnSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).stdout.trim()!==''
const commands=[]
const serverProcesses=[]
const dataId=createHash('sha256').update(path.join(data,'study.sqlite')).digest('hex').slice(0,16)
function run(command,args,name){const log=path.join(output,name+'.log');const fd=openSync(log,'w');const result=spawnSync(command,args,{cwd:root,env,stdio:['ignore',fd,fd]});commands.push({command:[command,...args],exit:result.status,log});if(result.status!==0)throw new Error(`${name} failed: ${log}`)}
let server
async function start(){server=spawn(path.join(root,'services/study-api/.venv/bin/python'),['bin/study-demo/serve.py','--data-dir',data,'--port',String(port)],{cwd:root,env,stdio:['ignore',openSync(path.join(output,'server.log'),'a'),openSync(path.join(output,'server.log'),'a')]});for(let i=0;i<100;i++){try{const response=await fetch(`http://127.0.0.1:${port}/study/health`);const health=await response.json();if(health.dataId===dataId){serverProcesses.push(health.processId);return}}catch{}await new Promise(resolve=>setTimeout(resolve,100))}throw new Error('server did not become ready')}
async function stop(){if(!server)return;server.kill('SIGTERM');if(server.exitCode===null)await new Promise(resolve=>server.once('exit',resolve));server=undefined}
let passed=false
try{
 run('npm',['--prefix','apps/studio','run','build'],'build')
 run(uv,['run','--project','services/study-api','python','bin/study-demo/seed.py','--data-dir',data],'seed')
 run(uv,['run','--project','services/study-api','python','bin/study-demo/fixtures.py',path.join(data,'fixtures')],'fixtures')
 await start()
 run('npm',['--prefix','apps/studio','run','e2e','--','e2e/study-group-journey.spec.ts','--workers=1','--output',path.join(output,'journey')],'journey')
 await stop();await start()
 run('npm',['--prefix','apps/studio','run','e2e','--','e2e/study-cold-reopen.spec.ts','--workers=1','--output',path.join(output,'cold')],'cold-reopen')
 run(uv,['run','--project','services/study-api','python','bin/study-demo/backup.py',data,data+'-backup'],'paired-backup')
 passed=true
}finally{
 await stop()
 const sha=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim()
 passed=passed&&!dirtyAtStart&&sha===startSha
 if(!passed)process.exitCode=1
 writeFileSync(path.join(output,'manifest.json'),JSON.stringify({runId,sha,startSha,dirtyAtStart,passed,synthetic:true,liveModelTested:false,apiSpendUsd:0,serverProcesses,commands},null,2))
 console.log(JSON.stringify({runId,output,passed}))
}
