// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  CONTRACT_VERSION,
  ToolManifestSchema,
  protocolSatisfies,
} from "../sdk/index.ts"
import { manifest } from "../../plugins/simulation/manifest.ts"
import sourceManifest from "../../sim/manifest-source.json"

function parseSemver(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`invalid semver: ${version}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function atLeast(version: string, floor: string): boolean {
  const actual = parseSemver(version)
  const required = parseSemver(floor)
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index]! > required[index]!) return true
    if (actual[index]! < required[index]!) return false
  }
  return true
}

describe("Simulation Plugin v2 manifest", () => {
  it("declares canonical autonomous plugin identity", () => {
    expect(ToolManifestSchema.safeParse(manifest).success).toBe(true)
    expect(manifest.id).toBe("io.ardesia.simulation")
    expect(manifest.kind).toBe("plugin")
    expect(atLeast(manifest.version, "2.0.0")).toBe(true)
    expect(manifest.surfaces).toEqual(["board-embed", "panel"])
  })

  it("requires the current SDK contract and least-privilege capabilities", () => {
    expect(manifest.contract).toBe(">=1.2 <2.0")
    expect(protocolSatisfies(CONTRACT_VERSION, manifest.contract ?? "")).toBe(true)
    expect(manifest.capabilities).toEqual({
      "board.read": {},
      "board.write": { scope: "own-embeds" },
      "graph.query": {},
      "lesson.event.emit": {},
      storage: { quotaMB: 16 },
      ui: {},
    })
    expect(manifest.capabilities["llm.generate"]).toBeUndefined()
    expect(manifest.capabilities["net.fetch"]).toBeUndefined()
    expect(manifest.privacy.dataOut).toBe("none")
  })

  it("uses the first-party publisher key from manifest-source", () => {
    expect(manifest.publisher.pubkey).not.toBe("ed25519:AAAA")
    expect(manifest.publisher).toEqual(sourceManifest.publisher)
  })
})
