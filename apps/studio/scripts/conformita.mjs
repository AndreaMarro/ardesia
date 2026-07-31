// `conformita` — quante delle 13 affermazioni del capitolato UI passano oggi.
//
// PERCHE' ESISTE. Il loop misurava `delta_visibile`: quante righe cambiano su una
// superficie che un docente vede. Ha curato il difetto per cui si lavorava venti
// giorni senza cambiamento percepibile, ma misura **che qualcosa cambi**, non
// **che assomigli a quello che e' stato chiesto**. Con `delta_visibile` verde ci
// si puo' allontanare dalla specifica a ogni ciclo.
//
// Le affermazioni sono derivate dalle 46 immagini dell'atlante di Andrea, lette
// una per una da quattro lettori read-only il 2026-07-31, e stanno in
// `ARDESIA-KNOWLEDGE/10-Requirements/CAPITOLATO-UI-FALSIFICABILE-2026-07-31.md`.
//
// ⚠️ SI PREVEDE CHE LA MAGGIOR PARTE FALLISCA. E' il loro scopo: la prima
// esecuzione stabilisce una BASELINE, non un verdetto sul lavoro fatto. Un
// numero basso qui non e' una bocciatura, e' la distanza misurata.
//
// ⚠️ TRE AFFERMAZIONI SONO DEVIAZIONI DICHIARATE DALLE IMMAGINI, non copie:
// la 10 (>=16 px), la 11 (>=44 px) e la 12 (<=8 regioni) FALLISCONO ANCHE
// SULL'ATLANTE. Tre misure indipendenti danno 7-13 arcmin contro un minimo ISO
// di 16 su LIM 75" a 3 m: le immagini sono calibrate per uno schermo a 60 cm.
// Seguirle alla lettera non risolverebbe l'aula.
//
// Uso:
//   node scripts/conformita.mjs [baseURL]
// Scrive `artifacts/conformita.json` ed esce 0 SEMPRE: e' una misura, e un
// misuratore che fallisce impedisce di misurare.
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

const BASE = process.argv[2] ?? "https://ardesia-lavagna.vercel.app"
const OUT = "artifacts/conformita.json"

/** Le rotte che il prodotto espone oggi. Non e' l'insieme dell'atlante: e' cio' che c'e'. */
const ROTTE = [
  { id: "lezione", url: "/" },
  { id: "continuita", url: "/?vista=continuita" },
  { id: "materiali", url: "/?vista=materiali" },
  { id: "elab-lab", url: "/?vista=elab-lab&esperimento=v1-cap9-esp6" },
]

const NAV_ATTESA = ["Lavagna", "Knowledge", "Studenti", "Library", "Marketplace"]

async function misura(page, rotta) {
  await page.goto(BASE + rotta.url, { waitUntil: "networkidle" })
  await page.waitForTimeout(1200)
  return page.evaluate(
    ({ navAttesa }) => {
      // Un solo posto dove si decide cosa e' «testo visibile»: chi lo definisce
      // due volte misura due cose diverse e non se ne accorge.
      const testi = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = (n.textContent || "").trim()
        if (!t) continue
        const el = n.parentElement
        if (!el) continue
        const s = getComputedStyle(el)
        if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        testi.push({ px: parseFloat(s.fontSize), testo: t.slice(0, 40), tag: el.tagName })
      }

      // 1 — navigazione globale a 5 destinazioni
      const navLinks = [...document.querySelectorAll("nav a, [role=navigation] a, nav button, [role=navigation] button")]
      const nomiNav = navLinks
        .map((e) => (e.getAttribute("aria-label") || e.textContent || "").trim())
        .filter(Boolean)

      // 2 — ricerca globale
      const ricerca = document.querySelector("input[type=search], input[placeholder*='erca'], [role=searchbox]")

      // 3 — intestazione a tre elementi
      const h1 = document.querySelectorAll("h1")
      const h1el = h1[0] ?? null
      const prima = h1el?.previousElementSibling
      const dopo = h1el?.nextElementSibling
      const eyebrow = prima ? (prima.textContent || "").trim() : ""
      const intestazione3 =
        h1.length === 1 &&
        eyebrow.length > 0 &&
        eyebrow === eyebrow.toUpperCase() &&
        eyebrow.includes(" · ") &&
        !!dopo &&
        (dopo.textContent || "").trim().length > 0

      // 4 — un solo bottone pieno
      const lum = (c) => {
        const m = c.match(/[\d.]+/g)
        if (!m || m.length < 3) return 1
        const [r, g, b] = m.map(Number)
        const a = m.length > 3 ? Number(m[3]) : 1
        if (a < 0.5) return 1
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      }
      const pieni = [...document.querySelectorAll("header button, .st-bar button, [role=banner] button")]
        .filter((b) => lum(getComputedStyle(b).backgroundColor) < 0.25)

      // 5 — provenienza monospace
      const provenienza = testi.filter((t) => /^(journal|manual|sketch):[a-z0-9#:.\-]+$/i.test(t.testo))

      // 6 — event log
      const eventLog = [...document.querySelectorAll("[data-testid=event-log] li, [data-event-log] li")]
      const chip = ["pronto", "suggerimento", "priorità", "da verificare"]
      const eventOk = eventLog.filter(
        (li) => /^\d{2}:\d{2}/.test((li.textContent || "").trim()) && chip.some((c) => (li.textContent || "").includes(c)),
      )

      // 7 — Sedimentazione
      const sedimentazione = document.body.innerText.includes("Sedimentazione")
      const artefatti = document.querySelectorAll("[aria-checked], input[type=checkbox]")

      // 8/9 — grafo tipizzato
      const nodi = document.querySelectorAll("[data-node-type]")
      const tipiNodo = [...new Set([...nodi].map((n) => n.getAttribute("data-node-type")))]
      const archi = document.querySelectorAll("[data-edge-type], [data-relation-type], [data-relazione]")

      // 10 — tipografia
      const minPx = testi.length ? Math.min(...testi.map((t) => t.px)) : null
      const sotto16 = testi.filter((t) => t.px < 16)

      // 11 — bersagli tattili
      const interattivi = [...document.querySelectorAll("button, a[href], input, select, [role=button], [tabindex='0']")]
      const bersagli = interattivi
        .map((e) => {
          const r = e.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height), nome: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 24) }
        })
        .filter((b) => b.w > 0 && b.h > 0)
      const piccoli = bersagli.filter((b) => b.w < 44 || b.h < 44)

      // 12 — regioni di primo livello
      const root = document.querySelector("#root > *, main, body > div") ?? document.body
      const regioni = [...root.children].filter((c) => {
        const r = c.getBoundingClientRect()
        return r.width > 80 && r.height > 40
      })

      // 13 — zoom raggruppato + fit
      const zoom = testi.some((t) => /^\d{1,3}%$/.test(t.testo))
      const meno = [...document.querySelectorAll("button")].some((b) => ["−", "-"].includes((b.textContent || "").trim()))
      const piu = [...document.querySelectorAll("button")].some((b) => (b.textContent || "").trim() === "+")
      const fit = [...document.querySelectorAll("button")].some((b) =>
        /adatta|fit/i.test((b.getAttribute("aria-label") || b.textContent || "")),
      )

      return {
        navCount: navLinks.length,
        nomiNav,
        navUgualeAttesa: navLinks.length === 5 && navAttesa.every((n) => nomiNav.some((x) => x.includes(n))),
        ricercaPresente: !!ricerca,
        ricercaPlaceholder: ricerca ? ricerca.getAttribute("placeholder") : null,
        intestazione3,
        h1Count: h1.length,
        bottoniPieni: pieni.length,
        provenienzaCount: provenienza.length,
        eventLogOk: eventOk.length,
        sedimentazione: sedimentazione && artefatti.length >= 4,
        nodiTipizzati: nodi.length,
        tipiNodo,
        archiTipizzati: archi.length,
        minFontPx: minPx,
        sotto16: sotto16.length,
        sotto16Esempi: sotto16.slice(0, 5).map((t) => `${t.px}px ${t.tag} "${t.testo}"`),
        bersagliTotali: bersagli.length,
        bersagliPiccoli: piccoli.length,
        bersagliPiccoliEsempi: piccoli.slice(0, 5).map((b) => `${b.w}x${b.h} "${b.nome}"`),
        regioniPrimoLivello: regioni.length,
        zoomRaggruppato: zoom && meno && piu,
        fitPresente: fit,
      }
    },
    { navAttesa: NAV_ATTESA },
  )
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errori = []
page.on("pageerror", (e) => errori.push(String(e.message)))

const perRotta = {}
for (const r of ROTTE) {
  try {
    perRotta[r.id] = await misura(page, r)
  } catch (e) {
    perRotta[r.id] = { errore: String(e).slice(0, 200) }
  }
}
const sha = await page.evaluate(() => window.__ARDESIA_BUILD__?.commitSha ?? null)
await browser.close()

const viste = Object.values(perRotta).filter((v) => !v.errore)
const placeholders = new Set(viste.map((v) => v.ricercaPlaceholder).filter(Boolean))
const ogni = (f) => viste.length > 0 && viste.every(f)
const almenoUna = (f) => viste.some(f)

// Le 13, ognuna con il suo oracolo e il suo motivo se fallisce.
const A = [
  { n: 1, t: "nav globale persistente con esattamente 5 destinazioni", p: ogni((v) => v.navUgualeAttesa),
    m: () => `nav trovate: ${viste.map((v) => v.navCount).join("/")} — nomi: ${JSON.stringify(viste[0]?.nomiNav ?? [])}` },
  { n: 2, t: "ricerca globale con placeholder diverso per rotta", p: placeholders.size === viste.length && viste.length > 1,
    m: () => `placeholder distinti: ${placeholders.size} su ${viste.length} rotte` },
  { n: 3, t: "intestazione a 3 elementi (eyebrow MAIUSCOLO · h1 · sottotitolo)", p: ogni((v) => v.intestazione3),
    m: () => `h1 per rotta: ${viste.map((v) => v.h1Count).join("/")}` },
  { n: 4, t: "esattamente UN bottone pieno per schermata", p: ogni((v) => v.bottoniPieni === 1),
    m: () => `bottoni pieni: ${viste.map((v) => v.bottoniPieni).join("/")}` },
  { n: 5, t: "almeno un ID di provenienza monospace", p: almenoUna((v) => v.provenienzaCount >= 1),
    m: () => `trovati: ${viste.map((v) => v.provenienzaCount).join("/")}` },
  { n: 6, t: "event log con >=4 voci HH:MM + chip di stato", p: almenoUna((v) => v.eventLogOk >= 4),
    m: () => `voci valide: ${viste.map((v) => v.eventLogOk).join("/")}` },
  { n: 7, t: "regione Sedimentazione con >=4 artefatti", p: almenoUna((v) => v.sedimentazione),
    m: () => "nessuna rotta espone «Sedimentazione» con 4 artefatti" },
  { n: 8, t: "grafo con >=10 nodi tipizzati", p: almenoUna((v) => v.nodiTipizzati >= 10),
    m: () => `nodi [data-node-type]: ${viste.map((v) => v.nodiTipizzati).join("/")}` },
  { n: 9, t: "ogni arco ha un tipo di relazione recuperabile", p: almenoUna((v) => v.archiTipizzati >= 1),
    m: () => `archi tipizzati: ${viste.map((v) => v.archiTipizzati).join("/")} — un grafo con archi senza tipo e' un disegno` },
  { n: 10, t: "nessun testo visibile sotto 16 px  [DEVIAZIONE: fallisce anche sull'atlante]", p: ogni((v) => v.sotto16 === 0),
    m: () => `sotto 16px: ${viste.map((v) => v.sotto16).join("/")} — minimo ${Math.min(...viste.map((v) => v.minFontPx ?? 99))}px · es. ${viste[0]?.sotto16Esempi?.[0] ?? "-"}` },
  { n: 11, t: "ogni bersaglio tattile >=44 px  [DEVIAZIONE]", p: ogni((v) => v.bersagliPiccoli === 0),
    m: () => `sotto 44px: ${viste.map((v) => `${v.bersagliPiccoli}/${v.bersagliTotali}`).join(" ")} · es. ${viste[0]?.bersagliPiccoliEsempi?.[0] ?? "-"}` },
  { n: 12, t: "<=8 regioni di primo livello  [DEVIAZIONE]", p: ogni((v) => v.regioniPrimoLivello <= 8),
    m: () => `regioni: ${viste.map((v) => v.regioniPrimoLivello).join("/")}` },
  { n: 13, t: "zoom raggruppato + controllo «adatta alla vista»", p: almenoUna((v) => v.zoomRaggruppato && v.fitPresente),
    m: () => `zoom: ${viste.map((v) => v.zoomRaggruppato).join("/")} · fit: ${viste.map((v) => v.fitPresente).join("/")}` },
]

const passate = A.filter((a) => a.p).length
const risultato = {
  misurato_il: new Date().toISOString(),
  base_url: BASE,
  sha_servita: sha,
  conformita: Number((passate / A.length).toFixed(3)),
  passate,
  totali: A.length,
  affermazioni: A.map((a) => ({ n: a.n, testo: a.t, esito: a.p ? "PASS" : "FAIL", misura: a.p ? null : a.m() })),
  per_rotta: perRotta,
  errori_pagina: errori,
  _nota: "Misura, non verdetto. Le affermazioni 10-12 sono deviazioni dichiarate dall'atlante e falliscono anche su di esso.",
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(risultato, null, 1))

console.log(`conformita = ${risultato.conformita}  (${passate}/${A.length})   sha ${String(sha).slice(0, 8)}`)
for (const a of risultato.affermazioni) {
  console.log(`  ${a.esito === "PASS" ? "PASS" : "FAIL"}  ${a.n.toString().padStart(2)}. ${a.testo}`)
  if (a.misura) console.log(`         ${a.misura}`)
}
