// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * memoryWriter — Sprint Q5
 * Andrea Marro 2026-04-25
 *
 * Memoria compounding classe + docente.
 * Markdown append-only con front-matter YAML.
 *
 * Storage: docs/unlim-wiki/students/<classId>.md + docs/unlim-wiki/teachers/<teacherId>.md
 * Runtime: Supabase mirror (futuro Sprint 6+).
 *
 * PRINCIPIO ZERO: linguaggio neutro nominale (no comandi).
 * GDPR: solo metadati pseudonimi, NO PII minori.
 */

const STUDENT_FRONT_MATTER_KEYS = [
  'classId',
  'livello',
  'created_at',
  'updated_at',
  'sessioni_count',
  'esperimenti_fatti',
  'errori_ricorrenti',
];

const TEACHER_FRONT_MATTER_KEYS = [
  'teacherId',
  'stile_didattico',
  'created_at',
  'updated_at',
  'sessioni_count',
  'classi_seguite',
  'volumi_preferiti',
];

/**
 * Builda markdown student memory da session log.
 */
export function buildStudentMemory(classId, sessionLog = [], options = {}) {
  if (!classId) throw new Error('classId required');
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const livello = options.livello ?? inferLivello(sessionLog);
  const sessioniCount = sessionLog.length;
  const espFatti = collectEsperimentiFatti(sessionLog);
  const erroriRicorrenti = collectErroriRicorrenti(sessionLog);

  const frontMatter = [
    '---',
    `classId: ${classId}`,
    `livello: ${livello}`,
    `created_at: ${options.created_at ?? today}`,
    `updated_at: ${today}`,
    `sessioni_count: ${sessioniCount}`,
    `esperimenti_fatti: [${espFatti.map((e) => `"${e}"`).join(', ')}]`,
    `errori_ricorrenti: [${erroriRicorrenti.map((e) => `"${e}"`).join(', ')}]`,
    '---',
  ].join('\n');

  const body = [
    '',
    `# Memoria classe ${classId}`,
    '',
    `## Profilo`,
    '',
    `Livello inferito: **${livello}** (basato su ${sessioniCount} sessioni)`,
    '',
    `## Esperimenti completati`,
    '',
    espFatti.length > 0 ? espFatti.map((e) => `- ${e}`).join('\n') : '_(nessuno ancora)_',
    '',
    `## Errori ricorrenti`,
    '',
    erroriRicorrenti.length > 0 ? erroriRicorrenti.map((e) => `- ${e}`).join('\n') : '_(nessuno tracciato)_',
    '',
    `## Note`,
    '',
    'Memoria compounding aggiornata automaticamente post-sessione. PRINCIPIO ZERO: usata da UNLIM per personalizzazione percorso, NO comandi al docente.',
    '',
  ].join('\n');

  return frontMatter + body;
}

export function buildTeacherMemory(teacherId, sessionLog = [], options = {}) {
  if (!teacherId) throw new Error('teacherId required');
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const stile = options.stile_didattico ?? inferStileDidattico(sessionLog);
  const sessioniCount = sessionLog.length;
  const classi = collectClassiSeguite(sessionLog);
  const volumi = collectVolumiPreferiti(sessionLog);

  const frontMatter = [
    '---',
    `teacherId: ${teacherId}`,
    `stile_didattico: ${stile}`,
    `created_at: ${options.created_at ?? today}`,
    `updated_at: ${today}`,
    `sessioni_count: ${sessioniCount}`,
    `classi_seguite: [${classi.map((c) => `"${c}"`).join(', ')}]`,
    `volumi_preferiti: [${volumi.map((v) => `"Vol${v}"`).join(', ')}]`,
    '---',
  ].join('\n');

  const body = [
    '',
    `# Memoria docente ${teacherId}`,
    '',
    `## Profilo`,
    '',
    `Stile inferito: **${stile}** (basato su ${sessioniCount} sessioni)`,
    '',
    `## Classi seguite`,
    '',
    classi.length > 0 ? classi.map((c) => `- ${c}`).join('\n') : '_(nessuna)_',
    '',
    `## Volumi più usati`,
    '',
    volumi.length > 0 ? volumi.map((v) => `- Volume ${v}`).join('\n') : '_(nessuno)_',
    '',
    `## Note`,
    '',
    'Memoria compounding del docente. UNLIM la usa per adattare suggerimenti al suo stile (visivo, narrativo, hands-on).',
    '',
  ].join('\n');

  return frontMatter + body;
}

export function inferLivello(sessionLog) {
  if (!Array.isArray(sessionLog) || sessionLog.length === 0) return 'principiante';
  const totalEsp = collectEsperimentiFatti(sessionLog).length;
  if (totalEsp >= 30) return 'avanzato';
  if (totalEsp >= 10) return 'intermedio';
  return 'principiante';
}

export function inferStileDidattico(sessionLog) {
  if (!Array.isArray(sessionLog) || sessionLog.length === 0) return 'da-osservare';
  const counts = { hands_on: 0, narrativo: 0, visivo: 0 };
  for (const s of sessionLog) {
    if (s.mode === 'libero' || s.tags?.includes('hands-on')) counts.hands_on++;
    else if (s.tags?.includes('narrativo') || s.mode === 'percorso') counts.narrativo++;
    else if (s.mode === 'passopasso' || s.tags?.includes('visivo')) counts.visivo++;
  }
  const max = Math.max(counts.hands_on, counts.narrativo, counts.visivo);
  if (counts.hands_on === max) return 'hands-on';
  if (counts.narrativo === max) return 'narrativo';
  return 'visivo';
}

export function collectEsperimentiFatti(sessionLog) {
  if (!Array.isArray(sessionLog)) return [];
  const set = new Set();
  for (const s of sessionLog) {
    if (s.experimentId) set.add(s.experimentId);
    if (Array.isArray(s.experiments_completed)) s.experiments_completed.forEach((e) => set.add(e));
  }
  return Array.from(set).sort();
}

export function collectErroriRicorrenti(sessionLog) {
  if (!Array.isArray(sessionLog)) return [];
  const counts = {};
  for (const s of sessionLog) {
    for (const err of s.errors ?? []) {
      counts[err] = (counts[err] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e);
}

export function collectClassiSeguite(sessionLog) {
  if (!Array.isArray(sessionLog)) return [];
  const set = new Set();
  for (const s of sessionLog) {
    if (s.classId) set.add(s.classId);
  }
  return Array.from(set).sort();
}

export function collectVolumiPreferiti(sessionLog) {
  if (!Array.isArray(sessionLog)) return [];
  const counts = {};
  for (const s of sessionLog) {
    if (s.experimentId) {
      const m = s.experimentId.match(/^v([1-3])-/);
      if (m) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => parseInt(v, 10));
}
