import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const repo=process.env.ARDESIA_G0_REPO??'/workspace/scratch/4d73e8ddb2b6/ardesia-g0';
const state='/tmp/ardesia-g0-run04/private-state',origin='http://127.0.0.1:5498';
const out=process.env.ARDESIA_G0_LAYOUT_OUTPUT??'/tmp/ardesia-g0-layout-red';await mkdir(out,{recursive:true});
const access=JSON.parse(await readFile(join(state,'identity.json'),'utf8'));
const result=JSON.parse(await readFile('/tmp/ardesia-g0-run04/result.json','utf8'));
const {chromium}=await import(pathToFileURL(join(repo,'node_modules/playwright/index.mjs')).href);
const python='/workspace/scratch/4d73e8ddb2b6/ardesia/services/study-api/.venv/bin/python';
const server=spawn(python,['-m','uvicorn','fixture:app','--host','127.0.0.1','--port','5498'],{cwd:repo,
 env:{...process.env,ARDESIA_G0_STATE:state,ARDESIA_G0_WEB:join(repo,'apps/web/dist'),ARDESIA_G0_STUDIO:join(repo,'apps/studio/dist'),
 PYTHONPATH:[join(repo,'packages/engine'),join(repo,'services/study-api'),join(repo,'plugins/s19-circuit-lab'),'/tmp/ardesia-g0-proof'].join(':')},stdio:'ignore'});
let browser;const rows=[];
async function geometry(page){return page.evaluate(()=>{
 const shell=document.querySelector('aside[aria-label="Navigazione e account"]'),main=document.querySelector('.app-main');
 const rect=element=>element?Object.fromEntries(['x','y','width','height'].map(key=>[key,element.getBoundingClientRect()[key]])):null;
 const style=getComputedStyle(shell);return {width:innerWidth,sidebar:{...rect(shell),position:style.position,maxWidth:style.maxWidth,insetBlockStart:style.insetBlockStart},main:rect(main),overflow:document.documentElement.scrollWidth>innerWidth+1};
});}
try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/study/me')).status===401)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,executablePath:'/tmp/ardesia-browsers/chromium-1223/chrome-linux64/chrome'});
 for(const width of [1440,820,390,360]){
  const context=await browser.newContext({viewport:{width,height:1100},reducedMotion:'reduce'});
  await context.request.post(origin+'/study/session',{data:{token:access.student.token}});
  const page=await context.newPage();await page.goto(origin+'/?view=classroom&edition=fluidi');await page.getByTestId('learning-journey').waitFor();
  const before=await geometry(page);await page.getByRole('button',{name:'Apri la fonte',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'La spiegazione originale',exact:true});
  await dialog.locator('.ls-viewport .textLayer span').filter({hasText:'Q = pi r^4 Dp / (8 eta L)'}).first().waitFor();
  await page.keyboard.press('Escape');const after=await geometry(page);
  await page.screenshot({path:join(out,'shell-after-pdf-'+width+'.png'),fullPage:true});
  await page.goto(origin+'/?'+new URLSearchParams({view:'materials',edition:'fluidi',mediaSource:result.passage.resourceId,mediaRevision:result.passage.revisionId}));
  await page.getByRole('article',{name:'Passaggio selezionato'}).getByRole('button',{name:/^Annotazione PDF/}).click();
  const linked=page.locator('.lm-linked');await linked.locator('.ls-viewport .textLayer span').filter({hasText:'Q = pi r^4 Dp / (8 eta L)'}).first().waitFor();
  const pdf=await linked.evaluate(el=>{
    const rect=node=>node?Object.fromEntries(['x','y','width','height'].map(key=>[key,node.getBoundingClientRect()[key]])):null;
    const canvas=el.querySelector('.ls-viewport .page canvas');
    return {reader:rect(el.querySelector('.ls-reader')),notes:rect(el.querySelector('.ls-notes')),viewport:rect(el.querySelector('.ls-viewport')),
      page:rect(el.querySelector('.ls-viewport .page')),canvas:rect(canvas),text:el.querySelector('.ls-viewport .textLayer')?.textContent};
  });
  await linked.screenshot({path:join(out,'linked-pdf-'+width+'.png')});rows.push({width,before,after,pdf});
  await context.close();
 }
 await writeFile(join(out,'layout.json'),JSON.stringify({status:'OBSERVED',rows},null,2)+'\n');console.log(JSON.stringify(rows,null,2));
}finally{await browser?.close();const stopped=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await stopped;}
