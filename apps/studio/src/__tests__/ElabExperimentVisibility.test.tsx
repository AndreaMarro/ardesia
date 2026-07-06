// @vitest-environment jsdom
// Disciplina Scene Forge (NOTTE-12): la fonte di verità della visibilità
// esperimenti è VISIBLE_EXP_IDS (selezione Andrea verbatim 25/05/2026) e il
// picker dell'ELAB Lab deve mostrarla ESATTAMENTE — mai un esperimento fuori
// whitelist tra le opzioni scelte. La resurrezione via URL (?esperimento=)
// resta possibile per design ("ASSICURATI DI POTERE RESUSCITARE TUTTO"), ma
// un id montato fuori whitelist compare come voce singola disabilitata e
// dichiarata, non come catalogo.

import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ElabLab from "../design/ElabLab"
import {
  VISIBLE_EXP_IDS,
  VISIBILITY_FILTER_DISABLED,
  filterVisibleExperiments,
  isVisibleExperiment,
} from "@elab-tutor-plugin/data/experiment-visibility"
import {
  ALL_EXPERIMENTS,
  findExperimentById,
} from "@elab-tutor-plugin/data/experiments-index"
import { InMemoryEventLog } from "../lessonos/eventlog"

/** Gli 8 esperimenti visibili oggi — l'ordine è quello della whitelist. */
const EXPECTED_VISIBLE_IDS = [
  "v1-cap6-esp1",
  "v1-cap6-esp2",
  "v1-cap6-esp3",
  "v1-cap9-esp6",
  "v2-cap7-esp1",
  "v2-cap7-esp2",
  "v3-cap6-esp4",
  "v3-cap6-esp5",
]

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

describe("whitelist VISIBLE_EXP_IDS (fonte di verità)", () => {
  it("è esattamente la selezione 8/8 di Andrea, nell'ordine della whitelist", () => {
    expect([...VISIBLE_EXP_IDS]).toEqual(EXPECTED_VISIBLE_IDS)
  })

  it("il filtro globale NON è disattivato (la disciplina è attiva)", () => {
    expect(VISIBILITY_FILTER_DISABLED).toBe(false)
  })

  it("ogni id visibile esiste nel corpus reale (niente id inventati)", () => {
    for (const id of VISIBLE_EXP_IDS) {
      expect(findExperimentById(id), `id whitelist assente dal corpus: ${id}`).not.toBeNull()
    }
  })

  it("filterVisibleExperiments(corpus 88) = 8 e non contiene id fuori whitelist", () => {
    const visible = filterVisibleExperiments(ALL_EXPERIMENTS)
    expect(visible.length).toBe(EXPECTED_VISIBLE_IDS.length)
    for (const entry of visible) {
      expect(EXPECTED_VISIBLE_IDS).toContain(entry.id)
    }
    // Controprova: v3-cap6-esp2 (nota severa: NON in whitelist oggi) è nel
    // corpus ma NON passa il filtro.
    expect(findExperimentById("v3-cap6-esp2")).not.toBeNull()
    expect(isVisibleExperiment("v3-cap6-esp2")).toBe(false)
  })
})

describe("picker ELAB Lab — solo esperimenti in whitelist", () => {
  it("default (v1-cap6-esp1): il selettore offre ESATTAMENTE le 8 opzioni whitelist", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
        throw new Error("vista non montata")
      }
    })
    const select = container.querySelector<HTMLSelectElement>(
      "select[data-elab-experiment-select]",
    )
    expect(select).not.toBeNull()
    const values = Array.from(select?.options ?? []).map((option) => option.value)
    expect(values).toEqual(EXPECTED_VISIBLE_IDS)
  })

  it("deep-link fuori whitelist (v3-cap5-esp1): monta, ma il picker resta 8 + voce corrente disabilitata", async () => {
    window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v3-cap5-esp1")
    const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
    await waitFor(() => {
      if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
        throw new Error("vista non montata (la resurrezione via URL deve restare possibile)")
      }
    })
    const select = container.querySelector<HTMLSelectElement>(
      "select[data-elab-experiment-select]",
    )
    expect(select).not.toBeNull()
    const options = Array.from(select?.options ?? [])
    // La voce corrente fuori whitelist è presente (il select riflette lo
    // stato reale) ma disabilitata: non è un invito a sceglierne altri.
    const current = options.find((option) => option.value === "v3-cap5-esp1")
    expect(current).not.toBeUndefined()
    expect(current?.disabled).toBe(true)
    // Nessun ALTRO id fuori whitelist tra le opzioni.
    const offList = options.filter(
      (option) => !isVisibleExperiment(option.value) && option.value !== "v3-cap5-esp1",
    )
    expect(offList).toEqual([])
    expect(options.length).toBe(EXPECTED_VISIBLE_IDS.length + 1)
    expect(select?.value).toBe("v3-cap5-esp1")
  })
})
