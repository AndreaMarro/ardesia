import { describe, expect, it } from "vitest"
import { createEventEnvelopeV2, type EventEvidence } from "../core/contracts/eventEnvelope"
import { captureLessonRevisionEvidence, verifyLessonRevision } from "../store/lessonRevision"
import { roomPaths } from "../store/roomPaths"
import { memoryLessonWorkspace } from "./closedLessonFixture"

const ROOM = "revision-synthetic"
let id = 0
function end(seq: number, evidence: readonly EventEvidence[]) {
  return { ...createEventEnvelopeV2({ lessonId: ROOM, sessionId: `dddddddd-dddd-4ddd-8ddd-${seq.toString(16).padStart(12, "0")}`,
    kind: "lesson.ended", payload: { room: ROOM }, actor: { type: "teacher", id: "synthetic" },
    producer: { id: "test.revision", version: "1.0.0", commitSha: "f".repeat(40) },
    causationId: null, idempotencyKey: null, evidence,
  }, { eventId: () => `dddddddd-dddd-4ddd-8ddd-${(++id).toString(16).padStart(12, "0")}`, now: () => new Date(1000) }), seq }
}

async function body() {
  const store = memoryLessonWorkspace(); const paths = roomPaths(ROOM)
  await store.write(paths.scene, new Blob(["synthetic scene"]))
  await store.write(paths.journal, new Blob(["first synthetic row\n"]))
  const evidence = await captureLessonRevisionEvidence(store, ROOM)
  return { store, paths, evidence }
}

describe("workspace evidence on the canonical end", () => {
  it("accepts appended journal bytes while retaining every earlier closed prefix", async () => {
    const { store, paths, evidence } = await body()
    const first = (await store.read(paths.journal))!
    await store.write(paths.journal, new Blob([first, "second synthetic row\n"]))
    const current = await captureLessonRevisionEvidence(store, ROOM)
    await expect(verifyLessonRevision([end(2, evidence), end(4, current)], ROOM, current, (await store.read(paths.journal))!, [])).resolves.toBeUndefined()
  })

  it("refuses a rewritten earlier author's prefix even when the latest receipt matches", async () => {
    const { store, paths, evidence } = await body()
    await store.write(paths.journal, new Blob(["OTHER synthetic row\nsecond synthetic row\n"]))
    const current = await captureLessonRevisionEvidence(store, ROOM)
    await expect(verifyLessonRevision([end(2, evidence), end(4, current)], ROOM, current, (await store.read(paths.journal))!, [])).rejects.toThrow(/sessione chiusa/)
  })

  it("permits historical unbound ends only when a newer end binds the whole current body", async () => {
    const { store, paths, evidence } = await body()
    const historical = [{ ref: "lesson:synthetic-legacy-end", resolution: "verified" as const }]
    await expect(verifyLessonRevision([end(2, historical)], ROOM, evidence, (await store.read(paths.journal))!, [])).rejects.toThrow(/ricevuta/)
    await expect(verifyLessonRevision([end(2, historical), end(4, evidence)], ROOM, evidence, (await store.read(paths.journal))!, [])).resolves.toBeUndefined()
  })

  it.each(["version", "duplicate", "room", "resolution", "unsafe-size"] as const)("rejects malformed receipt evidence (%s)", async fault => {
    const { store, paths, evidence } = await body(); let invalid = structuredClone(evidence) as EventEvidence[]
    if (fault === "version") invalid = invalid.map(item => ({ ...item, ref: item.ref.replace("workspace:v1:", "workspace:v2:") }))
    if (fault === "duplicate") invalid.push(invalid[0]!)
    if (fault === "room") invalid = invalid.map(item => ({ ...item, ref: item.ref.replace(ROOM, "different-lesson") }))
    if (fault === "resolution") invalid[0] = { ...invalid[0]!, resolution: "missing" }
    if (fault === "unsafe-size") invalid[1] = { ...invalid[1]!, ref: invalid[1]!.ref.replace(/:journal:\d+:/, ":journal:9007199254740992:") }
    await expect(verifyLessonRevision([end(2, invalid)], ROOM, evidence, (await store.read(paths.journal))!, [])).rejects.toThrow(/ricevuta/)
  })

  it("binds consented audio bytes and inventory without reading audio while consent is absent", async () => {
    const { store, paths } = await body()
    await store.write(`${paths.audioDir}synthetic.webm`, new Blob([new Uint8Array([0, 255, 128, 7])]))
    const noConsent = await captureLessonRevisionEvidence(store, ROOM)
    await store.write(`${paths.audioDir}synthetic.webm`, new Blob([new Uint8Array([3, 2, 1])]))
    expect(await captureLessonRevisionEvidence(store, ROOM)).toEqual(noConsent)
    await store.write(paths.session, new Blob(["v: 1\ncreated: 0\naudioConsent: true\n"]))
    const consented = await captureLessonRevisionEvidence(store, ROOM)
    await store.write(`${paths.audioDir}synthetic.webm`, new Blob([new Uint8Array([1, 2, 3])]))
    const changed = await captureLessonRevisionEvidence(store, ROOM)
    expect(changed).not.toEqual(consented)
    await expect(verifyLessonRevision([end(2, consented)], ROOM, changed, (await store.read(paths.journal))!, [])).rejects.toThrow(/revisione/)
  })
})
