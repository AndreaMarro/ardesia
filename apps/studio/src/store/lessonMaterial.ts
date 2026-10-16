// A closed lesson material is a derived read, never another persisted store.
import {
  assertEventEnvelopeV2,
  assertFounderBetaAuthority,
  type EventEvidence,
} from "../core/contracts/eventEnvelope"
import {
  assertLessonOsEnvelopePayload,
  toLegacyLessonOsEvent,
  type AppendedEvent,
  type AppendedEventEnvelopeV2,
} from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import { buildStudyDigest, type StudyDigest, type StudyDigestRecord } from "../lessonos/studyDigest"
import { roomPaths, validateRoomId } from "./roomPaths"
import { isConstructedWorkspaceStore, parseLessonMeta, type WorkspaceStore } from "./WorkspaceStore"
import { openIndexedDbEventLog, serializeEnvelopeEventLogSnapshot } from "../lessonos/indexedDbEventLog"
import { decodeJournalJsonl } from "./ReplayEngine"
import { toLegacyJournalEvent } from "./JournalRecorder"
import { buildRecap, type LessonRecap } from "./lessonRecap"
import { exportLesson } from "./lessonBundle"
import { sha256Hex } from "./lessonBundleManifest"
import { buildRecapHtml, type LessonMaterialProvenance } from "./recapHtml"
import { captureLessonRevisionEvidence, verifyLessonRevision } from "./lessonRevision"

export type LessonEndWatermark = Readonly<{ sessionId: string; endEventId: string; endSeq: number }>

function canonicalRow(value: unknown): AppendedEventEnvelopeV2 {
  const copy: unknown = structuredClone(value)
  if (typeof copy !== "object" || copy === null || Array.isArray(copy)) throw new Error("Materiale: evento canonico non valido")
  const { seq, ...envelope } = copy as Record<string, unknown>
  if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 1) throw new Error("Materiale: sequenza canonica non valida")
  assertEventEnvelopeV2(envelope)
  assertFounderBetaAuthority(envelope)
  assertLessonOsEnvelopePayload(envelope.kind, envelope.payload)
  return { ...envelope, seq } as AppendedEventEnvelopeV2
}

function recorded(event: AppendedEventEnvelopeV2): StudyDigestRecord {
  const labels = event.payload.labels as Record<string, string>
  return {
    eventId: event.eventId, sessionId: event.sessionId,
    label: labels.it ?? Object.values(labels)[0] ?? event.kind,
    evidence: event.evidence,
    ...(typeof event.payload.currentMa === "number" ? { currentMa: event.payload.currentMa } : {}),
  }
}

/** Identity and stored order define this scope. Wall-clock overlap does not. */
export function projectClosedLessonEvents(input: readonly unknown[], room: string): Readonly<{
  events: readonly AppendedEventEnvelopeV2[]
  digest: StudyDigest
  watermarks: readonly LessonEndWatermark[]
}> {
  const lessonId = validateRoomId(room)
  const events = input.map(canonicalRow).filter(event => event.lessonId === lessonId).sort((a, b) => a.seq - b.seq)
  if (events.length === 0) throw new Error("Materiale: memoria canonica della lezione mancante")
  const sessions = new Map<string, AppendedEventEnvelopeV2[]>()
  const eventIds = new Set<string>(); const sequences = new Set<number>(); const keys = new Set<string>()
  for (const event of events) {
    if (eventIds.has(event.eventId) || sequences.has(event.seq) || (event.idempotencyKey !== null && keys.has(event.idempotencyKey))) {
      throw new Error("Materiale: identità o sequenza duplicata")
    }
    eventIds.add(event.eventId); sequences.add(event.seq)
    if (event.idempotencyKey !== null) keys.add(event.idempotencyKey)
    const session = sessions.get(event.sessionId) ?? []
    session.push(event); sessions.set(event.sessionId, session)
  }
  const digest: StudyDigest = { concepts: [], errors: [], results: [], exercises: [], materials: [] }
  const results: StudyDigestRecord[] = []; const exercises: StudyDigestRecord[] = []
  const materials: Array<StudyDigestRecord & { id: string }> = []
  const watermarks: LessonEndWatermark[] = []
  for (const [sessionId, session] of sessions) {
    const start = session[0]!; const end = session.at(-1)!
    if (start.kind !== "lesson.started" || end.kind !== "lesson.ended" ||
        session.filter(event => event.kind === "lesson.started").length !== 1 ||
        session.filter(event => event.kind === "lesson.ended").length !== 1) {
      throw new Error("Materiale: sessione non chiusa o eventi successivi alla fine")
    }
    for (const event of session) {
      if (event.actor.type !== start.actor.type || event.actor.id !== start.actor.id ||
          event.producer.id !== start.producer.id || event.producer.version !== start.producer.version ||
          event.producer.commitSha !== start.producer.commitSha ||
          ((event.kind === "lesson.started" || event.kind === "lesson.ended") && event.payload.room !== lessonId)) {
        throw new Error("Materiale: identità della sessione incoerente")
      }
    }
    const legacy = session.map(toLegacyLessonOsEvent).filter((event): event is AppendedEvent => event !== null)
    const projected = buildStudyDigest(materialize(legacy))
    const details = (refs: readonly string[]): readonly EventEvidence[] => {
      const unique = new Map<string, EventEvidence>()
      for (const event of session) for (const evidence of event.evidence) {
        if (refs.includes(evidence.ref)) unique.set(`${evidence.resolution}\0${evidence.ref}`, evidence)
      }
      return [...unique.values()]
    }
    // Preserve original domain IDs, and keep session identity alongside them.
    // A completion from B cannot mark an error in A corrected.
    digest.concepts.push(...projected.concepts.map(item => ({ ...item, sessionId, evidenceDetails: details(item.evidence) })))
    digest.errors.push(...projected.errors.map(item => ({ ...item, sessionId, evidenceDetails: details(item.evidence) })))
    for (const event of session) {
      if (event.kind === "simulation.circuit.solved") results.push(recorded(event))
      if (event.kind === "exercise.completed" || event.kind === "simulation.step.completed" || event.kind === "quiz.attempted") exercises.push(recorded(event))
      if (event.kind === "material.cited") materials.push({ ...recorded(event), id: event.payload.materialId as string })
    }
    watermarks.push({ sessionId, endEventId: end.eventId, endSeq: end.seq })
  }
  digest.results = results; digest.exercises = exercises; digest.materials = materials
  return { events, digest, watermarks: watermarks.sort((a, b) => a.sessionId.localeCompare(b.sessionId)) }
}

export type ClosedLessonMaterial = Readonly<{
  recap: LessonRecap
  digest: StudyDigest
  bundle: Blob
  html: string
  revision: LessonMaterialProvenance & Readonly<{ journalSha256: string; sceneSha256: string }>
}>

/** Capture once while inactive; consumers download these bytes without live rereads. */
export async function captureClosedLessonMaterial(store: WorkspaceStore, room: string): Promise<ClosedLessonMaterial> {
  if (typeof room !== "string") throw new Error("Invalid room identifier")
  const lessonId = validateRoomId(room)
  if (!isConstructedWorkspaceStore(store)) throw new Error("Materiale: archivio della lezione non disponibile")
  return store.withInactiveLessonRead(lessonId, async () => {
    const current = await openIndexedDbEventLog({ scope: { lessonId } })
    let failed = false; let failure: unknown
    try {
      if (current.backend.kind !== "verified-indexeddb" || current.log === null) {
        throw new Error(`Materiale: memoria locale non disponibile (${current.backend.kind})`)
      }
      const closed = projectClosedLessonEvents(await current.log.readEnvelopesByLesson(lessonId), lessonId)
      const paths = roomPaths(lessonId)
      const captured = new Map<string, Promise<Blob | null>>()
      captured.set(paths.lessonOsSnapshot, Promise.resolve(serializeEnvelopeEventLogSnapshot(closed.events)))
      const read = (path: string): Promise<Blob | null> => {
        let value = captured.get(path)
        if (!value) { value = store.read(path); captured.set(path, value) }
        return value
      }
      const listings = new Map<string | undefined, ReturnType<WorkspaceStore["list"]>>()
      const list: WorkspaceStore["list"] = prefix => {
        let value = listings.get(prefix)
        if (!value) { value = store.list(prefix); listings.set(prefix, value) }
        return value
      }
      const journal = await read(paths.journal); const scene = await read(paths.scene)
      if (!journal || !scene) throw new Error("Materiale: appunti o lavagna della lezione non disponibili")
      await verifyLessonRevision(closed.events, lessonId, await captureLessonRevisionEvidence({ read, list }, lessonId), journal)
      const decoded = decodeJournalJsonl(await journal.text(), paths.journal)
      if (decoded.issues.length > 0 || decoded.legacy.length !== decoded.envelopes.map(toLegacyJournalEvent).filter(Boolean).length) {
        throw new Error("Materiale: appunti legacy o incompleti, non una revisione canonica chiusa")
      }
      const owners = new Map(closed.events.filter(event => event.kind === "lesson.started").map(event => [event.sessionId, event]))
      for (const event of decoded.envelopes) {
        const owner = owners.get(event.sessionId)
        if (!owner || event.actor.type !== owner.actor.type || event.actor.id !== owner.actor.id ||
            event.producer.id !== owner.producer.id || event.producer.version !== owner.producer.version ||
            event.producer.commitSha !== owner.producer.commitSha) {
          throw new Error("Materiale: appunti e sessione non coerenti")
        }
      }
      const metaBlob = await read(paths.meta); const meta = await parseLessonMeta(metaBlob)
      if (metaBlob !== null && meta === null) throw new Error("Materiale: titolo della lezione non leggibile")
      const recap = await buildRecap({ read, loadMeta: async () => meta }, lessonId)
      if (!recap) throw new Error("Materiale: riepilogo non disponibile")
      const parsed: unknown = JSON.parse(await scene.text())
      if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as { elements?: unknown }).elements)) {
        throw new Error("Materiale: lavagna non leggibile")
      }
      const elements = (parsed as { elements: unknown[] }).elements
      const ids = new Set<string>(); const sceneTexts: Array<{ elementId: string; text: string }> = []
      let figures = false
      for (const value of elements) {
        if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Materiale: elemento lavagna non valido")
        const element = value as Record<string, unknown>
        if (typeof element.id !== "string" || ids.has(element.id)) throw new Error("Materiale: identità lavagna non valida")
        ids.add(element.id)
        if (element.isDeleted) continue
        if (element.type === "text") {
          if (typeof element.text !== "string") throw new Error("Materiale: testo lavagna non valido")
          sceneTexts.push({ elementId: element.id, text: element.text })
        } else figures = true
      }
      const byElement = (a: { elementId: string }, b: { elementId: string }) => a.elementId.localeCompare(b.elementId)
      const journalTexts = (recap.boardTexts ?? []).map(({ elementId, text }) => ({ elementId, text })).sort(byElement)
      if (JSON.stringify(sceneTexts.sort(byElement)) !== JSON.stringify(journalTexts)) {
        throw new Error("Materiale: testo della lavagna e appunti non coerenti")
      }
      // A readonly view of captured bytes. No other event-log/store is created.
      const bundle = await exportLesson({ read, list }, lessonId)
      const revision = Object.freeze({ lessonId, bundleSha256: await sha256Hex(bundle),
        journalSha256: await sha256Hex(journal), sceneSha256: await sha256Hex(scene), sessions: closed.watermarks,
        omissions: figures ? ["Figure e immagini della lavagna non incluse in questa anteprima; sono conservate nel file .lesson."] : [],
      })
      return Object.freeze({ recap, digest: closed.digest, bundle, revision,
        html: buildRecapHtml(recap, closed.digest, revision) })
    } catch (error) { failed = true; failure = error; throw error }
    finally {
      try { await current.close() }
      catch (closeError) {
        if (failed) throw new AggregateError([failure, closeError], "Materiale: lettura e chiusura dell'archivio fallite")
        throw closeError
      }
    }
  })
}
