/**
 * principio-zero-validator — Sprint S iter 2 Task A2
 * Andrea Marro 2026-04-26
 *
 * Runtime middleware: post-LLM check su Principio Zero compliance.
 * Latency budget <50ms total — solo regex-based rules, no LLM nested call.
 *
 * Sister script `scripts/bench/score-unlim-quality.mjs` ha 12 rules complete
 * (con fixture metadata: requireWhenFlag, expectedActions, scenario).
 * Qui implementiamo le 6 rules che NON necessitano fixture metadata,
 * ovvero check intrinseci sulla risposta. Le altre 6 restano bench-time only.
 *
 * Decision per ADR-009 (default — architect-opus ADR not yet available):
 * - Severity gate: ritorna violations + severity max, NON rigetta risposta
 * - Caller decide se loggare CRITICAL+ a Supabase audit log
 * - Append-warning pattern (no rejection on student runtime)
 */

export type Severity = 'CRITICAL' | 'MAJOR' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface Violation {
  rule: string;
  severity: Severity;
  matched?: string;
  snippet?: string;
  suggestion?: string;
}

export interface ValidationResult {
  violations: Violation[];
  severity: Severity | null;
  passes: boolean;
  telemetry?: TelemetrySignals;
}

export interface TelemetrySignals {
  analogiaCount: number;
  analogiaMarkers: string[];
}

export interface ValidationContext {
  isConceptIntro?: boolean; // se true → enforce citation rule (legacy iter 2)
  requiresCitation?: boolean; // iter 27: enforce citation_vol_pag rule (volume context active)
  isOfftopic?: boolean; // iter 27: skip citation rule for off-topic responses
  isSafetyRefusal?: boolean; // iter 27: skip Ragazzi opener for safety refusals
  expectedActions?: string[]; // iter 27: enforce action_tags_when_expected rule
}

const SEVERITY_RANK: Record<Severity, number> = {
  CRITICAL: 5,
  MAJOR: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NONE: 0,
};

/**
 * Strip [AZIONE:...] and [INTENT:...] tags from text for word-count.
 */
function stripTags(text: string): string {
  return text
    .replace(/\[AZIONE:[^\]]+\]/gi, '')
    .replace(/\[INTENT:\{[^}]+\}\]/g, '')
    .trim();
}

function countWords(text: string): number {
  return stripTags(text).split(/\s+/).filter(Boolean).length;
}

/**
 * Validate response against Principio Zero rules.
 * Latency: <5ms typical (regex-only).
 *
 * Iter 27 (2026-05-11) — PZ V3 +6 runtime rules promotion (12/12 coverage):
 *
 * RUNTIME RULES (12, this function):
 *   1. imperativo_docente (HIGH)
 *   2. singolare_studente (HIGH)
 *   3. max_words_120 (MEDIUM) — Andrea ricalibrazione 10/05/2026
 *   4. no_citation_concept_intro (LOW, conditional ctx.isConceptIntro)
 *   5. english_filler (LOW)
 *   6. chatbot_preamble (LOW)
 *   7. plurale_ragazzi (MAJOR) — iter 27: MUST start "Ragazzi," (case-insens), skip if isSafetyRefusal
 *   8. citation_vol_pag (MAJOR) — iter 27: when ctx.requiresCitation, MUST contain Vol.\d+ pag./cap.\d+
 *   9. analogia (LOW telemetry-only) — iter 27: count occurrences "come una/come se/immagina", NOT MUST
 *  10. no_verbatim_3plus_frasi (MEDIUM) — iter 27 runtime: detect 3+ consecutive verbatim block markers
 *  11. off_topic_recognition (LOW) — iter 27 runtime: when isOfftopic, expect humble admission marker
 *  12. action_tags_when_expected (MEDIUM) — iter 27 runtime: when expectedActions provided, MUST emit [AZIONE:*]
 *
 * Bench-time-only deferred (humble_admission + synthesis_not_verbatim) still in score-unlim-quality.mjs:
 *   - humble_admission (deep-question/off-topic scenario rich check)
 *   - synthesis_not_verbatim (requires full RAG source corpus diff)
 *
 * Iter 27 severity model:
 *   - MAJOR triggers console.warn JSON telemetry (event=pz_runtime_violation_major)
 *   - MAJOR NON-BLOCKING (Andrea iter 28 ratify decide hard-block)
 *   - analogia LOW-telemetry: count-only, NO violation push
 *
 * @param response — LLM raw response text
 * @param ctx — optional context (backward-compat, all keys optional)
 */
export function validatePrincipioZero(
  response: string,
  ctx: ValidationContext = {},
): ValidationResult {
  const violations: Violation[] = [];
  const telemetry: TelemetrySignals = {
    analogiaCount: 0,
    analogiaMarkers: [],
  };

  // Rule 1: imperativo_docente (HIGH)
  // Frasi che iniziano con verbo imperativo singolare diretto al docente.
  // Match line-start (multiline) per coprire anche risposte multi-paragrafo.
  const impDocenteRe = /^(Distribuisci|Togli|Chiedi|Mostra|Spiega)\s/im;
  const m1 = response.match(impDocenteRe);
  if (m1) {
    violations.push({
      rule: 'imperativo_docente',
      severity: 'HIGH',
      matched: m1[0],
      suggestion: 'Usa plurale inclusivo: "Vediamo insieme...", "Distribuiamo i kit..."',
    });
  }

  // Rule 2: singolare_studente (HIGH)
  // Catches direct singular addressing student. Skip matches inside «...» (citazione fedele libro).
  const responseSansQuotes = response.replace(/«[^»]*»/g, ' ');
  const singStudenteRe = /\b(devi|hai sbagliato|prova(?!te)|guarda(?!te))\b/i;
  const m2 = responseSansQuotes.match(singStudenteRe);
  if (m2) {
    violations.push({
      rule: 'singolare_studente',
      severity: 'HIGH',
      matched: m2[0],
      suggestion: 'Usa plurale inclusivo: "dovete", "provate", "guardate"',
    });
  }

  // Rule 3: max_words_120 (MEDIUM) — Andrea regola 10/05/2026 ricalibrazione
  // Max 120 parole ben formattate. Analogie OPZIONALI (NON sempre obbligatorie).
  // Sostituisce regola 60 parole + analogia obbligatoria.
  const wc = countWords(response);
  if (wc > 120) {
    violations.push({
      rule: 'max_words_120',
      severity: 'MEDIUM',
      matched: `${wc} parole`,
      suggestion: 'Riduci a max 120 parole ben formattate (analogia opzionale)',
    });
  }

  // Rule 4: no_citation_concept_intro (LOW, conditional)
  // Solo se siamo in introduzione concetto E non c'è citazione Vol.N pag.X
  if (ctx.isConceptIntro) {
    const hasCitation = /Vol\.\s*[1-3]\s*pag\.\s*\d+/i.test(response);
    if (!hasCitation) {
      violations.push({
        rule: 'no_citation_concept_intro',
        severity: 'LOW',
        suggestion: 'Aggiungi riferimento volume per concetto cardine: «...» Vol.N pag.X',
      });
    }
  }

  // Rule 5: english_filler (LOW)
  // Frasi tipiche LLM generic anglosassone fuori posto in contenuto IT bambini.
  const enFillerRe = /\b(let me|please|sure|of course|happy to)\b/i;
  const m5 = response.match(enFillerRe);
  if (m5) {
    violations.push({
      rule: 'english_filler',
      severity: 'LOW',
      matched: m5[0],
      suggestion: 'Rimuovi filler inglese, usa solo italiano',
    });
  }

  // Rule 6: chatbot_preamble (LOW)
  // UNLIM è invisibile, non si presenta. Rifiuta preamboli chatbot generic.
  const preambleRe = /^(Certo|Volentieri|Ottima domanda|Bella domanda|Sicuramente)\b/i;
  const m6 = response.match(preambleRe);
  if (m6) {
    violations.push({
      rule: 'chatbot_preamble',
      severity: 'LOW',
      matched: m6[0],
      suggestion: 'Vai dritto al contenuto, no preamboli chatbot',
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // Iter 27 — PZ V3 +6 runtime rules promotion (bench → runtime)
  // ────────────────────────────────────────────────────────────────────

  // Rule 7: plurale_ragazzi (MAJOR) — iter 27
  // Response MUST start with "Ragazzi" (case-insens). Skip if isSafetyRefusal.
  // Note: enforceItalianK12Opener auto-prepends "Ragazzi," but validator measures
  // raw LLM compliance as MAJOR telemetry signal.
  if (!ctx.isSafetyRefusal) {
    const cleanedForOpener = stripTags(response).replace(/^\s+/, '');
    if (cleanedForOpener.length > 0) {
      const opensWithRagazzi = /^ragazz[ie]\b/i.test(cleanedForOpener);
      if (!opensWithRagazzi) {
        const v: Violation = {
          rule: 'plurale_ragazzi',
          severity: 'MAJOR',
          snippet: cleanedForOpener.slice(0, 40),
          suggestion: 'Inizia SEMPRE con "Ragazzi," (plurale inclusivo PRINCIPIO ZERO V3)',
        };
        violations.push(v);
        // Telemetry signal (non-blocking iter 27, Andrea iter 28 ratify hard-block)
        try {
          console.warn(
            JSON.stringify({
              event: 'pz_runtime_violation_major',
              rule: v.rule,
              snippet: v.snippet,
              ts: Date.now(),
            }),
          );
        } catch {
          // defensive — never throw from logging
        }
      }
    }
  }

  // Rule 8: citation_vol_pag (MAJOR conditional) — iter 27
  // When ctx.requiresCitation === true AND NOT ctx.isOfftopic, response MUST contain
  // Vol.X pag.Y OR Vol.X cap.Y citation pattern (canonical Vol/pag morphic Sense 2).
  if (ctx.requiresCitation && !ctx.isOfftopic) {
    const citationRe = /Vol\.?\s*\d+\s*(?:pag|cap)\.?\s*\d+/i;
    const hasCitation = citationRe.test(response);
    if (!hasCitation) {
      const v: Violation = {
        rule: 'citation_vol_pag',
        severity: 'MAJOR',
        suggestion: 'Cita SEMPRE Vol.X pag.Y o Vol.X cap.Y quando contesto volume attivo',
      };
      violations.push(v);
      try {
        console.warn(
          JSON.stringify({
            event: 'pz_runtime_violation_major',
            rule: v.rule,
            requiresCitation: true,
            ts: Date.now(),
          }),
        );
      } catch {
        // defensive
      }
    }
  }

  // Rule 9: analogia (LOW telemetry-only) — iter 27
  // Andrea iter 5/10/2026 unified mandate: analogie OPZIONALI. Count occurrences
  // ONLY for telemetry signal — NEVER push a violation.
  const analogiaMarkers = ['come una', 'come un ', 'come se', 'immagina', 'è come '];
  for (const marker of analogiaMarkers) {
    const re = new RegExp(marker.replace(/\s+/g, '\\s+'), 'gi');
    const matches = response.match(re);
    if (matches && matches.length > 0) {
      telemetry.analogiaCount += matches.length;
      telemetry.analogiaMarkers.push(marker.trim());
    }
  }

  // Rule 10: no_verbatim_3plus_frasi (MEDIUM) — iter 27
  // Detect 3+ consecutive sentences wrapped in «...» (verbatim block from volume).
  // Verbatim citation OK in moderation; 3+ back-to-back violates synthesis mandate.
  const verbatimBlocks = response.match(/«[^»]+»/g) || [];
  if (verbatimBlocks.length >= 3) {
    // count adjacent verbatim blocks (separated only by whitespace/punctuation)
    const adjacentRe = /«[^»]+»[\s.,;:]*«[^»]+»[\s.,;:]*«[^»]+»/;
    if (adjacentRe.test(response)) {
      violations.push({
        rule: 'no_verbatim_3plus_frasi',
        severity: 'MEDIUM',
        matched: `${verbatimBlocks.length} citazioni verbatim consecutive`,
        suggestion: 'Massimo 2 citazioni «...» consecutive — sintetizza il resto',
      });
    }
  }

  // Rule 11: off_topic_recognition (LOW) — iter 27
  // When ctx.isOfftopic === true, response SHOULD include humble redirect marker
  // ("torniamo", "non è il momento", "concentriamoci", "elettronica") to acknowledge
  // off-topic and redirect. Soft check — LOW severity (not blocking).
  if (ctx.isOfftopic) {
    const redirectRe = /\b(torniamo|concentriamoci|elettronica|non\s+è\s+il\s+momento|altro\s+momento|focus|argomento)\b/i;
    if (!redirectRe.test(response)) {
      violations.push({
        rule: 'off_topic_recognition',
        severity: 'LOW',
        suggestion: 'Riconosci off-topic e redirect: "Ragazzi, torniamo all\'elettronica..."',
      });
    }
  }

  // Rule 12: action_tags_when_expected (MEDIUM) — iter 27
  // When ctx.expectedActions provided (e.g. ['highlight', 'mountExperiment']), response
  // MUST emit at least one [AZIONE:*] tag. Onnipotenza Sense 1 mandate.
  if (Array.isArray(ctx.expectedActions) && ctx.expectedActions.length > 0) {
    const actionTagRe = /\[AZIONE:[^\]]+\]/i;
    if (!actionTagRe.test(response)) {
      violations.push({
        rule: 'action_tags_when_expected',
        severity: 'MEDIUM',
        matched: `expected: ${ctx.expectedActions.join(', ')}`,
        suggestion: 'Emetti tag [AZIONE:tool] quando contesto richiede dispatch ClawBot',
      });
    }
  }

  // Compute max severity
  let maxSeverity: Severity | null = null;
  let maxRank = 0;
  for (const v of violations) {
    const r = SEVERITY_RANK[v.severity];
    if (r > maxRank) {
      maxRank = r;
      maxSeverity = v.severity;
    }
  }

  return {
    violations,
    severity: maxSeverity,
    passes: violations.length === 0,
    telemetry,
  };
}

/**
 * 2026-05-10 iter 8 Agent 1 Patch 2 + Patch 4 — server-side post-LLM cleanup.
 *
 * 1. Strip leaked system context tags ([MEMORIA STUDENTE], [NARRAZIONE LIVE],
 *    [PRESENTE LIVE...], [CONTESTO CAPITOLO]) — LLM occasionally echoes the
 *    injected context verbatim (live prod r5-042 catastrophic).
 * 2. Auto-prepend "Ragazzi," opener when absent and response is meaningful
 *    (>5 words, no existing plurale opener variant). Deterministic, 0ms cost,
 *    bypasses LLM unreliability. Andrea iter 21 PRINCIPIO ZERO V3 mandate
 *    "INIZIA SEMPRE con Ragazzi,".
 *
 * NOTE: idempotent — running twice does not double-prepend.
 */
export function enforceItalianK12Opener(rawText: string): string {
  if (typeof rawText !== 'string' || !rawText.trim()) return rawText;

  // Step 1: strip leaked context tags ONLY (just the bracket tag itself, NOT
  // the prose that follows). Live r5-042 + andrea-screenshot iter 8 fix.
  // Tags formats observed in prod leak:
  //   [MEMORIA STUDENTE]
  //   [NARRAZIONE LIVE]
  //   [PRESENTE LIVE - STATO CIRCUITO]
  //   [PRESENTE LIVE - ESPERIMENTO ATTIVO]
  //   [CONTESTO CAPITOLO LIBRO]
  //   [STORIA SESSIONI]
  //   [RIFERIMENTO LIBRO FISICO]
  //   [REGIA MULTI-AI UNLIM]
  //   [PROFILO ATTIVO: ...]
  //   [GERARCHIA CONTESTO]
  //   [AGENT_DECISION_JSON]
  //   [AUTOCOSCIENZA]
  // Strip ONLY the tag (not following prose) so prose remains. Trailing
  // whitespace collapsed.
  let cleaned = rawText
    // iter 14 — flag /gi case-insensitive (LLM emette case-mixed leak come `pROFILO ATTIVO` `rEGIA PARALLELA 3x2`)
    .replace(/\[MEMORIA STUDENTE[^\]]*\]/gi, '')
    .replace(/\[NARRAZIONE LIVE[^\]]*\]/gi, '')
    .replace(/\[PRESENTE LIVE[^\]]*\]/gi, '')
    .replace(/\[CONTESTO CAPITOLO[^\]]*\]/gi, '')
    .replace(/\[STORIA SESSIONI[^\]]*\]/gi, '')
    .replace(/\[RIFERIMENTO LIBRO FISICO[^\]]*\]/gi, '')
    .replace(/\[REGIA MULTI-AI[^\]]*\]/gi, '')
    .replace(/\[PROFILO ATTIVO[^\]]*\]/gi, '')
    .replace(/\[GERARCHIA CONTESTO[^\]]*\]/gi, '')
    .replace(/\[AGENT_DECISION_JSON[^\]]*\]/gi, '')
    .replace(/\[AUTOCOSCIENZA[^\]]*\]/gi, '')
    .replace(/\[CITAZIONE VOL[^\]]*\]/gi, '')
    // iter 15 — strip residual leaked text patterns (LLM emette "pROFILO ATTIVO: ..." senza brackets).
    // Relaxed regex (NO line anchors $/^$) per match mid-line leak "[REGIA MULTI-AI UNLIM] REGIA PARALLELA 3x2: ..."
    .replace(/[a-zA-Z]?ROFILO\s+ATTIVO:?\s*[^\n]*/g, '')
    .replace(/[a-zA-Z]?EGIA\s+(?:PARALLELA|MULTI-AI)[^\n]*/g, '')
    .replace(/Profilo:\s+\w+[^\n]*/g, '')
    .replace(/Ruolo:\s+[^\n]*/g, '')
    .replace(/Modalit[aà]:\s+\w+[^\n]*/g, '')
    .replace(/Contesto:\s+\w+[^\n]*/g, '')
    .replace(/Budget\s+parole[^\n]*/g, '')
    .replace(/Screenshot:\s+[^\n]*/g, '')
    // Vol1 fast/deep, Vol2 fast/deep, Vol3 fast/deep pattern leak
    .replace(/Vol[123]\s+(?:fast|deep)\/?(?:fast|deep)?[,\s]*/gi, '')
    // "Scegli mentalmente la corsia giusta..." leak directive
    .replace(/Scegli\s+mentalmente[^\n]*/g, '')
    .replace(/non\s+mostrare\s+la\s+regia[^\n]*/g, '')
    // iter 11 P0 — live smoke prod Q9 220V leaked these tags. Strip RAG/Wiki/Hybrid surfaces.
    .replace(/\[CONOSCENZA DAI VOLUMI ELAB[^\]]*\]/gi, '')
    // iter 11 PATCH B — generic CONTESTO catch-all (ONNISCENZA + ATTUALE + CAPITOLO + altre varianti)
    .replace(/\[CONTESTO[^\]]*\]/gi, '')
    .replace(/\[Hybrid RAG[^\]]*\]/gi, '')
    .replace(/\[wiki[^\]]*\]/gi, '')
    .replace(/\[rag[^\]]*\]/gi, '')
    .replace(/\[glossario[^\]]*\]/gi, '')
    .replace(/\[fonte:[^\]]*\]/gi, '')
    .replace(/\[FONTE[^\]]*\]/g, '')
    .replace(/^---+\s*$/gm, '') // markdown separator leaks from prompt scaffolding
    // iter 23 P1 — RAG source leak template "--- [docs/unlim-wiki/concepts/led.md] ---" (iter 22 marathon s2-msg2 evidence)
    .replace(/---\s*\[docs\/[^\]]+\]\s*---/gi, '')
    .replace(/\[docs\/unlim-wiki[^\]]*\]/gi, '')
    .replace(/\[wiki\/concepts[^\]]*\]/gi, '')
    // iter 23 P2 — state-dump simulator leak literal "stato simulatore: ... Componenti: - breadboard_1..."
    .replace(/stato\s+simulatore:\s*[^\n]+/gi, '')
    .replace(/Componenti:\s*\n?\s*-\s*[a-z0-9_]+[^\n]*/gim, '')
    .replace(/^\s*-\s*(breadboard_\d+|led_\d+|resistor_\d+|nano_\d+|button_\d+|wire_\d+)[^\n]*/gim, '')
    // iter 23 P2 — additional state-dump patterns
    .replace(/Fili:\s*\d+\s*$/gim, '')
    .replace(/Posizioni:\s*\[[^\]]+\]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned) return rawText;

  // Step 2: detect existing plurale opener (be permissive — accept variants).
  const hasPluraleOpener = /^(Ragazzi[,!.\s]|Ciao\s+ragazzi|Bambini[,!.\s]|Vediamo|Insieme|Provate|Guardate|Iniziamo|Cominciamo|Ehi)/i.test(cleaned);
  if (hasPluraleOpener) return cleaned;

  // Step 3: skip prepend on very short responses (<5 words) — likely action-only
  // ("[AZIONE:play]") or single greeting echo.
  const wc = cleaned.split(/\s+/).filter(Boolean).length;
  if (wc < 5) return cleaned;

  // Step 4: prepend "Ragazzi, " preserving the rest. Lowercase the first letter
  // of the original text since it now follows a comma.
  const firstChar = cleaned.charAt(0);
  const restAfterFirst = cleaned.slice(1);
  const lowerFirst = firstChar.toLowerCase();
  return `Ragazzi, ${lowerFirst}${restAfterFirst}`;
}
