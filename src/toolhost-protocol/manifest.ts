import { z } from "zod"
import { CapabilitiesSchema } from "./capabilities.ts"
import { isValidProtocolRange } from "./version.ts"

// TOOLHOST-SPEC-v0 §2: manifest Zod .strict — chiavi sconosciute = REJECT
// (lezione supply-chain: niente superficie non dichiarata).
const SEMVER_RE = /^\d+\.\d+\.\d+$/
const REVERSE_DNS_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/

/** Grammatica UNICA del tool id (reverse-DNS): usata da manifest, audit path e origin loopback. */
export function isValidToolId(id: string): boolean {
  return REVERSE_DNS_RE.test(id)
}
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/

// Stessa lezione ZipSlip di lessonBundle: path relativo, nessun segmento "..", niente assoluti.
function isSafeEntryPath(p: string): boolean {
  if (p.startsWith("/") || p.includes("\\")) return false
  const segments = p.split("/")
  return segments.every((s) => s !== "" && s !== "..")
}

export const SurfaceSchema = z.enum(["board-embed", "panel", "fullscreen"])

export const ToolManifestSchema = z.strictObject({
  manifestVersion: z.literal(1),
  id: z.string().regex(REVERSE_DNS_RE),
  name: z.string().min(1).max(100),
  version: z.string().regex(SEMVER_RE),
  protocol: z.string().refine(isValidProtocolRange, { message: "invalid protocol range" }),
  // Range di CONTRATTO SDK (Layer-0) richiesto all'host. Asse DISTINTO dal `protocol`
  // del wire (CONTRACT_VERSION != PROTOCOL_VERSION): qui il plugin dichiara quale
  // versione del contratto SDK gli serve. Opzionale -> assenza = nessun gate
  // (manifest legacy invariati). Stessa grammatica-range di `protocol`.
  contract: z.string().refine(isValidProtocolRange, { message: "invalid contract range" }).optional(),
  entry: z
    .string()
    .min(1)
    .refine(isSafeEntryPath, { message: "unsafe entry path" })
    .refine((p) => p.endsWith(".html"), { message: "entry must be an html file" }),
  surfaces: z.array(SurfaceSchema).min(1).refine((s) => new Set(s).size === s.length, {
    message: "duplicate surfaces",
  }),
  capabilities: CapabilitiesSchema,
  pricing: z
    .strictObject({
      model: z.enum(["free", "one-time", "subscription"]),
      sku: z.string().min(1),
    })
    .optional(),
  publisher: z.strictObject({
    id: z.string().min(1),
    pubkey: z.string().regex(/^ed25519:[A-Za-z0-9+/=._-]+$/),
  }),
  privacy: z.strictObject({
    // "none" = il tool non manda dati fuori; "declared-domains" = solo verso net.fetch.domains via proxy host.
    dataOut: z.enum(["none", "declared-domains"]),
  }),
  i18n: z
    .record(
      z.string().regex(LOCALE_RE),
      z.strictObject({ name: z.string().min(1), consentBlurb: z.string().min(1) }),
    )
    .optional(),
}).refine((m) => m.capabilities["net.fetch"] === undefined || m.privacy.dataOut === "declared-domains", {
  message: 'net.fetch requires privacy.dataOut "declared-domains"',
})

export type ToolManifest = z.infer<typeof ToolManifestSchema>
