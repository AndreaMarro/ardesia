// MAESTRO-Studio — Bundle format .lesson (JSONL+base64)
// Formato contenitore per export/import del workspace.
// NOTA: non è un vero ZIP — è JSONL con dati base64. In M3 si potrà
// upgradare a JSZip per il vero ZIP, se serve. Per ora questo formato
// è auto-contenuto e a prova di corruzione binaria.

import type { FileEntry } from "./types"

/** Converte Blob → base64 usando arrayBuffer (NON text() — corrompe byte binari) */
async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** Crea un bundle .lesson (JSONL+base64) dai FileEntry */
export async function createBundleBlob(entries: FileEntry[]): Promise<Blob> {
  const parts: string[] = []
  // Header
  const header = JSON.stringify({
    format: "maestro-bundle",
    version: 1,
    fileCount: entries.length,
  })
  parts.push(header + "\n")

  for (const entry of entries) {
    const b64 = await blobToBase64(entry.data)
    parts.push(JSON.stringify({
      path: entry.path,
      mtime: entry.mtime,
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
    const binaryStr = atob(item.data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let j = 0; j < binaryStr.length; j++) {
      bytes[j] = binaryStr.charCodeAt(j)
    }
    entries.push({
      path: item.path,
      mtime: item.mtime ?? 0,
      data: new Blob([bytes]),
    })
  }
  return entries
}
