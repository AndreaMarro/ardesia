import { useEffect, useState } from "react";
import { PdfReader, type PdfInput, type PdfPageRequest } from "./PdfReader";
import { AnnotationLayer } from "./AnnotationLayer";
import { FormulaPreview } from "./FormulaPreview";
import type { NotebookState } from "./model";

export function DownloadOriginal({ original, assetId }: { original: PdfInput; assetId: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const value = URL.createObjectURL(original.blob);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [original]);
  return url ? <a href={url} download={`originale-${assetId.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}>Scarica il PDF originale</a> : null;
}

/** Shared read-only presentation: no session, Core lookup, draft, or commit path. */
export function NotebookReading({ state, revisionId, original, assetId, pageCount }: {
  state: NotebookState; revisionId: string; original?: PdfInput; assetId: string; pageCount: number;
}) {
  const [pageRequest, setPageRequest] = useState<(PdfPageRequest & { revisionId: string })>();
  useEffect(() => { setPageRequest(undefined); }, [original, revisionId, assetId]);
  return <section className="scientific-notebook notebook-reading" aria-label="Quaderno scientifico in lettura">
    <h3>{state.title}</h3>
    <p className="fine-print">Versione selezionata · {revisionId.slice(0, 8)}</p>
    {original && <PdfReader key={revisionId} original={original} expectedPages={pageCount}
      pageRequest={pageRequest?.revisionId === revisionId ? pageRequest : undefined}
      overlay={frame => <AnnotationLayer frame={frame} annotations={state.annotations} />} />}
    <ol className="notebook-reading-notes">{state.annotations.map((a, index) => <li key={a.id}>
      <strong>Pagina {a.page} · {a.kind === "formula" ? "Formula" : a.kind === "highlight" ? "Evidenziazione" : "Nota"}</strong>
      {a.kind === "formula" ? <FormulaPreview value={a.content} /> : <p>{a.content || "Passaggio evidenziato nel PDF."}</p>}
      {original && Number.isSafeInteger(a.page) && a.page >= 1 && a.page <= pageCount &&
        <button type="button" aria-label={`Apri pagina ${a.page}, annotazione ${index + 1}`}
          onClick={() => setPageRequest({ original, revisionId, page: a.page })}>Apri pagina {a.page}</button>}
    </li>)}</ol>
    {original && <DownloadOriginal original={original} assetId={assetId} />}
  </section>;
}
