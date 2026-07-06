// P0-D authoring — lint automatico manifest+entry PRIMA di firmare/spedire.
//
// NON è un gate di sicurezza: sandbox, CSP srcDoc e capability deny-by-default
// restano l'autorità a runtime. È il feedback di authoring che spiega COSA si
// romperà e PERCHÉ, così l'autore non scopre a runtime che la CSP ha bloccato
// il suo CDN o che fetch è negata. Vocabolario flag CHIUSO, ogni check
// falsificabile. Severity: "error" (si romperà di sicuro) · "warn"
// (probabilmente non fa ciò che l'autore crede) · "info" (suggerimento).
// ok = nessun error (warn/info non bloccano).

import type { ToolManifest } from "../../toolhost-protocol/index.ts"
import { isGranted } from "../../toolhost-protocol/capabilities.ts"

export type AuthoringLintSeverity = "error" | "warn" | "info"

export type AuthoringLintCode =
  | "entry-external-script"
  | "entry-external-resource"
  | "net-fetch-undeclared"
  | "board-caps-missing"

export type AuthoringLintFlag = {
  code: AuthoringLintCode
  severity: AuthoringLintSeverity
  detail: string
}

export type AuthoringLintReport = {
  /** false SOLO in presenza di flag error. */
  ok: boolean
  flags: AuthoringLintFlag[]
}

// Attributi src/href con URL assoluto http(s) — l'entry gira in un iframe
// srcDoc same-origin con CSP chiusa: qualunque risorsa esterna non arriverà.
const EXTERNAL_SCRIPT_RE = /<script\b[^>]*\bsrc\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi
const EXTERNAL_RESOURCE_RE = /<(?!script\b)[a-z][a-z0-9-]*\b[^>]*\b(?:src|href)\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi

export function lintAuthoring(manifest: ToolManifest, entryHtml: string): AuthoringLintReport {
  const flags: AuthoringLintFlag[] = []

  for (const match of entryHtml.matchAll(EXTERNAL_SCRIPT_RE)) {
    flags.push({
      code: "entry-external-script",
      severity: "error",
      detail: `la CSP dell'host bloccherà lo script esterno: ${match[1]}`,
    })
  }

  for (const match of entryHtml.matchAll(EXTERNAL_RESOURCE_RE)) {
    flags.push({
      code: "entry-external-resource",
      severity: "warn",
      detail: `risorsa esterna che la CSP dell'host bloccherà: ${match[1]}`,
    })
  }

  if (/\bfetch\s*\(/.test(entryHtml) && !isGranted(manifest.capabilities, "net.fetch")) {
    flags.push({
      code: "net-fetch-undeclared",
      severity: "warn",
      detail:
        'l\'entry usa fetch( ma il manifest non dichiara "net.fetch": la rete è deny-by-default e la chiamata fallirà',
    })
  }

  if (
    manifest.surfaces.includes("board-embed") &&
    !isGranted(manifest.capabilities, "board.read") &&
    !isGranted(manifest.capabilities, "board.write")
  ) {
    flags.push({
      code: "board-caps-missing",
      severity: "info",
      detail:
        'surface "board-embed" senza board.read/board.write: il tool vivrà sulla lavagna senza poterla né leggere né scrivere',
    })
  }

  return { ok: flags.every((flag) => flag.severity !== "error"), flags }
}
