export type View = "today" | "courses" | "classroom" | "work" | "review" | "exam" | "materials" | "independent-study" | "memory";
export type Destination = { id: View; label: string; description: string; keywords: string; icon: string };
export const legacyViews: readonly View[] = Object.freeze(["today", "courses", "classroom", "work", "review", "exam", "materials"] as const);

/** Destinations project existing App routes; they never grant access. */
export function destinations(tutor: boolean, enabledViews: readonly View[] = legacyViews): Destination[] {
  const items: Destination[] = [
    { id: "today", label: "Oggi", description: "La prossima azione utile", keywords: "inizio home", icon: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z" },
    { id: "courses", label: tutor ? "Corsi" : "I miei corsi", description: tutor ? "Programma, edizioni e gestione" : "Programma e partecipazione", keywords: "gestione edizioni calendario", icon: "M4 4h16v16H4zM4 9h16M9 9v11" },
    { id: "classroom", label: "Lezione", description: "Fonti, esperimenti e ragionamenti", keywords: "aula laboratorio esperimento", icon: "M3 4h18v13H3zM8 21l4-4 4 4M7 12l3-4 4 5 3-3" },
    ...(!tutor ? [{id: "independent-study" as const, label: "Studio autonomo", description: "Obiettivo, pratica e ripasso", keywords: "ripasso percorso obiettivo solo", icon: "M12 3v18M4 5h5l3 3 3-3h5v14h-5l-3 2-3-2H4Z"}] : []),
    { id: "work", label: tutor ? "Diario degli errori" : "Il mio lavoro", description: tutor ? "Passaggi e nuove prove" : "Quaderno, diario, consegne e feedback", keywords: "quaderno ripasso tentativi errori feedback", icon: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h4" },
    { id: "memory", label: "Memoria delle idee", description: "Idee, fonti e collegamenti personali", keywords: "memoria idee collegamenti grafo appunti", icon: "M5 5h14v14H5zM9 9h6M9 13h3M3 9H1M3 15H1M9 3V1M15 3V1" },
    ...(tutor
      ? [{ id: "review" as const, label: "Da correggere", description: "Originali e restituzioni agli studenti", keywords: "review correzioni", icon: "M4 4h16v16H4zM8 12l3 3 6-7" }]
      : [{ id: "exam" as const, label: "Prova di fisica", description: "Disponibilità e prove dell’edizione", keywords: "esame verifica", icon: "M6 4h12v16H6zM9 2h6v4H9zM9 10h6M9 14h4" }]),
    { id: "materials", label: "Materiali", description: "Fonti e risorse del corso", keywords: "video audio documenti fonti", icon: "M3 6h7l2 2h9v12H3z" },
  ];
  return items.filter(item => enabledViews.includes(item.id));
}
const searchable = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it-IT");
export function matches(query: string, value: string) {
  const haystack = searchable(value);
  return searchable(query).trim().split(/\s+/).every(word => haystack.includes(word));
}
