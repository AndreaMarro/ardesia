// @vitest-environment jsdom
// ARD-06 §6 — precedenza della phase e normalizzazione corrupt.
// La regola che conta: una sorgente corrotta NON autorizza una projection
// parziale dalle altre sorgenti.
import { describe, it, expect } from "vitest"
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
