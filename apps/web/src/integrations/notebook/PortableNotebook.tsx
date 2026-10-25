import { useEffect, useState } from "react";
import type { NotebookPreview, NotebookSource } from "../../../../studio/src/study/notebookPreview";
import { Loading, ErrorNotice } from "../../components/Feedback";
import { NotebookReading } from "./NotebookReading";
import { decodePortablePdf } from "./portablePdf";
import type { PdfInput } from "./PdfReader";

function PortableNotebook({ source, assets }: { source: NotebookSource; assets: NotebookPreview["assets"] }) {
  const [state, setState] = useState<{ original?: PdfInput; error?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const snapshot = source.notebook;
  useEffect(() => {
    const controller = new AbortController();
    setState({});
    const asset = assets.find(a => a.id === snapshot?.source.assetId);
    if (!asset || !snapshot) {
      setState({ error: "Il PDF di questa versione non è incluso nel file. Le annotazioni restano consultabili." });
    } else {
      void decodePortablePdf(asset, snapshot.source.sha256, controller.signal)
        .then(original => { if (!controller.signal.aborted) setState({ original }); })
        .catch(() => {
          if (!controller.signal.aborted) setState({ error: "Il PDF locale non supera la verifica di integrità. Le pagine non sono state aperte." });
        });
    }
    return () => controller.abort();
  }, [assets, snapshot, attempt]);
  if (!snapshot) return null;
  return <div className="portable-notebook">
    <p className="fine-print">Copia locale in sola lettura · pagine e annotazioni della versione inclusa.</p>
    {state.error && <ErrorNotice message={state.error} onRetry={() => setAttempt(n => n + 1)} />}
    {!state.original && !state.error && <Loading>Sto verificando il PDF incluso nel file…</Loading>}
    <NotebookReading state={snapshot.state} revisionId={source.revisionId} original={state.original}
      assetId={snapshot.source.assetId} pageCount={snapshot.source.pageCount} />
  </div>;
}

export const renderPortableNotebook = (source: NotebookSource, assets: NotebookPreview["assets"]) =>
  <PortableNotebook source={source} assets={assets} />;
