// TOOLHOST-SPEC-v0 §2 capability board.* — adapter sull'API Excalidraw via
// interfaccia STRUTTURALE (stesso shape di apiRef in Room.tsx), testabile senza
// Excalidraw. Un embed è un elemento con customData[EMBED_DATA_KEY] = { owner,
// state }: l'ownership vive NELLA scena, quindi sopravvive a suspend/restore
// e a save/load del workspace insieme agli elementi.

export const EMBED_DATA_KEY = "maestroTool"

export interface BoardElementLike {
  id: string
  customData?: Record<string, unknown>
  [k: string]: unknown
}

export interface BoardApiLike {
  getSceneElements(): readonly BoardElementLike[]
  getAppState(): { selectedElementIds: Record<string, boolean> }
  updateScene(scene: { elements: BoardElementLike[] }): void
}

/** Owner di un elemento, se è un embed marcato; undefined per elementi normali. */
export function embedOwner(el: BoardElementLike): string | undefined {
  const marker = el.customData?.[EMBED_DATA_KEY]
  if (typeof marker !== "object" || marker === null) return undefined
  const owner = (marker as { owner?: unknown }).owner
  return typeof owner === "string" ? owner : undefined
}

/** Skeleton di default per un embed nuovo: l'integrazione reale (ToolFrame) può iniettarne uno suo. */
function defaultSkeleton(embedId: string): BoardElementLike {
  return { id: embedId, type: "embeddable", x: 120, y: 120, width: 320, height: 240 }
}

export class ToolBoard {
  private _api: BoardApiLike
  private _toolId: string
  private _makeSkeleton: (embedId: string) => BoardElementLike

  constructor(api: BoardApiLike, toolId: string, makeSkeleton?: (embedId: string) => BoardElementLike) {
    this._api = api
    this._toolId = toolId
    this._makeSkeleton = makeSkeleton ?? defaultSkeleton
  }

  /**
   * board.read: scena intera o sola selezione (forma wire BoardReadResult).
   * Invariante spec: la scena è CONDIVISA — anche lo state degli embed altrui è
   * leggibile da chi ha board.read; i segreti vanno nello storage, mai in scena.
   * I riferimenti vivi non escono dal processo: il broker postMessage fa
   * structured-clone alla frontiera dell'iframe.
   */
  read(target: "scene" | "selection"): { elements: unknown[] } {
    const elements = this._api.getSceneElements()
    if (target === "scene") return { elements: [...elements] }
    const selected = this._api.getAppState().selectedElementIds
    return { elements: elements.filter((el) => selected[el.id] === true) }
  }

  /**
   * Predicato own-embeds per il router: scrivibile SOLO un id libero (creazione)
   * o un embed già marcato come proprio. Un elemento esistente NON marcato
   * (es. disegno del docente) non è MAI scrivibile dal tool.
   */
  isOwnEmbed = (embedId: string): boolean => {
    const existing = this._api.getSceneElements().find((el) => el.id === embedId)
    if (existing === undefined) return true
    return embedOwner(existing) === this._toolId
  }

  /** board.write: crea o aggiorna il PROPRIO embed (forma wire BoardWriteResult). */
  write(embedId: string, state: unknown): Record<string, never> {
    const elements = this._api.getSceneElements()
    const existing = elements.find((el) => el.id === embedId)
    const marker = { [EMBED_DATA_KEY]: { owner: this._toolId, state } }

    if (existing === undefined) {
      const embed: BoardElementLike = { ...this._makeSkeleton(embedId), id: embedId, customData: marker }
      this._api.updateScene({ elements: [...elements, embed] })
      return {}
    }
    // difesa in profondità: il router fa già il gate via isOwnEmbed
    if (embedOwner(existing) !== this._toolId) {
      throw new Error(`embed ${embedId} not owned by ${this._toolId}`)
    }
    const next = elements.map((el) =>
      el.id === embedId ? { ...el, customData: { ...el.customData, ...marker } } : el,
    )
    this._api.updateScene({ elements: next })
    return {}
  }
}

/**
 * Write-back host-side dello state di un embed GIÀ marcato: l'owner arriva dal
 * marker in scena, mai dal chiamante. Elemento assente o non marcato (es.
 * disegno del docente) → no-op: l'host non trasforma mai un elemento normale
 * in embed di un tool.
 */
export function persistEmbedState(api: BoardApiLike, embedId: string, state: unknown): void {
  const existing = api.getSceneElements().find((el) => el.id === embedId)
  if (existing === undefined) return
  const owner = embedOwner(existing)
  if (owner === undefined) return
  new ToolBoard(api, owner).write(embedId, state)
}
