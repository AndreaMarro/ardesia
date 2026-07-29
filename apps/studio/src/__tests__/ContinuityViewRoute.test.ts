// @vitest-environment jsdom
//
// Superficie di continuita': rotta e lettura dello scope dall'URL.
//
// Due funzioni pure, separate dalla vista per lo stesso motivo per cui lo sono
// `isTeacherDashboardView` e `isToolLabView`: sono testabili senza montare
// nulla.
//
// Il vincolo non ovvio e' il secondo: `Room.getRoomId()` GENERA una stanza
// nuova quando lo hash e' vuoto, e ne scrive l'id in `location.hash`. Una
// superficie di continuita' che riusasse quella funzione inventerebbe una
// lezione invece di leggerne una, e mostrerebbe "nessuna sessione" per una
// lezione che non e' mai esistita. Qui la lettura deve essere osservativa.

import { describe, it, expect, afterEach } from "vitest"
import { isContinuityView, continuityLessonIdFromLocation } from "../store/continuityView"

function at(url: string): void {
  window.history.replaceState(null, "", url)
}

afterEach(() => {
  at("/")
})

describe("isContinuityView", () => {
  it("vera solo per ?vista=continuita", () => {
    at("/?vista=continuita")
    expect(isContinuityView()).toBe(true)
  })

  it("falsa per il cruscotto docente, che e' un'altra vista", () => {
    at("/?vista=cruscotto")
    expect(isContinuityView()).toBe(false)
  })

  it("falsa senza parametro vista", () => {
    at("/")
    expect(isContinuityView()).toBe(false)
  })
})

describe("continuityLessonIdFromLocation", () => {
  it("legge l'id stanza dallo hash, che e' anche l'id lezione", () => {
    // bootstrap.ts:249 fa `lessonId = validateRoomId(options.room)`: per una
    // lezione live i due identificatori sono lo stesso valore.
    at("/?vista=continuita#wbstudio-abc123")
    expect(continuityLessonIdFromLocation()).toBe("wbstudio-abc123")
  })

  it("hash assente: null, e NON crea una stanza nuova", () => {
    at("/?vista=continuita")
    expect(continuityLessonIdFromLocation()).toBeNull()
    // La falsificazione che conta: se la lettura fosse quella di Room, qui lo
    // hash sarebbe stato riscritto con un id inventato.
    expect(window.location.hash).toBe("")
  })

  it("hash non valido come room id: null, non un errore", () => {
    at("/?vista=continuita#..")
    expect(continuityLessonIdFromLocation()).toBeNull()
  })
})
