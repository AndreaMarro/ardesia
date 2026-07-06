// @vitest-environment node
//
// Guard statico anti signing-key checked-in (Codex P1.3, review 2026-07-09):
// la chiave PRIVATA dev non deve MAI stare nel repo né finire nel bundle
// client. sim/keys.json può committare SOLO la pubkey; la firma del manifest
// Reference è una fixture prefirmata (sim/manifest.sig.json) — la firma è
// dato PUBBLICO, la chiave che l'ha prodotta no.
//
// Nessun valore di chiave viene mai stampato: gli assert riportano solo
// nomi di file e di campo.

import * as fs from "node:fs"
import * as path from "node:path"
import { describe, expect, it } from "vitest"

// vitest gira SEMPRE da apps/studio → sim/ è relativo alla root del package.
const SIM_DIR = path.resolve(process.cwd(), "sim")

/** Pattern di materiale privato: campo privateKey o blocchi PEM PKCS8. */
const PRIVATE_MATERIAL = /"privateKey"|BEGIN (?:ENCRYPTED )?PRIVATE KEY/

function listFilesRecursive(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFilesRecursive(p))
    else out.push(p)
  }
  return out
}

describe("dev key secret guard (Codex P1.3)", () => {
  it("sim/keys.json contiene SOLO la pubkey (nessun campo privateKey)", () => {
    const keys = JSON.parse(fs.readFileSync(path.join(SIM_DIR, "keys.json"), "utf-8")) as Record<
      string,
      unknown
    >
    expect(Object.keys(keys).sort()).toEqual(["pubkey"])
    expect(String(keys.pubkey).startsWith("ed25519:")).toBe(true)
  })

  it("nessun file testuale in sim/ contiene materiale di chiave privata", () => {
    const textual = listFilesRecursive(SIM_DIR).filter((f) =>
      /\.(json|ts|tsx|js|html|md|sig|txt)$/.test(f),
    )
    expect(textual.length).toBeGreaterThan(0)
    const offenders = textual.filter((f) => PRIVATE_MATERIAL.test(fs.readFileSync(f, "utf-8")))
    // Riporta solo i path, mai il contenuto.
    expect(offenders.map((f) => path.relative(SIM_DIR, f))).toEqual([])
  })

  it("la fixture di firma esiste ed è coerente col manifest source (verifica ed25519 reale)", async () => {
    const manifestJson = fs.readFileSync(path.join(SIM_DIR, "manifest-source.json"), "utf-8")
    const sigDoc = JSON.parse(
      fs.readFileSync(path.join(SIM_DIR, "manifest.sig.json"), "utf-8"),
    ) as { signatureB64: string }
    const manifest = JSON.parse(manifestJson) as { publisher: { pubkey: string } }
    const pubkeyB64 = manifest.publisher.pubkey.replace(/^ed25519:/, "")
    const pub = Uint8Array.from(atob(pubkeyB64), (c) => c.charCodeAt(0))
    const sig = Uint8Array.from(atob(sigDoc.signatureB64), (c) => c.charCodeAt(0))
    const key = await crypto.subtle.importKey(
      "raw",
      pub.buffer as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"],
    )
    const valid = await crypto.subtle.verify(
      "Ed25519",
      key,
      sig.buffer as ArrayBuffer,
      new TextEncoder().encode(manifestJson).buffer as ArrayBuffer,
    )
    expect(valid).toBe(true)
  })
})
