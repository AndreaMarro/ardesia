/**
 * onniscenza-classifier — Sprint T iter 37 Atom A2 (Maker-1)
 *
 * Pre-LLM, regex-only classifier of user prompts into onniscenza-injection
 * categories. Drives a conditional ENABLE_ONNISCENZA path so that cheap
 * chit-chat avoids the (expensive) 7-layer aggregator and deep questions
 * preserve full top-3 RRF context.
 *
 * Categories (mutually exclusive, evaluated top-to-bottom):
 *   - 'safety_warning'   highest priority (security keywords) → onniscenza top-3
 *   - 'deep_question'    >=20 words AND ends with `?` → onniscenza top-3
 *   - 'citation_vol_pag' references "Vol.X" / "pag.Y" → onniscenza top-2
 *   - 'plurale_ragazzi'  contains "ragazzi" plural marker → onniscenza top-2
 *   - 'chit_chat'        <8 words AND greeting tokens → SKIP onniscenza (latency)
 *   - 'default'          fallback (none of the above) → onniscenza top-3 (preserve tests)
 *
 * Behavior matrix:
 *   chit_chat        => skipOnniscenza=true,  topK=0  (save ~500-1000ms)
 *   citation_vol_pag => skipOnniscenza=false, topK=2
 *   plurale_ragazzi  => skipOnniscenza=false, topK=2
 *   deep_question    => skipOnniscenza=false, topK=3  (full context preserved)
 *   safety_warning   => skipOnniscenza=false, topK=3  (mandatory safety)
 *   default          => skipOnniscenza=false, topK=3  (iter 38 A5: kept at 3 to
 *                       preserve iter 37 test contract — Maker-1 own only
 *                       supabase/functions/**, cannot edit tests/unit/. Latency
 *                       lift achieved via A3 Promise.all + A5 cron warmup,
 *                       not via classifier topK reduction. Honesty caveat in
 *                       completion msg.)
 *
 * NO LLM call. Pure regex + word count. Defensive: never throws. Empty/null
 * input => 'chit_chat' (cheapest path; a blank message implies a tap-test).
 *
 * Reference: PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md §3 Atom A2.
 *
 * (c) Andrea Marro 2026-04-30 — ELAB Tutor
 */

export type PromptCategory =
  | 'safety_warning'
  | 'vision_request'
  | 'deep_question'
  | 'citation_vol_pag'
  | 'plurale_ragazzi'
  | 'chit_chat'
  | 'off_topic'
  | 'default';

/**
 * Sprint U iter 25 — fine-grained off-topic sub-classification used by the
 * template responder (`buildOfftopicGentleBridge`) to pick the matching
 * acknowledge variant. Mutually exclusive; ordered by detection priority.
 */
export type OfftopicType =
  | 'sport'
  | 'math'
  | 'history'
  | 'culture'
  | 'cooking'
  | 'translation'
  | 'celebrity'
  | 'generic';

export interface ClassificationResult {
  category: PromptCategory;
  /** When true, the onniscenza aggregator should be skipped for latency. */
  skipOnniscenza: boolean;
  /** Top-K hits to inject into the LLM prompt (0 when skipOnniscenza). */
  topK: number;
  /** Word count of the input (zero when input is null/empty). */
  wordCount: number;
  /**
   * Sprint V iter 43 ATOM A3 (Bug 3 fix): when true, the chat handler should
   * trigger the vision chain (capture screenshot + Pixtral/Gemini Vision) for
   * "guarda lavagna / vedi circuito / controlla breadboard" style prompts.
   * Defaults to false so non-vision categories don't accidentally fire vision.
   */
  triggers_vision_chain?: boolean;
  /**
   * Sprint U iter 25 — set when `category === 'off_topic'`. Drives the
   * type-specific acknowledge in `buildOfftopicGentleBridge`. Absent for
   * any other category.
   */
  offtopicType?: OfftopicType;
}

/**
 * Greeting / chit-chat tokens. Match is case-insensitive, anchored on word
 * boundaries to avoid false positives ("ciao" inside "ciaologico" must NOT
 * trigger). Italian-only because the product is Italian-K-12 (PRINCIPIO ZERO).
 */
// Iter 41 v64 expand: matrix evidence "ok"/"bene"/"no"/"che bello" ambiguous responses
// fall to default category + skip plurale opener → no_plurale fail. Include in chit_chat.
const GREETING_RE = /\b(ciao|salve|grazie|buongiorno|buonasera|buonanotte|ehi|hey|hola|ok|okay|bene|va\s+bene|certo|certamente|capito|si|sì|no|nope|perfetto|ottimo|che\s+bello|fantastico|forte)\b/i;

/**
 * Safety keywords. These imply potentially dangerous student/circuit context
 * and ALWAYS warrant the full onniscenza top-3 RRF (kit fisico mention).
 */
const SAFETY_RE = /\b(pericolo|attenzione|brucia(?:to|re|t[oae])?|scossa|cortocircuito|bruciato|bruciata|fumo|esploso|scoppiato|bruciante|scotta|caldissim[oa]|surriscalda(?:to|ta|t[oae])?)\b/i;

/**
 * Citation references "Vol.X" / "vol.X" / "pag.Y" / "pagina Y" / "p.Y".
 * Tolerant of whitespace and missing dot (per real student typing).
 */
const CITATION_RE = /\b(vol(?:ume)?\.?\s*[123]\b|pag(?:ina)?\.?\s*\d{1,3}\b|p\.\s*\d{1,3}\b)/i;

/**
 * Plural addressing marker. Italian K-12 PRINCIPIO ZERO requires plural
 * "ragazzi". When the user (typically the docente) types "ragazzi",
 * onniscenza fetches a smaller fused set (top-2) because the docente is
 * narrating to the class and needs concise reinforcement.
 */
const PLURALE_RE = /\bragazz[ie]\b/i;

/**
 * Sprint V iter 43 ATOM A3 (Bug 3 — RAG classifier "guarda lavagna" fix):
 * vision-request prompts where the docente asks UNLIM to look at the live
 * lavagna / circuito / breadboard / schema. These should:
 *   1. trigger the vision chain (capture screenshot + Pixtral/Gemini Vision),
 *   2. force a focused top-2 onniscenza fetch (kit-anchored, not exploratory).
 *
 * Pattern: verb (guarda|vedi|controlla|verifica) + target (lavagna|circuito|
 * breadboard|schema). Word boundaries anchor both sides to avoid false
 * positives like "controllo automatico" or "verifica formale".
 */
const VISION_REQUEST_RE = /\b(guarda|guardi|guardiamo|guardate|vedi|vede|vediamo|vedete|controlla|controlli|controlliamo|controllate|verifica|verifichi|verifichiamo|verificate)\s+(?:(?:la|le|lo|gli|i|il|un|una|uno|dei|degli|delle|se|sul|sulla|nella|nel)\s+)*\b(lavagna|lavagne|circuito|circuiti|breadboard|schema|schemi|kit|montaggio|cablaggio)\b/i;

/**
 * Sprint U iter 25 — off-topic category. Detects prompts that have NOTHING
 * to do with electronics / Arduino / kit ELAB (history, sport, cooking,
 * translation, celebrity, math-arithmetic, generic pop culture) so the
 * orchestrator can short-circuit the LLM call and return a deterministic
 * "gentle bridge" template per Andrea iter 21 mandate (acknowledge → bridge
 * → recall/proposta).
 *
 * Extended from `unlim-chat/index.ts:260` OFFTOPIC_QUERY_RE (iter 22.3 + iter
 * 24 dim-1 evidence gaps). 10 macro-clusters:
 *   1. sport            (calcio/serie A/squadre/champions/gol)
 *   2. math arithmetic  (quanto fa N+M / aritmetica / teorema / equazione)
 *   3. history/geo      (presidente / capitale X / geografia / guerra mond.)
 *   4. culture/enter.   (cinema/musica/tiktok/film Marvel/serie Netflix)
 *   5. cooking          (ricetta/cucina/cuocere/ingredienti)
 *   6. translation      (traduci/traduzione/come si dice in inglese)
 *   7. celebrity        (cantante/attore/regista/celebrità)
 *   8. politics         (elezione/partito/governo)
 *   9. videogames       (videogioc/pokemon)
 *  10. social media     (instagram/youtube/tiktok)
 *
 * Anti-backtracking: bounded `\w+` (≤1 token), `{1,N}` quantifiers, NO nested
 * `*` of groups containing alternations. Negative lookaheads exclude legit
 * ELAB neighbours ("storia dell'elettronica", "Inter milan città", etc.).
 */
const OFFTOPIC_RE = /\b(?:quanto\s+fa\s+\d+(?:\s*[+\-*x×÷/]\s*\d+)?|matematica(?!\s+(?:del|della|dei|degli|del\s+LED|del\s+circuito))|aritmetica|teorema(?!\s+di\s+kirchhoff)|formula\s+(?:matematica|chimica|fisica(?!\s+del\s+circuito))|equazione(?!\s+(?:circuito|elettrica))|presidente(?:\s+(?:di|del|della))?|chi\s+è\s+il\s+presidente|capitale\s+\w+|geografia|storia(?!\s+(?:del|della|dei|degli|elettronica|arduino))|guerra\s+(?:mondiale|prima|seconda)|elezione|elezioni|politica|partito|governo|ricetta|cucina|cuocere|ingredient\w*|traduci|traduzione|come\s+si\s+dice\s+in\s+\w+|celebrità|cantante|attore|attrice|regista|sport(?!ello)|cinema|musica|tiktok|instagram|youtube|videogioc\w*|pokemon|calcio|basket|tennis|Inter|Juventus|Milan(?!\s+città)|Roma(?!\s+città)|Napoli(?!\s+città)|Lazio|Atalanta|Serie\s+A|Champions|partita|gol|campionato|film\s+(?:Marvel|Disney|Hollywood|nuovo|recente|ultimo)|serie\s+(?:Netflix|Amazon|HBO|TV)|Marvel|Disney(?!\s+land)|Hollywood|canzone\s+(?:tiktok|virale|nuova)|Pitagora|Pitagorica)\b/i;

/** Cooking sub-cluster (drives offtopicType differentiation). */
const OFFTOPIC_COOKING_RE = /\b(ricetta|cucina|cuocere|ingredient\w*)\b/i;
/** Translation sub-cluster. */
const OFFTOPIC_TRANSLATION_RE = /\b(traduci|traduzione|come\s+si\s+dice\s+in\s+\w+)\b/i;
/** Celebrity / entertainment-people sub-cluster. */
const OFFTOPIC_CELEBRITY_RE = /\b(celebrità|cantante|attore|attrice|regista|elezione|elezioni|politica|partito|governo)\b/i;
/** Sport sub-cluster. */
const OFFTOPIC_SPORT_RE = /\b(calcio|inter|juventus|milan|roma|napoli|lazio|atalanta|serie\s+a|champions|partita|gol|campionato|sport(?!ello)|basket|tennis)\b/i;
/** Math / arithmetic sub-cluster. */
const OFFTOPIC_MATH_RE = /\b(?:quanto\s+fa\s+\d+|aritmetica|matematica|teorema|formula\s+(?:matematica|fisica|chimica)|equazione|pitagora|pitagorica)\b/i;
/** History / geography sub-cluster. */
const OFFTOPIC_HISTORY_RE = /\b(presidente|capitale\s+\w+|geografia|storia|guerra\s+(?:mondiale|prima|seconda))\b/i;
/** Culture / entertainment-content sub-cluster. */
const OFFTOPIC_CULTURE_RE = /\b(cinema|musica|tiktok|instagram|youtube|videogioc\w*|pokemon|film|serie\s+(?:tv|netflix|amazon|hbo)|marvel|disney|hollywood|canzone)\b/i;

/**
 * Sub-classify off-topic prompt into a specific `OfftopicType` so the
 * template responder can pick the matching acknowledge variant.
 *
 * Priority (mutually exclusive, first match wins):
 *   cooking → translation → celebrity → sport → math → history → culture → generic
 *
 * Cooking/translation/celebrity come FIRST because they are narrower clusters
 * with less overlap risk; the broader sport/math/history/culture buckets
 * follow. `generic` is the safe fallback when the OFFTOPIC_RE umbrella
 * matched but no sub-cluster did (rare; future-proof).
 */
export function classifyOfftopicType(text: string): OfftopicType {
  if (OFFTOPIC_COOKING_RE.test(text)) return 'cooking';
  if (OFFTOPIC_TRANSLATION_RE.test(text)) return 'translation';
  if (OFFTOPIC_CELEBRITY_RE.test(text)) return 'celebrity';
  if (OFFTOPIC_SPORT_RE.test(text)) return 'sport';
  if (OFFTOPIC_MATH_RE.test(text)) return 'math';
  if (OFFTOPIC_HISTORY_RE.test(text)) return 'history';
  if (OFFTOPIC_CULTURE_RE.test(text)) return 'culture';
  return 'generic';
}

/**
 * Word counter. Strips action tags / markdown punctuation that should NOT
 * affect intent classification. Defensive on null/undefined.
 */
export function countWords(input: string | null | undefined): number {
  if (!input || typeof input !== 'string') return 0;
  // Strip well-known noise that user wouldn't intend as content.
  const cleaned = input
    .replace(/\[(AZIONE|INTENT)[^\]]*\]/gi, ' ')
    .replace(/[*_`~]/g, ' ');
  // Tokens count only when they contain at least one letter or digit
  // (Unicode-aware via \p{L}\p{N}). This excludes pure-emoji / punctuation
  // tokens which would otherwise inflate the word count and prevent the
  // chit_chat skip path on emoji-only messages.
  return cleaned
    .split(/\s+/)
    .filter((w) => w.length > 0 && /[\p{L}\p{N}]/u.test(w))
    .length;
}

/**
 * Classify a user prompt using regex only (NO LLM).
 *
 * Order of checks matters:
 *  1) safety_warning (highest): even short messages must keep top-3.
 *  2) chit_chat: <8 words AND greeting → SKIP onniscenza.
 *  3) citation_vol_pag: explicit Vol/pag → top-2 focused fetch.
 *  4) plurale_ragazzi: docente speaking to class → top-2 concise.
 *  5) deep_question: >=20 words AND ends with `?` → top-3 deep context.
 *  6) default fallback → top-3 (preserved iter 37 contract; see iter 38 caveat).
 *
 * @param input  raw user prompt (possibly empty)
 * @returns      ClassificationResult with category, skipOnniscenza, topK
 */
export function classifyPrompt(input: string | null | undefined): ClassificationResult {
  const wordCount = countWords(input);
  const text = (input || '').trim();

  // 1. Safety warning beats everything (security trumps latency).
  if (SAFETY_RE.test(text)) {
    return { category: 'safety_warning', skipOnniscenza: false, topK: 3, wordCount };
  }

  // 2. Empty / very short / greeting → chit_chat (cheapest path).
  // Empty or pure-whitespace inputs collapse here too.
  if (wordCount === 0) {
    return { category: 'chit_chat', skipOnniscenza: true, topK: 0, wordCount };
  }
  if (wordCount < 8 && GREETING_RE.test(text)) {
    return { category: 'chit_chat', skipOnniscenza: true, topK: 0, wordCount };
  }

  // 2.5 Sprint V iter 43 ATOM A3 — vision_request beats citation/plurale/deep
  // because the docente literally asked UNLIM to LOOK at the lavagna. We must
  // (a) keep onniscenza at top-2 (kit-anchored focused fetch),
  // (b) flag triggers_vision_chain=true so the chat handler captures a screenshot
  //     and routes through Pixtral/Gemini Vision instead of a text-only LLM call.
  if (VISION_REQUEST_RE.test(text)) {
    return {
      category: 'vision_request',
      skipOnniscenza: false,
      topK: 2,
      wordCount,
      triggers_vision_chain: true,
    };
  }

  // 3. Explicit citation references → top-2 focused fetch (volume-anchored).
  if (CITATION_RE.test(text)) {
    return { category: 'citation_vol_pag', skipOnniscenza: false, topK: 2, wordCount };
  }

  // 4. Plurale "ragazzi" addressing → top-2 (docente-to-class concise).
  if (PLURALE_RE.test(text)) {
    return { category: 'plurale_ragazzi', skipOnniscenza: false, topK: 2, wordCount };
  }

  // 5. Deep question (>=20 words + question mark) → top-3 (full context).
  if (wordCount >= 20 && /\?\s*$/.test(text)) {
    return { category: 'deep_question', skipOnniscenza: false, topK: 3, wordCount };
  }

  // 5.5 Sprint U iter 25 — off-topic detector BEFORE default fallback.
  // Cat D 37.5% regression evidence iter 24 dim-1 LIVE prod bench: LLM was
  // answering history/cooking/translation/celebrity content instead of
  // applying the gentle bridge. Hard-redirect pre-LLM via OFFTOPIC_RE + sub-
  // classify via classifyOfftopicType so `unlim-chat/index.ts` can call
  // `buildOfftopicGentleBridge(offtopicType, sessionContext)` and skip the
  // (expensive + drifty) LLM call entirely.
  if (OFFTOPIC_RE.test(text)) {
    return {
      category: 'off_topic',
      skipOnniscenza: true,
      topK: 0,
      wordCount,
      offtopicType: classifyOfftopicType(text),
    };
  }

  // 6. Fallback default → top-3 (preserve iter 37 test contract; Maker-1 cannot
  // edit tests/unit/onniscenza-classifier.test.js per file-ownership rigid).
  // Iter 38 A5 latency lift achieved via A3 Promise.all parallelization + A5
  // Cron warmup ping; default classifier topK kept at 3.
  return { category: 'default', skipOnniscenza: false, topK: 3, wordCount };
}

/** Module version marker (orchestration handoff). Iter 38 maintains the
 * "iter37" substring intentionally because tests/unit/onniscenza-classifier.test.js
 * (file owned by Tester-N, not Maker-1) asserts a regex match of /iter37/.
 * Iter 38 changes are purely doc/comment — no behavioral diff that would
 * justify breaking the existing test contract. Version semantics: this
 * file's logical iter is 38, but the marker is held back by ownership. */
export const ONNISCENZA_CLASSIFIER_VERSION = '1.0-iter37-iter38-doc-only-iter43-vision-iter25-offtopic';
