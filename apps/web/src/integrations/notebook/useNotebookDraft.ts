import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, studyRequest, StudyApiError } from "../../api";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { notebookResource, stateError, type NotebookResource, type NotebookState } from "./model";

type Pending = { key: string; body: { expectedRevision: string; state: NotebookState } };
type Draft = { state: NotebookState; base: NotebookResource; pending?: Pending };
// Unsaved work survives in-app navigation, never grants access, and is erased on epoch change.
const drafts = new Map<string, Draft>();
let epoch = -1;
let removeLeaveGuard: (() => void) | undefined;
export function useNotebookDraft(initial: NotebookResource, actor: string, onSaved: (r: NotebookResource) => void) {
  const ticket = useRef(studySessionTicket()).current;
  if (epoch !== ticket.epoch) {
    drafts.clear(); epoch = ticket.epoch; removeLeaveGuard?.();
    const leave = (event: BeforeUnloadEvent) => {
      if (drafts.size) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", leave);
    removeLeaveGuard = () => window.removeEventListener("beforeunload", leave);
    ticket.signal.addEventListener("abort", () => {
      if (epoch === ticket.epoch) { drafts.clear(); removeLeaveGuard?.(); }
    }, { once: true });
  }
  const scope = JSON.stringify([ticket.epoch, actor, initial.editionId, initial.id,
    initial.notebook.source.assetId, initial.notebook.source.sha256]);
  const [draft, setDraft] = useState<Draft>(() => drafts.get(scope) ?? { state: initial.notebook.state, base: initial });
  const current = useRef(draft); current.current = draft;
  const past = useRef<NotebookState[]>([]), future = useRef<NotebookState[]>([]);
  const active = useRef(true), busyRef = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  // A newer head may be our own committed request whose response was lost.
  // Recover the frozen receipt before interpreting that head as a conflict.
  const [conflict, setConflict] = useState(!draft.pending && draft.base.revisionId !== initial.revisionId);
  const [, tick] = useState(0);
  const dirty = JSON.stringify(draft.state) !== JSON.stringify(draft.base.notebook.state);
  useEffect(() => {
    active.current = true;
    const invalidate = () => { drafts.clear(); active.current = false; past.current = []; future.current = []; };
    ticket.signal.addEventListener("abort", invalidate, { once: true });
    return () => {
      active.current = false;
      ticket.signal.removeEventListener("abort", invalidate);
    };
  }, [scope, ticket]);
  function publish(next: Draft) {
    current.current = next;
    if (JSON.stringify(next.state) !== JSON.stringify(next.base.notebook.state) || next.pending) drafts.set(scope, next);
    else drafts.delete(scope);
    if (active.current && !ticket.signal.aborted) setDraft(next);
  }
  function edit(state: NotebookState) {
    if (busyRef.current || current.current.pending || ticket.signal.aborted) return;
    if (!drafts.has(scope) && drafts.size >= 10) { setError("Salva una delle altre bozze aperte prima di modificarne un’altra."); return; }
    if (JSON.stringify(state) === JSON.stringify(current.current.state)) return;
    past.current = [...past.current.slice(-19), current.current.state]; future.current = [];
    publish({ ...current.current, state });
    setError(""); setMessage("");
  }
  function history(direction: "undo" | "redo") {
    if (busyRef.current || current.current.pending || ticket.signal.aborted) return;
    const from = direction === "undo" ? past : future, to = direction === "undo" ? future : past;
    const state = from.current.at(-1);
    if (!state) return;
    from.current = from.current.slice(0, -1); to.current = [...to.current.slice(-19), current.current.state];
    publish({ ...current.current, state }); setMessage(""); tick(n => n + 1);
  }
  async function save() {
    if (busyRef.current || ticket.signal.aborted || conflict) return;
    const invalid = stateError(current.current.state);
    if (invalid) { setError(invalid); return; }
    busyRef.current = true; setBusy(true); setError(""); setMessage("");
    const pending = current.current.pending ?? {
      key: requestKey(), body: { expectedRevision: current.current.base.revisionId, state: current.current.state },
    };
    publish({ ...current.current, pending });
    try {
      const saved = notebookResource(await studyRequest<NotebookResource>(
        `/scientific-notebooks/${encodeURIComponent(initial.id)}/revisions`, pending.body,
        { headers: { "Idempotency-Key": pending.key } },
      ));
      if (ticket.signal.aborted || drafts.get(scope)?.pending?.key !== pending.key) return;
      if (saved.id !== initial.id || saved.notebook.source.assetId !== initial.notebook.source.assetId
          || saved.notebook.source.sha256 !== initial.notebook.source.sha256) throw Error("notebook_identity_mismatch");
      publish({ state: saved.notebook.state, base: saved });
      if (active.current) {
        const newerHeadKnown = initial.revisionId !== pending.body.expectedRevision && initial.revisionId !== saved.revisionId;
        setConflict(newerHeadKnown);
        setMessage(newerHeadKnown ? "La richiesta è stata salvata, ma esiste già una versione successiva. Rileggi la versione salvata prima di continuare."
          : "Tutte le modifiche sono salvate.");
        onSaved(saved);
      }
    } catch (failure) {
      if (ticket.signal.aborted || drafts.get(scope)?.pending?.key !== pending.key) return;
      if (failure instanceof StudyApiError && failure.status >= 400 && failure.status < 500) {
        publish({ ...current.current, pending: undefined });
        if (active.current && failure.message === "stale_revision") setConflict(true);
      }
      if (active.current) setError(describeError(failure, "Salvataggio non confermato. La bozza è qui: riprova per recuperare la stessa richiesta."));
    } finally {
      busyRef.current = false;
      if (active.current && !ticket.signal.aborted) setBusy(false);
    }
  }
  async function discard() {
    if (busyRef.current || current.current.pending) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const latest = notebookResource(await studyRequest<NotebookResource>(`/resources/${encodeURIComponent(initial.id)}`));
      if (!active.current || ticket.signal.aborted) return;
      if (latest.id !== initial.id || latest.notebook.source.sha256 !== initial.notebook.source.sha256
          || latest.notebook.source.assetId !== initial.notebook.source.assetId) throw Error("notebook_identity_mismatch");
      past.current = []; future.current = [];
      publish({ state: latest.notebook.state, base: latest });
      setConflict(false); setMessage("Versione salvata ripristinata."); onSaved(latest);
    } catch (failure) {
      if (active.current && !ticket.signal.aborted) setError(describeError(failure, "La versione salvata non è disponibile. La bozza è conservata."));
    } finally { busyRef.current = false; if (active.current && !ticket.signal.aborted) setBusy(false); }
  }
  return { state: draft.state, resource: draft.base, dirty, busy, error, message, conflict,
    uncertain: !!draft.pending, edit, save, discard,
    undo: () => history("undo"), redo: () => history("redo"),
    canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
