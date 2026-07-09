// PLUGIN-SDK Layer-0 — confine STABILE versionato ToolHost <-> plugin.
//
// Questo modulo è l'UNICO punto di import per un autore di plugin: consolida il
// contratto wire (toolhost-protocol) e il runtime lato-tool (toolsdk) in una
// superficie tipizzata, curata e versionata con SemVer. Tutto ciò che NON è
// ri-esportato qui è interno e può cambiare senza preavviso.
//
// I quattro pilastri del contratto (TOOLHOST-SPEC-v0):
//   1. manifest         — forma del manifest del plugin (Zod .strict)
//   2. capabilities     — vocabolario CHIUSO deny-by-default
//   3. message-protocol — metodi wire tool->host (JSON-RPC 2.0) + codici errore
//   4. lifecycle        — handshake (host.hello/tool.ready) + suspend/restore
//
// REGOLA SemVer del contratto:
//   - MAJOR: rimozione/rinomina di un metodo wire, di una capability, di un
//            codice errore, o break dello handshake (un plugin esistente smette
//            di funzionare).
//   - MINOR: aggiunta retro-compatibile (nuovo metodo/capability opzionale).
//   - PATCH: chiarimenti che non cambiano la superficie.
// CONTRACT (sotto) è DERIVATO dai moduli vivi: la suite di compatibilità lo
// confronta con un golden congelato, così un drift accidentale è RED e impone
// una decisione SemVer cosciente.

import { CapabilitiesSchema } from "../toolhost-protocol/capabilities.ts"
import { ERR, TOOL_METHODS } from "../toolhost-protocol/messages.ts"
import { ToolManifestSchema } from "../toolhost-protocol/manifest.ts"
import { PROTOCOL_VERSION } from "../toolhost-protocol/version.ts"
import type { CapabilityName } from "../toolhost-protocol/capabilities.ts"
import type { ToolManifest } from "../toolhost-protocol/manifest.ts"

// ---- Versione del CONTRATTO SDK (distinta dal PROTOCOL_VERSION del wire) ----
// Il protocollo è la grammatica dei messaggi sul filo; il contratto è l'intera
// superficie pubblica che un plugin compila contro. Possono evolvere insieme o
// separatamente (es. un nuovo helper SDK = MINOR del contratto, wire invariato).
// 1.2.0 — MINOR: nuovo metodo wire retro-compatibile `lesson.event.emit`:
// append controllato di eventi didattici verificabili nel log LessonOS. Nessun
// metodo, capability o codice errore esistente è cambiato.
// 1.1.0 — MINOR: nuovo metodo wire retro-compatibile `graph.query` (P0-D):
// vista READ-ONLY sul grafo LessonOS derivato dall'event-log.
export const CONTRACT_VERSION = "1.2.0"

// ---- Descrittore macchina-verificabile del contratto (i 4 pilastri) --------

/** Vocabolario capability (pilastro 2), ordinato per stabilità del confronto. */
function capabilityVocabulary(): readonly CapabilityName[] {
  return Object.freeze((Object.keys(CapabilitiesSchema.shape) as CapabilityName[]).sort())
}

/** Metodi wire tool->host (pilastro 3) -> capability richiesta, derivati dal registro host. */
function toolMethodMap(): Readonly<Record<string, CapabilityName>> {
  const out: Record<string, CapabilityName> = {}
  for (const method of Object.keys(TOOL_METHODS).sort()) {
    out[method] = TOOL_METHODS[method].cap
  }
  return Object.freeze(out)
}

export interface ContractDescriptor {
  readonly contractVersion: string
  readonly protocolVersion: string
  readonly manifestVersion: 1
  readonly capabilities: readonly CapabilityName[]
  readonly toolMethods: Readonly<Record<string, CapabilityName>>
  readonly lifecycleMethods: readonly string[]
  readonly errorCodes: Readonly<Record<string, number>>
}

/**
 * Snapshot vivo del contratto. Derivato dai moduli reali (CapabilitiesSchema,
 * TOOL_METHODS, ERR, PROTOCOL_VERSION): NON può divergere dall'implementazione
 * dell'host. La suite di compatibilità lo congela contro un golden.
 */
export const CONTRACT: ContractDescriptor = Object.freeze({
  contractVersion: CONTRACT_VERSION,
  protocolVersion: PROTOCOL_VERSION,
  manifestVersion: 1,
  capabilities: capabilityVocabulary(),
  toolMethods: toolMethodMap(),
  // host->tool: hello (notifica) + tool.ready (eco-nonce) + lifecycle suspend/restore
  lifecycleMethods: Object.freeze(["host.hello", "tool.ready", "host.suspend", "host.restore"]),
  errorCodes: Object.freeze({ ...ERR }),
})

/**
 * Autorazione type-safe + validata di un manifest. L'autore ottiene autocomplete
 * sul tipo ToolManifest e un fail-fast a runtime (Zod .strict) se il manifest
 * viola il contratto. Ritorna il manifest validato (parse, non solo type-cast).
 */
export function defineManifest(manifest: ToolManifest): ToolManifest {
  return ToolManifestSchema.parse(manifest)
}

// ---- Pilastro 1: manifest --------------------------------------------------
export { ToolManifestSchema, SurfaceSchema, isValidToolId } from "../toolhost-protocol/manifest.ts"
export type { ToolManifest } from "../toolhost-protocol/manifest.ts"

// ---- Pilastro 2: capabilities ----------------------------------------------
export { CapabilitiesSchema, isGranted } from "../toolhost-protocol/capabilities.ts"
export type { Capabilities, CapabilityName } from "../toolhost-protocol/capabilities.ts"

// ---- Pilastro 3: message-protocol ------------------------------------------
export {
  ERR,
  TOOL_METHODS,
  isValidStorageKey,
  RequestIdSchema,
  JsonRpcRequestSchema,
  JsonRpcResponseSchema,
} from "../toolhost-protocol/messages.ts"
export type { MethodSpec, RequestId, JsonRpcRequest, JsonRpcResponse } from "../toolhost-protocol/messages.ts"

// ---- Pilastro 4: lifecycle / versioning ------------------------------------
export {
  PROTOCOL_VERSION,
  parseVersion,
  protocolSatisfies,
  isValidProtocolRange,
} from "../toolhost-protocol/version.ts"
export type { HostHelloParams, ReadyAck } from "../toolhost-protocol/messages.ts"

// ---- Runtime lato-tool (l'SDK che il plugin esegue nell'iframe) ------------
export { connectTool } from "../toolsdk/connect.ts"
export type { ToolConnection, ToolHandlers, ConnectOptions, WindowLike } from "../toolsdk/connect.ts"
