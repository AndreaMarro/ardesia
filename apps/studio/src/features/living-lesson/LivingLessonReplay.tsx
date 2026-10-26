import { useEffect, useRef, useState, type ReactNode } from 'react'
import WaveSurfer from './vendor/wavesurfer/wavesurfer.esm.js'
import Regions from './vendor/wavesurfer/plugins/regions.esm.js'
import Timeline from './vendor/wavesurfer/plugins/timeline.esm.js'
import type { WorkspaceStore } from '../../store/WorkspaceStore'
import { readAudioSession, resolveReplayRecording } from '../../store/audioRecording'
import { createPlaybackLease } from './playbackLease'
import { createIntentFence } from './intentFence'
import { assertCursorRecording, type Editorial, type LessonAccess, type LessonMoment, type PrivateNotes } from './model'
import type { ReplayCursor } from './replayCursor'

export interface LivingLessonReplayProps {
  store: WorkspaceStore; lessonId: string; moment: LessonMoment; editorial: Editorial; access: LessonAccess
  cursor: ReplayCursor; showWaveform?: boolean; notes?: PrivateNotes; captionContent?: ReactNode; onUnavailable: (reason: string) => void
}
/** A projection of ReplayView's media/cursor. Source ownership remains in ReplayView. */
export default function LivingLessonReplay({ store, lessonId, moment, editorial, access, cursor, showWaveform = true, notes, captionContent, onUnavailable }: LivingLessonReplayProps) {
  type SourceBinding = { media: HTMLMediaElement; moment: LessonMoment; access: LessonAccess; key: string; sessionSha: string; data: Blob }
  const sourceBinding = useRef<SourceBinding | null>(null)
  const [source, setSource] = useState<SourceBinding | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Caricamento waveform…')
  const [playing, setPlaying] = useState(false)
  const [note, setNote] = useState('')
  const [noteReady, setNoteReady] = useState(false)
  const [noteScope, setNoteScope] = useState<{ moment: LessonMoment; notes: PrivateNotes | undefined; access: LessonAccess } | null>(null)
  const [noteStatus, setNoteStatus] = useState('')
  const playActions = useRef(createIntentFence())
  const noteActions = useRef(createIntentFence())
  const cursorRef = useRef(cursor); cursorRef.current = cursor
  const failed = useRef(onUnavailable); failed.current = onUnavailable
  const recording = cursor.recording
  const media = cursor.media
  const recordingKey = recording ? JSON.stringify([recording.assetPath, recording.recordingId, recording.sha256, recording.startEpoch, recording.endEpoch]) : ''
  const sourceReady = source?.media === media && source.moment === moment && source.access === access && source.key === recordingKey
  const seconds = recording && cursor.epoch !== null ? (cursor.epoch - recording.startEpoch) / 1000 : 0
  const duration = recording ? recording.durationMs / 1000 : 0
  const currentNote = noteScope?.moment === moment && noteScope.notes === notes && noteScope.access === access
  const currentNoteReady = currentNote && noteReady

  useEffect(() => () => { playActions.current.invalidate(); noteActions.current.invalidate() }, [moment, media, access])
  useEffect(() => {
    let active = true
    setNote(''); setNoteReady(!notes); setNoteScope({ moment, notes, access }); setNoteStatus('')
    const unsubscribe = access.subscribe(() => { active = false; noteActions.current.invalidate(); setNote(''); setNoteReady(false); setNoteScope(null); setNoteStatus('Accesso alla nota terminato') })
    if (notes) void notes.read(moment).then(value => {
      if (active) { setNote(value); setNoteReady(true) }
    }).catch(error => { if (active) setNoteStatus('Nota non disponibile: ' + (error as Error).message) })
    return () => { active = false; unsubscribe() }
  }, [notes, moment, access])

  useEffect(() => {
    if (!media || !recording?.data) return
    let disposed = false, ended = false, checking = false
    let sessionSha: string | null = null
    const stop = () => {
      ended = true; sourceBinding.current = null; playActions.current.invalidate()
      media.pause(); media.removeAttribute('src')
      if (!disposed) { setPlaying(false); setSource(null) }
    }
    const unavailable = (reason: string) => { if (!disposed && !ended) { stop(); failed.current(reason) } }
    const lease = createPlaybackLease(access, () => unavailable('Accesso al passaggio terminato'))
    const check = async () => {
      if (checking || disposed || ended || !sessionSha) return
      checking = true
      try {
        assertCursorRecording(lessonId, moment, cursorRef.current.recording)
        if (!await lease.authorize(moment)) throw Error('Audio non autorizzato')
        if (disposed || ended) return
        const session = await readAudioSession(store, { lessonId, sessionId: moment.sessionId })
        if (disposed || ended) return
        if (!session?.value.audioConsent) throw Error('Audio revocato o sessione mancante')
        if (session.sha256 !== sessionSha) throw Error('Sessione audio modificata. Riapri il passaggio.')
      } catch (error) {
        unavailable((error as Error).message)
      } finally { checking = false }
    }
    const onPlay = () => { setPlaying(true); void check() }, onPause = () => setPlaying(false)
    media.addEventListener('play', onPlay); media.addEventListener('pause', onPause); media.addEventListener('ended', onPause)
    const initialize = async () => {
      assertCursorRecording(lessonId, moment, cursorRef.current.recording)
      if (!await lease.authorize(moment)) throw Error('Audio non autorizzato')
      if (disposed || ended) return
      const snapshot = await store.readLessonSnapshot(lessonId, async reader => ({
        session: await readAudioSession(reader, { lessonId, sessionId: moment.sessionId }),
        recording: await resolveReplayRecording(reader, recording),
      }))
      if (disposed || ended) return
      if (!snapshot.session?.value.audioConsent) throw Error('Audio revocato o sessione mancante')
      if (snapshot.recording.availability !== 'available' || !snapshot.recording.data) throw Error('Audio indisponibile: file canonico mancante o non integro')
      sessionSha = snapshot.session.sha256
      // The session may have changed after the canonical snapshot released its lease.
      await check()
      if (disposed || ended) return
      const binding = { media, moment, access, key: recordingKey, sessionSha: snapshot.session.sha256, data: snapshot.recording.data }
      sourceBinding.current = binding; setSource(binding)
    }
    void initialize().catch(error => unavailable((error as Error).message))
    const timer = setInterval(() => { void check() }, 250)
    return () => {
      disposed = true; clearInterval(timer)
      media.removeEventListener('play', onPlay); media.removeEventListener('pause', onPause); media.removeEventListener('ended', onPause)
      lease.dispose(); sourceBinding.current = null; playActions.current.invalidate()
    }
  }, [store, lessonId, moment, access, media, recordingKey, recording?.data])

  // Hiding/destroying the renderer never unmounts the consent guard or changes the media source.
  useEffect(() => {
    const host = container.current
    if (!showWaveform) { setStatus('Waveform nascosta'); return }
    setStatus('Caricamento waveform…')
    if (!sourceReady || !source || !media || !host || !recording) return
    let disposed = false
    let wave: WaveSurfer | null = null
    let decoder: AudioContext | null = null
    const load = async () => {
      decoder = new AudioContext()
      const decoded = await decoder.decodeAudioData(await source.data.arrayBuffer())
      await decoder.close(); decoder = null
      if (disposed || !media.src) return
      const regions = Regions.create()
      // Existing element/source + verified peaks. No loadBlob(), Record plugin or owned URL.
      wave = WaveSurfer.create({ container: host, media, peaks: [decoded.getChannelData(0)], duration: recording.durationMs / 1000, height: 88, waveColor: '#7c9890', progressColor: '#234b41', cursorColor: '#ad5b39', interact: false, dragToSeek: false, plugins: [Timeline.create({ height: 22 }), regions] })
      wave.on('ready', () => {
        if (disposed) return
        for (const marker of editorial.moments.filter(m => m.recordingId === recording.recordingId)) regions.addRegion({ id: marker.id, start: (marker.epoch - recording.startEpoch) / 1000, content: marker.title, drag: false, resize: false, color: 'rgba(173,91,57,.25)' })
        setStatus('Waveform pronta')
      })
      wave.on('error', () => { if (!disposed) setStatus('Waveform non disponibile. I controlli audio restano disponibili.') })
      regions.on('region-clicked', (region, event) => { event.stopPropagation(); if (!disposed) cursorRef.current.seekEpoch(recording.startEpoch + region.start * 1000) })
    }
    void load().catch(() => { if (!disposed) setStatus('Waveform non disponibile. I controlli audio restano disponibili.') })
    return () => { disposed = true; wave?.destroy(); if (decoder) void decoder.close() }
  }, [showWaveform, source, sourceReady, media, recordingKey, editorial])

  async function toggle() {
    const current = playActions.current.begin()
    const binding = sourceBinding.current
    const valid = () => current() && access.allowed() && cursorRef.current.media === media && sourceBinding.current === binding
    if (!binding || binding.media !== media || binding.moment !== moment || binding.access !== access || binding.key !== recordingKey) return
    try {
      if (!media || !await access.authorize(moment)) { if (valid()) throw Error('Audio non autorizzato'); return }
      if (!valid()) return
      assertCursorRecording(lessonId, moment, cursorRef.current.recording)
      const session = await readAudioSession(store, { lessonId, sessionId: moment.sessionId })
      if (!valid()) return
      if (!session?.value.audioConsent) throw Error('Audio revocato')
      if (session.sha256 !== binding.sessionSha) throw Error('Sessione audio modificata. Riapri il passaggio.')
      if (media.paused) {
        const r = cursorRef.current.recording!
        // Metadata can still be pending even though peaks have rendered. Replace the pending canonical seek.
        if (media.ended || cursorRef.current.epoch === r.endEpoch || media.currentTime >= r.durationMs / 1000 - .05) cursorRef.current.seekEpoch(r.startEpoch)
        await media.play()
        if (!valid()) media.pause()
      } else media.pause()
    } catch (error) { if (valid()) { media?.pause(); media?.removeAttribute('src'); sourceBinding.current = null; setSource(null); failed.current((error as Error).message) } }
  }
  async function saveNote() {
    const current = noteActions.current.begin()
    try {
      if (!notes || !currentNoteReady || !await access.authorize(moment)) { if (current()) throw Error('Nota non autorizzata'); return }
      if (!current() || !access.allowed()) return
      await notes.write(moment, note)
      if (current() && access.allowed()) setNoteStatus('Nota privata salvata')
    } catch (error) { if (current() && access.allowed()) setNoteStatus((error as Error).message) }
  }
  return <section className="ll-replay" aria-label="Recupera il passaggio">
    <h2>{moment.title}</h2><p>Collegamento dichiarato dal docente · {moment.objectRefs.map(r => `${r.label} · revisione ${r.version}`).join(', ')}</p>
    <div ref={container} hidden={!showWaveform} className="ll-wave" aria-label="Waveform e timeline" /><p role="status">{status}</p>
    <div className="ll-actions"><button disabled={!sourceReady} onClick={() => void toggle()}>{playing ? 'Pausa' : 'Ascolta'}</button><button onClick={() => { media?.pause(); if (recording) cursor.seekEpoch(recording.startEpoch) }}>Ricomincia</button><label>Posizione audio<input aria-label="Posizione audio" type="range" min="0" max={duration} step="0.01" value={Math.max(0, Math.min(seconds, duration))} onChange={event => { if (recording) cursor.seekEpoch(recording.startEpoch + Number(event.target.value) * 1000) }} /></label><output>{seconds.toFixed(1)} / {duration.toFixed(1)} s</output></div>
    <div className="ll-caption">{captionContent ?? 'Trascrizione non presente per questo istante.'}</div>
    {notes && <div className="ll-note"><label>Nota privata<textarea aria-label="Nota privata" disabled={!currentNoteReady} value={currentNote ? note : ''} maxLength={4000} onChange={event => setNote(event.target.value)} /></label><button disabled={!currentNoteReady} onClick={() => void saveNote()}>Salva nota privata</button><span role="status">{currentNote ? noteStatus : !access.allowed() ? 'Accesso alla nota terminato' : ''}</span></div>}
  </section>
}
