import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.ardesia.simulation",
  name: "ARDESIA Simulation",
  version: "2.0.0",
  protocol: ">=1.0 <2.0",
  contract: ">=1.1 <2.0",
  kind: "plugin",
  entry: "dist/index.html",
  surfaces: ["board-embed", "panel"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    "graph.query": {},
    storage: { quotaMB: 16 },
    ui: {},
  },
  publisher: { id: "ardesia-core", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Simulatore ARDESIA",
      consentBlurb:
        "Mostra circuiti, strumenti e diagnostica nel proprio post-it e legge il grafo LessonOS in sola lettura.",
    },
  },
})
