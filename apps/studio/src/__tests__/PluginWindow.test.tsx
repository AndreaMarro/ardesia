// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import PluginWindow from "../design/PluginWindow"
import {
  buildDefaultPluginWindowCatalog,
  createPluginWindowInsertRequest,
  pluginMountedEventFromInsertRequest,
  pluginRegistryFromCatalog,
  type PluginWindowCatalogItem,
} from "../design/pluginWindowCatalog"
import { projectTeacherDashboard } from "../lessonos/teacherDashboardProjection"
import type { PluginMarketplaceItem } from "../toolhost/marketplace/marketplaceItem"

afterEach(() => {
  cleanup()
})

const marketplacePlugin: PluginMarketplaceItem = {
  kind: "plugin",
  availability: { status: "available" },
  manifest: {
    manifestVersion: 1,
    id: "com.teacher.oscilloscope",
    name: "Oscilloscopio",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.read": {}, ui: {} },
    publisher: { id: "teacher-lab", pubkey: "ed25519:AAAA" },
    privacy: { dataOut: "none" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Oscilloscopio",
        consentBlurb: "Analizza un segnale di esempio dentro un post-it.",
      },
    },
  },
}

const userCreatedPlugin: PluginWindowCatalogItem = {
  id: "user.plugin.local-graph",
  pluginId: "user.plugin.local-graph",
  title: "Grafico locale",
  description: "Plugin creato dal docente nella factory locale.",
  kind: "user-created",
  source: "user",
  readiness: "ready",
  availability: "available",
  version: "0.1.0",
  publisher: "docente",
  lessonOs: {
    eventType: "plugin.insert.requested",
    evidenceRef: "plugin:user.plugin.local-graph@0.1.0",
  },
}

describe("PluginWindow catalog", () => {
  it("lists every plugin family Andrea asked for", () => {
    const catalog = buildDefaultPluginWindowCatalog({
      marketplaceItems: [marketplacePlugin],
      userCreated: [userCreatedPlugin],
    })
    const kinds = new Set(catalog.map((item) => item.kind))

    expect(kinds).toEqual(
      new Set([
        "essential",
        "function",
        "simulation",
        "drawing-hd",
        "web",
        "marketplace",
        "user-created",
      ]),
    )
    expect(catalog.map((item) => item.pluginId)).not.toContain("io.ardesia.simulation")
    expect(catalog.map((item) => item.pluginId)).not.toContain("io.elab.tutor")
    expect(catalog.map((item) => item.pluginId)).toContain("io.ardesia.fluid-thermo")
    expect(catalog.map((item) => item.pluginId)).toContain("com.ardesia.manual-evidence")
    expect(catalog.map((item) => item.pluginId)).toContain("com.ardesia.drawing-hd")
    expect(catalog.map((item) => item.pluginId)).toContain("com.ardesia.web-view")
    expect(catalog.map((item) => item.pluginId)).toContain("com.teacher.oscilloscope")
    expect(catalog.map((item) => item.pluginId)).toContain("user.plugin.local-graph")
    expect(new Set(catalog.map((item) => item.pluginId)).size).toBe(catalog.length)
    expect(catalog.find((item) => item.pluginId === "com.ardesia.drawing-hd")).toMatchObject({
      kind: "drawing-hd",
      source: "essential",
    })
    expect(catalog.find((item) => item.pluginId === "com.ardesia.web-view")).toMatchObject({
      kind: "web",
      source: "essential",
    })
  })

  it("turns any insert into a LessonOS-ready event payload", () => {
    const item = buildDefaultPluginWindowCatalog().find((entry) => entry.pluginId === "com.ardesia.plugin-functions")
    expect(item).toBeDefined()
    if (item === undefined) return

    const request = createPluginWindowInsertRequest(item)

    expect(request.item).toBe(item)
    expect(request.lessonOsEvent).toEqual({
      type: "plugin.insert.requested",
      pluginId: "com.ardesia.plugin-functions",
      pluginKind: "function",
      evidenceRefs: ["plugin:com.ardesia.plugin-functions@0.1.0"],
      label: "Funzioni",
    })
    expect(
      pluginMountedEventFromInsertRequest(request, {
        instanceId: "sim-a",
        elementId: "plugin-postit-sim-a-board",
        room: "lezione-led",
        t: 1718000000000,
      }),
    ).toEqual({
      kind: "plugin.mounted",
      pluginId: "com.ardesia.plugin-functions",
      pluginKind: "function",
      instanceId: "sim-a",
      room: "lezione-led",
      labels: { it: "Funzioni" },
      evidence: ["plugin:com.ardesia.plugin-functions@0.1.0", "board:plugin-postit-sim-a-board"],
      t: 1718000000000,
    })
  })

  it("builds a LessonOS plugin registry from the window catalog without using UI state", () => {
    const catalog = buildDefaultPluginWindowCatalog({
      marketplaceItems: [marketplacePlugin],
      userCreated: [userCreatedPlugin],
    })

    const registry = pluginRegistryFromCatalog(catalog)

    expect(registry.map((item) => [item.id, item.pluginKind, item.kind, item.evidenceRef])).toEqual([
      ["com.ardesia.concept-map", "essential", "tool", "plugin:com.ardesia.concept-map@0.1.0"],
      ["com.ardesia.drawing-hd", "drawing-hd", "tool", "plugin:com.ardesia.drawing-hd@0.1.0"],
      ["com.ardesia.lesson-checklist", "essential", "tool", "plugin:com.ardesia.lesson-checklist@0.1.0"],
      ["com.ardesia.manual-evidence", "essential", "tool", "plugin:com.ardesia.manual-evidence@0.1.0"],
      ["com.ardesia.plugin-functions", "function", "tool", "plugin:com.ardesia.plugin-functions@0.1.0"],
      ["com.ardesia.web-view", "web", "tool", "plugin:com.ardesia.web-view@0.1.0"],
      ["com.teacher.oscilloscope", "marketplace", "tool", "plugin:com.teacher.oscilloscope@1.0.0"],
      ["io.ardesia.fluid-thermo", "simulation", "tool", "plugin:io.ardesia.fluid-thermo@1.0.0"],
      ["user.plugin.local-graph", "user-created", "tool", "plugin:user.plugin.local-graph@0.1.0"],
    ])
  })

  it("feeds TeacherDashboardProjection Z6 with registry rows derived from catalog", () => {
    const catalog = buildDefaultPluginWindowCatalog({
      marketplaceItems: [marketplacePlugin],
      userCreated: [userCreatedPlugin],
    })
    const registry = pluginRegistryFromCatalog(catalog)

    const projection = projectTeacherDashboard({
      lessonEvents: [],
      teacherId: "teacher-a",
      locale: "it",
      generatedAt: 1,
      pluginRegistry: registry,
    })

    expect(projection.unavailable.map((entry) => entry.zone)).not.toContain("Z6")
    expect(projection.plugins.find((plugin) => plugin.id === "com.ardesia.web-view")).toMatchObject({
      kind: "tool",
      readiness: "preview",
      lastUsedAt: null,
    })
  })
})

describe("PluginWindow component", () => {
  it("renders grouped options and inserts the chosen plugin with LessonOS metadata", () => {
    const onInsert = vi.fn()
    const catalog = buildDefaultPluginWindowCatalog({
      marketplaceItems: [marketplacePlugin],
      userCreated: [userCreatedPlugin],
    })

    const { container } = render(<PluginWindow items={catalog} onInsert={onInsert} />)

    expect(screen.getByRole("dialog", { name: "Finestra plugin" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Tutti" }).getAttribute("aria-pressed")).toBe(
      "true",
    )
    expect(screen.queryByRole("button", { name: "ELABTutor" })).toBeNull()
    expect(screen.getByRole("button", { name: "Disegno HD" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Web" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Creati da noi" })).toBeTruthy()

    const simulationRow = container.querySelector('[data-plugin-window-item="com.ardesia.plugin-functions"]')
    expect(simulationRow).not.toBeNull()
    expect(simulationRow?.getAttribute("data-lessonos-event")).toBe("plugin.insert.requested")

    fireEvent.click(within(simulationRow as HTMLElement).getByRole("button", { name: "Inserisci Funzioni" }))

    expect(onInsert).toHaveBeenCalledTimes(1)
    expect(onInsert.mock.calls[0][0].lessonOsEvent).toMatchObject({
      type: "plugin.insert.requested",
      pluginId: "com.ardesia.plugin-functions",
      evidenceRefs: ["plugin:com.ardesia.plugin-functions@0.1.0"],
    })
  })

  it("filters by search without changing the insertion contract", () => {
    const onInsert = vi.fn()
    const catalog = buildDefaultPluginWindowCatalog({
      marketplaceItems: [marketplacePlugin],
      userCreated: [userCreatedPlugin],
    })
    const { container } = render(<PluginWindow items={catalog} onInsert={onInsert} />)

    fireEvent.change(screen.getByLabelText("Cerca plugin"), { target: { value: "web" } })

    expect(container.querySelector('[data-plugin-window-item="com.ardesia.web-view"]')).not.toBeNull()
    expect(container.querySelector('[data-plugin-window-item="com.ardesia.plugin-functions"]')).toBeNull()

    const webRow = container.querySelector('[data-plugin-window-item="com.ardesia.web-view"]')
    fireEvent.click(within(webRow as HTMLElement).getByRole("button", { name: "Inserisci Web" }))

    expect(onInsert.mock.calls[0][0].lessonOsEvent.pluginKind).toBe("web")
  })
})
