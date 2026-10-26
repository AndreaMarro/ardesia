import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { patchCanonicalReplay,REPLAY_SHA256 } from './canonical-patch.mjs'
const target=path.resolve('src/ReplayView.tsx')
const source=fs.readFileSync(target,'utf8')
const patched=patchCanonicalReplay(source)
const config=ts.readConfigFile('tsconfig.app.json',ts.sys.readFile)
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd())
const host=ts.createCompilerHost(parsed.options)
const originalRead=host.readFile.bind(host)
host.readFile=file=>path.resolve(file)===target?patched:originalRead(file)
const program=ts.createProgram([target,path.resolve('src/vite-env.d.ts')].filter(fs.existsSync),{...parsed.options,noEmit:true},host)
const diagnostics=ts.getPreEmitDiagnostics(program)
if(diagnostics.length){console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCurrentDirectory:()=>process.cwd(),getCanonicalFileName:n=>n,getNewLine:()=> '\n'}));process.exitCode=1}
else console.log(JSON.stringify({base:'a00f2f40091aecf69e58ebaba42cf70d748e4066',sourceSha256:REPLAY_SHA256,patchedCanonicalReplayTypecheck:'PASS'}))
