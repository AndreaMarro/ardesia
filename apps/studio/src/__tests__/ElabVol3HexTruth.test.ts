// @vitest-environment node
//
// Verità dei HEX precompilati Vol.3 (audit PKT-CODEX-2 P0-3, verificato
// firsthand NOTTE-12): il campo hexFile di un esperimento è una PROMESSA di
// artefatto — se il file non esiste o è il build di un ALTRO esperimento,
// l'upload "precompilato" flasherebbe firmware sbagliato su hardware vero.
//
// Questo test congela lo stato onesto:
//  - v3-cap6-esp4: il record DEVE puntare a v3-cap6-esp4.hex (build pin 6,
//    sha verificato dal disassembly: ldi r24,0x06) — NON a v3-cap6-sirena.hex
//    (build pin 8, esperimento diverso).
//  - v3-cap6-esp5: hexFile dichiarato ma file ASSENTE = quarantena
//    caratterizzata. Quando qualcuno genererà il .hex vero, questo test si
//    rompe e forza l'aggiornamento di matrice + precompiled map.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { createHash } from "node:crypto"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const vol3Source = fs.readFileSync(
  path.join(repoRoot, "plugins/elab-tutor/src/data/experiments-vol3.js"),
  "utf-8",
)
const hexDir = path.join(repoRoot, "plugins/elab-tutor/public/hex")

/** hexFile dichiarato nel record di un esperimento (regex sul sorgente dati). */
function declaredHexFile(experimentId: string): string | null {
  const block = vol3Source.indexOf(`"${experimentId}"`)
  if (block === -1) return null
  const nextExp = vol3Source.indexOf('"id": "v3-', block + 1)
  const slice = vol3Source.slice(block, nextExp === -1 ? undefined : nextExp)
  const match = slice.match(/"hexFile":\s*"([^"]+)"/)
  return match?.[1] ?? null
}

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex")
}

describe("v3-cap6-esp4 — Due LED che si alternano (pin 6/9)", () => {
  it("il record punta al SUO build (v3-cap6-esp4.hex), non a sirena.hex (pin 8)", () => {
    expect(declaredHexFile("v3-cap6-esp4")).toBe("/hex/v3-cap6-esp4.hex")
  })

  it("l'artefatto esiste ed è il build pin-6 verificato (sha256 ancorato)", () => {
    const hexPath = path.join(hexDir, "v3-cap6-esp4.hex")
    expect(fs.existsSync(hexPath)).toBe(true)
    // Ancora dell'audit NOTTE-12: build arduino-cli 328P con ldi r24,0x06
    // (pin 6). Se il file cambia, ri-verificare il pin prima di aggiornare.
    expect(sha256(hexPath)).toBe(
      "d4f9363e67c80375b71472b2b96398b0711eac1870e44264d47d1f35a1d0db61",
    )
  })

  it("sirena.hex esiste ma è un ALTRO programma (pin 8): mai spacciarlo per esp4", () => {
    const sirenaPath = path.join(hexDir, "v3-cap6-sirena.hex")
    expect(fs.existsSync(sirenaPath)).toBe(true)
    expect(sha256(sirenaPath)).toBe(
      "0c5945b2ea2ad8cea8b0aa8b718ec6c73b882a2f2dcfa003273eedd6a32a450a",
    )
    // I due build sono diversi: la differenza è il pin (0x06 vs 0x08).
    expect(sha256(sirenaPath)).not.toBe(sha256(path.join(hexDir, "v3-cap6-esp4.hex")))
  })

  it("esiste anche la variante R4 (build Renesas)", () => {
    expect(fs.existsSync(path.join(hexDir, "v3-cap6-esp4-r4.hex"))).toBe(true)
  })
})

describe("v3-cap6-esp5 — Semaforo (pin 5/6/9): quarantena caratterizzata", () => {
  it("il record dichiara un hexFile che OGGI non esiste (promessa non mantenuta)", () => {
    const declared = declaredHexFile("v3-cap6-esp5")
    expect(declared).toBe("/hex/v3-cap6-esp5.hex")
    // ⚠️ CARATTERIZZAZIONE: quando v3-cap6-esp5.hex verrà generato con
    // arduino-cli (pin 5/6/9), questo assert si rompe → aggiornare matrice,
    // PRECOMPILED_HEX/_R4 e fast-matcher, poi flippare a existsSync=true.
    expect(fs.existsSync(path.join(hexDir, "v3-cap6-esp5.hex"))).toBe(false)
  })

  it("semaforo.hex esiste ma è il VECCHIO semaforo (pin 5/6/3), non esp5", () => {
    // Non riusarlo per esp5: il circuito del libro cabla pin 5/6/9.
    expect(fs.existsSync(path.join(hexDir, "v3-cap6-semaforo.hex"))).toBe(true)
  })
})

describe("tutti i hexFile Vol.3 dichiarati — inventario onesto", () => {
  it("ogni hexFile dichiarato esiste su disco, TRANNE la quarantena nota (esp5)", () => {
    const declared = [...vol3Source.matchAll(/"hexFile":\s*"\/hex\/([^"]+)"/g)].map(
      (match) => match[1]!,
    )
    expect(declared.length).toBeGreaterThan(0)
    const missing = declared.filter(
      (name) => !fs.existsSync(path.join(hexDir, name)),
    )
    // Quarantena dichiarata (audit P0-3): esp5 (target whitelist) e
    // v3-cap8-esp3 (fuori whitelist). Un nuovo missing = nuova bugia.
    expect(missing.sort()).toEqual(["v3-cap6-esp5.hex", "v3-cap8-esp3.hex"])
  })
})
