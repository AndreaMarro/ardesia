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

// Le OTTO scene che un docente può davvero aprire (VISIBLE_EXP_IDS). La prima
// versione di questa spec guardava solo esp6: il revisore avversariale ha
// mostrato con una sonda che un token usato solo dal NanoR4 di v3-cap6-esp5
// poteva rompersi lasciandola verde. Una sonda su una scena su otto risponde
// a una domanda più piccola di quella che dichiara.
const SCENE_VISIBILI = [
  "v1-cap6-esp1",
  "v1-cap6-esp2",
  "v1-cap6-esp3",
  "v1-cap9-esp6",
  "v2-cap7-esp1",
  "v2-cap7-esp2",
  "v3-cap6-esp4",
  "v3-cap6-esp5",
] as const

for (const esperimento of SCENE_VISIBILI) {
  test(`ELAB Lab ${esperimento}: ogni token del disegno si risolve al valore che il suo nome dichiara`, async ({
    page,
  }) => {
    await page.goto(`/?vista=elab-lab&esperimento=${esperimento}`)
    await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
    await expect(page.locator("[data-elab-canvas] svg")).toHaveCount(1)

    // L'ORACOLO. La prima versione faceva due cose deboli: cercava i token non
    // definiti, e poi contava gli elementi neri ESCLUDENDO a mano quattro nomi
    // che dicono «scuro». Il revisore ha mostrato che bastava mutare
    // `--elab-hex-1a1a1a` in `#000000` per rompere dodici fill lasciandola
    // verde: l'esclusione per nome perdona proprio i casi che dovrebbe pesare.
    //
    // Questi token portano il valore NEL NOME (`--elab-hex-bdbdbd` = #bdbdbd),
    // quindi il nome è l'atteso e non serve nessuna lista: si pretende
    // l'uguaglianza. Un token non definito e un token definito male falliscono
    // entrambi, per lo stesso assert.
    const problemi = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement)
      const visti = new Map<string, string>()
      for (const element of document.querySelectorAll("[data-elab-canvas] *")) {
        for (const attribute of ["fill", "stroke"] as const) {
          const raw = element.getAttribute(attribute)
          if (raw === null) continue
          for (const uso of raw.matchAll(/var\((--[a-z0-9-]+)\)/gi)) {
            const nome = uso[1]
            if (!visti.has(nome)) visti.set(nome, rootStyle.getPropertyValue(nome).trim())
          }
        }
      }
      const rotti: string[] = []
      for (const [nome, valore] of visti) {
        if (valore === "") {
          rotti.push(`${nome}: NON DEFINITO`)
          continue
        }
        const hex = nome.match(/^--elab-hex-([0-9a-f]{6})$/i)
        if (hex === null) continue // token semantico: il nome non dichiara un valore
        if (valore.toLowerCase() !== `#${hex[1].toLowerCase()}`) {
          rotti.push(`${nome}: vale ${valore}, il nome dice #${hex[1]}`)
        }
      }
      return { tokenUsati: visti.size, rotti: rotti.sort() }
    })

    // L'oracolo non deve poter essere vuoto: zero token usati sarebbe verde
    // per assenza di materia, non per correttezza.
    expect(problemi.tokenUsati, "nessun token trovato: la scena non ha disegnato").toBeGreaterThan(5)
    expect(problemi.rotti, problemi.rotti.join(" · ")).toEqual([])
  })
}

test("ELAB Lab: i token dello studio non vengono sovrascritti dal plugin", async ({ page }) => {
  await page.goto("/?vista=elab-lab&esperimento=v1-cap9-esp6")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-type='rgb-led']")).toHaveCount(1)

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

// Il finding del revisore avversariale su questa stessa PR, trasformato in
// gate. La prima riparazione importava `design-system.css` INTERO, che contiene
// due regole davvero globali (`:focus-visible`, `:focus:not(:focus-visible)`).
// Sonda A/B: sulla rotta senza canvas il link «Continuità» passava da outline
// del browser a outline navy ELAB rgb(30, 77, 140) più la shadow ELAB.
//
// La rotta scelta è quella con un id INESISTENTE, di proposito: `ElabLab`
// importa `renderEmbeddable` staticamente, quindi il CSS del plugin arriva
// anche quando il canvas non viene montato affatto. È il caso peggiore, ed è
// quello che il test deve tenere.
test("il foglio del plugin non arreda la shell dello studio, nemmeno senza canvas", async ({
  page,
}) => {
  await page.goto("/?vista=elab-lab&esperimento=v9-inesistente-esp0")
  await expect(page.locator("[data-elab-lab-state=no-experiment]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-elab-canvas]"), "precondizione: nessun canvas").toHaveCount(0)

  // COSA QUESTO TEST ASSERISCE E COSA NO, detto per intero.
  //
  // I token del plugin RESTANO dichiarati a `:root`: è la forma normale di un
  // design system, e `design-tokens.css` è condiviso con l'app elab-tutor che
  // li vuole lì. Scoparli al canvas richiederebbe una seconda copia dei 732
  // token, cioè la duplicazione che il flywheel esiste per togliere.
  //
  // Il danno MISURATO non veniva dai token: veniva dalle due REGOLE globali,
  // ed è quello che questo test tiene. Il rischio residuo — una futura CSS
  // dello studio che legge un nome dichiarato anche dal plugin — non si vede
  // in un browser: è una domanda sui NOMI, e ha il suo controllo meccanico in
  // `src/__tests__/PluginTokenNamespace.test.ts`.
  //
  // La prova che conta qui: l'anello di focus della shell non è quello del
  // plugin.
  const nav = page.locator("[data-view-nav-item=continuita]")
  await expect(nav).toBeVisible()
  await nav.focus()
  const focusStyle = await nav.evaluate((element) => {
    const style = getComputedStyle(element)
    return { outlineColor: style.outlineColor, boxShadow: style.boxShadow }
  })
  expect(focusStyle.outlineColor, "outline navy ELAB sulla shell").not.toBe("rgb(30, 77, 140)")
  expect(focusStyle.boxShadow).not.toContain("rgba(30, 77, 140")
})
