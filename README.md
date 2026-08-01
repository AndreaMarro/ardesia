# ARDESIA

La **visione ratificata** definisce ARDESIA come un ambiente spaziale,
persistente e componibile nel quale persone che apprendono, insegnano,
progettano o ricercano possono lavorare senza frammentare il contesto fra
applicazioni separate. Questa e' la destinazione, non un claim sullo stato
implementato.

Il centro del prodotto e' un canvas abitato da **oggetti vivi**: scrittura,
fonti, libri, simulazioni, grafici, codice, quiz e materiali. Ogni oggetto ha
identita', stato e collegamenti; puo' passare fra forma compatta, intermedia ed
espansa senza perdere posizione o contenuto. LessonOS conserva eventi e
derivazioni, cosi' una sessione puo' essere chiusa, riaperta e trasformata in
un artefatto riutilizzabile con provenance e approvazione umana.

## Direzione ratificata

- **native-first e store-ready:** iPad e macOS per primi, Android in seguito;
- **per tutti:** il docente e la lezione sono casi d'uso, non il confine del
  prodotto;
- **Core → Plugin → Pack → Workflow:** strumenti generali, contenuti e
  verticali si compongono senza duplicare il runtime;
- **ELAB come primo verticale:** valida simulazione, mondo fisico e qualita'
  pedagogica, ma non definisce ARDESIA;
- **AI consultiva:** ogni trasformazione deve essere draft → preview → commit,
  con fonti e controllo dell'utente; nessun provider diventa il Core.

La fonte di prodotto ratificata e il piano di esecuzione vivono nel repository
canonico [`ardesia-knowledge`](https://github.com/AndreaMarro/ardesia-knowledge/tree/sync/current):

- [visione ARDESIA](https://github.com/AndreaMarro/ardesia-knowledge/blob/sync/current/20-Sources/2026-07-31-VISIONE-ARDESIA-E-FORMA-VISIVA.md)
- [piano grande v2](https://github.com/AndreaMarro/ardesia-knowledge/blob/sync/current/10-Requirements/2026-07-31-PIANO-GRANDE-DEFINITO-E-VARIABILE.md)

## Stato reale del repository

Alla base verificata `4218bc2e98774cbc7efa100223c913e7444e715b`, `main`
contiene un prototipo web TypeScript/React e primitive di dominio importanti.
**Non contiene ancora un'app nativa, file Swift/Kotlin o una release store.**
Il web non viene buttato, ma cambia ruolo: e' sorgente di contratti,
fixture, dati, algoritmi e oracoli comportamentali; non e' piu' la shell finale.

Lo stato vivo non si copia nel README. Si rigenera con:

```bash
python3 bin/state/project_state.py
```

La prima unita' evidence-only e'
[NATIVE-SPATIAL-CORE-SPIKE](docs/product/NATIVE-SPATIAL-CORE-SPIKE.md).

## Cosa trasferire e cosa ricostruire

| Trasferire con test di conformita' | Ricostruire nativamente |
|---|---|
| Event Envelope e replay LessonOS | canvas, penna e arbitraggio dei gesti |
| formato `.lesson`, import/export e vettori di digest | shell iPad/macOS e gestione documenti |
| contratti PluginInstance/ToolHost/capability | proiezione visiva dei post-it vivi |
| solver, scene, netlist e fixture ELAB | persistenza nativa e lifecycle dell'app |
| provenance, student pack e test di comportamento | accessibilita', finestre e input per piattaforma |

## Layout attuale

| Path | Ruolo corrente |
|---|---|
| `packages/engine/` | motore e contratti Python |
| `apps/studio/` | prototipo web e ToolHost corrente |
| `plugins/elab-tutor/` | verticale ELAB in decoupling |
| `ops/tools/` | fabbrica e controlli, non prodotto spedito |
| `docs/` | specifiche, governance e fonti storiche |

## Guardrail

- mai push diretto o auto-merge su `main`;
- local-first, nessun PII/corpus reale/segreto nel repo o in CI;
- nessun dato finto presentato come comportamento reale;
- persistenza additive e migrate-safe; replay deterministico;
- non indebolire gate o test per ottenere un verde;
- il conflitto fra l'invariante storico `ZERO-LLM in prodotto` e i nuovi
  workflow AI/provider resta un gate di governance esplicito: non si risolve
  silenziosamente in una PR di documentazione;
- il modello commerciale storico resta da riconciliare separatamente con la
  distribuzione store-first; questo riallineamento non lo modifica.

Per la topologia storica del monorepo: [`docs/vault/ARDESIA-MAP.md`](docs/vault/ARDESIA-MAP.md).
