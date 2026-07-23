// @vitest-environment jsdom
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
