// Contratto TypeScript dei moduli del Simulation Plugin ELAB consumati
// dall'host via alias Vite `@elab-tutor-plugin` (vite.config.ts). Il plugin è
// JavaScript fuori dal project graph tsc (plugins/elab-tutor, suite propria):
// queste dichiarazioni sono il confine tipizzato che l'host si impegna a
// rispettare — stessa firma di renderEmbeddable.jsx (canon §6 MOUNT-CANVAS).

declare module "@elab-tutor-plugin/plugin/renderEmbeddable" {
  /** Handle restituito dal mount: l'host DEVE chiamare dispose allo smontaggio. */
  export interface EmbeddableHandle {
    dispose(): void
  }

  export const pluginManifest: Readonly<{
    kind: "plugin"
    id: string
    name: string
    version: string
    embeddable: boolean
  }>

  /**
   * Monta il SimulatorCanvas nel container fornito dall'host.
   * Lancia se il container manca (fail-closed, mai silenzioso).
   */
  export function renderEmbeddable(
    container: HTMLElement,
    props?: Record<string, unknown>,
  ): EmbeddableHandle
}

declare module "@elab-tutor-plugin/data/experiments-vol1" {
  /** Esperimento del Volume 1 (dato Pack: S1 lesson-path in forma embedded). */
  export interface ElabVolumeExperiment {
    id: string
    title: string
    components: Array<{ id: string; type: string; value?: number; color?: string | null }>
    connections: Array<{ from: string; to: string; color?: string }>
    pinAssignments?: Record<string, string>
  }

  const EXPERIMENTS_VOL1: {
    title: string
    experiments: ElabVolumeExperiment[]
  }
  export default EXPERIMENTS_VOL1
}

declare module "@elab-tutor-plugin/data/experiment-visibility" {
  // Whitelist UI degli esperimenti visibili (fonte di verità: selezione
  // Andrea verbatim 25/05/2026). 8 id oggi; RESTORE_ALL/rollback documentati
  // nel modulo JS. Il filtro è consumer-side: hidden ≠ deleted.
  import type { ElabVolumeExperiment } from "@elab-tutor-plugin/data/experiments-vol1"

  export const VISIBLE_EXP_IDS: readonly string[]
  export const VISIBILITY_FILTER_DISABLED: boolean
  export function isVisibleExperiment(expId: string): boolean
  export function filterVisibleExperiments(
    experiments: ElabVolumeExperiment[],
  ): ElabVolumeExperiment[]
}

declare module "@elab-tutor-plugin/data/experiments-index" {
  // Aggregatore del corpus completo (vol.1-3): stessa forma degli esperimenti
  // di experiments-vol1. Conteggio reale firsthand: 88 (il commento del
  // modulo dice 91; il canon dice 88 — fa fede il dato).
  import type { ElabVolumeExperiment } from "@elab-tutor-plugin/data/experiments-vol1"

  export const ALL_EXPERIMENTS: ElabVolumeExperiment[]
  export function findExperimentById(id: string): ElabVolumeExperiment | null
}
