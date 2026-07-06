// @vitest-environment jsdom
// Route "lezioni salvate" (?vista=lezioni-salvate) — P0: SavedLessonsPanel
// montato in una vista di prodotto, così il producer quiz.attempted (#69)
// diventa raggiungibile dal browser reale. Configurazione fail-closed:
// baseUrl da localStorage (override) o VITE_LESSONOS_BASE_URL; il token SOLO
// da localStorage — MAI dall'URL (un token nella query string finisce in
// cronologia/log: vietato). Senza baseUrl la vista spiega cosa manca, zero
// fetch al buio.

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  isSavedLessonsView,
  LESSONOS_BASE_URL_STORAGE_KEY,
  LESSONOS_TOKEN_STORAGE_KEY,
  readSavedLessonsConfig,
} from "../store/savedLessonsView"
import SavedLessonsView from "../design/SavedLessonsView"

beforeEach(() => {
  window.history.replaceState(null, "", "/?vista=lezioni-salvate")
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState(null, "", "/")
})

describe("isSavedLessonsView", () => {
  it("vera solo per ?vista=lezioni-salvate", () => {
    expect(isSavedLessonsView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=elab-lab")
    expect(isSavedLessonsView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isSavedLessonsView()).toBe(false)
  })
})

describe("readSavedLessonsConfig", () => {
  it("senza baseUrl configurata: null (fail-closed, nessun default inventato)", () => {
    expect(readSavedLessonsConfig()).toBeNull()
  })

  it("baseUrl e token da localStorage; room dal parametro URL (non sensibile)", () => {
    window.localStorage.setItem(LESSONOS_BASE_URL_STORAGE_KEY, "https://lessonos.example")
    window.localStorage.setItem(LESSONOS_TOKEN_STORAGE_KEY, "tok-locale")
    window.history.replaceState(null, "", "/?vista=lezioni-salvate&room=4B")
    expect(readSavedLessonsConfig()).toEqual({
      baseUrl: "https://lessonos.example",
      token: "tok-locale",
      room: "4B",
    })
  })

  it("il token NON viene MAI letto dall'URL", () => {
    window.localStorage.setItem(LESSONOS_BASE_URL_STORAGE_KEY, "https://lessonos.example")
    window.history.replaceState(
      null,
      "",
      "/?vista=lezioni-salvate&token=trappola&lessonosToken=trappola",
    )
    const config = readSavedLessonsConfig()
    expect(config).not.toBeNull()
    expect(config?.token).toBeUndefined()
  })
})

describe("SavedLessonsView", () => {
  it("senza configurazione: messaggio fail-closed, NESSUNA fetch", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    render(<SavedLessonsView />)
    expect(await screen.findByText(/LessonOS non configurato/i)).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("con configurazione: monta il pannello e lista le lezioni dal backend", async () => {
    window.localStorage.setItem(LESSONOS_BASE_URL_STORAGE_KEY, "https://lessonos.example")
    window.localStorage.setItem(LESSONOS_TOKEN_STORAGE_KEY, "tok-locale")
    const fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === "https://lessonos.example/v1/saved-lessons") {
        // Il Bearer deve arrivare dal localStorage (percorso token verificato).
        const headers = new Headers(init?.headers)
        expect(headers.get("Authorization")).toBe("Bearer tok-locale")
        return new Response(
          JSON.stringify({
            saved_lessons: [
              { saved_id: "s1", lesson_id: "l1", title: "Il primo LED", n_quiz: 2 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }
      throw new Error(`fetch inatteso: ${url}`)
    })
    vi.stubGlobal("fetch", fetchSpy)
    render(<SavedLessonsView />)
    expect(await screen.findByRole("button", { name: "Il primo LED" })).toBeTruthy()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
