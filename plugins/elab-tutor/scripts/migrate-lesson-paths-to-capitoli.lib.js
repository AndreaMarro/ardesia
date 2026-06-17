/**
 * Migration library — lesson-paths JSON -> Capitolo JSON
 * Andrea Marro 2026-04-24 (Sprint Q1.B)
 *
 * Pure helpers + main migrateAll() function.
 * Consumed by scripts/migrate-lesson-paths-to-capitoli.mjs CLI runner and unit tests.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const LESSON_PATHS_DIR = join(PROJECT_ROOT, 'src/data/lesson-paths');
const VOLUME_STRUCTURE_FILE = join(PROJECT_ROOT, 'docs/data/volume-structure.json');

// ====================================================================
// PURE HELPERS
// ====================================================================

/**
 * Extract classe-facing display fields from a lesson-path phase.
 * Maps: class_hook -> text_hook, summary_for_class|observation_prompt -> observation_prompt,
 * analogies preserved.
 */
export function extractClasseDisplay(phase) {
  const analogies = (Array.isArray(phase.analogies) ? phase.analogies : []).map((a) => {
    if (typeof a === 'string') return { concept: 'analogia', text: a };
    return {
      concept: a?.concept ?? 'analogia',
      text: a?.text ?? String(a ?? ''),
      ...(a?.evidence ? { evidence: a.evidence } : {}),
    };
  });
  return {
    text_hook: phase.class_hook ?? null,
    observation_prompt: phase.observation_prompt ?? phase.summary_for_class ?? null,
    analogies,
  };
}

/**
 * Trasforma testo imperativo (seconda persona / comando) in forma neutra nominale.
 * PRINCIPIO ZERO: docente_sidebar non comanda, descrive.
 *
 * Heuristic regex transforms:
 *   "Distribuisci/Distribuite X" -> "Distribuzione X"
 *   "Togli/Rimuovi X" -> "Rimozione X"
 *   "Chiedi/Domanda X" -> "Domanda: X"
 *   "Mostra X" -> "Visualizzazione X"
 *   "Non dare/fare X" -> "X: differire"
 *   "Premi X" -> "Pressione X"
 *   "Collega X" -> "Collegamento X"
 *   imperativi -are/-ere/-ire generici -> rimuove "tu" e usa fallback descrittivo
 */
export function nominalize(text) {
  if (!text || typeof text !== 'string') return text ?? '';
  let s = text.trim();
  // Pattern specifici comuni
  const patterns = [
    [/^Distribu(isci|ite|isce)\s+/i, 'Distribuzione '],
    [/^(Togli|Togliete|Rimuovi|Rimuovete|Rimuove)\s+/i, 'Rimozione '],
    [/^(Chiedi|Chiedete)\s*:?\s*/i, 'Domanda: '],
    [/^(Mostra|Mostrate)\s+/i, 'Visualizzazione '],
    [/^(Premi|Premete)\s+/i, 'Pressione '],
    [/^(Collega|Collegate)\s+/i, 'Collegamento '],
    [/^(Inserisci|Inserite)\s+/i, 'Inserimento '],
    [/^(Osserva|Osservate)\s+/i, 'Osservazione '],
    [/^(Spiega|Spiegate)\s+/i, 'Spiegazione '],
    [/^(Fai|Fate)\s+/i, ''],
    [/^Prova\s+a\s+/i, 'Tentativo '],
    [/^(Non\s+dare|Non\s+fare)\s+/i, 'Differire: '],
    [/^Usa\s+/i, 'Uso '],
    [/^Apri\s+/i, 'Apertura '],
    [/^Chiudi\s+/i, 'Chiusura '],
    [/^Verifica\s+/i, 'Verifica '],
    [/^Controlla\s+/i, 'Controllo '],
  ];
  for (const [re, repl] of patterns) {
    if (re.test(s)) {
      s = s.replace(re, repl);
      break;
    }
  }
  return s;
}

/**
 * Extract docente-facing sidebar fields from a lesson-path phase.
 * Tutti i campi neutri/nominali (PRINCIPIO ZERO).
 */
export function extractDocenteSidebar(phase) {
  const stepRaw = phase.teacher_message ?? phase.teacher_tip ?? 'Step in corso.';
  const stepCorrente = nominalize(stepRaw);
  const note = [];
  if (phase.teacher_tip) note.push(nominalize(phase.teacher_tip));
  const erroriTipici = (phase.common_mistakes ?? []).map((cm) => ({
    problema: cm.mistake ?? 'errore',
    soluzione_neutra: nominalize(cm.teacher_response ?? cm.fix ?? 'correzione'),
  }));
  const spunto = phase.provocative_question
    ? `Domanda: '${phase.provocative_question}'`
    : null;
  return {
    step_corrente: stepCorrente,
    spunto_per_classe: spunto,
    note,
    errori_tipici: erroriTipici,
  };
}

/**
 * Compare 2 circuit intents. Returns 'from_scratch' if drastically different,
 * 'incremental_from_prev' if <=2 component delta AND includes common base (breadboard).
 */
export function inferBuildMode(currIntent, prevIntent) {
  if (!prevIntent) return 'from_scratch';
  const currTypes = (currIntent?.components ?? []).map((c) => c.type);
  const prevTypes = (prevIntent?.components ?? []).map((c) => c.type);
  const commonCount = currTypes.filter((t) => prevTypes.includes(t)).length;
  const totalUnique = new Set([...currTypes, ...prevTypes]).size;
  const delta = totalUnique - commonCount;
  const hasBreadboard =
    currTypes.includes('breadboard-half') || currTypes.includes('breadboard');
  if (delta <= 2 && commonCount >= 2 && hasBreadboard) return 'incremental_from_prev';
  return 'from_scratch';
}

/**
 * Infer incremental_mode for a transition between 2 circuits (only when incremental).
 * remove | add | modify
 */
export function inferIncrementalMode(currIntent, prevIntent) {
  if (!prevIntent || !currIntent) return 'from_scratch';
  const currCount = (currIntent.components ?? []).length;
  const prevCount = (prevIntent.components ?? []).length;
  if (currCount < prevCount) return 'remove_component';
  if (currCount > prevCount) return 'add_component';
  return 'modify_component';
}

/**
 * Build a complete Capitolo object from volume metadata + lesson-paths.
 * volumeCapMeta = entry from volume-structure.json `volumes.volN.capitoli[]`
 * lessonPaths = array of lesson-path JSON objects (may be empty for theory/wip)
 * volumeNum = 1 | 2 | 3
 */
export function buildCapitoloFromLessonPaths(volumeCapMeta, lessonPaths, volumeNum) {
  const esperimenti = [];
  let prevIntent = null;
  const sortedLessons = [...lessonPaths].sort((a, b) =>
    String(a.experiment_id).localeCompare(String(b.experiment_id))
  );

  for (let idx = 0; idx < sortedLessons.length; idx++) {
    const lp = sortedLessons[idx];
    const currIntent = lp.phases?.find((p) => p.build_circuit)?.build_circuit?.intent ?? null;
    const mode = inferBuildMode(currIntent, prevIntent);

    let buildCircuit;
    if (mode === 'from_scratch') {
      buildCircuit = {
        mode: 'from_scratch',
        intent: currIntent ?? { components: [], wires: [] },
      };
    } else {
      buildCircuit = {
        mode: 'incremental_from_prev',
        incremental_delta: {
          base_experiment_id: sortedLessons[idx - 1].experiment_id,
          operations: [{ op: 'modify', target: 'circuit', params: { intent: currIntent } }],
        },
      };
    }

    esperimenti.push({
      id: lp.experiment_id,
      num: lp.chapter && lp.experiment_id.includes('esp')
        ? parseInt(lp.experiment_id.match(/esp(\d+)/)?.[1] ?? '1', 10)
        : idx + 1,
      title_classe: lp.title ?? 'Esperimento',
      title_docente: lp.title ?? 'Esperimento',
      volume_ref: {
        page_start: volumeCapMeta.page_start ?? 5,
        page_end: volumeCapMeta.page_end ?? 10,
        fig_refs: [],
      },
      duration_minutes: lp.duration_minutes ?? 45,
      components_needed: (lp.components_needed ?? []).map((c) => ({
        name: c.name ?? 'componente',
        quantity: c.quantity ?? 1,
        icon: c.icon ?? 'component',
      })),
      build_circuit: buildCircuit,
      phases: (lp.phases ?? []).map((ph) => ({
        name: ph.name ?? 'PREPARA',
        duration_minutes: ph.duration_minutes ?? 5,
        classe_display: extractClasseDisplay(ph),
        docente_sidebar: extractDocenteSidebar(ph),
        action_tags: Array.isArray(ph.action_tags) ? ph.action_tags : [],
        auto_action: ph.auto_action ?? null,
      })),
      assessment_invisible: lp.assessment_invisible ?? [],
      session_save: {
        concepts_covered: lp.session_save?.concepts_covered ?? [],
        next_suggested: lp.session_save?.next_suggested ?? null,
        resume_message: lp.session_save?.resume_message ?? '',
      },
    });
    if (currIntent) prevIntent = currIntent;
  }

  // Build narrative_flow transitions from class_hook of lessons 2..N
  const transitions = [];
  for (let idx = 1; idx < sortedLessons.length; idx++) {
    const prev = sortedLessons[idx - 1];
    const curr = sortedLessons[idx];
    const prepareHook = curr.phases?.find((p) => p.name === 'PREPARA')?.class_hook ?? '';
    const incMode = inferIncrementalMode(
      curr.phases?.find((p) => p.build_circuit)?.build_circuit?.intent ?? null,
      prev.phases?.find((p) => p.build_circuit)?.build_circuit?.intent ?? null
    );
    transitions.push({
      between: [prev.experiment_id, curr.experiment_id],
      text_classe: prepareHook || `Continuiamo dopo ${prev.title ?? 'precedente'}.`,
      text_docente_action: curr.phases?.[0]?.teacher_tip ?? 'Prosegui con il prossimo esperimento.',
      incremental_mode: incMode === 'from_scratch' ? 'from_scratch' : incMode,
    });
  }

  const narrativeFlow = sortedLessons.length > 0
    ? {
        intro_text: volumeCapMeta.titolo ?? 'Capitolo',
        transitions,
        closing_text: sortedLessons[sortedLessons.length - 1]?.session_save?.resume_message ?? 'Fine capitolo.',
      }
    : undefined;

  const cap = {
    id: volumeCapMeta.id ?? `v${volumeNum}-cap${volumeCapMeta.num}`,
    volume: volumeNum,
    capitolo: volumeCapMeta.num ?? null,
    type: volumeCapMeta.type === 'experiment' ? 'experiment'
      : volumeCapMeta.type === 'project' ? 'project'
      : volumeCapMeta.type === 'wip' ? 'wip'
      : volumeCapMeta.type === 'bonus' ? 'bonus'
      : 'theory',
    titolo: volumeCapMeta.titolo ?? 'Capitolo',
    titolo_classe: volumeCapMeta.titolo ?? 'Capitolo',
    pageStart: volumeCapMeta.page_start ?? null,
    pageEnd: volumeCapMeta.page_end ?? null,
    theory: {
      testo_classe: volumeCapMeta.titolo ? `${volumeCapMeta.titolo}.` : '',
      citazioni_volume: [],
      figure_refs: [],
      analogies_classe: [],
    },
    esperimenti,
  };
  if (narrativeFlow) cap.narrative_flow = narrativeFlow;
  return cap;
}

// ====================================================================
// MAIN MIGRATION — reads real files
// ====================================================================

function loadLessonPath(filename) {
  const full = join(LESSON_PATHS_DIR, filename);
  return JSON.parse(readFileSync(full, 'utf8'));
}

function loadVolumeStructure() {
  return JSON.parse(readFileSync(VOLUME_STRUCTURE_FILE, 'utf8'));
}

/**
 * Main migration entrypoint.
 * Returns array of 35 Capitolo objects (14 Vol1 + 12 Vol2 + 9 Vol3) + 2 bonus.
 * Total: 35 cap-mapped + 2 bonus = 37 Capitoli objects.
 * But returns 35 as Andrea decisions: bonus are separate tier counted outside 35.
 * Actually we return all 37 for completeness; tests validate based on type filter.
 *
 * Architecture:
 *  - For Vol1/Vol2: iterate volume-structure.json capitoli, build from lesson-paths
 *  - For Vol3:
 *    - Cap 1-8: normal build from lesson-paths
 *    - Cap 9: PROMOTE v3-extra-simon.json as capstone (type=project)
 *    - v3-extras lcd-hello + servo-sweep: 2 separate bonus Capitoli
 */
export function migrateAll() {
  const volumeStructure = loadVolumeStructure();
  const lessonPathFiles = readdirSync(LESSON_PATHS_DIR).filter(
    (f) => f.endsWith('.json') && f !== 'index.js'
  );
  const lessonsByFile = new Map();
  for (const f of lessonPathFiles) {
    lessonsByFile.set(f.replace('.json', ''), loadLessonPath(f));
  }

  const capitoli = [];

  // Process 3 volumes
  for (const volKey of ['vol1', 'vol2', 'vol3']) {
    const vol = volumeStructure.volumes[volKey];
    const volNum = parseInt(volKey.replace('vol', ''), 10);
    for (const capMeta of vol.capitoli) {
      const tutorFiles = capMeta.tutor_files ?? [];
      const lessonPaths = tutorFiles
        .map((id) => lessonsByFile.get(id))
        .filter(Boolean);

      // Vol3 Cap 9 SPECIAL — promote simon from extras
      if (volKey === 'vol3' && capMeta.num === 9) {
        const simon = lessonsByFile.get('v3-extra-simon');
        if (simon) {
          const simonPromoted = {
            ...simon,
            experiment_id: 'v3-cap9-esp1',
            chapter: 9,
          };
          const promotedMeta = {
            ...capMeta,
            type: 'project',
            titolo: simon.chapter_title ?? simon.title ?? 'Progetto Capstone Vol 3 — Simon Says',
            page_start: 85,
            page_end: 92,
          };
          capitoli.push(buildCapitoloFromLessonPaths(promotedMeta, [simonPromoted], volNum));
          continue;
        }
      }

      // Theory / WIP / standard experiment
      capitoli.push(buildCapitoloFromLessonPaths(capMeta, lessonPaths, volNum));
    }
  }

  // Vol3 extras as bonus Capitoli
  const bonusSources = [
    { id: 'v3-bonus-lcd-hello', fileId: 'v3-extra-lcd-hello', order: 1 },
    { id: 'v3-bonus-servo-sweep', fileId: 'v3-extra-servo-sweep', order: 2 },
  ];
  for (const bs of bonusSources) {
    const src = lessonsByFile.get(bs.fileId);
    if (!src) continue;
    const bonusPromoted = {
      ...src,
      experiment_id: `${bs.id}-esp1`,
      chapter: 0,
    };
    const bonusMeta = {
      id: bs.id,
      num: null,
      titolo: src.chapter_title ?? src.title ?? 'Progetto Bonus',
      page_start: 5,
      page_end: 5,
      type: 'bonus',
      tutor_files: [src.experiment_id],
    };
    const cap = buildCapitoloFromLessonPaths(bonusMeta, [bonusPromoted], 3);
    cap.capitolo = null;
    cap.pageStart = null;
    cap.pageEnd = null;
    cap.type = 'bonus';
    capitoli.push(cap);
  }

  return capitoli;
}
