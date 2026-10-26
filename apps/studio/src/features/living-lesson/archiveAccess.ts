import { subscribeStudySessionEnd } from '../../study/sessionBoundary'
import type { LessonAccess } from './model'
import { recordingSession, type AudioRecordingRef } from '../../store/audioRecording'

export interface ArchiveLessonAccess extends LessonAccess {
  authorizeRecording(recording: AudioRecordingRef): Promise<boolean>
}

/** Access to an already opened local archive. This is not a Core identity or
 * a grant to remote bytes. The replay still verifies the canonical session,
 * consent, recording identity and media hash before playback. */
export function createArchiveLessonAccess(lessonId: string): ArchiveLessonAccess {
  let permitted = true
  return {
    allowed: () => permitted,
    authorize: async moment => permitted && moment.lessonId === lessonId,
    authorizeRecording: async recording => permitted && recordingSession(recording).lessonId === lessonId,
    subscribe: listener => subscribeStudySessionEnd(() => {
      permitted = false
      listener()
    }),
  }
}
