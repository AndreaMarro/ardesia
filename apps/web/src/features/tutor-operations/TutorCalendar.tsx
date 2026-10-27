import { useId, useMemo, useState } from "react";
import FullCalendar, { useCalendarController, type EventClickInfo } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import listPlugin from "@fullcalendar/react/list";
import themePlugin from "@fullcalendar/react/themes/classic";
import italian from "@fullcalendar/react/locales/it";
import type { Edition } from "../../api";
import { courseTitle } from "../../course";
import { agenda, appointmentLabel, type Appointment } from "./model";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "./tutor-calendar.css";
import licenses from "./calendar-LICENSES.txt?raw";

const plugins = [themePlugin, dayGridPlugin, timeGridPlugin, listPlugin];
const eventId = (item: Appointment) => JSON.stringify([item.edition.id, item.ordinal]);
const views = [["dayGridMonth", "Mese"], ["timeGridWeek", "Settimana"], ["timeGridDay", "Giorno"], ["listWeek", "Lista"]];
function startingDate(items: Appointment[]) {
  const next = items.find((item) => item.end > Date.now()) ?? items.at(-1);
  return next ? new Date(next.start).toISOString() : undefined;
}

/** A read-only projection: calendar state never changes Core dates or attendance. */
export default function TutorCalendar({ editions, tutorId }: { editions: Edition[]; tutorId: string }) {
  const controller = useCalendarController();
  const fieldId = useId();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [initialView] = useState(() => window.matchMedia("(max-width: 640px)").matches ? "listWeek" : "dayGridMonth");
  const source = useMemo(() => agenda(editions, tutorId, -Infinity), [editions, tutorId]);
  const appointments = useMemo(() => source.appointments.filter((item) => !filter || item.edition.id === filter), [source, filter]);
  const choices = useMemo(() => [...new Map(source.appointments.map((item) => [item.edition.id, item.edition])).values()], [source]);
  const events = useMemo(() => appointments.map((item) => ({
    id: eventId(item), title: `${courseTitle(item.edition)} · ${item.ordinal}${source.conflicts.includes(item) ? " · sovrapposto" : ""}`,
    start: new Date(item.start).toISOString(), end: new Date(item.end).toISOString(),
  })), [appointments, source]);
  const [initialDate] = useState(() => startingDate(source.appointments));
  const active = appointments.find((item) => eventId(item) === selected);
  function selectEvent(info: EventClickInfo) { setSelected(info.event.id); }

  return <section className="tutor-calendar" aria-label="Calendario delle tue edizioni">
    <p className="section-meta">Agenda del docente · Europe/Rome</p>
    <p>Solo incontri delle tue edizioni caricate, comprese le date passate. I dati si rileggono al caricamento della pagina.</p>
    <div className="tutor-calendar-filters">
      <div><label htmlFor={`${fieldId}-edition`}>Edizioni nel calendario</label><select id={`${fieldId}-edition`} value={filter} onChange={(event) => {
        setFilter(event.target.value); setSelected(null);
      }}><option value="">Tutte le mie edizioni</option>{choices.map((edition) => <option key={edition.id} value={edition.id}>{courseTitle(edition)} · {edition.id.slice(0, 8)}</option>)}</select></div>
      <div><label htmlFor={`${fieldId}-date`}>Vai alla data</label><input id={`${fieldId}-date`} type="date" onChange={(event) => { if (event.target.value) controller.gotoDate(event.target.value); }} /></div>
    </div>
    <div className="tutor-calendar-toolbar" role="group" aria-label="Navigazione calendario">
      <div><button type="button" aria-label="Periodo precedente" onClick={() => controller.prev()}>←</button><button type="button" onClick={() => controller.today()}>Oggi</button><button type="button" aria-label="Periodo successivo" onClick={() => controller.next()}>→</button></div>
      <h4 aria-live="polite">{controller.view?.title ?? "Calendario"}</h4>
      <div>{views.map(([id, label]) => <button type="button" key={id} aria-pressed={(controller.view?.type ?? initialView) === id} onClick={() => controller.changeView(id)}>{label}</button>)}</div>
    </div>
    <div className="tutor-calendar-grid" tabIndex={0} aria-label="Griglia calendario, scorribile nelle viste orarie">
      <FullCalendar className="tutor-calendar-engine" controller={controller} plugins={plugins} locale={italian} timeZone="Europe/Rome" initialDate={initialDate}
        initialView={initialView} headerToolbar={false} height="auto" firstDay={1} events={events} editable={false} selectable={false}
        viewClass={(info) => `tutor-calendar-view-${info.view.type}`}
        eventInteractive eventClass="tutor-calendar-event" eventClick={selectEvent} displayEventEnd eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        dayMaxEvents={3} allDaySlot={false} scrollTime="08:00:00" nowIndicator />
    </div>
    {!events.length && <p role="status">Nessun incontro nelle edizioni selezionate.</p>}
    <div className="tutor-calendar-selection" aria-live="polite">
      {active ? <><h4>{courseTitle(active.edition)} · incontro {active.ordinal}</h4>
        <p>{appointmentLabel(new Date(active.start).toISOString(), "Europe/Rome")} → {appointmentLabel(new Date(active.end).toISOString(), "Europe/Rome")}</p>
        {source.conflicts.includes(active) && <p>Questo incontro si sovrappone a un altro appuntamento caricato.</p>}
        <a href={`?view=courses&edition=${encodeURIComponent(active.edition.id)}`}>Apri questa edizione</a></> : <p>Seleziona un incontro per leggere date complete e aprire la sua edizione. Il calendario è in sola lettura.</p>}
    </div>
    <details className="tutor-calendar-licenses"><summary>Licenze software</summary><pre>{licenses}</pre></details>
  </section>;
}
