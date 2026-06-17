# UNLIM Definitivo Debug — Iter 41 Sprint U Cycle 2

**Data**: 2026-05-12 PM (Andrea mandate "RISOLVI DEFINITIVAMENTE")
**Methodology**: get-shit-done + Claude+Codex parallel + retroazione
**Owner Claude**: real-user UX + Edge Function deploys + connettori test
**Owner Codex**: corpus codemod (lesson-paths/teacher_messages/unlimPrompts) + RAG sync

## Work shipped iter 41 (verified prod LIVE)

### Commit lineage

```
0151a40b fix(iter-41): MAX_MESSAGE_LENGTH 2000→16000 — root cause 400
4149d05e fix(iter-41): pre-LLM color change INTENT — setComponentValue
d8475595 fix(iter-41): gate searchKnowledgeBase fallback OFF
e757540c fix(iter-41-sprint-u-cycle-2): L2 templates gated + rewriter +12
```

### Bugs RISOLTI verified curl prod Edge v54

| Query | Pre-fix | Post-fix |
|-------|---------|----------|
| `metti il led verde` | LLM `addcomponent` ricostruisce circuito | `setComponentValue led1 color green` |
| `perche il LED si chiama diodo?` | HTTP 400 "Message too long" | "Ragazzi, ...diodo che emette luce..." 2.6s |
| Frontend any chat | 401 stale Vercel env vxv→euq | 200 Vertex Paris |
| Singolare imperative | "metti, fai, clicca, ricorda" | plurale rewriter +12 patterns |
| `searchKnowledgeBase` canned | "Il LED è una lucina speciale" stale | Gated OFF, Edge sole source |

### Andrea screenshot bugs (pre-fix stale cache evidence)

Screenshot 2026-05-12 PM mostra:
- "cosa vuol dire collegamento in corto circuito" → "Ragazzi, bella domanda di cultura generale!" (BUG)
- "portami al volume 2" → stesso template redirect

**Live test post-fix curl Edge v54**:
```
Q: "cosa vuol dire collegamento in corto circuito"
→ source: vertex-gemini-2.5-flash-lite, category: default
→ "Ragazzi, un corto circuito è quando la corrente elettrica trova un
   percorso più facile e veloce del previsto, saltando i componenti..."

Q: "portami al volume 2"
→ source: vertex-gemini-2.5-flash-lite, category: citation_vol_pag
→ "Ragazzi, il volume 2 approfondisce le misure elettroniche..."

Q: "che cose la legge di Ohm" → corretto with Vol.1 pag.27
Q: "perche il LED si spegne" → corretto diagnosi
```

**4/4 PASS post-fix**. Screenshot Andrea = stale PWA cache (bundle pre-fix).

## Bug residui da risolvere (Sprint U Cycle 2)

### P0.1 Volume navigation INTENT mancante

`portami al volume 2` dovrebbe dispatch INTENT navigazione, NON spiegazione.
Manca tool `openVolume(n)` o `setActiveVolume(n)` in simulator-api.
Action: aggiungi tool + pre-LLM detector regex.

### P0.2 PWA cache invalidation forzata

`registerType: 'autoUpdate'` + `controllerchange` listener (main.jsx:50) attivi
ma Andrea screenshot mostra stale bundle. Need:
- Bump SW version manualmente (`__BUILD_SHA__` query string)
- Force `skipWaiting()` + `clientsClaim()` per attivazione immediata
- Toast "Aggiornamento disponibile" plurale "Ragazzi, c'è una nuova versione"

### P0.3 Singolare codemod corpus

Sprint U Cycle 1 audit findings:
- 73/94 lesson-paths con singolare imperative ("Premi Play" ×50, "fai/clicca")
- 91/94 teacher_messages senza "Ragazzi," opener
- 94/94 unlimPrompts framing "studente" invece di "docente"

Codex job: batch codemod tutti i file + verifica plurale rewriter test (63/63 PASS).

### P0.4 Lesson-paths missing reali

Mac Mini D3 audit iter 36: 5 lesson-paths reali non in src/data/lesson-paths/.
Codex job: identifica + crea JSON files.

### P0.5 Test matrix exhaustive 50+ query types

Categorie:
1. Off-topic: sport/cucina/storia/musica/politica (10)
2. On-topic concept: legge Ohm, diodo, transistor, RGB, MOSFET (10)
3. Action commands: play/pause/compile/screenshot/highlight (10)
4. Modify components: colore/valore/posizione (5)
5. Navigation: volume/capitolo/esperimento (5)
6. Diagnose: "perché non si accende" + circuit state (5)
7. Vision request: "guarda il mio circuito" (3)
8. Voice wake: "Ehi UNLIM" + comando (2)

Owner: Claude via Chrome MCP + connettori real-user simulation.
Pass criteria: plurale ✓ Vol/pag ✓ kit ✓ INTENT canonical ✓ no off-topic
redirect su query ON-TOPIC.

## Parallel workflow Claude + Codex

### Claude streams (this session)

- A. Volume nav INTENT detector + Edge redeploy v55
- B. PWA force cache bump + Vercel rebuild
- C. Test matrix exhaustive via Chrome MCP fetch interceptor
- D. Watch Codex output retroazione corrections

### Codex streams (spawn `codex exec`)

- E. Singolare codemod 73 lesson-paths regex batch
- F. teacher_messages add "Ragazzi," opener 91 entries
- G. unlimPrompts framing studente→docente 94 entries
- H. 5 missing lesson-paths reali generation

Retroazione: Codex emits JSON delta per file → Claude verifica + commit + curl
test Edge che corpus changes reflect properly.

## Test matrix categorie

```
CATEGORIA          | COUNT | EXPECTED
-------------------+-------+--------------------------------------
off-topic-sport    | 3     | offtopic-pre-llm redirect plurale
off-topic-cucina   | 2     | offtopic-pre-llm redirect cucina ack
off-topic-storia   | 2     | offtopic-pre-llm redirect cultura
on-topic-concept   | 10    | Vertex/Mistral Vol/pag + plurale
on-topic-diagnose  | 5     | Vertex circuit-aware + INTENT
action-modify      | 5     | direct-operational INTENT pre-LLM
action-nav         | 5     | direct-operational mountExperiment
action-control     | 5     | AZIONE:play/pause/compile
vision-request     | 3     | triggers_vision_chain true + Pixtral
ambiguous          | 5     | clarify intent (challenge)
TOTAL              | 45    |
```

## Risk caveats G45

- Edge Function deploy senza migration not blocking
- PWA cache invalidation requires Vercel rebuild + bundle hash change
- Codex parallel may diverge corpus; reconcile via git diff hourly
- Mistral 70% / Vertex 20% / Together 10% routing — bench post-corpus update
- NO claim "definitivo" senza 45/45 test matrix PASS verified live

## Exit criteria

- [ ] 45/45 test matrix PASS prod live Chrome MCP
- [ ] Andrea force-reload conferma bundle aggiornato visibile
- [ ] PWA SW activation toast plurale shown
- [ ] Codex codemod 258 entries committed + push
- [ ] R5 50-prompt bench post-corpus ≥90% PZ V3
- [ ] No singolare violation rewriter 63/63 PASS preserved
- [ ] git log clean, no `--no-verify` pre-push hook bypassed
