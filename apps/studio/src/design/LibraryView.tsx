import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { workspaceStore } from "../store/WorkspaceStore"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import EmptyState from "./EmptyState"
import StudioShell from "./StudioShell"
import { viewHref } from "./ViewNav"

export type LibraryAssetKind = "note" | "image" | "postit" | "arduino-artifact"

export interface LibraryAsset {
  id: string
  boardElementId: string
  kind: LibraryAssetKind
  title: string
  scope: string
  source: string
  tags: string[]
  updatedAt: number | null
  contentHash: string | null
  mimeType: string | null
  sizeBytes: number | null
}

export interface LibrarySnapshot {
  assets: LibraryAsset[]
  unavailableKinds: Array<"audio" | "pdf" | "transcript">
}

export interface LibraryViewDeps {
  room?: string
  loadScene?: (room: string) => Promise<string | null>
}

type RecordValue = Record<string, unknown>

const UNAVAILABLE_KINDS: LibrarySnapshot["unavailableKinds"] = ["audio", "pdf", "transcript"]

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function isLiveElement(element: RecordValue): boolean {
  return element.isDeleted !== true
}

function readablePluginName(kind: string | null, owner: string): string {
  if (kind === "arduino-toolchain-v1") return "Arduino Toolchain"
  if (kind === "elabtutor-linked-v1") return "ELABTutor"
  if (owner.includes("simulation")) return "Simulation"
  return "Plugin"
}

function sceneHashInput(value: unknown): string {
  return JSON.stringify(value)
}

async function sha256(value: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null
  const encoded = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded)
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`
}

async function createAsset(input: Omit<LibraryAsset, "contentHash"> & { hashInput: string }): Promise<LibraryAsset> {
  return {
    ...input,
    contentHash: await sha256(input.hashInput),
  }
}

function uniqueAssets(assets: readonly LibraryAsset[]): LibraryAsset[] {
  const seen = new Set<string>()
  return assets.filter((asset) => {
    // Un file immagine puo' comparire in piu' elementi Excalidraw, ma due
    // PluginInstance con lo stesso state sono comunque due post-it distinti.
    const key = asset.kind === "image" ? `image:${asset.contentHash ?? asset.id}` : `${asset.kind}:${asset.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function assetSort(a: LibraryAsset, b: LibraryAsset): number {
  const byTime = (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  return byTime !== 0 ? byTime : a.title.localeCompare(b.title, "it")
}

function toolMarker(element: RecordValue): { owner: string; state: RecordValue } | null {
  const customData = isRecord(element.customData) ? element.customData : null
  const marker = customData !== null && isRecord(customData[EMBED_DATA_KEY]) ? customData[EMBED_DATA_KEY] : null
  if (marker === null) return null
  const owner = stringValue(marker.owner)
  const state = isRecord(marker.state) ? marker.state : null
  return owner !== null && state !== null ? { owner, state } : null
}

function assetTitleForNote(text: string): string {
  const firstLine = text.split("\n")[0]?.trim() ?? ""
  return firstLine.length <= 48 ? firstLine : `${firstLine.slice(0, 45).trimEnd()}...`
}

function boardFocusHref(room: string, elementId: string): string {
  const hash = room.length > 0 ? `#${room}` : ""
  return `/?focus=${encodeURIComponent(elementId)}${hash}`
}

/**
 * Legge solo la scena della stanza corrente. Il journal legacy non contiene
 * ancora lo scope room: audio, PDF e transcript restano esplicitamente fuori.
 */
export async function buildLibrarySnapshot(sceneJson: string | null, room: string): Promise<LibrarySnapshot> {
  if (sceneJson === null || room.length === 0) return { assets: [], unavailableKinds: UNAVAILABLE_KINDS }

  let scene: RecordValue
  try {
    const parsed: unknown = JSON.parse(sceneJson)
    if (!isRecord(parsed)) return { assets: [], unavailableKinds: UNAVAILABLE_KINDS }
    scene = parsed
  } catch {
    return { assets: [], unavailableKinds: UNAVAILABLE_KINDS }
  }

  const elements = Array.isArray(scene.elements) ? scene.elements.filter(isRecord).filter(isLiveElement) : []
  const files = isRecord(scene.files) ? scene.files : {}
  const assets: LibraryAsset[] = []

  for (const element of elements) {
    const elementId = stringValue(element.id) ?? "scene-element"
    const updatedAt = numberValue(element.updated)
    const type = stringValue(element.type)

    if (type === "text") {
      const text = stringValue(element.text)
      if (text !== null) {
        assets.push(await createAsset({
          id: `note:${elementId}`,
          boardElementId: elementId,
          kind: "note",
          title: assetTitleForNote(text),
          scope: room,
          source: "scene:element",
          tags: ["note", "scene"],
          updatedAt,
          mimeType: "text/plain",
          sizeBytes: new TextEncoder().encode(text).byteLength,
          hashInput: text,
        }))
      }
    }

    if (type === "image") {
      const fileId = stringValue(element.fileId)
      const file = fileId === null ? null : files[fileId]
      const fileRecord = isRecord(file) ? file : null
      const dataUrl = fileRecord === null ? null : stringValue(fileRecord.dataURL)
      if (fileId !== null && fileRecord !== null && dataUrl !== null) {
        assets.push(await createAsset({
          id: `image:${fileId}`,
          boardElementId: elementId,
          kind: "image",
          title: "Schema immagine",
          scope: room,
          source: "scene:file",
          tags: ["image", "scene"],
          updatedAt,
          mimeType: stringValue(fileRecord.mimeType),
          sizeBytes: new TextEncoder().encode(dataUrl).byteLength,
          hashInput: dataUrl,
        }))
      }
    }

    const marker = toolMarker(element)
    if (marker === null) continue

    const kind = stringValue(marker.state.kind)
    const pluginName = readablePluginName(kind, marker.owner)
    assets.push(await createAsset({
      id: `postit:${elementId}`,
      boardElementId: elementId,
      kind: "postit",
      title: `${pluginName} post-it`,
      scope: room,
      source: `postit:${marker.owner}`,
      tags: ["plugin", "postit"],
      updatedAt,
      mimeType: "application/json",
      sizeBytes: new TextEncoder().encode(sceneHashInput(marker.state)).byteLength,
      hashInput: sceneHashInput(marker.state),
    }))

    if (kind !== "arduino-toolchain-v1") continue
    const artifact = isRecord(marker.state.artifact) ? marker.state.artifact : null
    const provider = artifact === null ? null : stringValue(artifact.provider)
    const artifactFormat = artifact === null ? null : stringValue(artifact.artifactFormat)
    const hexPreview = artifact === null ? null : stringValue(artifact.hexPreview)
    const sizeBytes = artifact === null ? null : numberValue(artifact.sizeBytes)
    const compiledAt = artifact === null ? null : numberValue(artifact.compiledAt)
    if (provider !== "browser-avr" || artifactFormat !== "intel-hex" || hexPreview === null || sizeBytes === null) continue

    assets.push(await createAsset({
      id: `arduino-artifact:${elementId}`,
      boardElementId: elementId,
      kind: "arduino-artifact",
      title: "Arduino compile",
      scope: room,
      source: "postit:arduino-toolchain",
      tags: ["arduino", "compile", "postit"],
      updatedAt: compiledAt ?? updatedAt,
      mimeType: "text/x-intel-hex",
      sizeBytes,
      hashInput: hexPreview,
    }))
  }

  return { assets: uniqueAssets(assets).sort(assetSort), unavailableKinds: UNAVAILABLE_KINDS }
}

async function loadSceneFromWorkspace(room: string): Promise<string | null> {
  if (workspaceStore.mode === "unavailable") await workspaceStore.init()
  return workspaceStore.loadScene(room)
}

function roomFromHash(): string {
  if (typeof window === "undefined") return ""
  return window.location.hash.replace(/^#/, "").trim()
}

type LibraryState =
  | { phase: "loading" }
  | { phase: "error"; detail: string }
  | { phase: "ready"; snapshot: LibrarySnapshot }

function typeLabel(kind: LibraryAssetKind): string {
  if (kind === "arduino-artifact") return "risorsa"
  if (kind === "postit") return "post-it"
  if (kind === "note") return "nota"
  return "immagine"
}

function formatTimestamp(value: number | null): string {
  if (value === null) return "orario non registrato"
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(value)
}

function formatBytes(value: number | null): string {
  if (value === null) return "dimensione non registrata"
  if (value < 1024) return `${value} B`
  return `${(value / 1024).toFixed(1)} KB`
}

type LibraryFilter = "all" | "lesson" | "postit" | "resource"
type LibraryLayout = "grid" | "list"
type LibraryShelfId = Exclude<LibraryFilter, "all">

const SHELF_DEFINITIONS: ReadonlyArray<{
  id: LibraryShelfId
  label: string
  kinds: readonly LibraryAssetKind[]
}> = [
  { id: "lesson", label: "Lezioni", kinds: ["note", "image"] },
  { id: "postit", label: "Post-it salvati", kinds: ["postit"] },
  { id: "resource", label: "Guide e risorse", kinds: ["arduino-artifact"] },
]

const FILTER_OPTIONS: ReadonlyArray<{ id: LibraryFilter; label: string }> = [
  { id: "all", label: "Tutti" },
  { id: "lesson", label: "Lezioni" },
  { id: "postit", label: "Post-it" },
  { id: "resource", label: "Guide" },
]

function matchesFilter(asset: LibraryAsset, filter: LibraryFilter): boolean {
  if (filter === "all") return true
  return SHELF_DEFINITIONS.find((shelf) => shelf.id === filter)?.kinds.includes(asset.kind) ?? false
}

export default function LibraryView({ deps }: { deps?: LibraryViewDeps }) {
  const room = deps?.room ?? roomFromHash()
  const loadScene = deps?.loadScene ?? loadSceneFromWorkspace
  const [state, setState] = useState<LibraryState>({ phase: "loading" })
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [sort, setSort] = useState<"recent" | "title">("recent")
  const [layout, setLayout] = useState<LibraryLayout>("grid")
  const refreshGenerationRef = useRef(0)

  const refresh = useCallback(async () => {
    const generation = refreshGenerationRef.current + 1
    refreshGenerationRef.current = generation
    setState({ phase: "loading" })
    try {
      const scene = await loadScene(room)
      const snapshot = await buildLibrarySnapshot(scene, room)
      if (generation !== refreshGenerationRef.current) return
      setState({ phase: "ready", snapshot })
    } catch (error) {
      if (generation !== refreshGenerationRef.current) return
      setState({ phase: "error", detail: error instanceof Error ? error.message : String(error) })
    }
  }, [loadScene, room])

  useEffect(() => {
    void refresh()
    return () => {
      refreshGenerationRef.current += 1
    }
  }, [refresh])

  const snapshot = state.phase === "ready" ? state.snapshot : null
  const filteredAssets = useMemo(() => {
    if (snapshot === null) return []
    const normalizedQuery = query.trim().toLocaleLowerCase("it")
    return snapshot.assets
      .filter((asset) => matchesFilter(asset, filter))
      .filter((asset) => normalizedQuery.length === 0 || `${asset.title} ${asset.tags.join(" ")} ${asset.source}`.toLocaleLowerCase("it").includes(normalizedQuery))
      .sort((a, b) => sort === "recent" ? assetSort(a, b) : a.title.localeCompare(b.title, "it"))
  }, [filter, query, snapshot, sort])
  const shelves = useMemo(
    () => SHELF_DEFINITIONS
      .map((definition) => ({
        ...definition,
        assets: filteredAssets.filter((asset) => definition.kinds.includes(asset.kind)),
      }))
      .filter((shelf) => shelf.assets.length > 0),
    [filteredAssets],
  )

  const launcher = (
    <a
      className="st-shell-launcher"
      href={viewHref("lavagna", room)}
      aria-label="Crea un nuovo materiale sulla lavagna"
      title="Crea un nuovo materiale sulla lavagna"
    >
      <span aria-hidden>+</span>
    </a>
  )
  const actions = (
    <>
      <button
        type="button"
        className="st-library-shell-action"
        aria-label="Aggiorna la Library"
        title="Aggiorna la Library"
        onClick={() => void refresh()}
        disabled={state.phase === "loading"}
      >
        <span aria-hidden>↻</span>
      </button>
      <a
        className="st-library-shell-action"
        aria-label="Apri la lavagna"
        title="Apri la lavagna"
        href={viewHref("lavagna", room)}
      >
        <span aria-hidden>↗</span>
      </a>
    </>
  )

  return (
    <StudioShell
      current="library"
      searchLabel="Cerca nella tua libreria..."
      launcher={launcher}
      actions={actions}
    >
      <div className="st-library-view" data-library-view>
        <div className="st-library-inner">
          {state.phase === "loading" && <p className="st-library-status" aria-busy="true">Indicizzo i materiali della stanza...</p>}

          {state.phase === "error" && (
            <EmptyState
              tone="error"
              title="Library non disponibile"
              detail="La scena della lezione non e' leggibile: non mostro materiali parziali come se fossero completi."
              hint={state.detail}
            />
          )}

          {snapshot !== null && room.length === 0 && (
            <EmptyState
              title="Seleziona una lezione"
              detail="Apri una lavagna per vedere gli asset effettivamente salvati nella sua stanza."
            />
          )}

          {snapshot !== null && room.length > 0 && (
            <>
              <header className="st-library-toolbar">
                <div className="st-library-heading">
                  <span className="st-library-room">{room}</span>
                  <h1>I tuoi materiali</h1>
                  <span className="st-library-count" aria-live="polite">{snapshot.assets.length} asset</span>
                </div>

                <label className="st-library-search">
                  <span className="sr-only">Cerca nella Library</span>
                  <input
                    type="search"
                    aria-label="Cerca nella Library"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cerca nei materiali"
                  />
                </label>

                <div className="st-library-filter-row">
                  <div className="st-library-filters" role="group" aria-label="Filtra i materiali">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="st-library-filter"
                        aria-pressed={filter === option.id}
                        onClick={() => setFilter(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="st-library-view-options">
                    <select
                      aria-label="Ordina i materiali"
                      value={sort}
                      onChange={(event) => setSort(event.target.value as "recent" | "title")}
                    >
                      <option value="recent">Più recenti</option>
                      <option value="title">Titolo</option>
                    </select>
                    <div className="st-library-layout-switch" role="group" aria-label="Layout dei materiali">
                      <button
                        type="button"
                        aria-label="Vista griglia"
                        aria-pressed={layout === "grid"}
                        onClick={() => setLayout("grid")}
                      >
                        <span aria-hidden>▦</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Vista elenco"
                        aria-pressed={layout === "list"}
                        onClick={() => setLayout("list")}
                      >
                        <span aria-hidden>☰</span>
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {snapshot.assets.length === 0 ? (
                <EmptyState
                  title="Nessun materiale salvato"
                  detail="Note, immagini, post-it e compilazioni reali appariranno qui dopo il salvataggio sulla lavagna."
                />
              ) : shelves.length === 0 ? (
                <EmptyState compact title="Nessun risultato" detail="Modifica la ricerca o il filtro per vedere i materiali della stanza." />
              ) : (
                <div className="st-library-shelves" data-library-layout={layout}>
                  {shelves.map((shelf) => (
                    <section
                      key={shelf.id}
                      className="st-library-shelf"
                      data-library-shelf={shelf.id}
                      aria-labelledby={`library-shelf-${shelf.id}`}
                    >
                      <header className="st-library-shelf-heading">
                        <h2 id={`library-shelf-${shelf.id}`}>
                          <span className="st-library-shelf-dot" aria-hidden />
                          {shelf.label}
                        </h2>
                        <span>{shelf.assets.length}</span>
                      </header>
                      <div className="st-library-shelf-track">
                        {shelf.assets.map((asset) => <AssetTile key={asset.id} asset={asset} room={room} />)}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              <a className="st-library-create" href={viewHref("lavagna", room)}>
                <span aria-hidden>+</span>
                Crea qualcosa di nuovo
              </a>

              <details className="st-library-index-details">
                <summary>Dettagli tecnici dell'indice</summary>
                <p>Audio, PDF e trascrizioni non sono mostrati finche' il loro storage non registra la stanza.</p>
                <p>Tipi non disponibili: {snapshot.unavailableKinds.join(", ")}.</p>
              </details>
            </>
          )}
        </div>
      </div>
    </StudioShell>
  )
}

function AssetTile({ asset, room }: { asset: LibraryAsset; room: string }) {
  return (
    <article className="st-library-asset" data-library-asset={asset.kind}>
      <div className="st-library-asset-mark" data-library-asset-mark={asset.kind} aria-hidden />
      <div className="st-library-asset-copy">
        <span className="st-library-kind">{typeLabel(asset.kind)}</span>
        <h3>{asset.title}</h3>
        <span className="st-library-updated">{formatTimestamp(asset.updatedAt)}</span>
      </div>
      <a
        className="st-library-open"
        href={boardFocusHref(room, asset.boardElementId)}
        aria-label={`Apri ${asset.title} sulla lavagna`}
        title="Apri sulla lavagna"
      >
        <span aria-hidden>↗</span>
      </a>
      <details className="st-library-technical-details">
        <summary>Dettagli tecnici</summary>
        <dl>
          <div><dt>Fonte</dt><dd>{asset.source}</dd></div>
          <div><dt>Scope</dt><dd>{asset.scope}</dd></div>
          <div><dt>Formato</dt><dd>{asset.mimeType ?? "non registrato"}</dd></div>
          <div><dt>Dimensione</dt><dd>{formatBytes(asset.sizeBytes)}</dd></div>
          <div><dt>Hash</dt><dd><code>{asset.contentHash ?? "non disponibile"}</code></dd></div>
        </dl>
      </details>
    </article>
  )
}
