// Verticale utente del Taccuino — PC-R1-001 / PC-OBJ-001 → PRD §5.1
// (NotebookDocument paginato in R1), §6.1 (Page[] sotto NotebookDocument),
// §6.3 (documento ordinato e paginato, distinto dalla lavagna infinita).
//
// Il test non guarda pixel e non guarda testo statico: guarda IDENTITA',
// ORDINE e CONTENUTO attraverso un reload a freddo. Il segno viene tracciato
// con un gesto reale sul canvas, non iniettato nello stato.

import { test, expect, type Locator, type Page } from "@playwright/test"

const VIEWPORTS = [
  { nome: "desktop", larghezza: 1280, altezza: 800 },
  // iPad Pro 11" verticale: il bersaglio dichiarato da PRD §5.1 (iPad di prima
  // classe). Larghezza reale, non una finestra stretta qualsiasi.
  { nome: "ipad", larghezza: 834, altezza: 1194 },
] as const

const INSERT_PROFILES = [
  {
    nome: "desktop",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    hasTouch: false,
  },
  {
    nome: "ipad",
    viewport: { width: 834, height: 1194 },
    deviceScaleFactor: 2,
    hasTouch: true,
  },
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
  // La scena della pagina si carica in asincrono e, finche' non e' pronta, la
  // vista mostra una barra al posto di Excalidraw. Disegnare in quella finestra
  // significa disegnare su un'istanza che sta per essere smontata: il tratto non
  // arriva a nessuna scena e il conteggio resta `0`.
  //
  // E' la causa dei fallimenti intermittenti «data-notebook-scene-elements resta
  // 0» dopo un cambio pagina — e non era un difetto di prodotto: il prodotto
  // dichiarava di stare caricando, e il test non lo ascoltava. Qui il gesto
  // aspetta un segnale reale del prodotto, non un timeout piu' lungo.
  await expect(page.locator('[aria-label="Apertura della pagina"]')).toHaveCount(0, {
    timeout: 15_000,
  })
  const canvas = page.locator(".excalidraw canvas").first()
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  // La box si CATTURA nella stessa lettura che la valida. Con `poll` seguito da
  // una seconda `boundingBox()` c'era una TOCTOU reale: Excalidraw viene
  // rimontato per `key` a ogni cambio pagina, e fra la verifica e la rilettura
  // il canvas può sparire. Il fallimento che ne usciva — «canvas senza bounding
  // box» — sembrava un difetto di prodotto e non lo era. L'oracolo non si
  // indebolisce: senza box il test resta rosso.
  let box: Awaited<ReturnType<typeof canvas.boundingBox>> = null
  await expect.poll(async () => {
    box = await canvas.boundingBox()
    return Boolean(box)
  }, { timeout: 15_000 }).toBe(true)
  if (!box) throw new Error("canvas senza bounding box")

  // Il focus deve stare sulla superficie prima della scorciatoia: subito dopo
  // la navigazione il focus e' sul controllo che l'ha aperta, e il tasto non
  // raggiunge Excalidraw. Misurato con la sonda: con il click il toolbar-freedraw
  // risulta `checked:true`, senza click il gesto non produce nulla.
  await page.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.5)
  // "7" = strumento disegno libero in Excalidraw (titolo: "Disegno — P oppure 7").
  await page.keyboard.press("7")

  // La selezione dello strumento era ASSUNTA, e l'assunzione falliva in
  // silenzio: se il tasto non raggiunge Excalidraw — perche' il focus e' ancora
  // sul controllo che ha cambiato pagina, o perche' il componente si e' appena
  // rimontato — il gesto successivo non disegna, la scena resta vuota e il test
  // muore molto piu' tardi su «data-notebook-scene-elements resta 0», cioe' su
  // un sintomo lontano dalla causa.
  //
  // Qui la precondizione diventa esplicita e si aspetta. Se lo strumento non si
  // attiva, il rosso lo dice: non e' un rinvio, e' una diagnosi anticipata al
  // punto in cui il difetto accade. Il secondo tentativo di scorciatoia serve
  // ai casi in cui il primo e' arrivato durante il rimontaggio.
  const freedraw = page.locator('[data-testid="toolbar-freedraw"]')
  await expect.poll(async () => {
    if (await freedraw.count() === 0) return "assente"
    if (await freedraw.isChecked()) return "attivo"
    await page.mouse.click(box!.x + box!.width * 0.62, box!.y + box!.height * 0.5)
    await page.keyboard.press("7")
    return "non-attivo"
  }, { timeout: 10_000 }).toBe("attivo")

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

async function attivaControlloPagina(
  page: Page,
  controllo: Locator,
  touch: boolean,
): Promise<void> {
  await expect(controllo).toBeVisible()
  await controllo.scrollIntoViewIfNeeded()
  const box = await controllo.boundingBox()
  if (!box) throw new Error("controllo pagina senza bounding box")
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  if (!touch) {
    await controllo.click()
    return
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

async function attivaControlloPaginaAccessibile(
  page: Page,
  controllo: Locator,
  touch: boolean,
): Promise<void> {
  await expect(controllo).toBeVisible()
  await controllo.scrollIntoViewIfNeeded()
  const box = await controllo.boundingBox()
  if (!box) throw new Error("controllo pagina accessibile senza bounding box")
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  if (touch) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    return
  }

  await controllo.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(controllo).toBeFocused()
  await expect.poll(() => controllo.evaluate((elemento) => {
    const stile = getComputedStyle(elemento)
    const outlineVisibile = stile.outlineStyle !== "none" && parseFloat(stile.outlineWidth) > 0
    return outlineVisibile || stile.boxShadow !== "none"
  })).toBe(true)
  await page.keyboard.press("Enter")
}

/**
 * Apre il gestore pagine, che da GN-A0-012 e' la sola superficie da cui si
 * seleziona e si comanda una selezione. E' idempotente: chi ha gia' il pannello
 * aperto non lo richiude per sbaglio.
 */
async function apriGestorePagine(page: Page, touch: boolean): Promise<void> {
  const gestore = page.locator("[data-notebook-page-manager]")
  if (await gestore.count() > 0 && await gestore.isVisible()) return
  await attivaControlloPagina(
    page,
    page.locator("[data-open-notebook-page-manager]"),
    touch,
  )
  await expect(gestore).toBeVisible()
}

/**
 * Misura il backend cache attivo per scegliere contenuti distinguibili.
 * L'oracolo resta il remount UI sottostante; questa lettura non prova FSA,
 * export o durabilita' dopo crash.
 */
async function contaElementiCachePagina(
  page: Page,
  documentId: string,
  pageId: string,
): Promise<number> {
  return page.evaluate(({ doc, pagina }) => {
    const suffix = `notebooks/${doc}/pages/${pagina}.excalidraw`
    let candidatoInvalido = false
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.endsWith(suffix)) {
        const codificato = localStorage.getItem(key)
        if (!codificato) continue
        try {
          const bytes = Uint8Array.from(atob(codificato), (byte) => byte.charCodeAt(0))
          const scena = JSON.parse(new TextDecoder().decode(bytes)) as { elements?: unknown[] }
          if (Array.isArray(scena.elements)) return scena.elements.length
          candidatoInvalido = true
        } catch {
          candidatoInvalido = true
        }
      }
    }
    return candidatoInvalido ? -2 : -1
  }, { doc: documentId, pagina: pageId })
}

async function leggiByteCachePagina(
  page: Page,
  documentId: string,
  pageId: string,
): Promise<string | null> {
  return page.evaluate(
    ({ doc, pagina }) => localStorage.getItem(
      `maestro:notebooks/${doc}/pages/${pagina}.excalidraw`,
    ),
    { doc: documentId, pagina: pageId },
  )
}

async function leggiScenaCachePagina(
  page: Page,
  documentId: string,
  pageId: string,
): Promise<Record<string, unknown> | null> {
  return page.evaluate(({ doc, pagina }) => {
    const encoded = localStorage.getItem(`maestro:notebooks/${doc}/pages/${pagina}.excalidraw`)
    return encoded ? JSON.parse(atob(encoded)) as Record<string, unknown> : null
  }, { doc: documentId, pagina: pageId })
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

for (const profile of INSERT_PROFILES) {
  test.describe(`rotazione reale ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: ruota selezione, geometria e pagina bianca con undo/redo e reload`, async ({
      page,
    }) => {
      const consoleErrors: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text())
      })
      page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))
      await page.goto(`/#lezione-rotate-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const notebook = page.locator("[data-notebook-document-id]").first()
      await expect(notebook).toBeVisible({ timeout: 15_000 })
      const documentId = await notebook.getAttribute("data-notebook-document-id")
      if (!documentId) throw new Error("documentId rotazione assente")

      await disegnaUnTratto(page)
      await expect(page.locator("[data-notebook-save-state='salvato']")).toBeVisible({
        timeout: 10_000,
      })
      const p1Before = await leggiScenaCachePagina(page, documentId, "p1")
      const elementBefore = (p1Before?.elements as Array<Record<string, number>> | undefined)?.[0]
      if (!elementBefore) throw new Error("elemento p1 pre-rotazione assente")

      const pages = page.locator("[data-notebook-page-id]")
      await attivaControlloPagina(
        page,
        page.locator("[data-add-notebook-page]"),
        profile.hasTouch,
      )
      await expect(pages).toHaveCount(2)
      const blankPageId = await pages.nth(1).getAttribute("data-notebook-page-id")
      if (!blankPageId) throw new Error("pagina bianca assente")
      expect(await leggiScenaCachePagina(page, documentId, blankPageId)).toBeNull()
      await apriGestorePagine(page, profile.hasTouch)
      await attivaControlloPagina(
        page,
        page.locator('[data-toggle-notebook-page-selection="p1"]'),
        profile.hasTouch,
      )

      const rotate = page.locator("[data-rotate-notebook-selection]")
      await attivaControlloPaginaAccessibile(page, rotate, profile.hasTouch)
      await expect(page.locator(".excalidraw canvas").first()).toBeVisible({ timeout: 10_000 })
      await expect(pages.nth(0)).toHaveAttribute("data-notebook-page-orientation", "90")
      await expect(pages.nth(1)).toHaveAttribute("data-notebook-page-orientation", "90")
      await expect(pages.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(pages.nth(0)).toHaveAttribute("data-notebook-page-selected", "true")
      await expect(pages.nth(1)).toHaveAttribute("data-notebook-page-selected", "true")
      const blankAfterRotate = await leggiScenaCachePagina(page, documentId, blankPageId)
      expect(blankAfterRotate?.elements).toEqual([])

      const surface = page.locator("[data-notebook-page-surface]")
      await expect(surface).toHaveAttribute("data-notebook-page-orientation", "90")
      const landscapeBox = await surface.boundingBox()
      if (!landscapeBox) throw new Error("superficie landscape assente")
      expect(Math.abs(landscapeBox.width / landscapeBox.height - 1123 / 794)).toBeLessThan(0.08)

      const p1Rotated = await leggiScenaCachePagina(page, documentId, "p1")
      const elementRotated = (p1Rotated?.elements as Array<Record<string, number>> | undefined)?.[0]
      if (!elementRotated) throw new Error("elemento p1 ruotato assente")
      const centreX = elementBefore.x + elementBefore.width / 2
      const centreY = elementBefore.y + elementBefore.height / 2
      expect(elementRotated.x + elementRotated.width / 2).toBeCloseTo(1123 - centreY, 6)
      expect(elementRotated.y + elementRotated.height / 2).toBeCloseTo(centreX, 6)
      expect(elementRotated.angle).toBeCloseTo(
        (elementBefore.angle + Math.PI / 2) % (Math.PI * 2),
        9,
      )

      await attivaControlloPagina(
        page,
        page.locator("[data-notebook-undo]"),
        profile.hasTouch,
      )
      await expect(page.locator(".excalidraw canvas").first()).toBeVisible({ timeout: 10_000 })
      await expect(surface).toHaveAttribute("data-notebook-page-orientation", "0")
      const portraitBox = await surface.boundingBox()
      if (!portraitBox) throw new Error("superficie portrait assente")
      expect(Math.abs(portraitBox.width / portraitBox.height - 794 / 1123)).toBeLessThan(0.08)
      const p1Undone = await leggiScenaCachePagina(page, documentId, "p1")
      const elementUndone = (p1Undone?.elements as Array<Record<string, number>> | undefined)?.[0]
      if (!elementUndone) throw new Error("elemento p1 undo assente")
      expect(elementUndone.x).toBeCloseTo(elementBefore.x, 6)
      expect(elementUndone.y).toBeCloseTo(elementBefore.y, 6)
      expect(elementUndone.angle).toBeCloseTo(elementBefore.angle, 9)

      await attivaControlloPagina(
        page,
        page.locator("[data-notebook-redo]"),
        profile.hasTouch,
      )
      await expect(page.locator(".excalidraw canvas").first()).toBeVisible({ timeout: 10_000 })
      await expect(surface).toHaveAttribute("data-notebook-page-orientation", "90")
      await page.reload()
      await expect(notebook).toBeVisible({ timeout: 15_000 })
      await expect(surface).toHaveAttribute("data-notebook-page-orientation", "90")
      await expect(pages.nth(0)).toHaveAttribute("data-notebook-page-selected", "true")
      await expect(pages.nth(1)).toHaveAttribute("data-notebook-page-selected", "true")
      await expect(pages.nth(1)).toHaveAttribute("aria-current", "true")
      const blankAfterReload = await leggiScenaCachePagina(page, documentId, blankPageId)
      expect(blankAfterReload?.elements).toEqual([])
      const p1AfterReload = await leggiScenaCachePagina(page, documentId, "p1")
      const elementAfterReload = (
        p1AfterReload?.elements as Array<Record<string, number>> | undefined
      )?.[0]
      if (!elementAfterReload) throw new Error("elemento p1 post-reload assente")
      expect(elementAfterReload.x).toBeCloseTo(elementRotated.x, 6)
      expect(elementAfterReload.y).toBeCloseTo(elementRotated.y, 6)
      expect(elementAfterReload.width).toBeCloseTo(elementRotated.width, 6)
      expect(elementAfterReload.height).toBeCloseTo(elementRotated.height, 6)
      expect(elementAfterReload.angle).toBeCloseTo(elementRotated.angle, 9)
      expect(consoleErrors).toEqual([])
    })
  })
}

// PC-R1-001 + PC-OBJ-001; GN-A1-001 + GN-A7-012 → PRD §4.4 e §19.2:
// storia pagina reale, conseguenze recuperabili, migrazione locale e failure
// senza stato fantasma.
test("taccuino: undo/redo degli inserimenti conserva ID, attiva e ordine dopo reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/#lezione-undo-redo")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })

  const pagine = page.locator("[data-notebook-page-id]")
  await expect(pagine).toHaveCount(1)
  const primaId = await pagine.nth(0).getAttribute("data-notebook-page-id")

  await attivaControlloPaginaAccessibile(
    page,
    page.locator("[data-add-notebook-page]"),
    false,
  )
  await expect(pagine).toHaveCount(2)
  const dopoId = await pagine.nth(1).getAttribute("data-notebook-page-id")
  await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")

  await apriGestorePagine(page, false)
  await attivaControlloPaginaAccessibile(
    page,
    page.locator("[data-insert-notebook-page-before]"),
    false,
  )
  await expect(pagine).toHaveCount(3)
  const primaDellaCorrenteId = await pagine.nth(1).getAttribute("data-notebook-page-id")
  expect([primaId, dopoId, primaDellaCorrenteId].every(Boolean)).toBe(true)
  await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")

  const undo = page.locator("[data-notebook-undo]")
  const redo = page.locator("[data-notebook-redo]")
  await expect(undo).toBeEnabled()
  await attivaControlloPaginaAccessibile(page, undo, false)
  await expect(pagine).toHaveCount(2)
  await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", dopoId!)
  await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")

  await attivaControlloPaginaAccessibile(page, undo, false)
  await expect(pagine).toHaveCount(1)
  await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", primaId!)
  await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
  await expect(undo).toBeDisabled()
  await expect(redo).toBeEnabled()

  await attivaControlloPaginaAccessibile(page, redo, false)
  await attivaControlloPaginaAccessibile(page, redo, false)
  await expect(pagine).toHaveCount(3)
  await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", primaId!)
  await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", primaDellaCorrenteId!)
  await expect(pagine.nth(2)).toHaveAttribute("data-notebook-page-id", dopoId!)
  await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")

  await page.reload()
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(pagine).toHaveCount(3)
  await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", primaId!)
  await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", primaDellaCorrenteId!)
  await expect(pagine.nth(2)).toHaveAttribute("data-notebook-page-id", dopoId!)
  await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
})

test.describe("undo/redo touch iPad", () => {
  test.use({
    viewport: { width: 834, height: 1194 },
    deviceScaleFactor: 2,
    hasTouch: true,
  })

  test("taccuino iPad: tap reali annullano e ripristinano la stessa pagina", async ({ page }) => {
    await page.goto("/#lezione-undo-touch-ipad")
    await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
    await apriTaccuino(page)
    await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
      timeout: 15_000,
    })
    expect(await page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0)

    const pagine = page.locator("[data-notebook-page-id]")
    const primaId = await pagine.nth(0).getAttribute("data-notebook-page-id")
    await attivaControlloPagina(page, page.locator("[data-add-notebook-page]"), true)
    await expect(pagine).toHaveCount(2)
    const nuovaId = await pagine.nth(1).getAttribute("data-notebook-page-id")

    await attivaControlloPagina(page, page.locator("[data-notebook-undo]"), true)
    await expect(pagine).toHaveCount(1)
    await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", primaId!)
    await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
    await attivaControlloPagina(page, page.locator("[data-notebook-redo]"), true)
    await expect(pagine).toHaveCount(2)
    await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", nuovaId!)
    await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
  })
})

test("taccuino: migra un manifest v1 una volta e il reload conserva gli stessi byte v2", async ({
  page,
}) => {
  await page.goto("/#lezione-v1-migration")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  const manifestKey = "maestro:notebooks/taccuino-lezione-v1-migration/notebook.json"
  await page.evaluate((key) => {
    const legacy = {
      v: 1,
      kind: "notebook",
      documentId: "taccuino-lezione-v1-migration",
      title: "Taccuino storico",
      createdAt: 1,
      updatedAt: 2,
      pages: [
        { pageId: "legacy-a", ordinal: 0, title: "A storica" },
        { pageId: "legacy-b", ordinal: 1, title: "B storica" },
      ],
    }
    localStorage.setItem(key, btoa(JSON.stringify(legacy)))
  }, manifestKey)

  await apriTaccuino(page)
  const pagine = page.locator("[data-notebook-page-id]")
  await expect(pagine).toHaveCount(2)
  await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", "legacy-a")
  await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
  const migratedBytes = await page.evaluate((key) => localStorage.getItem(key), manifestKey)
  expect(migratedBytes).toBeTruthy()
  const migrated = JSON.parse(atob(migratedBytes!))
  expect(migrated).toMatchObject({
    v: 2,
    revision: 0,
    activePageId: "legacy-a",
    selectedPageIds: ["legacy-a"],
  })
  expect(migrated.pages[0]).toMatchObject({
    orientation: 0,
    logicalSize: { width: 794, height: 1123 },
  })

  await page.reload()
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect.poll(
    () => page.evaluate((key) => localStorage.getItem(key), manifestKey),
    { timeout: 10_000 },
  ).toBe(migratedBytes)
  await expect(pagine).toHaveCount(2)
  await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
})

test("taccuino: una write manifest fallita durante undo non cambia UI o history", async ({
  page,
}) => {
  await page.goto("/#lezione-undo-write-failure")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  const pagine = page.locator("[data-notebook-page-id]")
  await page.locator("[data-add-notebook-page]").click()
  await expect(pagine).toHaveCount(2)
  const idsPrima = await pagine.evaluateAll((buttons) => (
    buttons.map((button) => button.getAttribute("data-notebook-page-id"))
  ))
  const manifestKey = "maestro:notebooks/taccuino-lezione-undo-write-failure/notebook.json"
  const manifestPrima = await page.evaluate((key) => localStorage.getItem(key), manifestKey)
  expect(manifestPrima).toBeTruthy()

  await page.evaluate((keyManifest) => {
    const state = window as unknown as {
      __undoManifestSetItem?: typeof Storage.prototype.setItem
    }
    state.__undoManifestSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === keyManifest) throw new DOMException("undo simulato", "QuotaExceededError")
      state.__undoManifestSetItem!.call(this, key, value)
    }
  }, manifestKey)

  try {
    await page.locator("[data-notebook-undo]").click()
    const statoSalvataggio = page.locator("#notebook-save-status")
    await expect(statoSalvataggio).toHaveAttribute("data-notebook-save-state", "errore")
    await expect(statoSalvataggio).toContainText("Cronologia pagina non riuscita")
    await expect(pagine).toHaveCount(2)
    expect(await pagine.evaluateAll((buttons) => (
      buttons.map((button) => button.getAttribute("data-notebook-page-id"))
    ))).toEqual(idsPrima)
    await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
    await expect(page.locator("[data-notebook-undo]")).toBeEnabled()
    expect(await page.evaluate((key) => localStorage.getItem(key), manifestKey)).toBe(manifestPrima)
  } finally {
    await page.evaluate(() => {
      const state = window as unknown as {
        __undoManifestSetItem?: typeof Storage.prototype.setItem
      }
      if (state.__undoManifestSetItem) {
        Storage.prototype.setItem = state.__undoManifestSetItem
        delete state.__undoManifestSetItem
      }
    })
  }

  await page.locator("[data-notebook-undo]").click()
  await expect(pagine).toHaveCount(1)
  await expect.poll(
    () => page.evaluate((key) => localStorage.getItem(key), manifestKey),
    { timeout: 10_000 },
  ).not.toBe(manifestPrima)

  await page.reload()
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(pagine).toHaveCount(1)
  await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", idsPrima[0]!)
  await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
  await expect(page.locator("[data-notebook-undo]")).toBeDisabled()
  await expect(page.locator("[data-notebook-redo]")).toBeEnabled()
})

for (const profile of INSERT_PROFILES) {
  test.describe(`duplicazione pagina — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: duplica scena e metadati su identita' indipendente dopo reload`, async ({
      page,
    }) => {
      test.setTimeout(90_000)
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-duplicate-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const taccuino = page.locator("[data-notebook-document-id]").first()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      const documentId = await taccuino.getAttribute("data-notebook-document-id")
      if (!documentId) throw new Error("documentId duplicate assente")

      const pagine = page.locator("[data-notebook-page-id]")
      const conteggio = page.locator("[data-notebook-scene-elements]").first()
      const sourceId = await pagine.nth(0).getAttribute("data-notebook-page-id")
      if (!sourceId) throw new Error("source page duplicate assente")
      await disegnaUnTratto(page)
      await expect.poll(async () => {
        const elementiUi = Number(await conteggio.getAttribute("data-notebook-scene-elements"))
        return elementiUi > 0 &&
          await contaElementiCachePagina(page, documentId, sourceId) === elementiUi
      }, { timeout: 10_000 }).toBe(true)
      const elementiSource = await conteggio.getAttribute("data-notebook-scene-elements")
      const byteSource = await leggiByteCachePagina(page, documentId, sourceId)
      expect(byteSource).toBeTruthy()

      await apriGestorePagine(page, profile.hasTouch)
      await attivaControlloPagina(
        page,
        page.locator("[data-duplicate-notebook-page]"),
        profile.hasTouch,
      )
      // Il gestore consegna una pagina nuova in scrittura e si toglie di mezzo:
      // restare aperto metterebbe il pannello sopra la superficie proprio dove
      // serve lo spazio per scrivere.
      await expect(page.locator("[data-notebook-page-manager]")).toHaveCount(0)
      await expect(pagine).toHaveCount(2)
      const duplicateId = await pagine.nth(1).getAttribute("data-notebook-page-id")
      expect(duplicateId).toMatch(/^page-[A-Za-z0-9-]+$/)
      expect(duplicateId).not.toBe(sourceId)
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(pagine.nth(1)).toContainText("Copia di Pagina 1")
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSource!,
        { timeout: 10_000 },
      )
      await expect.poll(
        () => leggiByteCachePagina(page, documentId, duplicateId!),
        { timeout: 10_000 },
      ).toBe(byteSource)

      await disegnaUnTratto(page)
      await expect.poll(async () => {
        const elementiUi = Number(await conteggio.getAttribute("data-notebook-scene-elements"))
        return elementiUi > Number(elementiSource) &&
          await contaElementiCachePagina(page, documentId, duplicateId!) === elementiUi
      }, { timeout: 10_000 }).toBe(true)
      const elementiDuplicate = await conteggio.getAttribute("data-notebook-scene-elements")
      expect(await leggiByteCachePagina(page, documentId, sourceId)).toBe(byteSource)

      await page.reload()
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(pagine).toHaveCount(2)
      await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", duplicateId!)
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiDuplicate!,
        { timeout: 10_000 },
      )

      await attivaControlloPagina(page, pagine.nth(0), profile.hasTouch)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSource!,
        { timeout: 10_000 },
      )
      expect(await leggiByteCachePagina(page, documentId, sourceId)).toBe(byteSource)
      expect(erroriConsole).toEqual([])
    })
  })
}

// PC-R1-001 + GN-A0-011 + GN-A7-012 → PRD §5.1 e §19.2:
// stessa pagina rinominata, cronologia durevole, reload e focus/touch verificati.
for (const profile of INSERT_PROFILES) {
  test.describe(`rinomina pagina — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: rinomina stessa identita' con undo/redo e reload`, async ({
      page,
    }) => {
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-rename-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      const pagine = page.locator("[data-notebook-page-id]")
      const pageId = await pagine.nth(0).getAttribute("data-notebook-page-id")
      expect(pageId).toBe("p1")

      // Rinomina non e' un comando frequente: vive nel gestore (INT-UX-003).
      await apriGestorePagine(page, profile.hasTouch)
      const apriRinomina = page.locator("[data-rename-notebook-page]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, apriRinomina, true)
      } else {
        await attivaControlloPaginaAccessibile(page, apriRinomina, false)
      }
      const input = page.locator("[data-rename-notebook-input]")
      await expect(input).toBeFocused()
      const boxInput = await input.boundingBox()
      if (!boxInput) throw new Error("input rinomina senza bounding box")
      expect(boxInput.width).toBeGreaterThanOrEqual(44)
      expect(boxInput.height).toBeGreaterThanOrEqual(44)
      await input.fill("  Titolo  esperimento  ")

      if (profile.hasTouch) {
        await attivaControlloPagina(
          page,
          page.locator("[data-save-notebook-page-title]"),
          true,
        )
      } else {
        await input.press("Enter")
      }
      await expect(page.locator("[data-rename-notebook-form]")).toHaveCount(0)
      await expect(apriRinomina).toBeFocused()
      await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", pageId!)
      await expect(pagine.nth(0)).toContainText("Titolo  esperimento")
      await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")

      const undo = page.locator("[data-notebook-undo]")
      const redo = page.locator("[data-notebook-redo]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, undo, true)
      } else {
        await attivaControlloPaginaAccessibile(page, undo, false)
      }
      await expect(pagine.nth(0)).toContainText("Pagina 1")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, redo, true)
      } else {
        await attivaControlloPaginaAccessibile(page, redo, false)
      }
      await expect(pagine.nth(0)).toContainText("Titolo  esperimento")

      await page.reload()
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(pagine).toHaveCount(1)
      await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", pageId!)
      await expect(pagine.nth(0)).toContainText("Titolo  esperimento")
      await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")

      // Il gestore è stato di vista: il reload lo chiude. Il titolo rinominato,
      // che è dominio, è invece sopravvissuto — lo si è appena letto nella strip.
      await expect(page.locator("[data-notebook-page-manager]")).toHaveCount(0)
      await apriGestorePagine(page, profile.hasTouch)
      if (profile.hasTouch) {
        await attivaControlloPagina(page, apriRinomina, true)
        await attivaControlloPagina(
          page,
          page.locator("[data-cancel-notebook-page-title]"),
          true,
        )
      } else {
        await attivaControlloPaginaAccessibile(page, apriRinomina, false)
        await attivaControlloPaginaAccessibile(
          page,
          page.locator("[data-cancel-notebook-page-title]"),
          false,
        )
      }
      await expect(page.locator("[data-rename-notebook-form]")).toHaveCount(0)
      await expect(apriRinomina).toBeFocused()

      const aggiungi = page.locator("[data-add-notebook-page]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, aggiungi, true)
      } else {
        await attivaControlloPaginaAccessibile(page, aggiungi, false)
      }
      await expect(pagine).toHaveCount(2)
      // «+ Nuova pagina» consegna una pagina su cui scrivere e chiude il gestore.
      await apriGestorePagine(page, profile.hasTouch)
      if (profile.hasTouch) {
        await attivaControlloPagina(page, apriRinomina, true)
      } else {
        await attivaControlloPaginaAccessibile(page, apriRinomina, false)
      }
      await expect(page.locator("[data-rename-notebook-form]")).toBeVisible()
      if (profile.hasTouch) {
        await attivaControlloPagina(page, undo, true)
      } else {
        await attivaControlloPaginaAccessibile(page, undo, false)
      }
      await expect(pagine).toHaveCount(1)
      await expect(page.locator("[data-rename-notebook-form]")).toHaveCount(0)
      await expect(pagine.nth(0)).toContainText("Titolo  esperimento")
      await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
      expect(erroriConsole).toEqual([])
    })
  })
}

// PC-R1-001 + GN-A1-003 + GN-A7-012 → PRD §4.4 e §19.2:
// conseguenza esplicita, ultima pagina protetta e recupero reale dopo reload.
for (const profile of INSERT_PROFILES) {
  test.describe(`eliminazione recuperabile — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: elimina con conferma e recupera stessa pagina dopo reload`, async ({
      page,
    }) => {
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-delete-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const taccuino = page.locator("[data-notebook-document-id]").first()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      const documentId = await taccuino.getAttribute("data-notebook-document-id")
      expect(documentId).toBeTruthy()
      const pagine = page.locator("[data-notebook-page-id]")
      const elimina = page.locator("[data-delete-notebook-page]")
      // Elimina è distruttivo: sta nel gestore (INT-UX-003). Con una pagina
      // sola resta visibile ma impossibile — non sparisce, così chi impara
      // vede che l'azione esiste e perché ora non si può.
      await apriGestorePagine(page, profile.hasTouch)
      await expect(elimina).toBeDisabled()
      // Chiuso prima di disegnare: il pannello sta sopra la superficie.
      await page.keyboard.press("Escape")
      await expect(page.locator("[data-notebook-page-manager]")).toHaveCount(0)

      if (profile.hasTouch) {
        await attivaControlloPagina(page, page.locator("[data-add-notebook-page]"), true)
      } else {
        await attivaControlloPaginaAccessibile(
          page,
          page.locator("[data-add-notebook-page]"),
          false,
        )
      }
      await expect(pagine).toHaveCount(2)
      const deletedId = await pagine.nth(1).getAttribute("data-notebook-page-id")
      expect(deletedId).toBeTruthy()
      await disegnaUnTratto(page)
      const conteggio = page.locator("[data-notebook-scene-elements]").first()
      await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })
      const deletedElements = await conteggio.getAttribute("data-notebook-scene-elements")
      await expect.poll(() => leggiByteCachePagina(page, documentId!, deletedId!)).not.toBeNull()
      const deletedBytes = await leggiByteCachePagina(page, documentId!, deletedId!)

      await apriGestorePagine(page, profile.hasTouch)
      if (profile.hasTouch) {
        await attivaControlloPagina(page, elimina, true)
      } else {
        await attivaControlloPaginaAccessibile(page, elimina, false)
      }
      const conferma = page.locator("[data-delete-notebook-confirmation]")
      await expect(conferma).toContainText("Pagina 2")
      await expect(conferma).toContainText("Annulla la recupera con tutto il contenuto")
      const mantieni = page.locator("[data-cancel-delete-notebook-page]")
      await expect(mantieni).toBeFocused()
      if (profile.hasTouch) {
        await attivaControlloPagina(
          page,
          mantieni,
          true,
        )
      } else {
        await attivaControlloPaginaAccessibile(
          page,
          mantieni,
          false,
        )
      }
      await expect(conferma).toHaveCount(0)
      await expect(pagine).toHaveCount(2)
      await expect(elimina).toBeFocused()

      if (profile.hasTouch) {
        await attivaControlloPagina(page, elimina, true)
        await attivaControlloPagina(
          page,
          page.locator("[data-confirm-delete-notebook-page]"),
          true,
        )
      } else {
        await attivaControlloPaginaAccessibile(page, elimina, false)
        await attivaControlloPaginaAccessibile(
          page,
          page.locator("[data-confirm-delete-notebook-page]"),
          false,
        )
      }
      await expect(pagine).toHaveCount(1)
      await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-id", "p1")
      await expect(pagine.nth(0)).toHaveAttribute("aria-current", "true")
      // Con una pagina sola Elimina è diventato impossibile: il focus non può
      // restare su un controllo disabilitato e va sulla pagina in scrittura —
      // dentro il gestore, che è la superficie su cui l'utente sta operando,
      // non nella strip da cui non è partito.
      await expect(page.locator('[data-notebook-manager-page="p1"]')).toBeFocused()
      expect(await leggiByteCachePagina(page, documentId!, deletedId!)).toBe(deletedBytes)

      await page.reload()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      await expect(pagine).toHaveCount(1)
      const undo = page.locator("[data-notebook-undo]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, undo, true)
      } else {
        await attivaControlloPaginaAccessibile(page, undo, false)
      }
      await expect(pagine).toHaveCount(2)
      await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", deletedId!)
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        deletedElements!,
        { timeout: 10_000 },
      )

      const redo = page.locator("[data-notebook-redo]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, redo, true)
      } else {
        await attivaControlloPaginaAccessibile(page, redo, false)
      }
      await expect(pagine).toHaveCount(1)
      expect(await contaElementiCachePagina(page, documentId!, deletedId!)).toBe(
        Number(deletedElements),
      )
      await page.reload()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      await expect(pagine).toHaveCount(1)
      expect(erroriConsole).toEqual([])
    })
  })
}

// PC-R1-001 + GN-A1-002 + GN-A7-012 → PRD §5.1 e §19.2:
// selezione persistita, blocco stabile e parita' mouse/tastiera/touch.
for (const profile of INSERT_PROFILES) {
  test.describe(`riordino multiplo — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: sposta selezione non contigua e conserva active/scene al reload`, async ({
      page,
    }) => {
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-reorder-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const taccuino = page.locator("[data-notebook-document-id]").first()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      const documentId = await taccuino.getAttribute("data-notebook-document-id")
      expect(documentId).toBeTruthy()
      const pagine = page.locator("[data-notebook-page-id]")
      const aggiungi = page.locator("[data-add-notebook-page]")
      for (let index = 0; index < 3; index += 1) {
        if (profile.hasTouch) {
          await attivaControlloPagina(page, aggiungi, true)
        } else {
          await aggiungi.click()
        }
        await expect(pagine).toHaveCount(index + 2)
      }
      await expect(pagine).toHaveCount(4)
      const ids = await pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))
      const [p1, p2, p3, p4] = ids
      expect(p1).toBe("p1")
      expect(p2).toBeTruthy()
      expect(p3).toBeTruthy()
      expect(p4).toBeTruthy()

      await disegnaUnTratto(page)
      const conteggio = page.locator("[data-notebook-scene-elements]").first()
      await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })
      const elementiP4 = await conteggio.getAttribute("data-notebook-scene-elements")
      await expect.poll(() => contaElementiCachePagina(page, documentId!, p4!)).toBe(
        Number(elementiP4),
      )
      const byteP4 = await leggiByteCachePagina(page, documentId!, p4!)

      await attivaControlloPagina(page, pagine.nth(1), profile.hasTouch)
      await disegnaUnTratto(page)
      await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })
      const elementiP2 = await conteggio.getAttribute("data-notebook-scene-elements")
      await expect.poll(() => contaElementiCachePagina(page, documentId!, p2!)).toBe(
        Number(elementiP2),
      )
      const byteP2 = await leggiByteCachePagina(page, documentId!, p2!)

      await apriGestorePagine(page, profile.hasTouch)
      const selezioneP2 = page.locator(`[data-toggle-notebook-page-selection="${p2}"]`)
      const selezioneP4 = page.locator(`[data-toggle-notebook-page-selection="${p4}"]`)
      await expect(selezioneP2).toHaveAttribute("aria-pressed", "true")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, selezioneP4, true)
      } else {
        await selezioneP4.click()
      }
      await expect(selezioneP4).toHaveAttribute("aria-pressed", "true")
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")

      const moveDown = page.locator("[data-move-notebook-selection-down]")
      const moveUp = page.locator("[data-move-notebook-selection-up]")
      const moveBox = await moveDown.boundingBox()
      if (!moveBox) throw new Error("controllo riordino senza bounding box")
      expect(moveBox.width).toBeGreaterThanOrEqual(44)
      expect(moveBox.height).toBeGreaterThanOrEqual(44)
      if (profile.hasTouch) {
        await attivaControlloPagina(page, moveDown, true)
      } else {
        await moveDown.click()
      }
      await expect.poll(() => pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))).toEqual([p1, p3, p2, p4])
      await expect(page.locator(`[data-notebook-page-id="${p2}"]`)).toHaveAttribute(
        "aria-current",
        "true",
      )

      const undo = page.locator("[data-notebook-undo]")
      const redo = page.locator("[data-notebook-redo]")
      if (profile.hasTouch) {
        await attivaControlloPagina(page, undo, true)
      } else {
        await undo.click()
      }
      await expect.poll(() => pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))).toEqual([p1, p2, p3, p4])
      if (profile.hasTouch) {
        await attivaControlloPagina(page, redo, true)
      } else {
        await redo.click()
      }
      await expect.poll(() => pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))).toEqual([p1, p3, p2, p4])
      await expect(moveUp).toBeEnabled()
      if (profile.hasTouch) {
        await attivaControlloPagina(page, moveUp, true)
      } else {
        await moveUp.focus()
        await page.keyboard.press("Alt+ArrowUp")
      }
      await expect.poll(() => pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))).toEqual([p1, p2, p4, p3])
      await expect(page.locator(`[data-notebook-page-id="${p2}"]`)).toHaveAttribute(
        "aria-current",
        "true",
      )
      await expect(selezioneP2).toHaveAttribute("aria-pressed", "true")
      await expect(selezioneP4).toHaveAttribute("aria-pressed", "true")
      expect(await leggiByteCachePagina(page, documentId!, p2!)).toBe(byteP2)
      expect(await leggiByteCachePagina(page, documentId!, p4!)).toBe(byteP4)

      await page.reload()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })
      await expect.poll(() => pagine.evaluateAll((elements) => elements.map(
        (element) => element.getAttribute("data-notebook-page-id"),
      ))).toEqual([p1, p2, p4, p3])
      await expect(page.locator(`[data-notebook-page-id="${p2}"]`)).toHaveAttribute(
        "aria-current",
        "true",
      )
      // Il gestore e' stato di vista: dopo il reload e' chiuso. La SELEZIONE,
      // che e' dominio, deve invece essere sopravvissuta — ed e' esattamente
      // cio' che si legge riaprendolo.
      await expect(page.locator("[data-notebook-page-manager]")).toHaveCount(0)
      await apriGestorePagine(page, profile.hasTouch)
      await expect(selezioneP2).toHaveAttribute("aria-pressed", "true")
      await expect(selezioneP4).toHaveAttribute("aria-pressed", "true")
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiP2!,
        { timeout: 10_000 },
      )
      await attivaControlloPagina(
        page,
        page.locator(`[data-notebook-page-id="${p4}"]`),
        profile.hasTouch,
      )
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiP4!,
        { timeout: 10_000 },
      )
      expect(erroriConsole).toEqual([])
    })
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

for (const profile of INSERT_PROFILES) {
  test.describe(`inserimento dopo la pagina corrente — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: identita', ordine e contenuti sopravvivono all'inserimento intermedio e al cold reopen`, async ({
      page,
    }) => {
      test.setTimeout(90_000)
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-insert-after-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })

      const emulazione = await page.evaluate(() => ({
        dpr: window.devicePixelRatio,
        touchPoints: navigator.maxTouchPoints,
      }))
      expect(page.viewportSize()).toEqual(profile.viewport)
      expect(emulazione.dpr).toBe(profile.deviceScaleFactor)
      if (profile.hasTouch) expect(emulazione.touchPoints).toBeGreaterThan(0)

      const conteggio = page.locator("[data-notebook-scene-elements]").first()
      await disegnaUnTratto(page)
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", {
        timeout: 10_000,
      })
      const elementiPrima = await conteggio.getAttribute("data-notebook-scene-elements")

      await attivaControlloPagina(
        page,
        page.locator("[data-add-notebook-page]"),
        profile.hasTouch,
      )
      await expect(page.locator("[data-notebook-page-ordinal]")).toHaveCount(2)
      await disegnaUnTratto(page)
      await disegnaUnTratto(page)
      await expect(conteggio).not.toHaveAttribute(
        "data-notebook-scene-elements",
        elementiPrima!,
        {
          timeout: 10_000,
        },
      )
      const elementiSeconda = await conteggio.getAttribute("data-notebook-scene-elements")
      expect(Number(elementiSeconda)).toBeGreaterThan(Number(elementiPrima))

      const pagine = page.locator("[data-notebook-page-id]")
      await expect(pagine).toHaveCount(2)
      const primaId = await pagine.nth(0).getAttribute("data-notebook-page-id")
      const secondaId = await pagine.nth(1).getAttribute("data-notebook-page-id")
      expect(primaId).toBe("p1")
      expect(secondaId).toMatch(/^page-[A-Za-z0-9-]+$/)

      await attivaControlloPagina(page, pagine.nth(0), profile.hasTouch)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiPrima!,
        { timeout: 10_000 },
      )

      await attivaControlloPagina(
        page,
        page.locator("[data-add-notebook-page]"),
        profile.hasTouch,
      )
      await expect(pagine).toHaveCount(3)
      const idsDopo = await pagine.evaluateAll((buttons) => (
        buttons.map((button) => button.getAttribute("data-notebook-page-id"))
      ))
      expect(idsDopo[0]).toBe(primaId)
      expect(idsDopo[1]).toMatch(/^page-[A-Za-z0-9-]+$/)
      expect(idsDopo[1]).not.toBe(primaId)
      expect(idsDopo[1]).not.toBe(secondaId)
      expect(idsDopo[2]).toBe(secondaId)
      await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-ordinal", "0")
      await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-ordinal", "1")
      await expect(pagine.nth(2)).toHaveAttribute("data-notebook-page-ordinal", "2")
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })

      await attivaControlloPagina(page, pagine.nth(2), profile.hasTouch)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSeconda!,
        { timeout: 10_000 },
      )

      await page.reload()
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(pagine).toHaveCount(3)
      expect(await pagine.evaluateAll((buttons) => (
        buttons.map((button) => button.getAttribute("data-notebook-page-id"))
      ))).toEqual(idsDopo)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSeconda!,
        { timeout: 10_000 },
      )
      await expect(pagine.nth(2)).toHaveAttribute("aria-current", "true")
      await attivaControlloPagina(page, pagine.nth(1), profile.hasTouch)
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })
      await attivaControlloPagina(page, pagine.nth(2), profile.hasTouch)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSeconda!,
        { timeout: 10_000 },
      )
      await attivaControlloPagina(page, pagine.nth(1), profile.hasTouch)
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })

      await expect(page.locator(".st-bar[aria-busy='true']")).toHaveCount(0)
      expect(await page.evaluate(() => (
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      ))).toBe(0)
      expect(erroriConsole).toEqual([])

      const screenshotDir = process.env.ARDESIA_NOTEBOOK_SCREENSHOT_DIR
      if (screenshotDir) {
        await page.screenshot({
          path: `${screenshotDir}/insert-after-${profile.nome}.png`,
          fullPage: true,
        })
      }
    })
  })
}

for (const profile of INSERT_PROFILES) {
  test.describe(`inserimento prima della pagina corrente — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: inserisce prima della centrale e conserva identita' e scene dopo reload completo`, async ({
      page,
    }) => {
      test.setTimeout(120_000)
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-insert-before-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const taccuino = page.locator("[data-notebook-document-id]").first()
      await expect(taccuino).toBeVisible({
        timeout: 15_000,
      })
      const documentId = await taccuino.getAttribute("data-notebook-document-id")
      if (!documentId) throw new Error("documentId assente")

      const emulazione = await page.evaluate(() => ({
        dpr: window.devicePixelRatio,
        touchPoints: navigator.maxTouchPoints,
      }))
      expect(page.viewportSize()).toEqual(profile.viewport)
      expect(emulazione.dpr).toBe(profile.deviceScaleFactor)
      if (profile.hasTouch) expect(emulazione.touchPoints).toBeGreaterThan(0)

      const conteggio = page.locator("[data-notebook-scene-elements]").first()
      const pagine = page.locator("[data-notebook-page-id]")

      await disegnaUnTratto(page)
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", {
        timeout: 10_000,
      })
      await expect.poll(() => contaElementiCachePagina(page, documentId, "p1"), {
        timeout: 10_000,
      }).toBe(1)
      const conteggioPrima = await contaElementiCachePagina(page, documentId, "p1")
      if (conteggioPrima < 0) throw new Error(`cache pagina p1 non valida: ${conteggioPrima}`)
      const elementiPrima = String(conteggioPrima)

      await attivaControlloPagina(
        page,
        page.locator("[data-add-notebook-page]"),
        profile.hasTouch,
      )
      await expect(pagine).toHaveCount(2)
      await disegnaUnTratto(page)
      await disegnaUnTratto(page)
      await expect(conteggio).not.toHaveAttribute(
        "data-notebook-scene-elements",
        elementiPrima!,
        { timeout: 10_000 },
      )
      const pageIdSeconda = await pagine.nth(1).getAttribute("data-notebook-page-id")
      if (!pageIdSeconda) throw new Error("pageId seconda assente")
      await expect.poll(async () => {
        const elementiUi = Number(await conteggio.getAttribute("data-notebook-scene-elements"))
        const elementiCache = await contaElementiCachePagina(page, documentId, pageIdSeconda)
        return elementiUi > Number(elementiPrima) && elementiCache === elementiUi
      }, {
        timeout: 10_000,
      }).toBe(true)
      const elementiSeconda = await conteggio.getAttribute("data-notebook-scene-elements")
      if (!elementiSeconda || Number(elementiSeconda) <= Number(elementiPrima)) {
        throw new Error(`scena pagina seconda non valida: ${elementiSeconda}`)
      }

      await attivaControlloPagina(
        page,
        page.locator("[data-add-notebook-page]"),
        profile.hasTouch,
      )
      await expect(pagine).toHaveCount(3)
      await disegnaUnTratto(page)
      await disegnaUnTratto(page)
      await disegnaUnTratto(page)
      await expect(conteggio).not.toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSeconda!,
        { timeout: 10_000 },
      )
      const pageIdTerza = await pagine.nth(2).getAttribute("data-notebook-page-id")
      if (!pageIdTerza) throw new Error("pageId terza assente")
      await expect.poll(async () => {
        const elementiUi = Number(await conteggio.getAttribute("data-notebook-scene-elements"))
        const elementiCache = await contaElementiCachePagina(page, documentId, pageIdTerza)
        return elementiUi > Number(elementiSeconda) && elementiCache === elementiUi
      }, {
        timeout: 10_000,
      }).toBe(true)
      const elementiTerza = await conteggio.getAttribute("data-notebook-scene-elements")
      if (!elementiTerza || Number(elementiTerza) <= Number(elementiSeconda)) {
        throw new Error(`scena pagina terza non valida: ${elementiTerza}`)
      }

      const idsStorici = await pagine.evaluateAll((buttons) => (
        buttons.map((button) => button.getAttribute("data-notebook-page-id"))
      ))
      expect(idsStorici).toHaveLength(3)
      expect(idsStorici[0]).toBe("p1")
      expect(idsStorici[1]).toMatch(/^page-[A-Za-z0-9-]+$/)
      expect(idsStorici[2]).toMatch(/^page-[A-Za-z0-9-]+$/)

      await attivaControlloPagina(page, pagine.nth(1), profile.hasTouch)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiSeconda!,
        { timeout: 10_000 },
      )
      await apriGestorePagine(page, profile.hasTouch)
      await attivaControlloPaginaAccessibile(
        page,
        page.locator("[data-insert-notebook-page-before]"),
        profile.hasTouch,
      )

      await expect(pagine).toHaveCount(4)
      const idsDopo = await pagine.evaluateAll((buttons) => (
        buttons.map((button) => button.getAttribute("data-notebook-page-id"))
      ))
      expect(idsDopo[0]).toBe(idsStorici[0])
      expect(idsDopo[1]).toMatch(/^page-[A-Za-z0-9-]+$/)
      expect(idsDopo[1]).not.toBe(idsStorici[0])
      expect(idsDopo[1]).not.toBe(idsStorici[1])
      expect(idsDopo[1]).not.toBe(idsStorici[2])
      expect(idsDopo[2]).toBe(idsStorici[1])
      expect(idsDopo[3]).toBe(idsStorici[2])
      await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
      await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "0", {
        timeout: 10_000,
      })

      for (const [indice, elementi] of [
        [0, elementiPrima!],
        [2, elementiSeconda!],
        [3, elementiTerza!],
      ] as const) {
        await attivaControlloPagina(page, pagine.nth(indice), profile.hasTouch)
        await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", elementi, {
          timeout: 10_000,
        })
      }

      await page.reload()
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(pagine).toHaveCount(4)
      expect(await pagine.evaluateAll((buttons) => (
        buttons.map((button) => button.getAttribute("data-notebook-page-id"))
      ))).toEqual(idsDopo)
      await expect(conteggio).toHaveAttribute(
        "data-notebook-scene-elements",
        elementiTerza!,
        { timeout: 10_000 },
      )
      await expect(pagine.nth(3)).toHaveAttribute("aria-current", "true")
      for (const [indice, elementi] of [
        [1, "0"],
        [2, elementiSeconda!],
        [3, elementiTerza!],
      ] as const) {
        await attivaControlloPagina(page, pagine.nth(indice), profile.hasTouch)
        await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", elementi, {
          timeout: 10_000,
        })
      }

      await expect(page.locator(".st-bar[aria-busy='true']")).toHaveCount(0)
      expect(await page.evaluate(() => (
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      ))).toBe(0)
      expect(erroriConsole).toEqual([])

      const screenshotDir = process.env.ARDESIA_NOTEBOOK_SCREENSHOT_DIR
      if (screenshotDir) {
        await page.screenshot({
          path: `${screenshotDir}/insert-before-${profile.nome}.png`,
          fullPage: true,
        })
      }
    })
  })
}

test("taccuino: una write manifest fallita durante Prima conserva ordine, active ID e scena", async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto("/#lezione-insert-before-manifest-failure")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  const taccuino = page.locator("[data-notebook-document-id]").first()
  await expect(taccuino).toBeVisible({ timeout: 15_000 })
  const documentId = await taccuino.getAttribute("data-notebook-document-id")
  if (!documentId) throw new Error("documentId assente")

  const conteggio = page.locator("[data-notebook-scene-elements]").first()
  const pagine = page.locator("[data-notebook-page-id]")
  await disegnaUnTratto(page)
  await page.locator("[data-add-notebook-page]").click()
  await disegnaUnTratto(page)
  await disegnaUnTratto(page)
  await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
    timeout: 10_000,
  })
  const elementiSeconda = await conteggio.getAttribute("data-notebook-scene-elements")
  expect(Number(elementiSeconda)).toBeGreaterThan(1)
  await page.locator("[data-add-notebook-page]").click()
  await disegnaUnTratto(page)
  await disegnaUnTratto(page)
  await disegnaUnTratto(page)
  await pagine.nth(1).click()
  await expect(conteggio).toHaveAttribute(
    "data-notebook-scene-elements",
    elementiSeconda!,
    { timeout: 10_000 },
  )
  await expect(page.locator("[data-notebook-save-state='salvato']")).toBeVisible({
    timeout: 10_000,
  })

  const idsPrima = await pagine.evaluateAll((buttons) => (
    buttons.map((button) => button.getAttribute("data-notebook-page-id"))
  ))
  const activeIdPrima = await pagine.nth(1).getAttribute("data-notebook-page-id")
  const manifestKey = await page.evaluate((id) => {
    const suffix = `notebooks/${id}/notebook.json`
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.endsWith(suffix)) return key
    }
    return null
  }, documentId)
  if (!manifestKey) throw new Error("chiave manifest persistita assente")
  const manifestPrima = await page.evaluate((key) => localStorage.getItem(key), manifestKey)
  expect(manifestPrima).toBeTruthy()

  await page.evaluate((keyManifest) => {
    const stato = window as unknown as {
      __notebookBeforeManifestSetItemOriginal?: typeof Storage.prototype.setItem
    }
    stato.__notebookBeforeManifestSetItemOriginal = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === keyManifest) {
        throw new DOMException("manifest before simulato", "QuotaExceededError")
      }
      stato.__notebookBeforeManifestSetItemOriginal!.call(this, key, value)
    }
  }, manifestKey)

  try {
    await apriGestorePagine(page, false)
    const inserisciPrima = page.locator("[data-insert-notebook-page-before]")
    await expect(inserisciPrima).toBeVisible({ timeout: 5_000 })
    await inserisciPrima.click()
    await expect(pagine).toHaveCount(3)
    expect(await pagine.evaluateAll((buttons) => (
      buttons.map((button) => button.getAttribute("data-notebook-page-id"))
    ))).toEqual(idsPrima)
    await expect(pagine.nth(1)).toHaveAttribute("data-notebook-page-id", activeIdPrima!)
    await expect(pagine.nth(1)).toHaveAttribute("aria-current", "true")
    await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", elementiSeconda!)
    await expect(page.getByRole("alert")).toContainText("Creazione pagina non riuscita")
    await expect(page.locator("[data-notebook-save-state='salvato']")).toHaveCount(0)
    await expect(inserisciPrima).toBeEnabled()
    await expect(page.locator("[data-add-notebook-page]")).toBeEnabled()
    expect(await page.evaluate((key) => localStorage.getItem(key), manifestKey)).toBe(manifestPrima)
  } finally {
    await page.evaluate(() => {
      const stato = window as unknown as {
        __notebookBeforeManifestSetItemOriginal?: typeof Storage.prototype.setItem
      }
      if (stato.__notebookBeforeManifestSetItemOriginal) {
        Storage.prototype.setItem = stato.__notebookBeforeManifestSetItemOriginal
        delete stato.__notebookBeforeManifestSetItemOriginal
      }
    })
  }

  await page.reload()
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(pagine).toHaveCount(3)
  expect(await pagine.evaluateAll((buttons) => (
    buttons.map((button) => button.getAttribute("data-notebook-page-id"))
  ))).toEqual(idsPrima)
  await pagine.nth(1).click()
  await expect(conteggio).toHaveAttribute(
    "data-notebook-scene-elements",
    elementiSeconda!,
    { timeout: 10_000 },
  )
  expect(await page.evaluate((key) => localStorage.getItem(key), manifestKey)).toBe(manifestPrima)
})

test("taccuino: una write fallita del solo manifest non cambia ordine o pagina attiva", async ({
  page,
}) => {
  // Confine intenzionale: questo fault injection osserva il backend attivo
  // localStorage/cache. Non prova la fonte di verita' FSA ne' un bundle export;
  // la slice li vieta e non esiste un E2E Notebook equivalente su FSA.
  await page.goto("/#lezione-manifest-write-failure")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  const taccuino = page.locator("[data-notebook-document-id]").first()
  await expect(taccuino).toBeVisible({ timeout: 15_000 })
  const documentId = await taccuino.getAttribute("data-notebook-document-id")
  if (!documentId) throw new Error("documentId assente")

  await disegnaUnTratto(page)
  const conteggio = page.locator("[data-notebook-scene-elements]").first()
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", {
    timeout: 10_000,
  })
  await expect(page.locator("[data-notebook-save-state='salvato']")).toBeVisible({
    timeout: 10_000,
  })

  const pagine = page.locator("[data-notebook-page-id]")
  await expect(pagine).toHaveCount(1)
  const activeIdPrima = await pagine.first().getAttribute("data-notebook-page-id")
  const manifestKey = await page.evaluate((id) => {
    const suffix = `notebooks/${id}/notebook.json`
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.endsWith(suffix)) return key
    }
    return null
  }, documentId)
  if (!manifestKey) throw new Error("chiave manifest persistita assente")
  const manifestPrima = await page.evaluate((key) => localStorage.getItem(key), manifestKey)
  expect(manifestPrima).toBeTruthy()

  await page.evaluate((keyManifest) => {
    const stato = window as unknown as {
      __notebookManifestSetItemOriginal?: typeof Storage.prototype.setItem
    }
    const originale = Storage.prototype.setItem
    stato.__notebookManifestSetItemOriginal = originale
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === keyManifest) {
        throw new DOMException("manifest simulato", "QuotaExceededError")
      }
      originale.call(this, key, value)
    }
  }, manifestKey)

  try {
    await page.locator("[data-add-notebook-page]").click()
    await expect(pagine).toHaveCount(1)
    await expect(pagine.first()).toHaveAttribute("data-notebook-page-id", activeIdPrima!)
    await expect(pagine.first()).toHaveAttribute("aria-current", "true")
    await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1")
    await expect(page.getByRole("alert")).toContainText("Creazione pagina non riuscita")
    await expect(page.locator("[data-notebook-save-state='salvato']")).toHaveCount(0)
    expect(await page.evaluate((key) => localStorage.getItem(key), manifestKey)).toBe(manifestPrima)
  } finally {
    await page.evaluate(() => {
      const stato = window as unknown as {
        __notebookManifestSetItemOriginal?: typeof Storage.prototype.setItem
      }
      if (stato.__notebookManifestSetItemOriginal) {
        Storage.prototype.setItem = stato.__notebookManifestSetItemOriginal
        delete stato.__notebookManifestSetItemOriginal
      }
    })
  }

  await page.reload()
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(pagine).toHaveCount(1)
  await expect(pagine.first()).toHaveAttribute("data-notebook-page-id", activeIdPrima!)
  await expect(pagine.first()).toHaveAttribute("aria-current", "true")
  await expect(conteggio).toHaveAttribute("data-notebook-scene-elements", "1", {
    timeout: 10_000,
  })
  expect(await page.evaluate((key) => localStorage.getItem(key), manifestKey)).toBe(manifestPrima)
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
  await expect(page.locator("[data-notebook-save-state='errore']")).toHaveAttribute("role", "alert")
  await expect(page.locator("[data-notebook-save-error]")).toHaveText("Riprova il salvataggio")
  await expect(page.locator("[data-notebook-save-error]")).toHaveAttribute(
    "aria-describedby",
    "notebook-save-status",
  )
  await page.locator("[data-add-notebook-page]").click()
  await expect(page.locator("[data-notebook-page-ordinal]")).toHaveCount(1)
})

test("taccuino: un flush richiesto durante una write drena anche la modifica successiva", async ({
  page,
}) => {
  await page.goto("/#lezione-flush-concorrente")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  const taccuino = page.locator("[data-notebook-document-id]").first()
  await expect(taccuino).toBeVisible({ timeout: 15_000 })
  const documentId = await taccuino.getAttribute("data-notebook-document-id")
  if (!documentId) throw new Error("documentId assente")

  await page.evaluate(() => {
    const stato = window as unknown as {
      __arrayBufferOriginale?: typeof Blob.prototype.arrayBuffer
      __setTimeoutOriginale?: typeof window.setTimeout
      __bloccaProssimaWrite?: boolean
      __writeBloccata?: boolean
      __rilasciaWrite?: () => void
    }
    stato.__arrayBufferOriginale = Blob.prototype.arrayBuffer
    stato.__setTimeoutOriginale = window.setTimeout
    stato.__bloccaProssimaWrite = true
    stato.__writeBloccata = false

    Blob.prototype.arrayBuffer = function (): Promise<ArrayBuffer> {
      const originale = stato.__arrayBufferOriginale!
      if (stato.__bloccaProssimaWrite && this.type === "application/json") {
        stato.__bloccaProssimaWrite = false
        stato.__writeBloccata = true
        const leggiBlob = () => originale.call(this)
        return new Promise<ArrayBuffer>((resolve, reject) => {
          stato.__rilasciaWrite = () => {
            void leggiBlob().then(resolve, reject)
          }
        })
      }
      return originale.call(this)
    }

    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (timeout === 400) return 0 as unknown as number
      return stato.__setTimeoutOriginale!(handler, timeout, ...(args as []))
    }) as typeof window.setTimeout
  })

  await disegnaUnTratto(page)
  await expect.poll(
    () => page.evaluate(() => Boolean((window as unknown as { __writeBloccata?: boolean }).__writeBloccata)),
    { timeout: 10_000 },
  ).toBe(true)

  // Il secondo pointer-up chiede un flush mentre il primo e' ancora in volo.
  // Il timer ordinario e' sospeso: soltanto il flush puo' rendere durevole il
  // secondo tratto.
  await disegnaUnTratto(page)
  const elementiVivi = Number(
    await page.locator("[data-notebook-scene-elements]").first().getAttribute(
      "data-notebook-scene-elements",
    ),
  )
  expect(elementiVivi).toBeGreaterThan(1)
  await page.evaluate(() => {
    const stato = window as unknown as {
      __arrayBufferOriginale?: typeof Blob.prototype.arrayBuffer
      __setTimeoutOriginale?: typeof window.setTimeout
      __rilasciaWrite?: () => void
    }
    const rilascia = stato.__rilasciaWrite
    if (!rilascia) throw new Error("write non bloccata")
    rilascia()
    Blob.prototype.arrayBuffer = stato.__arrayBufferOriginale!
    window.setTimeout = stato.__setTimeoutOriginale!
  })

  // La cache localStorage non e' una prova di persistenza: attendo la barriera
  // semantica esposta dalla UI, poi butto via l'intera pagina e verifico la
  // scena riletta dal WorkspaceStore in una riapertura a freddo.
  await expect(page.locator("[data-notebook-save-state='salvato']")).toBeVisible({
    timeout: 2_000,
  })
  await page.reload()
  const riaperto = page.locator("[data-notebook-document-id]").first()
  await expect(riaperto).toBeVisible({
    timeout: 15_000,
  })
  await expect(riaperto).toHaveAttribute("data-notebook-document-id", documentId)
  await expect(page.locator("[data-notebook-scene-elements]").first()).toHaveAttribute(
    "data-notebook-scene-elements",
    String(elementiVivi),
    { timeout: 10_000 },
  )
})

// GN-A0-012 → PRD §5.1/§19.2 — gestore pagine contestuale.
//
// L'oracolo non e' "il pannello si apre": e' che il pannello sia l'UNICA
// superficie di selezione, che dichiari il proprio target prima del commit, che
// non inventi miniature e che non produca overflow orizzontale del documento
// sul viewport iPad, dove il debito misurato era proprio quello.
for (const profile of INSERT_PROFILES) {
  test.describe(`gestore pagine — ${profile.nome}`, () => {
    test.use({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      hasTouch: profile.hasTouch,
    })

    test(`taccuino ${profile.nome}: il gestore e' l'unica superficie di selezione e dichiara il target`, async ({
      page,
    }) => {
      test.setTimeout(90_000)
      const erroriConsole: string[] = []
      page.on("console", (message) => {
        if (message.type() === "error") erroriConsole.push(message.text())
      })
      page.on("pageerror", (error) => erroriConsole.push(`pageerror: ${error.message}`))

      await page.goto(`/#lezione-manager-${profile.nome}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
      await apriTaccuino(page)
      const taccuino = page.locator("[data-notebook-document-id]").first()
      await expect(taccuino).toBeVisible({ timeout: 15_000 })

      const pagine = page.locator("[data-notebook-page-id]")
      const strip = page.locator("[data-notebook-pages-strip]")
      const gestore = page.locator("[data-notebook-page-manager]")

      // Sei pagine: il numero dichiarato da §10 per rendere osservabile
      // l'affollamento della strip.
      for (let i = 0; i < 5; i += 1) {
        await attivaControlloPagina(
          page,
          page.locator("[data-add-notebook-page]"),
          profile.hasTouch,
        )
      }
      await expect(pagine).toHaveCount(6)

      // 1. Il gestore non esiste finche' non lo si apre, e la strip non
      //    conserva nessun controllo di selezione o di comando bulk.
      await expect(gestore).toHaveCount(0)
      expect(await strip.locator("[data-toggle-notebook-page-selection]").count()).toBe(0)
      expect(await strip.locator("[data-move-notebook-selection-up]").count()).toBe(0)
      expect(await strip.locator("[data-move-notebook-selection-down]").count()).toBe(0)
      expect(await strip.locator("[data-rotate-notebook-selection]").count()).toBe(0)
      // INT-UX-003: frequenti e sicuri restano visibili, il resto entra nel
      // gestore. Duplica e «+ Prima» non sono frequenti: sono varianti.
      expect(await strip.locator("[data-duplicate-notebook-page]").count()).toBe(0)
      expect(await strip.locator("[data-insert-notebook-page-before]").count()).toBe(0)
      // ...ma restano immediatamente visibili nella strip i due che lo sono.
      expect(await strip.locator("[data-add-notebook-page]").count()).toBe(1)
      expect(await strip.locator("[data-notebook-undo]").count()).toBe(1)

      // L'oracolo di NOTEBOOK-INFORMATION-ARCHITECTURE-01: la strip non deve
      // eccedere la viewport desktop a sei pagine. Su iPad 834 px le sole
      // pagine superano ancora la larghezza: è un limite dichiarato, non
      // coperto da questa asserzione.
      const misuraStrip = await strip.evaluate((nodo) => ({
        scroll: nodo.scrollWidth,
        client: nodo.clientWidth,
      }))
      if (!profile.hasTouch) {
        expect(misuraStrip.scroll).toBeLessThanOrEqual(misuraStrip.client)
      }

      const apre = page.locator("[data-open-notebook-page-manager]")
      await expect(apre).toHaveAttribute("aria-expanded", "false")
      await apriGestorePagine(page, profile.hasTouch)
      await expect(apre).toHaveAttribute("aria-expanded", "true")
      // Il focus entra nel pannello: senza questo, da tastiera il gestore
      // sarebbe raggiungibile solo ritabulando tutta la strip.
      await expect(page.locator("[data-close-notebook-page-manager]")).toBeFocused()

      // 2. Nessuna miniatura finta: identita' testuale, nessun `img`/`canvas`.
      const righe = gestore.locator("[data-notebook-manager-page]")
      await expect(righe).toHaveCount(6)
      expect(await gestore.locator("img, canvas").count()).toBe(0)

      // 3. Il target si dichiara prima del commit, in ordine di documento.
      const annuncio = page.locator("[data-notebook-manager-announcement]")
      const idPrima = await pagine.nth(0).getAttribute("data-notebook-page-id")
      const idTerza = await pagine.nth(2).getAttribute("data-notebook-page-id")
      if (!idPrima || !idTerza) throw new Error("identita' pagine assenti")
      // La selezione si costruisce dal fondo: se l'ordine di click contasse,
      // l'annuncio nominerebbe la terza pagina prima della prima.
      // Ogni toggle passa dal manifest: si aspetta il suo stato commesso prima
      // del successivo, altrimenti si legge un annuncio di uno stato che il
      // comando non ha ancora scritto.
      const toggleTerza = gestore.locator(`[data-toggle-notebook-page-selection="${idTerza}"]`)
      const togglePrima = gestore.locator(`[data-toggle-notebook-page-selection="${idPrima}"]`)
      await attivaControlloPagina(page, toggleTerza, profile.hasTouch)
      await expect(toggleTerza).toHaveAttribute("aria-pressed", "true")
      await attivaControlloPagina(page, togglePrima, profile.hasTouch)
      await expect(togglePrima).toHaveAttribute("aria-pressed", "true")
      // Il comando disabilita e riabilita il controllo appena usato: il focus
      // non deve cadere sul `body`, o la superficie diventa muta da tastiera
      // subito dopo l'azione dell'utente.
      if (!profile.hasTouch) await expect(togglePrima).toBeFocused()
      const testoAnnuncio = (await annuncio.textContent()) ?? ""
      expect(testoAnnuncio).toContain("3 pagine")
      expect(testoAnnuncio).toMatch(/ordine relativo/i)
      expect(testoAnnuncio.indexOf("Pagina 1")).toBeGreaterThanOrEqual(0)
      expect(testoAnnuncio.indexOf("Pagina 1")).toBeLessThan(testoAnnuncio.indexOf("Pagina 3"))
      // Il nome accessibile del trigger accorda il numero e viene dal modello:
      // scritto inline nel JSX diceva “1 selezionate” e nessun test lo vedeva.
      await expect(apre).toHaveAttribute("aria-label", "Gestisci pagine, 3 selezionate")

      // 4. Ogni controllo del gestore e' un bersaglio tattile reale.
      const misure = await gestore.locator("button").evaluateAll((nodi) => nodi.map((nodo) => {
        const rect = nodo.getBoundingClientRect()
        return { w: rect.width, h: rect.height }
      }))
      expect(misure.length).toBeGreaterThan(0)
      for (const misura of misure) {
        expect(misura.h).toBeGreaterThanOrEqual(44)
        expect(misura.w).toBeGreaterThanOrEqual(44)
      }

      // 5. Il pannello non produce scroll orizzontale del documento: era il
      //    difetto misurato sulla strip su iPad.
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1)

      // 6. Chiusura e ritorno del focus a chi lo aveva aperto.
      if (profile.hasTouch) {
        await attivaControlloPagina(
          page,
          page.locator("[data-close-notebook-page-manager]"),
          true,
        )
      } else {
        await page.keyboard.press("Escape")
      }
      await expect(gestore).toHaveCount(0)
      await expect(apre).toHaveAttribute("aria-expanded", "false")
      await expect(apre).toBeFocused()

      // 7. La selezione e' dominio: sopravvive alla chiusura del gestore e al
      //    reload, che invece azzera solo lo stato di vista.
      await expect(pagine.nth(0)).toHaveAttribute("data-notebook-page-selected", "true")
      await expect(pagine.nth(2)).toHaveAttribute("data-notebook-page-selected", "true")
      await page.reload()
      await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(gestore).toHaveCount(0)
      await apriGestorePagine(page, profile.hasTouch)
      await expect(
        gestore.locator(`[data-toggle-notebook-page-selection="${idPrima}"]`),
      ).toHaveAttribute("aria-pressed", "true")
      await expect(
        gestore.locator(`[data-toggle-notebook-page-selection="${idTerza}"]`),
      ).toHaveAttribute("aria-pressed", "true")

      expect(erroriConsole).toEqual([])
    })
  })
}
