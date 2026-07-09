import { defineManifest } from "../../src/sdk/index.ts"
import type { ToolManifest } from "../../src/sdk/index.ts"
import sourceManifest from "../../sim/manifest-source.json"

export const manifest: ToolManifest = defineManifest({
  manifestVersion: 1,
  id: "io.ardesia.simulation",
  name: "ARDESIA Simulation",
  version: "2.0.0",
  protocol: ">=1.0 <2.0",
  contract: ">=1.2 <2.0",
  kind: "plugin",
  entry: "dist/index.html",
  surfaces: ["board-embed", "panel"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    "graph.query": {},
    "lesson.event.emit": {},
    storage: { quotaMB: 16 },
    ui: {},
  },
  publisher: sourceManifest.publisher,
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Simulatore ARDESIA",
      consentBlurb:
        "Mostra circuiti, strumenti e diagnostica nel proprio post-it, legge il grafo LessonOS e registra eventi didattici con evidenza.",
    },
  },
})
