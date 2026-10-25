import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { IconMic, IconMicOff } from "./design/icons"
import type { SessionAudioRecorder } from "./store/SessionAudioRecorder"
import type { AudioObjectReference, AudioRecordingRef } from "./store/audioRecording"

export interface SessionAudioControlsProps {
  recorder: SessionAudioRecorder
  objectRefs?: readonly AudioObjectReference[]
  onSaved?: (recording: AudioRecordingRef) => void
}
export default function SessionAudioControls({ recorder, objectRefs, onSaved }: SessionAudioControlsProps) {
  const state = useSyncExternalStore(recorder.subscribe, recorder.getSnapshot)
  const unavailableReason = recorder.captureUnavailableReason()
  const [consent, setConsent] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const savedCallback = useRef(onSaved)
  savedCallback.current = onSaved
  const reported = useRef<string | null>(null)
  useEffect(() => {
    if (state.lastRecording && reported.current !== state.lastRecording.recordingId) {
      reported.current = state.lastRecording.recordingId
      savedCallback.current?.(state.lastRecording)
    }
  }, [state.lastRecording])
  useEffect(() => { recorder.setObjectRefs(objectRefs ?? []) }, [recorder, objectRefs])
  useEffect(() => { setConsent(false); setNotice(null) }, [recorder])
  const busy = state.stage === "saving" || state.stage === "revoking" || state.stage === "disposed"
  const active = state.stage === "recording" || state.stage === "requesting"
  async function stop() {
    try { const saved = await recorder.stop(); if (saved) setNotice("Audio salvato nella lezione.") }
    catch { /* recorder exposes the failure in its snapshot */ }
  }
  async function revoke() {
    setConsent(false); setNotice(null)
    try { await recorder.revoke(); setNotice("Audio della sessione cancellato. Le copie già esportate restano esterne all'app.") }
    catch { /* the UI must not announce a successful purge */ }
  }
  return <section aria-label="Audio della lezione" className="st-audio-controls">
    <label className="st-audio-consent">
      <input type="checkbox" checked={consent} disabled={Boolean(unavailableReason) || active || busy} onChange={(event) => setConsent(event.target.checked)} />
      {" "}Solo il mio microfono docente
    </label>
    {active
      ? <button type="button" className="st-primary st-full st-audio-recording" onClick={() => { void stop() }}><IconMic /> Termina registrazione</button>
      : <button type="button" className="st-primary st-full" disabled={Boolean(unavailableReason) || !consent || busy} onClick={() => { setNotice(null); void recorder.start().catch(() => {}) }}><IconMic /> Registra audio</button>}
    {unavailableReason && <p role="status" className="st-audio-status">{unavailableReason}</p>}
    <span role="status" aria-live="polite" className="st-audio-status">
      {state.stage === "recording" ? <span className="st-recdot" aria-hidden /> : <IconMicOff />}
      {state.stage === "recording" ? "Registrazione in corso" : state.stage === "requesting" ? "In attesa del microfono" : state.stage === "saving" ? "Salvataggio audio…" : state.stage === "revoking" ? "Cancellazione audio…" : notice ?? "Microfono spento"}
    </span>
    <details className="st-audio-delete"><summary>Consenso e cancellazione</summary>
      <p>La revoca cancella l'audio di questa apertura. Le copie esportate restano esterne all'app.</p>
      <button type="button" className="st-ghost" disabled={state.stage === "revoking" || state.stage === "disposed"} onClick={() => { void revoke() }}>Revoca e cancella audio</button>
    </details>
    {state.error && <span role="alert">{state.error}</span>}
  </section>
}
