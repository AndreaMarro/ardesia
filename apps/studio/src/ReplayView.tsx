// MAESTRO-Studio — ReplayView (player della lezione registrata)
// Route ?vista=replay: timeline scrubabile firstEventTime..lastEventTime,
// scena proiettata con ReplayEngine.getSceneAt (read-only, zero scritture),
// audio dei chunk registrati mappato sul tempo journal via startEpoch.

import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, type ChangeEvent, type ReactNode } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import type { BinaryFiles } from "@excalidraw/excalidraw/types"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import { type WorkspaceStore } from "./store/WorkspaceStore"
import { ReplayEngine } from "./store/ReplayEngine"
import { loadReplayTimeline, recordingAtTime, resolveReplayTarget, type ReplayTimeline } from "./store/replayTimeline"
import EmptyState from "./design/EmptyState"
import ReplayObjectFocus from "./ReplayObjectFocus"
import { ReplayCaptions } from "./lesson-media/ReplayCaptions"
import { recordingSession } from "./store/audioRecording"
import { emptyEditorial, parseEditorial, resolveMoment, type Editorial, type LessonMoment } from "./features/living-lesson/model"
import type { ReplayCursor } from "./features/living-lesson/replayCursor"

// Waveform dependencies are loaded only when replaying a canonical v2 take.
// The canonical audio controls stay unavailable until its consent guard mounts.
const IntegratedLivingReplay = lazy(() => import("./features/living-lesson/IntegratedLivingReplay").then(module => ({ default: module.IntegratedLivingReplay })))

interface ReplayViewProps {
  store: WorkspaceStore
  room: string
  renderExtension?: (cursor: ReplayCursor) => ReactNode
  replayFiles?: Record<string, unknown>
  selectedRecordingId?: string
  range?: { start: number; end: number }
}

interface ReplayLoad {
  store: WorkspaceStore
  room: string
  timeline: ReplayTimeline | null
  lessonName: string | null
  error: string | null
  editorial: Editorial
  files: BinaryFiles
}

/** Formatta ms trascorsi come m:ss (per il contatore della timeline) */
function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export default function ReplayView({ store, room, renderExtension, replayFiles, selectedRecordingId, range }: ReplayViewProps) {
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
  const [focusedObjectId, setFocusedObjectId] = useState<string | null>(null)
  const [selectedTakeId, setSelectedTakeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState({ scrollX: 0, scrollY: 0, zoom: 1 })

  const apiRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [mediaElement, setMediaElement] = useState<HTMLAudioElement | null>(null)
  const attachMedia = useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element
    setMediaElement(element)
  }, [])
  const canvasRef = useRef<HTMLDivElement>(null)
  const fitSceneRef = useRef<() => void>(() => {})
  /** startEpoch del primo chunk = origine del tempo audio (sorgente concatenata) */
  const audioStartEpochRef = useRef<number | null>(null)
  /** Seek richiesto prima che i metadata audio siano pronti (applicato a loadedmetadata) */
  const pendingSeekSecRef = useRef<number | null>(null)
  /** Ultimo t noto, per posizionare l'audio quando la sorgente finisce di caricare */
  const seekRevision = useRef(0)
  const tRef = useRef<number | null>(null)
  tRef.current = t

  const engine = useMemo(() => new ReplayEngine(), [])
  const exactTakeId = selectedRecordingId ?? selectedTakeId
  const canonicalRecording = timeline && t !== null ? (exactTakeId
    ? timeline.recordings.find(recording => recording.recordingId === exactTakeId && t >= recording.startEpoch && t <= recording.endEpoch) ?? null
    : recordingAtTime(timeline.recordings, t)) : null
  const focusedObject = canonicalRecording?.objectRefs.find((ref) => ref.elementId === focusedObjectId) ?? canonicalRecording?.objectRefs[0] ?? null
  const editorial = current?.editorial ?? emptyEditorial(room)
  const sceneFiles = replayFiles ?? current?.files
  const replayKey = useMemo(() => Symbol('replay-context'), [timeline, canonicalRecording?.recordingId])
  const activeReplayKey = useRef(replayKey)
  activeReplayKey.current = replayKey
  useEffect(() => () => { activeReplayKey.current = Symbol('closed-replay') }, [])

  useEffect(() => {
    let cancelled = false
    setApiReady(false)
    apiRef.current = null
    Promise.all([
      loadReplayTimeline(store, room),
      store.loadMeta(room).catch(() => null),
      store.loadScene(room),
    ])
      .then(([tl, meta, serialized]) => {
        if (cancelled) return
        const target = resolveReplayTarget(tl, window.location.search)
        const envelope = serialized ? JSON.parse(serialized) : {}
        const extension = parseEditorial(envelope, room)
        const params = new URLSearchParams(window.location.search)
        if (params.getAll('moment').length > 1) throw new Error('Riferimento al marker duplicato')
        const requestedMoment = params.get('moment')
        const moment = requestedMoment ? extension.moments.find(item => item.id === requestedMoment) : null
        if (requestedMoment && !moment) throw new Error('Il marker richiesto non appartiene alla lezione')
        if (moment) {
          resolveMoment(room, tl, moment, envelope.files ?? {})
          if ((target.recordingId && target.recordingId !== moment.recordingId) || (params.has('at') && target.epoch !== moment.epoch)) throw new Error('Il marker non corrisponde al passaggio richiesto')
        }
        setLoaded({ store, room, timeline: tl, lessonName: meta?.name ?? null, error: null, editorial: extension, files: envelope.files ?? {} })
        setT(moment?.epoch ?? target.epoch)
        setSelectedTakeId(moment?.recordingId ?? target.recordingId)
        setFocusedObjectId(moment?.objectRefs[0]?.elementId ?? target.objectId)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoaded({ store, room, timeline: null, lessonName: null, error: (err as Error).message, editorial: emptyEditorial(room), files: {} })
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
    const selected = focusedObject && scene.find((element) => element.id === focusedObject.elementId && element.version === focusedObject.version)
    apiRef.current?.scrollToContent?.(selected ? [selected] : undefined, { fitToContent: true, viewportZoomFactor: .85, animate: false })
  }
  // A resize event fires before Excalidraw has applied its new canvas bounds.
  // Observe the actual container and fit after its layout update. Camera-only
  // changes (pan/zoom), scrubbing and audio never schedule an automatic fit.
  useEffect(() => { fitSceneRef.current = fitScene })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!apiReady || !canvas) return
    let frame: number | null = null
    let settledFrame: number | null = null
    let width = -1
    let height = -1
    const cancelFit = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      if (settledFrame !== null) cancelAnimationFrame(settledFrame)
      frame = settledFrame = null
    }
    const fitResizedCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) {
        cancelFit()
        width = height = -1
        return
      }
      if (bounds.width === width && bounds.height === height) return
      width = bounds.width
      height = bounds.height
      cancelFit()
      frame = requestAnimationFrame(() => {
        frame = null
        settledFrame = requestAnimationFrame(() => {
          settledFrame = null
          fitSceneRef.current()
        })
      })
    }
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fitResizedCanvas)
    observer?.observe(canvas)
    if (!observer) window.addEventListener("resize", fitResizedCanvas)
    fitResizedCanvas()
    return () => {
      cancelFit()
      observer?.disconnect()
      window.removeEventListener("resize", fitResizedCanvas)
    }
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
  function seekToEpoch(next: number) {
    if (activeReplayKey.current !== replayKey || !Number.isFinite(next) || !timeline ||
        next < (range?.start ?? timeline.firstEventTime ?? 0) || next > (range?.end ?? timeline.lastEventTime ?? 0)) return
    seekRevision.current++
    setT(next)
    const audio = audioRef.current
    const startEpoch = audioStartEpochRef.current
    if (!audio || startEpoch === null) return
    const seekSec = Math.max(0, (next - startEpoch) / 1000)
    if (audio.readyState === 0) {
      pendingSeekSecRef.current = seekSec
    } else {
      pendingSeekSecRef.current = null
      audio.currentTime = seekSec
    }
  }

  function handleScrub(e: ChangeEvent<HTMLInputElement>) {
    if (!selectedRecordingId) setSelectedTakeId(null)
    seekToEpoch(Number(e.target.value))
  }

  function selectMoment(moment: LessonMoment) {
    if (!timeline) return
    try {
      resolveMoment(room, timeline, moment, sceneFiles ?? {})
      seekToEpoch(moment.epoch)
      setSelectedTakeId(moment.recordingId)
      setFocusedObjectId(moment.objectRefs[0]?.elementId ?? null)
      const url = new URL(window.location.href)
      const ref = moment.objectRefs[0]!
      for (const [key, value] of Object.entries({ moment: moment.id, recording: moment.recordingId, session: moment.sessionId, sha: moment.sha256, at: String(moment.epoch), object: ref.elementId, objectVersion: String(ref.version) })) url.searchParams.set(key, value)
      window.history.replaceState(null, '', url)
    } catch (cause) { setAudioError((cause as Error).message) }
  }

  /** L'audio avanza → il cursore journal lo segue (audio→t via startEpoch) */
  function handleAudioPosition() {
    const audio = audioRef.current
    const startEpoch = audioStartEpochRef.current
    if (!audio || startEpoch === null || !Number.isFinite(audio.currentTime) || (audio.currentSrc && audio.currentSrc !== audio.src)) return
    setT(Math.min(canonicalRecording?.endEpoch ?? Infinity, timeline?.lastEventTime ?? Infinity, startEpoch + audio.currentTime * 1000))
  }

  const hasEvents = timeline !== null && timeline.firstEventTime !== null && timeline.lastEventTime !== null
  const hasAudio = timeline !== null && (timeline.audioChunks.length > 0 || timeline.recordings.length > 0)
  const livingReplay = !renderExtension && canonicalRecording !== null
  const captions = <ReplayCaptions audioRef={audioRef} seekRevision={seekRevision} search={window.location.search} identity={canonicalRecording ? {
    ...recordingSession(canonicalRecording), recordingId: canonicalRecording.recordingId, sha256: canonicalRecording.sha256,
    startEpoch: canonicalRecording.startEpoch, endEpoch: canonicalRecording.endEpoch,
  } : null} onSeek={seekToEpoch} />

  return (
    <div className="st-replay" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header className="st-bar st-bar-recap">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-chip-student st-replay-mode">rivedi la lezione</span>
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
          <div ref={canvasRef} className="st-replay-canvas" style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden" }}>
            <Excalidraw
              langCode={EXCALIDRAW_CONFIG.langCode}
              theme={EXCALIDRAW_CONFIG.theme}
              aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
              viewModeEnabled
              onChange={(_elements, appState) => {
                const next = { scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: appState.zoom.value }
                setViewport((previous) => previous.scrollX === next.scrollX && previous.scrollY === next.scrollY && previous.zoom === next.zoom ? previous : next)
              }}
              UIOptions={EXCALIDRAW_CONFIG.UIOptions}
              excalidrawAPI={(eapi) => {
                apiRef.current = eapi
                setApiReady(true)
              }}
              // Scena iniziale DENTRO initialData: Excalidraw la applica in modo
              // asincrono e cancellerebbe una updateScene arrivata prima (race
              // vista in smoke: lavagna vuota finché non si scrubba).
              initialData={{ elements: scene as any, files: sceneFiles as BinaryFiles | undefined, appState: EXCALIDRAW_CONFIG.newRoomAppState }}
            />
            <ReplayObjectFocus scene={scene} target={focusedObject} viewport={viewport} />
          </div>
          <div className="st-replay-panel" style={{ flex: "0 1 auto", minHeight: 0, maxHeight: "52vh", overflow: "auto" }}>
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
              min={range?.start ?? timeline.firstEventTime!}
              max={range?.end ?? timeline.lastEventTime!}
              step={1}
              value={t ?? timeline.firstEventTime!}
              onChange={handleScrub}
              style={{ flex: "1 1 180px", minWidth: 100 }}
            />
            {hasAudio && (
              <audio
                ref={attachMedia}
                controls={!livingReplay && !renderExtension}
                aria-label="audio della lezione"
                onTimeUpdate={() => { if (!audioRef.current?.paused) handleAudioPosition() }}
                onSeeking={() => { seekRevision.current++ }}
                onSeeked={() => { if (audioRef.current && audioRef.current.readyState > 0) handleAudioPosition() }}
                onEnded={handleAudioPosition}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setAudioError("Il browser non riesce a decodificare questa registrazione.")}
                style={{ height: "32px", maxWidth: "100%" }}
              />
            )}
          </div>
          {!renderExtension && timeline.recordings.length > 0 && <div className="st-replay-passages">
            {timeline.recordings.map((recording, index) => <button type="button" className="st-btn" key={recording.recordingId} onClick={() => {
              seekRevision.current++
              setSelectedTakeId(recording.recordingId)
              setFocusedObjectId(recording.objectRefs[0]?.elementId ?? null)
              setT(recording.endEpoch)
              if (audioRef.current && audioStartEpochRef.current === recording.startEpoch) audioRef.current.currentTime = recording.durationMs / 1000
            }}>{recording.objectRefs[0]?.label ?? `Registrazione ${index + 1}`}</button>)}
            {canonicalRecording?.objectRefs.map((ref) => <button className="st-ghost" key={ref.elementId} aria-pressed={focusedObject?.elementId === ref.elementId} onClick={() => {
              setFocusedObjectId(ref.elementId)
              const element = scene.find((item) => item.id === ref.elementId && item.version === ref.version)
              if (element) apiRef.current?.scrollToContent?.([element], { fitToContent: true, viewportZoomFactor: .85, animate: false })
            }}>Evidenzia {ref.label}</button>)}
            {!livingReplay && canonicalRecording?.availability === "available" && <button type="button" className="st-btn" onClick={() => {
              seekRevision.current++
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
          {!renderExtension && editorial.moments.length > 0 && <nav className="st-replay-editorial" aria-label="Marker e capitoli della lezione">
            {editorial.moments.map(moment => <button type="button" className="st-ghost" key={moment.id} onClick={() => selectMoment(moment)}>{moment.kind === 'chapter' ? 'Capitolo' : 'Passaggio'} · {moment.title}</button>)}
          </nav>}
          {renderExtension ? <>{renderExtension({ media: mediaElement, recording: canonicalRecording, timeline, epoch: t, seekEpoch: seekToEpoch })}{captions}</> : livingReplay ?
            <Suspense fallback={<p role="status">Caricamento del lettore audio…</p>}><IntegratedLivingReplay store={store} room={room} cursor={{ media: mediaElement, recording: canonicalRecording, timeline, epoch: t, seekEpoch: seekToEpoch }} editorial={editorial} captions={captions} onUnavailable={setAudioError} /></Suspense> : captions}
          </div>
        </>
      )}
    </div>
  )
}
