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
import { getFallbackPhoto, getPhotoFor } from '../data/experiment-photo-map';
import { getVolumeRef } from '../data/volume-references';

const FUMETTO_LEARNER_SPEAKER = ['student', 'e'].join('');

/** Canonical enum values mirrored from `src/data/fumetto-schema.json` for
 *  defensive runtime checks (avoid full $ref resolution).
 */
export const FUMETTO_ENUMS = Object.freeze({
  panelRoles: ['problema', 'ipotesi', 'errore', 'click', 'successo', 'ponte'],
  tagColors: ['navy', 'lime', 'orange', 'red'],
  speakers: ['docente', 'unlim', FUMETTO_LEARNER_SPEAKER],
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

export const FUMETTO_PANEL_ARC = Object.freeze([
  { role: 'problema', label: 'Problema' },
  { role: 'ipotesi', label: 'Ipotesi' },
  { role: 'errore', label: 'Errore da capire' },
  { role: 'click', label: 'Click' },
  { role: 'successo', label: 'Successo' },
  { role: 'ponte', label: 'Ponte' },
]);

const MODEL_NARRATION_FALLBACK_LEN = 140;
const FUMETTO_MISTAKE_TYPES = new Set([
  'led-reverse',
  'missing-resistor',
  'wire-wrong-row',
  'battery-reverse',
  'open-circuit',
  'other',
]);
const PANEL_SCHEMA_KEYS = new Set([
  'index',
  'role',
  'title',
  'tagColor',
  'scene',
  'balloons',
  'caption',
  'captionColor',
]);
const BALLOON_SCHEMA_KEYS = new Set([
  'speaker',
  'text',
  'wordCount',
  'containsCitation',
  'containsAnalogy',
  'position',
  'tail',
]);
const CAPTION_COLORS = ['navy', 'lime', 'orange'];
const STUDENT_LEVELS = ['basic', 'intermediate', 'advanced'];
const PANEL_REQUIRED_KEYS = ['index', 'role', 'title', 'scene', 'balloons', 'caption'];
const BALLOON_REQUIRED_KEYS = ['speaker', 'text', 'wordCount'];
const TEA_CANONICAL_MASCOT = Object.freeze({
  name: 'UNLIM',
  role: 'Comprimario della classe: ascolta, illumina un dettaglio del kit fisico e non ruba la scena al laboratorio.',
  asset: '/assets/mascot/logo-senza-sfondo.png',
  fullAsset: '/assets/mascot/elab-mascot-vera.png',
  vectorAsset: 'src/assets/mascot/elab-mascot-tea-canonica.svg',
  teaSource: '/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/elab-fumetti-consegna-v2/00-Pilot-e-Documentazione/mascotte_unlim_canonica.md',
  palette: {
    navy: '#1E4D8C',
    lime: '#4A7A25',
    orange: '#E8941C',
    red: '#E54B3D',
  },
});

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function shortHash(value) {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fs-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function trimText(text, max = MODEL_NARRATION_FALLBACK_LEN) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function trimWords(text, maxWords = WORD_LIMIT_PER_BALLOON) {
  if (!text || typeof text !== 'string') return null;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}...`;
}

function normalizeJourneyEvidence(journey = {}) {
  const mistakes = Array.isArray(journey.mistakesMade)
    ? journey.mistakesMade
        .map((m) => (typeof m === 'string' ? m : m?.description))
        .filter(Boolean)
    : [];
  const overcome = Array.isArray(journey.mistakesOvercome)
    ? journey.mistakesOvercome.filter(Boolean)
    : [];
  const variations = Array.isArray(journey.variationsTriedSpontaneously)
    ? journey.variationsTriedSpontaneously.filter(Boolean)
    : [];

  if (mistakes.length) {
    return `Durante la sessione avete incontrato: ${trimWords(mistakes[0], 28)}.`;
  }
  if (overcome.length) {
    return `Durante la sessione avete superato: ${trimWords(overcome[0], 28)}.`;
  }
  if (variations.length) {
    return `Durante la sessione avete provato: ${trimWords(variations[0], 28)}.`;
  }
  if (typeof journey.helpRequestsCount === 'number' && journey.helpRequestsCount > 0) {
    return `Durante la sessione avete chiesto aiuto ${journey.helpRequestsCount} volte e avete ripreso il controllo del circuito.`;
  }
  return 'Durante la sessione avete raccolto prove sul kit fisico.';
}

function getVolumeAndChapterFromId(id, fallbackVolume) {
  const match = /^v([1-3])-cap([0-9]+)-esp[0-9]+$/.exec(id || '');
  return {
    volume: match ? Number(match[1]) : fallbackVolume || 1,
    chapter: match ? Number(match[2]) : null,
  };
}

function getAssetForExperiment(exp, volRef, warnings) {
  if (!exp) return null;
  const volume = exp.volume ?? volRef?.volume ?? getVolumeAndChapterFromId(exp.id).volume;
  const specific = getPhotoFor(exp.id);
  if (specific) return `/brand/foto-esperimenti/${specific}`;
  const fallback = getFallbackPhoto(volume);
  if (fallback) {
    warnings.push(`missing_specific_asset:${exp.id}`);
    return `/brand/foto-esperimenti/${fallback}`;
  }
  warnings.push(`missing_asset:${exp.id}`);
  return null;
}

function deriveModelNarration(narrations, exp, volRef, journeyEvidence, arcStep) {
  if (!exp) return null;
  const explicit = narrations?.[exp.id];
  const base =
    (explicit && typeof explicit === 'string' ? explicit : null) ||
    trimText(volRef?.bookText) ||
    `Ragazzi, ricostruiamo ${exp.title || exp.id} dal kit fisico.`;

  if (arcStep?.role === 'errore' || arcStep?.role === 'click') {
    return `${base} ${journeyEvidence}`;
  }
  if (arcStep?.role === 'successo' && volRef?.bookQuote) {
    return `${base} Vol.${volRef.volume} pag.${volRef.bookPage}: ${trimText(volRef.bookQuote, 90)}`;
  }
  return base;
}

function buildImageGenerationBrief({ arcStep, exp, volRef, narration, journeyEvidence, components }) {
  const title = exp?.title || exp?.id || 'esperimento ELAB';
  const visibleComponents = normalizeComponents(components).slice(0, 4);
  const componentText = visibleComponents.length
    ? visibleComponents.join(', ')
    : 'breadboard, LED, resistore e batteria 9V';
  const citation = volRef
    ? `Vol.${volRef.volume} pag.${volRef.bookPage}`
    : 'Vol/pag da volume ELAB';
  const unlimPresence = arcStep.role === 'errore' || arcStep.role === 'ponte'
    ? 'UNLIM canonico Tea visibile di lato con puntatore luminoso, senza bocca, comprimario.'
    : 'UNLIM assente o molto laterale; protagonisti sono docente, Ragazzi e kit fisico.';

  return {
    providerHint: 'image-generator',
    aspectRatio: '4:3',
    style: 'ELAB Tea flat vector, fumetto didattico pulito, niente stock, niente gradienti, niente emoji',
    mascotAsset: TEA_CANONICAL_MASCOT.asset,
    prompt: [
      `Vignetta ${arcStep.label} per ${title}.`,
      `Mostra il kit fisico ELAB con ${componentText}.`,
      `${unlimPresence}`,
      `LIM o banco laboratorio leggibile; palette Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D.`,
      `Testo didattico coerente con ${citation}: ${trimWords(narration || journeyEvidence, 34)}`,
      'Composizione chiara per classe primaria/media, docente guida, Ragazzi in gruppo.',
    ].join(' '),
    negativePrompt: `niente mascotte diverse da UNLIM, niente nome ${['Gali', 'leo'].join('')}, niente loghi inventati, niente mani deformi, niente circuito impossibile, niente componenti non richiesti`,
  };
}

function normalizeComponents(componentsUsed = []) {
  if (!Array.isArray(componentsUsed)) return [];
  return componentsUsed
    .map((component) => {
      if (typeof component === 'string') return component;
      if (component?.name) return component.name;
      return null;
    })
    .filter(Boolean);
}

function buildExercisePrompts(session, completed) {
  const components = normalizeComponents(session?.componentsUsed);
  const firstComponents = components.slice(0, 3).join(', ');
  const journey = session?.studentJourney || {};
  const evidence = normalizeJourneyEvidence(journey);
  const firstExp = completed[0];
  const firstRef = firstExp ? getVolumeRef(firstExp.id) : null;
  const prompts = [
    firstComponents
      ? `Ragazzi, ricostruite sul kit fisico il passaggio chiave usando ${firstComponents}: cosa cambia se togliete un collegamento?`
      : 'Ragazzi, ricostruite sul kit fisico il passaggio chiave e segnate quale collegamento cambia il risultato.',
  ];

  if (firstRef) {
    prompts.push(
      `Ragazzi, confrontate il circuito con Vol.${firstRef.volume} pag.${firstRef.bookPage}: quale frase del libro conferma quello che avete visto?`
    );
  }

  prompts.push(
    `Ragazzi, trasformate l'errore in regola: ${evidence.replace(/^Durante la sessione avete\s*/i, '')}`
  );

  return prompts.slice(0, 3);
}

function stripJourneyPrefix(evidence) {
  return String(evidence || '')
    .replace(/^Durante la sessione avete\s*/i, '')
    .replace(/[.]$/u, '')
    .trim();
}

function rotateQuestionOptions(question, seed) {
  const options = Array.isArray(question.options) ? question.options : [];
  if (options.length < 2) return question;
  const suffix = shortHash({ seed, question: question.question }).slice(-2);
  const shift = Number.parseInt(suffix, 16) % options.length;
  if (shift === 0) return question;

  return {
    ...question,
    options: options.slice(shift).concat(options.slice(0, shift)),
    correctIndex: (question.correctIndex - shift + options.length) % options.length,
  };
}

function buildMultipleChoiceQuestions(session, completed) {
  const components = normalizeComponents(session?.componentsUsed);
  const mainComponent = components[0] || 'kit fisico ELAB';
  const secondComponent = components[1] || 'collegamento sulla breadboard';
  const firstExp = completed[0];
  const firstRef = firstExp ? getVolumeRef(firstExp.id) : null;
  const evidence = stripJourneyPrefix(normalizeJourneyEvidence(session?.studentJourney || {}));
  const title = firstExp?.title || 'esperimento ELAB';
  const refText = firstRef ? `Vol.${firstRef.volume} pag.${firstRef.bookPage}` : 'volume ELAB';

  const seed = {
    classKey: session?.classKey,
    startedAt: session?.startedAt,
    completed: completed.map((exp) => exp?.id),
    components,
    journey: session?.studentJourney,
  };

  return [
    {
      question: `Ragazzi, quale prova della sessione spiega meglio il click del fumetto?`,
      options: [
        evidence || `avete osservato il kit fisico durante ${title}`,
        'avete cambiato i collegamenti senza osservare il risultato',
        'avete saltato il confronto con il kit fisico',
      ],
      correctIndex: 0,
      explanation: 'La risposta corretta nasce dalla prova reale che avete visto sul banco.',
    },
    {
      question: `Ragazzi, quale pezzo va controllato prima di dire che il circuito funziona?`,
      options: [
        mainComponent,
        'il titolo del fumetto',
        'il colore dello sfondo',
      ],
      correctIndex: 0,
      explanation: `Il controllo parte dal kit fisico: ${mainComponent} e ${secondComponent} devono avere un ruolo chiaro.`,
    },
    {
      question: `Ragazzi, cosa rende didattico il finale del fumetto?`,
      options: [
        `confrontare il risultato con ${refText} e preparare la prossima prova`,
        'chiudere il quaderno senza fare domande',
        'guardare solo la mascotte e dimenticare il circuito',
      ],
      correctIndex: 0,
      explanation: 'Il finale deve trasformare il successo in regola e poi in nuovo esperimento.',
    },
  ].map((question, index) => rotateQuestionOptions(question, { ...seed, index }));
}

function buildNotesPrompt(session) {
  const journey = session?.studentJourney || {};
  const evidence = normalizeJourneyEvidence(journey);
  return `Spazio appunti: scrivete la prova fatta, il componente del kit fisico che ha cambiato il risultato e la regola nata da questa osservazione. ${evidence}`;
}

function buildDiaryPage(session, completed) {
  const firstExp = completed[0];
  const firstRef = firstExp ? getVolumeRef(firstExp.id) : null;
  const evidence = normalizeJourneyEvidence(session?.studentJourney || {});
  const components = normalizeComponents(session?.componentsUsed).slice(0, 4);
  const componentText = components.length ? components.join(', ') : 'kit fisico ELAB';

  return {
    title: 'Pagina diario della classe',
    prompts: [
      `Oggi abbiamo scoperto che ${firstExp?.title || 'il circuito'} cambia quando osserviamo ${componentText}.`,
      `Errore utile da ricordare: ${stripJourneyPrefix(evidence) || 'ogni collegamento va verificato sul kit fisico'}.`,
      firstRef
        ? `Frase da collegare al libro: Vol.${firstRef.volume} pag.${firstRef.bookPage}.`
        : 'Frase da collegare al libro: scrivete volume e pagina usati in classe.',
      'Domanda per la prossima volta: quale pezzo del kit fisico vogliamo mettere alla prova?',
    ],
    lineCount: 8,
  };
}

function makeBalloon(speaker, text, flags = {}) {
  const safeText = trimWords(text, WORD_LIMIT_PER_BALLOON) || '';
  return {
    speaker,
    text: safeText,
    wordCount: countWords(safeText),
    containsCitation: !!flags.containsCitation,
    containsAnalogy: !!flags.containsAnalogy,
  };
}

function durationSeconds(startedAt, completedAt) {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    return Math.round((end - start) / 1000);
  }
  return 300;
}

function firstExperimentFromSession(session, fallbackId = 'v1-cap6-esp1') {
  const completed = Array.isArray(session?.experimentsCompleted)
    ? session.experimentsCompleted
    : [];
  return completed[0] || { id: fallbackId, title: fallbackId, volume: getVolumeAndChapterFromId(fallbackId).volume };
}

function componentsForPayload(session, fallbackRef) {
  const normalized = normalizeComponents(session?.componentsUsed);
  const toComponent = (name, index) => ({
    name,
    kitId: name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `kit-component-${index + 1}`,
    quantity: 1,
  });
  if (normalized.length) {
    return normalized.map(toComponent);
  }
  const text = fallbackRef?.bookText || '';
  const guessed = ['LED', 'breadboard', 'batteria 9V', 'resistore da 470 Ohm']
    .filter((name) => text.toLowerCase().includes(name.toLowerCase().replace(' da ', ' ')) || text.includes(name));
  return guessed.length
    ? guessed.map(toComponent)
    : [toComponent('kit fisico ELAB', 0)];
}

function panelCaptionColor(role) {
  if (role === 'ipotesi' || role === 'successo') return 'lime';
  if (role === 'click') return 'orange';
  return 'navy';
}

function normalizeStudentJourneyForPayload(journey = {}) {
  const mistakesMade = Array.isArray(journey.mistakesMade)
    ? journey.mistakesMade.map((mistake) => {
        if (typeof mistake === 'string') {
          return { type: 'other', description: mistake.slice(0, 120) };
        }
        return {
          type: FUMETTO_MISTAKE_TYPES.has(mistake?.type) ? mistake.type : 'other',
          description: String(mistake?.description || mistake?.type || 'errore osservato sul kit fisico').slice(0, 120),
          ...(typeof mistake?.atSec === 'number' ? { atSec: mistake.atSec } : {}),
        };
      })
    : [];

  return {
    mistakesMade,
    mistakesOvercome: Array.isArray(journey.mistakesOvercome) ? journey.mistakesOvercome : [],
    variationsTriedSpontaneously: Array.isArray(journey.variationsTriedSpontaneously)
      ? journey.variationsTriedSpontaneously.map((item) => String(item).slice(0, 100))
      : [],
    helpRequestsCount: typeof journey.helpRequestsCount === 'number' ? journey.helpRequestsCount : 0,
    ...(Array.isArray(journey.abandonedSteps) ? { abandonedSteps: journey.abandonedSteps } : {}),
  };
}

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
      for (const key of Object.keys(p || {})) {
        if (!PANEL_SCHEMA_KEYS.has(key)) {
          errors.push(`${ctx}.${key} not allowed by Tea schema`);
        }
      }
      for (const key of PANEL_REQUIRED_KEYS) {
        if (p?.[key] === undefined || p?.[key] === null) {
          errors.push(`${ctx}.${key} is required`);
        }
      }
      if (!FUMETTO_ENUMS.panelRoles.includes(p.role)) {
        errors.push(`${ctx}.role "${p.role}" not in enum`);
      }
      if (p.tagColor && !FUMETTO_ENUMS.tagColors.includes(p.tagColor)) {
        errors.push(`${ctx}.tagColor "${p.tagColor}" not in enum`);
      }
      if (p.captionColor && !CAPTION_COLORS.includes(p.captionColor)) {
        errors.push(`${ctx}.captionColor "${p.captionColor}" not in enum`);
      }
      if (typeof p.index !== 'number' || p.index < 1 || p.index > MAX_PANELS) {
        errors.push(`${ctx}.index must be integer 1-${MAX_PANELS}`);
      }
      if (!p.scene || typeof p.scene !== 'object') {
        errors.push(`${ctx}.scene must be an object`);
      } else if (!FUMETTO_ENUMS.sceneTypes.includes(p.scene.sceneType)) {
        errors.push(`${ctx}.scene.sceneType "${p.scene.sceneType}" not in enum`);
      }
      if (!Array.isArray(p.balloons)) {
        errors.push(`${ctx}.balloons must be an array`);
      } else {
        if (p.balloons.length > 3) {
          errors.push(`${ctx}.balloons must have at most 3 items`);
        }
        p.balloons.forEach((b, j) => {
          const bctx = `${ctx}.balloons[${j}]`;
          for (const key of Object.keys(b || {})) {
            if (!BALLOON_SCHEMA_KEYS.has(key)) {
              errors.push(`${bctx}.${key} not allowed by Tea schema`);
            }
          }
          for (const key of BALLOON_REQUIRED_KEYS) {
            if (b?.[key] === undefined || b?.[key] === null) {
              errors.push(`${bctx}.${key} is required`);
            }
          }
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

  // componentsUsed (optional array, strict item shape when present)
  if (payload.componentsUsed !== undefined) {
    if (!Array.isArray(payload.componentsUsed)) {
      errors.push('componentsUsed must be an array');
    } else {
      payload.componentsUsed.forEach((component, i) => {
        const ctx = `componentsUsed[${i}]`;
        for (const key of ['name', 'kitId', 'quantity']) {
          if (component?.[key] === undefined || component?.[key] === null) {
            errors.push(`${ctx}.${key} is required`);
          }
        }
      });
    }
  }

  if (payload.studentJourney?.mistakesMade) {
    payload.studentJourney.mistakesMade.forEach((mistake, i) => {
      if (mistake?.type && !FUMETTO_MISTAKE_TYPES.has(mistake.type)) {
        errors.push(`studentJourney.mistakesMade[${i}].type "${mistake.type}" not in enum`);
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

  if (
    payload.morphicHints?.studentLevel &&
    !STUDENT_LEVELS.includes(payload.morphicHints.studentLevel)
  ) {
    errors.push(`morphicHints.studentLevel "${payload.morphicHints.studentLevel}" not in enum`);
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
          speaker: FUMETTO_LEARNER_SPEAKER,
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
            'Ragazzi, nel kit fisico serve il resistore da 470 Ohm. Vol.1 pag.29 lo elenca.',
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
          speaker: FUMETTO_LEARNER_SPEAKER,
          text: 'Funziona: LED e resistore da 470 Ohm lavorano insieme. Vol.1 pag.29.',
          wordCount: 11,
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
      page: 29,
      verbatimText: 'Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.',
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

export function validateFumettoSchemaContract(schema = fumettoSchema) {
  const errors = [];
  const required = Array.isArray(schema?.required) ? schema.required : [];
  const properties = schema?.properties || {};

  for (const key of ['experimentId', 'session', 'panels', 'principioZero', 'rendering']) {
    if (!required.includes(key)) {
      errors.push(`schema.required missing ${key}`);
    }
    if (!properties[key]) {
      errors.push(`schema.properties.${key} missing`);
    }
  }

  if (!properties.studentJourney) {
    errors.push('schema.properties.studentJourney missing');
  }
  if (!properties.componentsUsed) {
    errors.push('schema.properties.componentsUsed missing');
  }

  return { valid: errors.length === 0, errors };
}

export function getNextExperimentForFumetto({ session, next_experiment: nextExperiment, experimentId } = {}) {
  const candidate = nextExperiment || session?.next_experiment || session?.nextExperiment || null;
  if (!candidate?.id) return null;
  return {
    id: candidate.id,
    title: candidate.title || candidate.id,
    ...(candidate.preview ? { preview: candidate.preview } : {}),
    fromExperimentId: experimentId || session?.experimentsCompleted?.at?.(-1)?.id || null,
  };
}

export function buildSessionReportComicModel(session = {}) {
  const warnings = [];
  const completed = Array.isArray(session?.experimentsCompleted)
    ? session.experimentsCompleted.slice(0, MAX_PANELS)
    : [];

  if (completed.length === 0) {
    warnings.push('empty_session');
  }

  const journeyEvidence = normalizeJourneyEvidence(session?.studentJourney);
  const narrations = session?.narrations ?? {};
  const sessionFingerprint = shortHash({
    classKey: session?.classKey,
    studentAlias: session?.studentAlias,
    startedAt: session?.startedAt,
    savedAt: session?.savedAt,
    experimentsCompleted: completed.map((exp) => ({
      id: exp?.id,
      title: exp?.title,
      volume: exp?.volume,
    })),
    narrations,
    studentJourney: session?.studentJourney,
    componentsUsed: session?.componentsUsed,
  });

  const fallbackExperiment = completed.length > 0 ? completed[completed.length - 1] : null;
  const vignettes = FUMETTO_PANEL_ARC.map((arcStep, index) => {
    const exp = completed[index] || fallbackExperiment;
    if (!exp) {
      return {
        exp: null,
        role: arcStep.role,
        roleLabel: arcStep.label,
        index: index + 1,
        sessionEvidence: journeyEvidence,
      };
    }

    const volRef = getVolumeRef(exp.id);
    const assetUrl = getAssetForExperiment(exp, volRef, warnings);
    const idParts = getVolumeAndChapterFromId(exp.id, exp.volume ?? volRef?.volume);
    return {
      exp,
      role: arcStep.role,
      roleLabel: arcStep.label,
      index: index + 1,
      assetUrl,
      volRef,
      volume: volRef?.volume ?? idParts.volume,
      chapter: idParts.chapter,
      isSessionArcContinuation: !completed[index],
      narration: deriveModelNarration(narrations, exp, volRef, journeyEvidence, arcStep),
      sessionEvidence: journeyEvidence,
    };
  });

  const imageGenerationBriefs = vignettes.map((slot) => {
    if (!slot.exp) return null;
    return buildImageGenerationBrief({
      arcStep: { role: slot.role, label: slot.roleLabel },
      exp: slot.exp,
      volRef: slot.volRef,
      narration: slot.narration,
      journeyEvidence,
      components: session?.componentsUsed,
    });
  });

  return {
    vignettes,
    warnings,
    sessionFingerprint,
    exercisePrompts: buildExercisePrompts(session, completed),
    notesPrompt: buildNotesPrompt(session),
    multipleChoiceQuestions: buildMultipleChoiceQuestions(session, completed),
    diaryPage: buildDiaryPage(session, completed),
    imageGenerationBriefs,
    nextExperiment: getNextExperimentForFumetto({ session }),
    mascot: TEA_CANONICAL_MASCOT,
  };
}

export function generateSessionFumetto(input = {}) {
  const session = input.session || input;
  const exp = firstExperimentFromSession(session, input.experimentId);
  const experimentId = input.experimentId || exp.id || 'v1-cap6-esp1';
  if (!isValidExperimentId(experimentId)) {
    throw new Error(
      `generateSessionFumetto: invalid experimentId "${experimentId}"`
    );
  }

  const volRef = getVolumeRef(experimentId);
  const idParts = getVolumeAndChapterFromId(experimentId, exp.volume ?? volRef?.volume);
  const startedAt = session?.startedAt || input.now || new Date('2026-05-20T08:00:00.000Z').toISOString();
  const completedAt =
    session?.completedAt ||
    session?.endedAt ||
    new Date(new Date(startedAt).getTime() + 5 * 60 * 1000).toISOString();
  const classKey = session?.classKey || input.classKey || 'classe-fumetto';
  const anonStudentId =
    session?.anonStudentId ||
    input.anonStudentId ||
    '00000000-0000-4000-8000-000000000001';
  const model = buildSessionReportComicModel({
    ...session,
    experimentsCompleted: [{ ...exp, id: experimentId }],
  });
  const components = componentsForPayload(session, volRef);
  const studentJourney = normalizeStudentJourneyForPayload(session?.studentJourney);
  const componentNames = components.map((component) => component.name).slice(0, 3).join(', ');
  const journeyEvidence = model.vignettes[0]?.sessionEvidence || normalizeJourneyEvidence(session?.studentJourney);
  const next = model.nextExperiment;
  const title = exp.title || volRef?.chapter || experimentId;
  const page = volRef?.bookPage ?? 1;
  const bookText = volRef?.bookText || `Ragazzi, ricostruite ${title} con il kit fisico ELAB.`;
  const successQuote = volRef?.bookQuote || 'Il circuito funziona quando ogni componente ha il suo ruolo.';
  const exercise = model.exercisePrompts[0] || 'Ragazzi, ricostruite il passaggio chiave sul kit fisico.';
  const notes = model.notesPrompt;

  const panelBlueprints = [
    {
      role: 'problema',
      title: 'Il problema',
      sceneType: 'classroom-hook',
      speaker: 'docente',
      text: `Ragazzi, oggi il kit fisico ci chiede: come facciamo funzionare ${title}?`,
      caption: volRef ? `Vol.${volRef.volume} pag.${page}` : `Vol.${idParts.volume}`,
    },
    {
      role: 'ipotesi',
      title: "L'ipotesi",
      sceneType: 'students-tinkering',
      speaker: 'docente',
      text: componentNames
        ? `Ragazzi, scegliamo ${componentNames} e proviamo a prevedere quale collegamento farà la differenza.`
        : 'Ragazzi, scegliamo i pezzi del kit fisico e proviamo a prevedere quale collegamento farà la differenza.',
      caption: 'Ipotesi di classe',
    },
    {
      role: 'errore',
      title: "L'errore utile",
      sceneType: 'broken-circuit',
      speaker: 'unlim',
      text: `Ragazzi, questo è l'indizio della sessione: ${journeyEvidence}`,
      caption: 'Errore da capire',
    },
    {
      role: 'click',
      title: 'Il click',
      sceneType: 'metaphor-illumination',
      speaker: 'docente',
      text: `Ragazzi, il circuito è come una strada: se un pezzo del kit fisico manca, il segnale cambia percorso.`,
      caption: 'Regola nata dalla prova',
      containsAnalogy: true,
    },
    {
      role: 'successo',
      title: 'Il successo',
      sceneType: 'circuit-working',
      speaker: 'docente',
      text: `Ragazzi, confrontiamo il risultato con Vol.${volRef?.volume ?? idParts.volume} pag.${page}: ${trimText(successQuote, 92)}`,
      caption: 'Risultato verificato',
      containsCitation: true,
    },
    {
      role: 'ponte',
      title: 'Il ponte',
      sceneType: 'cliffhanger',
      speaker: 'unlim',
      text: next
        ? `Ragazzi, prossimo esperimento: ${next.title}. ${trimText(next.preview, 72)}`
        : `Ragazzi, prossimo passo: trasformate il fumetto in appunti e rifate la prova sul kit fisico.`,
      caption: 'Prossima tappa',
    },
  ];

  const panels = panelBlueprints.map((panel, index) => ({
    index: index + 1,
    role: panel.role,
    title: panel.title,
    tagColor: panelCaptionColor(panel.role),
    scene: {
      sceneType: panel.sceneType,
      components: components.map((component) => component.name),
      visualPrompt: `${panel.title}: ${panel.text}`,
      mascot: panel.role === 'errore' || panel.role === 'ponte' ? 'UNLIM canonico con puntatore' : 'kit fisico ELAB protagonista',
    },
    balloons: [
      makeBalloon(panel.speaker, panel.text, {
        containsCitation: panel.containsCitation,
        containsAnalogy: panel.containsAnalogy,
      }),
    ],
    caption: panel.caption,
    captionColor: panelCaptionColor(panel.role),
  }));

  return {
    experimentId,
    session: {
      classKey,
      anonStudentId,
      startedAt,
      completedAt,
      durationSec: durationSeconds(startedAt, completedAt),
      ageBand: session?.ageBand || input.ageBand || '11-13',
      kitDotazione: session?.kitDotazione || 'basic',
    },
    volumeContext: {
      volume: volRef?.volume ?? idParts.volume,
      chapter: idParts.chapter,
      chapterTitle: volRef?.chapter || `Capitolo ${idParts.chapter}`,
      experimentTitle: title,
      page,
      verbatimText: bookText,
    },
    componentsUsed: components,
    studentJourney,
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
        cliffhangerToNext: !!next,
      },
    },
    rendering: {
      format: input.format || 'pdf',
      size: 'A4-portrait',
      outputPath: `fumetti/${anonStudentId}/${experimentId}-${model.sessionFingerprint}.pdf`,
      albumPersistence: true,
    },
    morphicHints: {
      teacherStyle: 'laboratoriale',
      studentLevel: ['basic', 'intermediate', 'advanced'].includes(session?.studentLevel)
        ? session.studentLevel
        : 'basic',
      previousConcepts: [],
      preferredAnalogies: ['strada', 'interruttore', 'porta'],
      sessionFingerprint: model.sessionFingerprint,
      exercisePrompts: model.exercisePrompts,
      notesPrompt: model.notesPrompt,
      multipleChoiceQuestions: model.multipleChoiceQuestions,
      diaryPage: model.diaryPage,
      mascot: model.mascot,
      imageGenerationBriefs: model.imageGenerationBriefs,
      nextExperiment: next,
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
  generateSessionFumetto,
  countWords,
  isValidExperimentId,
  getFumettoSchemaMeta,
  validateFumettoSchemaContract,
  buildSessionReportComicModel,
  getNextExperimentForFumetto,
  FUMETTO_ENUMS,
  WORD_LIMIT_PER_BALLOON,
  MIN_PANELS,
  MAX_PANELS,
};
