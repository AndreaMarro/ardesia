# ELAB Learned Lessons — Errori da NON Ripetere

> Questo file e' letto da OGNI sessione autonoma.
> Se hai fatto un errore, scrivilo qui per evitare che venga ripetuto.
> Formato: data, tentativo, risultato, motivo, regola.

---

[2026-04-06] TENTATO: Auto-scoring delle sessioni senza metriche esterne
  RISULTATO: Score inflato di 1.5-3 punti (self-score 8.6 vs reale 5.8)
  MOTIVO: L'agente valuta il proprio lavoro con ottimismo
  REGOLA: MAI auto-scoring. Solo evaluate-v3.sh determina lo score.

[2026-04-06] TENTATO: Orchestrator Python daemon (orchestrator.py) per loop continuo
  RISULTATO: Crash ogni 30 minuti per 37 ore, zero lavoro prodotto
  MOTIVO: Check Playwright hangava, heartbeat non aggiornato, UnboundLocalError
  REGOLA: Sessioni CORTE e INDIPENDENTI (cron/scheduled tasks), mai daemon long-running.

[2026-04-06] TENTATO: 25 iterazioni in una sessione (Ralph Loop v6)
  RISULTATO: Funziona MA con context degradation nelle ultime iterazioni
  MOTIVO: Dopo ~35 min / 20 step, ~2% accuracy degradation per step
  REGOLA: MAX 4 cicli per sessione, MAX 60 minuti. Poi FERMA e ricomincia fresco.

[2026-03-31] TENTATO: opacity CSS per fixare contrast ratio
  RISULTATO: Ha rotto hover state e transizioni
  MOTIVO: opacity influenza tutti i figli, non solo il colore
  REGOLA: Per contrast fix usare SOLO background-color e color, mai opacity/filter.

---

## ERRORI SESSIONE 09/04/2026 — I PIU' GRAVI

[2026-04-09] ERRORE GRAVE: Pushato 36+ commit su main senza verificare CI remoto
  RISULTATO: OGNI commit genero' CI failure + email errore ad Andrea
  MOTIVO: Quality gate locale passava, GitHub Actions falliva (lightningcss Linux binary)
  REGOLA: PRIMA di dichiarare "quality gate PASS", eseguire `gh run list --limit 1`.
  FIX CI: `rm -rf node_modules package-lock.json && npm install` in workflow.

[2026-04-09] ERRORE: Dichiarato "score 95, 4.7/5" mentre CI era rotto su OGNI commit
  RISULTATO: Report inflati, auto-celebrazione senza verificare realta'
  REGOLA: MAI dichiarare quality gate senza CI remoto verde.

[2026-04-09] ERRORE: Push diretto su main 36+ volte (viola CLAUDE.md)
  RISULTATO: Nessun branch protection, nessuna review
  REGOLA: Anche in autonomia, usare branch + PR. Il CI verifica prima del merge.
