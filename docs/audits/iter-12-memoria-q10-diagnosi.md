# Iter 12 Memoria Q10 regression diagnosi — onesto

Data: 2026-05-10
Tipo: diagnosi read-only (ZERO code change)
Scope: Q10 sessione 2-step "Stiamo facendo Vol.1 cap.6" → "Continuiamo" pass V1 → fail V2

## Evidence base

- Iter 11 V1 (pre-fix): Q10 PASS recall "Continuiamo" coerente Vol.1 cap.6 seed
- Iter 11 V2 (post-deploy 2026-05-10): Q10 FAIL — recall "Continuiamo" risponde `[AZIONE:loadexp:led_basic]` (text length 26 chars, word_count 0, NO Ragazzi opener, NO Vol/pag, NO contesto LED del seed)
- File telemetry: `/Users/andreamarro/VOLUME 3/automa/state/iter-11-live-smoke-results.json` linee 416-449
- sessionId condiviso tra q10a e q10: `"iter-11-q10-memory"` (linee 390, 420)

## Hypothesis test

### H1 classifier "Continuiamo" → chit_chat (skipOnniscenza=true): **FALSIFIED**

File: `supabase/functions/_shared/onniscenza-classifier.ts:69, 138-191`

Test:
- `countWords("Continuiamo")` → 1 (riga 108-122)
- `SAFETY_RE.test("Continuiamo")` → false (riga 75)
- `wordCount === 0` → false → no early chit_chat exit (riga 149-151)
- `wordCount < 8 && GREETING_RE.test("Continuiamo")` → 1<8 TRUE && GREETING_RE includes solo `ciao|salve|grazie|buongiorno|buonasera|buonanotte|ehi|hey|hola` → **GREETING_RE.test("Continuiamo") = false** (riga 69)
- `VISION_REQUEST_RE.test("Continuiamo")` → false (riga 102: vede verbi guarda|vedi|controlla|verifica — non "continuiamo")
- `CITATION_RE.test("Continuiamo")` → false (riga 81)
- `PLURALE_RE.test("Continuiamo")` → false (riga 89: `\bragazz[ie]\b`)
- `wordCount >= 20 && /\?\s*$/.test("Continuiamo")` → false (riga 182)
- Fallback → **category: 'default', skipOnniscenza: false, topK: 3, wordCount: 1** (riga 190)

Implicazione: il classifier NON skipOnniscenza. Onniscenza viene chiamato. RAG hybrid pure viene chiamato (topK=3). H1 falsificata.

### H2 KV scoping cambiato post-deploy: **FALSIFIED**

Sia q10a (seed msg1) sia q10 (recall msg2) usano lo stesso sessionId `iter-11-q10-memory`. La sessione è correttamente condivisa nel client di test. Nessun pattern KV scoping nel codice — Supabase REST `student_sessions` + `lesson_contexts` chiave per `session_id` plain. H2 falsificata.

### H3 history `[]` hardcoded riga 433: **CONFIRMED**

File: `supabase/functions/unlim-chat/index.ts:433`

```ts
onniscenzaSnapshot = await aggregateOnniscenza({
  query: safeMessage,
  experiment_id: safeExperimentId,
  session_id: sessionId,
  history: [], // caller history injection iter 31+   ← HARDCODED
  supabase: supaClient,
  enable: { L1_rag: false },
});
```

- Caller history mai popolato (commento dichiara "iter 31+" carryover non risolto)
- Audit iter 11 P0 #3 GIÀ documentava questo gap
- Conseguenza: aggregateOnniscenza riceve `history=[]` → L6_chat_history layer 7-layer aggregator vuoto → nessun riferimento msg1 raggiunge LLM via Onniscenza

In più, `loadStudentContext(sessionId)` (riga 368, memory.ts:64-118) recupera SOLO:
- `student_progress.completed_experiments` (array IDs esperimenti completati)
- `student_progress.common_mistakes`
- `student_progress.level`
- `student_progress.last_experiment_id` → estrae `currentChapter` via regex `/cap(\d+)/`
- `student_sessions.started_at`

NON recupera last-N messaggi della sessione corrente. Quindi:
- msg2 "Continuiamo" arriva senza testo di msg1 nel contesto LLM
- L'unico canale residuo è `currentChapter` ricavato da `last_experiment_id` — ma vedere H4 perché anche questo è vuoto

H3 confermata. Audit iter 11 P0 #3 mai chiuso.

### H4 capitoloFragment vuoto msg2 (safeMessage="Continuiamo" non matcha experimentId): **CONFIRMED**

File: `supabase/functions/unlim-chat/index.ts:457-470`

```ts
let capitoloFragment = '';
if (safeExperimentId) {
  try {
    const match = getCapitoloByExperimentId(safeExperimentId);
    capitoloFragment = buildCapitoloPromptFragment(match?.capitolo ?? null, safeExperimentId);
  } catch (capErr) { ... }
}
```

Il fragment si attiva SOLO se la chiamata `unlim-chat` passa `experimentId` esplicito nel payload. Q10 è uno smoke `curl`-style senza `experimentId` → `safeExperimentId` falsy → `capitoloFragment = ''` per msg2.

Inoltre, msg1 ("Stiamo facendo Vol.1 cap.6") risponde con `[AZIONE:loadexp:volume1_cap6]` ma:
- saveInteraction (memory.ts:130-203) viene chiamato con `experimentId = safeExperimentId || null` (index.ts:816). Sul seed, `safeExperimentId` non è impostato → memory salva `experimentId=null`.
- `student_sessions.last_experiment_id` viene aggiornato con `null` (memory.ts:144). 
- `lesson_contexts` UPSERT skippato perché `if (experimentId)` (memory.ts:149) è false.
- saveInteraction NON estrae il riferimento Vol.1/cap.6 dal testo del seed e NON lo persiste in `last_experiment_id`.

Quindi su msg2:
- `loadStudentContext` legge `student_progress.last_experiment_id` → null (mai aggiornato perché seed senza experimentId)
- `currentChapter` calcolato in memory.ts:101-102 → null
- `studentContext.currentChapter` passato a `buildSystemPrompt` → null
- LLM riceve "Continuiamo" + system prompt SENZA Vol.1, SENZA cap.6, SENZA LED

H4 confermata.

### H5 PATCH B falsamente trigger su "Continuiamo": **FALSIFIED**

File: `supabase/functions/unlim-chat/index.ts:233, 255`

- `VOLTAGE_DANGER_QUERY_RE` (riga 233): `\b(220V|110V|tensione di rete|presa|...)` — NON matcha "Continuiamo"
- `OFFTOPIC_QUERY_RE` (riga 255): `\b(quanto fa N|matematica|...|tiktok|...)` — NON matcha "Continuiamo"

H5 falsificata.

### Hypothesis aggiuntiva H6: L2 template short-circuit FALSIFIED

File: `supabase/functions/_shared/clawbot-template-router.ts:215-288`

- `selectTemplate("Continuiamo", { experimentId: undefined })`:
  - tokens = ["continuiamo"] (size 1, > 0)
  - threshold default 999 (riga 226)
  - Nessun experimentId → salta per-experiment fast-path (riga 234)
  - Bag-of-words scoring: nessun template TEMPLATES_L2 ha keyword "continuiamo"
  - `best.score < 999` → return null
- Quindi NO template short-circuit, va dritto al LLM via callLLM (riga 601).

H6 falsificata.

## Root cause

Combinazione di 2 cause indipendenti, **entrambe necessarie**, **entrambe attive**:

1. **`history: []` hardcoded** in `supabase/functions/unlim-chat/index.ts:433` (audit iter 11 P0 #3 mai chiuso): caller non passa last-N messaggi della sessione → Onniscenza L6_chat_history vuota → LLM non vede msg1.

2. **saveInteraction non persiste contesto Vol/cap senza `experimentId` esplicito** (`supabase/functions/_shared/memory.ts:144-162` + index.ts:816): msg1 "Stiamo facendo Vol.1 cap.6" entra **senza payload `experimentId`** → `safeExperimentId=null` → `student_sessions.last_experiment_id` resta null → `loadStudentContext` su msg2 non ha currentChapter da iniettare → `studentContext.currentChapter = null` in buildSystemPrompt.

Effetto su msg2 ("Continuiamo"):
- system prompt → studentContext senza chapter (campo `currentChapter: null` viene rimosso dal prompt o renderizzato vuoto)
- `experimentContext` riga 450 → null (no experimentId nella req)
- `capitoloFragment` riga 457 → '' (no experimentId)
- `ragContext` da hybridRetrieve("Continuiamo", topK=3) → query vuota di senso, top-3 RRF restituisce chunk casuali (NON LED del seed)
- `onniscenzaContext` con `history=[]` → no recall msg1
- LLM riceve solo "Continuiamo" → genera `[AZIONE:loadexp:led_basic]` come **pure inference statistical guess** (LED basic è il primo esperimento default del corso, prior probabilistico LLM su "continuiamo a fare elettronica per ragazzi")

Cita file:line:
- `unlim-chat/index.ts:433` — `history: []` hardcoded
- `unlim-chat/index.ts:457-470` — capitoloFragment gated su safeExperimentId
- `unlim-chat/index.ts:816` — saveInteraction passa `safeExperimentId || null`
- `memory.ts:101-102` — currentChapter parse da `last_experiment_id` regex `/cap(\d+)/`
- `memory.ts:144-162` — UPSERT student_sessions + lesson_contexts gated su `experimentId`
- `memory.ts:64-118` — loadStudentContext non carica history messaggi

## Q10 V1 PASS — luck or memoria?

**LUCK + LLM inference**, NON vera memoria.

Evidence:
- Stesso codice `history: []` hardcoded sia V1 sia V2 (audit P0 #3 era già documentato pre-V2 deploy — non introdotto V2)
- Stesso pattern saveInteraction su V1 sia V2 (no fix tra le due versioni)
- V1 Q10 PASS reason riportato `"LED reference (implicit from Vol.1 cap.6 seed)"` (iter-11-live-smoke-results.json:446) — l'evaluator ha contato come PASS perché la response V1 conteneva un riferimento a LED, coerente per fortuna con il seed Vol.1 cap.6 (che ha LED come primo esperimento)
- V2 Q10 FAIL response `[AZIONE:loadexp:led_basic]` — è ANCHE coerente con LED del seed (led_basic è il primo esperimento LED), MA il response è ridotto al solo tag azione senza prosa contestuale (text_length_chars=26, word_count=0)

Quindi V1 PASS è stato **lucky inference**: il LLM ha indovinato LED perché statisticamente è la cosa più probabile da fare "continuando" per ragazzi 8-14 anni con kit Arduino. NON c'è stato vero recall del seed Vol.1/cap.6.

V2 ha lo stesso pattern di guess, ma con output più scarno (sostantivo `led_basic` invece di `led` + prosa). Lo scorer V2 ha contato il word_count=0 e missing Ragazzi opener come FAIL. Lo scorer V1 era più permissivo (loose LED ref). **La diagnostica vera è: la "memoria" Q10 non è mai esistita, il bench V1 era stato troppo benevolo.**

Risposta diretta: la V2 non è una regressione di memoria, è una **regressione del template di output del LLM** (probabilmente cambio sys-prompt v3.1 in iter 26+ ha portato Mistral a emettere solo tag azione senza prosa quando il contesto è troppo povero). Il bug V1 → V2 è esposto **dalla scarsa qualità della response**, non dal venir meno di un recall che non c'era.

## Fix proposal iter 13+

### Fix #1 — caller history injection (audit iter 11 P0 #3 chiusura)
- File: `supabase/functions/unlim-chat/index.ts:433`
- Richiede: API `unlim-chat` accetti `history: Message[]` nel payload + caller frontend `useGalileoChat` lo popoli con last-N messaggi della stessa session
- LOC stimati: ~30 LOC (interface ChatRequest + 1 riga assegnazione + 10 LOC frontend hook + 15 LOC test)
- Effort: 2-3h
- Risk: basso (history defensivo, default `[]` preservato; Onniscenza già defensive try/catch)

### Fix #2 — saveInteraction estrae Vol/cap dal user message anche senza experimentId
- File: `supabase/functions/_shared/memory.ts:130-203` (signature + body)
- Aggiungere parsing regex `\bvol(?:ume)?\.?\s*([123])\b` + `\bcap(?:itolo)?\.?\s*(\d+)\b` su `responsePreview` OPPURE passare anche il user message → derivare `last_experiment_id` virtuale `volX_capY` quando manca experimentId esplicito
- LOC stimati: ~25 LOC (regex extract + UPSERT `last_experiment_id=volume1_cap6` su seed) + 8 LOC test
- Effort: 1-2h
- Risk: medio — UPSERT `student_progress.last_experiment_id` con valore virtuale non-mappato potrebbe rompere altri caller che si aspettano un experimentId reale. Mitigazione: separare colonna `inferred_chapter` distinta da `last_experiment_id`.

### Fix #3 — loadStudentContext carica last-N messages della sessione (alternativa preferita a Fix #1)
- File: `supabase/functions/_shared/memory.ts:64-118` + nuova tabella `chat_messages(session_id, role, text, ts)` o uso di esistente `lesson_contexts.context_data.responsePreview`
- Iniettare in `studentContext.recentMessages` → buildSystemPrompt aggiunge sezione "Cosa è stato detto nella sessione corrente"
- LOC stimati: ~50 LOC (query SELECT order DESC limit 10 + concat in prompt + GDPR check no PII raw user msg) + 15 LOC test
- Effort: 3-4h
- Risk: medio — GDPR: salvare raw user messages contraddice il design `saveInteraction` (memory.ts:124-127 commenta `NEVER stores raw user messages`). Necessario consenso esplicito o hash-based + truncation aggressive.

**Raccomandazione iter 13**: applicare **Fix #1** + **Fix #2** in tandem. Fix #3 è più robusto ma richiede ADR GDPR + consenso. Effort totale stimato Fix #1+#2: ~4-5h iter 13.

## Anti-regression strategy

### Add Q10 unit test fixture as canary

File: `tests/unit/memory-recall-canary.test.js` (NEW ~80 LOC)

```js
describe('Q10 cross-msg memoria canary', () => {
  it('seed "Stiamo facendo Vol.1 cap.6" persiste contesto in student_sessions', async () => {
    const sessionId = 'test-canary-q10';
    await saveInteraction(sessionId, null, 'general', '...', 'test-model');
    // post-fix: dovrebbe inferire last_experiment_id=volume1_cap6 dal user message
    const ctx = await loadStudentContext(sessionId);
    expect(ctx.currentChapter).toBe(6);
  });

  it('recall "Continuiamo" su sessione con seed Vol.1 cap.6 → buildSystemPrompt include chapter 6', () => {
    const studentContext = { currentChapter: 6, completedExperiments: 0, ... };
    const prompt = buildSystemPrompt(studentContext, null, null, '', false, defaultProfile);
    expect(prompt).toMatch(/cap.*6|capitolo 6/i);
  });
});
```

Gate: questo test DEVE fallire prima del fix (canary RED) e passare dopo (canary GREEN). Esegui ogni iter come parte di `npx vitest run tests/unit/memory-recall-canary.test.js`.

### Aggiungi check live bench Q10 più granulare

In `automa/state/iter-*-live-smoke-results.json` scorer Q10:
- Replace check "LED reference (implicit from Vol.1 cap.6 seed)" con check positivo: response DEVE contenere `\bcap.*6\b` OR `\bcapitolo 6\b` OR `\bvol(?:ume)?\.?\s*1\b` (non basta "led_basic" → quello sarebbe sempre PASS by inference)
- Questo evita V1-style false positive.

### ZERO code change iter 12 (diagnosi only)

Iter 12 è puramente di diagnosi. NO file edit src/ o supabase/functions/. SOLO questo audit md.

## File ownership

NO write src/ supabase/functions/ (read-only confirmed).
SOLO scrivi: `docs/audits/iter-12-memoria-q10-diagnosi.md` (questo file).
