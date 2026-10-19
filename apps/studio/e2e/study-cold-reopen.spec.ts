import {test,expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
import path from 'node:path'
const root=path.resolve(process.cwd(),'../..')
const dataDir=process.env.STUDY_DEMO_DATA_DIR??path.join(root,'.study-demo')
const access=JSON.parse(readFileSync(path.join(dataDir,'demo-access.json'),'utf8')) as {tokens:Record<string,string>}
test('cold server and clean profile recover source, review, attempts and portable notebook',async({browser},info)=>{
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:info.outputPath('video'),size:{width:390,height:844}}})
 const page=await context.newPage();await page.goto('/?vista=fisica');await page.getByText('Accedi alla demo',{exact:true}).click()
 await page.getByLabel('Accesso sintetico',{exact:true}).fill(access.tokens['student-02']);await page.getByRole('button',{name:'Accedi',exact:true}).click()
 await page.getByRole('button',{name:'Materiali',exact:true}).click()
 await expect(page.getByText('1,5⁴ = 5,0625 a Δp fissata.',{exact:true})).toBeVisible()
 await expect(page.getByRole('heading',{name:'Revisione del tutor sintetico'})).toBeVisible()
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Esporta quaderno'}).click();const download=await downloadEvent
 const downloaded=await download.path();expect(downloaded).toBeTruthy()
 await download.saveAs(info.outputPath('ardesia-fisica.study.json'))
 await page.getByLabel('Riapri quaderno .study.json').setInputFiles(downloaded!)
 await expect(page.getByRole('heading',{name:'Quaderno riaperto',exact:true})).toBeVisible()
 await expect(page.getByText('Omissioni dell’export',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Lezione',exact:true}).click();await page.getByRole('button',{name:'Apri memoria LessonOS'}).click()
 await expect(page.getByRole('heading',{name:'Da dove ripartire'})).toBeVisible()
 await page.screenshot({path:info.outputPath('cold-mobile.png'),fullPage:true})
 await context.close()
})
