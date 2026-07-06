// Contratto TypeScript dei moduli dati del Pack ELAB consumati dall'host via
// alias Vite `@elab-pack` (vite.config.ts). Il Pack è dato JS/JSON fuori dal
// project graph tsc (packs/elab-tutor, drift guard in PackElabTutorData.test):
// queste dichiarazioni sono il confine tipizzato che l'host si impegna a
// rispettare — stessi campi dei lesson-path (S1) del Pack.

declare module "@elab-pack/data/lesson-paths" {
  export interface PackLessonPathPhase {
    name?: string
    common_mistakes?: Array<{
      mistake: string
      teacher_response?: string | null
      analogy?: string | null
    }>
    concepts_learned?: string[]
    [key: string]: unknown
  }

  export interface PackLessonPath {
    experiment_id: string
    phases: PackLessonPathPhase[]
    book_reference?: { volume: number; page: number; label: string }
    [key: string]: unknown
  }

  export function getLessonPath(experimentId: string): PackLessonPath | null
  export function hasLessonPath(experimentId: string): boolean
  export function getAvailableLessonPaths(): string[]

  const LESSON_PATHS: Record<string, PackLessonPath>
  export default LESSON_PATHS
}

declare module "@elab-pack/data/volume-references" {
  // Stessi campi di packs/elab-tutor/data/volume-references.js (estratti dai
  // PDF ufficiali ELAB): la vista li mostra VERBATIM, mai rielaborati.
  export interface PackVolumeReference {
    volume: number
    bookPage: number
    chapter: string
    chapterPage: number
    bookText?: string
    bookInstructions?: string[]
    bookQuote?: string
    bookContext?: string
    [key: string]: unknown
  }

  export function getVolumeRef(experimentId: string): PackVolumeReference | null
  export function getBookPage(experimentId: string): number | null
  export function getVolumeLabel(experimentId: string): string | null

  const VOLUME_REFERENCES: Record<string, PackVolumeReference>
  export default VOLUME_REFERENCES
}
