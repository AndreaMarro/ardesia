# Volume 2 UI Live Audit — PR #141

Data: 2026-05-22
Branch: `feature/volume-2-experiment-overhaul`
Target locale verificato: `http://127.0.0.1:5177/#lavagna?exp=<experimentId>`

## Metodo

Per ciascuno dei 27 esperimenti Volume 2 ho aperto la Lavagna con deep-link reale, senza selezionare l'esperimento dal picker dopo il load:

- attesa di `window.__ELAB_API.getCurrentExperiment().id === <experimentId>`;
- verifica titolo esperimento visibile nella UI;
- verifica modalita `Passo Passo`, bottone `Avanti` e pulsante `Home`;
- click reale su `Avanti`;
- verifica comparsa del primo passo operativo;
- verifica runtime: componenti e `buildSteps` presenti.

Durante il primo giro il picker esperimenti si apriva sopra il deep-link e bloccava `Avanti`: corretto nello stesso branch con `LavagnaShell.jsx`, coperto da `LavagnaShell-deeplink-state.test.jsx`.

## Esito

Totale: 27/27 passati.

| Esperimento | Esito |
| --- | --- |
| `v2-cap3-esp1` — Cap. 3 Esp. 1 - Controlliamo la carica della batteria | OK |
| `v2-cap3-esp2` — Cap. 3 Esp. 2 - Diario di misurazione della pila | OK |
| `v2-cap3-esp3` — Cap. 3 Esp. 3 - Misuriamo una resistenza | OK |
| `v2-cap3-esp4` — Cap. 3 Esp. 4 - Misuriamo la corrente in un circuito | OK |
| `v2-cap4-esp1` — Cap. 4 Esp. 1 - Due resistori in parallelo | OK |
| `v2-cap4-esp2` — Cap. 4 Esp. 2 - Tre resistori in serie | OK |
| `v2-cap4-esp3` — Cap. 4 Esp. 3 - Partitore di tensione | OK |
| `v2-cap5-esp1` — Cap. 5 Esp. 1 - Batterie AA/AAA in serie (piu spinta!) | OK |
| `v2-cap5-esp2` — Cap. 5 Esp. 2 - Batterie AA/AAA in antiserie | OK |
| `v2-cap6-esp1` — Cap. 6 Esp. 1 - LED in serie con 1 resistore | OK |
| `v2-cap6-esp2` — Cap. 6 Esp. 2 - LED in serie colori diversi | OK |
| `v2-cap6-esp3` — Cap. 6 Esp. 3 - Tre LED in serie | OK |
| `v2-cap6-esp4` — Cap. 6 Esp. 4 - Misurare Vf con multimetro | OK |
| `v2-cap7-esp1` — Cap. 7 Esp. 1 - Scarica condensatore + multimetro | OK |
| `v2-cap7-esp2` — Cap. 7 Esp. 2 - Scarica con LED rosso | OK |
| `v2-cap7-esp3` — Cap. 7 Esp. 3 - Condensatori in parallelo | OK |
| `v2-cap7-esp4` — Cap. 7 Esp. 4 - Variare R nella scarica RC | OK |
| `v2-cap8-esp1` — Cap. 8 Esp. 1 - MOSFET come interruttore | OK |
| `v2-cap8-esp2` — Cap. 8 Esp. 2 - MOSFET e carica del corpo | OK |
| `v2-cap8-esp3` — Cap. 8 Esp. 3 - MOSFET: l'interruttore magico | OK |
| `v2-cap9-esp1` — Cap. 9 Esp. 1 - Fototransistor come sensore | OK |
| `v2-cap9-esp2` — Cap. 9 Esp. 2 - Luce notturna automatica | OK |
| `v2-cap10-esp1` — Cap. 10 Esp. 1 - Far girare il motore | OK |
| `v2-cap10-esp2` — Cap. 10 Esp. 2 - Invertire la rotazione | OK |
| `v2-cap10-esp3` — Cap. 10 Esp. 3 - Motore con pulsante | OK |
| `v2-cap10-esp4` — Cap. 10 Esp. 4 - Motore + pulsante + LED indicatore | OK |
| `v2-cap12-esp1` — Cap. 12 - Robot Segui Luce | OK |

## Comandi Verifica

```bash
npx vitest run tests/unit/components/lavagna/LavagnaShell-deeplink-state.test.jsx tests/unit/components/lavagna/LavagnaShell-modalita.test.jsx tests/unit/data/volume2-overhaul.test.js
```

Esito: 21 test passati, 1 todo preesistente.

Audit Playwright locale: `SUMMARY total=27 passed=27 failed=0`.
