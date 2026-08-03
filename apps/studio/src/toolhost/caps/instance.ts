// P0-C — identità di ISTANZA di un tool montato più volte (post-it multipli).
// Concetto HOST-side: le istanze le crea chi insegna o impara (Room/superficie),
// mai il tool — l'instanceId entra da ToolHostDeps.
//
// CORREZIONE: questa riga diceva anche «e non esiste sul wire», ed era falsa
// da quando `plugin.mounted` è entrato in `lesson.event.emit`: i suoi params
// PORTANO instanceId e pluginId (toolhost-protocol/messages.ts). Il campo sul
// wire c'è; quello che il tool non può fare è SCEGLIERLO — il router lo
// confronta con l'identità host-side (`isOwnPluginIdentity`, deny-by-default)
// e rifiuta CAPABILITY_DENIED se non combacia. La proprietà vera è «il tool non
// può dichiararsi un'altra istanza», non «il campo non viaggia»: la prima è
// verificata da un test, la seconda era una descrizione che il wire smentiva.
//
// Grammatica deliberatamente più stretta delle storage key: niente "/", niente
// ".", così il segmento di namespace non è alias-abile (a/./b) né
// path-traversabile.

export const INSTANCE_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

export function isValidInstanceId(id: string): boolean {
  return INSTANCE_ID_RE.test(id)
}

/** Fail-closed: un'istanza con id malformato non deve MAI produrre un namespace. */
export function assertInstanceId(id: string): void {
  if (!isValidInstanceId(id)) throw new Error(`invalid instance id: ${id}`)
}
