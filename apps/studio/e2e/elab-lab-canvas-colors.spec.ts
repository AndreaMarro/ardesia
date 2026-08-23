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

// Le scene che un docente può davvero aprire. La prima versione di questa spec
// guardava solo esp6: il revisore avversariale ha mostrato con una sonda che un
// token usato solo dal NanoR4 di v3-cap6-esp5 poteva rompersi lasciandola
// verde. Una sonda su una scena su otto risponde a una domanda più piccola di
// quella che dichiara.
//
// LA LISTA SI IMPORTA, NON SI COPIA — e il perché è misurato (2026-08-23).
// Qui c'era una copia letterale di otto id. Resa visibile una NONA scena nella
// fonte di verità (`VISIBLE_EXP_IDS`), questa spec continuava a eseguire 10
// test invece di 11: restava verde su una domanda più piccola di quella che
// dichiara, e nessun comando lo diceva. Con l'import il divario non è
// riparabile — è impossibile.
//
// L'import è relativo e non usa l'alias `@elab-tutor-plugin/...`: quell'alias
// lo risolve vite per l'app, non il runner di Playwright, che compila questo
// file per conto suo.
import { VISIBLE_EXP_IDS } from "../../../plugins/elab-tutor/src/data/experiment-visibility.js"

const SCENE_VISIBILI = VISIBLE_EXP_IDS

// LO STATO DEL SOLVE, FISSATO COM'E' OGGI — e non e' una promessa, e' un
// segnalibro. Misurato il 2026-08-23 su tutte e otto le scene visibili:
// QUATTRO su otto escono `solve=error` e non mostrano al docente NESSUN
// verdetto elettrico (`data-led-count`, `data-led-on`, `data-led-burned` non
// sono emessi affatto), mentre diagnostica e citazione ci sono.
//
// Nessuno dei dodici journey del cancello se ne accorgeva: questa spec itera su
// tutte e otto ma guardava solo la risoluzione dei token, e le altre usano solo
// esp2 ed esp6 — due delle quattro che stanno bene.
//
// ⚠️ NON e' dichiarato che sia un DIFETTO. Un solver MNA in continua puo'
// legittimamente non risolvere un transitorio (carica/scarica di un
// condensatore, v2-cap7-esp1/2); per «due LED che si alternano» e il semaforo
// (v3-cap6-esp4/5) la ragione non e' stata cercata. E' un GATE-ANDREA.
//
// Cio' che questa mappa fa e' impedire che la situazione cambi in silenzio, in
// entrambi i versi: il giorno in cui una di quelle quattro si risolvera', o in
// cui una delle quattro sane smettera' di farlo, questa spec diventera' rossa e
// qualcuno dovra' aggiornare la riga scrivendo perche'. E' la stessa forma che
// F5-1 aveva usato per non dimenticare la lampada RGB spenta.
const SOLVE_ATTESO: Record<string, "ok" | "error"> = {
  "v1-cap6-esp1": "ok",
  "v1-cap6-esp2": "ok",
  "v1-cap6-esp3": "ok",
  "v1-cap9-esp6": "ok",
  "v2-cap7-esp1": "error",
  "v2-cap7-esp2": "error",
  "v3-cap6-esp4": "error",
  "v3-cap6-esp5": "error",
}

for (const esperimento of SCENE_VISIBILI) {
  test(`ELAB Lab ${esperimento}: ogni token del disegno si risolve al valore che il suo nome dichiara`, async ({
    page,
  }) => {
    await page.goto(`/?vista=elab-lab&esperimento=${esperimento}`)
    await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
    await expect(page.locator("[data-elab-canvas] svg")).toHaveCount(1)
    // CONTARE NON E' VEDERE, ed e' misurato (2026-08-23): con una regola
    // `[data-elab-canvas] { display: none }` il disegno resta NEL DOM e questa
    // spec — quella nata perche' il circuito era GRAFICA MORTA in produzione —
    // usciva 0 su tutte e otto le scene. Un token si risolve benissimo anche
    // dentro un sottoalbero che nessuno vede.
    await expect(page.locator("[data-elab-canvas] svg")).toBeVisible()

    // Il verdetto del motore, fissato scena per scena (vedi SOLVE_ATTESO).
    const atteso = SOLVE_ATTESO[esperimento]
    if (atteso !== undefined) {
      await expect(page.locator("[data-elab-lab-solve]")).toHaveAttribute(
        "data-elab-lab-solve",
        atteso,
      )
      if (atteso === "error") {
        // La RAGIONE, non solo l'esito. Misurato il 2026-08-23: il motore e'
        // fail-closed sui tipi non catalogati (`elabSolver.ts:220`), e il
        // catalogo elettrico ne registra SETTE — breadboard-half, battery9v,
        // resistor, led, wire, potentiometer, rgb-led. Le quattro scene che non
        // risolvono contengono `capacitor` (v2-cap7-esp1/2) o `nano-r4`
        // (v3-cap6-esp4/5).
        //
        // Il docente NON resta in silenzio: vede un alert visibile che dice
        // perche'. Fissare la ragione oltre all'esito serve a due cose — che
        // l'alert resti VISTO, e che se un giorno la causa cambiasse (un tipo
        // catalogato, un altro errore) qualcuno debba scrivere perche'.
        const alert = page.locator("[data-elab-lab-solve] [role=alert]")
        await expect(alert).toBeVisible()
        await expect(alert).toContainText("tipo componente non catalogato")
      }
    }

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
  await expect(page.locator("[data-type='rgb-led']")).toBeVisible()

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
