// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * principioZeroValidator — Sprint Q3.E
 * Andrea Marro 2026-04-25
 */

const IMPERATIVO_DOCENTE_PATTERNS = [
  /\b(tu\s+docente|caro\s+docente|insegnante,)/i,
  /\bdistribuisci\s+i\s+kit\b/i,
  /\bmostra\s+alla\s+lim\b/i,
];

const TU_SINGOLARE_STUDENTE = /\b(tu\s+studente|caro\s+studente|hai\s+tu)\b/i;

const PII_PATTERNS = [
  /\b\d{3}[- ]?\d{3,7}\b/,
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+@\b/,
];

const ENGLISH_FILLER = /\b(actually|basically|literally|let me|here is|alright)\b/i;

const ACTION_TAG_RE = /\[(AZIONE|INTENT):[^\]]+\]/g;

export function countWordsExcludingTags(text) {
  if (!text || typeof text !== 'string') return 0;
  const stripped = text.replace(ACTION_TAG_RE, '').trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter((w) => w.length > 0).length;
}

export function extractCitations(text) {
  if (!text) return [];
  const re = /Vol\.\s*([1-3])\s+pag\.\s*(\d{1,3})/gi;
  const out = [];
  for (const m of text.matchAll(re)) {
    out.push({ volume: parseInt(m[1], 10), page: parseInt(m[2], 10) });
  }
  return out;
}

export function validatePrincipioZero(text, options = {}) {
  const violations = [];
  if (!text || typeof text !== 'string') {
    return { valid: false, violations: [{ rule: 'empty_text', severity: 'critical', message: 'Testo vuoto' }] };
  }

  const wordCount = countWordsExcludingTags(text);
  const maxWords = options.maxWords ?? 60;
  if (wordCount > maxWords) {
    violations.push({ rule: 'max_words', severity: 'high', message: `${wordCount} > ${maxWords}`, detail: { wordCount, maxWords } });
  }

  for (const pattern of IMPERATIVO_DOCENTE_PATTERNS) {
    if (pattern.test(text)) {
      violations.push({ rule: 'imperativo_docente', severity: 'critical', message: 'Comando docente diretto trovato', detail: { pattern: pattern.source } });
      break;
    }
  }

  if (TU_SINGOLARE_STUDENTE.test(text)) {
    violations.push({ rule: 'singolare_studente', severity: 'high', message: 'Tu singolare invece di plurale ragazzi' });
  }

  for (const pattern of PII_PATTERNS) {
    if (pattern.test(text)) {
      violations.push({ rule: 'pii_potential', severity: 'high', message: 'Pattern PII potenziale', detail: { pattern: pattern.source } });
      break;
    }
  }

  if (ENGLISH_FILLER.test(text)) {
    violations.push({ rule: 'english_filler', severity: 'low', message: 'Filler inglese' });
  }

  const citations = extractCitations(text);
  return {
    valid: violations.filter((v) => v.severity === 'critical' || v.severity === 'high').length === 0,
    violations,
    word_count: wordCount,
    citations,
  };
}

export function capWords(text, maxWords = 60) {
  if (!text) return text;
  const tags = [];
  let stripped = text.replace(ACTION_TAG_RE, (m) => {
    tags.push(m);
    return ` __TAG${tags.length - 1}__ `;
  });
  const words = stripped.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  let truncated = words.slice(0, maxWords).join(' ');
  truncated = truncated.replace(/__TAG(\d+)__/g, (_, idx) => tags[parseInt(idx, 10)] ?? '');
  if (!/[.!?]$/.test(truncated)) truncated += '...';
  return truncated;
}
