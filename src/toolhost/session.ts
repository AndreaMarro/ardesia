import {
  ERR,
  HostHelloSchema,
  JsonRpcRequestSchema,
  JsonRpcResponseSchema,
  PROTOCOL_VERSION,
  ToolReadyParamsSchema,
  parseVersion,
} from "../toolhost-protocol/index.ts"
import type { Capabilities, HostHello, JsonRpcResponse, ReadyAck, RequestId } from "../toolhost-protocol/index.ts"
import { extractRequestId, routeRequest } from "./router.ts"
import type { RouterConfig } from "./router.ts"

/** Sottoinsieme strutturale comune a MessagePort browser e Node (usato nei test). */
export interface PortLike {
  postMessage(message: unknown): void
  addEventListener(type: "message", listener: (ev: { data: unknown }) => void): void
  removeEventListener(type: "message", listener: (ev: { data: unknown }) => void): void
  start?(): void
  close?(): void
}

export interface HostSessionConfig extends RouterConfig {
  bearerToken: string
  theme?: "light" | "dark"
  locale?: string
  /** Iniettabile SOLO nei test; default crypto-random. Il nonce è cattura-side, non replay-side. */
  nonce?: string
}

export function createNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Costruisce la notifica host.hello. NON contiene MAI il bearer token (va sulla porta, post-nonce). */
export function createHostHello(cfg: { grantedCaps: Capabilities; nonce: string; theme?: "light" | "dark"; locale?: string }): HostHello {
  return HostHelloSchema.parse({
    jsonrpc: "2.0",
    method: "host.hello",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      grantedCaps: cfg.grantedCaps,
      nonce: cfg.nonce,
      theme: cfg.theme ?? "light",
      locale: cfg.locale ?? "it",
    },
  })
}

/** Invio production-side dell'hello: la porta viaggia nei transferables, mai nell'URL. */
export function postHello(
  targetWindow: { postMessage(msg: unknown, targetOrigin: string, transfer: Transferable[]): void },
  hello: HostHello,
  port: MessagePort,
  targetOrigin: string,
): void {
  targetWindow.postMessage(hello, targetOrigin, [port])
}

/**
 * Sessione host per UN tool: stato handshaking → ready.
 * - prima di tool.ready: qualunque altra request → HANDSHAKE_FAILED;
 * - tool.ready con nonce sbagliato → HANDSHAKE_FAILED e sessione marcata failed;
 * - nonce monouso: un secondo tool.ready (anche col nonce giusto) → HANDSHAKE_FAILED;
 * - dopo ready: dispatch al router (validazione Zod host-side, deny-by-default).
 */
export class ToolHostSession {
  readonly nonce: string
  readonly hello: HostHello
  readonly ready: Promise<void>

  private _cfg: HostSessionConfig
  private _state: "handshaking" | "ready" | "failed" = "handshaking"
  private _port: PortLike | null = null
  private _listener: ((ev: { data: unknown }) => void) | null = null
  private _resolveReady!: () => void
  private _rejectReady!: (e: Error) => void

  constructor(cfg: HostSessionConfig) {
    this._cfg = cfg
    this.nonce = cfg.nonce ?? createNonce()
    this.hello = createHostHello({ grantedCaps: cfg.grantedCaps, nonce: this.nonce, theme: cfg.theme, locale: cfg.locale })
    this.ready = new Promise<void>((resolve, reject) => {
      this._resolveReady = resolve
      this._rejectReady = reject
    })
    // la reiezione è già segnalata via response HANDSHAKE_FAILED sulla porta
    this.ready.catch(() => {})
  }

  attach(port: PortLike): void {
    if (this._port !== null) throw new Error("session already attached")
    this._port = port
    this._listener = (ev) => {
      void this._onMessage(ev.data)
    }
    port.addEventListener("message", this._listener)
    port.start?.()
  }

  close(): void {
    if (this._port !== null && this._listener !== null) {
      this._port.removeEventListener("message", this._listener)
    }
    this._port?.close?.()
  }

  private _respond(response: JsonRpcResponse): void {
    this._port?.postMessage(response)
  }

  private _handshakeError(id: RequestId | null, message: string): void {
    this._respond({ jsonrpc: "2.0", id, error: { code: ERR.HANDSHAKE_FAILED, message } })
  }

  private async _onMessage(raw: unknown): Promise<void> {
    // Le response (repliche del tool a richieste host-iniziate, es. host.suspend)
    // non sono request: niente dispatch e niente INVALID_REQUEST di rimbalzo.
    if (JsonRpcResponseSchema.safeParse(raw).success) return

    const reqParse = JsonRpcRequestSchema.safeParse(raw)
    const method = reqParse.success ? reqParse.data.method : null

    if (method === "tool.ready") {
      this._onToolReady(raw)
      return
    }

    if (this._state !== "ready") {
      this._handshakeError(extractRequestId(raw), "handshake not completed")
      return
    }

    const response = await routeRequest(raw, this._cfg)
    if (response !== null) this._respond(response)
  }

  private _onToolReady(raw: unknown): void {
    const req = JsonRpcRequestSchema.safeParse(raw)
    if (!req.success) {
      this._handshakeError(extractRequestId(raw), "malformed tool.ready")
      return
    }
    if (this._state !== "handshaking") {
      // nonce monouso: replay di tool.ready dopo il consumo → rifiuto, mai un secondo token.
      this._handshakeError(req.data.id, "nonce already used")
      return
    }
    const params = ToolReadyParamsSchema.safeParse(req.data.params)
    if (!params.success) {
      this._handshakeError(req.data.id, "invalid tool.ready params")
      return
    }
    if (params.data.nonce !== this.nonce) {
      this._state = "failed"
      this._handshakeError(req.data.id, "nonce mismatch")
      this._rejectReady(new Error("handshake failed: nonce mismatch"))
      return
    }
    const toolVersion = parseVersion(params.data.protocolVersion)
    const hostVersion = parseVersion(PROTOCOL_VERSION)
    if (toolVersion === null || hostVersion === null || toolVersion[0] !== hostVersion[0]) {
      this._state = "failed"
      this._handshakeError(req.data.id, "incompatible protocol major")
      this._rejectReady(new Error("handshake failed: incompatible protocol"))
      return
    }
    this._state = "ready"
    const ack: ReadyAck = { bearerToken: this._cfg.bearerToken, grantedCaps: this._cfg.grantedCaps }
    this._respond({ jsonrpc: "2.0", id: req.data.id, result: ack })
    this._resolveReady()
  }
}
