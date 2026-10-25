import { useState } from "react";
import { courseTitle } from "../course";
import type { Edition, StudyMe } from "../api";
import { ErrorNotice, Loading } from "../components/Feedback";
import { countLabel, registerDate, registerPath } from "./contracts";
import { isAttendance, isPayments } from "./validation";
import { useRegisterRead } from "./useRegisterRead";
import { AttendanceRegister } from "./AttendanceRegister";
import { ManualPayments } from "./ManualPayments";

export default function RegisterContent({ me, edition, epoch, scope }: { me: StudyMe; edition: Edition; epoch: number; scope: string }) {
  const [paging, setPaging] = useState<{ after: string | null; previous: (string | null)[] }>({ after: null, previous: [] });
  const attendance = useRegisterRead(scope, registerPath(edition.id) + "/attendance", (value) => isAttendance(value, edition.id));
  const paymentQuery = new URLSearchParams({ limit: "20", ...(paging.after ? { after: paging.after } : {}) });
  const payments = useRegisterRead(scope, registerPath(edition.id) + "/manual-payments?" + paymentQuery, (value) => isPayments(value, edition.id));
  function refreshPayments() {
    if (paging.after) setPaging({ after: null, previous: [] });
    else void payments.refresh();
  }
  const data = attendance.data;
  return <div className="register-content">
    <header className="register-heading"><div><h2>Registro dell’edizione</h2><p className="section-meta">{courseTitle(edition)}</p><p>Presenze e annotazioni di incasso, tenute distinte.</p></div><span>Manuale · test</span></header>
    {(attendance.busy || payments.busy) && <Loading>Leggo il registro dell’edizione…</Loading>}
    {attendance.error && <ErrorNotice message={attendance.error} onRetry={() => void attendance.refresh()} />}
    {payments.error && <ErrorNotice message={payments.error} onRetry={() => void payments.refresh()} />}
    {data && <>
      <dl className="register-lanes">
        <div><dt>Interesse</dt><dd>{countLabel(data.admission.interestCount, "richiesta", "richieste")}</dd></div>
        <div><dt>Riserva e iscrizione</dt><dd>{countLabel(data.admission.confirmedCount, "iscritto", "iscritti")}</dd><dd>{countLabel(data.admission.activeHoldCount, "riserva", "riserve")} · {data.admission.waitlistedCount} in attesa</dd></div>
        <div><dt>Incassi manuali</dt><dd>{payments.data ? countLabel(payments.data.summary.recordedCount, "annotazione attiva", "annotazioni attive") : "Riepilogo non disponibile"}</dd></div>
        <div><dt>Presenze dichiarate</dt><dd>{countLabel(data.cells.filter((cell) => cell.status === "PRESENT" && !cell.calendarConflict).length, "presente", "presenti")} · {countLabel(data.cells.filter((cell) => cell.status === "ABSENT" && !cell.calendarConflict).length, "assente", "assenti")}</dd><dd>per persona e incontro</dd></div>
      </dl>
      <div className="register-read-bar"><p className="register-read-time">Ultima lettura delle presenze: {registerDate(data.serverTime, data.timezone)} · {data.timezone}</p>
        <button disabled={attendance.busy} onClick={() => void attendance.refresh()}>Rileggi le presenze</button></div>
      <AttendanceRegister data={data} scope={scope} actor={me.id} epoch={epoch} refresh={() => void attendance.refresh()} />
      {payments.data && <ManualPayments data={payments.data} attendance={data} scope={scope} actor={me.id} epoch={epoch}
        refresh={refreshPayments} busy={payments.busy} canBack={paging.previous.length > 0}
        onNext={() => { if (payments.data?.nextCursor) setPaging({ after: payments.data.nextCursor, previous: [...paging.previous, paging.after] }); }}
        onBack={() => setPaging({ after: paging.previous.at(-1) ?? null, previous: paging.previous.slice(0, -1) })} />}
    </>}
  </div>;
}
