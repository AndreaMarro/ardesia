// ============================================
// ELAB Tutor - Content Filter per Bambini
// Filtra contenuti inappropriati (input/output)
// Protegge dati personali (PII)
// © Andrea Marro — 2026
// ============================================

// Pattern di contenuti inappropriati (semplificato, adatto a contesto IT)
// NOTE: Usiamo /i senza /g per i test (checkContent) — /g causa bug lastIndex con test().
// Per sanitizeOutput (replace) usiamo copie con /gi su richiesta.
const INAPPROPRIATE_PATTERNS = [
  // Insulti comuni italiani
  /\b(cretino|stupido|idiota|deficiente|scemo|imbecille|coglione|stronzo|merda|cazzo|vaffanculo|minchia|puttana|troia|bastardo|figlio di)\b/i,
  // Contenuti violenti
  /\b(ammazzare|uccidere|sparare|bomba|esplosivo|arma|pistola|fucile|coltello|morire)\b/i,
  // Contenuti adulti
  /\b(porno|sesso|nudo|droga|cocaina|eroina|marijuana)\b/i,
];

// Pattern PII (dati personali da proteggere)
// NOTE: Usiamo /i senza /g — match() al posto di test() per evitare bug lastIndex.
const PII_PATTERNS = [
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
  // Telefono italiano
  /\b(\+39\s?)?(\d{2,4}[\s.-]?\d{6,8})\b/i,
  // Codice fiscale
  /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/i,
  // Indirizzo (via/piazza + numero)
  /\b(via|piazza|viale|corso|largo)\s+[a-zA-Zàèéìòù\s]+,?\s*\d+\b/i,
];

/**
 * Controlla se un testo contiene contenuti inappropriati
 * @param {string} text - Testo da controllare
 * @returns {{ safe: boolean, reason: string|null }}
 */
export function checkContent(text) {
  if (!text || typeof text !== 'string') return { safe: true, reason: null };

  const lower = text.toLowerCase().trim();

  // Ignora messaggi troppo corti (non filtrabili)
  if (lower.length < 3) return { safe: true, reason: null };

  // Controlla pattern inappropriati (match() non muta lastIndex, sicuro senza /g)
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (lower.match(pattern)) {
      return {
        safe: false,
        reason: 'inappropriate'
      };
    }
  }

  return { safe: true, reason: null };
}

/**
 * Controlla se un testo contiene dati personali
 * @param {string} text
 * @returns {{ hasPII: boolean, type: string|null }}
 */
export function checkPII(text) {
  if (!text || typeof text !== 'string') return { hasPII: false, type: null };

  const PII_LABELS = ['email', 'telefono', 'codice_fiscale', 'indirizzo'];

  // match() non muta lastIndex, sicuro senza /g
  for (let i = 0; i < PII_PATTERNS.length; i++) {
    if (text.match(PII_PATTERNS[i])) {
      return { hasPII: true, type: PII_LABELS[i] || 'unknown' };
    }
  }

  return { hasPII: false, type: null };
}

/**
 * Sanitizza l'output dell'AI rimuovendo contenuti inappropriati
 * @param {string} text - Risposta dell'AI
 * @returns {string} - Testo sanitizzato
 */
export function sanitizeOutput(text) {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  // Rimuovi pattern inappropriati dall'output
  // Usa RegExp con flag /gi per replace globale (crea nuova istanza per evitare lastIndex condiviso)
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    const globalPattern = new RegExp(pattern.source, 'gi');
    sanitized = sanitized.replace(globalPattern, '***');
  }

  return sanitized;
}

/**
 * Messaggio amichevole per contenuto bloccato
 */
export function getBlockMessage(reason) {
  switch (reason) {
    case 'inappropriate':
      return 'Usiamo parole gentili! UNLIM risponde solo a domande di elettronica e scienza.';
    case 'pii':
      return 'Per la tua sicurezza, non condividere dati personali come email o numeri di telefono nella chat.';
    default:
      return 'Questo messaggio non può essere inviato. Prova a riformulare la tua domanda.';
  }
}

/**
 * Funzione completa di validazione messaggio
 * @param {string} text
 * @returns {{ allowed: boolean, message: string|null }}
 */
export function validateMessage(text) {
  // Controllo contenuto inappropriato
  const contentCheck = checkContent(text);
  if (!contentCheck.safe) {
    return {
      allowed: false,
      message: getBlockMessage(contentCheck.reason)
    };
  }

  // Controllo PII
  const piiCheck = checkPII(text);
  if (piiCheck.hasPII) {
    return {
      allowed: false,
      message: getBlockMessage('pii')
    };
  }

  return { allowed: true, message: null };
}
