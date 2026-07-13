import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { workspaceStore } from "../store/WorkspaceStore"
import { validateRoomId } from "../store/roomPaths"
import EmptyState from "./EmptyState"
import {
  assetSort,
  buildLibrarySnapshot,
  type LibraryAsset,
  type LibraryAssetKind,
  type LibrarySnapshot,
} from "./librarySnapshot"
import StudioShell from "./StudioShell"
import { viewHref } from "./ViewNav"

export interface LibraryViewDeps {
  room?: string
  loadScene?: (room: string) => Promise<string | null>
}

function boardFocusHref(room: string, elementId: string): string {
  const hash = room.length > 0 ? `#${room}` : ""
  return `/?focus=${encodeURIComponent(elementId)}${hash}`
}

function creationLauncherHref(room: string): string {
  const hash = room.length > 0 ? `#${room}` : ""
  return `/?crea=1${hash}`
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
      const validRoom = validateRoomId(room)
      const scene = await loadScene(validRoom)
      const snapshot = await buildLibrarySnapshot(scene, validRoom)
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
      href={creationLauncherHref(room)}
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

              <a className="st-library-create" href={creationLauncherHref(room)}>
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
