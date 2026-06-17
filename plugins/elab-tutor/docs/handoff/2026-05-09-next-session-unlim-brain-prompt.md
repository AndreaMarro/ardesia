# Prompt ragionato sessione successiva - UNLIM Brain

Usa questo prompt per la prossima sessione operativa:

```txt
Lavora come sessione operativa ELAB post Volume 3 UNLIM Brain.

Contesto obbligatorio da leggere prima di agire:
- docs/CoV/2026-05-09-volume-3-unlim-brain-cov.md
- docs/audits/2026-05-08-unlim-execution-ux/quality-audit.md
- docs/architectures/2026-05-09-unlim-parallel-agent-architecture.md
- docs/superpowers/plans/2026-05-08-unlim-project-stabilization-progressive-gates.md

Regola primaria:
- Non compiacere. Non dichiarare PASS senza prova.
- Niente production deploy prima di CoV + quality audit + approvazione esplicita, salvo istruzione gia' confermata nel thread corrente.
- Hardware reale (iPad Safari fisico, Apple Pencil, microfono, TTS udibile, wake word reale) NON e' PASS senza prova hardware/log reale.

Stato reale da cui partire:
- Production deploy attuale: dpl_6TdCyKB65L6V9bCFLix7JjQGq8fQ.
- Alias: https://www.elabtutor.school.
- Smoke post-deploy: docs/audits/2026-05-08-unlim-execution-ux/playwright-production-unlim-100-operational-after-brain-deploy.json, PASS 120/120.
- Supabase Edge unlim-chat deploy eseguito su euqpdueopmlllqjmqnyb.

Fatti documentati:
- UNLIM non e' ancora un agente pienamente consapevole: oggi e' un orchestratore ibrido migliorato.
- Prompt aggiornato con rami paralleli, risposta originale, Pixtral come ramo vision, Scratch/Arduino come tool.
- bookCitation non appende piu' citazioni a risposte operative.
- Confetti/musichette automatiche disattivate.
- Galileo Nanobot e' stato esaminato: recuperare policy action-first/specialisti/router JSON, non ripristinare FastAPI in blocco.

Task successivo consigliato, severo:
1. Implementa Shared State Store caldo:
   - snapshot 15s;
   - snapshot immediato su eventi: componente spostato, filo aggiunto, cambio editor, codice modificato, compile/play, report/manuale;
   - stato disponibile prima della domanda UNLIM.
2. Introduci `AgentDecision` JSON:
   - reply | act | diagnose | vision | rag | clarify;
   - rami diagnosis/rag/memory/vision-needed in parallelo, non a catena.
3. Converti almeno una famiglia di tag legacy in tool verificabile:
   - Arduino: setcode -> compile -> verify output;
   - Scratch: loadScratchWorkspace -> verify workspace visible;
   - Circuito: add/move/wire -> verify state.
4. Migliora qualità risposta:
   - max circa 300 parole quando serve;
   - niente citazioni obbligatorie se domanda operativa;
   - deve rispondere alla modifica reale del circuito/codice, non genericamente.
5. Test Playwright difficili:
   - sposta componenti in un circuito e chiedi vagamente "perche' e' cambiato?";
   - modifica codice Arduino e chiedi "perche' non va?";
   - carica blocchi Scratch e chiedi una modifica;
   - verifica che UNLIM apra solo con Percorso o icona/mascot;
   - verifica niente confetti/audio automatici;
   - verifica niente `[object Object]`, niente white screen riepilogo, niente overflow iPad.

Skill/plugin da usare:
- superpowers:systematic-debugging per root cause.
- superpowers:test-driven-development per ogni bugfix/comportamento.
- build-web-apps:frontend-testing-debugging + Playwright per UI/prod smoke.
- superpowers:verification-before-completion prima di ogni claim finale.
- Vercel plugin/CLI solo dopo gate.
- Supabase plugin/CLI per Edge Functions e log.
- GitHub plugin/CLI se serve confronto repository o branch/review.

Output obbligatorio:
- Nuovo CoV in docs/CoV/.
- Nuovo quality audit in docs/audits/.
- Artefatti Playwright JSON + screenshot.
- Debug note se trovi bug non risolti.
```

