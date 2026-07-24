// ARDESIA Studio — porta di lettura del digesto di studio.
//
// RecapView costruiva lo store degli eventi e chiamava `readAll()` per poi
// filtrare in memoria. Due problemi distinti, che vanno separati per non
// promettere più di quello che si mantiene:
//
// 1. **chi legge** — una vista non deve provvedere da sé la persistenza
//    (ADR-0004). Questo modulo lo risolve: la vista chiede un digesto, non uno
//    store;
// 2. **quanto si legge** — la lettura resta una scansione completa.
//
// Il punto 2 NON è risolto qui, ed è importante dirlo: `buildRoomStudyDigest`
// non filtra per lezione, ricava una FINESTRA TEMPORALE dagli eventi
// `lesson.started`/`lesson.ended` della stanza e poi tiene tutti gli eventi in
// quella finestra, di qualunque provenienza. Sostituire `readAll()` con
// `readEnvelopesByLesson(room)` scarterebbe gli eventi non etichettati con
// quella lezione ma avvenuti durante la lezione: sarebbe un cambio di
// semantica del materiale didattico travestito da ottimizzazione.
//
// (In più, oggi `readEnvelopesByLesson` è implementata come
// `readAllEnvelopes().filter(...)`: non ci sarebbe nemmeno il guadagno che il
// nome suggerisce. Solo `readEnvelopesBySession` usa davvero l'indice composto.)
//
// Restringere la lettura è un lavoro a sé, che richiede prima di decidere quale
// sia la semantica corretta del digesto. Qui cambia il proprietario, non il
// contenuto.

import { lessonEventLog, type LessonEventLog } from "./eventLogProvider"
import { buildRoomStudyDigest, type StudyDigest } from "./studyDigest"

export interface StudyDigestReader {
  /** Digesto della stanza, o `null` se il log non è leggibile. */
  readRoomDigest(room: string): Promise<StudyDigest | null>
}

export function createStudyDigestReader(
  openLog: () => Promise<LessonEventLog> = lessonEventLog,
): StudyDigestReader {
  return {
    async readRoomDigest(room: string): Promise<StudyDigest | null> {
      // Fail-soft identico a prima: senza log leggibile il materiale resta
      // valido, solo privo delle sezioni pedagogiche. Il fallimento non deve
      // togliere al docente il recap che ha già.
      try {
        const log = await openLog()
        return buildRoomStudyDigest(await log.readAll(), room)
      } catch {
        return null
      }
    },
  }
}

export const defaultStudyDigestReader: StudyDigestReader = createStudyDigestReader()
