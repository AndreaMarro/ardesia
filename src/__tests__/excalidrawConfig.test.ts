// @vitest-environment jsdom
// MAESTRO-Studio — S-DESIGN-1(c): config Excalidraw CANONICA (DESIGN-MAESTRO-v1 §3.B).
// Importa il pacchetto REALE (niente mock): se Excalidraw rinomina FONT_FAMILY.Nunito
// o cambia i tipi delle UIOptions, questo test lo becca.

import { describe, it, expect, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// jsdom non implementa il canvas 2d (getContext → null) e il bundle Excalidraw fa
// `"filter" in ctx` a import-time: stub PRIMA dell'import dinamico del pacchetto.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ filter: "" })) as never

const { FONT_FAMILY } = await import("@excalidraw/excalidraw")
const { EXCALIDRAW_CONFIG } = await import("../design/excalidrawConfig")

describe("excalidrawConfig canonico (§3.B)", () => {
  it("lingua italiana e tema light, dichiarati in UN solo posto", () => {
    expect(EXCALIDRAW_CONFIG.langCode).toBe("it-IT")
    expect(EXCALIDRAW_CONFIG.theme).toBe("light")
  })

  it("aiEnabled spento", () => {
    expect(EXCALIDRAW_CONFIG.aiEnabled).toBe(false)
  })

  it("canvasActions: footgun spenti (dark, load, save-file, bg, export), restano clear+immagine", () => {
    const ca = EXCALIDRAW_CONFIG.UIOptions.canvasActions
    expect(ca.toggleTheme).toBe(false)
    expect(ca.changeViewBackgroundColor).toBe(false)
    expect(ca.loadScene).toBe(false)
    expect(ca.saveToActiveFile).toBe(false)
    expect(ca.export).toBe(false)
    expect(ca.clearCanvas).toBe(true)
    expect(ca.saveAsImage).toBe(true)
  })

  it("tool image della toolbar spento (il media passa dal bottone header)", () => {
    expect(EXCALIDRAW_CONFIG.UIOptions.tools.image).toBe(false)
  })

  it("NEW_ROOM_APPSTATE: Nunito (testo dritto), inchiostro --m-ink, canvas --m-canvas", () => {
    const s = EXCALIDRAW_CONFIG.newRoomAppState
    expect(s.currentItemFontFamily).toBe(FONT_FAMILY.Nunito)
    expect(s.currentItemStrokeColor).toBe("#14130f")
    expect(s.viewBackgroundColor).toBe("#fffefb")
  })

  it("gli hex nel file sorgente sono SOLO ink/canvas (appState non risolve var())", () => {
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "..", "design", "excalidrawConfig.ts"),
      "utf8",
    )
    const hexes = [...new Set(src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [])].sort()
    expect(hexes).toEqual(["#14130f", "#fffefb"])
    // niente colori non-hex che scavalcano il lockdown
    expect(src).not.toMatch(/\b(rgba?|hsla?|oklch|oklab|color-mix)\s*\(/)
  })
})
