// Prova browser nativa — Unità C: ultima azione Simulation → navigazione → export.
// Chromium reale + IndexedDB reale + download reale. Dati sintetici.
// Uso: node browser-close-proof.mjs (richiede il dev server su :5291).
import { createRequire } from "node:module"
import { writeFileSync } from "node:fs"

const ROOT = process.env.ARDESIA_CHECKOUT ?? "/Users/andreamarro/VOLUME 3/ardesia-postlesson-integrity-20260922"
const require = createRequire(`${ROOT}/apps/studio/package.json`)
const { chromium } = require("playwright-core")
const JSZip = require("jszip")

const BASE = "http://localhost:5291"
const ROOM_A = "bw-room-a"
const ROOM_B = "bw-room-b"
const results = []
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ acceptDownloads: true })
  page.on("pageerror", (error) => console.log("pageerror:", String(error).slice(0, 160)))
  await page.goto(`${BASE}/#${ROOM_A}`)
  await page.waitForFunction(() => window.__MAESTRO_TEST__?.ready === true, null, { timeout: 30000 })
  check("room A ready (harness)", true)

  // File necessari all'export, scritti con lo store reale della lezione.
  await page.evaluate(({ room }) => {
    const h = window.__MAESTRO_TEST__
    return (async () => {
      await h.store.write(`raw/${room}/board.excalidraw`, new Blob([JSON.stringify({ type: "excalidraw", elements: [] })], { type: "application/json" }))
      h.recorder.recordMathInsert("V = R I")
      await h.promoteJournalToLessonOs()
    })()
  }, { room: ROOM_A })
  check("scene+journal via real recorder path", true)

  // Testo reale via canvas vera (stessa onChange che guida il recorder).
  // Il click sul tool passa per il DOM reale; l'SVG interno intercetta il
  // punto, quindi click sintetico sull'elemento (stesso handler).
  await page.evaluate(() => {
    const tool = document.querySelector('[data-testid="toolbar-text"]')
    if (!tool) throw new Error("text tool missing")
    tool.click()
  })
  const canvasBox = await page.locator("canvas").first().boundingBox()
  await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2)
  await page.keyboard.type("La corrente e uguale in serie.", { delay: 20 })
  await page.keyboard.press("Escape")
  await page.mouse.click(10, 200)
  // Il flush (auto o esplicito) scrive il journal: attende il file, non il buffer.
  await page.waitForFunction(async ({ room }) => {
    const h = window.__MAESTRO_TEST__
    const blob = await h.store.read(`raw/${room}/events.jsonl`)
    if (!blob) return false
    return (await blob.text()).includes("uguale in serie")
  }, { room: ROOM_A }, { timeout: 15000 })
  await page.evaluate(() => window.__MAESTRO_TEST__.promoteJournalToLessonOs())
  const journalText = await page.evaluate(({ room }) => {
    const h = window.__MAESTRO_TEST__
    return h.store.read(`raw/${room}/events.jsonl`).then((b) => b.text())
  }, { room: ROOM_A })
  check("canvas text recorded in journal", journalText.includes("element.add") && journalText.includes("uguale in serie"))

  // Ritarda deterministicamente la persistenza (strumentazione minima: solo
  // la risoluzione, non la produzione dell'evento).
  await page.evaluate(() => {
    const store = window.__MAESTRO_TEST__.lessonOs.current.store
    window.__gate = new Promise((resolve) => { window.__gateRelease = resolve })
    const real = store.append.bind(store)
    store.append = async (event) => {
      await window.__gate
      return real(event)
    }
  })

  // Vera azione Simulation: stesso evento che l'host dei tool emette al solve.
  await page.evaluate(() => {
    window.__MAESTRO_TEST__.emitLessonEvent({
      kind: "simulation.circuit.solved",
      experimentId: "synth-exp-bw",
      sceneId: "synth-exp-bw",
      currentMa: 14.9,
      bookLayoutValid: true,
      labels: { it: "Circuito risolto: 14.9 mA" },
      t: 1000,
      evidence: ["simulation:scene:synth-exp-bw"],
    })
  })

  // Navigazione immediata mentre la scrittura è in volo.
  const nav = page.evaluate(({ target }) => window.__MAESTRO_TEST__.navigateToLesson(target), { target: ROOM_B }).catch(() => {})
  await page.waitForTimeout(1000)
  const hashDuringFlight = await page.evaluate(() => window.location.hash)
  check("navigation waits for the in-flight append", hashDuringFlight === `#${ROOM_A}`, `hash=${hashDuringFlight}`)
  await page.evaluate(() => window.__gateRelease())
  await nav.catch(() => {})
  await page.waitForURL(new RegExp(`#${ROOM_B}`), { timeout: 15000 })
  await page.waitForFunction(() => window.__MAESTRO_TEST__?.ready === true, null, { timeout: 30000 })
  check("navigation completes after settlement", true)

  // Export reale dal recap con click reale sul bottone.
  await page.goto(`${BASE}/?vista=recap#${ROOM_A}`)
  const exportButton = page.getByRole("button", { name: "esporta .lesson" })
  await exportButton.waitFor({ timeout: 30000 })
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    exportButton.click(),
  ])
  const path = await download.path()
  check("recap export downloads", !!path)
  await download.saveAs(`${ROOT}/docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/bw-room-a.lesson`)
  const zip = await JSZip.loadAsync(require("node:fs").readFileSync(path))
  const lessonos = await zip.file("raw/lessonos-events.jsonl")?.async("text")
  check("bundle contains the last Simulation action", !!lessonos && lessonos.includes("synth-exp-bw"))
  const solvedCount = (lessonos?.match(/simulation\.circuit\.solved/g) ?? []).length
  check("exactly-once solved event", solvedCount === 1, `count=${solvedCount}`)
  const manifest = JSON.parse(await zip.file("manifest.json").async("text"))
  check("manifest lesson identity", manifest.lessonId === ROOM_A, `lessonId=${manifest.lessonId}`)
  const noAlert = await page.getByRole("alert").count()
  check("no export error shown", noAlert === 0)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
writeFileSync(`${ROOT}/docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/browser-close-proof.json`, JSON.stringify({ date: new Date().toISOString(), results }, null, 2) + "\n")
if (failed.length > 0) {
  console.log(`BROWSER PROOF: ${failed.length} FAILURES`)
  process.exit(1)
}
console.log("BROWSER PROOF: ALL GREEN")
