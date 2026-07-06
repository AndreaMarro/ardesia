// P0-D authoring — test harness dello HANDSHAKE per autori di plugin: il lato
// host simulato consegna host.hello (nonce FRESCO per run, porta nei
// transferables) e verifica che il tool risponda tool.ready SULLA PORTA con
// l'eco esatto del nonce, entro il timeout. Al ready valido consegna il
// ReadyAck (bearer di PROVA + caps richieste), come farebbe l'host vero.
//
// Perché: un autore può verificare la sua entry senza bootare Studio — e ogni
// modo di sbagliare l'handshake ha il SUO check che fallisce (falsificabile):
//   tool-ready-received   — una richiesta è arrivata sulla porta nel timeout
//   ready-well-formed     — la richiesta è tool.ready con params a schema
//   nonce-echoed          — il nonce ecoato è ESATTAMENTE quello inviato
//   no-out-of-band-reply  — niente risposte fuori dalla porta (pin T1:
//                           handshake sulla MessagePort, MAI token in window)
//
// Il contratto è quello REALE: schemi zod di toolhost-protocol/messages.

import { z } from "zod"
import {
  HostHelloParamsSchema,
  ToolReadyParamsSchema,
} from "../../toolhost-protocol/messages.ts"
import type { HostHello } from "../../toolhost-protocol/messages.ts"
import { PROTOCOL_VERSION } from "../../toolhost-protocol/version.ts"
import type { Capabilities } from "../../toolhost-protocol/capabilities.ts"

export type HarnessCheckId =
  | "tool-ready-received"
  | "ready-well-formed"
  | "nonce-echoed"
  | "no-out-of-band-reply"

export interface HarnessCheck {
  id: HarnessCheckId
  pass: boolean
  detail?: string
}

export interface HandshakeHarnessReport {
  /** true = tutti i check pass. */
  ok: boolean
  checks: HarnessCheck[]
}

/**
 * Bersaglio del harness: come consegnare host.hello al tool. Per un iframe
 * reale usare `iframeHarnessTarget`; nei test un target scriptato.
 */
export interface HarnessToolTarget {
  deliverHello(hello: HostHello, port: MessagePort): void
  /**
   * Facoltativo: osservatore dei messaggi FUORI-canale (es. window.postMessage
   * del tool verso il parent). Qualunque messaggio qui durante l'handshake fa
   * fallire no-out-of-band-reply.
   */
  onOutOfBandMessage?(cb: (data: unknown) => void): () => void
}

export interface HandshakeHarnessOptions {
  timeoutMs?: number
  grantedCaps?: Capabilities
  theme?: "light" | "dark"
  locale?: string
}

const ToolReadyRequestSchema = z.strictObject({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  method: z.literal("tool.ready"),
  params: ToolReadyParamsSchema,
})

function freshNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
}

/** Target per un iframe REALE (browser): hello via postMessage, out-of-band = window. */
export function iframeHarnessTarget(iframe: HTMLIFrameElement): HarnessToolTarget {
  return {
    deliverHello(hello, port) {
      iframe.contentWindow?.postMessage(hello, "*", [port])
    },
    onOutOfBandMessage(cb) {
      const listener = (ev: MessageEvent) => {
        if (ev.source === iframe.contentWindow) cb(ev.data)
      }
      window.addEventListener("message", listener)
      return () => window.removeEventListener("message", listener)
    },
  }
}

/** Esegue l'handshake contro il target e ritorna il report dei check. */
export async function runHandshakeHarness(
  target: HarnessToolTarget,
  options: HandshakeHarnessOptions = {},
): Promise<HandshakeHarnessReport> {
  const timeoutMs = options.timeoutMs ?? 2_000
  const nonce = freshNonce()
  const helloParams = HostHelloParamsSchema.parse({
    protocolVersion: PROTOCOL_VERSION,
    grantedCaps: options.grantedCaps ?? {},
    nonce,
    theme: options.theme ?? "light",
    locale: options.locale ?? "it",
  })
  const hello: HostHello = { jsonrpc: "2.0", method: "host.hello", params: helloParams }

  const channel = new MessageChannel()
  const outOfBand: unknown[] = []
  const stopOutOfBand = target.onOutOfBandMessage?.((data) => outOfBand.push(data)) ?? (() => {})

  const firstMessage = new Promise<unknown | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs)
    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      resolve(event.data)
    }
  })

  target.deliverHello(hello, channel.port2)
  const received = await firstMessage
  // Finestra breve perché eventuali messaggi fuori-canale già emessi arrivino
  // (la consegna postMessage è asincrona anche quando il tool è sincrono).
  await new Promise((resolve) => setTimeout(resolve, 0))
  stopOutOfBand()

  const checks: HarnessCheck[] = []
  checks.push({
    id: "tool-ready-received",
    pass: received !== null,
    ...(received === null ? { detail: `nessun messaggio sulla porta entro ${timeoutMs}ms` } : {}),
  })

  const parsed = received === null ? null : ToolReadyRequestSchema.safeParse(received)
  checks.push({
    id: "ready-well-formed",
    pass: parsed?.success === true,
    ...(parsed !== null && !parsed.success
      ? { detail: parsed.error.issues[0]?.message ?? "schema" }
      : {}),
  })

  const echoedOk = parsed?.success === true && parsed.data.params.nonce === nonce
  checks.push({
    id: "nonce-echoed",
    pass: echoedOk,
    ...(parsed?.success === true && !echoedOk ? { detail: "nonce diverso da quello inviato" } : {}),
  })

  checks.push({
    id: "no-out-of-band-reply",
    pass: outOfBand.length === 0,
    ...(outOfBand.length > 0
      ? { detail: `${outOfBand.length} messaggio/i fuori dalla porta durante l'handshake` }
      : {}),
  })

  // Handshake valido → ReadyAck come l'host vero (bearer di PROVA, mai reale).
  if (parsed?.success === true && echoedOk) {
    channel.port1.postMessage({
      jsonrpc: "2.0",
      id: parsed.data.id,
      result: { bearerToken: "harness-test-bearer", grantedCaps: helloParams.grantedCaps },
    })
  }

  channel.port1.close()

  return { ok: checks.every((c) => c.pass), checks }
}
