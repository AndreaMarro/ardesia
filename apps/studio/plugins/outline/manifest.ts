// Secondo plugin di riferimento — manifest tipizzato CONTRO il contratto SDK Layer-0.
// Stressa una coppia di capability DIVERSA dal primo reference plugin (Arduino
// Blink usa board.read + board.write): qui board.read + `ui`. Sola lettura della
// lavagna, nessuna scrittura → least-privilege diverso, e la `ui` (inerte in v0,
// senza metodo wire) prova che il contratto regge una capability dichiarabile ma
// non raggiungibile. Vive FUORI da src/: import SOLO dal boundary `src/sdk`.
import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.maestro.outline-ref",
  name: "Board Outline (Reference)",
  version: "0.1.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: {
    "board.read": {},
    ui: {},
  },
  publisher: { id: "ref", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Contorno lavagna (Reference)",
      consentBlurb: "Legge la scena della lavagna e ne mostra un riepilogo adattivo nel proprio pannello.",
    },
  },
})
