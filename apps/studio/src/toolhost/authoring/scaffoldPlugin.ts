// P0-D authoring — scaffoldPlugin: dalla spec minima di un autore a un plugin
// COMPLETO che passa la pipeline reale install→gate (PluginManager/installTool):
// manifest Zod-valido firmato ed25519 sui byte originali + entry.html che parla
// il lifecycle wire (host.hello → tool.ready) + bundle .maestrotool.
//
// Fail-closed by construction:
//   - kind "core" NON authorabile (il core non passa dal marketplace)
//   - id validato con la STESSA grammatica reverse-DNS del manifest
//   - capabilities validate con CapabilitiesSchema .strict (vocabolario chiuso,
//     deny-by-default: spec senza capabilities → {})
//   - privacy DERIVATA: net.fetch presente → "declared-domains", altrimenti "none"
//     (la refine del manifest resta l'autorità; qui si genera già conforme)
//   - self-check: il manifest generato è ri-parsato con ToolManifestSchema PRIMA
//     della firma — uno scaffold invalido non esce mai firmato
//
// Le chiavi generate qui sono DEV/LOCALI (stessa disciplina di sim/keys.json):
// un plugin di marketplace arriva firmato offline dal publisher.

import { z } from "zod"
import { CapabilitiesSchema } from "../../toolhost-protocol/capabilities.ts"
import type { Capabilities } from "../../toolhost-protocol/capabilities.ts"
import {
  ToolManifestSchema,
  SurfaceSchema,
  isValidToolId,
} from "../../toolhost-protocol/manifest.ts"
import type { ToolManifest } from "../../toolhost-protocol/manifest.ts"
import { buildStoreZip } from "./storeZip.ts"

// ---- Chiavi dev ----

export interface DevKeypair {
  /** Chiave pubblica ed25519 raw, base64 (senza prefisso "ed25519:"). */
  pubkeyB64: string
  /** Chiave privata PKCS8 base64 — SOLO sviluppo locale, mai in un bundle. */
  privateKeyPkcs8B64: string
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/** Genera una coppia di chiavi Ed25519 dev (WebCrypto reale). */
export async function generateDevKeypair(): Promise<DevKeypair> {
  const keypair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ])
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey))
  const priv = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keypair.privateKey))
  return { pubkeyB64: bytesToBase64(pub), privateKeyPkcs8B64: bytesToBase64(priv) }
}

// ---- Spec dell'autore ----

// "core" escluso DALLA GRAMMATICA: la gerarchia del canon riserva core al
// repository, non al marketplace/authoring.
const ScaffoldKindSchema = z.enum(["plugin", "pack", "workflow"])

export const ScaffoldSpecSchema = z.strictObject({
  id: z.string(),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  kind: ScaffoldKindSchema.optional(),
  surfaces: z.array(SurfaceSchema).min(1).optional(),
  capabilities: CapabilitiesSchema.optional(),
  publisherId: z.string().min(1).optional(),
  // Campi marketplace (#72), passthrough opzionale: stessa forma del manifest
  // (la grammatica resta UNA — quella di ToolManifestSchema, ri-validata al
  // self-check pre-firma). Assenza = manifest legacy, nessuna chiave emessa.
  author: z
    .strictObject({
      name: z.string().min(1).max(100),
      url: z.string().url().optional(),
    })
    .optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  license: z.string().min(1).max(100).optional(),
})
export type ScaffoldSpec = z.infer<typeof ScaffoldSpecSchema>

export interface ScaffoldOutput {
  /** Byte ESATTI firmati: sono questi che installTool verifica. */
  manifestJson: string
  signatureB64: string
  entryHtml: string
  /** Bundle .maestrotool (zip store-only con entry.html). */
  bundleZip: Blob
  manifest: ToolManifest
}

// ---- Template entry ----

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

type ScaffoldSurface = "board-embed" | "panel" | "fullscreen"

/**
 * Entry differenziata per surface, ma sempre un plugin REALE: handshake del
 * protocollo (host.hello via window.postMessage con MessagePort nei
 * transferables → tool.ready sulla porta con ECO del nonce; il bearer arriva
 * solo nel result). Il template board-embed insegna il pattern corretto per
 * board.read: JSON-RPC sulla porta, GUARDATA da grantedCaps — deny-by-default,
 * il bottone si abilita solo a capability concessa.
 */
function buildEntryHtml(name: string, surface: ScaffoldSurface): string {
  const safeName = escapeHtml(name)
  const fullscreenCss =
    surface === "fullscreen"
      ? "\n  html, body { height: 100%; }\n  body { min-height: 100vh; display: flex; flex-direction: column; }"
      : ""
  const boardDemoHtml =
    surface === "board-embed"
      ? '\n<button id="btnRead" disabled>Leggi la scena</button>\n<p class="status" id="boardOut"></p>'
      : ""
  const boardDemoJs =
    surface === "board-embed"
      ? `
      // Demo board.read: abilitata SOLO se la capability è stata concessa
      // (grantedCaps dal result di tool.ready). Pattern JSON-RPC sulla porta.
      var btnRead = document.getElementById('btnRead');
      var boardOut = document.getElementById('boardOut');
      var nextId = 2;
      function onGranted(grantedCaps) {
        if (!grantedCaps || grantedCaps["board.read"] === undefined) return;
        btnRead.disabled = false;
        btnRead.addEventListener('click', function () {
          var id = 'req-' + nextId++;
          var onResult = function (e) {
            var msg = e.data;
            if (!msg || msg.id !== id) return;
            port.removeEventListener('message', onResult);
            if (msg.result) boardOut.textContent = 'elementi in scena: ' + msg.result.elements.length;
            else boardOut.textContent = 'errore: ' + (msg.error && msg.error.message);
          };
          port.addEventListener('message', onResult);
          port.postMessage({ jsonrpc: '2.0', id: id, method: "board.read", params: { target: "scene" } });
        });
      }`
      : `
      function onGranted() {}`
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeName}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #faf9f6; color: #2c2825; padding: 16px; }
  h1 { font-size: 16px; margin-bottom: 8px; }
  .status { font-size: 12px; color: #8a8682; }${fullscreenCss}
</style>
</head>
<body data-surface="${surface}">
<h1>${safeName}</h1>
<p class="status" id="status">in attesa dello handshake…</p>${boardDemoHtml}
<script>
(function() {
  'use strict';
  var port = null;
  var statusEl = document.getElementById('status');
  function setStatus(msg) { statusEl.textContent = msg; }
${boardDemoJs}

  // Handshake TOOLHOST: host.hello arriva su window con la MessagePort;
  // tool.ready risponde SULLA PORTA ecoando il nonce. Mai token in URL.
  window.addEventListener('message', function onHello(ev) {
    var data = ev.data;
    if (!data || typeof data !== 'object') return;
    if (data.method === 'host.hello' && ev.ports && ev.ports.length > 0) {
      port = ev.ports[0];
      var params = data.params || {};
      port.addEventListener('message', function onReady(e) {
        var msg = e.data;
        if (msg && msg.id === 'ready-1' && msg.result) {
          port.removeEventListener('message', onReady);
          // result di tool.ready: bearer + capabilities concesse
          setStatus('pronto — capabilities: ' + Object.keys(msg.result.grantedCaps || {}).join(', '));
          onGranted(msg.result.grantedCaps);
        }
      });
      port.start();
      port.postMessage({
        jsonrpc: '2.0',
        id: 'ready-1',
        method: 'tool.ready',
        params: { nonce: params.nonce || '', protocolVersion: params.protocolVersion || '' },
      });
      setStatus('handshake inviato…');
      window.removeEventListener('message', onHello);
    }
  });
})();
</script>
</body>
</html>
`
}

// ---- Scaffold ----

async function signManifestBytes(
  manifestJson: string,
  privateKeyPkcs8B64: string,
): Promise<string> {
  const pkcs8 = base64ToBytes(privateKeyPkcs8B64)
  const keyData: ArrayBuffer = pkcs8.buffer.slice(
    pkcs8.byteOffset,
    pkcs8.byteOffset + pkcs8.byteLength,
  ) as ArrayBuffer
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "Ed25519" },
    false,
    ["sign"],
  )
  const sig = new Uint8Array(
    await crypto.subtle.sign("Ed25519", privateKey, new TextEncoder().encode(manifestJson)),
  )
  return bytesToBase64(sig)
}

/**
 * Genera un plugin completo dalla spec. Output pronto per
 * `PluginManager.install(manifestJson, bundleZip, signatureB64)`.
 * Deterministico: stessa spec + stesse chiavi → stessi byte.
 */
export async function scaffoldPlugin(
  spec: ScaffoldSpec,
  keys: DevKeypair,
): Promise<ScaffoldOutput> {
  // La spec è la superficie utente: parse strict PRIMA di ogni derivazione.
  // ScaffoldKindSchema esclude "core" per costruzione; il messaggio esplicita.
  if ((spec as { kind?: string }).kind === "core") {
    throw new Error('kind "core" is not authorable: core belongs to the repository, not the marketplace')
  }
  const parsed = ScaffoldSpecSchema.parse(spec)
  if (!isValidToolId(parsed.id)) {
    throw new Error(`invalid tool id (reverse-DNS required): "${parsed.id}"`)
  }

  const capabilities: Capabilities = parsed.capabilities ?? {}
  const dataOut = capabilities["net.fetch"] !== undefined ? "declared-domains" : "none"

  // Ordine di inserimento chiavi FISSO → JSON.stringify deterministico.
  const manifestObj = {
    manifestVersion: 1 as const,
    id: parsed.id,
    name: parsed.name,
    version: parsed.version ?? "0.1.0",
    protocol: ">=1.0 <2.0",
    contract: ">=1.0 <2.0",
    kind: parsed.kind ?? ("plugin" as const),
    // Marketplace (#72): emessi SOLO se dichiarati (assenza = legacy).
    ...(parsed.author !== undefined ? { author: parsed.author } : {}),
    ...(parsed.visibility !== undefined ? { visibility: parsed.visibility } : {}),
    ...(parsed.license !== undefined ? { license: parsed.license } : {}),
    entry: "entry.html",
    surfaces: parsed.surfaces ?? (["panel"] as const),
    capabilities,
    publisher: {
      id: parsed.publisherId ?? "dev-local",
      pubkey: `ed25519:${keys.pubkeyB64}`,
    },
    privacy: { dataOut },
  }

  // Self-check: nessuno scaffold invalido esce firmato.
  const manifest = ToolManifestSchema.parse(manifestObj)
  const manifestJson = JSON.stringify(manifestObj)

  const signatureB64 = await signManifestBytes(manifestJson, keys.privateKeyPkcs8B64)
  // Surface primaria = la PRIMA dichiarata: decide il template dell'entry.
  const primarySurface: ScaffoldSurface = (parsed.surfaces ?? ["panel"])[0]
  const entryHtml = buildEntryHtml(parsed.name, primarySurface)
  const zipBytes = buildStoreZip([
    { path: "entry.html", data: new TextEncoder().encode(entryHtml) },
  ])
  const zipBuffer: ArrayBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength,
  ) as ArrayBuffer
  const bundleZip = new Blob([zipBuffer], { type: "application/zip" })

  return { manifestJson, signatureB64, entryHtml, bundleZip, manifest }
}
