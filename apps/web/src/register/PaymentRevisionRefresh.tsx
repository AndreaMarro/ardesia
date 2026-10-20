import { ErrorNotice, Loading } from "../components/Feedback";
import { paymentLabels, registerPath, type PaymentRecord } from "./contracts";
import { isPage, isPaymentRevisionOf } from "./validation";
import { useRegisterRead } from "./useRegisterRead";

/** Re-read one exact entry when its latest record is outside the visible page. */
export function PaymentRevisionRefresh({ scope, anchor, onAccept }: {
  scope: string; anchor: PaymentRecord; onAccept: (record: PaymentRecord) => void;
}) {
  const result = useRegisterRead(scope, registerPath(anchor.editionId) + "/manual-payments/" + encodeURIComponent(anchor.entryId) + "/history?limit=20",
    (value) => isPage(value, (item): item is PaymentRecord => isPaymentRevisionOf(item, anchor)));
  const candidate = result.data?.items[0];
  const latest = !result.error && candidate && isPaymentRevisionOf(candidate, anchor) ? candidate : null;
  return <div>
    {result.busy && <Loading>Rileggo l’annotazione scelta…</Loading>}
    {result.error && <ErrorNotice message={result.error} onRetry={() => void result.refresh()} />}
    {latest && <><p>Revisione riletta: {latest.revision} · {paymentLabels[latest.status]}. Importo e motivo della bozza restano da verificare.</p>
      <button type="button" disabled={result.busy} onClick={() => onAccept(latest)}>Rivedi la rettifica sulla revisione corrente</button>
    </>}
    {result.data && !latest && !result.error && <p>L’annotazione non è disponibile nella risposta del servizio.</p>}
  </div>;
}
