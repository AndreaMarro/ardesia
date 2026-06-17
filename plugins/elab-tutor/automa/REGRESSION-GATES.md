# Suite Test Anti-Regressione — Gate Obbligatori

**Data**: 24/03/2026

## Gate Pre-Commit (OGNI ciclo IMPROVE)

Ogni modifica al codice DEVE passare TUTTI questi gate prima di essere mantenuta (keep).
Se anche UN SOLO gate fallisce → ROLLBACK immediato.

### Gate 1: Build
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
```
**Criterio**: exit code 0. Se fallisce → ROLLBACK.

### Gate 2: Composite Non-Regression
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && python3 automa/evaluate.py
```
**Criterio**: composite_new >= composite_old - 0.01 (tolleranza 1%).
Se scende > 1% → ROLLBACK.

### Gate 3: Tag Accuracy Non-Regression
**Criterio**: galileo_tag_accuracy >= 0.85 (era 0.90 baseline).
Se scende sotto 0.85 → ROLLBACK. Questo protegge la funzionalità core.

### Gate 4: Identity Leak
**Criterio**: galileo_identity == 1.0.
Se appare QUALSIASI leak → ROLLBACK IMMEDIATO. Zero tolleranza.

### Gate 5: Content Integrity
**Criterio**: content_integrity == 1.0.
Se un esperimento sparisce → ROLLBACK. I contenuti sono sacri.

---

## Gate Pre-Deploy (prima di `npx vercel --prod`)

Tutti i gate pre-commit PLUS:

### Gate 6: iPad Compliance
**Criterio**: ipad_compliance score >= valore precedente.
Non deve peggiorare.

### Gate 7: Console Errors
**Criterio**: console_errors score >= 0.8.
Max 1 errore tollerato temporaneamente.

### Gate 8: Nanobot Health
```bash
curl -s --max-time 10 https://elab-galileo.onrender.com/health | python3 -c "import json,sys; d=json.load(sys.stdin); assert d['status']=='ok'"
```
**Criterio**: status=ok. Se nanobot è giù → NON deployare (il sito dipende da esso).

---

## Gate Pre-Promozione (prima di dichiarare "task completato")

Tutti i gate pre-deploy PLUS:

### Gate 9: Evidenza Specifica
Il task DEVE avere evidenza verificabile del completamento.
Non basta "ho modificato il file". Serve: "evaluate.py mostra score X, era Y".

### Gate 10: Nessuna Nuova Regressione
Confronto point-by-point di TUTTE le metriche last-eval.json.
Se QUALSIASI metrica scende > 5% → HOLD (non promote, non rollback — indaga).

---

## Implementazione nel Loop

L'orchestrator.py DEVE:
1. Salvare last-eval.json PRIMA di ogni ciclo IMPROVE
2. Rieseguire evaluate.py DOPO ogni modifica
3. Confrontare automaticamente
4. Se gate fallisce: `git checkout -- .` e log "ROLLBACK: gate X failed"
5. Se tutti i gate passano: `git add . && git commit`

## Tolleranze

| Metrica | Tolleranza regressione |
|---------|----------------------|
| composite | -0.01 (1%) |
| tag_accuracy | -0.05 (5%) |
| identity | 0 (ZERO) |
| content_integrity | 0 (ZERO) |
| gulpease | -0.05 |
| ipad_compliance | 0 (non peggiorare) |
| build_pass | 0 (deve passare) |
| console_errors | -0.1 |
| lighthouse | -0.05 |
| latency | -0.1 (può oscillare) |
