// Il gate locale documentato (`npm run verify` → bin/monorepo.sh verify-core →
// `npm --prefix apps/studio test`) e il gate che decide il merge (job "studio" di
// .github/workflows/ci.yml) devono eseguire lo STESSO runner. Fino ad ad8f0f9f
// divergevano: la CI inlineava `npx vitest run --pool=threads --maxWorkers=1
// --testTimeout=30000 …`, il locale girava con i default (pool forks,
// testTimeout 15s). Un gate locale che non e' il gate di merge lascia passare in
// locale cio' che la CI boccia, e viceversa.
//
// Sorgente unica: apps/studio/vitest.config.ts. La CI chiama `npm test`.
//
// Tre livelli di verifica, dal piu' forte al piu' debole:
//
//  1. RUNTIME — il pool in uso e' osservabile da dentro il test: con
//     `pool: "threads"` il test gira in un worker thread, con `pool: "forks"` in
//     un processo figlio dove `isMainThread` e' vero. Nessuna stringa puo'
//     falsificare questo.
//  2. CONFIG RISOLTA — si importa il modulo di configurazione e si leggono i
//     VALORI, non il testo del sorgente: resiste a riformattazioni e commenti.
//  3. WORKFLOW — l'unico lato che resta testuale, perche' il repository non ha un
//     parser YAML fra le dipendenze. L'asserzione e' comunque semantica: nessuna
//     opzione del runner deve essere reinlineata da nessuna parte nel workflow.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { isMainThread } from "node:worker_threads"
import { describe, expect, it } from "vitest"
import vitestConfig from "../../vitest.config"

const workflow = readFileSync(join(process.cwd(), "../..", ".github/workflows/ci.yml"), "utf8")

// La config e' un `UserConfigExport`; nel gate e' un oggetto letterale con `test`.
const resolved = (vitestConfig as { test?: Record<string, unknown> }).test ?? {}

// Opzioni del runner che, se ricompaiono nel workflow, ricreano la divergenza.
const RUNNER_FLAGS = [
  "npx vitest",
  "--pool=",
  "--maxWorkers=",
  "--no-file-parallelism",
  "--testTimeout=",
  "--hookTimeout=",
  "--teardownTimeout=",
]

describe("parita' del profilo tra gate locale e gate di merge", () => {
  it("il pool osservato a runtime e' quello dichiarato dalla config", () => {
    expect(resolved.pool).toBe("threads")
    // Con il pool `threads` il codice del test gira in un worker thread.
    expect(isMainThread).toBe(false)
  })

  it("il profilo deterministico vive nella config risolta, non nel workflow", () => {
    expect(resolved.maxWorkers).toBe(1)
    expect(resolved.fileParallelism).toBe(false)
    expect(resolved.testTimeout).toBe(30000)
    expect(resolved.hookTimeout).toBe(30000)
    expect(resolved.teardownTimeout).toBe(30000)
  })

  it("il setup globale del gate e' cablato dalla config risolta", () => {
    expect(resolved.setupFiles).toEqual(["./src/__tests__/vitest.setup.ts"])
  })

  it("il workflow non reinlinea nessuna opzione del runner e chiama npm test", () => {
    const reinlined = RUNNER_FLAGS.filter((flag) => workflow.includes(flag))
    expect(reinlined).toEqual([])
    expect(workflow).toContain("run: npm test")
  })
})
