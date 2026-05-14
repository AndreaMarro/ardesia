export const COMIC_PROMPT_REQUIRED_FIELDS = [
  'volume',
  'chapter',
  'experimentId',
  'experimentTitle',
  'page',
  'components',
  'circuitState',
  'didacticConcept',
  'cliffhanger',
  'styleReference',
  'sessionScreenshot',
  'sessionContext',
  'sessionMessages',
  'unlimMemory',
  'teaMaterial',
];

function requireFields(input) {
  const missing = COMIC_PROMPT_REQUIRED_FIELDS.filter((field) => {
    const value = input?.[field];
    return Array.isArray(value) ? value.length === 0 : value === undefined || value === null || value === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing comic prompt fields: ${missing.join(', ')}`);
  }
}

function list(value) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

export function buildComicGenerationPrompt(input) {
  requireFields(input);

  return [
    'Brief editoriale fumetto ELAB Tutor per Leonardo AI.',
    '',
    `Volume: ${input.volume}`,
    `Capitolo: ${input.chapter}${input.chapterTitle ? ` - ${input.chapterTitle}` : ''}`,
    `Esperimento: ${input.experimentId} - ${input.experimentTitle}`,
    `Pagina volume: ${input.page}`,
    `Componenti: ${list(input.components)}`,
    `Stato circuito/codice: ${input.circuitState}`,
    `Concetto didattico: ${input.didacticConcept}`,
    `Cliffhanger narrativo: ${input.cliffhanger}`,
    `Reference stile: ${input.styleReference}`,
    '',
    'Dati sessione da usare come verita narrativa:',
    `- screenshot della sessione: ${input.sessionScreenshot ? 'allegato/disponibile' : 'non disponibile'}`,
    `- contesto sessione: ${input.sessionContext}`,
    `- cronologia messaggi: ${formatMessages(input.sessionMessages)}`,
    `- memoria UNLIM: ${formatMemory(input.unlimMemory)}`,
    `- materiale Tea: ${formatMemory(input.teaMaterial)}`,
    '',
    'Vincoli:',
    '- Massimo 6 pannelli.',
    '- Linguaggio 10-14 anni, frasi brevi, niente testo tecnico eccessivo.',
    '- Mantieni continuita narrativa con narrative_map e con il fumetto precedente/successivo.',
    '- Usa fumetti v2 come reference di stile, personaggi, ritmo e palette.',
    '- Output per pipeline editoriale/admin: niente rigenerazione live durante la lezione.',
    '- Asset finale pre-generato, salvato su storage stabile, runtime solo lettura.',
  ].join('\n');
}

export function buildComicMetadata(input) {
  requireFields(input);

  return {
    experiment_id: input.experimentId,
    narrative_map_id: input.experimentId,
    volume: input.volume,
    chapter: input.chapter,
    chapter_title: input.chapterTitle || null,
    experiment_title: input.experimentTitle,
    page: input.page,
    panel_limit: 6,
    components: Array.isArray(input.components) ? input.components : String(input.components).split(',').map((v) => v.trim()).filter(Boolean),
    cliffhanger: input.cliffhanger,
    storage_provider: input.storageProvider || 'supabase-storage',
    generation_provider: 'leonardo-ai',
    asset_url: input.assetUrl || null,
    runtime_policy: 'read-pre-generated-asset-only',
    generation_mode: 'editorial-admin-pipeline',
    style_reference: input.styleReference,
    session_sources: {
      screenshot: Boolean(input.sessionScreenshot),
      context: String(input.sessionContext || '').slice(0, 1000),
      messages_count: Array.isArray(input.sessionMessages) ? input.sessionMessages.length : 0,
      unlim_memory: Boolean(input.unlimMemory),
      tea_material: Boolean(input.teaMaterial),
    },
  };
}

function formatMessages(messages) {
  if (!Array.isArray(messages)) return String(messages || '');
  return messages
    .slice(-12)
    .map((message) => `${message.role || 'unknown'}: ${String(message.content || '').slice(0, 180)}`)
    .join(' | ');
}

function formatMemory(memory) {
  if (!memory || typeof memory !== 'object') return String(memory || '');
  try {
    return JSON.stringify(memory).slice(0, 1000);
  } catch {
    return '[memoria non serializzabile]';
  }
}
