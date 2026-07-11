// Product Flow Shell: la nav espone SOLO gli ingressi primari caricabili dal
// docente. Cruscotto e lezioni salvate restano route interne/profonde, non
// comandi principali nella shell.

export type ArdesiaViewId =
  | "lavagna"
  | "simulatore"
  | "knowledge"
  | "library"
  | "marketplace"
  | "elab-lab"
  | "cruscotto"
  | "lezioni-salvate"

export const ARDESIA_VIEW_LINKS: ReadonlyArray<{
  id: ArdesiaViewId
  label: string
  title: string
}> = [
  { id: "lavagna", label: "Lavagna", title: "Lavagna della lezione" },
  { id: "knowledge", label: "Knowledge", title: "Knowledge Explorer della lezione" },
  { id: "library", label: "Library", title: "Materiali persistiti della lezione" },
  { id: "marketplace", label: "Marketplace", title: "Note, media e plugin per la lavagna" },
]

/**
 * Href della vista. La lavagna preserva lo hash della stanza (#wbstudio-…)
 * quando presente, così "torna lavagna" riapre la STESSA stanza; le altre
 * viste sono query-routed.
 */
export function viewHref(id: ArdesiaViewId, currentHash: string = ""): string {
  const hash = currentHash.startsWith("#") ? currentHash : currentHash ? `#${currentHash}` : ""
  if (id === "lavagna") return `/${hash}`
  if (id === "marketplace") return `/?vista=marketplace${hash}`
  return `/?vista=${id}${hash}`
}

export default function ViewNav({ current }: { current: ArdesiaViewId }) {
  const hash = typeof window === "undefined" ? "" : window.location.hash
  return (
    <nav aria-label="Viste Ardesia" data-view-nav className="st-view-nav">
      {ARDESIA_VIEW_LINKS.map((view) => (
        <a
          key={view.id}
          href={viewHref(view.id, hash)}
          title={view.title}
          data-view-nav-item={view.id}
          aria-current={view.id === current ? "page" : undefined}
          className={view.id === current ? "st-view-nav-item st-view-nav-item-active" : "st-view-nav-item"}
        >
          {view.label}
        </a>
      ))}
    </nav>
  )
}
