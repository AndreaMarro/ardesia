// @vitest-environment jsdom
//
// ARD-06 §5.2 fail-closed loader: BETA-003-CONTINUITY-FAIL-CLOSED-STORAGE.
//
// Il loader deve rifiutare lo scope PRIMA di aprire IndexedDB, workspace,
// journal o scena; distinguere la persistenza reale sia del reader eventi
// sia del reader workspace da un fallback in-memory; rigettare envelope
// corrotti (schema, seq, identita', payload.room, idempotencyKey) come
// issue tipate; conservare stati distinguibili per FSA loss, workspace
// unavailable, session mancante, journal legacy e build mancante o
// disallineato; e ricostruire lo stesso snapshot in un cold reopen con
// adapter freschi, chiudendo ogni handle anche sui rami degradati. Nessun
// test qui pretende che la route Room sia raggiungibile (BETA-002 e' il
// record causale immutabile).

import { afterEach, describe, it, expect } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
  loadScopedContinuitySnapshot,
  openIndexedDbContinuityEventReader,
  type ContinuityEventReaderV1,
  type ContinuityWorkspacePersistenceV1,
  type ContinuityWorkspaceReaderV1,
  type ContinuityRuntimeAdapterFactories,
  type LoadScopedContinuityResultV1,
} from "../lessonos/continuityRuntime"
import {
  projectContinuityV1,
  validateContinuityScopeV1,
  type ContinuityProjectionV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "../lessonos/continuityProjection"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
import {
  IndexedDbEventLog,
  openIndexedDbEventLog,
} from "../lessonos/indexedDbEventLog"
import ContinuityResumeCard from "../design/ContinuityResumeCard"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { createWorkspaceStoreContinuityWorkspaceReader } from "../lessonos/continuityRuntime"

const LESSON_ID = "lezione-a"
const SESSION_ID = "11111111-1111-4111-8111-111111111111"
const OTHER_SESSION_ID = "22222222-2222-4222-8222-222222222222"
const SCOPE_INPUT = { lessonId: LESSON_ID, roomId: LESSON_ID, sessionId: SESSION_ID }
const SCOPE = SCOPE_INPUT
const BUILD_SHA = "a".repeat(40)
const OTHER_BUILD_SHA = "b".repeat(40)

function loadedOrThrow(result: LoadScopedContinuityResultV1) {
  if (result.kind !== "loaded") throw new Error(`expected loaded, got ${result.kind}`)
  return result.snapshot
}

function envelope(
  seq: number,
  overrides: Partial<AppendedEventEnvelopeV2> = {},
): AppendedEventEnvelopeV2 {
  const base: AppendedEventEnvelopeV2 = Object.freeze({
    schemaVersion: 2,
    eventId: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId: LESSON_ID,
    sessionId: SESSION_ID,
    kind: "lesson.started",
    occurredAt: `2026-07-23T00:00:${String(seq).padStart(2, "0")}.000Z`,
    actor: { type: "teacher", id: "founder-beta-teacher" },
    producer: {
      id: "com.github.andreamarro.ardesia.studio",
      version: "0.0.0",
      commitSha: BUILD_SHA,
    },
    causationId: null,
    idempotencyKey: null,
    evidence: [{ ref: `lesson:${LESSON_ID}@${seq}`, resolution: "verified" }],
    payload: { room: LESSON_ID },
    seq,
  }) as AppendedEventEnvelopeV2
  return Object.freeze({ ...base, ...overrides }) as AppendedEventEnvelopeV2
}

type SpyReader = ContinuityEventReaderV1 & { disposeCount: number; readCount: number }
type SpyWorkspace = ContinuityWorkspaceReaderV1 & {
  disposeCount: number
  reads: string[]
}

function verifiedReader(
  envelopes: readonly AppendedEventEnvelopeV2[],
  database = "lessonos-eventlog",
): SpyReader {
  const reader: SpyReader = {
    persistence: { kind: "verified-indexeddb", database },
    disposeCount: 0,
    readCount: 0,
    async readEnvelopesBySession(lessonId, sessionId) {
      reader.readCount += 1
      return envelopes.filter((event) => (
        event.lessonId === lessonId && event.sessionId === sessionId
      ))
    },
    async dispose() {
      reader.disposeCount += 1
    },
  }
  return reader
}

function inMemoryWorkspace(
  files: ReadonlyMap<string, Blob>,
  persistence: ContinuityWorkspacePersistenceV1 = { kind: "fsa" },
): SpyWorkspace {
  // Default e' fsa (autoritativo) perche' la maggior parte dei test verifica
  // un workspace verificato; i test che vogliono coprire la non-authoritative
  // di localStorage lo dichiarano esplicitamente.
  const reader: SpyWorkspace = {
    persistence,
    disposeCount: 0,
    reads: [],
    async read(path: string) {
      reader.reads.push(path)
      return files.get(path) ?? null
    },
    async dispose() {
      reader.disposeCount += 1
    },
  }
  return reader
}

function trackingFactories(overrides: {
  eventReader?: () => Promise<ContinuityEventReaderV1>
  workspaceReader?: () => Promise<ContinuityWorkspaceReaderV1>
  buildCommitSha?: string | null
} = {}): ContinuityRuntimeAdapterFactories & { calls: { event: number; workspace: number } } {
  const calls = { event: 0, workspace: 0 }
  const eventReader = overrides.eventReader
    ?? (async () => verifiedReader([]))
  const workspaceReader = overrides.workspaceReader
    ?? (async () => inMemoryWorkspace(new Map()))
  // NB: usare `in` invece di ?? per non mangiare un `null` esplicito passato
  // dai test (il difetto pagato: buildCommitSha: null diventava BUILD_SHA).
  const buildCommitSha = "buildCommitSha" in overrides
    ? overrides.buildCommitSha ?? null
    : BUILD_SHA
  return {
    calls,
    async createEventReader() {
      calls.event += 1
      return eventReader()
    },
    async createWorkspaceReader() {
      calls.workspace += 1
      return workspaceReader()
    },
    buildCommitSha,
  }
}

/**
 * Canonicalizer che espande evidenceByOccurrence (i Map serializzano come
 * `{}` con JSON.stringify: usarlo come oracolo di uguaglianza nasconde
 * proprio l'evidence, che e' quello che stiamo confrontando). Ordina le
 * chiavi per rendere il confronto deterministico anche se l'insertion
 * order dovesse cambiare.
 */
function canonicalSnapshot(snapshot: ReturnType<typeof loadedOrThrow>): string {
  const evidence = [...snapshot.evidenceByOccurrence.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => [key, value])
  return JSON.stringify({
    scope: snapshot.scope,
    session: snapshot.session,
    lessonEvents: snapshot.lessonEvents,
    journalEvents: snapshot.journalEvents,
    scene: snapshot.scene,
    buildCommitSha: snapshot.buildCommitSha,
    evidenceByOccurrence: evidence,
    issues: snapshot.issues,
  })
}

describe("loadScopedContinuitySnapshot — scope-first zero-I/O (accept #1)", () => {
  it("scope invalido: nessuna factory chiamata, nessun byte letto", async () => {
    const factories = trackingFactories()
    const result = await loadScopedContinuitySnapshot(
      { lessonId: "lezione-a", roomId: "lezione-b", sessionId: SESSION_ID },
      factories,
    )
    expect(result.kind).toBe("scope-invalid")
    if (result.kind === "scope-invalid") {
      expect(result.code).toBe("room-lesson-mismatch")
    }
    expect(factories.calls.event).toBe(0)
    expect(factories.calls.workspace).toBe(0)
  })

  it("sessionId non canonico: nessuna factory chiamata", async () => {
    const factories = trackingFactories()
    const result = await loadScopedContinuitySnapshot(
      { lessonId: LESSON_ID, roomId: LESSON_ID, sessionId: "not-a-uuid" },
      factories,
    )
    expect(result.kind).toBe("scope-invalid")
    expect(factories.calls.event).toBe(0)
    expect(factories.calls.workspace).toBe(0)
  })

  it("lessonId vuoto: nessuna factory chiamata", async () => {
    const factories = trackingFactories()
    const result = await loadScopedContinuitySnapshot(
      { lessonId: "", roomId: "", sessionId: SESSION_ID },
      factories,
    )
    expect(result.kind).toBe("scope-invalid")
    expect(factories.calls.event).toBe(0)
    expect(factories.calls.workspace).toBe(0)
  })
})

describe("loadScopedContinuitySnapshot — persistenza eventi (accept #2)", () => {
  it("IndexedDB unavailable: lesson-event-log/degraded/unavailable, mai verified-indexeddb", async () => {
    const spy: SpyReader = {
      persistence: { kind: "unavailable", code: "indexeddb-unavailable" },
      disposeCount: 0,
      readCount: 0,
      async readEnvelopesBySession() {
        spy.readCount += 1
        return []
      },
      async dispose() {
        spy.disposeCount += 1
      },
    }
    const factories = trackingFactories({ eventReader: async () => spy })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("unavailable")
    expect(snapshot.lessonEvents).toEqual([])
    // Il read viene saltato ma il dispose deve comunque essere invocato (accept #5).
    expect(spy.readCount).toBe(0)
    expect(spy.disposeCount).toBe(1)
  })

  it("data-loss: issue distinta lesson-event-log/degraded/data-loss e dispose sempre chiamato", async () => {
    const spy: SpyReader = {
      persistence: { kind: "data-loss", code: "legacy-physical-rows", database: "lessonos-eventlog" },
      disposeCount: 0,
      readCount: 0,
      async readEnvelopesBySession() {
        spy.readCount += 1
        return []
      },
      async dispose() {
        spy.disposeCount += 1
      },
    }
    const factories = trackingFactories({ eventReader: async () => spy })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("data-loss")
    // data-loss consente la query di scope: se il read torna zero righe canoniche,
    // la projection resta empty ma con issue visibile.
    expect(spy.readCount).toBe(1)
    expect(spy.disposeCount).toBe(1)
  })

  it("corrupt persistence: lesson-event-log/corrupt/invalid-schema, projection non ready, dispose chiamato", async () => {
    const spy: SpyReader = {
      persistence: { kind: "corrupt", code: "sequence-non-contiguous" },
      disposeCount: 0,
      readCount: 0,
      async readEnvelopesBySession() {
        spy.readCount += 1
        return []
      },
      async dispose() {
        spy.disposeCount += 1
      },
    }
    const factories = trackingFactories({ eventReader: async () => spy })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
    expect(snapshot.lessonEvents).toEqual([])
    // Corrupt salta il read: e' il dispose (finally del loader) che chiude la handle.
    expect(spy.readCount).toBe(0)
    expect(spy.disposeCount).toBe(1)
  })
})

describe("loadScopedContinuitySnapshot — validazione stretta envelope (accept #3)", () => {
  it("scope-violation: envelope con lessonId sbagliato marca lesson-event-log/corrupt/scope-violation", async () => {
    const bad = envelope(1, { lessonId: "altra-lezione" })
    // verifiedReader filtra per scope: qui vogliamo esporre l'oracolo del
    // loader anche a un adapter avversario che restituisce un envelope A/SB.
    const factories = trackingFactories({
      eventReader: async () => ({
        persistence: { kind: "verified-indexeddb", database: "lessonos-eventlog" },
        async readEnvelopesBySession() {
          return [bad]
        },
        async dispose() {},
      }),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("scope-violation")
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("scope-violation: envelope con sessionId sbagliato viene rifiutato", async () => {
    // Il verifiedReader filtra per scope, quindi passiamo un reader che NON
    // filtra per esporre l'oracolo del loader anche a righe restituite in modo
    // scorretto dal backend.
    const bad = envelope(1, { sessionId: OTHER_SESSION_ID })
    const factories = trackingFactories({
      eventReader: async () => ({
        persistence: { kind: "verified-indexeddb", database: "lessonos-eventlog" },
        async readEnvelopesBySession() {
          return [bad]
        },
        async dispose() {},
      }),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("scope-violation")
  })

  it("duplicate eventId dentro lesson log: corrupt/duplicate-event-id", async () => {
    const first = envelope(1)
    const dup = envelope(2, { eventId: first.eventId })
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([first, dup]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.code).toBe("duplicate-event-id")
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("duplicate idempotencyKey non-null: corrupt/duplicate-event-id", async () => {
    const first = envelope(1, { idempotencyKey: "same-key" })
    const dup = envelope(2, {
      eventId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      idempotencyKey: "same-key",
    })
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([first, dup]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.code).toBe("duplicate-event-id")
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("seq non monotona: corrupt/invalid-schema", async () => {
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([envelope(2), envelope(1)]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("invalid-schema")
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("seq duplicata: corrupt/invalid-schema", async () => {
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([
        envelope(1),
        envelope(1, { eventId: "00000000-0000-4000-8000-000000000099" }),
      ]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
  })

  it("schemaVersion sbagliato: corrupt/invalid-schema", async () => {
    const bad = { ...envelope(1), schemaVersion: 1 } as unknown as AppendedEventEnvelopeV2
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([bad]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("invalid-schema")
  })

  it("envelope validi: lessonEvents esposti in ordine di seq, nessuna issue lesson-event-log", async () => {
    const events = [envelope(1), envelope(2), envelope(3)]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.lessonEvents.map((event) => event.seq)).toEqual([1, 2, 3])
    expect(snapshot.issues.some((entry) => entry.source === "lesson-event-log")).toBe(false)
  })
})

describe("loadScopedContinuitySnapshot — invarianti scope ridondanti (accept #3)", () => {
  it("lesson.started con payload.room=B su envelope A/SA: event-union/corrupt/scope-violation, zero fatti", async () => {
    const rogue = envelope(1, {
      kind: "lesson.started",
      payload: { room: "lezione-b" },
    })
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([rogue]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "event-union")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("scope-violation")
    expect(snapshot.lessonEvents).toEqual([])
    // La stringa sentinella `lezione-b` non appare nella serializzazione:
    // nessun fatto viene esposto dopo la violazione (design §5.4 I1).
    expect(canonicalSnapshot(snapshot)).not.toContain("lezione-b")
  })

  it("plugin.mounted con payload.room=B su envelope A/SA: event-union/corrupt/scope-violation", async () => {
    const rogue = envelope(1, {
      kind: "plugin.mounted",
      payload: {
        room: "lezione-b",
        pluginId: "io.ardesia.simulation",
        pluginKind: "plugin",
        instanceId: "embed-1",
        labels: { it: "Simulation" },
      },
    })
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([rogue]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "event-union" && entry.code === "scope-violation"
    ))
    expect(issue?.severity).toBe("corrupt")
    expect(snapshot.lessonEvents).toEqual([])
  })

  it("plugin.mounted senza room: event-union/degraded/unsupported-event-contract, non azzera gli altri fatti", async () => {
    const legacy = envelope(2, {
      kind: "plugin.mounted",
      payload: {
        pluginId: "io.ardesia.simulation",
        pluginKind: "plugin",
        instanceId: "embed-1",
        labels: { it: "Simulation" },
      },
    })
    const ok = envelope(1, { kind: "lesson.started", payload: { room: LESSON_ID } })
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([ok, legacy]),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "event-union" && entry.code === "unsupported-event-contract"
    ))
    expect(issue?.severity).toBe("degraded")
    expect(snapshot.lessonEvents.length).toBe(2)
  })
})

describe("loadScopedContinuitySnapshot — provenance build (accept #4)", () => {
  it("buildCommitSha assente con eventi presenti: build/degraded/missing distinto", async () => {
    const events = [envelope(1)]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
      buildCommitSha: null,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "build")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("missing")
    expect(snapshot.buildCommitSha).toBeNull()
  })

  it("buildCommitSha malformato (non full-SHA 40 hex): build/degraded/missing", async () => {
    const events = [envelope(1)]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
      buildCommitSha: "notasha",
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "build")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("missing")
  })

  it("producer.commitSha diverso dal build ratificato: build/corrupt/digest-mismatch", async () => {
    const events = [
      envelope(1, { producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: OTHER_BUILD_SHA,
      } }),
    ]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
      buildCommitSha: BUILD_SHA,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "build")
    expect(issue?.severity).toBe("corrupt")
    expect(issue?.code).toBe("digest-mismatch")
  })

  it("buildCommitSha presente e allineato ai producer: nessuna issue build", async () => {
    const events = [envelope(1), envelope(2)]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
      buildCommitSha: BUILD_SHA,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.issues.some((entry) => entry.source === "build")).toBe(false)
  })

  it("buildCommitSha presente senza eventi: nessuna issue build (non richiesta)", async () => {
    const factories = trackingFactories({ buildCommitSha: null })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.issues.some((entry) => entry.source === "build")).toBe(false)
  })
})

describe("loadScopedContinuitySnapshot — workspace typed persistence (accept #4)", () => {
  it("workspace unavailable/workspace-not-initialised: session/journal/scene degraded/workspace-uninitialised distinti", async () => {
    const workspaceSpy = inMemoryWorkspace(
      new Map(),
      { kind: "unavailable", code: "workspace-not-initialised" },
    )
    const factories = trackingFactories({
      workspaceReader: async () => workspaceSpy,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    for (const source of ["session", "journal", "scene"] as const) {
      const issue = snapshot.issues.find((entry) => entry.source === source)
      expect(issue?.severity).toBe("degraded")
      expect(issue?.code).toBe("workspace-uninitialised")
    }
    // La persistence unavailable salta ogni read (accept #4).
    expect(workspaceSpy.reads).toEqual([])
    expect(workspaceSpy.disposeCount).toBe(1)
  })

  it("workspace dichiarato local-storage: ogni sorgente porta local-storage-non-authoritative", async () => {
    const workspaceSpy = inMemoryWorkspace(new Map(), { kind: "local-storage" })
    const factories = trackingFactories({
      workspaceReader: async () => workspaceSpy,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    for (const source of ["session", "journal", "scene"] as const) {
      const persistenceIssue = snapshot.issues.find((entry) => (
        entry.source === source && entry.code === "local-storage-non-authoritative"
      ))
      expect(persistenceIssue?.severity).toBe("degraded")
    }
    // localStorage e' non-authoritative ma leggibile: il loader tenta comunque
    // il read (non lo salta come per unavailable) — la degradazione e' di
    // provenance, non di accessibilita'.
    expect(workspaceSpy.reads.length).toBeGreaterThan(0)
    expect(workspaceSpy.disposeCount).toBe(1)
  })

  it("read() lancia (FSA persa mid-open): session/journal/scene degraded/fsa-handle-lost distinti", async () => {
    const throwingWorkspace: ContinuityWorkspaceReaderV1 & { disposeCount: number } = {
      persistence: { kind: "fsa" },
      disposeCount: 0,
      async read() {
        throw new Error("FSA handle lost mid-read")
      },
      async dispose() {
        throwingWorkspace.disposeCount += 1
      },
    }
    const factories = trackingFactories({
      workspaceReader: async () => throwingWorkspace,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    for (const source of ["session", "journal", "scene"] as const) {
      const issue = snapshot.issues.find((entry) => (
        entry.source === source && entry.code === "fsa-handle-lost"
      ))
      expect(issue?.severity).toBe("degraded")
    }
    expect(throwingWorkspace.disposeCount).toBe(1)
  })

  it("factory workspace rifiutata: session/journal/scene degraded/workspace-factory-rejected distinti", async () => {
    const eventSpy = verifiedReader([envelope(1)])
    const factories: ContinuityRuntimeAdapterFactories = {
      async createEventReader() {
        return eventSpy
      },
      async createWorkspaceReader() {
        throw new Error("cannot construct workspace")
      },
      buildCommitSha: BUILD_SHA,
    }
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    for (const source of ["session", "journal", "scene"] as const) {
      const issue = snapshot.issues.find((entry) => (
        entry.source === source && entry.code === "workspace-factory-rejected"
      ))
      expect(issue?.severity).toBe("degraded")
    }
    // Anche se il workspace fallisce, la dispose dell'event reader resta chiamata.
    expect(eventSpy.disposeCount).toBe(1)
  })

  it("factory event reader rifiutata: lesson-event-log tradotto in degraded/unavailable, workspace dispose chiamato", async () => {
    const workspaceSpy = inMemoryWorkspace(new Map())
    const factories: ContinuityRuntimeAdapterFactories = {
      async createEventReader() {
        throw new Error("cannot construct event reader")
      },
      async createWorkspaceReader() {
        return workspaceSpy
      },
      buildCommitSha: BUILD_SHA,
    }
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("unavailable")
    expect(workspaceSpy.disposeCount).toBe(1)
  })
})

describe("loadScopedContinuitySnapshot — session, journal, scene distinct (accept #4)", () => {
  it("session.yaml assente su workspace verificato: session/degraded/missing (non issue-free)", async () => {
    const files = new Map<string, Blob>()
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "session")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("missing")
    expect(snapshot.session).toBeNull()
  })

  it("journal legacy senza envelope V2: journal/degraded/legacy-recovery-required distinto", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/events.jsonl`, new Blob([
        `${JSON.stringify({ t: 1, type: "math.insert", latex: "x+1" })}\n`,
      ])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const legacyIssue = snapshot.issues.find((entry) => (
      entry.source === "journal" && entry.code === "legacy-recovery-required"
    ))
    expect(legacyIssue?.severity).toBe("degraded")
    expect(snapshot.journalEvents).toEqual([])
  })

  it("journal corrotto (V2 malformato): journal/corrupt/invalid-schema con path preservato", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/events.jsonl`, new Blob([
        `${JSON.stringify({ schemaVersion: 2, eventId: "broken" })}\n`,
      ])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "journal" && entry.severity === "corrupt"
    ))
    expect(issue?.code).toBe("invalid-schema")
    expect(issue?.preserved?.path).toBe(`raw/${LESSON_ID}/events.jsonl`)
    expect(typeof issue?.preserved?.sha256).toBe("string")
    expect(issue?.preserved?.bytes).toBeGreaterThan(0)
  })
})

// accept #5: ogni byte read (session, journal, scene) e' dentro un typed
// failure boundary. Un Blob che rifiuta arrayBuffer NON rigetta il loader:
// emette l'esatta issue source/severity/code (read-rejected) e chiude le
// handle dei reader (dispose e' invocato sempre).

function rejectingBlob(path: string): Blob {
  const original = new Blob([new Uint8Array([0x00])])
  const proxy = original as Blob & { arrayBuffer: () => Promise<ArrayBuffer> }
  proxy.arrayBuffer = () => Promise.reject(new Error(`arrayBuffer rejected: ${path}`))
  return proxy
}

describe("loadScopedContinuitySnapshot — byte-read boundary (accept #5)", () => {
  it("session.yaml arrayBuffer rifiuta: session/degraded/read-rejected, loader non rigetta", async () => {
    const path = `raw/${LESSON_ID}/${SESSION_ID}/session.yaml`
    const workspaceSpy = inMemoryWorkspace(new Map([[path, rejectingBlob(path)]]))
    const factories = trackingFactories({
      workspaceReader: async () => workspaceSpy,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "session" && entry.code === "read-rejected"
    ))
    expect(issue?.severity).toBe("degraded")
    expect(snapshot.session).toBeNull()
    expect(workspaceSpy.disposeCount).toBe(1)
  })

  it("journal events.jsonl arrayBuffer rifiuta: journal/degraded/read-rejected, loader non rigetta", async () => {
    const path = `raw/${LESSON_ID}/events.jsonl`
    const workspaceSpy = inMemoryWorkspace(new Map([[path, rejectingBlob(path)]]))
    const factories = trackingFactories({
      workspaceReader: async () => workspaceSpy,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "journal" && entry.code === "read-rejected"
    ))
    expect(issue?.severity).toBe("degraded")
    expect(snapshot.journalEvents).toEqual([])
    expect(workspaceSpy.disposeCount).toBe(1)
  })

  it("scene board.excalidraw arrayBuffer rifiuta: scene/degraded/read-rejected, loader non rigetta", async () => {
    const path = `raw/${LESSON_ID}/board.excalidraw`
    const workspaceSpy = inMemoryWorkspace(new Map([[path, rejectingBlob(path)]]))
    const factories = trackingFactories({
      workspaceReader: async () => workspaceSpy,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "scene" && entry.code === "read-rejected"
    ))
    expect(issue?.severity).toBe("degraded")
    expect(snapshot.scene).toBeNull()
    expect(workspaceSpy.disposeCount).toBe(1)
  })

  it("session.yaml: primo read succeed, secondo arrayBuffer rifiuta ⇒ session/corrupt/invalid-schema con preserved dai byte del primo read", async () => {
    // Blob che rifiuta a partire dal SECONDO arrayBuffer: il primo read
    // ritorna byte corrotti (non parseable), ma la costruzione della
    // preserved deve usare i byte gia' catturati e NON lanciare.
    const invalidYaml = "questo non e' YAML valido secondo lo schema V2\n"
    const originalBytes = new TextEncoder().encode(invalidYaml)
    let arrayBufferCalls = 0
    const succeedThenRejectBlob: Blob = {
      size: originalBytes.byteLength,
      type: "text/yaml",
      async arrayBuffer() {
        arrayBufferCalls += 1
        if (arrayBufferCalls === 1) {
          const copy = new Uint8Array(originalBytes.byteLength)
          copy.set(originalBytes)
          return copy.buffer as ArrayBuffer
        }
        throw new Error("arrayBuffer rejected on second call (FSA lost after first read)")
      },
      slice() { throw new Error("not implemented") },
      stream() { throw new Error("not implemented") },
      text() { throw new Error("not implemented") },
      bytes() { throw new Error("not implemented") },
    } as Blob
    const path = `raw/${LESSON_ID}/${SESSION_ID}/session.yaml`
    const workspaceSpy = inMemoryWorkspace(new Map([[path, succeedThenRejectBlob]]))
    const factories = trackingFactories({ workspaceReader: async () => workspaceSpy })
    // Non deve rigettare: il preserved deve essere costruito senza un
    // secondo arrayBuffer.
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "session" && entry.severity === "corrupt"
    ))
    expect(issue?.code).toBe("invalid-schema")
    expect(issue?.preserved?.path).toBe(path)
    expect(typeof issue?.preserved?.sha256).toBe("string")
    expect(issue?.preserved?.bytes).toBe(originalBytes.byteLength)
    // Il preserved e' stato costruito dai byte gia' catturati: nessun
    // secondo arrayBuffer sul Blob (esatto conteggio 1).
    expect(arrayBufferCalls).toBe(1)
    expect(workspaceSpy.disposeCount).toBe(1)
  })
})

describe("loadScopedContinuitySnapshot — scena Simulation produzione (accept #4)", () => {
  // Fixture che imita l'output di produzione per un embed maestro-tool:
  // type "embeddable", customData.maestroTool.owner=pluginId#instanceId.
  const productionSimulationScene = JSON.stringify({
    elements: [
      {
        id: "sim-embed-1",
        type: "embeddable",
        x: 120,
        y: 90,
        width: 1180,
        height: 760,
        link: "maestro-tool://io.ardesia.simulation/sim-embed-1",
        customData: {
          maestroTool: {
            owner: "io.ardesia.simulation#sim-instance-42",
            state: {
              kind: "simulation-scene-v1",
              sceneDigest: "digest-prod-abc",
            },
          },
        },
      },
    ],
  })

  it("scena reale con embed embeddable+maestroTool: simulationEmbeds popolato, plugin/instance parsati dall'owner", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([productionSimulationScene])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
      buildCommitSha: BUILD_SHA,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.scene?.simulationEmbeds.length).toBe(1)
    const embed = snapshot.scene!.simulationEmbeds[0]!
    expect(embed.pluginId).toBe("io.ardesia.simulation")
    expect(embed.instanceId).toBe("sim-instance-42")
    expect(embed.sceneDigest).toBe("digest-prod-abc")
  })

  it("scena reale con embed embeddable senza build provenance: build/degraded/missing", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([productionSimulationScene])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
      buildCommitSha: null,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    // Il embed di produzione zero-event deve forzare la build provenance,
    // altrimenti la scena diventerebbe verified-empty (regressione).
    const buildIssue = snapshot.issues.find((entry) => entry.source === "build")
    expect(buildIssue?.severity).toBe("degraded")
    expect(buildIssue?.code).toBe("missing")
  })

  it("elemento scena non-oggetto (`[42]`) rende l'intera scena corrupt/invalid-schema, non verified-empty", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([JSON.stringify({ elements: [42] })])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const sceneIssue = snapshot.issues.find((entry) => entry.source === "scene")
    expect(sceneIssue?.severity).toBe("corrupt")
    expect(sceneIssue?.code).toBe("invalid-schema")
    expect(snapshot.scene).toBeNull()
    // Nessuno stato verified/empty che nasconda l'invalidita'.
    expect(snapshot.scene?.simulationEmbeds ?? []).toEqual([])
  })

  it("elemento scena null/array: la scena si rifiuta interamente (mai filter silenzioso)", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([
        JSON.stringify({ elements: [{ id: "ok", type: "text" }, null, [1, 2]] }),
      ])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const sceneIssue = snapshot.issues.find((entry) => entry.source === "scene")
    expect(sceneIssue?.severity).toBe("corrupt")
    expect(sceneIssue?.code).toBe("invalid-schema")
    expect(snapshot.scene).toBeNull()
  })
})

describe("loadScopedContinuitySnapshot — envelope deep-freeze (accept #3)", () => {
  it("mutare payload/actor/producer/evidence dell'input post-load non cambia replay ne evidence ne projection", async () => {
    // Simuliamo un adapter che trattiene i propri envelope originali (comune
    // in adapter con caching o con oggetti condivisi). Se il loader non
    // clona e congela, la mutazione post-load si vede nel snapshot.
    const retained: AppendedEventEnvelopeV2[] = [
      envelope(1, {
        payload: { room: LESSON_ID },
        evidence: [{ ref: `lesson:${LESSON_ID}@1`, resolution: "verified" }],
      }),
    ]
    const mutableCopy = JSON.parse(JSON.stringify(retained[0])) as AppendedEventEnvelopeV2
    const spyReader: ContinuityEventReaderV1 = {
      persistence: { kind: "verified-indexeddb", database: "lessonos-eventlog" },
      async readEnvelopesBySession() {
        // Ritorna volutamente il riferimento allo stesso oggetto in memoria:
        // se il loader lo memorizza per riferimento, la mutazione qui sotto
        // muterebbe lo snapshot.
        return [mutableCopy]
      },
      async dispose() {},
    }
    const factories = trackingFactories({
      eventReader: async () => spyReader,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const projectionBefore = projectContinuityV1(snapshot)
    const canonicalBefore = canonicalSnapshot(snapshot)

    // Mutazioni avversarie sull'oggetto originale del reader.
    ;(mutableCopy.payload as Record<string, unknown>).room = "lezione-b"
    ;(mutableCopy.producer as Record<string, unknown>).commitSha = OTHER_BUILD_SHA
    ;(mutableCopy.actor as Record<string, unknown>).id = "impostor"
    ;(mutableCopy.evidence as unknown as Array<{ ref: string; resolution: string }>)[0]!.ref = "board:mutated"

    // Snapshot immutabile: nessuna delle mutazioni si e' propagata.
    expect(canonicalSnapshot(snapshot)).toBe(canonicalBefore)
    expect(JSON.stringify(projectContinuityV1(snapshot))).toBe(JSON.stringify(projectionBefore))
    // Ogni livello dell'envelope congelato: mutazioni dirette sui rami del
    // snapshot lanciano in strict mode e comunque non modificano i byte.
    const stored = snapshot.lessonEvents[0]!
    expect(Object.isFrozen(stored)).toBe(true)
    expect(Object.isFrozen(stored.payload)).toBe(true)
    expect(Object.isFrozen(stored.producer)).toBe(true)
    expect(Object.isFrozen(stored.actor)).toBe(true)
    expect(Object.isFrozen(stored.evidence)).toBe(true)
    expect(Object.isFrozen(stored.evidence[0])).toBe(true)
    // Payload effettivamente intatto: lo scope check redundant vede LESSON_ID,
    // non "lezione-b".
    expect((stored.payload as { room: string }).room).toBe(LESSON_ID)
    expect(stored.evidence[0]!.ref).toBe(`lesson:${LESSON_ID}@1`)
  })
})

describe("loadScopedContinuitySnapshot — build provenance con scena Simulation (accept #4)", () => {
  const sceneWithEmbedBytes = JSON.stringify({
    elements: [
      {
        id: "embed-1",
        type: "embed",
        customData: {
          instanceId: "sim-instance-1",
          pluginId: "io.ardesia.simulation",
          sceneDigest: "digest-abc",
        },
      },
    ],
  })

  it("scena con Simulation embed ma zero eventi: buildCommitSha assente => build/degraded/missing", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([sceneWithEmbedBytes])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
      buildCommitSha: null,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.scene?.simulationEmbeds.length).toBe(1)
    const issue = snapshot.issues.find((entry) => entry.source === "build")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("missing")
  })

  it("scena con Simulation embed + buildCommitSha canonico: nessuna issue build ma provenienza plugin resta da verificare a livello projector", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([sceneWithEmbedBytes])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
      buildCommitSha: BUILD_SHA,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.issues.some((entry) => entry.source === "build")).toBe(false)
  })

  it("nessun evento e nessun embed Simulation: nessuna issue build (non richiesta)", async () => {
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/board.excalidraw`, new Blob([JSON.stringify({ elements: [] })])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
      buildCommitSha: null,
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.issues.some((entry) => entry.source === "build")).toBe(false)
  })
})

describe("loadScopedContinuitySnapshot — event-union e journal scope (accept #3, #4)", () => {
  it("stesso eventId in lesson log e journal: event-union/corrupt/duplicate-event-id, fatti azzerati", async () => {
    const eventId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const lessonEvent = envelope(1, { eventId })
    const journalPayload = {
      schemaVersion: 2,
      eventId,
      lessonId: LESSON_ID,
      sessionId: SESSION_ID,
      kind: "journal.math.insert",
      occurredAt: "2026-07-23T00:00:05.000Z",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: BUILD_SHA,
      },
      causationId: null,
      idempotencyKey: `journal:${SESSION_ID}:union`,
      evidence: [{ ref: "journal:math-input", resolution: "verified" }],
      payload: { latex: "x+1" },
    }
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/events.jsonl`, new Blob([`${JSON.stringify(journalPayload)}\n`])],
    ])
    const factories = trackingFactories({
      eventReader: async () => verifiedReader([lessonEvent]),
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => (
      entry.source === "event-union" && entry.code === "duplicate-event-id"
    ))
    expect(issue?.severity).toBe("corrupt")
    expect(snapshot.lessonEvents).toEqual([])
    expect(snapshot.journalEvents).toEqual([])
  })

  it("journal multi-session: il loader tiene solo gli envelope con sessionId dello scope", async () => {
    const mine = {
      schemaVersion: 2,
      eventId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      lessonId: LESSON_ID,
      sessionId: SESSION_ID,
      kind: "journal.math.insert",
      occurredAt: "2026-07-23T00:00:01.000Z",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: BUILD_SHA,
      },
      causationId: null,
      idempotencyKey: `journal:${SESSION_ID}:mine`,
      evidence: [{ ref: "journal:math-input", resolution: "verified" }],
      payload: { latex: "mine" },
    }
    const other = {
      ...mine,
      eventId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      sessionId: OTHER_SESSION_ID,
      idempotencyKey: `journal:${OTHER_SESSION_ID}:other`,
      occurredAt: "2026-07-23T00:00:02.000Z",
      payload: { latex: "other" },
    }
    const files = new Map<string, Blob>([
      [`raw/${LESSON_ID}/events.jsonl`, new Blob([
        `${JSON.stringify(mine)}\n${JSON.stringify(other)}\n`,
      ])],
    ])
    const factories = trackingFactories({
      workspaceReader: async () => inMemoryWorkspace(files),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.journalEvents.length).toBe(1)
    expect(snapshot.journalEvents[0]!.envelope.eventId).toBe(mine.eventId)
    expect(snapshot.journalEvents[0]!.envelope.sessionId).toBe(SESSION_ID)
  })
})

describe("loadScopedContinuitySnapshot — evidence onesta finche' il resolver non gira (accept #3)", () => {
  it("declared verified: status unsupported / reason handler-unavailable; nulla e' resolved", async () => {
    const events = [envelope(1, {
      evidence: [
        { ref: "board:x", resolution: "verified" },
        { ref: "manual:vol1:p2", resolution: "verified" },
      ],
    })]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    for (const occurrence of snapshot.evidenceByOccurrence.values()) {
      expect(occurrence.declared).toBe("verified")
      expect(occurrence.status).toBe("unsupported")
      expect(occurrence.reason).toBe("handler-unavailable")
      expect(occurrence.target).toBeNull()
    }
  })

  it("declared missing: status missing / reason declared-missing", async () => {
    const events = [envelope(1, {
      evidence: [{ ref: "board:y", resolution: "missing" }],
    })]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const occurrence = [...snapshot.evidenceByOccurrence.values()][0]!
    expect(occurrence.declared).toBe("missing")
    expect(occurrence.status).toBe("missing")
    expect(occurrence.reason).toBe("declared-missing")
  })

  it("evidenceByOccurrence e' un ReadonlyMap; non collassa ref duplicate", async () => {
    const events = [envelope(1, {
      evidence: [
        { ref: "board:x", resolution: "verified" },
        { ref: "board:x", resolution: "verified" },
      ],
    })]
    const factories = trackingFactories({
      eventReader: async () => verifiedReader(events),
    })
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.evidenceByOccurrence.size).toBe(2)
    const keys = [...snapshot.evidenceByOccurrence.keys()].sort()
    expect(keys).toEqual([`${events[0]!.eventId}:0`, `${events[0]!.eventId}:1`])
  })
})

describe("loadScopedContinuitySnapshot — cold reopen su backend persistente reale (accept #5)", () => {
  // FSA condivisa fra WorkspaceStore fresche: driver Map-backed che
  // sopravvive alla ricostruzione dello store, con contatore per-path per
  // provare i byte-read del secondo load.
  type SharedFsaBacking = {
    createDriver(): import("../store/types").WorkspaceDriver
    readsByLoad: number[][]
    beginLoad(): void
  }

  function makeSharedFsaBacking(): SharedFsaBacking {
    const entries = new Map<string, { blob: Blob; mtime: number }>()
    const readsByLoad: number[][] = []
    let currentLoad: number[] | null = null
    return {
      readsByLoad,
      beginLoad() {
        currentLoad = []
        readsByLoad.push(currentLoad)
      },
      createDriver() {
        return {
          name: "test-fsa",
          available: () => true,
          async init() { return true },
          async read(path) {
            if (currentLoad !== null) currentLoad.push(path.length)
            const entry = entries.get(path)
            if (!entry) return null
            // Copia esplicita: soddisfa lib.dom stretto e garantisce che
            // il Blob restituito non condivida i byte con il backing.
            const bytes = new Uint8Array(await entry.blob.arrayBuffer())
            const copy = new Uint8Array(bytes.byteLength)
            copy.set(bytes)
            return new Blob([copy], entry.blob.type ? { type: entry.blob.type } : {})
          },
          async write(path, data) {
            entries.set(path, { blob: data, mtime: Date.now() })
          },
          async delete(path) { entries.delete(path) },
          async list(prefix) {
            const out: import("../store/types").FileEntry[] = []
            for (const [path, { blob, mtime }] of entries) {
              if (prefix && !path.startsWith(prefix)) continue
              out.push({ path, data: blob, mtime })
            }
            return out
          },
        }
      },
    }
  }

  it("seconda load: due WorkspaceStore fsa fresche + due IndexedDbEventLog fresche; entrambe le sorgenti riletti; projection eguale a golden atteso", async () => {
    // Clean start: nessun residuo localStorage da test precedenti.
    localStorage.clear()

    const { IDBFactory, IDBKeyRange: FakeKeyRange } = await import("fake-indexeddb")
    ;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = FakeKeyRange
    const idbFactory = new IDBFactory() as unknown as IDBFactory
    const dbName = `beta004-cold-${Math.random().toString(36).slice(2)}`

    // Seed IDB via writer separato: rappresenta l'append fatto da una
    // sessione live precedente. Dopo close() i byte vivono in fake-indexeddb.
    const seedLog = new IndexedDbEventLog({ factory: idbFactory, dbName })
    await seedLog.open()
    const seedEventId = "70000000-0000-4000-8000-000000000001"
    const seedEnvelope = {
      schemaVersion: 2 as const,
      eventId: seedEventId,
      lessonId: LESSON_ID,
      sessionId: SESSION_ID,
      kind: "lesson.started",
      occurredAt: "2026-07-28T00:00:01.000Z",
      actor: { type: "teacher" as const, id: "founder-beta-teacher" },
      producer: {
        id: "com.github.andreamarro.ardesia.studio",
        version: "0.0.0",
        commitSha: BUILD_SHA,
      },
      causationId: null,
      idempotencyKey: "cold:1",
      evidence: [{ ref: `lesson:${LESSON_ID}@1`, resolution: "verified" as const }],
      payload: { room: LESSON_ID },
    }
    await seedLog.appendEnvelope(seedEnvelope)
    await seedLog.close()

    // Seed FSA via un WorkspaceStore produzione dedicato al seeding.
    const backing = makeSharedFsaBacking()
    const sessionPath = `raw/${LESSON_ID}/${SESSION_ID}/session.yaml`
    const sessionYaml =
      "v: 2\n" +
      `lessonId: ${LESSON_ID}\n` +
      `sessionId: ${SESSION_ID}\n` +
      "created: 100\n" +
      "revision: 0\n" +
      "audioConsent: false\n" +
      "audioStartEpoch: null\n"
    const seedStore = new WorkspaceStore({ createFsaDriver: () => backing.createDriver() })
    await seedStore.init()
    await seedStore.connectFolder()
    expect(seedStore.mode).toBe("fsa")
    await seedStore.write(sessionPath, new Blob([sessionYaml], { type: "text/yaml" }))

    // Factory: ogni chiamata crea WorkspaceStore fresco e IndexedDb reader
    // fresco (via handle nuova). Instrumenta dispose + readEnvelopesBySession.
    const workspaceStoreInstances: WorkspaceStore[] = []
    const eventReaderInstances: ContinuityEventReaderV1[] = []
    const eventReaderReadCounts: number[] = []
    const eventReaderDisposeCounts: number[] = []

    const factories: ContinuityRuntimeAdapterFactories = {
      async createEventReader() {
        const reader = await openIndexedDbContinuityEventReader({
          factory: idbFactory,
          dbName,
        })
        const idx = eventReaderInstances.length
        eventReaderReadCounts.push(0)
        eventReaderDisposeCounts.push(0)
        const proxy: ContinuityEventReaderV1 = Object.freeze({
          persistence: reader.persistence,
          async readEnvelopesBySession(lessonId: string, sessionId: string) {
            eventReaderReadCounts[idx] = (eventReaderReadCounts[idx] ?? 0) + 1
            return reader.readEnvelopesBySession(lessonId, sessionId)
          },
          async dispose() {
            eventReaderDisposeCounts[idx] = (eventReaderDisposeCounts[idx] ?? 0) + 1
            await reader.dispose()
          },
        })
        eventReaderInstances.push(proxy)
        return proxy
      },
      async createWorkspaceReader() {
        // Fresh WorkspaceStore produzione ogni chiamata, connessa alla
        // stessa FSA condivisa; l'adapter di produzione deriva la
        // persistence da store.mode.
        const store = new WorkspaceStore({ createFsaDriver: () => backing.createDriver() })
        await store.init()
        await store.connectFolder()
        workspaceStoreInstances.push(store)
        return createWorkspaceStoreContinuityWorkspaceReader(store)
      },
      buildCommitSha: BUILD_SHA,
    }

    backing.beginLoad()
    const first = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    backing.beginLoad()
    const second = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))

    // Fresh production WorkspaceStore instances, entrambe in fsa mode.
    expect(workspaceStoreInstances.length).toBe(2)
    expect(workspaceStoreInstances[0]).not.toBe(workspaceStoreInstances[1])
    for (const store of workspaceStoreInstances) expect(store.mode).toBe("fsa")

    // Ogni event reader e' stato consultato una volta e disposato una volta:
    // il secondo load NON riusa la handle del primo.
    expect(eventReaderInstances.length).toBe(2)
    expect(eventReaderInstances[0]).not.toBe(eventReaderInstances[1])
    expect(eventReaderReadCounts).toEqual([1, 1])
    expect(eventReaderDisposeCounts).toEqual([1, 1])

    // Byte read del SECONDO load sul backing FSA condivisa: sono avvenuti,
    // non e' stato usato uno snapshot cached.
    expect(backing.readsByLoad.length).toBe(2)
    expect(backing.readsByLoad[1]!.length).toBeGreaterThan(0)

    // Nessuno stato condiviso: array e Map sono istanze distinte.
    expect(first.lessonEvents).not.toBe(second.lessonEvents)
    expect(first.journalEvents).not.toBe(second.journalEvents)
    expect(first.evidenceByOccurrence).not.toBe(second.evidenceByOccurrence)
    expect(first.scope).not.toBe(second.scope)
    expect(first.session).not.toBe(second.session)

    // ---- Golden fisso della projection derivata dal snapshot cold. ----
    const firstProjection = projectContinuityV1(first)
    const secondProjection = projectContinuityV1(second)
    // Determinismo bit-esatto fra le due letture.
    expect(JSON.stringify(firstProjection)).toBe(JSON.stringify(secondProjection))
    // Golden ratificato: identity/phase/health/openLoops/nextAction/simulation.
    expect(firstProjection.v).toBe(1)
    expect(firstProjection.identity).toEqual({
      lessonId: LESSON_ID,
      roomId: LESSON_ID,
      sessionId: SESSION_ID,
    })
    expect(firstProjection.sourceHealth.status).toBe("verified")
    expect(firstProjection.sourceHealth.issues).toEqual([])
    // seed envelope e' un lesson.started senza error.observed: no open loops.
    expect(firstProjection.openLoops).toEqual([])
    expect(firstProjection.lastUncorrectedError).toBeNull()
    expect(firstProjection.lastVerifiedResult).toBeNull()
    expect(firstProjection.recentMaterials).toEqual([])
    expect(firstProjection.simulation).toEqual({
      status: "not-mounted",
      instance: null,
      openError: null,
      evidenceBlock: null,
    })
    // Il seed dichiara UNA evidence verified che senza resolver strict
    // resta unsupported/handler-unavailable ⇒ phase missing-evidence.
    expect(firstProjection.phase).toBe("missing-evidence")
    expect(firstProjection.missingEvidence.length).toBe(1)
    const goldenOccurrenceId = `${seedEventId}:0`
    expect(firstProjection.missingEvidence[0]!.occurrenceId).toBe(goldenOccurrenceId)
    expect(firstProjection.missingEvidence[0]!.status).toBe("unsupported")
    expect(firstProjection.missingEvidence[0]!.reason).toBe("handler-unavailable")
    expect(firstProjection.nextAction.kind).toBe("recover-continuity")
    if (firstProjection.nextAction.kind === "recover-continuity") {
      expect(firstProjection.nextAction.priority).toBe(0)
      expect(firstProjection.nextAction.reason.kind).toBe("evidence")
      if (firstProjection.nextAction.reason.kind === "evidence") {
        expect(firstProjection.nextAction.reason.occurrenceId).toBe(goldenOccurrenceId)
        expect(firstProjection.nextAction.reason.status).toBe("unsupported")
      }
    }

    // Evidence-occurrence: chiavi e valori bit-identici.
    const firstOccurrences = [...first.evidenceByOccurrence.entries()].sort()
    const secondOccurrences = [...second.evidenceByOccurrence.entries()].sort()
    expect(firstOccurrences).toEqual(secondOccurrences)
    expect(firstOccurrences.map(([key]) => key)).toEqual([goldenOccurrenceId])

    // Session sha256 stabile dai byte identici del backing.
    expect(first.session?.sha256).toBe(second.session?.sha256)
    expect(first.session?.document.lessonId).toBe(LESSON_ID)
    expect(first.session?.document.sessionId).toBe(SESSION_ID)

    // Snapshot canonico (evidenceByOccurrence espansa) identico byte per byte.
    expect(canonicalSnapshot(first)).toBe(canonicalSnapshot(second))
  })

  it("localStorage non viene toccato dal loader direttamente", async () => {
    const seen: string[] = []
    const originalSetItem = window.localStorage.setItem
    const originalGetItem = window.localStorage.getItem
    window.localStorage.setItem = (key, value) => {
      seen.push(`set:${key}`)
      return originalSetItem.call(window.localStorage, key, value)
    }
    window.localStorage.getItem = (key) => {
      seen.push(`get:${key}`)
      return originalGetItem.call(window.localStorage, key)
    }
    try {
      const factories = trackingFactories({ eventReader: async () => verifiedReader([envelope(1)]) })
      await loadScopedContinuitySnapshot(SCOPE_INPUT, factories)
    } finally {
      window.localStorage.setItem = originalSetItem
      window.localStorage.getItem = originalGetItem
    }
    expect(seen).toEqual([])
  })
})

describe("openIndexedDbContinuityEventReader — backend reale mai promosso (accept #2, #4)", () => {
  it("factory IndexedDB assente: persistence unavailable, zero envelope, dispose sicuro", async () => {
    const reader = await openIndexedDbContinuityEventReader({ factory: undefined })
    expect(reader.persistence.kind).toBe("unavailable")
    if (reader.persistence.kind === "unavailable") {
      expect(reader.persistence.code).toBe("indexeddb-unavailable")
    }
    const rows = await reader.readEnvelopesBySession(LESSON_ID, SESSION_ID)
    expect(rows).toEqual([])
    await reader.dispose()
  })

  it("integrazione loader: IndexedDB assente -> lesson-event-log/degraded/unavailable", async () => {
    const factories: ContinuityRuntimeAdapterFactories = {
      createEventReader: () => openIndexedDbContinuityEventReader({ factory: undefined }),
      createWorkspaceReader: async () => inMemoryWorkspace(new Map()),
      buildCommitSha: BUILD_SHA,
    }
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    const issue = snapshot.issues.find((entry) => entry.source === "lesson-event-log")
    expect(issue?.severity).toBe("degraded")
    expect(issue?.code).toBe("unavailable")
  })

  it("IndexedDB con righe legacy fisiche: openIndexedDbEventLog riporta data-loss, non verified", async () => {
    const factory = createLegacyOnlyIdbFactory([
      { seq: 1, kind: "lesson.started", t: 1000, payload: JSON.stringify({
        kind: "lesson.started",
        room: LESSON_ID,
        t: 1000,
        evidence: [`lesson:${LESSON_ID}@1000`],
      }), evidence: [`lesson:${LESSON_ID}@1000`] },
    ])
    const handle = await openIndexedDbEventLog({ factory })
    try {
      expect(handle.backend.kind).toBe("data-loss")
      if (handle.backend.kind === "data-loss") {
        expect(handle.backend.code).toBe("legacy-physical-rows")
        expect(handle.backend.database).toBe("lessonos-eventlog")
      }
    } finally {
      await handle.close()
    }
  })

  it("IndexedDB con riga V2 malformata (schemaVersion senza lessonId indicizzabile): backend = data-loss/malformed-v2-rows, mai verified-empty", async () => {
    // La riga porta schemaVersion=2 ma non e' un envelope canonico:
    // manca lessonId/sessionId indicizzabili. E' invisibile all'indice
    // composto ⇒ readEnvelopesBySession torna [] ⇒ verified-empty falso.
    const factory = createFactoryWithMalformedV2Row()
    const handle = await openIndexedDbEventLog({ factory })
    try {
      expect(handle.backend.kind).toBe("data-loss")
      if (handle.backend.kind === "data-loss") {
        expect(handle.backend.code).toBe("malformed-v2-rows")
        expect(handle.backend.database).toBe("lessonos-eventlog")
      }
    } finally {
      await handle.close()
    }
  })

  it("IndexedDB con log corrotto (seq non-contigua): openIndexedDbEventLog riporta corrupt", async () => {
    // Righe con seq=1 e seq=3 (buco): il descrittore backend NON deve dire
    // verified-empty. Con dati canonici v2 il loader downstream le vedrebbe
    // valide, ma la contiguita' e' un invariante di persistenza.
    const factory = createIdbFactoryWithSeqGap()
    const handle = await openIndexedDbEventLog({ factory })
    try {
      expect(handle.backend.kind).toBe("corrupt")
    } finally {
      await handle.close()
    }
  })

  it("IndexedDB pulito (upgrade appena creato, nessuna riga): openIndexedDbEventLog riporta verified", async () => {
    const factory = createEmptyIdbFactory()
    const handle = await openIndexedDbEventLog({ factory })
    try {
      expect(handle.backend.kind).toBe("verified-indexeddb")
      if (handle.backend.kind === "verified-indexeddb") {
        expect(handle.backend.database).toBe("lessonos-eventlog")
      }
      // Il log vero e' un'istanza reale IndexedDbEventLog: readEnvelopesBySession
      // usa IDBKeyRange globale che jsdom non fornisce, quindi la lettura vera
      // vive nel gate browser (E2E); qui basta l'oracolo del descrittore.
      expect(handle.log).toBeInstanceOf(IndexedDbEventLog)
    } finally {
      await handle.close()
    }
  })
})

describe("loadScopedContinuitySnapshot — snapshot scope congelato", () => {
  it("scope invalidato ex-post: identita' resta quella richiesta", async () => {
    const scope = validateContinuityScopeV1(SCOPE)
    const factories = trackingFactories()
    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))
    expect(snapshot.scope).toEqual(scope)
  })
})

describe("createWorkspaceStoreContinuityWorkspaceReader — persistence dal backend reale (accept #3)", () => {
  it("store.mode=unavailable => persistence.kind=unavailable/code=workspace-uninitialised (mai self-declarato)", () => {
    const stub: { mode: import("../store/types").StorageMode; read: () => Promise<Blob | null> } = {
      mode: "unavailable",
      async read() { return null },
    }
    const reader = createWorkspaceStoreContinuityWorkspaceReader(stub)
    expect(reader.persistence.kind).toBe("unavailable")
    if (reader.persistence.kind === "unavailable") {
      expect(reader.persistence.code).toBe("workspace-uninitialised")
    }
  })

  it("store.mode=localStorage => persistence.kind=local-storage (mai autoritativo)", () => {
    const stub = { mode: "localStorage" as const, read: async () => null }
    const reader = createWorkspaceStoreContinuityWorkspaceReader(stub)
    expect(reader.persistence.kind).toBe("local-storage")
  })

  it("uno stub che si autoetichetta fsa NON ottiene autorita fsa", () => {
    // Questo test asseriva l'esatto contrario, e passava. Codificava il difetto
    // come contratto: un oggetto letterale `{ mode: "fsa", read }` otteneva
    // l'unica persistence autoritativa del sistema. Il test subito sotto
    // dichiarava nel commento di "blindare" quel buco, ma prova solo che uno
    // store REALE in localStorage riporta local-storage - cosa diversa.
    // L'autorita' fsa ora richiede una istanza WorkspaceStore reale.
    const stub = { mode: "fsa" as const, read: async () => null }
    const reader = createWorkspaceStoreContinuityWorkspaceReader(stub)
    expect(reader.persistence.kind).toBe("unavailable")
  })

  it("un test-double che si autoetichetta fsa NON puo' passarsi come autoritativo tramite un WorkspaceStore reale", async () => {
    // Il vecchio path lasciava che qualunque oggetto injettato dichiarasse
    // "fsa". Il costruttore di produzione deriva SOLO da store.mode: uno
    // store in localStorage NON puo' finire fsa senza che sia connectFolder
    // ad averlo migrato. Questo test lo blinda.
    localStorage.clear()
    const store = new WorkspaceStore()
    await store.init()
    expect(store.mode).toBe("localStorage")
    const reader = createWorkspaceStoreContinuityWorkspaceReader(store)
    expect(reader.persistence.kind).toBe("local-storage")
  })
})

// ---------------------------------------------------------------------------
// ContinuityResumeCard — matrice di guasti visibile (accept #7).
//
// La card riceve stati tipati (loading | scope-invalid | loaded) e rende
// role/testo distinti, esattamente una next-action fuori loading, e nessun
// anchor per evidence non risolte. I test non montano App/Room/ViewNav: non
// dichiarano raggiungibilita' della route Continuity (BETA-002 e' immutabile).
// ---------------------------------------------------------------------------

afterEach(() => cleanup())

function snapshotFromIssues(issues: readonly ContinuitySourceIssueV1[]): ScopedContinuitySnapshotV1 {
  return Object.freeze({
    scope: Object.freeze({ lessonId: LESSON_ID, roomId: LESSON_ID, sessionId: SESSION_ID }),
    session: null,
    lessonEvents: Object.freeze([]) as readonly AppendedEventEnvelopeV2[],
    journalEvents: Object.freeze([]) as readonly Readonly<{ line: number; envelope: import("../store/JournalRecorder").JournalEnvelopeV2 }>[],
    scene: null,
    buildCommitSha: null,
    evidenceByOccurrence: new Map(),
    issues: Object.freeze([...issues]),
  })
}

function projectionForPhase(
  phase: ContinuityProjectionV1["phase"],
  issues: readonly ContinuitySourceIssueV1[] = [],
): ContinuityProjectionV1 {
  return projectContinuityV1(snapshotFromIssues(issues.length > 0
    ? issues
    : phase === "degraded"
    ? [{ source: "session", severity: "degraded", code: "local-storage-non-authoritative", preserved: null }]
    : phase === "corrupt"
    ? [{ source: "lesson-event-log", severity: "corrupt", code: "invalid-schema", preserved: null }]
    : []))
}

describe("ContinuityResumeCard — matrice adversarial (accept #7)", () => {
  it("loading: role=status, NIENTE data-next-action, aria-busy true", () => {
    const { container } = render(<ContinuityResumeCard state={{ kind: "loading" }} />)
    const root = container.querySelector("[data-continuity-phase='loading']")!
    expect(root.getAttribute("role")).toBe("status")
    expect(root.getAttribute("aria-busy")).toBe("true")
    expect(container.querySelectorAll("[data-next-action]").length).toBe(0)
  })

  it("scope-invalid: role=alert, code tipizzato visibile, esattamente una data-next-action reopen-lesson con cause=scope-invalid", () => {
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "scope-invalid", code: "room-lesson-mismatch" }} />,
    )
    const root = container.querySelector("[data-continuity-phase='scope-invalid']")!
    expect(root.getAttribute("role")).toBe("alert")
    expect(root.getAttribute("data-continuity-scope-code")).toBe("room-lesson-mismatch")
    expect(root.textContent).toContain("Stanza e lezione non coincidono")
    // Anche scope-invalid deve avere UNA sola azione fuori loading
    // (acceptance #7). Il projector non e' girato: la card sintetizza
    // reopen-lesson con cause visibile.
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("reopen-lesson")
    expect(actions[0]!.getAttribute("data-next-action-cause")).toBe("scope-invalid")
    expect(actions[0]!.getAttribute("href")).toBe("/")
  })

  it("empty: role=status, esattamente UNA data-next-action reopen-lesson", () => {
    const projection = projectionForPhase("empty")
    expect(projection.phase).toBe("empty")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    const root = container.querySelector("[data-continuity-phase='empty']")!
    expect(root.getAttribute("role")).toBe("status")
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("reopen-lesson")
  })

  it("ready: role=status, next-action resume-open-loop; open loop errorId visibile via data attribute", () => {
    // Costruisco uno snapshot con un error.observed non chiuso. Il payload
    // rispetta lo schema runtime (labels, plurale).
    const openLoopEvent: AppendedEventEnvelopeV2 = envelope(1, {
      kind: "error.observed",
      payload: {
        errorId: "e1",
        conceptId: "led_polarity",
        labels: { it: "LED montato invertito" },
      },
      evidence: [{ ref: "board:x", resolution: "verified" }],
    })
    const snapshot = Object.freeze({
      scope: Object.freeze({ lessonId: LESSON_ID, roomId: LESSON_ID, sessionId: SESSION_ID }),
      session: null,
      lessonEvents: Object.freeze([openLoopEvent]),
      journalEvents: Object.freeze([]) as readonly Readonly<{ line: number; envelope: import("../store/JournalRecorder").JournalEnvelopeV2 }>[],
      scene: null,
      buildCommitSha: BUILD_SHA,
      evidenceByOccurrence: new Map(),
      issues: Object.freeze([]) as readonly ContinuitySourceIssueV1[],
    }) as ScopedContinuitySnapshotV1
    const projection = projectContinuityV1(snapshot)
    expect(projection.phase).toBe("ready")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    const root = container.querySelector("[data-continuity-phase='ready']")!
    expect(root.getAttribute("role")).toBe("status")
    // L'open loop e' visibile via data attribute; il testo puo' essere
    // l'etichetta localizzata o l'errorId come fallback (dipende da come il
    // projector legge il payload dello schema LessonOS).
    const openLoop = container.querySelector("[data-continuity-open-loop='e1']")
    expect(openLoop).not.toBeNull()
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("resume-open-loop")
  })

  it("degraded: role=status, cause di persistenza distinte visibili, esattamente UNA next-action recover-continuity", () => {
    const issues: readonly ContinuitySourceIssueV1[] = [
      { source: "session", severity: "degraded", code: "local-storage-non-authoritative", preserved: null },
      { source: "session", severity: "degraded", code: "missing", preserved: null },
      { source: "journal", severity: "degraded", code: "fsa-handle-lost", preserved: null },
    ]
    const projection = projectContinuityV1(snapshotFromIssues(issues))
    expect(projection.phase).toBe("degraded")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    const root = container.querySelector("[data-continuity-phase='degraded']")!
    expect(root.getAttribute("role")).toBe("status")
    // Ogni causa distinta e' visibile con la propria etichetta.
    const codes = [...container.querySelectorAll("[data-continuity-issue-code]")].map(
      (node) => node.getAttribute("data-continuity-issue-code"),
    )
    expect(new Set(codes).size).toBeGreaterThanOrEqual(3)
    expect(codes).toContain("local-storage-non-authoritative")
    expect(codes).toContain("fsa-handle-lost")
    expect(codes).toContain("missing")
    // Esattamente una next-action fuori dallo stato loading.
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("recover-continuity")
  })

  it("corrupt: role=alert, recover-continuity, nessuna occorrenza del sha256 raw della preserved bytes", () => {
    const preserved = { path: "raw/lezione-a/events.jsonl", sha256: "deadbeef".repeat(8), bytes: 42 }
    const issues: readonly ContinuitySourceIssueV1[] = [
      { source: "journal", severity: "corrupt", code: "invalid-schema", preserved },
    ]
    const projection = projectContinuityV1(snapshotFromIssues(issues))
    expect(projection.phase).toBe("corrupt")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    const root = container.querySelector("[data-continuity-phase='corrupt']")!
    expect(root.getAttribute("role")).toBe("alert")
    // Sentinel corrupt raw NON visibile nel DOM.
    expect(container.textContent).not.toContain(preserved.sha256)
    expect(container.textContent).not.toContain("bytes: 42")
    // Recovery visibile con next-action.
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("recover-continuity")
  })

  it("missing-evidence: real projection con evidence unresolved rende un rigo per occurrence, zero anchor per unresolved", () => {
    // Snapshot con un error.observed che apre un ciclo E dichiara evidence
    // "verified": senza resolver strict, l'occurrence resta unsupported
    // (handler-unavailable). Il projector deve derivare phase=missing-evidence
    // e nextAction recover-continuity con reason kind=evidence.
    const openLoopEvent: AppendedEventEnvelopeV2 = envelope(1, {
      kind: "error.observed",
      payload: {
        errorId: "e1",
        conceptId: "led_polarity",
        labels: { it: "LED montato invertito" },
      },
      evidence: [
        { ref: "board:x", resolution: "verified" },
        { ref: "manual:vol1:p2", resolution: "verified" },
      ],
    })
    // buildEvidenceOccurrenceMap non e' exportato: costruisco a mano lo
    // stesso Map che il loader produrrebbe per questo evento.
    const evidenceMap = new Map<string, import("../lessonos/continuityProjection").ContinuityEvidenceV1>([
      [
        `${openLoopEvent.eventId}:0`,
        Object.freeze({
          occurrenceId: `${openLoopEvent.eventId}:0`,
          eventId: openLoopEvent.eventId,
          evidenceIndex: 0,
          ref: "board:x",
          declared: "verified" as const,
          status: "unsupported" as const,
          target: null,
          reason: "handler-unavailable" as const,
        }),
      ],
      [
        `${openLoopEvent.eventId}:1`,
        Object.freeze({
          occurrenceId: `${openLoopEvent.eventId}:1`,
          eventId: openLoopEvent.eventId,
          evidenceIndex: 1,
          ref: "manual:vol1:p2",
          declared: "verified" as const,
          status: "unsupported" as const,
          target: null,
          reason: "handler-unavailable" as const,
        }),
      ],
    ])
    const snapshot = Object.freeze({
      scope: Object.freeze({ lessonId: LESSON_ID, roomId: LESSON_ID, sessionId: SESSION_ID }),
      session: null,
      lessonEvents: Object.freeze([openLoopEvent]),
      journalEvents: Object.freeze([]) as readonly Readonly<{ line: number; envelope: import("../store/JournalRecorder").JournalEnvelopeV2 }>[],
      scene: null,
      buildCommitSha: BUILD_SHA,
      evidenceByOccurrence: evidenceMap,
      issues: Object.freeze([]) as readonly ContinuitySourceIssueV1[],
    }) as ScopedContinuitySnapshotV1
    const projection = projectContinuityV1(snapshot)
    expect(projection.phase).toBe("missing-evidence")
    expect(projection.missingEvidence.length).toBe(2)
    expect(projection.nextAction.kind).toBe("recover-continuity")
    if (projection.nextAction.kind === "recover-continuity") {
      expect(projection.nextAction.reason.kind).toBe("evidence")
    }

    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    for (const occurrence of projection.missingEvidence) {
      const row = container.querySelector(`[data-continuity-evidence='${occurrence.occurrenceId}']`)!
      expect(row.getAttribute("data-continuity-evidence-status")).toBe("unsupported")
      // Nessuna ancora per evidenza non risolta.
      expect(row.querySelector("[data-continuity-evidence-link]")).toBeNull()
      // Cause "da verificare" visibile senza esporre byte.
      expect(row.querySelector("[data-continuity-evidence-blocked]")).not.toBeNull()
    }
    // Esattamente una next-action fuori loading.
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("recover-continuity")
  })

  it("recovery: la stessa card degradata puo' presentare recover-continuity per una sorgente specifica", () => {
    // Combino corrupt lesson-event-log con degraded workspace-uninitialised:
    // la selezione P0 sceglie il corrupt lesson-event-log.
    const issues: readonly ContinuitySourceIssueV1[] = [
      { source: "lesson-event-log", severity: "corrupt", code: "scope-violation", preserved: null },
      { source: "session", severity: "degraded", code: "workspace-uninitialised", preserved: null },
    ]
    const projection = projectContinuityV1(snapshotFromIssues(issues))
    expect(projection.phase).toBe("corrupt")
    expect(projection.nextAction.kind).toBe("recover-continuity")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "loaded", projection }} />,
    )
    const actions = container.querySelectorAll("[data-next-action]")
    expect(actions.length).toBe(1)
    expect(actions[0]!.getAttribute("data-next-action")).toBe("recover-continuity")
    // Cause di persistenza distinte, entrambe visibili.
    const codes = [...container.querySelectorAll("[data-continuity-issue-code]")].map(
      (node) => node.getAttribute("data-continuity-issue-code"),
    )
    expect(codes).toContain("scope-violation")
    expect(codes).toContain("workspace-uninitialised")
  })

  it("integrazione loader -> projector -> card: scope-invalid non consulta le factory", async () => {
    const factories = trackingFactories()
    const result = await loadScopedContinuitySnapshot(
      { lessonId: LESSON_ID, roomId: "lezione-b", sessionId: SESSION_ID },
      factories,
    )
    expect(result.kind).toBe("scope-invalid")
    if (result.kind !== "scope-invalid") throw new Error("expected scope-invalid")
    const { container } = render(
      <ContinuityResumeCard state={{ kind: "scope-invalid", code: result.code }} />,
    )
    expect(container.querySelector("[data-continuity-phase='scope-invalid']")).not.toBeNull()
    // Nessuna factory chiamata: preservato invariante scope-first (accept #1).
    expect(factories.calls.event).toBe(0)
    expect(factories.calls.workspace).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Fake IndexedDB minimale: apre lo store LessonOS, tollera la migration
// dell'indice ARD-06 (createIndex no-op), supporta getAll/getAllKeys e
// object-store index().getAll(range). Il resto non serve al nostro
// oracolo backend: il rischio principale che stiamo esercitando e' che
// openIndexedDbEventLog scelga il ramo giusto della union backend.
// ---------------------------------------------------------------------------

type LegacyRow = {
  seq: number
  kind: string
  t: number
  payload: string
  evidence: string[]
}

type StoredRow = Record<string, unknown>

function createLegacyOnlyIdbFactory(rows: readonly LegacyRow[]): IDBFactory {
  return buildFakeFactory(rows as unknown as StoredRow[])
}

function createEmptyIdbFactory(): IDBFactory {
  return buildFakeFactory([])
}

function createFactoryWithMalformedV2Row(): IDBFactory {
  // Riga con schemaVersion=2 ma priva di lessonId/sessionId indicizzabili:
  // supera hasSchemaVersion (che vede solo la chiave) ma FALLISCE
  // splitStoredEnvelope. Non entra nell'indice composto, quindi la scoped
  // query tornerebbe [] con backend "verified": e' esattamente il caso
  // che vogliamo classificare data-loss/malformed-v2-rows.
  const row: StoredRow = {
    schemaVersion: 2,
    seq: 1,
    eventId: "not-a-uuid",
    kind: "unknown.kind",
    // Deliberatamente mancano lessonId, sessionId, actor, producer, evidence,
    // payload, occurredAt, causationId, idempotencyKey.
  }
  return buildFakeFactory([row])
}

function createIdbFactoryWithSeqGap(): IDBFactory {
  const canonicalActor = { type: "teacher" as const, id: "founder-beta-teacher" }
  const canonicalProducer = {
    id: "com.github.andreamarro.ardesia.studio",
    version: "0.0.0",
    commitSha: BUILD_SHA,
  }
  const withSeq = (seq: number) => ({
    schemaVersion: 2,
    seq,
    eventId: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId: LESSON_ID,
    sessionId: SESSION_ID,
    kind: "lesson.started",
    occurredAt: `2026-07-23T00:00:${String(seq).padStart(2, "0")}.000Z`,
    actor: canonicalActor,
    producer: canonicalProducer,
    causationId: null,
    idempotencyKey: null,
    evidence: [{ ref: `lesson:${LESSON_ID}@${seq}`, resolution: "verified" }],
    payload: { room: LESSON_ID },
  })
  // seq 1 e 3 senza il 2 -> non-contigua -> RecoveryReport.corrupted = true
  return buildFakeFactory([withSeq(1), withSeq(3)] as StoredRow[])
}

function buildFakeFactory(seedRows: StoredRow[]): IDBFactory {
  const records = new Map<number, StoredRow>()
  for (const row of seedRows) records.set(row.seq as number, structuredClone(row))
  let opened = false

  const request = <T,>(op: () => T) => {
    const req = { onsuccess: null as ((ev: unknown) => void) | null, onerror: null as ((ev: unknown) => void) | null, result: undefined as T | undefined, error: null as unknown }
    queueMicrotask(() => {
      try {
        req.result = op()
        req.onsuccess?.({ target: req })
      } catch (error) {
        req.error = error
        req.onerror?.({ target: req })
      }
    })
    return req as unknown as IDBRequest<T>
  }

  const fakeIndex = () => ({
    getAll(range: IDBKeyRange | null): IDBRequest<StoredRow[]> {
      return request(() => {
        const rows = [...records.values()]
          .filter((row) => {
            if (range === null) return true
            const lessonId = row.lessonId
            const sessionId = row.sessionId
            const seq = row.seq
            const lower = (range as unknown as { lower: [string, string, number] }).lower
            const upper = (range as unknown as { upper: [string, string, number] }).upper
            return (
              lessonId === lower[0] && sessionId === lower[1] &&
              typeof seq === "number" && seq >= lower[2] && seq <= upper[2]
            )
          })
          .sort((left, right) => (left.seq as number) - (right.seq as number))
        return rows
      })
    },
  })

  const fakeStore = () => ({
    indexNames: { contains: () => true },
    createIndex(_name: string, _keyPath: readonly string[], _opts?: { unique?: boolean }) {},
    add(value: StoredRow): IDBRequest<number> {
      return request(() => {
        const key = value.seq as number
        if (records.has(key)) throw new DOMException("dup", "ConstraintError")
        records.set(key, structuredClone(value))
        return key
      })
    },
    getAll(): IDBRequest<StoredRow[]> {
      return request(() => [...records.values()]
        .sort((left, right) => (left.seq as number) - (right.seq as number))
        .map((row) => structuredClone(row)))
    },
    getAllKeys(): IDBRequest<number[]> {
      return request(() => [...records.keys()].sort((a, b) => a - b))
    },
    index(_name: string) {
      return fakeIndex()
    },
  })

  const fakeTxn = () => ({
    objectStore: () => fakeStore(),
    oncomplete: null as ((ev: unknown) => void) | null,
    onabort: null as ((ev: unknown) => void) | null,
    error: null,
  })

  const fakeDb: IDBDatabase = {
    close() {},
    objectStoreNames: { contains: () => opened },
    transaction: (() => fakeTxn()) as unknown as IDBDatabase["transaction"],
    createObjectStore(_name: string, _opts: { keyPath: string }) {
      opened = true
      return fakeStore() as unknown as IDBObjectStore
    },
  } as unknown as IDBDatabase

  const factory: IDBFactory = {
    open(_name: string, _version?: number): IDBOpenDBRequest {
      const req = {
        onsuccess: null as ((ev: unknown) => void) | null,
        onerror: null as ((ev: unknown) => void) | null,
        onupgradeneeded: null as ((ev: unknown) => void) | null,
        result: undefined as IDBDatabase | undefined,
        error: null as unknown,
        transaction: {
          objectStore: () => fakeStore(),
        },
      }
      queueMicrotask(() => {
        try {
          const upgrade = !opened
          req.result = fakeDb
          if (upgrade) req.onupgradeneeded?.({ target: req })
          req.onsuccess?.({ target: req })
        } catch (error) {
          req.error = error
          req.onerror?.({ target: req })
        }
      })
      return req as unknown as IDBOpenDBRequest
    },
    deleteDatabase(_name: string): IDBOpenDBRequest {
      return { onsuccess: null, onerror: null } as unknown as IDBOpenDBRequest
    },
    databases() { return Promise.resolve([]) },
    cmp() { return 0 },
  } as unknown as IDBFactory
  return factory
}

describe("loadScopedContinuitySnapshot — contenimento indipendente di factory e disposer (accept #5)", () => {
  // Difetto: gli elementi di un array literal sono valutati subito, quindi
  // `Promise.allSettled([a(), b()])` NON contiene un throw sincrono di a() o b():
  // l'espressione esplode prima che allSettled venga chiamata.
  it("un throw sincrono della seconda factory non lascia il primo reader senza dispose", async () => {
    const created = verifiedReader([])
    const factories = {
      createEventReader: async () => created,
      // Volutamente non async: lancia prima di restituire una promise.
      createWorkspaceReader: () => {
        throw new Error("workspace factory exploded synchronously")
      },
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const result = await loadScopedContinuitySnapshot(SCOPE_INPUT, factories)

    expect(typeof result.kind).toBe("string")
    expect(created.disposeCount).toBe(1)
  })

  it("un throw sincrono del primo disposer non sopprime il secondo ne rigetta il loader", async () => {
    const eventReader = verifiedReader([])
    const workspace = inMemoryWorkspace(new Map())
    let workspaceDisposed = 0
    workspace.dispose = async () => {
      workspaceDisposed += 1
    }
    eventReader.dispose = (() => {
      throw new Error("event reader dispose exploded synchronously")
    }) as unknown as () => Promise<void>

    const factories = {
      createEventReader: async () => eventReader,
      createWorkspaceReader: async () => workspace,
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const result = await loadScopedContinuitySnapshot(SCOPE_INPUT, factories)

    expect(typeof result.kind).toBe("string")
    expect(workspaceDisposed).toBe(1)
  })
})

describe("validateStoredEnvelopes — ogni ramo restituisce una collezione fresca e congelata (accept #4)", () => {
  // Difetto: il ramo zero-row restituiva `raw`, cioe' l'array POSSEDUTO
  // dall'adapter. Chi lo trattiene puo' mutarlo dopo il load e cambiare la
  // proiezione. I rami di fallimento restituivano `[]` fresco ma non congelato.
  it("zero envelope: la collezione non e' l'array dell'adapter, e' congelata, e mutarla non altera lo snapshot", async () => {
    const adapterArray: AppendedEventEnvelopeV2[] = []
    const reader = verifiedReader([])
    reader.readEnvelopesBySession = async () => adapterArray as readonly AppendedEventEnvelopeV2[]

    const factories = {
      createEventReader: async () => reader,
      createWorkspaceReader: async () => inMemoryWorkspace(new Map()),
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))

    expect(snapshot.lessonEvents).not.toBe(adapterArray)
    expect(Object.isFrozen(snapshot.lessonEvents)).toBe(true)

    adapterArray.push({ seq: 1 } as unknown as AppendedEventEnvelopeV2)
    expect(snapshot.lessonEvents.length).toBe(0)
  })

  it("envelope corrotto: il ramo di fallimento restituisce comunque una collezione congelata", async () => {
    const corrupt = [{ seq: 0 } as unknown as AppendedEventEnvelopeV2]
    const reader = verifiedReader([])
    reader.readEnvelopesBySession = async () => corrupt as readonly AppendedEventEnvelopeV2[]

    const factories = {
      createEventReader: async () => reader,
      createWorkspaceReader: async () => inMemoryWorkspace(new Map()),
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const snapshot = loadedOrThrow(await loadScopedContinuitySnapshot(SCOPE_INPUT, factories))

    expect(Object.isFrozen(snapshot.lessonEvents)).toBe(true)
    expect(snapshot.lessonEvents.length).toBe(0)
  })
})

describe("validateContinuityScopeV1 — gli identificatori sono catturati esattamente una volta (accept #2)", () => {
  // Difetto: lessonId e roomId erano letti due volte, sessionId tre. Un input
  // con getter puo' cambiare o lanciare fra una lettura e l'altra, quindi lo
  // scope validato non e' necessariamente quello usato per l'I/O (TOCTOU).
  it("un input con getter che cambiano dopo il primo accesso non altera lo scope validato", async () => {
    const counts = { lessonId: 0, roomId: 0, sessionId: 0 }
    const volatileScope = {
      get lessonId() {
        counts.lessonId += 1
        return counts.lessonId === 1 ? LESSON_ID : "scope-mutato-dopo-la-validazione"
      },
      get roomId() {
        counts.roomId += 1
        return counts.roomId === 1 ? LESSON_ID : "scope-mutato-dopo-la-validazione"
      },
      get sessionId() {
        counts.sessionId += 1
        return counts.sessionId === 1 ? SESSION_ID : "scope-mutato-dopo-la-validazione"
      },
    }

    const factories = {
      createEventReader: async () => verifiedReader([]),
      createWorkspaceReader: async () => inMemoryWorkspace(new Map()),
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const result = await loadScopedContinuitySnapshot(
      volatileScope as unknown as Parameters<typeof loadScopedContinuitySnapshot>[0],
      factories,
    )

    expect(result.kind).toBe("loaded")
    expect(counts).toEqual({ lessonId: 1, roomId: 1, sessionId: 1 })
  })

  it("un getter che lancia dopo il primo accesso non fa esplodere il loader", async () => {
    const seen = { lessonId: 0, roomId: 0, sessionId: 0 }
    const explodingScope = {
      get lessonId() {
        seen.lessonId += 1
        if (seen.lessonId > 1) throw new Error("lessonId getter exploded on re-read")
        return LESSON_ID
      },
      get roomId() {
        seen.roomId += 1
        if (seen.roomId > 1) throw new Error("roomId getter exploded on re-read")
        return LESSON_ID
      },
      get sessionId() {
        seen.sessionId += 1
        if (seen.sessionId > 1) throw new Error("sessionId getter exploded on re-read")
        return SESSION_ID
      },
    }

    const factories = {
      createEventReader: async () => verifiedReader([]),
      createWorkspaceReader: async () => inMemoryWorkspace(new Map()),
      buildCommitSha: BUILD_SHA,
    } as unknown as ContinuityRuntimeAdapterFactories

    const result = await loadScopedContinuitySnapshot(
      explodingScope as unknown as Parameters<typeof loadScopedContinuitySnapshot>[0],
      factories,
    )

    expect(result.kind).toBe("loaded")
  })
})

import { createImportedBundleContinuityWorkspaceReader } from "../lessonos/continuityRuntime"

describe("createImportedBundleContinuityWorkspaceReader — autorità posseduta, non presa a prestito (accept #3)", () => {
  // Difetto: `files` era catturata per closure ma mai copiata. ReadonlyMap e' un
  // vincolo solo TypeScript: a runtime il chiamante tiene un Map mutabile, e ogni
  // read() consultava quello vivo. L'autorita' del bundle era quindi del chiamante.
  it("sostituire una entry dopo la costruzione non cambia i byte serviti", async () => {
    const original = new Blob(["ORIGINALE"])
    const replacement = new Blob(["SOSTITUITO"])
    const callerMap = new Map<string, Blob>([["scene.json", original]])

    const reader = createImportedBundleContinuityWorkspaceReader(callerMap)
    callerMap.set("scene.json", replacement)

    const served = await reader.read("scene.json")
    expect(await served?.text()).toBe("ORIGINALE")
  })

  it("aggiungere una entry dopo la costruzione non estende l'autorità del bundle", async () => {
    const callerMap = new Map<string, Blob>()

    const reader = createImportedBundleContinuityWorkspaceReader(callerMap)
    callerMap.set("intruso.json", new Blob(["INTRUSO"]))

    expect(await reader.read("intruso.json")).toBeNull()
  })

  it("rimuovere una entry dopo la costruzione non cancella i byte già acquisiti", async () => {
    const callerMap = new Map<string, Blob>([["scene.json", new Blob(["ACQUISITO"])]])

    const reader = createImportedBundleContinuityWorkspaceReader(callerMap)
    callerMap.delete("scene.json")

    const served = await reader.read("scene.json")
    expect(await served?.text()).toBe("ACQUISITO")
  })
})

describe("createWorkspaceStoreContinuityWorkspaceReader — l autorita FSA non e autodichiarabile (accept #3)", () => {
  it("un oggetto letterale che si etichetta fsa non ottiene autorita FSA", () => {
    const spoof = { mode: "fsa" as const, read: async () => new Blob(["falso"]) }
    const reader = createWorkspaceStoreContinuityWorkspaceReader(spoof)
    expect(reader.persistence.kind).not.toBe("fsa")
  })
})
