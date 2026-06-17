# Criteri di Promozione — Ogni Task

**Data**: 24/03/2026

## Le 4 Decisioni Possibili

| Decisione | Significato | Quando |
|-----------|-------------|--------|
| **PROMOTE** | Task completato, modifiche mantenute | TUTTI i gate passano + evidenza specifica |
| **HOLD** | Task parziale, serve altro lavoro | Qualche gate passa ma non tutti, o evidenza insufficiente |
| **ROLLBACK** | Task fallito, revert modifiche | Gate critico fallisce (build, identity, content) |
| **KILL** | Task abbandonato, non riprovare | Task impossibile o irrilevante dopo indagine |

Non esiste quinta opzione.

---

## Checklist Promozione (TUTTI devono essere ✅)

### Per task IMPROVE
- [ ] Build passa (`npm run build` exit 0)
- [ ] evaluate.py composite >= baseline - 0.01
- [ ] Nessuna metrica critica in regressione >5%
- [ ] identity_leak == 1.0 (zero leaks)
- [ ] content_integrity == 1.0
- [ ] Evidenza specifica documentata (log, screenshot, score)
- [ ] success_criteria del task YAML soddisfatti
- [ ] results.tsv aggiornato con commit hash e composite

### Per task RESEARCH
- [ ] Output salvato in knowledge/ con data e topic
- [ ] Almeno 1 finding concreto (non generico)
- [ ] Almeno 1 conseguenza: task YAML creato, o prompt modificato, o decisione documentata
- [ ] Se nessuna conseguenza: task è KILL, non PROMOTE
- [ ] results.tsv aggiornato

### Per task AUDIT
- [ ] Screenshot o log come evidenza
- [ ] Almeno 3 problemi documentati con severity
- [ ] Almeno 1 task YAML creato per fix
- [ ] Report salvato in knowledge/ o reports/
- [ ] results.tsv aggiornato

### Per task WRITE
- [ ] Articolo salvato in articles/
- [ ] Autore: Andrea Marro
- [ ] Linguaggio appropriato per target audience
- [ ] Almeno 1 reference a ELAB Tutor
- [ ] results.tsv aggiornato

### Per task EVOLVE
- [ ] Metriche evaluate.py riviste con motivazione
- [ ] PDR aggiornato se necessario
- [ ] state.json allineato a evaluate.py (NON score manuali)
- [ ] results.tsv aggiornato

---

## Anti-Pattern (MAI promuovere se)

1. "Ho migliorato" senza prima/dopo numerico
2. "Test passato" senza log del test
3. "Funziona meglio" senza metrica
4. "Ricerca completata" senza task YAML generato
5. Build non eseguita dopo modifica codice
6. evaluate.py non rieseguita dopo modifica
7. Composite sceso senza spiegazione
8. Task promosso con evidenza "DEBOLE" o "NESSUNA"

---

## Formato Promozione in results.tsv

```
{commit_hash}\t{composite}\t{mode}\t{status}\t{description}\ttokens={N}
```

Esempio:
```
abc1234	0.7500	IMPROVE	keep	Fix 13 iPad buttons — ipad_compliance 0.50→0.92	tokens=15000
```

status = keep | discard | rollback | kill
