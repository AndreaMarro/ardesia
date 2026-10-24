// MAESTRO-Studio — ReplayView (player della lezione registrata)
// Route ?vista=replay: timeline scrubabile firstEventTime..lastEventTime,
// scena proiettata con ReplayEngine.getSceneAt (read-only, zero scritture),
// audio dei chunk registrati mappato sul tempo journal via startEpoch.

import { useState, useEffect, useRef, useMemo, type ChangeEvent } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import { type WorkspaceStore } from "./store/WorkspaceStore"
import { ReplayEngine } from "./store/ReplayEngine"
import { loadReplayTimeline, recordingAtTime, resolveReplayTarget, type ReplayTimeline } from "./store/replayTimeline"
import EmptyState from "./design/EmptyState"

interface ReplayViewProps {
  store: WorkspaceStore
  room: string
}

interface ReplayLoad {
  store: WorkspaceStore
  room: string
  timeline: ReplayTimeline | null
  lessonName: string | null
  error: string | null
}

/** Formatta ms trascorsi come m:ss (per il contatore della timeline) */
function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export default function ReplayView({ store, room }: ReplayViewProps) {
  const [loaded, setLoaded] = useState<ReplayLoad | null>(null)
  // Legare il risultato alla fonte nasconde già al primo render di B i dati
  // di A: il solo reset in useEffect lascerebbe visibile uno stato precedente.
  const current = loaded?.store === store && loaded.room === room ? loaded : null
  const timeline = current?.timeline ?? null
  const loading = current === null
  const error = current?.error ?? null
  const lessonName = current?.lessonName ?? null
  /** Tempo journal corrente (epoch ms) — cursore della timeline */
  const [t, setT] = useState<number | null>(null)
  const [apiReady, setApiReady] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const apiRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  /** startEpoch del primo chunk = origine del tempo audio (sorgente concatenata) */
  const audioStartEpochRef = useRef<number | null>(null)
  /** Seek richiesto prima che i metadata audio siano pronti (applicato a loadedmetadata) */
  const pendingSeekSecRef = useRef<number | null>(null)
  /** Ultimo t noto, per posizionare l'audio quando la sorgente finisce di caricare */
  const tRef = useRef<number | null>(null)
  tRef.current = t

  const engine = useMemo(() => new ReplayEngine(), [])
  const canonicalRecording = timeline && t !== null ? recordingAtTime(timeline.recordings, t) : null

  useEffect(() => {
    let cancelled = false
    setApiReady(false)
    apiRef.current = null
    Promise.all([
      loadReplayTimeline(store, room),
      store.loadMeta(room).catch(() => null),
    ])
      .then(([tl, meta]) => {
        if (cancelled) return
        const target = resolveReplayTarget(tl, window.location.search)
        setLoaded({ store, room, timeline: tl, lessonName: meta?.name ?? null, error: null })
        setT(target.epoch)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoaded({ store, room, timeline: null, lessonName: null, error: (err as Error).message })
      })
    return () => { cancelled = true }
  }, [store, room])

  /** Scena proiettata al tempo t — getSceneAt è puro, chiamate ripetute safe */
  const scene = useMemo(() => {
    if (!timeline || t === null) return []
    return engine.getSceneAt(timeline.events, t)
  }, [engine, timeline, t])

  /** Proietta la scena su Excalidraw a ogni cambio di t (vista read-only) */
  useEffect(() => {
    if (!apiReady) return
    apiRef.current?.updateScene({ elements: scene as any })
  }, [scene, apiReady])

  function fitScene() {
    apiRef.current?.scrollToContent?.(undefined, { fitToContent: true, animate: false })
  }
  useEffect(() => {
    if (!apiReady) return
    const frame = requestAnimationFrame(fitScene)
    window.addEventListener("resize", fitScene)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", fitScene) }
  }, [apiReady, timeline])

  /**
   * Carica l'audio come UNICA sorgente concatenata: con MediaRecorder+timeslice
   * solo chunk-0 contiene l'init segment WebM, i chunk successivi non sono
   * decodificabili da soli. La concatenazione ricostruisce lo stream originale;
   * il tempo audio 0 corrisponde a audioChunks[0].startEpoch.
   */
  useEffect(() => {
    audioStartEpochRef.current = null
    pendingSeekSecRef.current = null
    if (!timeline || timeline.recordings.length > 0 || timeline.audioChunks.length === 0) return
    let cancelled = false
    let ownedUrl: string | null = null
    let ownedElement: HTMLAudioElement | null = null
    Promise.all(timeline.audioChunks.map((chunk) => store.read(chunk.path)))
      .then((blobs) => {
        if (cancelled) return
        const parts = blobs.filter((b): b is Blob => b !== null)
        const el = audioRef.current
        if (!el || parts.length === 0) return
        const startEpoch = timeline.audioChunks[0].startEpoch
        audioStartEpochRef.current = startEpoch
        ownedUrl = URL.createObjectURL(new Blob(parts, { type: "audio/webm" }))
        ownedElement = el
        el.src = ownedUrl
        // seek iniziale quando i metadata sono pronti (currentTime prima di
        // loadedmetadata può essere ignorato/azzerato dal browser)
        pendingSeekSecRef.current = Math.max(0, ((tRef.current ?? startEpoch) - startEpoch) / 1000)
      })
      .catch(() => {
        // audio illeggibile: il replay visuale resta pienamente funzionante
      })
    return () => {
      cancelled = true
      if (ownedUrl) URL.revokeObjectURL(ownedUrl)
      // Il ref React può già essere null all'unmount: si rilascia l'elemento
      // posseduto da questo caricamento, mai quello di una room successiva.
      ownedElement?.removeAttribute("src")
    }
  }, [timeline, store])

  // Each v2 take is its own decodable stream. A pause has no selected media.
  useEffect(() => {
    if (!timeline || timeline.recordings.length === 0) return
    const el = audioRef.current
    audioStartEpochRef.current = null
    pendingSeekSecRef.current = null
    setAudioError(null)
    if (!el) return
    el.pause()
    el.removeAttribute("src")
    if (!canonicalRecording) return
    if (canonicalRecording.availability !== "available" || !canonicalRecording.data) return
    if (!el.canPlayType(canonicalRecording.mimeType)) {
      setAudioError("Questo browser non supporta il formato della registrazione.")
      return
    }
    const url = URL.createObjectURL(canonicalRecording.data)
    audioStartEpochRef.current = canonicalRecording.startEpoch
    pendingSeekSecRef.current = Math.max(0, Math.min(canonicalRecording.durationMs, (tRef.current ?? canonicalRecording.startEpoch) - canonicalRecording.startEpoch)) / 1000
    el.src = url
    return () => { el.pause(); el.removeAttribute("src"); URL.revokeObjectURL(url) }
    // Scrubbing within one recording keeps its source and playback position.
  }, [timeline, canonicalRecording?.recordingId])

  /** Metadata pronti: applica l'eventuale seek in sospeso */
  function handleLoadedMetadata() {
    const audio = audioRef.current
    if (audio && pendingSeekSecRef.current !== null) {
      audio.currentTime = pendingSeekSecRef.current
      pendingSeekSecRef.current = null
    }
  }

  /** Scrub manuale: aggiorna t e riallinea il tempo audio */
  function handleScrub(e: ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value)
    setT(next)
    const audio = audioRef.current
    const startEpoch = audioStartEpochRef.current
    if (!audio || startEpoch === null) return
    const seekSec = Math.max(0, (next - startEpoch) / 1000)
    if (audio.readyState === 0) {
      pendingSeekSecRef.current = seekSec
    } else {
      audio.currentTime = seekSec
    }
  }

  /** L'audio avanza → il cursore journal lo segue (audio→t via startEpoch) */
  function handleTimeUpdate() {
    const audio = audioRef.current
    const startEpoch = audioStartEpochRef.current
    if (!audio || startEpoch === null || audio.paused) return
    setT(Math.min(canonicalRecording?.endEpoch ?? Infinity, timeline?.lastEventTime ?? Infinity, startEpoch + audio.currentTime * 1000))
  }

  const hasEvents = timeline !== null && timeline.firstEventTime !== null && timeline.lastEventTime !== null
  const hasAudio = timeline !== null && (timeline.audioChunks.length > 0 || timeline.recordings.length > 0)

  return (
    <div className="st-replay" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header className="st-bar st-bar-recap">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-chip-student">rivedi la lezione</span>
        {lessonName && (
          <span className="st-chip-student st-chip-lesson" title={`Lezione: ${lessonName}`}>
            {lessonName}
          </span>
        )}
        <a className="st-btn" href={`${window.location.pathname}#${encodeURIComponent(room)}`}>Torna alla lavagna</a>
        <button type="button" className="st-btn" onClick={fitScene}>Inquadra contenuto</button>
      </header>

      {loading && (
        <div style={{ padding: "24px 32px" }}>
          <p className="st-quiet" role="status">caricamento…</p>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: "24px 32px", maxWidth: "640px", margin: "0 auto" }}>
          <EmptyState
            tone="error"
            title="Registrazione non disponibile"
            detail={"Non è stato possibile leggere la registrazione di questa lezione. " + error}
            hint="Riprova tra qualche istante. Se il problema resta, esporta la lezione e riaprila."
          />
        </div>
      )}

      {!loading && !error && !hasEvents && (
        <div style={{ padding: "24px 32px", maxWidth: "640px", margin: "0 auto" }}>
          <EmptyState
            title="Ancora nessuna lezione registrata"
            detail="Questa lezione non contiene eventi da rivedere."
            hint="Torna alla lavagna e inizia a scrivere: la registrazione si costruisce da sola."
          />
        </div>
      )}

      {!loading && !error && hasEvents && (
        <>
          <div style={{ flex: 1, position: "relative" }}>
            <Excalidraw
              langCode={EXCALIDRAW_CONFIG.langCode}
              theme={EXCALIDRAW_CONFIG.theme}
              aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
              viewModeEnabled
              UIOptions={EXCALIDRAW_CONFIG.UIOptions}
              excalidrawAPI={(eapi) => {
                apiRef.current = eapi
                setApiReady(true)
              }}
              // Scena iniziale DENTRO initialData: Excalidraw la applica in modo
              // asincrono e cancellerebbe una updateScene arrivata prima (race
              // vista in smoke: lavagna vuota finché non si scrubba).
              initialData={{ elements: scene as any, appState: EXCALIDRAW_CONFIG.newRoomAppState }}
            />
          </div>
          <div
            className="st-replay-controls"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "16px",
              padding: "12px 24px",
              borderTop: "1px solid var(--m-line-2)",
              background: "var(--m-canvas)",
            }}
          >
            <span className="st-quiet st-replay-clock" style={{ minWidth: "88px", fontVariantNumeric: "tabular-nums" }}>
              {formatClock((t ?? timeline.firstEventTime!) - timeline.firstEventTime!)}
              {" / "}
              {formatClock(timeline.lastEventTime! - timeline.firstEventTime!)}
            </span>
            <input
              type="range"
              aria-label="linea del tempo della lezione"
              aria-valuetext={`${formatClock((t ?? timeline.firstEventTime!) - timeline.firstEventTime!)} di ${formatClock(timeline.lastEventTime! - timeline.firstEventTime!)}`}
              min={timeline.firstEventTime!}
              max={timeline.lastEventTime!}
              step={1}
              value={t ?? timeline.firstEventTime!}
              onChange={handleScrub}
              style={{ flex: "1 1 180px", minWidth: 100 }}
            />
            {hasAudio && (
              <audio
                ref={audioRef}
                controls
                aria-label="audio della lezione"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setAudioError("Il browser non riesce a decodificare questa registrazione.")}
                style={{ height: "32px", maxWidth: "100%" }}
              />
            )}
          </div>
          {timeline.recordings.length > 0 && <div style={{ padding: "8px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {timeline.recordings.map((recording, index) => <button type="button" className="st-btn" key={recording.recordingId} onClick={() => {
              setT(recording.startEpoch)
              if (audioRef.current && audioStartEpochRef.current === recording.startEpoch) audioRef.current.currentTime = 0
            }}>{recording.objectRefs[0]?.label ?? `Registrazione ${index + 1}`}</button>)}
            {canonicalRecording?.availability === "available" && <button type="button" className="st-btn" onClick={() => {
              setT(canonicalRecording.startEpoch)
              const audio = audioRef.current
              if (audio && audioStartEpochRef.current === canonicalRecording.startEpoch) {
                audio.currentTime = 0
                void audio.play().catch(() => setAudioError("Riproduzione audio non riuscita: usa il controllo audio per riprovare."))
              }
            }}>Ascolta registrazione dall'inizio</button>}
            <span role="status" aria-live="polite">{canonicalRecording
              ? canonicalRecording.availability === "missing" ? "Audio mancante: il passaggio visivo resta disponibile."
              : canonicalRecording.availability === "corrupt" ? "Audio danneggiato: verifica la copia della lezione."
              : canonicalRecording.availability === "revoked" ? "Audio revocato e cancellato."
              : canonicalRecording.objectRefs.length > 0 ? `Passaggio collegato: ${canonicalRecording.objectRefs.map((ref) => ref.label).join(", ")}` : "Registrazione senza un oggetto collegato."
              : "Pausa fra le registrazioni: nessun audio in questo intervallo."}</span>
          </div>}
          {audioError && <p role="alert" style={{ padding: "0 16px" }}>{audioError}</p>}
        </>
      )}
    </div>
  )
}
