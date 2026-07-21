import type { AppendedEvent } from "../lessonos/eventlog"
import type { JournalEvent } from "../store/JournalRecorder"
import type { EventLogReadLike } from "../toolhost/caps/graph"

/**
 * Fixed, pseudonymous event-log fixture for visual and interaction contracts.
 * It contains no user data, storage access, clock reads, or network calls.
 */
export const STORY_LESSON_EVENTS = [
  {
    seq: 1,
    kind: "lesson.started",
    room: "classe-pseudonima-a",
    t: 1_718_000_000_000,
    evidence: ["lesson:classe-pseudonima-a@1718000000000"],
  },
  {
    seq: 2,
    kind: "concept.introduced",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Legge di Ohm" },
    t: 1_718_000_000_100,
    evidence: ["manual:vol1:p29"],
  },
  {
    seq: 3,
    kind: "error.observed",
    errorId: "errore:led-invertito",
    conceptId: "concetto:legge-ohm",
    labels: { it: "LED collegato al contrario" },
    t: 1_718_000_000_200,
    evidence: ["board:wire-pseudonimo-1", "manual:vol1:p29"],
  },
  {
    seq: 4,
    kind: "lesson.ended",
    room: "classe-pseudonima-a",
    t: 1_718_000_000_300,
    evidence: ["lesson:classe-pseudonima-a@1718000000300"],
  },
] satisfies readonly AppendedEvent[]

export const STORY_JOURNAL_EVENTS = [
  {
    t: 1_718_000_000_120,
    type: "element.add",
    element: { id: "resistor-pseudonimo-1", type: "rectangle", version: 1 },
  },
  { t: 1_718_000_000_140, type: "math.insert", latex: "V = R I" },
  { t: 1_718_000_000_160, type: "pdf.page.view", page: 29, totalPages: 31 },
] satisfies readonly JournalEvent[]

/** A corrected error remains visible in the graph but creates no pending pack action. */
export const STORY_READ_ONLY_EVENTS = [
  STORY_LESSON_EVENTS[0],
  STORY_LESSON_EVENTS[1],
  STORY_LESSON_EVENTS[2],
  {
    seq: 4,
    kind: "exercise.completed",
    exerciseId: "esercizio:correggi-led",
    conceptId: "concetto:legge-ohm",
    correctsErrorId: "errore:led-invertito",
    labels: { it: "Correggi la polarità del LED" },
    t: 1_718_000_000_250,
    evidence: ["board:led-pseudonimo-1"],
  },
  { ...STORY_LESSON_EVENTS[3], seq: 5 },
] satisfies readonly AppendedEvent[]

export function storyEventLog(
  events: readonly AppendedEvent[] = STORY_LESSON_EVENTS,
): EventLogReadLike {
  return {
    async readAll() {
      return [...events]
    },
  }
}
