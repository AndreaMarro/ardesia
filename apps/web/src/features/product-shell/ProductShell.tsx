import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Edition, StudyMe } from "../../api";
import { EditionNavigation, type EditionPagination } from "../../components/EditionNavigation";
import { CommandSearch } from "./CommandSearch";
import { destinations, type View } from "./navigation";
import "./product-shell.css";

export type ShellProps = {
  me: StudyMe; view: View; onView: (view: View) => void; onLogout: () => void; children: ReactNode;
  editions?: Edition[]; editionId?: string | null; onEdition?: (id: string) => void; editionPagination?: EditionPagination;
};
export function ProductShell({ me, view, onView, onLogout, children, editions = [], editionId, onEdition, editionPagination }: ShellProps) {
  const tutor = me.role === "teacher", items = destinations(tutor);
  const current = items.find(item => item.id === view), edition = editions.find(item => item.id === editionId);
  const previousView = useRef(view);
  const [offline, setOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const connection = () => setOffline(!navigator.onLine);
    window.addEventListener("online", connection); window.addEventListener("offline", connection);
    return () => { window.removeEventListener("online", connection); window.removeEventListener("offline", connection); };
  }, []);
  useEffect(() => {
    if (previousView.current !== view) document.getElementById("content")?.focus({ preventScroll: true });
    previousView.current = view;
  }, [view]);
  return <div className="app-frame product-shell">
    <a className="skip-link" href="#content">Vai al contenuto</a>
    <aside className="sidebar" aria-label="Navigazione e account">
      <a className="wordmark" href="/" aria-label="ardesia."><span className="ps-brand-mark" aria-hidden="true"><i /><i /><i /></span>ardesia<span className="brand-dot">.</span></a>
      <p className="workspace-label">{tutor ? "Il tuo studio" : "Il tuo spazio"}</p>
      <div className="ps-editions">
        {editions.length > 0 && <label className="course-selector">Edizione corrente<select aria-label="Edizione corrente" disabled={editionPagination?.loading || !onEdition} value={editionId ?? ""} onChange={event => onEdition?.(event.target.value)}>
          {!editionId && <option value="" disabled>Scegli un’edizione</option>}
          {editions.map(item => <option key={item.id} value={item.id}>{item.title ?? item.id} · {item.id}</option>)}
        </select></label>}
        {editionPagination && <EditionNavigation pagination={editionPagination} />}
      </div>
      <nav className="primary-navigation" aria-label="Navigazione principale">{items.map(item => <button key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => onView(item.id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>{item.label}
      </button>)}</nav>
      <div className="sidebar-bottom"><p>Un’idea prende forma.<br />Un filo rimane.</p><button className="profile-control" onClick={onLogout}><span className="profile-monogram">{tutor ? "T" : "S"}</span><span>{tutor ? "Spazio tutor" : "Spazio studente"}<small>Esci dall’account</small></span></button></div>
    </aside>
    <div className="app-main">
      <header className="topbar"><div className="ps-context"><span>{edition?.title ?? (tutor ? "Il tuo studio" : "Il tuo percorso")}</span><strong>{current?.label ?? "Il tuo spazio"}</strong></div><CommandSearch items={items} editions={editions} onView={onView} onEdition={onEdition} loading={editionPagination?.loading} /></header>
      <div className="ps-environment"><span className="ps-status-dot" aria-hidden="true" />{me.synthetic ? "Ambiente di prova · dati sintetici" : "Spazio riservato"}</div>
      {offline && <p className="ps-offline" role="status">Il dispositivo segnala assenza di rete. I salvataggi sul server non sono confermati; verifica l’esito quando torna la connessione.</p>}
      <main id="content" className="page-content" tabIndex={-1}>{children}</main>
    </div>
  </div>;
}
