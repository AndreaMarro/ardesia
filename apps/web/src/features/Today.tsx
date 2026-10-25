import { dateLabel, editionState, type StudyMe, type Workspace } from "../api";
import { courseTitle, courseSubject, isDateConfirmed } from "../course";
import type { View } from "../components/Shell";

export function Today({
  me,
  data,
  onView,
}: {
  me: StudyMe;
  data: Workspace;
  onView: (v: View) => void;
}) {
  const tutor = me.role === "teacher";
  const waiting = data.submissions.filter(
    (s) => !s.feedback.some((f) => f.review),
  );
  const feedback = data.submissions.filter((s) =>
    s.feedback.some((f) => f.review),
  );
  const first = data.edition.sessions.find(
    (s) => new Date(s.end).getTime() > Date.now(),
  );
  return (
    <>
      <header className="page-heading">
        <p className="date-line">
          {new Intl.DateTimeFormat("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: data.edition.timezone,
          }).format(new Date())}
        </p>
        <h1>
          {tutor
            ? "Diamo forma alla prossima lezione."
            : "Riprendiamo il filo."}
        </h1>
        <p>
          {tutor
            ? "Il gruppo, le consegne e il lavoro che conta. Tutto da qui."
            : "Il tuo corso, i passaggi da rivedere e una nuova idea da mettere alla prova."}
        </p>
      </header>
      <div className="today-layout">
        <section className="course-focus">
          <div className="course-cover" aria-hidden="true">
            <svg viewBox="0 0 600 200">
              <path d="M-30 150C80 150 115 25 240 25S385 180 630 45" />
              <path d="M-30 170C100 170 145 55 250 55S420 200 630 75" />
              <path d="M-30 190C110 190 155 85 270 85S450 220 630 105" />
              <circle cx="240" cy="25" r="5" />
              <circle cx="375" cy="105" r="5" />
            </svg>
            <span>
              {courseSubject(data.edition).toLocaleUpperCase("it-IT")}
            </span>
          </div>
          <div className="course-focus-body">
            <div className="section-meta">
              <span>{data.edition.duration ?? "Programma dell’edizione"}</span>
              <span>
                {editionState[data.edition.state] ?? data.edition.state}
              </span>
            </div>
            <h2>{courseTitle(data.edition)}</h2>
            <p>
              Prevedi, confronta con il modello e spiega il procedimento. Fonti,
              tentativi e correzioni restano collegati.
            </p>
            <div className="course-action-row">
              <span>
                {first ? (
                  <>
                    {isDateConfirmed(data.edition)
                      ? "Prossimo incontro"
                      : "Prima data proposta"}
                    <strong>
                      {dateLabel(first.start, data.edition.timezone)}
                    </strong>
                  </>
                ) : (
                  <>
                    {data.edition.sessions.length} incontri
                    <strong>
                      {isDateConfirmed(data.edition)
                        ? "Calendario dell’edizione"
                        : "Date da confermare"}
                    </strong>
                  </>
                )}
              </span>
              <button
                className="button-primary"
                onClick={() => onView("classroom")}
              >
                {tutor ? "Prepara l’aula" : "Apri il corso"}
                <Arrow />
              </button>
            </div>
          </div>
        </section>
        <aside className="agenda" aria-label="Calendario degli incontri">
          <div className="section-title">
            <h2>Tutte le date</h2>
            <span>{data.edition.sessions.length} incontri</span>
          </div>
          <ol>
            {data.edition.sessions.map((session, index) => (
              <li key={session.start}>
                <span className="session-index">0{index + 1}</span>
                <div>
                  <strong>Incontro {index + 1}</strong>
                  <span>{dateLabel(session.start, data.edition.timezone)}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="fine-print">
            {isDateConfirmed(data.edition)
              ? "Calendario dell’edizione di prova."
              : "Date proposte, da confermare con il tutor."}
          </p>
        </aside>
      </div>
      <section className="next-actions">
        <div className="section-title">
          <h2>{tutor ? "Da seguire" : "Da riprendere"}</h2>
          <span>La prossima azione utile</span>
        </div>
        <div className="action-list">
          <button onClick={() => onView(tutor ? "review" : "work")}>
            <span className="action-number">01</span>
            <span>
              <strong>
                {tutor
                  ? `${waiting.length} consegne da rivedere`
                  : "Il tuo lavoro, con le correzioni"}
              </strong>
              <small>
                {tutor
                  ? "Apri l’originale e restituisci un intervento preciso."
                  : `${data.submissions.length} tentativi · ${feedback.length} con feedback del tutor`}
              </small>
            </span>
            <Arrow />
          </button>
          <button onClick={() => onView("work")}>
            <span className="action-number">02</span>
            <span>
              <strong>Diario degli errori</strong>
              <small>Una fonte, un passaggio, una nuova prova.</small>
            </span>
            <Arrow />
          </button>
          <button onClick={() => onView("courses")}>
            <span className="action-number">03</span>
            <span>
              <strong>
                {tutor ? "Gestisci questa edizione" : "Il tuo gruppo"}
              </strong>
              <small>Programma, calendario e partecipazione.</small>
            </span>
            <Arrow />
          </button>
        </div>
      </section>
    </>
  );
}

export function Arrow() {
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
