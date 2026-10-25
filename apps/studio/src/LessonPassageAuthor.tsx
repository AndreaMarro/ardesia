import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import SessionAudioControls from "./SessionAudioControls"
import { revokeStoredAudioSession, type SessionAudioRecorder } from "./store/SessionAudioRecorder"
import { recordingSession, type AudioObjectReference, type AudioRecordingRef } from "./store/audioRecording"
import type { WorkspaceStore } from "./store/WorkspaceStore"
import { loadReplayTimeline } from "./store/replayTimeline"
import type { LessonSessionIdentityV1 } from "./store/sessionState"
import { prepareLessonPassage } from "./store/lessonPassage"
import { createStudioCourseBridge } from "./store/coursePassageBridge"
import { IconCheck, IconLink, IconMic } from "./design/icons"

export default function LessonPassageAuthor({ recorder, store, onAnnotate, selectedObjects = [], onLinkSelection, onFit }: {
  recorder: SessionAudioRecorder
  store: WorkspaceStore
  onAnnotate: (text: string) => Promise<readonly AudioObjectReference[]>
  selectedObjects?: readonly AudioObjectReference[]
  onLinkSelection?: () => Promise<readonly AudioObjectReference[]>
  onFit?: () => void
}) {
  const audio = useSyncExternalStore(recorder.subscribe, recorder.getSnapshot)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).has("courseBridge"))
  const [text, setText] = useState("")
  const [refs, setRefs] = useState<readonly AudioObjectReference[]>([])
  const [saved, setSaved] = useState<AudioRecordingRef | null>(null)
  const [reference, setReference] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [bridge, setBridge] = useState<ReturnType<typeof createStudioCourseBridge> | null>(null)
  const [connected, setConnected] = useState(false)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [history, setHistory] = useState<Array<{ identity: LessonSessionIdentityV1; label: string; date: number; revoked: boolean }>>([])
  const fit = useRef(onFit)
  fit.current = onFit
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => fit.current?.()) })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
  }, [open])
  useEffect(() => {
    const next = createStudioCourseBridge(window)
    setBridge(next)
    const update = () => setConnected(next.getSnapshot().connected)
    update()
    const unsubscribe = next.subscribe(update)
    return () => { unsubscribe(); next.dispose() }
  }, [])
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
  const handleSaved = useCallback((recording: AudioRecordingRef) => { setSaved(recording); setReference(""); setNotice(null) }, [])
  function close() { setOpen(false); triggerRef.current?.focus() }
  async function revokePrevious(identity: LessonSessionIdentityV1) {
    setBusy(true); setError(null)
    try { await revokeStoredAudioSession(store, identity); setHistoryVersion((version) => version + 1) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  async function linkSelected() {
    if (!onLinkSelection) return
    setBusy(true); setError(null)
    try { const next = await onLinkSelection(); recorder.setObjectRefs(next); setRefs(next) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  async function annotate() {
    setBusy(true); setError(null)
    try { const next = await onAnnotate(text.trim()); recorder.setObjectRefs(next); setRefs(next) }
    catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  async function sendPassage(copy: boolean) {
    if (!saved) return
    setBusy(true); setError(null); setNotice(null)
    try {
      const descriptor = await prepareLessonPassage(store, saved, window.location.href)
      if (copy) {
        const serialized = JSON.stringify(descriptor, null, 2)
        setReference(serialized)
        try { await navigator.clipboard?.writeText(serialized) } catch { /* selectable fallback remains visible */ }
      } else {
        bridge?.send(descriptor)
        setNotice("Passaggio inviato all’Aula. Torna al corso per confermare la condivisione.")
      }
    } catch (cause) { setError((cause as Error).message) }
    finally { setBusy(false) }
  }
  const recording = audio.stage === "recording" || audio.stage === "requesting"
  return <section className={`st-passage-author${open ? " st-passage-open" : ""}`} aria-label="Passaggio della lezione">
    <div className="st-passage-strip">
      <button ref={triggerRef} className="st-passage-trigger" aria-expanded={open} aria-controls="lesson-passage-panel" onClick={() => setOpen((value) => !value)}>
        <IconMic /><span>Registra e collega un passaggio</span><span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      <span className={`st-passage-stage${recording ? " st-passage-live" : ""}`}>{recording ? "Microfono attivo" : saved ? "Passaggio salvato" : "La lavagna resta il tuo spazio"}</span>
      {connected && <span className="st-passage-connected"><IconLink /> Aula collegata</span>}
      {onFit && <button className="st-passage-fit st-ghost" aria-label="Inquadra lavagna" onClick={onFit}>Inquadra</button>}
    </div>
    {open && <div id="lesson-passage-panel" className="st-passage-panel" role="region" aria-label="Collega e registra" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close() } }}>
      <div className="st-passage-panel-heading"><span className="st-eyebrow">Dalla lavagna al corso</span><button className="st-ghost" onClick={close} aria-label="Chiudi pannello passaggio">Chiudi</button></div>
      <div className="st-passage-step">
        <span className="st-step-number">01 <span>IL CONTESTO</span></span>
        <h2>Indica il passaggio.</h2>
        <p>Seleziona un oggetto sulla lavagna e collegalo alla tua spiegazione.</p>
        <div className="st-source-preview">{selectedObjects.length > 0
          ? <><span>Selezione sulla lavagna</span><strong>{selectedObjects.map((ref) => ref.label).join(", ")}</strong></>
          : <><span>Nessun oggetto selezionato</span><strong>Tocca un testo, una formula o un disegno.</strong></>}</div>
        <button className="st-ghost st-full" disabled={!selectedObjects.length || selectedObjects.length > 20 || !onLinkSelection || busy} onClick={() => void linkSelected()}>Collega oggetto selezionato</button>
        {selectedObjects.length > 20 && <p role="alert">Seleziona al massimo venti oggetti per passaggio.</p>}
        {refs.length > 0 && <p role="status" className="st-linked-source"><IconCheck /> Passaggio collegato: {refs.map((ref) => ref.label).join(", ")}</p>}
        <details className="st-annotation-alternative" open={!selectedObjects.length}>
          <summary>Oppure aggiungi un'annotazione</summary>
          <label>Annotazione del docente
            <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={240} rows={3} placeholder="Per esempio: qui manteniamo fissata la pressione" />
          </label>
          <button className="st-ghost" disabled={!text.trim() || busy} onClick={() => void annotate()}>Annota passaggio</button>
        </details>
      </div>
      <div className="st-passage-step">
        <span className="st-step-number">02 <span>LA TUA VOCE</span></span>
        <SessionAudioControls recorder={recorder} objectRefs={refs} onSaved={handleSaved} />
      </div>
      <div className="st-passage-step">
        <span className="st-step-number">03 <span>IL RITORNO AL CORSO</span></span>
        <h3>Porta il contesto in Aula.</h3>
        <p>Invia il passaggio salvato. Nel corso potrai rivederlo e decidere se condividerlo.</p>
        {bridge?.getSnapshot().available && <button className="st-primary st-full" disabled={!saved?.objectRefs.length || !connected || busy || recording || audio.stage === "saving"} onClick={() => void sendPassage(false)}>Invia passaggio all’Aula</button>}
        {!connected && <p className="st-quiet">Per inviare direttamente, apri Studio dall’Aula del corso.</p>}
        {notice && <p role="status" className="st-linked-source">{notice}</p>}
        <details className="st-passage-secondary"><summary>Altri modi di trasferire il passaggio</summary>
          <button className="st-ghost" disabled={!saved?.objectRefs.length || busy} onClick={() => void sendPassage(true)}>Copia passaggio per il corso</button>
          <p className="st-quiet">Il collegamento usa i media di questo archivio locale. Per un altro archivio trasferisci prima il file .lesson.</p>
          {reference && <label>Riferimento da incollare nel corso<textarea aria-label="Riferimento del passaggio" value={reference} readOnly rows={5} onFocus={(event) => event.target.select()} /></label>}
        </details>
      </div>
      {history.length > 0 && <details className="st-passage-secondary st-passage-history">
        <summary>Audio delle aperture precedenti</summary>
        <p>La revoca cancella le registrazioni di quell'apertura. Le copie esportate restano esterne all'app.</p>
        {history.map((item) => <div key={item.identity.sessionId}>
          <p>{item.label} · {new Date(item.date).toLocaleString("it-IT")}</p>
          <button className="st-ghost" disabled={busy || item.revoked} onClick={() => void revokePrevious(item.identity)}>{item.revoked ? "Audio revocato" : "Revoca audio della registrazione precedente"}</button>
        </div>)}
      </details>}
      <p className="st-passage-footnote">Il collegamento è una tua scelta esplicita: la sola vicinanza nel tempo non interpreta ciò che dici.</p>
      {error && <p role="alert">{error}</p>}
    </div>}
  </section>
}
