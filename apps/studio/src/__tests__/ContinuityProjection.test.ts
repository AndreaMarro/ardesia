// ARD-06 §6 — precedenza della phase e normalizzazione corrupt.
// La regola che conta: una sorgente corrotta NON autorizza una projection
// parziale dalle altre sorgenti.
import { beforeEach, describe, it, expect } from "vitest"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
import {
  projectContinuityV1,
  validateContinuityScopeV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "../lessonos/continuityProjection"

const SCOPE = validateContinuityScopeV1({
  lessonId: "lezione-a",
  roomId: "lezione-a",
  sessionId: "11111111-1111-4111-8111-111111111111",
})

function emptySnapshot(
  overrides: Partial<ScopedContinuitySnapshotV1> = {},
): ScopedContinuitySnapshotV1 {
  return {
    scope: SCOPE,
    session: null,
    lessonEvents: [],
    journalEvents: [],
    scene: null,
    buildCommitSha: null,
    evidenceByOccurrence: new Map(),
    issues: [],
    ...overrides,
  }
}

const CORRUPT_ISSUE: ContinuitySourceIssueV1 = {
  source: "journal",
  severity: "corrupt",
  code: "invalid-schema",
  preserved: { path: "raw/lezione-a/events.jsonl", sha256: "b".repeat(64), bytes: 12 },
}

const DEGRADED_ISSUE: ContinuitySourceIssueV1 = {
  source: "lesson-event-log",
  severity: "degraded",
  code: "unavailable",
  preserved: null,
}

describe("projectContinuityV1 — precedenza della phase", () => {
  it("senza fatti e senza issue la phase è empty e l'azione è reopen-lesson", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(projection.phase).toBe("empty")
    expect(projection.sourceHealth.status).toBe("verified")
    expect(projection.nextAction.kind).toBe("reopen-lesson")
    expect(projection.nextAction.priority).toBe(4)
  })

  it("una issue degraded rende la phase degraded, non empty", () => {
    const projection = projectContinuityV1(emptySnapshot({ issues: [DEGRADED_ISSUE] }))
    expect(projection.phase).toBe("degraded")
    expect(projection.sourceHealth.status).toBe("degraded")
  })

  it("una issue corrupt vince su una degraded", () => {
    const projection = projectContinuityV1(
      emptySnapshot({ issues: [DEGRADED_ISSUE, CORRUPT_ISSUE] }),
    )
    expect(projection.phase).toBe("corrupt")
    expect(projection.sourceHealth.status).toBe("corrupt")
  })

  it("con phase corrupt nessun fatto di contenuto viene esposto", () => {
    const projection = projectContinuityV1(
      emptySnapshot({
        issues: [CORRUPT_ISSUE],
        session: {
          document: {
            v: 2,
            lessonId: "lezione-a",
            sessionId: SCOPE.sessionId,
            created: 1,
            revision: 3,
            audioConsent: false,
            audioStartEpoch: null,
          },
          sha256: "c".repeat(64),
        },
      }),
    )
    expect(projection.session).toBeNull()
    expect(projection.lastVerifiedResult).toBeNull()
    expect(projection.openLoops).toEqual([])
    expect(projection.recentMaterials).toEqual([])
    expect(projection.missingEvidence).toEqual([])
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.nextAction.kind).toBe("recover-continuity")
    expect(projection.nextAction.priority).toBe(0)
  })

  it("la projection è deterministica byte per byte sullo stesso snapshot", () => {
    const snapshot = emptySnapshot({ issues: [DEGRADED_ISSUE] })
    expect(JSON.stringify(projectContinuityV1(snapshot)))
      .toBe(JSON.stringify(projectContinuityV1(snapshot)))
  })

  it("espone sempre esattamente una nextAction, mai un array o null", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(Array.isArray(projection.nextAction)).toBe(false)
    expect(projection.nextAction).not.toBeNull()
  })
})

// --- RED-06-04: open loop ---

let nextSeq = 1

function lessonEvent(
  kind: string,
  payload: Record<string, unknown>,
  occurredAt: string,
): AppendedEventEnvelopeV2 {
  const seq = nextSeq++
  return {
    schemaVersion: 2,
    eventId: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId: SCOPE.lessonId,
    sessionId: SCOPE.sessionId,
    kind,
    occurredAt,
    actor: { type: "teacher", id: "docente" },
    producer: {
      id: "com.github.andreamarro.ardesia.studio",
      version: "0.0.0",
      commitSha: "a".repeat(40),
    },
    causationId: null,
    idempotencyKey: null,
    evidence: [],
    payload,
    seq,
  } as unknown as AppendedEventEnvelopeV2
}

function observed(errorId: string, occurredAt: string, label = "Corto"): AppendedEventEnvelopeV2 {
  return lessonEvent(
    "error.observed",
    { room: SCOPE.roomId, errorId, conceptId: "c-1", label: { it: label } },
    occurredAt,
  )
}

function corrected(errorId: string, occurredAt: string): AppendedEventEnvelopeV2 {
  return lessonEvent(
    "exercise.completed",
    { room: SCOPE.roomId, correctsErrorId: errorId },
    occurredAt,
  )
}

describe("projectContinuityV1 — open loop (RED-06-04)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("un error.observed apre un loop", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [observed("err-X", "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
    expect(projection.openLoops[0]!.observedCount).toBe(1)
  })

  it("un exercise.completed che corregge X chiude X", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        observed("err-X", "2026-07-23T00:00:01.000Z"),
        corrected("err-X", "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.openLoops).toEqual([])
  })

  it("una ri-osservazione dopo la correzione riapre il loop con count 2", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        observed("err-X", "2026-07-23T00:00:01.000Z"),
        corrected("err-X", "2026-07-23T00:00:02.000Z"),
        observed("err-X", "2026-07-23T00:00:03.000Z"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
    expect(projection.openLoops[0]!.observedCount).toBe(2)
  })

  it("una correzione di un errorId ignoto non chiude X", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        observed("err-X", "2026-07-23T00:00:01.000Z"),
        corrected("err-IGNOTO", "2026-07-23T00:00:02.000Z"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-X"])
  })

  it("una correzione PRIMA dell'osservazione non inventa un loop", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [corrected("err-X", "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.openLoops).toEqual([])
  })

  it("lastUncorrectedError è lo stesso oggetto logico di openLoops[0]", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        observed("err-1", "2026-07-23T00:00:01.000Z", "A"),
        observed("err-2", "2026-07-23T00:00:02.000Z", "B"),
      ],
    }))
    expect(projection.lastUncorrectedError).toBe(projection.openLoops[0])
  })

  it("con un open loop la nextAction è resume-open-loop a priorità 2", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [observed("err-X", "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.nextAction.kind).toBe("resume-open-loop")
    expect(projection.nextAction.priority).toBe(2)
  })

  it("gli open loop sono ordinati per lastObserved seq DESC, poi errorId ASC", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [
        observed("err-a", "2026-07-23T00:00:01.000Z", "A"),
        observed("err-b", "2026-07-23T00:00:02.000Z", "B"),
      ],
    }))
    expect(projection.openLoops.map((loop) => loop.errorId)).toEqual(["err-b", "err-a"])
  })

  it("con fatti riprendibili la phase diventa ready", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [observed("err-X", "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.phase).toBe("ready")
  })
})

// --- RED-06-06: Simulation fail-closed ---
//
// G2 (ARD-07) NON e' accepted su origin/main@fddda617: simulationSolveEvent.ts
// non porta instanceId, sceneDigest, pluginVersion ne' commitSha. Quindi in
// questa slice gli stati ready ed error-open sono irraggiungibili PER
// COSTRUZIONE, e questi test lo congelano.

const SCENE_DIGEST = "d".repeat(64)

function sceneWithEmbeds(
  embeds: readonly { instanceId: string; pluginId: string; sceneDigest: string | null }[],
): NonNullable<ScopedContinuitySnapshotV1["scene"]> {
  return {
    sha256: "e".repeat(64),
    elements: [],
    simulationEmbeds: embeds,
  }
}

describe("projectContinuityV1 — Simulation fail-closed (RED-06-06)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("zero mount e zero embed -> not-mounted", () => {
    const projection = projectContinuityV1(emptySnapshot())
    expect(projection.simulation.status).toBe("not-mounted")
    expect(projection.simulation.instance).toBeNull()
  })

  it("embed nella scena senza plugin.mounted -> unavailable/mount-receipt-missing", () => {
    const projection = projectContinuityV1(emptySnapshot({
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "mount-receipt-missing" })
    expect(projection.simulation.instance).toBeNull()
  })

  it("due embed -> unavailable/multiple-instances", () => {
    const projection = projectContinuityV1(emptySnapshot({
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
        { instanceId: "embed-2", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "multiple-instances" })
  })

  it("un plugin.mounted senza payload.room non crea istanza (ARD-07 non accepted)", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent("plugin.mounted", { instanceId: "embed-1" }, "2026-07-23T00:00:01.000Z")],
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "event-contract-legacy" })
    expect(projection.lastVerifiedResult).toBeNull()
  })

  it("un plugin.mounted con room canonica resta legacy finche' ARD-07 non e' accepted", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent(
        "plugin.mounted",
        { room: SCOPE.roomId, instanceId: "embed-1" },
        "2026-07-23T00:00:01.000Z",
      )],
      scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]),
    }))
    expect(projection.simulation.status).toBe("unavailable")
    expect(projection.simulation).toMatchObject({ reason: "event-contract-legacy" })
  })

  it("un evento simulation legacy senza instanceId non produce mai lastVerifiedResult", () => {
    const projection = projectContinuityV1(emptySnapshot({
      lessonEvents: [lessonEvent(
        "simulation.solved",
        { room: SCOPE.roomId, currentMa: 15.3 },
        "2026-07-23T00:00:01.000Z",
      )],
    }))
    expect(projection.lastVerifiedResult).toBeNull()
    expect(projection.simulation.status).not.toBe("ready")
  })

  it("nessuna fixture di questo file puo' produrre ready o error-open", () => {
    for (const snapshot of [
      emptySnapshot(),
      emptySnapshot({ scene: sceneWithEmbeds([
        { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
      ]) }),
      emptySnapshot({
        lessonEvents: [lessonEvent("plugin.mounted", { room: SCOPE.roomId, instanceId: "embed-1" }, "2026-07-23T00:00:01.000Z")],
        scene: sceneWithEmbeds([
          { instanceId: "embed-1", pluginId: "io.ardesia.simulation", sceneDigest: SCENE_DIGEST },
        ]),
      }),
    ]) {
      const status = projectContinuityV1(snapshot).simulation.status
      expect(status).not.toBe("ready")
      expect(status).not.toBe("error-open")
    }
  })
})

// --- RED-06-05: required set, ordine P0 totale, permutation oracle ---

function issue(
  source: ContinuitySourceIssueV1["source"],
  severity: ContinuitySourceIssueV1["severity"],
  code: ContinuitySourceIssueV1["code"],
  preserved: ContinuitySourceIssueV1["preserved"] = null,
): ContinuitySourceIssueV1 {
  return { source, severity, code, preserved }
}

/** Shuffle deterministico: nessun Math.random nei test. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items]
  let state = seed
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    const j = state % (i + 1)
    const swap = out[i]!
    out[i] = out[j]!
    out[j] = swap
  }
  return out
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) out.push([items[i]!, ...tail])
  }
  return out
}

describe("projectContinuityV1 — nextAction P0 (RED-06-05)", () => {
  beforeEach(() => { nextSeq = 1 })

  it("una issue corrupt su sorgente opzionale e' comunque P0", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [issue("plugin-artifact", "corrupt", "digest-mismatch")],
    }))
    expect(projection.nextAction.kind).toBe("recover-continuity")
  })

  it("una issue degraded su sorgente RICHIESTA e' P0", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [issue("session", "degraded", "unavailable")],
    }))
    expect(projection.nextAction.kind).toBe("recover-continuity")
    expect(projection.nextAction).toMatchObject({
      reason: { kind: "source", source: "session" },
    })
  })

  it("una issue degraded su sorgente OPZIONALE non forza P0", () => {
    // plugin-artifact non e' richiesto: nessun evento Simulation, nessun embed.
    const projection = projectContinuityV1(emptySnapshot({
      issues: [issue("plugin-artifact", "degraded", "missing")],
      lessonEvents: [observed("err-X", "2026-07-23T00:00:01.000Z")],
    }))
    expect(projection.phase).toBe("degraded")
    expect(projection.nextAction.kind).toBe("resume-open-loop")
  })

  it("corrupt precede degraded richiesta", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("session", "degraded", "unavailable"),
        issue("journal", "corrupt", "invalid-schema"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({
      reason: { source: "journal", severity: "corrupt" },
    })
  })

  it("a parita' di severity vince SOURCE_ORDER", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema"),
        issue("session", "corrupt", "invalid-schema"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({ reason: { source: "session" } })
  })

  it("a parita' di source vince SOURCE_CODE_ORDER", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema"),
        issue("journal", "corrupt", "duplicate-event-id"),
      ],
    }))
    expect(projection.nextAction).toMatchObject({ reason: { code: "duplicate-event-id" } })
  })

  it("a parita' di source e code, path/sha256/bytes rendono l'ordine totale", () => {
    const projection = projectContinuityV1(emptySnapshot({
      issues: [
        issue("journal", "corrupt", "invalid-schema", { path: "b.jsonl", sha256: "0".repeat(64), bytes: 2 }),
        issue("journal", "corrupt", "invalid-schema", { path: "a.jsonl", sha256: "0".repeat(64), bytes: 1 }),
      ],
    }))
    expect(projection.nextAction).toMatchObject({
      reason: { preserved: { path: "a.jsonl" } },
    })
  })

  it("permutation oracle: 3! ordini + 100 shuffle seeded danno byte identici", () => {
    const issues = [
      issue("journal", "corrupt", "invalid-schema", { path: "a.jsonl", sha256: "1".repeat(64), bytes: 10 }),
      issue("session", "degraded", "unavailable"),
      issue("scene", "corrupt", "digest-mismatch", { path: "s.excalidraw", sha256: "2".repeat(64), bytes: 20 }),
    ]
    const baseline = JSON.stringify(projectContinuityV1(emptySnapshot({ issues })))

    const orders = permutations(issues)
    expect(orders).toHaveLength(6)
    for (const permutation of orders) {
      expect(JSON.stringify(projectContinuityV1(emptySnapshot({ issues: permutation }))))
        .toBe(baseline)
    }
    for (let seed = 1; seed <= 100; seed += 1) {
      expect(JSON.stringify(projectContinuityV1(emptySnapshot({ issues: seededShuffle(issues, seed) }))))
        .toBe(baseline)
    }
  })

  it("sourceHealth.issues usa lo stesso comparator della selezione", () => {
    const issues = [
      issue("scene", "corrupt", "digest-mismatch"),
      issue("session", "corrupt", "invalid-schema"),
      issue("journal", "degraded", "missing"),
    ]
    const forward = projectContinuityV1(emptySnapshot({ issues }))
    const reversed = projectContinuityV1(emptySnapshot({ issues: [...issues].reverse() }))
    expect(forward.sourceHealth.issues.map((entry) => entry.source))
      .toEqual(reversed.sourceHealth.issues.map((entry) => entry.source))
    expect(forward.sourceHealth.issues[0]!.source).toBe("session")
  })

  it("esiste sempre esattamente una nextAction in ogni fixture", () => {
    for (const snapshot of [
      emptySnapshot(),
      emptySnapshot({ issues: [issue("session", "degraded", "unavailable")] }),
      emptySnapshot({ issues: [issue("journal", "corrupt", "invalid-schema")] }),
      emptySnapshot({ lessonEvents: [observed("err-X", "2026-07-23T00:00:01.000Z")] }),
    ]) {
      const projection = projectContinuityV1(snapshot)
      expect(typeof projection.nextAction.kind).toBe("string")
      expect(Array.isArray(projection.nextAction)).toBe(false)
    }
  })
})
