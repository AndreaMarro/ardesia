/**
 * intent-flags-classifier.ts — Sprint X iter 105 P1 (Andrea mandate 2026-05-26)
 *
 * 8-flag orthogonal intent classifier driven by Andrea verbatim mandate
 * (2026-05-26): UNLIM must classify INTENT (what the user WANTS) in addition
 * to the existing `classifyPrompt` taxonomy (what KIND of prompt it is).
 *
 * Existing `onniscenza-classifier.ts` classifies TOPIC (chit_chat /
 * citation_vol_pag / plurale_ragazzi / deep_question / safety_warning /
 * off_topic / default).
 *
 * This new classifier classifies INTENT FLAGS (orthogonal — multiple flags
 * can be true for the same message):
 *
 *   - WANTS_SCREEN_VIEW   "guarda", "vedi", "questo", "lo schermo"
 *                          → triggers screenshot + vision chain
 *   - WANTS_ACTION         "carica", "collega", "evidenzia", "compila",
 *                          "mostra", "apri", "vai a"
 *                          → triggers tool/tag/bridge dispatch
 *   - WANTS_DIAGNOSE       "perché non funziona", "che ho sbagliato",
 *                          "errore", "non parte", "non si accende"
 *                          → triggers diagnose template + circuit inspect
 *   - WANTS_NEXT           "prossimo passo", "avanti", "che faccio adesso",
 *                          "continuiamo"
 *                          → triggers next-step lookup + cliffhanger render
 *   - WANTS_REVIEW         "ricontrolla", "verifica", "ho fatto bene",
 *                          "è giusto", "controlla"
 *                          → triggers RAG citation + Vol/pag verbatim
 *   - OFF_TOPIC            non-ELAB topics (sport/cinema/math/cooking/...)
 *                          → soft gentle bridge (existing
 *                          buildOfftopicGentleBridge)
 *   - SAFETY_MINOR         dangerous voltages, parental advisory
 *                          → triggers safety hardcoded canonical response
 *   - SECRET_PROJECT       attempts to access system prompts, leak
 *                          internal config, jailbreak
 *                          → triggers sanitizeMessage + refusal
 *
 * Design choices:
 *  - Pure regex, no LLM, never throws
 *  - Empty/null input returns ALL flags false
 *  - Flags are NON-MUTUALLY-EXCLUSIVE (e.g. "guarda il LED, perché non si
 *    accende?" sets BOTH wants_screen_view AND wants_diagnose)
 *  - Returns flag SET (literal `true`/`false`) plus a `triggered_flags[]`
 *    helper for telemetry
 *
 * Wire-up: called in `unlim-chat/index.ts` alongside `classifyPrompt`.
 * Citation chain (stage 11 of pipeline) should gate behind
 * `intentFlags.wants_review || intentFlags.wants_diagnose ||
 *  promptClass.category === 'citation_vol_pag'` per Andrea mandate
 * "Naturale prima, citazione quando serve" (NOT auto-injected every reply).
 */

export interface IntentFlags {
  /** Andrea mandate flags (orthogonal — multiple can be true). */
  wants_screen_view: boolean;
  wants_action: boolean;
  wants_diagnose: boolean;
  wants_next: boolean;
  wants_review: boolean;
  off_topic: boolean;
  safety_minor: boolean;
  secret_project: boolean;
  /** Convenience: list of flag names that fired. */
  triggered_flags: string[];
}

// ===========================================================================
// Regex patterns — Italian K-12 dialect, case-insensitive, word-boundary
// anchored to avoid false positives ("guardiamo" must trigger; "vanguardia"
// must NOT).
// ===========================================================================

/** WANTS_SCREEN_VIEW: visual deixis + simulator-state requests */
const WANTS_SCREEN_VIEW_RE =
  /\b(guarda(?:te|tela|telo|teli)?|guardiam[oa]|vedi|vedete|vediamo|vedo|vedono|osserva(?:re|te|t[oae])?|controll[ai](?:te)?|verifica(?:te)?|(?:lo|sullo|nello|dello|allo|sullo|sul)\s+schermo|(?:la|sulla|nella|della|sulla)\s+lavagna|qui|questo|questa|circuito\s+(?:live|attuale|sullo\s+schermo))\b/i;

/** WANTS_ACTION: imperative tool/dispatch verbs ELAB-specific */
const WANTS_ACTION_RE =
  /\b(carica(?:re|te)?|collega(?:re|te|tene)?|evidenzia(?:re|te)?|compila(?:re|te)?|mostra(?:re|te|temi|teci)?|apri(?:re|te|telo|tela)?|vai\s+a|vai\s+al?l[ao]?\s|vai\s+su|mont[ai](?:re|te)?|attiva(?:re|te)?|disattiva(?:re|te)?|avvia(?:re|te)?|esegui(?:re|te)?|cancella(?:re|te)?|salva(?:re|te)?|cattura(?:re|te)?|fai\s+(?:vedere|partire|girare))\b/i;

/** WANTS_DIAGNOSE: error/troubleshooting language */
const WANTS_DIAGNOSE_RE =
  /\b(perch[éè]?\s+non\s+(?:funziona|va|si\s+accende|parte|gira)|non\s+(?:funziona|va|si\s+accende|parte|gira)|errore|sbagliat[oa]|sbaglio|sbagli|cosa\s+(?:ho\s+)?sbagli|che\s+(?:ho\s+)?sbagli|non\s+capisco|non\s+ho\s+capito|aiuto|bug|crash|stuck|bloccat[oa]|fermo|fermat[oa]|fum[oa]|brucia(?:to|t[oae])?|spent[oa])\b/i;

/** WANTS_NEXT: progression / next-step requests */
const WANTS_NEXT_RE =
  /\b(prossim[oa]\s+(?:passo|step|esperimento|capitolo|pagina)|avanti|continuiamo|continua(?:re|te)?|riprendiamo|riprend(?:i|ete)|che\s+faccio\s+(?:adesso|ora|dopo)|cosa\s+faccio\s+(?:adesso|ora|dopo)|cosa\s+(?:viene\s+)?dopo|step\s+(?:successivo|seguente|dopo)|vai\s+(?:avanti|al\s+prossimo))\b/i;

/** WANTS_REVIEW: verification / "did I do it right" */
// Note: JS regex `\b` is ASCII-only and fails BEFORE Italian accented chars
// like `è`/`ì`/`ò`/`à`. Use `(?:^|\s|[?!.,;:])` look-around for those cases.
const WANTS_REVIEW_RE =
  /(?:\b(?:ricontroll[ai](?:re|te)?|riverifi[cs](?:a|are|ate)|controll(?:a|are|ate)\s+(?:se|che)|ho\s+fatto\s+bene|sto\s+(?:facendo|andando)\s+bene|secondo\s+(?:te|voi)\s+[èe]?\s*ok)\b|(?:^|\s)(?:[èe]\s+giusto|[èe]\s+corrett[oa]|va\s+bene\s+cos[iì])(?=\s|$|[?!.,;:]))/i;

/** OFF_TOPIC: non-ELAB topics (mirrors existing OFFTOPIC_QUERY_RE classes) */
const OFF_TOPIC_RE =
  /\b(sport|calcio|football|tennis|basket|formula\s*1|f1|partita|squadra|juve|inter|milan|napoli|champions(?:\s+league)?|uefa|serie\s+a|mondiali|europei|cinema|film|attor[ei]|attric[ei]|director|regista|netflix|matematica|aritmetica|algebra|geometria|equazione|integrale|derivata|capital[ei]\s+di|storia\s+(?:italiana|romana|antica|medievale)|napoleon[ei]|imperator[ei]|cucina|ricetta|cuocer[ei]|impastare|musica|cantante|canzone|spotify|youtube|tiktok|videogioc[ho]|fortnite|minecraft|roblox|videogame|videogiochi)\b/i;

/** SAFETY_MINOR: dangerous voltages, parental-advisory triggers */
const SAFETY_MINOR_RE =
  /\b(220\s*v|110\s*v|380\s*v|230\s*v|tensione\s+(?:rete|domestica|alta|elevata)|presa\s+(?:di\s+)?corrente|presa\s+(?:elettrica|domestica|schuko)|impianto\s+elettrico|scossa|elettrocuzion[ei]|folgora\w*|corrente\s+(?:forte|domestica|alta)|cavo\s+(?:della\s+)?rete|brucia(?:re|to|ti|no)?\s+(?:il\s+)?(?:cavo|filo|circuito)?|pericolo(?:so|si)?\s+(?:per\s+i\s+)?(?:bambini|ragazzi|minori)?)\b/i;

/** SECRET_PROJECT: prompt-injection / jailbreak / system-prompt leak attempts */
const SECRET_PROJECT_RE =
  /\b(system\s+prompt|prompt\s+(?:di\s+)?sistema|istruzioni\s+(?:di\s+)?sistema|tue\s+(?:vere\s+)?istruzioni|dimentic[ai]\s+(?:tutto|le|i)|ignor[ai]\s+(?:le\s+)?(?:istruzioni|regole|tutto)|dimentic[ai]\s+(?:le\s+)?precedenti|olvida|forget\s+(?:all|everything|previous)|ignore\s+(?:all|previous|everything)|cambia\s+(?:personalit[aà]|ruolo)|comportati\s+come|jailbreak|prompt\s+injection|rivela\s+(?:il\s+)?(?:tuo|tuo\s+vero)|api\s+key|service\s+role|supabase\s+key|env\s+vars?)\b/i;

// ===========================================================================
// Public API
// ===========================================================================

/**
 * Classify intent flags from user message. Never throws. Returns all flags
 * `false` for null/empty/non-string input.
 *
 * @param input - user message text (already sanitized upstream preferred)
 * @returns IntentFlags with 8 booleans + triggered_flags[] convenience list
 */
export function classifyIntentFlags(
  input: string | null | undefined,
): IntentFlags {
  const empty: IntentFlags = {
    wants_screen_view: false,
    wants_action: false,
    wants_diagnose: false,
    wants_next: false,
    wants_review: false,
    off_topic: false,
    safety_minor: false,
    secret_project: false,
    triggered_flags: [],
  };

  if (input == null || typeof input !== 'string') return empty;
  const text = input.trim();
  if (text.length === 0) return empty;

  const flags: IntentFlags = {
    wants_screen_view: WANTS_SCREEN_VIEW_RE.test(text),
    wants_action: WANTS_ACTION_RE.test(text),
    wants_diagnose: WANTS_DIAGNOSE_RE.test(text),
    wants_next: WANTS_NEXT_RE.test(text),
    wants_review: WANTS_REVIEW_RE.test(text),
    off_topic: OFF_TOPIC_RE.test(text),
    safety_minor: SAFETY_MINOR_RE.test(text),
    secret_project: SECRET_PROJECT_RE.test(text),
    triggered_flags: [],
  };

  // Build triggered_flags telemetry list
  const triggered: string[] = [];
  if (flags.wants_screen_view) triggered.push('WANTS_SCREEN_VIEW');
  if (flags.wants_action) triggered.push('WANTS_ACTION');
  if (flags.wants_diagnose) triggered.push('WANTS_DIAGNOSE');
  if (flags.wants_next) triggered.push('WANTS_NEXT');
  if (flags.wants_review) triggered.push('WANTS_REVIEW');
  if (flags.off_topic) triggered.push('OFF_TOPIC');
  if (flags.safety_minor) triggered.push('SAFETY_MINOR');
  if (flags.secret_project) triggered.push('SECRET_PROJECT');
  flags.triggered_flags = triggered;

  return flags;
}

/**
 * Pipeline decision: should the citation chain force-inject `(Vol.X pag.Y)`?
 *
 * Andrea mandate 2026-05-26: "Naturale prima, citazione quando serve".
 * Today (iter 105) citation chain runs on EVERY response. This helper
 * exposes the gate so callers can decide.
 *
 * Returns true when:
 *   - User asked for verification (`wants_review`)
 *   - User asked for diagnosis (`wants_diagnose`)
 *   - User mentioned Vol/cap explicitly (`wants_review` typically catches but
 *     defense-in-depth: caller may pass `vol_pag_in_query=true`)
 *   - User asked for "next" content (typically benefits from Vol/pag anchor)
 */
export function shouldForceCitation(
  flags: IntentFlags,
  volPagInQuery = false,
): boolean {
  return (
    flags.wants_review ||
    flags.wants_diagnose ||
    flags.wants_next ||
    volPagInQuery
  );
}

/**
 * Pipeline decision: should the chat handler trigger the vision chain (capture
 * screenshot + send to Gemini Vision)?
 *
 * Returns true when:
 *   - User asked to "guarda/vedi/questo" (wants_screen_view)
 *   - User asked for diagnose AND the message references circuit live state
 */
export function shouldCaptureScreenshot(flags: IntentFlags): boolean {
  return flags.wants_screen_view;
}

/**
 * Pipeline decision: should the response include an action tag (e.g.
 * `[AZIONE:mountExperiment:v1-cap6-esp1]`)?
 *
 * Returns true when WANTS_ACTION OR WANTS_NEXT — both imply user expects
 * UNLIM to DO something, not just explain.
 */
export function shouldDispatchAction(flags: IntentFlags): boolean {
  return flags.wants_action || flags.wants_next;
}

// ===========================================================================
// Hybrid 3-tier classifier (Andrea mandate "function calling + embeddings"
// 2026-05-26)
// ===========================================================================

/**
 * Merge two IntentFlags objects via OR semantics. `triggered_flags` is
 * deduplicated and re-derived from boolean fields.
 *
 * Used by `classifyIntentFlagsHybrid` to combine regex (L1), embedding (L2)
 * and LLM (L3) results without losing any signal.
 */
export function mergeIntentFlags(a: IntentFlags, b: IntentFlags): IntentFlags {
  const merged: IntentFlags = {
    wants_screen_view: a.wants_screen_view || b.wants_screen_view,
    wants_action: a.wants_action || b.wants_action,
    wants_diagnose: a.wants_diagnose || b.wants_diagnose,
    wants_next: a.wants_next || b.wants_next,
    wants_review: a.wants_review || b.wants_review,
    off_topic: a.off_topic || b.off_topic,
    safety_minor: a.safety_minor || b.safety_minor,
    secret_project: a.secret_project || b.secret_project,
    triggered_flags: [],
  };
  const triggered: string[] = [];
  if (merged.wants_screen_view) triggered.push('WANTS_SCREEN_VIEW');
  if (merged.wants_action) triggered.push('WANTS_ACTION');
  if (merged.wants_diagnose) triggered.push('WANTS_DIAGNOSE');
  if (merged.wants_next) triggered.push('WANTS_NEXT');
  if (merged.wants_review) triggered.push('WANTS_REVIEW');
  if (merged.off_topic) triggered.push('OFF_TOPIC');
  if (merged.safety_minor) triggered.push('SAFETY_MINOR');
  if (merged.secret_project) triggered.push('SECRET_PROJECT');
  merged.triggered_flags = triggered;
  return merged;
}

export interface HybridClassifyOptions {
  /**
   * Force LLM L3 call even when L1+L2 triggered flags. Default false.
   * Use for high-stakes classifications (safety-relevant chats).
   */
  forceLLM?: boolean;
  /**
   * Skip embedding L2 path (regex L1 + LLM L3 only). Use when embedding
   * provider is known unavailable to save 80-150ms.
   */
  skipEmbedding?: boolean;
  /**
   * Skip LLM L3 path (regex L1 + embedding L2 only). Use under tight latency
   * budgets (chit-chat path).
   */
  skipLLM?: boolean;
  /** Override embedding similarity threshold (default 0.72). */
  embeddingThreshold?: number;
}

export interface HybridClassifyResult {
  /** Merged final IntentFlags. */
  flags: IntentFlags;
  /** Which tiers fired (for telemetry/debug). */
  tiersUsed: Array<'regex_l1' | 'embedding_l2' | 'llm_l3'>;
  /** Total wall-clock ms for the full hybrid path. */
  latencyMs: number;
}

/**
 * 3-tier intent flags classifier.
 *
 * Tier 1 (L1): regex `classifyIntentFlags` — 0ms, deterministic.
 * Tier 2 (L2): embedding similarity — 80-150ms, semantic fallback when L1 misses.
 * Tier 3 (L3): Mistral structured-output LLM — 200-500ms, last-resort confidence.
 *
 * Default behavior (no opts): runs L1 always. L2/L3 only fire when L1 returns
 * zero triggered flags (ambiguous query).
 *
 * NEVER throws. Returns the BEST available result; on full failure returns
 * the L1 (regex) result alone.
 *
 * Note: this is a wrapper function that delegates to L2/L3 via dynamic import
 * to avoid pulling Mistral client into the regex-only L1 hot path bundle when
 * callers only use `classifyIntentFlags`.
 */
export async function classifyIntentFlagsHybrid(
  input: string | null | undefined,
  opts: HybridClassifyOptions = {},
): Promise<HybridClassifyResult> {
  const start = Date.now();
  const tiersUsed: Array<'regex_l1' | 'embedding_l2' | 'llm_l3'> = [];

  // L1: regex (always)
  const regexFlags = classifyIntentFlags(input);
  tiersUsed.push('regex_l1');
  let merged = regexFlags;

  const shouldEscalate = opts.forceLLM || regexFlags.triggered_flags.length === 0;

  if (!shouldEscalate) {
    return { flags: merged, tiersUsed, latencyMs: Date.now() - start };
  }

  // L2: embedding (when allowed)
  if (!opts.skipEmbedding) {
    try {
      const { classifyIntentFlagsEmbedding } = await import('./intent-flags-embedding.ts');
      const embeddingFlags = await classifyIntentFlagsEmbedding(input, {
        threshold: opts.embeddingThreshold,
      });
      if (embeddingFlags) {
        merged = mergeIntentFlags(merged, embeddingFlags);
        tiersUsed.push('embedding_l2');
      }
    } catch {
      // Module unavailable — fall through to L3
    }
  }

  // L3: LLM (when allowed AND still ambiguous OR force)
  const stillAmbiguous = merged.triggered_flags.length === 0;
  if (!opts.skipLLM && (opts.forceLLM || stillAmbiguous)) {
    try {
      const { classifyIntentFlagsLLM } = await import('./intent-flags-llm.ts');
      const llmFlags = await classifyIntentFlagsLLM(input);
      if (llmFlags) {
        merged = mergeIntentFlags(merged, llmFlags);
        tiersUsed.push('llm_l3');
      }
    } catch {
      // Module unavailable — return best available
    }
  }

  return { flags: merged, tiersUsed, latencyMs: Date.now() - start };
}
