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

  // ⚠️ QUESTO ASSERT PUNTA A UN DIFETTO, NON A UNA SPECIFICA.
  //
  // La prima versione di questa spec asseriva soltanto che
  // `[data-led-current-ma]` fosse VISIBILE, e passava. Il revisore avversariale
  // ha chiesto cosa contenesse: misurato sulla rotta ELAB Lab per esp6,
  //     data-led-on = "0"        (la lampada NON si accende)
  //     corrente     = "—"       (nessun valore)
  //     [data-rgb-channels]      ASSENTE
  //     [aria-label='LED RGB acceso']  ASSENTE
  // mentre la spec RIMOSSA, sulla lavagna, asseriva il LED acceso e i canali in
  // mA reali. Scrivere che «la copertura si conserva» era falso: si conserva il
  // MONTAGGIO, non il COMPORTAMENTO.
  //
  // Fissare qui lo stato corrente non lo approva: lo rende impossibile da
  // dimenticare. Il giorno in cui la lampada si accendera', questo assert
  // diventera' rosso e costringera' a tornare qui — che e' esattamente il
  // segnale che serve. L'unita' aperta e' F3-7.
  await expect(page.locator("[data-led-on]")).toHaveAttribute("data-led-on", "0")
  await expect(page.locator("[data-led-current-ma]")).toHaveText("—")

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
