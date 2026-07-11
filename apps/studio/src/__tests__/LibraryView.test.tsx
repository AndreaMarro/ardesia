// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import LibraryView, { buildLibrarySnapshot } from "../design/LibraryView"
import { workspaceStore } from "../store/WorkspaceStore"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const ROOM = "corrente-continua"
const SCENE = JSON.stringify({
  elements: [
    { id: "nota-corrente", type: "text", text: "Misura la corrente prima di chiudere il circuito.", updated: 1700, isDeleted: false },
    { id: "schema-a", type: "image", fileId: "schema-led", updated: 1800, isDeleted: false },
    { id: "schema-b", type: "image", fileId: "schema-led", updated: 1900, isDeleted: false },
    {
      id: "postit-arduino",
      type: "rectangle",
      updated: 2000,
      isDeleted: false,
      customData: {
        maestroTool: {
          owner: "io.ardesia.arduino-toolchain",
          state: {
            kind: "arduino-toolchain-v1",
            project: { fqbn: "arduino:avr:nano" },
            artifact: {
              provider: "browser-avr",
              artifactFormat: "intel-hex",
              sizeBytes: 218,
              hexPreview: ":100000000C9434000C9451000C9451000C944F00",
              compiledAt: 2100,
            },
          },
        },
      },
    },
  ],
  files: {
    "schema-led": {
      id: "schema-led",
      mimeType: "image/png",
      dataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ",
    },
  },
})

describe("LibraryView", () => {
  it("indicizza asset reali della scena con hash, scope, provenienza e senza duplicare la stessa immagine", async () => {
    const snapshot = await buildLibrarySnapshot(SCENE, ROOM)

    expect(snapshot.assets.map((asset) => asset.kind)).toEqual([
      "arduino-artifact",
      "postit",
      "image",
      "note",
    ])
    const image = snapshot.assets.find((asset) => asset.kind === "image")
    const compileArtifact = snapshot.assets.find((asset) => asset.kind === "arduino-artifact")

    expect(image).toMatchObject({
      scope: ROOM,
      source: "scene:file",
      mimeType: "image/png",
      tags: ["image", "scene"],
    })
    expect(image?.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(compileArtifact).toMatchObject({
      scope: ROOM,
      source: "postit:arduino-toolchain",
      mimeType: "text/x-intel-hex",
      sizeBytes: 218,
      tags: ["arduino", "compile", "postit"],
    })
    expect(snapshot.unavailableKinds).toEqual(["audio", "pdf", "transcript"])
  })

  it("mantiene distinte le PluginInstance anche quando condividono lo stesso stato persistito", async () => {
    const scene = JSON.parse(SCENE) as { elements: Array<Record<string, unknown>> }
    scene.elements.push({
      ...scene.elements[3],
      id: "postit-arduino-secondo",
      updated: 2200,
    })

    const snapshot = await buildLibrarySnapshot(JSON.stringify(scene), ROOM)
    const postitIds = snapshot.assets.filter((asset) => asset.kind === "postit").map((asset) => asset.id)

    expect(postitIds).toEqual(["postit:postit-arduino-secondo", "postit:postit-arduino"])
  })

  it("legge la scena dallo WorkspaceStore condiviso quando non riceve dipendenze", async () => {
    vi.spyOn(workspaceStore, "init").mockResolvedValue("localStorage")
    const loadScene = vi.spyOn(workspaceStore, "loadScene").mockResolvedValue(SCENE)

    render(<LibraryView deps={{ room: ROOM }} />)

    expect(await screen.findByText("4 asset"))
    expect(loadScene).toHaveBeenCalledWith(ROOM)
  })

  it("rende il catalogo della stanza e filtra gli asset localmente", async () => {
    render(<LibraryView deps={{ room: ROOM, loadScene: async () => SCENE }} />)

    expect(await screen.findByText("4 asset"))
    expect(screen.getByText("Arduino compile"))
    expect(screen.getByText("Schema immagine"))
    const compileCard = screen.getByText("Arduino compile").closest("article")
    expect(compileCard?.querySelector("a")?.getAttribute("href")).toBe(
      "/?focus=postit-arduino#corrente-continua",
    )

    fireEvent.change(screen.getByRole("searchbox", { name: "Cerca nella Library" }), { target: { value: "arduino" } })

    expect(screen.getByText("Arduino compile"))
    expect(screen.queryByText("Schema immagine")).toBeNull()
  })
})
