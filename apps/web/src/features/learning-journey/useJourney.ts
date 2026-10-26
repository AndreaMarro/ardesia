import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, StudyApiError, type StudyMe, type StudyResource } from "../../api";
import { ensureDraftActor, readResourceDraft, writeResourceDraft } from "../../components/sessionDraftCache";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { coreJourneyAdapter, JourneyCommandRejected } from "./coreAdapter";
import { emptyDraft, readCheckpoint, ready, withinCheckpointLimit, type JourneyData, type JourneyDraft, type JourneyReceipt } from "./model";

export function useJourney(me: StudyMe, editionId: string) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [draft, setDraft] = useState<JourneyDraft | null>(null);
  const [receipt, setReceipt] = useState<JourneyReceipt | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [denied, setDenied] = useState(false), [reload, setReload] = useState(0);
  const [checkpointUnavailable, setCheckpointUnavailable] = useState(false);
  const [conflict, setConflict] = useState<JourneyDraft | null>(null);
  const conflicted = useRef(false);
  const ticket = useRef(studySessionTicket()).current;
  const adapter = useRef(coreJourneyAdapter(me, editionId)).current;
  const current = useRef<JourneyDraft | null>(null), base = useRef<StudyResource | null>(null);
  const localBase = useRef<{ id: string | null; revision: string | null }>({ id: null, revision: null });
  const savedText = useRef(""), createKey = useRef<string>(requestKey()), guard = useRef(false), active = useRef(true);
  const cacheKey = JSON.stringify([me.id, editionId, "s20", ticket.epoch]);
  const dirty = !!draft && JSON.stringify(draft) !== savedText.current;
  const live = () => active.current && !ticket.signal.aborted;
  function publish(next: JourneyDraft) {
    current.current = next;
    const text = JSON.stringify(next);
    writeResourceDraft(cacheKey, { text: text === savedText.current ? "" : JSON.stringify({ draft: next,
      baseId: localBase.current.id, baseRevision: localBase.current.revision }), key: createKey.current });
    if (live()) setDraft(next);
  }
  function failure(reason: unknown, fallback: string) {
    if (!live()) return;
    if (reason instanceof StudyApiError && [401, 403].includes(reason.status)) {
      current.current = null; base.current = null; setDraft(null); setData(null); setReceipt(null); setDenied(true);
      writeResourceDraft(cacheKey, { text: "", key: requestKey() });
    } else setError(describeError(reason, fallback));
  }
  useEffect(() => {
    active.current = true;
    ensureDraftActor(me.id);
    const abort = () => { current.current = null; base.current = null; setDraft(null); setData(null); setReceipt(null); setDenied(true); };
    ticket.signal.addEventListener("abort", abort, { once: true });
    void adapter.load().then(async value => {
      if (!live()) return;
      const requested = new URLSearchParams(location.search).get("journey");
      const checkpoint = requested ? value.checkpoints.find(item => item.resource.id === requested)
        : value.checkpoints.length === 1 ? value.checkpoints[0] : undefined;
      if (requested && !checkpoint) {
        setCheckpointUnavailable(true);
        throw Error("checkpoint_unavailable");
      }
      setCheckpointUnavailable(false);
      if (value.checkpoints.length > 1 && !checkpoint) throw Error("multiple_checkpoints");
      base.current = checkpoint?.resource ?? null;
      localBase.current = { id: base.current?.id ?? null, revision: base.current?.revisionId ?? null };
      let next = checkpoint?.draft ?? emptyDraft(value);
      savedText.current = checkpoint ? JSON.stringify(next) : "";
      const cached = readResourceDraft(cacheKey);
      if (cached?.text) {
        const envelope = JSON.parse(cached.text) as { draft: JourneyDraft; baseId: string | null; baseRevision: string | null };
        const restored = readCheckpoint({ id: "unsaved", revisionId: "unsaved", contextId: "unsaved", sha256: "",
          ownerId: me.id, editionId, kind: "learning-journey-checkpoint", visibility: "private", text: JSON.stringify(envelope.draft) }, me, value);
        if (restored) {
          if ((envelope.baseId !== (base.current?.id ?? null) || envelope.baseRevision !== (base.current?.revisionId ?? null))
            && JSON.stringify(restored) !== savedText.current) {
            conflicted.current = true; setConflict(next);
            localBase.current = { id: envelope.baseId, revision: envelope.baseRevision };
          }
          next = restored; createKey.current = cached.key;
        }
      }
      setData(value); publish(next); setError("");
      if (next.receiptId) {
        const result = await adapter.receipt(next.receiptId, next);
        if (live()) setReceipt(result);
      }
    }).catch(reason => failure(reason, reason instanceof Error && reason.message === "checkpoint_unavailable"
      ? "Il passaggio richiesto non è disponibile in questa edizione. Nessun altro percorso è stato aperto al suo posto."
      : "Il percorso non è disponibile. Riprova senza cambiare il tuo lavoro."));
    return () => { active.current = false; ticket.signal.removeEventListener("abort", abort); };
  }, [reload]);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (dirty || current.current?.pendingKey) { event.preventDefault(); event.returnValue = ""; }
    };
    addEventListener("beforeunload", leave);
    return () => removeEventListener("beforeunload", leave);
  }, [dirty]);
  async function persist(next: JourneyDraft) {
    let resource: StudyResource;
    try { resource = await adapter.save(next, base.current, createKey.current); }
    catch (reason) {
      if (reason instanceof StudyApiError && reason.message === "stale_revision") {
        const fresh = await adapter.load().catch(() => null);
        const remote = fresh?.checkpoints.find(item => item.resource.id === base.current?.id);
        if (remote && live()) { conflicted.current = true; setConflict(remote.draft); }
      }
      throw reason;
    }
    if (!live()) return;
    base.current = resource; localBase.current = { id: resource.id, revision: resource.revisionId };
    savedText.current = JSON.stringify(next);
    const lateSupport = !next.pendingKey && !next.receiptId && current.current?.stepId === next.stepId
      ? current.current.support.filter(item => !next.support.includes(item)) : [];
    publish(lateSupport.length ? { ...next, support: [...new Set([...next.support, ...lateSupport])],
      helpSource: current.current?.helpSource ?? next.helpSource } : next);
    const url = new URL(location.href); url.searchParams.set("journey", resource.id);
    history.replaceState(history.state, "", url);
  }
  async function save(next = current.current) {
    if (!next || guard.current || conflicted.current || !live()) return false;
    if (!withinCheckpointLimit(next)) { setError("La bozza supera lo spazio disponibile dopo la codifica. Riduci testo o formula; il lavoro resta qui."); return false; }
    guard.current = true; setBusy(true); setError(""); setMessage("");
    try { await persist(next); if (live()) setMessage(JSON.stringify(current.current) === savedText.current
      ? "Salvato nel tuo spazio. Puoi chiudere e riprendere qui."
      : "Testo salvato. Salva ancora per conservare anche l’aiuto appena consultato."); return live(); }
    catch (reason) {
      failure(reason, "Salvataggio non confermato. Il testo è ancora qui: riprova prima di chiudere."); return false;
    }
    finally { guard.current = false; if (live()) setBusy(false); }
  }
  function edit(change: Partial<JourneyDraft>) {
    if (!current.current || guard.current || current.current.pendingKey || current.current.receiptId || !live()) return;
    publish({ ...current.current, ...change }); setMessage(""); setError("");
  }
  function addSupport(id: JourneyDraft["support"][number]) {
    if (!current.current || current.current.pendingKey || current.current.receiptId || !live() || current.current.support.includes(id)) return;
    publish({ ...current.current, support: [...current.current.support, id] });
  }
  async function phase(value: JourneyDraft["phase"]) {
    if (!current.current || guard.current || current.current.pendingKey) return;
    const next = { ...current.current, phase: value };
    await save(next);
  }
  async function submit() {
    if (!data || !current.current || !ready(current.current) || guard.current || conflicted.current || current.current.receiptId || !live()) return;
    guard.current = true; setBusy(true); setError(""); setMessage("");
    const command = { ...current.current, pendingKey: current.current.pendingKey ?? requestKey() };
    publish(command);
    try {
      // The server checkpoint must acknowledge this frozen command before POST.
      await persist(command);
      if (!live()) return;
      const result = await adapter.submit(command, data);
      if (!live()) return;
      setReceipt(result);
      await persist({ ...command, pendingKey: null, receiptId: result.receiptId, phase: "feedback" });
      if (!live()) return;
      setMessage("Tentativo ricevuto dal Core. Il controllo numerico non valuta il ragionamento.");
      const fresh = await adapter.load();
      if (live()) setData(fresh);
    } catch (reason) {
      // These Core rejections roll back the submission transaction. The learner
      // can repair its source/prediction; unknown outcomes stay frozen for retry.
      if (live() && reason instanceof JourneyCommandRejected) {
        const rejected = { ...command, pendingKey: null };
        publish(rejected);
        try { await persist(rejected); } catch { /* keep the editable session draft */ }
      }
      failure(reason, reason instanceof JourneyCommandRejected
        ? "Il Core non ha ricevuto il tentativo. Il testo è conservato: aggiorna la fonte e correggi i dati prima di inviare di nuovo."
        : "Invio da confermare. Testo e richiesta sono conservati: riprova lo stesso invio.");
    }
    finally { guard.current = false; if (live()) setBusy(false); }
  }
  async function nextStep() {
    if (!data || !current.current?.receiptId || current.current.pendingKey || guard.current) return;
    const index = data.experience.steps.findIndex(step => step.id === current.current!.stepId);
    const step = data.experience.steps[index + 1];
    if (!step) return;
    const next = { ...emptyDraft(data, step), source: current.current.source,
      support: current.current.support.includes("model-result") ? ["model-result" as const] : [] };
    if (await save(next)) { setReceipt(null); publish(next); }
  }
  async function refresh() {
    if (guard.current || !live()) return;
    guard.current = true; setBusy(true); setError("");
    try {
      const fresh = await adapter.load();
      if (current.current?.receiptId) {
        const result = await adapter.receipt(current.current.receiptId, current.current);
        if (live()) setReceipt(result);
      }
      if (live()) { setData(fresh); setMessage("Ricevute e feedback riletti dal servizio."); }
    } catch (reason) { failure(reason, "Il servizio non risponde. La bozza e la ricevuta già letta sono ancora qui."); }
    finally { guard.current = false; if (live()) setBusy(false); }
  }
  async function useServerVersion() {
    if (!conflicted.current || guard.current || !live()) return;
    const fresh = await adapter.load().catch(reason => { failure(reason, "La versione salvata non è disponibile. La bozza è conservata."); return null; });
    if (!fresh || !live()) return;
    const remote = fresh.checkpoints.find(item => item.resource.id === base.current?.id);
    if (!remote) return;
    base.current = remote.resource; localBase.current = { id: remote.resource.id, revision: remote.resource.revisionId };
    savedText.current = JSON.stringify(remote.draft);
    conflicted.current = false; setConflict(null); setReceipt(null); setData(fresh); publish(remote.draft); setError("");
    if (remote.draft.receiptId) {
      try { const result = await adapter.receipt(remote.draft.receiptId, remote.draft); if (live()) setReceipt(result); }
      catch (reason) { failure(reason, "La ricevuta salvata non è ancora leggibile."); }
    }
  }
  function openEdition() {
    if (!checkpointUnavailable || guard.current || !live()) return;
    const url = new URL(location.href); url.searchParams.delete("journey");
    history.replaceState(history.state, "", url);
    setCheckpointUnavailable(false); setError(""); setReload(value => value + 1);
  }
  return { data, draft, receipt, busy, error, message, denied, dirty, conflict, checkpointUnavailable, openEdition,
    useServerVersion, edit, addSupport, save, phase, submit, nextStep, refresh,
    retry: () => { setError(""); setReload(value => value + 1); } };
}
