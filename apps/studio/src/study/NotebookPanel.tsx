import { useState } from "react";
import { studyRequest } from "./apiClient";
import type { Feedback, PostitReference, StudyResource } from "./contracts";
type Notebook = {
  resources: StudyResource[];
  submissions: {
    id: string;
    student_id: string;
    text: string;
    revision: number;
    parent_id: string | null;
    receipt_id: string;
    source_refs: PostitReference[];
    asset_refs: string[];
    feedback: Feedback[];
  }[];
  assets: { id: string; mime: string; base64: string; sha256: string }[];
  omissions: string[];
};
export function NotebookPanel({
  editionId = "fluidi",
}: { editionId?: string } = {}) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<Notebook | null>(null);
  async function download() {
    try {
      const bundle = await studyRequest<Record<string, unknown>>(
        "/notebook?editionId=" + encodeURIComponent(editionId),
      );
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(bundle, null, 2)], {
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
    } catch {
      setMessage("Export non completato.");
    }
  }
  async function reopen(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 75 * 1024 * 1024) throw new Error("file too large");
      const bundle = JSON.parse(await file.text()) as Notebook;
      const checked = await studyRequest<{
        resources: number;
        submissions: number;
      }>("/notebook/inspect", bundle);
      setPreview(bundle);
      setMessage(
        `Quaderno riaperto e verificato: ${checked.resources} fonti, ${checked.submissions} tentativi. Lettura portabile; nessuna iscrizione o sessione ripristinata.`,
      );
    } catch {
      setMessage("Quaderno non supportato o integrità non verificata.");
      setPreview(null);
    }
  }
  function downloadAsset(asset: Notebook["assets"][number]) {
    const data = Uint8Array.from(atob(asset.base64), (char) =>
      char.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/octet-stream" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `originale-${asset.id}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="study-notebook">
      <h2>Quaderno portabile</h2>
      <p>
        Export .study.json in lettura: fonti, tentativi, review e allegati
        supportati. Il journal della lavagna usa l’export .lesson esistente.
      </p>
      <button onClick={() => void download()}>Esporta quaderno</button>
      <label>
        Riapri quaderno .study.json
        <input
          type="file"
          accept=".json"
          onChange={(event) => void reopen(event.target.files?.[0])}
        />
      </label>
      <p role="status">{message}</p>
      {preview && (
        <div aria-label="Quaderno riaperto in lettura">
          <h3>Quaderno riaperto</h3>
          {preview.resources.map((item) => (
            <article className="study-postit" key={item.id}>
              <h4>Fonte · {item.kind}</h4>
              <p>{item.text}</p>
              <p>
                Origine: {item.ownerId} ·{" "}
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
          {preview.submissions.map((item) => (
            <article className="study-postit" key={item.id}>
              <h4>
                Tentativo {item.revision} · {item.student_id}
              </h4>
              <p>{item.text}</p>
              <p>Ricevuta: {item.receipt_id}</p>
              {item.parent_id && <p>Tentativo precedente: {item.parent_id}</p>}
              {item.source_refs.map((ref) => (
                <p key={ref.resourceId}>
                  Fonte collegata: {ref.resourceId} · revisione {ref.revisionId}
                </p>
              ))}
              {item.feedback.map(
                (feedback) =>
                  feedback.review && (
                    <div key={feedback.id}>
                      <h5>Review del tutor sintetico</h5>
                      <p>{feedback.review.text}</p>
                      {feedback.stale && (
                        <p>Derivato obsoleto: fonte modificata.</p>
                      )}
                    </div>
                  ),
              )}
            </article>
          ))}
          <h4>Originali inclusi nel file</h4>
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
            {preview.omissions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
