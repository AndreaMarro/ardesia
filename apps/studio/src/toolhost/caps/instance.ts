// P0-C — identità di ISTANZA di un tool montato più volte (post-it multipli).
// Concetto HOST-side: le istanze le crea il docente (Room/superficie), mai il
// tool — l'instanceId entra da ToolHostDeps e non esiste sul wire. Grammatica
// deliberatamente più stretta delle storage key: niente "/", niente ".", così
// il segmento di namespace non è alias-abile (a/./b) né path-traversabile.

export const INSTANCE_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

export function isValidInstanceId(id: string): boolean {
  return INSTANCE_ID_RE.test(id)
}

/** Fail-closed: un'istanza con id malformato non deve MAI produrre un namespace. */
export function assertInstanceId(id: string): void {
  if (!isValidInstanceId(id)) throw new Error(`invalid instance id: ${id}`)
}
