import { useEffect, useRef, useState } from "react";
import type { PostitReference } from "../../api";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { studyOriginal, type VerifiedOriginalAsset } from "../../../../studio/src/study/apiClient";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { PdfReader } from "./PdfReader";
import { AnnotationLayer } from "./AnnotationLayer";
import { FormulaField } from "./FormulaField";
import { useNotebookDraft } from "./useNotebookDraft";
import { anchorRect, type Annotation, type NotebookResource, type Rect } from "./model";

export function NotebookEditor({ resource, actor, onSaved, onUse, readOnly = false }: {
  resource: NotebookResource; actor: string; onSaved: (r: NotebookResource) => void;
  onUse?: (reference: PostitReference) => void; readOnly?: boolean;
}) {
  const [original, setOriginal] = useState<VerifiedOriginalAsset | null>(null);
  const [error, setError] = useState(""), [attempt, setAttempt] = useState(0);
  const [revoked, setRevoked] = useState(false);
  useEffect(() => {
    const ticket = studySessionTicket(), controller = new AbortController();
    let active = true;
    setOriginal(null); setError("");
    const revoke = () => { active = false; controller.abort(); setOriginal(null); setRevoked(true); };
    ticket.signal.addEventListener("abort", revoke, { once: true });
    void studyOriginal(resource.notebook.source.assetId, { signal: controller.signal }).then(value => {
      if (!active || ticket.signal.aborted) return;
      if (value.descriptor.sha256 !== resource.notebook.source.sha256 || value.descriptor.editionId !== resource.editionId)
        throw Error("notebook_original_mismatch");
      setOriginal(value);
    }).catch(() => {
      if (active) setError("L’originale non è disponibile o la sua identità non coincide. Puoi riprovare.");
    });
    return () => { active = false; controller.abort(); ticket.signal.removeEventListener("abort", revoke); };
  }, [resource.id, resource.notebook.source.assetId, resource.notebook.source.sha256, resource.editionId, attempt]);
  if (revoked) return <ErrorNotice message="La sessione è cambiata. Riapri il quaderno dal tuo spazio." />;
  if (error) return <ErrorNotice message={error} onRetry={() => setAttempt(n => n + 1)} />;
  if (!original) return <Loading>Sto verificando l’originale del quaderno…</Loading>;
  return readOnly ? <NotebookReading resource={resource} original={original} />
    : <Editing key={`${actor}:${resource.id}`} resource={resource} original={original} actor={actor} onSaved={onSaved} onUse={onUse} />;
}

function Download({ original }: { original: VerifiedOriginalAsset }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const value = URL.createObjectURL(original.blob); setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [original]);
  return url ? <a href={url} download={`originale-${original.descriptor.id}.pdf`}>Scarica il PDF originale</a> : null;
}
function NotebookReading({ resource, original }: { resource: NotebookResource; original: VerifiedOriginalAsset }) {
  return <section className="scientific-notebook notebook-reading" aria-label="Quaderno scientifico in lettura">
    <h3>{resource.notebook.state.title}</h3>
    <p className="fine-print">Versione selezionata · {resource.revisionId.slice(0, 8)}</p>
    <PdfReader original={original} overlay={frame => <AnnotationLayer frame={frame} annotations={resource.notebook.state.annotations} />} />
    <ol className="notebook-reading-notes">{resource.notebook.state.annotations.map(a => <li key={a.id}>
      <strong>Pagina {a.page} · {a.kind === "formula" ? "Formula" : a.kind === "highlight" ? "Evidenziazione" : "Nota"}</strong>
      {a.kind === "formula" ? <FormulaField readOnly value={a.content} /> : <p>{a.content || "Passaggio evidenziato nel PDF."}</p>}
    </li>)}</ol>
    <Download original={original} />
  </section>;
}

function Editing({ resource, original, actor, onSaved, onUse }: {
  resource: NotebookResource; original: VerifiedOriginalAsset; actor: string;
  onSaved: (r: NotebookResource) => void; onUse?: (reference: PostitReference) => void;
}) {
  const editor = useNotebookDraft(resource, actor, onSaved);
  const [selected, setSelected] = useState<string | undefined>();
  const [placing, setPlacing] = useState(false), [discard, setDiscard] = useState(false);
  const [used, setUsed] = useState("");
  useEffect(() => { setUsed(""); }, [editor.state]);
  const selectedAnnotation = editor.state.annotations.find(a => a.id === selected);
  const field = useRef<HTMLTextAreaElement>(null);
  const disabled = editor.busy || editor.uncertain;
  useEffect(() => { field.current?.focus(); }, [selected]);
  function modify(id: string, change: Partial<Annotation>) {
    editor.edit({ ...editor.state, annotations: editor.state.annotations.map(a => a.id === id ? { ...a, ...change } : a) });
    setUsed("");
  }
  function add(kind: Annotation["kind"], page: number) {
    if (disabled || editor.state.annotations.length >= 200) return;
    const id = crypto.randomUUID();
    editor.edit({ ...editor.state, annotations: [...editor.state.annotations, {
      id, kind, page, rect: anchorRect(.5, .4), content: kind === "formula" ? "A_1v_1=A_2v_2" : "",
    }] });
    setSelected(id); setPlacing(false); setUsed("");
  }
  function move(id: string, rect: Rect) { modify(id, { rect }); }
  function exportDraft() {
    const body = JSON.stringify({ format: "ardesia-unsaved-draft-v1", resourceId: resource.id,
      expectedRevision: editor.resource.revisionId, source: resource.notebook.source, state: editor.state }, null, 2);
    const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "bozza-quaderno.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="scientific-notebook" aria-label="Editor del quaderno scientifico" onKeyDown={event => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z"
        || (event.target as HTMLElement).closest("input,textarea,select,math-field,[contenteditable=true]")) return;
    event.preventDefault(); if (event.shiftKey) editor.redo(); else editor.undo();
  }}>
    <header className="notebook-commandbar">
      <label className="notebook-title">Titolo del quaderno
        <input aria-label="Titolo del quaderno" value={editor.state.title} maxLength={200} disabled={disabled}
          onChange={e => editor.edit({ ...editor.state, title: e.target.value })} />
      </label>
      <div className="notebook-save-actions">
        <button disabled={disabled || !editor.canUndo} onClick={editor.undo} aria-label="Annulla modifica al quaderno">↶ Annulla</button>
        <button disabled={disabled || !editor.canRedo} onClick={editor.redo} aria-label="Ripeti modifica al quaderno">↷ Ripeti</button>
        <button className="button-primary" disabled={editor.busy || editor.conflict || (!editor.dirty && !editor.uncertain)}
          onClick={() => void editor.save()}>{editor.busy ? "Salvataggio…" : editor.uncertain ? "Riprova salvataggio" : "Salva modifiche"}</button>
      </div>
    </header>
    <p role="status" className="notebook-save-state">{used || editor.message || (editor.uncertain
      ? "Salvataggio da confermare. Riprova prima di continuare."
      : editor.dirty ? "Modifiche non salvate · conservate finché questa sessione resta aperta."
        : "Versione salvata · il tutor vede soltanto ciò che consegni.")}</p>
    {editor.error && <ErrorNotice message={editor.error} />}
    {editor.conflict && <p className="source-warning">Esiste una versione più recente. Conserva la bozza oppure rileggi e ripristina la versione salvata.</p>}
    <div className="notebook-workspace">
      <div className="notebook-document">
        <PdfReader original={original}
          pageTools={page => <div className="notebook-page-tools" role="group" aria-label={`Annota pagina ${page}`}>
            <button disabled={disabled || editor.state.annotations.length >= 200} onClick={() => add("note", page)}>＋ Nota</button>
            <button disabled={disabled || editor.state.annotations.length >= 200} onClick={() => add("formula", page)}>ƒ Formula</button>
            <button disabled={disabled || editor.state.annotations.length >= 200} onClick={() => add("highlight", page)}>Evidenzia</button>
            {placing && <span role="status">Tocca la pagina per posizionare l’annotazione.</span>}
          </div>}
          overlay={frame => <AnnotationLayer frame={frame} annotations={editor.state.annotations} selected={selected}
            placing={placing && !!selectedAnnotation && selectedAnnotation.page === frame.number && !disabled}
            placingSize={selectedAnnotation ? [selectedAnnotation.rect[2], selectedAnnotation.rect[3]] : undefined}
            onSelect={id => { setSelected(id); setPlacing(false); }}
            onPlace={rect => {
              if (selectedAnnotation) move(selectedAnnotation.id, rect);
              setPlacing(false);
            }}
            onMove={disabled ? undefined : move} />}
        />
        <Download original={original} />
      </div>
      <aside className="notebook-inspector" aria-label="Annotazioni del quaderno">
        <h3>I tuoi passaggi <span>{editor.state.annotations.length}</span></h3>
        {!editor.state.annotations.length && <p className="notebook-empty">Una nota per spiegare. Una formula per verificare. Aggiungi il primo passaggio dalla barra della pagina.</p>}
        <ol className="notebook-note-index">{editor.state.annotations.map((a, index) => <li key={a.id}>
          <button aria-pressed={selected === a.id} onClick={() => { setSelected(a.id); setPlacing(false); }}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{a.content.slice(0, 48) || (a.kind === "highlight" ? "Passaggio evidenziato" : "Nuova nota")}<small>Pagina {a.page} · {a.kind === "formula" ? "Formula" : a.kind === "highlight" ? "Evidenziazione" : "Nota"}</small></span>
          </button>
        </li>)}</ol>
        {selectedAnnotation && <div className="notebook-annotation-editor" key={selectedAnnotation.id}>
          <h4>Pagina {selectedAnnotation.page} · {selectedAnnotation.kind === "formula" ? "Formula" : "Annotazione"}</h4>
          <fieldset disabled={disabled}>
            {selectedAnnotation.kind === "formula" ? <FormulaField value={selectedAnnotation.content} disabled={disabled}
              onChange={content => modify(selectedAnnotation.id, { content })} /> :
              <label>Il tuo ragionamento<textarea ref={field} aria-label="Testo dell’annotazione" rows={5} maxLength={5000}
                value={selectedAnnotation.content} onChange={e => modify(selectedAnnotation.id, { content: e.target.value })} /></label>}
            <button aria-pressed={placing} onClick={() => setPlacing(!placing)}>Posiziona sulla pagina</button>
            <details className="notebook-geometry">
              <summary>Posizione e dimensioni</summary>
              {(["Sinistra", "Alto", "Larghezza", "Altezza"] as const).map((label, i) => <label key={label}>
                {label} (%)<input type="number" aria-label={`${label} dell’annotazione`} min={i < 2 ? 0 : 1} max={100} step={1}
                  value={Math.round(selectedAnnotation.rect[i] * 100)}
                  onChange={e => {
                    if (!e.target.value) return;
                    const next = [...selectedAnnotation.rect] as Rect;
                    const n = Number(e.target.value) / 100;
                    if (!Number.isFinite(n)) return;
                    next[i] = Math.max(i < 2 ? 0 : .01, Math.min(1, n));
                    if (i < 2) next[i] = Math.min(1 - next[i + 2], next[i]);
                    else next[i] = Math.min(1 - next[i - 2], next[i]);
                    move(selectedAnnotation.id, next);
                  }} />
              </label>)}
              <p>Usa anche le frecce della tastiera sull’annotazione.</p>
            </details>
            <button className="notebook-remove" onClick={() => {
              editor.edit({ ...editor.state, annotations: editor.state.annotations.filter(a => a.id !== selectedAnnotation.id) });
              setSelected(undefined);
            }}>Rimuovi annotazione</button>
          </fieldset>
        </div>}
      </aside>
    </div>
    <footer className="notebook-footer">
      {onUse && <button disabled={disabled || editor.dirty || editor.conflict} onClick={() => {
        onUse({ resourceId: editor.resource.id, revisionId: editor.resource.revisionId, contextId: editor.resource.contextId });
        setUsed("Versione salvata collegata alla prossima consegna.");
      }}>Usa questa versione nella consegna</button>}
      <button onClick={exportDraft}>Scarica la bozza</button>
      {(editor.dirty || editor.conflict) && <button disabled={disabled} onClick={() => setDiscard(true)}>Ripristina versione salvata</button>}
      {discard && <div className="notebook-discard" role="group" aria-label="Conferma ripristino">
        <p>Le modifiche non salvate saranno eliminate. Puoi scaricare la bozza prima di continuare.</p>
        <button onClick={() => { void editor.discard(); setSelected(undefined); setDiscard(false); }}>Conferma ripristino</button>
        <button onClick={() => setDiscard(false)}>Tieni la bozza</button>
      </div>}
    </footer>
  </section>;
}
