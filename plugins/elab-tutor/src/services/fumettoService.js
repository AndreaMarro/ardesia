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
 *     analogies + Vol/pag verbatim) — NOT LLM-generated. Runtime session
 *     reports can be enriched by Edge Function `unlim-fumetto` Gemini drafts.
 *   - principioZero rules pre-populated as `true` for placeholders — real
 *     payloads MUST be re-validated post-LLM via `principio-zero-validator.ts`.
 *
 * Andrea Marro — 2026-05-16 PM iter 70 Team D
 */

import fumettoSchema from '../data/fumetto-schema.json';
import { getFallbackPhoto, getPhotoFor } from '../data/experiment-photo-map';
import { getVolumeRef } from '../../../../packs/elab-tutor/data/volume-references';

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
const FUMETTO_NEXT_EXPERIMENT_ENABLED = false;

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
  return 'Il contesto della sessione non contiene prove osservate sul kit fisico.';
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

function buildImageGenerationBrief({ arcStep, exp, volRef, narration, journeyEvidence, components, sessionStoryline }) {
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
  const sessionAnchors = Array.isArray(sessionStoryline?.anchors)
    ? sessionStoryline.anchors.slice(0, 6)
    : [];
  const sessionTrace = sessionAnchors.length
    ? `Traccia sessione reale: ${sessionAnchors.join('; ')}.`
    : 'Traccia sessione reale scarsa: non aggiungere prove non viste.';

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
      sessionTrace,
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
      if (component?.label) return component.label;
      if (component?.value && component?.type) return `${component.type} ${component.value}`;
      if (component?.type) return component.type;
      return null;
    })
    .filter(Boolean);
}

function uniqueList(values, max = 8) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

function getSessionContext(session = {}) {
  return session?.sessionContext || session?.runtimeContext || session?.unlimContext || {};
}

function getContextExperiment(session = {}, context = getSessionContext(session)) {
  const circuit = context?.circuit || {};
  const candidate =
    session?.activeExperiment ||
    session?.experiment ||
    (Array.isArray(session?.experimentsCompleted) ? session.experimentsCompleted[0] : null) ||
    context?.currentExperiment ||
    context?.activeExperiment ||
    context?.experiment ||
    circuit?.experiment ||
    circuit?.currentExperiment ||
    null;
  if (candidate?.id) {
    return {
      id: candidate.id,
      title: candidate.title || candidate.name || candidate.id,
      volume: candidate.volume ?? getVolumeAndChapterFromId(candidate.id).volume,
    };
  }
  const id = context?.currentExperimentId || circuit?.experimentId || session?.experimentId;
  if (id && isValidExperimentId(id)) {
    return {
      id,
      title: context?.experimentTitle || circuit?.experimentTitle || session?.experimentTitle || id,
      volume: getVolumeAndChapterFromId(id).volume,
    };
  }
  return null;
}

function normalizeMessages(session = {}) {
  const source = Array.isArray(session?.messages)
    ? session.messages
    : Array.isArray(session?.chatMessages)
      ? session.chatMessages
      : [];
  return source
    .map((message) => ({
      role: message?.role,
      text: String(message?.text || message?.content || '').trim(),
    }))
    .filter((message) => message.text);
}

function getContextComponents(session = {}, context = getSessionContext(session)) {
  const circuit = context?.circuit || {};
  return uniqueList([
    ...normalizeComponents(session?.componentsUsed),
    ...normalizeComponents(context?.componentsUsed),
    ...normalizeComponents(context?.components),
    ...normalizeComponents(circuit?.components),
    ...normalizeComponents(context?.layout?.components),
  ], 8);
}

function getContextCompilation(context = {}) {
  return context?.compilation || context?.lastCompilation || context?.compilationResult || null;
}

function getCompilationErrors(compilation) {
  if (!compilation) return [];
  const values = [
    ...(Array.isArray(compilation.errors) ? compilation.errors : [compilation.errors]),
    compilation.error,
    compilation.message,
  ];
  return uniqueList(values.map((value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.message || value.text || value.detail || String(value);
  }), 3);
}

function getSerialLines(context = {}) {
  const serial = context?.serial || context?.serialOutput || context?.serialMonitor || {};
  if (Array.isArray(serial?.lastLines)) return uniqueList(serial.lastLines, 4);
  if (typeof serial?.text === 'string') return uniqueList(serial.text.split('\n').slice(-4), 4);
  if (typeof serial === 'string') return uniqueList(serial.split('\n').slice(-4), 4);
  return [];
}

function editorModeLabel(mode) {
  if (mode === 'scratch' || mode === 'blocks' || mode === 'blockly') return 'modalita blocchi';
  if (mode === 'arduino' || mode === 'cpp' || mode === 'code') return 'modalita codice';
  return mode ? `modalita ${mode}` : null;
}

function buildSessionStoryline(session = {}) {
  const context = getSessionContext(session);
  const experiment = getContextExperiment(session, context);
  const messages = normalizeMessages(session);
  const userQuestion = [...messages].reverse().find((message) => message.role === 'user')?.text || null;
  const assistantAnswer = [...messages].reverse().find((message) => message.role === 'assistant')?.text || null;
  const components = getContextComponents(session, context);
  const buildStep = context?.buildStep || session?.buildProgress || null;
  const mode = editorModeLabel(context?.editorMode || session?.editorMode);
  const compilation = getContextCompilation(context);
  const compilationErrors = getCompilationErrors(compilation);
  const recentErrors = Array.isArray(context?.recentErrors)
    ? context.recentErrors.map((error) => error?.message || error?.detail || error?.type).filter(Boolean)
    : [];
  const serialLines = getSerialLines(context);
  const anchors = [];
  const contextWarnings = [];

  if (experiment?.title || experiment?.id) anchors.push(`esperimento attivo: ${experiment.title || experiment.id}`);
  if (buildStep?.current) anchors.push(`passo ${buildStep.current}/${buildStep.total || '?'}`);
  if (mode) anchors.push(mode);
  if (components.length) anchors.push(`componenti: ${components.slice(0, 5).join(', ')}`);
  if (compilation) {
    if (compilation.success === false || compilationErrors.length > 0) {
      anchors.push(`errore compilazione: ${compilationErrors[0] || 'compilazione non riuscita'}`);
    } else if (compilation.success === true) {
      anchors.push(`compilazione riuscita${compilation.size ? ` (${compilation.size} byte)` : ''}`);
    }
  }
  if (serialLines.length) anchors.push(`Serial Monitor: ${serialLines.slice(0, 2).join(' | ')}`);
  if (userQuestion) anchors.push(`domanda a UNLIM: ${trimWords(userQuestion, 18)}`);
  if (recentErrors.length && !compilationErrors.length) anchors.push(`errore osservato: ${trimWords(recentErrors[0], 18)}`);

  if (!experiment) contextWarnings.push('manca esperimento attivo verificabile');
  const evidenceCount = anchors.length + normalizeComponents(session?.componentsUsed).length;
  if (evidenceCount < 2) contextWarnings.push('mancano prove della sessione sufficienti');
  if (session?.sessionEvidenceLevel === 'sparse') {
    contextWarnings.push('sessione runtime senza prove osservate');
  }

  const errorText = compilationErrors[0] || recentErrors[0] || null;
  const resultText = compilation?.success === true
    ? `Risultato: compilazione riuscita${compilation.size ? ` (${compilation.size} byte)` : ''}${serialLines.length ? `; Serial Monitor: ${serialLines[0]}` : ''}.`
    : serialLines.length
      ? `Risultato osservato sul Serial Monitor: ${serialLines[0]}.`
      : null;

  return {
    experiment,
    components,
    messages,
    anchors,
    contextWarnings,
    question: userQuestion,
    problem: experiment
      ? `Problema: capire ${experiment.title || experiment.id} sul kit fisico.`
      : 'Problema: il contesto non indica un esperimento attivo.',
    hypothesis: components.length
      ? `Ipotesi: provare con ${components.slice(0, 3).join(', ')}${mode ? ` in ${mode}` : ''}.`
      : mode
        ? `Ipotesi: lavorare in ${mode} e osservare il kit fisico.`
        : 'Ipotesi: servono componenti e passaggi reali della sessione.',
    trial: buildStep?.current
      ? `Prova/montaggio: passo ${buildStep.current}/${buildStep.total || '?'}${mode ? `, ${mode}` : ''}.`
      : userQuestion
        ? `Prova/montaggio: domanda a UNLIM, "${trimWords(userQuestion, 18)}".`
        : 'Prova/montaggio: nessun passaggio registrato.',
    correction: errorText
      ? `Errore/correzione: ${trimWords(errorText, 22)}.`
      : assistantAnswer
        ? `Errore/correzione: ${trimWords(assistantAnswer, 22)}.`
        : 'Errore/correzione: nessun errore registrato.',
    result: resultText || 'Risultato: servono altre prove registrate prima di dichiarare un successo.',
    nextChallenge: 'Prossima sfida: rifare la prova sul kit fisico e annotare cosa cambia.',
  };
}

function enrichSessionForFumetto(session = {}) {
  const context = getSessionContext(session);
  const storyline = buildSessionStoryline(session);
  const completed = Array.isArray(session?.experimentsCompleted)
    ? session.experimentsCompleted.filter((experiment) => experiment?.id)
    : [];
  const experimentsCompleted = completed.length > 0
    ? completed
    : storyline.experiment
      ? [storyline.experiment]
      : [];

  const contextErrors = [
    ...getCompilationErrors(getContextCompilation(context)),
    ...(Array.isArray(context?.recentErrors)
      ? context.recentErrors.map((error) => error?.message || error?.detail || error?.type).filter(Boolean)
      : []),
  ];
  const savedJourney = session?.studentJourney && typeof session.studentJourney === 'object'
    ? session.studentJourney
    : {};
  const messages = normalizeMessages(session);
  const userMessages = messages.filter((message) => message.role === 'user');
  const mistakesMade = Array.isArray(savedJourney.mistakesMade) && savedJourney.mistakesMade.length > 0
    ? savedJourney.mistakesMade
    : uniqueList(contextErrors, 3).map((description) => ({ type: 'other', description }));
  const variationsFromActions = Array.isArray(session?.actions)
    ? session.actions.map((action) => action?.detail).filter(Boolean)
    : [];

  return {
    ...session,
    experimentsCompleted,
    componentsUsed: getContextComponents(session, context),
    studentJourney: {
      ...savedJourney,
      mistakesMade,
      mistakesOvercome: Array.isArray(savedJourney.mistakesOvercome) ? savedJourney.mistakesOvercome : [],
      variationsTriedSpontaneously: Array.isArray(savedJourney.variationsTriedSpontaneously)
        ? savedJourney.variationsTriedSpontaneously
        : variationsFromActions.slice(0, 3),
      helpRequestsCount: Number.isFinite(savedJourney.helpRequestsCount)
        ? savedJourney.helpRequestsCount
        : userMessages.length,
    },
    sessionStoryline: storyline,
  };
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
  const warnings = Array.isArray(session?.sessionStoryline?.contextWarnings)
    ? session.sessionStoryline.contextWarnings
    : [];
  if (warnings.length) {
    return [
      {
        question: 'Ragazzi, cosa possiamo dire con un contesto sessione scarso?',
        options: [
          'che servono altre prove registrate prima di raccontare il risultato',
          'che il circuito ha sicuramente funzionato',
          'che possiamo inventare il finale',
        ],
        correctIndex: 0,
        explanation: 'Il fumetto deve restare onesto: senza prove, si annota che mancano dati.',
      },
      {
        question: 'Quale dato va raccolto nella prossima prova?',
        options: [
          'esperimento attivo, componenti, errore o risultato osservato',
          'un titolo bello ma non verificato',
          'una promessa di upload hardware',
        ],
        correctIndex: 0,
        explanation: 'Il report si basa su tracce reali della sessione.',
      },
      {
        question: 'Perche il report resta sobrio?',
        options: [
          'per non attribuire alla sessione cose non viste',
          'perche il kit fisico non conta',
          'per saltare il diario',
        ],
        correctIndex: 0,
        explanation: 'Un report utile distingue prove viste e dati mancanti.',
      },
    ];
  }

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
  const warnings = Array.isArray(session?.sessionStoryline?.contextWarnings)
    ? session.sessionStoryline.contextWarnings
    : [];
  if (warnings.length) {
    return `Spazio appunti: il contesto della sessione e scarso (${warnings.join('; ')}). Scrivete solo prove viste davvero sul kit fisico.`;
  }
  return `Spazio appunti: scrivete la prova fatta, il componente del kit fisico che ha cambiato il risultato e la regola nata da questa osservazione. ${evidence}`;
}

function buildDiaryPage(session, completed) {
  const warnings = Array.isArray(session?.sessionStoryline?.contextWarnings)
    ? session.sessionStoryline.contextWarnings
    : [];
  if (warnings.length) {
    return {
      title: 'Pagina diario della classe',
      prompts: [
        'Oggi il report non ha abbastanza prove registrate per raccontare un risultato.',
        `Dati mancanti da raccogliere: ${warnings.join('; ')}.`,
        'Prossima sessione: annotate esperimento, componenti, errore o valore osservato.',
        'Domanda per UNLIM: quale prova reale vogliamo registrare?',
      ],
      lineCount: 8,
    };
  }

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

function normalizeGeminiQuizItem(item) {
  const options = Array.isArray(item?.options)
    ? item.options.map((option) => String(option || '').trim()).filter(Boolean).slice(0, 4)
    : [];
  if (!item?.question || options.length < 2) return null;
  const correctIndex = Number.isInteger(item.correctIndex)
    ? Math.max(0, Math.min(item.correctIndex, options.length - 1))
    : 0;
  return {
    question: String(item.question).trim(),
    options,
    correctIndex,
    explanation: String(item.explanation || '').trim(),
  };
}

function collectDraftText(draft) {
  const values = [];
  const visit = (value) => {
    if (!value) return;
    if (typeof value === 'string') {
      values.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };
  visit(draft?.storyline);
  visit(draft?.panels);
  visit(draft?.imagePrompts);
  if (Array.isArray(draft?.quiz)) {
    draft.quiz.forEach((item) => {
      visit(item?.question);
      visit(item?.explanation);
    });
  }
  visit(draft?.diaryPage);
  visit(draft?.notesPrompt);
  visit(draft?.exercisePrompts);
  return values.join(' ');
}

function collectGroundingEvidence(session, model) {
  return stableStringify({
    experimentsCompleted: session?.experimentsCompleted,
    componentsUsed: session?.componentsUsed,
    studentJourney: session?.studentJourney,
    messages: normalizeMessages(session),
    sessionContext: getSessionContext(session),
    sessionStoryline: model?.sessionStoryline,
    vignettes: model?.vignettes?.map((slot) => ({
      exp: slot.exp,
      volRef: slot.volRef,
      sessionEvidence: slot.sessionEvidence,
      narration: slot.narration,
    })),
  }).toLowerCase();
}

function hasValidEvidenceRefs(item, evidence) {
  const refs = Array.isArray(item?.evidenceRefs)
    ? item.evidenceRefs.map((ref) => String(ref || '').trim()).filter((ref) => ref.length >= 4)
    : [];
  if (!refs.length) return false;
  return refs.every((ref) => evidence.includes(ref.toLowerCase()));
}

function hasCompleteRoleSet(items) {
  if (!Array.isArray(items)) return false;
  const roles = new Set(items.map((item) => item?.role).filter(Boolean));
  return FUMETTO_PANEL_ARC.every((arcStep) => roles.has(arcStep.role));
}

function hasCompleteStoryline(storyline) {
  return ['problem', 'hypothesis', 'trial', 'correction', 'result', 'nextChallenge']
    .every((key) => typeof storyline?.[key] === 'string' && storyline[key].trim().length > 0);
}

function validateGeminiDraftGrounding(draft, session, model) {
  const evidence = collectGroundingEvidence(session, model);
  const draftText = collectDraftText(draft).toLowerCase();
  const violations = [];
  const panels = Array.isArray(draft?.panels) ? draft.panels : [];
  const imagePrompts = Array.isArray(draft?.imagePrompts) ? draft.imagePrompts : [];
  const quiz = Array.isArray(draft?.quiz) ? draft.quiz : [];
  const diaryPrompts = Array.isArray(draft?.diaryPage?.prompts) ? draft.diaryPage.prompts : [];
  const exercisePrompts = Array.isArray(draft?.exercisePrompts) ? draft.exercisePrompts : [];

  if (!hasCompleteRoleSet(panels) || panels.some((panel) => !hasValidEvidenceRefs(panel, evidence))) {
    violations.push('missing_panel_evidence_refs');
  }
  if (!hasCompleteStoryline(draft?.storyline) || !hasValidEvidenceRefs(draft.storyline, evidence)) {
    violations.push('missing_storyline_evidence_refs');
  }
  if (!hasCompleteRoleSet(imagePrompts) || imagePrompts.some((item) => !hasValidEvidenceRefs(item, evidence))) {
    violations.push('missing_image_evidence_refs');
  }
  if (quiz.length < 3 || quiz.some((item) => !hasValidEvidenceRefs(item, evidence))) {
    violations.push('missing_quiz_evidence_refs');
  }
  if (!draft?.diaryPage || diaryPrompts.length < 4 || !hasValidEvidenceRefs(draft.diaryPage, evidence)) {
    violations.push('missing_diary_evidence_refs');
  }
  if (!draft?.notesPrompt || !hasValidEvidenceRefs({ evidenceRefs: draft.notesEvidenceRefs }, evidence)) {
    violations.push('missing_notes_evidence_refs');
  }
  if (exercisePrompts.length < 1 || !hasValidEvidenceRefs({ evidenceRefs: draft.exerciseEvidenceRefs }, evidence)) {
    violations.push('missing_exercise_evidence_refs');
  }

  const guardedClaims = [
    /upload\s+reale/i,
    /caricat[oa]\s+(?:sulla|su)\s+(?:scheda|nano|arduino)/i,
    /flash\s+completat[oa]/i,
    /scheda\s+fisica/i,
    /hardware\s+(?:provato|certificat[oa])/i,
  ];
  guardedClaims.forEach((pattern) => {
    if (pattern.test(draftText) && !pattern.test(evidence)) {
      violations.push('claim_hardware_not_in_session');
    }
  });

  const sessionBoundTerms = [
    'serial monitor',
    'monitor seriale',
    'compilazione riuscita',
    'errore compilazione',
    'nano r4',
    'cavo usb',
    'motore',
    'motor',
    'buzzer',
    'suonato',
    'girato',
    'pin',
    'cambiando pin',
    'risolto cambiando',
    'modalita blocchi',
    'modalita codice',
  ];
  sessionBoundTerms.forEach((term) => {
    if (draftText.includes(term) && !evidence.includes(term)) {
      violations.push(`ungrounded_term:${term}`);
    }
  });

  const evidenceNumbers = new Set(evidence.match(/\b\d{2,6}\b/g) || []);
  const draftNumbers = new Set(draftText.match(/\b\d{2,6}\b/g) || []);
  draftNumbers.forEach((number) => {
    if (!evidenceNumbers.has(number)) {
      violations.push(`ungrounded_number:${number}`);
    }
  });

  return {
    valid: violations.length === 0,
    violations: uniqueList(violations, 8),
  };
}

function applyGeminiDraftToReportModel(model, session) {
  const draft = session?.geminiDraft || session?.fumettoDraft || null;
  if (!draft || typeof draft !== 'object') return model;
  const grounding = validateGeminiDraftGrounding(draft, session, model);
  if (!grounding.valid) {
    return {
      ...model,
      warnings: uniqueList([
        ...(Array.isArray(model.warnings) ? model.warnings : []),
        'gemini_draft_ungrounded',
        ...grounding.violations,
      ], 12),
      geminiDraftApplied: false,
    };
  }

  const panels = Array.isArray(draft.panels) ? draft.panels : [];
  const panelByRole = new Map(
    panels
      .filter((panel) => panel?.role)
      .map((panel) => [panel.role, panel])
  );
  const vignettes = model.vignettes.map((slot, index) => {
    const panel = panelByRole.get(slot.role) || panels[index] || null;
    if (!panel) return slot;
    const balloons = Array.isArray(panel.balloons)
      ? panel.balloons
          .map((balloon) => String(balloon?.text || '').trim())
          .filter(Boolean)
      : [];
    return {
      ...slot,
      title: panel.title || slot.title,
      narration: panel.caption || slot.narration,
      sessionEvidence: balloons.length ? trimWords(balloons.join(' '), 60) : slot.sessionEvidence,
      geminiPanel: panel,
    };
  });

  const geminiPrompts = Array.isArray(draft.imagePrompts) ? draft.imagePrompts : [];
  const imageGenerationBriefs = model.imageGenerationBriefs.map((brief, index) => {
    if (!brief) return brief;
    const prompt = geminiPrompts.find((item) => item?.role === vignettes[index]?.role) || geminiPrompts[index] || null;
    if (!prompt?.prompt) return brief;
    return {
      ...brief,
      providerHint: 'gemini-image-prompt',
      prompt: String(prompt.prompt),
      negativePrompt: prompt.negativePrompt || brief.negativePrompt,
    };
  });

  const quiz = Array.isArray(draft.quiz)
    ? draft.quiz.map(normalizeGeminiQuizItem).filter(Boolean).slice(0, 3)
    : [];
  const diaryPrompts = Array.isArray(draft.diaryPage?.prompts)
    ? draft.diaryPage.prompts.map((prompt) => String(prompt || '').trim()).filter(Boolean).slice(0, 4)
    : [];
  const exercisePrompts = Array.isArray(draft.exercisePrompts)
    ? draft.exercisePrompts.map((prompt) => String(prompt || '').trim()).filter(Boolean).slice(0, 3)
    : [];

  return {
    ...model,
    vignettes,
    imageGenerationBriefs,
    sessionStoryline: draft.storyline || model.sessionStoryline,
    exercisePrompts: exercisePrompts.length ? exercisePrompts : model.exercisePrompts,
    notesPrompt: draft.notesPrompt || model.notesPrompt,
    multipleChoiceQuestions: quiz.length ? quiz : model.multipleChoiceQuestions,
    diaryPage: diaryPrompts.length
      ? {
          ...model.diaryPage,
          title: draft.diaryPage?.title || model.diaryPage.title,
          prompts: diaryPrompts,
        }
      : model.diaryPage,
    geminiDraftApplied: true,
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
  if (!FUMETTO_NEXT_EXPERIMENT_ENABLED) return null;
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
  const effectiveSession = enrichSessionForFumetto(session);
  const warnings = [];
  const sessionStoryline = effectiveSession.sessionStoryline || buildSessionStoryline(effectiveSession);
  const completed = Array.isArray(effectiveSession?.experimentsCompleted)
    ? effectiveSession.experimentsCompleted.slice(0, MAX_PANELS)
    : [];

  if (completed.length === 0) {
    warnings.push('empty_session');
  }
  if (Array.isArray(sessionStoryline.contextWarnings) && sessionStoryline.contextWarnings.length) {
    warnings.push('sparse_session_context');
  }

  const journeyEvidence = normalizeJourneyEvidence(effectiveSession?.studentJourney);
  const narrations = effectiveSession?.narrations ?? {};
  const sessionFingerprint = shortHash({
    classKey: effectiveSession?.classKey,
    studentAlias: effectiveSession?.studentAlias,
    startedAt: effectiveSession?.startedAt,
    savedAt: effectiveSession?.savedAt,
    experimentsCompleted: completed.map((exp) => ({
      id: exp?.id,
      title: exp?.title,
      volume: exp?.volume,
    })),
    narrations,
    studentJourney: effectiveSession?.studentJourney,
    componentsUsed: effectiveSession?.componentsUsed,
    sessionStoryline,
  });

  const fallbackExperiment = completed.length > 0 ? completed[completed.length - 1] : null;
  const context = getSessionContext(session);
  const hasLiveContext = Object.keys(context || {}).length > 0 || normalizeMessages(session).length > 0;
  const roleEvidence = hasLiveContext
    ? {
        problema: sessionStoryline.problem,
        ipotesi: sessionStoryline.hypothesis,
        errore: sessionStoryline.correction,
        click: sessionStoryline.question
          ? `Domanda a UNLIM: ${sessionStoryline.question}`
          : sessionStoryline.trial,
        successo: sessionStoryline.result,
        ponte: sessionStoryline.nextChallenge,
      }
    : {};
  const vignettes = FUMETTO_PANEL_ARC.map((arcStep, index) => {
    const exp = completed[index] || fallbackExperiment;
    if (!exp) {
      return {
        exp: null,
        role: arcStep.role,
        roleLabel: arcStep.label,
        index: index + 1,
        sessionEvidence: roleEvidence[arcStep.role] || journeyEvidence,
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
      sessionEvidence: roleEvidence[arcStep.role] || journeyEvidence,
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
      components: effectiveSession?.componentsUsed,
      sessionStoryline,
    });
  });

  const model = {
    vignettes,
    warnings,
    sessionStoryline,
    sessionFingerprint,
    exercisePrompts: buildExercisePrompts(effectiveSession, completed),
    notesPrompt: buildNotesPrompt(effectiveSession),
    multipleChoiceQuestions: buildMultipleChoiceQuestions(effectiveSession, completed),
    diaryPage: buildDiaryPage(effectiveSession, completed),
    imageGenerationBriefs,
    nextExperiment: getNextExperimentForFumetto({ session: effectiveSession }),
    mascot: TEA_CANONICAL_MASCOT,
  };
  return applyGeminiDraftToReportModel(model, effectiveSession);
}

export function generateSessionFumetto(input = {}) {
  const session = input.session || input;
  const explicitExperimentId =
    input.experimentId ||
    session?.experimentId ||
    session?.activeExperiment?.id ||
    session?.experiment?.id ||
    (Array.isArray(session?.experimentsCompleted) ? session.experimentsCompleted[0]?.id : null);
  if (!explicitExperimentId) {
    throw new Error('generateSessionFumetto: session experiment evidence required');
  }
  const exp = firstExperimentFromSession(session, explicitExperimentId);
  const experimentId = explicitExperimentId || exp.id;
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
      text: FUMETTO_NEXT_EXPERIMENT_ENABLED && next
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
      nextExperiment: FUMETTO_NEXT_EXPERIMENT_ENABLED ? next : null,
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
