import { useEffect, useRef, useState } from "react";
import { studyRequest } from "./apiClient";
import {
  notebookSourceKey,
  readNotebookPreview,
  type NotebookInspection,
  type NotebookPreview,
} from "./notebookPreview";
const ENCODED_LIMIT = 96 * 1024 * 1024;
export function NotebookPanel({
  editionId = "fluidi",
}: { editionId?: string } = {}) {
  const [message, setMessage] = useState(""),
    [preview, setPreview] = useState<NotebookPreview | null>(null),
    [inspection, setInspection] = useState<NotebookInspection | null>(null),
    [busy, setBusy] = useState(false);
  const pending = useRef(false),
    generation = useRef(0),
    mounted = useRef(true),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      controller.current?.abort();
    };
  }, []);
  async function download() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    try {
      const bundle = await studyRequest<Record<string, unknown>>(
        "/notebook?editionId=" + encodeURIComponent(editionId),
      );
      if (!mounted.current) return;
      const encoded = JSON.stringify(bundle);
      if (new TextEncoder().encode(encoded).byteLength > ENCODED_LIMIT)
        throw Error("notebook_budget_exceeded");
      const url = URL.createObjectURL(
        new Blob([encoded], {
          type: "application/json",
        }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ardesia-${editionId.replace(/[^a-zA-Z0-9_-]/g, "-") || "corso"}.study.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        "Quaderno esportato con hash degli originali e omissioni dichiarate.",
      );
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error && error.message === "notebook_budget_exceeded"
            ? "Il quaderno supera il limite di 96 MiB. Nessun file parziale è stato creato."
            : "Export non completato.",
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function reopen(file: File | undefined) {
    if (!file || pending.current) return;
    pending.current = true;
    setBusy(true);
    setPreview(null);
    setInspection(null);
    setMessage("Lettura del file…");
    const current = ++generation.current;
    controller.current = new AbortController();
    try {
      // Same encoded request budget as /notebook/inspect; decoded originals have their own Core budget.
      if (file.size > ENCODED_LIMIT) throw Error("notebook_budget_exceeded");
      const bundle: unknown = JSON.parse(await file.text());
      const presentation = readNotebookPreview(bundle);
      const checked = await studyRequest<NotebookInspection>(
        "/notebook/inspect",
        bundle,
        { signal: controller.current.signal },
      );
      if (!mounted.current || current !== generation.current) return;
      if (checked.valid !== true) throw Error("invalid_notebook");
      setPreview(presentation);
      setInspection(checked);
      setMessage(
        `Quaderno riaperto in lettura: ${presentation.sources.length} versioni incluse, ${presentation.submissions.length} tentativi. Contenuto locale, senza ripristino di iscrizioni o sessioni.`,
      );
    } catch (error) {
      if (mounted.current && current === generation.current) {
        setMessage(
          error instanceof Error && error.message === "notebook_budget_exceeded"
            ? "Il file supera il limite di 96 MiB per la riapertura."
            : "Quaderno non supportato, struttura non leggibile o integrità interna non verificata.",
        );
        setPreview(null);
        setInspection(null);
      }
    } finally {
      pending.current = false;
      if (mounted.current && current === generation.current) setBusy(false);
    }
  }
  function downloadAsset(asset: NotebookPreview["assets"][number]) {
    const bytes = Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/octet-stream" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `originale-${asset.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="study-notebook">
      <h2>Quaderno portabile</h2>
      <p>
        Export .study.json in lettura: fonti accessibili, revisioni
        referenziate, tentativi, review e originali supportati. Include le
        omissioni, senza ricostruire tutta la storia della lavagna.
      </p>
      <button disabled={busy} onClick={() => void download()}>
        Esporta quaderno
      </button>
      <label>
        Riapri quaderno .study.json
        <input
          type="file"
          accept=".json"
          disabled={busy}
          onChange={(e) => void reopen(e.target.files?.[0])}
        />
      </label>
      <p role="status">{message}</p>
      {preview && inspection && (
        <div aria-label="Quaderno riaperto in lettura">
          <h3>Quaderno riaperto</h3>
          <div className="notebook-scope">
            <p>
              Autenticità canonica non verificata. L’ispezione controlla
              l’integrità interna del file; il contenuto locale non attribuisce
              accessi al corso.
            </p>
            <p>
              {inspection.referenceIntegrity === "CHECKED_INTERNALLY"
                ? "Riferimenti risorsa/revisione controllati all’interno del file."
                : inspection.referenceIntegrity ===
                    "CHECKED_WITH_DECLARED_LOSSES"
                  ? "Riferimenti controllati con versioni non disponibili dichiarate."
                  : "Formato precedente: i riferimenti storici non sono verificati da questa ispezione."}
            </p>
          </div>
          <p>
            {preview.layoutViews} viste del tavolo indicate nel file. Questa
            anteprima legge le fonti e i tentativi; non ricostruisce il tavolo,
            il journal o una sessione di lavoro.
          </p>
          <details>
            <summary>Ambito dell’ispezione del file</summary>
            <p>
              Integrità: {inspection.integrityScope ?? "ambito non dichiarato"}.
              Autenticità canonica:{" "}
              {inspection.canonicalAuthenticity ?? "non attestata"}.
              Riferimenti:{" "}
              {inspection.referenceIntegrity ?? "ambito non dichiarato"} ·{" "}
              {inspection.referenceIntegrityScope ?? "ambito non dichiarato"}.
            </p>
          </details>
          <h3>Versioni delle fonti incluse</h3>
          {preview.sources.map(({ source: item, current }) => (
            <article
              className="study-postit"
              key={notebookSourceKey(item.id, item.revisionId)}
            >
              <h4>Fonte · {item.kind}</h4>
              <p>
                {current
                  ? "Snapshot corrente indicato nel file"
                  : "Revisione referenziata nel file"}
              </p>
              <p>{item.text}</p>
              <p>
                Origine indicata nel file: {item.ownerId} ·{" "}
                {item.visibility === "private" ? "Privata" : "Gruppo"}
              </p>
              <p>
                Risorsa: {item.id}
                <br />
                Revisione: {item.revisionId}
                <br />
                Contesto: {item.contextId}
              </p>
            </article>
          ))}
          <h3>Tentativi e collegamenti</h3>
          {preview.submissions.map((item) => (
            <article className="study-postit" key={item.id}>
              <h4>
                Tentativo {item.revision} · {item.student_id}
              </h4>
              <p>{item.text}</p>
              <p>Ricevuta indicata nel file: {item.receipt_id}</p>
              {item.parent_id && <p>Tentativo precedente: {item.parent_id}</p>}
              {item.source_refs.map((ref) => {
                const included = preview.sources.some(
                  ({ source }) =>
                    source.id === ref.resourceId &&
                    source.revisionId === ref.revisionId,
                );
                return (
                  <p key={notebookSourceKey(ref.resourceId, ref.revisionId)}>
                    Fonte collegata: {ref.resourceId} · revisione{" "}
                    {ref.revisionId} ·{" "}
                    {included
                      ? "versione esatta inclusa"
                      : "versione non inclusa, nessuna sostituzione con la corrente"}
                  </p>
                );
              })}
              {item.feedback.map(
                (f) =>
                  f.review && (
                    <div key={f.id}>
                      <h5>Review indicata nel file</h5>
                      <p>{f.review.text}</p>
                      {f.stale && <p>Derivato obsoleto: fonte modificata.</p>}
                    </div>
                  ),
              )}
            </article>
          ))}
          {preview.unavailableResourceRefs.length > 0 && (
            <>
              <h3>Revisioni dichiarate non disponibili</h3>
              <ul>
                {preview.unavailableResourceRefs.map((ref) => (
                  <li key={notebookSourceKey(ref.resourceId, ref.revisionId)}>
                    {ref.resourceId} · revisione {ref.revisionId}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3>Originali inclusi nel file</h3>
          {preview.assets.map((asset) => (
            <article key={asset.id}>
              <p>
                {asset.mime} · hash {asset.sha256}
              </p>
              {["image/png", "image/jpeg", "image/webp"].includes(
                asset.mime,
              ) && (
                <img
                  alt="Originale dal quaderno portabile"
                  style={{ maxWidth: "100%" }}
                  src={`data:${asset.mime};base64,${asset.base64}`}
                />
              )}
              <button onClick={() => downloadAsset(asset)}>
                Scarica originale {asset.id}
              </button>
            </article>
          ))}
          <h3>Omissioni dell’export</h3>
          <ul>
            {preview.omissions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
