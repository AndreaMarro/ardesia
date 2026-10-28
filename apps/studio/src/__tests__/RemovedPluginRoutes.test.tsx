// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../App"

vi.mock("../Room", () => ({ default: () => <div data-testid="independent-room">Lavagna</div> }))

afterEach(() => {
  cleanup()
  window.history.replaceState({}, "", "/")
})

describe("removed simulator routes", () => {
  it.each(["elab-lab", "simulatore", "simulatore-postit"])("%s opens the ordinary board without a removed plugin", async (route) => {
    window.history.replaceState({}, "", `/?vista=${route}`)
    render(<App />)
    expect(await screen.findByTestId("independent-room")).toBeTruthy()
    expect(document.querySelector("[data-elab-lab-state], [data-elab-canvas]")).toBeNull()
  })
})
