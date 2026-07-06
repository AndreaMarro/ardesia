// @vitest-environment jsdom
// Diagnostica montaggio nella vista ELAB Lab — chiude il P0 "report unico
// PER LA VISTA": analyzeFreeAssembly (#82) sul montaggio dell'esperimento.
// Semantica dati (probe firsthand, issue #92): le connections del corpus
// sono topologia LOGICA, non fili fisici → l'occupazione si valuta sui SOLI
// pinAssignments (cross-check #74: esattamente i 3 bug canon, 0 falsi
// positivi). type-unregistered è rumore aggregato (60/88 esperimenti usano
// tipi fuori dal catalogo vendored), non un problema per-ref.

import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

async function renderExperiment(experimentId: string) {
  window.history.replaceState(
    null,
    "",
    `/?vista=elab-lab&esperimento=${experimentId}`,
  )
  const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
  const panel = await waitFor(() => {
    const node = container.querySelector("[data-elab-lab-diagnostica]")
    if (node === null) throw new Error("pannello diagnostica assente")
    return node
  })
  return { container, panel }
}

describe("ELAB Lab — diagnostica montaggio (freeAssembly sulla vista)", () => {
  it("v1-cap6-esp1: nessun problema (baseline sana del corpus)", async () => {
    const { panel } = await renderExperiment("v1-cap6-esp1")
    expect(panel.querySelector("[data-diagnostica-ok]")).not.toBeNull()
    expect(panel.querySelectorAll("[data-diagnostica-finding]")).toHaveLength(0)
  })

  it("v3-cap7-esp3: il bug corpus bb1:c21 (canon §1.4) è VISIBILE nella vista", async () => {
    const { panel } = await renderExperiment("v3-cap7-esp3")
    const findings = Array.from(
      panel.querySelectorAll("[data-diagnostica-finding]"),
    ).map((node) => node.textContent ?? "")
    expect(findings.some((text) => text.includes("bb1:c21"))).toBe(true)
    expect(panel.querySelector("[data-diagnostica-ok]")).toBeNull()
  })

  it("v2-cap9-esp2: i 6 component-unknown (issue #92) sono problemi elencati", async () => {
    const { panel } = await renderExperiment("v2-cap9-esp2")
    const findings = Array.from(
      panel.querySelectorAll("[data-diagnostica-finding]"),
    ).map((node) => node.textContent ?? "")
    expect(findings).toHaveLength(6)
    expect(findings.every((text) => text.includes("non dichiarato"))).toBe(true)
    // I tipi fuori catalogo restano un aggregato informativo, non problemi.
    expect(panel.querySelector("[data-diagnostica-tipi-fuori-catalogo]")).not.toBeNull()
  })
})
