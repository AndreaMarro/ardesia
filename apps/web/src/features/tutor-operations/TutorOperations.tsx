import { useState } from "react";
import { dateLabel, type Edition, type StudyMe } from "../../api";
import { studySessionEpoch } from "../../../../studio/src/study/sessionBoundary";
import { courseTitle } from "../../course";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { euro, registerPath, type Attendance, type Payments } from "../../register/contracts";
import type { AdminEdition } from "../../editionAdmin";
import { isAttendance, isPayments } from "../../register/validation";
import { useRegisterRead } from "../../register/useRegisterRead";
import { agenda, attendanceCsv, download, economics, paymentsCsv } from "./model";
import { CalendarExport } from "./CalendarExport";
import "./tutor-operations.css";

export function TutorOperations({ me, edition, editions }: { me: StudyMe; edition: Edition; editions: Edition[] }) {
  const epoch = studySessionEpoch();
  if (me.role !== "teacher" || me.id !== edition.teacherId) return null;
  return <Operations key={JSON.stringify([me.id, epoch, edition.id, edition.capacity, edition.priceMinor, edition.state, edition.sessions])} me={me} edition={edition} editions={editions} epoch={epoch} />;
}

function Operations({ me, edition, editions, epoch }: { me: StudyMe; edition: Edition; editions: Edition[]; epoch: number }) {
  const [open, setOpen] = useState(false);
  const schedule = agenda(editions, me.id, Date.now());
  return <section className="tutor-operations" aria-label="Gestione operativa tutor">
    <div className="section-title"><div><p className="section-meta">La tua regia</p><h2>Persone, incontri e registri.</h2></div><span className="tutor-mode">Ambiente di test</span></div>
    <div className="tutor-agenda">
      <div><h3>Prossimi appuntamenti</h3><p>{schedule.appointments.length} incontri da terminare · {schedule.hours.toLocaleString("it-IT", { maximumFractionDigits: 1 })} ore residue nelle edizioni caricate.</p>
        {schedule.conflicts.length > 0 && <p role="alert">Ci sono appuntamenti sovrapposti: rileggi le date delle edizioni interessate.</p>}
        {schedule.appointments.length ? <ol>{schedule.appointments.slice(0, 4).map((item) => <li key={`${item.edition.id}:${item.ordinal}`}>
          <strong>{dateLabel(new Date(item.start).toISOString(), item.edition.timezone)}</strong><span>{courseTitle(item.edition)} · incontro {item.ordinal} · {item.edition.timezone}</span>
        </li>)}</ol> : <p>Nessun appuntamento futuro nelle edizioni caricate.</p>}
      </div>
      <div><h3>Edizione corrente</h3><p>{courseTitle(edition)}</p><p>{edition.sessions.length} incontri · {edition.capacity} posti<br />Prezzo indicativo: {euro(edition.priceMinor)} per persona</p><CalendarExport editionId={edition.id} ready={edition.sessions.length === 4 && edition.state !== "cancelled"} /></div>
    </div>
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}><summary>Posti, persone e riepilogo economico</summary>
      {open && <OperationsRead me={me} edition={edition} epoch={epoch} />}
    </details>
  </section>;
}

type Access = { members: string[]; waitlist: string[] };
function isAccess(value: unknown): value is Access {
  if (!value || typeof value !== "object") return false;
  const data = value as Access;
  return Array.isArray(data.members) && data.members.length <= 10 && data.members.every((id) => typeof id === "string")
    && Array.isArray(data.waitlist) && data.waitlist.every((id) => typeof id === "string");
}

function OperationsRead({ me, edition, epoch }: { me: StudyMe; edition: Edition; epoch: number }) {
  const scope = JSON.stringify([me.id, epoch, edition.id]);
  const [paging, setPaging] = useState<{ after: string | null; previous: (string | null)[] }>({ after: null, previous: [] });
  const attendance = useRegisterRead<Attendance>(scope, registerPath(edition.id) + "/attendance", (value): value is Attendance => isAttendance(value, edition.id));
  const query = new URLSearchParams({ limit: "20", ...(paging.after ? { after: paging.after } : {}) });
  const payments = useRegisterRead<Payments>(scope, registerPath(edition.id) + "/manual-payments?" + query, (value): value is Payments => isPayments(value, edition.id));
  const access = useRegisterRead<Access>(scope, "/editions/" + encodeURIComponent(edition.id) + "/access", isAccess);
  const terms = useRegisterRead<AdminEdition>(scope, registerPath(edition.id), (value): value is AdminEdition => {
    if (!value || typeof value !== "object") return false;
    const item = value as AdminEdition;
    return item.id === edition.id && item.teacherId === me.id && Number.isSafeInteger(item.managementRevision)
      && item.managementRevision >= 0 && Number.isSafeInteger(item.capacity) && item.capacity >= 1 && item.capacity <= 10
      && Number.isSafeInteger(item.priceMinor) && item.priceMinor >= 0;
  });
  const busy = attendance.busy || payments.busy || access.busy || terms.busy;
  const error = attendance.error || payments.error || access.error || terms.error;
  const data = attendance.data, money = payments.data, people = access.data;
  const current = !!data && !!terms.data && !!people && data.managementRevision === terms.data.managementRevision
    && data.admission.confirmedCount === people.members.length && data.admission.waitlistedCount === people.waitlist.length;
  const summary = data && money && terms.data ? economics(terms.data, data, money) : null;
  return <div className="tutor-operations-read">
    <div className="tutor-read-bar"><p>La lettura riguarda solo l’edizione selezionata.</p><button disabled={busy} onClick={() => {
      void attendance.refresh(); void access.refresh(); void terms.refresh();
      if (paging.after) setPaging({ after: null, previous: [] }); else void payments.refresh();
    }}>Aggiorna riepilogo</button></div>
    {busy && <Loading>Leggo posti e registri…</Loading>}
    {error && <ErrorNotice message={error} />}
    {!busy && !error && !current && <ErrorNotice message="L’edizione è cambiata durante la lettura. Aggiorna il riepilogo prima di esportare." />}
    {!busy && !error && current && data && money && people && summary && <>
      <dl className="tutor-metrics">
        <div><dt>Posti disponibili</dt><dd>{summary.free}<small>su {terms.data?.capacity}, escluse le riserve attive</small></dd></div>
        <div><dt>Iscritti confermati</dt><dd>{data.admission.confirmedCount}<small>{data.admission.activeHoldCount} riserve attive</small></dd></div>
        <div><dt>Lista d’attesa</dt><dd>{data.admission.waitlistedCount}<small>{data.admission.interestCount} richieste di interesse</small></dd></div>
        <div><dt>Incassi dichiarati</dt><dd>{euro(summary.manualMinor)}<small>annotazioni manuali di test</small></dd></div>
      </dl>
      <div className="tutor-economics"><h3>Previsione e incassi, distinti</h3><p>Valore indicativo degli iscritti: <strong>{euro(summary.forecastMinor)}</strong>. È una previsione basata su iscritti e prezzo dell’edizione.</p><p>Ricavi verificati e somme dovute: <strong>non determinati</strong>. Le annotazioni manuali non attestano pagamenti verificati e non sono fatture fiscali.</p></div>
      <div className="tutor-people"><div><h3>Iscritti ({people.members.length})</h3>{people.members.length ? <ul>{people.members.map((id) => <li key={id}>{id}</li>)}</ul> : <p>Nessun iscritto confermato.</p>}</div><div><h3>In attesa ({people.waitlist.length})</h3>{people.waitlist.length ? <ul>{people.waitlist.map((id) => <li key={id}>{id}</li>)}</ul> : <p>Nessuna persona in attesa.</p>}<p className="fine-print">L’elenco non rappresenta un ordine di priorità o un’ammissione automatica.</p></div></div>
      <div className="tutor-export"><h3>Esporta i registri</h3><p>I file contengono dati dell’edizione selezionata. Presenze e annotazioni di incasso restano due registri distinti.</p>
        <button onClick={() => download(new Blob([attendanceCsv(data)], { type: "text/csv;charset=utf-8" }), "ardesia-presenze-test.csv")}>Esporta presenze CSV</button>{" "}
        <button onClick={() => download(new Blob([paymentsCsv(edition.id, money)], { type: "text/csv;charset=utf-8" }), "ardesia-incassi-pagina-test.csv")}>Esporta pagina incassi CSV</button>
        <p className="fine-print">Incassi: pagina {paging.previous.length + 1}, {money.items.length} annotazioni. Il totale dichiarato include tutte le pagine.</p>
        <button disabled={!paging.previous.length} onClick={() => setPaging({ after: paging.previous.at(-1) ?? null, previous: paging.previous.slice(0, -1) })}>Pagina precedente incassi</button>{" "}
        <button disabled={!money.nextCursor} onClick={() => { if (money.nextCursor) setPaging({ after: money.nextCursor, previous: [...paging.previous, paging.after] }); }}>Pagina successiva incassi</button>
      </div>
    </>}
  </div>;
}
