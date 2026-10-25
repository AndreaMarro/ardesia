import { useState, type ReactNode } from "react";
import { ErrorNotice, Loading } from "../components/Feedback";
import { useRegisterRead } from "./useRegisterRead";
import { isPage } from "./validation";
import type { RegisterAck } from "./contracts";

export function PageControls({ next, canBack, onNext, onBack, busy, label }: {
  next: string | null; canBack: boolean; onNext: () => void; onBack: () => void; busy: boolean; label: string;
}) {
  return <nav className="register-pagination" aria-label={label}>
    <button disabled={busy || !canBack} onClick={onBack}>Pagina precedente</button>
    <button disabled={busy || !next} onClick={onNext}>Pagina successiva</button>
  </nav>;
}
export function RecordHistory<T>({ scope, path, title, check, render }: {
  scope: string; path: string; title: string; check: (value: unknown) => value is T; render: (item: T) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return <details className="register-history" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{title}</summary>
    {open && <HistoryPage key={path} scope={scope} path={path} check={check} render={render} />}
  </details>;
}
function HistoryPage<T>({ scope, path, check, render }: Omit<Parameters<typeof RecordHistory<T>>[0], "title">) {
  const [paging, setPaging] = useState<{ after: string | null; previous: (string | null)[] }>({ after: null, previous: [] });
  const separator = path.includes("?") ? "&" : "?";
  const query = new URLSearchParams({ limit: "20", ...(paging.after ? { after: paging.after } : {}) });
  const result = useRegisterRead(scope, path + separator + query, (value) => isPage(value, check));
  return <div>
    {result.error && <ErrorNotice message={result.error} onRetry={() => void result.refresh()} />}
    {result.busy && <Loading>Leggo le revisioni…</Loading>}
    {result.data && <><ol>{result.data.items.map((item, index) => <li key={index}>{render(item)}</li>)}</ol>
      {!result.data.items.length && <p>Non ci sono dichiarazioni precedenti per questa selezione.</p>}
      <PageControls label="Pagine delle revisioni" busy={result.busy} canBack={paging.previous.length > 0} next={result.data.nextCursor}
        onNext={() => { if (result.data?.nextCursor) setPaging({ after: result.data.nextCursor, previous: [...paging.previous, paging.after] }); }}
        onBack={() => setPaging({ after: paging.previous.at(-1) ?? null, previous: paging.previous.slice(0, -1) })} />
    </>}
  </div>;
}
export function ReceiptNotice({ ack, text }: { ack?: RegisterAck; text: string }) {
  return ack ? <div className="register-ack" role="status"><p>{text} · revisione {ack.revision} · test</p>
    <details><summary>Dettagli della ricevuta</summary><p className="id-text">{ack.receiptId}</p></details>
  </div> : null;
}
