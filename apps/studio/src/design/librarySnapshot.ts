import { validateRoomId } from "../store/roomPaths"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"

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
    const key = asset.kind === "image" ? `image:${asset.contentHash ?? asset.id}` : `${asset.kind}:${asset.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function assetSort(a: LibraryAsset, b: LibraryAsset): number {
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

/** Builds an index from only the selected room's persisted scene. */
export async function buildLibrarySnapshot(sceneJson: string | null, room: string): Promise<LibrarySnapshot> {
  validateRoomId(room)
  if (sceneJson === null) return { assets: [], unavailableKinds: UNAVAILABLE_KINDS }

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
