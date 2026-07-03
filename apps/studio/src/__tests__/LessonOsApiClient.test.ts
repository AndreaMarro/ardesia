// LessonOS API client — contract test contro il contratto OpenAPI 3.1 servito
// dalla FastAPI GIÀ deployata (`ardesia-api-vercel`, LessonOS API 0.1.0,
// /openapi.json letto firsthand 2026-07-06). Fetch mockato: qui si verifica che
// il client costruisca le richieste giuste (path, header, body) e tipizzi le
// risposte reali — la rete vera resta fuori dai test (deploy/wiring = gate).

import { describe, it, expect, vi } from "vitest"
import { LessonOsApiClient, LessonOsApiError } from "../lessonos/apiClient"

/** Risposte campione conformi agli schemi OpenAPI (componenti verificati firsthand). */
const HEALTH = { status: "ok", version: "0.1.0", corpus: { name: "lessonos", segments: 4 } }
const LESSONS = {
  lessons: [{ lesson_id: "l1", path_id: null, title: "Il LED", teacher_id: null, segment_count: 3, moment_count: 2 }],
  total: 1,
}
const SAVED_LIST = {
  saved_lessons: [{ saved_id: "s1", lesson_id: "l1", title: "Il LED", n_quiz: 2, n_flashcards: 3 }],
  total: 1,
}
const QUIZ = {
  saved_id: "s1",
  lesson_id: "l1",
  questions: [
    { atom_id: "a1", question: "Dove va l'anodo?", options: ["f3", "e3"], correct_index: 0, citations: [] },
  ],
  total: 1,
}
const GRADE = {
  saved_id: "s1",
  lesson_id: "l1",
  results: [{ atom_id: "a1", question: "Dove va l'anodo?", selected_index: 0, correct_index: 0, correct: true }],
  score: 1,
  total: 1,
}
const FLASHCARDS = {
  saved_id: "s1",
  lesson_id: "l1",
  flashcards: [{ atom_id: "a2", front: "Anodo", back: "Gamba lunga del LED", citations: [] }],
  total: 1,
}

function fetchReturning(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }))
}

const BASE = "https://api.example.test"

describe("LessonOsApiClient — contract", () => {
  it("health: GET /health senza auth, risposta tipizzata (corpus può essere null)", async () => {
    const fetchMock = fetchReturning(HEALTH)
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock })
    const health = await client.health()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${BASE}/health`)
    expect(new Headers(init.headers).has("authorization")).toBe(false)
    expect(health.corpus?.segments).toBe(4)
  })

  it("bearer token: presente su /v1/*, formato 'Bearer <token>'", async () => {
    const fetchMock = fetchReturning(LESSONS)
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock, token: "tok-123" })
    await client.listLessons()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${BASE}/v1/lessons`)
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer tok-123")
  })

  it("baseUrl: lo slash finale non produce '//' nei path", async () => {
    const fetchMock = fetchReturning(LESSONS)
    const client = new LessonOsApiClient({ baseUrl: `${BASE}/`, fetch: fetchMock })
    await client.listLessons()
    const [url] = fetchMock.mock.calls[0] as unknown as [string]
    expect(url).toBe(`${BASE}/v1/lessons`)
  })

  it("saved-lessons: list/quiz/flashcards con saved_id nel path (URL-encoded)", async () => {
    const fetchMock = fetchReturning(SAVED_LIST)
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock })
    const saved = await client.listSavedLessons()
    expect(saved.saved_lessons[0].n_flashcards).toBe(3)

    const quizFetch = fetchReturning(QUIZ)
    const quiz = await new LessonOsApiClient({ baseUrl: BASE, fetch: quizFetch }).getQuiz("s 1")
    expect((quizFetch.mock.calls[0] as unknown as [string])[0]).toBe(`${BASE}/v1/saved-lessons/s%201/quiz`)
    expect(quiz.questions[0].correct_index).toBe(0)

    const cardsFetch = fetchReturning(FLASHCARDS)
    const cards = await new LessonOsApiClient({ baseUrl: BASE, fetch: cardsFetch }).getFlashcards("s1")
    expect((cardsFetch.mock.calls[0] as unknown as [string])[0]).toBe(`${BASE}/v1/saved-lessons/s1/flashcards`)
    expect(cards.flashcards[0].back).toMatch(/Gamba lunga/)
  })

  it("gradeQuiz: POST JSON {answers:[{atom_id,selected_index}]} conforme a QuizGradeRequest", async () => {
    const fetchMock = fetchReturning(GRADE)
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock, token: "tok" })
    const graded = await client.gradeQuiz("s1", [{ atom_id: "a1", selected_index: 0 }])
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${BASE}/v1/saved-lessons/s1/quiz/grade`)
    expect(init.method).toBe("POST")
    expect(new Headers(init.headers).get("content-type")).toBe("application/json")
    expect(JSON.parse(String(init.body))).toEqual({ answers: [{ atom_id: "a1", selected_index: 0 }] })
    expect(graded.score).toBe(1)
    expect(graded.results[0].correct).toBe(true)
  })

  it("errori HTTP: LessonOsApiError con status e detail del backend (401 AUTH_STRICT)", async () => {
    const fetchMock = fetchReturning({ detail: "Missing or malformed Bearer token" }, 401)
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock })
    const err = await client.listLessons().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(LessonOsApiError)
    expect((err as LessonOsApiError).status).toBe(401)
    expect((err as LessonOsApiError).detail).toBe("Missing or malformed Bearer token")
  })

  it("errori non-JSON: LessonOsApiError senza detail, mai eccezioni di parsing", async () => {
    const fetchMock = vi.fn(async () => new Response("Redirecting...", { status: 302 }))
    const client = new LessonOsApiClient({ baseUrl: BASE, fetch: fetchMock })
    const err = await client.health().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(LessonOsApiError)
    expect((err as LessonOsApiError).status).toBe(302)
    expect((err as LessonOsApiError).detail).toBeUndefined()
  })
})
