// SUITE DI COMPATIBILITÀ del contratto SDK Layer-0 (PLUGIN-SDK).
//
// Congela la superficie pubblica del confine ToolHost<->plugin contro un GOLDEN
// esplicito. Ogni drift (metodo wire aggiunto/rimosso, capability cambiata,
// codice errore spostato, handshake alterato) rende RED questa suite e impone
// una decisione SemVer cosciente su CONTRACT_VERSION. È il meccanismo che rende
// il confine STABILE: il gate frozen è l'arbitro, non la buona volontà.
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  CONTRACT,
  CONTRACT_VERSION,
  CapabilitiesSchema,
  ERR,
  TOOL_METHODS,
  ToolManifestSchema,
  defineManifest,
  parseVersion,
  protocolSatisfies,
} from "../sdk/index.ts"
import type { CapabilityName } from "../sdk/index.ts"
import { ToolHost } from "../toolhost/host.ts"
import { manifest as refManifest } from "../../plugins/reference/manifest.ts"

// ---- GOLDEN: la forma congelata del contratto v1.0.0 -----------------------
// Cambiare uno di questi valori SENZA bumpare CONTRACT_VERSION è un errore: il
// reviewer lo vede come modifica deliberata della superficie pubblica.
const GOLDEN_CAPABILITIES: readonly CapabilityName[] = [
  "arduino.board.catalog",
  "arduino.compile",
  "arduino.project",
  "arduino.serial",
  "arduino.upload",
  "board.read",
  "board.write",
  "graph.proposeClaims",
  "graph.query",
  "lesson.event.emit",
  "llm.generate",
  "net.fetch",
  "storage",
  "ui",
]

const GOLDEN_TOOL_METHODS: Record<string, CapabilityName> = {
  "board.read": "board.read",
  "board.write": "board.write",
  // v1.1.0 (P0-D): graph.query read-only entra nel wire — aggiunta
  // retro-compatibile ⇒ MINOR (regola SemVer in sdk/index.ts).
  "graph.query": "graph.query",
  // v1.2.0: append controllato di eventi didattici verificabili nel log LessonOS.
  "lesson.event.emit": "lesson.event.emit",
  "storage.delete": "storage",
  "storage.get": "storage",
  "storage.list": "storage",
  "storage.set": "storage",
}

const GOLDEN_LIFECYCLE_METHODS = ["host.hello", "tool.ready", "host.suspend", "host.restore"]

const GOLDEN_ERROR_CODES: Record<string, number> = {
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
  CAPABILITY_DENIED: -32001,
  HANDSHAKE_FAILED: -32002,
}

const SDK_V1_RANGE = ">=1.0 <2.0"

describe("sdk-contract/versioning (SemVer)", () => {
  it("CONTRACT_VERSION è SemVer valido e coerente nel descrittore", () => {
    expect(parseVersion(CONTRACT_VERSION)).not.toBeNull()
    expect(/^\d+\.\d+\.\d+$/.test(CONTRACT_VERSION)).toBe(true)
    expect(CONTRACT.contractVersion).toBe(CONTRACT_VERSION)
  })

  it("l'host esistente DICHIARA il contratto che implementa (consumo reale)", () => {
    expect(ToolHost.contractVersion).toBe(CONTRACT_VERSION)
  })
})

describe("sdk-contract/golden (superficie congelata = confine stabile)", () => {
  it("vocabolario capability == golden (aggiunta/rimozione ⇒ bump SemVer)", () => {
    expect([...CONTRACT.capabilities]).toEqual([...GOLDEN_CAPABILITIES])
  })

  it("metodi wire tool->host == golden, con la capability richiesta esatta", () => {
    expect({ ...CONTRACT.toolMethods }).toEqual(GOLDEN_TOOL_METHODS)
  })

  it("metodi lifecycle == golden", () => {
    expect([...CONTRACT.lifecycleMethods]).toEqual(GOLDEN_LIFECYCLE_METHODS)
  })

  it("codici errore == golden", () => {
    expect({ ...CONTRACT.errorCodes }).toEqual(GOLDEN_ERROR_CODES)
  })

  it("manifestVersion del contratto == 1", () => {
    expect(CONTRACT.manifestVersion).toBe(1)
  })
})

// Secondo cammino INDIPENDENTE: i moduli sorgente-di-verità dell'host (NON il
// CONTRACT derivato) confrontati direttamente col golden. Così un drift è RED
// sia qui sia nel blocco golden sopra — niente assert circolare X===X.
describe("sdk-contract/sorgente-di-verità (moduli vivi dell'host == golden)", () => {
  it("lo shape di CapabilitiesSchema (host) == golden", () => {
    expect(Object.keys(CapabilitiesSchema.shape).sort()).toEqual([...GOLDEN_CAPABILITIES])
  })

  it("il registro TOOL_METHODS (host) == golden, method->capability", () => {
    const fromRegistry: Record<string, CapabilityName> = {}
    for (const m of Object.keys(TOOL_METHODS)) fromRegistry[m] = TOOL_METHODS[m].cap
    expect(fromRegistry).toEqual(GOLDEN_TOOL_METHODS)
  })

  it("i codici errore ERR (host) == golden", () => {
    expect({ ...ERR }).toEqual(GOLDEN_ERROR_CODES)
  })

  it("il descrittore è congelato (immutabile a runtime, anche annidato)", () => {
    expect(Object.isFrozen(CONTRACT)).toBe(true)
    expect(() => {
      ;(CONTRACT as unknown as { contractVersion: string }).contractVersion = "9.9.9"
    }).toThrow()
    // Object.freeze è SHALLOW: il top-frozen non basta. I contenitori annidati
    // devono essere congelati uno per uno, altrimenti
    // `CONTRACT.errorCodes.CAPABILITY_DENIED = 0` muterebbe il descrittore SENZA
    // throw e farebbe divergere il golden in silenzio. Questo locca il freeze
    // profondo: togliere un Object.freeze interno (index.ts) = RED.
    expect(Object.isFrozen(CONTRACT.capabilities)).toBe(true)
    expect(Object.isFrozen(CONTRACT.toolMethods)).toBe(true)
    expect(Object.isFrozen(CONTRACT.lifecycleMethods)).toBe(true)
    expect(Object.isFrozen(CONTRACT.errorCodes)).toBe(true)
    expect(() => {
      ;(CONTRACT.errorCodes as unknown as Record<string, number>).CAPABILITY_DENIED = 0
    }).toThrow()
  })
})

describe("sdk-contract/defineManifest (authoring type-safe + validato)", () => {
  it("accetta un manifest conforme e ritorna il valore validato (parse, non cast)", () => {
    const m = defineManifest({
      manifestVersion: 1,
      id: "io.maestro.test-plugin",
      name: "Test Plugin",
      version: "1.2.3",
      protocol: ">=1.0 <2.0",
      entry: "dist/index.html",
      surfaces: ["board-embed"],
      capabilities: { "board.read": {} },
      publisher: { id: "p", pubkey: "ed25519:AAAA" },
      privacy: { dataOut: "none" },
    })
    expect(m.id).toBe("io.maestro.test-plugin")
    // la validazione passa per lo SCHEMA del contratto, non solo per i tipi
    expect(ToolManifestSchema.safeParse(m).success).toBe(true)
  })

  it("RIFIUTA a runtime un manifest fuori contratto (chiave sconosciuta)", () => {
    expect(() =>
      defineManifest({
        manifestVersion: 1,
        id: "io.maestro.bad",
        name: "Bad",
        version: "1.0.0",
        protocol: ">=1.0 <2.0",
        entry: "dist/index.html",
        surfaces: ["board-embed"],
        capabilities: {},
        publisher: { id: "p", pubkey: "ed25519:AAAA" },
        privacy: { dataOut: "none" },
        // @ts-expect-error chiave non nel contratto: deve fallire anche a runtime
        autorun: true,
      }),
    ).toThrow()
  })
})

describe("sdk-contract/plugin-di-riferimento (compila e rispetta il confine)", () => {
  it("il manifest del plugin di riferimento è valido contro lo schema del contratto", () => {
    expect(ToolManifestSchema.safeParse(refManifest).success).toBe(true)
    expect(refManifest.id).toBe("io.maestro.plugin-ref")
  })

  it("i reference tool dichiarano compatibilità col contratto SDK v1 corrente", () => {
    expect(refManifest.contract).toBe(SDK_V1_RANGE)
    expect(protocolSatisfies(CONTRACT_VERSION, refManifest.contract ?? "")).toBe(true)

    const simManifestRaw = readFileSync(
      fileURLToPath(new URL("../../sim/manifest-source.json", import.meta.url)),
      "utf8",
    )
    const simManifest = ToolManifestSchema.parse(JSON.parse(simManifestRaw))
    expect(simManifest.contract).toBe(SDK_V1_RANGE)
    expect(protocolSatisfies(CONTRACT_VERSION, simManifest.contract ?? "")).toBe(true)
  })

  it("il plugin importa SOLO dal confine src/sdk (zero accoppiamento agli interni)", () => {
    // I file che consumano l'SDK DEVONO importarlo (sanity); i moduli puri
    // intra-plugin (arduino.ts) possono non importare nulla — restano comunque
    // soggetti alla regola "nessun import interno" su ciò che importano.
    const sdkConsumers = ["../../plugins/reference/manifest.ts", "../../plugins/reference/main.ts"]
    const pluginFiles = [...sdkConsumers, "../../plugins/reference/arduino.ts"]
    // forma `import ... from "x"` E forma side-effect `import "x"` (senza from):
    // entrambe potrebbero accoppiare il plugin a un modulo interno.
    const fromRe = /import\s+(?:type\s+)?[^"']*?from\s+["']([^"']+)["']/g
    const sideEffectRe = /import\s+["']([^"']+)["']/g
    // import() dinamico (anche con backtick statico): un plugin potrebbe
    // accoppiarsi a un interno via `await import("../../src/toolhost/host.ts")`
    // bypassando i due pattern statici sopra. Lo catturiamo qui.
    const dynamicRe = /import\s*\(\s*[`"']([^`"']+)[`"']\s*\)/g
    for (const rel of pluginFiles) {
      const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
      const sources = [
        ...[...src.matchAll(fromRe)].map((m) => m[1]),
        ...[...src.matchAll(sideEffectRe)].map((m) => m[1]),
        ...[...src.matchAll(dynamicRe)].map((m) => m[1]),
      ]
      if (sdkConsumers.includes(rel)) expect(sources.length).toBeGreaterThan(0)
      for (const spec of sources) {
        // intra-plugin (./...) ammesso; qualunque risalita in ../../src/ DEVE
        // puntare al boundary, mai a un modulo interno (toolhost/, toolsdk/, ...).
        if (spec.includes("/src/")) {
          expect(spec).toBe("../../src/sdk/index.ts")
        } else {
          expect(spec.startsWith("./")).toBe(true)
        }
      }
    }
  })
})
