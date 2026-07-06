// P0-C — Characterization del bypass srcDoc del Tool Lab (guardiano ADR-0001).
//
// Prova falsificabile, in browser REALE, che la superficie iframe del Tool Lab
// (`src/design/ToolLab.tsx:23,142` — sandbox "allow-scripts allow-same-origin"
// + srcDoc) lascia a codice che gira NEL frame del tool l'accesso al DOM dello
// Studio (`window.parent.document`). La firma ed25519 autentica il pacchetto
// (`installer.ts:145-149`) ma NON vincola il runtime dell'entry
// (`manifest.ts:60-64`: `entry` è solo un path, nessun hash) né la partizione
// browser: il confine reale oggi è solo il galateo capability + sandbox.
//
// STRUTTURA (auto-validante, una sola variabile isolata):
//   1. CONTROL  — stesso srcDoc, sandbox "allow-scripts" (NIENTE same-origin):
//                 la lettura del DOM parent DEVE fallire (opaque origin). È
//                 l'end-state che l'enforcement ADR-0001 deve ottenere.
//   2. ISOLATION — stesso srcDoc, sandbox "allow-scripts allow-same-origin":
//                 la lettura RIESCE. Prova che l'unico responsabile è il token
//                 `allow-same-origin`.
//   3. FINDING  — superficie Tool Lab REALE: `frame.evaluate` (che gira nella
//                 stessa realm JS dell'entry del tool) legge il title vivo del
//                 parent. Oggi PASSA = bypass. DOPO l'enforcement ADR-0001 (frame
//                 opaco, niente allow-same-origin sull'origin Studio) il frame è
//                 cross-origin e l'evaluate LANCIA → questo test FALLISCE: è il
//                 flip atteso, il segnale che l'enforcement ha chiuso il buco.
//
// jsdom non vale: non implementa la semantica sandbox/same-origin del browser.
import { test, expect } from "@playwright/test"

// srcDoc-sonda: tenta la lettura del DOM parent e la rimanda via postMessage
// (consentito anche cross-origin). Stringa unica riusata dai due arm iniettati
// per isolare il SOLO token di sandbox come variabile.
const PROBE_SRCDOC =
  "<!doctype html><meta charset=utf-8><script>(function(){" +
  "var r;try{r='READ:'+window.parent.document.title;}" +
  "catch(e){r='BLOCKED:'+((e&&e.name)||'Error');}" +
  "parent.postMessage({__srcdocProbe:r},'*');})();<\/script>"

/** Inietta un iframe srcDoc con il sandbox dato nel parent reale e ne raccoglie l'esito. */
async function probeInjectedFrame(page: import("@playwright/test").Page, sandbox: string): Promise<string> {
  return page.evaluate(
    ({ sandboxAttr, srcdoc }) =>
      new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("probe: nessun postMessage entro 5s")), 5000)
        const onMsg = (event: MessageEvent) => {
          const data = event.data as { __srcdocProbe?: unknown } | null
          if (data && typeof data.__srcdocProbe === "string") {
            clearTimeout(timer)
            window.removeEventListener("message", onMsg)
            resolve(data.__srcdocProbe)
          }
        }
        window.addEventListener("message", onMsg)
        const iframe = document.createElement("iframe")
        iframe.setAttribute("sandbox", sandboxAttr)
        iframe.srcdoc = srcdoc
        iframe.style.display = "none"
        document.body.appendChild(iframe)
      }),
    { sandboxAttr: sandbox, srcdoc: PROBE_SRCDOC },
  )
}

test("CONTROL: srcDoc con solo allow-scripts NON legge il DOM dello Studio (end-state ADR-0001)", async ({
  page,
}) => {
  await page.goto("/")
  const marker = `ardesia-bypass-marker-control`
  await page.evaluate((title) => {
    document.title = title
  }, marker)

  // NIENTE allow-same-origin → il frame ha origin opaca → window.parent.document lancia.
  const result = await probeInjectedFrame(page, "allow-scripts")
  expect(result).toMatch(/^BLOCKED:/)
  expect(result).not.toContain(marker)
})

test("ISOLATION: aggiungere allow-same-origin allo STESSO srcDoc sblocca la lettura del DOM parent", async ({
  page,
}) => {
  await page.goto("/")
  const marker = `ardesia-bypass-marker-isolation`
  await page.evaluate((title) => {
    document.title = title
  }, marker)

  // Unica differenza rispetto al CONTROL: il token allow-same-origin.
  const result = await probeInjectedFrame(page, "allow-scripts allow-same-origin")
  expect(result).toBe(`READ:${marker}`)
})

test("FINDING: la superficie Tool Lab REALE espone il DOM dello Studio al frame del tool (guard ADR-0001)", async ({
  page,
}) => {
  await page.goto("/?vista=tool-lab")

  // Il tool firmato Reference monta attraverso la pipeline reale (firma/lifecycle/kill-switch).
  await expect(page.locator("[data-tool-lab-state=mounted-gate-passed]")).toBeVisible({
    timeout: 20_000,
  })
  const frameEl = page.locator("iframe.reference-tool-frame")
  await expect(frameEl).toBeVisible({ timeout: 20_000 })

  // Marca il DOM parent con un valore vivo, così l'uguaglianza prova lettura reale (non coincidenza).
  const marker = `ardesia-bypass-marker-toollab-${Date.now()}`
  await page.evaluate((title) => {
    document.title = title
  }, marker)

  // frame.evaluate gira nella STESSA realm dell'entry del tool: ciò che legge la
  // sonda lo può leggere l'entry. Oggi il frame è same-origin ⇒ lettura riuscita.
  const handle = await frameEl.elementHandle()
  expect(handle).not.toBeNull()
  const frame = await handle!.contentFrame()
  expect(frame).not.toBeNull()
  const parentTitleFromTool = await frame!.evaluate(() => (window.parent as Window).document.title)

  // BYPASS: il frame del tool legge il title vivo dello Studio.
  // POST ADR-0001: frame opaco ⇒ l'evaluate sopra LANCIA ⇒ questo test fallisce (flip atteso).
  expect(parentTitleFromTool).toBe(marker)
})
