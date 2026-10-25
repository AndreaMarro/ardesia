import { useState } from "react";
import { ErrorNotice } from "../components/Feedback";
import { euro, parseEuro, paymentLabels, registerDate, registerError, registerPath, type Attendance, type PaymentRecord, type Payments } from "./contracts";
import { PageControls, ReceiptNotice, RecordHistory } from "./RecordHistory";
import { useRegisterCommand } from "./useRegisterCommand";
import { PaymentRevisionRefresh } from "./PaymentRevisionRefresh";
import { isPaymentRevisionOf } from "./validation";

type NewDraft = { studentId: string; amount: string; reference: string };
const empty: NewDraft = { studentId: "", amount: "", reference: "" };
type Correction = { entry: PaymentRecord | null; amount: string; status: "RECORDED_MANUALLY" | "VOIDED"; reason: string };
const noCorrection: Correction = { entry: null, amount: "", status: "RECORDED_MANUALLY", reason: "" };
export function ManualPayments({ data, attendance, scope, actor, epoch, refresh, busy, onNext, onBack, canBack }: {
  data: Payments; attendance: Attendance; scope: string; actor: string; epoch: number; refresh: () => void;
  busy: boolean; onNext: () => void; onBack: () => void; canBack: boolean;
}) {
  const editionId = attendance.editionId;
  const [rereadEntry, setRereadEntry] = useState<string | null>(null);
  const create = useRegisterCommand({ actor, epoch, editionId, topic: "new-manual-payment", initial: empty, onAck: refresh });
  const correction = useRegisterCommand({ actor, epoch, editionId, topic: "manual-payment-correction", initial: noCorrection, onAck: refresh });
  const amount = parseEuro(create.draft.amount);
  const current = correction.draft.entry;
  const correctedAmount = parseEuro(correction.draft.amount);
  const candidate = data.items.find((record) => record.entryId === current?.entryId);
  const anchorMismatch = !!current && !!candidate && !isPaymentRevisionOf(candidate, current);
  const latest = anchorMismatch ? undefined : candidate;
  const sameRevision = !anchorMismatch && (!current || !latest || latest.revision < current.revision || latest.recordId === current.recordId);
  function revise(record: PaymentRecord) {
    if (correction.draft.entry) return;
    setRereadEntry(null);
    correction.edit({ entry: record, amount: (record.amountMinor / 100).toFixed(2).replace(".", ","), status: record.status, reason: "" });
  }
  return <section className="register-section" aria-labelledby="register-payments-title">
    <h3 id="register-payments-title">Annotazioni di incasso</h3>
    <p>Registro manuale di test. Ogni annotazione ha autore, data e riferimento; non cambia iscrizioni o accessi.</p>
    <dl className="register-payment-summary">
      <div><dt>Somma delle annotazioni attive</dt><dd>{euro(data.summary.totalMinor)}</dd></div>
      <div><dt>Annotazioni attive</dt><dd>{data.summary.recordedCount}</dd></div>
      <div><dt>Annotazioni annullate</dt><dd>{data.summary.voidedCount}</dd></div>
    </dl>
    <details className="register-new"><summary>Nuova annotazione manuale</summary>
      <form className="register-form" aria-label="Nuova annotazione manuale" onSubmit={(event) => {
        event.preventDefault();
        if (amount !== null && create.draft.studentId && create.draft.reference.trim()) void create.send(registerPath(editionId) + "/manual-payments",
          { studentId: create.draft.studentId, amountMinor: amount, currency: "EUR", externalReference: create.draft.reference },
          { revision: 1, status: "RECORDED_MANUALLY" });
      }}>
        <fieldset disabled={create.busy || !attendance.roster.length}><legend>Dichiarazione dell’operatore · test</legend>
          <label>Partecipante<select required value={create.draft.studentId} onChange={(event) => create.edit({ ...create.draft, studentId: event.target.value })}>
            <option value="" disabled>Scegli una persona iscritta</option>
            {attendance.roster.map(({ studentId }) => <option key={studentId} value={studentId}>{studentId}</option>)}
          </select></label>
          <label>Importo (€)<input required inputMode="decimal" autoComplete="off" value={create.draft.amount}
            onChange={(event) => create.edit({ ...create.draft, amount: event.target.value })} placeholder="49,00" /></label>
          {create.draft.amount && amount === null && <p className="field-error">Usa un importo da 0,01 a 10.000 euro, con al massimo due decimali.</p>}
          <label>Riferimento esterno<input required maxLength={128} autoComplete="off" value={create.draft.reference}
            onChange={(event) => create.edit({ ...create.draft, reference: event.target.value })} /></label>
        </fieldset>
        {!attendance.roster.length && <p>Il registro accetta annotazioni soltanto per persone già iscritte.</p>}
        {create.error && <ErrorNotice message={create.error} />}
        <div className="register-actions"><button className="button-primary" disabled={create.busy || !create.draft.studentId || amount === null || !create.draft.reference.trim()}>
          {create.busy ? "Invio l’annotazione…" : "Registra annotazione manuale"}
        </button><button type="button" disabled={create.busy} onClick={() => create.edit(empty)}>Annulla bozza di incasso</button></div>
      </form>
    </details>
    {!create.draft.studentId && <ReceiptNotice ack={create.ack} text="Annotazione manuale acquisita" />}
    {!data.items.length ? <p className="empty-inline">Non ci sono ancora annotazioni manuali in questa pagina del registro.</p> : <ol className="register-payments">
      {data.items.map((record) => <li key={record.entryId}>
        <div className="register-payment-heading"><div><strong>{record.studentId}</strong><p>{record.externalReference}</p></div>
          <div><strong>{euro(record.amountMinor)}</strong><span>{paymentLabels[record.status]}</span></div>
        </div>
        <p className="fine-print">{record.recordedBy} · {registerDate(record.recordedAt, attendance.timezone)} · revisione {record.revision}</p>
        {record.priceDiscrepancy && <p className="source-warning">Importo diverso dal prezzo indicativo dell’offerta: {euro(record.offerSnapshot.priceMinor)}.</p>}
        <div className="register-row-actions"><button disabled={correction.busy || current !== null} onClick={() => revise(record)}>
          Rettifica annotazione {record.externalReference}
        </button><RecordHistory scope={scope} title={`Storia dell’annotazione ${record.externalReference}`}
          path={registerPath(editionId) + "/manual-payments/" + encodeURIComponent(record.entryId) + "/history"}
          check={(value): value is PaymentRecord => isPaymentRevisionOf(value, record)} render={(revision) => <>
            <strong>Revisione {revision.revision} · {paymentLabels[revision.status]}</strong>
            <p>{euro(revision.amountMinor)}{revision.status === "VOIDED" ? " · valore conservato nella storia, escluso dalla somma attiva" : ""}</p>
            <p>{revision.reason || "Prima annotazione"}</p><small>{revision.recordedBy} · {registerDate(revision.recordedAt, attendance.timezone)}</small>
          </>} /></div>
      </li>)}
    </ol>}
    <PageControls label="Pagine delle annotazioni manuali" next={data.nextCursor} canBack={canBack} busy={busy} onNext={onNext} onBack={onBack} />
    {current && <form className="register-form" aria-label="Rettifica annotazione manuale" onSubmit={(event) => {
      event.preventDefault();
      if (!sameRevision || !correction.draft.reason.trim() || (correction.draft.status === "RECORDED_MANUALLY" && correctedAmount === null)) return;
      void correction.send(registerPath(editionId) + "/manual-payments/" + encodeURIComponent(current.entryId) + "/revisions",
        { expectedRevision: current.revision, targetRecordId: current.recordId, status: correction.draft.status,
          ...(correction.draft.status === "RECORDED_MANUALLY" ? { amountMinor: correctedAmount } : {}), reason: correction.draft.reason },
        { revision: current.revision + 1, status: correction.draft.status, entryId: current.entryId });
    }}>
      <h4>Rettifica per {current.studentId}</h4><p>{current.externalReference} · revisione di partenza {current.revision}</p>
      <fieldset disabled={correction.busy}><legend>Nuova revisione dell’annotazione · test</legend>
        <label>Tipo di rettifica<select value={correction.draft.status} onChange={(event) => correction.edit({ ...correction.draft, status: event.target.value as Correction["status"] })}>
          <option value="RECORDED_MANUALLY">Correggi importo manuale</option><option value="VOIDED">Annulla annotazione</option>
        </select></label>
        {correction.draft.status === "RECORDED_MANUALLY" && <label>Importo rettificato (€)<input required inputMode="decimal" value={correction.draft.amount}
          onChange={(event) => correction.edit({ ...correction.draft, amount: event.target.value })} /></label>}
        <label>Motivo della rettifica di incasso<textarea required maxLength={1000} value={correction.draft.reason}
          onChange={(event) => correction.edit({ ...correction.draft, reason: event.target.value })} /></label>
      </fieldset>
      {correction.error && <ErrorNotice message={correction.error} />}
      {anchorMismatch && <ErrorNotice message={registerError(Error("register_response_invalid")).message} />}
      {(!sameRevision || correction.code.startsWith("stale_")) && <div className="register-conflict"><p>La bozza conserva importo e motivo. Rileggi prima di accettare una revisione diversa.</p>
        <button type="button" disabled={correction.busy} onClick={() => { setRereadEntry(current.entryId); refresh(); }}>Rileggi le annotazioni</button>
        {latest && !sameRevision && <button type="button" disabled={correction.busy} onClick={() => correction.edit({ ...correction.draft, entry: latest })}>
          Rivedi la rettifica sulla revisione corrente
        </button>}
        {!latest && rereadEntry === current.entryId && <PaymentRevisionRefresh scope={scope} anchor={current}
          onAccept={(record) => { if (isPaymentRevisionOf(record, current)) correction.edit({ ...correction.draft, entry: record }); }} />}
      </div>}
      <div className="register-actions"><button className="button-primary" disabled={correction.busy || !sameRevision || !correction.draft.reason.trim() || (correction.draft.status === "RECORDED_MANUALLY" && correctedAmount === null)}>
        {correction.busy ? "Invio la rettifica…" : "Registra rettifica di incasso"}
      </button><button type="button" disabled={correction.busy} onClick={() => correction.edit(noCorrection)}>Annulla bozza di rettifica</button></div>
    </form>}
    {!current && <ReceiptNotice ack={correction.ack} text="Rettifica manuale acquisita" />}
  </section>;
}
