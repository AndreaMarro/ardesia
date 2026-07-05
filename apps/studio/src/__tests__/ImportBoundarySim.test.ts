// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"

// Gate F4 (direzione import): sim/ è core puro e deterministico, non deve mai
// importare da src/ (UI/toolhost). La direzione permessa è src -> sim.
// Nessuna dipendenza nuova: scan fs + regex sugli specifier statici.

const studioRoot = path.resolve(import.meta.dirname, "../..")
const simRoot = path.join(studioRoot, "sim")
const srcRoot = path.join(studioRoot, "src")

function walkTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsFiles(full))
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

function importSpecifiers(filePath: string): string[] {
  const source = fs.readFileSync(filePath, "utf-8")
  const specifiers: string[] = []
  const pattern = /(?:from|import\s*\()\s*["']([^"']+)["']/g
  for (let match = pattern.exec(source); match !== null; match = pattern.exec(source)) {
    specifiers.push(match[1]!)
  }
  return specifiers
}

describe("import boundary: sim/ never imports src/", () => {
  it("finds no sim/ module whose relative import resolves inside src/", () => {
    const violations: string[] = []
    for (const file of walkTsFiles(simRoot)) {
      for (const specifier of importSpecifiers(file)) {
        if (!specifier.startsWith(".")) continue
        const resolved = path.resolve(path.dirname(file), specifier)
        if (resolved === srcRoot || resolved.startsWith(srcRoot + path.sep)) {
          violations.push(`${path.relative(studioRoot, file)} -> ${specifier}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
