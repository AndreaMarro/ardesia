// @vitest-environment node
//
// S2 — plugin essenziali: ogni definizione ha manifest valido (contro lo stesso
// ToolManifestSchema firmato), dichiara surfaces/capabilities/privacy, è
// materializzabile come post-it, e il modulo NON importa il simulatore.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  CONCEPT_MAP_PLUGIN,
  ESSENTIAL_PLUGINS,
  essentialPluginById,
  MANUAL_EVIDENCE_PLUGIN,
  mountEssentialPluginPostit,
  type EssentialPlugin,
} from "../toolhost/essentialPlugins.ts"
import { ToolManifestSchema } from "../toolhost-protocol/manifest.ts"
import { isValidToolId } from "../toolhost-protocol/manifest.ts"

const SEMVER_RE = /^\d+\.\d+\.\d+$/

describe("ESSENTIAL_PLUGINS catalogo", () => {
  it("almeno 5 plugin reali, inclusi disegno HD e web", () => {
    expect(ESSENTIAL_PLUGINS.length).toBeGreaterThanOrEqual(5)
    expect(essentialPluginById("com.ardesia.drawing-hd")).toBeDefined()
    expect(essentialPluginById("com.ardesia.web-view")).toBeDefined()
  })

  it("id univoci e reverse-DNS", () => {
    const ids = ESSENTIAL_PLUGINS.map((p) => p.manifest.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(isValidToolId(id)).toBe(true)
  })
})

describe.each(ESSENTIAL_PLUGINS.map((p) => [p.manifest.id, p] as const))(
  "plugin %s",
  (_id, plugin: EssentialPlugin) => {
    it("manifest valido contro ToolManifestSchema (metadata completi)", () => {
      const parsed = ToolManifestSchema.parse(plugin.manifest)
      expect(parsed.name.length).toBeGreaterThan(0)
      expect(parsed.version).toMatch(SEMVER_RE)
      expect(parsed.publisher.id).toBe("ardesia")
      expect(parsed.publisher.pubkey).toMatch(/^ed25519:/)
      expect(parsed.kind).toBe("plugin")
    })

    it("dichiara surfaces / capabilities / privacy", () => {
      expect(plugin.manifest.surfaces).toContain("board-embed")
      expect(Object.keys(plugin.manifest.capabilities).length).toBeGreaterThan(0)
      expect(plugin.manifest.privacy.dataOut).toBe(
        plugin.manifest.capabilities["net.fetch"] === undefined ? "none" : "declared-domains",
      )
    })

    it("stato iniziale è una fixture dichiarata (mai dato reale)", () => {
      expect(plugin.fixtureState.fixture).toBe(true)
    })

    it("materializzabile come post-it sulla board", () => {
      const postit = mountEssentialPluginPostit(plugin, { instanceId: "inst-1" })
      expect(postit.kind).toBe("plugin-postit-object")
      expect(postit.pluginId).toBe(plugin.manifest.id)
      expect(postit.bounds.width).toBeGreaterThan(0)
      expect(postit.bounds.height).toBeGreaterThan(0)
      // lo stato clonato resta una fixture (structuredClone preserva il flag)
      expect((postit.pluginState as { fixture: boolean }).fixture).toBe(true)
    })
  },
)

describe("least-privilege per plugin", () => {
  it("manual-evidence: sola lettura board, nessuna scrittura", () => {
    expect(MANUAL_EVIDENCE_PLUGIN.manifest.capabilities["board.read"]).toBeDefined()
    expect(MANUAL_EVIDENCE_PLUGIN.manifest.capabilities["board.write"]).toBeUndefined()
  })

  it("concept-map: read-only, graph.query senza proposeClaims né board.write", () => {
    const caps = CONCEPT_MAP_PLUGIN.manifest.capabilities
    expect(caps["graph.query"]).toBeDefined()
    expect(caps["graph.proposeClaims"]).toBeUndefined()
    expect(caps["board.write"]).toBeUndefined()
  })

  it("drawing-hd: scrive solo i propri embed, niente rete o grafo", () => {
    const plugin = essentialPluginById("com.ardesia.drawing-hd")
    expect(plugin).toBeDefined()
    if (plugin === undefined) return

    const caps = plugin.manifest.capabilities
    expect(caps["board.write"]).toEqual({ scope: "own-embeds" })
    expect(caps["net.fetch"]).toBeUndefined()
    expect(caps["graph.query"]).toBeUndefined()
    expect(plugin.manifest.privacy.dataOut).toBe("none")
    expect(plugin.fixtureState.fixture).toBe(true)
  })

  it("web-view: rete dichiarata e nessuna scrittura board", () => {
    const plugin = essentialPluginById("com.ardesia.web-view")
    expect(plugin).toBeDefined()
    if (plugin === undefined) return

    const caps = plugin.manifest.capabilities
    expect(caps["net.fetch"]).toEqual({ domains: ["example.edu"] })
    expect(caps["board.write"]).toBeUndefined()
    expect(plugin.manifest.privacy.dataOut).toBe("declared-domains")
    expect(plugin.fixtureState.fixture).toBe(true)
  })
})

describe("lookup", () => {
  it("essentialPluginById trova per id manifest", () => {
    expect(essentialPluginById("com.ardesia.manual-evidence")).toBe(MANUAL_EVIDENCE_PLUGIN)
  })
  it("id sconosciuto → undefined", () => {
    expect(essentialPluginById("com.ardesia.nope")).toBeUndefined()
  })
})

describe("nessun import del simulatore (guardrail lane)", () => {
  it("essentialPlugins.ts non importa da sim/ né dai file Codex read-only", () => {
    const src = readFileSync(
      fileURLToPath(new URL("../toolhost/essentialPlugins.ts", import.meta.url)),
      "utf8",
    )
    const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
    for (const spec of imports) {
      expect(spec).not.toMatch(/(^|\/)sim(\/|$)/)
      expect(spec).not.toMatch(/SimulationPluginWorkbench|ToolCanvasEmbeddable/)
    }
  })
})
