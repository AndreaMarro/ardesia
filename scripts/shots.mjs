#!/usr/bin/env node
/**
 * MAESTRO-Studio — Visual-smoke screenshot script (S-DESIGN-8)
 * Builda, serve preview, scatta 3 screenshot VERI in ~/maestro-logs/ui-shots/<ts>/.
 *
 * Usage: npm run shots
 *   Prerequisito: npm run build (o tsc -b && vite build) già eseguito prima.
 *   Produce: 01-welcome.png, 02-lavagna-drawer-aperto.png, 03-vista-studente.png
 *
 * Contract: process-group cleanup (no shell:true zombie), kill SIGKILL su timeout.
 */

import { chromium } from "@playwright/test"
import { spawn } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { homedir } from "node:os"
import { setTimeout as sleep } from "node:timers/promises"

const PORT = 4179
const BASE = `http://localhost:${PORT}`
const ROOM = "visual-smoke-test"
const SHOTS_ROOT = resolve(homedir(), "maestro-logs", "ui-shots")

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

      // --- SCREENSHOT 2: Lavagna con drawer lezioni aperto ---
      log("02-lavagna-drawer-aperto.png — drawer lezioni visibile...")
      const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
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

      // --- SCREENSHOT 3: Vista studente ---
      log("03-vista-studente.png — vista studente (?vista=studente)...")
      const page3 = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page3.goto(`${BASE}/?vista=studente#${ROOM}`, { waitUntil: "networkidle" })
      // Attendi header studente visibile + eventuale empty state
      await page3.waitForSelector(".st-bar-student, .st-chip-student, .st-student-empty", {
        timeout: 15000,
      })
      await sleep(1500)
      await page3.screenshot({ path: resolve(outDir, "03-vista-studente.png"), fullPage: false })
      await page3.close()
      log("  ✓ 03-vista-studente.png salvato.")

      log(`\n✅ Tutti e 3 gli screenshot salvati in ${outDir}`)
      log(`  ${resolve(outDir, "01-welcome.png")}`)
      log(`  ${resolve(outDir, "02-lavagna-drawer-aperto.png")}`)
      log(`  ${resolve(outDir, "03-vista-studente.png")}`)
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
