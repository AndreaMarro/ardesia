import { useCallback, useEffect, useMemo, useState } from "react"
import { workspaceStore } from "../store/WorkspaceStore"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import EmptyState from "./EmptyState"
import ViewNav, { viewHref } from "./ViewNav"

export type LibraryAssetKind = "note" | "image" | "postit" | "arduino-artifact"

export interface LibraryAsset {
  id: string
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
  if (kind === "arduino-artifact") return "artefatto"
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

export default function LibraryView({ deps }: { deps?: LibraryViewDeps }) {
  const room = deps?.room ?? roomFromHash()
  const loadScene = deps?.loadScene ?? loadSceneFromWorkspace
  const [state, setState] = useState<LibraryState>({ phase: "loading" })
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<"all" | LibraryAssetKind>("all")
  const [sort, setSort] = useState<"recent" | "title">("recent")

  const refresh = useCallback(async () => {
    setState({ phase: "loading" })
    try {
      const scene = await loadScene(room)
      setState({ phase: "ready", snapshot: await buildLibrarySnapshot(scene, room) })
    } catch (error) {
      setState({ phase: "error", detail: error instanceof Error ? error.message : String(error) })
    }
  }, [loadScene, room])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const snapshot = state.phase === "ready" ? state.snapshot : null
  const filteredAssets = useMemo(() => {
    if (snapshot === null) return []
    const normalizedQuery = query.trim().toLocaleLowerCase("it")
    return snapshot.assets
      .filter((asset) => kind === "all" || asset.kind === kind)
      .filter((asset) => normalizedQuery.length === 0 || `${asset.title} ${asset.tags.join(" ")} ${asset.source}`.toLocaleLowerCase("it").includes(normalizedQuery))
      .sort((a, b) => sort === "recent" ? assetSort(a, b) : a.title.localeCompare(b.title, "it"))
  }, [kind, query, snapshot, sort])
  const postitCount = snapshot?.assets.filter((asset) => asset.kind === "postit").length ?? 0

  return (
    <div style={pageStyle} data-library-view>
      <header className="st-bar" style={headerStyle}>
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <div style={titleBlockStyle}>
          <span style={eyebrowStyle}>Library</span>
          <strong style={titleStyle}>Materiali della lezione</strong>
        </div>
        <div style={headerActionsStyle} data-library-header-actions>
          <ViewNav current="library" />
          <button type="button" className="st-ghost" onClick={() => void refresh()} disabled={state.phase === "loading"}>aggiorna</button>
          <a className="st-ghost" href={viewHref("lavagna", room)}>lavagna</a>
        </div>
      </header>

      <main style={mainStyle}>
        <section aria-label="Contesto Library" style={contextStyle}>
          <div>
            <span style={eyebrowStyle}>Stanza corrente</span>
            <h1 style={headingStyle}>{room || "Nessuna lezione selezionata"}</h1>
          </div>
          <a href={viewHref("knowledge", room)} style={knowledgeLinkStyle}>vedi il grafo della lezione</a>
        </section>

        {state.phase === "loading" && <p aria-busy="true" style={quietStyle}>Indicizzo i materiali persistiti della stanza…</p>}

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
            <section aria-label="Sintesi Library" style={summaryStyle}>
              <div><span style={summaryLabelStyle}>Catalogo</span><strong style={summaryValueStyle}>{snapshot.assets.length} asset</strong></div>
              <div><span style={summaryLabelStyle}>Superfici vive</span><strong style={summaryValueStyle}>{postitCount} post-it</strong></div>
              <div><span style={summaryLabelStyle}>Scope</span><strong style={summaryValueStyle}>solo questa stanza</strong></div>
            </section>

            <section aria-label="Ricerca e ordinamento Library" style={toolbarStyle}>
              <label style={searchLabelStyle}>
                <span style={eyebrowStyle}>Cerca</span>
                <input
                  type="search"
                  aria-label="Cerca nella Library"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="nome, tipo o provenienza"
                  style={searchInputStyle}
                />
              </label>
              <label style={selectLabelStyle}>
                <span style={eyebrowStyle}>Tipo</span>
                <select value={kind} onChange={(event) => setKind(event.target.value as "all" | LibraryAssetKind)} style={selectStyle}>
                  <option value="all">tutti</option>
                  <option value="note">note</option>
                  <option value="image">immagini</option>
                  <option value="postit">post-it</option>
                  <option value="arduino-artifact">artefatti</option>
                </select>
              </label>
              <label style={selectLabelStyle}>
                <span style={eyebrowStyle}>Ordina</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as "recent" | "title")} style={selectStyle}>
                  <option value="recent">piu' recenti</option>
                  <option value="title">titolo</option>
                </select>
              </label>
            </section>

            {snapshot.assets.length === 0 ? (
              <EmptyState
                title="Nessun asset persistito in questa stanza"
                detail="Note, immagini, post-it e compilazioni reali appariranno qui dopo il salvataggio sulla lavagna."
              />
            ) : filteredAssets.length === 0 ? (
              <EmptyState compact title="Nessun risultato" detail="Modifica la ricerca o il filtro per vedere gli asset della stanza." />
            ) : (
              <section aria-label="Asset della Library" style={assetGridStyle}>
                {filteredAssets.map((asset) => <AssetCard key={asset.id} asset={asset} room={room} />)}
              </section>
            )}

            <aside style={integrityStyle} aria-label="Copertura della Library">
              <strong>Copertura attuale</strong>
              <span>Note, immagini, post-it e artefatti leggibili dalla scena sono indicizzati con scope e provenienza.</span>
              <span>{snapshot.unavailableKinds.join(", ")}: non mostrati finche' il loro storage non porta lo scope della stanza.</span>
            </aside>
          </>
        )}
      </main>
    </div>
  )
}

function AssetCard({ asset, room }: { asset: LibraryAsset; room: string }) {
  return (
    <article data-library-asset={asset.kind} style={{ ...assetCardStyle, borderTopColor: accentFor(asset.kind) }}>
      <div style={cardTopStyle}>
        <span style={typeBadgeStyle}>{typeLabel(asset.kind)}</span>
        <span style={timeStyle}>{formatTimestamp(asset.updatedAt)}</span>
      </div>
      <h2 style={assetTitleStyle}>{asset.title}</h2>
      <dl style={metadataStyle}>
        <div><dt>Fonte</dt><dd>{asset.source}</dd></div>
        <div><dt>Scope</dt><dd>{asset.scope}</dd></div>
        <div><dt>Formato</dt><dd>{asset.mimeType ?? "non registrato"}</dd></div>
        <div><dt>Dimensione</dt><dd>{formatBytes(asset.sizeBytes)}</dd></div>
        <div><dt>Hash</dt><dd><code>{asset.contentHash ?? "non disponibile"}</code></dd></div>
      </dl>
      <div style={cardFooterStyle}>
        <span style={tagsStyle}>{asset.tags.join(" · ")}</span>
        <a href={viewHref("lavagna", room)} style={boardLinkStyle}>apri lavagna</a>
      </div>
    </article>
  )
}

function accentFor(kind: LibraryAssetKind): string {
  if (kind === "note") return "#db5f3b"
  if (kind === "image") return "#2f78c4"
  if (kind === "postit") return "#267a68"
  return "#9b5fa5"
}

const pageStyle = { minHeight: "100vh", background: "#f4f8f7", color: "#17324d" } as const
const headerStyle = { height: "auto", minHeight: 60, flexWrap: "wrap", gap: 10, paddingTop: 8, paddingBottom: 8 } as const
const titleBlockStyle = { display: "grid", gap: 1, minWidth: 150 } as const
const headerActionsStyle = { marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, maxWidth: "100%", flexWrap: "wrap", paddingBottom: 2 } as const
const mainStyle = { boxSizing: "border-box", width: "min(1320px, 100%)", margin: "0 auto", padding: "24px clamp(16px, 3vw, 40px) 44px", display: "grid", gap: 20 } as const
const contextStyle = { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 16, borderBottom: "2px solid #17324d" } as const
const eyebrowStyle = { display: "block", color: "#5c6f81", fontSize: 12, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" } as const
const titleStyle = { fontSize: 16, letterSpacing: 0 } as const
const headingStyle = { margin: "2px 0 0", fontSize: 26, letterSpacing: 0, overflowWrap: "anywhere" } as const
const knowledgeLinkStyle = { color: "#1e5f9a", fontSize: 14, fontWeight: 700, textDecoration: "none" } as const
const quietStyle = { color: "#556a7e", margin: 0 } as const
const summaryStyle = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, padding: "14px 0", borderBottom: "1px solid #c9dbd4" } as const
const summaryLabelStyle = { display: "block", color: "#5c6f81", fontSize: 13, marginBottom: 4 } as const
const summaryValueStyle = { fontSize: 20, letterSpacing: 0, overflowWrap: "anywhere" } as const
const toolbarStyle = { display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap", padding: "14px 0", borderBottom: "1px solid #c9dbd4" } as const
const searchLabelStyle = { display: "grid", gap: 5, flex: "1 1 280px", minWidth: "min(100%, 220px)" } as const
const selectLabelStyle = { display: "grid", gap: 5, flex: "0 1 165px", minWidth: 140 } as const
const searchInputStyle = { boxSizing: "border-box", width: "100%", minHeight: 38, border: "1px solid #9ab9b0", borderRadius: 6, padding: "8px 10px", font: "inherit", color: "#17324d", background: "#ffffff" } as const
const selectStyle = { boxSizing: "border-box", width: "100%", minHeight: 38, border: "1px solid #9ab9b0", borderRadius: 6, padding: "7px 8px", font: "inherit", color: "#17324d", background: "#ffffff" } as const
const assetGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 255px), 1fr))", gap: 14 } as const
const assetCardStyle = { minWidth: 0, display: "grid", gap: 12, alignContent: "start", minHeight: 246, padding: 16, border: "1px solid #c9dbd4", borderTop: "5px solid", borderRadius: 8, background: "#ffffff" } as const
const cardTopStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0 } as const
const typeBadgeStyle = { display: "inline-flex", alignItems: "center", padding: "4px 7px", borderRadius: 5, background: "#e2efeb", color: "#245a52", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" } as const
const timeStyle = { color: "#5c6f81", fontSize: 12, textAlign: "right" } as const
const assetTitleStyle = { margin: 0, fontSize: 18, letterSpacing: 0, overflowWrap: "anywhere" } as const
const metadataStyle = { margin: 0, display: "grid", gap: 7, minWidth: 0, overflowWrap: "anywhere" } as const
const cardFooterStyle = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 10, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #e0ebe7" } as const
const tagsStyle = { color: "#527169", fontSize: 12, overflowWrap: "anywhere" } as const
const boardLinkStyle = { color: "#1e5f9a", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" } as const
const integrityStyle = { display: "grid", gap: 5, padding: "14px 0", borderTop: "1px solid #c9dbd4", color: "#46645e", fontSize: 13, lineHeight: 1.45 } as const
