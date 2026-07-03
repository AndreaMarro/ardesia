// MAESTRO-Studio — SavedLessonsPanel: prima superficie UI sul client LessonOS
// (apiClient.ts). Slice deliberatamente minima e read-only: lista le lezioni
// salvate e, alla selezione, mostra le domande del quiz. Niente grading qui
// (il client lo copre già: slice successiva). Il client arriva per prop — il
// componente non sa nulla di baseUrl/token: quella configurazione è del
// chiamante (e il token in produzione resta GATE, vedi AUTH_STRICT).
// Linguaggio docente: "lezioni salvate", mai vocabolario API.

import { useEffect, useState } from "react"
import {
  LessonOsApiError,
  type LessonOsApiClient,
  type QuizQuestion,
  type SavedLessonSummary,
} from "./lessonos/apiClient"
import EmptyState from "./design/EmptyState"

interface SavedLessonsPanelProps {
  client: LessonOsApiClient
}

/** Messaggio docente per i guasti HTTP: mai status code nudi in UI. */
function describeError(err: unknown): string {
  if (err instanceof LessonOsApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Accesso non autorizzato: l'app non è ancora collegata al tuo account."
    }
    return err.detail ?? "Il servizio delle lezioni salvate ha risposto con un errore."
  }
  return "Impossibile raggiungere il servizio delle lezioni salvate."
}

export default function SavedLessonsPanel({ client }: SavedLessonsPanelProps) {
  const [lessons, setLessons] = useState<SavedLessonSummary[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [selected, setSelected] = useState<SavedLessonSummary | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    client
      .listSavedLessons()
      .then((response) => {
        if (!cancelled) setLessons(response.saved_lessons)
      })
      .catch((err: unknown) => {
        if (!cancelled) setListError(describeError(err))
      })
    return () => {
      cancelled = true
    }
  }, [client])

  const openQuiz = (lesson: SavedLessonSummary) => {
    setSelected(lesson)
    setQuiz(null)
    setQuizError(null)
    setQuizLoading(true)
    client
      .getQuiz(lesson.saved_id)
      .then((response) => {
        setQuiz(response.questions)
      })
      .catch((err: unknown) => {
        setQuizError(describeError(err))
      })
      .finally(() => {
        setQuizLoading(false)
      })
  }

  if (listError) {
    return (
      <EmptyState
        tone="error"
        title="Lezioni salvate non disponibili"
        detail={listError}
        hint="Riprova tra poco; i tuoi appunti sulla lavagna non sono toccati."
      />
    )
  }

  if (lessons === null) {
    return <p className="st-state-detail">Carico le lezioni salvate…</p>
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        title="Nessuna lezione salvata"
        detail="Quando salvi una lezione, qui trovi il suo quiz e le sue flashcard."
      />
    )
  }

  return (
    <div className="saved-lessons">
      <ul className="saved-lessons-list">
        {lessons.map((lesson) => (
          <li key={lesson.saved_id}>
            <button type="button" onClick={() => openQuiz(lesson)}>
              {lesson.title ?? lesson.lesson_id}
            </button>
            <span className="saved-lessons-meta">
              {typeof lesson.n_quiz === "number" ? `${lesson.n_quiz} domande` : ""}
            </span>
          </li>
        ))}
      </ul>
      {selected && (
        <section aria-label={`Quiz — ${selected.title ?? selected.lesson_id}`}>
          <h2>{selected.title ?? selected.lesson_id}</h2>
          {quizLoading && <p className="st-state-detail">Carico il quiz…</p>}
          {quizError && (
            <EmptyState tone="error" compact title="Quiz non disponibile" detail={quizError} />
          )}
          {quiz && quiz.length === 0 && (
            <EmptyState compact title="Quiz vuoto" detail="Questa lezione salvata non ha domande." />
          )}
          {quiz && quiz.length > 0 && (
            <ol className="saved-lessons-quiz">
              {quiz.map((question) => (
                <li key={question.atom_id}>
                  <p>{question.question}</p>
                  {question.options && question.options.length > 0 && (
                    <ul>
                      {question.options.map((option, i) => (
                        <li key={`${question.atom_id}-${i}`}>{option}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}
