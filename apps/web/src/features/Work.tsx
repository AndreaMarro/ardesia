import { useState } from "react";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
import type { StudyMe, Workspace } from "../api";
import { Diary } from "./Diary";
import { SourceViewer } from "../components/SourceViewer";
import { AssetPreview } from "../components/AssetPreview";
import { EmptyState } from "../components/Feedback";
export function Work({
  me,
  data,
  onRetry,
}: {
  me: StudyMe;
  data: Workspace;
  onRetry: (id: string) => void;
}) {
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
        <Diary me={me} editionId={data.edition.id} />
      ) : tab === "notebook" ? (
        <>
          <header className="page-heading">
            <h1>Il quaderno, con te.</h1>
            <p>
              Esporta fonti, versioni, tentativi e feedback. Riapri il file in
              lettura, con gli hash degli originali.
            </p>
          </header>
          <div className="work-notebook">
            <NotebookPanel editionId={data.edition.id} />
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
  onRetry,
}: {
  submission: Workspace["submissions"][number];
  onRetry: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="delivery-row">
      <div className="section-title">
        <h3>
          Tentativo {submission.revision} ·{" "}
          {submission.activity_id === "poiseuille-v1"
            ? "Laboratorio Fluidi"
            : "Nuova prova"}
        </h3>
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
      {submission.activity_id === "poiseuille-v1" && (
        <button onClick={() => onRetry(submission.id)}>
          Prepara un nuovo tentativo
        </button>
      )}
    </article>
  );
}
