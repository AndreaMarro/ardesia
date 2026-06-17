// MAESTRO-Studio — Bundle format .lesson (JSONL+base64)
// Formato contenitore per export/import del workspace.
// NOTA: non è un vero ZIP — è JSONL con dati base64. In M3 si potrà
// upgradare a JSZip per il vero ZIP, se serve. Per ora questo formato
// è auto-contenuto e a prova di corruzione binaria.
//
// Il MIME type di ogni file è preservato nel campo "type" della riga JSON.

import type { FileEntry } from "./types"
import { blobToBase64, base64ToBlob } from "./codec"

/** Crea un bundle .lesson (JSONL+base64) dai FileEntry */
export async function createBundleBlob(entries: FileEntry[]): Promise<Blob> {
  const parts: string[] = []
  // Header
  const header = JSON.stringify({
    format: "maestro-bundle",
    version: 2,
    fileCount: entries.length,
  })
  parts.push(header + "\n")

  for (const entry of entries) {
    const b64 = await blobToBase64(entry.data)
    parts.push(JSON.stringify({
      path: entry.path,
      mtime: entry.mtime,
      type: entry.data.type || undefined,
      data: b64,
    }) + "\n")
  }

  return new Blob(parts, { type: "application/x-maestro-bundle" })
}

/** Legge un bundle .lesson e restituisce FileEntry[] */
export async function parseBundleBlob(blob: Blob): Promise<FileEntry[]> {
  const text = await blob.text()
  const lines = text.split("\n").filter(Boolean)
  if (lines.length < 1) throw new Error("Bundle vuoto")

  const header = JSON.parse(lines[0])
  if (header.format !== "maestro-bundle") {
    throw new Error(`Formato bundle sconosciuto: ${header.format}`)
  }

  const entries: FileEntry[] = []
  for (let i = 1; i < lines.length; i++) {
    const item = JSON.parse(lines[i])
    if (!item.data || typeof item.data !== "string") {
      throw new Error(`Riga ${i}: campo data mancante o non stringa`)
    }
    const blob = base64ToBlob(item.data, item.type || undefined)
    entries.push({
      path: item.path,
      mtime: item.mtime ?? 0,
      data: blob,
    })
  }
  return entries
}
