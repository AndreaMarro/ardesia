// S1 — contratto marketplace unificato (plugin ∪ content-product). I test
// bloccano le regole legali della ricerca C+0 come invarianti eseguibili:
// EU AI Act aiDisclosure, "official" non falsificabile, GDPR no-PII, oltre a
// installability/provenance/prezzo/stato disabled-unavailable espliciti.
// Nessun pagamento reale, nessun import del simulatore in gioco.

import { describe, expect, it } from "vitest"
import {
  isFree,
  isListingActionable,
  marketplaceItemId,
  MarketplaceItemSchema,
  parseMarketplaceItem,
  type ContentProductItem,
  type MarketplaceItem,
} from "../toolhost/marketplace/marketplaceItem.ts"

// ToolManifest minimo ma VALIDO (stesso schema firmato dell'installer): dà al
// plugin item id/version/publisher/capabilities/surfaces senza duplicarli.
const validManifest = {
  manifestVersion: 1 as const,
  id: "com.ardesia.example-plugin",
  name: "Example Plugin",
  version: "1.2.0",
  protocol: ">=1.0 <2.0",
  entry: "entry.html",
  surfaces: ["board-embed"] as const,
  capabilities: { "board.read": {} },
  publisher: { id: "pub-1", pubkey: "ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" },
  privacy: { dataOut: "none" as const },
}

function pluginItem(overrides: Record<string, unknown> = {}): unknown {
  return {
    kind: "plugin",
    availability: { status: "available" },
    manifest: validManifest,
    ...overrides,
  }
}

function contentProduct(overrides: Partial<ContentProductItem> = {}): unknown {
  const base: ContentProductItem = {
    kind: "content-product",
    availability: { status: "available" },
    id: "prod.elettronica.led-lab",
    title: "Lab LED — serie/parallelo",
    version: "1.0.0",
    creator: { id: "teacher-42", displayName: "Prof. Rossi" },
    resourceType: "lesson_pack",
    format: "pdf",
    license: "individual",
    price: { model: "free" },
    preview: { thumbnails: ["thumb-1"], liveDemo: false },
    provenance: {
      origin: "user-generated",
      aiDisclosure: false,
      sourceRefs: ["manual:vol2:p14"],
      originalityAttested: true,
    },
    curriculum: { aligned: false },
    containsStudentPII: false,
  }
  return { ...base, ...overrides }
}

describe("plugin marketplace item (wraps ToolManifest)", () => {
  it("porta id/version/publisher/capability/surfaces via il manifest firmato", () => {
    const parsed = parseMarketplaceItem(pluginItem())
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.item.kind).toBe("plugin")
    if (parsed.item.kind !== "plugin") return
    expect(marketplaceItemId(parsed.item)).toBe("com.ardesia.example-plugin")
    expect(parsed.item.manifest.version).toBe("1.2.0")
    expect(parsed.item.manifest.publisher.id).toBe("pub-1")
    expect(parsed.item.manifest.surfaces).toContain("board-embed")
    expect(parsed.item.manifest.capabilities["board.read"]).toBeDefined()
  })

  it("manifest fuori schema (surfaces vuoto) → parse fallisce (nessun listing malformato)", () => {
    const bad = pluginItem({ manifest: { ...validManifest, surfaces: [] } })
    const parsed = parseMarketplaceItem(bad)
    expect(parsed.ok).toBe(false)
  })

  it("plugin senza pricing è gratuito", () => {
    const parsed = MarketplaceItemSchema.parse(pluginItem())
    expect(isFree(parsed)).toBe(true)
  })
})

describe("content-product item", () => {
  it("porta title/creator/license/price e id proprio", () => {
    const parsed = parseMarketplaceItem(contentProduct())
    expect(parsed.ok).toBe(true)
    if (!parsed.ok || parsed.item.kind !== "content-product") return
    expect(parsed.item.title).toBe("Lab LED — serie/parallelo")
    expect(parsed.item.creator.displayName).toBe("Prof. Rossi")
    expect(parsed.item.license).toBe("individual")
    expect(parsed.item.price.model).toBe("free")
    expect(marketplaceItemId(parsed.item)).toBe("prod.elettronica.led-lab")
    expect(isFree(parsed.item)).toBe(true)
  })

  it("prezzo a pagamento richiede amount>0 e valuta (nessun checkout, solo descrizione)", () => {
    expect(parseMarketplaceItem(contentProduct({ price: { model: "one-time" } as never })).ok).toBe(false)
    expect(
      parseMarketplaceItem(contentProduct({ price: { model: "one-time", amountMinor: 500 } as never })).ok,
    ).toBe(false) // manca currency
    const ok = parseMarketplaceItem(
      contentProduct({ price: { model: "one-time", amountMinor: 500, currency: "EUR" } as never }),
    )
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(isFree(ok.item)).toBe(false)
  })

  it("free con importo positivo → rifiutato", () => {
    const bad = parseMarketplaceItem(
      contentProduct({ price: { model: "free", amountMinor: 300, currency: "EUR" } as never }),
    )
    expect(bad.ok).toBe(false)
  })
})

describe("provenienza — regole legali eseguibili", () => {
  it("EU AI Act: ai-generated con aiDisclosure=false → rifiutato", () => {
    const bad = parseMarketplaceItem(
      contentProduct({
        provenance: { origin: "ai-generated", aiDisclosure: false, sourceRefs: [], originalityAttested: false },
      }),
    )
    expect(bad.ok).toBe(false)
    expect(bad.ok === false && bad.error).toMatch(/aiDisclosure/)
  })

  it("EU AI Act: ai-assisted con aiDisclosure=true → accettato", () => {
    const ok = parseMarketplaceItem(
      contentProduct({
        provenance: { origin: "ai-assisted", aiDisclosure: true, sourceRefs: [], originalityAttested: true },
      }),
    )
    expect(ok.ok).toBe(true)
  })

  it('"official" senza vettedBy → rifiutato (non falsificabile)', () => {
    const bad = parseMarketplaceItem(
      contentProduct({
        provenance: { origin: "official", aiDisclosure: false, sourceRefs: [], originalityAttested: true },
        curriculum: { aligned: true, standard: "MIUR elettronica cl.3" },
      }),
    )
    expect(bad.ok).toBe(false)
    expect(bad.ok === false && bad.error).toMatch(/vettedBy/)
  })

  it('"official" con vettedBy + standard → accettato', () => {
    const ok = parseMarketplaceItem(
      contentProduct({
        provenance: { origin: "official", aiDisclosure: false, sourceRefs: [], originalityAttested: true },
        curriculum: { aligned: true, standard: "MIUR elettronica cl.3", vettedBy: "IIS Galilei" },
      }),
    )
    expect(ok.ok).toBe(true)
  })

  it("aligned=true senza standard → rifiutato", () => {
    const bad = parseMarketplaceItem(contentProduct({ curriculum: { aligned: true } }))
    expect(bad.ok).toBe(false)
  })
})

describe("GDPR — no PII nel listing", () => {
  it("containsStudentPII=true → rifiutato", () => {
    const bad = parseMarketplaceItem(contentProduct({ containsStudentPII: true as never }))
    expect(bad.ok).toBe(false)
  })
})

describe("stato del listing esplicito", () => {
  it("disabled è un item valido ma non azionabile", () => {
    const parsed = parseMarketplaceItem(contentProduct({ availability: { status: "disabled" } }))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(isListingActionable(parsed.item)).toBe(false)
  })

  it("unavailable richiede una ragione", () => {
    expect(parseMarketplaceItem(contentProduct({ availability: { status: "unavailable" } as never })).ok).toBe(
      false,
    )
    const ok = parseMarketplaceItem(
      contentProduct({ availability: { status: "unavailable", reason: "pack ritirato dall'autore" } }),
    )
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(isListingActionable(ok.item)).toBe(false)
  })

  it("available → azionabile", () => {
    const item: MarketplaceItem = MarketplaceItemSchema.parse(contentProduct())
    expect(isListingActionable(item)).toBe(true)
  })
})
