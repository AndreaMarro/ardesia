#!/usr/bin/env node
/**
 * MAESTRO-Studio — Visual-smoke screenshot script (S-DESIGN-8)
 * Builda, serve preview, scatta 4 screenshot VERI in ~/maestro-logs/ui-shots/<ts>/.
 *
 * Usage: npm run shots
 *   Prerequisito: npm run build (o tsc -b && vite build) già eseguito prima.
 *   Produce: 01-welcome.png, 02-lavagna-drawer-aperto.png, 03-vista-studente.png,
 *            04-elab-blink-lavagna.png (Reference Sim montato via ToolHost)
 *
 * Contract: process-group cleanup (no shell:true zombie), kill SIGKILL su timeout.
 */

import { chromium } from "@playwright/test"
import { spawn } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { homedir } from "node:os"
import { setTimeout as sleep } from "node:timers/promises"
import { buildDemoSeedEntries } from "./demoSeed.mjs"

const PORT = 4179
const BASE = `http://localhost:${PORT}`
const ROOM = "visual-smoke-test"
const SHOTS_ROOT = resolve(homedir(), "maestro-logs", "ui-shots")

// S-DESIGN-9b: contenuto d'esempio DETERMINISTICO (titolo + 3 stroke + nome lezione)
// seminato in localStorage PRIMA del load: la lavagna negli shot non è mai vuota.
const SEED_ENTRIES = buildDemoSeedEntries(ROOM)

/** Inietta la scena demo nel localStorage della pagina prima di ogni navigazione */
async function seedDemoScene(page) {
  await page.addInitScript((entries) => {
    for (const [k, v] of entries) localStorage.setItem(k, v)
  }, SEED_ENTRIES)
}

function timestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

function log(...args) {
  console.log(`[shots]`, ...args)
}

/** Attende che il preview server sia pronto (poll HTTP su PORT). */
async function waitForServer(maxWaitMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (res.ok) return true
    } catch {
      // server non ancora pronto
    }
    await sleep(500)
  }
  throw new Error(`Preview server non disponibile dopo ${maxWaitMs}ms sulla porta ${PORT}`)
}

/** Ferma il processo vite figlio (SIGTERM → SIGKILL fallback) */
function killServer(proc) {
  if (!proc || proc.killed) return
  proc.kill("SIGTERM")
  setTimeout(() => {
    if (!proc.killed) {
      proc.kill("SIGKILL")
    }
  }, 2000)
}

async function main() {
  // 1. Verifica build
  if (!existsSync("dist/index.html")) {
    log("ERROR: dist/index.html non trovato. Esegui 'npm run build' prima di 'npm run shots'.")
    process.exit(1)
  }

  // 2. Directory output con timestamp
  const ts = timestamp()
  const outDir = resolve(SHOTS_ROOT, ts)
  mkdirSync(outDir, { recursive: true })
  log(`Screenshot → ${outDir}`)

  // 3. Avvia vite preview (NO shell:true — evita zombie)
  log(`Avvio vite preview sulla porta ${PORT}...`)
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  })
  server.stderr.on("data", (d) => process.stderr.write(d))

  try {
    await waitForServer()
    log("Preview server pronto.")

    // 4. Avvia browser headless
    const browser = await chromium.launch({ headless: true })

    try {
      // --- SCREENSHOT 1: Welcome (home page, Excalidraw welcome screen) ---
      log("01-welcome.png — pagina iniziale con WelcomeScreen MAESTRO...")
      const page1 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page1.goto(BASE, { waitUntil: "networkidle" })
      // Attendi che Excalidraw renderizzi: canvas o WelcomeScreen visibile
      await page1.waitForSelector(".st-welcome-brand, .st-welcome-heading, canvas", {
        timeout: 15000,
      })
      // Piccolo sleep extra per render completo canvas/font
      await sleep(1500)
      await page1.screenshot({ path: resolve(outDir, "01-welcome.png"), fullPage: false })
      await page1.close()
      log("  ✓ 01-welcome.png salvato.")

      // --- SCREENSHOT 2: Lavagna con contenuto demo + drawer lezioni aperto ---
      log("02-lavagna-drawer-aperto.png — scena demo + drawer lezioni visibile...")
      const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await seedDemoScene(page2)
      await page2.goto(`${BASE}#${ROOM}`, { waitUntil: "networkidle" })
      // Attendi render Excalidraw + header docenti
      await page2.waitForSelector(".st-bar, canvas", { timeout: 15000 })
      await sleep(1500)

      // Clicca il bottone "lezioni" per aprire il drawer
      const lezioniBtn = page2.locator("button", { hasText: "lezioni" })
      await lezioniBtn.waitFor({ state: "visible", timeout: 10000 })
      await lezioniBtn.click()
      // Attendi che il drawer appaia
      await page2.waitForSelector(".st-drawer", { timeout: 5000 })
      await sleep(500)
      await page2.screenshot({ path: resolve(outDir, "02-lavagna-drawer-aperto.png"), fullPage: false })
      await page2.close()
      log("  ✓ 02-lavagna-drawer-aperto.png salvato.")

      // --- SCREENSHOT 3: Vista studente (scena demo + chip nome lezione) ---
      log("03-vista-studente.png — vista studente (?vista=studente) con scena demo...")
      const page3 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await seedDemoScene(page3)
      await page3.goto(`${BASE}/?vista=studente#${ROOM}`, { waitUntil: "networkidle" })
      // Attendi header studente visibile + eventuale empty state
      await page3.waitForSelector(".st-bar-student, .st-chip-student, .st-student-empty", {
        timeout: 15000,
      })
      await sleep(1500)
      await page3.screenshot({ path: resolve(outDir, "03-vista-studente.png"), fullPage: false })
      await page3.close()
      log("  ✓ 03-vista-studente.png salvato.")

      // --- SCREENSHOT 4: Reference Sim montato sulla lavagna (LED acceso) ---
      log("04-elab-blink-lavagna.png — Reference Sim via ToolHost, LED ON + embed sulla lavagna...")
      const page4 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page4.goto(`${BASE}/?demo=reference-blink`, { waitUntil: "networkidle" })
      // Attendi che l'handshake host.hello→tool.ready→ReadyAck completi: il wrapper
      // canvas espone data-reference-ready="1" SOLO dopo session.ready (i bottoni del
      // tool si abilitano nello stesso ack). Se l'handshake fallisse, qui va in timeout.
      await page4.waitForSelector('[data-reference-ready="1"]', { timeout: 20000 })
      const toolFrame = page4.frameLocator("iframe.reference-tool-frame")
      const btnToggle = toolFrame.locator("#btnToggle")
      await btnToggle.waitFor({ state: "visible", timeout: 10000 })
      await btnToggle.click() // accende il LED sulla breadboard
      await toolFrame.locator("#btnPlace").click() // board.write → embed sulla lavagna
      // Conferma OSSERVABILE che board.write è stato postato su un port pronto: il
      // tool mostra lo status .ok "…sulla lavagna" SOLO dopo aver inviato il messaggio
      // (altrimenti early-return "non connesso"). Niente shot a tempo cieco.
      await toolFrame.locator("#status.ok", { hasText: "lavagna" }).waitFor({ timeout: 5000 })
      await sleep(800) // repaint del canvas Excalidraw dopo updateScene
      await page4.screenshot({ path: resolve(outDir, "04-elab-blink-lavagna.png"), fullPage: false })
      await page4.close()
      log("  ✓ 04-elab-blink-lavagna.png salvato.")

      log(`\n✅ Tutti e 4 gli screenshot salvati in ${outDir}`)
      log(`  ${resolve(outDir, "01-welcome.png")}`)
      log(`  ${resolve(outDir, "02-lavagna-drawer-aperto.png")}`)
      log(`  ${resolve(outDir, "03-vista-studente.png")}`)
      log(`  ${resolve(outDir, "04-elab-blink-lavagna.png")}`)
    } finally {
      await browser.close()
    }
  } finally {
    // 5. Ferma preview server (SIGTERM → SIGKILL fallback)
    killServer(server)
    await new Promise((resolve) => {
      server.on("close", resolve)
      setTimeout(() => {
        if (!server.killed) server.kill("SIGKILL")
        resolve()
      }, 3000)
    })
    log("Preview server fermato.")
  }
}

main().catch((err) => {
  console.error("[shots] ERRORE:", err)
  process.exit(1)
})
