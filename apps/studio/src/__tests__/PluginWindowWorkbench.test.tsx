// @vitest-environment jsdom

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  PluginWindowMultiPostitHarness,
} from "../design/MultiPostitWorkbench"
import {
  createMultiPostitWorkbenchPostits,
  createPostitFromPluginWindowInsert,
  isCatalogPluginPostitState,
} from "../design/multiPostitWorkbenchModel"
import {
  createPluginPostitBoardScene,
  restorePluginPostitsFromBoardScene,
} from "../design/multiPostitBoardPersistence"
import {
  buildDefaultPluginWindowCatalog,
  createPluginWindowInsertRequest,
} from "../design/pluginWindowCatalog"
import { InMemoryEventLog } from "../lessonos/eventlog"

afterEach(() => {
  cleanup()
})

describe("PluginWindow + MultiPostitWorkbench harness", () => {
  it("materializes a plugin-window insert as a serializable board post-it object", () => {
    const initialPostits = createMultiPostitWorkbenchPostits()
    const webItem = buildDefaultPluginWindowCatalog().find(
      (item) => item.pluginId === "com.ardesia.web-view",
    )
    expect(webItem).toBeDefined()
    if (webItem === undefined) return

    const inserted = createPostitFromPluginWindowInsert(
      createPluginWindowInsertRequest(webItem),
      initialPostits,
    )

    expect(inserted.instanceId).toBe("web-view-1")
    expect(inserted.pluginId).toBe("com.ardesia.web-view")
    expect(isCatalogPluginPostitState(inserted.pluginState)).toBe(true)
    if (!isCatalogPluginPostitState(inserted.pluginState)) return
    expect(inserted.pluginState).toMatchObject({
      kind: "catalog-plugin",
      pluginId: "com.ardesia.web-view",
      pluginKind: "web",
      source: "essential",
      evidenceRef: "plugin:com.ardesia.web-view@0.1.0",
    })
    expect(inserted.pluginState.fixtureState).toMatchObject({
      fixture: true,
      allowedDomains: ["example.edu"],
    })

    const boardScene = createPluginPostitBoardScene([...initialPostits, inserted])
    expect(boardScene.elements).toHaveLength(4)

    const restored = restorePluginPostitsFromBoardScene(boardScene)
    expect(restored.map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toContain(
      "com.ardesia.web-view:web-view-1",
    )
  })

  it("connects PluginWindow insertion to the visible workbench and board-save count", async () => {
    const log = new InMemoryEventLog()
    const { container } = render(<PluginWindowMultiPostitHarness eventLog={log} room="lezione-led" now={() => 1718000000000} />)
    const workbench = screen.getByTestId("plugin-window-workbench")

    expect(workbench.getAttribute("data-postit-count")).toBe("3")

    fireEvent.change(screen.getByLabelText("Cerca plugin"), { target: { value: "web" } })
    const webRow = container.querySelector('[data-plugin-window-item="com.ardesia.web-view"]')
    expect(webRow).not.toBeNull()
    if (webRow === null) return

    fireEvent.click(within(webRow as HTMLElement).getByRole("button", { name: "Inserisci Web" }))

    await waitFor(() => {
      expect(workbench.getAttribute("data-postit-count")).toBe("4")
    })
    expect(workbench.getAttribute("data-last-plugin-insert")).toBe("com.ardesia.web-view")
    await waitFor(async () => {
      expect((await log.readAll()).map((event) => event.kind)).toEqual(["plugin.mounted"])
    })
    expect(await log.readAll()).toEqual([
      expect.objectContaining({
        kind: "plugin.mounted",
        pluginId: "com.ardesia.web-view",
        pluginKind: "web",
        instanceId: "web-view-1",
        room: "lezione-led",
        evidence: [
          "plugin:com.ardesia.web-view@0.1.0",
          "board:plugin-postit-web-view-1-board",
        ],
      }),
    ])
    expect(container.querySelector('[data-plugin-postit-instance="web-view-1"]')).not.toBeNull()
    expect(container.querySelector('[data-plugin-postit-plugin="com.ardesia.web-view"]')).not.toBeNull()
    expect(container.querySelector('[data-catalog-plugin-kind="web"]')).not.toBeNull()
    expect(container.querySelector('[data-plugin-evidence-ref="plugin:com.ardesia.web-view@0.1.0"]')).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "salva board post-it da finestra" }))

    await waitFor(() => {
      expect(workbench.getAttribute("data-board-postit-count")).toBe("4")
    })
  })

  it("keeps the isolated harness free from private simulator internals", () => {
    const source = readFileSync(join(process.cwd(), "src", "design", "MultiPostitWorkbench.tsx"), "utf8")
    const modelSource = readFileSync(
      join(process.cwd(), "src", "design", "multiPostitWorkbenchModel.ts"),
      "utf8",
    )
    const guardedSource = `${source}\n${modelSource}`

    expect(guardedSource).not.toMatch(
      /\b(?:CircuitSolver|AVRBridge|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|simulationProviders)\b/,
    )
    expect(guardedSource).not.toMatch(/@elab-tutor-plugin|sim\/solver|components\/simulator/)
  })
})
