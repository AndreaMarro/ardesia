// REVIEW-ONLY probe (OPENCODE_PREPARATORY_AUDIT, 2026-09-21).
// Executed in a disposable copy against frozen code eb7a018d; results in
// experiments.md (E5/E6). Never imported by product, CI, or workflows.
// Synthetic data only. See dossier README before reuse.
// @vitest-environment jsdom
// TEMPORARY review probes (probe copy only, never committed).
import { describe, it, expect, afterEach, vi } from "vitest"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import type { AppendedEvent, EventLogStore, LessonOsEvent } from "../lessonos/eventlog"

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

/** Append gate controllable per-call: first call pends, rest resolve. */
class GateLog implements EventLogStore {
  private inner = new InMemoryEventLog()
  private gates: Array<() => void> = []
  autoResolve = false
  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    if (!this.autoResolve) {
      await new Promise<void>((resolve) => { this.gates.push(resolve) })
    }
    return this.inner.append(event)
  }
  releaseOne(): void {
    const g = this.gates.shift()
    if (g) g()
  }
  releaseAll(): void {
    let g = this.gates.shift()
    while (g) { g(); g = this.gates.shift() }
  }
  async readAll(): Promise<AppendedEvent[]> {
    return this.inner.readAll()
  }
}

function conceptRadio(view: HTMLElement, label: string): HTMLInputElement {
  const input = [...view.querySelectorAll<HTMLInputElement>("input[type=radio]")].find(
    (el) => el.closest("label")?.textContent?.includes(label),
  )
  if (!input) throw new Error("radio non trovata")
  return input
}

function mistakeButtons(view: HTMLElement): HTMLButtonElement[] {
  return [...view.querySelectorAll<HTMLButtonElement>("button[data-mistake-id]")]
    .filter((el) => !el.disabled)
}

function markedText(view: HTMLElement): string {
  return view.querySelector("[data-marked-count]")?.textContent ?? ""
}

describe("review probes: concurrency + unmount (temporary)", () => {
  it("two in-flight marks: no anticipation, no duplication", async () => {
    const log = new GateLog()
    const view = await renderView(log)
    await act(async () => {
      conceptRadio(view, "polarità LED").click()
    })
    const buttons = mistakeButtons(view)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    await act(async () => {
      buttons[0].click()
    })
    await act(async () => {
      buttons[1].click()
    })
    // both appends pending: counter must not anticipate either
    expect(markedText(view)).toBe("errori segnati: 0")
    log.releaseOne()
    await vi.waitFor(() => {
      expect(markedText(view)).toBe("errori segnati: 1")
    })
    log.releaseOne()
    await vi.waitFor(() => {
      expect(markedText(view)).toBe("errori segnati: 2")
    })
    expect(await log.readAll()).toHaveLength(2)
  })

  it("unmount mid-flight: no crash, no later misattribution", async () => {
    const log = new GateLog()
    const view = await renderView(log)
    await act(async () => {
      conceptRadio(view, "polarità LED").click()
    })
    await act(async () => {
      mistakeButtons(view)[0].click()
    })
    const r = root!
    await act(async () => r.unmount())
    root = null
    log.releaseAll()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(await log.readAll()).toHaveLength(1)
  })
})
