const {chromium}=require(process.env.UX_REPO+'/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const origin=process.env.UX_ORIGIN,artifact=process.env.UX_ARTIFACT,previous='/private/tmp/ardesia-r1-candidate-c762e30';
const out=path.join(__dirname,'code2'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
fs.mkdirSync(out,{recursive:true});
const checks=[],issues=[],rows=[],assets=[];let browser,page;
function check(name,pass,detail){checks.push({name,pass,detail});if(!pass)throw Error(name+': '+JSON.stringify(detail));}
function tree(root){return fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const absolute=path.join(e.parentPath,e.name),relative=path.relative(root,absolute);return {path:relative,bytes:fs.statSync(absolute).size,sha256:sha(fs.readFileSync(absolute))};}).sort((a,b)=>a.path.localeCompare(b.path));}
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(artifact,'candidate-manifest.json'))),manifestSha=sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json'))),sourceManifestSha=sha(fs.readFileSync(path.join(artifact,'source-manifest.json')));
 const oldExperience=tree(path.join(previous,'public/esperienza')),newExperience=tree(path.join(artifact,'public/esperienza'));
 check('all experience files are byte-identical to c762',JSON.stringify(oldExperience)===JSON.stringify(newExperience),newExperience);
 const oldPublic=tree(path.join(previous,'public')),newPublic=tree(path.join(artifact,'public'));
 const removed=oldPublic.filter(e=>!newPublic.some(n=>n.path===e.path)),added=newPublic.filter(e=>!oldPublic.some(n=>n.path===e.path)),changed=newPublic.filter(e=>oldPublic.some(n=>n.path===e.path&&n.sha256!==e.sha256));
 browser=await chromium.launch({headless:true});
 for(const width of [360,390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});page=await context.newPage();const pending=[];
  page.on('pageerror',e=>issues.push({kind:'pageerror',value:String(e)}));page.on('requestfailed',r=>issues.push({kind:'requestfailed',url:r.url(),failure:r.failure()}));page.on('console',m=>{if(['error','warning'].includes(m.type()))issues.push({kind:m.type(),value:m.text()});});
  page.on('request',r=>{if(new URL(r.url()).origin!==origin)issues.push({kind:'external',url:r.url()});});
  page.on('response',r=>{if(r.status()>=400)issues.push({kind:'HTTP',status:r.status(),url:r.url()});if(r.status()!==200||r.request().method()!=='GET')return;pending.push((async()=>{const bytes=await r.body(),relative=decodeURIComponent(new URL(r.url()).pathname).replace(/^\//,'');const f=path.join(artifact,'public',!relative?'index.html':relative.endsWith('/')?relative+'index.html':relative);assets.push({url:r.url(),bytes:bytes.length,sha256:sha(bytes),artifactSha256:sha(fs.readFileSync(f))});})().catch(e=>issues.push({kind:'collector',url:r.url(),error:String(e)})));});
  await page.goto(origin+'/');await page.getByRole('heading',{level:1}).waitFor();
  check(`${width}: page identity and meaningful content`,/Ardesia/.test(await page.title())&&await page.locator('.path-index a').count()===4&&await page.locator('vite-error-overlay').count()===0);
  await page.screenshot({path:path.join(out,`landing-first-${width}.png`)});
  await page.evaluate(()=>{const elements=[...document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,label,input,select,summary,strong,blockquote,output,li,svg text')],sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));elements.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
  await page.locator('.path-index').scrollIntoViewIfNeeded();
  const fit=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,rows:[...document.querySelectorAll('.path-index a')].map(a=>{const children=[...a.children],label=children[1],arrow=children[2];const text=document.createRange();text.selectNodeContents(label);const t=text.getBoundingClientRect(),r=arrow.getBoundingClientRect(),b=a.getBoundingClientRect();return {text:label.textContent,textRight:t.right,arrowLeft:r.left,arrowRight:r.right,rowRight:b.right,gap:r.left-t.right,overflow:document.documentElement.scrollWidth>innerWidth};})}));
  rows.push({width,fit});check(`${width}: text200 landing has no horizontal overflow`,fit.scrollWidth<=fit.width,fit);
  check(`${width}: text200 path labels and arrows remain separate`,fit.rows.every(r=>r.gap>=-.5&&r.arrowRight<=r.rowRight+.5),fit.rows);
  await page.screenshot({path:path.join(out,`landing-text200-${width}.png`),fullPage:true});await page.screenshot({path:path.join(out,`path-index-text200-${width}.png`)});
  const course=page.locator('.path-index a[href="?percorso=fluidi-termodinamica#fluidi-termodinamica"]');await course.focus();await page.keyboard.press('Enter');
  check(`${width}: course selection works by keyboard at text200`,new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica'&&new URL(page.url()).hash==='#fluidi-termodinamica');
  const link=page.locator('a[href="/esperienza/?percorso=fluidi-termodinamica"]').first();check(`${width}: selected course retains the experience route`,await link.count()===1);
  await page.waitForLoadState('networkidle');await Promise.all(pending);await context.close();
 }
 check('all observed HTTP bodies equal final artifact',assets.every(a=>a.sha256===a.artifactSha256));check('no runtime, console, HTTP, network or remote errors',issues.length===0,issues);
 check('candidate manifest unchanged',sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json')))===manifestSha);check('source manifest unchanged',sha(fs.readFileSync(path.join(artifact,'source-manifest.json')))===sourceManifestSha);
 const result={status:'PASS',origin,artifact,previous,source:manifest.source,manifestSha,sourceManifestSha,node:process.version,browser:browser.version(),checks,issues,rows,assets,publicFileDelta:{changed,added,removed},experienceFileEquality:newExperience,limits:'Focused CODE2 delta. Previous113journey/38performance checks remain attributed to c762. Text200 is computed-font doubling in anonymous contexts; actual tab zoom and experience journey checked separately. No user account, token, private API, contact submission, hardware or field performance claim.'};fs.writeFileSync(path.join(out,'delta-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({checks:checks.length,status:'PASS'}));
})().catch(async error=>{fs.writeFileSync(path.join(out,'delta-failure.json'),JSON.stringify({error:String(error),checks,issues,rows,assets},null,2));if(page&&!page.isClosed())await page.screenshot({path:path.join(out,'delta-failure.png'),fullPage:true}).catch(()=>{});console.error(error);process.exitCode=1;}).finally(()=>browser?.close());
