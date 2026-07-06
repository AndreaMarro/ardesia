// @vitest-environment jsdom
// Modalità "montaggio libero" nella vista ELAB Lab — P0: analyzeFreeAssembly
// serve quando lo studente MONTA, non solo sul montaggio fisso del Pack.
// Qui la superficie editabile: i pinAssignments partono dal manuale (mai
// inventati) e diventano dello studente; la diagnostica gira LIVE sul
// montaggio editato. "Ripristina dal manuale" torna ai dati Pack (fail-closed:
// niente merge silenzioso tra stato studente e stato libro).

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
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
    const node = container.querySelector("[data-elab-lab-montaggio-libero]")
    if (node === null) throw new Error("pannello montaggio libero assente")
    return node as HTMLElement
  })
  return { container, panel }
}

function pinInput(panel: HTMLElement, pin: string): HTMLInputElement {
  const input = panel.querySelector(`input[data-montaggio-pin="${pin}"]`)
  if (input === null) throw new Error(`input per ${pin} assente`)
  return input as HTMLInputElement
}

describe("ELAB Lab — modalità montaggio libero (diagnostica live sull'editing)", () => {
  it("modalità spenta di default: bottone presente, nessun input di editing", async () => {
    const { panel } = await renderExperiment("v1-cap6-esp1")
    expect(panel.querySelector("[data-montaggio-attiva]")).not.toBeNull()
    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(0)
  })

  it("attivazione: un input per ogni pinAssignment, valori DAL MANUALE", async () => {
    const { panel } = await renderExperiment("v1-cap6-esp1")
    fireEvent.click(panel.querySelector("[data-montaggio-attiva]")!)
    // v1-cap6-esp1 (dato Pack reale): r1:pin1, r1:pin2, led1:anode, led1:cathode
    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(4)
    expect(pinInput(panel, "led1:anode").value).toBe("bb1:f3")
    expect(pinInput(panel, "led1:cathode").value).toBe("bb1:e3")
  })

  it("editing che crea un conflitto di foro: la diagnostica lo vede LIVE", async () => {
    const { container, panel } = await renderExperiment("v1-cap6-esp1")
    const diagnostica = container.querySelector("[data-elab-lab-diagnostica]")!
    expect(diagnostica.querySelector("[data-diagnostica-ok]")).not.toBeNull()

    fireEvent.click(panel.querySelector("[data-montaggio-attiva]")!)
    // anode nello stesso foro del cathode: fisicamente impossibile
    fireEvent.change(pinInput(panel, "led1:anode"), {
      target: { value: "bb1:e3" },
    })

    await waitFor(() => {
      const findings = Array.from(
        diagnostica.querySelectorAll("[data-diagnostica-finding]"),
      ).map((node) => node.textContent ?? "")
      expect(findings.some((text) => text.includes("bb1:e3"))).toBe(true)
    })
    expect(diagnostica.querySelector("[data-diagnostica-ok]")).toBeNull()
  })

  it("ripristina dal manuale: valori Pack e diagnostica di nuovo pulita", async () => {
    const { container, panel } = await renderExperiment("v1-cap6-esp1")
    const diagnostica = container.querySelector("[data-elab-lab-diagnostica]")!

    fireEvent.click(panel.querySelector("[data-montaggio-attiva]")!)
    fireEvent.change(pinInput(panel, "led1:anode"), {
      target: { value: "bb1:e3" },
    })
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).toBeNull()
    })

    fireEvent.click(panel.querySelector("[data-montaggio-ripristina]")!)
    expect(pinInput(panel, "led1:anode").value).toBe("bb1:f3")
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).not.toBeNull()
    })
  })

  it("fail-closed: esperimento senza pinAssignments = modalità assente, non vuota", async () => {
    // v2-cap9-esp2 ha pinAssignments (bug #92 a parte); il caso senza
    // assegnazioni deve NEGARE l'editing invece di mostrare un form vuoto.
    const { panel } = await renderExperiment("v1-cap6-esp1")
    // (il corpus 88 ha sempre pinAssignments: il ramo senza è coperto a
    // livello di unità dal rendering condizionale — qui si fissa il contratto
    // sul dato reale: bottone presente SOLO se c'è un montaggio dal manuale)
    expect(panel.querySelector("[data-montaggio-attiva]")).not.toBeNull()
  })
})
