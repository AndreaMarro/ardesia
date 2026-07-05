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
