// @vitest-environment jsdom
// Caratterizzazione del flake "ReferenceError: window is not defined" visto su
// `npm run verify` (1 run su 4 a macchina carica, ad8f0f9f): i test passano, il
// processo esce 1 perché un task React schedulato con setImmediate gira DOPO che
// il teardown jsdom di vitest ha cancellato `window` da globalThis.
//
// Qui il teardown è anticipato dentro il test (stessa operazione del teardown di
// vitest: `delete globalThis.window`) e si guarda cosa esplode nella finestra
// senza `window`. Senza il drenaggio il test è ROSSO con esattamente l'errore
// riportato; con il drenaggio è verde. Togliere la riga di drenaggio lo rifà
// rosso: la difesa è falsificabile.

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { flushReactDeferredWork } from "./reactWorkDrain"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

/**
 * Cancella `window` come fa il teardown dell'ambiente jsdom di vitest, concede
 * al loop una girata di timers + check, e restituisce gli errori non gestiti
 * scattati in quella finestra.
 */
async function uncaughtWithoutWindow(): Promise<string[]> {
  const seen: string[] = []
  const collect = (error: unknown) => {
    seen.push(String(error))
  }
  const savedListeners = process.listeners("uncaughtException")
  process.removeAllListeners("uncaughtException")
  process.on("uncaughtException", collect)
  const savedWindow = Reflect.get(globalThis, "window")
  Reflect.deleteProperty(globalThis, "window")
  try {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 25)
    })
  } finally {
    Reflect.set(globalThis, "window", savedWindow)
    process.off("uncaughtException", collect)
    for (const listener of savedListeners) {
      process.on("uncaughtException", listener)
    }
  }
  return seen
}

async function mountElabLab(): Promise<void> {
  const { container } = render(<ElabLab eventLog={new InMemoryEventLog()} />)
  await waitFor(() => {
    if (container.querySelector("[data-elab-lab-state=mounted]") === null) {
      throw new Error("vista non montata")
    }
  })
}

describe("lavoro React differito e teardown di jsdom", () => {
  it("dopo cleanup + drenaggio non resta lavoro React che esploda senza window", async () => {
    await mountElabLab()
    cleanup()
    await flushReactDeferredWork()

    const errors = await uncaughtWithoutWindow()

    expect(errors.filter((error) => error.includes("window is not defined"))).toEqual([])
  })

  it("il drenaggio è cablato nel gate: vitest.config.ts carica il setup globale", () => {
    const config = readFileSync(join(process.cwd(), "vitest.config.ts"), "utf8")
    expect(config).toContain("src/__tests__/vitest.setup.ts")
  })
})
