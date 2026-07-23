// ARD-06 §5.1/§5.2/§5.3 — RED-06-01 (scope a effetto zero) e RED-06-02
// (call ledger esatto, zero path flat, readAll che esplode se toccato).
//
// Il punto non e' che il loader legga i path giusti: e' che NON possa leggerne
// altri. La porta iniettata espone un readAll che lancia, e il ledger delle
// chiamate viene asserito per intero, non per inclusione.
import { describe, it, expect } from "vitest"
import { loadContinuitySnapshotV1 } from "../lessonos/continuityLoader"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"

const LESSON_A = "lezione-a"
const SA = "11111111-1111-4111-8111-111111111111"

function spyDeps(files: Map<string, string> = new Map()) {
  const calls: string[] = []
  const deps = {
    calls,
    reader: {
      persistence: { kind: "verified-indexeddb" as const, database: "lessonos-eventlog" },
      readEnvelopesBySession: async (lessonId: string, sessionId: string) => {
        calls.push(`query:${lessonId}:${sessionId}`)
        return [] as readonly AppendedEventEnvelopeV2[]
      },
      // Presente ma vietato nel path Founder: se il loader lo tocca, esplode.
      readAll: () => { throw new Error("readAll e' vietato nel path Founder") },
      readAllEnvelopes: () => { throw new Error("readAllEnvelopes e' vietato nel path Founder") },
    },
    workspace: {
      read: async (path: string) => {
        calls.push(`read:${path}`)
        const text = files.get(path)
        return text === undefined ? null : new Blob([text])
      },
    },
  }
  return deps
}

describe("loadContinuitySnapshotV1 — scope ed effetto zero (RED-06-01)", () => {
  it("roomId diverso da lessonId fallisce PRIMA di ogni read", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: "lezione-b", sessionId: SA },
      deps,
    )).rejects.toThrow(/room-lesson-mismatch/)
    expect(deps.calls).toEqual([])
  })

  it("un sessionId non canonico fallisce prima di ogni read", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: LESSON_A, sessionId: "NON-UN-UUID" },
      deps,
    )).rejects.toThrow(/invalid-session-id/)
    expect(deps.calls).toEqual([])
  })

  it("un UUID con esadecimali maiuscoli non e' canonico: nessuna read", async () => {
    const deps = spyDeps()
    // SA e' tutto cifre: toUpperCase() sarebbe un no-op e il test non proverebbe
    // nulla. Serve un UUID che contenga davvero lettere esadecimali.
    const upper = "AABBCCDD-1111-4111-8111-111111111111"
    expect(upper).not.toBe(upper.toLowerCase())
    await expect(loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: LESSON_A, sessionId: upper },
      deps,
    )).rejects.toThrow(/invalid-session-id/)
    expect(deps.calls).toEqual([])
  })

  it("non inventa mai uno scope di default da valori vuoti", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: "", roomId: "", sessionId: "" },
      deps,
    )).rejects.toThrow(/invalid-lesson-id/)
    expect(deps.calls).toEqual([])
  })

  it("un lessonId con traversal fallisce prima di ogni read", async () => {
    const deps = spyDeps()
    await expect(loadContinuitySnapshotV1(
      { lessonId: "../altro", roomId: "../altro", sessionId: SA },
      deps,
    )).rejects.toThrow(/invalid-lesson-id/)
    expect(deps.calls).toEqual([])
  })
})

describe("loadContinuitySnapshotV1 — call ledger esatto (RED-06-02)", () => {
  it("legge ESATTAMENTE session A/SA, journal A, scene A e la query A/SA", async () => {
    const deps = spyDeps()
    await loadContinuitySnapshotV1({ lessonId: LESSON_A, roomId: LESSON_A, sessionId: SA }, deps)

    expect([...deps.calls].sort()).toEqual([
      `query:${LESSON_A}:${SA}`,
      `read:raw/${LESSON_A}/${SA}/session.yaml`,
      `read:raw/${LESSON_A}/board.excalidraw`,
      `read:raw/${LESSON_A}/events.jsonl`,
    ])
    // Ledger completo: quattro chiamate, non "almeno" quattro.
    expect(deps.calls).toHaveLength(4)
  })

  it("non tocca mai i path flat legacy", async () => {
    const deps = spyDeps()
    await loadContinuitySnapshotV1({ lessonId: LESSON_A, roomId: LESSON_A, sessionId: SA }, deps)

    for (const forbidden of ["raw/events.jsonl", "raw/session.yaml", "raw/board.excalidraw"]) {
      expect(deps.calls).not.toContain(`read:${forbidden}`)
    }
  })

  it("una query che restituisce un envelope di un'altra lezione rende la sorgente corrupt", async () => {
    const deps = spyDeps()
    deps.reader.readEnvelopesBySession = async () => [
      {
        lessonId: "lezione-b", sessionId: SA, seq: 1,
        eventId: "00000000-0000-4000-8000-000000000001",
        kind: "lesson.started", payload: { room: "lezione-b" },
      },
    ] as unknown as readonly AppendedEventEnvelopeV2[]

    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: LESSON_A, sessionId: SA }, deps,
    )

    expect(snapshot.issues).toContainEqual({
      source: "event-union", severity: "corrupt", code: "scope-violation", preserved: null,
    })
    // Zero fatti dalla sorgente violata, e la sentinella non sopravvive.
    expect(snapshot.lessonEvents).toEqual([])
    expect(JSON.stringify(snapshot)).not.toContain("lezione-b")
  })

  it("una query che restituisce un'altra sessione della stessa lezione e' comunque corrupt", async () => {
    const deps = spyDeps()
    deps.reader.readEnvelopesBySession = async () => [
      {
        lessonId: LESSON_A, sessionId: "22222222-2222-4222-8222-222222222222", seq: 1,
        eventId: "00000000-0000-4000-8000-000000000002",
        kind: "lesson.started", payload: { room: LESSON_A },
      },
    ] as unknown as readonly AppendedEventEnvelopeV2[]

    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: LESSON_A, sessionId: SA }, deps,
    )

    expect(snapshot.issues.some((entry) => entry.code === "scope-violation")).toBe(true)
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("ordina gli eventi in scope per seq, non per ordine di consegna", async () => {
    const deps = spyDeps()
    deps.reader.readEnvelopesBySession = async () => [3, 1, 2].map((seq) => ({
      lessonId: LESSON_A, sessionId: SA, seq,
      eventId: `00000000-0000-4000-8000-00000000000${seq}`,
      kind: "error.observed", payload: {},
    })) as unknown as readonly AppendedEventEnvelopeV2[]

    const snapshot = await loadContinuitySnapshotV1(
      { lessonId: LESSON_A, roomId: LESSON_A, sessionId: SA }, deps,
    )

    expect(snapshot.lessonEvents.map((event) => event.seq)).toEqual([1, 2, 3])
    expect(snapshot.issues).toEqual([])
  })
})
