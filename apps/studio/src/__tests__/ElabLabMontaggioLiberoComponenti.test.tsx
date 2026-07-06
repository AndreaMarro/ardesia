// @vitest-environment jsdom
// Montaggio libero, slice 2 — aggiungi/rimuovi COMPONENTI e ASSEGNAZIONI.
// Il montaggio dello studente non è solo "sposta i pin del manuale": è
// dichiarare componenti nuovi, toglierne, mettere e togliere terminali dai
// fori. La diagnostica resta l'unico giudice: un'assegnazione verso un
// componente non dichiarato = component-unknown VISIBILE (mai nascosto),
// un componente rimosso lascia i suoi terminali orfani e la diagnostica
// lo dice. Dati Pack reali (v1-cap6-esp1), zero mock.

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

async function renderMontaggioAttivo() {
  window.history.replaceState(null, "", "/?vista=elab-lab&esperimento=v1-cap6-esp1")
  const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
  const panel = await waitFor(() => {
    const node = container.querySelector("[data-elab-lab-montaggio-libero]")
    if (node === null) throw new Error("pannello montaggio libero assente")
    return node as HTMLElement
  })
  fireEvent.click(panel.querySelector("[data-montaggio-attiva]")!)
  const diagnostica = container.querySelector("[data-elab-lab-diagnostica]") as HTMLElement
  return { container, panel, diagnostica }
}

function findings(diagnostica: HTMLElement): string[] {
  return Array.from(diagnostica.querySelectorAll("[data-diagnostica-finding]")).map(
    (node) => node.textContent ?? "",
  )
}

describe("ELAB Lab — montaggio libero slice 2 (componenti e assegnazioni)", () => {
  it("rimuovi assegnazione: il terminale esce dal foro, la scena resta onesta", async () => {
    const { panel, diagnostica } = await renderMontaggioAttivo()
    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(4)

    fireEvent.click(panel.querySelector('[data-montaggio-rimuovi-pin="led1:anode"]')!)

    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(3)
    // Scena con un terminale in meno: nessun conflitto, nessun finding.
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).not.toBeNull()
    })
  })

  it("aggiungi assegnazione verso componente NON dichiarato: component-unknown live", async () => {
    const { panel, diagnostica } = await renderMontaggioAttivo()

    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-pin]")!, {
      target: { value: "led9:anode" },
    })
    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-foro]")!, {
      target: { value: "bb1:a1" },
    })
    fireEvent.click(panel.querySelector("[data-montaggio-aggiungi-pin]")!)

    await waitFor(() => {
      expect(
        findings(diagnostica).some(
          (text) => text.includes("led9") && text.includes("non dichiarato"),
        ),
      ).toBe(true)
    })
  })

  it("aggiungi componente dichiarato + assegnazione su foro libero: scena pulita", async () => {
    const { panel, diagnostica } = await renderMontaggioAttivo()

    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-componente-id]")!, {
      target: { value: "led2" },
    })
    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-componente-tipo]")!, {
      target: { value: "led" },
    })
    fireEvent.click(panel.querySelector("[data-montaggio-aggiungi-componente]")!)

    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-pin]")!, {
      target: { value: "led2:anode" },
    })
    fireEvent.change(panel.querySelector("[data-montaggio-nuovo-foro]")!, {
      target: { value: "bb1:a1" },
    })
    fireEvent.click(panel.querySelector("[data-montaggio-aggiungi-pin]")!)

    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(5)
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).not.toBeNull()
    })
  })

  it("rimuovi componente: i suoi terminali restano orfani e la diagnostica LO DICE", async () => {
    const { panel, diagnostica } = await renderMontaggioAttivo()

    fireEvent.click(panel.querySelector('[data-montaggio-rimuovi-componente="led1"]')!)

    await waitFor(() => {
      const texts = findings(diagnostica)
      // led1:anode e led1:cathode ancora nei fori, componente sparito.
      expect(
        texts.filter((text) => text.includes("led1") && text.includes("non dichiarato")),
      ).toHaveLength(2)
    })
    expect(diagnostica.querySelector("[data-diagnostica-ok]")).toBeNull()
  })

  it("ripristina dal manuale: torna TUTTO (componenti e assegnazioni del Pack)", async () => {
    const { panel, diagnostica } = await renderMontaggioAttivo()

    fireEvent.click(panel.querySelector('[data-montaggio-rimuovi-componente="led1"]')!)
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).toBeNull()
    })

    fireEvent.click(panel.querySelector("[data-montaggio-ripristina]")!)
    expect(panel.querySelectorAll("input[data-montaggio-pin]")).toHaveLength(4)
    expect(
      panel.querySelector('[data-montaggio-rimuovi-componente="led1"]'),
    ).not.toBeNull()
    await waitFor(() => {
      expect(diagnostica.querySelector("[data-diagnostica-ok]")).not.toBeNull()
    })
  })
})
