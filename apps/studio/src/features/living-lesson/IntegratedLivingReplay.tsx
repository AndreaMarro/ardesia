import { useMemo, useState, type ReactNode } from 'react'
import type { WorkspaceStore } from '../../store/WorkspaceStore'
import { recordingSession } from '../../store/audioRecording'
import LivingLessonReplay from './LivingLessonReplay'
import { createArchiveLessonAccess } from './archiveAccess'
import type { Editorial, LessonMoment } from './model'
import type { ReplayCursor } from './replayCursor'
import './integrated-replay.css'

/** The production host provides one audio element and one seek authority.
 * Notes are intentionally absent without an authenticated Core note port. */
export function IntegratedLivingReplay({ store, room, cursor, editorial, captions, onUnavailable }: {
  store: WorkspaceStore
  room: string
  cursor: ReplayCursor
  editorial: Editorial
  captions: ReactNode
  onUnavailable: (message: string) => void
}) {
  const [showWaveform, setShowWaveform] = useState(true)
  const access = useMemo(() => createArchiveLessonAccess(room), [store, room])
  const recording = cursor.recording
  // Stable for the entire take: scrubbing does not replace the consent lease.
  const moment = useMemo<LessonMoment | null>(() => recording?.objectRefs.length ? {
    id: `take-${recording.recordingId}`,
    title: recording.objectRefs.map(ref => ref.label).join(', ').slice(0, 240),
    kind: 'marker',
    ...recordingSession(recording),
    recordingId: recording.recordingId,
    sha256: recording.sha256,
    epoch: recording.endEpoch,
    objectRefs: [...recording.objectRefs],
  } : null, [recording])
  if (!recording) return <>{captions}</>
  return <div className="st-living-replay">
    <button type="button" className="st-ghost" aria-expanded={showWaveform} onClick={() => setShowWaveform(value => !value)}>
      {showWaveform ? 'Nascondi waveform' : 'Mostra waveform'}
    </button>
    <LivingLessonReplay
      store={store} lessonId={room} moment={moment ?? undefined} editorial={editorial}
      access={access} cursor={cursor} showWaveform={showWaveform}
      authorizeRecording={access.authorizeRecording}
      captionContent={captions} onUnavailable={onUnavailable}
    />
  </div>
}
