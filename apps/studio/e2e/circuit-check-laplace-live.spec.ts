import {expect,test} from '@playwright/test'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import JSZip from 'jszip'

test.skip(!process.env.KIRCHHOFF_LOCAL_URL||!process.env.ARDESIA_STUDIO_E2E_BASE_URL,'Requires real local Ardesia and Kirchhoff')

test('Laplace from components → factual event → portable bundle → cold recap and continuity',async({page,browser},info)=>{
 test.setTimeout(90_000)
 const room='laplace-components'
 await page.setViewportSize({width:1440,height:1000})
 await page.goto(`/#${room}`)
 await page.getByRole('button',{name:'Inserisci CircuitCheck sulla lavagna'}).click()
 await page.getByRole('combobox',{name:'Regime del circuito'}).selectOption('laplace')
 for(const [kind,id,value,from,to] of [['resistore','R1','3','a','0'],['induttore','L1','2','a','0']]){
  await page.getByRole('button',{name:`Aggiungi ${kind}`,exact:true}).click()
  await page.getByLabel(`Valore ${id}`,{exact:true}).fill(value)
  await page.getByLabel(`Primo morsetto ${id}`,{exact:true}).fill(from)
  await page.getByLabel(`Secondo morsetto ${id}`,{exact:true}).fill(to)
 }
 await page.getByRole('combobox',{name:'Grandezza da trovare'}).selectOption('current')
 await page.getByRole('combobox',{name:'Componente della domanda'}).selectOption('L1')
 await page.getByLabel('Stato iniziale L1',{exact:true}).fill('-2')
 await page.getByRole('checkbox',{name:/Ho confrontato/}).check()
 await expect(page.getByRole('textbox',{name:'Circuito CircuitCheck'})).not.toBeVisible()
 const solved=page.waitForResponse(r=>r.url().endsWith('/api/solve')&&r.request().method()==='POST')
 await page.getByRole('button',{name:'Risolvi e verifica',exact:true}).click()
 const response=await solved;expect(response.status()).toBe(200)
 const wire=await response.json()
 expect(wire.answer.laplace_transform).toEqual({variable:'s',coefficient_order:'ascending',numerator:['-2'],denominator:['3/2','1']})
 expect(wire.answer.quantity).toBe('current')
 expect(wire.answer.unit).toBe('A*s')
 await expect(page.getByText('confrontato ora',{exact:true})).toBeVisible()
 await expect(page.locator('[data-circuit-math="answer"] math')).toBeVisible()
 await expect(page.getByRole('button',{name:'Aggiungi passaggio',exact:true})).toHaveCount(0)
 await page.reload()
 await expect(page.getByText('prova da ricalcolare',{exact:true})).toBeVisible()
 await expect(page.getByRole('checkbox',{name:/Ho confrontato/})).not.toBeChecked()
 await page.getByRole('link',{name:'Materiali',exact:true}).click()
 const downloading=page.waitForEvent('download')
 await page.getByRole('button',{name:'Esporta .lesson',exact:true}).click()
 const bytes=await readFile(await (await downloading).path())
 const zip=await JSZip.loadAsync(bytes)
 const board=JSON.parse(await zip.file('raw/board.excalidraw')!.async('string'))
 const proof=board.elements.find((el:{id:string})=>el.id==='circuit-reasoning').customData.maestroTool.state.proof
 expect(proof.scope).toBe('laplace_algebra_crosschecked')
 expect(proof.answer.laplace_transform).toEqual(wire.answer.laplace_transform)
 expect(proof.answer.math).toEqual(wire.answer.math)
 expect(proof.laplaceInputs).toEqual(wire.laplace_inputs)
 expect(proof.laplaceOutput).toEqual(wire.laplace_output)
 expect(proof.conventions).toEqual(wire.conventions)
 const events=(await zip.file('raw/lessonos-events.jsonl')!.async('string')).trim().split('\n').map(line=>JSON.parse(line))
 const event=events.find(e=>e.kind==='circuit.proof.verified')
 expect(event.payload.verificationScope).toBe('laplace_algebra_crosschecked')
 const evidence=process.env.ARDESIA_E2E_EVIDENCE_DIR
 if(evidence){await mkdir(evidence,{recursive:true});await writeFile(join(evidence,'laplace.lesson'),bytes);await writeFile(join(evidence,'laplace-wire.json'),JSON.stringify(wire,null,2)+'\n')}
 const fresh=await browser.newContext({baseURL:process.env.ARDESIA_STUDIO_E2E_BASE_URL,viewport:{width:1440,height:1000}})
 try{
  const reopened=await fresh.newPage()
  await reopened.goto(`/?vista=lezioni-salvate#${room}`)
  await reopened.getByLabel('Seleziona bundle .lesson').setInputFiles({name:'laplace.lesson',mimeType:'application/zip',buffer:bytes})
  await expect(reopened.getByRole('heading',{name:'Anteprima import'})).toBeVisible()
  await reopened.getByRole('button',{name:'Importa il bundle'}).click()
  await expect(reopened.getByRole('status')).toContainText('Import completato')
  await reopened.goto(`/?vista=recap#${room}`)
  const recap=reopened.frameLocator('iframe[title="Anteprima del recap stampabile da consegnare"]')
  await expect(recap.locator('[data-circuit-math="answer"] math')).toBeVisible()
  await expect(recap.getByText(/dominio di Laplace/).first()).toBeVisible()
  await expect(recap.locator('[data-circuit-math="steps"] math').first()).toBeVisible()
  const shot=await reopened.screenshot({path:info.outputPath('laplace-recap.png'),fullPage:true})
  if(evidence)await writeFile(join(evidence,'laplace-recap.png'),shot)
  await reopened.goto(`/?vista=continuita#${room}`)
  await expect(reopened.getByTestId('continuity-surface')).toHaveAttribute('data-state','sessions')
  await reopened.locator(`[data-continuity-session-id="${event.sessionId}"]`).click()
  await expect(reopened.locator('[data-continuity-phase]')).not.toHaveAttribute('data-continuity-phase','loading')
  await expect(reopened.locator('[data-continuity-issue-severity="corrupt"]')).toHaveCount(0)
  await expect(reopened.locator(`[data-continuity-evidence="${event.eventId}:0"]`)).toHaveCount(0)
 }finally{await fresh.close()}
})
