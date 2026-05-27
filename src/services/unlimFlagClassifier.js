// © Andrea Marro — 26/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * UNLIM intent flags — client-side classifier for the live LIM turn.
 * Mirrors the Edge Function V3 flag vocabulary and adds WANTS_EXPLAIN so the
 * browser can send Andrea's full operational mandate with each chat request.
 */

export const UNLIM_INTENT_FLAGS = [
  'WANTS_SCREEN_VIEW',
  'WANTS_EXPLAIN',
  'WANTS_ACTION',
  'WANTS_DIAGNOSE',
  'WANTS_NEXT',
  'WANTS_REVIEW',
  'OFF_TOPIC',
  'SAFETY_MINOR',
  'SECRET_PROJECT',
];

const FLAG_PATTERNS = {
  WANTS_SCREEN_VIEW: /\b(guarda(?:te|mi|lo|la)?|vedi|vedete|vediamo|osserva(?:te)?|cosa\s+(?:c[' ]?e|c.?e)\s+(?:qui|sullo\s+schermo|sulla\s+lavagna)|schermo|lavagna|questo|questa|qui|screenshot|cosa\s+vedi)\b/i,
  WANTS_EXPLAIN: /\b(spieg\w*|racconta(?:mi|te)?|perch[eéè]|come\s+funziona|cosa\s+(?:fa|significa|vuol\s+dire)|a\s+cosa\s+serve|fammi\s+capire|non\s+capisco)\b/i,
  WANTS_ACTION: /\b(carica(?:re|te)?|collega(?:re|te)?|evidenzia(?:re|te)?|compila(?:re|te)?|mostra(?:re|te)?|apri(?:re|te)?|vai\s+(?:a|al|alla|su)|monta(?:re|te)?|attiva(?:re|te)?|avvia(?:re|te)?|esegui(?:re|te)?|fai\s+(?:partire|vedere|girare)|cancella(?:re|te)?|resetta(?:re|te)?)\b/i,
  WANTS_DIAGNOSE: /\b(perch[eéè]\s+non\s+(?:funziona|va|parte|si\s+accende)|non\s+(?:funziona|va|parte|si\s+accende)|errore|sbagliat[oa]|sbaglio|sbagli|cosa\s+(?:ho\s+)?sbagli|bug|crash|bloccat[oa]|fermo|spento|brucia|fumo)\b/i,
  WANTS_NEXT: /\b(prossim[oa]\s+(?:passo|step|esperimento|capitolo)|avanti|continuiamo|continua(?:re|te)?|riprendiamo|riprendi|che\s+faccio\s+(?:adesso|ora|dopo)|cosa\s+(?:viene\s+)?dopo|step\s+(?:successivo|seguente))\b/i,
  WANTS_REVIEW: /\b(ricontrolla(?:re|te)?|verifica(?:re|te)?|controlla(?:re|te)?\s+(?:se|che)|ho\s+fatto\s+bene|e\s+giusto|[èe]\s+giusto|e\s+corrett[oa]|[èe]\s+corrett[oa]|va\s+bene\s+cos[iì]|secondo\s+te\s+e\s+ok|ok\s+cos[iì])\b/i,
  OFF_TOPIC: /\b(calcio|partita|juve|inter|milan|napoli|film|netflix|attore|attrice|ricetta|cucina|musica|cantante|canzone|fortnite|minecraft|roblox|videogioco|tiktok|formula\s*1|tennis|basket|storia\s+romana|napoleone|capitale\s+di)\b/i,
  // Adversarial H4 (2026-05-26): extend injury vocabulary to match server-side
  // ITER27_SAFETY_BROAD_RE coverage — "brucia/folgora/ustione/ferito" were
  // missing client-side, leaving child injury reports flag-less.
  SAFETY_MINOR: /\b(220\s*v|230\s*v|110\s*v|380\s*v|presa\s+(?:di\s+)?corrente|tensione\s+(?:di\s+)?rete|corrente\s+(?:di\s+)?casa|alta\s+tensione|scossa|elettrocuzione|folgor\w*|impianto\s+elettrico|pericoloso\s+per\s+(?:ragazzi|bambini|minori)|brucia(?:re|to|ta)?|ustion\w*|ferit[oai]|si\s+(?:è|e)\s+(?:fatto|fatta)\s+male|fumo\s+(?:dal|dalla|dai))\b/i,
  SECRET_PROJECT: /\b(system\s+prompt|prompt\s+(?:di\s+)?sistema|istruzioni\s+(?:di\s+)?sistema|ignora\s+(?:le\s+)?istruzioni|dimentica\s+(?:le\s+)?istruzioni|jailbreak|prompt\s+injection|api\s+key|service\s+role|supabase\s+key|env\s+vars?|rivela\s+(?:il\s+)?segreto)\b/i,
};

const ELAB_TOPIC_RE = /\b(led|resistor[ei]?|resistenza|breadboard|arduino|nano|circuito|fili?|pin|gnd|batteria|volt|corrente|pulsante|potenziometro|ldr|fotoresistore|buzzer|servo|scratch|blockly|compila|simulazione|lavagna|passo\s+passo|volume|capitolo|esperimento)\b/i;

function scoreFlag(flag, text) {
  const matched = FLAG_PATTERNS[flag]?.test(text) || false;
  if (!matched) return null;
  const critical = flag === 'SAFETY_MINOR' || flag === 'SECRET_PROJECT';
  return {
    flag,
    confidence: critical ? 0.98 : 0.86,
    reason: `regex:${flag.toLowerCase()}`,
  };
}

export function classifyUnlimIntentFlags(message, screenSnapshot = null) {
  const text = typeof message === 'string' ? message.trim() : '';
  const flags = Object.fromEntries(UNLIM_INTENT_FLAGS.map(flag => [flag, false]));
  const matches = [];

  if (text) {
    for (const flag of UNLIM_INTENT_FLAGS) {
      if (flag === 'OFF_TOPIC') continue;
      const match = scoreFlag(flag, text);
      if (match) {
        flags[flag] = true;
        matches.push(match);
      }
    }

    if (FLAG_PATTERNS.OFF_TOPIC.test(text) && !ELAB_TOPIC_RE.test(text)) {
      flags.OFF_TOPIC = true;
      matches.push({ flag: 'OFF_TOPIC', confidence: 0.82, reason: 'regex:off_topic_without_elab_terms' });
    }
  }

  if (!flags.WANTS_SCREEN_VIEW && screenSnapshot?.visual?.available && /\b(questo|qui|lavagna|schermo)\b/i.test(text)) {
    flags.WANTS_SCREEN_VIEW = true;
    matches.push({ flag: 'WANTS_SCREEN_VIEW', confidence: 0.78, reason: 'screen_snapshot_available' });
  }

  const triggered_flags = UNLIM_INTENT_FLAGS.filter(flag => flags[flag]);
  const confidenceByFlag = Object.fromEntries(matches.map(match => [match.flag, match.confidence]));
  const reasonsByFlag = Object.fromEntries(matches.map(match => [match.flag, match.reason]));

  return {
    flags,
    triggered_flags,
    confidenceByFlag,
    reasonsByFlag,
    primary_flag: triggered_flags[0] || null,
  };
}

export function hasUnlimIntentFlag(classification, flag) {
  return Boolean(classification?.flags?.[flag] || classification?.triggered_flags?.includes?.(flag));
}

export function serializeUnlimIntentFlags(classification) {
  if (!classification || !Array.isArray(classification.triggered_flags)) return [];
  return classification.triggered_flags.map(flag => ({
    flag,
    confidence: Number(classification.confidenceByFlag?.[flag] ?? 0.75),
    reason: classification.reasonsByFlag?.[flag] || 'client-classifier',
  }));
}
