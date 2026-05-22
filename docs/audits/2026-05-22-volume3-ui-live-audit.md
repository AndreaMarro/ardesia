# Volume 3 UI Live Audit — PR #142

Data: 2026-05-22
Branch: `feature/volume-3-experiment-overhaul`
Target locale verificato: `http://127.0.0.1:5178/#lavagna?exp=<experimentId>`

## Metodo

Per ciascuno dei 23 esperimenti Volume 3 ho aperto la Lavagna con deep-link reale:

- attesa di `window.__ELAB_API.getCurrentExperiment().id === <experimentId>`;
- verifica titolo esperimento visibile nella UI;
- verifica modalita `Passo Passo`, bottone `Avanti` e pulsante `Home`;
- click reale su `Avanti`;
- verifica comparsa del primo passo operativo;
- verifica runtime: componenti, `buildSteps` e codice Arduino presenti.

## Esito

Totale: 23/23 passati.

| Esperimento | Esito |
| --- | --- |
| `v3-cap5-esp1` — Blink: il primo programma | OK |
| `v3-cap5-esp2` — Modificare il delay del Blink | OK |
| `v3-cap6-esp1` — Circuiti logici AND e OR | OK |
| `v3-cap6-esp2` — Accendere un LED esterno sul pin 13 | OK |
| `v3-cap6-esp3` — Cambiare il pin del LED esterno | OK |
| `v3-cap6-esp4` — Due LED che si alternano | OK |
| `v3-cap6-esp5` — Costruiamo un semaforo | OK |
| `v3-cap6-esp6` — Leggere un pulsante con digitalRead | OK |
| `v3-cap6-esp7` — Una variabile ricorda lo stato del LED | OK |
| `v3-cap6-esp8` — Evitare il lampeggio con while | OK |
| `v3-cap7-esp1` — Trimmer: accendere il LED sopra 2,5 V | OK |
| `v3-cap7-esp2` — Convertire la lettura analogica in Volt | OK |
| `v3-cap7-esp3` — Tre LED indicano la posizione del trimmer | OK |
| `v3-cap7-esp4` — Aumentare la luminosita con analogWrite | OK |
| `v3-cap7-esp5` — Effetto respiro con due cicli for | OK |
| `v3-cap7-esp6` — Il trimmer controlla la luminosita del LED | OK |
| `v3-cap7-esp7` — Generare una tensione analogica sul pin A0 | OK |
| `v3-cap8-esp1` — Arduino saluta il computer | OK |
| `v3-cap8-esp2` — Messaggio ripetuto nel loop | OK |
| `v3-cap8-esp3` — Stampare analogRead sul Monitor Seriale | OK |
| `v3-cap8-esp4` — Due trimmer sul Serial Plotter | OK |
| `v3-cap8-esp5` — Trimmer, tre LED e valori seriali | OK |
| `v3-cap8-esp6` — Barra progressiva LED | OK |

## Comandi Verifica

```bash
npx vitest run tests/unit/volume3CanonicalAlignment.test.js tests/unit/experimentDataIntegrity.test.js tests/unit/data/lesson-groups.test.js tests/unit/lessonPaths.test.js tests/unit/data/volume-references-validity.test.js
```

Esito: 407/407 test passati.

Audit Playwright locale: `SUMMARY total=23 passed=23 failed=0`.
