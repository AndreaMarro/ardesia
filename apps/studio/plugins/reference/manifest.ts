// Plugin di riferimento — manifest tipizzato CONTRO il contratto SDK Layer-0.
// Vive FUORI da src/: prova che il confine SDK è autosufficiente per uno sviluppo
// di plugin parallelo (import SOLO dal boundary `src/sdk`).
// Primo plugin CONCRETO: simulazione Arduino Blink (vedi main.ts + arduino.ts).
// Least-privilege: dichiara SOLO le capability che usa davvero (board.read per il
// contesto della selezione, board.write per disegnare il LED nel proprio embed).
import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.maestro.plugin-ref",
  name: "Arduino Blink (Reference)",
  version: "0.2.0",
  protocol: ">=1.0 <2.0",
  contract: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["board-embed"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
  },
  publisher: { id: "ref", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Arduino Blink (Reference)",
      consentBlurb: "Legge la selezione sulla lavagna e accende/spegne un LED Arduino nel proprio riquadro.",
    },
  },
})
