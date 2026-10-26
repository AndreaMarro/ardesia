// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { WorkspaceStore } from '../../../store/WorkspaceStore'
import { JournalRecorder } from '../../../store/JournalRecorder'
import { roomPaths } from '../../../store/roomPaths'
import { audioSha256, type AudioRecordingRef } from '../../../store/audioRecording'
import { revokeStoredAudioSession } from '../../../store/SessionAudioRecorder'
import { studioProducerIdentity } from '../../../core/contracts/eventEnvelope'
import ReplayView from '../../../ReplayView'

vi.mock('@excalidraw/excalidraw', () => ({ Excalidraw: () => 'canonical-board', FONT_FAMILY: { Nunito: 6 } }))
vi.mock('@excalidraw/excalidraw/index.css', () => ({}))
afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('revokes already-loaded v2 media without object references through the same canonical guard', async () => {
  URL.createObjectURL = vi.fn(() => 'blob:unlinked-consent')
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('probably')
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true })
    this.dispatchEvent(new Event('pause'))
  })
  const store = new WorkspaceStore(); await store.init()
  const identity = { lessonId: 'unlinked-consent', sessionId: crypto.randomUUID() }
  const created = await store.createSessionOnce(identity, { created: 1000 })
  if (created.kind !== 'created' && created.kind !== 'idempotent') throw Error(created.kind)
  await store.updateSessionAudioCAS(identity, { expectedSha256: created.snapshot.sha256, audioConsent: true, audioStartEpoch: 1000 })
  const data = new Blob(['synthetic integrity fixture'], { type: 'audio/wav' })
  const id = crypto.randomUUID()
  const recording: AudioRecordingRef = { v: 1, recordingId: id, assetPath: `raw/${identity.lessonId}/${identity.sessionId}/audio/${id}.wav`, mimeType: 'audio/wav', sha256: await audioSha256(data), bytes: data.size, startEpoch: 1000, endEpoch: 2000, durationMs: 1000, objectRefs: [] }
  await store.write(recording.assetPath, data)
  const journal = new JournalRecorder({ store, journalPath: roomPaths(identity.lessonId).journal, identity: { ...identity, actor: { type: 'teacher', id: 'synthetic-teacher' } }, producer: studioProducerIdentity(), now: () => 2000, withExclusiveLock: async (_name, work) => work() })
  await journal.recordAudioRecording(recording)
  const view = render(<ReplayView store={store} room={identity.lessonId} />)
  const audio = await waitFor(() => {
    const element = view.container.querySelector('audio')!
    expect(element?.getAttribute('src')).toBe('blob:unlinked-consent')
    return element
  })
  Object.defineProperty(audio, 'paused', { configurable: true, value: false })
  audio.dispatchEvent(new Event('play'))
  await revokeStoredAudioSession(store, identity)
  await waitFor(() => {
    expect(audio.paused).toBe(true)
    expect(audio.getAttribute('src')).toBeNull()
  }, { timeout: 1500 })
  expect(view.container.textContent).toMatch(/revocato|sessione.*modificata/i)
})
