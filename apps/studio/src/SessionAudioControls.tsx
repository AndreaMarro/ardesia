import { useEffect, useState, useSyncExternalStore } from "react"
import type { SessionAudioRecorder } from "./store/SessionAudioRecorder"
import type { AudioObjectReference, AudioRecordingRef } from "./store/audioRecording"

export interface SessionAudioControlsProps {
  recorder: SessionAudioRecorder
  objectRefs?: readonly AudioObjectReference[]
  onSaved?: (recording: AudioRecordingRef) => void
}
export default function SessionAudioControls({ recorder, objectRefs, onSaved }: SessionAudioControlsProps) {
  const state = useSyncExternalStore(recorder.subscribe, recorder.getSnapshot)
  const [consent, setConsent] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => { recorder.setObjectRefs(objectRefs ?? []) }, [recorder, objectRefs])
  useEffect(() => { setConsent(false); setNotice(null) }, [recorder])
  const busy = state.stage === "saving" || state.stage === "revoking" || state.stage === "disposed"
  const active = state.stage === "recording" || state.stage === "requesting"
  async function stop() {
    try { const saved = await recorder.stop(); if (saved) { setNotice("Audio salvato nella lezione."); onSaved?.(saved) } }
    catch { /* recorder exposes the failure in its snapshot */ }
  }
  async function revoke() {
    setConsent(false); setNotice(null)
    try { await recorder.revoke(); setNotice("Audio della sessione cancellato. Le copie già esportate restano esterne all'app.") }
    catch { /* the UI must not announce a successful purge */ }
  }
  return <section aria-label="Audio della lezione" className="st-audio-controls" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
    <label style={{ fontSize: 12 }}>
      <input type="checkbox" checked={consent} disabled={active || busy} onChange={(event) => setConsent(event.target.checked)} />
      {" "}Solo il mio microfono docente
    </label>
    {active
      ? <button type="button" className="st-btn st-btn-record" onClick={() => { void stop() }}>Termina registrazione</button>
      : <button type="button" className="st-btn" disabled={!consent || busy} onClick={() => { setNotice(null); void recorder.start().catch(() => {}) }}>Registra audio</button>}
    <button type="button" className="st-btn" disabled={state.stage === "revoking" || state.stage === "disposed"} onClick={() => { void revoke() }}>Revoca e cancella audio</button>
    <span role="status" aria-live="polite" style={{ fontSize: 12 }}>
      {state.stage === "recording" ? "Registrazione in corso" : state.stage === "requesting" ? "In attesa del microfono" : state.stage === "saving" ? "Salvataggio audio…" : state.stage === "revoking" ? "Cancellazione audio…" : notice ?? "Microfono spento"}
    </span>
    {objectRefs && objectRefs.length > 0 && <span style={{ fontSize: 12 }}>Passaggio: {objectRefs.map((ref) => ref.label).join(", ")}</span>}
    {state.error && <span role="alert">{state.error}</span>}
  </section>
}
