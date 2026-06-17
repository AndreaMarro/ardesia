/**
 * CapitoloSchema — Sprint Q1.A narrative-preserving schema
 * Andrea Marro 2026-04-24
 *
 * Unità pedagogica Capitolo (vs lesson-path per-esperimento flat).
 * Preserva narrative progression volume: theory → esperimenti variation chain → quiz.
 * Duality linguaggio: classe_display (centro, narrativo) vs docente_sidebar (colpo d'occhio).
 *
 * Types:
 *  - theory: Cap teoria (Vol1 1-5, Vol2 1-2 11, Vol3 1-4)
 *  - experiment: Cap con esperimenti chain (Cap 6+ Vol1, etc.)
 *  - project: capstone finale volume (Vol1 Cap14, Vol2 Cap12, Vol3 Cap9)
 *  - bonus: progetti freestyle (Vol3 extras lcd, servo)
 *  - wip: placeholder Cap non ancora scritto
 */

import { z } from 'zod';

const CitazioneSchema = z.object({
  page: z.number().int().positive(),
  quote: z.string(),
  context: z.enum(['opening', 'after_fig', 'closing', 'mid_narrative']).optional(),
});

const FigureRefSchema = z.object({
  page: z.number().int().positive(),
  caption: z.string(),
  image_path: z.string().optional(),
});

const AnalogySchema = z.object({
  concept: z.string(),
  text: z.string(),
  evidence: z.string().optional(),
});

const TheorySchema = z.object({
  testo_classe: z.string(),
  citazioni_volume: z.array(CitazioneSchema),
  figure_refs: z.array(FigureRefSchema),
  analogies_classe: z.array(AnalogySchema),
});

const TransitionSchema = z.object({
  between: z.tuple([z.string(), z.string()]),
  text_classe: z.string(),
  text_docente_action: z.string(),
  incremental_mode: z.enum([
    'from_scratch',
    'add_component',
    'remove_component',
    'modify_component',
  ]),
});

const NarrativeFlowSchema = z.object({
  intro_text: z.string(),
  transitions: z.array(TransitionSchema),
  closing_text: z.string(),
});

const BuildCircuitFromScratch = z.object({
  mode: z.literal('from_scratch'),
  intent: z.object({
    components: z.array(z.any()),
    wires: z.array(z.any()),
  }),
});

const BuildCircuitIncremental = z.object({
  mode: z.literal('incremental_from_prev'),
  incremental_delta: z.object({
    base_experiment_id: z.string(),
    operations: z.array(
      z.object({
        op: z.enum(['add', 'remove', 'modify']),
        target: z.string(),
        params: z.any().optional(),
      })
    ),
  }),
});

const BuildCircuitSchema = z.discriminatedUnion('mode', [
  BuildCircuitFromScratch,
  BuildCircuitIncremental,
]);

const ClasseDisplaySchema = z.object({
  text_hook: z.string().nullable(),
  volume_quote: z
    .object({
      page: z.number().int().positive(),
      quote: z.string(),
    })
    .optional(),
  observation_prompt: z.string().nullable(),
  analogies: z.array(AnalogySchema),
});

const ErroreTipicoSchema = z.object({
  problema: z.string(),
  soluzione_neutra: z.string(),
});

/**
 * DocenteSidebar — sidebar laterale colpo d'occhio.
 *
 * PRINCIPIO ZERO: linguaggio NEUTRO sostantivo/infinito impersonale, NON imperativo.
 * Il docente la legge in silenzio per CAPIRE stato corrente, NON la riceve come ordine.
 *
 * step_corrente: sostantivo nominalizzato ("Distribuzione kit", "Montaggio circuito", "Visualizzazione LIM")
 * spunto_per_classe: citazione testuale o "Domanda: '...'" (non "Chiedi alla classe...")
 * note: descrittive nominali ("Resistore necessario", "Polarità LED rispettata")
 * errori_tipici: { problema, soluzione_neutra } entrambi nominali
 */
const DocenteSidebarSchema = z.object({
  step_corrente: z.string(),
  spunto_per_classe: z.string().nullable(),
  note: z.array(z.string()),
  errori_tipici: z.array(ErroreTipicoSchema),
});

const PhaseSchema = z.object({
  name: z.enum(['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI']),
  duration_minutes: z.number().int().positive(),
  classe_display: ClasseDisplaySchema,
  docente_sidebar: DocenteSidebarSchema,
  action_tags: z.array(z.string()),
  auto_action: z.string().nullable(),
});

const ComponentNeededSchema = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  icon: z.string(),
});

const VolumeRefSchema = z.object({
  page_start: z.number().int().positive(),
  page_end: z.number().int().positive(),
  fig_refs: z.array(FigureRefSchema),
});

const SessionSaveSchema = z.object({
  concepts_covered: z.array(z.string()),
  next_suggested: z.string().nullable(),
  resume_message: z.string(),
});

const EsperimentoSchema = z.object({
  id: z.string(),
  num: z.number().int().positive(),
  title_classe: z.string(),
  title_docente: z.string(),
  volume_ref: VolumeRefSchema,
  duration_minutes: z.number().int().positive(),
  components_needed: z.array(ComponentNeededSchema),
  build_circuit: BuildCircuitSchema,
  phases: z.array(PhaseSchema),
  assessment_invisible: z.array(z.string()),
  session_save: SessionSaveSchema,
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().nonnegative(),
});

export const CapitoloSchema = z.object({
  id: z.string().min(1),
  volume: z.number().int().min(1).max(3),
  capitolo: z.number().int().nullable(),
  type: z.enum(['theory', 'experiment', 'project', 'bonus', 'wip']),
  titolo: z.string().min(1),
  titolo_classe: z.string().min(1),
  pageStart: z.number().int().nullable(),
  pageEnd: z.number().int().nullable(),
  theory: TheorySchema,
  narrative_flow: NarrativeFlowSchema.optional(),
  esperimenti: z.array(EsperimentoSchema),
  quiz_finale: z.array(QuizQuestionSchema).optional(),
});

/**
 * Validates a Capitolo object.
 * Returns { valid: boolean, errors: ZodIssue[], data?: Capitolo }
 */
export function validateCapitolo(obj) {
  const result = CapitoloSchema.safeParse(obj);
  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  }
  return { valid: false, errors: result.error.issues };
}

export const CAPITOLO_TYPES = ['theory', 'experiment', 'project', 'bonus', 'wip'];
export const BUILD_MODES = ['from_scratch', 'incremental_from_prev'];
export const PHASE_NAMES = ['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI'];
// © Andrea Marro — 26/04/2026 — ELAB Tutor — Tutti i diritti riservati
export const INCREMENTAL_MODES = [
  'from_scratch',
  'add_component',
  'remove_component',
  'modify_component',
];
