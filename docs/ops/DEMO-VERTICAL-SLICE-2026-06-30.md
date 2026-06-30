# ARDESIA — demo vertical slice

Data: 2026-06-30
Branch: `demo/vertical-slice`
Stato: piano eseguibile, nessun deploy fatto in questa PR

## Decisione iniziale

Demo primaria candidata: `AndreaMarro/ardesia-lavagna`.

Motivo: e' il prototipo piu' vicino a una superficie toccabile: lavagna, canvas, plugin, lezioni, Vite, configurazione Vercel.

## Obiettivo demo

Mostrare ARDESIA come piattaforma, non ELAB standalone.

Percorso minimo:

```text
apri lavagna -> aggiungi plugin/tool -> interagisci -> esporta lezione -> importa/riapri
```

Percorso preferito:

```text
apri lavagna -> monta plugin simulatore -> blink/circuito -> salva stato -> export/import
```

## Criteri di accettazione

1. build passa;
2. URL deploy accessibile;
3. nessun segreto nel bundle;
4. browser check documentato;
5. README demo descrive cosa e' reale e cosa e' mock;
6. demo non dichiara marketplace completo;
7. demo non dichiara ELAB decoupled se non lo e';
8. commit deploy registrato in `docs/ops/VERCEL-MAP.md`.

## Passi operativi per Codex sul Mac

1. Verificare repository `ardesia-lavagna`:
   - branch;
   - package manager;
   - build;
   - test/typecheck se disponibili;
   - contenuti demo gia' presenti.

2. Verificare Vercel:
   - progetti collegati;
   - ultimo deploy;
   - branch collegata;
   - URL accessibile;
   - accesso pubblico/gated/rotto.

3. Preparare demo:
   - non rifare architettura;
   - usare cio' che gia' esiste;
   - aggiungere solo README demo e, se necessario, piccoli fix di build;
   - evitare dati reali o segreti;
   - evitare dipendenze nuove se non indispensabili.

4. Aggiornare documentazione:
   - `docs/ops/VERCEL-MAP.md` con URL, commit e stato;
   - README demo nel repo candidato;
   - note su limitazioni.

## Non fare in questa fase

- non migrare tutto il codice nel monorepo;
- non cancellare repo storici;
- non archiviare deploy;
- non promettere marketplace;
- non presentare ELAB standalone come Ardesia;
- non fare deploy production irreversibile senza conferma.

## Chain of verification attesa

Ogni output finale deve indicare:

- commit testato;
- comandi eseguiti;
- build pass/fail;
- URL deploy;
- browser check;
- cosa funziona;
- cosa manca;
- rollback.
