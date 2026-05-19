// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * percorsoService — Sprint Q1.C
 * Andrea Marro 2026-04-24
 *
 * Lookup API per Capitoli JSON. Consumed by:
 *   - CapitoloPicker (Q2): listCapitoliByVolume(N)
 *   - PercorsoCapitoloView (Q2): getCapitolo(id)
 *   - Simulator / Tutor: findExperimentById(expId) legacy compat
 *   - Libero mode (Q2): getBonusCapitoli()
 *
 * Factory pattern (createPercorsoService) for testability + DI.
 * Default singleton auto-loads from src/data/capitoli/*.json via Vite import.meta.glob.
 */

/**
 * Create a service instance from an explicit capitoli array.
 * @param {Array<Capitolo>} capitoli
 */
export function createPercorsoService(capitoli) {
  const byId = new Map();
  for (const cap of capitoli) {
    if (cap?.id) byId.set(cap.id, cap);
  }

  return {
    getCapitolo(id) {
      return byId.get(id) ?? null;
    },

    listCapitoliByVolume(volumeNum) {
      return Array.from(byId.values())
        .filter((c) => c.volume === volumeNum && c.type !== 'bonus')
        .sort((a, b) => (a.capitolo ?? 0) - (b.capitolo ?? 0));
    },

    listAllCapitoli() {
      return Array.from(byId.values());
    },

    getBonusCapitoli() {
      return Array.from(byId.values()).filter((c) => c.type === 'bonus');
    },

    findExperimentById(experimentId) {
      for (const cap of byId.values()) {
        const esp = cap.esperimenti?.find((e) => e.id === experimentId);
        if (esp) return { capitolo: cap, esperimento: esp };
      }
      return null;
    },
  };
}

// ====================================================================
// Default singleton — loads from src/data/capitoli/*.json
// Uses Vite import.meta.glob (eager) for bundling at build time.
// ====================================================================

const modules = import.meta.glob('../data/capitoli/*.json', {
  eager: true,
  import: 'default',
});

const defaultCapitoli = Object.values(modules);
const defaultService = createPercorsoService(defaultCapitoli);

export const getCapitolo = defaultService.getCapitolo;
export const listCapitoliByVolume = defaultService.listCapitoliByVolume;
export const listAllCapitoli = defaultService.listAllCapitoli;
export const getBonusCapitoli = defaultService.getBonusCapitoli;
export const findExperimentById = defaultService.findExperimentById;

export default defaultService;
