/**
 * Principio Zero v3 Validator — multilingue
 *
 * Enforcement layer for every `speakTTS` text OpenClaw generates.
 * Operates by language (IT default, EN/ES/FR/DE ready).
 *
 * Rules per locale:
 *   1. Must contain plural-inclusive marker (Ragazzi, Kids, ...)
 *   2. Must NOT contain docente-meta ("Docente, leggi ai ragazzi...")
 *   3. Must NOT contain singular second-person addressed to student
 *   4. Volume citation required when explaining core concepts (LED, resistor, ...)
 *   5. Max words limit (default 80 allowing buffer over 60-word PZ v3 target)
 *
 * Returns { valid, reason, suggestions }.
 *
 * (c) ELAB Tutor — 2026-04-22
 */

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  suggestions?: string[];
  locale: string;
  wordCount: number;
}

interface LocaleRules {
  pluralPatterns: RegExp[];
  forbiddenDocenteMeta: RegExp[];
  forbiddenSingular: RegExp[];
  conceptsRequiringCitation: RegExp;
  citationPattern: RegExp;
  maxWords: number;
  localeName: string;
}

const RULES: Record<string, LocaleRules> = {
  it: {
    pluralPatterns: [
      /\b(Ragazz[ie]|Ragazzini|Bambin[ie])\b/i,
      /\b(Vediamo|Guardate|Provate|Osservate|Ricordate|Noi|Insieme|Immaginiamo|Pensate)\b/i,
    ],
    forbiddenDocenteMeta: [
      /\b(Docente|Insegnante|Professore|Maestro|Maestra)\s*,/i,
      /\b(Leggi|Leggete)\s+(ai\s+)?ragazzi/i,
      /\bProietta\s+(questo|sulla\s+LIM)/i,
      /\bSpiega\s+tu\b/i,
      /\bIstruzioni?\s+per\s+(il\s+)?(docente|insegnante)/i,
    ],
    forbiddenSingular: [
      /\bhai\s+fatto\b/i,
      /\bil\s+tuo\s+(LED|circuito|esperimento|risultato)/i,
      /\btu\s+devi\b/i,
      /\bpensa\s+tu\b/i,
      /\bguarda\s+tu\b/i,
      /\bla\s+tua\s+(classe|risposta)/i,
      /\bprova\s+tu\b/i,
    ],
    conceptsRequiringCitation:
      /\b(LED|resistor[ei]|resistenza|condensatore|diodo|transistor|Ohm|capacit[aà]|potenziometro|PWM|Arduino|MOSFET|relay|rel[eè]|servo|breadboard)\b/i,
    citationPattern: /\b(Vol\.?\s*\d+|Volume\s*\d+|pag\.?\s*\d+|pagina\s*\d+|Capitolo\s*\d+|cap\.?\s*\d+)\b/i,
    maxWords: 80,
    localeName: 'Italiano',
  },
  en: {
    pluralPatterns: [
      /\b(Kids|Everyone|Class|We|Let['']s|Together|Y['']all|Pupils|Students)\b/i,
      /\b(Look|Try|See|Watch|Remember|Observe|Imagine|Think)\b.{0,20}\b(together|class|everyone)\b/i,
    ],
    forbiddenDocenteMeta: [
      /\b(Teacher|Instructor|Professor)\s*,/i,
      /\bread\s+(this\s+)?to\s+your\s+(students|class|pupils)/i,
      /\bproject\s+(this\s+)?on\s+the\s+(LIM|whiteboard|screen)/i,
      /\byou\s+should\s+explain/i,
    ],
    forbiddenSingular: [
      /\byou\s+did\b/i,
      /\byour\s+(LED|circuit|experiment|result)\b/i,
      /\byou\s+should\s+(think|try|look)\b/i,
    ],
    conceptsRequiringCitation:
      /\b(LED|resistor|capacitor|diode|transistor|Ohm|potentiometer|PWM|Arduino|MOSFET|relay|servo|breadboard)\b/i,
    citationPattern: /\b(Vol\.?\s*\d+|Volume\s*\d+|p\.?\s*\d+|page\s*\d+|Chapter\s*\d+|chap\.?\s*\d+)\b/i,
    maxWords: 80,
    localeName: 'English',
  },
  es: {
    pluralPatterns: [
      /\b(Chicos|Chicas|Ni[nñ]os|Todos|Clase|Nosotros|Veamos|Juntos)\b/i,
      /\b(Mirad|Mirad|Probad|Observad|Recordad|Imaginad)\b/i,
    ],
    forbiddenDocenteMeta: [
      /\b(Profe|Profesor|Profesora|Maestro|Maestra)\s*,/i,
      /\blee\s+a\s+tus\s+(alumnos|estudiantes)/i,
      /\bproyecta\s+esto/i,
    ],
    forbiddenSingular: [/\bhas\s+hecho\b/i, /\btu\s+LED\b/i, /\bdebes\s+pensar\b/i],
    conceptsRequiringCitation: /\b(LED|resistor|condensador|diodo|transistor|Ohm|potenci[oó]metro|PWM|Arduino)\b/i,
    citationPattern: /\b(Vol\.?\s*\d+|Volumen\s*\d+|p[aá]g\.?\s*\d+|p[aá]gina\s*\d+|Cap[ií]tulo\s*\d+)\b/i,
    maxWords: 80,
    localeName: 'Espa\u00f1ol',
  },
  fr: {
    pluralPatterns: [
      /\b(Les\s+enfants|Tous|Classe|Nous|Regardons|Ensemble|Voyons)\b/i,
      /\b(Regardez|Essayez|Observez|Souvenez)\b/i,
    ],
    forbiddenDocenteMeta: [
      /\b(Prof|Enseignant|Enseignante|Ma[iî]tre|Ma[iî]tresse)\s*,/i,
      /\blisez\s+[aà]\s+vos\s+[eé]l[eè]ves/i,
      /\bprojetez\s+ceci/i,
    ],
    forbiddenSingular: [/\btu\s+as\s+fait\b/i, /\bton\s+LED\b/i, /\btu\s+dois\b/i],
    conceptsRequiringCitation: /\b(LED|r[eé]sistance|condensateur|diode|transistor|Ohm|potentiom[eè]tre|PWM|Arduino)\b/i,
    citationPattern: /\b(Vol\.?\s*\d+|Volume\s*\d+|p\.?\s*\d+|page\s*\d+|Chapitre\s*\d+)\b/i,
    maxWords: 80,
    localeName: 'Fran\u00e7ais',
  },
  de: {
    pluralPatterns: [
      /\b(Kinder|Alle|Klasse|Wir|Schauen|Zusammen|Sehen)\b/i,
      /\b(Schaut|Versucht|Beobachtet|Erinnert)\b/i,
    ],
    forbiddenDocenteMeta: [
      /\b(Lehrer|Lehrerin|Dozent|Dozentin)\s*,/i,
      /\blies\s+deinen\s+Sch[uü]lern/i,
      /\bprojiziere\s+dies/i,
    ],
    forbiddenSingular: [/\bdu\s+hast\s+gemacht\b/i, /\bdein\s+LED\b/i, /\bdu\s+musst\b/i],
    conceptsRequiringCitation:
      /\b(LED|Widerstand|Kondensator|Diode|Transistor|Ohm|Potentiometer|PWM|Arduino|Schaltung)\b/i,
    citationPattern: /\b(Vol\.?\s*\d+|Band\s*\d+|S\.?\s*\d+|Seite\s*\d+|Kapitel\s*\d+)\b/i,
    maxWords: 80,
    localeName: 'Deutsch',
  },
};

export function validatePZv3(text: string, locale = 'it'): ValidationResult {
  const r = RULES[locale] || RULES.it;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Check 1: plural-inclusive marker must match
  if (!r.pluralPatterns.some(p => p.test(text))) {
    return {
      valid: false,
      reason: `${r.localeName}: missing plural-inclusive marker`,
      suggestions: [`Start or include "${locale === 'it' ? 'Ragazzi' : locale === 'en' ? 'Kids' : 'Chicos/Les enfants/Kinder'}"`, 'Rephrase in plural (Vediamo/Let\u2019s see/Veamos/Voyons/Schauen wir)'],
      locale,
      wordCount,
    };
  }

  // Check 2: no docente-meta
  for (const fdm of r.forbiddenDocenteMeta) {
    if (fdm.test(text)) {
      return {
        valid: false,
        reason: `${r.localeName}: forbidden docente-meta phrase (Principio Zero v3 violation)`,
        suggestions: ['Rewrite as narration addressed to the whole class, not to the teacher'],
        locale,
        wordCount,
      };
    }
  }

  // Check 3: no singular second-person directed at student
  for (const fs of r.forbiddenSingular) {
    if (fs.test(text)) {
      return {
        valid: false,
        reason: `${r.localeName}: singular second-person forbidden (students must be addressed as a group)`,
        suggestions: ['Use plural "we/you all/kids" instead of singular "you"'],
        locale,
        wordCount,
      };
    }
  }

  // Check 4: citation required for core concepts
  if (r.conceptsRequiringCitation.test(text) && !r.citationPattern.test(text)) {
    return {
      valid: false,
      reason: `${r.localeName}: concept mentioned without ELAB volume citation`,
      suggestions: [`Add Vol.X pag.Y reference (e.g., "As the ${locale === 'it' ? 'Vol. 1 pag. 27' : 'Vol. 1 p. 27'} says...")`],
      locale,
      wordCount,
    };
  }

  // Check 5: brevity
  if (wordCount > r.maxWords) {
    return {
      valid: false,
      reason: `${r.localeName}: ${wordCount} words exceeds max ${r.maxWords} (PZ v3 brevity)`,
      suggestions: ['Shorten to max 3 sentences + 1 analogy, under 60 words ideally'],
      locale,
      wordCount,
    };
  }

  return { valid: true, locale, wordCount };
}

export function isLocaleSupported(locale: string): boolean {
  return locale in RULES;
}

export function listSupportedLocales(): string[] {
  return Object.keys(RULES);
}

export function detectLocale(text: string): string {
  // Word-boundary heuristic — avoids false matches inside larger words
  // (e.g. "and" inside "random" should NOT score English).
  // For robust detection use franc or CLD3 at runtime.
  const samples = [
    { loc: 'it', hits: ['ragazzi', 'vediamo', 'insieme', 'provate', 'ricordate', 'è', 'come'] },
    { loc: 'en', hits: ['kids', 'class', 'together', 'remember', 'the', 'and'] },
    { loc: 'es', hits: ['chicos', 'clase', 'juntos', 'recordad', 'como', 'con'] },
    { loc: 'fr', hits: ['enfants', 'classe', 'ensemble', 'voyons', 'les', 'avec'] },
    { loc: 'de', hits: ['kinder', 'klasse', 'zusammen', 'schauen', 'der', 'die'] },
  ];
  const lower = text.toLowerCase();
  function wordBoundaryMatch(needle: string, haystack: string): boolean {
    const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'u');
    return re.test(haystack);
  }
  const scores = samples.map(s => ({ loc: s.loc, score: s.hits.filter(h => wordBoundaryMatch(h, lower)).length }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].loc : 'it';
}
