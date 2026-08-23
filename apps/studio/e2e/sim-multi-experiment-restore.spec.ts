// Regressione — board SALVATA con esperimenti sim DISTINTI (v1-cap6-esp1/esp2/
// esp3) ripristinata su RELOAD: i 3 embed montano in UN solo render pass. Lock
// dell'invariante "nessun warning React setState-in-render" (in particolare
// «Cannot update during an existing state transition»), che i test a inserimento
// sequenziale (sim-multi-instance) non coprono perché ogni insert è un commit
// separato. Il pass sequenziale NON esercita il mount simultaneo del restore.
//
// La fixture (e2e/fixtures/sim-multi-experiment-board.json) sono 3 embed reali
// prodotti dalle factory create{Reference,V1Cap6Esp2,V1Cap6Esp3}SimulationScene
// + createToolEmbedElement (impilati vicino all'origine → in viewport al
// restore). Per rigenerarla: un vitest node-env che importa quelle factory e
// scrive il JSON (le factory importano fixture .json, servono i transform vite/
// vitest — non gira sotto node liscio). Iniettata via updateScene, persistita,
// poi ripristinata al reload — la condizione della board salvata reale.
import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const board = JSON.parse(
  readFileSync(fileURLToPath(new URL("./fixtures/sim-multi-experiment-board.json", import.meta.url)), "utf8"),
) as unknown[]

const RENDER_PHASE_SETSTATE =
  /existing state transition|while rendering a different component|update during render|update a component .* while rendering/i

test("board multi-esperimento ripristinata (reload) NON emette warning setState-in-render", async ({ page }) => {
  // L'oracolo NON e' la regex. `RENDER_PHASE_SETSTATE` serve solo a ETICHETTARE
  // il messaggio quando fallisce: se React cambiasse la formulazione del warning,
  // un gate basato sul testo diventerebbe cieco IN SILENZIO — falso verde. Qui il
  // gate e' «zero errori di console durante il restore», che e' strettamente piu'
  // forte e non dipende da come React scrive le sue frasi.
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    pageErrors.push(error.message)
  })
  const etichetta = (righe: string[]) =>
    righe
      .map((riga) => (RENDER_PHASE_SETSTATE.test(riga) ? `[setState-in-render] ${riga}` : riga))
      .join("\n")

  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  // Semina la board salvata: 3 embed distinti in un solo updateScene.
  await page.evaluate((elements) => {
    const harness = (window as unknown as Record<string, unknown>).__MAESTRO_TEST__ as
      | { apiRef?: { current?: { updateScene(s: { elements: unknown[] }): void } | null } }
      | undefined
    const api = harness?.apiRef?.current
    if (!api) throw new Error("apiRef non disponibile per seed board")
    api.updateScene({ elements })
  }, board)
  await expect(page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')).toHaveCount(board.length, {
    timeout: 15_000,
  })

  // Attendi che il persist (debounce 700ms) scriva i link su localStorage, così
  // il reload è un VERO restore da store.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          let count = 0
          for (const k of Object.keys(localStorage)) {
            const v = localStorage.getItem(k) ?? ""
            count = Math.max(count, (v.match(/maestro-tool:\/\//g) ?? []).length)
          }
          return count
        }),
      { timeout: 8_000 },
    )
    .toBeGreaterThanOrEqual(board.length)

  // RELOAD: ripristino simultaneo dei 3 embed = condizione della board salvata.
  await page.reload()
  await expect(page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')).toHaveCount(board.length, {
    timeout: 20_000,
  })
  // I 3 canvas core ELABTutor devono essere montati davvero (svg presente).
  await expect(page.locator("[data-elab-core-canvas-host] svg")).toHaveCount(board.length, { timeout: 20_000 })
  // Margine per warning emessi in commit post-mount.
  await page.waitForTimeout(1_500)

  expect(consoleErrors, `errori di console durante il restore:\n${etichetta(consoleErrors)}`).toEqual([])
  expect(pageErrors, `pageerror durante il restore:\n${etichetta(pageErrors)}`).toEqual([])
})
