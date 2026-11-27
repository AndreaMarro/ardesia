// Technical regression parity only. The independent scientific review is separate.
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

export const REFERENCE_KIND='IMMUTABLE_BASELINE_ISOLATED_BROWSER_CONTEXT_V2';
const REFERENCE_ORIGIN='https://cric-baseline.invalid';
const ISOLATION='DISTINCT_CONTEXT_AND_ORIGIN';
const BASELINE='eb51d0e9bdc3f992e9ae0ae76810098376e2ab79';
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>JSON.stringify(Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0)));
const entries=['js/banchi/voci/esperimento.js','js/banchi/quaderno.js','js/banchi/modelli/induzione.js'];

export function assertStrictBaselineParity(measured){
 const b=measured.baselineReference;
 assert.equal(b?.kind,REFERENCE_KIND,'Missing same-browser baseline reference');
 assert.equal(b.isolation,ISOLATION,'Baseline lacks a distinct browser context and origin');
 assert.match(b.realmId,/^[a-f0-9-]{36}$/,'Baseline realm identity missing');
 assert.equal(b.pilot,measured.pilot,'Baseline pilot identity differs');
 assert.equal(b.clockTime,measured.sourceReplayedClockTime,'Baseline clock input differs');
 assert.ok(Number.isFinite(measured.sourceReplayedX)&&Number.isFinite(b.observedX),'Nonfinite baseline input');
 assert.equal(b.observedX,measured.sourceReplayedX,'Baseline evaluated a different input');
 assert.deepEqual(b.actualDOMControls,measured.actualDOMControls,'Baseline input controls differ');
 assert.ok(Number.isFinite(measured.model?.y)&&Number.isFinite(b.model?.y),'Nonfinite numerical result');
 const finite=v=>{if(typeof v==='number')assert.ok(Number.isFinite(v),'Nonfinite model component');else if(v&&typeof v==='object')for(const item of Object.values(v))finite(item);};
 finite(measured.model);finite(b.model);
 // No absolute, relative or ULP tolerance, including for transcendental functions.
 assert.deepEqual(measured.model,b.model,'Immutable same-browser baseline model drifted');
}

export async function loadBaselineReference(plan){
 const ref=plan.numericalReference;
 if(!ref)return null;
 assert.equal(ref.kind,REFERENCE_KIND);assert.equal(ref.baselineRuntimeRef,BASELINE);
 assert.equal(ref.scientificAuthority,'NONE_TECHNICAL_REGRESSION_PARITY_ONLY');
 assert.equal(sha(Buffer.from(canonical(ref.files))),ref.manifestSha256,'Baseline manifest rebound');
 const requestRaw=await fs.readFile(plan.requestFile),request=JSON.parse(requestRaw);
 assert.equal(sha(requestRaw),plan.requestSha256);assert.deepEqual(request.numericalReference,ref);
 assert.ok(plan.records.every(r=>!r.record.engine),'External engines require a separately pinned reference contract');
 const root=path.resolve(plan.baselineBundleRoot),files=new Map();
 assert.equal(await fs.realpath(root),root,'Baseline root is a symlink');
 for(const [name,pin]of Object.entries(ref.files)){
  assert.match(name,/^officina-di-fisica\/static\/[A-Za-z0-9_./-]+\.js$/);
  const rel=name.slice('officina-di-fisica/static/'.length);
  assert.ok(!rel.split('/').includes('..'));const local=path.join(root,rel);
  assert.equal(await fs.realpath(local),local,'Baseline path contains a symlink');
  const bytes=await fs.readFile(local);assert.equal(sha(bytes),pin,'Baseline bytes drifted: '+rel);
  files.set(rel,{local,bytes,sha256:pin});
 }
 const require=createRequire(import.meta.url),parserPath=require.resolve('typescript');
 assert.equal(sha(await fs.readFile(parserPath)),ref.typescriptSha256,'Import parser bytes drifted');
 const {default:ts}=await import(pathToFileURL(parserPath).href);
 assert.equal(sha(await fs.readFile(parserPath)),ref.typescriptSha256);
 const dependencies=new Map(),visited=new Set();
 function dependency(spec,from){
  assert.ok(spec.startsWith('./')||spec.startsWith('../'),'Baseline import escapes namespace: '+spec);
  const rel=new URL(spec,'https://baseline.invalid/'+from).pathname.slice(1);
  assert.ok(files.has(rel),'Unpinned baseline dependency: '+rel);return rel;
 }
 function inspect(name){
  if(visited.has(name))return;visited.add(name);const file=files.get(name);assert.ok(file,'Missing baseline entry: '+name);
  const source=ts.createSourceFile(name,file.bytes.toString('utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  assert.equal(source.parseDiagnostics.length,0,'Invalid baseline JavaScript');const deps=new Set();
  function walk(node){
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier){
    assert.ok(ts.isStringLiteral(node.moduleSpecifier));deps.add(dependency(node.moduleSpecifier.text,name));
   }
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword){
    assert.equal(node.arguments.length,1);const arg=node.arguments[0];
    if(ts.isStringLiteral(arg))deps.add(dependency(arg.text,name));
    else{
     assert.equal(name,'js/banchi/voci/engines.js','Unknown dynamic baseline importer');
     const expression=arg.getText(source).replace(/\s+/g,'');
     if(expression==="'./modelli/'+record.course+'.js'")for(const c of ['C1','C2','C3','C4','C5','C6'])deps.add(dependency('./modelli/'+c+'.js',name));
     else if(expression==="'./apparati/'+family+'.js'")for(const f of ['meccanica','fluidi','termica','campi','onde'])deps.add(dependency('./apparati/'+f+'.js',name));
     else assert.equal(expression,'path','Unreviewed dynamic baseline import');
     // import(path) belongs only to the external-engine branch. All such
     // records are rejected above and again in the browser before construction.
    }
   }
   ts.forEachChild(node,walk);
  }
  walk(source);dependencies.set(name,[...deps].sort());for(const d of deps)inspect(d);
 }
 for(const entry of entries)inspect(entry);
 const namespace='/__cric_baseline/'+BASELINE+'/'+ref.manifestSha256+'/';
 const served=new Map(),denied=[];
 return{namespace,kind:REFERENCE_KIND,
  async route(route){
   const url=new URL(route.request().url());
   if(!url.pathname.startsWith('/__cric_baseline/'))return false;
   const rel=url.pathname.startsWith(namespace)?url.pathname.slice(namespace.length):null;
   if(url.search||!rel||!visited.has(rel)){
    denied.push({path:url.pathname,reason:'Outside immutable dependency closure'});await route.abort();return true;
   }
   const file=files.get(rel),bytes=await fs.readFile(file.local);
   assert.equal(sha(bytes),file.sha256,'Baseline module changed during browser run');
   served.set(rel,file.sha256);await route.fulfill({status:200,contentType:'text/javascript',body:bytes});return true;
  },
  async evidence(){
   for(const [name,file]of files)assert.equal(sha(await fs.readFile(file.local)),file.sha256,'Baseline drift after observation: '+name);
   assert.deepEqual(denied,[],'Unpinned baseline request attempted');
   return{kind:REFERENCE_KIND,baselineRuntimeRef:BASELINE,manifestSha256:ref.manifestSha256,namespace,
    dependencyClosure:Object.fromEntries([...dependencies].sort()),servedFiles:Object.fromEntries([...served].sort()),
    allManifestBytesCheckedBeforeAndAfter:true,scientificAuthority:ref.scientificAuthority,activityCredit:0};
  }};
}

// Route the pinned reference in a clean context. The candidate context never
// serves reference modules and cannot share its JavaScript intrinsics.
export async function createBaselineRealm(browser, reference){
 const context=await browser.newContext({serviceWorkers:'block'});
 const realmId=randomUUID();
 const documentURL=REFERENCE_ORIGIN+reference.namespace+'realm.html';
 try{
  await context.route('**/*',async route=>{
   const request=route.request();
   const url=new URL(request.url());
   if(request.method()==='GET'&&url.origin===REFERENCE_ORIGIN){
    if(request.url()===documentURL&&request.isNavigationRequest()){
     await route.fulfill({status:200,contentType:'text/html',
      headers:{'Content-Security-Policy':"default-src 'none'; script-src 'self'"},
      body:'<!doctype html><meta charset="utf-8"><title>Cric immutable baseline</title>'});
     return;
    }
    if(request.resourceType()==='script'&&await reference.route(route))return;
   }
   await route.abort();
  });
  const page=await context.newPage();
  await page.goto(documentURL);
  assert.equal(page.url(),documentURL);
  assert.deepEqual(await context.cookies(),[],'Reference context has cookies');
  const isolation={isolation:ISOLATION,realmId,documentURL,serviceWorkers:'block'};
  return {
   async solve(candidatePage, row, controls, requestedTime){
    assert.notEqual(candidatePage.context(),context,'Candidate page shares the baseline context');
    assert.equal(candidatePage.context().browser(),browser,'Baseline must use the same browser');
    assert.notEqual(new URL(candidatePage.url()).origin,REFERENCE_ORIGIN,'Candidate page shares the baseline origin');
    const result=await page.evaluate(async ({row,controls,requestedTime,namespace,documentURL})=>{
     if(location.href!==documentURL||document.scripts.length!==0)throw Error('Unexpected baseline document');
     if(row.engine)throw Error('External engine has no pinned baseline contract');
     const xControl=controls.find(c=>c.name==='x');
     if(!xControl)throw Error('Observed x control missing');
     const x=Number(xControl.value);
     const {esperienza}=await import(namespace+'js/banchi/voci/esperimento.js');
     const original=await esperienza(row);
     const {piloti}=await import(namespace+'js/banchi/quaderno.js');
     const pilot=piloti[row.id]??null;
     if(pilot==='induzione'){
      const {solve}=await import(namespace+'js/banchi/modelli/induzione.js');
      const inputs=Object.fromEntries(controls.map(c=>[c.name,c.name==='circuit'?c.value:Number(c.value)]));
      return {pilot,observedX:x,clockTime:requestedTime??0,model:solve(inputs),actualDOMControls:controls};
     }
     const clockTime=original.clock?(original.clock.input?x:requestedTime??0):null;
     return {pilot,observedX:x,clockTime,model:original.model.solve({x}),actualDOMControls:controls};
    },{row,controls,requestedTime,namespace:reference.namespace,documentURL});
    return {kind:reference.kind,namespace:reference.namespace,...isolation,...result};
   },
   async evidence(){
    assert.equal(page.url(),documentURL);
    assert.deepEqual(await context.cookies(),[],'Reference context acquired cookies');
    return {...await reference.evidence(),...isolation};
   }
  };
 }catch(error){
  await context.close();
  throw error;
 }
}
