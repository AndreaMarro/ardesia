import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest, type PostitReference, type StudyMe, type Workspace } from "../../api";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { uploadOriginal } from "../../../../studio/src/study/uploadOriginal";
import { studyOriginal } from "../../../../studio/src/study/apiClient";
import { studySessionEpoch, studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { NotebookEditor } from "./NotebookEditor";
import { notebookResource, type NotebookResource } from "./model";

type Props = { me: StudyMe; data: Workspace; onUpdate: () => Promise<void>; onUse?: (reference: PostitReference) => void };
export function ScientificNotebooks(props: Props) {
  return <NotebookCollection key={JSON.stringify([studySessionEpoch(), props.me.id, props.data.edition.id])} {...props} />;
}
function NotebookCollection({ me, data, onUpdate, onUse }: Props) {
  const [opened, setOpened] = useState<NotebookResource | null>(null), [extra, setExtra] = useState<NotebookResource[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [revoked, setRevoked] = useState(false);
  const ticket = useRef(studySessionTicket()).current, active = useRef(true), pending = useRef(false);
  useEffect(() => {
    active.current = true;
    const invalidate = () => { active.current = false; setOpened(null); setExtra([]); setRevoked(true); };
    ticket.signal.addEventListener("abort", invalidate, { once: true });
    return () => { active.current = false; ticket.signal.removeEventListener("abort", invalidate); };
  }, [ticket]);
  function valid() { return active.current && !ticket.signal.aborted; }
  const entries = new Map<string, NotebookResource>();
  for (const item of [...data.resources, ...extra]) {
    if (item.kind === "scientific-notebook" && item.ownerId === me.id) entries.set(item.id, notebookResource(item));
  }
  async function open(id: string) {
    if (pending.current || !valid()) return;
    pending.current = true; setBusy(true); setError(""); setOpened(null);
    try {
      const resource = notebookResource(await studyRequest<NotebookResource>(`/resources/${encodeURIComponent(id)}`));
      if (!valid()) return;
      if (resource.id !== id || resource.ownerId !== me.id || resource.editionId !== data.edition.id)
        throw Error("notebook_identity_mismatch");
      setOpened(resource);
    } catch (failure) {
      if (valid()) setError(describeError(failure, "Il quaderno non è disponibile. Puoi riaprirlo dall’elenco."));
    } finally { pending.current = false; if (valid()) setBusy(false); }
  }
  async function upload(file: File | undefined) {
    if (!file || pending.current || !valid()) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (file.type !== "application/pdf") throw Error("notebook_pdf_required");
      const asset = await uploadOriginal(file, data.edition.id);
      if (!valid()) return;
      const original = await studyOriginal(asset.id);
      if (!valid()) return;
      const created = notebookResource(await studyRequest<NotebookResource>("/scientific-notebooks", {
        editionId: data.edition.id, assetId: original.descriptor.id, assetSha256: original.descriptor.sha256,
        // Asset identity is content-based. A renamed retry must retain the same creation body.
        state: { v: 1, title: "Il mio quaderno", annotations: [] },
      }, { headers: { "Idempotency-Key": `notebook:${asset.id}` } }));
      if (!valid()) return;
      // Upload retries may recover an older creation receipt: always reread its current head.
      const resource = notebookResource(await studyRequest<NotebookResource>(`/resources/${encodeURIComponent(created.id)}`));
      if (!valid()) return;
      if (resource.editionId !== data.edition.id || resource.ownerId !== me.id
          || resource.notebook.source.assetId !== asset.id || resource.notebook.source.sha256 !== original.descriptor.sha256)
        throw Error("notebook_identity_mismatch");
      setOpened(resource); setExtra(previous => [...previous.filter(r => r.id !== resource.id), resource]);
      try { await onUpdate(); } catch { if (valid()) setError("Quaderno creato. L’elenco del corso non si è aggiornato."); }
    } catch (failure) {
      if (valid()) setError(describeError(failure, "Il PDF non è stato aperto. Usa un PDF fino a 20 pagine e 20 MiB; riseleziona lo stesso file per riprovare."));
    } finally { pending.current = false; if (valid()) setBusy(false); }
  }
  if (revoked) return <ErrorNotice message="La sessione è cambiata. Riapri il tuo spazio." />;
  return <section className="scientific-notebooks" aria-label="Quaderni scientifici">
    <header className="notebook-collection-heading">
      <div><h2>Un documento. Il tuo ragionamento.</h2><p>Scrivi sulle pagine, costruisci una formula, conserva ogni passaggio nel tuo quaderno privato.</p></div>
      <label className="notebook-upload">Apri un PDF<input aria-label="Apri un PDF nel quaderno" type="file" accept="application/pdf" disabled={busy}
        onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void upload(file); }} /></label>
    </header>
    {!!entries.size && <nav className="notebook-library" aria-label="I tuoi quaderni">
      {[...entries.values()].map(item => <button key={item.id} disabled={busy} aria-pressed={opened?.id === item.id}
        onClick={() => void open(item.id)}>{item.notebook.state.title}<small>{item.notebook.source.pageCount} pagine</small></button>)}
    </nav>}
    {error && <ErrorNotice message={error} />}
    {busy && <Loading>Sto aprendo il quaderno…</Loading>}
    {opened && !busy && <NotebookEditor resource={opened} actor={me.id} onUse={onUse} onSaved={saved => {
      if (!valid()) return;
      setOpened(saved);
      setExtra(previous => [...previous.filter(r => r.id !== saved.id), saved]);
      void onUpdate().catch(() => { if (valid()) setError("Il quaderno è salvato. L’elenco del corso non si è aggiornato."); });
    }} />}
    {!opened && !busy && <p className="notebook-opening-hint">{entries.size
      ? "Scegli un quaderno per riprendere il lavoro. Ogni apertura rilegge la versione salvata."
      : "Inizia da un PDF fino a 20 pagine. L’originale rimane intatto; note e formule sono salvate separatamente."}</p>}
  </section>;
}
