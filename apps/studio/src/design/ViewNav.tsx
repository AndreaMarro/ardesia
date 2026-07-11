// Product Flow Shell: la nav espone SOLO gli ingressi primari caricabili dal
// docente. Cruscotto e lezioni salvate restano route interne/profonde, non
// comandi principali nella shell.

export type ArdesiaViewId =
  | "lavagna"
  | "simulatore"
  | "knowledge"
  | "library"
  | "elab-lab"
  | "cruscotto"
  | "lezioni-salvate"

export const ARDESIA_VIEW_LINKS: ReadonlyArray<{
  id: ArdesiaViewId
  label: string
  title: string
}> = [
  { id: "lavagna", label: "lavagna", title: "Lavagna Ardesia (stanza corrente)" },
  { id: "simulatore", label: "Simulatore", title: "Simulation Plugin autonomo" },
  { id: "knowledge", label: "Knowledge", title: "Knowledge Explorer della lezione" },
  { id: "library", label: "Library", title: "Materiali persistiti della lezione" },
  { id: "elab-lab", label: "ELABTutor", title: "Pack ELABTutor sopra il simulatore" },
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
  gap: 4,
  padding: 4,
  borderRadius: 10,
  background: "rgba(21,38,56,0.06)",
} as const

const linkStyle = {
  minHeight: 30,
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 12px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "#41556d",
  textDecoration: "none",
  whiteSpace: "nowrap",
} as const

const activeStyle = {
  background: "#ffffff",
  color: "#1f3f63",
  boxShadow: "0 1px 3px rgba(21,38,56,0.18)",
} as const
