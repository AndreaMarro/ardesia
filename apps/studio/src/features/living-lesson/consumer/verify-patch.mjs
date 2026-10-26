import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import ts from 'typescript'
const target=path.resolve('src/ReplayView.tsx')
const source=fs.readFileSync(target,'utf8')
const config=ts.readConfigFile('tsconfig.app.json',ts.sys.readFile)
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd())
const host=ts.createCompilerHost(parsed.options)
// Compile the consumer against the actual product contract, with no casts or
// source patches. canonical-patch.mjs remains the historical pre-integration artifact.
const program=ts.createProgram([target,path.resolve('src/features/living-lesson/consumer/main.tsx'),path.resolve('src/vite-env.d.ts')].filter(fs.existsSync),{...parsed.options,noEmit:true},host)
const diagnostics=ts.getPreEmitDiagnostics(program)
if(diagnostics.length){console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCurrentDirectory:()=>process.cwd(),getCanonicalFileName:n=>n,getNewLine:()=> '\n'}));process.exitCode=1}
else console.log(JSON.stringify({sourceSha256:createHash('sha256').update(source).digest('hex'),canonicalReplayTypecheck:'PASS',sourceTransform:false}))
