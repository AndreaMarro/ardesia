import type { EventEvidence } from "../core/contracts/eventEnvelope"
import type { AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
import type { WorkspaceStore } from "./WorkspaceStore"
import { collectLessonWorkspaceEntries, LESSON_PATHS } from "./lessonBundle"
import { sha256Hex } from "./lessonBundleManifest"
import { validateRoomId } from "./roomPaths"

// Versioned references in the existing end evidence, not a second store/schema.
// Hashes prove consistency of bytes; they do not authenticate their author.
const PREFIX = "workspace:v1:"
type Receipt = Readonly<{ bodySha256: string; journal: { bytes: number; sha256: string } | null }>

export async function captureLessonRevisionEvidence(
  store: Pick<WorkspaceStore, "read" | "list">,
  room: string,
): Promise<readonly EventEvidence[]> {
  const lessonId = validateRoomId(room)
  const entries = await collectLessonWorkspaceEntries(store, lessonId)
  const inventory: Array<readonly [string, number, string]> = []
  for (const [path, entry] of entries) inventory.push([path, entry.data.size, await sha256Hex(entry.data)])
  inventory.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
  const body = await sha256Hex(new Blob([JSON.stringify(inventory)]))
  const journal = inventory.find(([path]) => path === LESSON_PATHS.JOURNAL)
  return [
    { ref: `${PREFIX}${lessonId}:body:sha256:${body}`, resolution: "verified" },
    journal
      ? { ref: `${PREFIX}${lessonId}:journal:${journal[1]}:sha256:${journal[2]}`, resolution: "verified" }
      : { ref: `${PREFIX}${lessonId}:journal:missing`, resolution: "missing" },
  ]
}

function receipt(evidence: readonly EventEvidence[], lessonId: string, required: boolean): Receipt | null {
  const refs = evidence.filter(item => item.ref.startsWith("workspace:"))
  if (!required && refs.length === 0) return null // Historical ends remain unchanged.
  const prefix = `${PREFIX}${lessonId}:`
  if (refs.length !== 2 || refs.some(item => !item.ref.startsWith(prefix))) {
    throw new Error("Materiale: ricevuta di chiusura assente o non valida")
  }
  const body = refs.find(item => item.ref.startsWith(`${prefix}body:`))
  const journal = refs.find(item => item.ref.startsWith(`${prefix}journal:`))
  const bodyMatch = body?.ref.slice(prefix.length).match(/^body:sha256:([a-f0-9]{64})$/)
  if (!bodyMatch || body?.resolution !== "verified" || !journal) throw new Error("Materiale: ricevuta di chiusura non valida")
  if (journal.ref === `${prefix}journal:missing` && journal.resolution === "missing") {
    return { bodySha256: bodyMatch[1]!, journal: null }
  }
  const match = journal.ref.slice(prefix.length).match(/^journal:(0|[1-9]\d*):sha256:([a-f0-9]{64})$/)
  const bytes = Number(match?.[1])
  if (!match || !Number.isSafeInteger(bytes) || journal.resolution !== "verified") {
    throw new Error("Materiale: ricevuta degli appunti non valida")
  }
  return { bodySha256: bodyMatch[1]!, journal: { bytes, sha256: match[2]! } }
}

/** The newest end binds the body; earlier ends bind append-only journal prefixes. */
export async function verifyLessonRevision(
  events: readonly AppendedEventEnvelopeV2[],
  room: string,
  currentEvidence: readonly EventEvidence[],
  journal: Blob,
): Promise<void> {
  const lessonId = validateRoomId(room)
  const ends = events.filter(event => event.kind === "lesson.ended").sort((a, b) => a.seq - b.seq)
  const current = receipt(currentEvidence, lessonId, true)!
  const latest = ends.at(-1)
  if (!latest) throw new Error("Materiale: ricevuta di chiusura mancante")
  for (const end of ends) {
    const closed = receipt(end.evidence, lessonId, end === latest)
    if (!closed) continue
    if (end === latest && closed.bodySha256 !== current.bodySha256) {
      throw new Error("Materiale: la revisione salvata non coincide con la chiusura")
    }
    if (closed.journal && (closed.journal.bytes > journal.size ||
        await sha256Hex(journal.slice(0, closed.journal.bytes)) !== closed.journal.sha256)) {
      throw new Error("Materiale: gli appunti non conservano la revisione di una sessione chiusa")
    }
  }
}
