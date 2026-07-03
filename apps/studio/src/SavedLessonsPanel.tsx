// MAESTRO-Studio — SavedLessonsPanel: prima superficie UI sul client LessonOS
// (apiClient.ts). Lista le lezioni salvate; alla selezione mostra il quiz e —
// seconda slice — lo fa svolgere e correggere via `gradeQuiz` (la correzione è
// del backend: qui nessuna logica di punteggio, solo presentazione). Il client
// arriva per prop — il componente non sa nulla di baseUrl/token: quella
// configurazione è del chiamante (e il token in produzione resta GATE, vedi
// AUTH_STRICT). Linguaggio docente: "lezioni salvate", mai vocabolario API.

import { useEffect, useState } from "react"
import {
  LessonOsApiError,
  type LessonOsApiClient,
  type QuizGradeResponse,
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

/** Solo le domande con opzioni sono rispondibili: le altre non entrano nel conteggio. */
function answerableQuestions(quiz: QuizQuestion[]): QuizQuestion[] {
  return quiz.filter((q) => q.options && q.options.length > 0)
}

export default function SavedLessonsPanel({ client }: SavedLessonsPanelProps) {
  const [lessons, setLessons] = useState<SavedLessonSummary[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [selected, setSelected] = useState<SavedLessonSummary | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  // Svolgimento: risposte scelte (atom_id → indice) ed esito della correzione.
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [grade, setGrade] = useState<QuizGradeResponse | null>(null)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [grading, setGrading] = useState(false)

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

  const resetAttempt = () => {
    setAnswers({})
    setGrade(null)
    setGradeError(null)
  }

  const openQuiz = (lesson: SavedLessonSummary) => {
    setSelected(lesson)
    setQuiz(null)
    setQuizError(null)
    resetAttempt()
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

  const submitAnswers = () => {
    if (!selected) return
    setGrading(true)
    setGradeError(null)
    client
      .gradeQuiz(
        selected.saved_id,
        Object.entries(answers).map(([atom_id, selected_index]) => ({ atom_id, selected_index })),
      )
      .then((response) => {
        setGrade(response)
      })
      .catch((err: unknown) => {
        setGradeError(describeError(err))
      })
      .finally(() => {
        setGrading(false)
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

  const answerable = quiz ? answerableQuestions(quiz) : []
  const allAnswered = answerable.length > 0 && answerable.every((q) => q.atom_id in answers)
  const resultByAtom = new Map(grade?.results.map((r) => [r.atom_id, r]) ?? [])
  const correctCount = grade ? grade.results.filter((r) => r.correct).length : 0

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
            <>
              <ol className="saved-lessons-quiz">
                {quiz.map((question) => {
                  const result = resultByAtom.get(question.atom_id)
                  return (
                    <li key={question.atom_id}>
                      <p>{question.question}</p>
                      {question.options && question.options.length > 0 && (
                        <ul>
                          {question.options.map((option, i) => (
                            <li key={`${question.atom_id}-${i}`}>
                              <label>
                                <input
                                  type="radio"
                                  name={question.atom_id}
                                  checked={answers[question.atom_id] === i}
                                  disabled={grade !== null || grading}
                                  onChange={() =>
                                    setAnswers((prev) => ({ ...prev, [question.atom_id]: i }))
                                  }
                                />
                                {option}
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                      {result && (
                        <p className={result.correct ? "saved-lessons-ok" : "saved-lessons-ko"}>
                          {result.correct
                            ? "Risposta corretta"
                            : `Risposta sbagliata — quella giusta è «${
                                question.options?.[result.correct_index] ?? "non disponibile"
                              }»`}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ol>
              {gradeError && (
                <EmptyState tone="error" compact title="Correzione non riuscita" detail={gradeError} />
              )}
              {grade === null ? (
                <button type="button" disabled={!allAnswered || grading} onClick={submitAnswers}>
                  {grading ? "Correggo…" : "Correggi il quiz"}
                </button>
              ) : (
                <>
                  <p className="saved-lessons-score" role="status">
                    {correctCount} risposte corrette su {grade.results.length}
                  </p>
                  <button type="button" onClick={resetAttempt}>
                    Riprova il quiz
                  </button>
                </>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
