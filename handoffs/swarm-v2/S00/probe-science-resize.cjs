const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const root=process.cwd(),{chromium,expect}=require(path.join(root,'node_modules/@playwright/test'));
const out=process.env.ARDESIA_RESIZE_OUT,fixture=fs.mkdtempSync(path.join(os.tmpdir(),'s00-resize-'));
if(!out)throw Error('ARDESIA_RESIZE_OUT required');fs.mkdirSync(out,{recursive:true});
const fd=fs.openSync(path.join(out,'api.log'),'w');
const server=spawn(path.join(root,'services/study-api/.venv/bin/python'),[path.join(root,'handoffs/swarm-v2/S00/science-api.py'),'--directory',fixture,'--frontend',path.join(root,'apps/web/dist')],{cwd:root,stdio:['ignore',fd,fd]});fs.closeSync(fd);
const base='http://127.0.0.1:55511',report={status:'RUNNING',samples:[],errors:[]};let browser;
async function snapshot(page,label){const geometry=await page.locator('.science-graph').evaluate(node=>{
 const svg=node.querySelector('svg'),box=node.getBoundingClientRect();
 const parts=svg?[...svg.querySelectorAll('path,ellipse,circle')].filter(el=>['#a84b32','#2b6970','#565c69'].includes(el.getAttribute('stroke'))).map(el=>{const b=el.getBBox();return {id:el.id,x:b.x,y:b.y,width:b.width,height:b.height};}):[];
 return {width:box.width,height:box.height,svgWidth:svg?.getAttribute('width'),svgHeight:svg?.getAttribute('height'),viewBox:svg?.getAttribute('viewBox'),parts,
 fitted:parts.length>=3&&Math.abs(Number(svg?.getAttribute('width'))-box.width)<2&&Math.abs(Number(svg?.getAttribute('height'))-box.height)<2&&parts.every(b=>b.x>=-8&&b.y>=-8&&b.x+b.width<=box.width+8&&b.y+b.height<=box.height+8)};
});report.samples.push({label,...geometry});return geometry;}
async function open(context){const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base+'/?view=materials&edition=science-s01');await page.getByRole('button',{name:'Apri la libreria scientifica',exact:true}).click();await page.getByLabel('Percorso di studio').selectOption('onde-ottica-radiazioni');await page.getByLabel('La tua previsione',{exact:true}).fill('0.15');await page.getByRole('button',{name:'Confronta la previsione',exact:true}).click();await expect(page.locator('.science-graph svg')).toHaveCount(1);return page;}
(async()=>{try{
 for(let i=0;i<80;i++){try{if((await fetch(base+'/openapi.json')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 const seed=JSON.parse(fs.readFileSync(path.join(fixture,'fixture-private.json'),'utf8'));
 browser=await chromium.launch({headless:true});
 const desktop=await browser.newContext({baseURL:base,viewport:{width:1440,height:1050},reducedMotion:'reduce'});
 await desktop.request.post('/study/session',{data:{token:seed.actors['s01-student'].token}});
 const p=await open(desktop);await snapshot(p,'desktop-initial');
 for(const width of [820,390,360]){await p.setViewportSize({width,height:1050});if(width<=740)await p.getByRole('button',{name:'Modifica i dati',exact:true}).click();await snapshot(p,'resize-'+width+'-immediate');await p.screenshot({path:path.join(out,'resize-'+width+'-immediate.png'),fullPage:true});
  await p.waitForTimeout(500);await snapshot(p,'resize-'+width+'-500ms');await p.screenshot({path:path.join(out,'resize-'+width+'-500ms.png'),fullPage:true});}
 const mobile=await browser.newContext({baseURL:base,viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await mobile.request.post('/study/session',{data:{token:seed.actors['s01-student'].token}});const m=await open(mobile);await snapshot(m,'fresh390-initial');await m.waitForTimeout(500);await snapshot(m,'fresh390-500ms');await m.screenshot({path:path.join(out,'fresh390.png'),fullPage:true});
 report.status=report.samples.every(x=>x.fitted)?'PASS':'GEOMETRY_MISMATCH';
 }catch(e){report.status='ERROR';report.failure=String(e.stack||e);process.exitCode=1;}
 finally{if(browser)await browser.close();server.kill('SIGTERM');await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));fs.rmSync(fixture,{recursive:true,force:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
})();
