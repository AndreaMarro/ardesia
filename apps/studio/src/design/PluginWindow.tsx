import { useMemo, useState, type CSSProperties } from "react"
import type { PluginMarketplaceItem } from "../toolhost/marketplace/marketplaceItem"
import {
  buildDefaultPluginWindowCatalog,
  createPluginWindowInsertRequest,
  type PluginWindowCatalogItem,
  type PluginWindowInsertRequest,
  type PluginWindowKind,
} from "./pluginWindowCatalog"

type PluginWindowProps = {
  items?: readonly PluginWindowCatalogItem[]
  marketplaceItems?: readonly PluginMarketplaceItem[]
  userCreated?: readonly PluginWindowCatalogItem[]
  onInsert: (request: PluginWindowInsertRequest) => void
}

const KIND_FILTERS: ReadonlyArray<{ kind: PluginWindowKind | "all"; label: string }> = [
  { kind: "simulation", label: "Simulatore" },
  { kind: "essential", label: "Essenziali" },
  { kind: "function", label: "Funzioni" },
  { kind: "drawing-hd", label: "Disegno HD" },
  { kind: "web", label: "Web" },
  { kind: "marketplace", label: "Marketplace" },
  { kind: "user-created", label: "Creati da noi" },
  { kind: "all", label: "Tutti" },
]

export default function PluginWindow({
  items,
  marketplaceItems = [],
  userCreated = [],
  onInsert,
}: PluginWindowProps) {
  const catalog = useMemo(
    () => items ?? buildDefaultPluginWindowCatalog({ marketplaceItems, userCreated }),
    [items, marketplaceItems, userCreated],
  )
  const [selectedKind, setSelectedKind] = useState<PluginWindowKind | "all">("all")
  const [query, setQuery] = useState("")
  const visibleItems = filterPluginWindowCatalog(catalog, selectedKind, query)

  return (
    <section
      role="dialog"
      aria-label="Finestra plugin"
      data-plugin-window="ready"
      style={windowStyle}
    >
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Finestra plugin</h2>
          <p style={subtitleStyle}>Inserimento post-it con evento LessonOS pronto per il journal.</p>
        </div>
        <label style={searchLabelStyle}>
          <span style={searchTextStyle}>Cerca plugin</span>
          <input
            aria-label="Cerca plugin"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={searchInputStyle}
          />
        </label>
      </div>

      <div role="toolbar" aria-label="Tipi plugin" style={filterBarStyle}>
        {KIND_FILTERS.map((filter) => (
          <button
            key={filter.kind}
            type="button"
            aria-pressed={selectedKind === filter.kind}
            onClick={() => setSelectedKind(filter.kind)}
            style={selectedKind === filter.kind ? selectedFilterStyle : filterButtonStyle}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div role="list" aria-label="Catalogo plugin" style={listStyle}>
        {visibleItems.map((item) => (
          <PluginWindowRow key={item.id} item={item} onInsert={onInsert} />
        ))}
      </div>
    </section>
  )
}

function PluginWindowRow({
  item,
  onInsert,
}: {
  item: PluginWindowCatalogItem
  onInsert: (request: PluginWindowInsertRequest) => void
}) {
  const insertable = item.availability === "available"

  return (
    <article
      role="listitem"
      data-plugin-window-item={item.pluginId}
      data-plugin-window-kind={item.kind}
      data-plugin-window-readiness={item.readiness}
      data-lessonos-event={item.lessonOs.eventType}
      style={rowStyle}
    >
      <div style={rowMainStyle}>
        <div style={rowTitleLineStyle}>
          <strong style={itemTitleStyle}>{item.title}</strong>
          <span style={badgeStyle}>{kindLabel(item.kind)}</span>
          <span style={badgeStyle}>{item.readiness}</span>
        </div>
        <p style={descriptionStyle}>{item.description}</p>
        <div style={metaStyle}>
          <span>{item.pluginId}</span>
          <span>{item.lessonOs.evidenceRef}</span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Inserisci ${item.title}`}
        disabled={!insertable}
        onClick={() => onInsert(createPluginWindowInsertRequest(item))}
        style={insertable ? insertButtonStyle : disabledInsertButtonStyle}
      >
        Inserisci
      </button>
    </article>
  )
}

function filterPluginWindowCatalog(
  items: readonly PluginWindowCatalogItem[],
  selectedKind: PluginWindowKind | "all",
  query: string,
): PluginWindowCatalogItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return items.filter((item) => {
    if (normalizedQuery.length === 0) {
      return selectedKind === "all" || item.kind === selectedKind
    }
    return [item.title, item.description, item.pluginId, item.kind].some((value) =>
      value.toLocaleLowerCase().includes(normalizedQuery),
    )
  })
}

function kindLabel(kind: PluginWindowKind): string {
  switch (kind) {
    case "simulation":
      return "Simulatore"
    case "essential":
      return "Essenziale"
    case "function":
      return "Funzione"
    case "drawing-hd":
      return "Disegno HD"
    case "web":
      return "Web"
    case "marketplace":
      return "Marketplace"
    case "user-created":
      return "Creato"
  }
}

const windowStyle = {
  display: "grid",
  gap: 14,
  padding: 16,
  border: "1px solid #d7dde8",
  borderRadius: 8,
  background: "#f8fafc",
  color: "#162033",
  maxWidth: 980,
} satisfies CSSProperties

const headerStyle = {
  display: "flex",
  gap: 16,
  justifyContent: "space-between",
  alignItems: "start",
} satisfies CSSProperties

const titleStyle = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.2,
} satisfies CSSProperties

const subtitleStyle = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#526174",
} satisfies CSSProperties

const searchLabelStyle = {
  display: "grid",
  gap: 6,
  minWidth: 220,
} satisfies CSSProperties

const searchTextStyle = {
  fontSize: 12,
  color: "#526174",
} satisfies CSSProperties

const searchInputStyle = {
  minHeight: 36,
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  padding: "0 10px",
  fontSize: 14,
  background: "#ffffff",
  color: "#162033",
} satisfies CSSProperties

const filterBarStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
} satisfies CSSProperties

const filterButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#ffffff",
  color: "#243044",
  padding: "7px 10px",
  minHeight: 34,
} satisfies CSSProperties

const selectedFilterStyle = {
  ...filterButtonStyle,
  borderColor: "#2563eb",
  background: "#dbeafe",
  color: "#1e3a8a",
} satisfies CSSProperties

const listStyle = {
  display: "grid",
  gap: 10,
} satisfies CSSProperties

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
  padding: 12,
  border: "1px solid #d7dde8",
  borderRadius: 8,
  background: "#ffffff",
} satisfies CSSProperties

const rowMainStyle = {
  minWidth: 0,
} satisfies CSSProperties

const rowTitleLineStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
} satisfies CSSProperties

const itemTitleStyle = {
  fontSize: 15,
  lineHeight: 1.25,
} satisfies CSSProperties

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 22,
  padding: "0 7px",
  borderRadius: 999,
  background: "#eef2f7",
  color: "#334155",
  fontSize: 12,
} satisfies CSSProperties

const descriptionStyle = {
  margin: "6px 0",
  color: "#526174",
  fontSize: 13,
  lineHeight: 1.4,
} satisfies CSSProperties

const metaStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  color: "#64748b",
  fontSize: 12,
} satisfies CSSProperties

const insertButtonStyle = {
  border: "1px solid #2563eb",
  borderRadius: 6,
  background: "#2563eb",
  color: "#ffffff",
  padding: "8px 12px",
  minHeight: 36,
} satisfies CSSProperties

const disabledInsertButtonStyle = {
  ...insertButtonStyle,
  borderColor: "#cbd5e1",
  background: "#e2e8f0",
  color: "#64748b",
} satisfies CSSProperties
