import { GroupEditionView } from "../../../studio/src/study/GroupEditionView";
import { AccessPanel } from "../../../studio/src/study/AccessPanel";
import { CoursePackDisclosure } from "../components/CoursePackDisclosure";
import { editionState, type Workspace, type StudyMe } from "../api";

export function Courses({
  data,
  me,
  onUpdate,
  onClassroom,
}: {
  data: Workspace;
  me: StudyMe;
  onUpdate: () => Promise<void>;
  onClassroom: () => void;
}) {
  return (
    <>
      <header className="page-heading">
        <h1>
          {me.role === "teacher" ? "I tuoi mini-corsi." : "I miei corsi."}
        </h1>
        <p>
          Un programma riutilizzabile. Un’edizione con le sue persone e le sue
          date.
        </p>
      </header>
      <section className="edition-row">
        <div className="subject-mark">F</div>
        <div>
          <p className="section-meta">Fisica · Semestre Filtro</p>
          <h2>Fluidi e ragionamento fisico</h2>
          <p>
            4 incontri · massimo {data.edition.capacity} persone ·{" "}
            {(data.edition.priceMinor / 100).toLocaleString("it-IT", {
              style: "currency",
              currency: "EUR",
            })}{" "}
            indicativi
          </p>
        </div>
        <div className="edition-row-action">
          <span>{editionState[data.edition.state] ?? data.edition.state}</span>
          <button className="button-primary" onClick={onClassroom}>
            Apri l’aula
          </button>
        </div>
      </section>
      <div className="course-detail-layout">
        <div className="plain-panel">
          <GroupEditionView
            edition={data.edition}
            teacher={me.role === "teacher"}
            enrolled={data.enrolled}
            onUpdate={onUpdate}
          />
        </div>
        <div className="plain-panel">
          <h2>Il percorso</h2>
          <p>
            Prevedi, manipola il modello, spiega il passaggio. Poi affronta un
            problema diverso.
          </p>
          <p>
            Originali, tentativi, feedback e diario rimangono collegati nel tuo
            spazio.
          </p>
          <p className="fine-print">
            Pagamento simulato. Nessuna vendita o approvazione scientifica
            attestata.
          </p>
        </div>
      </div>
      {me.role === "teacher" && (
        <details className="disclosure-panel">
          <summary>Persone e accessi dell’edizione</summary>
          <AccessPanel />
        </details>
      )}
      <CoursePackDisclosure summary="Programma e materiali in preparazione" />
      <section className="next-subject">
        <span>La prima estensione</span>
        <h2>Analisi 1</h2>
        <p>
          Taylor, limiti e cancellazioni. Nello stesso spazio di lavoro, con lo
          stesso diario.
        </p>
        <p className="fine-print">
          In preparazione. Non sono aperte iscrizioni a un secondo corso.
        </p>
      </section>
    </>
  );
}
