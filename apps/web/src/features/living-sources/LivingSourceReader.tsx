import { useEffect, useRef, useState } from "react";
import {
  describeError,
  requestKey,
  studyRequest,
  type PostitReference,
  type StudyMe,
} from "../../api";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { uploadOriginal } from "../../../../studio/src/study/uploadOriginal";
import { NotebookEditor } from "../../integrations/notebook/NotebookEditor";
import {
  notebookResource,
  type NotebookResource,
} from "../../integrations/notebook/model";
import { FormulaField } from "../../integrations/notebook/FormulaField";
import { FormulaPreview } from "../../integrations/notebook/FormulaPreview";
import { loadSource, loadAnnotation, saveAnnotation, sourcePath } from "./api";
import { PdfSurface } from "./PdfSurface";
import {
  reference,
  type LivingReference,
  type LivingSource,
  type SourceTarget,
  type LivingAnnotation,
  type AnnotationResource,
  type Block,
} from "./model";
import { notebookCopyState } from "./notebookBridge";
import "./living-sources.css";
export type LivingReaderProps = {
  reference: LivingReference;
  kind: "living-source" | "living-annotation";
  me: StudyMe;
  lesson?: LivingAnnotation["lesson"];
  onSaved?: (r: AnnotationResource) => void;
  onUse?: (r: PostitReference) => void;
};
export function LivingSourceReader(props: LivingReaderProps) {
  return (
    <Reader
      key={JSON.stringify([props.me.id, props.kind, props.reference])}
      {...props}
    />
  );
}
function Reader({
  reference: requested,
  kind,
  me,
  lesson,
  onSaved,
  onUse,
}: LivingReaderProps) {
  const [loaded, setLoaded] = useState<{
      source: LivingSource;
      blob: Blob;
      originalUrl: string;
    } | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [annotation, setAnnotation] = useState<
      AnnotationResource | undefined
    >(),
    [target, setTarget] = useState<SourceTarget>(),
    [blocks, setBlocks] = useState<Block[]>([]);
  const [lessonContext, setLessonContext] = useState<
    LivingAnnotation["lesson"]
  >(lesson ?? null);
  const lifetime = useRef<AbortSignal | null>(null);
  const [visibility, setVisibility] = useState<"private" | "group">("private"),
    [resume, setResume] = useState<LivingAnnotation["resume"]>(),
    [origin, setOrigin] = useState<PostitReference>();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [notebook, setNotebook] = useState<NotebookResource | null>(null);
  const pending = useRef<{ fingerprint: string; key: string } | undefined>(
      undefined,
    ),
    active = useRef(true),
    generation = useRef(0),
    busyRef = useRef(false);
  const blocksRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    active.current = true;
    const ticket = studySessionTicket(),
      ac = new AbortController();
    lifetime.current = ac.signal;
    const run = ++generation.current;
    let originalUrl = "";
    let interval: ReturnType<typeof setInterval> | undefined;
    setLoaded(null);
    setError("");
    setNotebook(null);
    setBusy(false);
    busyRef.current = false;
    setLessonContext(lesson ?? null);
    setAnnotation(undefined);
    setTarget(undefined);
    setBlocks([]);
    setResume(undefined);
    setOrigin(undefined);
    setMessage("");
    const valid = () =>
      active.current &&
      !ac.signal.aborted &&
      !ticket.signal.aborted &&
      run === generation.current;
    const fail = (e: unknown) => {
      if (!valid()) return;
      {
        setLoaded(null);
        setNotebook(null);
        setTarget(undefined);
        setBlocks([]);
        setError(
          describeError(
            e,
            "Questa revisione o il suo originale non sono disponibili. Nessuna versione diversa viene aperta.",
          ),
        );
      }
      active.current = false;
      generation.current++;
      ac.abort();
      clearInterval(interval);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
    const revoked = () => {
      if (run !== generation.current) return;
      {
        setLoaded(null);
        setNotebook(null);
        setTarget(undefined);
        setBlocks([]);
        setError("La sessione è cambiata. Riapri la fonte dal tuo spazio.");
      }
      active.current = false;
      generation.current++;
      ac.abort();
      clearInterval(interval);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
    ticket.signal.addEventListener("abort", revoked, { once: true });
    void (async () => {
      const note =
        kind === "living-annotation"
          ? await loadAnnotation(requested, ac.signal)
          : undefined;
      const ref = note?.annotation.target ?? requested;
      const value = await loadSource(ref, ac.signal);
      if (!valid()) return;
      originalUrl = URL.createObjectURL(value.blob);
      setLoaded({ ...value, originalUrl });
      if (note) {
        setAnnotation(note);
        setTarget(note.annotation.target);
        setBlocks(note.annotation.blocks);
        setVisibility(note.visibility);
        setResume(note.annotation.resume);
        setOrigin(note.annotation.origin);
        setLessonContext(note.annotation.lesson ?? lesson ?? null);
      }
      const check = () => {
        if (!valid() || document.visibilityState === "hidden") return;
        const timeout = new AbortController();
        const timer = setTimeout(() => timeout.abort(), 5000);
        ac.signal.addEventListener("abort", () => timeout.abort(), {
          once: true,
        });
        void Promise.all([
          studyRequest(sourcePath(ref), undefined, { signal: timeout.signal }),
          ...(note ? [loadAnnotation(requested, timeout.signal)] : []),
        ])
          .catch(fail)
          .finally(() => clearTimeout(timer));
      };
      interval = setInterval(check, 15000);
      window.addEventListener("focus", check);
      document.addEventListener("visibilitychange", check);
      ac.signal.addEventListener(
        "abort",
        () => {
          window.removeEventListener("focus", check);
          document.removeEventListener("visibilitychange", check);
        },
        { once: true },
      );
    })().catch(fail);
    return () => {
      active.current = false;
      ac.abort();
      clearInterval(interval);
      ticket.signal.removeEventListener("abort", revoked);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [
    requested.resourceId,
    requested.revisionId,
    requested.contextId,
    kind,
    attempt,
  ]);
  function choose(t: SourceTarget) {
    if (busyRef.current) return;
    setTarget(t);
    setResume(undefined);
    setMessage(
      "Selezione collegata alla pagina " +
        t.page +
        ". Aggiungi una spiegazione.",
    );
    if (!blocks.length) setBlocks([{ kind: "explanation", text: "" }]);
    setTimeout(() => blocksRef.current?.focus(), 0);
  }
  const editable = !annotation || annotation.ownerId === me.id;
  async function save() {
    if (
      !loaded ||
      !target ||
      busyRef.current ||
      !editable ||
      !blocks.length ||
      blocks.some((b) => !b.text.trim())
    )
      return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    const run = generation.current;
    const value: LivingAnnotation = {
      target,
      blocks,
      lesson: lessonContext ?? null,
      ...(resume ? { resume } : {}),
      ...(origin ? { origin } : {}),
    };
    const fingerprint = JSON.stringify(value);
    if (pending.current?.fingerprint !== fingerprint)
      pending.current = { fingerprint, key: requestKey() };
    try {
      // A mutation never relies solely on a previously authorized render.
      await studyRequest(sourcePath(target), undefined, {
        signal: lifetime.current,
      });
      const saved = await saveAnnotation(
        loaded.source.editionId,
        value,
        visibility,
        pending.current.key,
        annotation,
        lifetime.current ?? undefined,
      );
      if (!active.current || generation.current !== run) return;
      pending.current = undefined;
      setAnnotation(saved);
      setMessage(
        "Annotazione salvata in Core · revisione " +
          saved.revisionId.slice(0, 8),
      );
      onSaved?.(saved);
    } catch (e) {
      if (active.current && generation.current === run)
        setError(
          describeError(
            e,
            "Salvataggio non confermato. La bozza resta aperta; riprova la stessa richiesta.",
          ),
        );
    } finally {
      if (generation.current === run) {
        busyRef.current = false;
        if (active.current) setBusy(false);
      }
    }
  }
  async function openNotebook() {
    if (!loaded || !target || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const run = generation.current;
    try {
      const fresh = await loadSource(
        reference(loaded.source),
        lifetime.current!,
      );
      const asset = await uploadOriginal(
        new File([fresh.blob], "fonte-originale.pdf", {
          type: "application/pdf",
        }),
        loaded.source.editionId,
      );
      lifetime.current!.throwIfAborted();
      const state = notebookCopyState(
        loaded.source,
        target,
        blocks,
        annotation ? reference(annotation) : origin,
      );
      const intentHash = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(
              JSON.stringify({
                state,
                sourceRevision: loaded.source.revisionId,
              }),
            ),
          ),
        ),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      lifetime.current!.throwIfAborted();
      const created = notebookResource(
        await studyRequest(
          "/scientific-notebooks",
          {
            editionId: loaded.source.editionId,
            assetId: asset.id,
            assetSha256: loaded.source.document.sha256,
            state,
          },
          {
            headers: { "Idempotency-Key": `living-notebook:${intentHash}` },
            signal: lifetime.current,
          },
        ),
      );
      const current = notebookResource(
        await studyRequest(
          `/resources/${encodeURIComponent(created.id)}`,
          undefined,
          { signal: lifetime.current },
        ),
      );
      if (active.current && run === generation.current) {
        setNotebook(current);
        setMessage("Quaderno personale aperto dalla regione citata.");
      }
    } catch (e) {
      if (active.current && run === generation.current)
        setError(
          describeError(
            e,
            "Il quaderno non è disponibile. Il riferimento alla fonte è conservato.",
          ),
        );
    } finally {
      if (generation.current === run) {
        busyRef.current = false;
        if (active.current) setBusy(false);
      }
    }
  }
  async function exportNote() {
    if (
      !annotation ||
      busyRef.current ||
      !active.current ||
      lifetime.current?.aborted
    )
      return;
    const run = generation.current;
    try {
      const bundle = await studyRequest(
        `/living-annotations/${annotation.id}/revisions/${annotation.revisionId}/export`,
        undefined,
        { signal: lifetime.current },
      );
      if (
        !active.current ||
        run !== generation.current ||
        lifetime.current?.aborted
      )
        return;
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(bundle)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "fonte-con-annotazione.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      if (active.current && run === generation.current)
        setError(describeError(e));
    }
  }
  if (!loaded)
    return (
      <section className="ls-unavailable" aria-live="polite">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button onClick={() => setAttempt((n) => n + 1)}>
              Riprova apertura esatta
            </button>
          </>
        ) : (
          <p>Verifica della revisione e dell’originale…</p>
        )}
      </section>
    );
  return (
    <section className="living-sources" aria-label="Fonte scientifica viva">
      <header className="ls-heading">
        <div>
          <h2>{loaded.source.document.title}</h2>
          <p>
            Versione {loaded.source.document.version} · revisione{" "}
            {loaded.source.revisionId.slice(0, 8)} ·{" "}
            {loaded.source.visibility === "group"
              ? "Condivisa con il gruppo"
              : "Privata"}
          </p>
        </div>
        <a href={loaded.originalUrl} download="originale.pdf">
          Scarica l’originale
        </a>
      </header>
      <div className="ls-workspace">
        <PdfSurface
          source={loaded.source}
          blob={loaded.blob}
          target={target}
          resume={resume}
          onSelect={choose}
          onResume={(r) => {
            setResume(r);
            setMessage(
              "Vista conservata nella bozza. Salva l’annotazione per riprenderla dopo il riavvio.",
            );
          }}
        />
        <aside className="ls-notes" aria-label="Annotazione strutturata">
          <h3>
            {editable ? "Spiega il passaggio" : "Annotazione della lezione"}
          </h3>
          {!target ? (
            <p>
              Seleziona testo nativo o una regione della pagina per iniziare.
            </p>
          ) : (
            <>
              <p>
                Pagina {target.page} · {target.rects.length} regioni
              </p>
              {target.text && <blockquote>{target.text.exact}</blockquote>}
              <details>
                <summary>Coordinate della regione</summary>
                {target.rects.map((r, i) => (
                  <fieldset key={i}>
                    <legend>Regione {i + 1}, coordinate da 0 a 1</legend>
                    {(["x", "y", "larghezza", "altezza"] as const).map(
                      (label, j) => (
                        <label key={j}>
                          {label}
                          <input
                            type="number"
                            aria-label={`${label} regione ${i + 1}`}
                            min="0"
                            max="1"
                            step="0.01"
                            value={r[j]}
                            disabled={!editable || busy}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              if (Number.isFinite(n) && n >= 0 && n <= 1) {
                                const rects = target.rects.map((v, k) =>
                                  k === i
                                    ? (v.map((x, l) =>
                                        l === j ? n : x,
                                      ) as typeof r)
                                    : v,
                                );
                                setTarget({ ...target, rects });
                              }
                            }}
                          />
                        </label>
                      ),
                    )}
                  </fieldset>
                ))}
              </details>
              {blocks.map((b, i) => (
                <div className="ls-block" key={i}>
                  {editable ? (
                    <>
                      <label>
                        Tipo di blocco
                        <select
                          aria-label={`Tipo blocco ${i + 1}`}
                          value={b.kind}
                          disabled={busy}
                          onChange={(e) =>
                            setBlocks(
                              blocks.map((x, k) =>
                                k === i
                                  ? {
                                      ...x,
                                      kind: e.target.value as Block["kind"],
                                    }
                                  : x,
                              ),
                            )
                          }
                        >
                          <option value="explanation">Spiegazione</option>
                          <option value="formula">Formula</option>
                          <option value="exercise">Esercizio</option>
                        </select>
                      </label>
                      {b.kind === "formula" ? (
                        <FormulaField
                          value={b.text}
                          disabled={busy}
                          onChange={(value) =>
                            setBlocks(
                              blocks.map((x, k) =>
                                k === i ? { ...x, text: value } : x,
                              ),
                            )
                          }
                        />
                      ) : (
                        <textarea
                          ref={i === 0 ? blocksRef : undefined}
                          aria-label={`Contenuto blocco ${i + 1}`}
                          rows={5}
                          maxLength={5000}
                          value={b.text}
                          disabled={busy}
                          onChange={(e) =>
                            setBlocks(
                              blocks.map((x, k) =>
                                k === i ? { ...x, text: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      )}
                    </>
                  ) : b.kind === "formula" ? (
                    <FormulaPreview value={b.text} />
                  ) : (
                    <p>{b.text}</p>
                  )}
                </div>
              ))}
              {editable && (
                <>
                  <button
                    disabled={busy || blocks.length >= 30}
                    onClick={() =>
                      setBlocks([...blocks, { kind: "explanation", text: "" }])
                    }
                  >
                    Aggiungi blocco
                  </button>
                  {me.role === "teacher" &&
                    loaded.source.visibility === "group" &&
                    !annotation && (
                      <label>
                        Visibilità
                        <select
                          aria-label="Visibilità annotazione"
                          value={visibility}
                          onChange={(e) =>
                            setVisibility(e.target.value as typeof visibility)
                          }
                        >
                          <option value="private">Privata</option>
                          <option value="group">Condivisa con il gruppo</option>
                        </select>
                      </label>
                    )}
                  <button
                    className="button-primary"
                    disabled={
                      busy ||
                      !blocks.length ||
                      blocks.some((b) => !b.text.trim())
                    }
                    onClick={() => void save()}
                  >
                    {busy ? "Salvataggio…" : "Salva annotazione"}
                  </button>
                </>
              )}
              {!editable && (
                <button
                  onClick={() => {
                    setOrigin(reference(annotation!));
                    setAnnotation(undefined);
                    setVisibility("private");
                    setBlocks([{ kind: "explanation", text: "" }]);
                    setResume(undefined);
                  }}
                >
                  Scrivi una nota personale
                </button>
              )}
              <button disabled={busy} onClick={() => void openNotebook()}>
                Apri nel mio quaderno scientifico
              </button>
              {annotation && (
                <>
                  <button onClick={() => void exportNote()}>
                    Esporta fonte e annotazione
                  </button>
                  {onUse && (
                    <button onClick={() => onUse(reference(annotation))}>
                      Usa nell’attività
                    </button>
                  )}
                  <p className="fine-print">
                    {annotation.annotation.lesson
                      ? `Lezione ${annotation.annotation.lesson.lessonId} · attività ${annotation.annotation.lesson.activityId}`
                      : "Annotazione senza attività associata."}
                  </p>
                </>
              )}
            </>
          )}
          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
          <details>
            <summary>Fonte e provenienza esatta</summary>
            <dl>
              <dt>Risorsa</dt>
              <dd>{loaded.source.id}</dd>
              <dt>Revisione</dt>
              <dd>{loaded.source.revisionId}</dd>
              <dt>SHA-256 del PDF</dt>
              <dd>{loaded.source.document.sha256}</dd>
              <dt>Coordinate</dt>
              <dd>{loaded.source.document.coordinates}</dd>
            </dl>
          </details>
        </aside>
      </div>
      {notebook && (
        <section className="ls-notebook">
          <h3>Il mio quaderno scientifico</h3>
          <NotebookEditor
            resource={notebook}
            actor={me.id}
            onSaved={setNotebook}
            onUse={onUse}
          />
        </section>
      )}
    </section>
  );
}
