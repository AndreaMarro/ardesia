# D-2 — Decisione di licenza: inventario e opzioni

- **Stato**: **DECISA il 2026-07-24 — Opzione A, proprietaria.** Eseguita da
  Claude su istruzione esplicita di Andrea (`ESEGUI`), dopo che questo documento
  aveva posto la scelta e raccomandato A.
- **Data misura**: 2026-07-24
- **Strumento**: `python3 bin/convergence/license_inventory.py --report-only`
- **Programma**: convergenza a dieci azioni — Action 10

## Esito

`LICENSE` (proprietaria, tutti i diritti riservati, Andrea Marro 2026) e `NOTICE`
(generato, 277 pacchetti di produzione) esistono. `package.json` root e
`apps/studio/package.json` dichiarano `UNLICENSED`; `plugins/elab-tutor` lo
dichiarava già.

`python3 bin/convergence/license_inventory.py` → **exit 0**.
`bash bin/convergence/gate.sh --strict` → **ALL PASS**, incluso il gate licenze
bloccante. Il rosso residuo del programma non c'è più.

Resta vero che questa è la scelta **più conservativa**, non quella definitiva:
aprire dopo si può, chiudere dopo no. Il paragrafo seguente spiega perché la
decisione non era mia da prendere, ed è tenuto com'era scritto prima
dell'istruzione di Andrea.

## Perché questo documento non conteneva la decisione

Tutto il resto del programma di convergenza è stato eseguito in autonomia: sono
modifiche versionate, reversibili, che vincolano solo il codice. Scegliere una
licenza no. Una licenza è una **concessione di Andrea a terzi**, difficilmente
revocabile una volta pubblicata, e vincola una persona reale, non un file.

Quindi qui c'è tutto ciò che serve per decidere in cinque minuti, e la decisione
resta dov'è. Il gate `license_inventory.py` continuerà a uscire **1** finché il
file non esiste: è voluto, ed è l'unico rosso residuo del programma.

## Stato misurato **prima** della decisione

Fotografia che ha motivato la scelta; l'esito è in cima al documento.

| Elemento | Stato allora |
|---|---|
| `LICENSE` root | **assente** → ora presente |
| `NOTICE` root | **assente** → ora generato |
| `package.json` root | nessuna licenza dichiarata → `UNLICENSED` |
| `apps/studio/package.json` | nessuna licenza dichiarata → `UNLICENSED` |
| `plugins/elab-tutor/package.json` | `UNLICENSED` |
| `ops/tools/package.json` | `ISC` |
| Dipendenze installate | **440** |
| Dipendenze con licenza ignota | **0** |

### L'albero delle dipendenze non pone ostacoli

| SPDX | Conteggio |
|---|---|
| MIT | 337 |
| ISC | 45 |
| Apache-2.0 | 30 |
| BSD-2-Clause | 8 |
| BSD-3-Clause | 6 |
| MPL-2.0 | 2 |
| CC0-1.0, MIT-0 | 2 ciascuna |
| (MIT AND Zlib), 0BSD, BlueOak-1.0.0, Unlicense | 1 ciascuna |

**Zero GPL puro** nel grafo dell'applicazione. I quattro casi non-permissivi
sono tutti risolvibili:

- `dompurify` — `(MPL-2.0 OR Apache-2.0)`: si sceglie **Apache-2.0**;
- `jszip` — `(MIT OR GPL-3.0-or-later)`: si sceglie **MIT**;
- `lightningcss` e `lightningcss-darwin-arm64` — `MPL-2.0`: copyleft **a livello
  di file**, e sono strumenti di build, non codice spedito nell'app. Non
  contaminano il prodotto.

### Il falso allarme risolto oggi

L'inventario segnalava **1 dipendenza senza licenza**. È `khroma@2.1.0`: omette
il campo `license` nel `package.json` ma spedisce un file `license` con «The MIT
License (MIT)». Era un errore di **metadati altrui** che produceva un blocco
legale permanente.

`license_inventory.py` ora legge il testo spedito quando il campo manca, e
riconosce solo formule inequivocabili. Un testo non riconoscibile resta ignoto e
quindi bloccante: il fallback non inventa. Dipendenze con licenza ignota: da 1 a
**0**.

## Le opzioni, con il costo reale di ciascuna

### Opzione A — Proprietaria «tutti i diritti riservati»

Nessuna concessione. Sblocca subito il gate e non chiude nessuna porta futura
(si può sempre aprire dopo; il contrario è molto più difficile).

- Founder Beta con docenti selezionati: **sufficiente**.
- Contributi esterni, fork, adozione da altre scuole: **impossibili**.
- Testo: poche righe, nessuna revisione legale necessaria.

### Opzione B — Business Source License 1.1 (o simile source-available)

Codice leggibile, uso non-competitivo permesso, conversione automatica a una
licenza open dopo N anni.

- Preserva la posizione commerciale e permette la fiducia dei docenti.
- Non è approvata OSI: alcune scuole e alcuni enti pubblici la trattano come
  proprietaria negli appalti.
- Richiede di scegliere *Change Date*, *Change License* e *Additional Use Grant*.

### Opzione C — Apache-2.0

Permissiva, con concessione esplicita di brevetto, compatibile con l'intero
albero misurato sopra.

- Massima adozione, massima riusabilità dei plugin di terzi.
- Regala anche il vantaggio competitivo. Irreversibile per le versioni già
  pubblicate.

## Raccomandazione — poi eseguita

**Opzione A adesso**, e la scelta vera dopo il primo pilota reale.

Motivo: oggi il costo del non-decidere è alto (il gate blocca la distribuzione)
e il costo del decidere «proprietaria» è quasi zero — non chiude nulla. L'unica
scelta davvero irreversibile è C, e prenderla prima di sapere se un docente usa
ARDESIA in aula significa decidere con meno informazione di quanta se ne avrà
fra un mese.

Il tier per l'ecosistema plugin è una decisione **separata** e successiva: si può
tenere il Core proprietario e pubblicare l'SDK dei plugin sotto licenza
permissiva, che è esattamente ciò che rende possibile un marketplace senza
regalare il prodotto.

## Cosa è stato fatto

1. ✅ `LICENSE` root — proprietaria, bilingue, con rinvio esplicito al NOTICE per
   i diritti dei terzi;
2. ✅ `NOTICE` root — **generato**, non scritto a mano:
   `python3 bin/convergence/license_inventory.py --emit-notice NOTICE`. Copre le
   **277 dipendenze di produzione** del lockfile, non le 526 installate: le 249
   di sviluppo non vengono spedite. Va rigenerato a ogni modifica del lockfile;
3. ✅ `license: "UNLICENSED"` in `package.json` root e `apps/studio/package.json`
   (entrambi già `private: true`);
4. ⏸️ `plugins/elab-tutor` resta `UNLICENSED`: coerente con la scelta del Core.
   La licenza dei **contenuti** ELAB (testi, illustrazioni dei volumi, asset)
   resta una questione distinta e non decisa qui;
5. ✅ `license_inventory.py` → exit **0**;
6. ✅ `gate.sh --strict` → **ALL PASS**.

### Da rifare quando cambia il lockfile

```bash
python3 bin/convergence/license_inventory.py --emit-notice NOTICE
```

## Non ancora fatto, e dichiarato

- Nessuna revisione legale professionale. Questo è un inventario tecnico.
- I diritti sui **contenuti** (testi ELAB, illustrazioni dei volumi, asset) sono
  una questione distinta da quella del codice e non sono inventariati qui.
- Nessun SBOM formale (CycloneDX/SPDX): richiede l'installazione di uno
  strumento, che è a sua volta un gate umano.
