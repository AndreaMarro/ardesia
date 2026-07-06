// @vitest-environment node
//
// P0-D SDK template — entry differenziato per surface. Ogni template resta un
// plugin REALE (handshake wire completo); il template board-embed insegna il
// pattern corretto per board.read: chiamata JSON-RPC sulla porta, GUARDATA da
// grantedCaps (deny-by-default: il bottone si abilita solo a capability
// concessa, niente chiamate destinate a fallire).

import { describe, expect, it } from "vitest"
import { generateDevKeypair, scaffoldPlugin } from "../toolhost/authoring/scaffoldPlugin.ts"

const keysPromise = generateDevKeypair()

async function entryFor(surfaces?: ("panel" | "board-embed" | "fullscreen")[], capabilities?: object) {
  const out = await scaffoldPlugin(
    {
      id: "io.test.surface-tpl",
      name: "Surface Tpl",
      ...(surfaces ? { surfaces } : {}),
      ...(capabilities ? { capabilities } : {}),
    },
    await keysPromise,
  )
  return out.entryHtml
}

describe("scaffoldPlugin — template per surface", () => {
  it("ogni surface parla il lifecycle completo (host.hello → tool.ready)", async () => {
    for (const surface of ["panel", "board-embed", "fullscreen"] as const) {
      const entry = await entryFor([surface])
      expect(entry).toContain("host.hello")
      expect(entry).toContain("tool.ready")
      expect(entry).toContain("nonce")
    }
  })

  it("il template dichiara la surface primaria come marker stabile data-surface", async () => {
    expect(await entryFor(["panel"])).toContain('data-surface="panel"')
    expect(await entryFor(["board-embed"])).toContain('data-surface="board-embed"')
    expect(await entryFor(["fullscreen"])).toContain('data-surface="fullscreen"')
    // default = panel
    expect(await entryFor()).toContain('data-surface="panel"')
  })

  it("board-embed: demo board.read via JSON-RPC, guardata da grantedCaps", async () => {
    const entry = await entryFor(["board-embed"], { "board.read": {} })
    expect(entry).toContain('"board.read"')
    expect(entry).toContain('target: "scene"')
    expect(entry).toContain("grantedCaps")
  })

  it("panel e fullscreen NON contengono la demo board.read", async () => {
    expect(await entryFor(["panel"])).not.toContain('"board.read"')
    expect(await entryFor(["fullscreen"])).not.toContain('"board.read"')
  })

  it("fullscreen: layout a viewport pieno nel template", async () => {
    const entry = await entryFor(["fullscreen"])
    expect(entry).toContain("100vh")
  })

  it("la surface primaria è la PRIMA dichiarata", async () => {
    const entry = await entryFor(["fullscreen", "panel"])
    expect(entry).toContain('data-surface="fullscreen"')
  })
})
