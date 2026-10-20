import { useState } from "react";
import { ErrorNotice } from "../components/Feedback";
import { attendanceLabels, registerDate, registerPath, sessionDate, type Attendance, type AttendanceCell, type AttendanceRecord, type AttendanceStatus } from "./contracts";
import { useRegisterCommand } from "./useRegisterCommand";
import { RecordHistory, ReceiptNotice } from "./RecordHistory";
import { isAttendanceRecord } from "./validation";

type Draft = {
  studentId: string; sessionId: string; status: AttendanceStatus | ""; reason: string;
  expectedRevision: number; expectedManagementRevision: number; targetRecordId: string | null;
  startUtc: string; timezone: string;
};
const empty: Draft = { studentId: "", sessionId: "", status: "", reason: "", expectedRevision: 0, expectedManagementRevision: 0, targetRecordId: null, startUtc: "", timezone: "UTC" };
export function AttendanceRegister({ data, scope, actor, epoch, refresh }: {
  data: Attendance; scope: string; actor: string; epoch: number; refresh: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const session = data.sessions.find((item) => item.sessionId === selected) ?? data.sessions[0];
  const command = useRegisterCommand({ actor, epoch, editionId: data.editionId, topic: "attendance", initial: empty, onAck: refresh });
  const draft = command.draft;
  function snapshot(cell: AttendanceCell): Draft {
    const sourceSession = data.sessions.find((item) => item.sessionId === cell.sessionId)!;
    return { studentId: cell.studentId, sessionId: cell.record?.sessionId ?? cell.sessionId,
      status: cell.record?.status ?? "", reason: "", expectedRevision: cell.revision,
      expectedManagementRevision: cell.record?.managementRevision ?? data.managementRevision,
      targetRecordId: cell.recordId, startUtc: cell.record?.sessionSnapshot.startUtc ?? sourceSession.startUtc,
      timezone: cell.record?.sessionSnapshot.timezone ?? sourceSession.displayTimezone };
  }
  function begin(cell: AttendanceCell) {
    if (draft.studentId) { setNotice("Salva o annulla la bozza aperta prima di scegliere un’altra dichiarazione."); return; }
    setNotice(""); command.edit(snapshot(cell));
  }
  const current = data.cells.find((cell) => cell.studentId === draft.studentId && (cell.sessionId === draft.sessionId || cell.record?.sessionId === draft.sessionId));
  const sameRevision = current && current.revision === draft.expectedRevision && current.recordId === draft.targetRecordId
    && (current.record?.managementRevision ?? data.managementRevision) === draft.expectedManagementRevision;
  const permitted = current && (draft.targetRecordId ? current.canCorrect : current.canRecord);
  const valid = !!draft.status && (!draft.expectedRevision || !!draft.reason.trim()) && sameRevision && permitted;
  const body = { sessionId: draft.sessionId, studentId: draft.studentId, status: draft.status,
    expectedRevision: draft.expectedRevision, expectedManagementRevision: draft.expectedManagementRevision,
    targetRecordId: draft.targetRecordId, ...(draft.reason ? { reason: draft.reason } : {}) };
  return <section className="register-section" aria-labelledby="register-attendance-title">
    <h3 id="register-attendance-title">Presenze</h3>
    <p>Una dichiarazione manuale per persona e incontro. «Non registrata» non significa assente.</p>
    {!data.calendarReady ? <p className="empty-inline">Prepara le quattro date dell’edizione per aprire il registro presenze.</p> : <>
      <label>Incontro<select value={session?.sessionId ?? ""} onChange={(event) => setSelected(event.target.value)}>
        {data.sessions.map((item) => <option key={item.sessionId} value={item.sessionId}>Incontro {item.ordinal} · {sessionDate(item.startUtc, item.displayTimezone)}</option>)}
      </select></label>
      <p className="fine-print">Orario dell’edizione: {data.timezone}. Le azioni disponibili dipendono dall’ultima lettura del servizio.</p>
      {!data.roster.length && <p>Non ci sono ancora persone iscritte a questa edizione.</p>}
      <ul className="register-roster">{data.roster.map(({ studentId }) => {
        const cell = data.cells.find((item) => item.studentId === studentId && item.sessionId === session.sessionId);
        return <li key={studentId}>
          <div><strong>{studentId}</strong><span>{cell ? attendanceLabels[cell.status] : "Non registrata"}</span>
            {cell?.calendarConflict && <p className="source-warning">Il calendario è cambiato. La dichiarazione conservata riguarda l’incontro originario.</p>}
          </div>
          <div className="register-row-actions">
            {cell && (cell.canRecord || cell.canCorrect) ? <button disabled={command.busy} onClick={() => begin(cell)}>
              {cell.canCorrect ? "Rettifica" : "Registra"} per {studentId}
            </button> : <span className="fine-print">Registrazione non disponibile</span>}
            {cell?.record && <RecordHistory scope={scope} title={`Storia per ${studentId}`}
              path={registerPath(data.editionId) + "/attendance/history?" + new URLSearchParams({ sessionId: cell.record.sessionId, studentId })}
              check={(value): value is AttendanceRecord => isAttendanceRecord(value, data.editionId) && value.studentId === studentId && value.sessionId === cell.record?.sessionId} render={(record) => <>
                <strong>Revisione {record.revision} · {attendanceLabels[record.status]}</strong>
                <p>{sessionDate(record.sessionSnapshot.startUtc, record.sessionSnapshot.timezone)} · {record.sessionSnapshot.timezone}</p>
                <p>{record.reason || "Prima dichiarazione"}</p><small>{record.recordedBy} · {registerDate(record.recordedAt, data.timezone)}</small>
              </>} />}
          </div>
        </li>;
      })}</ul>
    </>}
    {notice && <p role="status">{notice}</p>}
    {draft.studentId && <form className="register-form" aria-label="Dichiarazione di presenza" onSubmit={(event) => {
      event.preventDefault(); if (valid) void command.send(registerPath(data.editionId) + "/attendance", body, { revision: draft.expectedRevision + 1, status: draft.status });
    }}>
      <h4>{draft.targetRecordId ? "Rettifica" : "Dichiarazione"} per {draft.studentId}</h4>
      <p>{sessionDate(draft.startUtc, draft.timezone)} · {draft.timezone} · revisione di partenza {draft.expectedRevision}</p>
      <fieldset disabled={command.busy}><legend>Stato dichiarato manualmente · test</legend>
        <label>Stato di presenza<select required value={draft.status} onChange={(event) => command.edit({ ...draft, status: event.target.value as AttendanceStatus })}>
          <option value="" disabled>Scegli lo stato</option>
          {Object.entries(attendanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>{draft.expectedRevision ? "Motivo della rettifica" : "Nota sulla dichiarazione (facoltativa)"}
          <textarea value={draft.reason} required={draft.expectedRevision > 0} maxLength={1000} onChange={(event) => command.edit({ ...draft, reason: event.target.value })} />
        </label>
      </fieldset>
      {command.error && <ErrorNotice message={command.error} />}
      {(!sameRevision || command.code.startsWith("stale_")) && <div className="register-conflict"><p>La bozza conserva i suoi campi e i riferimenti originari.</p>
        <button type="button" disabled={command.busy} onClick={refresh}>Rileggi il registro presenze</button>
        {current && !sameRevision && (current.canRecord || current.canCorrect) && (!draft.targetRecordId || current.record) && <button type="button" disabled={command.busy} onClick={() => {
          command.edit({ ...snapshot(current), status: draft.status, reason: draft.reason });
        }}>Rivedi la bozza sulla revisione corrente</button>}
      </div>}
      <div className="register-actions"><button className="button-primary" disabled={command.busy || !valid}>{command.busy ? "Invio la dichiarazione…" : "Registra dichiarazione"}</button>
        <button type="button" disabled={command.busy} onClick={() => command.edit(empty)}>Annulla bozza di presenza</button>
      </div>
    </form>}
    {!draft.studentId && <ReceiptNotice ack={command.ack} text="Dichiarazione manuale acquisita" />}
  </section>;
}
