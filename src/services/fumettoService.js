/**
 * fumettoService — runtime validation + pilot generation helpers for Tea fumetto
 * schema.
 *
 * Sprint U iter 70 Team D — UI overhaul + Tea materials integration.
 *
 * Source of truth: `src/data/fumetto-schema.json` (12.4KB JSON Schema 2020-12,
 * canonical from Tea `/VOLUME 3/TEA/Nuovo lavoro tea/fumetto_schema.json`).
 *
 * This service offers:
 *   - validateFumettoPayload(payload): { valid, errors[], warnings[] }
 *       Lightweight runtime validator (subset of JSON Schema — required fields,
 *       enum values, string length, panel range). NOT a full Ajv validator
 *       (we avoid adding ajv dependency iter 70 D — defer iter 71+ if needed).
 *   - generatePilotFumetto(input): canonical payload with 6 placeholder panels
 *       per Tea spec (problema → ipotesi → errore → click → successo → ponte).
 *       Used for: dev tooling, fumetto preview, Album empty-state preview, tests.
 *
 * Honesty caveats:
 *   - validateFumettoPayload is SUBSET validator (top-level required + panel
 *     enums + balloon word count). Full JSON Schema compliance defer ajv iter 71+.
 *   - generatePilotFumetto produces SYNTHETIC placeholder content (Tea spec
 *     analogies + Vol/pag verbatim) — NOT LLM-generated. Wire-up to Edge
 *     Function `unlim-fumetto` defer iter 71+ (no Edge Function exists yet).
 *   - principioZero rules pre-populated as `true` for placeholders — real
 *     payloads MUST be re-validated post-LLM via `principio-zero-validator.ts`.
 *
 * Andrea Marro — 2026-05-16 PM iter 70 Team D
 */

import fumettoSchema from '../data/fumetto-schema.json';

/** Canonical enum values mirrored from `src/data/fumetto-schema.json` for
 *  defensive runtime checks (avoid full $ref resolution).
 */
export const FUMETTO_ENUMS = Object.freeze({
  panelRoles: ['problema', 'ipotesi', 'errore', 'click', 'successo', 'ponte'],
  tagColors: ['navy', 'lime', 'orange', 'red'],
  speakers: ['docente', 'unlim', 'studente'],
  ageBands: ['8-10', '11-13', '14+'],
  kitDotazione: ['basic', 'advanced', 'custom'],
  renderFormats: ['pdf', 'png', 'svg-web'],
  renderSizes: ['A4-portrait', 'A4-landscape', '16:9-screen'],
  sceneTypes: [
    'classroom-hook',
    'students-tinkering',
    'broken-circuit',
    'metaphor-illumination',
    'circuit-working',
    'cliffhanger',
  ],
});

export const WORD_LIMIT_PER_BALLOON = 60;
export const MIN_PANELS = 4;
export const MAX_PANELS = 6;

/**
 * Cheap word counter (whitespace split + non-empty).
 * Mirrors `wordCount` field semantics in schema.
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validate experimentId matches canonical pattern v[1-3]-cap<n>-esp<n>.
 */
const EXPERIMENT_ID_RE = /^v[1-3]-cap[0-9]+-esp[0-9]+$/;
export function isValidExperimentId(id) {
  return typeof id === 'string' && EXPERIMENT_ID_RE.test(id);
}

/**
 * Lightweight runtime validator for fumetto payload.
 * Returns: { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateFumettoPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be a non-null object');
    return { valid: false, errors, warnings };
  }

  // experimentId
  if (!isValidExperimentId(payload.experimentId)) {
    errors.push(
      `experimentId "${payload.experimentId}" must match v[1-3]-cap<n>-esp<n>`
    );
  }

  // session (required object)
  if (!payload.session || typeof payload.session !== 'object') {
    errors.push('session is required');
  } else {
    const sReq = ['classKey', 'anonStudentId', 'startedAt', 'completedAt', 'durationSec'];
    for (const k of sReq) {
      if (payload.session[k] === undefined || payload.session[k] === null) {
        errors.push(`session.${k} is required`);
      }
    }
    if (
      payload.session.ageBand &&
      !FUMETTO_ENUMS.ageBands.includes(payload.session.ageBand)
    ) {
      errors.push(`session.ageBand "${payload.session.ageBand}" not in enum`);
    }
  }

  // panels (required array, 4-6)
  if (!Array.isArray(payload.panels)) {
    errors.push('panels must be an array');
  } else {
    if (payload.panels.length < MIN_PANELS || payload.panels.length > MAX_PANELS) {
      errors.push(
        `panels.length must be between ${MIN_PANELS} and ${MAX_PANELS} (got ${payload.panels.length})`
      );
    }
    payload.panels.forEach((p, i) => {
      const ctx = `panels[${i}]`;
      if (!FUMETTO_ENUMS.panelRoles.includes(p.role)) {
        errors.push(`${ctx}.role "${p.role}" not in enum`);
      }
      if (p.tagColor && !FUMETTO_ENUMS.tagColors.includes(p.tagColor)) {
        errors.push(`${ctx}.tagColor "${p.tagColor}" not in enum`);
      }
      if (typeof p.index !== 'number' || p.index < 1 || p.index > MAX_PANELS) {
        errors.push(`${ctx}.index must be integer 1-${MAX_PANELS}`);
      }
      if (Array.isArray(p.balloons)) {
        p.balloons.forEach((b, j) => {
          const bctx = `${ctx}.balloons[${j}]`;
          if (!FUMETTO_ENUMS.speakers.includes(b.speaker)) {
            errors.push(`${bctx}.speaker "${b.speaker}" not in enum`);
          }
          const wc = countWords(b.text);
          if (wc > WORD_LIMIT_PER_BALLOON) {
            errors.push(
              `${bctx} exceeds ${WORD_LIMIT_PER_BALLOON} word limit (got ${wc})`
            );
          }
          if (typeof b.wordCount === 'number' && b.wordCount !== wc) {
            warnings.push(
              `${bctx}.wordCount claimed ${b.wordCount} but actual is ${wc}`
            );
          }
        });
      }
    });
  }

  // principioZero (required object)
  if (!payload.principioZero || typeof payload.principioZero !== 'object') {
    errors.push('principioZero is required');
  } else if (typeof payload.principioZero.score === 'number') {
    if (
      payload.principioZero.score < 0 ||
      payload.principioZero.score > 100
    ) {
      errors.push('principioZero.score must be in 0-100');
    }
  }

  // rendering
  if (!payload.rendering || typeof payload.rendering !== 'object') {
    errors.push('rendering is required');
  } else {
    if (
      payload.rendering.format &&
      !FUMETTO_ENUMS.renderFormats.includes(payload.rendering.format)
    ) {
      errors.push(`rendering.format "${payload.rendering.format}" not in enum`);
    }
    if (
      payload.rendering.size &&
      !FUMETTO_ENUMS.renderSizes.includes(payload.rendering.size)
    ) {
      errors.push(`rendering.size "${payload.rendering.size}" not in enum`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Generate a canonical pilot fumetto payload for tests / dev preview.
 * Input is optional; produces a deterministic minimal placeholder that
 * passes `validateFumettoPayload()` for the canonical exp v1-cap6-esp1 (LED).
 */
export function generatePilotFumetto(input = {}) {
  const experimentId = input.experimentId || 'v1-cap6-esp1';
  if (!isValidExperimentId(experimentId)) {
    throw new Error(
      `generatePilotFumetto: invalid experimentId "${experimentId}"`
    );
  }
  const now = input.now || new Date('2026-05-16T10:00:00.000Z').toISOString();
// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
  const fivemin = new Date(
    new Date(now).getTime() + 5 * 60 * 1000
  ).toISOString();
  const classKey = input.classKey || 'classe-3a-demo';
  const anonStudentId =
    input.anonStudentId || '00000000-0000-4000-8000-000000000001';

  const panels = [
    {
      index: 1,
      role: 'problema',
      title: 'Il problema',
      tagColor: 'navy',
      scene: { sceneType: 'classroom-hook', components: ['LED', 'breadboard'] },
      balloons: [
        {
          speaker: 'docente',
          text:
            'Ragazzi, oggi accendiamo un LED senza che si bruci. Cosa serve, secondo voi?',
          wordCount: 13,
          containsCitation: false,
          containsAnalogy: false,
        },
      ],
      caption: 'CAP. 6 — I LED',
      captionColor: 'navy',
    },
    {
      index: 2,
      role: 'ipotesi',
      title: "L'ipotesi",
      tagColor: 'lime',
      scene: { sceneType: 'students-tinkering', components: ['LED', 'batteria'] },
      balloons: [
        {
          speaker: 'studente',
          text: 'Forse con la batteria 9V e il LED collegato.',
          wordCount: 8,
          containsCitation: false,
          containsAnalogy: false,
        },
      ],
      caption: 'IPOTESI',
      captionColor: 'lime',
    },
    {
      index: 3,
      role: 'errore',
      title: "L'errore",
      tagColor: 'red',
      scene: { sceneType: 'broken-circuit', stateOverride: 'led-burning' },
      balloons: [
        {
          speaker: 'unlim',
          text:
            'Ragazzi, attenzione: senza resistore il LED brucia subito. Vol.1 pag.78 lo spiega.',
          wordCount: 14,
          containsCitation: true,
          containsAnalogy: false,
        },
      ],
      caption: 'NO RESISTORE = NO LUCE',
      captionColor: 'orange',
    },
    {
      index: 4,
      role: 'click',
      title: 'Il click',
      tagColor: 'orange',
      scene: { sceneType: 'metaphor-illumination', components: ['resistore'] },
      balloons: [
        {
          speaker: 'docente',
          text:
            'Ragazzi, il resistore è come un rubinetto: regola quanta corrente passa.',
          wordCount: 12,
          containsCitation: false,
          containsAnalogy: true,
        },
      ],
      caption: 'IL RUBINETTO',
      captionColor: 'orange',
    },
    {
      index: 5,
      role: 'successo',
      title: 'Il successo',
      tagColor: 'lime',
      scene: { sceneType: 'circuit-working', stateOverride: 'led-on' },
      balloons: [
        {
          speaker: 'studente',
          text: 'Funziona! Si è acceso il LED. Vol.1 pag.78.',
          wordCount: 8,
          containsCitation: true,
          containsAnalogy: false,
        },
      ],
      caption: 'CIRCUITO CHIUSO ✓',
      captionColor: 'lime',
    },
    {
      index: 6,
      role: 'ponte',
      title: 'Il ponte',
      tagColor: 'navy',
      scene: { sceneType: 'cliffhanger' },
      balloons: [
        {
          speaker: 'unlim',
          text:
            'Ragazzi, prossima volta: come si accende un LED rosso e uno verde insieme?',
          wordCount: 13,
          containsCitation: false,
          containsAnalogy: false,
        },
      ],
      caption: 'PROSSIMA TAPPA',
      captionColor: 'navy',
    },
  ];

  return {
    experimentId,
    session: {
      classKey,
      anonStudentId,
      startedAt: now,
      completedAt: fivemin,
      durationSec: 300,
      ageBand: input.ageBand || '11-13',
      kitDotazione: 'basic',
    },
    volumeContext: {
      volume: 1,
      chapter: 6,
      chapterTitle: "Cos'è il diodo LED?",
      experimentTitle: 'Accendi il primo LED',
      page: 78,
      verbatimText: 'Il LED ha bisogno del resistore per non bruciarsi.',
    },
    componentsUsed: [
      { name: 'LED rosso', kitId: 'led-red-5mm', quantity: 1, color: 'red' },
      { name: 'Resistore 470Ω', kitId: 'r-470', quantity: 1 },
      { name: 'Breadboard', kitId: 'bb-830', quantity: 1 },
      { name: 'Batteria 9V', kitId: 'bat-9v', quantity: 1 },
    ],
    studentJourney: {
      mistakesMade: [
        {
          type: 'missing-resistor',
          description: 'Inizio senza resistore, LED bruciato',
          atSec: 120,
        },
      ],
      mistakesOvercome: ['missing-resistor'],
      variationsTriedSpontaneously: [],
      helpRequestsCount: 1,
      abandonedSteps: [],
    },
    panels,
    principioZero: {
      score: 100,
      passed: true,
      rules: {
        openerRagazzi: true,
        citationVerbatim: true,
        wordLimit60: true,
        noImperativeToTeacher: true,
        kitProtagonist: true,
        hasAnalogy: true,
        elabPalette: true,
        canonicalChapterTitle: true,
        componentsCanonical: true,
        noGalileoName: true,
        morphicAge: true,
        cliffhangerToNext: true,
      },
    },
    rendering: {
      format: 'pdf',
      size: 'A4-portrait',
      outputPath: `fumetti/${anonStudentId}/${experimentId}.pdf`,
      albumPersistence: true,
    },
    morphicHints: {
      teacherStyle: 'laboratoriale',
      studentLevel: 'basic',
      previousConcepts: [],
      preferredAnalogies: ['rubinetti', 'porte'],
    },
  };
}

/**
 * Public helper: schema metadata exposed for diagnostic UI tooling.
 */
export function getFumettoSchemaMeta() {
  return {
    id: fumettoSchema.$id,
// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
    version: fumettoSchema.version,
    title: fumettoSchema.title,
  };
}

export default {
  validateFumettoPayload,
  generatePilotFumetto,
  countWords,
  isValidExperimentId,
  getFumettoSchemaMeta,
  FUMETTO_ENUMS,
  WORD_LIMIT_PER_BALLOON,
  MIN_PANELS,
  MAX_PANELS,
};
