import { useEffect, useRef, useState } from "react";
import { studyBlob } from "../../../../studio/src/study/apiClient";
import { requestKey, studyRequest, StudyApiError } from "../../api";
import { ErrorNotice } from "../../components/Feedback";
import { appointmentLabel, download } from "./model";

type CalendarPreview = {
  previewId: string; previewHash: string; sourceVersion: string;
  plan: { editionId: string; provider: string; timezone: string; sessions: { sessionId: string; startUtc: string; endUtc: string }[] };
};

function validPreview(value: CalendarPreview, editionId: string) {
  if (!/^[0-9a-f]{32}$/.test(value.previewId) || !/^[0-9a-f]{64}$/.test(value.previewHash)
    || !/^[0-9a-f]{64}$/.test(value.sourceVersion) || value.plan?.editionId !== editionId
    || value.plan.provider !== "ics" || typeof value.plan.timezone !== "string" || !value.plan.timezone
    || !Array.isArray(value.plan.sessions) || value.plan.sessions.length !== 4) return false;
  try { new Intl.DateTimeFormat("it-IT", { timeZone: value.plan.timezone }); } catch { return false; }
  return new Set(value.plan.sessions.map((item) => item.sessionId)).size === 4 && value.plan.sessions.every((item) =>
    /^[0-9a-f]{32}$/.test(item.sessionId) && Number.isFinite(Date.parse(item.startUtc)) && Date.parse(item.endUtc) > Date.parse(item.startUtc));
}

export function CalendarExport({ editionId, ready }: { editionId: string; ready: boolean }) {
  const [preview, setPreview] = useState<CalendarPreview | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null), pending = useRef(false);
  const keys = useRef({ preview: requestKey(), confirm: requestKey() });
  useEffect(() => () => { controller.current?.abort(); }, []);
  async function run(confirm: boolean) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    const abort = new AbortController(); controller.current = abort;
    try {
      if (!confirm) {
        const value = await studyRequest<CalendarPreview>("/calendar/preview", { editionId, provider: "ics" },
          { signal: abort.signal, headers: { "Idempotency-Key": keys.current.preview } });
        if (abort.signal.aborted) return;
        if (!validPreview(value, editionId)) throw Error("invalid_calendar_response");
        setPreview(value);
      } else if (preview) {
        const result = await studyRequest<{ state: string; provider: string; previewId: string; sourceVersion: string }>("/calendar/confirm", { editionId, previewId: preview.previewId, previewHash: preview.previewHash, sourceVersion: preview.sourceVersion, confirmed: true },
          { signal: abort.signal, headers: { "Idempotency-Key": keys.current.confirm } });
        if (result.state !== "published" || result.provider !== "ics" || result.previewId !== preview.previewId || result.sourceVersion !== preview.sourceVersion) throw Error("invalid_calendar_response");
        const query = new URLSearchParams({ editionId, previewId: preview.previewId });
        const blob = await studyBlob("/calendar/ics?" + query, { signal: abort.signal });
        if (blob.type.split(";")[0] !== "text/calendar") throw Error("invalid_calendar_response");
        if (!abort.signal.aborted) {
          download(blob, "ardesia-incontri.ics"); setPreview(null);
          keys.current = { preview: requestKey(), confirm: requestKey() };
        }
      }
    } catch (failure) {
      if (abort.signal.aborted) return;
      const code = failure instanceof Error ? failure.message : "";
      if (failure instanceof StudyApiError && [401, 403, 404].includes(failure.status)) setPreview(null);
      if (["calendar_preview_stale", "calendar_preview_expired"].includes(code)) {
        setPreview(null); keys.current = { preview: requestKey(), confirm: requestKey() };
        setError("Le date sono cambiate o l’anteprima è scaduta. Prepara nuovamente il calendario.");
      } else setError("Il calendario non è disponibile. Puoi riprovare; nessun invito è stato inviato.");
    } finally { pending.current = false; if (!abort.signal.aborted) setBusy(false); }
  }
  return <div className="tutor-calendar-export">
    <button disabled={!ready || busy} onClick={() => void run(false)}>{busy ? "Preparo il calendario…" : "Prepara calendario .ics"}</button>
    {error && <ErrorNotice message={error} />}
    {preview && <div className="tutor-calendar-preview" role="region" aria-label="Anteprima calendario">
      <h4>Controlla i quattro appuntamenti</h4><p>Fuso: {preview.plan.timezone}. Il file non invia inviti o promemoria.</p>
      <ol>{preview.plan.sessions.map((session) => <li key={session.sessionId}>{appointmentLabel(session.startUtc, preview.plan.timezone)} — {appointmentLabel(session.endUtc, preview.plan.timezone)}</li>)}</ol>
      <button className="button-primary" disabled={busy} onClick={() => void run(true)}>Conferma e scarica .ics</button>{" "}
      <button disabled={busy} onClick={() => { setPreview(null); keys.current = { preview: requestKey(), confirm: requestKey() }; }}>Chiudi anteprima</button>
    </div>}
  </div>;
}
