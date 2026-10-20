# Ardesia — candidato quaderno portabile, gate Studio aperto

Checkpoint locale del 20 ottobre 2026, **non committato**.
Base `12296e6be225be7571be88ca55b67bd3fd30784d`; snapshot dell’indice Git `5150b5d935aa033f4f869015dd2fd5b33bede158`.

Il flusso Web è verificato, ma il gate Studio è fallito due volte. Questo
archivio rende il lavoro revisionabile; non attesta un incremento completato.

Gli export .study.json ora riaprono PDF, note, evidenziazioni e formule della
revisione selezionata in «Il mio lavoro» e nei materiali del tutor. Il file
mantiene i byte JSON originali: non perde numeri come 1.0 e -0.0 che concorrono
agli hash. Il lettore verifica il PDF incluso e non recupera altre fonti dal Core.

REA **6.7.0** resta la versione più recente pubblicata e quella già configurata.
[Note ufficiali del 18 ottobre](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0).
Nessuna reinstallazione o nuova dipendenza di prodotto.

## Verifiche

- 239 test Web passati in 31 file; build Web e pubblico con typecheck riuscite.
- Gate Studio congelato: 2156 passati, 1 fallito; replay non eseguito. Il fallimento finale è in no-emoji.test.ts, con STACK_TRACE_ERROR e nessun elenco di caratteri. Causa non accertata.
- API SQLite e Chrome reali: export studente/tutor, chiusura browser, riavvio
  API e riapertura in un nuovo browser. Versione consegnata distinta dalla
  head privata; nessun GET Core di risorse o PDF nel percorso locale.
- JSON normalizzato rifiutato, byte originali conservati e accettati; file
  con PDF corrotto o pageCount falso rifiutati con errore visibile.
- Lettura studente a 390, 820 e 1440 px, zoom CSS 200%, tastiera/focus, formule statiche,
  chiusura del lettore e logout. Dettagli Axe/CSP nel report tecnico.
- Review indipendenti di UI e parser, con probe separati; patch applicabili
  alle rispettive basi; hash dell'archivio e dei file verificati.

Il primo gate Studio ha segnalato due fallimenti in file non modificati; la
ripetizione isolata dei relativi 11 test è passata. Sono conservati entrambi
gli esiti, senza attribuire una causa certa al primo fallimento. Anche i due
test no-emoji sono passati in isolamento dopo il secondo gate fallito; questo
non rende verde la suite completa. Il primo
harness export ha scritto il report con tutte le asserzioni completate ma
ha richiesto SIGTERM dopo la chiusura dei browser: non se ne dichiara exit 0.
La riapertura usa il successivo harness con chiusura esplicita. Dopo due gate
falliti, AGENTS Studio §5 richiede lo stop del ciclo: nessun terzo tentativo o
commit. Il checkpoint conserva i log per la diagnosi successiva.

## REA e limiti

REA MCP ha osservato creazione/persistenza di una nota originale in AFFiNE e
il menu Export. Il ciclo esterno PDF→annotazioni→export→reimport è ancora
parziale: nessun upload file è offerto dallo schema scenario 6.7.0, e l'ultimo
approfondimento del menu ha incontrato un timeout CDP. Le catture conservano
questi limiti e i tentativi falliti. Il test harness prepara il quaderno locale;
REA lo osserva passivamente, senza rivendicare un'importazione fatta da REA.

La riapertura richiede una sessione e l'API per ispezionare il file: **non è
completamente offline**. L'integrità interna non certifica autore o permessi.
Studio autonomo conserva la preview testuale; il lettore visuale è integrato
nel Web. Restano altri browser, screen reader, touch/penna, carico con 200
formule e workflow esterno completo. SYS-01 e il programma Ardesia rimangono
aperti. Nessun push, merge, deploy o messaggio esterno.

## Contenuto e applicazione

`source/` contiene 124 file modificati dalla base generale; l'incremento
corrente ne cambia 30. L'archivio contiene patch, evidenze MCP,
screenshot, log, script e sole fixture sintetiche; esclude credenziali,
database e node_modules. Le prove precedenti sono nella consegna
ARDESIA_QUADERNO_EDITOR_REA.zip, separata e conservata.

Applicare una sola patch: `patches/cumulative.patch` dalla base `d0235e8a9dbbccd6808741a087dd0359908feb2b`, oppure
`patches/notebook-portable-only.patch` da `12296e6be225be7571be88ca55b67bd3fd30784d`. Eseguire prima
`git apply --check`. È un archivio di modifiche, non un'app standalone.
Nel monorepo: `npm ci`, `npm run build --workspace @ardesia/web`, Study API con
schema canonico 6 già pronto. Licenze in `source/apps/web/THIRD_PARTY_NOTICES.md`.

Gli script riportano percorsi della prova e vanno adattati al proprio checkout.
`seed.py` genera soltanto dati/sessioni sintetici in una directory vuota;
`serve.py` avvia API e build Web; `browser.cjs export` e `browser.cjs reopen`
sono separati da un riavvio esplicito del server; `rea-local.cjs` prepara la
fixture e invoca MCP. Non puntare il seeder a dati reali.

Report completo: `source/docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-PORTABLE.md`.
