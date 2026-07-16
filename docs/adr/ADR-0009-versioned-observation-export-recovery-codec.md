# ADR-0009 — Codec versionato per export e validazione recovery delle observation

- **Stato**: ACCEPTED LOCAL / STORAGE RECOVERY PENDING
- **Data**: 2026-07-16
- **Dipende da**: ADR-0004, ADR-0005, ADR-0006, ADR-0007 e ADR-0008

## Contesto

K3 produce una proiezione locale, isolata e hashata, ma non possiede un formato
reversibile per export o recovery. Gli export legacy JSON/JSONL perdono `-0`;
i bundle `.lesson` non legano in modo completo versione, conteggio, scope e
atomicità. Non sono quindi autorità K3.

Il primo candidato codec applicava limiti diversi ai raw row in export e alla
proiezione completa in decode. Poteva produrre un archivio che il proprio
decoder rifiutava. Usava inoltre `input.slice()`, confine sovrascrivibile, e
non redigeva ogni eccezione da input binario o scope ostile.

## Decisione

`core/kernel/observationArchive.ts` definisce un codec puro. L'export legge una
`ObservationPartitionReader`, costruisce una sola projection shell data-only,
la fotografa tramite descriptor, valida l'intero journal K3 e codifica la
proiezione finale. Il decode riceve lo scope autorizzato dal chiamante: il file
non assegna scope o autorità.

Il frame v1 contiene, in ordine:

1. magic ASCII `ARDESIA\0` di 8 byte;
2. versione `uint8` uguale a `1`;
3. lunghezza payload e numero observation come `uint32` big-endian;
4. hash K3 della proiezione in 32 byte;
5. proiezione nel tagged structural encoding K3;
6. SHA-256 finale sul frame precedente, con dominio
   `ardesia/observation-archive/v1\0`.

### Un solo budget canonico

Export e decoder applicano la stessa semantica alla proiezione completa,
inclusi `schemaVersion`, partizione, array observation e chiavi wrapper:

- root a profondità zero; ogni valore JSON conta come un nodo;
- le chiavi non contano come nodi, ma chiavi e valori stringa consumano gli
  esatti byte UTF-8 di `JSON.stringify`, incluse virgolette ed escape;
- il limite entry vale per singolo array/object;
- observation e byte totali del frame hanno limiti separati.

L'export misura nuovamente la proiezione validata con lo stesso encoder bounded
usato dal controllo di canonicalità del decoder. Un export riuscito è quindi
decodificabile dalla stessa versione rispetto ai limiti. Exact-limit è incluso;
un'unità oltre fallisce con codice pubblico stabile.

### Boundary ostili

Il decoder accetta runtime input `unknown`. Il tag interno
`%TypedArray%.prototype[@@toStringTag]` prova `Uint8Array`; un'operazione
intrinseca valida anche il receiver non detached. La copia usa
`%TypedArray%.prototype.set` catturato verso un buffer nuovo e ne ricontrolla
la lunghezza. Non legge `slice`, `constructor`, iteratori o indici
dell'input. Fake prototype, Proxy, receiver incompatibile e buffer detached
falliscono redatti.

Anche lo scope atteso viene fotografato tramite soli data descriptor prima
della validazione. Accessor e trap non possono far uscire testo controllato
dall'attaccante. Il codec non restringe autonomamente le chiavi JSON: la
normalizzazione del payload resta quella del validator K3.

Il decoder restituisce la proiezione soltanto dopo lunghezza, magic/versione,
digest artefatto, UTF-8 fatal, grammatica, EOF, re-encoding byte-identico,
scope, count, sequenza, identità, contaminazione e hash K3. Un errore non espone
row, prefissi, projection parziali o `cause`.

## Limiti v1

- archivio: 8 MiB;
- observation: 4.096;
- profondità: 32;
- nodi strutturali: 250.000;
- byte stringa canonici cumulativi: 4 MiB;
- entry per container: 4.096.

## Prove locali

Fixture sintetici provano exact/beyond per tutti i sei limiti, round-trip,
determinismo, `-0`, lone surrogate, ordine array, hash K3, corruzione,
magic/versione, count, scope, sequenza, identità, contaminazione, trailing
data, input binario fake/proxy/detached e scope accessor/proxy. Il golden K3
esistente resta invariato.

## Non-claim e gate successivo

Il digest rileva corruzione: non prova autenticità e non cifra. Il codec non
verifica i byte indicati da `contentHash`, consenso o autorizzazione remota.
Non esiste una porta di recovery storage: append ripetuti potrebbero lasciare
commit parziali e sono vietati. IndexedDB, migrazione, runtime wiring,
Safari/iPad, CI remota, pubblicazione e `KERNEL_PROVEN` restano fuori scope.

Una slice successiva potrà definire recovery soltanto su partizione nuova/vuota
in una transazione, con abort integrale e successo da `transaction.oncomplete`,
poi provarla su browser reale e dispositivo.
