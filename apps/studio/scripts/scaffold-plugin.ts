// P0-D authoring — CLI scaffolder: dalla spec a un plugin installabile.
// Usage: npx tsx scripts/scaffold-plugin.ts --id io.esempio.mio-tool --name "Mio Tool" \
//          [--surface panel|board-embed|fullscreen] [--kind plugin|pack|workflow] \
//          [--publisher dev-local] --out <dir>
//
// Output in <dir>:
//   manifest.json        — byte ESATTI firmati (quelli che installTool verifica)
//   signature.txt        — firma ed25519 base64 del manifest
//   entry.html           — entry con handshake wire reale (host.hello → tool.ready)
//   bundle.maestrotool   — zip store-only con entry.html
//   keys.dev.json        — coppia di chiavi DEV (mai distribuire la privata)
//
// Stessa disciplina di sim/bundle.ts: chiavi generate localmente, firma sui
// byte originali del manifest. Un plugin di marketplace arriva firmato offline.

import * as fs from "node:fs"
import * as path from "node:path"
import {
  generateDevKeypair,
  scaffoldPlugin,
  ScaffoldSpecSchema,
} from "../src/toolhost/authoring/scaffoldPlugin.ts"
import { buildPluginPackage } from "../src/toolhost/authoring/packageFile.ts"

function parseArgs(argv: string[]): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("--")) continue
    const key = a.slice(2)
    const value = argv[i + 1]
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for --${key}`)
    }
    i++
    if (key === "surface") {
      const prev = out[key]
      out[key] = Array.isArray(prev) ? [...prev, value] : prev ? [prev as string, value] : [value]
    } else {
      out[key] = value
    }
  }
  return out
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const outDir = args.out as string | undefined
  if (!outDir) throw new Error("--out <dir> is required")

  const surfaces = args.surface
    ? (Array.isArray(args.surface) ? args.surface : [args.surface])
    : undefined

  // La validazione vera è dentro scaffoldPlugin (spec strict + self-check
  // manifest): il CLI passa solo la spec, nessuna seconda grammatica.
  const spec = ScaffoldSpecSchema.parse({
    id: args.id,
    name: args.name,
    ...(args.version ? { version: args.version } : {}),
    ...(args.kind ? { kind: args.kind } : {}),
    ...(surfaces ? { surfaces } : {}),
    ...(args.publisher ? { publisherId: args.publisher } : {}),
  })

  const keys = await generateDevKeypair()
  const out = await scaffoldPlugin(spec, keys)

  fs.mkdirSync(outDir, { recursive: true })
  const write = (name: string, data: string | Uint8Array) => {
    fs.writeFileSync(path.join(outDir, name), data)
  }
  write("manifest.json", out.manifestJson)
  write("signature.txt", out.signatureB64)
  write("entry.html", out.entryHtml)
  write("bundle.maestrotool", new Uint8Array(await out.bundleZip.arrayBuffer()))
  // Package v1: UN file condivisibile (manifest + firma + bundle) per
  // installPluginPackage — passa comunque dalla pipeline reale.
  write("package.maestrotool", new Uint8Array(await buildPluginPackage(out).arrayBuffer()))
  write(
    "keys.dev.json",
    JSON.stringify(
      {
        warning: "CHIAVI DEV LOCALI — non distribuire la chiave privata",
        pubkey: `ed25519:${keys.pubkeyB64}`,
        privateKeyPkcs8B64: keys.privateKeyPkcs8B64,
      },
      null,
      2,
    ),
  )

  console.log(`=== plugin scaffolded ===`)
  console.log(`id:        ${out.manifest.id}`)
  console.log(`kind:      ${out.manifest.kind}`)
  console.log(`surfaces:  ${out.manifest.surfaces.join(", ")}`)
  console.log(`privacy:   ${out.manifest.privacy.dataOut}`)
  console.log(`out:       ${path.resolve(outDir)}`)
  console.log(`install:   PluginManager.install(manifest.json, bundle.maestrotool, signature.txt)`)
  console.log(`package:   installPluginPackage(store, package.maestrotool) — un solo file`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
