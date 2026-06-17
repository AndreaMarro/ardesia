import {
  ERR,
  HostHelloSchema,
  JsonRpcRequestSchema,
  JsonRpcResponseSchema,
  PROTOCOL_VERSION,
  ReadyAckSchema,
  RestoreParamsSchema,
  parseVersion,
} from "../toolhost-protocol/index.ts"
import type { Capabilities, RequestId } from "../toolhost-protocol/index.ts"
import type { PortLike } from "../toolhost/session.ts"

interface MessageEventLike {
  data: unknown
  ports?: readonly unknown[]
}

export interface WindowLike {
  addEventListener(type: "message", listener: (ev: MessageEventLike) => void): void
  removeEventListener(type: "message", listener: (ev: MessageEventLike) => void): void
}

export interface ToolHandlers {
  /** saveState serializzabile (lifecycle suspend, TOOLHOST-SPEC-v0 §2). */
  suspend?: () => unknown
  restore?: (state: unknown) => void
}

export interface ConnectOptions {
  /** Finestra su cui attendere host.hello; default la finestra del tool. */
  windowRef?: WindowLike
  handlers?: ToolHandlers
}

export interface ToolConnection {
  grantedCaps: Capabilities
  bearerToken: string
  call(method: string, params: unknown): Promise<unknown>
  close(): void
}

class RpcError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

/**
 * Lato tool: attende host.hello sulla finestra (la porta arriva nei transferables
 * dell'evento — MAI da URL), risponde tool.ready col nonce sulla porta e riceve
 * il bearer token SOLO nel result. Messaggi-finestra che non sono un hello valido
 * vengono ignorati (la finestra è terra di nessuno, la porta è il canale fidato).
 */
export function connectTool(opts: ConnectOptions = {}): Promise<ToolConnection> {
  const win = opts.windowRef ?? (globalThis as unknown as WindowLike)
  return new Promise<ToolConnection>((resolve, reject) => {
    const onWindowMessage = (ev: MessageEventLike): void => {
      const hello = HostHelloSchema.safeParse(ev.data)
      if (!hello.success) return
      const port = ev.ports?.[0] as PortLike | undefined
      if (port === undefined) return

      const hostVersion = parseVersion(hello.data.params.protocolVersion)
      const sdkVersion = parseVersion(PROTOCOL_VERSION)
      if (hostVersion === null || sdkVersion === null || hostVersion[0] !== sdkVersion[0]) {
        win.removeEventListener("message", onWindowMessage)
        reject(new Error(`incompatible host protocol: ${hello.data.params.protocolVersion}`))
        return
      }

      win.removeEventListener("message", onWindowMessage)
      // i grantedCaps autoritativi arrivano nel ReadyAck (post-verifica nonce), non dall'hello
      openConnection(port, hello.data.params.nonce, opts.handlers ?? {}).then(resolve, reject)
    }
    win.addEventListener("message", onWindowMessage)
  })
}

function openConnection(port: PortLike, nonce: string, handlers: ToolHandlers): Promise<ToolConnection> {
  return new Promise<ToolConnection>((resolve, reject) => {
    let nextId = 1
    const pending = new Map<RequestId, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
    let readyDone = false

    const respond = (id: RequestId, body: { result: unknown } | { error: { code: number; message: string } }): void => {
      port.postMessage({ jsonrpc: "2.0", id, ...body })
    }

    const onPortMessage = (ev: { data: unknown }): void => {
      const asResponse = JsonRpcResponseSchema.safeParse(ev.data)
      if (asResponse.success) {
        const res = asResponse.data
        if (res.id === null) return
        const waiter = pending.get(res.id)
        if (waiter === undefined) return
        pending.delete(res.id)
        if ("result" in res) waiter.resolve(res.result)
        else waiter.reject(new RpcError(res.error.code, res.error.message))
        return
      }
      const asRequest = JsonRpcRequestSchema.safeParse(ev.data)
      if (!asRequest.success) return
      const req = asRequest.data
      if (req.method === "host.suspend") {
        if (handlers.suspend === undefined) {
          respond(req.id, { error: { code: ERR.INTERNAL, message: "tool has no suspend handler" } })
          return
        }
        respond(req.id, { result: { state: handlers.suspend() } })
        return
      }
      if (req.method === "host.restore") {
        const params = RestoreParamsSchema.safeParse(req.params)
        if (!params.success) {
          respond(req.id, { error: { code: ERR.INVALID_PARAMS, message: "invalid restore params" } })
          return
        }
        handlers.restore?.(params.data.state)
        respond(req.id, { result: {} })
        return
      }
      respond(req.id, { error: { code: ERR.METHOD_NOT_FOUND, message: `unknown host method: ${req.method}` } })
    }

    port.addEventListener("message", onPortMessage)
    port.start?.()

    const call = (method: string, params: unknown): Promise<unknown> =>
      new Promise<unknown>((res, rej) => {
        const id = nextId++
        pending.set(id, { resolve: res, reject: rej })
        port.postMessage({ jsonrpc: "2.0", id, method, params })
      })

    call("tool.ready", { nonce, protocolVersion: PROTOCOL_VERSION }).then(
      (ackRaw) => {
        const ack = ReadyAckSchema.safeParse(ackRaw)
        if (!ack.success) {
          reject(new Error("malformed ready ack from host"))
          return
        }
        readyDone = true
        resolve({
          grantedCaps: ack.data.grantedCaps,
          bearerToken: ack.data.bearerToken,
          call,
          close: () => {
            port.removeEventListener("message", onPortMessage)
            port.close?.()
          },
        })
      },
      (e: unknown) => {
        if (!readyDone) reject(e instanceof Error ? e : new Error("handshake rejected"))
      },
    )
  })
}
