// TOOLHOST-SPEC-v0 §9 T4 — bundler per lo skeleton Reference Blink LED tool.
// Genera coppia di chiavi Ed25519, firma il manifest, e produce il bundle
// .maestrotool per l'installer.
// Usage: npx tsx sim/bundle.ts
//
// Output:
//   sim/reference-blink.maestrotool  — zip bundle (entry.html + manifest firma)
//   sim/keys.json               — chiave pubblica (per il manifest) + privata (solo demo)

import { execSync } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SIM_DIR = path.resolve(__dirname, ".")
const MANIFEST_SRC_PATH = path.join(SIM_DIR, "manifest-source.json")
const ENTRY_HTML_PATH = path.join(SIM_DIR, "entry.html")
const BUNDLE_PATH = path.join(SIM_DIR, "reference-blink.maestrotool")
const KEYS_PATH = path.join(SIM_DIR, "keys.json")

interface ManifestSource {
  manifestVersion: 1
  id: string
  name: string
  version: string
  protocol: string
  contract: string
  entry: string
  surfaces: string[]
  capabilities: Record<string, unknown>
  publisher: { id: string; pubkey: string }
  privacy: { dataOut: string }
  settings?: { title: string; ledLabel: string }[]
}

async function main(): Promise<void> {
  // 1. Genera chiave Ed25519
  const keypair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"],
  )
  const pubkeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", keypair.publicKey),
  )
  const pubkeyB64 = btoa(String.fromCharCode(...pubkeyRaw))
  const privkeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", keypair.privateKey),
  )
  const privkeyB64 = btoa(String.fromCharCode(...privkeyRaw))

  // Salva le chiavi (solo demo — in produzione la chiave privata non esce dal publisher)
  fs.writeFileSync(KEYS_PATH, JSON.stringify({ pubkey: `ed25519:${pubkeyB64}`, privateKey: privkeyB64 }, null, 2))

  // 2. Crea manifest source con la pubkey
  const manifestSource: ManifestSource = {
    manifestVersion: 1,
    id: "io.maestro.sim-reference-blink",
    name: "Reference Sim — Blink LED",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    contract: ">=1.0 <2.0",
    entry: "entry.html",
    surfaces: ["board-embed"],
    capabilities: {
      "board.read": {},
      "board.write": { scope: "own-embeds" },
    },
    publisher: {
      id: "maestro-sdk",
      pubkey: `ed25519:${pubkeyB64}`,
    },
    privacy: {
      dataOut: "none",
    },
    // settings: tool IMMUTABILE — solo settings esposti, non fork
    // settings: [
    //   { title: "LED Label", ledLabel: "LED1" },
    // ],
  }

  const manifestJson = JSON.stringify(manifestSource)
  fs.writeFileSync(MANIFEST_SRC_PATH, manifestJson)

  // 3. Firma i byte del manifest (esattamente come fa il publisher)
  const msg = new TextEncoder().encode(manifestJson)
  const sigRaw = new Uint8Array(await crypto.subtle.sign("Ed25519", keypair.privateKey, msg))
  const sigB64 = btoa(String.fromCharCode(...sigRaw))

  // 4. Crea il bundle zip con entry.html
  // Il bundle zip contiene SOLO entry.html (il manifest va separato per l'installer)
  // Zip structure:
  //   entry.html    — il tool UI
  execSync(`cd "${SIM_DIR}" && zip -q "${BUNDLE_PATH}" entry.html`, { stdio: "inherit" })

  // 5. Stampa il riepilogo
  console.log(`\n=== Reference Sim tool bundled ===`)
  console.log(`Tool ID:  io.maestro.sim-reference-blink`)
  console.log(`Pubkey:   ed25519:${pubkeyB64}`)
  console.log(`Sign:     ${sigB64}`)
  console.log(`Bundle:   ${BUNDLE_PATH} (${fs.statSync(BUNDLE_PATH).size} bytes)`)
  console.log(`Keys:     ${KEYS_PATH}`)
  console.log(`\nInstall command (from code):`)
  console.log(`  installTool(store, manifestJson, bundleZip, signatureB64)`)
  console.log(`  dove manifestJson = fs.readFileSync("sim/manifest-source.json", "utf-8")`)
  console.log(`  bundleZip = new Blob([fs.readFileSync("sim/reference-blink.maestrotool")])`)
  console.log(`  signatureB64 = "${sigB64}"`)
}

main().catch(console.error)
