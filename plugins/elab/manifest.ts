// Plugin di riferimento ELAB — manifest tipizzato CONTRO il contratto SDK Layer-0.
// Vive FUORI da src/: prova che il confine SDK è autosufficiente per uno sviluppo
// di plugin parallelo (import SOLO dal boundary `src/sdk`).
import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.maestro.elab-ref",
  name: "ELAB Reference Plugin",
  version: "0.1.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["board-embed"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    storage: { quotaMB: 8 },
  },
  publisher: { id: "elab", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Plugin ELAB di riferimento",
      consentBlurb: "Legge la selezione sulla lavagna e disegna nel proprio riquadro.",
    },
  },
})
