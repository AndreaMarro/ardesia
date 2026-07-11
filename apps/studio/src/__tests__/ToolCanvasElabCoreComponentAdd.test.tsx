// @vitest-environment jsdom
// P32 slice 2b — palette del canvas plugin VIVA nell'embeddable.
// Prima di questa slice l'host cablava SOLO 4 callback (move, connectionAdd,
// wireUpdate, wireDelete): onComponentAdd restava undefined e i flussi già
// scritti nel SimulatorCanvas (tap-to-place, drag-drop, Ctrl+V paste, Ctrl+D
// duplica) erano morti nell'embed. Qui si prova il filo host→plugin:
// onComponentAdd → place-component nella SCENA (source of truth) → write-back
// host.persistEmbedState (stesso canale delle wire, D6).
//
// Il plugin è mockato per CATTURARE le props del mount: il contratto testato è
// quello dell'host (il canvas reale è coperto da "monta nel post-it il canvas
// ELABTutor reale" in ToolCanvasEmbeddable.test.tsx).
import { act, cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

type CapturedProps = {
  experiment: { components: Array<{ id: string; type: string }> }
  onComponentAdd?: (type: string, position: { x: number; y: number }) => string | null
}

const rendered: CapturedProps[] = []
vi.mock("@elab-tutor-plugin/plugin/renderEmbeddable", () => ({
  renderEmbeddable: (_node: HTMLElement, props: CapturedProps) => {
    rendered.push(props)
    return { dispose() {} }
  },
}))

import {
  REFERENCE_SIM_EMBED_ID,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"

afterEach(() => {
  cleanup()
  rendered.length = 0
})

async function mountCoreCanvas(persist?: (embedId: string, state: unknown, toolId?: string) => void) {
  const element = createToolEmbedElement()
  const view = renderToolCanvasEmbeddable(
    element as never,
    persist === undefined ? undefined : { persistEmbedState: persist },
    "runtime",
  )
  if (view === null) throw new Error("embeddable non renderizzato")
  const utils = render(view)
  await waitFor(() => expect(rendered.length).toBeGreaterThan(0))
  return utils
}

describe("ElabCoreCanvasMount — onComponentAdd (P32 slice 2b, palette canvas plugin viva)", () => {
  it("cabla onComponentAdd: id ritornato, place-component in scena, write-back persistito", async () => {
    const persist = vi.fn()
    const { container } = await mountCoreCanvas(persist)

    const props = rendered.at(-1)!
    expect(typeof props.onComponentAdd).toBe("function")
    const baseline = props.experiment.components.length

    let newId: string | null = null
    act(() => {
      newId = props.onComponentAdd!("led", { x: 120, y: 96 })
    })
    expect(newId).toBe("led-libero-1")

    // write-back: la scena persistita contiene componente e layout
    expect(persist).toHaveBeenCalled()
    const [embedId, state] = persist.mock.calls.at(-1) as [string, { scene: {
      components: Array<{ id: string; type: string; color?: string }>
      layout: Record<string, { x: number; y: number }>
      pinAssignments: Record<string, string>
    } }]
    expect(embedId).toBe(REFERENCE_SIM_EMBED_ID)
    expect(state.scene.components.at(-1)).toMatchObject({
      id: "led-libero-1",
      type: "led",
      color: "red",
    })
    expect(state.scene.layout["led-libero-1"]).toEqual({ x: 120, y: 96 })
    // flottante: nessun pinAssignment inventato (inerte finché non cablato)
    expect(
      Object.keys(state.scene.pinAssignments).some((ref) => ref.startsWith("led-libero-1")),
    ).toBe(false)

    // remount con la scena aggiornata: la proiezione include il componente
    await waitFor(() => {
      expect(rendered.at(-1)!.experiment.components.length).toBe(baseline + 1)
    })
    const mount = container.querySelector(
      '[data-elab-canvas-source-of-truth="simulation-scene"]',
    )!
    expect(mount.getAttribute("data-elab-canvas-components")).toBe(String(baseline + 1))
    expect(mount.getAttribute("data-elab-canvas-last-operation")).toContain("led-libero-1")
  })

  it("id progressivi e collision-safe su add ripetuti", async () => {
    await mountCoreCanvas()
    const props = rendered.at(-1)!

    let first: string | null = null
    let second: string | null = null
    act(() => {
      first = props.onComponentAdd!("resistor", { x: 60, y: 40 })
    })
    await waitFor(() => expect(rendered.at(-1)!.experiment.components.some((c) => c.id === first)).toBe(true))
    act(() => {
      second = rendered.at(-1)!.onComponentAdd!("resistor", { x: 90, y: 40 })
    })
    expect(first).toBe("resistor-libero-1")
    expect(second).toBe("resistor-libero-2")
  })

  it("nega i tipi fuori decisione (battery9v, wire, non catalogati): null, nessun write-back", async () => {
    const persist = vi.fn()
    await mountCoreCanvas(persist)
    const props = rendered.at(-1)!

    for (const denied of ["battery9v", "wire", "breadboard-half", "buzzer"]) {
      let out: string | null = "sentinella"
      act(() => {
        out = props.onComponentAdd!(denied, { x: 10, y: 10 })
      })
      expect(out).toBeNull()
    }
    expect(persist).not.toHaveBeenCalled()
  })
})
