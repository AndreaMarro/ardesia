// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { buildDefaultPluginWindowCatalog, createPluginWindowInsertRequest } from "../design/pluginWindowCatalog"
import { createMultiPostitWorkbenchPostits, createPostitFromPluginWindowInsert } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene, restorePluginPostitsFromBoardScene } from "../design/multiPostitBoardPersistence"
import { renderPluginPostitBoardEmbeddable } from "../toolhost/pluginPostitBoardRender"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"

function fixture() {
  const catalog = buildDefaultPluginWindowCatalog()
  const item = catalog.find((entry) => entry.pluginId === "com.ardesia.manual-evidence")!
  const a = createPostitFromPluginWindowInsert(createPluginWindowInsertRequest(item), [])
  const b = createPostitFromPluginWindowInsert(createPluginWindowInsertRequest(item), [a])
  return [a, b]
}

describe("generic post-it persistence without the removed simulator", () => {
  it("starts empty and preserves independent multi-instance state through cold serialization", () => {
    expect(createMultiPostitWorkbenchPostits()).toEqual([])
    const postits = fixture()
    expect(postits[0].instanceId).not.toBe(postits[1].instanceId)
    const scene = createPluginPostitBoardScene(postits)
    const restored = restorePluginPostitsFromBoardScene(JSON.parse(JSON.stringify(scene)))
    expect(restored).toEqual(postits)
    expect(renderToStaticMarkup(renderPluginPostitBoardEmbeddable(scene.elements[0])!)).toContain(postits[0].pluginId)
  })

  it("rejects forged ownership, identity and malformed versioned state", () => {
    const scene = createPluginPostitBoardScene(fixture())
    const owner = structuredClone(scene)
    owner.elements[0].customData[EMBED_DATA_KEY].owner = "another-instance"
    expect(() => restorePluginPostitsFromBoardScene(owner)).toThrow(/owner mismatch/)
    const identity = structuredClone(scene)
    identity.elements[0].id = "another-element"
    expect(() => restorePluginPostitsFromBoardScene(identity)).toThrow(/id mismatch/)
    const state = structuredClone(scene)
    state.elements[0].customData[EMBED_DATA_KEY].state.pluginState = { kind: "removed-state" }
    expect(() => restorePluginPostitsFromBoardScene(state)).toThrow(/invalid catalog plugin state/)
  })
})
