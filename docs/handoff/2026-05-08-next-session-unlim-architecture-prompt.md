# Prompt Ragionato - Prossima Sessione UNLIM

```txt
Lavora come sessione operativa ELAB post-fix-forward 2026-05-08 + ripresa 2026-05-09 00:40 Europe/Rome.

Regola assoluta: niente deploy production senza CoV, quality audit, smoke production desktop+iPad e approvazione esplicita.

Contesto verificato:
- CoV: docs/CoV/2026-05-08-unlim-execution-ux-cov.md
- Audit: docs/audits/2026-05-08-unlim-execution-ux/quality-audit.md
- Playwright operativo nuovo: docs/audits/2026-05-08-unlim-execution-ux/playwright-unlim-100-operational.json (120/120 PASS)
- Playwright production nuovo: docs/audits/2026-05-08-unlim-execution-ux/playwright-production-unlim-100-operational.json (120/120 PASS)
- Edge smoke nuovo: docs/audits/2026-05-08-unlim-execution-ux/edge-unlim-chat-operational-smoke.json
- Smoke local: docs/audits/2026-05-08-unlim-execution-ux/playwright-local-smoke.json
- Debug note: docs/debug/2026-05-08-unlim-execution-ux-debug.md

Usa skills/plugin:
- superpowers:systematic-debugging per ogni bug/root cause.
- superpowers:test-driven-development per fix non banali.
- build-web-apps:frontend-testing-debugging + Browser/Playwright per UI.
- superpowers:verification-before-completion prima di ogni claim.
- Vercel plugin/CLI per deploy/status.
- GitHub plugin/CLI solo se serve diff/branch/review.

Stato tecnico:
- Ripresa 2026-05-09:
  - Chat UNLIM compare solo da Percorso o icona/mascotte UNLIM nei test.
  - Copy attesa: ELABorando.
  - FloatingWindow applica id DOM `unlim-v3`.
  - Arduino bridge: `setEditorCode` aggiorna subito la ref letta da `getEditorCode`/compile.
  - `setEditorMode` e `loadScratchWorkspace` aggiornano subito la ref modalità.
  - Playwright `99-unlim-100-operational.spec.js` copre API, modalità, circuito, Arduino, Scratch, Percorso, copy, viewport.
  - Supabase Edge `unlim-chat` deployato.
  - Vercel production deployato: `dpl_G7LM3S8VZLtC714mW1L6ALWAT8wy`, alias `https://www.elabtutor.school`.
  - Production smoke Playwright: 120/120 PASS.
- UNLIM ora ha narrazione live ogni 15s da src/services/unlimContextCollector.js.
- LavagnaShell avvia startApplicationNarrativeLoop({ intervalMs: 15000, includeVisual: true }).
- collectFullContext include applicationNarrative compatta.
- analyzeImage preferisce unlim-vision/Pixtral quando richiesto.
- supabase/functions/unlim-vision/index.ts accetta provider='pixtral', ma va verificato/deployato lato Supabase prima di dichiarare Pixtral attivo in produzione.
- Follow-up latenza deployato in production:
  - deployment finale dpl_3VVmCS1Lf5H5VS5hwzn4NK35Zdxj;
  - alias https://www.elabtutor.school;
  - indicatore "UNLIM sta elaborando..." immediato con yield di un frame prima di screenshot/Pixtral;
  - API timeout hard cap 12s;
  - local health probe 300ms;
  - local text fallback 2.5s;
  - regression test tests/unit/unlimFastResponseBudget.test.js.
  - smoke docs/audits/2026-05-08-unlim-execution-ux/playwright-production-latency-smoke.json PASS 22/22.

P0 prossima sessione:
1. Cronologia: riprodurre "Riprendi" da HomePage e verificare restore della sessione vera, non solo card generica. Scrivere regression test.
2. Confetti: aprire esperimento nuovo e dimostrare che non compaiono finché completamento reale. Scrivere regression test.
3. Pixtral: verificare endpoint production unlim-vision con provider=pixtral e header/provider nel response. Se non deployato, deploy Supabase Edge solo con approvazione.
4. UNLIM actions level: test più difficile del precedente:
   - domanda con modifica componente recente,
   - citazione Vol./pag.,
   - diagnosi circuito,
   - Scratch loadblocks,
   - Arduino setcode/compile,
   - Fumetto/report,
   - verifica che non risponda generico.
5. Passo Passo semaforo Vol.3: aprire esperimento, Blocchi, Compila, Play. Verificare che non serva scrivere a UNLIM per far partire la simulazione.
6. Latenza reale: misurare P50/P95 delle risposte complete su production usando unlimLatencyLog e Playwright. La sessione attuale prova solo feedback immediato, non velocità reale del provider.

Non compiacere:
- Apple Pencil fisica, Safari/iPad reale, microfono reale, TTS udibile e wake word reale NON sono PASS senza prova hardware/log reale.
- Se production è rotta, fermati e proponi fix-forward o rollback.
```
