/**
 * Maps a LessonOS append outcome to the Room storage diagnostic (F-02).
 *
 * Pure seam so the "rejection becomes visible" property is unit-testable
 * without mounting Room: resolved appends stay silent, rejected appends
 * produce the didactic-memory persistence message the view renders.
 */
export function reportLessonOsAppendResult(
  outcome: Promise<unknown>,
  setStorageError: (message: string | null) => void,
): Promise<void> {
  return outcome.then(
    () => {},
    (error: unknown) => {
      setStorageError(
        `Memoria didattica non registrata: ${error instanceof Error ? error.message : String(error)}`,
      )
    },
  )
}
