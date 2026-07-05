// @vitest-environment jsdom
// MAESTRO-Studio — SavedLessonsPanel su client LessonOS con MOCK SERVER (fetch
// iniettato nel client, mai patchato il globale). Il punto della slice: la
// prima UI che consuma apiClient.ts — lista lezioni salvate, quiz alla
// selezione, guasti in linguaggio docente (mai status code nudi).

import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react"
import { LessonOsApiClient } from "../lessonos/apiClient"
import { InMemoryEventLog, type EventLogStore } from "../lessonos/eventlog"
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
  }, 15000)

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

describe("SavedLessonsPanel — flashcard (front visibile, back a richiesta)", () => {
  const FLASHCARDS_OK: Route = {
    status: 200,
    body: {
      saved_id: "sv-1",
      lesson_id: "elab-v1-cap6",
      flashcards: [
        { atom_id: "f1", front: "Cos'è l'anodo?", back: "Il terminale positivo del LED." },
      ],
      total: 1,
    },
  }
  const QUIZ_EMPTY_SV1: Route = {
    status: 200,
    body: { saved_id: "sv-1", lesson_id: "elab-v1-cap6", questions: [], total: 0 },
  }

  it("mostra il front; il back appare solo con «Mostra risposta» e si nasconde col toggle", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_EMPTY_SV1,
      "GET /v1/saved-lessons/sv-1/flashcards": FLASHCARDS_OK,
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    expect(await screen.findByText("Cos'è l'anodo?")).toBeDefined()
    expect(screen.queryByText("Il terminale positivo del LED.")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Mostra risposta" }))
    expect(screen.getByText("Il terminale positivo del LED.")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Nascondi risposta" }))
    expect(screen.queryByText("Il terminale positivo del LED.")).toBeNull()
  })

  it("guasto flashcard: errore locale, il quiz non ne risente", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "GET /v1/saved-lessons/sv-1/flashcards": { status: 500, body: { detail: "boom" } },
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    expect(await screen.findByText("Flashcard non disponibili")).toBeDefined()
    // Il quiz è vivo e svolgibile.
    expect(screen.getByText("Quale terminale del LED va verso il resistore?")).toBeDefined()
    expect(screen.getByRole("button", { name: "Correggi il quiz" })).toBeDefined()
  })

  it("lezione senza flashcard: nessuna sezione Flashcard (niente heading fantasma)", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "GET /v1/saved-lessons/sv-1/flashcards": {
        status: 200,
        body: { saved_id: "sv-1", lesson_id: "elab-v1-cap6", flashcards: [], total: 0 },
      },
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    expect(await screen.findByText("Quale terminale del LED va verso il resistore?")).toBeDefined()
    expect(screen.queryByText("Flashcard")).toBeNull()
  })
})

describe("SavedLessonsPanel — concorrenza, a11y e stati vuoti (fix review avversariale 09jul)", () => {
  // Mock server con GATE controllabile: una route 'deferred' resta pendente
  // finché non chiamo release(key) — così l'ordine di risoluzione è deterministico.
  function deferredClient(routes: Record<string, Route & { deferred?: boolean }>) {
    const gates: Record<string, () => void> = {}
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input))
      const key = `${init?.method ?? "GET"} ${url.pathname}`
      const route = routes[key]
      if (!route) return new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 })
      const make = () => new Response(JSON.stringify(route.body), { status: route.status })
      if (route.deferred) return await new Promise<Response>((resolve) => (gates[key] = () => resolve(make())))
      return make()
    }) as typeof fetch
    return {
      client: new LessonOsApiClient({ baseUrl: "https://api.test", token: "t", fetch: fetchImpl }),
      release: (key: string) => gates[key]?.(),
    }
  }

  const quizRoute = (savedId: string, lessonId: string, atom: string, q: string, deferred = false) => ({
    status: 200,
    deferred,
    body: {
      saved_id: savedId,
      lesson_id: lessonId,
      questions: [{ atom_id: atom, question: q, options: ["x", "y"], correct_index: 0 }],
      total: 1,
    },
  })
  const emptyFlash = (savedId: string, lessonId: string, deferred = false) => ({
    status: 200,
    deferred,
    body: { saved_id: savedId, lesson_id: lessonId, flashcards: [], total: 0 },
  })

  it("cambio lezione rapido: la risposta LENTA della lezione precedente NON sovrascrive la corrente", async () => {
    const { client, release } = deferredClient({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": quizRoute("sv-1", "elab-v1-cap6", "qA", "Domanda A", true),
      "GET /v1/saved-lessons/sv-1/flashcards": emptyFlash("sv-1", "elab-v1-cap6", true),
      "GET /v1/saved-lessons/sv-2/quiz": quizRoute("sv-2", "elab-v1-cap7", "qB", "Domanda B"),
      "GET /v1/saved-lessons/sv-2/flashcards": emptyFlash("sv-2", "elab-v1-cap7"),
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" })) // sv-1: quiz LENTO
    fireEvent.click(screen.getByRole("button", { name: "elab-v1-cap7" })) // sv-2: quiz istantaneo
    expect(await screen.findByText("Domanda B")).toBeDefined()
    // Ora la risposta lenta di sv-1 arriva: DEVE essere ignorata (token cambiato).
    release("GET /v1/saved-lessons/sv-1/quiz")
    release("GET /v1/saved-lessons/sv-1/flashcards")
    await waitFor(() => expect(screen.getByText("Domanda B")).toBeDefined())
    expect(screen.queryByText("Domanda A")).toBeNull()
  })

  it("cambio lezione durante la correzione: l'esito NON si applica alla lezione sbagliata", async () => {
    const { client, release } = deferredClient({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": quizRoute("sv-1", "elab-v1-cap6", "qA", "Domanda A"),
      "GET /v1/saved-lessons/sv-1/flashcards": emptyFlash("sv-1", "elab-v1-cap6"),
      "POST /v1/saved-lessons/sv-1/quiz/grade": {
        status: 200,
        deferred: true,
        body: {
          saved_id: "sv-1",
          lesson_id: "elab-v1-cap6",
          results: [{ atom_id: "qA", question: "Domanda A", selected_index: 0, correct_index: 0, correct: true }],
          score: 1,
          total: 1,
        },
      },
      "GET /v1/saved-lessons/sv-2/quiz": quizRoute("sv-2", "elab-v1-cap7", "qB", "Domanda B"),
      "GET /v1/saved-lessons/sv-2/flashcards": emptyFlash("sv-2", "elab-v1-cap7"),
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    fireEvent.click(await screen.findByLabelText("x")) // rispondi
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" })) // grade LENTO
    fireEvent.click(screen.getByRole("button", { name: "elab-v1-cap7" })) // cambio lezione
    expect(await screen.findByText("Domanda B")).toBeDefined()
    release("POST /v1/saved-lessons/sv-1/quiz/grade") // esito di sv-1 arriva tardi
    await waitFor(() => expect(screen.getByText("Domanda B")).toBeDefined())
    // Nessun punteggio applicato a sv-2 (che non è mai stato corretto).
    expect(screen.queryByText(/risposte corrette su/)).toBeNull()
  })

  it("a11y: le opzioni sono un radiogroup con nome accessibile = testo della domanda (WCAG 1.3.1)", async () => {
    const { client } = deferredClient({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": quizRoute("sv-1", "elab-v1-cap6", "qA", "Qual è l'anodo?"),
      "GET /v1/saved-lessons/sv-1/flashcards": emptyFlash("sv-1", "elab-v1-cap6"),
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    const group = await screen.findByRole("radiogroup", { name: "Qual è l'anodo?" })
    expect(group).toBeDefined()
  })

  it("hint: bottone Correggi disabilitato mostra il PERCHÉ; sparisce a risposte complete", async () => {
    const { client } = deferredClient({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": quizRoute("sv-1", "elab-v1-cap6", "qA", "Domanda A"),
      "GET /v1/saved-lessons/sv-1/flashcards": emptyFlash("sv-1", "elab-v1-cap6"),
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    expect(await screen.findByText("Rispondi a tutte le domande per poter correggere.")).toBeDefined()
    fireEvent.click(screen.getByLabelText("x"))
    expect(screen.queryByText("Rispondi a tutte le domande per poter correggere.")).toBeNull()
  })

  it("flashcard vuote: stato esplicito «Nessuna flashcard», non un silenzio", async () => {
    const { client } = deferredClient({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": quizRoute("sv-1", "elab-v1-cap6", "qA", "Domanda A"),
      "GET /v1/saved-lessons/sv-1/flashcards": emptyFlash("sv-1", "elab-v1-cap6"),
    })
    render(<SavedLessonsPanel client={client} />)
    fireEvent.click(await screen.findByRole("button", { name: "LED e polarità" }))
    expect(await screen.findByText("Nessuna flashcard")).toBeDefined()
  })
})

describe("SavedLessonsPanel — producer quiz.attempted (attemptLog)", () => {
  it("dopo la correzione appende quiz.attempted con l'esito del backend", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": GRADE_ONE_WRONG,
    })
    const log = new InMemoryEventLog()
    render(<SavedLessonsPanel client={client} attemptLog={log} room="aula-3b" studentId="stu-7" />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    await screen.findByText("1 risposte corrette su 2")

    await waitFor(async () => {
      expect(await log.readAll()).toHaveLength(1)
    })
    const [event] = await log.readAll()
    if (event.kind !== "quiz.attempted") throw new Error(`kind inatteso: ${event.kind}`)
    expect(event.quizId).toBe("sv-1")
    expect(event.correct).toBe(1)
    expect(event.total).toBe(2)
    expect(event.studentId).toBe("stu-7")
    expect(event.labels).toEqual({ it: "LED e polarità" })
    expect(event.evidence).toContain("quiz:sv-1")
    expect(event.evidence).toContain("lessonos-lesson:elab-v1-cap6")
    expect(event.evidence.some((ref) => ref.startsWith("lesson:aula-3b@"))).toBe(true)
  }, 15000)

  it("guasto della correzione: NESSUN evento (nessun fatto senza correzione)", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": { status: 500, body: { detail: "boom" } },
    })
    const log = new InMemoryEventLog()
    render(<SavedLessonsPanel client={client} attemptLog={log} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    await screen.findByText("Correzione non riuscita")
    expect(await log.readAll()).toHaveLength(0)
  }, 15000)

  it("registrazione fallita: punteggio mostrato + avviso visibile, mai silenzio", async () => {
    const { client } = clientWithRoutes({
      "GET /v1/saved-lessons": SAVED_LIST,
      "GET /v1/saved-lessons/sv-1/quiz": QUIZ_TWO,
      "POST /v1/saved-lessons/sv-1/quiz/grade": GRADE_ONE_WRONG,
    })
    const brokenLog: EventLogStore = {
      append: () => Promise.reject(new Error("storage giù")),
      readAll: () => Promise.resolve([]),
    }
    render(<SavedLessonsPanel client={client} attemptLog={brokenLog} />)
    await openAndAnswerBoth()
    fireEvent.click(screen.getByRole("button", { name: "Correggi il quiz" }))
    expect(await screen.findByText("1 risposte corrette su 2")).toBeDefined()
    expect(await screen.findByText("Tentativo non registrato")).toBeDefined()
  }, 15000)
})
