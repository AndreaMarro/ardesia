import { expect, test, type Page } from '@playwright/test'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import JSZip from 'jszip'

test.skip(!process.env.ARDESIA_SHARED_E2E || !process.env.ARDESIA_STUDIO_E2E_BASE_URL, 'Requires real Studio and local room-sync')
const sourcePath=fileURLToPath(new URL('../../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf',import.meta.url))
const countPages=(page:Page)=>page.evaluate(()=> (window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements().filter((e:any)=>e.type==='image'&&!e.isDeleted).length??0)
const localPdf=(page:Page,hash:string)=>page.evaluate(async hash=>{
  const h=(window as any).__MAESTRO_TEST__
  const blob=await h.store.read(`raw/${h.room}/documents/${hash}.pdf`)
  return blob ? {bytes:blob.size,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('')} : null
},hash)

test('two browsers share an original PDF only by consent, retain a verified portable copy, and respect revocation',async({browser,request},testInfo)=>{
  test.setTimeout(120_000)
  const base=process.env.ARDESIA_STUDIO_E2E_BASE_URL!,service='http://127.0.0.1:4318'
  const source=await readFile(sourcePath),sha256=createHash('sha256').update(source).digest('hex')
  const teacher=await browser.newContext({baseURL:base,viewport:{width:1440,height:1100}})
  const participant=await browser.newContext({baseURL:base,viewport:{width:1440,height:1100}})
  const a=await teacher.newPage(),b=await participant.newPage()
  a.setDefaultTimeout(15_000);b.setDefaultTimeout(15_000)
  const stage=async<T>(name:string,run:()=>Promise<T>):Promise<T>=>test.step(name,async()=>{
    console.info(`[shared-pdf] START ${name}`)
    const result=await run()
    console.info(`[shared-pdf] PASS ${name}`)
    return result
  })
  const transfers:{client:string;method:string}[]=[],errors:string[]=[]
  for(const [client,page] of [['teacher',a],['participant',b]] as const) {
    page.on('request',r=>{if(new URL(r.url()).pathname.endsWith('/pdf/'+sha256))transfers.push({client,method:r.method()})})
    page.on('pageerror',error=>errors.push(error.message))
  }
  try {
    await stage('Import seven pages and start the shared lesson without uploading the original',async()=>{
    await a.goto('/#pdf-private-before-share-'+Date.now())
    await expect.poll(()=>a.evaluate(()=>Boolean((window as any).__MAESTRO_TEST__?.initialLoadDone&&(window as any).__MAESTRO_TEST__?.apiRef.current))).toBe(true)
    await a.locator('input[type="file"][accept="image/*,application/pdf,.lesson"]').setInputFiles(sourcePath)
    await expect.poll(()=>countPages(a),{timeout:45_000}).toBe(7)
    expect(await localPdf(a,sha256)).toEqual({bytes:source.length,sha256})
    await a.getByRole('button',{name:'Avvia lezione condivisa',exact:true}).click()
    await expect(a.getByTestId('sync-status')).toHaveText('Lavagna sincronizzata')
    await expect.poll(()=>countPages(a)).toBe(7)
    expect(await localPdf(a,sha256)).toEqual({bytes:source.length,sha256})
    })
    const ownerHash=new URL(a.url()).hash.slice(1).split('&'),roomId=ownerHash[0]!,ownerParams=new URLSearchParams(ownerHash.slice(1).join('&'))
    const ownerToken=ownerParams.get('access')!
    const api=(token:string,method:'GET'|'POST'|'DELETE',suffix:string,data?:unknown)=>request.fetch(`${service}/rooms/${roomId}${suffix}`,{method,headers:{Authorization:`Bearer ${token}`},...(data===undefined?{}:{data})})
    expect((await(await api(ownerToken,'GET','/pdf')).json()).documents).toEqual([])
    const invite=await stage('Create a viewer invitation',async()=>{
    await a.getByRole('button',{name:'Condivisione e appunti',exact:true}).click()
    await a.getByRole('button',{name:'Invita a osservare',exact:true}).click()
    const invite=await a.getByRole('textbox',{name:'Link di invito',exact:true}).inputValue()
    await a.getByRole('button',{name:'Condivisione e appunti',exact:true}).click()
    return invite
    })
    const viewerToken=new URLSearchParams(new URL(invite).hash.slice(1).split('&').slice(1).join('&')).get('access')!
    await stage('Viewer receives raster pages without original bytes',async()=>{
    await b.goto(invite)
    await expect(b.getByTestId('sync-status')).toHaveText('Lavagna sincronizzata')
    await expect.poll(()=>countPages(b)).toBe(7)
    expect(await localPdf(b,sha256)).toBeNull()
    await b.getByRole('button',{name:'PDF originali',exact:true}).click()
    await expect(b.getByText('Il PDF originale non è condiviso. La pagina visibile non invia il documento intero.')).toBeVisible()
    await expect(b.getByRole('button',{name:'Conserva PDF originale in questa lezione',exact:true})).toHaveCount(0)
    expect(transfers).toEqual([])
    })

    await stage('Teacher explicitly publishes the original and viewer discovers metadata',async()=>{
    await a.getByRole('button',{name:'PDF originali',exact:true}).click()
    await expect(a.getByRole('link',{name:'Scarica PDF originale',exact:true})).toBeVisible()
    await expect(a.getByText(/Questo gesto invia tutte le 7 pagine/)).toBeVisible()
    await a.getByRole('button',{name:'Condividi PDF originale con i partecipanti',exact:true}).click()
    await expect(a.getByText('PDF originale condiviso con i partecipanti autorizzati.')).toBeVisible()
    await expect(b.getByRole('button',{name:'Conserva PDF originale in questa lezione',exact:true})).toBeVisible()
    expect(transfers).toEqual([{client:'teacher',method:'POST'}])
    expect(await localPdf(b,sha256)).toBeNull()
    await expect(b.getByRole('button',{name:'Condividi PDF originale con i partecipanti',exact:true})).toHaveCount(0)
    })
    const screenshot=await stage('Viewer explicitly retains and downloads byte-identical original',async()=>{
    await b.getByRole('button',{name:'Conserva PDF originale in questa lezione',exact:true}).click()
    await expect(b.getByRole('link',{name:'Scarica PDF originale',exact:true})).toBeVisible()
    expect(await localPdf(b,sha256)).toEqual({bytes:source.length,sha256})
    expect(transfers).toEqual([{client:'teacher',method:'POST'},{client:'participant',method:'GET'}])
    const sourceDownload=b.waitForEvent('download',{timeout:15_000})
    await b.getByRole('link',{name:'Scarica PDF originale',exact:true}).click()
    expect(await readFile(await(await sourceDownload).path())).toEqual(source)
    return b.screenshot({path:testInfo.outputPath('shared-pdf-retained.png'),fullPage:true})
    })

    const bundle=await stage('Viewer exports a portable lesson containing the retained original',async()=>{
    await expect(b.getByText(/La cronologia del docente non viene trasferita/)).toBeVisible()
    await b.getByRole('button',{name:'Apri Materiali per esportare la copia locale',exact:true}).click()
    const exporting=b.waitForEvent('download',{timeout:15_000})
    await b.getByRole('button',{name:'Esporta .lesson',exact:true}).click()
    const bundle=await readFile(await(await exporting).path()),zip=await JSZip.loadAsync(bundle)
    const manifest=JSON.parse(await zip.file('manifest.json')!.async('text'))
    expect(manifest.schemaVersion).toBe(3)
    expect(manifest.sessionIds).toEqual([])
    expect(manifest.lessonOs.status).toBe("missing")
    expect(manifest.lessonOs.warnings).toContain("Shared viewer copy: remote event history was not transferred; included events, if any, are local.")
    expect(await zip.file("raw/events.jsonl")!.async("text")).toBe("")
    expect(zip.file("raw/lessonos-events.jsonl")).toBeNull()
    expect(Buffer.from(await zip.file(`raw/documents/${sha256}.pdf`)!.async('uint8array'))).toEqual(source)
    const board=JSON.parse(await zip.file('raw/board.excalidraw')!.async('text'))
    expect(board.elements.filter((e:any)=>e.type==='image'&&!e.isDeleted)).toHaveLength(7)
    expect(JSON.stringify(manifest)).not.toContain(ownerToken)
    expect(JSON.stringify(board)).not.toContain(viewerToken)
    return bundle
    })
    await stage('Reopen shared lesson and withdraw future remote access while retaining local bytes',async()=>{
    await b.goto(invite)
    await expect(b.getByTestId('sync-status')).toHaveText('Lavagna sincronizzata')
    await b.getByRole('button',{name:'PDF originali',exact:true}).click()
    await expect(b.getByRole('link',{name:'Scarica PDF originale',exact:true})).toBeVisible()
    expect(transfers.filter(item=>item.method==='GET')).toHaveLength(1)

    await a.getByRole('button',{name:'Interrompi condivisione originale',exact:true}).click()
    await expect(b.getByText('Il PDF originale non è condiviso. La pagina visibile non invia il documento intero.')).toBeVisible()
    expect((await api(viewerToken,'GET','/pdf/'+sha256)).status()).toBe(404)
    await expect(b.getByRole('link',{name:'Scarica PDF originale',exact:true})).toBeVisible()
    expect(await localPdf(b,sha256)).toEqual({bytes:source.length,sha256})
    })
    await stage('Republish and revoke viewer access while preserving the retained local copy',async()=>{
    await a.getByRole('button',{name:'Condividi PDF originale con i partecipanti',exact:true}).click()
    await expect(a.getByText('PDF originale condiviso con i partecipanti autorizzati.')).toBeVisible()
    await a.getByRole('region',{name:'PDF originali',exact:true}).getByRole('button',{name:'Chiudi',exact:true}).click()
    await a.getByRole('button',{name:'Condivisione e appunti',exact:true}).click()
    await a.getByRole('button',{name:'Revoca accesso 1',exact:true}).click()
    await expect(b.getByTestId('sync-status')).toContainText('Accesso revocato')
    expect((await api(viewerToken,'GET','/pdf/'+sha256)).status()).toBe(401)
    expect(await localPdf(b,sha256)).toEqual({bytes:source.length,sha256})
    })
    expect(errors).toEqual([])
    const summary={sourceSha256:sha256,sourceBytes:source.length,pages:7,manifestSchemaVersion:3,
      bundleSha256:createHash('sha256').update(bundle).digest('hex'),explicitTransferMethods:transfers,
      privacy:'No original uploaded with raster pages; participant retained bytes only after an explicit request; withdrawal/revocation block future server reads.'}
    await testInfo.attach('shared-pdf-summary.json',{body:JSON.stringify(summary,null,2),contentType:'application/json'})
    const evidence=process.env.ARDESIA_E2E_EVIDENCE_DIR
    if(evidence){await mkdir(evidence,{recursive:true});await writeFile(join(evidence,'shared-pdf-retained.png'),screenshot);await writeFile(join(evidence,'shared-pdf-participant.lesson'),bundle);await writeFile(join(evidence,'shared-pdf-summary.json'),JSON.stringify(summary,null,2)+'\n')}
  } finally {
    const closed=await Promise.allSettled([teacher.close(),participant.close()])
    for(const [index,result] of closed.entries()) if(result.status==='rejected')
      console.warn(`[shared-pdf] cleanup failed for ${index===0?'teacher':'participant'}; preserving original test failure`)
  }
})
