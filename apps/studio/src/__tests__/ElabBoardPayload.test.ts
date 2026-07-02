// @vitest-environment node

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  createElabV1Cap6Esp1BoardWritePayload,
  createElabV1Cap6Esp1EmbeddableSkeleton,
  ELAB_V1_CAP6_ESP1_EMBED_ID,
  ELAB_V1_CAP6_ESP1_TOOL_ID,
} from "../../sim/elab/boardPayload.ts"
import {
  EMBED_DATA_KEY,
  ToolBoard,
  embedOwner,
  type BoardApiLike,
  type BoardElementLike,
} from "../toolhost/caps/board.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const fixturePath = path.join(
  repoRoot,
  "apps/studio/sim/fixtures/elab-v1-cap6-esp1.json",
)

class TestBoardApi implements BoardApiLike {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}

  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }

  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }

  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = [...scene.elements]
  }
}

function readFixture(): unknown {
  return JSON.parse(fs.readFileSync(fixturePath, "utf-8"))
}

describe("ELAB Vol.1 cap.6 esp.1 board payload contract", () => {
  it("creates board.write params with the canonical embed id and circuit state", () => {
    const payload = createElabV1Cap6Esp1BoardWritePayload(readFixture())

    expect(payload.embedId).toBe(ELAB_V1_CAP6_ESP1_EMBED_ID)
    expect(payload.state.schema).toBe("elab.board-embed-state.v1")
    expect(payload.state.circuit.schema).toBe("elab.circuit-scene-adapter.v1")
    expect(payload.state.circuit.experimentId).toBe("v1-cap6-esp1")
    expect(payload.state.circuit.circuit.pinAssignments).toEqual({
      "r1:pin1": "bb1:a2",
      "r1:pin2": "bb1:a9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:f10",
    })
  })

  it("keeps manual evidence pages 29-31 visible in the board state", () => {
    const payload = createElabV1Cap6Esp1BoardWritePayload(readFixture())

    expect(payload.state.view).toEqual({
      mode: "manual-aligned",
      sourceLabel: "Vol.1 pag.29-31",
      selectedManualPage: 29,
    })
    expect(payload.state.circuit.manualEvidence.map((evidence) => evidence.page)).toEqual([
      29,
      30,
      31,
    ])
  })

  it("creates a pure embeddable skeleton without claiming ownership before board.write", () => {
    const skeleton = createElabV1Cap6Esp1EmbeddableSkeleton("custom-elab-embed", {
      x: 10,
      y: 20,
      width: 300,
      height: 200,
    })

    expect(skeleton).toEqual({
      id: "custom-elab-embed",
      type: "embeddable",
      x: 10,
      y: 20,
      width: 300,
      height: 200,
    })
    expect(skeleton.customData).toBeUndefined()
  })

  it("is consumable by ToolBoard.write and preserves own-embeds ownership", () => {
    const api = new TestBoardApi()
    const board = new ToolBoard(
      api,
      ELAB_V1_CAP6_ESP1_TOOL_ID,
      createElabV1Cap6Esp1EmbeddableSkeleton,
    )
    const payload = createElabV1Cap6Esp1BoardWritePayload(readFixture())

    board.write(payload.embedId, payload.state)

    const embed = api.elements.find((element) => element.id === ELAB_V1_CAP6_ESP1_EMBED_ID)
    expect(embed).toBeDefined()
    expect(embedOwner(embed!)).toBe(ELAB_V1_CAP6_ESP1_TOOL_ID)

    const marker = embed!.customData?.[EMBED_DATA_KEY] as
      | { owner?: string; state?: unknown }
      | undefined
    expect(marker?.state).toEqual(payload.state)
    expect(embed!.type).toBe("embeddable")
    expect(embed!.width).toBe(640)
    expect(embed!.height).toBe(420)
  })

  it("inherits adapter validation and fails when pinAssignments are missing", () => {
    const fixture = readFixture() as { pinAssignments?: unknown }
    delete fixture.pinAssignments

    expect(() => createElabV1Cap6Esp1BoardWritePayload(fixture)).toThrow(
      /pinAssignments/,
    )
  })
})
