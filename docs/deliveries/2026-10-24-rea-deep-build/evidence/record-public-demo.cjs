const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.resolve('apps/studio/node_modules/playwright-core'));
(async()=>{
 const out=path.resolve('../deep-build/video');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}},locale:'it-IT'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:5414/'); await page.locator('#fluidi-termodinamica').scrollIntoViewIfNeeded();
  await page.locator('#fluidi-termodinamica').locator('a[href^="/esperienza/"]').click();
  await page.getByLabel('Rapporto previsto',{exact:true}).fill('4'); await page.getByRole('button',{name:'Metti alla prova',exact:true}).press('Enter');
  await page.getByTestId('physics-ratio').waitFor(); await page.getByTestId('flow-measures').scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
  await page.getByRole('button',{name:'Guarda il grafico',exact:true}).click();await page.getByTestId('poiseuille-graph').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Riprendi il vincolo',exact:true}).click(); await page.getByTestId('lesson-demo').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Ascolta il passaggio',exact:true}).press('Enter');await page.waitForTimeout(1800);await page.getByRole('button',{name:'Pausa audio',exact:true}).click();
  await page.getByLabel('Grandezza fissata').selectOption('flow');await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).focus();await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).press('ArrowLeft');
  await page.getByLabel('Rapporto previsto',{exact:true}).fill('0,0625');await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();
  await page.getByTestId('physics-ratio').waitFor();await page.getByRole('button',{name:'Un problema diverso',exact:true}).press('Enter');
  assert.equal(await page.getByLabel('Rapporto previsto',{exact:true}).evaluate(e=>document.activeElement===e),true);
  await page.getByLabel('Rapporto previsto',{exact:true}).fill('16');await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();await page.getByTestId('physics-ratio').waitFor();
  await page.getByRole('link',{name:'Chiedi disponibilità',exact:true}).click();await page.waitForURL(/#contatto$/);assert.equal(await page.locator('input[value="fluidi-termodinamica"]').isChecked(),true);
  assert.equal(errors.length,0);await page.waitForTimeout(500);
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({status:'PASS',route:'landing→Fluidi→prediction→manipulation→recovery→new problem→interest contact',audio:'local synthetic formant voice; video container may not capture browser audio',noMessageSent:true,errors},null,2));
 }finally{const video=page.video();await context.close();if(video)fs.copyFileSync(await video.path(),path.join(out,'poiseuille-demo.webm'));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
