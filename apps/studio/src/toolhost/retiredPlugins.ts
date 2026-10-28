/** Tombstones only: saved documents cannot reactivate removed implementations. */
const retiredIds = new Set([
  "io.elab.tutor",
  "io.ardesia.simulation",
  "io.ardesia.simulation-plugin",
  "io.maestro.plugin-ref",
])

export function isRetiredPlugin(pluginId: string): boolean {
  return retiredIds.has(pluginId)
}
