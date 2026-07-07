// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import type { EntitlementAccessResult } from "../entitlements/entitlementApiClient"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

function renderElabLab(entitlementAccess: () => Promise<EntitlementAccessResult>) {
  return render(
    <ElabLab
      eventLog={new InMemoryEventLog()}
      entitlementAccess={entitlementAccess}
    />,
  )
}

describe("ElabLab — accesso ELAB Plugin via FastAPI entitlement", () => {
  it("mostra plugin installato/attivo, capability e accesso verificato dal servizio FastAPI", async () => {
    const { container } = renderElabLab(async () => ({
      kind: "granted",
      endpoint: "https://entitlement.example.test",
      scope: {
        schoolId: "scuola-pseudo",
        classId: "3b-pseudo",
        featureLookupKey: "tutor-monthly-15eur",
      },
    }))

    const panel = container.querySelector<HTMLElement>("[data-elab-lab-entitlement]")
    expect(panel).not.toBeNull()
    await waitFor(() =>
      expect(panel!.getAttribute("data-entitlement-state")).toBe("granted"),
    )
    expect(screen.queryByText("FastAPI entitlement: accesso verificato")).not.toBeNull()
    expect(panel!.textContent).toContain("installato · attivo")
    expect(panel!.textContent).toContain("registry.solve")
    expect(panel!.textContent).toContain("graph.query read-only")
    expect(panel!.textContent).toContain("https://entitlement.example.test")
    expect(panel!.textContent).not.toContain("scuola-pseudo")
    expect(panel!.textContent).not.toContain("3b-pseudo")
  })

  it("senza configurazione FastAPI dichiara stato locale e non accesso verificato", async () => {
    const { container } = renderElabLab(async () => ({
      kind: "not-configured",
      reason: "missing-base-url",
    }))

    const panel = container.querySelector<HTMLElement>("[data-elab-lab-entitlement]")
    expect(panel).not.toBeNull()
    await waitFor(() =>
      expect(panel!.getAttribute("data-entitlement-state")).toBe("not-configured"),
    )
    expect(screen.queryByText("FastAPI entitlement: non configurato")).not.toBeNull()
    expect(panel!.textContent).toContain("nessuna chiamata esterna")
    expect(panel!.textContent).toContain("nessun endpoint")
    expect(panel!.textContent).not.toContain("accesso verificato")
  })

  it("rende esplicite le modalità Già montato, Passo-passo, Monta tu e mostra il manuale", async () => {
    const { container } = renderElabLab(async () => ({
      kind: "not-configured",
      reason: "missing-base-url",
    }))

    const modePanel = container.querySelector<HTMLElement>("[data-elab-lab-mode-panel]")
    expect(modePanel).not.toBeNull()
    expect(modePanel!.getAttribute("data-elab-lab-mode")).toBe("ready")
    expect(modePanel!.textContent).toContain("manuale:")

    fireEvent.click(container.querySelector("[data-elab-lab-mode-step]") as Element)
    const stepPanel = container.querySelector<HTMLElement>("[data-elab-lab-step-mode]")
    expect(stepPanel).not.toBeNull()
    expect(stepPanel!.getAttribute("data-step-passed")).toBe("4/4")
    expect(stepPanel!.textContent).toContain("Collega il positivo della batteria")
    expect(stepPanel!.textContent).toContain("Vol.1 pag.30")
    expect(container.querySelector("[data-elab-lab-step-manual-crop]")).not.toBeNull()

    fireEvent.click(container.querySelector("[data-elab-lab-mode-free]") as Element)
    expect(modePanel!.getAttribute("data-elab-lab-mode")).toBe("free")
    expect(container.querySelector("[data-montaggio-componenti]")).not.toBeNull()

    fireEvent.click(container.querySelector("[data-elab-lab-mode-ready]") as Element)
    expect(modePanel!.getAttribute("data-elab-lab-mode")).toBe("ready")
    expect(container.querySelector("[data-montaggio-componenti]")).toBeNull()
  })
})
