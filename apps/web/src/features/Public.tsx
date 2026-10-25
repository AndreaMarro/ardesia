import { useEffect, useRef, useState } from "react";
import { dateLabel, describeError, requestKey, studyRequest } from "../api";
import { PhysicsLab } from "../components/PhysicsLab";
import { Arrow } from "./Today";
import { ErrorNotice, Loading } from "../components/Feedback";
import { publicCourse } from "../publicPreview";
type Course = {
  id: string;
  capacity: number;
  priceMinor: number | null;
  duration: string;
  sessions: readonly { start: string; end: string }[];
  timezone: string;
  title: string;
  scope: string;
};
export function Public({
  onLogin,
  publicPreview = false,
}: {
  onLogin?: () => void;
  publicPreview?: boolean;
}) {
  const [course, setCourse] = useState<Course | null>(publicPreview ? publicCourse : null),
    [loadError, setLoadError] = useState(""),
    [retry, setRetry] = useState(0);
  const [contact, setContact] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState("");
  const key = useRef(requestKey());
  useEffect(() => {
    let active = true;
    setLoadError("");
    if (publicPreview) {
      setCourse(publicCourse);
      return;
    }
    setCourse(null);
    void studyRequest<Course>("/course")
      .then((c) => {
        if (active) setCourse(c);
      })
      .catch(() => {
        if (active) setLoadError("La scheda del corso non è disponibile.");
      });
    return () => {
      active = false;
    };
  }, [retry, publicPreview]);
  async function interest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!contact.trim().toLowerCase().endsWith(".invalid")) {
      setError(
        "Questa anteprima accetta soltanto contatti sintetici con dominio .invalid. La raccolta di richieste reali non è ancora aperta.",
      );
      return;
    }
    setBusy(true);
    try {
      const r = await studyRequest<{ id: string }>(
        "/interests",
        {
          editionId: course?.id,
          contact,
          topic: "fluidi",
          slots: ["slot-a"],
          consent,
        },
        { headers: { "Idempotency-Key": key.current } },
      );
      setReceipt(r.id);
    } catch (ex) {
      setError(
        describeError(
          ex,
          "La richiesta non è stata registrata. I dati sono ancora qui: puoi riprovare.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="public-page">
      <a className="skip-link" href="#public-content">
        Vai al contenuto
      </a>
      <header className="public-nav">
        <a className="wordmark" href="/">
          <span className="brand-symbol" aria-hidden="true">
            a
          </span>
          ardesia<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Esplora Ardesia">
          <a href="#corso">Il mini-corso</a>
          <a href="#laboratorio">Il laboratorio</a>
          {publicPreview && <a href="#esame">Il simulatore</a>}
          {onLogin && !publicPreview && (
            <button className="button-quiet" onClick={onLogin}>
              Accedi al tuo spazio
              <Arrow />
            </button>
          )}
        </nav>
      </header>
      <main id="public-content" tabIndex={-1}>
        <section className="public-hero">
          <div className="hero-copy">
            <h1>
              La fisica.
              <br />
              Un’idea alla volta.
            </h1>
            <p>
              Prevedi, sperimenta, spiega. Un piccolo gruppo per capire i
              passaggi che fanno la differenza.
            </p>
            <a className="button-primary" href="#laboratorio">
              Prova il laboratorio
              <Arrow />
            </a>
            <div className="hero-footnote">
              <span className="small-rule" />
              Il primo percorso: proporzioni e fluidi.
              <br />
              Un pezzo di Fisica, fatto con cura.
            </div>
          </div>
          <ScientificArtwork />
        </section>
        <div className="preview-note">
          <span className="status-dot" />
          Anteprima Fisica · Semestre Filtro. Laboratorio esplorabile, contenuti in
          revisione. Nessuna vendita attiva.
        </div>
        <section className="public-course" id="corso">
          <div className="section-number">01 / Il primo mini-corso</div>
          <div className="public-course-heading">
            <h2>
              Fluidi e<br />
              ragionamento fisico.
            </h2>
            <div>
              <p>
                Non una raccolta di formule. Quattro incontri per riconoscere il
                modello, scegliere le grandezze e costruire una spiegazione.
              </p>
              <p className="fine-print">
                Fisica · Semestre Filtro. Questo modulo copre proporzioni, unità
                e fluidi; non l’intero programma del semestre.
              </p>
            </div>
          </div>
          <div className="public-programme">
            {[
              "Grandezze e proporzioni",
              "Pressione ed equilibrio",
              "Flussi e resistenze",
              "Un problema nuovo",
            ].map((title, i) => (
              <div className="programme-row" key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>
                  {
                    [
                      "Leggi le unità. Confronta gli ordini di grandezza.",
                      "Distingui pressione assoluta e differenze di pressione.",
                      "Riconosci il vincolo. Metti alla prova le potenze.",
                      "Trasferisci il ragionamento a una situazione diversa.",
                    ][i]
                  }
                </p>
              </div>
            ))}
          </div>
          {loadError ? (
            <ErrorNotice
              message={loadError}
              onRetry={() => setRetry((v) => v + 1)}
            />
          ) : course ? (
            <div className="course-conditions">
              <div>
                <span>Il formato proposto</span>
                <strong>{course.duration}</strong>
                <p>Massimo {course.capacity} persone per edizione</p>
              </div>
              <div>
                <span>
                  {publicPreview
                    ? "Condizioni del percorso"
                    : "Prezzo indicativo del mini-corso"}
                </span>
                <strong>
                  {publicPreview || course.priceMinor === null
                    ? "In definizione"
                    : (course.priceMinor / 100).toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                </strong>
                <p>
                  Programma, condizioni e date da confermare prima del pilot.
                </p>
              </div>
              {publicPreview ? (
                <div>
                  <span>Il calendario</span>
                  <strong>Date da confermare</strong>
                  <p>
                    Il primo gruppo è in preparazione. Le iscrizioni non sono
                    aperte.
                  </p>
                </div>
              ) : (
                <details>
                  <summary>Calendario della dimostrazione</summary>
                  {course.sessions.length ? (
                    course.sessions.map((s) => (
                      <p key={s.start}>{dateLabel(s.start, course.timezone)}</p>
                    ))
                  ) : (
                    <p>Date in definizione.</p>
                  )}
                  <p className="fine-print">
                    Date sintetiche di prova. Non costituiscono un’offerta di
                    iscrizione.
                  </p>
                </details>
              )}
            </div>
          ) : (
            <Loading>Sto aprendo il programma…</Loading>
          )}
        </section>
        <section className="public-lab-section" id="laboratorio">
          <div className="section-number">02 / Tocca il modello</div>
          <PhysicsLab publicPreview={publicPreview} />
        </section>
        <section className="public-method">
          <h2>
            La lezione continua
            <br />
            nel tuo lavoro.
          </h2>
          <div>
            <p>
              {publicPreview
                ? "Il percorso in sviluppo collega quaderno, consegne e feedback del tutor: ogni passaggio deve conservare il suo originale e la sua versione."
                : "Una nota rimane tua. Quando la consegni, il tutor ritrova proprio quella versione: il passaggio, l’originale e il contesto."}
            </p>
            <p>
              {publicPreview
                ? "Quaderno e diario appartengono allo spazio personale e non sono accessibili da questa anteprima. Qui puoi esplorare il modello fisico senza un account."
                : "Dal feedback nasce una nuova prova. Il diario conserva quello che è cambiato, anche quando passi a un altro corso."}
            </p>
            <a className="text-link" href="#richiesta">
              Conosci il primo gruppo
              <Arrow />
            </a>
          </div>
        </section>
        {publicPreview && (
          <section className="public-exam-status" id="esame" aria-labelledby="exam-status-title">
            <div>
              <h2 id="exam-status-title">Verso il test completo.</h2>
              <p>Il laboratorio è disponibile per esplorare un modello di fluidodinamica.</p>
            </div>
            <div>
              <h3>Simulazione d’esame non ancora disponibile</h3>
              <p>
                La banca di quesiti è in bozza e richiede una revisione scientifica
                e una pubblicazione deliberata. Non viene distribuita in questa anteprima.
              </p>
              <p>
                Qui non sono disponibili sessioni d’esame, punteggi, salvataggio
                delle risposte o accesso studente. Il modulo Fluidi copre una parte
                del programma, non l’intero test.
              </p>
            </div>
          </section>
        )}
        {publicPreview ? (
          <section className="interest-section" id="richiesta">
            <div>
              <div className="section-number">03 / Il prossimo passo</div>
              <h2>
                Il percorso
                <br />
                prende forma.
              </h2>
              <p>
                Stiamo preparando il primo gruppo: programma, calendario e
                condizioni saranno disponibili prima dell’apertura delle
                iscrizioni.
              </p>
            </div>
            <div className="preview-invitation">
              <h3>Intanto, comincia da una domanda.</h3>
              <p>
                Prova a tenere fissa la portata invece della pressione. Quale
                grandezza deve cambiare quando il tubo si allarga?
              </p>
              <a className="button-primary" href="#laboratorio">
                Torna al laboratorio <Arrow />
              </a>
              <p className="fine-print">
                Questa anteprima non raccoglie contatti. La previsione resta nel
                browser e non viene inviata al server.
              </p>
            </div>
          </section>
        ) : (
          <section className="interest-section" id="richiesta">
            <div>
              <div className="section-number">
                03 / Prepariamo il primo gruppo
              </div>
              <h2>
                Parti da una
                <br />
                buona domanda.
              </h2>
              <p>
                Stiamo preparando il percorso. Qui puoi provare come verrà
                registrata una richiesta di informazioni.
              </p>
              <p className="fine-print">
                La raccolta di interesse reale non è ancora aperta. Il modulo
                dimostrativo accetta solo indirizzi .invalid e salva una
                richiesta sintetica.
              </p>
            </div>
            <form onSubmit={(e) => void interest(e)}>
              <h3>Prova la richiesta di informazioni</h3>
              <label>
                Contatto sintetico
                <input
                  required
                  type="email"
                  autoComplete="off"
                  value={contact}
                  placeholder="studente@example.invalid"
                  onChange={(e) => {
                    setContact(e.target.value);
                    key.current = requestKey();
                    setReceipt("");
                  }}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    key.current = requestKey();
                    setReceipt("");
                  }}
                />
                Acconsento alla registrazione di questa richiesta sintetica.
              </label>
              <button
                className="button-primary"
                disabled={busy || !course || Boolean(receipt)}
              >
                {busy
                  ? "Registrazione…"
                  : receipt
                    ? "Richiesta sintetica registrata"
                    : "Invia richiesta di prova"}
                <Arrow />
              </button>
              {error && <ErrorNotice message={error} />}{" "}
              {receipt && (
                <p className="success-notice" role="status">
                  Richiesta registrata. Riferimento <code>{receipt}</code>. Non
                  è stata inviata una conferma via email.
                </p>
              )}
            </form>
          </section>
        )}
      </main>
      <footer className="public-footer">
        <a className="wordmark" href="/">
          ardesia.
        </a>
        <p>Piccoli gruppi. Idee chiare.</p>
        <span>
          Progetto indipendente · nessuna affiliazione con atenei, MUR o
          editori.
        </span>
      </footer>
    </div>
  );
}
function ScientificArtwork() {
  return (
    <figure
      className="scientific-art"
      aria-label="Illustrazione originale delle linee di flusso di un fluido"
    >
      <svg viewBox="0 0 520 510" aria-hidden="true">
        <defs>
          <pattern
            id="hero-grid"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M34 0H0V34"
              fill="none"
              stroke="#7c8980"
              strokeWidth=".45"
            />
          </pattern>
          <clipPath id="art-clip">
            <rect x="0" y="0" width="520" height="510" rx="4" />
          </clipPath>
        </defs>
        <g clipPath="url(#art-clip)">
          <rect width="520" height="510" fill="#e7e9df" />
          <rect width="520" height="510" fill="url(#hero-grid)" opacity=".6" />
          <circle
            cx="267"
            cy="252"
            r="174"
            fill="none"
            stroke="#b1baab"
            strokeWidth=".8"
          />
          <circle
            cx="267"
            cy="252"
            r="141"
            fill="none"
            stroke="#b1baab"
            strokeWidth=".8"
            strokeDasharray="2 6"
          />
          <path
            d="M-60 157H103C167 157 170 110 225 110H544M-60 350H103C167 350 170 399 225 399H544"
            fill="none"
            stroke="#344f49"
            strokeWidth="2"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M-40 ${190 + i * 32}H80C150 ${190 + i * 32} 178 ${160 + i * 46} 245 ${160 + i * 46}H550`}
              fill="none"
              stroke={i === 2 ? "#c36547" : "#607b6c"}
              strokeWidth={i === 2 ? 2 : 1.1}
            />
          ))}
          <path
            d="m340 245 13 9-13 9"
            fill="none"
            stroke="#c36547"
            strokeWidth="2"
          />
          <path
            d="M225 110V400M250 254H478"
            fill="none"
            stroke="#344f49"
            strokeWidth=".7"
            strokeDasharray="4 6"
          />
          <circle cx="225" cy="254" r="5" fill="#c36547" />
          <text
            x="244"
            y="88"
            fontFamily="Georgia,serif"
            fontSize="20"
            fill="#344f49"
          >
            Q ∝ r⁴
          </text>
          <text
            x="241"
            y="365"
            fontFamily="Georgia,serif"
            fontSize="18"
            fill="#344f49"
          >
            r
          </text>
          <text
            x="34"
            y="460"
            fontFamily="system-ui,sans-serif"
            fontSize="11"
            letterSpacing="2"
            fill="#344f49"
          >
            OSSERVA IL VINCOLO.
          </text>
          <text
            x="34"
            y="480"
            fontFamily="system-ui,sans-serif"
            fontSize="11"
            letterSpacing="2"
            fill="#344f49"
          >
            IL RESTO CAMBIA.
          </text>
        </g>
      </svg>
      <figcaption>
        Una relazione semplice. Una conseguenza sorprendente.
      </figcaption>
    </figure>
  );
}
