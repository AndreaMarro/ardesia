# Ardesia — lettore PDF degli originali

Consegna locale del 20 ottobre 2026. Commit `746c7fb34bf8159728afecf30c9f284c7e51b7d4`.

Il lettore è integrato nelle consegne e nella review tutor di Ardesia. Verifica
SHA-256 e dimensione dell'originale autorizzato prima di mostrarlo; offre pagine,
zoom, rotazione, testo incorporato, download e riprova. PDF.js **6.4.299** è fissato
nel lockfile, caricato all'apertura e distribuito con worker, risorse e licenze
locali. Il percorso è: **Il mio lavoro → Consegne e feedback → Originali, versione
e ricevuta → Leggi il PDF**.

**SYS-01 è ancora aperto.** Questa consegna completa il lettore degli allegati;
annotazioni, formule MathLive, ancoraggi canonici, Undo e il ciclo
salva–chiudi–riapri del quaderno scientifico restano da integrare. Le altre
priorità dello ZIP rimangono nel piano, così come G0/G1 e il rilascio.

## REA e provenienza

REA **6.7.0** è la versione configurata e l'ultima stabile verificata su npm e
sulla [release ufficiale](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0),
pubblicata il 18 ottobre 2026. Non è stato eseguito un aggiornamento superfluo.

L'analisi e gli scenari hanno usato MCP stdio reale: initialize, tools/list
(207 strumenti) e tools/call. I tool non sono stati aggiunti a caldo alla chat.
Il pacchetto conserva client, piani, bundle e identità delle evidenze.
L'evidenza finale del lettore è
`ev_e75d64866131f6753278fea65baded8c53a314a6dfd7286bbf83df9f5f9a0c2d`.

Gli step browser dichiarati sono completati. La cattura complessiva resta
parziale: alcuni corpi di risposta non erano esposti e i bundle JavaScript
superavano il budget REA di 64 KiB. L'analisi statica non prova l'intera logica.
Il report tecnico distingue osservazioni, inferenze e aspetti ancora sconosciuti.

## Risultati verificati

| Controllo | Risultato finale |
|---|---|
| Engine, dalla directory corretta del package | 2.461 passati, 25 saltati |
| API | 216 passati |
| Web, esecuzione seriale | 173 passati in 24 file |
| TypeScript, build Web, build pubblico separato | Riusciti |
| Risorse PDF locali | 201 hash verificati, 11 file di licenza |
| Browser Chrome 155 | 390, 820 e 1440 px; zoom CSS 200%; tastiera e focus |
| Recupero e identità | Worker 503 → retry; logout; download byte-identico |
| Tutor | Originale V1 consegnato: 200; nuova V2 privata: 403 |
| Accessibilità automatica nella regione allegato | Nessuna violazione rilevata; 2 controlli incompleti |

Sono stati corretti un errore reale di recupero del worker e la perdita del focus
sull'ultima pagina. La revisione indipendente ha individuato un limite non
compatibile con ID legacy, poi corretto, e ha verificato 11 probe mirati.
È una revisione tramite subagente Codex; non attesta indipendenza cross-family.

I log conservano anche gli esiti falliti: Engine avviato inizialmente dalla
directory sbagliata e attese UI fallite durante contesa di CPU. Le suite finali
sono passate rispettivamente dal package corretto e senza carichi concorrenti;
i test preesistenti non sono stati indeboliti. Non sono stati eseguiti l'intera
suite Studio e il gate storico che punta a un altro checkout.

Non sono attestati conformità completa di accessibilità, UI “perfetta”, limite
alla memoria totale del browser, CSP di produzione o rilascio cloud.

## Contenuto e recupero

- `source/`: i 49 file modificati rispetto alla base, con i percorsi originali.
- `patches/cumulative.patch`: entrambi gli incrementi, dalla base `d0235e8a9dbbccd6808741a087dd0359908feb2b`.
- `patches/reader-only.patch`: solo il lettore, dalla base `9ad5b38e1892ff4a081ff2d5fad201926b7d8d23`.
- `evidence/`: bundle MCP, scenari, risultati browser, inventari e review.
- `logs/`: ricevute delle verifiche, incluse le esecuzioni fallite.
- `scripts/`: strumenti di verifica usati; contengono percorsi locali da adattare.
- `screenshots/` e `fixtures/`: schermate e PDF sintetici.
- `MANIFEST.json`: hash di ogni file, commit e limiti della consegna.

È un archivio di modifiche ed evidenze, non un'app standalone. Per ricostruire,
usare un checkout alla base indicata e applicare **una sola** delle due patch
coerentemente con quella base, prima con `git apply --check`. Le dipendenze sono
nel lockfile. Le istruzioni del progetto e i controlli richiesti restano validi.
Token, cookie di sessione, database di test e node_modules sono esclusi.

Nessuna pubblicazione, push o merge è stato eseguito.
