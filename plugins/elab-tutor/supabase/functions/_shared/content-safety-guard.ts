/**
 * content-safety-guard — Sprint T iter 19 (Andrea mandate addendum §3)
 *
 * 10-rule content safety guard for UNLIM responses targeting K12 minori (8-14).
 * Deno runtime, _shared edge function module.
 *
 * Composes with principio-zero-validator.ts (sister rules pedagogiche).
 * This guard focuses on SAFETY: volgari, off-topic, privacy minori, GDPR Art.8,
 * EU AI Act high-risk education audit. Non-overlapping with PZ rules.
 *
 * Latency budget: <30ms total — regex-only, single-pass; audit-log fire async.
 *
 * Output contract:
 *   passed=true   response safe to ship
 *   passed=false  caller must apply rewritten if present, else block
 *
 * Telemetry: emits 3 metrics via emitMetric callback (caller-injectable):
 *   - safety_guard_fires_total (rule label)
 *   - safety_guard_block_rate 0..1
 *   - safety_guard_retry_success_total
 *
 * (c) Andrea Marro 2026-04-28 ELAB Tutor
 */

export interface SafetyResult {
  passed: boolean;
  rule_fired?: string;
  reason?: string;
  rewritten?: string;
  /** All triggered rules (rule_fired = first/highest severity). */
  all_fires?: string[];
  /** Per-rule notes for audit. */
  notes?: Record<string, string>;
}

export interface SafetyContext {
  vol_pag?: string;
  classe_eta?: number;
  intent?: string;
  student_name?: string;
  class_name?: string;
  parental_consent?: boolean;
  rag_chunks?: Array<{ volume?: string | number; page?: number; text?: string }>;
}

type EmitMetric = (name: string, value: number, labels?: Record<string, string>) => void;

let emitMetricFn: EmitMetric = (_n, _v, _l) => { /* no-op default */ };
export function setEmitMetric(fn: EmitMetric): void { emitMetricFn = fn; }

// Audit log (EU AI Act Art.6 + Annex III high-risk education)
export interface AuditLogEntry {
  ts: string;
  rule: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  classe_eta?: number;
  text_preview: string;
}

type AuditWriter = (entry: AuditLogEntry) => Promise<void>;
let auditWriterFn: AuditWriter | null = null;
export function setAuditWriter(fn: AuditWriter): void { auditWriterFn = fn; }

async function fireAudit(entry: AuditLogEntry): Promise<void> {
  if (!auditWriterFn) return;
  try { await auditWriterFn(entry); } catch (_err) { /* non-fatal */ }
}

// Rule 1: Volgari blacklist Italian (50+ termini)
const VOLGARI_IT = [
  'cazzo', 'merda', 'stronzo', 'stronza', 'puttana', 'troia', 'figa', 'fica',
  'coglione', 'coglioni', 'minchia', 'cazzata', 'incazzato', 'incazzata',
  'vaffanculo', 'fanculo', 'porco dio', 'porco diavolo', 'madonna puttana',
  'cretino', 'cretina', 'idiota', 'imbecille', 'scemo', 'scema', 'deficiente',
  'bastardo', 'bastarda', 'pirla', 'pezzo di merda', 'rompicoglioni',
  'rompipalle', 'rompiballe', 'sticazzi', 'che cazzo', 'che minchia',
  'sti cazzi', 'inculato', 'inculata', 'sega', 'pompino', 'pompinaro',
  'tette', 'culo grosso', 'culone', 'cesso', 'cessa', 'mongoloide', 'handicappato',
  'ritardato', 'ritardata', 'frocio', 'gay di merda', 'lesbica di merda',
];
const VOLGARI_RE = new RegExp(`\\b(${VOLGARI_IT.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');

// Rule 2: Off-topic detect (non-STEM-K12)
// iter 11 PATCH B: extend per live smoke Q8 "Quanto fa 2+2?" + altre matematica/aritmetica generic.
// UNLIM è specializzato elettronica/Arduino, non matematica generica/storia/sport. Redirect mandate.
const OFFTOPIC_RE = /\b(politica|elezioni|governo|religione|preghiera|sesso|porno|droga|alcool|alcol|sigaretta|fumo|marijuana|cocaina|partito\s+politico|terrorismo|guerra\s+in\s+\w+|quanto\s+fa\s+\d|matematica\s+(?!del|della|dei|degli)|aritmetica|calcolo\s+matematico|capitale\s+(di|del|della)|presidente\s+(di|del|della)|geografia|sport(?!ello)|cinema|musica|videogioc|tiktok|instagram|youtube)\b/i;

// iter 11 PATCH B — voltage safety detector (Q9 "220V casa" hard block).
// Andrea mandate Principio Zero: kit ELAB sempre 9V batteria sicura, MAI 220V casa minori 8-14.
// Regex match: 220V|110V|tensione di rete|presa (di corrente|a muro)|impianto elettrico|alta tensione.
const VOLTAGE_DANGER_RE = /\b(220\s*[Vv]|110\s*[Vv]|tensione\s+di\s+rete|presa\s+(di\s+corrente|a\s+muro|elettrica)|prese\s+a\s+muro|impianto\s+elettrico|alta\s+tensione|corrente\s+di\s+casa|elettricit[àa]\s+di\s+casa)\b/i;

// Rule 3: Linguaggio inappropriato minori (Flesch-Kincaid IT < 8th grade)
function fkGradeIt(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const avgSent = words.length / sentences.length;
  let totalSyl = 0;
  for (const w of words) {
    const m = w.toLowerCase().match(/[aeiouàèéìòùy]+/g);
    totalSyl += Math.max(1, m ? m.length : 1);
  }
  const avgSyl = totalSyl / words.length;
  return Math.max(0, avgSent * 0.39 + avgSyl * 11.8 - 15.59);
}

// Rule 4: Imperative docente check
const IMP_DOCENTE_RE = /\b(fai questo|devi fare|tu devi|fai così|fallo|esegui)\b/i;
function rewriteImperativo(text: string): string {
  return text
    .replace(/\bfai questo\b/gi, 'ai ragazzi vediamo come')
    .replace(/\bdevi fare\b/gi, 'ai ragazzi proviamo a fare')
    .replace(/\btu devi\b/gi, 'ai ragazzi')
    .replace(/\bfai così\b/gi, 'ai ragazzi facciamo così')
    .replace(/\bfallo\b/gi, 'facciamolo insieme')
    .replace(/\besegui\b/gi, 'eseguiamo');
}

// Rule 5: Plurale obbligatorio "Ragazzi," presence
const RAGAZZI_RE = /\bRagazzi\b/i;

// Rule 6: Vol/pag VERBATIM check (claim must match RAG chunk)
const VOL_PAG_CLAIM_RE = /Vol\.\s*([1-3])\s+pag\.\s*(\d+)/gi;

function citationVerbatimOk(response: string, chunks?: Array<{ volume?: string | number; page?: number }>): { ok: boolean; reason?: string } {
  const claims: Array<{ vol: string; page: number }> = [];
  let m: RegExpExecArray | null;
  VOL_PAG_CLAIM_RE.lastIndex = 0;
  while ((m = VOL_PAG_CLAIM_RE.exec(response)) !== null) {
    claims.push({ vol: m[1], page: parseInt(m[2], 10) });
  }
  if (claims.length === 0) return { ok: true };
  if (!chunks || chunks.length === 0) {
    return { ok: false, reason: 'citation present but no RAG chunks to verify' };
  }
  for (const c of claims) {
    const found = chunks.some(ch => String(ch.volume || '').includes(c.vol) && Number(ch.page) === c.page);
    if (!found) {
      return { ok: false, reason: `Vol.${c.vol} pag.${c.page} not in RAG chunks (hallucination risk)` };
    }
  }
  return { ok: true };
}

// Rule 7: Hallucination detect (numeric/factual claim without source)
const NUMERIC_CLAIM_RE = /\b\d+(?:[.,]\d+)?\s*(ohm|Ω|volt|V\b|ampere|A\b|watt|W\b|mA|µA|kΩ|MΩ|kHz|MHz|byte|KB|MB)\b/i;
function hallucinationLikely(response: string, hasRagSupport: boolean): boolean {
  if (hasRagSupport) return false;
  return NUMERIC_CLAIM_RE.test(response);
}

// Rule 8: Privacy minori (NEVER cite student name/class name)
function privacyMinoriViolation(response: string, ctx: SafetyContext): string | null {
  if (ctx.student_name && ctx.student_name.length > 1) {
    const re = new RegExp(`\\b${ctx.student_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(response)) return `student_name '${ctx.student_name}' leaked`;
  }
  if (ctx.class_name && ctx.class_name.length > 1) {
    const re = new RegExp(`\\b${ctx.class_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(response)) return `class_name '${ctx.class_name}' leaked`;
  }
  return null;
}

// Rule 9: GDPR Art. 8 minori 8-14 (parental consent)
function gdprMinoriBlock(ctx: SafetyContext): string | null {
  if (typeof ctx.classe_eta === 'number' && ctx.classe_eta >= 8 && ctx.classe_eta <= 14) {
    if (ctx.parental_consent === false) {
      return 'GDPR Art.8 minori 8-14: parental_consent=false → block runtime processing';
    }
  }
  return null;
}

// Main entry
export async function checkContentSafety(
  text: string,
  context: SafetyContext = {},
): Promise<SafetyResult> {
  const fires: string[] = [];
  const notes: Record<string, string> = {};
  let rewritten: string | undefined;

  // Rule 1: Volgari
  const m1 = text.match(VOLGARI_RE);
  if (m1) {
    fires.push('volgari_blacklist');
    notes.volgari_blacklist = `match='${m1[0]}'`;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'volgari_blacklist' });
    await fireAudit({
      ts: new Date().toISOString(), rule: 'volgari_blacklist', severity: 'CRITICAL',
      reason: `volgare match: ${m1[0]}`, classe_eta: context.classe_eta,
      text_preview: text.slice(0, 120),
    });
  }

  // Rule 2: Off-topic
  const m2 = text.match(OFFTOPIC_RE);
  if (m2) {
    fires.push('off_topic');
    notes.off_topic = `match='${m2[0]}' redirect to STEM K12`;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'off_topic' });
  }

  // iter 11 PATCH B Rule 11: voltage_danger detector + safety rewrite
  // Andrea live smoke Q9 "Posso usare 220V casa?" UNLIM rispondeva senza redirect 9V.
  // Hard rewrite con plurale Ragazzi + redirect kit ELAB 9V batteria sicura.
  const m11 = text.match(VOLTAGE_DANGER_RE);
  if (m11) {
    fires.push('voltage_danger');
    notes.voltage_danger = `voltage match='${m11[0]}' — minori 8-14 vietato 220V casa`;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'voltage_danger' });
    rewritten = `Ragazzi, attenzione: ${m11[0]} è pericoloso per ragazzi 8-14 anni. Sul kit ELAB usate sempre la batteria 9V — sicura e perfetta per tutti gli esperimenti dei volumi. Per dubbi, controllate il libro o chiedete al docente.`;
    await fireAudit({
      ts: new Date().toISOString(), rule: 'voltage_danger', severity: 'CRITICAL',
      reason: `voltage danger detected: ${m11[0]}`, classe_eta: context.classe_eta,
      text_preview: text.slice(0, 120),
    });
  }

  // Rule 3: Flesch-Kincaid grade
  const grade = fkGradeIt(text);
  if (grade > 8) {
    fires.push('linguaggio_complesso');
    notes.linguaggio_complesso = `FK grade ${grade.toFixed(1)} > 8 (target <=8 per età 8-14)`;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'linguaggio_complesso' });
  }

  // Rule 4: Imperative docente
  const m4 = text.match(IMP_DOCENTE_RE);
  if (m4) {
    fires.push('imperativo_docente');
    notes.imperativo_docente = `match='${m4[0]}' rewrite suggested`;
    rewritten = rewriteImperativo(text);
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'imperativo_docente' });
  }

  // Rule 5: Plurale "Ragazzi,"
  if (!RAGAZZI_RE.test(text)) {
    fires.push('plurale_ragazzi_missing');
    notes.plurale_ragazzi_missing = 'response missing plurale "Ragazzi," (Principio Zero violation)';
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'plurale_ragazzi_missing' });
  }

  // Rule 6: Vol/pag VERBATIM
  const cit = citationVerbatimOk(text, context.rag_chunks);
  if (!cit.ok) {
    fires.push('citation_verbatim_fail');
    notes.citation_verbatim_fail = cit.reason || 'citation mismatch';
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'citation_verbatim_fail' });
    await fireAudit({
      ts: new Date().toISOString(), rule: 'citation_verbatim_fail', severity: 'HIGH',
      reason: cit.reason || 'citation mismatch', classe_eta: context.classe_eta,
      text_preview: text.slice(0, 120),
    });
  }

  // Rule 7: Hallucination detect
  const hasRag = !!(context.rag_chunks && context.rag_chunks.length > 0);
  if (hallucinationLikely(text, hasRag)) {
    fires.push('hallucination_numeric');
    notes.hallucination_numeric = 'numeric claim without RAG source';
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'hallucination_numeric' });
  }

  // Rule 8: Privacy minori
  const privBreach = privacyMinoriViolation(text, context);
  if (privBreach) {
    fires.push('privacy_minori');
    notes.privacy_minori = privBreach;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'privacy_minori' });
    await fireAudit({
      ts: new Date().toISOString(), rule: 'privacy_minori', severity: 'CRITICAL',
      reason: privBreach, classe_eta: context.classe_eta,
      text_preview: text.slice(0, 60),
    });
  }

  // Rule 9: GDPR Art. 8 minori 8-14
  const gdprMsg = gdprMinoriBlock(context);
  if (gdprMsg) {
    fires.push('gdpr_minori');
    notes.gdpr_minori = gdprMsg;
    emitMetricFn('safety_guard_fires_total', 1, { rule: 'gdpr_minori' });
    await fireAudit({
      ts: new Date().toISOString(), rule: 'gdpr_minori', severity: 'CRITICAL',
      reason: gdprMsg, classe_eta: context.classe_eta,
      text_preview: text.slice(0, 60),
    });
  }

  // Rule 10: EU AI Act high-risk education audit summary
  if (fires.length > 0) {
    await fireAudit({
      ts: new Date().toISOString(), rule: 'eu_ai_act_summary',
      severity: fires.includes('volgari_blacklist') || fires.includes('privacy_minori') || fires.includes('gdpr_minori') ? 'CRITICAL' : 'MEDIUM',
      reason: `EU AI Act Annex III edu fires=[${fires.join(',')}]`,
      classe_eta: context.classe_eta,
      text_preview: text.slice(0, 120),
    });
  }

  const blockingFires = fires.filter(f => f !== 'imperativo_docente' || fires.length > 1);
  const passed = blockingFires.length === 0 && !gdprMsg && !privBreach && !m1;

  emitMetricFn('safety_guard_block_rate', passed ? 0 : 1);
  if (passed && rewritten) emitMetricFn('safety_guard_retry_success_total', 1);

  if (fires.length === 0) {
    return { passed: true };
  }
  return {
    passed,
    rule_fired: fires[0],
    reason: notes[fires[0]],
    rewritten,
    all_fires: fires,
    notes,
  };
}

/** Test helper: reset metric/audit injection. */
export function _resetSafetyGuardForTests(): void {
  emitMetricFn = (_n, _v, _l) => { /* no-op */ };
  auditWriterFn = null;
}
