// Verticale utente del Taccuino — PC-R1-001 / PC-OBJ-001 → PRD §5.1
// (NotebookDocument paginato in R1), §6.1 (Page[] sotto NotebookDocument),
// §6.3 (documento ordinato e paginato, distinto dalla lavagna infinita).
//
// Il test non guarda pixel e non guarda testo statico: guarda IDENTITA',
// ORDINE e CONTENUTO attraverso un reload a freddo. Il segno viene tracciato
// con un gesto reale sul canvas, non iniettato nello stato.

import { test, expect, type Page } from "@playwright/test"

const VIEWPORTS = [
  { nome: "desktop", larghezza: 1280, altezza: 800 },
  // iPad Pro 11" verticale: il bersaglio dichiarato da PRD §5.1 (iPad di prima
  // classe). Larghezza reale, non una finestra stretta qualsiasi.
  { nome: "ipad", larghezza: 834, altezza: 1194 },
] as const

/**
 * Traccia un tratto reale con la penna di Excalidraw.
 *
 * Due dettagli misurati con una sonda, non indovinati:
 *  - il pannello proprieta' di Excalidraw copre la parte sinistra della
 *    superficie: `document.elementFromPoint(200,200)` restituisce un
 *    `BUTTON.color-picker__button`. Il gesto parte quindi dalla meta' destra;
 *  - `mouse.move(x, y, {steps: N})` in una sola chiamata viene coalescato e
 *    freedraw non campiona abbastanza punti: l'undo di Excalidraw resta
 *    disabilitato, cioe' non e' stato disegnato nulla. Servono move discrete
 *    con un'attesa reale fra l'una e l'altra.
 */
async function disegnaUnTratto(page: Page): Promise<void> {
  const canvas = page.locator(".excalidraw canvas").first()
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  const box = await canvas.boundingBox()
  if (!box) throw new Error("canvas senza bounding box")

  // Il focus deve stare sulla superficie prima della scorciatoia: subito dopo
  // la navigazione il focus e' sul controllo che l'ha aperta, e il tasto non
  // raggiunge Excalidraw. Misurato con la sonda: con il click il toolbar-freedraw
  // risulta `checked:true`, senza click il gesto non produce nulla.
  await page.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.5)
  // "7" = strumento disegno libero in Excalidraw (titolo: "Disegno — P oppure 7").
  await page.keyboard.press("7")

  const x0 = box.x + box.width * 0.62
  const y0 = box.y + box.height * 0.5
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  for (let i = 1; i <= 12; i += 1) {
    await page.mouse.move(x0 + i * 8, y0 + Math.sin(i) * 12)
    await page.waitForTimeout(12)
  }
  await page.mouse.up()
}

/**
 * Apre il Taccuino dalla superficie Lezione.
 *
 * Sotto i 1025 px `.st-actions` e' nascosta dietro l'hamburger (index.css:
 * `@media (max-width: 768px)` e `@media (min-width: 769px) and (max-width: 1024px)`).
 * Vale per TUTTE le azioni della lezione, non solo per il taccuino: il test fa
 * quello che farebbe una persona su iPad, invece di pretendere un'eccezione
 * per il controllo nuovo.
 */
async function apriTaccuino(page: Page): Promise<void> {
  const apri = page.locator("[data-open-notebook]").first()
  if (!(await apri.isVisible())) {
    await page.locator(".st-menu-btn").first().click()
  }
  await expect(apri).toBeVisible()
  await apri.click()
}

for (const vp of VIEWPORTS) {
  test(`taccuino ${vp.nome}: da Lezione creo un Taccuino, scrivo, ricarico e ritrovo tutto`, async ({
    page,
  }) => {
    const erroriConsole: string[] = []
    page.on("console", (m) => {
      if (m.type() === "error") erroriConsole.push(m.text())
    })
    page.on("pageerror", (e) => erroriConsole.push(`pageerror: ${e.message}`))

    await page.setViewportSize({ width: vp.larghezza, height: vp.altezza })

    // 1. Lezione: la lavagna esistente. Il golden path non deve cambiare.
    await page.goto("/")
    await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

    // 2. L'ingresso al Taccuino vive DENTRO Lezione: la nav Founder resta a tre voci.
    await expect(page.locator("[data-view-nav] [data-view-nav-item]")).toHaveCount(3)
    await apriTaccuino(page)

    // 3. Il taccuino e' aperto, ha identita' nell'URL e una prima pagina reale.
    const taccuino = page.locator("[data-notebook-document-id]").first()
    await expect(taccuino).toBeVisible({ timeout: 15_000 })
    const documentId = await taccuino.getAttribute("data-notebook-document-id")
    expect(documentId).toBeTruthy()
    expect(page.url()).toContain("vista=taccuino")

    // Le pagine sono una collezione ORDINATA e visibile.
    const pagine = page.locator("[data-notebook-page-ordinal]")
    await expect(pagine).toHaveCount(1)
    await expect(pagine.first()).toHaveAttribute("data-notebook-page-ordinal", "0")

    // 4. Modifica reale della pagina col kernel di scrittura esistente.
    await disegnaUnTratto(page)
    const conteggio = page.locator("[data-notebook-scene-elements]").first()
    await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
      timeout: 10_000,
    })
    const elementiPrima = await conteggio.getAttribute("data-notebook-scene-elements")

    // 5. Riapertura a freddo: ricarica la pagina, non un re-render.
    await page.reload()
    const taccuinoRiaperto = page.locator("[data-notebook-document-id]").first()
    await expect(taccuinoRiaperto).toBeVisible({ timeout: 15_000 })

    // 6. Identita', ordine e contenuto sopravvivono.
    await expect(taccuinoRiaperto).toHaveAttribute("data-notebook-document-id", documentId!)
    await expect(page.locator("[data-notebook-page-ordinal]")).toHaveCount(1)
    await expect(page.locator("[data-notebook-scene-elements]").first()).toHaveAttribute(
      "data-notebook-scene-elements",
      elementiPrima!,
      { timeout: 10_000 },
    )

    expect(erroriConsole).toEqual([])
  })
}

test("taccuino: una seconda pagina si aggiunge in coda e si passa fra le due senza perdere il contenuto", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })

  // Segno sulla prima pagina.
  await disegnaUnTratto(page)
  const conteggio = page.locator("[data-notebook-scene-elements]").first()
  await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
    timeout: 10_000,
  })
  const elementiPagina1 = await conteggio.getAttribute("data-notebook-scene-elements")

  // Seconda pagina: si aggiunge IN CODA.
  await page.locator("[data-add-notebook-page]").first().click()
  const pagine = page.locator("[data-notebook-page-ordinal]")
  await expect(pagine).toHaveCount(2)
  await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-ordinal", "1")

  // La seconda pagina e' vuota: il contenuto non e' condiviso fra pagine.
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", { timeout: 10_000 })

  // Torno alla prima e ritrovo il tratto.
  await pagine.nth(0).click()
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", elementiPagina1!, {
    timeout: 10_000,
  })
})

test("taccuino: l'identita' resta quella della lezione montata anche se lo hash cambia prima del click", async ({
  page,
}) => {
  await page.goto("/#lezione-stabile")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  // Simula una mutazione esterna dell'URL senza rimontare Room. La UI e lo
  // storage devono continuare a riferirsi allo snapshot `room` del mount.
  await page.evaluate(() => history.replaceState(null, "", "/#lezione-muta"))
  await apriTaccuino(page)

  await expect(page.locator("[data-notebook-document-id]").first()).toHaveAttribute(
    "data-notebook-document-id",
    "taccuino-lezione-stabile",
    { timeout: 15_000 },
  )
  expect(new URL(page.url()).hash).toBe("#lezione-stabile")
})

test("taccuino: un manifest corrotto e' mostrato e non viene sostituito con un documento vuoto", async ({
  page,
}) => {
  await page.goto("/#lezione-corruzione")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })

  const documentId = "taccuino-lezione-corruzione"
  const key = `maestro:notebooks/${documentId}/notebook.json`
  const payloadCorrotto = btoa("manifest-corrotto-da-non-sovrascrivere")
  await page.evaluate(({ storageKey, payload }) => {
    localStorage.setItem(storageKey, payload)
  }, { storageKey: key, payload: payloadCorrotto })

  await page.reload()

  await expect(page.locator("[data-notebook-error]")).toContainText("danneggiato", {
    timeout: 15_000,
  })
  const payloadDopo = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)
  expect(payloadDopo).toBe(payloadCorrotto)
})

test("taccuino: il cambio pagina drena la modifica da tastiera sulla pagina corretta", async ({
  page,
}) => {
  await page.goto("/#lezione-drain")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  const taccuino = page.locator("[data-notebook-document-id]").first()
  await expect(taccuino).toBeVisible({ timeout: 15_000 })
  const documentId = await taccuino.getAttribute("data-notebook-document-id")
  if (!documentId) throw new Error("documentId assente")

  const conteggio = page.locator("[data-notebook-scene-elements]").first()
  await disegnaUnTratto(page)
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", { timeout: 10_000 })

  await page.locator("[data-add-notebook-page]").click()
  await expect(page.locator("[data-notebook-page-ordinal]")).toHaveCount(2)
  await disegnaUnTratto(page)
  await disegnaUnTratto(page)
  await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", { timeout: 10_000 })

  const pagine = page.locator("[data-notebook-page-ordinal]")
  await pagine.nth(0).click()
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", { timeout: 10_000 })

  const canvas = page.locator(".excalidraw canvas").first()
  const box = await canvas.boundingBox()
  if (!box) throw new Error("canvas senza bounding box")
  // La corsa contro la finestra di debounce non si vince: si ELIMINA. Da qui in
  // avanti nessun `setTimeout` della pagina scatta, quindi l'autosave
  // temporizzato non puo' rendere durevole la cancellazione. Se il file di p1
  // finisce vuoto, il solo meccanismo che possa averlo svuotato e' il drain del
  // cambio pagina.
  //
  // Misurato, e la misura e' la ragione per cui questo blocco esiste: nella
  // versione precedente il test passava ANCHE con il drain rimosso, perche'
  // `await expect(...'in-corso')` consumava da solo i 400 ms di AUTOSAVE_MS.
  // Un test che resta verde sotto la mutazione che deve sorvegliare non e' un
  // oracolo: e' una decorazione.
  //
  // Sospendere OGNI timer non funziona — misurato: Excalidraw e React non
  // completano piu' l'operazione e `in-corso` non compare mai. Si intercetta
  // quindi il solo timer dell'autosave, riconosciuto dal suo ritardo.
  await page.evaluate(() => {
    const w = window as unknown as {
      __setTimeoutOriginale?: typeof window.setTimeout
      __autosaveSospesi?: number
    }
    w.__setTimeoutOriginale = window.setTimeout
    w.__autosaveSospesi = 0
    const AUTOSAVE_MS_ATTESO = 400
    window.setTimeout = ((fn: TimerHandler, ms?: number, ...resto: unknown[]) => {
      if (ms === AUTOSAVE_MS_ATTESO) {
        w.__autosaveSospesi = (w.__autosaveSospesi ?? 0) + 1
        return 0 as unknown as number
      }
      const originale = w.__setTimeoutOriginale as typeof window.setTimeout
      return originale(fn, ms, ...(resto as []))
    }) as typeof window.setTimeout
  })

  await page.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.5)
  await page.keyboard.press("ControlOrMeta+A")
  await page.keyboard.press("Backspace")
  await expect(page.locator("[data-notebook-save-state='in-corso']")).toBeVisible()
  // Click sincrono, senza le attese di actionability di Playwright.
  await page.evaluate(() => {
    const seconda = document.querySelectorAll<HTMLElement>("[data-notebook-page-ordinal]")[1]
    if (!seconda) throw new Error("seconda pagina assente")
    seconda.click()
  })
  const autosaveSospesi = await page.evaluate(() => {
    const w = window as unknown as {
      __setTimeoutOriginale?: typeof window.setTimeout
      __autosaveSospesi?: number
    }
    if (w.__setTimeoutOriginale) window.setTimeout = w.__setTimeoutOriginale
    return w.__autosaveSospesi ?? 0
  })
  // Il ritardo dell'autosave e' un accordo fra questo test e il componente. Se
  // cambia, questo test DEVE fallire rumorosamente invece di tornare a passare
  // per il motivo sbagliato — cioe' perche' il timer scatta di nuovo da solo.
  expect(autosaveSospesi).toBeGreaterThan(0)

  // IL REFERENTE DELLA DURABILITA' E' IL FILE, non l'attributo.
  //
  // Misurato, ed e' la ragione di questo blocco: con il drain rimosso il file di
  // p1 conserva l'elemento cancellato, ma `toHaveAttribute(..., "0")` restava
  // VERDE, perche' durante il rimontaggio `elementCount` passa per 0 e
  // Playwright accetta il primo campione che combacia. Un'asserzione soddisfatta
  // da un valore di passaggio non misura la durabilita' di niente.
  const elementiDurevoliP1 = () => page.evaluate((chiave) => {
    const codificato = localStorage.getItem(chiave)
    if (!codificato) return -1
    try {
      const scena = JSON.parse(atob(codificato)) as { elements?: unknown[] }
      return Array.isArray(scena.elements) ? scena.elements.length : -3
    } catch {
      return -4
    }
  }, `maestro:notebooks/${documentId}/pages/p1.excalidraw`)

  await expect.poll(elementiDurevoliP1, { timeout: 10_000 }).toBe(0)

  // Il timer sospeso non scattera' mai: l'attesa serve solo a lasciare
  // completare il caricamento della pagina 2.
  await page.waitForTimeout(700)
  await pagine.nth(0).click()
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", { timeout: 10_000 })
  // Lo stato durevole non deve essere stato riportato indietro dal ritorno.
  expect(await elementiDurevoliP1()).toBe(0)
})

test("taccuino: la riapertura conserva il viewport salvato invece di sostituirlo coi default", async ({
  page,
}) => {
  await page.goto("/#lezione-viewport")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })
  await disegnaUnTratto(page)

  const sceneKey = "maestro:notebooks/taccuino-lezione-viewport/pages/p1.excalidraw"
  await expect.poll(
    () => page.evaluate((storageKey) => localStorage.getItem(storageKey) !== null, sceneKey),
    { timeout: 10_000 },
  ).toBe(true)
  await page.evaluate((storageKey) => {
    const encoded = localStorage.getItem(storageKey)
    if (!encoded) throw new Error("scena non persistita")
    const scene = JSON.parse(atob(encoded))
    scene.appState = { ...scene.appState, scrollX: 321, scrollY: -123 }
    localStorage.setItem(storageKey, btoa(JSON.stringify(scene)))
  }, sceneKey)

  await page.reload()
  await expect(page.locator("[data-notebook-scene-elements]").first()).not.toHaveAttribute(
    "data-notebook-scene-elements",
    "0",
    { timeout: 15_000 },
  )
  // Il mount genera il normale onChange: dopo l'autosave il file osservato
  // rivela quale appState Excalidraw ha realmente ricevuto come initialData.
  await page.waitForTimeout(700)
  await expect(page.locator("[data-notebook-save-state]")).not.toHaveAttribute(
    "data-notebook-save-state",
    "in-corso",
  )
  const viewport = await page.evaluate((storageKey) => {
    const encoded = localStorage.getItem(storageKey)
    if (!encoded) throw new Error("scena scomparsa")
    const scene = JSON.parse(atob(encoded))
    return { scrollX: scene.appState.scrollX, scrollY: scene.appState.scrollY }
  }, sceneKey)
  expect(viewport).toEqual({ scrollX: 321, scrollY: -123 })
})

test("taccuino: una write fallita resta visibile e blocca il cambio pagina", async ({ page }) => {
  await page.goto("/#lezione-write-failure")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })

  await page.evaluate(() => {
    const originale = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key.includes("notebooks/") && key.includes("/pages/")) {
        throw new DOMException("quota simulata", "QuotaExceededError")
      }
      originale.call(this, key, value)
    }
  })

  await disegnaUnTratto(page)
  await expect(page.locator("[data-notebook-save-state='errore']")).toContainText("Salvataggio non riuscito", {
    timeout: 10_000,
  })
  await expect(page.locator("[data-notebook-save-error]")).toHaveText("Riprova il salvataggio")
  await page.locator("[data-add-notebook-page]").click()
  await expect(page.locator("[data-notebook-page-ordinal]")).toHaveCount(1)
})
