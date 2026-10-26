import { useRef, useState } from "react";
import {
  describeError,
  requestKey,
  studyRequest,
  type StudyMe,
  type Workspace,
  type StudyResource,
} from "../../api";
import { studySessionTicket } from "../../../../studio/src/study/sessionBoundary";
import { uploadOriginal } from "../../../../studio/src/study/uploadOriginal";
import { LivingSourceReader } from "./LivingSourceReader";
import { preparePortableImport } from "./portableImport";
import { readLivingRoute, livingSourceLink } from "./lessonBridge";
import {
  reference,
  type LivingSource,
  type AnnotationResource,
  type LivingAnnotation,
} from "./model";
export function LivingSources({
  me,
  data,
  onUpdate,
  onUse,
  lesson,
}: {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
  onUse?: (r: ReturnType<typeof reference>) => void;
  lesson?: LivingAnnotation["lesson"];
}) {
  const [route] = useState(() => readLivingRoute(location.search));
  const [selected, setSelected] = useState<Pick<
      StudyResource,
      "id" | "revisionId" | "contextId" | "kind"
    > | null>(() =>
      route
        ? {
            id: route.ref.resourceId,
            revisionId: route.ref.revisionId,
            contextId: route.ref.contextId ?? "",
            kind: route.kind,
          }
        : null,
    ),
    [extra, setExtra] = useState<StudyResource[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const entries = new Map(
    [...data.resources, ...extra]
      .filter(
        (r) => r.kind === "living-source" || r.kind === "living-annotation",
      )
      .map((r) => [r.id, r]),
  );
  async function upload(file?: File) {
    if (!file || pending.current) return;
    const ticket = studySessionTicket();
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (file.type !== "application/pdf") throw Error("pdf_required");
      const asset = await uploadOriginal(file, data.edition.id);
      ticket.signal.throwIfAborted();
      const r = await studyRequest<LivingSource>(
        "/living-sources",
        {
          editionId: data.edition.id,
          visibility: me.role === "teacher" ? "group" : "private",
          document: {
            assetId: asset.id,
            sha256: Array.from(
              new Uint8Array(
                await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
              ),
              (b) => b.toString(16).padStart(2, "0"),
            ).join(""),
            title: file.name,
            version: "1",
          },
        },
        { headers: { "Idempotency-Key": "living-source:" + asset.id } },
      );
      ticket.signal.throwIfAborted();
      setSelected(r);
      setExtra((v) => [...v, r]);
      await onUpdate();
    } catch (e) {
      setError(
        describeError(
          e,
          "Apertura non riuscita. Usa un PDF fino a 20 pagine e 20 MiB; riseleziona il file per riprovare.",
        ),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function importFile(file?: File) {
    if (!file || pending.current) return;
    const ticket = studySessionTicket();
    pending.current = true;
    setBusy(true);
    try {
      if (file.size > 30 * 1024 * 1024) throw Error("bundle_too_large");
      const raw = JSON.parse(await file.text());
      ticket.signal.throwIfAborted();
      const bundle = await preparePortableImport(
        raw,
        data.edition.id,
        ticket.signal,
      );
      const r = await studyRequest<AnnotationResource>(
        "/living-sources/import",
        { editionId: data.edition.id, bundle },
        { headers: { "Idempotency-Key": requestKey() } },
      );
      ticket.signal.throwIfAborted();
      setExtra((v) => [...v, r]);
      setSelected(r);
      await onUpdate();
    } catch (e) {
      setError(
        describeError(
          e,
          "Importazione non riuscita. Il file non concede accesso alle identità originali.",
        ),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="ls-collection">
      <header className="ls-heading">
        <div>
          <h2>Fonti da esplorare</h2>
          <p>Originale, passaggio e ragionamento restano collegati.</p>
        </div>
        <label>
          Apri un PDF
          <input
            type="file"
            aria-label="Apri un PDF scientifico"
            accept="application/pdf"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void upload(f);
            }}
          />
        </label>
        <label>
          Importa fonte e annotazione
          <input
            type="file"
            aria-label="Importa fonte e annotazione"
            accept="application/json"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void importFile(f);
            }}
          />
        </label>
      </header>
      <nav className="ls-library" aria-label="Fonti vive e annotazioni">
        {[...entries.values()].map((r) => (
          <button
            key={r.id}
            aria-pressed={r.id === selected?.id}
            onClick={() => setSelected(r)}
          >
            {r.kind === "living-source"
              ? sourceTitle(r.text)
              : annotationTitle(r.text)}
            <small>{r.visibility === "group" ? "Gruppo" : "Privata"}</small>
          </button>
        ))}
      </nav>
      {selected && (
        <a
          href={livingSourceLink(
            { resourceId: selected.id, revisionId: selected.revisionId },
            selected.kind as "living-source" | "living-annotation",
            data.edition.id,
            route?.lesson ?? lesson,
          )}
        >
          Collegamento esatto per la lezione
        </a>
      )}
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Apertura e verifica in corso…</p>}
      {selected && (
        <LivingSourceReader
          reference={{
            resourceId: selected.id,
            revisionId: selected.revisionId,
            ...(selected.contextId ? { contextId: selected.contextId } : {}),
          }}
          kind={selected.kind as "living-source" | "living-annotation"}
          me={me}
          lesson={route?.lesson ?? lesson}
          onUse={onUse}
          onSaved={(r) => {
            setSelected(r);
            setExtra((v) => [...v.filter((x) => x.id !== r.id), r]);
            void onUpdate().catch(() => {});
          }}
        />
      )}
    </section>
  );
}

function sourceTitle(text: string): string {
  try {
    const v = JSON.parse(text);
    return typeof v?.title === "string"
      ? v.title.slice(0, 200)
      : "Fonte da verificare";
  } catch {
    return "Fonte da verificare";
  }
}

function annotationTitle(text: string): string {
  try {
    const v = JSON.parse(text);
    const b = v.blocks?.find(
      (x: { kind?: string }) => x.kind === "explanation",
    );
    return typeof b?.text === "string" ? b.text.slice(0, 65) : "Annotazione";
  } catch {
    return "Annotazione da verificare";
  }
}
