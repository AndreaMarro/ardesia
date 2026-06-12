// TOOLHOST-SPEC-v0 §3 — origin loopback per-tool.
// Questo modulo è il MODELLO richiesta→risposta dell'origin-server (puro, senza
// socket): l'adapter che fa il bind reale su 127.0.0.1 vive nella shell
// (Tauri/Electron/dev-proxy), fuori dal perimetro testabile headless. Tutta la
// policy di sicurezza (CSP iniettata, nonce monouso sul document-load, path
// safety) sta QUI, così è la stessa per qualunque binding.

import type { ToolManifest } from "../toolhost-protocol/index.ts"

const TOOL_ID_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/

/** Origin distinta per-tool (modello vscode-webview): mai l'origin dello Studio. */
export function toolOrigin(toolId: string, port: number): string {
  if (!TOOL_ID_RE.test(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`invalid port: ${port}`)
  return `http://t-${toolId}.127-0-0-1.localhost:${port}`
}

// CSP iniettata su OGNI risposta (spec §3, incluse direttive anti-side-channel
// del buco #4 dei giudici). dataOut:"none" non può esfiltrare per costruzione.
// form-action NON eredita da default-src: senza pin esplicito, allow-forms del
// sandbox aprirebbe l'esfiltrazione via <form action=...> (finding SELF-ADV ST1).
export const TOOL_CSP =
  "default-src 'self'; connect-src 'self'; object-src 'none'; frame-src 'none'; form-action 'self'; base-uri 'none'; webrtc 'block'"

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Security-Policy": TOOL_CSP,
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), serial=()",
  "X-DNS-Prefetch-Control": "off",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  wasm: "application/wasm",
  woff2: "font/woff2",
  txt: "text/plain; charset=utf-8",
}

function contentTypeFor(path: string): string {
  const dot = path.lastIndexOf(".")
  const ext = dot >= 0 ? path.slice(dot + 1).toLowerCase() : ""
  return CONTENT_TYPES[ext] ?? "application/octet-stream"
}

/** Stessa lezione ZipSlip del manifest: relativo, niente "..", niente backslash/segmenti vuoti/control-char. */
function isSafeRelativePath(p: string): boolean {
  if (p.length === 0 || p.startsWith("/") || p.includes("\\")) return false
  // control char (incl. null byte): mai legittimi in un path; un adapter su
  // filesystem reale erediterebbe il rischio se passassero da qui.
  for (let i = 0; i < p.length; i++) {
    const c = p.charCodeAt(i)
    if (c < 0x20 || c === 0x7f) return false
  }
  const segments = p.split("/")
  return segments.every((s) => s !== "" && s !== ".." && s !== ".")
}

export interface OriginResponse {
  status: number
  headers: Record<string, string>
  body: Uint8Array | string | null
}

export interface ToolOriginServerConfig {
  manifest: ToolManifest
  /** Contenuto statico del pacchetto .maestrotool: path relativo → bytes. */
  files: ReadonlyMap<string, Uint8Array | string>
  port: number
  /** Iniettabile nei test (scadenza nonce). Cattura-side, non replay-side. */
  now?: () => number
}

const NONCE_TTL_MS = 60_000

function randomNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function respond(status: number, body: Uint8Array | string | null, contentType?: string): OriginResponse {
  const headers: Record<string, string> = { ...SECURITY_HEADERS }
  if (contentType !== undefined) headers["Content-Type"] = contentType
  return { status, headers, body }
}

/**
 * Origin-server per UN tool. Il document-load dell'entry richiede un nonce
 * monouso a scadenza immediata (§3: MAI token in URL — il nonce non è il bearer,
 * autorizza solo UNA lettura del documento). Gli asset same-origin del documento
 * non richiedono nonce: sono raggiungibili solo dal documento già autorizzato.
 */
export class ToolOriginServer {
  readonly origin: string

  private _manifest: ToolManifest
  private _files: ReadonlyMap<string, Uint8Array | string>
  private _now: () => number
  private _pendingNonces = new Map<string, number>()

  constructor(cfg: ToolOriginServerConfig) {
    for (const path of cfg.files.keys()) {
      if (!isSafeRelativePath(path)) throw new Error(`unsafe file path in tool package: ${path}`)
    }
    if (!cfg.files.has(cfg.manifest.entry)) {
      throw new Error(`entry not present in tool package: ${cfg.manifest.entry}`)
    }
    this._manifest = cfg.manifest
    this._files = cfg.files
    this._now = cfg.now ?? (() => Date.now())
    this.origin = toolOrigin(cfg.manifest.id, cfg.port)
  }

  /** URL del document-load con nonce FRESCO monouso. Una mount = una issue. */
  issueEntryUrl(): string {
    // sweep dei nonce scaduti: senza, N mount falliti = N entry per sempre
    const now = this._now()
    for (const [nonce, expiry] of this._pendingNonces) {
      if (now > expiry) this._pendingNonces.delete(nonce)
    }
    const nonce = randomNonce()
    this._pendingNonces.set(nonce, now + NONCE_TTL_MS)
    // segmenti encodati: handleRequest decodifica una volta, il round-trip deve
    // essere lossless anche con entry contenenti caratteri riservati (es. %, spazi)
    const encodedEntry = this._manifest.entry.split("/").map(encodeURIComponent).join("/")
    return `${this.origin}/${encodedEntry}?n=${nonce}`
  }

  /** Gestisce una richiesta GET per path assoluto (es. "/dist/index.html?n=..."). */
  handleRequest(rawPath: string): OriginResponse {
    if (!rawPath.startsWith("/")) return respond(400, null)
    const qIdx = rawPath.indexOf("?")
    const encodedPath = qIdx >= 0 ? rawPath.slice(0, qIdx) : rawPath
    const query = qIdx >= 0 ? rawPath.slice(qIdx + 1) : ""

    let path: string
    try {
      path = decodeURIComponent(encodedPath).slice(1)
    } catch {
      return respond(400, null)
    }
    if (!isSafeRelativePath(path)) return respond(400, null)

    if (path === this._manifest.entry) {
      if (!this._consumeNonce(query)) return respond(403, null)
    }

    const data = this._files.get(path)
    if (data === undefined) return respond(404, null)
    return respond(200, data, contentTypeFor(path))
  }

  private _consumeNonce(query: string): boolean {
    const params = new URLSearchParams(query)
    const nonce = params.get("n")
    if (nonce === null) return false
    const expiry = this._pendingNonces.get(nonce)
    // monouso: consumato (o mai emesso, o scaduto) = rifiuto
    if (expiry === undefined) return false
    this._pendingNonces.delete(nonce)
    return this._now() <= expiry
  }
}
