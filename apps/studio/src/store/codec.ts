// MAESTRO-Studio — codec condiviso per Blob ↔ base64
// Unica fonte di verità per la serializzazione binaria.
// Preserva MIME type nel roundtrip.

/** Converte Blob → base64 usando arrayBuffer (NON text() — corrompe byte binari) */
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** Converte base64 → Blob, ripristinando il MIME type se fornito */
export function base64ToBlob(b64: string, type?: string): Blob {
  const binaryStr = atob(b64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return new Blob([bytes], type ? { type } : { type: "application/octet-stream" })
}
