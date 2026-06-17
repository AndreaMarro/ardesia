// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
import supabase from './supabaseClient.js';

const BASIC_COMPONENTS = [
  'breadboard',
  'batteria 9v',
  'clip batteria',
  'fili',
  'jumper',
  'led rosso',
  'resistore 220',
  'resistore 470',
];

const ADVANCED_COMPONENTS = [
  ...BASIC_COMPONENTS,
  'arduino nano',
  'nano r4',
  'usb',
  'pulsante',
  'potenziometro',
  'buzzer',
  'servo',
  'sensore luce',
  'fotoresistore',
  'sensore ultrasuoni',
  'display lcd',
  'mosfet',
  'condensatore',
];

export const DEFAULT_PERCORSO_MORPHIC_CONTEXT = Object.freeze({
  teacher: {
    id: null,
    profile: 'standard',
    esempiBaseCount: 2,
    analogieCount: 1,
    microStepGranularity: 'standard',
    skipBasics: false,
    highlightFisico: [],
    recentExperiments: [],
  },
  classroom: {
    key: null,
    age: 10,
    lexicalComplexity: 'intermedia',
    analogyTarget: 'concreta-guidata',
    kitLevel: 'base',
    visibleComponents: BASIC_COMPONENTS,
    componentFilterExplicit: false,
    difficultyProgression: 'graduale',
    deviceMode: 'solo-lim',
    ragChapterFocus: null,
  },
  ui: {
    resolution: '1080p',
    pointer: 'mouse',
    sessionState: 'intro',
    scale: 1,
  },
  principioZeroInvariant: {
    opening: 'Ragazzi,',
    kitFisico: 'kit fisico ELAB',
    volumePagePolicy: 'Vol.X pag.Y verbatim',
  },
});

function safeStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJson(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readString(storage, keys, fallback = null) {
  for (const key of keys) {
    try {
      const value = storage?.getItem?.(key);
      if (value) return value;
    } catch {
      /* storage unavailable */
    }
  }
  return fallback;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasComponent(visibleComponents, componentName) {
  const name = normalizeText(componentName);
  return visibleComponents.some((allowed) => {
    const item = normalizeText(allowed);
    return name.includes(item) || item.includes(name);
  });
}

function sanitizeSessionState(value) {
  return ['intro', 'costruzione', 'verifica', 'report'].includes(value) ? value : 'intro';
}

function sanitizeResolution(value) {
  return ['1080p', '4k'].includes(value) ? value : '1080p';
}

function localTeacherProfile(teacherId, storage) {
  if (!storage) return null;
  return (
    readJson(storage, `elab-morphic-teacher-profile:${teacherId}`) ||
    readJson(storage, 'elab-percorso-teacher-profile') ||
    readJson(storage, 'elab_morphic_teacher_profile')
  );
}

function localClassProfile(classKey, storage) {
  if (!storage) return null;
  return (
    readJson(storage, `elab-morphic-class-profile:${classKey}`) ||
    readJson(storage, 'elab-percorso-class-profile') ||
    readJson(storage, 'elab_morphic_class_profile')
  );
}

function hasOwnProfileSignal(profile) {
  return !!profile && Object.keys(profile).length > 0;
}

async function selectRows(client, table, eqColumn, eqValue, orderColumn, limit = 8) {
  if (!client || !eqValue) return [];
  try {
    const query = client
      .from(table)
      .select('*')
      .eq(eqColumn, eqValue)
      .order(orderColumn, { ascending: false })
      .limit(limit);
    const { data, error } = await query;
    if (error) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[percorsoMorphic]', table, 'query error:', error.message || error);
      }
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn('[percorsoMorphic]', table, 'query exception:', err?.message || err);
    }
    return [];
  }
}

function inferTeacherProfile(profile, historyRows) {
  const explicit = normalizeText(profile?.experience || profile?.profile || profile?.livello);
  if (['expert', 'esperto', 'arduino_expert', 'arduino esperto'].includes(explicit)) return 'esperto';
  if (['first_year', 'primo_anno', 'primo anno', 'novice', 'nuovo'].includes(explicit)) return 'primo-anno';

  const concepts = new Set();
  for (const row of historyRows) {
    // HIGH-F fix (Phase 1 sub-iter 83.6): defensive Array.isArray guard.
    // Supabase legacy schema or JSONB corruption could return string/object/null —
    // `for...of` over non-iterable throws TypeError.
    const list = Array.isArray(row.concepts_explained) ? row.concepts_explained : [];
    for (const concept of list) concepts.add(normalizeText(concept));
  }
  if (historyRows.length >= 8 || concepts.size >= 6) return 'esperto';
  return 'standard';
}

function docenteShape(profileName, teacherId, historyRows, errorRows, profile = {}) {
  const base = {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.teacher,
    id: teacherId || null,
    profile: profileName,
    recentExperiments: historyRows.map((row) => row.experiment_id).filter(Boolean).slice(0, 8),
  };

  if (profileName === 'esperto') {
    base.esempiBaseCount = 1;
    base.analogieCount = 0;
    base.microStepGranularity = 'compressa';
    base.skipBasics = true;
  }
  if (profileName === 'primo-anno') {
    base.esempiBaseCount = 3;
    base.analogieCount = 2;
    base.microStepGranularity = 'espansa';
    base.skipBasics = false;
  }

  const style = normalizeText(profile?.style || profile?.preferred_focus || '');
  const signatures = errorRows.map((row) => normalizeText(row.pattern_signature)).join(' ');
  if (style.includes('component') || signatures.includes('breadboard')) {
    base.highlightFisico = Array.from(new Set([...base.highlightFisico, 'breadboard']));
  }
  if (signatures.includes('led') || signatures.includes('polarita')) {
    base.highlightFisico = Array.from(new Set([...base.highlightFisico, 'LED rosso']));
  }
  return base;
}

export async function resolveDocenteContext(teacherId, options = {}) {
  const storage = safeStorage(options.storage);
  const client = options.client === undefined ? supabase : options.client;
  const resolvedTeacherId = teacherId || readString(storage, [
    'elab-teacher-anon-uuid',
    'elab_teacher_anon_uuid',
    'elab-teacher-id',
  ]);
  const profile = localTeacherProfile(resolvedTeacherId, storage) || {};

  // HIGH-C fix (Phase 1 sub-iter 83.6): parallel queries via Promise.all (was sequential).
  // No inter-dependency on resolvedTeacherId. Saves ~80-150ms p95 on classroom WiFi.
  const [historyRows, errorRows] = await Promise.all([
    selectRows(client, 'teacher_history_log', 'teacher_anon_uuid', resolvedTeacherId, 'started_at', 12),
    selectRows(client, 'errore_ricorrente_pattern', 'teacher_anon_uuid', resolvedTeacherId, 'detected_count', 5),
  ]);
  const inferred = inferTeacherProfile(profile, historyRows);
  return docenteShape(inferred, resolvedTeacherId, historyRows, errorRows, profile);
}

function inferClassFromMetadata(localProfile, metadataRows) {
  const latest = metadataRows[0] || {};
  const material = localProfile?.materiale_presente || latest.materiale_presente || {};
  // Codex HIGH#1 fix (Phase 1 sub-iter 83.6): componentFilterExplicit true SOLO se
  // materiale_presente ha chiavi non vuote O localProfile dichiara esplicitamente kit/materiali.
  // Schema Supabase: materiale_presente DEFAULT '{}' → senza guard, qualsiasi metadata row vuota
  // attiva filter + kit base → nasconde Arduino/servo/MOSFET in classi con metadata reale ma materiale non popolato.
  const hasMaterialKeys = Object.keys(material || {}).some((k) => {
    const v = material[k];
    if (v === false || v === null || v === undefined) return false;
    if (typeof v === 'number') return v > 0;
    return true;
  });
  const hasLocalKitSignal = !!(localProfile?.kit || localProfile?.kitLevel || localProfile?.kit_level || hasOwnProfileSignal(localProfile?.materiale_presente));
  const explicitProfile = hasMaterialKeys || hasLocalKitSignal;
  const kitRaw = normalizeText(localProfile?.kit || localProfile?.kitLevel || localProfile?.kit_level || '');
  const materialKeys = Object.keys(material).join(' ');
  const kitLevel = kitRaw.includes('advanced') || kitRaw.includes('avanzato') || /servo|ultrasuoni|lcd|mosfet/i.test(materialKeys)
    ? 'advanced'
    : 'base';

  const age = Number(localProfile?.age || localProfile?.eta || localProfile?.studentAge || 10);
  const competenceRaw = normalizeText(localProfile?.competence || localProfile?.competenza || latest.livello_autonomia || '');
  const expert = competenceRaw.includes('expert') || competenceRaw.includes('avanz') || competenceRaw.includes('auto');
  const novice = competenceRaw.includes('novice') || competenceRaw.includes('base') || competenceRaw.includes('lead');

  return {
    kitLevel,
    age: Number.isFinite(age) ? age : 10,
    difficultyProgression: expert ? 'accelerata' : (novice ? 'graduale' : 'progressiva'),
    deviceMode: localProfile?.deviceMode || localProfile?.device_mode || latest.device_mode || 'solo-lim',
    material,
    explicitProfile,
    sessionId: latest.session_id || null,
  };
}

function visibleComponentsFromMaterial(material, fallbackComponents) {
  const entries = Object.entries(material || {}).filter(([, value]) => {
    if (value === false || value === null || value === undefined) return false;
    if (typeof value === 'number') return value > 0;
    return true;
  });
  if (entries.length === 0) return fallbackComponents;

  const mapped = entries.map(([key]) => {
    const normalized = normalizeText(key);
    if (normalized === 'r220' || normalized.includes('220')) return 'resistore 220';
    if (normalized === 'r470' || normalized.includes('470')) return 'resistore 470';
    if (normalized.includes('led')) return 'led rosso';
    if (normalized.includes('battery') || normalized.includes('batteria')) return 'batteria 9v';
    if (normalized.includes('wire') || normalized.includes('fil')) return 'fili';
    return normalized.replace(/_/g, ' ');
  });
  return Array.from(new Set(mapped));
}

export async function resolveClasseContext(classKey, options = {}) {
  const storage = safeStorage(options.storage);
  const client = options.client === undefined ? supabase : options.client;
  const resolvedClassKey = classKey || readString(storage, ['elab-class-key', 'elab_class_key']);
  const profile = localClassProfile(resolvedClassKey, storage) || {};

  // HIGH-C fix (Phase 1 sub-iter 83.6): parallel when sessionId hinted by caller,
  // sequential fallback otherwise. Saves ~80-150ms p95 when caller supplies sessionId.
  const sessionIdHint = options.sessionId || null;
  const metadataPromise = selectRows(client, 'class_session_metadata', 'class_key', resolvedClassKey, 'updated_at', 8);
  const voiceHintedPromise = sessionIdHint
    ? selectRows(client, 'voice_movement_log', 'session_id', sessionIdHint, 'created_at', 5)
    : null;
  const metadataRows = await metadataPromise;
  const inferred = inferClassFromMetadata(profile, metadataRows);
  const voiceRows = voiceHintedPromise
    ? await voiceHintedPromise
    : await selectRows(client, 'voice_movement_log', 'session_id', inferred.sessionId, 'created_at', 5);

  const lexicalComplexity = inferred.age <= 9 ? 'semplice' : (inferred.age >= 13 ? 'tecnica-guidata' : 'intermedia');
  const analogyTarget = inferred.age <= 9 ? 'concreta' : (inferred.age >= 13 ? 'sistema' : 'concreta-guidata');
  const kitComponents = inferred.kitLevel === 'advanced' ? ADVANCED_COMPONENTS : BASIC_COMPONENTS;
  const visibleComponents = visibleComponentsFromMaterial(inferred.material, kitComponents);
  const voiceFocus = voiceRows.flatMap((row) => row.zone_preferred || []).filter(Boolean).slice(0, 4);

  return {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom,
    key: resolvedClassKey || null,
    age: inferred.age,
    lexicalComplexity,
    analogyTarget,
    kitLevel: inferred.kitLevel,
    visibleComponents,
    componentFilterExplicit: inferred.explicitProfile,
    difficultyProgression: inferred.difficultyProgression,
    deviceMode: inferred.deviceMode,
    voiceFocus,
  };
}

function resolveUiContext(storage, override = {}) {
  const resolution = sanitizeResolution(
    override.resolution ||
    readString(storage, ['elab-lim-resolution', 'elab_percorso_resolution'], null) ||
    (typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(min-resolution: 192dpi)').matches ? '4k' : '1080p')
  );
  const pointer = override.pointer ||
    readString(storage, ['elab-pointer-mode', 'elab_percorso_pointer'], null) ||
    (typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse');
  const sessionState = sanitizeSessionState(
    override.sessionState ||
    readString(storage, ['elab-percorso-session-state', 'elab_session_state'], 'intro')
  );

  return {
    resolution,
    pointer: pointer === 'touch' ? 'touch' : 'mouse',
    sessionState,
    scale: resolution === '4k' ? 1.18 : 1,
  };
}

export async function resolvePercorsoMorphicContext(options = {}) {
  const storage = safeStorage(options.storage);
  const client = options.client === undefined ? supabase : options.client;
  const [teacher, classroom] = await Promise.all([
    resolveDocenteContext(options.teacherId, { storage, client }),
    resolveClasseContext(options.classKey, { storage, client, sessionId: options.sessionId }),
  ]);
  const ui = resolveUiContext(storage, options.ui || {});

  return {
    teacher,
    classroom: {
      ...classroom,
      ragChapterFocus: options.capitolo?.id || classroom.ragChapterFocus || null,
    },
    ui,
    principioZeroInvariant: DEFAULT_PERCORSO_MORPHIC_CONTEXT.principioZeroInvariant,
  };
}

function buildCssVars(ui) {
  const scale = ui?.resolution === '4k' ? '1.18' : '1';
  const touchTarget = ui?.pointer === 'touch' ? '56px' : '44px';
  return {
    '--percorso-morphic-scale': scale,
    '--percorso-touch-target': touchTarget,
    '--percorso-panel-density': ui?.resolution === '4k' ? 'spacious' : 'standard',
  };
}

function nextExperiment(esperimento) {
  const next = esperimento?.next_experiment || esperimento?.session_save?.next_suggested || null;
  if (!next) return null;
  if (typeof next === 'string') return { id: next, title: next };
  return next;
}

export function adaptPercorsoRender(context = DEFAULT_PERCORSO_MORPHIC_CONTEXT, esperimento = null, capitolo = null) {
  const merged = {
    teacher: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.teacher, ...(context.teacher || {}) },
    classroom: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom, ...(context.classroom || {}) },
    ui: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.ui, ...(context.ui || {}) },
    principioZeroInvariant: DEFAULT_PERCORSO_MORPHIC_CONTEXT.principioZeroInvariant,
  };
  const components = Array.isArray(esperimento?.components_needed) ? esperimento.components_needed : [];
  const shouldFilterComponents =
    merged.classroom.componentFilterExplicit && Array.isArray(merged.classroom.visibleComponents);
  const visibleComponents = shouldFilterComponents
    ? components.filter((component) => hasComponent(merged.classroom.visibleComponents, component.name))
    : components;

  return {
    teacherProfile: merged.teacher.profile,
    esempiBaseCount: merged.teacher.esempiBaseCount,
    analogieCount: merged.teacher.analogieCount,
    microStepGranularity: merged.teacher.microStepGranularity,
    skipBasics: merged.teacher.skipBasics,
    highlightFisico: merged.teacher.highlightFisico,
    lexicalComplexity: merged.classroom.lexicalComplexity,
    analogyTarget: merged.classroom.analogyTarget,
    kitLevel: merged.classroom.kitLevel,
    visibleComponents,
    hiddenComponentsCount: Math.max(0, components.length - visibleComponents.length),
    difficultyProgression: merged.classroom.difficultyProgression,
    ragChapterFocus: capitolo?.id || merged.classroom.ragChapterFocus || null,
    sessionState: sanitizeSessionState(merged.ui.sessionState),
    transitionEmphasis: merged.ui.sessionState === 'verifica' ? 'alta' : (merged.ui.sessionState === 'report' ? 'sintesi' : 'normale'),
    nextExperiment: nextExperiment(esperimento),
    cssVars: buildCssVars(merged.ui),
    principioZero: {
      opening: 'Ragazzi,',
      kitFisico: 'kit fisico ELAB',
      volumePagePolicy: 'Vol.X pag.Y verbatim',
    },
  };
}

export function getModalitaMorphicCue(options = {}) {
  const storage = safeStorage(options.storage);
  const teacherId = readString(storage, ['elab-teacher-anon-uuid', 'elab_teacher_anon_uuid', 'elab-teacher-id']);
  const profile = inferTeacherProfile(localTeacherProfile(teacherId, storage) || {}, []);
  return {
    teacherProfile: profile,
    sessionState: sanitizeSessionState(options.sessionState || readString(storage, ['elab-percorso-session-state', 'elab_session_state'], 'intro')),
  };
}
