import type { ReactNode } from "react";
import type { Edition, StudyMe } from "../api";
import { EditionNavigation, type EditionPagination } from "./EditionNavigation";

export type View =
  | "today"
  | "courses"
  | "classroom"
  | "work"
  | "review"
  | "materials";
const items: {
  id: View;
  label: string;
  studentLabel?: string;
  teacherOnly?: boolean;
  icon: string;
}[] = [
  { id: "today", label: "Oggi", icon: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z" },
  {
    id: "courses",
    label: "Mini-corsi",
    studentLabel: "I miei corsi",
    icon: "M4 4h16v16H4zM4 9h16M9 9v11",
  },
  {
    id: "work",
    label: "Diario degli errori",
    studentLabel: "Il mio lavoro",
    icon: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h4",
  },
  {
    id: "review",
    label: "Da correggere",
    teacherOnly: true,
    icon: "M4 4h16v16H4zM8 12l3 3 6-7",
  },
  { id: "materials", label: "Materiali", icon: "M3 6h7l2 2h9v12H3z" },
];

export function Shell({
  me,
  view,
  onView,
  onLogout,
  children,
  editions = [],
  editionId,
  onEdition,
  editionPagination,
}: {
  me: StudyMe;
  view: View;
  onView: (v: View) => void;
  onLogout: () => void;
  children: ReactNode;
  editions?: Edition[];
  editionId?: string | null;
  onEdition?: (id: string) => void;
  editionPagination?: EditionPagination;
}) {
  const tutor = me.role === "teacher";
  return (
    <div className="app-frame">
      <a className="skip-link" href="#content">
        Vai al contenuto
      </a>
      <aside className="sidebar" aria-label="Navigazione e account">
        <a className="wordmark" href="/" aria-label="Ardesia, inizio">
          <span className="brand-symbol" aria-hidden="true">
            a
          </span>
          ardesia<span className="brand-dot">.</span>
        </a>
        <p className="workspace-label">
          {tutor ? "Il tuo studio" : "Il tuo spazio"}
        </p>
        {editions.length > 0 && (
          <label className="course-selector">
            Edizione corrente
            <select
              aria-label="Edizione corrente"
              disabled={editionPagination?.loading}
              value={editionId ?? ""}
              onChange={(event) => onEdition?.(event.target.value)}
            >
              {!editionId && (
                <option value="" disabled>
                  Scegli un’edizione
                </option>
              )}
              {editions.map((edition) => (
                <option key={edition.id} value={edition.id}>
                  {edition.title ?? edition.id} · {edition.id}
                </option>
              ))}
            </select>
          </label>
        )}
        {editionPagination && (
          <EditionNavigation pagination={editionPagination} />
        )}
        <nav className="primary-navigation" aria-label="Navigazione principale">
          {items
            .filter((i) => !i.teacherOnly || tutor)
            .map((item) => (
              <button
                key={item.id}
                aria-current={view === item.id ? "page" : undefined}
                onClick={() => onView(item.id)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
                {tutor ? item.label : (item.studentLabel ?? item.label)}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Uno spazio per capire.
            <br />
            Un filo da ritrovare.
          </p>
          <button className="profile-control" onClick={onLogout}>
            <span className="profile-monogram">{tutor ? "T" : "S"}</span>
            <span>
              {tutor ? "Spazio tutor" : "Spazio studente"}
              <small>Esci dall’account</small>
            </span>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <span>
            {editions.find((edition) => edition.id === editionId)?.title ??
              (tutor ? "Regia dei mini-corsi" : "Il tuo percorso")}
          </span>
          <span className="environment-note">
            Ambiente di prova · dati sintetici
          </span>
        </header>
        <main id="content" className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
