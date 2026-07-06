// LessonOS API client — client tipizzato per la FastAPI GIÀ deployata
// (`ardesia-api-vercel`, LessonOS API 0.1.0). Tipi = trascrizione del contratto
// OpenAPI 3.1 servito da /openapi.json (letto firsthand 2026-07-06); questo file
// NON reinventa il backend, lo cabla. Copertura: read-path didattico + grading
// (health, lessons, saved-lessons, flashcards, quiz). Fuori scope qui: LTI,
// ingest, audio, package-generation (superfici server-to-server o gate-deploy).
//
// fetch iniettabile (test/ambienti custom), Bearer token opzionale (il backend
// vive in AUTH_STRICT: senza token risponde 401 {"detail": "..."}).

export interface CorpusInfo {
  name: string
  segments: number
}

export interface HealthResponse {
  status?: string
  version?: string
  corpus?: CorpusInfo | null
}

export interface LessonSummary {
  lesson_id: string
  path_id?: string | null
  title?: string | null
  teacher_id?: string | null
  segment_count?: number
  moment_count?: number
}

export interface LessonListResponse {
  lessons?: LessonSummary[]
  total?: number
}

export interface SavedLessonSummary {
  saved_id: string
  lesson_id: string
  title?: string | null
  n_quiz?: number
  n_flashcards?: number
}

export interface SavedLessonListResponse {
  saved_lessons: SavedLessonSummary[]
  total: number
}

export interface FlashcardCard {
  atom_id: string
  front: string
  back: string
  citations?: unknown[]
}

export interface FlashcardListResponse {
  saved_id: string
  lesson_id: string
  flashcards: FlashcardCard[]
  total: number
}

export interface QuizQuestion {
  atom_id: string
  question: string
  options?: string[]
  correct_index?: number
  citations?: unknown[]
}

export interface QuizListResponse {
  saved_id: string
  lesson_id: string
  questions: QuizQuestion[]
  total: number
}

export interface QuizAnswer {
  atom_id: string
  selected_index: number
}

export interface QuizGradeResult {
  atom_id: string
  question: string
  selected_index?: number | null
  correct_index: number
  correct: boolean
}

export interface QuizGradeResponse {
  saved_id: string
  lesson_id: string
  results: QuizGradeResult[]
  score?: number
  total?: number
}

export interface SavedLessonDetailResponse {
  saved_id: string
  lesson_id: string
  title?: string | null
  recap?: Record<string, unknown>
  quiz?: QuizQuestion[]
  flashcards?: FlashcardCard[]
}

/** Errore HTTP del backend: status + detail FastAPI quando presente. */
export class LessonOsApiError extends Error {
  // Campi espliciti (non parameter-properties): il tsconfig del progetto ha
  // `erasableSyntaxOnly: true`, che vieta le parameter-properties → `tsc -b`
  // fallirebbe con TS1294. Assegnazione nel corpo.
  readonly status: number
  readonly detail?: string
  constructor(status: number, detail?: string) {
    super(detail ? `LessonOS API ${status}: ${detail}` : `LessonOS API ${status}`)
    this.name = "LessonOsApiError"
    this.status = status
    this.detail = detail
  }
}

export interface LessonOsApiClientOptions {
  /** Es. il deployment Vercel; senza slash finale (tollerato e normalizzato). */
  baseUrl: string
  /** Bearer per gli endpoint /v1/* (AUTH_STRICT). /health non lo richiede. */
  token?: string
  /** Iniettabile nei test; default: fetch globale. */
  fetch?: typeof fetch
}

export class LessonOsApiClient {
  private readonly baseUrl: string
  private readonly token?: string
  private readonly fetchImpl: typeof fetch

  constructor(options: LessonOsApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "")
    this.token = options.token
    // Bind esplicito: un riferimento nudo a `fetch` invocato come
    // this.fetchImpl(...) perde il receiver window -> "Illegal invocation"
    // in Chromium (bug reale visto dall'e2e saved-lessons, non dai test
    // jsdom dove fetch e' sempre stubbato/iniettato).
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>("GET", "/health", { auth: false })
  }

  async listLessons(): Promise<LessonListResponse> {
    return this.request<LessonListResponse>("GET", "/v1/lessons")
  }

  async getLesson(lessonId: string): Promise<LessonSummary> {
    return this.request<LessonSummary>("GET", `/v1/lessons/${encodeURIComponent(lessonId)}`)
  }

  async listSavedLessons(): Promise<SavedLessonListResponse> {
    return this.request<SavedLessonListResponse>("GET", "/v1/saved-lessons")
  }

  async getSavedLesson(savedId: string): Promise<SavedLessonDetailResponse> {
    return this.request<SavedLessonDetailResponse>("GET", `/v1/saved-lessons/${encodeURIComponent(savedId)}`)
  }

  async getFlashcards(savedId: string): Promise<FlashcardListResponse> {
    return this.request<FlashcardListResponse>("GET", `/v1/saved-lessons/${encodeURIComponent(savedId)}/flashcards`)
  }

  async getQuiz(savedId: string): Promise<QuizListResponse> {
    return this.request<QuizListResponse>("GET", `/v1/saved-lessons/${encodeURIComponent(savedId)}/quiz`)
  }

  async gradeQuiz(savedId: string, answers: QuizAnswer[]): Promise<QuizGradeResponse> {
    return this.request<QuizGradeResponse>("POST", `/v1/saved-lessons/${encodeURIComponent(savedId)}/quiz/grade`, {
      body: { answers },
    })
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options: { auth?: boolean; body?: unknown } = {},
  ): Promise<T> {
    const headers = new Headers()
    if (options.auth !== false && this.token) {
      headers.set("authorization", `Bearer ${this.token}`)
    }
    const init: RequestInit = { method, headers }
    if (options.body !== undefined) {
      headers.set("content-type", "application/json")
      init.body = JSON.stringify(options.body)
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init)
    if (!response.ok) {
      let detail: string | undefined
      try {
        const parsed: unknown = await response.json()
        if (parsed && typeof parsed === "object" && typeof (parsed as { detail?: unknown }).detail === "string") {
          detail = (parsed as { detail: string }).detail
        }
      } catch {
        // corpo non-JSON (es. redirect HTML della deployment protection): solo status.
      }
      throw new LessonOsApiError(response.status, detail)
    }
    return (await response.json()) as T
  }
}
