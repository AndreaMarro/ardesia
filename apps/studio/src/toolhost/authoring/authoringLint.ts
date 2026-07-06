// P0-D authoring — lint automatico manifest+entry PRIMA di firmare/spedire.
//
// NON è un gate di sicurezza, e — ONESTÀ — oggi NON esiste nemmeno un
// enforcement runtime dietro i flag rete/risorse: l'iframe ToolLab è srcDoc
// allow-same-origin SENZA CSP, quindi script/risorse esterne CARICANO e
// fetch( ESCE. Il lint verifica la POLICY DICHIARATA (manifest + regole di
// authoring, tool self-contained); l'enforcement reale (origin dedicata +
// CSP vera) è ADR-0001, PROPOSED, gate Andrea. Vocabolario flag CHIUSO, ogni
// check falsificabile. Severity: "error" (viola la policy dichiarata) ·
// "warn" (probabilmente non fa ciò che l'autore crede) · "info"
// (suggerimento). ok = nessun error (warn/info non bloccano).

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

// Attributi src/href con URL assoluto http(s) — contro la policy dichiarata
// (tool self-contained). NB: oggi l'iframe srcDoc NON ha CSP e la risorsa
// caricherebbe comunque; il blocco vero arriva con ADR-0001.
const EXTERNAL_SCRIPT_RE = /<script\b[^>]*\bsrc\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi
const EXTERNAL_RESOURCE_RE = /<(?!script\b)[a-z][a-z0-9-]*\b[^>]*\b(?:src|href)\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi

export function lintAuthoring(manifest: ToolManifest, entryHtml: string): AuthoringLintReport {
  const flags: AuthoringLintFlag[] = []

  for (const match of entryHtml.matchAll(EXTERNAL_SCRIPT_RE)) {
    flags.push({
      code: "entry-external-script",
      severity: "error",
      detail: `script esterno contro la policy dichiarata (tool self-contained; oggi nessuna CSP lo blocca, enforcement = ADR-0001): ${match[1]}`,
    })
  }

  for (const match of entryHtml.matchAll(EXTERNAL_RESOURCE_RE)) {
    flags.push({
      code: "entry-external-resource",
      severity: "warn",
      detail: `risorsa esterna contro la policy dichiarata (oggi nessuna CSP la blocca, enforcement = ADR-0001): ${match[1]}`,
    })
  }

  if (/\bfetch\s*\(/.test(entryHtml) && !isGranted(manifest.capabilities, "net.fetch")) {
    flags.push({
      code: "net-fetch-undeclared",
      severity: "warn",
      detail:
        'l\'entry usa fetch( ma il manifest non dichiara "net.fetch": contro la policy deny-by-default (oggi srcDoc senza CSP non la blocca, enforcement = ADR-0001)',
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
