import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
const repo=fileURLToPath(new URL('../../../../',import.meta.url));
const out=process.env.ARDESIA_QA_OUTPUT;if(!out)throw Error('Set ARDESIA_QA_OUTPUT to a fresh local output directory');
const baseURL=process.env.ARDESIA_QA_BASE_URL??'http://127.0.0.1:55343';
const target=new URL(baseURL);if(!['127.0.0.1','localhost','[::1]'].includes(target.hostname)||!['http:','https:'].includes(target.protocol)||target.username||target.password)throw Error('Synthetic QA only supports explicit loopback origins');
const code=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const {chromium,expect}=await import(pathToFileURL(path.join(repo,'node_modules/@playwright/test/index.mjs')).href);
import {readFile,writeFile} from 'node:fs/promises';import {createHash}from'node:crypto';
const phase=process.argv[2];if(!['before','after'].includes(phase))throw Error('Pass before or after, with a server restart between them');
const dir=process.env.ARDESIA_QA_DATA;if(!dir)throw Error('Set ARDESIA_QA_DATA to the synthetic fixture directory');const access=JSON.parse(await readFile(dir+'/demo-access.json','utf8'));
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
if(access.synthetic!==true)throw Error('Synthetic access file required');
const browser=await chromium.launch({headless:true});const evidence={code,phase,freshProfiles:true,checks:[],actors:{}};
function check(id,passed,detail={}){evidence.checks.push({id,passed,...detail});if(!passed)throw Error(id)}
try{
 for(const actor of ['student-01','student-02','tutor-synthetic']){
  const context=await browser.newContext({baseURL,viewport:actor==='student-01'?{width:390,height:844}:{width:1440,height:1000},reducedMotion:'reduce',...(phase==='after'?{recordVideo:{dir:out+'/cold-ui-video'}}:{})});
  if(phase==='after'){
   const page=await context.newPage();await page.goto('/');await page.getByRole('button',{name:'Accedi al tuo spazio'}).click();await page.getByLabel('Codice di accesso sintetico').fill(access.tokens[actor]);await page.getByRole('button',{name:'Accedi',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.goto('/?view=work&edition=fluidi');await page.getByRole('button',{name:'Verificati',exact:true}).click();
   if(actor==='student-02')await expect(page.getByText('Verificato su una nuova prova',{exact:true})).toHaveCount(0);else await expect(page.getByText('Verificato su una nuova prova',{exact:true})).toBeVisible();
   check(actor+'_ui_verified_or_isolated',true);
   await page.screenshot({path:out+'/cold-'+actor+'.png',fullPage:true});
   check(actor+'_no_horizontal_overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }else expect((await context.request.post('/study/session',{data:{token:access.tokens[actor]}})).ok()).toBe(true);
  const response=await context.request.get('/study/workspace?editionId=fluidi');expect(response.ok()).toBe(true);const workspace=await response.json();const diary=await(await context.request.get('/study/diary?editionId=fluidi')).json();
  const preserved={submissions:workspace.submissions,resources:workspace.resources,threads:diary.threads};evidence.actors[actor]={sha256:digest(preserved),submissions:workspace.submissions.length,resources:workspace.resources.length,threads:diary.threads.length,verified:diary.threads.filter(t=>t.status==='VERIFIED_RESOLVED').length};
  for(const s of workspace.submissions){const id=s.receipt_id??s.receiptId;if(!id)continue;const receipt=await context.request.get('/study/receipts/'+id);check(actor+'_receipt_'+s.id,receipt.ok())}
  if(phase==='after'){const before=JSON.parse(await readFile(out+'/cold-before.json','utf8'));check(actor+'_same_durable_sources_and_outcomes',before.actors[actor].sha256===evidence.actors[actor].sha256)}
  await context.close();
 }
 check('student_two_cannot_read_student_one_diary',evidence.actors['student-02'].threads===0);check('student_and_teacher_retain_verified_proof',evidence.actors['student-01'].verified>0&&evidence.actors['tutor-synthetic'].verified>0);evidence.status='PASS';
}catch(e){evidence.status='FAIL';evidence.error=e.message;process.exitCode=1}
finally{await browser.close();await writeFile(out+'/cold-'+phase+'.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2))}
