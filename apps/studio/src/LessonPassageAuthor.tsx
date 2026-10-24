import { useEffect, useState } from "react"
import SessionAudioControls from "./SessionAudioControls"
import { revokeStoredAudioSession, type SessionAudioRecorder } from "./store/SessionAudioRecorder"
import { recordingSession, resolveReplayRecording, type AudioObjectReference, type AudioRecordingRef } from "./store/audioRecording"
import type { WorkspaceStore } from "./store/WorkspaceStore"
import { loadReplayTimeline } from "./store/replayTimeline"
import type { LessonSessionIdentityV1 } from "./store/sessionState"

export default function LessonPassageAuthor({ recorder, store, onAnnotate }: {
  recorder: SessionAudioRecorder
  store: WorkspaceStore
  onAnnotate: (text: string) => Promise<readonly AudioObjectReference[]>
}) {
  const [text, setText] = useState("")
  const [refs, setRefs] = useState<readonly AudioObjectReference[]>([])
  const [saved, setSaved] = useState<AudioRecordingRef | null>(null)
  const [reference, setReference] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [history, setHistory] = useState<Array<{ identity: LessonSessionIdentityV1; label: string; date: number; revoked: boolean }>>([])
  useEffect(() => {
    let active = true
    void loadReplayTimeline(store, recorder.identity.lessonId).then((timeline) => {
      if (!active) return
      const sessions = new Map<string, typeof history[number]>()
      for (const recording of timeline.recordings) {
        const identity = recordingSession(recording)
        if (identity.sessionId === recorder.identity.sessionId) continue
        sessions.set(identity.sessionId, { identity, label: recording.objectRefs.map((ref) => ref.label).join(", ") || "Registrazione della lezione", date: recording.startEpoch, revoked: recording.availability === "revoked" })
      }
      setHistory([...sessions.values()])
    }).catch((cause) => { if (active) setError("Archivio audio non leggibile: " + (cause as Error).message) })
    return () => { active = false }
  }, [store, recorder, saved, historyVersion])

  async function revokePrevious(identity: LessonSessionIdentityV1) {
    setBusy(true); setError(null)
    try { await revokeStoredAudioSession(store, identity); setHistoryVersion((version) => version + 1) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  async function annotate() {
    setBusy(true)
    setError(null)
    try {
      const next = await onAnnotate(text.trim())
      recorder.setObjectRefs(next)
      setRefs(next)
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }

  async function copyPassage() {
    if (!saved) return
    setError(null)
    try {
      if ((await resolveReplayRecording(store, saved)).availability !== "available") {
        throw new Error("Il passaggio audio non è più disponibile: controlla la registrazione.")
      }
      const identity = recordingSession(saved)
      const url = new URL("/", window.location.href)
      url.searchParams.set("vista", "replay")
      // The teacher may annotate during capture. At its start the object may
      // not yet exist; the end of this take includes the linked board version.
      url.searchParams.set("at", String(saved.endEpoch))
      url.searchParams.set("recording", saved.recordingId)
      url.searchParams.set("object", saved.objectRefs[0]!.elementId)
      url.searchParams.set("session", identity.sessionId)
      url.searchParams.set("sha", saved.sha256)
      url.searchParams.set("objectVersion", String(saved.objectRefs[0]!.version))
      url.hash = identity.lessonId
      const descriptor = JSON.stringify({
        schema: "ardesia.lesson-passage.v1", workspaceId: "local-default", ...identity,
        recordingId: saved.recordingId, startEpoch: saved.startEpoch, endEpoch: saved.endEpoch,
        sha256: saved.sha256, objectRefs: saved.objectRefs, replayUrl: url.href,
      }, null, 2)
      setReference(descriptor)
      // The selectable fallback remains available if clipboard permission is denied.
      try { await navigator.clipboard?.writeText(descriptor) } catch { /* visible fallback below */ }
    } catch (cause) { setError((cause as Error).message) }
  }

  return <section className="st-passage-author" aria-label="Passaggio della lezione">
    <details>
      <summary>Registra e collega un passaggio</summary>
      <p>Registra soltanto la tua voce. Scrivi un'annotazione e collegala esplicitamente al segmento: il tempo da solo non interpreta ciò che dici.</p>
      <label>Annotazione del docente
        <input value={text} onChange={(event) => setText(event.target.value)} maxLength={240} placeholder="Per esempio: qui manteniamo fissata la pressione" />
      </label>
      <button className="st-ghost" disabled={!text.trim() || busy} onClick={() => void annotate()}>Annota passaggio</button>
      {refs.length > 0 && <p role="status">Passaggio collegato: {refs.map((ref) => ref.label).join(", ")}</p>}
      <SessionAudioControls recorder={recorder} objectRefs={refs} onSaved={(recording) => { setSaved(recording); setReference("") }} />
      <button className="st-ghost" disabled={!saved?.objectRefs.length} onClick={() => void copyPassage()}>Copia passaggio per il corso</button>
      <p className="st-quiet">Il replay apre questa lezione nello stesso browser e archivio locale. Per un altro archivio trasferisci prima il file .lesson; il collegamento non concede accesso remoto.</p>
      {reference && <label>Riferimento da incollare nel corso
        <textarea aria-label="Riferimento del passaggio" value={reference} readOnly rows={5} onFocus={(event) => event.target.select()} />
      </label>}
      {history.length > 0 && <details>
        <summary>Audio delle aperture precedenti</summary>
        <p>La revoca cancella tutte le registrazioni di quell'apertura. Le copie già esportate restano esterne all'app.</p>
        {history.map((item) => <div key={item.identity.sessionId}>
          <p>{item.label} · {new Date(item.date).toLocaleString("it-IT")}</p>
          <button className="st-ghost" disabled={busy || item.revoked} onClick={() => void revokePrevious(item.identity)}>{item.revoked ? "Audio revocato" : "Revoca audio della registrazione precedente"}</button>
        </div>)}
      </details>}
      {error && <p role="alert">{error}</p>}
    </details>
  </section>
}
