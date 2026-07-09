// MARKETPLACE-CANON S1 (Claude product lane, 2026-07-08): contratto UNIFICATO
// dell'oggetto marketplace. Copre due tipi in una discriminated-union su `kind`:
//   - PLUGIN: pacchetto installabile. RIUSA il ToolManifest firmato
//     (toolhost-protocol/manifest.ts) come campo — NIENTE duplicazione di
//     id/version/publisher/capabilities/surfaces: la fonte autoritativa resta una.
//   - CONTENT-PRODUCT: contenuto vendibile (lesson pack / worksheet /
//     exam-generator / simulation pack / student pack / profilo docente) con
//     licenza acquirente, provenienza, preview e allineamento curricolare.
//
// Contract-first: NESSUN pagamento reale (price è descrittivo), NESSUN import
// del simulatore. Le regole legali emerse dalla ricerca C+0 sono ENFORCED come
// refine zod, non solo documentate:
//   - EU AI Act Art.50: contenuto AI DEVE dichiararsi (aiDisclosure).
//   - "official" non falsificabile: richiede avallo istituzionale (vettedBy).
//   - GDPR: un listing non porta MAI PII studente (containsStudentPII === false).
//
// Fonti firsthand: docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md §7-§8 +
// docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md §M1/M2.

import { z } from "zod"
import { ToolManifestSchema } from "../../toolhost-protocol/manifest.ts"

const SEMVER_RE = /^\d+\.\d+\.\d+$/
const CURRENCY_RE = /^[A-Z]{3}$/ // ISO-4217

// --- Disponibilità del listing nel catalogo. Onestà (stessa disciplina di
// unavailable[] del cruscotto): "unavailable" porta SEMPRE la ragione, mai una
// entry muta; "disabled" è distinto (installato ma spento, pattern Obsidian). ---
export const AvailabilitySchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("available") }),
  z.strictObject({ status: z.literal("disabled") }),
  z.strictObject({ status: z.literal("unavailable"), reason: z.string().min(1) }),
])
export type Availability = z.infer<typeof AvailabilitySchema>

// --- Tassonomia content-product (LRMI / schema.org LearningResource + Tes). ---
export const ResourceTypeSchema = z.enum([
  "lesson_pack",
  "lesson",
  "worksheet",
  "exam_quiz_generator",
  "simulation_pack",
  "student_pack",
  "teacher_profile",
])
export type ResourceType = z.infer<typeof ResourceTypeSchema>

export const ContentFormatSchema = z.enum(["pdf", "interactive", "simulation", "slide", "doc", "image"])
export type ContentFormat = z.infer<typeof ContentFormatSchema>

// Tier licenza acquirente: commerciali (TPT) ∪ Creative Commons/OER.
export const LicenseTierSchema = z.enum([
  "individual",
  "multi_seat",
  "classroom_transferable",
  "school_site",
  "cc_by",
  "cc_by_sa",
  "cc_by_nc",
  "cc_by_nc_sa",
  "cc_by_nd",
  "cc0",
  "all_rights_reserved",
])
export type LicenseTier = z.infer<typeof LicenseTierSchema>

// Origine/provenienza (IPTC digitalSourceType + firma). "official" ≠ un valore
// che chiunque può auto-attribuirsi: vedi refine sul curriculum.vettedBy.
export const ProvenanceOriginSchema = z.enum([
  "official",
  "publisher-partner",
  "user-generated",
  "ai-generated",
  "ai-assisted",
])
export type ProvenanceOrigin = z.infer<typeof ProvenanceOriginSchema>

// Prezzo DESCRITTIVO: nessun checkout, nessun rail di pagamento in questa slice.
export const PriceSchema = z
  .strictObject({
    model: z.enum(["free", "one-time", "subscription", "trial"]),
    amountMinor: z.number().int().min(0).optional(), // unità minori (cent); assente/0 = gratis
    currency: z.string().regex(CURRENCY_RE).optional(),
    trialDays: z.number().int().min(1).max(365).optional(),
  })
  .refine((p) => (p.model === "free" ? (p.amountMinor ?? 0) === 0 : true), {
    message: "free price must not carry a positive amount",
    path: ["amountMinor"],
  })
  .refine((p) => (p.model === "free" ? true : p.amountMinor !== undefined && p.amountMinor > 0), {
    message: "paid price requires amountMinor > 0",
    path: ["amountMinor"],
  })
  .refine((p) => (p.amountMinor !== undefined && p.amountMinor > 0 ? p.currency !== undefined : true), {
    message: "priced item requires currency (ISO-4217)",
    path: ["currency"],
  })
export type Price = z.infer<typeof PriceSchema>

// --- Variante PLUGIN: il manifest firmato È la fonte di id/version/publisher/
// capabilities/surfaces. Lo si valida col suo stesso schema (zero duplicazione). ---
const pluginItemSchema = z.strictObject({
  kind: z.literal("plugin"),
  availability: AvailabilitySchema,
  manifest: ToolManifestSchema,
})

// --- Variante CONTENT-PRODUCT. ---
const contentProductSchema = z.strictObject({
  kind: z.literal("content-product"),
  availability: AvailabilitySchema,
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  version: z.string().regex(SEMVER_RE),
  creator: z.strictObject({ id: z.string().min(1), displayName: z.string().min(1) }),
  resourceType: ResourceTypeSchema,
  format: ContentFormatSchema,
  license: LicenseTierSchema,
  price: PriceSchema,
  preview: z.strictObject({
    // TPT: fino a 4 thumbnail. sample = artefatto parziale/watermarked (gated).
    thumbnails: z.array(z.string()).max(4),
    sample: z.string().optional(),
    // liveDemo = può nascere come post-it sandbox READ-ONLY, zero capability.
    liveDemo: z.boolean(),
  }),
  provenance: z.strictObject({
    origin: ProvenanceOriginSchema,
    aiDisclosure: z.boolean(),
    // EvidenceRef namespace ("manual:vol1:p30" | "document:sha256:<h>" |
    // "board:<id>" | "plugin:<id>@<v>"): trasportate INTATTE (catena di custodia),
    // stringhe come nel precedente studentPackArtifact.
    sourceRefs: z.array(z.string()),
    originalityAttested: z.boolean(),
  }),
  curriculum: z.strictObject({
    aligned: z.boolean(),
    standard: z.string().optional(), // es. "MIUR indirizzo elettronica - classe 3"
    vettedBy: z.string().optional(), // istituzione che avalla; assente per UGC
  }),
  // GDPR (Mode A): un listing NON porta MAI dati studente. Letterale false:
  // non è un default rilassabile, è un invariante del contratto.
  containsStudentPII: z.literal(false),
})

export const MarketplaceItemSchema = z
  .discriminatedUnion("kind", [pluginItemSchema, contentProductSchema])
  // EU AI Act Art.50(2)/(4): contenuto AI-generated/assisted DEVE dichiararsi.
  .refine(
    (item) =>
      item.kind !== "content-product" ||
      (item.provenance.origin !== "ai-generated" && item.provenance.origin !== "ai-assisted") ||
      item.provenance.aiDisclosure === true,
    { message: "AI-generated/assisted content must set aiDisclosure=true (EU AI Act Art.50)" },
  )
  // "official" non falsificabile: richiede avallo istituzionale esplicito.
  .refine(
    (item) =>
      item.kind !== "content-product" ||
      item.provenance.origin !== "official" ||
      (typeof item.curriculum.vettedBy === "string" && item.curriculum.vettedBy.trim() !== ""),
    { message: "official content requires curriculum.vettedBy (institutional endorsement)" },
  )
  // aligned=true senza standard è una promessa vuota.
  .refine(
    (item) =>
      item.kind !== "content-product" ||
      !item.curriculum.aligned ||
      (typeof item.curriculum.standard === "string" && item.curriculum.standard.trim() !== ""),
    { message: "curriculum.aligned requires a declared standard" },
  )

export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>
export type PluginMarketplaceItem = z.infer<typeof pluginItemSchema>
export type ContentProductItem = z.infer<typeof contentProductSchema>

export type MarketplaceItemParseResult =
  | { ok: true; item: MarketplaceItem }
  | { ok: false; error: string }

/**
 * Parse fail-closed: schema violato = errore DICHIARATO (path + messaggio),
 * mai un item parzialmente ricostruito. Stessa disciplina di
 * parseStudentPackArtifact.
 */
export function parseMarketplaceItem(raw: unknown): MarketplaceItemParseResult {
  const result = MarketplaceItemSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    return { ok: false, error: `${issue?.path.join(".") ?? ""} ${issue?.message ?? "schema"}`.trim() }
  }
  return { ok: true, item: result.data }
}

/** Id del listing dalla fonte autoritativa (manifest per il plugin). */
export function marketplaceItemId(item: MarketplaceItem): string {
  return item.kind === "plugin" ? item.manifest.id : item.id
}

/**
 * Il listing è azionabile (installabile/acquisibile) SOLO se disponibile.
 * Nessun checkout: verifica solo lo stato del listing, non muove denaro.
 */
export function isListingActionable(item: MarketplaceItem): boolean {
  return item.availability.status === "available"
}

/** Gratuito? (price descrittivo; per il plugin legge ToolManifest.pricing). */
export function isFree(item: MarketplaceItem): boolean {
  if (item.kind === "plugin") {
    return item.manifest.pricing === undefined || item.manifest.pricing.model === "free"
  }
  return item.price.model === "free"
}
