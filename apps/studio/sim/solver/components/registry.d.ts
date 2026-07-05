// Superficie tipizzata minima del registry vendored (registry.js resta
// byte-identico alla sorgente plugin; questo .d.ts dichiara solo ciò che
// il codice studio usa davvero).
export interface CatalogPin {
  id: string
  label?: string
  type?: string
  mapsTo?: string
}

export interface CatalogInternalNet {
  id: string
  holes: string[]
}

export interface CatalogEntry {
  type?: string
  pins?: CatalogPin[]
  defaultState?: Record<string, unknown>
  category?: string
  label?: string
  icon?: string
  getInternalConnections?: () => CatalogInternalNet[]
}

export function registerComponent(type: string, config: CatalogEntry): void
export function getComponent(type: string): CatalogEntry | null
