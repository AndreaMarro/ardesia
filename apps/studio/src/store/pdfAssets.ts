import { validateProductRoomId } from "./roomPaths"
import type { WorkspaceStore } from "./WorkspaceStore"

export const PDF_ASSET_DIR = "raw/documents/"
export const PDF_ASSET_LIMITS = Object.freeze({ perFile: 20 * 1024 * 1024, total: 100 * 1024 * 1024, count: 32 })
const HASH = /^[0-9a-f]{64}$/

type PdfStore = Pick<WorkspaceStore, "read" | "write" | "list">
export type PdfAsset = Readonly<{ documentId: string; bytes: number; blob: Blob }>

function invalid(reason: string): never { throw new Error(`PDF originale: ${reason}`) }

export function portablePdfId(path: string): string | null {
  if (path === PDF_ASSET_DIR.slice(0, -1)) invalid("path non canonico")
  if (!path.startsWith(PDF_ASSET_DIR)) return null
  const match = /^([0-9a-f]{64})\.pdf$/.exec(path.slice(PDF_ASSET_DIR.length))
  if (!match) invalid("path non canonico")
  return match[1]!
}

export function pdfAssetPath(lessonId: string, documentId: string): string {
  if (!HASH.test(documentId)) invalid("impronta non valida")
  return `raw/${validateProductRoomId(lessonId)}/documents/${documentId}.pdf`
}

export async function pdfSha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", Uint8Array.from(new Uint8Array(await blob.arrayBuffer())))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")
}

export async function validatePdfAsset(blob: Blob, expectedId?: string): Promise<PdfAsset> {
  if (blob.size === 0 || blob.size > PDF_ASSET_LIMITS.perFile) invalid("dimensione oltre il limite di 20 MiB")
  if (!(await blob.slice(0, 1024).text()).includes("%PDF-")) invalid("intestazione PDF mancante")
  const documentId = await pdfSha256(blob)
  if (expectedId !== undefined && documentId !== expectedId) invalid("SHA-256 discordante")
  return { documentId, bytes: blob.size, blob: blob.slice(0, blob.size, "application/pdf") }
}

export function validatePdfInventory(entries: readonly Readonly<{ path: string; bytes: number }>[]): void {
  const documents = entries.filter(entry => portablePdfId(entry.path) !== null)
  if (documents.length > PDF_ASSET_LIMITS.count) invalid("più di 32 documenti")
  let total = 0
  for (const entry of documents) {
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > PDF_ASSET_LIMITS.perFile) invalid("dimensione oltre il limite di 20 MiB")
    total += entry.bytes
  }
  if (total > PDF_ASSET_LIMITS.total) invalid("dimensione complessiva oltre 100 MiB")
}

export async function readPdfAsset(store: Pick<PdfStore, "read">, lessonId: string, documentId: string): Promise<PdfAsset | null> {
  const blob = await store.read(pdfAssetPath(lessonId, documentId))
  return blob ? validatePdfAsset(blob, documentId) : null
}

/** Content-addressed bytes are reusable only after verification. Never repair a collision by overwriting it. */
export async function writePdfAsset(store: PdfStore, lessonId: string, blob: Blob, expectedId?: string): Promise<PdfAsset> {
  const asset = await validatePdfAsset(blob, expectedId)
  const path = pdfAssetPath(lessonId, asset.documentId)
  const existing = await store.read(path)
  if (existing) {
    await validatePdfAsset(existing, asset.documentId)
    return asset
  }
  const prefix = `raw/${validateProductRoomId(lessonId)}/documents/`
  const inventory = (await store.list(prefix)).map(entry => ({ path: PDF_ASSET_DIR + entry.path.slice(prefix.length), bytes: entry.data.size }))
  validatePdfInventory([...inventory, { path: PDF_ASSET_DIR + asset.documentId + ".pdf", bytes: asset.bytes }])
  await store.write(path, asset.blob)
  const saved = await readPdfAsset(store, lessonId, asset.documentId)
  if (!saved) invalid("scrittura non confermata")
  return saved
}
