// @vitest-environment node
//
// Arduino support-matrix freeze (PKT-CODEX-2, docs/ops/CODEX-ARDUINO-COMPILE-UPLOAD-AUDIT-2026-07-11.md).
// Congela la VERITÀ attuale di compile/upload per il Vol.3 prima di qualunque
// promessa UI: la UI non deve vendere supporto a board non end-to-end.
//
//   M1  corpus Vol.3: 23 esperimenti, tutti avr, tutti con code + scratchXml;
//   M2  compile in-browser (subset ATmega328P): ESATTAMENTE 5/23 — drift guard
//       nei due sensi (se il compiler cresce o regredisce, il test lo dichiara);
//   M3  onestà del board registry: ogni board che dichiara
//       inBrowserCompileSupported deve essere DAVVERO accettata dal compiler
//       (fail-closed: mai flag di capacità senza backend);
//   M4  hexFile referenziati devono esistere sotto public/hex, con quarantena
//       esplicita dei riferimenti rotti noti (ratchet: se li ripari, DEVI
//       togliere la voce dalla quarantena).
//
// Nessun mock: compile reale del compiler bounded, fs reale sul repo.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import { pathToFileURL } from "node:url"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const pluginSrc = path.join(repoRoot, "plugins/elab-tutor/src")
const publicHexDir = path.join(repoRoot, "plugins/elab-tutor/public/hex")

type Experiment = {
  id: string
  simulationMode: string
  code?: string
  scratchXml?: string
  hexFile: string | null
}

type Vol3Module = { default: { experiments: Experiment[] } }

type CompileResult = { success: boolean; reason?: string }

type CompilerModule = {
  compileArduinoInBrowser: (
    code: string,
    options: { board: string },
  ) => Promise<CompileResult>
}

type Board = {
  id: string
  fqbn: string
  inBrowserCompileSupported?: boolean
}

type BoardsModule = { BOARDS: Board[] | Record<string, Board> }

async function loadVol3(): Promise<Experiment[]> {
  const mod = (await import(
    pathToFileURL(path.join(pluginSrc, "data/experiments-vol3.js")).href
  )) as Vol3Module
  return mod.default.experiments
}

async function loadCompiler(): Promise<CompilerModule> {
  return (await import(
    pathToFileURL(path.join(pluginSrc, "services/inBrowserAvrCompiler.js")).href
  )) as CompilerModule
}

async function loadBoards(): Promise<Board[]> {
  const mod = (await import(
    pathToFileURL(path.join(pluginSrc, "services/arduinoBoards.js")).href
  )) as BoardsModule
  return Array.isArray(mod.BOARDS) ? mod.BOARDS : Object.values(mod.BOARDS)
}

// Verità misurata firsthand (sweep statico su origin/main 12d61081):
// solo questi 5 sketch Vol.3 stanno nel subset bounded del compiler in-browser.
const IN_BROWSER_COMPILABLE = [
  "v3-cap5-esp2",
  "v3-cap6-esp2",
  "v3-cap6-esp3",
  "v3-cap6-esp4",
  "v3-cap6-esp5",
]

// Quarantena riferimenti HEX rotti noti (audit PKT-CODEX-2 §P0-3).
// Ratchet: ogni voce DEVE restare rotta finché è qui; se rigeneri l'artefatto,
// togli la voce e il test pretende il file su disco.
const KNOWN_MISSING_HEX: Record<string, string> = {
  "v3-cap6-esp5": "/hex/v3-cap6-esp5.hex",
  "v3-cap8-esp3": "/hex/v3-cap8-esp3.hex",
}

// Sketch minimale dentro il subset dichiarato del compiler (pinMode/digitalWrite/delay).
const BLINK_SUBSET_SKETCH = [
  "void setup() { pinMode(13, OUTPUT); }",
  "void loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }",
].join("\n")

describe("Arduino support matrix — freeze della verità compile/upload Vol.3", () => {
  it("M1: corpus Vol.3 = 23 esperimenti avr, tutti con code + scratchXml", async () => {
    const experiments = await loadVol3()
    expect(experiments).toHaveLength(23)
    for (const exp of experiments) {
      expect(exp.simulationMode, `${exp.id} simulationMode`).toBe("avr")
      expect(exp.code, `${exp.id} senza code`).toBeTruthy()
      expect(exp.scratchXml, `${exp.id} senza scratchXml`).toBeTruthy()
    }
  })

  it("M2: compile in-browser copre ESATTAMENTE 5/23 (drift guard nei due sensi)", async () => {
    const experiments = await loadVol3()
    const { compileArduinoInBrowser } = await loadCompiler()
    const compilable: string[] = []
    for (const exp of experiments) {
      const result = await compileArduinoInBrowser(exp.code ?? "", { board: "nano" })
      if (result.success) compilable.push(exp.id)
    }
    // Se questo test arrossisce perché il compiler ha IMPARATO nuovi costrutti,
    // aggiorna la lista e la matrice in docs/ops/ARDUINO-SUPPORT-MATRIX.md.
    expect(compilable.sort()).toEqual([...IN_BROWSER_COMPILABLE].sort())
  })

  it("M3: ogni board che dichiara inBrowserCompileSupported è davvero accettata dal compiler", async () => {
    const boards = await loadBoards()
    const { compileArduinoInBrowser } = await loadCompiler()
    expect(boards.length).toBeGreaterThan(0)
    for (const board of boards) {
      const result = await compileArduinoInBrowser(BLINK_SUBSET_SKETCH, {
        board: board.id,
      })
      if (board.inBrowserCompileSupported) {
        expect(
          result.success,
          `board "${board.id}" dichiara inBrowserCompileSupported ma il compiler la rifiuta (${result.reason ?? "?"}) — flag di capacità falso`,
        ).toBe(true)
      } else {
        expect(
          result.success,
          `board "${board.id}" NON dichiara inBrowserCompileSupported ma il compiler la accetta — matrice da aggiornare`,
        ).toBe(false)
      }
    }
  })

  it("M4: ogni hexFile referenziato esiste sotto public/hex, salvo quarantena esplicita", async () => {
    const experiments = await loadVol3()
    for (const exp of experiments) {
      if (!exp.hexFile) continue
      const onDisk = path.join(publicHexDir, path.basename(exp.hexFile))
      const quarantined = KNOWN_MISSING_HEX[exp.id]
      if (quarantined) {
        expect(exp.hexFile, `${exp.id} quarantena disallineata`).toBe(quarantined)
        expect(
          fs.existsSync(onDisk),
          `${exp.id}: ${exp.hexFile} ora esiste — togli la voce dalla quarantena`,
        ).toBe(false)
      } else {
        expect(
          fs.existsSync(onDisk),
          `${exp.id}: hexFile ${exp.hexFile} referenziato ma assente in public/hex`,
        ).toBe(true)
      }
    }
  })

  it("M4b: v3-cap6-esp4 RICONCILIATO — punta al suo build pin-6 (NOTTE-12)", async () => {
    const experiments = await loadVol3()
    const esp4 = experiments.find((exp) => exp.id === "v3-cap6-esp4")
    expect(esp4).toBeDefined()
    // Riconciliato in NOTTE-12: verificato col libro (pin 6/9) e col
    // disassembly (esp4.hex = ldi r24,0x06; sirena.hex = 0x08, altro
    // esperimento). Hash ancorato in ElabVol3HexTruth.test.ts.
    expect(esp4?.hexFile).toBe("/hex/v3-cap6-esp4.hex")
    expect(fs.existsSync(path.join(publicHexDir, "v3-cap6-esp4.hex"))).toBe(true)
  })
})
