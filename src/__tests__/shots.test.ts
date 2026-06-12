// @vitest-environment node
/**
 * S-DESIGN-8: Verifica screenshot VERI da npm run shots.
 * I file devono esistere in ~/maestro-logs/ui-shots/<YYYYMMDD-HHMM>/
 * e ogni file deve essere > soglia minima per-file (euristica non-bianco).
 */

import { describe, it, expect } from "vitest"
import { existsSync, readdirSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { homedir } from "node:os"

const SHOTS_ROOT = resolve(homedir(), "maestro-logs", "ui-shots")

// Soglie per-file (euristica non-bianco):
// Una pagina bianca a 1280x800 produce ~2-3KB PNG.
// 01: Excalidraw + WelcomeScreen → molto contenuto (canvas, icone, font) → 100KB+
// 02: Excalidraw + Drawer overlay → 100KB+
// 03: Vista studente vuota (solo header + empty-state Meet) → ~10-15KB, abbassiamo a 6KB
const THRESHOLDS: Record<string, number> = {
  "01-welcome.png": 20 * 1024,
  "02-lavagna-drawer-aperto.png": 20 * 1024,
  "03-vista-studente.png": 6 * 1024,
}

describe("S-DESIGN-8 visual-smoke screenshots", () => {
  // Trova l'ultimo run di screenshot (directory più recente per timestamp crescente)
  const dirs = existsSync(SHOTS_ROOT)
    ? readdirSync(SHOTS_ROOT)
        .filter((d) => /^\d{8}-\d{4}$/.test(d))
        .sort()
        .reverse()
    : []

  const latestDir = dirs.length > 0 ? resolve(SHOTS_ROOT, dirs[0]) : null

  it("almeno un run di screenshot esiste in ~/maestro-logs/ui-shots/", () => {
    expect(latestDir, "Nessuna directory ui-shots trovata — esegui 'npm run shots' prima del test").not.toBeNull()
  })

  Object.entries(THRESHOLDS).forEach(([filename, minSize]) => {
    it(`${filename} esiste e pesa >${(minSize / 1024).toFixed(0)}KB`, () => {
      const fpath = resolve(latestDir!, filename)
      expect(existsSync(fpath), `${filename} non trovato in ${latestDir}`).toBe(true)
      const size = statSync(fpath).size
      expect(size, `${filename} è ${size} bytes — sotto soglia ${minSize} bytes (schermo bianco?)`).toBeGreaterThan(minSize)
    })
  })
})
