import { EditionManager } from "../components/EditionManager";
import { GroupEditionView } from "../../../studio/src/study/GroupEditionView";
import { AccessPanel } from "../../../studio/src/study/AccessPanel";
import { CoursePackDisclosure } from "../components/CoursePackDisclosure";
import { courseTitle, courseSubject } from "../course";
import {
  editionState,
  type Workspace,
  type StudyMe,
  type Edition,
} from "../api";

export function Courses({
  data,
  me,
  onUpdate,
  onClassroom,
  editions,
  onEdition,
  onManaged,
}: {
  data: Workspace | null;
  me: StudyMe;
  onUpdate: () => Promise<void>;
  onClassroom: () => void;
  editions?: Edition[];
  onEdition?: (id: string) => void;
  onManaged?: (id: string) => void;
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
      {me.role === "teacher" && <EditionManager editionId={data?.edition.id ?? null} defaultOpen={data?.edition.state === "draft"} onChanged={(id) => onManaged?.(id)} />}
      {(editions ?? (data ? [data.edition] : [])).map((edition) => (
        <article
          className="edition-row"
          key={edition.id}
          aria-label={courseTitle(edition)}
        >
          <div className="subject-mark">
            {courseSubject(edition).slice(0, 1)}
          </div>
          <div>
            <p className="section-meta">
              {courseSubject(edition)} ·{" "}
              {edition.duration ?? "Programma dell’edizione"}
            </p>
            <h2>{courseTitle(edition)}</h2>
            <p>
              {edition.sessions.length} incontri · massimo {edition.capacity}{" "}
              persone ·{" "}
              {(edition.priceMinor / 100).toLocaleString("it-IT", {
                style: "currency",
                currency: "EUR",
              })}{" "}
              indicativi
            </p>
          </div>
          <div className="edition-row-action">
            <span>{editionState[edition.state] ?? edition.state}</span>
            <button
              className="button-primary"
              onClick={() => {
                onEdition?.(edition.id);
                onClassroom();
              }}
            >
              Apri l’aula
            </button>
          </div>
        </article>
      ))}
      {data && <div className="course-detail-layout">
        <div className="plain-panel">
          <p className="section-meta">
            Edizione corrente · {courseTitle(data.edition)}
          </p>
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
      </div>}
      {data && me.role === "teacher" && (
        <details className="disclosure-panel">
          <summary>Persone e accessi dell’edizione</summary>
          <AccessPanel editionId={data.edition.id} />
        </details>
      )}
      {data && <CoursePackDisclosure
        editionId={data.edition.id}
        summary="Programma e materiali in preparazione"
      />}
    </>
  );
}
