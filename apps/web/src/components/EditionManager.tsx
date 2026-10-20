import { useEffect, useRef, useState } from "react";
import { requestKey, studyRequest, dateLabel } from "../api";
import { commandKey, managementError, type AdminEdition, type OfferPreview, type PackOption, type SessionStart } from "../editionAdmin";
import { ErrorNotice, Loading } from "./Feedback";
import { EditionOfferPreview } from "./EditionOfferPreview";
import "./edition-admin.css";

type Changed = (id: string) => void;
export function EditionManager({ editionId, onChanged, defaultOpen = false }: { editionId: string | null; onChanged: Changed; defaultOpen?: boolean }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(defaultOpen);
  return <section className="edition-manager" aria-label="Gestione delle edizioni">
    <div className="section-title">
      <div><p className="section-meta">Regia del docente</p><h2>Dal programma alla prossima edizione.</h2></div>
      <button className="button-primary" onClick={() => setCreating(true)} disabled={creating}>Nuova edizione</button>
    </div>
    {creating && <CreateEdition onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); onChanged(id); }} />}
    {editionId && !creating && <details open={editing} onToggle={(event) => setEditing(event.currentTarget.open)}>
      <summary>Gestisci date e offerta</summary>
      {editing && <EditionEditor key={editionId} editionId={editionId} onChanged={onChanged} />}
    </details>}
    {!editionId && !creating && <p>Scegli un programma, prepara le quattro date e rileggi l’offerta. La bozza resta privata finché non la confermi.</p>}
  </section>;
}
function CreateEdition({ onClose, onCreated }: { onClose: () => void; onCreated: Changed }) {
  const [packs, setPacks] = useState<PackOption[]>([]), [pack, setPack] = useState(""),
    [capacity, setCapacity] = useState("10"), [price, setPrice] = useState("4900"),
    [busy, setBusy] = useState(false), [error, setError] = useState("");
  const mounted = useRef(true), key = useRef({ body: "", key: requestKey() });
  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    void studyRequest<{ items: PackOption[] }>("/admin/coursepacks", undefined, { signal: controller.signal }).then((result) => {
      if (mounted.current) { setPacks(result.items); setPack(result.items[0]?.packId ?? ""); }
    }).catch((failure) => { if (mounted.current) setError(managementError(failure).message); });
    return () => { mounted.current = false; controller.abort(); };
  }, []);
  const selected = packs.find((item) => item.packId === pack);
  async function create() {
    if (busy || !selected) return;
    setBusy(true); setError("");
    const body = { packId: selected.packId, packVersion: selected.packVersion, capacity: Number(capacity), priceMinor: Number(price) };
    try {
      const result = await studyRequest<{ edition: AdminEdition }>("/admin/editions", body, { headers: { "Idempotency-Key": commandKey(key.current, body) } });
      if (mounted.current) onCreated(result.edition.id);
    } catch (failure) { if (mounted.current) setError(managementError(failure).message); }
    finally { if (mounted.current) setBusy(false); }
  }
  return <form className="edition-composer" aria-label="Crea un’edizione" onSubmit={(event) => { event.preventDefault(); void create(); }}>
    <h3>Un programma. Un nuovo gruppo.</h3>
    {error && <ErrorNotice message={error} />}
    <fieldset disabled={busy}><legend>Le condizioni iniziali</legend>
      <label>Programma<select aria-label="Programma" required value={pack} onChange={(event) => setPack(event.target.value)}>
        <option value="" disabled>Scegli il programma</option>
        {packs.map((item) => <option key={item.packId} value={item.packId}>{item.title} · {item.editorialStatus}</option>)}
      </select></label>
      {selected && <p className="fine-print">{selected.scope} Il programma e la sua versione restano legati a questa edizione.</p>}
      <div className="edition-term-fields"><label>Posti (massimo 10)<input required type="number" min="1" max="10" step="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></label>
        <label>Prezzo indicativo<select aria-label="Prezzo indicativo" value={price} onChange={(event) => setPrice(event.target.value)}><option value="4900">€49 per persona</option><option value="3900">€39 per persona</option></select></label></div>
    </fieldset>
    <p className="fine-print">Quattro incontri da 90 minuti. È una preparazione di test: nessun pagamento viene attivato.</p>
    <div className="edition-actions"><button className="button-primary" type="submit" disabled={busy || !selected}>{busy ? "Creo la bozza…" : "Crea bozza privata"}</button><button type="button" disabled={busy} onClick={onClose}>Annulla</button></div>
  </form>;
}
function EditionEditor({ editionId, onChanged }: { editionId: string; onChanged: Changed }) {
  const [edition, setEdition] = useState<AdminEdition | null>(null),
    [starts, setStarts] = useState<SessionStart[]>([]), [capacity, setCapacity] = useState("10"), [price, setPrice] = useState("4900"),
    [busy, setBusy] = useState(false), [error, setError] = useState(""), [code, setCode] = useState(""),
    [notice, setNotice] = useState(""), [preview, setPreview] = useState<OfferPreview | null>(null);
  const mounted = useRef(true), saveKey = useRef({ body: "", key: requestKey() }), previewKey = useRef(requestKey()), confirmKey = useRef(requestKey());
  function accept(value: AdminEdition) {
    if (!Array.isArray(value.starts) || !Array.isArray(value.sessions) || !Number.isInteger(value.managementRevision) || value.managementRevision < 0) throw Error("invalid_edition_response");
    setEdition(value); setCapacity(String(value.capacity)); setPrice(String(value.priceMinor));
    setStarts(Array.from({ length: 4 }, (_, index) => value.starts[index] ?? { localStart: "" }));
  }
  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    void studyRequest<AdminEdition>("/admin/editions/" + encodeURIComponent(editionId), undefined, { signal: controller.signal }).then((value) => {
      if (mounted.current) accept(value);
    }).catch((failure) => { if (mounted.current) setError(managementError(failure).message); });
    return () => { mounted.current = false; controller.abort(); };
  }, [editionId]);
  function fail(failure: unknown) {
    const problem = managementError(failure); setError(problem.message); setCode(problem.code);
  }
  function changeStart(index: number, patch: Partial<SessionStart>) {
    setStarts((previous) => previous.map((item, ordinal) => ordinal === index ? { ...item, ...patch } : item));
    setPreview(null); setNotice("");
  }
  async function save() {
    if (busy || !edition) return;
    setBusy(true); setError(""); setCode(""); setNotice(""); setPreview(null);
    const body = { expectedRevision: edition.managementRevision, capacity: Number(capacity), priceMinor: Number(price), starts };
    try {
      const result = await studyRequest<{ edition: AdminEdition }>("/admin/editions/" + encodeURIComponent(editionId), body, { method: "PATCH", headers: { "Idempotency-Key": commandKey(saveKey.current, body) } });
      if (!mounted.current) return;
      accept(result.edition); setNotice("Date e condizioni salvate. Rileggi l’anteprima prima di confermare l’offerta.");
      onChanged(editionId);
    } catch (failure) { if (mounted.current) fail(failure); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function readPreview() {
    if (busy || !edition) return;
    setBusy(true); setError(""); setCode(""); setPreview(null);
    try {
      const result = await studyRequest<OfferPreview>("/admin/editions/" + encodeURIComponent(editionId) + "/offer/preview", { expectedRevision: edition.managementRevision }, { headers: { "Idempotency-Key": previewKey.current } });
      if (!mounted.current) return;
      setPreview(result); previewKey.current = requestKey(); confirmKey.current = requestKey();
    } catch (failure) { if (mounted.current) fail(failure); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function confirmOffer() {
    if (busy || !preview) return;
    setBusy(true); setError(""); setCode("");
    try {
      const result = await studyRequest<{ edition: AdminEdition }>("/admin/editions/" + encodeURIComponent(editionId) + "/offer/confirm", { previewId: preview.previewId, previewHash: preview.previewHash, expectedRevision: preview.expectedRevision, confirmed: true }, { headers: { "Idempotency-Key": confirmKey.current } });
      if (!mounted.current) return;
      accept(result.edition); setPreview(null); setNotice("Offerta di test confermata. Nessun addebito o invito è stato inviato.");
      onChanged(editionId);
    } catch (failure) { if (mounted.current) fail(failure); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function reread() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const result = await studyRequest<AdminEdition>("/admin/editions/" + encodeURIComponent(editionId));
      if (mounted.current) { accept(result); setPreview(null); setCode(""); }
    } catch (failure) { if (mounted.current) fail(failure); }
    finally { if (mounted.current) setBusy(false); }
  }
  if (!edition) return error ? <ErrorNotice message={error} /> : <Loading>Leggo le condizioni dell’edizione…</Loading>;
  const dirty = capacity !== String(edition.capacity) || price !== String(edition.priceMinor) || JSON.stringify(starts) !== JSON.stringify(Array.from({ length: 4 }, (_, index) => edition.starts[index] ?? { localStart: "" }));
  return <div className="edition-editor">
    <div className="section-title"><h3>{edition.state === "offered" ? "Offerta di test confermata" : "Prepara date e condizioni"}</h3><span className="edition-status">{edition.state === "draft" ? "Bozza privata" : edition.state === "collecting" ? "Raccolta di interesse" : edition.state === "offered" ? "Proposta disponibile" : edition.state}</span></div>
    <p>Orario del corso: <strong>{edition.timezone}</strong> · 4 incontri da 90 minuti reali.</p>
    {edition.legacyUnversionedOffer && <p className="fine-print">Offerta precedente al nuovo percorso di conferma. Non è un’approvazione scientifica.</p>}
    {error && <ErrorNotice message={error} />}
    {code === "stale_edition" && <button disabled={busy} onClick={() => void reread()}>Rileggi e sostituisci i campi con la versione salvata</button>}
    {notice && <p role="status" className="success-notice">{notice}</p>}
    <form aria-label="Date e condizioni dell’edizione" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <fieldset disabled={busy}><legend>Le quattro date</legend>
        <div className="edition-dates">{starts.map((item, index) => <div className="edition-date" key={index}>
          <label>Incontro {index + 1} · inizio<input type="datetime-local" required value={item.localStart} onChange={(event) => changeStart(index, { localStart: event.target.value, occurrence: undefined })} /></label>
          <details open={code === "ambiguous_calendar_time" || !!item.occurrence}><summary>Orario ripetuto al cambio d’ora</summary>
            <label>Occorrenza dell’incontro {index + 1}<select aria-label={`Occorrenza dell’incontro ${index + 1}`} value={item.occurrence ?? ""} onChange={(event) => changeStart(index, { occurrence: (event.target.value || undefined) as SessionStart["occurrence"] })}><option value="">Automatico se l’orario è univoco</option><option value="earlier">Prima occorrenza</option><option value="later">Seconda occorrenza</option></select></label>
          </details>
        </div>)}</div>
        <div className="edition-term-fields"><label>Posti (massimo 10)<input required type="number" min="1" max="10" step="1" value={capacity} onChange={(event) => { setCapacity(event.target.value); setPreview(null); }} /></label><label>Prezzo indicativo<select aria-label="Prezzo indicativo" value={price} onChange={(event) => { setPrice(event.target.value); setPreview(null); }}><option value="4900">€49 per persona</option><option value="3900">€39 per persona</option></select></label></div>
      </fieldset>
      <div className="edition-actions"><button type="submit" disabled={busy}>{busy ? "Attendi…" : "Salva date e condizioni"}</button><button type="button" className="button-primary" disabled={busy || dirty || edition.sessions.length !== 4 || !["draft", "collecting"].includes(edition.state)} onClick={() => void readPreview()}>Rileggi l’offerta completa</button></div>
      {dirty && <p className="fine-print">Salva i campi prima di aprire l’anteprima dell’offerta.</p>}
    </form>
    {edition.sessions.length === 4 && <div className="edition-saved-dates"><h4>Date salvate</h4><ol>{edition.sessions.map((session, index) => <li key={index}>{dateLabel(session.start, edition.timezone)} — {dateLabel(session.end, edition.timezone)}</li>)}</ol></div>}
    <p className="fine-print">La conferma riguarda date e condizioni di test. Programma, revisione scientifica e pagamenti restano distinti. Con partecipanti o riserve attive, le modifiche richiedono riconferma.</p>
    {preview && <EditionOfferPreview key={preview.previewId} preview={preview} busy={busy} onConfirm={() => void confirmOffer()} onClose={() => setPreview(null)} />}
  </div>;
}
