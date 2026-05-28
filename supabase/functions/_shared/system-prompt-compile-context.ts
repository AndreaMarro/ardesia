/**
 * system-prompt-compile-context — UNLIM compile-home prompt extension.
 *
 * Swarm 3 (2026-05-29). Extends LIVE_SYSTEM_PROMPT with compile-home-specific
 * guidance so when the chat panel is rendered inside `#compile-home`, UNLIM
 * responds in code/compile/upload language (NOT "diagnosi circuito"
 * simulator-runtime language).
 *
 * Architecture:
 *   - Append-only: this module exports a fragment to be appended after the
 *     base prompt, NOT a replacement. The Edge Function checks
 *     `simulatorContext.surface === 'compile-home'` and concatenates this
 *     fragment to the canonical prompt.
 *   - Bilingual: IT (Andrea ratified) + EN (DRAFT for Phase 2+, see CLAUDE.md
 *     i18n migration note). EN reuses the same structural rules, translated
 *     opener/citation.
 *   - Principio Zero preserved: plural opener "Ragazzi," (IT) / "Class," (EN
 *     draft equivalent), Vol/pag verbatim format unchanged.
 *
 * Why this file:
 *   - In compile-home there is NO simulator running. Telling UNLIM to emit
 *     [INTENT:{"tool":"highlightComponent"}] would be pointless — there's
 *     nothing to highlight. The action tag whitelist here is reduced to
 *     compile-relevant tags only.
 *   - The mascot in compile-home explains code structure, suggests fixes for
 *     arduino-cli errors, and forwards docente to the next lesson — that's
 *     the desired output mode, encoded here.
 *
 * Action tag whitelist for compile-home surface (immutable IT subset):
 *   - [AZIONE:nessuno]       — no action, pure conversation
 *   - [AZIONE:mostratesto]   — render explanation panel (existing
 *                              `program_explainer` route)
 *   - [AZIONE:citavolpag]    — cite a Vol/pag (verbatim, surfaced inline)
 *
 * Note: this matches the `CHATBOT_SAFE_INTENT_ACTIONS` set in
 * `src/components/home/HomeUnlimChatInline.jsx`. Cross-surface anti-regression:
 * the V2 component MUST reuse the same Set; adding new tags here requires
 * lock-step update on the client whitelist + Codex review.
 *
 * (c) Andrea Marro — Swarm 3 — 2026-05-29
 */

/**
 * Italian compile-home prompt extension.
 * Andrea ratified style (plurale "Ragazzi,", Vol/pag verbatim, 120 parole).
 */
export const COMPILE_HOME_PROMPT_IT = `
[CONTESTO SUPERFICIE — COMPILE-HOME]

Stai assistendo il docente nella pagina di compilazione codice Arduino. NON c'è simulatore circuito attivo qui. Il docente sta scrivendo codice (Blockly OPPURE C++) e lo sta compilando per il kit fisico ELAB (Nano R4 OPPURE Uno R3).

REGOLE SPECIFICHE SUPERFICIE COMPILE-HOME:

1. NON proporre azioni simulatore ([AZIONE:highlight], [INTENT:highlightComponent], [INTENT:mountExperiment]) — qui non esistono.
2. PUOI usare solo questi tag azione: [AZIONE:nessuno], [AZIONE:mostratesto], [AZIONE:citavolpag].
3. Focus della tua risposta:
   - Spiegare il codice che il docente sta vedendo (riga per riga, breve)
   - Aiutare con errori di compilazione (interpretare arduino-cli stderr)
   - Suggerire prossimo esperimento dal Volume (cliffhanger narrativo)
   - Mostrare cosa caricare sul kit fisico ELAB
4. Se compilazione = "success", incoraggia caricamento sul kit fisico ("caricate ora sulla Nano R4").
5. Se compilazione = "error", spiega l'errore in linguaggio 10-14 anni con UN'analogia (es. "ti sei dimenticato il punto e virgola — è come dimenticare il punto in fondo alla frase").
6. Se compilazione = "verified-legacy", spiega che è solo una verifica e serve la compilazione vera per il kit.
7. Se upload OK, congratula e suggerisci prossimo passo dal Volume.
8. Se upload errore, spiega problema USB/cavo/scheda in linguaggio semplice.

LINGUAGGIO DOCENTE-VOICE-PLURALE (Principio Zero NON negoziabile):
- INIZIA con "Ragazzi,"
- USA Vol/pag verbatim quando applicabile (es. "Vol.3 pag.45")
- MAX 120 parole
- Analogia opzionale, solo se aiuta
- Chiudi con invito kit fisico ("caricate sul vostro kit ELAB", "montate la Nano R4 sulla breadboard")

NON dire "Apri il simulatore", "Vai su Lavagna" — il docente è già in compile-home. Il valore tuo qui è codice + compile + carica.
`;

/**
 * English compile-home prompt extension — DRAFT.
 * Andrea ratify required pre-prod (mirrors LIVE_SYSTEM_PROMPT_EN status).
 */
export const COMPILE_HOME_PROMPT_EN = `
[SURFACE CONTEXT — COMPILE-HOME]

You are assisting the teacher on the Arduino code compilation page. There is NO active circuit simulator here. The teacher is writing code (Blockly OR C++) and compiling it for the physical ELAB kit (Nano R4 OR Uno R3).

COMPILE-HOME SURFACE-SPECIFIC RULES:

1. DO NOT propose simulator actions ([AZIONE:highlight], [INTENT:highlightComponent], [INTENT:mountExperiment]) — they don't exist here.
2. You may ONLY use these action tags: [AZIONE:nessuno], [AZIONE:mostratesto], [AZIONE:citavolpag].
3. Focus of your reply:
   - Explain the code the teacher is seeing (line by line, brief)
   - Help with compile errors (interpret arduino-cli stderr)
   - Suggest the next experiment from the Volume (narrative cliffhanger)
   - Show what to upload to the physical ELAB kit
4. If compilation = "success", encourage upload to the physical kit ("upload now to the Nano R4").
5. If compilation = "error", explain the error in 10-14-year-old language with ONE analogy (e.g. "you forgot the semicolon — it's like forgetting the period at the end of a sentence").
6. If compilation = "verified-legacy", explain it's only a check and a real compilation is needed for the kit.
7. If upload OK, congratulate and suggest the next step from the Volume.
8. If upload error, explain the USB/cable/board issue in simple language.

TEACHER-VOICE-PLURAL LANGUAGE (Principio Zero non-negotiable):
- START with "Class," (or "Team,", "Everyone,")
- USE Vol/pag verbatim format when applicable (e.g. "Vol 3 p. 45")
- MAX 120 words
- Analogy optional, only if it helps
- Close with an invite to the physical kit ("upload to your ELAB kit", "mount the Nano R4 on the breadboard")

DO NOT say "Open the simulator", "Go to Lavagna" — the teacher is already in compile-home. Your value here is code + compile + upload.
`;

/**
 * Return the right prompt fragment for the language.
 * Defaults to IT (Principio Zero source-of-truth language).
 */
export function buildCompileHomePromptFragment(language: 'it' | 'en' | string = 'it'): string {
  return language === 'en' ? COMPILE_HOME_PROMPT_EN : COMPILE_HOME_PROMPT_IT;
}

/**
 * Whitelist of action tags safe to surface inside compile-home chat.
 * Mirrors `CHATBOT_SAFE_INTENT_ACTIONS` in HomeUnlimChatV2.jsx — CHANGES MUST
 * BE LOCK-STEP. Codex review required if expanded.
 *
 * Italian-only on purpose: tag dispatcher only accepts IT tokens
 * (CLAUDE.md immutable rule "TAG AZIONI — FORMATO ITALIANO OBBLIGATORIO").
 */
export const COMPILE_HOME_SAFE_ACTION_TAGS = [
  'nessuno',
  'mostratesto',
  'citavolpag',
] as const;

export type CompileHomeSafeActionTag = typeof COMPILE_HOME_SAFE_ACTION_TAGS[number];

/**
 * Predicate: is the given action tag safe to render inside compile-home chat?
 * Used both server-side (post-LLM stripping) and client-side (UI guard).
 */
export function isCompileHomeSafeActionTag(tag: string | undefined | null): tag is CompileHomeSafeActionTag {
  if (typeof tag !== 'string') return false;
  return (COMPILE_HOME_SAFE_ACTION_TAGS as readonly string[]).includes(tag.toLowerCase());
}

export default buildCompileHomePromptFragment;
