# Receipt di preparazione della pubblicazione — 22 settembre 2026

Pacchetto locale verificato sullo snapshot 908cdf0f. Tutte le unità della
ripartenza rimangono nella storia del branch; aggiunti guida, indice, manifest,
archivi e verifica ripetibile. Il push e la PR sono il passo successivo autorizzato;
lo stato remoto e la CI si leggono dalla PR, non si deducono da questo receipt.

[Comandi e output dei controlli](checks.json),
[registro capability append-only](capability-ledger.jsonl).

- Inventario: 257 originali, 183 log di comandi, 15 copie normalizzate, 7 unità.
- Tutti i collegamenti locali della guida e della pagina delle prove esistono.
- Gate documentale mirato: 8 documenti, 4 controlli; nuova guida ricontrollata
  dopo l'aggiunta del riferimento ufficiale OpenAI.
- NUL, secrets e relativi 3 test: exit 0. Pattern applicati anche ai dati degli
  archivi prima di comprimere; i tre log con buffer binari restano dichiarati.
- Boundary: exit 0, 12 offender storici, zero aggiunti. Workflow: exit 0.
- Stato offline e verifica: exit 0. Le letture remote non sono simulate dal
  generatore offline; base, privacy e PR sono state lette separatamente via gh.
- Whitespace dell'intera continuazione: exit 2 prima, exit 0 dopo la conservazione
  degli originali e la normalizzazione esplicita. Regole e allowlist identiche.
- Prodotto, gate, workflow, lockfile e review D2 congelata: nessuna modifica
  rispetto allo snapshot iniziale. Nessuna suite prodotto rieseguita per il
  solo riordino documentale; la CI della PR dovrà verificarne l'integrazione.

Hash della review D2 congelata:
baf2e41dedcf42238b89f1a4e194631b50190d37438ffd1a9bc4da532e2e41df.
Hash di RecapView al termine della preparazione:
d1fd905b477510beb0059a771e3945a9f8ec52e92ee3dd996c44fe9f378f98df.

Rischio residuo: confondere checkpoint storici con stato corrente. La guida
collega gli esiti successivi e conserva i limiti del pilot. Repository privato;
nessuna garanzia che una chat senza accesso autorizzato possa leggerlo.

Capability persistent-capability-evolution usata localmente, modello/effort
inherited/unknown. Nessun subagent, promozione, benchmark di risparmio o nuova
installazione. INDEX_SYNC_DEFERRED, nessun accesso ai vault esterni o AgentMemory.
MERGE=NOT_PERFORMED; MANUAL_DEPLOY=NOT_PERFORMED; REAL_PILOT=NOT_RUN.
