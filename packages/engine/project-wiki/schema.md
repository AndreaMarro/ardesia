# project-wiki/ — Schema & Conventions

**Principio**: wiki viva del progetto (pattern Karpathy LLM-Wiki = automiglioramento). La wiki documenta il codice REALE con citazioni VERIFICATE.

## Regole

1. **1 concetto / 1 pagina** — granularità fine, facile da aggiornare.

2. **Ogni claim cita file:line VERI** — VINCOLO FERREO: ogni citazione deve esistere. Verificare con `grep`/`Read` prima di scrivere. NON inventare mai riferimenti.

3. **Mantieni index.md + log.md**:
   - `index.md` — elenco delle pagine con riassunto 1 riga per pagina.
   - `log.md` — append-only, 1 riga per modifica con timestamp.

4. **Se pagina contraddice codice, vince il codice** — la wiki documenta lo stato REALE, non quello ideale. Aggiorna la wiki quando il codice cambia.

5. **VERIFICARE le citazioni** — ogni file:line citato deve corrispondere al codice attuale. Mai citare da memoria/assunzione.

## Formato citazione

```
Pattern: file.py:line
Esempio: lessonos/models/entities.py:15-28 (EDGE_TYPES vocab)
```

## Manutenzione

- Quando aggiungi una nuova pagina: aggiorna `index.md` + aggiungi riga in `log.md`.
- Quando modifichi una pagina esistente: aggiungi riga in `log.md`.
- Quando il codice cambia: verifica le citazioni nelle pagine correlate e aggiorna se necessario.

## Anti-pattern da evitare

- ❌ Citare file:line senza verificare
- ❌ Documentare funzionalità non ancora implementate
- ❌ Parafrasare invece di citare direttamente
- ❌ Omettere gli update al log.md
- ❌ Documentare dettagli implementativi volatili (numeri di riga specifici per dettagli che cambiano spesso)
