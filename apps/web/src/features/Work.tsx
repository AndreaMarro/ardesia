import { useState } from "react";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
import type { StudyMe, Workspace } from "../api";
import { baseActivity, courseScope } from "../course";
import { Diary } from "./Diary";
import { SourceViewer } from "../components/SourceViewer";
import { AssetPreview } from "../components/AssetPreview";
import { EmptyState } from "../components/Feedback";
import { ScientificNotebooks } from "../integrations/notebook/ScientificNotebooks";
import { renderPortableNotebook } from "../integrations/notebook/PortableNotebook";
type Props = {
  me: StudyMe;
  data: Workspace;
  onRetry: (id: string) => void;
  onUpdate?: () => Promise<void>;
};
export function Work(props: Props) {
  return <WorkScope key={courseScope(props.me, props.data.edition)} {...props} />;
}
function WorkScope({
  me,
  data,
  onRetry,
  onUpdate = async () => {},
}: Props) {
  const [tab, setTab] = useState("diary");
  return (
    <>
      {me.role === "student" && (
        <nav className="filter-tabs work-tabs" aria-label="Il mio lavoro">
          {[
            ["diary", "Diario degli errori"],
            ["deliveries", "Consegne e feedback"],
            ["notebook", "Quaderno"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
      {tab === "diary" ? (
        <Diary
          me={me}
          editionId={data.edition.id}
          activityId={baseActivity(data.edition)}
        />
      ) : tab === "notebook" ? (
        <>
          <header className="page-heading">
            <h1>Il quaderno, con te.</h1>
            <p>
              Esporta fonti, versioni, tentativi e feedback. Riapri il file in
              lettura, con gli hash degli originali.
            </p>
          </header>
          <ScientificNotebooks me={me} data={data} onUpdate={onUpdate} />
          <div className="work-notebook">
            <NotebookPanel editionId={data.edition.id} renderSource={renderPortableNotebook} />
          </div>
        </>
      ) : (
        <>
          <header className="page-heading">
            <h1>Le tue consegne.</h1>
            <p>
              Ogni tentativo resta visibile con il suo originale, la ricevuta e
              l’intervento del tutor.
            </p>
          </header>
          {data.submissions.length === 0 ? (
            <EmptyState title="Il primo tentativo nasce nell’aula.">
              Apri il laboratorio, spiega la tua idea e consegnala quando sei
              pronto.
            </EmptyState>
          ) : (
            <div className="work-deliveries">
              {[...data.submissions].reverse().map((submission) => (
                <Delivery
                  key={submission.id}
                  submission={submission}
                  baseActivityId={baseActivity(data.edition)}
                  onRetry={onRetry}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
function Delivery({
  submission,
  baseActivityId,
  onRetry,
}: {
  submission: Workspace["submissions"][number];
  baseActivityId: string | null;
  onRetry: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="delivery-row">
      <div className="section-title">
        <h2 className="delivery-title">
          Tentativo {submission.revision} ·{" "}
          {submission.activity_id === "poiseuille-v1"
            ? "Laboratorio Fluidi"
            : submission.activity_id === "taylor-exp-v1"
              ? "Taylor e resto"
              : "Nuova prova"}
        </h2>
        <span>
          {submission.feedback.some((f) => f.review)
            ? "Feedback disponibile"
            : "Ricevuto dal servizio"}
        </span>
      </div>
      <p className="original-text">{submission.text}</p>
      {submission.feedback.map(
        (f) =>
          f.review && (
            <div className="entry-explanation" key={f.id}>
              <h3>Il tutor ha scritto</h3>
              <p>{f.review.text}</p>
              {f.stale && (
                <p className="source-warning">
                  La fonte è stata aggiornata. Il feedback riguarda la versione
                  originaria.
                </p>
              )}
            </div>
          ),
      )}
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>Originali, versione e ricevuta</summary>
        {open && (
          <>
            {submission.source_refs.map((ref) => (
              <SourceViewer key={ref.revisionId} reference={ref} />
            ))}
            {submission.asset_refs.map((id, i) => (
              <AssetPreview key={id} id={id} index={i + 1} />
            ))}
            <p className="id-text">Ricevuta {submission.receipt_id}</p>
          </>
        )}
      </details>
      {baseActivityId !== null && submission.activity_id === baseActivityId && (
        <button onClick={() => onRetry(submission.id)}>
          Prepara un nuovo tentativo
        </button>
      )}
    </article>
  );
}
