// @vitest-environment jsdom
// P0-A parallelismo ai libri — l'ELAB Lab monta QUALSIASI esperimento del
// corpus (91, vol.1-3) via ?esperimento=<id>: stesso mount, stesso solve via
// registry, stessa citazione dal libro. Fail-closed: id ignoto = stato
// no-experiment dichiarato, mai un fallback silenzioso sul default.

import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ElabLab, {
  ELAB_LAB_EXPERIMENT_ID,
  findElabLabExperiment,
} from "../design/ElabLab"
import { readElabLabExperimentId } from "../store/elabLabView"
import { ALL_EXPERIMENTS } from "@elab-tutor-plugin/data/experiments-index"
import { filterVisibleExperiments } from "@elab-tutor-plugin/data/experiment-visibility"
import { InMemoryEventLog } from "../lessonos/eventlog"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("readElabLabExperimentId", () => {
  it("default = v1-cap6-esp1 senza parametro", () => {
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(readElabLabExperimentId()).toBe(ELAB_LAB_EXPERIMENT_ID)
  })

  it("legge ?esperimento=<id>", () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v1-cap6-esp2")
    expect(readElabLabExperimentId()).toBe("v1-cap6-esp2")
  })
})

describe("findElabLabExperiment (index corpus completo)", () => {
  it("trova esperimenti di TUTTI i volumi (88 nel corpus, come da canon)", () => {
    // Il commento dell'index dice 91 ma il corpus reale è 88 (conteggio
    // firsthand, coerente col canon "88 esperimenti").
    expect(ALL_EXPERIMENTS.length).toBe(88)
    expect(findElabLabExperiment("v1-cap6-esp2")?.title).toContain("LED senza resistore")
    expect(findElabLabExperiment("v2-cap3-esp1")).not.toBeNull()
  })

  it("id ignoto: null (fail-closed, nessun fallback silenzioso)", () => {
    expect(findElabLabExperiment("v9-inventato-esp0")).toBeNull()
  })
})

describe("ElabLab con ?esperimento", () => {
  it("monta l'esperimento richiesto: chip col suo titolo e selettore allineato", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v1-cap6-esp2")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
        throw new Error("vista non montata")
      }
    })
    expect(container.textContent).toContain("LED senza resistore")
    const select = container.querySelector<HTMLSelectElement>("select[data-elab-experiment-select]")
    expect(select).not.toBeNull()
    expect(select?.value).toBe("v1-cap6-esp2")
    // Disciplina Scene Forge: il picker offre SOLO la whitelist (8 visibili
    // oggi), non il corpus intero — il corpus resta montabile via URL.
    expect(select?.options.length).toBe(filterVisibleExperiments(ALL_EXPERIMENTS).length)
  })

  it("id ignoto: stato no-experiment dichiarato", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v9-inventato-esp0")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=no-experiment]") === null) {
        throw new Error("stato no-experiment assente")
      }
    })
    expect(container.textContent).toContain("v9-inventato-esp0")
  })
})
