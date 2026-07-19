// Founder Beta shell: la nav espone soltanto le tre promesse di prodotto.
// Le route storiche restano alias interni per non spezzare link e test profondi.

export type FounderSurfaceId =
  | "lezione"
  | "continuita"
  | "materiali"

export type ArdesiaViewId = FounderSurfaceId
  | "lavagna"
  | "simulatore"
  | "elab-lab"
  | "cruscotto"
  | "lezioni-salvate"

export const ARDESIA_VIEW_LINKS: ReadonlyArray<{
  id: FounderSurfaceId
  label: string
  title: string
}> = [
  { id: "lezione", label: "Lezione", title: "Lavagna e plugin della lezione corrente" },
  { id: "continuita", label: "Continuità", title: "Chiusura, replay e ripresa della lezione" },
  { id: "materiali", label: "Materiali", title: "Export, import e recovery della lezione" },
]

function founderSurfaceFor(id: ArdesiaViewId): FounderSurfaceId | null {
  if (
    id === "lezione" ||
    id === "lavagna" ||
    id === "simulatore" ||
    id === "elab-lab"
  ) return "lezione"
  if (id === "continuita" || id === "cruscotto") return "continuita"
  if (id === "materiali" || id === "lezioni-salvate") return "materiali"
  return null
}

/**
 * Href della vista. La lavagna preserva lo hash della stanza (#wbstudio-…)
 * quando presente, così "torna lavagna" riapre la STESSA stanza; le altre
 * viste sono query-routed.
 */
export function viewHref(id: ArdesiaViewId, currentHash: string = ""): string {
  const hash = currentHash.startsWith("#") ? currentHash : currentHash ? `#${currentHash}` : ""
  if (id === "lezione" || id === "lavagna") return `/${hash}`
  if (id === "continuita") return `/?vista=cruscotto${hash}`
  if (id === "materiali") return `/?vista=lezioni-salvate${hash}`
  return `/?vista=${id}${hash}`
}

export default function ViewNav({ current }: { current: ArdesiaViewId }) {
  const hash = typeof window === "undefined" ? "" : window.location.hash
  const currentSurface = founderSurfaceFor(current)
  return (
    <nav aria-label="Viste Ardesia" data-view-nav style={navStyle}>
      {ARDESIA_VIEW_LINKS.map((view) => (
        <a
          key={view.id}
          href={viewHref(view.id, hash)}
          title={view.title}
          data-view-nav-item={view.id}
          aria-current={view.id === currentSurface ? "page" : undefined}
          style={view.id === currentSurface ? { ...linkStyle, ...activeStyle } : linkStyle}
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
