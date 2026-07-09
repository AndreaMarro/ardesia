// Digest topologico STABILE di una scena di simulazione: hash deterministico
// (FNV-1a 32-bit) della sola TOPOLOGIA elettrica — componenti (id/tipo/valore),
// collegamenti (from/to/kind) e pinAssignments. Esclude runtime/animazione
// (ledOn, millis) e layout grafico: il digest identifica "com'è cablato il
// circuito", non come sta lampeggiando. Serve al contratto save/reopen: dopo
// una riapertura la topologia persistita deve produrre lo STESSO digest.
//
// Puro, zero dipendenze, zero I/O: usabile in test unit e nel componente embed.

export type DigestComponentLike = {
  id: string
  type: string
  value?: number | string | null
}

export type DigestConnectionLike = {
  from: string
  to: string
  kind?: string
}

export type DigestSceneLike = {
  components: readonly DigestComponentLike[]
  connections: readonly DigestConnectionLike[]
  pinAssignments?: Record<string, string>
}

/** Proiezione canonica ordinata: due scene con la stessa topologia → stessa stringa. */
export function canonicalSceneTopology(scene: DigestSceneLike): string {
  const components = [...scene.components]
    .map((component) => `${component.id}|${component.type}|${component.value ?? ""}`)
    .sort()
  const connections = [...scene.connections]
    .map((connection) => `${connection.from}>${connection.to}|${connection.kind ?? "wire"}`)
    .sort()
  const pins = Object.entries(scene.pinAssignments ?? {})
    .map(([pin, hole]) => `${pin}=${hole}`)
    .sort()
  return [
    `C:${components.join(",")}`,
    `W:${connections.join(",")}`,
    `P:${pins.join(",")}`,
  ].join("\n")
}

/** FNV-1a 32-bit → 8 hex chars. Deterministico, nessun clock/entropy. */
export function simulationSceneDigest(scene: DigestSceneLike): string {
  const text = canonicalSceneTopology(scene)
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    // moltiplicazione FNV in aritmetica a 32 bit senza overflow float
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}
