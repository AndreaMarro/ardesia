// @vitest-environment jsdom
// MAESTRO-Studio — SavedLessonsPanel su client LessonOS con MOCK SERVER (fetch
// iniettato nel client, mai patchato il globale). Il punto della slice: la
// prima UI che consuma apiClient.ts — lista lezioni salvate, quiz alla
// selezione, guasti in linguaggio docente (mai status code nudi).

import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react"
import { LessonOsApiClient } from "../lessonos/apiClient"
import SavedLessonsPanel from "../SavedLessonsPanel"

afterEach(cleanup)

type Route = { status: number; body: unknown }

/** Mock server: mappa `METHOD path` → risposta JSON (stesso shape del backend FastAPI). */
function clientWithRoutes(routes: Record<string, Route>) {
  const calls: string[] = []
  const bodies: Record<string, unknown[]> = {}
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const key = `${init?.method ?? "GET"} ${url.pathname}`
    calls.push(key)
    if (typeof init?.body === "string") {
      ;(bodies[key] ??= []).push(JSON.parse(init.body))
    }
    const route = routes[key]
    if (!route) return new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 })
    return new Response(JSON.stringify(route.body), { status: route.status })
  }) as typeof fetch
  return {
    calls,
    bodies,
    client: new LessonOsApiClient({ baseUrl: "https://api.test", token: "t", fetch: fetchImpl }),
  }
}

const SAVED_LIST = {
  status: 200,
  body: {
    saved_lessons: [
      { saved_id: "sv-1", lesson_id: "elab-v1-cap6", title: "LED e polarità", n_quiz: 2 },
      { saved_id: "sv-2", lesson_id: "elab-v1-cap7", title: null, n_quiz: 0 },
    ],
    total: 2,
  },
}

/** Quiz a 2 domande per lo svolgimento+correzione (grading = solo backend). */
const QUIZ_TWO: Route = {
  status: 200,
  body: {
    saved_id: "sv-1",
    lesson_id: "elab-v1-cap6",
    questions: [
      {
        atom_id: "q1",
        question: "Quale terminale del LED va verso il resistore?",
        options: ["Anodo", "Catodo"],
        correct_index: 0,
      },
      {
        atom_id: "q2",
        question: "Il catodo si riconosce da…",
        options: ["Il terminale più lungo", "Il lato piatto"],
        correct_index: 1,
      },
    ],
    total: 2,
  },
}

const GRADE_ONE_WRONG: Route = {
  status: 200,
  body: {
    saved_id: "sv-1",
    lesson_id: "elab-v1-cap6",
    results: [
      {
        atom_id: "q1",
        question: "Quale terminale del LED va verso il resistore?",
        selected_index: 0,
        correct_index: 0,
        correct: true,
      },
      {
        atom_id: "q2",
        question: "Il catodo si riconosce da…",
        selected_index: 0,
        correct_index: 1,
        correct: false,
      },
    ],
    score: 1,
    total: 2,
  },
}

/** Apre il quiz sv-1 e risponde a entrambe le domande (q1=Anodo, q2=terminale lungo). */
async function openAndAnswerBoth() {
  fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
  fireEvent.click(await screen.findByLabelText("Anodo"))
  fireEvent.click(screen.getByLabelText("Il terminale più lungo"))
}

describe("SavedLessonsPanel — svolgimento e correzione (gradeQuiz)", () => {
  it("il bottone Correggi resta disabilitato finché non si risponde a TUTTE le domande", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    const submit = await screen.findByRole("button", { name: "Correggi il quiz" })
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByLabelText("Anodo"))
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByLabelText("Il lato piatto"))
    expect((submit as HTMLButtonElement).disabled).toBe(false)
  })

  it("correzione: POST con le risposte scelte, esiti per domanda e punteggio dal backend", async () => {
    const { client, bodies } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": GRADE_ONE_WRONG,
    })
    render(<SavedLessonsPanel client={client} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    expect(await screen.findByText("1 risposte corrette su 2")).toBeDefined()
    expect(screen.getByText("Risposta corretta")).toBeDefined()
    // La risposta giusta viene mostrata col TESTO dell'opzione, non con l'indice.
    expect(screen.getByText("Risposta sbagliata — quella giusta è «Il lato piatto»")).toBeDefined()
    expect(bodies["POST /v1/saved-lessons/sv-1/quiz/grade"]).toEqual([
      {
        answers: [
          { atom_id: "q1", selected_index: 0 },
          { atom_id: "q2", selected_index: 0 },
        ],
      },
    ])
    // Dopo la correzione le opzioni sono bloccate (l'esito si riferisce a QUELLE risposte).
    expect((screen.getByLabelText("Anodo") as HTMLInputElement).disabled).toBe(true)
  })

  it("guasto della correzione: errore locale, quiz e risposte restano", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": { status: 500, body: { detail: "boom" } },
    })
    render(<SavedLessonsPanel client={client} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    expect(await screen.findByText("Correzione non riuscita")).toBeDefined()
    // Niente esito: si può ricorreggere senza riaprire il quiz.
    expect((screen.getByLabelText("Anodo") as HTMLInputElement).checked).toBe(true)
    expect(screen.getByRole("button", { name: "Correggi il quiz" })).toBeDefined()
  })

  it("Riprova il quiz: azzera risposte ed esiti, le opzioni tornano attive", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": GRADE_ONE_WRONG,
    })
    render(<SavedLessonsPanel client={client} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    fireEvent.click(await screen.findByRole("button", { name: "Riprova il quiz" }))
    expect(screen.queryByText("1 risposte corrette su 2")).toBeNull()
    const anodo = screen.getByLabelText("Anodo") as HTMLInputElement
    expect(anodo.disabled).toBe(false)
    expect(anodo.checked).toBe(false)
    expect(
      (screen.getByRole("button", { name: "Correggi il quiz" }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it("cambiare lezione azzera lo svolgimento precedente", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": GRADE_ONE_WRONG,
      "GET /v1/saved-lessons/sv-2/quiz": {
        status: 200,
        body: { saved_id: "sv-2", lesson_id: "elab-v1-cap7", questions: [], total: 0 },
      },
    })
    render(<SavedLessonsPanel client={client} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    expect(await screen.findByText("1 risposte corrette su 2")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "elab-v1-cap7" }))
    expect(await screen.findByText("Quiz vuoto")).toBeDefined()
    expect(screen.queryByText("1 risposte corrette su 2")).toBeNull()
  })
})

describe("SavedLessonsPanel", () => {
  it("lista le lezioni salvate (titolo, o lesson_id se il titolo manca)", async () => {
    const { client } = clientWithRoutes({ "GET /v1/saved-lessons": SAVED_LIST })
    render(<SavedLessonsPanel client={client} />)
    expect(await screen.findByText("LED e polarità")).toBeDefined()
    expect(screen.getByText("elab-v1-cap7")).toBeDefined()
    expect(screen.getByText("2 domande")).toBeDefined()
  })

  it("alla selezione carica e mostra le domande del quiz (con opzioni)", async () => {
    const { client, calls } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": {
        status: 200,
        body: {
          saved_id: "sv-1",
          lesson_id: "elab-v1-cap6",
          questions: [
            {
              atom_id: "q1",
              question: "Quale terminale del LED va verso il resistore?",
              options: ["Anodo", "Catodo"],
              correct_index: 0,
            },
          ],
          total: 1,
        },
      },
    })
    render(<SavedLessonsPanel client={client} />)
    const button = await screen.findByRole("button", { name: "LED e polarità" })
    fireEvent.click(button)
    expect(await screen.findByText("Quale terminale del LED va verso il resistore?")).toBeDefined()
    expect(screen.getByText("Anodo")).toBeDefined()
    expect(screen.getByText("Catodo")).toBeDefined()
    expect(calls).toContain("GET /v1/saved-lessons/sv-1/quiz")
  })

  it("quiz vuoto: stato dedicato, non una lista vuota muta", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-2/quiz": {
        status: 200,
        body: { saved_id: "sv-2", lesson_id: "elab-v1-cap7", questions: [], total: 0 },
      },
    })
    render(<SavedLessonsPanel client={client} />)
    const button = await screen.findByRole("button", { name: "elab-v1-cap7" })
    fireEvent.click(button)
    expect(await screen.findByText("Quiz vuoto")).toBeDefined()
  })

  it("401 AUTH_STRICT sulla lista → messaggio docente, mai status code nudo", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": { status: 401, body: { detail: "Not authenticated" } },
    })
    render(<SavedLessonsPanel client={client} />)
    expect(await screen.findByText("Lezioni salvate non disponibili")).toBeDefined()
    expect(
      screen.getByText("Accesso non autorizzato: l'app non è ancora collegata al tuo account."),
    ).toBeDefined()
    expect(screen.queryByText(/401/)).toBeNull()
  })

  it("guasto sul quiz non butta via la lista (errore compatto nella sezione)", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": { status: 500, body: { detail: "boom" } },
    })
    render(<SavedLessonsPanel client={client} />)
    const button = await screen.findByRole("button", { name: "LED e polarità" })
    fireEvent.click(button)
    expect(await screen.findByText("Quiz non disponibile")).toBeDefined()
    // La lista resta montata: il guasto è locale alla sezione quiz.
    expect(screen.getByRole("button", { name: "LED e polarità" })).toBeDefined()
  })

  it("lista vuota → EmptyState con linguaggio docente", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": { status: 200, body: { saved_lessons: [], total: 0 } },
    })
    render(<SavedLessonsPanel client={client} />)
    expect(await screen.findByText("Nessuna lezione salvata")).toBeDefined()
  })

  it("rete giù (fetch reject) → errore generico, nessun crash", async () => {
    const fetchImpl = (async () => {
      throw new TypeError("Failed to fetch")
    }) as typeof fetch
    const client = new LessonOsApiClient({ baseUrl: "https://api.test", fetch: fetchImpl })
    render(<SavedLessonsPanel client={client} />)
    await waitFor(() =>
      expect(screen.getByText("Impossibile raggiungere il servizio delle lezioni salvate.")).toBeDefined(),
    )
  })
})
