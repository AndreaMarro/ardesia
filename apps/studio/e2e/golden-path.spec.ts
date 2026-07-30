// L'OBIETTIVO del progetto, scritto come comando con un exit code.
//
//   Un docente apre una lezione, la chiude, la ritrova in Continuita', la
//   esporta e la reimporta in Materiali, riapre a freddo e riprende — senza
//   conoscere un solo UUID o SHA.
//
//   VERIFICA:  cd apps/studio && npx playwright test e2e/golden-path.spec.ts
//   exit 0 = raggiunto.
//
// Nessun numero di test verdi lo sostituisce: finche' questo file non esce 0,
// l'obiettivo non e' raggiunto.
//
// Due cose deliberate:
//
// 1. **Ogni passo porta un'etichetta.** Quando fallisce, il messaggio deve dire
//    QUALE anello della catena si e' rotto, non «un assert e' fallito». Una
//    catena di sette passi che riporta un fallimento anonimo costa piu' tempo
//    di quanto ne faccia risparmiare.
// 2. **Il passo 4 e' l'unico che parla dell'utente e non del sistema.** Gli
//    altri sei verificano che i dati sopravvivano; quello verifica che il
//    docente non debba leggere un identificatore tecnico. Era rosso quando
//    questo file e' stato scritto (`ContinuityView.tsx:173` rendeva il
//    `sessionId` come testo del link) ed e' la ragione per cui la spec e'
//    stata scritta PRIMA della correzione.
import { test, expect, type Page } from "@playwright/test"

/** UUID, o SHA esadecimale lungo. Cio' che un docente non deve mai leggere. */
const UUID_O_SHA = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\b[0-9a-f]{32,}\b/i

/**
 * Il testo VISIBILE non deve contenere identificatori tecnici.
 *
 * `innerText` e non `textContent`: il secondo include il testo di elementi
 * nascosti, e un identificatore in un nodo `display:none` non e' qualcosa che
 * il docente legge. Gli attributi (`href`, `data-*`, `title`) restano fuori di
 * proposito: sono per le macchine.
 */
async function testoVisibile(page: Page): Promise<string> {
  return page.evaluate(() => document.body.innerText)
}

// Il tetto globale di `playwright.config.ts` e' 30 s, scritto per uno spec che
// fa una cosa sola. Questo ne fa SETTE, e il solo passo 7 contiene due attese
// da 20 s ciascuna (righe 129 e 147): il budget residuo dipende da quanto e'
// carica la macchina, non da cosa fa il prodotto.
//
// Misurato il 2026-07-30: nella suite intera a 4 worker questo test moriva a
// 30 s al passo 7, mentre da solo usciva 0 sei volte di fila — «verde in
// isolamento» e' esattamente la sonda che risponde a un'altra domanda.
//
// ⚠️ Il control run NON ha riprodotto il fallimento: con quattro sonde in
// timeout reintrodotte (suite a 1,3 min) il golden path passa lo stesso, ma la
// condizione originale erano SETTE spec falliti e 2,6 min. La riproduzione
// copre circa meta' della contesa, quindi non conferma ne' smentisce.
// Il budget esplicito toglie la domanda di mezzo: se questo test fallira',
// fallira' per il prodotto e non per il carico della macchina.
//
// 60 s, non 120. La prima versione metteva 120 s e il revisore ha fatto notare
// che un rallentamento reale di 4x sarebbe passato in silenzio: un budget cosi'
// largo non e' un budget, e' l'assenza di un budget. Il revisore citava un
// «oracolo ratificato sotto i 60 s»: cercato nel vault, NON esiste — l'unico
// riscontro e' «giorni 31-60» in un piano, che parla d'altro. Il numero qui
// e' quindi MISURATO, non citato: questo spec da solo impiega 8,7 s, e la
// suite intera a 4 worker sta in 33-35 s. 60 s lascia sette volte il margine
// osservato e vieta comunque il raddoppio.
test.setTimeout(60_000)

test("golden path: lezione → chiusura → Continuità → export → import → riapertura a freddo → ripresa", async ({
  page,
}, testInfo) => {
  const errori: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") errori.push(m.text())
  })
  page.on("pageerror", (e) => errori.push(`pageerror: ${e.message}`))

  // Stanza deterministica per worker: `Room.getRoomId()` ne assegnerebbe una
  // casuale, e un test che dipende da `Math.random()` non e' riproducibile.
  const stanza = `golden-path-w${testInfo.workerIndex}-r${testInfo.retry}`

  // --- 1. il docente apre una lezione ------------------------------------
  await test.step("1. apre la lezione", async () => {
    await page.goto(`/#${stanza}`)
    await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 20_000 })
    expect(new URL(page.url()).hash).toBe(`#${stanza}`)
  })

  // --- 2. fa qualcosa, e quel qualcosa deve sopravvivere -----------------
  const marcatore = `golden-path-${testInfo.workerIndex}-${testInfo.retry}`
  await test.step("2. lascia una traccia nella lezione", async () => {
    await expect
      .poll(
        () => page.evaluate(() => Boolean((window as never as { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready)),
        { timeout: 20_000 },
      )
      .toBe(true)
    await page.evaluate((m) => {
      const harness = (window as never as { __MAESTRO_TEST__?: { recorder?: { recordMathInsert(x: string): void } } }).__MAESTRO_TEST__
      if (!harness?.recorder) throw new Error("harness della Room non pronto")
      harness.recorder.recordMathInsert(m)
    }, marcatore)
  })

  // --- 3. chiude, e la ritrova in Continuita' ----------------------------
  await test.step("3. chiude e la ritrova in Continuità", async () => {
    await page.locator('[data-view-nav-item="continuita"]').click()
    const superficie = page.getByTestId("continuity-surface")
    await expect(superficie).toBeVisible({ timeout: 20_000 })
    // Lo stato conta: `no-sessions` e `storage-unavailable` sono entrambi
    // "la pagina si e' montata", e nessuno dei due e' "l'ha ritrovata".
    await expect(superficie).toHaveAttribute("data-state", "sessions")
    expect(new URL(page.url()).hash).toBe(`#${stanza}`)
  })

  // --- 4. senza conoscere un solo UUID o SHA -----------------------------
  await test.step("4. non le chiede di leggere un UUID", async () => {
    const visibile = await testoVisibile(page)
    const trovato = visibile.match(UUID_O_SHA)
    expect(
      trovato,
      `Continuità mostra un identificatore tecnico come testo visibile: ${trovato?.[0]}`,
    ).toBeNull()
  })

  // --- 5. riprende la sessione -------------------------------------------
  await test.step("5. riprende la sessione", async () => {
    await page.getByTestId("continuity-session").first().click()

    // `[data-next-action]` da solo NON e' evidenza di ripresa riuscita, e la
    // revisione avversariale l'ha misurato: `ContinuityResumeCard.tsx:184` lo
    // rende anche nello stato `scope-invalid`, con
    // `data-next-action="reopen-lesson"`. Un assert sulla sua sola presenza
    // sarebbe verde anche su una card d'errore.
    const card = page.locator("[data-continuity-phase]")
    await expect(card).toBeVisible({ timeout: 20_000 })
    await expect
      .poll(() => card.getAttribute("data-continuity-phase"), { timeout: 20_000 })
      .not.toBe("loading")

    const fase = await card.getAttribute("data-continuity-phase")
    expect(
      ["scope-invalid", "corrupt", "missing-evidence"],
      `la ripresa e' finita in uno stato d'errore: ${fase}`,
    ).not.toContain(fase)
    await expect(page.locator("[data-continuity-scope-code]")).toHaveCount(0)

    // e deve riguardare LA lezione che si sta guardando, non un'altra
    await expect(page.locator("[data-continuity-lesson]")).toHaveText(stanza)
    await expect(page.locator("[data-next-action]").first()).toBeVisible()
  })

  // --- 6. esporta una copia ----------------------------------------------
  const scaricato = await test.step("6. esporta una copia", async () => {
    await page.goto(`/?vista=lezioni-salvate#${stanza}`)
    await expect(page.getByText("Materiali locali")).toBeVisible({ timeout: 20_000 })
    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: "Esporta .lesson" }).click()
    const file = await download
    expect(file.suggestedFilename()).toBe(`lezione-${stanza}.lesson`)
    const percorso = await file.path()
    expect(percorso, "l'export non ha prodotto un file su disco").not.toBeNull()
    return percorso as string
  })

  // --- 7. riapre a freddo, reimporta, riprende ---------------------------
  await test.step("7. riapre a freddo e reimporta", async () => {
    // Contesto nuovo: un `reload()` conserverebbe la memoria del processo, e
    // "a freddo" verrebbe verificato su una macchina gia' calda.
    const contesto = await page.context().browser()!.newContext()
    const freddo = await contesto.newPage()
    try {
      await freddo.goto(`/?vista=lezioni-salvate#${stanza}`)
      await expect(freddo.getByText("Materiali locali")).toBeVisible({ timeout: 20_000 })
      await freddo.getByLabel("Seleziona bundle .lesson").setInputFiles(scaricato)
      await expect(freddo.getByRole("heading", { name: "Anteprima import" })).toBeVisible({
        timeout: 20_000,
      })
      await freddo.getByRole("button", { name: "Importa il bundle" }).click()
      await expect(freddo.getByRole("status")).toBeVisible({ timeout: 20_000 })

      await freddo.goto(`/#${stanza}`)
      await expect(freddo.locator(".excalidraw").first()).toBeVisible({ timeout: 20_000 })

      // La ripresa va osservata nella UI, non solo nello storage. La revisione
      // avversariale l'ha detto con precisione: leggere il journal tramite
      // `__MAESTRO_TEST__` sarebbe verde anche con l'idratazione della scena
      // rotta e il docente davanti a una lavagna vuota. Quindi si torna in
      // Continuita' NEL CONTESTO FREDDO e si pretende che la lezione sia di
      // nuovo ritrovabile e riprendibile.
      await freddo.locator('[data-view-nav-item="continuita"]').click()
      const superficieFredda = freddo.getByTestId("continuity-surface")
      await expect(superficieFredda).toBeVisible({ timeout: 20_000 })
      await expect(superficieFredda).toHaveAttribute("data-state", "sessions")
      await freddo.getByTestId("continuity-session").first().click()
      const cardFredda = freddo.locator("[data-continuity-phase]")
      await expect(cardFredda).toBeVisible({ timeout: 20_000 })
      await expect
        .poll(() => cardFredda.getAttribute("data-continuity-phase"), { timeout: 20_000 })
        .not.toBe("loading")
      await expect(freddo.locator("[data-continuity-scope-code]")).toHaveCount(0)
      await expect(freddo.locator("[data-continuity-lesson]")).toHaveText(stanza)

      // ...e SOLO ORA anche la prova sullo storage: la traccia del passo 2.
      await freddo.goto(`/#${stanza}`)
      await expect(freddo.locator(".excalidraw").first()).toBeVisible({ timeout: 20_000 })
      await expect
        .poll(
          () =>
            freddo.evaluate(async (m) => {
              const h = (window as never as {
                __MAESTRO_TEST__?: { store?: { read(p: string): Promise<Blob | null> }; PATHS?: { JOURNAL: string } }
              }).__MAESTRO_TEST__
              if (!h?.store || !h?.PATHS) return false
              const j = await h.store.read(h.PATHS.JOURNAL)
              return j ? (await j.text()).includes(m) : false
            }, marcatore),
          { timeout: 20_000 },
        )
        .toBe(true)
    } finally {
      await contesto.close()
    }
  })

  expect(errori, "errori di console durante il golden path").toEqual([])
})
