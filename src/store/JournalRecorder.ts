// MAESTRO-Studio — JournalRecorder
// Registra eventi della lavagna in events.jsonl (JSONL append-only tramite buffer+flush).
// Usa id-set diff per add/delete e version per update. Non registra move/restyle
// (Excalidraw non bumpa version per coordinate-only changes).
//
// Eventi: element.add, element.update, element.delete, t0/t1 (pointer),
//         math.insert, pdf.page.view

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"

// --- Tipi evento journal ---

export interface JournalElementAdd {
  type: "element.add"
  element: Record<string, unknown>
}

export interface JournalElementUpdate {
  type: "element.update"
  element: Record<string, unknown>
}

export interface JournalElementDelete {
  type: "element.delete"
  elementId: string
}

export interface JournalT0 {
  type: "t0"
}

export interface JournalT1 {
  type: "t1"
}

export interface JournalMathInsert {
  type: "math.insert"
  latex: string
}

export interface JournalPdfPageView {
  type: "pdf.page.view"
  /** 1-based page number */
  page: number
  totalPages: number
}

export type JournalEventBody =
  | JournalElementAdd
  | JournalElementUpdate
  | JournalElementDelete
  | JournalT0
  | JournalT1
  | JournalMathInsert
  | JournalPdfPageView

export type JournalEvent = JournalEventBody & {
  /** Timestamp epoch ms */
  t: number
}

/**
 * JournalRecorder: cattura eventi Excalidraw e li serializza in events.jsonl.
 *
 * Strategy:
 * - Buffer in memoria per batching (flush ogni 500ms o a chiamata esplicita).
 * - Re-write completo del file a ogni flush (driver Workspace non supporta append).
 * - Clock iniettato (`now`) per testabilità deterministica.
 * - Id-set diff per add/delete (non basta version: elementi cancellati spariscono
 *   dal set onChange e non hanno più version da confrontare).
 */
export class JournalRecorder {
  private store: WorkspaceStore
  private buffer: JournalEvent[] = []
  /** id → version degli elementi visti nell'ultimo onChange */
  private prevElements: Map<string, number> = new Map()
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private now: () => number
  /** Stato pointer: true = t0 emesso, in attesa di t1 */
  private _pointerDown: boolean = false

  constructor(store: WorkspaceStore, now?: () => number) {
    this.store = store
    this.now = now ?? (() => Date.now())
  }

  /**
   * Seeding: inizializza prevElements con lo stato corrente SENZA registrare eventi.
   * Chiamato al mount con la scena caricata da storage per evitare falsi element.add.
   */
  seed(elements: readonly Record<string, unknown>[]): void {
    this.prevElements.clear()
    for (const el of elements) {
      this.prevElements.set(el.id as string, (el.version as number) ?? 0)
    }
  }

  /**
   * Chiamato da Excalidraw onChange (elements = scene elements correnti,
   * escluse le cancellate). Rileva add/update/delete via id-set diff + version.
   */
  recordChange(elements: readonly Record<string, unknown>[]): void {
    const t = this.now()
    const currentIds = new Set<string>()

    for (const el of elements) {
      const id = el.id as string
      currentIds.add(id)
      const version = (el.version as number) ?? 0
      const isDeleted = (el.isDeleted as boolean) ?? false
      const prevVersion = this.prevElements.get(id)

      if (prevVersion === undefined && !isDeleted) {
        // Nuovo elemento
        this.buffer.push({ t, type: "element.add", element: structuredClone(el) })
      } else if (prevVersion !== undefined && isDeleted) {
        // Elemento cancellato (isDeleted flag)
        this.buffer.push({ t, type: "element.delete", elementId: id })
        this.prevElements.delete(id)
        continue
      } else if (prevVersion !== undefined && version > prevVersion && !isDeleted) {
        // Aggiornamento strutturale (non move/restyle)
        this.buffer.push({ t, type: "element.update", element: structuredClone(el) })
      }

      this.prevElements.set(id, version)
    }

    // Rileva cancellazioni per sparizione (elemento non più nel set onChange)
    for (const [id] of this.prevElements) {
      if (!currentIds.has(id)) {
        this.buffer.push({ t, type: "element.delete", elementId: id })
      }
    }
    // Pulisci le sparite dal tracker
    for (const id of this.prevElements.keys()) {
      if (!currentIds.has(id)) {
        this.prevElements.delete(id)
      }
    }

    this.scheduleFlush()
  }

  /** t0 = pointer down (inizio tratto) */
  recordPointerDown(): void {
    if (this._pointerDown) return
    this._pointerDown = true
    this.buffer.push({ t: this.now(), type: "t0" })
    this.scheduleFlush()
  }

  /** t1 = pointer up (fine tratto) */
  recordPointerUp(): void {
    if (!this._pointerDown) return
    this._pointerDown = false
    this.buffer.push({ t: this.now(), type: "t1" })
    this.scheduleFlush()
  }

  /** Inserimento formula LaTeX */
  recordMathInsert(latex: string): void {
    this.buffer.push({ t: this.now(), type: "math.insert", latex })
    this.scheduleFlush()
  }

  /** Cambio pagina PDF visualizzata */
  recordPdfPageView(page: number, totalPages: number): void {
    this.buffer.push({ t: this.now(), type: "pdf.page.view", page, totalPages })
    this.scheduleFlush()
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) return
    this.flushTimer = setTimeout(() => this.flush(), 500)
  }

  /** Promise chain per serializzare flush concorrenti (timer + cleanup su unmount) */
  private _pendingFlush: Promise<void> = Promise.resolve()

  /**
   * Flush buffer su store: legge events.jsonl esistente, concatena, riscrive.
   * Serializzato via promise chain per evitare race tra timer e flush esplicito.
   */
  async flush(): Promise<void> {
    this._pendingFlush = this._pendingFlush.then(async () => {
      if (this.flushTimer !== null) {
        clearTimeout(this.flushTimer)
        this.flushTimer = null
      }
      if (this.buffer.length === 0) return

      const batch = this.buffer.splice(0)
      const newLines = batch.map((e) => JSON.stringify(e)).join("\n") + "\n"

      const existing = await this.store.read(PATHS.JOURNAL)
      let content = ""
      if (existing) {
        const text = await existing.text()
        if (text.trim()) {
          content = text.replace(/\n$/, "") + "\n"
        }
      }
      content += newLines
      await this.store.write(
        PATHS.JOURNAL,
        new Blob([content], { type: "application/x-ndjson" }),
      )
    })
    return this._pendingFlush
  }

  /** Esposto per test: buffer corrente non ancora flushato */
  getBuffer(): JournalEvent[] {
    return this.buffer
  }

  /** Esposto per test: stato pointerDown interno */
  get pointerDown(): boolean {
    return this._pointerDown
  }
}
