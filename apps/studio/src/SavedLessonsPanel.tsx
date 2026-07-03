// MAESTRO-Studio — SavedLessonsPanel: prima superficie UI sul client LessonOS
// (apiClient.ts). Lista le lezioni salvate; alla selezione mostra il quiz — che
// si può svolgere e correggere via `gradeQuiz` (la correzione è del backend:
// qui nessuna logica di punteggio, solo presentazione) — e le flashcard
// (front sempre visibile, back a richiesta: è ripasso, non quiz). Il client
// arriva per prop — il componente non sa nulla di baseUrl/token: quella
// configurazione è del chiamante (e il token in produzione resta GATE, vedi
// AUTH_STRICT). Linguaggio docente: "lezioni salvate", mai vocabolario API.

import { useEffect, useRef, useState } from "react"
import {
  LessonOsApiError,
  type FlashcardCard,
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
  // Flashcard: front sempre visibile, back rivelato per-card.
  const [flashcards, setFlashcards] = useState<FlashcardCard[] | null>(null)
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  // Svolgimento: risposte scelte (atom_id → indice) ed esito della correzione.
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [grade, setGrade] = useState<QuizGradeResponse | null>(null)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [grading, setGrading] = useState(false)
  // Token di generazione: ogni openLesson lo incrementa. Le risposte async
  // (quiz/flashcard/grade) applicano lo stato SOLO se il token è ancora il loro
  // — così una risposta lenta della lezione A non sovrascrive la lezione B
  // aperta nel frattempo (la lista usa già un flag cancelled analogo).
  const requestToken = useRef(0)
  // Guardia di smontaggio: le callback async di openLesson/submitAnswers sono
  // gated dal solo requestToken, che NON cambia allo smontaggio del pannello —
  // senza questo flag un fetch in volo applicherebbe setState su un componente
  // smontato (warning React + micro-leak). La lista usa già `cancelled`; qui
  // serve un ref perché le callback vivono fuori dall'effetto.
  const mounted = useRef(true)
  useEffect(
    () => () => {
      mounted.current = false
    },
    [],
  )

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

  const openLesson = (lesson: SavedLessonSummary) => {
    const token = ++requestToken.current
    const fresh = () => mounted.current && requestToken.current === token
    setSelected(lesson)
    setQuiz(null)
    setQuizError(null)
    setFlashcards(null)
    setFlashcardsError(null)
    setRevealed({})
    resetAttempt()
    setQuizLoading(true)
    client
      .getQuiz(lesson.saved_id)
      .then((response) => {
        if (fresh()) setQuiz(response.questions)
      })
      .catch((err: unknown) => {
        if (fresh()) setQuizError(describeError(err))
      })
      .finally(() => {
        if (fresh()) setQuizLoading(false)
      })
    // Flashcard in parallelo: un guasto qui non tocca il quiz (e viceversa).
    client
      .getFlashcards(lesson.saved_id)
      .then((response) => {
        if (fresh()) setFlashcards(response.flashcards)
      })
      .catch((err: unknown) => {
        if (fresh()) setFlashcardsError(describeError(err))
      })
  }

  const submitAnswers = () => {
    if (!selected) return
    // Lega la correzione alla lezione corrente: se il docente cambia lezione
    // mentre grade è in volo, l'esito NON si applica alla lezione sbagliata.
    const token = requestToken.current
    const fresh = () => mounted.current && requestToken.current === token
    setGrading(true)
    setGradeError(null)
    client
      .gradeQuiz(
        selected.saved_id,
        Object.entries(answers).map(([atom_id, selected_index]) => ({ atom_id, selected_index })),
      )
      .then((response) => {
        if (fresh()) setGrade(response)
      })
      .catch((err: unknown) => {
        if (fresh()) setGradeError(describeError(err))
      })
      .finally(() => {
        if (fresh()) setGrading(false)
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
            <button type="button" onClick={() => openLesson(lesson)}>
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
                      <p id={`q-${question.atom_id}`}>{question.question}</p>
                      {question.options && question.options.length > 0 && (
                        // role=radiogroup + aria-labelledby: lo screen reader
                        // annuncia le opzioni COME risposte a questa domanda (WCAG 1.3.1).
                        <ul role="radiogroup" aria-labelledby={`q-${question.atom_id}`}>
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
                <>
                  <button
                    type="button"
                    disabled={!allAnswered || grading}
                    aria-describedby={!allAnswered ? "quiz-submit-hint" : undefined}
                    onClick={submitAnswers}
                  >
                    {grading ? "Correggo…" : "Correggi il quiz"}
                  </button>
                  {/* Spiega perché il bottone è disabilitato: mai un grigio muto. */}
                  {!allAnswered && (
                    <p id="quiz-submit-hint" className="st-state-detail">
                      Rispondi a tutte le domande per poter correggere.
                    </p>
                  )}
                </>
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
          {flashcardsError && (
            <EmptyState tone="error" compact title="Flashcard non disponibili" detail={flashcardsError} />
          )}
          {/* Distinguere "caricate ma vuote" da "non ancora caricate/guaste":
              lo stato vuoto è esplicito come per il quiz, mai un silenzio. */}
          {flashcards && flashcards.length === 0 && !flashcardsError && (
            <EmptyState
              compact
              title="Nessuna flashcard"
              detail="Questa lezione salvata non ha flashcard per il ripasso."
            />
          )}
          {flashcards && flashcards.length > 0 && (
            <div className="saved-lessons-flashcards">
              <h3>Flashcard</h3>
              <ul>
                {flashcards.map((card) => (
                  <li key={card.atom_id}>
                    <p>{card.front}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((prev) => ({ ...prev, [card.atom_id]: !prev[card.atom_id] }))
                      }
                    >
                      {revealed[card.atom_id] ? "Nascondi risposta" : "Mostra risposta"}
                    </button>
                    {revealed[card.atom_id] && <p className="saved-lessons-flashcard-back">{card.back}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
