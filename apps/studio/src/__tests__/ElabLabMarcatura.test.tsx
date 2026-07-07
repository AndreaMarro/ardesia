// @vitest-environment jsdom
// ELAB Lab — marcatura errori (emittente error.observed, P0 post #67+#68+#70):
// il docente sceglie il concetto (concepts_learned del Pack) e segna una
// common_mistake (fase CHIEDI) → bus "error.observed" → bindBusToEventLog →
// fatto sull'event-log. Niente mock del plugin: vista vera, log InMemory vero.

import { describe, it, expect, afterEach, vi } from "vitest"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import type { EventLogStore } from "../lessonos/eventlog"

let host: HTMLDivElement | null = null
let root: Root | null = null

async function renderView(eventLog: EventLogStore): Promise<HTMLDivElement> {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<ElabLab eventLog={eventLog} />)
  })
  return host
}

afterEach(async () => {
  if (root !== null) {
    const r = root
    await act(async () => r.unmount())
    root = null
  }
  host?.remove()
  host = null
})

function conceptRadio(view: HTMLElement, label: string): HTMLInputElement {
  const input = [...view.querySelectorAll<HTMLInputElement>("input[type=radio]")].find(
    (el) => el.closest("label")?.textContent?.includes(label),
  )
  if (!input) throw new Error(`radio concetto "${label}" non trovata`)
  return input
}

function mistakeButton(view: HTMLElement, text: string): HTMLButtonElement {
  const button = [...view.querySelectorAll<HTMLButtonElement>("button[data-mistake-id]")].find(
    (el) => el.textContent?.includes(text),
  )
  if (!button) throw new Error(`bottone mistake "${text}" non trovato`)
  return button
}

describe("ElabLab — marcatura common_mistakes → error.observed", () => {
  it("senza concetto scelto i bottoni mistake sono disabilitati (nessun mapping inventato)", async () => {
    const view = await renderView(new InMemoryEventLog())
    const button = mistakeButton(view, "LED inserito al contrario")
    expect(button.disabled).toBe(true)
  })

  it("concetto scelto + tap sul mistake = error.observed sull'event-log coi campi del Pack", async () => {
    const log = new InMemoryEventLog()
    const view = await renderView(log)

    await act(async () => {
      conceptRadio(view, "polarità LED").click()
    })
    const button = mistakeButton(view, "LED inserito al contrario")
    expect(button.disabled).toBe(false)
    await act(async () => {
      button.click()
    })

    await vi.waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    const [event] = await log.readAll()
    expect(event).toMatchObject({
      kind: "error.observed",
      errorId: "v1-cap6-esp1:mistake-1",
      conceptId: "polarita-led-anodo-catodo",
      labels: { it: "LED inserito al contrario" },
      evidence: ["pack:io.elab.tutor:v1-cap6-esp1"],
    })
    expect(view.querySelector("[data-marked-count]")?.textContent).toContain("1")
  })

  it("append fallito → avviso visibile, mai silenzio", async () => {
    const brokenLog: EventLogStore = {
      append: () => Promise.reject(new Error("storage giù")),
      readAll: () => Promise.resolve([]),
    }
    const view = await renderView(brokenLog)

    await act(async () => {
      conceptRadio(view, "circuito chiuso").click()
    })
    await act(async () => {
      mistakeButton(view, "Batteria con polarità invertita").click()
    })

    await vi.waitFor(() => {
      expect(view.textContent).toContain("NON registrato")
    })
  })
})
