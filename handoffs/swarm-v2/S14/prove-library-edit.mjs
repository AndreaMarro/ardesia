import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
// One owned browser in the serial host slot; HTML fallback, real donor UI.
const here=path.dirname(fileURLToPath(import.meta.url))
const repo=path.resolve(here,'../../..')
const source=process.env.ARDESIA_S14_SOURCE_ROOT
const out=process.env.ARDESIA_S14_OUTPUT
const origin=process.env.ARDESIA_S14_ORIGIN??'http://127.0.0.1:55714'
if(!source||!out)throw new Error('Set ARDESIA_S14_SOURCE_ROOT and ARDESIA_S14_OUTPUT to exact source and a fresh directory')
const require=createRequire(path.join(repo,'apps/studio/package.json'))
const {chromium}=require('playwright')
await mkdir(out,{recursive:true})
const fixture=JSON.parse(await readFile(path.join(here,'native-board-fixture.json'),'utf8'))
const key='maestro:raw/s14-edit/board.excalidraw'
const report={status:'RUNNING',checks:[],errors:[],sourceFiles:{},platform:'HTML download/file-input fallback; native headless OS file picker not automated'}
for(const rel of ['apps/studio/src/Room.tsx','apps/studio/src/whiteboard-library/libraryScene.ts','apps/studio/src/whiteboard-library/libraryImport.ts'])report.sourceFiles[rel]=createHash('sha256').update(await readFile(source+'/'+rel)).digest('hex')
const pass=name=>{report.checks.push({name,status:'PASS'});process.stdout.write(name+'\n')}
let browser,page
try{
 browser=await chromium.launch({headless:true,timeout:30000})
 report.browser=browser.version()
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'it-IT',acceptDownloads:true})
 await context.addInitScript(()=>{delete window.showSaveFilePicker;delete window.showOpenFilePicker})
 await context.addInitScript(({key,value})=>{if(!sessionStorage.getItem('s14-edit-seed')){localStorage.setItem(key,value);sessionStorage.setItem('s14-edit-seed','1')}},{key,value:Buffer.from(JSON.stringify(fixture)).toString('base64')})
 page=await context.newPage();page.setDefaultTimeout(15000)
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});page.on('pageerror',e=>report.errors.push(e.message))
 await page.goto(`${origin}/#s14-edit`)
 await page.waitForFunction(()=>window.__MAESTRO_TEST__?.ready)
 const waitItems=n=>page.waitForFunction(({key,n})=>{const raw=localStorage.getItem(key);return raw&&JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw),c=>c.charCodeAt(0)))).libraryItems?.length===n},{key,n})
 const scene=()=>page.evaluate(key=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(localStorage.getItem(key)),c=>c.charCodeAt(0)))),key)
 await page.getByRole('button',{name:'Apri raccolta della lezione',exact:true}).click()
 const tiles=page.locator('.library-unit:not(:has(.library-unit__adder)) .library-unit__dragger[draggable="true"]')
 await tiles.first().click()
 const pending=page.locator('.library-unit:has(.library-unit__adder) .library-unit__dragger')
 if(!await pending.isVisible())await page.getByRole('button',{name:'Apri raccolta della lezione',exact:true}).click()
 await pending.click();await waitItems(2)
 pass('native pending selection adds a second collection item and autosaves')
 const afterAdd=await scene();report.createdItemId=afterAdd.libraryItems.find(i=>i.id!==fixture.libraryItems[0].id).id
 const menu=()=>page.locator('.library-menu-dropdown-container--in-heading .dropdown-menu-button')
 await menu().click()
 const downloadPromise=page.waitForEvent('download',{timeout:15000})
 await page.getByTestId('lib-dropdown--export').click()
 const download=await downloadPromise
 const file=out+'/native.excalidrawlib';await download.saveAs(file)
 const exported=JSON.parse(await readFile(file,'utf8'));assert.equal(exported.type,'excalidrawlib');assert.equal(exported.libraryItems.length,2)
 pass('native collection menu exports a real two-item excalidrawlib file')
 await tiles.first().click({modifiers:['Shift']})
 await menu().click()
 report.removeMenu=await page.locator('.library-menu').innerText()
 await page.locator('.library-menu').getByText(/Remove|Rimuovi/, {exact:true}).click()
 report.confirmText=await page.getByRole('dialog').innerText()
 await page.locator('.confirm-dialog-buttons').getByRole('button').last().click()
 await waitItems(1);pass('native collection menu removes a selected item and autosaves')
 await menu().click()
 const chooserPromise=page.waitForEvent('filechooser')
 await page.getByTestId('lib-dropdown--load').click()
 await (await chooserPromise).setFiles(file)
 await waitItems(2);pass('native collection menu imports the exported excalidrawlib and merges the removed item')
 await page.reload();await page.waitForFunction(()=>window.__MAESTRO_TEST__?.ready);await waitItems(2)
 const restored=await scene();assert.deepEqual(restored.libraryItems.map(i=>i.id).sort(),exported.libraryItems.map(i=>i.id).sort())
 pass('cold reload preserves the exact two library item identities after native file roundtrip')
 await page.screenshot({path:out+'/library-edited.png',fullPage:true})
 assert.deepEqual(report.errors,[]);report.status='PASS'
}catch(error){report.status='FAIL';report.failure=String(error.stack??error);if(page){await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});report.dom=await page.locator('body').innerText().catch(()=>null)}process.exitCode=1}
finally{await browser?.close();report.cleanup='CLOSED_OWNED_BROWSER';await writeFile(out+'/result.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))}
