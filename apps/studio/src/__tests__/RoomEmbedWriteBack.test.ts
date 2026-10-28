import { describe, expect, it } from "vitest"
import { persistRoomEmbedStateThroughToolHost } from "../toolhost/roomWriteBack"
import { EMBED_DATA_KEY, type BoardElementLike } from "../toolhost/caps/board"
import { readAuditLog, type AuditStore } from "../toolhost/audit"

const toolId = "io.ardesia.fluid-thermo"
type ActiveEmbed = { element: BoardElementLike; state: "active" | "hover" }

function fixture(active: "self" | "other" | null = "self") {
  let elements: BoardElementLike[] = [
    { id: "lab", type: "embeddable", customData: { [EMBED_DATA_KEY]: { owner: toolId, state: {} } } },
    { id: "other", type: "embeddable" },
  ]
  const selectedElementIds = { lab: true }
  let activeEmbeddable: ActiveEmbed | null = active === null ? null : {
    element: elements[active === "self" ? 0 : 1], state: "active",
  }
  const api = {
    getSceneElements: () => elements,
    getAppState: () => ({ selectedElementIds, activeEmbeddable }),
    updateScene: (scene: { elements: BoardElementLike[]; appState?: { activeEmbeddable: ActiveEmbed | null } }) => {
      elements = scene.elements
      if (scene.appState) activeEmbeddable = scene.appState.activeEmbeddable
    },
  }
  const files = new Map<string, Blob>()
  const store: AuditStore = {
    read: async (path) => files.get(path) ?? null,
    write: async (path, data) => { files.set(path, data) },
  }
  const errors: string[] = []
  const write = (state: unknown, owner = toolId) => persistRoomEmbedStateThroughToolHost(api, store, "lab", state, owner, (error) => errors.push(error))
  // Excalidraw enables pointer events only when activeEmbeddable.element === el.
  const isInteractive = () => activeEmbeddable?.state === "active" && activeEmbeddable.element === elements[0]
  return { api, store, errors, write, isInteractive }
}

describe("Room embed snapshot write-back", () => {
  it("keeps the active laboratory interactive across consecutive edits and comparison", async () => {
    const f = fixture()
    for (const snapshot of [{ depth: 3.25 }, { depth: 3.25, prediction: "Pressure rises" }, { depth: 4, prediction: "Pressure rises" }]) {
      await f.write(snapshot)
      expect(f.isInteractive()).toBe(true)
      expect(f.api.getSceneElements()[0].customData?.[EMBED_DATA_KEY]).toEqual({ owner: toolId, state: snapshot })
    }
    expect(f.api.getAppState().selectedElementIds).toEqual({ lab: true })
    expect(f.errors).toEqual([])
    expect((await readAuditLog(f.store, toolId)).entries.map((entry) => entry.outcome)).toEqual(["ok", "ok", "ok"])
  })

  it.each([null, "other"] as const)("does not activate the written lab when the active embed is %s", async (active) => {
    const f = fixture(active)
    const before = f.api.getAppState().activeEmbeddable
    await f.write({ depth: 4 })
    expect(f.api.getAppState().activeEmbeddable).toBe(before)
    expect(f.isInteractive()).toBeFalsy()
  })

  it("keeps ownership denial closed without changing the scene or active embed", async () => {
    const f = fixture()
    const before = f.api.getSceneElements()
    const active = f.api.getAppState().activeEmbeddable
    await f.write({ forged: true }, "com.example.other")
    expect(f.api.getSceneElements()).toBe(before)
    expect(f.api.getAppState().activeEmbeddable).toBe(active)
    expect(f.errors).toEqual(["Write-back ToolHost fallito: richiesta negata"])
    expect((await readAuditLog(f.store, "com.example.other")).entries[0].outcome).toBe("denied")
  })

  it.each(["locked", "isDeleted"])("does not reactivate an embed marked %s", async (flag) => {
    const f = fixture()
    f.api.getSceneElements()[0][flag] = true
    await f.write({ depth: 4 })
    expect(f.isInteractive()).toBe(false)
  })
})
