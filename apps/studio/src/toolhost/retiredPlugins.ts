/** Tombstones only: saved documents cannot reactivate removed implementations.
 * io.maestro.plugin-ref remains the identity of the independent SDK example;
 * removing an old renderer alias must not retire that plugin or its saved refs.
 */
const retiredIds = new Set([
  "io.elab.tutor",
  "io.ardesia.simulation",
  "io.ardesia.simulation-plugin",
])

export function isRetiredPlugin(pluginId: string): boolean {
  return retiredIds.has(pluginId)
}
