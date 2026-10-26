import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./',import.meta.url)).replace(/\/$/,'');
const outputs=path.resolve(process.env.S06_OUTPUTS||path.join(root,'.artifacts'));await mkdir(outputs,{recursive:true});
const access=JSON.parse(await readFile(root+'/access.json','utf8'));
const browser=await chromium.launch({headless:true});const checks=[];
try{const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(10000);
await context.request.post('http://127.0.0.1:5360/study/session',{data:{token:access.student}});await page.goto('http://127.0.0.1:5360');
const input=page.getByLabel('Il tuo valore [m]',{exact:true}),proof=page.getByLabel('Il tuo procedimento');await input.waitFor();await input.focus();await page.keyboard.type('0.2');await page.keyboard.press('Tab');
if(!await proof.evaluate(e=>e===document.activeElement))throw Error('Tab did not reach procedure');checks.push('keyboard-tab-reaches-procedure');await page.keyboard.type('Controllo unità e legge di Hooke.');
await page.getByRole('button',{name:'Chiedi un indizio',exact:true}).tap();await page.getByText('Aiuto registrato',{exact:true}).waitFor();checks.push('touch-hint-committed');
await page.screenshot({path:outputs+'/S06-touch-390.png',fullPage:true});if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('horizontal overflow');checks.push('touch-layout-no-overflow');
await writeFile(outputs+'/keyboard-touch-result.json',JSON.stringify({status:'PASS',checks},null,2));console.log(JSON.stringify({status:'PASS',checks}));}finally{await browser.close();}
