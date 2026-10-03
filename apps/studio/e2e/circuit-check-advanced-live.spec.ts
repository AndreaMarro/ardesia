import { expect, test } from "@playwright/test"
import JSZip from "jszip"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createHash } from "node:crypto"

// Both services are real. No route interception or generated answer substitutes.
test.skip(!process.env.KIRCHHOFF_LOCAL_URL || !process.env.ARDESIA_STUDIO_E2E_BASE_URL,
  "Start local Kirchhoff and Ardesia, then set both service URLs")

const cases = [
  {id:"porta",netlist:"R1 a 0 3 ohm\nR2 a 0 6 ohm\n? resistance a 0",
    scope:"port_subproofs_crosschecked",claim:"PORT_SUBPROOFS_CROSSCHECKED",
    answer:"2",label:"Resistenza di porta: sottoprove chiuse e confrontate"},
  {id:"ac",netlist:"@ac 100 rad/s\n@amplitude rms\nV1 a 0 10 volt 30deg\nR1 a b 3 ohm\nL1 b c 1/25 henry\nC1 c 0 1/100 farad\n? current R1",
    scope:"phasor_paths_crosschecked",claim:"PHASOR_PATHS_CROSSCHECKED",
    answer:"(5/6 + 5/6*sqrt(3)) + j*(5/6 - 5/6*sqrt(3))",label:"Fasori confrontati su tutti i rami"},
  {id:"power",netlist:"@ac 100 rad/s\n@amplitude peak\nV1 a 0 10 volt 30deg\nR1 a b 3 ohm\nL1 b c 1/25 henry\nC1 c 0 1/100 farad\n? power V1",
    scope:"phasor_power_crosschecked",claim:"PHASOR_POWER_CROSSCHECKED",
    answer:"(-25/3) + j*(-25/3)",label:"Potenza complessa e bilancio confrontati su tutti i rami"},
] as const

for (const example of cases) test(`${example.id}: live solve → bundle → new browser → recap`, async ({page,browser},testInfo) => {
  test.setTimeout(90_000)
  test.skip(example.id === "porta" && !process.env.ARDESIA_SHARED_E2E,"The port lesson also requires the local room-sync service")
  let room = `advanced-${example.id}`
  const reference = example.id === "power" ? "V1" : "R1"
  const amplitude = example.id === "power" ? "peak" : "rms"
  const amplitudeLabel = example.id === "power" ? /ampiezze di picco dichiarate nell’ingresso/ : /ampiezze RMS dichiarate nell’ingresso/
  const baseURL = process.env.ARDESIA_STUDIO_E2E_BASE_URL!
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(`/#${room}`)
  await page.getByRole("button",{name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("button",{name:"Vista esperta",exact:true}).click()
  await page.getByRole("textbox",{name:"Circuito CircuitCheck"}).fill(example.netlist)
  const response = page.waitForResponse(res => res.url().endsWith("/api/solve") && res.request().method() === "POST")
  await page.getByRole("button",{name:"Risolvi e verifica"}).click()
  const wire = await (await response).json()
  expect(wire.verification.electrical_claim).toBe(example.claim)
  expect(wire.answer.exact).toBe(example.answer)
  await expect(page.getByText("confrontato ora",{exact:true})).toBeVisible()
  await expect(page.getByText(`${example.label}. La verifica riguarda il calcolo indicato.`,{exact:true})).toBeVisible()
  if (example.id !== "porta") {
    expect(wire.answer.math.kind).toBe("number")
    await expect(page.locator('[data-circuit-math="answer"] math')).toHaveCount(1)
    await page.getByRole("button",{name:reference,exact:true}).click()
    await expect(page.getByText(new RegExp(`Riferimento ${reference} salvato nel passaggio`))).toBeVisible()
    await expect(page.getByRole("button",{name:reference,exact:true})).toHaveAttribute("aria-pressed","true")
    await expect(page.getByText(/ω = 100 rad\/s/)).toBeVisible()
    await expect(page.getByText(amplitudeLabel)).toBeVisible()
    await expect(page.getByRole("button",{name:"Aggiungi passaggio",exact:true})).toHaveCount(0)
    if (example.id === "power") await expect(page.getByText(/P = -25\/3 W · Q = -25\/3 var/)).toBeVisible()
  }
  if (example.id === "porta") {
    await page.getByRole("button",{name:"Avvia lezione condivisa"}).click()
    await expect(page.getByTestId("sync-status")).toHaveText("Lavagna sincronizzata")
    room = new URL(page.url()).hash.slice(1).split("&")[0]!
    // Sharing creates a new lesson. Recalculate this revision to register a factual
    // event in that lesson rather than silently moving the old lesson's evidence.
    await page.getByRole("button",{name:"Ricalcola e verifica"}).click()
    await expect(page.getByText("confrontato ora",{exact:true})).toBeVisible()
    await page.getByRole("button",{name:"Condivisione e appunti"}).click()
    await page.getByRole("button",{name:"Invita a scrivere"}).click()
    const link = await page.getByRole("textbox",{name:"Link di invito",exact:true}).inputValue()
    await page.getByRole("button",{name:"Condivisione e appunti"}).click()
    const student = await browser.newContext({viewport:{width:1440,height:1000}})
    try {
      const peer = await student.newPage()
      await peer.goto(link)
      await expect(peer.getByTestId("sync-status")).toHaveText("Lavagna sincronizzata")
      await expect(peer.getByText(/Risultato registrato, in attesa di nuova verifica:.*2 Ω/)).toBeVisible()
      await expect(peer.getByText(`${example.label}. La verifica riguarda il calcolo indicato.`,{exact:true})).toBeVisible()
      const rectangles = () => page.evaluate(() => (window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements()
        .filter((el:any) => !el.isDeleted && el.type === "rectangle").length ?? 0)
      const before = await rectangles()
      await peer.keyboard.press("Escape")
      await peer.locator("label").filter({has:peer.getByTestId("toolbar-rectangle")}).click()
      await peer.mouse.move(1200,700);await peer.mouse.down();await peer.mouse.move(1300,770,{steps:4});await peer.mouse.up()
      await peer.keyboard.press("Escape")
      await expect.poll(rectangles).toBe(before+1)
      await expect(peer.getByTestId("sync-status")).toHaveText("Lavagna sincronizzata")
      await page.screenshot({path:testInfo.outputPath("porta-shared-annotation.png"),fullPage:true})
    } finally {await student.close()}
  }
  await page.reload()
  await expect(page.getByText("prova da ricalcolare",{exact:true})).toBeVisible()
  if (example.id !== "porta") await expect(page.getByRole("button",{name:reference,exact:true})).toHaveAttribute("aria-pressed","true")
  await page.getByRole("link",{name:"Materiali",exact:true}).click()
  const downloadPromise = page.waitForEvent("download",{timeout:15_000})
  await page.getByRole("button",{name:"Esporta .lesson",exact:true}).click()
  const bundle = await readFile(await (await downloadPromise).path())
  const zip = await JSZip.loadAsync(bundle)
  const board = JSON.parse(await zip.file("raw/board.excalidraw")!.async("string"))
  const state = board.elements.find((el:{id:string}) => el.id === "circuit-reasoning").customData.maestroTool.state
  expect(state.proof.scope).toBe(example.scope)
  expect(state.proof.verification).toEqual(wire.verification)
  expect(state.proof.answer.exact).toBe(example.answer)
  if (example.id !== "porta") {
    expect(state.selectedFocus).toBe(reference)
    expect(state.proof.answer.phasor).toEqual(wire.answer.phasor)
    expect(state.proof.answer.complex_power).toEqual(wire.answer.complex_power)
    expect(state.proof.answer.math).toEqual(wire.answer.math)
    expect(state.proof.answer.display_exact).toEqual(wire.answer.display_exact)
    expect(state.proof.steps.map((step:{math?:unknown})=>step.math)).toEqual(wire.steps.map((step:{math?:unknown})=>step.math))
    expect(state.proof.conventions).toEqual(wire.conventions)
    expect(state.proof.conventions.amplitude).toBe(amplitude)
    expect(state.proof.steps[state.selectedStep].focus).toContain(reference)
  }
  const envelopes = (await zip.file("raw/lessonos-events.jsonl")!.async("string")).trim().split("\n").map(line => JSON.parse(line))
  await testInfo.attach("lesson-events-summary",{contentType:"application/json",body:JSON.stringify(
    envelopes.map(event => ({seq:event.seq,kind:event.kind,lessonId:event.lessonId})),null,2)})
  const originalProofEvent = envelopes.find(event => event.kind === "circuit.proof.verified")
  expect(originalProofEvent?.payload.verificationScope).toBe(example.scope)
  const originalSessionId = originalProofEvent.sessionId as string
  const originalStartEvent = envelopes.find(event=>event.kind === "lesson.started" && event.sessionId === originalSessionId)
  expect(originalStartEvent).toBeTruthy()
  const sessionPath = `raw/sessions/${originalSessionId}/session.yaml`
  const originalSession = await zip.file(sessionPath)!.async("string")
  const originalSessionHash = createHash("sha256").update(originalSession).digest("hex")
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"))
  expect(manifest.schemaVersion).toBe(2)
  expect(manifest.sessions.missingSessionIds).toEqual([])
  expect(manifest.files.find((file:{path:string})=>file.path === sessionPath)?.sha256).toBe(originalSessionHash)
  await testInfo.attach(`${example.id}.lesson`,{contentType:"application/zip",body:bundle})
  const evidenceDirectory = process.env.ARDESIA_E2E_EVIDENCE_DIR
  if (evidenceDirectory) {
    await mkdir(evidenceDirectory,{recursive:true})
    await writeFile(join(evidenceDirectory,`${example.id}.lesson`),bundle)
    await writeFile(join(evidenceDirectory,`${example.id}-manifest.json`),`${JSON.stringify({
      manifest,bundleSha256:createHash("sha256").update(bundle).digest("hex"),
      originalSessionId,originalSessionSha256:originalSessionHash,verificationScope:example.scope,
    },null,2)}\n`)
  }

  // A second browser context proves portability independently of the original IndexedDB.
  const fresh = await browser.newContext({baseURL})
  try {
    const reopened = await fresh.newPage()
    await reopened.goto(`/?vista=lezioni-salvate#${room}`)
    await reopened.getByLabel("Seleziona bundle .lesson").setInputFiles({name:`${room}.lesson`,mimeType:"application/zip",buffer:bundle})
    await expect(reopened.getByRole("heading",{name:"Anteprima import"})).toBeVisible()
    await reopened.getByRole("button",{name:"Importa il bundle"}).click()
    await expect(reopened.getByRole("status")).toContainText("Import completato")
    await reopened.goto(`/#${room}`)
    await expect(reopened.getByText("prova da ricalcolare",{exact:true})).toBeVisible()
    const restoredSession = await reopened.evaluate(async path => {
      const store = (window as any).__MAESTRO_TEST__?.store
      return (await store?.read(path))?.text() ?? null
    },`raw/${room}/${originalSessionId}/session.yaml`)
    expect(restoredSession).toBe(originalSession)
    expect(createHash("sha256").update(restoredSession!).digest("hex")).toBe(originalSessionHash)
    if (example.id !== "porta") await expect(reopened.getByRole("button",{name:reference,exact:true})).toHaveAttribute("aria-pressed","true")
    await reopened.goto(`/?vista=recap#${room}`)
    const preview = reopened.frameLocator('iframe[title="Anteprima del recap stampabile da consegnare"]')
    await expect(preview.getByText("Ragionamento sui circuiti",{exact:true})).toBeVisible()
    await expect(preview.getByText(`${example.label}. La verifica riguarda il calcolo indicato.`,{exact:true})).toBeVisible()
    await expect(preview.locator('img[alt="Schema del passaggio 1"]')).toBeVisible()
    if (example.id !== "porta") {
      await expect(preview.locator('[data-circuit-math="answer"] math')).toHaveCount(1)
      await expect(preview.locator('[data-circuit-math="steps"] math').first()).toBeVisible()
      await expect(preview.getByText(/ω = 100 rad\/s/)).toBeVisible()
      await expect(preview.getByText(amplitudeLabel)).toBeVisible()
      await expect(preview.getByText(new RegExp(`Riferimenti nello schema:.*${reference}`)).first()).toBeVisible()
      if (example.id === "power") await expect(preview.getByText(/P = -25\/3 W · Q = -25\/3 var/)).toBeVisible()
    }
    await reopened.screenshot({path:testInfo.outputPath(`${example.id}-recap.png`),fullPage:true})
    await reopened.goto(`/#${room}`)
    await reopened.locator('[data-view-nav-item="continuita"]').click()
    await expect(reopened.getByTestId("continuity-surface")).toHaveAttribute("data-state","sessions")
    await reopened.locator(`[data-continuity-session-id="${originalSessionId}"]`).click()
    const continuity = reopened.locator("[data-continuity-phase]")
    await expect(continuity).toBeVisible()
    await expect(continuity).not.toHaveAttribute("data-continuity-phase","loading")
    await expect(reopened.locator("[data-continuity-scope-code]")).toHaveCount(0)
    await expect(reopened.locator("[data-continuity-lesson]")).toHaveText(room)
    await expect(reopened.locator('[data-continuity-issue-code="workspace-uninitialised"]')).toHaveCount(0)
    await expect(reopened.locator('[data-continuity-issue-source="session"][data-continuity-issue-code="missing"]')).toHaveCount(0)
    await expect(reopened.locator('[data-continuity-issue-severity="corrupt"]')).toHaveCount(0)
    // The factual proof and original lifecycle event must be resolved by their
    // scoped persisted targets. Historical journal references remain separate.
    for (const eventId of [originalProofEvent.eventId,originalStartEvent.eventId]) {
      await expect(reopened.locator(`[data-continuity-evidence="${eventId}:0"]`)).toHaveCount(0)
    }
    // A cold browser uses the local cache: expose its limited authority while
    // still loading the saved sources. It must never masquerade as FSA storage.
    await expect(reopened.locator('[data-continuity-issue-code="local-storage-non-authoritative"]')).toHaveCount(3)
    await reopened.screenshot({path:testInfo.outputPath(`${example.id}-continuity.png`),fullPage:true})
  } finally {await fresh.close()}
})
