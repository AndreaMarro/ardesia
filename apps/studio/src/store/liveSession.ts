import type { LessonOsSessionHandle } from '../lessonos/bootstrap'
import type { WorkspaceStore } from './WorkspaceStore'

/** Persist a newly opened session using its actual canonical start event. */
export async function persistLiveSession(
  workspace: Pick<WorkspaceStore, 'createSessionOnce'>,
  session: Pick<LessonOsSessionHandle, 'identity' | 'store'>,
): Promise<void> {
  const { lessonId, sessionId } = session.identity
  const events = await session.store.readEnvelopesBySession(lessonId, sessionId)
  const starts = events.filter(event => event.kind === 'lesson.started')
  if (starts.length !== 1 || starts[0]!.lessonId !== lessonId || starts[0]!.sessionId !== sessionId) {
    throw new Error('Documento sessione non creato: manca un avvio canonico univoco.')
  }
  const created = Date.parse(starts[0]!.occurredAt)
  if (!Number.isSafeInteger(created) || created < 0) throw new Error('Data di avvio sessione non valida.')
  const result = await workspace.createSessionOnce({ lessonId, sessionId }, { created })
  if (result.kind !== 'created' && result.kind !== 'idempotent') {
    throw new Error(`Documento sessione conservato senza sovrascrittura: ${result.kind}.`)
  }
}
