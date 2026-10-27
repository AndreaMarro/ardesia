import {chromium,expect} from '../../../../node_modules/@playwright/test/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const root=process.env.ARDESIA_S05_DEMO_DIR;
if(!root)throw Error('ARDESIA_S05_DEMO_DIR required');
const fixture=JSON.parse(await fs.readFile(path.join(root,'s05-demo-fixture.json'),'utf8'));
const origin='http://127.0.0.1:5425',results=[],errors=[];
const started=performance.now();
const browser=await chromium.launch({headless:true});
const version=browser.version();
const cases=[
 {id:fixture.student,role:'student',edition:true,width:1440},
 {id:'tutor-s05-synthetic',role:'teacher',edition:true,width:1440},
 {id:fixture.alone,role:'student',edition:false,width:1440},
 {id:fixture.teacherAlone,role:'teacher',edition:false,width:1440},
 {id:fixture.alone,role:'student',edition:false,width:390},
 {id:fixture.teacherAlone,role:'teacher',edition:false,width:390},
];
function pass(name,scenario){results.push({name,scenario,status:'PASS'});console.log('PASS '+scenario+' · '+name);}
try {
 for(const actor of cases){
  const scenario=`${actor.role}/${actor.edition?'course':'no-course'}/${actor.width}`;
  const context=await browser.newContext({viewport:{width:actor.width,height:900},hasTouch:actor.width===390,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(scenario+': '+error.message));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(scenario+': '+message.type()+': '+message.text());});
  try {
   const login=await context.request.post(origin+'/study/session',{data:{token:fixture.tokens[actor.id]}});
   expect(login.status()).toBe(200);
   const editions=await (await context.request.get(origin+'/study/editions')).json();
   expect(editions.items.length>0).toBe(actor.edition);
   await page.goto(origin+'/?view=today',{waitUntil:'domcontentloaded'});
   const navigation=page.getByRole('navigation',{name:'Navigazione principale'});
   await navigation.getByRole('button',{name:'Memoria delle idee',exact:true}).click();
   await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
   await expect(navigation.getByRole('button',{name:'Memoria delle idee',exact:true})).toHaveAttribute('aria-current','page');
   expect(new URL(page.url()).searchParams.get('view')).toBe('memory');
   pass('real root menu opens memory',scenario);

   await navigation.getByRole('button',{name:'Oggi',exact:true}).click();
   await page.getByRole('button',{name:'Cerca nello spazio · Ctrl o ⌘ K',exact:true}).click();
   const dialog=page.getByRole('dialog');
   await dialog.getByRole('searchbox').fill('idee');
   await dialog.getByRole('searchbox').press('Enter');
   await expect(dialog).toBeHidden();
   await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
   await expect(page.locator('#content')).toBeFocused();
   pass('command search Enter opens mounted memory and returns focus',scenario);

   await page.reload({waitUntil:'domcontentloaded'});
   await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:path.join(root,`navigation-${actor.role}-${actor.edition?'course':'alone'}-${actor.width}.png`),fullPage:true});
   pass('cold route and responsive layout',scenario);
  }catch(error){
   await page.screenshot({path:path.join(root,'navigation-failure.png'),fullPage:true}).catch(()=>{});
   throw error;
  }finally{await context.close();}
 }
 expect(errors).toEqual([]);
}finally {
 await fs.writeFile(path.join(root,'navigation-browser.json'),JSON.stringify({origin,browser:version,results,errors,elapsedMs:performance.now()-started,
  scope:'Real App and S02 shell, canonical Study sessions/SQLite, synthetic roles. Touch emulated at390px; no physical device or remote deployment claim.'},null,2)+'\n');
 await browser.close();
}
