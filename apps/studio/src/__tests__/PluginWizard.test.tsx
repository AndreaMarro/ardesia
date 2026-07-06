// @vitest-environment jsdom
// P0-D — Officina plugin (?vista=officina-plugin): wizard di authoring VISUALE
// sopra i mattoni reali già su main — scaffoldPlugin (#83), lintAuthoring
// (#78), runHandshakeHarness (#94), buildPluginPackage (#76).
//
// Contratto del wizard (falsificabile):
//   spec → "Genera il plugin" (disabilitato finché l'id non è reverse-DNS)
//        → scheda manifest + lint report (lint REALE sull'output)
//        → "Collauda l'handshake" sull'anteprima iframe → 4 check semaforici
//        → "Esporta .maestrotool" SOLO con harness ok E lint senza error
//          (fail-closed: un plugin che non passa il collaudo non esce).
//
// Il seam deps {makeKeys, scaffold, runHarness, makeTarget} esiste perché la
// firma Ed25519 in jsdom è realm-fragile (gotcha noto): qui si iniettano fake
// deterministici, il giro VERO (crypto reale + iframe reale) è nell'e2e
// plugin-wizard.spec.ts.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isPluginWizardView } from "../store/pluginWizardView"
import PluginWizard from "../design/PluginWizard"
import type { PluginWizardDeps } from "../design/PluginWizard"
import type { ScaffoldOutput, DevKeypair } from "../toolhost/authoring/scaffoldPlugin"
import type { ToolManifest } from "../toolhost-protocol/manifest"
import type { HandshakeHarnessReport } from "../toolhost/authoring/testHarness"

beforeEach(() => {
  window.history.replaceState(null, "", "/?vista=officina-plugin")
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

const KEYS: DevKeypair = { pubkeyB64: "cHVi", privateKeyPkcs8B64: "cHJpdg==" }

function makeManifest(overrides: Partial<ToolManifest> = {}): ToolManifest {
  return {
    manifestVersion: 1,
    id: "it.scuola.demo",
    name: "Demo",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    contract: ">=1.0 <2.0",
    kind: "plugin",
    entry: "entry.html",
    surfaces: ["panel"],
    capabilities: {},
    publisher: { id: "dev-local", pubkey: "ed25519:cHVi" },
    privacy: { dataOut: "none" },
    ...overrides,
  } as ToolManifest
}

function makeOutput(overrides: Partial<ScaffoldOutput> = {}): ScaffoldOutput {
  const manifest = overrides.manifest ?? makeManifest()
  return {
    manifestJson: JSON.stringify(manifest),
    signatureB64: "c2ln",
    entryHtml: "<!DOCTYPE html><html><body><h1>Demo</h1></body></html>",
    bundleZip: new Blob(["zip"], { type: "application/zip" }),
    manifest,
    ...overrides,
  }
}

const HARNESS_OK: HandshakeHarnessReport = {
  ok: true,
  checks: [
    { id: "tool-ready-received", pass: true },
    { id: "ready-well-formed", pass: true },
    { id: "nonce-echoed", pass: true },
    { id: "no-out-of-band-reply", pass: true },
  ],
}

function makeDeps(overrides: Partial<PluginWizardDeps> = {}): PluginWizardDeps {
  return {
    makeKeys: vi.fn(async () => KEYS),
    scaffold: vi.fn(async () => makeOutput()),
    runHarness: vi.fn(async () => HARNESS_OK),
    makeTarget: vi.fn(() => ({ deliverHello: () => {} })),
    ...overrides,
  }
}

describe("isPluginWizardView", () => {
  it("vera solo per ?vista=officina-plugin", () => {
    expect(isPluginWizardView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=tool-lab")
    expect(isPluginWizardView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isPluginWizardView()).toBe(false)
  })
})

describe("PluginWizard — spec e generazione", () => {
  it("Genera disabilitato finché l'id non è reverse-DNS valido", () => {
    render(<PluginWizard deps={makeDeps()} />)

    const genera = screen.getByRole("button", { name: /genera il plugin/i })
    expect((genera as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Voltmetro" } })
    fireEvent.change(screen.getByLabelText(/identificatore/i), {
      target: { value: "nonvalido" },
    })
    expect((genera as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/identificatore/i), {
      target: { value: "it.scuola.voltmetro" },
    })
    expect((genera as HTMLButtonElement).disabled).toBe(false)
  })

  it("la spec passata allo scaffolder riflette surface e capabilities scelte", async () => {
    const deps = makeDeps()
    render(<PluginWizard deps={deps} />)

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Voltmetro" } })
    fireEvent.change(screen.getByLabelText(/identificatore/i), {
      target: { value: "it.scuola.voltmetro" },
    })
    fireEvent.change(screen.getByLabelText(/superficie/i), {
      target: { value: "board-embed" },
    })
    fireEvent.click(screen.getByLabelText(/board\.read/i))
    fireEvent.click(screen.getByRole("button", { name: /genera il plugin/i }))

    await waitFor(() => expect(deps.scaffold).toHaveBeenCalledTimes(1))
    const [spec] = vi.mocked(deps.scaffold!).mock.calls[0]
    expect(spec.id).toBe("it.scuola.voltmetro")
    expect(spec.name).toBe("Voltmetro")
    expect(spec.surfaces).toEqual(["board-embed"])
    expect(spec.capabilities).toEqual({ "board.read": {} })
  })

  it("dopo Genera: scheda manifest + lint REALE sull'output (warn net-fetch-undeclarato visibile)", async () => {
    // entry che usa fetch( senza net.fetch dichiarata → lintAuthoring reale
    // deve produrre il warn: il wizard NON deve avere un suo lint parallelo.
    const deps = makeDeps({
      scaffold: vi.fn(async () =>
        makeOutput({
          entryHtml: "<!DOCTYPE html><html><body><script>fetch('/x')</script></body></html>",
        }),
      ),
    })
    render(<PluginWizard deps={deps} />)

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Demo" } })
    fireEvent.change(screen.getByLabelText(/identificatore/i), {
      target: { value: "it.scuola.demo" },
    })
    fireEvent.click(screen.getByRole("button", { name: /genera il plugin/i }))

    expect(await screen.findByText("it.scuola.demo")).toBeTruthy()
    expect(screen.getByText(/net\.fetch/)).toBeTruthy()
    const flag = screen.getByTestId("lint-flag-net-fetch-undeclared")
    expect(flag.getAttribute("data-severity")).toBe("warn")
  })
})

describe("PluginWizard — collaudo e export (fail-closed)", () => {
  async function generaEBase(deps: PluginWizardDeps) {
    render(<PluginWizard deps={deps} />)
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Demo" } })
    fireEvent.change(screen.getByLabelText(/identificatore/i), {
      target: { value: "it.scuola.demo" },
    })
    fireEvent.click(screen.getByRole("button", { name: /genera il plugin/i }))
    await screen.findByText("it.scuola.demo")
    // Il collaudo si abilita all'onLoad dell'anteprima: jsdom non carica i
    // srcDoc, quindi il load si simula (nel browser reale lo emette l'iframe).
    fireEvent.load(document.querySelector(".ow-preview-frame")!)
    expect(
      (screen.getByRole("button", { name: /collauda l'handshake/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(false)
  }

  it("harness con check fallito: 4 righe semaforiche, dettaglio visibile, export DISABILITATO", async () => {
    const report: HandshakeHarnessReport = {
      ok: false,
      checks: [
        { id: "tool-ready-received", pass: true },
        { id: "ready-well-formed", pass: true },
        { id: "nonce-echoed", pass: false, detail: "nonce diverso da quello inviato" },
        { id: "no-out-of-band-reply", pass: true },
      ],
    }
    const deps = makeDeps({ runHarness: vi.fn(async () => report) })
    await generaEBase(deps)

    fireEvent.click(screen.getByRole("button", { name: /collauda l'handshake/i }))

    await waitFor(() => {
      expect(screen.getAllByTestId(/^harness-check-/)).toHaveLength(4)
    })
    const failed = screen.getByTestId("harness-check-nonce-echoed")
    expect(failed.getAttribute("data-pass")).toBe("0")
    expect(screen.getByText(/nonce diverso da quello inviato/)).toBeTruthy()
    expect(
      (screen.getByRole("button", { name: /esporta \.maestrotool/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it("harness ok e lint pulito: export abilitato e il download usa <id>.maestrotool", async () => {
    const origCreate = URL.createObjectURL
    const origRevoke = URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => "blob:officina-test")
    URL.revokeObjectURL = vi.fn()
    const clicked: Array<{ download: string; href: string }> = []
    const origClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      clicked.push({ download: this.download, href: this.href })
    }

    try {
      const deps = makeDeps()
      await generaEBase(deps)
      fireEvent.click(screen.getByRole("button", { name: /collauda l'handshake/i }))

      const esporta = screen.getByRole("button", { name: /esporta \.maestrotool/i })
      await waitFor(() => expect((esporta as HTMLButtonElement).disabled).toBe(false))
      fireEvent.click(esporta)

      await waitFor(() => expect(clicked).toHaveLength(1))
      expect(clicked[0].download).toBe("it.scuola.demo.maestrotool")
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    } finally {
      URL.createObjectURL = origCreate
      URL.revokeObjectURL = origRevoke
      HTMLAnchorElement.prototype.click = origClick
    }
  })

  it("lint con ERROR (script esterno): export disabilitato anche con harness ok", async () => {
    const deps = makeDeps({
      scaffold: vi.fn(async () =>
        makeOutput({
          entryHtml:
            '<!DOCTYPE html><html><body><script src="https://cdn.example/x.js"></script></body></html>',
        }),
      ),
    })
    await generaEBase(deps)
    fireEvent.click(screen.getByRole("button", { name: /collauda l'handshake/i }))

    await waitFor(() => {
      expect(screen.getByTestId("harness-check-nonce-echoed").getAttribute("data-pass")).toBe("1")
    })
    expect(
      screen.getByTestId("lint-flag-entry-external-script").getAttribute("data-severity"),
    ).toBe("error")
    expect(
      (screen.getByRole("button", { name: /esporta \.maestrotool/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })
})
