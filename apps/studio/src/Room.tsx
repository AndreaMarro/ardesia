import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type KeyboardEvent } from "react"
import { Excalidraw, MainMenu, WelcomeScreen, convertToExcalidrawElements, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import MathComposer from "./MathComposer"
import { latexToImage } from "./latexToImage"
import { lessonSlug } from "./lessonSlug"
import { imageToDataURL, pdfToImages } from "./loadFile"
import { workspaceStore, type WorkspaceStore } from "./store/WorkspaceStore"
import { PATHS, type StorageMode } from "./store/types"
import { LESSON_EXTENSION } from "./store/lessonBundle"
import { JournalRecorder } from "./store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "./store/ReplayEngine"
import { IconAlert, IconCheck, IconDownload, IconFunction, IconImage, IconLink, IconMic } from "./design/icons"
import StudioShell from "./design/StudioShell"
import { AudioRecorder } from "./store/AudioRecorder"
import { isStudentView } from "./store/studentView"
import { bootstrapLessonOs, type LessonOsRuntime } from "./lessonos/bootstrap"
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
import { buildArduinoToolchainInsert, buildElabTutorLinkedInsert, buildSimulationInsert, isToolCanvasEmbed, normalizeDuplicatedToolEmbeds, renderToolCanvasEmbeddable } from "./toolhost/ToolCanvasEmbeddable"
import { persistRoomEmbedStateThroughToolHost } from "./toolhost/roomWriteBack"

// Room id nello hash dell'URL: il link che mandi allo studente apre la STESSA stanza video.
function getRoomId(): string {
  let h = location.hash.replace(/^#/, "").trim()
  if (!h) {
    h = "wbstudio-" + Math.random().toString(36).slice(2, 9)
    location.hash = h
  }
  return h
}

function focusedElementId(): string | null {
  try {
    const requested = new URL(window.location.href).searchParams.get("focus")
    return requested?.trim() || null
  } catch {
    return null
  }
}

function hasInitialCreationIntent(): boolean {
  try {
    return new URL(window.location.href).searchParams.get("crea") === "1"
  } catch {
    return false
  }
}

/** Clock condiviso tra JournalRecorder e AudioRecorder (stesso epoch) */
function sharedClock(): number {
  return Date.now()
}

function isLessonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(LESSON_EXTENSION)
}

function boardStateFromElements(elements: unknown): "empty" | "populated" {
  if (!Array.isArray(elements)) return "empty"
  return elements.some((element) => {
    return typeof element === "object" && element !== null && (element as { isDeleted?: boolean }).isDeleted !== true
  }) ? "populated" : "empty"
}

export default function Room({ store }: { store?: WorkspaceStore }) {
  const actualStore = store ?? workspaceStore
  const [room] = useState(getRoomId)
  // Snapshot a mount: la decisione vista studente/docente NON cambia tra render
  // (recorder creati una volta sola nell'effect — UI e storage devono restare coerenti)
  const studentView = useMemo(() => isStudentView(), [])
  const recapView = useMemo(() => isRecapView(), [])
  const replayView = useMemo(() => isReplayView(), [])
  const [mathOn, setMathOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [storeMode, setStoreMode] = useState<StorageMode>("localStorage")
  /** Audio toggle: default OFF (GDPR by design — nessuna registrazione nascosta) */
  const [audioOn, setAudioOn] = useState(false)
  /** Mostra stato registrazione nell'header */
  const [audioRecording, setAudioRecording] = useState(false)
  /** Launcher unico per note, media, plugin e comandi della lezione. */
  const [launcherOpen, setLauncherOpen] = useState(hasInitialCreationIntent)
  const [launcherQuery, setLauncherQuery] = useState("")
  const [radialOpen, setRadialOpen] = useState(false)
  const [boardState, setBoardState] = useState<"empty" | "populated">("empty")
  const launcherButtonRef = useRef<HTMLButtonElement>(null)
  /** Stato export .lesson */
  const [exporting, setExporting] = useState(false)
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

  const apiRef = useRef<any>(null)
  const focusedElementRef = useRef<string | null>(null)
  const saveTimer = useRef<number | null>(null)
  // Flag per evitare che persist() richiami saveScene durante il caricamento iniziale
  const initialLoadDone = useRef(false)
  // Riferimento al JournalRecorder (creato dopo init store)
  const journalRef = useRef<JournalRecorder | null>(null)
  // Riferimento all'AudioRecorder (creato dopo init store)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  // Unsubscribe handle per pointer events Excalidraw
  const unsubsRef = useRef<Array<() => void>>([])
  // Runtime LessonOS: event-log persistente + capability snapshot (spec #35 §4)
  const lessonOsRef = useRef<LessonOsRuntime | null>(null)
  // persist() va chiesto UNA volta, su chiara interazione utente (spec #35 §4.1)
  const persistRequestedRef = useRef(false)
  // Promise-chain mutex per serializzare salvataggi async sovrapposti
  const _pendingSave = useRef<Promise<void>>(Promise.resolve())
  // Promise-chain mutex per la promozione bridge: due promote sovrapposti
  // leggerebbero lo stesso cursore e duplicherebbero i material.cited
  const _pendingPromote = useRef<Promise<void>>(Promise.resolve())

  // All'avvio, inizializza lo store e carica la scena dal driver attivo (localStorage).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    actualStore.init()
      .then(() => {
        if (cancelled) return
        setStoreMode(actualStore.mode)

        // In vista studente/recap/replay: niente JournalRecorder né AudioRecorder (sola lettura).
        if (!studentView && !recapView && !replayView) {
          const clock = sharedClock

          // Crea JournalRecorder dopo init store con clock condiviso
          const jr = new JournalRecorder(actualStore, clock)
          journalRef.current = jr

          // Crea AudioRecorder con clock condiviso
          const ar = new AudioRecorder({
            store: actualStore,
            clock,
            onChunk: (chunkIndex, startEpoch, endEpoch) => {
              jr.recordAudioChunk(chunkIndex, startEpoch, endEpoch)
            },
          })
          audioRecorderRef.current = ar

          // LessonOS: event-log persistente + preflight storage (spec #35 §4).
          // Fire-and-forget: mai bloccare l'avvio lezione sull'esito.
          bootstrapLessonOs()
            .then((runtime) => {
              if (cancelled) return
              lessonOsRef.current = runtime
              const startedAt = clock()
              runtime.store.append({
                kind: "lesson.started",
                room,
                t: startedAt,
                evidence: [`lesson:${room}@${startedAt}`],
              }).catch(() => {})
              // Telemetria di perdita (§4.4): MAI silenziosa, linguaggio docente.
              if (runtime.dataLoss) {
                setStorageError("Memoria della lezione non trovata: ripristina dall'export .lesson")
              } else if (runtime.corrupted) {
                setStorageError("Memoria della lezione danneggiata: ripristina da un export .lesson")
              }
              // runtime.persistent = lo store persiste DAVVERO (non il fallback
              // InMemory): l'advice deve dire "da esportare" anche se l'API c'era.
              const { advice, reason } = deriveStorageAdvice(runtime.capabilities, runtime.persistent)
              if (advice === "export-advised") setExportAdvice(reason)
            })
            .catch(() => {})
        }

        return actualStore.loadScene(room)
      })
      .then((data) => {
        if (cancelled) return
        if (data) {
          try {
            const parsed = JSON.parse(data)
            // valori JSON falsy ("" / 0 / false) o non-oggetto = scena corrotta: parti da zero
            if (!parsed || typeof parsed !== "object") throw new Error("scena non valida")
            setSceneData(parsed)
            setBoardState(boardStateFromElements(parsed.elements))
            // Seed journal con elementi esistenti: NON registrarli come element.add
            const jr = journalRef.current
            if (jr && parsed?.elements) {
              jr.seed(parsed.elements)
            }
          } catch {
            // JSON malformato — si parte da zero
          }
        }
      })
      // Il nome lezione serve all'header docente E alla chip stanza in vista studente.
      // Meta illeggibile = non fatale: fallback all'id, MAI "Caricamento scena fallito" fuorviante.
      .then(() => actualStore.loadMeta(room).catch(() => null))
      .then((meta) => {
        if (cancelled) return
        if (meta && meta.name) {
          setLessonName(meta.name)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStorageError("Caricamento scena fallito: " + (err as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          initialLoadDone.current = true
          setLoading(false)
          // Esponi test harness per Playwright kill-test (solo dev)
          if (import.meta.env.DEV) {
            ;(window as any).__MAESTRO_TEST__ = {
              ready: true,
              room,
              store: actualStore,
              recorder: journalRef.current,
              audioRecorder: audioRecorderRef.current,
              lessonOs: lessonOsRef,
              apiRef,
              ReplayEngine,
              serializeEvents,
              deserializeEvents,
              AudioRecorder,
              PATHS: { JOURNAL: "raw/events.jsonl", SCENE: "raw/board.excalidraw" },
              navigateToLesson,
              flushPersist,
              promoteJournalToLessonOs,
            }
          }
        }
      })
    return () => {
      cancelled = true
      // Pulisci il debounce timer persist() se ancora in sospeso
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
      // Flush journal rimanente e dispose AudioRecorder
      journalRef.current?.flush().catch(() => {})
      audioRecorderRef.current?.dispose()
      journalRef.current = null
      audioRecorderRef.current = null
      // Chiudi il backend persistente LessonOS (open() è idempotente al prossimo mount)
      const lessonOsStore = lessonOsRef.current?.store
      lessonOsRef.current = null
      if (lessonOsStore && "close" in lessonOsStore) {
        const endedAt = sharedClock()
        lessonOsStore.append({
          kind: "lesson.ended",
          room,
          t: endedAt,
          evidence: [`lesson:${room}@${endedAt}`],
        }).catch(() => {}).finally(() => {
          ;(lessonOsStore as { close(): Promise<void> }).close().catch(() => {})
        })
      } else if (lessonOsStore) {
        const endedAt = sharedClock()
        lessonOsStore.append({
          kind: "lesson.ended",
          room,
          t: endedAt,
          evidence: [`lesson:${room}@${endedAt}`],
        }).catch(() => {})
      }
      // Pulisci tutte le subscription Excalidraw (onPointerDown/onPointerUp)
      for (const unsub of unsubsRef.current) {
        unsub()
      }
      unsubsRef.current = []
    }
  }, [room, actualStore])

  /** document.title: rec ← "● REC — Ardesia · studio", altrimenti "Ardesia · studio" */
  useEffect(() => {
    document.title = audioRecording ? "● REC — Ardesia · studio" : "Ardesia · studio"
  }, [audioRecording])

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
      _doSave()
    }, 700)
  }

  /** Esegue il salvataggio con i dati più recenti (dal debounce o da flush) */
  async function _doSave() {
    const elements = latestElementsRef.current
    const appState = latestAppStateRef.current
    const files = latestFilesRef.current
    if (!elements) return
    _pendingSave.current = _pendingSave.current.then(async () => {
      try {
        const serialized = serializeAsJSON(elements, appState, files, "local")
        await actualStore.saveScene(room, serialized)
        setStorageError(null)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1200)
      } catch (err) {
        setStorageError("Salvataggio non riuscito: " + (err as Error).message)
      }
    })
    await _pendingSave.current
  }

  /** Flush immediato: cancella il debounce e salva subito. Attende il completamento. */
  async function flushPersist() {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    await _doSave()
  }

  /** Handler composito: salva scena + registra eventi journal */
  function handleChange(elements: any, appState: any, files: any) {
    // P0-C residuo: un duplicato dal canvas (copy/paste/Alt-drag) clona il
    // link → id ≠ embedId e il duplicato scriverebbe sullo stato dell'
    // ORIGINALE. La normalizzazione lo promuove a NUOVA istanza (idempotente:
    // al giro dopo changed=false, nessun loop di updateScene).
    const normalized = normalizeDuplicatedToolEmbeds(elements as readonly { id?: string }[])
    if (normalized.changed && apiRef.current) {
      setBoardState(boardStateFromElements(normalized.elements))
      apiRef.current.updateScene({ elements: normalized.elements })
      return
    }
    setBoardState(boardStateFromElements(elements))
    persist(elements, appState, files)
    if (!initialLoadDone.current) return
    journalRef.current?.recordChange(elements)
  }

  /** Chiude il drawer e restituisce il focus al controllo che l'ha aperto (WCAG 2.4.3) */
  function closeDrawer() {
    setDrawerOpen(false)
    drawerReturnRef.current?.focus?.()
  }

  /** Apre/chiude il drawer delle lezioni */
  async function toggleDrawer(returnTarget?: HTMLElement | null) {
    if (drawerOpen) {
      closeDrawer()
      return
    }
    // Ricorda chi ha aperto il dialog per ripristinare il focus alla chiusura
    drawerReturnRef.current = returnTarget ?? (document.activeElement as HTMLElement) ?? null
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
    // Flush prima di navigare: zero tratti persi
    await flushPersist()
    // Cambia hash — guidare re-init via room state
    location.hash = targetRoom
    setDrawerOpen(false)
    // Forza un re-mount pulito del componente
    window.location.reload()
  }

  /** Toggle audio: ON = chiede consenso + avvia registrazione, OFF = ferma */
  function toggleAudio() {
    const ar = audioRecorderRef.current
    if (!ar) return
    if (ar.consent) {
      // Spegni: la revoca CANCELLA i chunk (GDPR) — a fine purge aggiorna lo stato
      ar.consent = false
      setAudioOn(false)
      setAudioRecording(false)
      ar.lastRevoke
        .catch((err) => {
          setStorageError("Revoca dati audio fallita: " + (err as Error).message)
        })
    } else {
      // Accendi
      ar.consent = true
      setAudioOn(true)
      ar.start().then(() => {
        setAudioRecording(ar.recording)
        // start() inghiotte il fallimento getUserMedia (azzera consent); se la
        // registrazione non parte resetta lo stato e — come ogni altra azione
        // async — segnala il microfono negato invece di spegnersi in silenzio.
        if (!ar.recording) {
          setAudioOn(false)
          if (!ar.consent) {
            setStorageError("Microfono non disponibile: consenti l'accesso per registrare.")
          }
        }
      })
    }
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
   * (cursore lastPromotedJournalT dentro appendJournalBridgeTail). Best-effort:
   * non deve mai bloccare l'export — il journal resta la fonte di verità.
   */
  async function promoteJournalToLessonOs(): Promise<void> {
    const run = _pendingPromote.current.then(async () => {
      const runtime = lessonOsRef.current
      if (!runtime) return
      try {
        // Flush del buffer journal: le viste PDF appena registrate devono essere
        // sul file PRIMA della lettura (stessa fonte dell'export, Room.read sotto).
        await journalRef.current?.flush()
        const blob = await actualStore.read(PATHS.JOURNAL)
        if (!blob) return
        const events = deserializeEvents(await blob.text())
        await appendJournalBridgeTail(runtime.store, events, {
          registry: defaultManualRegistry,
          room,
        })
      } catch {
        // promozione fallita: l'export prosegue col journal come verità
      }
    })
    _pendingPromote.current = run.then(
      () => {},
      () => {},
    )
    return run
  }

  /** Export .lesson: genera ZIP e avvia download */
  async function handleExportLesson() {
    setExporting(true)
    try {
      // Promuovi le citazioni manuale PRIMA dello snapshot event-log nel bundle:
      // l'export è il momento "fine lezione" (stand-in finché non esiste lesson.ended).
      await promoteJournalToLessonOs()
      // Include lo snapshot dell'event-log LessonOS nel bundle (spec #35 §4.3)
      const zipBlob = await actualStore.exportLesson(room, lessonOsRef.current?.store)
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      // Usa il nome lezione (slugificato) se disponibile, altrimenti room id
      a.download = `lezione-${lessonSlug(lessonName ?? "", room)}.lesson`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setStorageError("Export fallito: " + (err as Error).message)
    } finally {
      setExporting(false)
    }
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
    const nextElements = [...apiRef.current.getSceneElements(), ...els]
    setBoardState(boardStateFromElements(nextElements))
    apiRef.current.updateScene({ elements: nextElements })
  }

  async function insertMath(latex: string) {
    if (!apiRef.current || !latex.trim()) return
    try {
      const { dataURL, width, height } = await latexToImage(latex)
      addImages([{ dataURL, mimeType: "image/svg+xml", width, height, x: 160, y: 120 }])
      journalRef.current?.recordMathInsert(latex)
    } catch (err) {
      setStorageError("Inserimento formula non riuscito: " + (err as Error).message)
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
        // P32 R10: passa l'event-log LessonOS così il bundle può ripristinare la
        // memoria didattica. Restore SOLO su log vuoto (disaster-recovery); nella
        // Room live il log ha già lesson.started ⇒ esito atteso "skipped-non-empty".
        const importResult = await actualStore.importLessonBlobForRoom(
          file,
          room,
          lessonOsRef.current?.store,
        )
        const sceneJson = await actualStore.loadScene(room)
        if (!sceneJson) throw new Error("board.excalidraw non trovato nel bundle")
        const parsed = JSON.parse(sceneJson)
        if (!parsed || typeof parsed !== "object") throw new Error("scena non valida")
        const elements = Array.isArray(parsed.elements) ? parsed.elements : []
        const appState = { ...EXCALIDRAW_CONFIG.newRoomAppState, ...parsed.appState }
        const files = parsed.files ?? {}
        setSceneData(parsed)
        setBoardState(boardStateFromElements(elements))
        latestElementsRef.current = elements
        latestAppStateRef.current = appState
        latestFilesRef.current = files
        journalRef.current?.seed(elements)
        apiRef.current.updateScene({ elements, appState, files })
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

  function framePluginRow(elements: readonly any[]): void {
    const api = apiRef.current
    if (!api) return
    const pluginElements = elements.filter(isToolCanvasEmbed)
    if (pluginElements.length === 0) return
    const compactViewport = window.innerWidth <= 1024
    const leftGutter = window.innerWidth <= 768 ? 140 : 150
    const rightGutter = 16
    api.scrollToContent?.(pluginElements, {
      fitToContent: true,
      animate: false,
      viewportZoomFactor: 1,
      ...(compactViewport ? { canvasOffsets: { left: leftGutter, right: rightGutter, top: 58, bottom: 0 } } : {}),
    })
    // Excalidraw commits scrollToContent on its next render; apply the mobile
    // zoom cap afterwards so the fit pass cannot overwrite it.
    window.setTimeout(() => {
      if (apiRef.current !== api || typeof api.getAppState !== "function") return
      const appState = api.getAppState()
      const fittedZoom = typeof appState.zoom?.value === "number" ? appState.zoom.value : 1
      const maxCompactZoom = window.innerWidth <= 840 ? 0.64 : 0.8
      const zoom = compactViewport ? Math.min(fittedZoom, maxCompactZoom) : fittedZoom
      const minX = Math.min(...pluginElements.map((element) => Number(element.x) || 0))
      const maxX = Math.max(...pluginElements.map((element) => (Number(element.x) || 0) + (Number(element.width) || 0)))
      const minY = Math.min(...pluginElements.map((element) => Number(element.y) || 0))
      const viewportCenterX = compactViewport
        ? leftGutter + (window.innerWidth - leftGutter - rightGutter) / 2
        : window.innerWidth / 2
      api.updateScene({
        appState: {
          zoom: { value: zoom },
          scrollX: viewportCenterX / zoom - (minX + maxX) / 2,
          scrollY: 58 / zoom - minY,
        },
      })
    }, 120)
  }

  useEffect(() => {
    let frameTimer: number | null = null
    const frameResponsivePluginRow = () => {
      if (frameTimer !== null) window.clearTimeout(frameTimer)
      frameTimer = window.setTimeout(() => {
        const api = apiRef.current
        if (!api || typeof api.getSceneElements !== "function") return
        framePluginRow(api.getSceneElements())
      }, 0)
    }

    window.addEventListener("resize", frameResponsivePluginRow)
    frameResponsivePluginRow()
    return () => {
      window.removeEventListener("resize", frameResponsivePluginRow)
      if (frameTimer !== null) window.clearTimeout(frameTimer)
    }
  }, [sceneData])

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

    const nextElements = [...currentElements, insert.embed]
    setBoardState(boardStateFromElements(nextElements))
    apiRef.current.updateScene({
      elements: nextElements,
      appState: { selectedElementIds: {} },
    })
    window.setTimeout(() => {
      if (!apiRef.current) return
      latestElementsRef.current = apiRef.current.getSceneElements()
      latestAppStateRef.current = apiRef.current.getAppState()
      void flushPersist()
    }, 0)
    framePluginRow(nextElements)
  }

  function insertArduinoToolchainPlugin() {
    if (!apiRef.current) {
      setStorageError("Lavagna non pronta: riprova tra un istante.")
      return
    }

    const currentElements = apiRef.current.getSceneElements()
    const insert = buildArduinoToolchainInsert(currentElements as readonly { id?: string }[])
    if (!insert) {
      setStorageError("Arduino Toolchain non disponibile.")
      return
    }

    const nextElements = [...currentElements, insert.embed]
    setBoardState(boardStateFromElements(nextElements))
    apiRef.current.updateScene({
      elements: nextElements,
      appState: { selectedElementIds: {} },
    })
    window.setTimeout(() => {
      if (!apiRef.current) return
      latestElementsRef.current = apiRef.current.getSceneElements()
      latestAppStateRef.current = apiRef.current.getAppState()
      void flushPersist()
    }, 0)
    framePluginRow(nextElements)
  }

  function insertElabTutorPlugin() {
    if (!apiRef.current) {
      setStorageError("Lavagna non pronta: riprova tra un istante.")
      return
    }

    const currentElements = apiRef.current.getSceneElements()
    const insert = buildElabTutorLinkedInsert(currentElements as readonly { id?: string }[])
    if (!insert) {
      setStorageError("ElabTutor non disponibile.")
      return
    }

    const nextElements = [...currentElements, insert.embed]
    setBoardState(boardStateFromElements(nextElements))
    apiRef.current.updateScene({
      elements: nextElements,
      appState: { selectedElementIds: {} },
    })
    window.setTimeout(() => {
      if (!apiRef.current) return
      latestElementsRef.current = apiRef.current.getSceneElements()
      latestAppStateRef.current = apiRef.current.getAppState()
      void flushPersist()
    }, 0)
    framePluginRow(nextElements)
  }
  const shareUrl = studentView
    ? `${location.origin}${location.pathname}#${room}`
    : `${location.origin}${location.pathname}?vista=studente#${room}`

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      (err) => {
        setStorageError("Copia del link non riuscita: " + (err as Error).message)
      },
    )
  }

  function closeLauncher(): void {
    setLauncherOpen(false)
    setLauncherQuery("")
  }

  function startTextNote(): void {
    const api = apiRef.current
    if (!api) {
      setStorageError("Lavagna non pronta: riprova tra un istante.")
      return
    }
    api.setActiveTool?.({ type: "text" })
    closeLauncher()
  }

  const launcherItems = [
    { id: "note", group: "create", label: "Nota", detail: "Scrivi sulla lavagna", icon: null, action: startTextNote },
    { id: "media", group: "create", label: "Media", detail: "Aggiungi immagine o PDF", icon: <IconImage size={18} />, action: () => { fileInputRef.current?.click(); closeLauncher() } },
    { id: "formula", group: "create", label: "Formula", detail: "Inserisci una formula", icon: <IconFunction size={18} />, action: () => { setMathOn(true); closeLauncher() } },
    { id: "simulation", group: "activity", label: "Circuito LED", detail: "Apri un'attivita' di simulazione", icon: null, action: () => { insertSimulationPlugin(); closeLauncher() } },
    { id: "arduino", group: "activity", label: "Sketch Arduino", detail: "Scrivi e compila il codice", icon: null, action: () => { insertArduinoToolchainPlugin(); closeLauncher() } },
    { id: "tutor", group: "activity", label: "Guida ELAB", detail: "Segui i passaggi della lezione", icon: null, action: () => { insertElabTutorPlugin(); closeLauncher() } },
    { id: "lessons", group: "lesson", label: "Lezioni", detail: "Riapri una lavagna salvata", icon: null, action: () => { void toggleDrawer(launcherButtonRef.current); closeLauncher() } },
    { id: "audio", group: "lesson", label: audioOn ? "Ferma audio" : "Registra audio", detail: "Microfono del docente", icon: <IconMic size={18} />, action: () => { void toggleAudio(); closeLauncher() } },
    { id: "export", group: "lesson", label: exporting ? "Esportazione..." : "Esporta lezione", detail: "Salva una copia portatile", icon: <IconDownload size={18} />, action: () => { void handleExportLesson(); closeLauncher() } },
    ...(storeMode === "fsa" ? [] : [{ id: "folder", group: "lesson", label: "Scegli cartella", detail: "Salva sul computer", icon: null, action: () => { void handleConnectFolder(); closeLauncher() } }]),
  ]
  const normalizedLauncherQuery = launcherQuery.trim().toLocaleLowerCase("it")
  const visibleLauncherItems = launcherItems.filter((item) =>
    normalizedLauncherQuery.length === 0 || `${item.label} ${item.detail}`.toLocaleLowerCase("it").includes(normalizedLauncherQuery),
  )
  const launcherGroups = [
    { id: "create", label: "Crea", items: visibleLauncherItems.filter((item) => item.group === "create") },
    { id: "activity", label: "Attività", items: visibleLauncherItems.filter((item) => item.group === "activity") },
    { id: "lesson", label: "Lezione", items: visibleLauncherItems.filter((item) => item.group === "lesson") },
  ].filter((group) => group.items.length > 0)

  if (recapView) return <RecapView store={actualStore} room={room} />
  if (replayView) return <ReplayView store={actualStore} room={room} />

  const launcherControl = (
    <>
      <button
        type="button"
        ref={launcherButtonRef}
        className="st-shell-launcher"
        data-orbit-action="launcher"
        aria-label="Cerca e crea"
        aria-expanded={launcherOpen}
        aria-controls="ardesia-launcher"
        onClick={() => setLauncherOpen((open) => !open)}
      >
        <span aria-hidden>+</span>
      </button>
      {launcherOpen && (
        <section id="ardesia-launcher" role="dialog" aria-label="Cerca e crea" className="st-launcher-panel">
          <label className="st-launcher-search">
            <span>Cosa vuoi fare?</span>
            <input
              autoFocus
              type="search"
              value={launcherQuery}
              onChange={(event) => setLauncherQuery(event.currentTarget.value)}
              placeholder="Cerca nota, media, circuito..."
            />
          </label>
          <div className="st-launcher-groups">
            {launcherGroups.map((group) => (
              <section key={group.id} className={`st-launcher-group st-launcher-group-${group.id}`} aria-labelledby={`launcher-group-${group.id}`}>
                <h2 id={`launcher-group-${group.id}`}>{group.label}</h2>
                <div className="st-launcher-grid">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      aria-label={`${item.label}: ${item.detail}`}
                      className={`st-launcher-item st-launcher-item-${item.id}`}
                    >
                      {item.icon && <span className="st-launcher-item-icon">{item.icon}</span>}
                      <span className="st-launcher-item-copy">
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
          {visibleLauncherItems.length === 0 && <p className="st-launcher-empty">Nessun risultato. Prova con nota, media o plugin.</p>}
        </section>
      )}
    </>
  )

  const lessonNameControl = editingName ? (
    <input
      ref={renameInputRef}
      className="st-name-input"
      defaultValue={lessonName ?? ""}
      onBlur={(event) => saveRename(event.target.value)}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Enter") saveRename((event.target as HTMLInputElement).value)
        if (event.key === "Escape") setEditingName(false)
      }}
      autoFocus
    />
  ) : (
    <span
      className="st-name"
      role="button"
      tabIndex={0}
      aria-label={lessonName ? `Rinomina la lezione ${lessonName}` : "Dai un titolo alla lezione"}
      title={lessonName ? `Rinomina: ${lessonName}` : "Dai un titolo alla lezione"}
      onClick={startRename}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); startRename() }
      }}
    >
      <span className="st-name-text">{lessonName ?? "Lezione senza titolo"}</span>
    </span>
  )

  const shellActions = (
    <>
      {lessonNameControl}
      {storageError && <span className="st-err" title={storageError}><IconAlert /> {storageError}</span>}
      <span className="st-orbit-save" title={storeMode === "fsa" ? "Salvata sul computer" : exportAdvice ?? "Salvata in questo browser"}>
        <span className="st-led" aria-hidden />
        {loading ? "apro" : saved ? "salvata" : "salvataggio automatico"}
      </span>
      <button
        onClick={copyLink}
        className="st-orbit-share"
        data-orbit-action="share"
        aria-label="Condividi con la classe"
        title="Copia il link per lo studente"
      >
        {copied ? <><IconCheck size={18} /><span>copiato</span></> : <><IconLink size={18} /><span>condividi</span></>}
      </button>
    </>
  )

  const roomContent = (
    <div className="st-room-board" data-board-state={boardState}>
      {studentView ? (
        /* Vista studente: solo wordmark + chip, niente bottoni docente */
        <header className="st-bar st-bar-student">
          <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
            <span className="st-word">Ardesia</span>
            <span className="st-bdot" aria-hidden />
            <span className="st-sub">studio</span>
          </div>
          {/* Chip stanza dopo il load: evita il flash dell'id prima che arrivi il nome */}
          {!loading && (
            <span
              className="st-chip-student st-chip-lesson"
              title={lessonName ? `Lezione: ${lessonName}` : `Stanza: ${room}`}
            >
              {lessonName ?? room}
            </span>
          )}
          <span className="st-chip-student">stai guardando la lavagna</span>
        </header>
      ) : null}
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.lesson" style={{ display: "none" }} onChange={handleFile} />

      {/* RECSTRIP: striscia fissa 2px --m-rec sotto l'header quando registra */}
      {audioRecording && <div className="st-recstrip" data-rec-strip />}

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

      <div className="st-orbit-canvas" style={{ flex: 1, position: "relative" }}>
        {!loading && studentView && !sceneData && (
          /* Vista studente senza scena salvata: spiega cosa vedrà e cosa fare intanto. */
          <div className="st-student-empty">
            <EmptyState
              title="La lavagna è ancora vuota"
              detail="Il docente non ha ancora condiviso appunti per questa lezione."
              hint="Segui la spiegazione in diretta su Meet: appena scrive, la lavagna compare qui."
            />
          </div>
        )}
        {!loading && !(studentView && !sceneData) && (
          <Excalidraw
            langCode={EXCALIDRAW_CONFIG.langCode}
            theme={EXCALIDRAW_CONFIG.theme}
            aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
            viewModeEnabled={studentView}
            UIOptions={EXCALIDRAW_CONFIG.UIOptions}
            excalidrawAPI={(eapi) => {
              apiRef.current = eapi
              window.setTimeout(() => {
                if (apiRef.current !== eapi) return
                framePluginRow(eapi.getSceneElements())
              }, 0)
              const targetId = focusedElementId()
              if (targetId !== null && focusedElementRef.current !== targetId) {
                // L'API arriva prima che Excalidraw completi il primo layout:
                // il focus al ciclo successivo evita un viewport calcolato vuoto.
                window.setTimeout(() => {
                  if (apiRef.current !== eapi || focusedElementRef.current === targetId) return
                  const target = eapi.getSceneElements().find((element: { id?: string }) => element.id === targetId)
                  if (!target) return
                  focusedElementRef.current = targetId
                  eapi.updateScene({ appState: { selectedElementIds: { [targetId]: true } } })
                  eapi.scrollToContent?.([target], { fitToContent: false, animate: false })
                }, 0)
              }
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
                : { appState: EXCALIDRAW_CONFIG.newRoomAppState }
            }
            // In vista studente la lavagna è sola-lettura: nessun persist/journal
            onChange={studentView ? undefined : handleChange}
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
                          const api = apiRef.current
                          void (async () => {
                            await persistRoomEmbedStateThroughToolHost(
                              api,
                              actualStore,
                              embedId,
                              state,
                              toolId,
                              setStorageError,
                            )
                            if (apiRef.current !== api) return
                            latestElementsRef.current = api.getSceneElements() as any
                            latestAppStateRef.current = api.getAppState()
                            await flushPersist()
                          })()
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
                  <p>Cosa vuoi portare in classe oggi?</p>
                  <p>Tutto quello che scrivi si salva da solo, qui sul tuo computer.</p>
                  <p>Il microfono parte solo quando scegli «Registra audio».</p>
                </div>
              </WelcomeScreen.Center>
              <WelcomeScreen.Hints.ToolbarHint>
                <p className="st-welcome-hint">Scegli una penna e inizia</p>
              </WelcomeScreen.Hints.ToolbarHint>
            </WelcomeScreen>
          </Excalidraw>
        )}
        {mathOn && <MathComposer onClose={() => setMathOn(false)} onInsert={insertMath} />}
      </div>
      {!studentView && (
        <div
          className="st-radial-tools"
          data-radial-tools
          data-motion-state={radialOpen ? "open" : "settled"}
        >
          <button
            type="button"
            className="st-radial-trigger"
            aria-label={radialOpen ? "Chiudi strumenti" : "Apri strumenti"}
            aria-expanded={radialOpen}
            onClick={() => setRadialOpen((open) => !open)}
          >
            <span aria-hidden>{radialOpen ? "×" : "+"}</span>
          </button>
          {radialOpen && (
            <div className="st-radial-tool-items">
              <button
                type="button"
                className="st-radial-tool"
                data-radial-tool="select"
                aria-label="Seleziona"
                onClick={() => {
                  apiRef.current?.setActiveTool?.({ type: "selection" })
                  setRadialOpen(false)
                }}
              >
                <span aria-hidden>↖</span>
              </button>
              <button
                type="button"
                className="st-radial-tool"
                data-radial-tool="pen"
                aria-label="Penna"
                onClick={() => {
                  apiRef.current?.setActiveTool?.({ type: "freedraw" })
                  setRadialOpen(false)
                }}
              >
                <span aria-hidden>✎</span>
              </button>
              <button
                type="button"
                className="st-radial-tool"
                data-radial-tool="text"
                aria-label="Testo"
                onClick={() => {
                  startTextNote()
                  setRadialOpen(false)
                }}
              >
                <span aria-hidden>T</span>
              </button>
              <button
                type="button"
                className="st-radial-tool"
                data-radial-tool="media"
                aria-label="Media"
                onClick={() => {
                  fileInputRef.current?.click()
                  setRadialOpen(false)
                }}
              >
                <IconImage size={20} />
              </button>
              <button
                type="button"
                className="st-radial-tool"
                data-radial-tool="plugin"
                aria-label="Aggiungi plugin"
                onClick={() => {
                  setLauncherOpen(true)
                  setRadialOpen(false)
                }}
              >
                <span aria-hidden>+</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="st-board-annotation-anchor" data-annotation-layer-anchor aria-hidden />
    </div>
  )

  if (studentView) return roomContent
  return (
    <StudioShell
      current="lavagna"
      searchLabel="Cerca e crea: nota, media o plugin..."
      launcher={launcherControl}
      actions={shellActions}
    >
      {roomContent}
    </StudioShell>
  )
}
