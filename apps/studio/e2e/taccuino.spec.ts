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
