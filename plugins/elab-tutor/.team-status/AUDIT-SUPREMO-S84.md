# AUDIT SUPREMO — Sessione S84
*Data: 2026-03-24 | Modello: Claude Opus 4.6 | Metodo: dry-run reale + 8 agenti + analisi manuale*

---

## VERDETTO: IL SISTEMA NON EVOLVE ANCORA.

Ha i pezzi. Non sono collegati. Ecco perche'.

---

## 1. PRESTAZIONI REALI (dry-run ciclo 42)

| Metrica | Valore | Giudizio |
|---------|--------|----------|
| Checks | 6/7 PASS | OK |
| Build | OK (34s) | OK |
| Galileo | 9/10 risposte | OK |
| Gulpease | avg 73, min 67 | OK (> target 60) |
| iPad | 13 bottoni piccoli | WARN |
| Composite score | 0.9114 | Alto ma non sappiamo se migliora |
| Tempo ciclo | 293s (4.9 min) | OK |
| Prompt generato | 16101 chars | Ragionevole |
| Task pending | 0 | CRITICO |
| Task failed | 14 | CRITICO |
| Task active (stuck) | 2 | PROBLEMA |

## 2. DISTRIBUZIONE LAVORO (24 cicli simulati)

| Mode | Cicli | % | Produce valore? |
|------|-------|---|-----------------|
| IMPROVE | 13 | 54% | Solo se ci sono task. Con pending=0, e' lavoro vago |
| RESEARCH | 7 | 29% | Findings disconnessi dal ciclo. Non diventano task |
| AUDIT | 2 | 8% | Potenzialmente utile ma solo 2x/giorno |
| EVOLVE | 1 | 4% | Troppo raro. Ogni 10 cicli = 1x in 10h |
| WRITE | 1 | 4% | Articoli. Valore marketing, non prodotto |

**Tasso di conversione stimato: 5-10% dei cicli produce valore reale.**

Per confronto, Karpathy autoresearch: ~30% keep rate con misura oggettiva.

## 3. GLI 8 PROBLEMI FONDAMENTALI

### P0-1: CODA VUOTA
- pending=0, failed=14, active=2 (stuck)
- 54% dei cicli (IMPROVE) non hanno niente da fare
- Il sistema gira a vuoto, pagando ~$18/giorno
- **FIX**: research deve generare task. I 14 failed devono essere ri-analizzati.

### P0-2: RICERCA DISCONNESSA
- Findings vanno in knowledge/*.md
- Il prompt mostra solo i NOMI dei file, non il contenuto
- L'agente dovrebbe fare `cat` ma non lo fa quasi mai
- **FIX**: iniettare gli ultimi 3 findings nel prompt, non solo nomi

### P0-3: SCORE SENZA TREND
- 0.9114 — alto. Ma sta migliorando, calando, o fermo?
- Nessuna aggregazione. Nessun confronto con il passato.
- L'agente vede un numero ma non un trend.
- **FIX**: nel prompt, mostrare score attuale + media ultimi 5 + direzione

### P0-4: TASK FAILED MAI ANALIZZATI
- 14 task in failed/. Perche' hanno fallito?
  - CSP error (infra, non fixabile dall'agente)
  - Classi simulate (dipendenza esterna pedagogy-sim.py)
  - Accessibility (fixabile ma mai ritentato)
  - Console errors (fixabile)
- Pattern: mix di task impossibili e task facili che non vengono ritentati
- **FIX**: self_exam deve analizzare i failed e ricodare quelli fixabili

### P1-5: LOOP SELF-EXAM APERTO
- 716 LOC sofisticate che generano regole
- Le regole sono testo nel prompt, non codice eseguito
- Nessuna verifica che le regole cambino il comportamento
- **FIX**: learned-rules.json con enforcement Python

### P1-6: KIMI PARALLELO NON PERSISTENTE
- V2 lo importa e lo chiama, ma il linter reversa V2 a V1
- Nella V1 il modulo e' dead code
- **FIX**: git commit per proteggere V2

### P1-7: FILE REVERT CRONICO
- Un processo esterno (Antigravity.app?) sovrascrive orchestrator.py
- Ogni modifica viene persa entro minuti
- La V2 esiste in orchestrator_v2.py (protetta)
- **FIX**: chiudere Antigravity o fare git commit

### P2-8: COSTO NON OTTIMIZZATO
- ~$18/giorno, 99% Claude Sonnet 4
- 13 cicli IMPROVE senza task = ~$10 sprecati
- **FIX**: Haiku per IMPROVE senza task, Sonnet solo per RESEARCH/AUDIT

## 4. CONFRONTO CON KARPATHY AUTORESEARCH

| Aspetto | Karpathy | ELAB |
|---------|----------|------|
| Metrica oggettiva | val_bpb (lower = better) | composite score (higher = better) |
| Keep/Discard | Automatico (val_bpb migliore?) | Nessuno (tutto e' "forse ok") |
| Esperimenti/notte | ~100 (12/h x 8h) | ~24 (1/h x 24h) |
| Keep rate | ~30% | Non misurabile (no keep/discard) |
| File modificabile | Solo train.py | Tutto tranne evaluate.py |
| Rollback | Automatico se peggiora | Nessuno |
| Costo/esperimento | ~$0.10 (GPU) | ~$0.75 (Claude API) |

**Il gap fondamentale**: Karpathy misura OGNI esperimento e scarta automaticamente quelli che peggiorano. ELAB non misura e non scarta. Tutto va avanti.

## 5. COSA SERVE PER EVOLVERE DAVVERO

### Livello 1: Chiudere i loop (effort: 4-8h)
1. Research genera task automaticamente (finding con severity>=medium -> YAML in pending/)
2. Score trend nel prompt (attuale + media 5 + direzione)
3. Failed task re-analysis (self_exam li categorizza: fixable/unfixable)

### Livello 2: Keep/Discard reale (effort: 8-16h)
4. Prima del ciclo: snapshot git hash + composite score
5. Dopo il ciclo: nuovo composite score
6. Se score cala: `git revert` automatico
7. Log in results.tsv: git_hash | score_before | score_after | keep/discard

### Livello 3: Evoluzione vera (effort: 20h+)
8. Skill marketplace: skill rated by success, top skill usate di piu'
9. Mode selection ML: non cycle%, ma regressione su "quale mode produce piu' keep"
10. Graphiti/Mem0 per memoria strutturata inter-ciclo

## 6. IL PROMPT E' BUONO?

L'Anatomy of a Prompt pattern e' implementato (7/7 su tutti i modi):
- Task: chiaro
- Context: 10 layer
- Reference: skill per mode
- Success Brief: presente
- Rules: 7 regole concrete
- CoV: obbligatoria
- Principio Zero: in cima

**Ma il prompt e' solo meta' del problema.** Il prompt dice COSA fare, ma:
- Non c'e' MISURA di se l'agente l'ha fatto
- Non c'e' ENFORCEMENT delle regole
- Non c'e' FEEDBACK dal risultato al prossimo ciclo

Il prompt piu' perfetto del mondo non serve se il loop e' aperto.

## 7. SCORE CARD FINALE

| Dimensione | Score | Motivazione |
|------------|-------|-------------|
| Prompt quality | 7/10 | Anatomy pattern completo, CoV, skill dispatch |
| Feedback loops | 2/10 | 2/5 parzialmente chiusi, 3/5 aperti |
| Evolution capability | 1/10 | No keep/discard, no trend, no rollback |
| Cost efficiency | 3/10 | $18/day con 90% lavoro vago |
| Research quality | 3/10 | Findings prodotti ma disconnessi |
| Self-improvement | 2/10 | Self-exam esiste ma non enforcement |
| Robustness | 6/10 | Sopravvive a crash, timeout, API down |
| Task management | 2/10 | 14 failed, 2 stuck, 0 pending |
| **Complessivo** | **3.2/10** | **Sistema sofisticato ma inefficace** |

## 8. LA FRASE CHE RIASSUME TUTTO

> "E' come avere un laboratorio di ricerca con microscopi, reagenti, e quaderni. Ma nessuno guarda mai i risultati degli esperimenti, e l'esperimento successivo non dipende dal precedente. Si produce tanto. Si impara poco."

---

*Audit Supremo S84 — 2026-03-24*
