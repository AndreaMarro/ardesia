// Product Flow Shell (NOTTE-13, decisione autonoma): navigazione REALE tra le
// viste principali. Prima di questo componente le viste ?vista= erano isole
// raggiungibili solo digitando l'URL a mano (Product Flow Audit NOTTE-12,
// blocco #1). Sobrio, docente-first: solo i passi del flusso di lavoro,
// nessun marketing. Ogni voce è un <a> vero (le viste sono route con chunk
// separati: la navigazione full-page è il comportamento corretto, non un
// ripiego).

export type ArdesiaViewId = "lavagna" | "elab-lab" | "cruscotto" | "lezioni-salvate"

export const ARDESIA_VIEW_LINKS: ReadonlyArray<{
  id: ArdesiaViewId
  label: string
  title: string
}> = [
  { id: "lavagna", label: "lavagna", title: "Lavagna Ardesia (stanza corrente)" },
  { id: "elab-lab", label: "ELAB Lab", title: "Simulation Plugin — esperimenti del libro" },
  { id: "cruscotto", label: "cruscotto", title: "Cruscotto docente — errori e ripasso" },
  { id: "lezioni-salvate", label: "lezioni", title: "Lezioni salvate" },
]

/**
 * Href della vista. La lavagna preserva lo hash della stanza (#wbstudio-…)
 * quando presente, così "torna lavagna" riapre la STESSA stanza; le altre
 * viste sono query-routed.
 */
export function viewHref(id: ArdesiaViewId, currentHash: string = ""): string {
  const hash = currentHash.startsWith("#") ? currentHash : currentHash ? `#${currentHash}` : ""
  if (id === "lavagna") return `/${hash}`
  return `/?vista=${id}${hash}`
}

export default function ViewNav({ current }: { current: ArdesiaViewId }) {
  const hash = typeof window === "undefined" ? "" : window.location.hash
  return (
    <nav aria-label="Viste Ardesia" data-view-nav style={navStyle}>
      {ARDESIA_VIEW_LINKS.map((view) => (
        <a
          key={view.id}
          href={viewHref(view.id, hash)}
          title={view.title}
          data-view-nav-item={view.id}
          aria-current={view.id === current ? "page" : undefined}
          style={view.id === current ? { ...linkStyle, ...activeStyle } : linkStyle}
        >
          {view.label}
        </a>
      ))}
    </nav>
  )
}

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  padding: "2px 4px",
  borderRadius: 8,
  background: "rgba(21,38,56,0.05)",
} as const

const linkStyle = {
  padding: "3px 9px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "#41556d",
  textDecoration: "none",
  whiteSpace: "nowrap",
} as const

const activeStyle = {
  background: "#ffffff",
  color: "#1f3f63",
  boxShadow: "0 1px 2px rgba(21,38,56,0.14)",
} as const
