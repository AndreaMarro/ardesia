// Core contracts (ARCHITECTURE-CANON §4: "Contratti condivisi MANCANTI"):
// ManualSource/ManualRef, BoardCitation, LessonMode, manifest.kind, event-bus
// tipizzato. I test ancorano i contratti alle grammatiche GIÀ normative:
// EvidenceRef di eventlog.ts e ToolManifestSchema di toolhost-protocol.

import { describe, it, expect, vi } from "vitest"
import {
  LessonModeSchema,
  lessonModeFromBuildMode,
} from "../core/contracts/lessonMode"
import {
  ManualSourceSchema,
  ManualRefSchema,
  manualRefToEvidence,
  parseManualEvidence,
} from "../core/contracts/manual"
import { boardCitationToEvidence, BoardCitationSchema } from "../core/contracts/boardCitation"
import { createTypedEventBus, type ArdesiaEventMap } from "../core/contracts/eventBus"
import { ArdesiaModuleKindSchema } from "../core/contracts"
import { ToolManifestSchema } from "../toolhost-protocol/manifest"
import { assertEvidence, isValidEvidenceRef } from "../lessonos/eventlog"

// --- LessonMode (PRODUCT-CANON §3: enum di Core, 2 valori) ---

describe("LessonMode", () => {
  it("accetta solo i 2 valori del canon", () => {
    expect(LessonModeSchema.parse("passo-passo")).toBe("passo-passo")
    expect(LessonModeSchema.parse("gia-montato")).toBe("gia-montato")
    expect(() => LessonModeSchema.parse("sandbox")).toThrow()
    expect(() => LessonModeSchema.parse("")).toThrow()
  })

  it("mappa i buildMode legacy ELAB e fail-closed sul resto", () => {
    // grounding: PRODUCT-CANON §3 — "complete/guided/sandbox" sono le stringhe ad-hoc ELAB
    expect(lessonModeFromBuildMode("complete")).toBe("gia-montato")
    expect(lessonModeFromBuildMode("guided")).toBe("passo-passo")
    // sandbox NON è nel canon Core: resta buildMode del plugin → undefined
    expect(lessonModeFromBuildMode("sandbox")).toBeUndefined()
    expect(lessonModeFromBuildMode("qualunque")).toBeUndefined()
  })
})

// --- ManualSource / ManualRef ---

describe("ManualSource", () => {
  const valid = {
    manualId: "manual:vol2",
    documentId: "a".repeat(64),
    title: "ELAB Vol. 2",
  }

  it("valida una sorgente reale e rifiuta documentId non-sha256", () => {
    expect(ManualSourceSchema.parse(valid).manualId).toBe("manual:vol2")
    expect(() => ManualSourceSchema.parse({ ...valid, documentId: "short" })).toThrow()
    expect(() => ManualSourceSchema.parse({ ...valid, manualId: "vol2" })).toThrow() // manca namespace
  })

  it("pages range: min<=max obbligatorio", () => {
    expect(() =>
      ManualSourceSchema.parse({ ...valid, pages: [30, 10] }),
    ).toThrow()
    expect(ManualSourceSchema.parse({ ...valid, pages: [1, 120] }).pages).toEqual([1, 120])
  })
})

describe("ManualRef ↔ EvidenceRef", () => {
  it("round-trip format/parse sulla grammatica eventlog (manual:vol1:p30)", () => {
    const ref = ManualRefSchema.parse({ manualId: "manual:vol1", page: 30 })
    const evidence = manualRefToEvidence(ref)
    expect(evidence).toBe("manual:vol1:p30")
    expect(isValidEvidenceRef(evidence)).toBe(true)
    expect(parseManualEvidence(evidence)).toEqual(ref)
  })

  it("parse fail-closed su evidence non-manual o pagina malformata", () => {
    expect(parseManualEvidence("board:el-1")).toBeUndefined()
    expect(parseManualEvidence("manual:vol1:pagina30")).toBeUndefined()
    expect(parseManualEvidence("manual:vol1:p0")).toBeUndefined() // pagine 1-based
    expect(parseManualEvidence("manual:vol1:p-3")).toBeUndefined()
  })

  it("rifiuta page non intera o < 1", () => {
    expect(() => ManualRefSchema.parse({ manualId: "manual:vol1", page: 0 })).toThrow()
    expect(() => ManualRefSchema.parse({ manualId: "manual:vol1", page: 2.5 })).toThrow()
  })
})

// --- BoardCitation ---

describe("BoardCitation", () => {
  const citation = {
    boardElementId: "el-42",
    ref: { manualId: "manual:vol2", page: 55 },
    room: "classe-3b",
    t: 1720000000000,
  }

  it("produce evidence valida per assertEvidence (board + manual + lesson)", () => {
    const parsed = BoardCitationSchema.parse(citation)
    const evidence = boardCitationToEvidence(parsed)
    expect(evidence).toEqual([
      "board:el-42",
      "manual:vol2:p55",
      "lesson:classe-3b@1720000000000",
    ])
    // il contratto DEVE soddisfare la grammatica normativa dell'event-log
    expect(() => assertEvidence(evidence, "BoardCitation test")).not.toThrow()
  })

  it("senza room non inventa il ref lesson (mai inventare room)", () => {
    const { room: _room, ...noRoom } = citation
    const evidence = boardCitationToEvidence(BoardCitationSchema.parse(noRoom))
    expect(evidence).toEqual(["board:el-42", "manual:vol2:p55"])
  })

  it("boardElementId vuoto → reject", () => {
    expect(() => BoardCitationSchema.parse({ ...citation, boardElementId: "" })).toThrow()
  })
})

// --- ArdesiaModuleKind nel manifest (MARKETPLACE-CANON §2) ---

describe("manifest.kind", () => {
  const baseManifest = {
    manifestVersion: 1,
    id: "com.ardesia.sim-breadboard",
    name: "Breadboard",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: {},
    publisher: { id: "ardesia", pubkey: "ed25519:AAAA" },
    privacy: { dataOut: "none" },
  }

  it("kind assente = manifest legacy valido (retrocompatibilità)", () => {
    const parsed = ToolManifestSchema.parse(baseManifest)
    expect(parsed.kind).toBeUndefined()
  })

  it("accetta i 4 kind della regola di classificazione, rifiuta il resto", () => {
    for (const kind of ["core", "plugin", "pack", "workflow"]) {
      expect(ToolManifestSchema.parse({ ...baseManifest, kind }).kind).toBe(kind)
    }
    expect(() => ToolManifestSchema.parse({ ...baseManifest, kind: "theme" })).toThrow()
    expect(ArdesiaModuleKindSchema.options).toEqual(["core", "plugin", "pack", "workflow"])
  })

  it("chiavi sconosciute restano REJECT (strict non allentato)", () => {
    expect(() => ToolManifestSchema.parse({ ...baseManifest, extra: 1 })).toThrow()
  })

  // --- Campi marketplace (MARKETPLACE-CANON: author, visibility, licensing) ---

  it("author/visibility/license assenti = manifest legacy valido (stessa disciplina di kind)", () => {
    const parsed = ToolManifestSchema.parse(baseManifest)
    expect(parsed.author).toBeUndefined()
    expect(parsed.visibility).toBeUndefined()
    expect(parsed.license).toBeUndefined()
  })

  it("author: nome obbligatorio non vuoto, url opzionale valida, chiavi extra REJECT", () => {
    expect(
      ToolManifestSchema.parse({
        ...baseManifest,
        author: { name: "Andrea Marro", url: "https://ardesia.example" },
      }).author,
    ).toEqual({ name: "Andrea Marro", url: "https://ardesia.example" })
    expect(
      ToolManifestSchema.parse({ ...baseManifest, author: { name: "Andrea Marro" } }).author,
    ).toEqual({ name: "Andrea Marro" })
    expect(() => ToolManifestSchema.parse({ ...baseManifest, author: { name: "" } })).toThrow()
    expect(() =>
      ToolManifestSchema.parse({ ...baseManifest, author: { name: "A", url: "non-una-url" } }),
    ).toThrow()
    expect(() =>
      ToolManifestSchema.parse({ ...baseManifest, author: { name: "A", email: "x@y.z" } }),
    ).toThrow()
  })

  it("visibility: solo private | unlisted | public", () => {
    for (const visibility of ["private", "unlisted", "public"]) {
      expect(ToolManifestSchema.parse({ ...baseManifest, visibility }).visibility).toBe(visibility)
    }
    expect(() => ToolManifestSchema.parse({ ...baseManifest, visibility: "hidden" })).toThrow()
    expect(() => ToolManifestSchema.parse({ ...baseManifest, visibility: "" })).toThrow()
  })

  it("license: identificatore non vuoto e bounded (SPDX o LicenseRef), mai stringa vuota", () => {
    expect(ToolManifestSchema.parse({ ...baseManifest, license: "MIT" }).license).toBe("MIT")
    expect(
      ToolManifestSchema.parse({ ...baseManifest, license: "LicenseRef-ELAB-Proprietary" })
        .license,
    ).toBe("LicenseRef-ELAB-Proprietary")
    expect(() => ToolManifestSchema.parse({ ...baseManifest, license: "" })).toThrow()
    expect(() => ToolManifestSchema.parse({ ...baseManifest, license: "x".repeat(101) })).toThrow()
  })
})

// --- Event-bus tipizzato Core↔Plugin ---

describe("TypedEventBus", () => {
  it("consegna il payload al kind giusto e non agli altri", () => {
    const bus = createTypedEventBus<ArdesiaEventMap>()
    const cited = vi.fn()
    const step = vi.fn()
    bus.on("material.cited", cited)
    bus.on("lesson.step", step)
    bus.emit("material.cited", {
      t: 1,
      evidence: ["manual:vol1:p30"],
      materialId: "manual:vol1",
      labels: { it: "Vol.1 — p.30" },
    })
    expect(cited).toHaveBeenCalledTimes(1)
    expect(cited.mock.calls[0][0].materialId).toBe("manual:vol1")
    expect(step).not.toHaveBeenCalled()
  })

  it("unsubscribe ferma la consegna", () => {
    const bus = createTypedEventBus<ArdesiaEventMap>()
    const fn = vi.fn()
    const off = bus.on("lesson.step", fn)
    off()
    bus.emit("lesson.step", { t: 2, evidence: ["lesson:r@2"], stepIndex: 0, room: "r" })
    expect(fn).not.toHaveBeenCalled()
  })

  it("un handler che lancia non blocca gli altri (isolamento)", () => {
    const bus = createTypedEventBus<ArdesiaEventMap>()
    const boom = vi.fn(() => {
      throw new Error("boom")
    })
    const after = vi.fn()
    const onError = vi.fn()
    bus.on("lesson.step", boom)
    bus.on("lesson.step", after)
    bus.onHandlerError(onError)
    bus.emit("lesson.step", { t: 3, evidence: ["lesson:r@3"], stepIndex: 1, room: "r" })
    expect(after).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
