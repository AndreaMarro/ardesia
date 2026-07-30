// v1-cap9-esp6 "Lampada RGB con 3 potenziometri" — 3 potenziometri (3 pin) +
// LED RGB (4 pin) resi dal Simulation Plugin, canali dal motore MNA reale.
//
// PERCHE' QUESTA SPEC E' CAMBIATA (2026-07-30).
//
// La versione precedente apriva la lavagna e cliccava il bottone di toolbar
// "Inserisci esperimento lampada RGB con 3 potenziometri sulla lavagna". Quel
// bottone NON ESISTE PIU': il commit e7ebc42f del 2026-07-20 ("constrain
// founder beta lesson surface") ha ritirato i bottoni per-esperimento e li ha
// sostituiti con l'allowlist chiusa della Founder Beta. Lo stesso commit ha
// aggiornato `product-flow-shell.spec.ts` — che infatti asserisce l'ASSENZA di
// "sim esp2/esp3/esp6" dalle azioni di lezione — e ha lasciato indietro questa.
//
// Per dieci giorni la spec ha atteso trenta secondi un bottone rimosso apposta,
// ed e' stata contata fra "i test di prodotto che falliscono". Non misurava un
// prodotto rotto: misurava un prodotto che non c'e' piu'.
//
// La rotta superstite e' ELAB Lab (`?vista=elab-lab&esperimento=…`), la stessa
// che `sim-esp2-senza-resistore.spec.ts` usa e supera. `v1-cap9-esp6` e' nella
// whitelist visibile (`VISIBLE_EXP_IDS`, 8 esperimenti su 94), quindi la scena
// e' raggiungibile e la copertura si CONSERVA invece di sparire con la spec.
//
// Cio' che questa spec NON asserisce piu', e va detto: che l'esperimento
// compaia come post-it SULLA LAVAGNA. Quella capacita' e' stata ritirata, e
// asserirla sarebbe chiedere al prodotto di essere quello di dieci giorni fa.
//
// AGGIORNATA 2026-07-31 (F5-1): il COMPORTAMENTO — lampada accesa, canali in
// mA dal motore — e' tornato su questa rotta, quindi la spec lo asserisce
// invece di fissare lo stato rotto. Vedi il blocco piu' sotto.
import { test, expect } from "@playwright/test"

async function collectConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`)
  })
  return errors
}

test("ELAB Lab esp6: 3 potenziometri, LED RGB montato, solve reale del motore", async ({
  page,
}) => {
  const consoleErrors = await collectConsoleErrors(page)

  await page.goto("/?vista=elab-lab&esperimento=v1-cap9-esp6")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })

  // Il picker ha caricato PROPRIO questo esperimento: senza, tutto il resto
  // potrebbe descrivere una scena qualsiasi.
  const select = page.locator("select[data-elab-experiment-select]")
  await expect(select).toHaveValue("v1-cap9-esp6")

  // Multi-pin: tre potenziometri distinti, non "almeno uno".
  await expect(page.locator("[aria-label^='Potenziometro']")).toHaveCount(3)

  // Il LED RGB e' un componente a 4 pin del catalogo elettrico, non un disegno.
  await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)

  // Il solve viene dal motore reale via registry, non da valori pre-dichiarati.
  await expect(page.locator("[data-elab-lab-solve=ok]")).toBeVisible({ timeout: 15_000 })

  // F5-1 CHIUSA (2026-07-31). L'assert qui sotto era il suo opposto:
  //     data-led-on = "0"  ·  corrente "—"  ·  [data-rgb-channels] ASSENTE
  // fissato deliberatamente per non dimenticare il difetto, con la nota «il
  // giorno in cui la lampada si accendera' questo diventera' rosso». E' quel
  // giorno.
  //
  // La causa non era elettrica: misurato firsthand, il motore restituiva
  // gia' `componentStates.rgb1.on = true` sui tre canali. La vista leggeva
  // `componentStates.led1`, un id che per questo esperimento NON ESISTE, e
  // `led1?.on === true` vale false tanto per «spento» quanto per «assente».
  // Ora l'id del componente luminoso si legge dall'esperimento.
  await expect(page.locator("[data-led-on]")).toHaveAttribute("data-led-on", "1")
  // Il LED RGB non ha una corrente unica nel motore: ha tre canali. La cifra
  // mostrata e' brightness x 30 (inversione di CircuitSolver._solveRGBLed),
  // dalla stessa porta che alimenta la diagnostica del post-it sulla lavagna.
  await expect(page.locator("[data-rgb-channels]")).toBeVisible()
  await expect(page.locator("[data-rgb-channels]")).toHaveText(/R \d+\.\d mA · G \d+\.\d mA · B \d+\.\d mA/)
  // Il pannello non mostra piu' la corrente singola quando il componente e' RGB.
  await expect(page.locator("[data-led-current-ma]")).toHaveCount(0)

  // Citazione reale dal Pack: la scena e' legata al libro, non inventata.
  await expect(page.locator("[data-elab-lab-citation]")).toBeVisible()

  // Evidenza visiva desktop / tablet / mobile.
  await page.screenshot({ path: "test-results/esp6-elab-lab-desktop.png", fullPage: false })
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)
  await page.screenshot({ path: "test-results/esp6-elab-lab-tablet.png", fullPage: false })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)
  await page.screenshot({ path: "test-results/esp6-elab-lab-mobile.png", fullPage: false })

  expect(consoleErrors).toEqual([])
})
