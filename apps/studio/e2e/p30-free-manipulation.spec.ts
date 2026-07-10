// P30 free-manipulation trace v0 (TDD). Prova end-to-end la catena Tinkercad-like:
//   monta Simulation Plugin → palette+add (montaggio libero) → solve (badge
//   corrente reale) → break (open-circuit) → diagnostica + simulation.error.observed
//   → save/reopen con sceneDigest topologico identico.
//
// COSA PROVA / COSA NO (onestà di copertura):
// - PROVA in modo AFFIDABILE la LOGICA: React onClick → mutazione reale della
//   scena → esito reale del solver (deriveSimulationSolveOutcome) → evento
//   LessonOS → digest topologico → persistenza attraverso reopen. I click sui
//   controlli embedded usano `dispatchEvent` (→ onClick) per evitare la
//   flakiness del routing pointer di Excalidraw.
// - La RAGGIUNGIBILITÀ a puntatore reale della free-mode strip (`data-sim-break`)
//   È ORA verificata da un hit-test topmost (`assertPointerReachable`:
//   `elementFromPoint` sul centro del controllo → dev'essere visibile, abilitato
//   e non coperto da un overlay/canvas). NON esegue un click via mouse raw: il
//   routing pointer di Excalidraw resta flaky, e l'attivazione a doppio-click
//   dell'embed è già coperta da `montaggio-canvas.spec.ts` (palette + fori via
//   mouse raw). Il click di LOGICA sui controlli embedded resta `dispatchEvent`
//   (→ onClick), etichettato come tale.
// NON dichiara Tinkercad parity completa: è la trace v0, con contratto DOM stabile.
import { test, expect, type Locator, type Page } from "@playwright/test"
import { mkdir, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const REFERENCE_SIM_TOOL_ID = "io.ardesia.simulation"
const P30_LOCK_DIR = join(tmpdir(), "ardesia-p30-free-manipulation.lock")
const P30_LOCK_STALE_MS = 180_000

type BrowserAuditEntry = {
  method?: unknown
  outcome?: unknown
  [key: string]: unknown
}

// This scenario is a long, stateful Excalidraw + simulator + reload trace.
// Playwright still schedules repeat-each cases across workers, so guard this
// file with a cross-worker lock: the gate measures product behavior, not local
// CPU contention across multiple canvas-heavy browsers.
async function acquireP30TraceLock(label: string) {
  const startedAt = Date.now()
  while (true) {
    try {
      await mkdir(P30_LOCK_DIR)
      await writeFile(join(P30_LOCK_DIR, "owner"), `${process.pid} ${label}\n`)
      return
    } catch (error) {
      if ((error as { code?: string }).code !== "EEXIST") throw error
      try {
        const info = await stat(P30_LOCK_DIR)
        if (Date.now() - info.mtimeMs > P30_LOCK_STALE_MS) {
          await rm(P30_LOCK_DIR, { recursive: true, force: true })
          continue
        }
      } catch {
        // The lock disappeared between mkdir/stat; retry.
        continue
      }
      if (Date.now() - startedAt > P30_LOCK_STALE_MS) {
        throw new Error("timeout waiting for p30 free-manipulation e2e lock")
      }
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
}

test.beforeEach(async ({}, testInfo) => {
  testInfo.setTimeout(120_000)
  await acquireP30TraceLock(`${testInfo.title} repeat=${testInfo.repeatEachIndex}`)
})

test.afterEach(async () => {
  await rm(P30_LOCK_DIR, { recursive: true, force: true })
})

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))
  return errors
}

async function waitAppReady(page: Page) {
  // Attendi l'app-ready reale prima di interagire (stesso gate di
  // plugin-postit-room-reload): interagire prima che l'app sia pronta rende gli
  // embed Excalidraw "visibili ma non stabili" → boundingBox/click in timeout.
  await page.waitForFunction(
    () =>
      (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready ===
      true,
    undefined,
    { timeout: 15_000 },
  )
}

async function openRoom(page: Page, room: string) {
  // Room isolata per test: Room.tsx legge location.hash, non `?room=`.
  // Usare `/#${room}` rende l'isolamento reale e il reload conserva la stessa room.
  await page.goto(`/#${room}`)
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await waitAppReady(page)
}

async function readBrowserAuditEntries(page: Page, toolId: string): Promise<BrowserAuditEntry[]> {
  return page.evaluate((id) => {
    const raw = localStorage.getItem(`maestro:tools/${id}/audit.jsonl`)
    if (raw === null) return []
    const bytes = Uint8Array.from(atob(raw), (char) => char.charCodeAt(0))
    const text = new TextDecoder().decode(bytes)
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line)) as BrowserAuditEntry[]
  }, toolId)
}

function boardWriteOkEntries(entries: BrowserAuditEntry[]): BrowserAuditEntry[] {
  return entries.filter((entry) => entry.method === "board.write" && entry.outcome === "ok")
}

function auditEntryKey(entry: BrowserAuditEntry): string {
  return JSON.stringify(entry)
}

async function expectBoardWriteAuditIncrease(
  page: Page,
  baselineCount: number,
): Promise<BrowserAuditEntry[]> {
  let observed: BrowserAuditEntry[] = []
  await expect
    .poll(
      async () => {
        observed = boardWriteOkEntries(await readBrowserAuditEntries(page, REFERENCE_SIM_TOOL_ID))
        return observed.length
      },
      { timeout: 5_000 },
    )
    .toBeGreaterThan(baselineCount)
  return observed
}

async function expectBoardWriteAuditSnapshot(page: Page, expected: BrowserAuditEntry[]) {
  const expectedKeys = expected.map(auditEntryKey)
  await expect
    .poll(
      async () => {
        const currentKeys = boardWriteOkEntries(
          await readBrowserAuditEntries(page, REFERENCE_SIM_TOOL_ID),
        ).map(auditEntryKey)
        return expectedKeys.every((key) => currentKeys.includes(key))
      },
      { timeout: 5_000 },
    )
    .toBe(true)
}

async function insertSimulationPlugin(page: Page, room: string) {
  await openRoom(page, room)
  await domClick(page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" }))
  await expect(
    page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]').first(),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('[data-elab-core-canvas-mounted="true"]').first()).toBeVisible({
    timeout: 15_000,
  })
}

/** Click "diretto" su un controllo embedded: dispatcha un evento click sul nodo
 *  (→ React onClick), bypassando il routing pointer di Excalidraw e ogni overlay.
 *  Niente attivazione/hit-testing su coordinate: robusto e veloce, niente flake. */
async function domClick(target: Locator) {
  await expect(target).toBeVisible({ timeout: 15_000 })
  await target.dispatchEvent("click")
}

/** Attiva l'embed Excalidraw con un doppio click a puntatore REALE. L'embeddable è
 *  inerte (il canvas Excalidraw sta sopra e intercetta i pointer) finché non viene
 *  attivato — stesso modello di `montaggio-canvas.spec.ts` (l'unico gesto raw che
 *  Excalidraw richiede). Solo dopo l'attivazione i controlli embedded ricevono i
 *  pointer reali; senza attivazione `elementFromPoint` ritorna il CANVAS (atteso). */
async function activateEmbed(page: Page, anchor: Locator) {
  await expect(anchor).toBeVisible({ timeout: 15_000 })
  await anchor.scrollIntoViewIfNeeded()
  const box = await anchor.boundingBox()
  expect(box, "l'ancora dell'embed deve avere un box misurabile").not.toBeNull()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height / 2)
}

/** Raggiungibilità a puntatore REALE (senza click flaky): il controllo dev'essere
 *  visibile, abilitato e TOPMOST al proprio centro. `document.elementFromPoint`
 *  ritorna l'elemento più in alto a quelle coordinate viewport; se un overlay o il
 *  canvas Excalidraw coprisse il controllo (embed non attivato, o regressione di
 *  z-order/overlay), ritornerebbe altro → il test fallisce. Nessun click/hover →
 *  deterministico, niente flake. Chiude il follow-up di reachability in
 *  docs/ops/P31-PR150-HARDENING-NEXT.md. */
async function assertPointerReachable(target: Locator) {
  await expect(target).toBeVisible({ timeout: 15_000 })
  await expect(target).toBeEnabled()
  await target.scrollIntoViewIfNeeded()
  const box = await target.boundingBox()
  expect(box, "il controllo deve avere un box misurabile").not.toBeNull()
  const hit = await target.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const top = document.elementFromPoint(cx, cy)
    return {
      hitSelf: !!top && (el === top || el.contains(top)),
      topTag: top ? top.tagName : null,
    }
  })
  expect(
    hit.hitSelf,
    `puntatore reale colpisce ${hit.topTag ?? "null"}, atteso il controllo stesso`,
  ).toBe(true)
}

/** Apre il pannello legacy `<details>` in modo deterministico (l'embed Excalidraw
 *  intercetta i pointer reali; qui apriamo lo stato nativo del details). */
async function openLegacyDetails(page: Page) {
  const summary = page.getByText("Montaggio libero legacy").first()
  await expect(summary).toBeVisible({ timeout: 15_000 })
  await summary.evaluate((el) => {
    const details = el.closest("details")
    if (details) (details as HTMLDetailsElement).open = true
  })
}

// P31 hardening (era test.fixme in P30): affidabile dopo (1) fix unhandled
// rejection dell'event-log IndexedDB (serializzazione append + Promise.all in
// indexedDbEventLog.ts) e (2) stabilità e2e (room isolata + app-ready +
// stableBox per l'attivazione dell'embed Excalidraw).
test("P30 free manipulation trace: palette → add → solve → break → diagnostic → save/reopen", async ({
  page,
}, testInfo) => {
  // The route is intentionally end-to-end and reloads Excalidraw + the
  // embedded simulator. Parallel repeat-each runs can exceed 60s on a loaded
  // local runner, while selector/assertion timeouts below remain tight.
  testInfo.setTimeout(120_000)
  const consoleErrors = collectErrors(page)
  const room = `p30-free-${testInfo.parallelIndex}-${testInfo.repeatEachIndex}`
  await insertSimulationPlugin(page, room)

  const freeMode = page.locator("[data-simulation-free-mode]").first()
  await expect(freeMode).toBeVisible({ timeout: 15_000 })

  // 1) SOLVE: la scena montata (First LED) è risolta con corrente reale > 0.
  await expect(freeMode).toHaveAttribute("data-sim-solve-kind", "solved")
  const solvedCurrent = Number(await freeMode.getAttribute("data-sim-current-ma"))
  expect(solvedCurrent).toBeGreaterThan(0)
  await expect(freeMode).toHaveAttribute("data-sim-last-event-kind", "simulation.circuit.solved")

  // 2) PALETTE + ADD: montaggio libero legacy — seleziona la resistenza dalla
  //    palette e piazzala su due fori liberi (add component reale).
  await openLegacyDetails(page)
  const legacyStage = page.locator('[data-experiment-id="v1-cap6-esp1"]').first()
  await expect(legacyStage).toBeVisible({ timeout: 15_000 })
  const paletteResistenza = page.getByRole("button", { name: "palette Resistenza" })
  await domClick(paletteResistenza)
  await expect(paletteResistenza).toHaveAttribute("aria-pressed", "true")

  await legacyStage.locator('[data-bb-hole="bb1:c3"]').dispatchEvent("click")
  await legacyStage.locator('[data-bb-hole="bb1:c4"]').dispatchEvent("click")
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )

  // 3) SAVE anchor: cattura il digest topologico del circuito montato/risolto.
  const solvedDigest = await freeMode.getAttribute("data-sim-scene-digest")
  expect(solvedDigest).toMatch(/^[0-9a-f]{8}$/)

  // 4) BREAK → OPEN CIRCUIT: rompi i collegamenti; la fisica reale osserva
  //    l'errore e lo proietta come simulation.error.observed. Click diretto sul
  //    bottone embedded (dispatch → React onClick), niente dipendenza da overlay.
  const breakButton = freeMode.locator("[data-sim-break]")
  const boardWriteAuditBeforeBreak = boardWriteOkEntries(
    await readBrowserAuditEntries(page, REFERENCE_SIM_TOOL_ID),
  ).length
  // Reachability a puntatore reale: prima ATTIVA l'embed (doppio click raw, come
  // montaggio-canvas), poi verifica che il break sia TOPMOST (elementFromPoint).
  // Un overlay/regressione che coprisse la strip anche da attivata farebbe fallire
  // QUI, prima del click di logica. Il click di LOGICA resta dispatchEvent (onClick).
  await activateEmbed(page, freeMode)
  await assertPointerReachable(breakButton)
  await domClick(breakButton)
  await expect(freeMode).toHaveAttribute("data-sim-solve-kind", "error")
  await expect(freeMode).toHaveAttribute(
    "data-sim-last-event-kind",
    "simulation.error.observed",
  )
  await expect(freeMode).toHaveAttribute("data-sim-error-id", /open-circuit/)
  await expect(freeMode.locator("[data-sim-diagnostic]")).toBeVisible()
  const boardWriteAuditAfterBreak = await expectBoardWriteAuditIncrease(
    page,
    boardWriteAuditBeforeBreak,
  )

  // Il break cambia la topologia → il digest deve cambiare.
  const brokenDigest = await freeMode.getAttribute("data-sim-scene-digest")
  expect(brokenDigest).toMatch(/^[0-9a-f]{8}$/)
  expect(brokenDigest).not.toBe(solvedDigest)

  // 5) SAVE/REOPEN: la persistenza della lavagna è un autosave con debounce
  //    700ms (Room.tsx). Attendi il flush PRIMA di ricaricare, altrimenti
  //    l'embed inserito non è ancora salvato. Poi l'embed si riapre con lo
  //    stato persistito e lo STESSO digest topologico (open-circuit preservato).
  await page.waitForTimeout(1200)
  await page.reload() // conserva #room → riapre la stessa lavagna persistita
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await waitAppReady(page)
  await expect(page.locator('[data-elab-core-canvas-mounted="true"]').first()).toBeVisible({
    timeout: 15_000,
  })
  const reopened = page.locator("[data-simulation-free-mode]").first()
  await expect(reopened).toBeVisible({ timeout: 15_000 })
  await expect(reopened).toHaveAttribute("data-sim-scene-digest", brokenDigest!)
  await expect(reopened).toHaveAttribute("data-sim-solve-kind", "error")
  await expectBoardWriteAuditSnapshot(page, boardWriteAuditAfterBreak)
  // La componente piazzata dalla palette deve sopravvivere al reopen: il digest
  // include boardScene (placements), quindi l'uguaglianza sopra già lo prova,
  // ma lo asseriamo esplicitamente per non nascondere una perdita di placement.
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )

  expect(consoleErrors).toEqual([])
})
