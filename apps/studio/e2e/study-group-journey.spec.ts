import {test,expect,type Page} from '@playwright/test'
import {readFileSync} from 'node:fs'
import path from 'node:path'
const root=path.resolve(process.cwd(),'../..')
const dataDir=process.env.STUDY_DEMO_DATA_DIR??path.join(root,'.study-demo')
const access=JSON.parse(readFileSync(path.join(dataDir,'demo-access.json'),'utf8')) as {tokens:Record<string,string>}
test.use({actionTimeout:10000})
async function login(page:Page,actor:string){
  await page.goto('/?vista=fisica');await page.getByText('Accedi alla demo',{exact:true}).click()
  await page.getByLabel('Accesso sintetico',{exact:true}).fill(access.tokens[actor]);await page.getByRole('button',{name:'Accedi',exact:true}).click()
  await expect(page.getByText(actor,{exact:false}).first()).toBeVisible()
}
test('M1 on real build: ten students, private multimodal work, manual review, retry and LessonOS',async({browser},info)=>{
 test.setTimeout(180000)
 const errors:string[]=[]
 const visitorContext=await browser.newContext({viewport:{width:390,height:844}});const visitor=await visitorContext.newPage()
 await visitor.goto('/?vista=fisica');if(process.env.STUDY_EXPECTED_SHA)expect(await visitor.evaluate(()=>(window as unknown as {__ARDESIA_BUILD__:{commitSha:string}}).__ARDESIA_BUILD__.commitSha)).toBe(process.env.STUDY_EXPECTED_SHA);await expect(visitor.getByRole('heading',{name:'Che cosa tieni fisso?'})).toBeVisible()
 await visitor.getByLabel('La tua previsione').fill('La portata aumenta');await visitor.getByLabel('Rapporto dei raggi').fill('1.5')
 await expect(visitor.getByTestId('physics-ratio')).toContainText('5,0625');await visitor.getByLabel('Grandezza fissata',{exact:true}).selectOption('flow')
 await expect(visitor.getByTestId('physics-ratio')).toContainText('0,197531')
 await visitor.getByLabel('Contatto sintetico').fill('interested-01@example.invalid');await visitor.getByRole('checkbox').check();await visitor.getByRole('button',{name:'Invia interesse'}).click()
 await expect(visitor.getByRole('status')).toContainText('Interesse ricevuto')
 await visitor.getByLabel('Contatto sintetico').fill('interested-02@example.invalid');await visitor.getByRole('button',{name:'Invia interesse'}).click();await expect(visitor.getByRole('status')).toContainText('Interesse ricevuto')
 expect(await visitor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
 await visitor.screenshot({path:info.outputPath('public-mobile.png'),fullPage:true});await visitorContext.close()
 console.log('Public lab and interest verified')
 const tutorContext=await browser.newContext({viewport:{width:1440,height:1000}});const tutor=await tutorContext.newPage()
 tutor.on('pageerror',error=>errors.push(error.message));await login(tutor,'tutor-synthetic')
 await tutor.getByRole('button',{name:'Gruppo',exact:true}).click();await expect(tutor.getByText('interested-01@example.invalid',{exact:false})).toBeVisible()
 await tutor.getByRole('button',{name:'Approva edizione di test'}).click();await tutor.getByRole('button',{name:'Lezione',exact:true}).click()
 await tutor.getByLabel('Istruzioni per il gruppo').fill('Prevedi Q/Q0 con raggio 1,5r a Δp fissata. Poi cambia vincolo.');await tutor.getByRole('button',{name:'Assegna al gruppo'}).click()
 await expect(tutor.getByText('Attività assegnata al gruppo.')).toBeVisible()
 const contexts=[];const pages:Page[]=[]
 for(let i=1;i<=10;i++){
   const context=await browser.newContext({viewport:i===3?{width:390,height:844}:{width:1440,height:1000}});contexts.push(context)
   const page=await context.newPage();pages.push(page);page.on('pageerror',error=>errors.push(error.message))
   console.log(`Student browser ${i}/10`)
   const actor=`student-${String(i).padStart(2,'0')}`;await login(page,actor);await page.getByRole('button',{name:'Conferma partecipazione di test'}).click()
   await expect(page.getByRole('heading',{name:'Aggiungi una fonte'})).toBeVisible()
   await page.getByLabel('Nota o testo originale').fill(i===2?'Confondo raggio e area: Q cresce come r².':`Fonte privata sintetica ${actor}`)
   await page.getByRole('button',{name:'Salva fonte privata'}).click();await expect(page.getByText('Fonte privata salvata.')).toBeVisible()
   if(i===1){const open=page.getByRole('button',{name:'Contesto della fonte'}).first();await open.click();await page.getByRole('dialog').press('Escape');await expect(open).toBeFocused();await page.getByRole('button',{name:/Sposta post-it/}).first().click();await expect(page.getByText('Disposizione salvata.')).toBeVisible();await page.getByRole('button',{name:/Duplica vista/}).first().click();await expect(page.locator('[data-instance-id]')).toHaveCount(3);await page.reload();await expect(page.locator('[data-instance-id]')).toHaveCount(3)}
   await page.getByLabel('La tua spiegazione').fill(i===2?'Q cresce come r²':i===5?'Fonte ambigua':`Q/Q0 = 5,0625; ${actor}`)
   if(i>=2&&i<=4){const file=i===2?'source.png':i===3?'tone.mp3':'source.pdf';await page.getByLabel('Aggiungi originale privato').setInputFiles(path.join(dataDir,'fixtures',file));await expect(page.getByTestId('submission-status')).toContainText('Originale caricato')}
 }
 await pages[5].route('**/study/submissions',async route=>{await route.fetch();await route.abort('failed')},{times:1})
 await pages[5].getByRole('button',{name:'Consegna',exact:true}).click();await expect(pages[5].getByTestId('submission-status')).toContainText('non ancora confermato')
 await pages[5].reload();await expect(pages[5].getByRole('button',{name:'Consegna',exact:true})).toBeVisible()
 await pages[6].route('**/study/submissions',route=>route.fulfill({status:503,body:'{"error":"storage_unavailable"}',contentType:'application/json'}),{times:1})
 await pages[6].getByRole('button',{name:'Consegna',exact:true}).click();await expect(pages[6].getByTestId('submission-status')).toContainText('non ancora confermato')
 await Promise.all(pages.map(page=>page.getByRole('button',{name:'Consegna',exact:true}).click()))
 await Promise.all(pages.map(page=>expect(page.getByTestId('submission-status')).toContainText('Consegnato · ricevuta')))
 console.log('Ten browser submissions received; checking authority')
 const workspace=await (await tutor.request.get('/study/workspace?editionId=fluidi')).json()
 expect(workspace.submissions).toHaveLength(10);expect(new Set(workspace.submissions.map((x:{receipt_id:string})=>x.receipt_id)).size).toBe(10)
 expect(new Set(workspace.submissions.map((x:{student_id:string})=>x.student_id)).size).toBe(10)
 const s03=workspace.submissions.find((x:{student_id:string})=>x.student_id==='student-03')
 const denied=await pages[1].request.get(`/study/assets/${s03.asset_refs[0]}`);expect(denied.status()).toBe(403);expect(await denied.json()).toEqual({error:'forbidden'})
 for(const actor of ['student-11','student-12']){const waitingContext=await browser.newContext();const waiting=await waitingContext.newPage();await login(waiting,actor);await waiting.getByRole('button',{name:'Conferma partecipazione di test'}).click();await expect(waiting.getByText('Gruppo completo: sei in lista d’attesa.')).toBeVisible();await waitingContext.close()}
 console.log('Starting synthetic tutor review')
 await tutor.getByRole('button',{name:'Aggiorna',exact:true}).click();await tutor.getByRole('button',{name:'Da correggere',exact:true}).click()
 for(const [actor,decision,review] of [['student-02','Approva e restituisci','A Δp fissata Q cresce con la quarta potenza. Riparti dalle grandezze fissate.'],['student-05','Richiedi chiarimento','Quale grandezza rimane fissata?']]){
  await tutor.getByRole('button',{name:`Apri consegna ${actor} · tentativo 1`,exact:true}).click();await tutor.getByRole('button',{name:'Genera proposta sintetica'}).click()
  await tutor.getByRole('textbox',{name:'Revisione del tutor',exact:true}).fill(review);await tutor.getByRole('button',{name:decision,exact:true}).click()
  await expect(tutor.getByText(actor==='student-02'?'Feedback revisionato e restituito.':'Chiarimento richiesto, senza voto.')).toBeVisible()
 }
 await tutor.screenshot({path:info.outputPath('tutor-review.png'),fullPage:true})
 const student=pages[1];await student.getByRole('button',{name:'Aggiorna',exact:true}).click();await student.getByRole('button',{name:'Materiali',exact:true}).click()
 await expect(student.getByRole('heading',{name:'Revisione del tutor sintetico'})).toBeVisible();await student.getByRole('button',{name:'Nuovo tentativo dopo il 1'}).click()
 await student.getByLabel('La tua spiegazione').fill('1,5⁴ = 5,0625 a Δp fissata.');await student.getByRole('button',{name:'Consegna',exact:true}).click()
 await expect(student.getByTestId('submission-status')).toContainText('tentativo 2');await student.getByRole('button',{name:'Apri memoria LessonOS'}).click()
 await expect(student.getByRole('heading',{name:'Da dove ripartire'})).toBeVisible();await student.screenshot({path:info.outputPath('student-memory.png'),fullPage:true})
 const clean=await browser.newContext();const cleanPage=await clean.newPage();await login(cleanPage,'student-02');await cleanPage.getByRole('button',{name:'Apri memoria LessonOS'}).click()
 await expect(cleanPage.getByRole('heading',{name:'Da dove ripartire'})).toBeVisible();expect(errors).toEqual([])
 await clean.close();await Promise.all(contexts.map(context=>context.close()));await tutorContext.close()
})
