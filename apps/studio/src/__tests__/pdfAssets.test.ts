// @vitest-environment jsdom
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { PDF_ASSET_DIR, PDF_ASSET_LIMITS, pdfAssetPath, portablePdfId, readPdfAsset, validatePdfAsset, validatePdfInventory, writePdfAsset } from "../store/pdfAssets"

const original = () => new Blob([readFileSync("../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf")], { type: "application/pdf" })
const memory = () => {
  const files = new Map<string, Blob>()
  return { files, read: async (path: string) => files.get(path) ?? null,
    write: async (path: string, data: Blob) => { files.set(path, data) },
    list: async (prefix = "") => [...files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({path, data, mtime: 0})) }
}

describe("PDF originali indirizzati dai byte", () => {
  it("salva e rilegge il PDF reale, senza cambiare byte o tipo", async () => {
    const store = memory()
    const asset = await writePdfAsset(store, "pdf-lesson", original())
    expect(asset.bytes).toBe(12685)
    expect(asset.documentId).toMatch(/^[0-9a-f]{64}$/)
    expect(await asset.blob.arrayBuffer()).toEqual(await original().arrayBuffer())
    expect((await readPdfAsset(store, "pdf-lesson", asset.documentId))!.blob.type).toBe("application/pdf")
    await writePdfAsset(store, "pdf-lesson", original(), asset.documentId)
    expect(store.files.size).toBe(1)
    expect(await readPdfAsset(store, "other-lesson", asset.documentId)).toBeNull()
  })

  it("non sovrascrive una collisione o una scrittura alterata", async () => {
    const store = memory()
    const asset = await validatePdfAsset(original())
    const path = pdfAssetPath("pdf-lesson", asset.documentId)
    store.files.set(path, new Blob(["%PDF- altered"]))
    await expect(writePdfAsset(store, "pdf-lesson", original())).rejects.toThrow("SHA-256")
    expect(await store.files.get(path)!.text()).toBe("%PDF- altered")
    const corrupting = {...memory(), write: async (target: string) => { corrupting.files.set(target, new Blob(["%PDF- truncated"])) }}
    await expect(writePdfAsset(corrupting, "pdf-lesson", original())).rejects.toThrow("SHA-256")
  })

  it("rifiuta path non canonici, contenuto non PDF e impronte discordanti", async () => {
    for (const suffix of ["../a.pdf", "A".repeat(64) + ".pdf", "a".repeat(64) + ".PDF", "a".repeat(64) + ".pdf/more"]) {
      expect(() => portablePdfId(PDF_ASSET_DIR + suffix)).toThrow("path non canonico")
    }
    await expect(validatePdfAsset(new Blob(["not a PDF"]))).rejects.toThrow("intestazione")
    await expect(validatePdfAsset(original(), "0".repeat(64))).rejects.toThrow("SHA-256")
  })

  it("applica limiti di file, numero e byte complessivi", async () => {
    const entry = (n: number, bytes: number) => ({path: PDF_ASSET_DIR + n.toString(16).padStart(64, "0") + ".pdf", bytes})
    expect(() => validatePdfInventory([entry(0, PDF_ASSET_LIMITS.perFile + 1)])).toThrow("20 MiB")
    expect(() => validatePdfInventory(Array.from({length: 33}, (_, i) => entry(i, 100)))).toThrow("32 documenti")
    expect(() => validatePdfInventory(Array.from({length: 6}, (_, i) => entry(i, PDF_ASSET_LIMITS.perFile)))).toThrow("100 MiB")
    expect(() => validatePdfInventory([entry(0, NaN)])).toThrow("20 MiB")
  })
})
