# X7 — disposizione terminale CodeRabbit su `d5324a44`

/ Ciclo **X7** · base `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7` · head `d5324a44e5426da07fd7e0730dfd93bb3ee78062`
/ Comando: `coderabbit review --agent --committed --base-commit 36e6753c…`
/ CLI `0.7.0` · exit `0` · stderr **vuoto**
/ Evento terminale, **letto dal record `complete` del `.jsonl`, non citato a memoria**:
  `{"type":"complete","status":"review_completed","findings":39}`
/ Durata osservata: ~35 minuti (20:04→20:39 CEST). In X6 erano ~6 minuti, in Sessione 2 ~40.
  **La durata non è indicatore di completezza**: l'unico discriminante è l'evento terminale.

## Tracciabilità: `DEGRADED_TRACEABILITY`

La `0.7.0` con `--agent` non emette UUID. Chiave adottata: **`X7` + file + istruzione**.
Il `.jsonl` grezzo `x7-coderabbit-raw.jsonl` è la sola fonte riverificabile.

Conteggi riletti dai record, mai trascritti da una vista adiacente:

| ciclo | `findings` nel record `complete` |
|---|---:|
| X4 | 21 |
| X5 | 29 |
| X6 | 25 |
| **X7** | **39** |

Severità, contate sui record `type:"finding"` (39 record, coincidenti col totale):

| severità | n |
|---|---:|
| critical | 1 |
| major | 25 |
| minor | 6 |
| trivial | 7 |

## ⚠️ Limite di questo ciclo, dichiarato

**39 finding non sono stati classificati uno per uno.** La sessione ha esaurito
il proprio budget dopo due slice, e il protocollo impone per ogni finding
riproduzione, rischio, test prima, fix, test dopo e decisione. Fingere una
disposizione completa sarebbe la forma documentale esatta che questa catena di
sessioni ha imparato a diffidare.

Sono stati aggiudicati **con misura**: il `critical` e i finding sui file
toccati da questa sessione. I restanti sono `PENDING_ADJUDICATION`, che
**non è un rifiuto implicito**.

## Aggiudicati con misura

### #27 `critical` — `BoardPluginPostitPersistence.test.ts:485-489` → `REJECT_INVALID_MEASURED`

Rilievo: «rimuovere il membro `postits` duplicato nel type literal, così che
`tsc -b` passi».

Falsificazione della premessa, su due fronti indipendenti:

1. il letterale a `:485-489` ha **un solo** membro `postits`
   (`schema: string` · `postits: Array<{ pluginState: Record<string, unknown> }>`);
2. `npm run typecheck` → `tsc -b --noEmit` → **exit 0**.

Il rilievo asserisce un fallimento di typecheck che **non si verifica**.

> **Falsificatore di questo rifiuto**: un `tsc -b` che fallisca su quelle righe
> in una qualunque configurazione di progetto. Se qualcuno lo produce, il
> rifiuto cade. È il controllo che i due cicli precedenti hanno insegnato a
> scrivere accanto a ogni `REJECT`.

**Nota di processo — CORRETTA dopo misura. La prima stesura era falsa.**

Questa disposizione affermava: «`tsc -b` non è nella lista dei gate del
protocollo (§3) … è un buco del protocollo». **Falso.**

```
bin/monorepo.sh:150   verify_core() { test_core; typecheck_core; build_core; }
```

`npm run verify` — che **è** nella lista §3 — esegue `tsc -b --noEmit` e
`vite build` a ogni invocazione. Il typecheck era coperto da tutti i cicli
precedenti, non solo da questo. Nessun buco di protocollo, e nessuna azione
richiesta a Sessione 5 su questo punto.

L'errore: ho asserito un'**assenza** leggendo la lista dei gate invece di
leggere che cosa esegue il gate che stavo nominando. È la stessa famiglia dei
cinque errori numerici catalogati in questo stesso pacchetto — un'affermazione
misurata su un referente adiacente — **commessa nel documento che li cataloga**.
Registrata come `E-58`.

### #20 `major` — `RoomSimulationConnectWire.test.tsx:765-767` → `ACCEPT_PENDING_ORACLE`

Rilievo: il secondo gesto di connessione asserisce solo `toHaveBeenCalledTimes(2)`;
va asserito che il wire id generato sia **distinto** dal primo.

Valido, e della stessa famiglia esatta chiusa dalla Slice 1: un assert di
conteggio non stabilisce l'identità di ciò che è stato allocato. Richiede
oracolo rosso prima del fix; non aperto in questa sessione.

### #13 `trivial` — `RoomSimulationConnectWire.test.tsx:688-801` → `DEFERRED_SCOPE`

Scomposizione di un test in `it` distinti. Refactor di test: fuori dagli ordini.

### #39 `trivial` — `host.ts:156-164` → `ACCEPT_PENDING_ORACLE`

`validateRoomId` dovrebbe girare ogni volta che `deps.roomId` è fornito, anche
senza simulation/instanceId. Tocca l'invariante §7.6 (room-scoped) e richiede
quindi una decisione Obsidian prima del codice, non solo un oracolo.

**Non contraddice** il `REJECT_INVALID` di X4 voce 1, confermato valido dalla
falsificazione: quello riguardava `describe()`, intenzionalmente stateless.

### Nessun finding su `audit.ts` e `caps/board.ts`

I due file di produzione modificati dalla Slice 2 **non compaiono** fra i 39.
È un'assenza, non una promozione: significa che X7 non ha rilevato nulla lì,
non che siano corretti. Il revisore avversariale, sugli stessi file, ha invece
prodotto due `HIGH` — vedi §Divergenza.

## Divergenza fra i due revisori — il dato più utile del ciclo

| oggetto | CodeRabbit X7 | review di falsificazione |
|---|---|---|
| `audit.ts` / `caps/board.ts` dopo la Slice 2 | **nessun rilievo** | **due `HIGH`**: race read-modify-write non chiusa; nessun consumer di produzione legge il segnale |
| commento del test di isolamento | nessun rilievo | **`MEDIUM`**: il commento sovraclaima, il test non prova §16.5 |

I due strumenti non sono ridondanti: X7 misura il diff, la falsificazione
attacca i **claim**. Un difetto che consiste nel dire più del vero è invisibile
a chi legge solo il codice. È la ragione per cui il protocollo ne impone due.

## Stop condition §9 — «un Major non compreso»

Il `critical` è stato letto, riprodotto e falsificato con misura. I 25 `major`
sono stati letti nell'elenco per file e severità; **25 su 25 non sono stati
aperti nel merito**, ed è dichiarato qui invece che nascosto sotto una tabella
di comodo. Chi riprende deve trattare quel blocco come non aggiudicato.
