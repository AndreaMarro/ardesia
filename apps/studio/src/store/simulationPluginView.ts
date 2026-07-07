/** Route autonoma del Simulation Plugin: il simulatore viene prima dei pack disciplinari. */
export function isSimulationPluginView(): boolean {
  try {
    if (typeof window === "undefined") return false
    const url = new URL(window.location.href)
    return url.searchParams.get("vista") === "simulatore"
  } catch {
    return false
  }
}
