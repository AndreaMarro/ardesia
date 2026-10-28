import { useEffect, useRef, useState } from "react";
import { requestKey, studyRequest, StudyApiError } from "./apiClient";
import type { CourseLessonContext, PostitReference, StudyMe, SubmissionCourseContext } from "./contracts";
import { uploadOriginal } from "./uploadOriginal";
type SubmissionPayload = {
  editionId: string;
  activityId: string;
  activityParameters?: Record<string, unknown>;
  text: string;
  assetRefs: string[];
  parentId: string | null;
  sourceRefs: PostitReference[];
  courseLesson?: CourseLessonContext;
};
type Draft = {
  text: string;
  assetRefs: string[];
  key: string;
  parentId: string | null;
  pending?: SubmissionPayload;
};
type Receipt = {
  receiptId: string;
  revision: number;
  courseContext?: SubmissionCourseContext;
};
type Props = {
  me: StudyMe;
  source: PostitReference | null;
  parentId: string | null;
  onUpdate: () => Promise<void>;
  onConfirmed?: () => void;
  editionId?: string;
  activityId?: string;
  activityParameters?: Record<string, unknown>;
  courseLesson?: CourseLessonContext;
  prediction?: string;
  activityReady?: boolean;
  requireProcedure?: boolean;
  parentScopeStrict?: boolean;
};
export function SubmissionPanel({
  me,
  source,
  parentId,
  onUpdate,
  onConfirmed,
  editionId = "fluidi",
  activityId = "poiseuille-v1",
  activityParameters,
  courseLesson,
  prediction,
  activityReady = true,
  requireProcedure = false,
  parentScopeStrict = false,
}: Props) {
  const textLimit =
    20000 -
    (prediction ? `Previsione: ${prediction}\n\nProcedimento: `.length : 0);
  const storageKey = `ardesia-study-draft:${me.id}:${editionId}`;
  const receiptKey = `ardesia-study-receipt:${me.id}:${editionId}`;
  const blank = (): Draft => ({
    text: "",
    assetRefs: [],
    key: requestKey(),
    parentId,
  });
  function load(): Draft {
    try {
      return (
        (JSON.parse(
          localStorage.getItem(storageKey) ??
            (editionId === "fluidi"
              ? localStorage.getItem(`ardesia-study-draft:${me.id}`)
              : null) ??
            "null",
        ) as Draft) ?? blank()
      );
    } catch {
      return blank();
    }
  }
  function previousReceipt(): Receipt | null {
    try {
      return JSON.parse(
        localStorage.getItem(receiptKey) ?? "null",
      ) as Receipt | null;
    } catch {
      return null;
    }
  }
  const [draft, setDraft] = useState<Draft>(load);
  const [receipt, setReceipt] = useState<Receipt | null>(previousReceipt);
  const [receiptVerified, setReceiptVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false),
    uploading = useRef(false),
    mounted = useRef(true),
    current = useRef(draft);
  current.current = draft;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const instance = useRef(requestKey());
  const notify = () =>
    window.dispatchEvent(
      new CustomEvent("ardesia:submission-draft", {
        detail: { storageKey, sender: instance.current },
      }),
    );
  useEffect(() => {
    const changed = (event: Event) => {
      const detail = (
        event as CustomEvent<{ storageKey: string; sender: string }>
      ).detail;
      if (
        detail.storageKey === storageKey &&
        detail.sender !== instance.current
      ) {
        const next = load();
        current.current = next;
        setDraft(next);
        setReceipt(previousReceipt());
        setReceiptVerified(false);
      }
    };
    window.addEventListener("ardesia:submission-draft", changed);
    return () =>
      window.removeEventListener("ardesia:submission-draft", changed);
  }, [storageKey]);
  // Persist acknowledgements immediately, including after a course switch has unmounted this editor.
  function update(change: (value: Draft) => Draft) {
    const next = change(mounted.current ? current.current : load());
    localStorage.setItem(storageKey, JSON.stringify(next));
    current.current = next;
    if (mounted.current) setDraft(next);
    notify();
  }
  useEffect(() => {
    if (
      (parentScopeStrict || parentId !== null) &&
      current.current.parentId !== parentId &&
      !current.current.pending
    )
      update((value) => ({ ...value, parentId, key: requestKey() }));
  }, [parentId, parentScopeStrict]);
  async function upload(files: FileList | null) {
    if (!files?.length || uploading.current || pending.current) return;
    uploading.current = true;
    setBusy(true);
    setMessage("Caricamento privato in corso…");
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadOriginal(file, editionId);
        update((value) => ({
          ...value,
          assetRefs: [...new Set([...value.assetRefs, asset.id])],
          key: requestKey(),
        }));
      }
      if (mounted.current)
        setMessage(
          "Originale caricato in privato. La consegna deve ancora essere inviata.",
        );
    } catch {
      if (mounted.current)
        setMessage(
          "Caricamento non completato. Gli originali già confermati sono conservati; puoi riselezionare il file per riprovare senza duplicati.",
        );
    } finally {
      uploading.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (
      (!draft.pending && draft.text.length > textLimit) ||
      pending.current ||
      uploading.current ||
      (!draft.pending &&
        (!activityReady || (requireProcedure && !draft.text.trim())))
    )
      return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    const sentKey = draft.key;
    try {
      let assetRefs = draft.assetRefs;
      if (!draft.pending && source) {
        const exact = await studyRequest<{ id: string; revisionId: string; contextId: string; kind: string; notebook?: { source: { assetId: string } } }>(
          `/resources/${encodeURIComponent(source.resourceId)}/revisions/${encodeURIComponent(source.revisionId)}`,
        );
        if (exact.id !== source.resourceId || exact.revisionId !== source.revisionId || exact.contextId !== source.contextId)
          throw Error("source_identity_mismatch");
        if (exact.kind === "scientific-notebook") {
          if (!exact.notebook?.source.assetId) throw Error("notebook_original_required");
          assetRefs = [...new Set([...assetRefs, exact.notebook.source.assetId])];
        }
      }
      if (assetRefs.length > 5) {
        if (mounted.current) setMessage("La fonte aggiunge il suo PDF: puoi consegnare al massimo 5 originali insieme.");
        return;
      }
      // Source verification is asynchronous: another mounted editor may have changed this draft.
      if ((mounted.current ? current.current : load()).key !== sentKey) {
        if (mounted.current) setMessage("La bozza è cambiata durante la verifica della fonte. Controllala e consegna di nuovo.");
        return;
      }
      const payload = draft.pending ?? {
        editionId,
        activityId,
        ...(activityParameters === undefined ? {} : { activityParameters }),
        ...(courseLesson === undefined ? {} : { courseLesson }),
        text: prediction
          ? `Previsione: ${prediction}\n\nProcedimento: ${draft.text}`
          : draft.text,
        assetRefs,
        parentId: draft.parentId,
        sourceRefs: source ? [source] : [],
      };
      update((value) => ({ ...value, pending: payload }));
      const received = await studyRequest<Receipt>("/submissions", payload, {
        headers: { "Idempotency-Key": sentKey },
      });
      localStorage.setItem(receiptKey, JSON.stringify(received));
      // A late ACK clears only its own immutable request, never a newer draft.
      if (load().key === sentKey) localStorage.removeItem(storageKey);
      notify();
      if (!mounted.current) return;
      setReceipt(received);
      setReceiptVerified(true);
      setMessage(
        `Consegnato · ricevuta ${received.receiptId} · tentativo ${received.revision}`,
      );
      if (current.current.key === sentKey) {
        // A local exit-checkpoint observer cannot downgrade a real receipt.
        try { onConfirmed?.(); } catch { /* The authoritative receipt remains confirmed. */ }
        const next = blank();
        next.parentId = null;
        current.current = next;
        setDraft(next);
      }
      try {
        await onUpdate();
      } catch {
        if (mounted.current)
          setMessage(
            `Consegnato · ricevuta ${received.receiptId} · tentativo ${received.revision}. L’elenco non è stato aggiornato; puoi ricaricarlo.`,
          );
      }
    } catch (failure) {
      if (failure instanceof StudyApiError && failure.status === 409 && failure.message === "stale_source") {
        update(value => value.key === sentKey ? { ...value, pending: undefined, key: requestKey() } : value);
        if (mounted.current) setMessage("La fonte è stata aggiornata. Riapri il quaderno o la fonte, collega la versione salvata e consegna di nuovo. La spiegazione è conservata.");
        return;
      }
      if (failure instanceof StudyApiError && ['stale_course_lesson', 'course_lesson_unavailable', 'course_lesson_activity_mismatch', 'course_lesson_parameters_mismatch', 'parent_course_lesson_mismatch', 'invalid_course_lesson'].includes(failure.message)) {
        update(value => value.key === sentKey ? { ...value, pending: undefined, key: requestKey() } : value);
        if (mounted.current) setMessage("La lezione o la fase non corrisponde al tentativo richiesto. Riapri la revisione indicata dalla consegna. La spiegazione è conservata; nessun invio è stato confermato.");
        return;
      }
      if (mounted.current)
        setMessage(
          "Invio non ancora confermato dal servizio. La bozza resta in questa pagina; riprova: la stessa richiesta recupera la ricevuta senza duplicati.",
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="study-submission">
      <h2>{parentId ? "Nuovo tentativo" : "Consegna il tuo tentativo"}</h2>
      <p>
        Testo, PNG/JPEG/WebP, PDF o MP3/M4A/WebM. Immagini: 10 MiB; PDF/audio:
        20 MiB; massimo 5 allegati e 50 MiB complessivi. PDF fino a 20 pagine,
        audio fino a 3 minuti.
      </p>
      <form onSubmit={(event) => void send(event)}>
        <label>
          La tua spiegazione
          <textarea
            aria-label="La tua spiegazione"
            rows={5}
            disabled={busy || Boolean(draft.pending)}
            value={draft.text}
            maxLength={textLimit}
            onChange={(event) =>
              update((value) => ({
                ...value,
                text: event.target.value,
                key: requestKey(),
              }))
            }
          />
        </label>
        <label>
          Aggiungi originale privato
          <input
            type="file"
            disabled={busy || Boolean(draft.pending)}
            multiple
            accept="image/png,image/jpeg,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/webm"
            onChange={(event) => void upload(event.target.files)}
          />
        </label>
        <p>
          {draft.assetRefs.length} allegati privati ·{" "}
          {source
            ? "Fonte contestuale collegata"
            : "Nessuna fonte contestuale selezionata"}
        </p>
        {!!draft.assetRefs.length && <ul aria-label="Originali allegati alla bozza">
          {draft.assetRefs.map((id, index) => <li key={id}>
            Originale {index + 1}{" "}
            <button type="button" disabled={busy || Boolean(draft.pending)}
              aria-label={`Rimuovi allegato ${index + 1} dalla bozza`}
              onClick={() => {
                update(value => ({ ...value, assetRefs: value.assetRefs.filter(asset => asset !== id), key: requestKey() }));
                setMessage("Allegato rimosso dalla bozza. L’originale privato è conservato.");
              }}>Rimuovi dalla bozza</button>
          </li>)}
        </ul>}
        {!activityReady && !draft.pending && (
          <p>
            Prima registra la previsione e confrontala con il modello. Poi
            spiega il procedimento qui.
          </p>
        )}
        {draft.pending && (
          <p>
            Richiesta già inviata: il nuovo invio recupera la stessa ricevuta
            con attività, parametri e spiegazione originali.
          </p>
        )}
        <button
          className="study-primary"
          disabled={
            busy ||
            (!draft.pending && draft.text.length > textLimit) ||
            (!draft.pending && !activityReady) ||
            (requireProcedure
              ? !draft.text.trim()
              : !draft.text.trim() && !draft.assetRefs.length)
          }
        >
          Consegna
        </button>
        <p role="status" data-testid="submission-status">
          {message}
        </p>
        {receipt && (
          <details>
            <summary>Ultima ricevuta di questa edizione</summary>
            <p>
              {message ? "Identificativo riportato sopra" : receipt.receiptId} ·
              tentativo {receipt.revision}
            </p>
            {receipt.courseContext && (
              <p>
                Modello {receipt.courseContext.modelId ?? "non associato"} ·
                parametri registrati:{" "}
                {JSON.stringify(receipt.courseContext.parameters)}
              </p>
            )}
            {receipt.courseContext?.packId && (
              <p className="id-text">
                Pack {receipt.courseContext.packId} · versione{" "}
                {receipt.courseContext.packVersion} · SHA-256{" "}
                {receipt.courseContext.packSha256}
              </p>
            )}
            {receipt.courseContext?.lessonRef && <p>
              Lezione {receipt.courseContext.lessonRef.id} · versione {receipt.courseContext.lessonRef.version} · {receipt.courseContext.phase === 'transfer' ? 'Problema diverso' : 'Pratica'}
            </p>}
            <p>
              {receiptVerified
                ? "Ricezione confermata dal servizio. La verifica del procedimento spetta al tutor."
                : "Riferimento conservato in questo browser. Rileggi le consegne per verificare lo stato del servizio."}
            </p>
          </details>
        )}
      </form>
      <p>
        Originali conservati. OCR e ASR live non eseguiti: il tutor può rivedere
        il file e chiedere chiarimenti.
      </p>
    </section>
  );
}
