// P0-D authoring — writer ZIP store-only (method 0, nessuna compressione).
// Serve al solo scaffolder per produrre bundle .maestrotool senza aggiungere
// dipendenze (niente JSZip/fflate: gate deps). Output DETERMINISTICO: timestamp
// DOS fisso, così stessa spec → stessi byte (riproducibilità della firma/hash).
//
// Formato: APPNOTE.TXT PKWARE — local file header (PK\x03\x04) per entry,
// central directory (PK\x01\x02), End Of Central Directory (PK\x05\x06).
// Solo ciò che l'installer richiede: un contenitore zip leggibile da `unzip`.

/** Tabella CRC-32 (polinomio riflesso 0xEDB88320), calcolata una volta. */
const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

/** CRC-32 standard (ISO 3309). Vettore noto: "123456789" → 0xCBF43926. */
export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  /** Path relativo dentro lo zip (es. "entry.html"). */
  path: string
  data: Uint8Array
}

// Timestamp DOS fisso (2000-01-01 00:00): bit-packed year-1980/month/day.
const DOS_DATE = ((2000 - 1980) << 9) | (1 << 5) | 1
const DOS_TIME = 0

function u16(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff]
}
function u32(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]
}

/**
 * Costruisce uno zip store-only dai ZipEntry, nell'ordine dato.
 * Path ASCII/UTF-8 senza validazione ZipSlip: il CONSUMO dello zip la fa a
 * valle (lezione lessonBundle); qui si genera solo da input dello scaffolder.
 */
export function buildStoreZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const parts: number[] = []
  const central: number[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path)
    const crc = crc32(entry.data)
    const size = entry.data.length

    // Local file header
    const local = [
      ...u32(0x04034b50),
      ...u16(20), // version needed
      ...u16(0), // flags
      ...u16(0), // method: store
      ...u16(DOS_TIME),
      ...u16(DOS_DATE),
      ...u32(crc),
      ...u32(size), // compressed
      ...u32(size), // uncompressed
      ...u16(nameBytes.length),
      ...u16(0), // extra len
      ...nameBytes,
    ]
    parts.push(...local, ...entry.data)

    // Central directory record per questa entry
    central.push(
      ...u32(0x02014b50),
      ...u16(20), // version made by
      ...u16(20), // version needed
      ...u16(0),
      ...u16(0),
      ...u16(DOS_TIME),
      ...u16(DOS_DATE),
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      ...u16(0), // extra
      ...u16(0), // comment
      ...u16(0), // disk start
      ...u16(0), // internal attrs
      ...u32(0), // external attrs
      ...u32(offset),
      ...nameBytes,
    )
    offset += local.length + size
  }

  const centralOffset = offset
  const eocd = [
    ...u32(0x06054b50),
    ...u16(0), // disk
    ...u16(0), // central dir disk
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(central.length),
    ...u32(centralOffset),
    ...u16(0), // comment len
  ]

  return new Uint8Array([...parts, ...central, ...eocd])
}

// ---- Reader (fail-closed) ----

function readU16(bytes: Uint8Array, at: number): number {
  return bytes[at] | (bytes[at + 1] << 8)
}
function readU32(bytes: Uint8Array, at: number): number {
  return (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0
}

// Stessa lezione ZipSlip di lessonBundle: il WRITER non valida (input dello
// scaffolder), il READER sì — un package arriva da fuori.
function isSafeZipPath(p: string): boolean {
  if (p === "" || p.startsWith("/") || p.includes("\\")) return false
  return p.split("/").every((segment) => segment !== "" && segment !== "..")
}

/**
 * Legge uno zip STORE-ONLY (method 0). Fail-closed su: EOCD assente, firma
 * record mancante, method ≠ 0 (central E local), CRC che non torna, path
 * ZipSlip. Niente inflate: un package v1 è per contratto senza compressione.
 */
export function readStoreZip(bytes: Uint8Array): ZipEntry[] {
  // EOCD: cerca PK\x05\x06 dalla coda (min 22 byte, comment variabile).
  let eocd = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (readU32(bytes, i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd === -1) throw new Error("not a zip: end of central directory missing")

  const count = readU16(bytes, eocd + 10)
  const centralOffset = readU32(bytes, eocd + 16)

  const entries: ZipEntry[] = []
  let at = centralOffset
  for (let i = 0; i < count; i++) {
    if (readU32(bytes, at) !== 0x02014b50) {
      throw new Error("corrupt zip: central directory record signature mismatch")
    }
    const method = readU16(bytes, at + 10)
    const crc = readU32(bytes, at + 16)
    const compressedSize = readU32(bytes, at + 20)
    const uncompressedSize = readU32(bytes, at + 24)
    const nameLen = readU16(bytes, at + 28)
    const extraLen = readU16(bytes, at + 30)
    const commentLen = readU16(bytes, at + 32)
    const localOffset = readU32(bytes, at + 42)
    const path = new TextDecoder().decode(bytes.slice(at + 46, at + 46 + nameLen))

    if (method !== 0) {
      throw new Error(`unsupported zip entry (store-only contract): "${path}" method=${method}`)
    }
    if (!isSafeZipPath(path)) {
      throw new Error(`unsafe zip entry path: "${path}"`)
    }
    if (compressedSize !== uncompressedSize) {
      throw new Error(`corrupt store entry "${path}": compressed ≠ uncompressed size`)
    }

    if (readU32(bytes, localOffset) !== 0x04034b50) {
      throw new Error(`corrupt zip: local header signature mismatch for "${path}"`)
    }
    if (readU16(bytes, localOffset + 8) !== 0) {
      throw new Error(`unsupported zip entry (store-only contract): "${path}" local method != 0`)
    }
    const localNameLen = readU16(bytes, localOffset + 26)
    const localExtraLen = readU16(bytes, localOffset + 28)
    const dataStart = localOffset + 30 + localNameLen + localExtraLen
    const data = bytes.slice(dataStart, dataStart + uncompressedSize)
    if (data.length !== uncompressedSize) {
      throw new Error(`corrupt zip: truncated data for "${path}"`)
    }
    if (crc32(data) !== crc) {
      throw new Error(`crc mismatch for zip entry "${path}"`)
    }

    entries.push({ path, data })
    at += 46 + nameLen + extraLen + commentLen
  }

  return entries
}
