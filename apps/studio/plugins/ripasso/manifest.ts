// Terzo plugin di riferimento — manifest tipizzato CONTRO il contratto SDK Layer-0.
// Primo consumatore REALE di graph.query (wire da contratto 1.1.0): per questo
// `contract: ">=1.1 <2.0"` — un host 1.0.x non ha il metodo e il PluginManager
// lo rigetta al gate (primo uso concreto del gate contract-version). Least
// privilege estremo: UNA capability, sola lettura del grafo LessonOS; niente
// board, niente storage, niente rete. Vive FUORI da src/: import SOLO dal
// boundary `src/sdk`.
import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.maestro.ripasso-ref",
  name: "Error Review (Reference)",
  version: "0.1.0",
  protocol: ">=1.0 <2.0",
  contract: ">=1.1 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: {
    "graph.query": {},
  },
  publisher: { id: "ref", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Ripasso errori (Reference)",
      consentBlurb:
        "Consulta in sola lettura i concetti e gli errori osservati nelle tue lezioni per proporre il ripasso.",
    },
  },
})
