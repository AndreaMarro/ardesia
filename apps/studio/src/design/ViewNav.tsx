// Founder Beta shell: la nav espone soltanto le tre promesse di prodotto.
// Le route storiche restano alias interni per non spezzare link e test profondi.

import type { MouseEvent } from "react"
import { studioHref } from "../store/studioLocation"

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
  if (id === "lezione" || id === "lavagna") return studioHref(hash)
  // "Continuita" puntava al cruscotto docente: un segnaposto, non la
  // superficie di ripresa. Ora cade nel default `/?vista=<id>` e raggiunge
  // ContinuityView. `founderSurfaceFor` continua a mappare anche
  // "cruscotto" su questa superficie, perche' il cruscotto non ha una voce
  // di nav propria e senza quella riga resterebbe senza evidenziazione.
  if (id === "materiali") return studioHref(`?vista=lezioni-salvate${hash}`)
  return studioHref(`?vista=${id}${hash}`)
}

export type ViewNavProps = Readonly<{
  current: ArdesiaViewId
  onNavigate?: (href: string) => void
}>

function isPrimarySameTabClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
}

export default function ViewNav({ current, onNavigate }: ViewNavProps) {
  const hash = typeof window === "undefined" ? "" : window.location.hash
  const currentSurface = founderSurfaceFor(current)
  return (
    <nav aria-label="Viste Ardesia" data-view-nav style={navStyle}>
      {ARDESIA_VIEW_LINKS.map((view) => {
        const href = viewHref(view.id, hash)
        return (
          <a
            key={view.id}
            href={href}
            title={view.title}
            data-view-nav-item={view.id}
            aria-current={view.id === currentSurface ? "page" : undefined}
            style={view.id === currentSurface ? { ...linkStyle, ...activeStyle } : linkStyle}
            onClick={onNavigate ? (event) => {
              // Cmd/Ctrl/Shift/Alt-click apre un nuovo contesto: la Room corrente
              // non viene smontata e il normale comportamento del link resta intatto.
              if (event.defaultPrevented || !isPrimarySameTabClick(event)) return
              event.preventDefault()
              onNavigate(href)
            } : undefined}
          >
            {view.label}
          </a>
        )
      })}
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
  // Founder Beta: bersaglio tattile minimo 44 CSS px.
  // Vincolato da src/__tests__/ViewNavTouchTarget.test.tsx, che misura lo
  // stile calcolato di ogni [data-view-nav-item] e non importa questa soglia.
  minHeight: 44,
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
