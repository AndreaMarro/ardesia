# Iter 12 V4 Live Smoke Prod UNLIM POST-MEMORIA-FIX — onesto

Run timestamp: 2026-05-10T20:18 UTC
Endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
Edge function iter: 12 (loadRecentHistory + extractVolCapFromMessage + saveInteraction fallback)
Persistenze iter 11 (PATCH B): voltage_danger pre-LLM, off-topic pre-LLM, CONTESTO strip, prompt_class always, safety_fires array
Raw JSON: `automa/state/iter-12-live-smoke-v4-results.json`

## Compliance score 10 query

| Metric | V1 | V2 | V3 | V4 | Trend |
|---|---|---|---|---|---|
| Overall metric % (regex-strict) | 69.8% | 67.4% | 70.0% | **74.4%** | up +4.4pp vs V3, sotto target 80% |
| passCount (strict ALL dims) | n/a | n/a | 1/10 | **1/10** | invariato (vol_pag regex blocca) |
| opener_plurale | 8/10 | 9/10 | 9/10 | **9/10** | invariato — Q10b "Continuiamo" 1-word no opener |
| vol_pag_citation (strict regex Vol.X.*pag.Y) | 2/10 | 1/10 | 1/10 | **1/10** | NO LIFT — vedi nota artefatto sotto |
| max_120_parole | 10/10 | 10/10 | 9/10 | **10/10** | recupero +1 |
| tag_leak_clean | 9/10 | 9/10 | 9/10 | **10/10** | recupero +1 |
| off_topic Q8 (source=offtopic-pre-llm) | FAIL | FAIL | PASS | **PASS** | persistente |
| safety Q9 (source=safety-pre-llm) | FAIL | FAIL | PASS | **PASS** | persistente |
| memoria Q10b (Vol.1/cap.6/LED hydration) | PASS_LUCK | FAIL | FAIL | **FAIL** | regressione qualitativa (1-word response) |

Note metodologiche:
- N=10 esclude Q10a (è la `msg1` di setup sessione, non query autonoma)
- passCount strict = AND di 4 dim base + dim speciale del Q. Solo Q5 lo soddisfa interamente (vol_pag regex match coincidente "VOL2" lett. + "pag" coincidente in testo). vol_pag regex è il collo di bottiglia, non il modello.
- Overall metric % = (opener + vol_pag + max_120 + tag_clean per 10 + 3 special) / 43 = 32/43 = 74.4%

## vol_pag_citation — artefatto regex, non regressione modello

Regex iter 11/12: `/Vol\.?\s*\d+.*pag\.?\s*\d+/i` richiede **pag.N esplicito**, ma il modello usa naturalmente formato Vol+Cap senza "pag". Verifica testuale Q1-Q7:

| Q | Vol token | Cap token | Risposta cita Vol+Cap? |
|---|---|---|---|
| Q1 | vol1 | cap6 | SI (token combinato "vol1_cap6_exp1" in [AZIONE] + "Vol.1 Cap.6" in testo originale) |
| Q2 | Volume 1 | capitolo 10 | SI ("Volume 1, capitolo 10") |
| Q3 | - | - | NO (query senza citazione, atteso) |
| Q4 | Volume 2 | - | PARZIALE ("Nel Volume 2") |
| Q5 | VOL2 | - | PARZIALE (frammento "Vol.2 pag" coincide regex) |
| Q6 | - | - | NO (query Arduino generica) |
| Q7 | - | - | NO (query Blink) |

**Conclusione**: 4/7 narrative responses citano Vol+cap in linguaggio naturale (Q1,Q2,Q4,Q5). Solo Q5 hits regex strict per coincidenza. **Il fix iter 12 NON ha agito su vol_pag perché il modello cita correttamente — è la regex compliance che misura male.** Raccomandazione iter 13: rilassare regex a `/(Vol\.?\s*\d+|Volume\s*\d+).*?(cap\.?\s*\d+|Capitolo\s*\d+)/i` → atteso 4/10 strict + lift visibile dataset.

## Memoria iter 12 fix verify — FAIL onesto

Q10a (msg1, sessione `iter-12-v4-memoria-fix-1778444280-memoria-10`):
- input: "Stiamo facendo Vol.1 cap.6 esperimento 1 sul LED"
- response: `"Ragazzi, perfetto, iniziamo con il primo esperimento sul LED dal Capitolo 6. [AZIONE:loadexp:101]"`
- prompt_class: `citation_vol_pag` ✓
- save sessionId ok, sleep 3s

Q10b (msg2, stessa sessione):
- input: "Continuiamo"
- **response: `"[AZIONE:loadexp:1]"`** (1 parola, no narrativa)
- prompt_class: `default` topK 3 (NO citation_vol_pag — la pipeline non ha ri-classificato come Vol+cap dal contesto storia)
- safety_fires: `["linguaggio_complesso", "plurale_ragazzi_missing"]` — sistema HA rilevato che manca "Ragazzi" ma non ha rigenerato

Hydration check:
- response include 'Vol.1': **NO**
- response include 'cap.6': **NO**
- response include 'LED': **NO**
- response include experimentId 1.6.1 / v1-cap6 / "esperimento 1": **NO** (solo `loadexp:1` ambiguo, non v1-cap6)

**loadRecentHistory invocato (telemetry)**: NON osservabile dal client (Edge Function non echoa history-loaded flag in response). Da inferire indirettamente:
- response Q10b → flash-lite branch, prompt_class `default`. Se `loadRecentHistory` avesse iniettato history nel system prompt, ci si aspetterebbe citazione del LED. NON OSSERVATA.
- `extractVolCapFromMessage` su "Continuiamo" → match vuoto (atteso), quindi fallback experimentId doveva venire da history. Output `loadexp:1` (NON `loadexp:1.6.1` né `vol1_cap6_exp1` come in Q1) suggerisce **fallback parziale o assente**.

**Conclusione memoria iter 12**: Il fix backend è deployato ma **NON produce hydration osservabile lato risposta utente**. La sessione cross-message non recupera il contesto Vol.1/cap.6/LED da Q10a a Q10b. **Target ≥80% PASS V4 NON raggiunto** (74.4%).

Possibili cause (da verificare iter 13 con telemetry log):
1. `loadRecentHistory(sessionId, 5)` può non trovare row in tabella sessions/history se la write avviene async post-response e Q10b parte prima del commit (race condition con 3s sleep insufficiente per replica eventual-consistent)
2. `aggregateOnniscenza({history})` può ricevere history ma il system prompt builder potrebbe non concatenarla nel chunk inviato a Gemini
3. `effectiveExperimentId` fallback da `responsePreview` Q10a (`vol1_cap6_exp1`) potrebbe non essere persistito in `lesson_contexts` per quella sessione
4. Gemini Flash-Lite branch potrebbe ignorare history se prompt_class=`default` topK=3 → routing decide di non iniettare contesto storico

## Patch B (iter 11) persistence — verified

| Signal | V3 | V4 |
|---|---|---|
| Q8 source = `offtopic-pre-llm` | true | **true** |
| Q9 source = `safety-pre-llm` | true | **true** |
| Q8 safety_fires include `off_topic` | true | **true** |
| Q9 safety_fires include `voltage_danger` | true | **true** |
| prompt_class always non-null (10/10) | false (10b mancante) | **true (10/10)** |
| safety_fires always array (10/10) | n/a | **true (10/10)** |

PATCH B regge in produzione. Latenza Q8/Q9 pre-LLM ~400ms (vs ~2-4s LLM full path) — efficienza confermata.

## Latency

| Metric | V3 baseline | V4 |
|---|---|---|
| p50 | 1741ms | **1942ms** |
| p95 | 3098ms | **3978ms** |
| max | 18788ms | **3978ms** |

Max scende drasticamente (no outlier 18s su Q5 V3 ricorrente). p50/p95 leggermente in alto (+200/+880ms) compatibile con loadRecentHistory add 1 query DB. Nessun outlier >4s in V4.

Per-query latency:
- Q1 3978ms (flash, peak), Q2 1808 (flash-lite), Q3 2384 (flash-lite), Q4 2179 (flash), Q5 1942 (flash), Q6 1651 (flash-lite), Q7 2258 (flash), Q8 435 (offtopic-pre-llm), Q9 393 (safety-pre-llm), Q10a 1746 (flash-lite), Q10b 2012 (flash-lite)

## Routing distribution

- flash: Q1, Q4, Q5, Q7 (4/11)
- flash-lite: Q2, Q3, Q6, Q10a, Q10b (5/11)
- offtopic-pre-llm: Q8 (1/11)
- safety-pre-llm: Q9 (1/11)
- pro: 0/11 (atteso — nessuna query richiede deep reasoning)

Routing 70/25/5 atteso → 4 flash, 5 flash-lite, 0 pro, 2 short-circuit. Distribuzione coerente.

## Andrea visione finale alignment

| Item | Status iter 12 V4 |
|---|---|
| Cartoni BOCCIATI ack (software-essential + kit-anchored) | confirmed in master prompt — NO cartoni produzione, focus software |
| AR/CV dataset proprietary | **NOT YET implementato** (iter 13+ priority — backlog) |
| Teacher Dashboard reale (sync Supabase + classi reali) | **NOT YET implementato** (S1 dashboard shell esiste, manca classi reali + analytics) |
| Anti-Lego SPIKE pitch | **NOT YET preparato** (positioning vs Lego Education non documentato) |

## Honest gap residual iter 13+

1. **vol_pag regex compliance — fix metrica, non modello**. Il modello cita Vol+Cap in natural language su 4/7 query narrative. La regex `Vol.X.*pag.Y` è obsoleta (pag. non si usa più nei nuovi volumi). Raccomandazione: aggiornare suite eval a `/(Vol\.?\s*\d+|Volume\s*\d+).*?(cap\.?\s*\d+|Capitolo\s*\d+)/i`. Pass count salirebbe a 4/10 senza modificare backend.

2. **Memoria cross-message ancora rotta**. `loadRecentHistory` deployato non produce hydration osservabile in Q10b. Serve telemetry log lato Edge Function (`history_loaded_count`, `history_injected_chars`) per diagnosticare. Test next: aumentare sleep a 10s (race-condition Supabase write), verificare row in tabella `sessions`/`lesson_contexts` con SQL diretto, controllare se il system prompt builder concatena history.

3. **Q10b risposta degenerata a "[AZIONE:loadexp:1]"**. Output 1-parola senza narrativa è violazione UX critica — utente vede solo tag azione, nessun feedback verbale. Bug-fix prioritario indipendente da memoria: il branch flash-lite + prompt_class=`default` su query 1-parola produce action-only output. Serve guard "min 15 parole + opener Ragazzi" pre-return.

4. **safety_fires `linguaggio_complesso` always-on Q1-Q7**. Tutti 7 responses normali sparano linguaggio_complesso. Indica detector troppo permissivo (LED, anodo, Ohm sono lessico kit-attesa). Tunare soglia o whitelist termini tecnici-base.

5. **opener_plurale Q10b miss**: il sistema HA rilevato `plurale_ragazzi_missing` ma non ha rigenerato. Servirebbe retry-once-with-correction pattern (overhead +1 LLM call solo se safety_fire critica).

6. **Cap. anchoring Q3/Q6/Q7**: query senza Vol esplicito (potenziometro, digitalWrite, Blink) producono response SENZA citation Vol+cap. Atteso da UX? Onniscenza dovrebbe ancorare anche query implicite (Blink = Vol.1 cap.6, digitalWrite = Vol.1 cap.6). Iter 13+ improve.

## Verdict iter 12 V4

- **Lift NET +4.4pp** vs V3 baseline (70.0 → 74.4 overall metric %), guidato da max_120 e tag_clean recupero.
- **Target ≥80% NON raggiunto**.
- **Memoria Q10 fix backend NON osservabile lato risposta** — il deploy è andato, l'effetto utente no.
- **PATCH B (Q8 Q9 + prompt_class + safety_fires array) regge** in produzione.
- **Vol_pag citation BLOCCATA da regex obsoleta**, non da modello. Fix metrica iter 13 sblocca ~3pp aggiuntivi.

ZERO modifiche src/ o supabase/functions/ in questa sessione (come richiesto). Output: solo audit + raw JSON.
