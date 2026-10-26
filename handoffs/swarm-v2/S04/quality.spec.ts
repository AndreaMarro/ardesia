import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const directory=process.env.S04_DATA_DIR!;
const outputs=process.env.S04_OUTPUT_DIR!;

test('real bank audit, four proposals, existing review cold reopen, responsive and revocation',async({page})=>{
 const access=JSON.parse(await readFile(`${directory}/demo-access.json`,'utf8'));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
 // Real HttpOnly cookie login, no routed/mocked API responses.
 expect((await page.request.post('/study/session',{data:{token:access.tokens['tutor-synthetic']}})).ok()).toBe(true);
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=classroom');
 await page.getByText('Revisione scientifica dei quesiti · spazio docente',{exact:true}).tap();
 await page.getByText('Qualità della banca e casi da verificare',{exact:true}).tap();
 const audit=page.getByRole('region',{name:'Audit qualità della banca'});
 await expect(audit.getByText('4000',{exact:true})).toBeVisible({timeout:120000});console.log('S04 checkpoint: authorized audit4000 visible');
 await expect(audit.getByText(/200 sotto-obiettivi editoriali interni/)).toBeVisible();
 await expect(audit.getByRole('table')).toContainText('Fluidi e termodinamica');
 await expect(audit.getByText('23',{exact:true}).first()).toBeVisible();
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await page.setViewportSize(viewport);await audit.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${outputs}/S04-audit-${viewport.width}.png`});
 }
 await audit.getByText('Moto rettilineo uniforme · bozza di autore',{exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(audit.getByRole('heading',{name:'Problema di trasferimento'})).toBeVisible();
 await audit.getByRole('button',{name:'Apri il quesito di riferimento · Moto rettilineo uniforme'}).click();
 const notes=page.getByLabel('Osservazioni della revisione');
 await expect(notes).toBeVisible({timeout:60000});
 const note=`S04 prova sintetica ${Date.now()}: controllo da completare, nessuna approvazione umana.`;
 await notes.fill(note);await page.getByRole('button',{name:'Salva revisione privata',exact:true}).click();
 await expect(page.getByText('Revisione privata salvata. La pubblicazione non è cambiata.')).toBeVisible();
 await page.reload();
 await page.getByText('Revisione scientifica dei quesiti · spazio docente',{exact:true}).click();
 await page.getByText('Qualità della banca e casi da verificare',{exact:true}).click();
 await expect(audit.getByText('4000',{exact:true})).toBeVisible({timeout:120000});
 await audit.getByText('Moto rettilineo uniforme · bozza di autore',{exact:true}).click();
 await audit.getByRole('button',{name:'Apri il quesito di riferimento · Moto rettilineo uniforme'}).click();
 await expect(notes).toHaveValue(note);console.log('S04 checkpoint: cold reopen exact note');
 await expect(page.getByText('Non pubblicato: il quesito non è disponibile agli studenti.')).toBeVisible();
 // Session logout really revokes the cookie in Core.
 await page.getByRole('button',{name:/Esci dall’account/}).click();
 await expect(audit).toHaveCount(0);
 const denied=await page.request.get('/study/editions/fluidi/question-banks/physics-semestre-2026/review/quality');
 expect(denied.status()).toBe(401);
 console.log('S04 checkpoint: saved note, cold reopen, unpublished and logout confirmed');
 await page.request.post('/study/session',{data:{token:access.tokens['student-01']}});
 expect((await page.request.get('/study/editions/fluidi/question-banks/physics-semestre-2026/review/quality')).status()).toBe(403);
 expect(errors).toEqual([]);console.log('S04 checkpoint: student denied, no browser errors');
});
