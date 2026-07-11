// TOOLHOST-SPEC-v0 §2/§3 — policy.ts: grant deny-by-default + sheet consenso in italiano.
// Il grant NON può MAI eccedere il manifest: la config di ogni capability (quota,
// domini, token) viene SOLO dal manifest, mai dall'approvazione.

import type { Capabilities, CapabilityName, ToolManifest } from "../toolhost-protocol/index.ts"

export const CAPABILITY_LABELS_IT: Readonly<Record<CapabilityName, string>> = {
  "board.read": "Leggere la scena e la selezione sulla lavagna",
  "board.write": "Disegnare e aggiornare i propri riquadri sulla lavagna",
  "graph.query": "Consultare i concetti delle tue lezioni (sola lettura)",
  "graph.proposeClaims": "Proporre osservazioni al motore, marcate come provenienti dal tool",
  "lesson.event.emit": "Registrare eventi didattici verificabili nella lezione",
  "arduino.project": "Leggere e aggiornare il progetto Arduino del proprio post-it",
  "arduino.board.catalog": "Mostrare catalogo board Arduino e FQBN dichiarati",
  "arduino.compile": "Compilare il codice Arduino con provider dichiarati",
  "arduino.upload": "Preparare upload hardware solo dopo conferma umana",
  "arduino.serial": "Leggere seriale solo da provider e porta scelti dal docente",
  storage: "Salvare dati nel proprio spazio dedicato",
  "llm.generate": "Usare l'AI del tuo piano",
  "net.fetch": "Contattare i domini dichiarati, attraverso il proxy controllato",
  ui: "Adattare aspetto e dimensione del proprio riquadro",
}

export interface ConsentItem {
  cap: CapabilityName
  label: string
  /** Dettaglio quantitativo dal manifest (quota, domini, token) — il docente vede i numeri. */
  detail?: string
}

export interface ConsentSheet {
  toolId: string
  toolName: string
  publisherId: string
  blurb: string
  dataOut: "none" | "declared-domains"
  requested: ConsentItem[]
}

export function declaredCaps(manifest: ToolManifest): CapabilityName[] {
  return (Object.keys(manifest.capabilities) as CapabilityName[]).filter(
    (cap) => manifest.capabilities[cap] !== undefined,
  )
}

function detailFor(manifest: ToolManifest, cap: CapabilityName): string | undefined {
  if (cap === "storage") return `fino a ${manifest.capabilities.storage?.quotaMB} MB`
  if (cap === "net.fetch") return `domini: ${manifest.capabilities["net.fetch"]?.domains.join(", ")}`
  if (cap === "llm.generate")
    return `max ${manifest.capabilities["llm.generate"]?.maxTokensPerCall} token per chiamata`
  return undefined
}

/** Sheet permessi mostrato al docente PRIMA del grant (spec §2: consentBlurb i18n). */
export function buildConsentSheet(manifest: ToolManifest, locale = "it"): ConsentSheet {
  const localized = manifest.i18n?.[locale]
  return {
    toolId: manifest.id,
    toolName: localized?.name ?? manifest.name,
    publisherId: manifest.publisher.id,
    blurb: localized?.consentBlurb ?? "",
    dataOut: manifest.privacy.dataOut,
    requested: declaredCaps(manifest).map((cap) => {
      const item: ConsentItem = { cap, label: CAPABILITY_LABELS_IT[cap] }
      const detail = detailFor(manifest, cap)
      if (detail !== undefined) item.detail = detail
      return item
    }),
  }
}

/**
 * Grant deny-by-default: SOLO l'intersezione tra capability dichiarate nel
 * manifest e capability approvate dal docente. Approvare una capability non
 * dichiarata non concede nulla. `ui` è implicita (spec §2) — inerte in v0
 * (nessun metodo ui nel registro wire).
 */
export function resolveGrant(manifest: ToolManifest, approved: readonly CapabilityName[]): Capabilities {
  const grant: Capabilities = {}
  for (const cap of declaredCaps(manifest)) {
    if (approved.includes(cap)) {
      // la config viene dal MANIFEST (validato Zod), mai dall'approvazione
      ;(grant as Record<string, unknown>)[cap] = manifest.capabilities[cap]
    }
  }
  grant.ui = manifest.capabilities.ui ?? {}
  return grant
}

/**
 * Capability-gating hardening (difesa in profondità, spec §2 deny-by-default).
 * `resolveGrant` produce SEMPRE un grant ⊆ manifest, ma il ToolHost accetta un
 * grant arbitrario: un chiamante buggato (o un test malevolo) potrebbe passare
 * una capability NON dichiarata, o con config gonfiata, scavalcando il consenso.
 * Questo guard rifiuta l'escalation alla radice:
 *  - ogni cap del grant (tranne `ui`, implicita per spec §2) DEVE essere nel manifest;
 *  - la config del grant DEVE coincidere byte-a-byte con quella del manifest
 *    (la config viene SOLO dal manifest, mai dall'approvazione).
 * `ui` è esente: `resolveGrant` la inietta sempre ({}), anche se il manifest non
 * la dichiara — è inerte in v0 (nessun metodo wire la usa).
 */
export function assertGrantWithinManifest(manifest: ToolManifest, grant: Capabilities): void {
  for (const cap of Object.keys(grant) as CapabilityName[]) {
    if (grant[cap] === undefined || cap === "ui") continue
    const declared = manifest.capabilities[cap]
    if (declared === undefined) {
      throw new Error(`grant exceeds manifest: capability "${cap}" not declared by tool "${manifest.id}"`)
    }
    if (JSON.stringify(grant[cap]) !== JSON.stringify(declared)) {
      throw new Error(`grant config for "${cap}" does not match manifest of tool "${manifest.id}"`)
    }
  }
}

/** Record del consenso (per session.yaml / registro locale): cosa, per quale versione, quando. */
export interface GrantRecord {
  v: 1
  toolId: string
  toolVersion: string
  granted: CapabilityName[]
  t: number
}

export function createGrantRecord(manifest: ToolManifest, granted: Capabilities, t: number): GrantRecord {
  return {
    v: 1,
    toolId: manifest.id,
    toolVersion: manifest.version,
    granted: (Object.keys(granted) as CapabilityName[]).filter((c) => granted[c] !== undefined),
    t,
  }
}

/**
 * Update con DIFF capabilities ⇒ ri-consenso (spec §2): capability AGGIUNTE o
 * con config CAMBIATA richiedono un nuovo consenso; le rimozioni no.
 */
export function capsRequiringReconsent(oldManifest: ToolManifest, newManifest: ToolManifest): CapabilityName[] {
  const out: CapabilityName[] = []
  for (const cap of declaredCaps(newManifest)) {
    const before = oldManifest.capabilities[cap]
    const after = newManifest.capabilities[cap]
    if (before === undefined || JSON.stringify(before) !== JSON.stringify(after)) out.push(cap)
  }
  return out
}
