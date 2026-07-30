// F5-7 — il disegno del circuito era GRAFICA MORTA in produzione.
//
// Misurato sulla produzione viva il 2026-07-31, rotta ELAB Lab esp6:
//     45 custom property distinte usate in `fill`/`stroke`, TUTTE non definite
//     ~1700 elementi coinvolti  ·  40 <rect> su 52 con fill computato nero
//
// I nomi contengono il valore — `--elab-hex-bdbdbd`, `--elab-hex-ffffff` — cioè
// qualcuno ha sostituito gli hex letterali con `var(...)` senza che il foglio
// che li definisce arrivasse mai all'host. Un `var()` irrisolto rende la
// proprietà invalida: `fill` cade sul valore iniziale, che è NERO.
//
// Il foglio esiste: plugins/elab-tutor/src/styles/design-system.css, 748
// variabili. `renderEmbeddable.jsx` importava React e il canvas, e nessun CSS:
// il plugin portava il disegno e non i suoi token.
//
// PERCHE' QUESTA SPEC E' E2E E NON UN UNIT TEST. jsdom non applica i fogli di
// stile importati dai moduli: `getComputedStyle(...).fill` lì non distingue un
// token risolto da uno rotto. Un unit test su questo difetto sarebbe verde per
// costruzione — la forma di falso verde che questo loop esiste per cacciare.
import { test, expect } from "@playwright/test"

test("ELAB Lab: i token del canvas si risolvono, e quelli dello studio non vengono sovrascritti", async ({
  page,
}) => {
  await page.goto("/?vista=elab-lab&esperimento=v1-cap9-esp6")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)

  // 1. Nessuna custom property usata dal disegno resta non definita.
  const unresolved = await page.evaluate(() => {
    const names = new Set<string>()
    for (const element of document.querySelectorAll("[data-elab-canvas] *")) {
      for (const attribute of ["fill", "stroke"] as const) {
        const raw = element.getAttribute(attribute)
        const match = raw?.match(/var\((--[a-z0-9-]+)\)/i)
        if (match === null || match === undefined) continue
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(match[1])
          .trim()
        if (value === "") names.add(match[1])
      }
    }
    return [...names].sort()
  })
  expect(unresolved, `custom property non definite usate dal disegno: ${unresolved.join(", ")}`).toEqual([])

  // 2. E il disegno smette di essere nero: si contano gli elementi che
  //    DICHIARANO un colore via var() e lo ottengono davvero.
  const blackDespiteVar = await page.evaluate(() => {
    let broken = 0
    for (const element of document.querySelectorAll("[data-elab-canvas] *")) {
      const raw = element.getAttribute("fill")
      if (raw === null || !raw.includes("var(")) continue
      // Un token che dichiara esso stesso il nero e' legittimo: si guardano
      // solo quelli il cui NOME dice un colore diverso.
      if (/--elab-hex-(000000|0e0e0e|050505|1a1a1a)/.test(raw)) continue
      if (getComputedStyle(element).fill === "rgb(0, 0, 0)") broken += 1
    }
    return broken
  })
  expect(blackDespiteVar, "elementi che dichiarano un colore via var() e restano neri").toBe(0)

  // 3. IL FOGLIO DEL PLUGIN NON DEVE SPOSTARE I TOKEN DELLO STUDIO.
  //
  //    Confronto dei NOMI: 2 collisioni su 748 (`--color-primary`,
  //    `--color-primary-light`). Confronto dei SELETTORI: zero. Lo studio non
  //    li dichiara a `:root` e non li usa mai — li dichiara SOLO dentro
  //    `.excalidraw`, come ponte verso il foglio di Excalidraw. Le custom
  //    property si ereditano dall'antenato piu' VICINO, quindi `.excalidraw`
  //    vince su `html` a prescindere dall'ordine nel bundle.
  //
  //    La prima misura confrontava i nomi ignorando il selettore: rispondeva a
  //    un'altra domanda. E' registrata qui perche' l'errore vale piu' del
  //    risultato.
  //
  //    Cio' che resta da difendere e' quindi l'insieme dei token che lo studio
  //    dichiara DAVVERO a `:root`: nessuno deve cambiare per l'arrivo del
  //    foglio del plugin.
  const studioTokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    return {
      accent: root.getPropertyValue("--m-accent").trim(),
      fontUi: root.getPropertyValue("--m-font-ui").trim(),
    }
  })
  expect(studioTokens.accent, "lo studio ha perso il proprio accento").not.toBe("")
  expect(studioTokens.accent).not.toBe("#1E4D8C") // navy ELAB: non deve arrivare qui
  expect(studioTokens.fontUi, "lo studio ha perso il proprio font").not.toBe("")

  await page.screenshot({ path: "test-results/elab-lab-canvas-colors.png", fullPage: false })
})
