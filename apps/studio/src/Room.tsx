import { lazy, Suspense, useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type KeyboardEvent } from "react"
import { Excalidraw, MainMenu, WelcomeScreen, convertToExcalidrawElements, exportToCanvas, getCommonBounds, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import { latexToImage } from "./latexToImage"
import { imageToDataURL, pdfToImages } from "./loadFile"
import { workspaceStore, type WorkspaceStore } from "./store/WorkspaceStore"
import { type StorageMode } from "./store/types"
import { LESSON_EXTENSION } from "./store/lessonBundle"
import { JournalRecorder, toLegacyJournalEvent } from "./store/JournalRecorder"
import { ReplayEngine, decodeJournalJsonl, serializeEvents, deserializeEvents } from "./store/ReplayEngine"
import { IconAlert } from "./design/icons"
import ViewNav from "./design/ViewNav"
import { isStudentView } from "./store/studentView"
import {
  openLessonOsSession,
  type LessonOsSessionHandle,
  type LessonOsSessionOpener,
} from "./lessonos/bootstrap"
import { deriveStorageAdvice, ensurePersistentStorage } from "./lessonos/storagePreflight"
import { appendJournalBridgeTail } from "./lessonos/journalBridgeWriter"
import { defaultManualRegistry } from "./lessonos/manualRegistry"
import { isRecapView } from "./store/isRecapView"
import RecapView from "./RecapView"
import { isReplayView } from "./store/isReplayView"
import ReplayView from "./ReplayView"
import EmptyState from "./design/EmptyState"
// NB: l'import da ToolCanvasEmbeddable è anche ciò che REGISTRA i tool reference
// nel registry (registrazione a module-scope): non rimuoverlo lasciando solo
// getSimulationTool, o il registry risulterebbe vuoto.
import { buildSimulationInsert, normalizeDuplicatedToolEmbeds, renderToolCanvasEmbeddable } from "./toolhost/ToolCanvasEmbeddable"
import { persistRoomEmbedStateThroughToolHost } from "./toolhost/roomWriteBack"
import { FOUNDER_BETA_PLUGIN } from "./toolhost/founderBetaPlugin"
import { roomPaths, validateRoomId } from "./store/roomPaths"
import type { ActiveLessonRegistration } from "./store/lessonMutationLock"
import { SessionAudioRecorder } from "./store/SessionAudioRecorder"
import { recordingSession, type AudioObjectReference, type AudioRecordingRef } from "./store/audioRecording"
import LessonPassageAuthor from "./LessonPassageAuthor"
import { wrapPassageAnnotation } from "./store/passageAnnotation"
import { preserveEditorial } from "./features/living-lesson/serialization"
import { attachEditorial, parseEditorial, resolveMoment, type LessonMoment } from "./features/living-lesson/model"
import { loadReplayTimeline } from "./store/replayTimeline"

import { legacyBoardScene } from "./collaboration-v2/sceneBoundary"
import { LessonLibraryState, sceneWithLibrary, snapshotLibraryItems } from "./whiteboard-library/libraryScene"
import { validateLibraryLesson } from "./whiteboard-library/libraryImport"
import type { RoomInkAdapter } from "./collaboration-v2/RoomCollaboration"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"

const RoomCollaboration = lazy(() => import("./collaboration-v2/RoomCollaboration").then(module => ({ default: module.RoomCollaboration })))
const MathComposer = lazy(() => import("./MathComposer"))

// Room id nello hash dell'URL: il link che mandi allo studente apre la STESSA stanza video.
function getRoomId(): string {
  let h = location.hash.replace(/^#/, "")
  if (!h) {
    h = "wbstudio-" + Math.random().toString(36).slice(2, 9)
    location.hash = h
  }
  return validateRoomId(h)
}

/** Clock del journal canonico della lezione. */
function sharedClock(): number {
  return Date.now()
}

function isLessonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(LESSON_EXTENSION)
}

function navigateDocument(href: string): void {
  window.location.assign(href)
}

const SURFACE_FLUSH_TIMEOUT_MS = 10_000

type RoomLifecycleGate = "pending" | "activity-ready" | "failed"

type RoomLifecycleState = {
  generation: symbol
  status: RoomLifecycleGate
  error: string | null
}

function withSurfaceFlushTimeout(operation: Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(
        "Salvataggio ancora in corso dopo 10 secondi; resta nella Lezione e riprova.",
      ))
    }, SURFACE_FLUSH_TIMEOUT_MS)
    operation.then(
      () => {
        window.clearTimeout(timeoutId)
        resolve()
      },
      (error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
}

export default function Room({
  store,
  collaboration,
  lessonOsOpener = openLessonOsSession,
  navigate = navigateDocument,
}: {
  store?: WorkspaceStore
  collaboration?: RoomInkAdapter
  lessonOsOpener?: LessonOsSessionOpener
  navigate?: (href: string) => void
}) {
  const actualStore = store ?? workspaceStore
  const [collaborationApi, setCollaborationApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [collaborationRevoked, setCollaborationRevoked] = useState(false)
  useEffect(() => {
    if (!collaboration) { setCollaborationRevoked(false); return }
    const revoked = () => setCollaborationRevoked(true)
    setCollaborationRevoked(collaboration.signal.aborted)
    collaboration.signal.addEventListener("abort", revoked, { once: true })
    return () => collaboration.signal.removeEventListener("abort", revoked)
  }, [collaboration])
  const [room] = useState(getRoomId)
  const collaborativeWriting = !!collaboration && collaboration.roomId === room && !collaborationRevoked
  // Snapshot a mount: la decisione vista studente/docente NON cambia tra render
  // (recorder creati una volta sola nell'effect — UI e storage devono restare coerenti)
  const studentView = useMemo(() => isStudentView(), [])
  const recapView = useMemo(() => isRecapView(), [])
  const replayView = useMemo(() => isReplayView(), [])
  const lifecycleGeneration = useMemo(
    () => Symbol("room-lifecycle-generation"),
    [room, actualStore, lessonOsOpener],
  )
  const [mathOn, setMathOn] = useState(false)
  const [mathPending, setMathPending] = useState(false)
  const mathInsertPendingRef = useRef(false)
  const [saved, setSaved] = useState(false)
  const [lifecycleState, setLifecycleState] = useState<RoomLifecycleState>(() => ({
    generation: lifecycleGeneration,
    status: "pending",
    error: null,
  }))
  const lifecycleGate = lifecycleState.generation === lifecycleGeneration
    ? lifecycleState.status
    : "pending"
  const lifecycleError = lifecycleState.generation === lifecycleGeneration
    ? lifecycleState.error
    : null
  const [storageError, setStorageError] = useState<string | null>(null)
  const [storeMode, setStoreMode] = useState<StorageMode>("localStorage")
  /** Hamburger menu mobile */
  const [menuOpen, setMenuOpen] = useState(false)
  /** Nome lezione (da meta.json) — null = non ancora caricato */
  const [lessonName, setLessonName] = useState<string | null>(null)
  /** Stato rename inline */
  const [editingName, setEditingName] = useState(false)
  /** Campo rename ref per focus */
  const renameInputRef = useRef<HTMLInputElement>(null)
  /** Refs per i dati scena più recenti (per flushPersist) */
  const latestElementsRef = useRef<any>(null)
  const latestAppStateRef = useRef<any>(null)
  const latestFilesRef = useRef<any>(null)
  /** Drawer lezioni */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  /** Focus management dialog: elemento da rifocalizzare alla chiusura + bottone chiudi */
  const drawerReturnRef = useRef<HTMLElement | null>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  /** Dati scena caricati async dallo store (null = nessun dato salvato) */
  const [sceneData, setSceneData] = useState<any>(null)
  /** Consiglio "da esportare" (spec #35 §4.3): motivo in linguaggio docente, null = tutto ok */
  const [exportAdvice, setExportAdvice] = useState<string | null>(null)

  const lessonLibrary = useRef(new LessonLibraryState())
  const libraryGeneration = useRef<symbol | null>(null)
  const legacyInkIds = useRef(new Set<string>())
  const apiRef = useRef<any>(null)
  const saveTimer = useRef<number | null>(null)
  // Flag per evitare che persist() richiami saveScene durante il caricamento iniziale
  const initialLoadDone = useRef(false)
  // Riferimento al JournalRecorder (creato dopo init store)
  const journalRef = useRef<JournalRecorder | null>(null)
  const audioRef = useRef<SessionAudioRecorder | null>(null)
  const [sessionAudio, setSessionAudio] = useState<SessionAudioRecorder | null>(null)
  const [selectedObjects, setSelectedObjects] = useState<readonly AudioObjectReference[]>([])
  // Unsubscribe handle per pointer events Excalidraw
  const unsubsRef = useRef<Array<() => void>>([])
  // Runtime LessonOS: event-log persistente + capability snapshot (spec #35 §4)
  const lessonOsRef = useRef<LessonOsSessionHandle | null>(null)
  // persist() va chiesto UNA volta, su chiara interazione utente (spec #35 §4.1)
  const persistRequestedRef = useRef(false)
  // Promise-chain mutex per serializzare salvataggi async sovrapposti
  const _pendingSave = useRef<Promise<void>>(Promise.resolve())
  // Promise-chain mutex per la promozione bridge: due promote sovrapposti
  // leggerebbero lo stesso cursore e duplicherebbero i material.cited
  const _pendingPromote = useRef<Promise<void>>(Promise.resolve())
  // Un solo cambio superficie per volta: un doppio click non può avviare due
  // flush concorrenti né scegliere una seconda destinazione a metà preflight.
  const _pendingSurfaceNavigation = useRef<Promise<void> | null>(null)

  // All'avvio, inizializza lo store e carica la scena dal driver attivo (localStorage).
  useEffect(() => {
    const generation = lifecycleGeneration
    libraryGeneration.current = generation
    let cancelled = false
    let activity: ActiveLessonRegistration | null = null
    let registrationPromise: Promise<ActiveLessonRegistration> | null = null
    let openerPromise: Promise<LessonOsSessionHandle> | null = null
    let runtime: LessonOsSessionHandle | null = null
    let journal: JournalRecorder | null = null
    let audio: SessionAudioRecorder | null = null
    let cleanupPromise: Promise<void> | null = null
    let registrationFailureReported = false
    let openerFailureReported = false
    let lifecycleFailed = false

    const publishLifecycle = (
      status: Exclude<RoomLifecycleGate, "pending">,
      error: string | null = null,
    ): void => {
      if (cancelled) return
      setLifecycleState((current) => (
        current.generation === generation
          ? { generation, status, error }
          : current
      ))
    }

    // Tutto ciò che può essere mostrato o riusato dalla canvas appartiene alla
    // generation corrente. Il gate tokenizzato nasconde già il primo render B;
    // questo reset impedisce che un loadScene/loadMeta B nullo riesponga A.
    initialLoadDone.current = false
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    legacyInkIds.current = new Set()
    latestElementsRef.current = null
    latestAppStateRef.current = null
    latestFilesRef.current = null
    apiRef.current = null
    persistRequestedRef.current = false
    setSaved(false)
    setStorageError(null)
    setStoreMode("localStorage")
    setMenuOpen(false)
    setLessonName(null)
    setEditingName(false)
    setDrawerOpen(false)
    setRooms([])
    setLoadingRooms(false)
    setSceneData(null)
    lessonLibrary.current = new LessonLibraryState()
    setExportAdvice(null)
    setSessionAudio(null)
    setSelectedObjects([])
    // Le chain in-flight non vengono sganciate: farlo permetterebbe a B di
    // sorpassare A. Gli snapshot canvas riusabili sono stati azzerati sopra;
    // cancellazione/drain dei producer già avviati resta il gate ARD-07.
    setLifecycleState({ generation, status: "pending", error: null })
    if (import.meta.env.DEV) delete (window as any).__MAESTRO_TEST__

    const publishTestHarness = (ready: boolean): void => {
      if (!import.meta.env.DEV) return
      const paths = roomPaths(room)
      const liveRuntime = lessonOsRef.current
      ;(window as any).__MAESTRO_TEST__ = {
        ready,
        initialLoadDone: initialLoadDone.current,
        room,
        store: actualStore,
        recorder: journalRef.current,
        journal: liveRuntime && journalRef.current ? {
          path: paths.journal,
          identity: liveRuntime.identity,
          producer: liveRuntime.producer,
        } : null,
        audioRecorder: audioRef.current,
        lessonOs: lessonOsRef,
        apiRef,
        ReplayEngine,
        serializeEvents,
        deserializeEvents,
        PATHS: { JOURNAL: paths.journal, SCENE: paths.scene },
        navigateToLesson,
        flushPersist,
        promoteJournalToLessonOs,
      }
    }

    const cleanup = (): Promise<void> => {
      if (cleanupPromise) return cleanupPromise

      // Gli input vengono fermati tutti, sincronicamente e in modo isolato,
      // prima di avviare qualunque flush. Il drain pointer/scene completo resta ARD-07.
      const ownedUnsubscribes = unsubsRef.current
      unsubsRef.current = []
      for (const unsubscribe of ownedUnsubscribes) {
        try {
          unsubscribe()
        } catch (error) {
          console.error("Room subscription cleanup failed during unmount", error)
        }
      }

      const ownedJournal = journal
      const ownedAudio = audio
      if (ownedAudio && audioRef.current === ownedAudio) audioRef.current = null
      // dispose requests native stop synchronously, then preserves its tail.
      const audioClose = ownedAudio?.dispose()
      if (ownedJournal && journalRef.current === ownedJournal) journalRef.current = null
      const runtimeWasPending = runtime === null && openerPromise !== null
      const ownedRuntimeAtCleanup = runtime
      if (ownedRuntimeAtCleanup && lessonOsRef.current === ownedRuntimeAtCleanup) {
        lessonOsRef.current = null
      }

      cleanupPromise = (async () => {
        if (!activity && registrationPromise) {
          try {
            activity = await registrationPromise
          } catch (error) {
            if (!registrationFailureReported) {
              registrationFailureReported = true
              console.error("Room activity registration failed during cleanup", error)
            }
          }
        }

        if (!runtime && openerPromise) {
          try {
            runtime = await openerPromise
          } catch (error) {
            if (!openerFailureReported) {
              openerFailureReported = true
              console.error("LessonOS session open failed after Room unmount", error)
            }
          }
        }

        try {
          await audioClose
        } catch (error) {
          console.error("Room audio drain failed before session close", error)
        }
        try {
          await ownedJournal?.flush()
        } catch (error) {
          console.error("Room journal flush failed before LessonOS close", error)
        }
        try {
          await runtime?.close()
        } catch (error) {
          console.error(
            runtimeWasPending
              ? "LessonOS session cleanup failed after Room unmount"
              : "LessonOS session cleanup failed during Room unmount",
            error,
          )
        }
        const ownedActivity = activity
        activity = null
        try {
          await ownedActivity?.release()
        } catch (error) {
          console.error("Room activity release failed during unmount", error)
        }
      })()
      return cleanupPromise
    }

    void (async () => {
      try {
        try {
          await actualStore.init()
        } catch (error) {
          if (cancelled) return
          lifecycleFailed = true
          const message = "Inizializzazione archivio fallita: " + (error as Error).message
          publishLifecycle("failed", message)
          publishTestHarness(false)
          return
        }
        if (cancelled) return
        setStoreMode(actualStore.mode)

        registrationPromise = Promise.resolve().then(() => (
          actualStore.registerActiveLesson(room)
        ))
        try {
          activity = await registrationPromise
        } catch (error) {
          if (cancelled) return
          lifecycleFailed = true
          registrationFailureReported = true
          const message = "Coordinamento lezione fallito: " + (error as Error).message
          publishLifecycle("failed", message)
          publishTestHarness(false)
          return
        }
        if (cancelled) {
          await cleanup()
          return
        }

        // Le viste read-only non aprono né sessione né recorder. Nel percorso docente,
        // la sessione canonica è l'unica autorità che può costruire il journal live.
        if (!studentView && !recapView && !replayView) {
          openerPromise = Promise.resolve().then(() => lessonOsOpener({ room }))
          try {
            runtime = await openerPromise
          } catch (error) {
            if (cancelled) {
              await cleanup()
              return
            }
            openerFailureReported = true
            setStorageError("Avvio memoria lezione fallito: " + (error as Error).message)
          }

          if (runtime) {
            if (cancelled) {
              await cleanup()
              return
            }
            const clock = sharedClock
            const paths = roomPaths(room)
            const jr = new JournalRecorder({
              store: actualStore,
              journalPath: paths.journal,
              identity: runtime.identity,
              producer: runtime.producer,
              now: clock,
            })
            journal = jr
            lessonOsRef.current = runtime
            journalRef.current = jr
            const sessionRecorder = new SessionAudioRecorder({
              store: actualStore, identity: runtime.identity, journal: jr, clock,
            })
            audio = sessionRecorder
            await sessionRecorder.initialize()
            if (cancelled) {
              await cleanup()
              return
            }
            audioRef.current = sessionRecorder
            setSessionAudio(sessionRecorder)
            if (runtime.dataLoss) {
              setStorageError("Memoria della lezione non trovata: ripristina dall'export .lesson")
            } else if (runtime.corrupted) {
              setStorageError("Memoria della lezione danneggiata: ripristina da un export .lesson")
            }
            const { advice, reason } = deriveStorageAdvice(runtime.capabilities, runtime.persistent)
            if (advice === "export-advised") setExportAdvice(reason)
          }
        }

        if (cancelled) return
        const data = await actualStore.loadScene(room)
        if (cancelled) return
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (!parsed || typeof parsed !== "object") throw new Error("scena non valida")
            if (Array.isArray(parsed.elements)) {
              parsed.elements = legacyBoardScene(parsed.elements)
              legacyInkIds.current = new Set(parsed.elements.filter((element: any) => element.type === "freedraw").map((element: any) => element.id))
            }
            try { lessonLibrary.current.load(parsed) } catch (error) {
              setStorageError("Raccolta non caricata: " + (error as Error).message)
            }
            setSceneData({ ...parsed, libraryItems: lessonLibrary.current.items })
            if (journalRef.current && parsed?.elements) {
              journalRef.current.seed(parsed.elements)
            }
          } catch {
            // JSON malformato — si parte da zero senza riscrivere il blob corrotto.
          }
        }

        const meta = await actualStore.loadMeta(room).catch(() => null)
        if (!cancelled && meta?.name) setLessonName(meta.name)
      } catch (err) {
        if (!cancelled && !lifecycleFailed) {
          setStorageError("Caricamento scena fallito: " + (err as Error).message)
        }
      } finally {
        if (!cancelled && !lifecycleFailed) {
          initialLoadDone.current = true
          publishLifecycle("activity-ready")
          publishTestHarness(true)
        }
      }
    })()
    return () => {
      cancelled = true
      if (libraryGeneration.current === generation) libraryGeneration.current = null
      // Pulisci il debounce timer persist() se ancora in sospeso
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
      void cleanup()
    }
  }, [room, actualStore, lessonOsOpener, lifecycleGeneration])

  useEffect(() => {
    document.title = "Ardesia · studio"
  }, [])
  function fitBoardContent() {
    apiRef.current?.scrollToContent?.(undefined, { fitToContent: true, viewportZoomFactor: .85, animate: false })
  }
  useEffect(() => {
    let firstFrame = 0
    let secondFrame = 0
    const resized = () => {
      cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame)
      firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(fitBoardContent) })
    }
    window.addEventListener("resize", resized)
    return () => { window.removeEventListener("resize", resized); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [])

  /** All'apertura del drawer porta il focus dentro al dialog (bottone chiudi) */
  useEffect(() => {
    if (!drawerOpen) return
    const id = window.setTimeout(() => drawerCloseRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [drawerOpen])

  // Persistenza via WorkspaceStore.
  // Aggiorna refs coi dati più recenti, poi debounce 700ms.
  function persist(elements: any, appState: any, files: any) {
    if (!initialLoadDone.current) return
    latestElementsRef.current = elements
    latestAppStateRef.current = appState
    latestFilesRef.current = files
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      // Il debounce non ha un caller da rigettare; _doSave ha già reso visibile
      // l'errore. I caller espliciti (flush/navigazione) ricevono invece il reject.
      void _doSave().catch(() => {})
    }, 700)
  }

  /** One scene writer for board edits and editorial markers. Every read-modify-
   * write runs inside the same queue, so a delayed board save cannot erase a marker. */
  async function queueSceneWrite(serialize: () => Promise<string>) {
    const run = _pendingSave.current.then(async () => {
      try {
        const serialized = await serialize()
        await actualStore.saveScene(room, serialized)
        setStorageError(null)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1200)
      } catch (err) {
        setStorageError("Salvataggio non riuscito: " + (err as Error).message)
        throw err
      }
    })
    // La coda resta riutilizzabile dopo un errore, mentre il caller corrente
    // osserva il rigetto e può annullare export/navigazione.
    _pendingSave.current = run.then(
      () => {},
      () => {},
    )
    await run
  }

  /** Esegue il salvataggio con i dati più recenti (dal debounce o da flush). */
  async function _doSave() {
    const elements = latestElementsRef.current
    const appState = latestAppStateRef.current
    const files = latestFilesRef.current
    const libraryItems = lessonLibrary.current.items
    const libraryError = lessonLibrary.current.error
    if (!elements) return
    // Capture this lifecycle's ink boundary before the queue can wait. A new
    // store lifecycle replaces legacyInkIds while the old save is draining.
    const board = legacyBoardScene(elements as Parameters<typeof serializeAsJSON>[0], collaboration ? legacyInkIds.current : undefined)
    await queueSceneWrite(async () => {
      if (libraryError) throw libraryError
      const previous = await actualStore.loadScene(room)
      const serialized = sceneWithLibrary(serializeAsJSON(board, appState, files, "local"), libraryItems)
      return preserveEditorial(serialized, previous ? JSON.parse(previous) : {}, room)
    })
  }

  async function addLessonMoment(recording: AudioRecordingRef, title: string, kind: LessonMoment['kind']): Promise<void> {
    if (studentView || replayView || recapView || recordingSession(recording).lessonId !== room) throw new Error('Passaggio non modificabile da questa vista.')
    await flushLiveLesson()
    const moment: LessonMoment = {
      id: crypto.randomUUID(), title: title.trim(), kind,
      ...recordingSession(recording), recordingId: recording.recordingId,
      sha256: recording.sha256, epoch: recording.endEpoch,
      objectRefs: [...recording.objectRefs],
    }
    await queueSceneWrite(async () => {
      const serialized = await actualStore.loadScene(room)
      if (!serialized) throw new Error('Salva la lavagna prima di aggiungere il passaggio.')
      const scene = JSON.parse(serialized)
      const timeline = await loadReplayTimeline(actualStore, room)
      const resolved = resolveMoment(room, timeline, moment, scene.files ?? {})
      if (resolved.recording.availability !== 'available') throw new Error('La registrazione non è disponibile o è stata revocata.')
      const editorial = parseEditorial(scene, room)
      return JSON.stringify(attachEditorial(scene, { ...editorial, moments: [...editorial.moments, moment] }))
    })
  }

  /** Flush immediato: cancella il debounce e salva subito. Attende il completamento. */
  async function flushPersist() {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    await _doSave()
  }

  /** Rende durevoli entrambe le fonti live prima di lasciare la Room. */
  async function flushLiveLesson(): Promise<void> {
    const api = apiRef.current
    const owner = lessonLibrary.current
    const stillCurrent = () => libraryGeneration.current === lifecycleGeneration && apiRef.current === api && lessonLibrary.current === owner
    await audioRef.current?.stop()
    if (!stillCurrent()) throw new Error("La lezione è cambiata durante il salvataggio: riprova nella lezione corrente.")
    if (!studentView && api?.updateLibrary) {
      // Excalidraw queues library imports but does not await onLibraryChange.
      // This no-op waits for its queue before the canonical scene save fence.
      await api.updateLibrary({ libraryItems: (items: unknown) => items })
    }
    if (!stillCurrent()) throw new Error("La lezione è cambiata durante il salvataggio: riprova nella lezione corrente.")
    await flushPersist()
    await journalRef.current?.flush()
  }

  async function annotatePassage(text: string): Promise<readonly AudioObjectReference[]> {
    const api = apiRef.current
    const journal = journalRef.current
    if (!api || !journal || !text || text.length > 240) throw new Error("Scrivi un'annotazione quando la lavagna è pronta.")
    const current = api.getSceneElements()
    const input = {
      type: "text", x: 160, y: 120 + current.length * 32, text: wrapPassageAnnotation(text),
      fontSize: 24, fontFamily: EXCALIDRAW_CONFIG.newRoomAppState.currentItemFontFamily,
    } as const
    // The public exporter waits for the actual scene fonts. Measuring the first
    // annotation with a fallback font would persist a box that clips its glyphs.
    await exportToCanvas({ elements: convertToExcalidrawElements([input]), files: {} })
    const elements = convertToExcalidrawElements([input])
    const element = elements[0]
    if (!element) throw new Error("Annotazione non creata")
    const all = [...current, ...elements]
    api.updateScene({ elements: all, appState: { selectedElementIds: { [element.id]: true } } })
    // Publish the actual object/version before the audio marker can reference it.
    journal.recordChange(legacyBoardScene(all, collaboration ? legacyInkIds.current : undefined))
    await journal.flush()
    latestElementsRef.current = all
    latestAppStateRef.current = api.getAppState?.() ?? EXCALIDRAW_CONFIG.newRoomAppState
    latestFilesRef.current = api.getFiles?.() ?? {}
    await flushPersist()
    api.scrollToContent?.(elements, { fitToContent: true, viewportZoomFactor: .85, animate: false })
    return [{ elementId: element.id, version: element.version, label: text }]
  }

  function boardSelection(elements: readonly any[], appState: any): readonly AudioObjectReference[] {
    const ids = appState?.selectedElementIds ?? {}
    return legacyBoardScene(elements, collaboration ? legacyInkIds.current : undefined).filter((element) => ids[element.id] && !element.isDeleted && Number.isSafeInteger(element.version) && element.version > 0).slice(0, 21).map((element) => ({
      elementId: element.id, version: element.version,
      label: String(element.text?.replace(/\s+/g, " ").trim() || ({ rectangle: "Riquadro", ellipse: "Cerchio", freedraw: "Disegno", arrow: "Freccia", image: "Immagine", line: "Linea" } as Record<string, string>)[element.type] || "Oggetto della lavagna").slice(0, 240),
    }))
  }
  async function linkSelectedPassage(): Promise<readonly AudioObjectReference[]> {
    const api = apiRef.current
    const journal = journalRef.current
    if (!api || !journal) throw new Error("Attendi che la lavagna sia pronta.")
    const elements = api.getSceneElements()
    const refs = boardSelection(elements, api.getAppState())
    if (refs.length === 0 || refs.length > 20) throw new Error("Seleziona da uno a venti oggetti sulla lavagna.")
    journal.recordChange(legacyBoardScene(elements, collaboration ? legacyInkIds.current : undefined))
    await journal.flush()
    latestElementsRef.current = elements
    latestAppStateRef.current = api.getAppState()
    latestFilesRef.current = api.getFiles?.() ?? {}
    await flushPersist()
    return refs
  }

  /** Handler composito: salva scena + registra eventi journal */
  function handleChange(elements: any, appState: any, files: any) {
    // P0-C residuo: un duplicato dal canvas (copy/paste/Alt-drag) clona il
    // link → id ≠ embedId e il duplicato scriverebbe sullo stato dell'
    // ORIGINALE. La normalizzazione lo promuove a NUOVA istanza (idempotente:
    // al giro dopo changed=false, nessun loop di updateScene).
    const normalized = normalizeDuplicatedToolEmbeds(elements as readonly { id?: string }[])
    if (normalized.changed && apiRef.current) {
      apiRef.current.updateScene({ elements: normalized.elements })
      return
    }
    const selection = boardSelection(elements, appState)
    setSelectedObjects((previous) => JSON.stringify(previous) === JSON.stringify(selection) ? previous : selection)
    const baseElements = legacyBoardScene(elements, collaboration ? legacyInkIds.current : undefined)
    persist(baseElements, appState, files)
    if (!initialLoadDone.current) return
    journalRef.current?.recordChange(baseElements)
  }

  /** Chiude il drawer e restituisce il focus al controllo che l'ha aperto (WCAG 2.4.3) */
  function closeDrawer() {
    setDrawerOpen(false)
    drawerReturnRef.current?.focus?.()
  }

  /** Apre/chiude il drawer delle lezioni */
  async function toggleDrawer() {
    if (drawerOpen) {
      closeDrawer()
      return
    }
    // Ricorda chi ha aperto il dialog per ripristinare il focus alla chiusura
    drawerReturnRef.current = (document.activeElement as HTMLElement) ?? null
    setLoadingRooms(true)
    setDrawerOpen(true)
    try {
      const list = await actualStore.listRooms()
      setRooms(list)
    } catch (err) {
      setRooms([])
      setStorageError("Errore nel caricamento delle lezioni: " + (err as Error).message)
    } finally {
      setLoadingRooms(false)
    }
  }

  /** Naviga a un'altra lezione: flush persist + cambia hash + forza re-init */
  async function navigateToLesson(targetRoom: string) {
    if (targetRoom === room) {
      setDrawerOpen(false)
      return
    }
    // Entrambe le fonti live devono essere durevoli prima di cambiare identità.
    try {
      await flushLiveLesson()
    } catch (error) {
      setStorageError("Cambio lezione annullato: " + (error as Error).message)
      return
    }
    // Cambia hash — guidare re-init via room state
    location.hash = targetRoom
    setDrawerOpen(false)
    // Forza un re-mount pulito del componente
    window.location.reload()
  }

  /**
   * Cambia superficie soltanto dopo il flush scena+journal. La Promise viene
   * serializzata: i click successivi durante il preflight non cambiano target.
   */
  function navigateToSurface(href: string): Promise<void> {
    const pending = _pendingSurfaceNavigation.current
    if (pending) return pending

    const run = (async () => {
      try {
        // Un driver bloccato non può tenere il control plane in stallo infinito.
        // La write sottostante continua; la route resta ferma e il mutex si libera.
        await withSurfaceFlushTimeout(flushLiveLesson())
        navigate(href)
      } catch (error) {
        setStorageError("Cambio superficie annullato: " + (error as Error).message)
      }
    })()
    _pendingSurfaceNavigation.current = run
    void run.then(() => {
      if (_pendingSurfaceNavigation.current === run) {
        _pendingSurfaceNavigation.current = null
      }
    })
    return run
  }

  /** Avvia rename inline del nome lezione */
  function startRename() {
    setEditingName(true)
    // Focus dopo render
    setTimeout(() => renameInputRef.current?.select(), 0)
  }

  /** Salva nome e esce da rename */
  function saveRename(newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return // nome vuoto = non salvare
    setLessonName(trimmed)
    setEditingName(false)
    actualStore.saveMeta(room, { v: 1, name: trimmed, createdAt: Date.now() }).catch((err) => {
      setStorageError("Salvataggio nome fallito: " + (err as Error).message)
    })
  }

  /** Collega una cartella FSA (showDirectoryPicker) su gesto esplicito utente */
  const handleConnectFolder = useCallback(async () => {
    setStorageError(null)
    try {
      const ok = await actualStore.connectFolder()
      if (ok) {
        setStoreMode("fsa")
      } else {
        setStorageError("Impossibile aprire la cartella. Chrome? Consenti il permesso.")
      }
    } catch (err) {
      setStorageError("Errore aprendo la cartella: " + (err as Error).message)
    }
  }, [actualStore])

  /**
   * Bridge Journal → LessonOS (spec #34): promuove le pdf.page.view riconosciute
   * dal ManualRegistry in material.cited sull'event-log. Idempotente al replay
   * (cursore lastPromotedJournalT dentro appendJournalBridgeTail). Soltanto una
   * page-observed v2 con evidence verified può attraversare il bridge: un import
   * PDF è materiale disponibile, non prova che il docente abbia visto la pagina.
   */
  async function promoteJournalToLessonOs(): Promise<void> {
    const run = _pendingPromote.current.then(async () => {
      const runtime = lessonOsRef.current
      const recorder = journalRef.current
      if (!runtime || !recorder) {
        throw new Error("Sessione o journal canonico non disponibile")
      }
      await recorder.flush()
      const path = roomPaths(room).journal
      const blob = await actualStore.read(path)
      if (!blob) return
      const decoded = decodeJournalJsonl(await blob.text(), path)
      const observed = decoded.envelopes.flatMap((envelope) => {
        if (envelope.kind !== "journal.pdf.page-observed") return []
        if (envelope.evidence.some((entry) => entry.resolution !== "verified")) return []
        const event = toLegacyJournalEvent(envelope)
        return event ? [event] : []
      })
      await appendJournalBridgeTail(runtime.store, observed, {
        registry: defaultManualRegistry,
        room,
      })
    })
    _pendingPromote.current = run.then(
      () => {},
      () => {},
    )
    return run
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  function addImages(items: { dataURL: string; mimeType: string; width: number; height: number; x: number; y: number }[]) {
    if (!apiRef.current || !items.length) return
    const files = items.map((it) => {
      const id = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)) as string
      return { ...it, _id: id, file: { id, dataURL: it.dataURL, mimeType: it.mimeType, created: Date.now(), lastRetrieved: Date.now() } }
    })
    apiRef.current.addFiles(files.map((f) => f.file))
    const els = convertToExcalidrawElements(
      files.map((f) => ({ type: "image", x: f.x, y: f.y, width: f.width, height: f.height, fileId: f._id }) as any)
    )
    apiRef.current.updateScene({ elements: [...apiRef.current.getSceneElements(), ...els] })
  }

  async function insertMath(latex: string) {
    if (mathInsertPendingRef.current) throw new Error("Attendi l'inserimento della formula in corso.")
    mathInsertPendingRef.current = true
    setMathPending(true)
    const canvas = apiRef.current
    const journal = journalRef.current
    try {
      if (!canvas || !journal) throw new Error("Lavagna non pronta: riprova tra un istante.")
      if (!latex.trim()) throw new Error("Scrivi una formula prima di inserirla.")
      const { dataURL, width, height } = await latexToImage(latex)
      if (apiRef.current !== canvas || journalRef.current !== journal) {
        throw new Error("La lezione è cambiata durante l'inserimento. Riprova nella lezione corrente.")
      }
      // Keep existing annotations readable. Excalidraw supplies bounds including
      // rotation; deleted objects must not push the next formula off the board.
      const liveElements = canvas.getSceneElements().filter((element: { isDeleted?: boolean }) => !element.isDeleted)
      const y = liveElements.length ? Math.max(120, getCommonBounds(liveElements)[3] + 24) : 120
      addImages([{ dataURL, mimeType: "image/svg+xml", width, height, x: 160, y }])
      journal.recordMathInsert(latex)
      fitBoardContent()
    } catch (err) {
      if (apiRef.current === canvas && journalRef.current === journal) {
        setStorageError("Inserimento formula non riuscito: " + (err as Error).message)
      }
      throw err
    } finally {
      mathInsertPendingRef.current = false
      setMathPending(false)
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const lessonFile = isLessonFile(file)
    const supported = lessonFile || file.type === "application/pdf" || file.type.startsWith("image/")
    if (!supported) {
      setStorageError("Formato non supportato (usa immagine, PDF o .lesson).")
      return
    }
    if (!apiRef.current) {
      setStorageError("Lavagna non pronta: riprova tra un istante.")
      return
    }
    try {
      if (lessonFile) {
        const owner = lessonLibrary.current
        const api = apiRef.current
        const stillCurrent = () => libraryGeneration.current === lifecycleGeneration && apiRef.current === api && lessonLibrary.current === owner
        // Drain old writes before the import transaction replaces this board.
        if (saveTimer.current) { window.clearTimeout(saveTimer.current); saveTimer.current = null }
        await _pendingSave.current
        if (!stillCurrent()) return
        await validateLibraryLesson(file)
        if (!stillCurrent()) return
        // P32 R10: passa l'event-log LessonOS così il bundle può ripristinare la
        // memoria didattica. Restore SOLO su log vuoto (disaster-recovery); nella
        // Room live il log ha già lesson.started ⇒ esito atteso "skipped-non-empty".
        const importResult = await actualStore.importLessonBlobForRoom(
          file,
          room,
          lessonOsRef.current?.store,
        )
        const sceneJson = await actualStore.loadScene(room)
        if (!stillCurrent()) return
        if (!sceneJson) throw new Error("board.excalidraw non trovato nel bundle")
        const parsed = JSON.parse(sceneJson)
        if (!parsed || typeof parsed !== "object") throw new Error("scena non valida")
        const elements = Array.isArray(parsed.elements) ? legacyBoardScene(parsed.elements) : []
        legacyInkIds.current = new Set(elements.filter((element: any) => element.type === "freedraw").map((element: any) => element.id))
        parsed.elements = elements
        const appState = { ...EXCALIDRAW_CONFIG.newRoomAppState, ...parsed.appState }
        const files = parsed.files ?? {}
        owner.load(parsed)
        setSceneData(parsed)
        latestElementsRef.current = elements
        latestAppStateRef.current = appState
        latestFilesRef.current = files
        journalRef.current?.seed(elements)
        api.updateScene({ elements, appState, files })
        await api.updateLibrary({ libraryItems: owner.items, merge: false })
        if (!stillCurrent()) return
        // Telemetria mai silenziosa (§4.4): un restore FALLITO va detto al docente
        // (il board è importato; è la memoria didattica a non essere tornata).
        if (importResult.lessonOsRestore.kind === "failed") {
          setStorageError(
            "Lezione importata, ma memoria didattica NON ripristinata: " +
              importResult.lessonOsRestore.error,
          )
        } else {
          setStorageError(null)
        }
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1200)
      } else if (file.type === "application/pdf") {
        const pages = await pdfToImages(file)
        let y = 100
        const totalPages = pages[0]?.totalPages ?? pages.length
        const items = pages.map((p, index) => {
          const width = Math.min(720, p.width)
          const height = Math.round(width * (p.height / p.width))
          const it = { dataURL: p.dataURL, mimeType: "image/png", width, height, x: 160, y }
          y += height + 24
          journalRef.current?.recordPdfPageView(p.page ?? index + 1, totalPages, {
            documentId: p.documentId,
            documentName: p.documentName,
          })
          return it
        })
        addImages(items)
      } else if (file.type.startsWith("image/")) {
        const { dataURL, width, height } = await imageToDataURL(file)
        const w = Math.min(600, width)
        const h = Math.round(w * (height / width))
        addImages([{ dataURL, mimeType: file.type, width: w, height: h, x: 160, y: 120 }])
      }
    } catch (err) {
      setStorageError("Caricamento non riuscito: " + (err as Error).message)
    }
  }

  function insertSimulationPlugin(experimentId?: string) {
    if (!apiRef.current) {
      setStorageError("Lavagna non pronta: riprova tra un istante.")
      return
    }

    // P0-C multi-istanza: ogni click = un NUOVO post-it del Simulation Plugin,
    // con embedId unico e stato proprio (la prima istanza tiene l'id storico).
    // Il tool arriva dal registry (deny-by-default), non da id/factory hard-codati.
    const currentElements = apiRef.current.getSceneElements()
    const insert = buildSimulationInsert(
      currentElements as readonly { id?: string }[],
      experimentId,
    )
    if (!insert) {
      setStorageError("Simulation Plugin non disponibile.")
      return
    }

    apiRef.current.updateScene({
      elements: [...currentElements, insert.embed],
      appState: { selectedElementIds: { [insert.embedId]: true } },
    })
    apiRef.current.scrollToContent?.([insert.embed], { fitToContent: true })
  }
  if (lifecycleGate === "pending") {
    return (
      <div
        className="st-status st-lifecycle-loading"
        role="status"
        aria-live="polite"
      >
        <span className="st-quiet">caricamento…</span>
      </div>
    )
  }
  if (lifecycleGate === "failed") {
    return (
      <div className="st-status st-lifecycle-failed">
        <span className="st-err st-lifecycle-error" role="alert">
          <IconAlert /> {lifecycleError ?? "Coordinamento lezione non disponibile."}
        </span>
      </div>
    )
  }
  return recapView ? (
    <RecapView store={actualStore} room={room} />
  ) : replayView ? (
    <ReplayView store={actualStore} room={room} />
  ) : (
    <div className="st-studio-shell" data-ink-room={collaboration?.roomId} style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      {studentView ? (
        /* Vista studente: solo wordmark + chip, niente bottoni docente */
        <header className="st-bar st-bar-student">
          <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
            <span className="st-word">Ardesia</span>
            <span className="st-bdot" aria-hidden />
            <span className="st-sub">studio</span>
          </div>
          {/* Il lifecycle gate evita il flash dell'id prima che scena e meta siano risolte. */}
          <span
            className="st-chip-student st-chip-lesson"
            title={lessonName ? `Lezione: ${lessonName}` : `Stanza: ${room}`}
          >
            {lessonName ?? room}
          </span>
          <span className="st-chip-student">stai guardando la lavagna</span>
        </header>
      ) : (
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>

        {/* Nome lezione: editabile inline con matitina hover */}
        {editingName ? (
          <input
            ref={renameInputRef}
            className="st-name-input"
            defaultValue={lessonName ?? room}
            onBlur={(e) => saveRename(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter") saveRename((e.target as HTMLInputElement).value)
              if (e.key === "Escape") setEditingName(false)
            }}
            autoFocus
          />
        ) : (
          <span
            className="st-name"
            role="button"
            tabIndex={0}
            aria-label={lessonName ? `Rinomina la lezione ${lessonName}` : "Assegna un nome a questa lezione"}
            title={lessonName ? `Rinomina: ${lessonName}` : `Assegna un nome a questa lezione (id: ${room})`}
            onClick={startRename}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startRename() }
            }}
          >
            <span className="st-name-text">{lessonName ?? room}</span>
            {!lessonName && <span className="st-name-prompt">dai un nome</span>}
          </span>
        )}

        <div className="st-status">
          {storeMode === "fsa"
            ? (
              <span className="st-indicator st-fsa" title="I tuoi dati vivono nella cartella che hai scelto">
                <span className="st-led" aria-hidden />
                salvato sul computer
              </span>
            )
            : (
              <span className="st-indicator st-local" title="Senza cartella, i dati restano solo in questo browser">
                <span className="st-led" aria-hidden />
                solo in questo browser
                {" — "}
                <button onClick={handleConnectFolder} className="st-indicator-connect">
                  scegli cartella…
                </button>
              </span>
            )}
          {saved && <span className="st-quiet">salvato</span>}
          {/* Spec #35 §4.3: la durabilità vera è l'export — consiglio sobrio, mai vocabolario OPFS */}
          {exportAdvice && (
            <span className="st-quiet st-export-advice" title={exportAdvice}>da esportare a fine lezione</span>
          )}
          {storageError && <span className="st-err" title={storageError}><IconAlert /> {storageError}</span>}
        </div>

        {/* Hamburger menu mobile (visibile solo <=768px via CSS) */}
        <button
          className={`st-menu-btn${menuOpen ? " st-on" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`st-actions${menuOpen ? " st-actions-open" : ""}`}>
          {/* Founder Beta: tre sole superfici — Lezione, Continuità, Materiali. */}
          {!studentView && (
            <ViewNav
              current="lavagna"
              onNavigate={(href) => { void navigateToSurface(href) }}
            />
          )}
          {!studentView && <button type="button" className="st-ghost" aria-label="Apri raccolta della lezione" onClick={() => { apiRef.current?.toggleSidebar({ name: "default", tab: "library" }); setMenuOpen(false) }}>raccolta</button>}
          <button disabled={mathPending} onClick={() => { if (mathInsertPendingRef.current) return; setMathOn(v => !v); setMenuOpen(false) }} className={`st-ghost${mathOn ? " st-on" : ""}`}>formula</button>
          <button onClick={() => fileInputRef.current?.click()} className="st-ghost" aria-label="Inserisci immagine, PDF o .lesson">media</button>
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.lesson" style={{ display: "none" }} onChange={handleFile} />
          <button
            onClick={() => insertSimulationPlugin()}
            className="st-ghost"
            aria-label="Inserisci Simulation Plugin sulla lavagna"
            data-founder-plugin-id={FOUNDER_BETA_PLUGIN.id}
            data-plugin-version={FOUNDER_BETA_PLUGIN.version}
            data-plugin-trust-tier={FOUNDER_BETA_PLUGIN.trustTier}
          >
            sim
          </button>
          <button onClick={toggleDrawer} className={`st-ghost${drawerOpen ? " st-on" : ""}`}>
            lezioni
          </button>
        </div>
      </header>
      )}

      {!studentView && sessionAudio && <LessonPassageAuthor key={sessionAudio.identity.sessionId} recorder={sessionAudio} store={actualStore} onAnnotate={annotatePassage} selectedObjects={selectedObjects} onLinkSelection={linkSelectedPassage} onFit={fitBoardContent} onAddMoment={addLessonMoment} />}

      {/* Drawer lezioni */}
      {drawerOpen && (
        <div className="st-drawer-overlay" onClick={closeDrawer}>
          <div
            className="st-drawer"
            role="dialog"
            aria-label="Lezioni"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer() }}
          >
            <div className="st-drawer-header">
              <span className="st-drawer-title">Lezioni</span>
              <button ref={drawerCloseRef} className="st-ghost st-drawer-close" onClick={closeDrawer}>chiudi</button>
            </div>
            <div className="st-drawer-body">
              {loadingRooms ? (
                <span className="st-quiet">caricamento…</span>
              ) : rooms.length === 0 ? (
                <EmptyState
                  compact
                  title="Nessuna lezione salvata"
                  detail="Qui compaiono le lezioni man mano che le crei."
                  hint="Inizia a scrivere sulla lavagna: la lezione viene salvata in automatico."
                />
              ) : (
                rooms.map((r: any) => (
                  <div
                    key={r.room}
                    className={`st-card${r.room === room ? " st-card-current" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Apri la lezione ${r.name}`}
                    onClick={() => navigateToLesson(r.room)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToLesson(r.room) }
                    }}
                  >
                    <div className="st-card-line">
                      <span className="st-card-name">{r.name}</span>
                      {r.room === room && <span className="st-card-badge">attuale</span>}
                    </div>
                    <div className="st-card-meta">
                      {new Date(r.mtime).toLocaleDateString("it-IT", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {collaboration && collaboration.roomId === room && <Suspense fallback={<p role="status">Apertura layer…</p>}>
        <RoomCollaboration adapter={collaboration} api={collaborationApi} store={actualStore} />
      </Suspense>}
      {collaboration && collaboration.roomId !== room && <p role="alert">Il layer appartiene a un’altra lezione.</p>}
      <div className="st-studio-canvas" style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {studentView && !sceneData && (
          /* Vista studente senza scena salvata: spiega cosa vedrà e cosa fare intanto. */
          <div className="st-student-empty">
            <EmptyState
              title="La lavagna è ancora vuota"
              detail="Il docente non ha ancora condiviso appunti per questa lezione."
            />
          </div>
        )}
        {!(studentView && !sceneData) && (
          <Excalidraw
            langCode={EXCALIDRAW_CONFIG.langCode}
            theme={EXCALIDRAW_CONFIG.theme}
            aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
            viewModeEnabled={collaboration ? !collaborativeWriting : studentView}
            UIOptions={EXCALIDRAW_CONFIG.UIOptions}
            excalidrawAPI={(eapi) => {
              apiRef.current = eapi
              if (collaboration) setCollaborationApi(current => current === eapi ? current : eapi)
              if (typeof eapi.onPointerDown === "function") {
                const unsubDown = eapi.onPointerDown(() => {
                  journalRef.current?.recordPointerDown()
                  // Primo gesto reale sulla lavagna = momento giusto per persist()
                  // (spec #35 §4.1: chiara interazione utente; stand-in finché il
                  // bridge #34 non emette lesson.started). Una volta sola.
                  if (!persistRequestedRef.current) {
                    persistRequestedRef.current = true
                    ensurePersistentStorage()
                      .then((snapshot) => {
                        const runtime = lessonOsRef.current
                        if (runtime) lessonOsRef.current = { ...runtime, capabilities: snapshot }
                        // Esito persist() nel consiglio UX (§4.3): negato/fallito ⇒
                        // "da esportare". persistent viene dal runtime (lo store non
                        // cambia col gesto), non dalla mera presenza dell'API.
                        const { advice, reason } = deriveStorageAdvice(snapshot, runtime?.persistent ?? snapshot.indexedDb)
                        setExportAdvice(advice === "export-advised" ? reason : null)
                      })
                      .catch(() => {})
                  }
                })
                unsubsRef.current.push(unsubDown)
              }
              if (typeof eapi.onPointerUp === "function") {
                const unsubUp = eapi.onPointerUp(() => {
                  journalRef.current?.recordPointerUp()
                })
                unsubsRef.current.push(unsubUp)
              }
            }}
            initialData={
              // i default MAESTRO stanno SOTTO l'appState salvato: una scena
              // senza appState (import/export esterni) non perde Nunito/ink/canvas
              sceneData
                ? { ...sceneData, appState: { ...EXCALIDRAW_CONFIG.newRoomAppState, ...sceneData.appState } }
                : { appState: EXCALIDRAW_CONFIG.newRoomAppState, libraryItems: lessonLibrary.current.items }
            }
            // In vista studente la lavagna è sola-lettura: nessun persist/journal
            onLibraryChange={studentView ? undefined : (items) => {
              if (libraryGeneration.current !== lifecycleGeneration) return
              const owner = lessonLibrary.current
              const api = apiRef.current
              const stillCurrent = () => libraryGeneration.current === lifecycleGeneration && lessonLibrary.current === owner && apiRef.current === api
              try {
                owner.change(items)
                if (api) persist(latestElementsRef.current ?? api.getSceneElementsIncludingDeleted(), latestAppStateRef.current ?? api.getAppState(), latestFilesRef.current ?? api.getFiles())
              } catch (error) {
                setStorageError((error as Error).message)
                if (!owner.error && api) {
                  // Rebase repair on the latest SDK state: a valid queued edit
                  // must survive. Never suppress another operation's callback.
                  void api.updateLibrary({ libraryItems: (current: unknown) => {
                    if (!stillCurrent()) return current
                    try { return snapshotLibraryItems(current) } catch { return owner.items }
                  }, merge: false }).catch((failure: Error) => {
                    if (stillCurrent()) setStorageError(failure.message)
                  })
                }
              }
            }}
            onChange={studentView && !collaborativeWriting ? undefined : handleChange}
            validateEmbeddable={/^maestro-tool:\/\//}
            // Host per i tool embed (slice 4): write-back dei piazzamenti nello
            // state dell'embed → la persistenza segue quella della scena. In
            // vista studente niente write-back (lavagna read-only, stato di
            // sessione soltanto).
            renderEmbeddable={(element: Parameters<typeof renderToolCanvasEmbeddable>[0]) =>
              renderToolCanvasEmbeddable(
                element,
                studentView
                  ? undefined
                  : {
                      persistEmbedState: (embedId, state, toolId) => {
                        if (apiRef.current) {
                          void persistRoomEmbedStateThroughToolHost(
                            apiRef.current,
                            actualStore,
                            embedId,
                            state,
                            toolId,
                            setStorageError,
                          )
                        }
                      },
                      emitLessonEvent: (event) => {
                        // host-observes-solve: accoda l'evento del Simulation
                        // Plugin nel log LessonOS (fail-soft; nessuna chiave client).
                        lessonOsRef.current?.store?.append(event).catch(() => {})
                      },
                    },
              )
            }
          >
            {/* MainMenu custom: SOLO ClearCanvas + SaveAsImage — zero Socials/link/Dark-mode */}
            <MainMenu>
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.DefaultItems.SaveAsImage />
            </MainMenu>
            <WelcomeScreen>
              <WelcomeScreen.Center>
                <div className="st-brand st-welcome-brand">
                  <span className="st-word">Ardesia</span>
                  <span className="st-bdot" aria-hidden />
                  <span className="st-sub">studio</span>
                </div>
                <WelcomeScreen.Center.Heading>
                  <span className="st-welcome-heading">La lavagna che ricorda la tua lezione</span>
                </WelcomeScreen.Center.Heading>
                <div className="st-welcome-guide">
                  <p>Tutto quello che scrivi si salva da solo, qui sul tuo computer.</p>
                  <p>Per le formule premi «formula», per slide e immagini «media».</p>
                  <p>Il simulatore integrato è l'unico plugin disponibile in questa beta.</p>
                </div>
              </WelcomeScreen.Center>
              <WelcomeScreen.Hints.ToolbarHint>
                <p className="st-welcome-hint">Scegli una penna e inizia</p>
              </WelcomeScreen.Hints.ToolbarHint>
            </WelcomeScreen>
          </Excalidraw>
        )}
        {mathOn && <Suspense fallback={<p role="status">Apro l’editor delle formule…</p>}>
          <MathComposer onClose={() => setMathOn(false)} onInsert={insertMath} />
        </Suspense>}
      </div>
    </div>
  )
}
