# S02 — sistema visuale e shell

Stato: IMPLEMENTATO, TESTATO localmente nel perimetro sotto; integrazione/rilascio demandati a S00. Non DONE. Base `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`, primo commit prodotto `3919539077887d1853faa0fb70089baa8a128cbe`; correzioni di review nel prodotto `c0423828d0881b30e3b92c5b03a45ecbc1644e39`, [PR308](https://github.com/AndreaMarro/ardesia/pull/308). La head e i gate finali si rileggono dalla PR; questo rapporto non anticipa integrazione o rilascio.

## Risultato raggiungibile

Sul client Web autenticato: Oggi, corsi, Lezione, lavoro/quaderno, materiali e destinazioni di ruolo nello stesso Shell; ricerca Ctrl/Cmd K, filtri locali, focus/chiusura e selezione delle edizioni già caricate. Root App, View e API preservati. La ricerca non è un indice globale di fonti.

La shell eredita il ciclo di sessione Core: nessun nuovo login, database, ledger, grader, salvataggio locale di carriera o invio a provider. La nota privata è salvata/riaperta tramite API esistente, non dalla shell. Offline è un segnale del dispositivo, mai una promessa di sync o una ricevuta.

Pagina componenti di sviluppo: `/src/features/product-shell/lab.html` con controlli reali per sette stati e cinque stati della fonte, recupero esplicitamente dimostrativo e link alle tre viste esistenti. Non inclusa negli entry di build del prodotto o nel pubblico.

## Riproduzione locale con dati sintetici

1. Runtime Python già configurato per Engine/Study API e dipendenze Web del progetto; niente nuove dipendenze introdotte.
2. `python bin/study-demo/seed_course_capabilities.py --data-dir /percorso/privato/S02` (credenziali private, non committare).
3. `python bin/study-demo/serve.py --no-seed --no-frontend --port 5421 --data-dir /percorso/privato/S02`.
4. Vite loopback `5420`, proxy `/study` verso `5421`; config temporanea locale estende `apps/web/vite.config.ts`, senza modificare il file condiviso. Il default del progetto resta5321.
5. `ARDESIA_DEMO_ACCESS=/percorso/privato/S02/demo-access.json ARDESIA_WEB_URL=http://127.0.0.1:5420 ARDESIA_BROWSER=/percorso/chrome node node_modules/@playwright/test/cli.js test --config handoffs/swarm-v2/S02/e2e/playwright.config.ts`.
6. `npm run typecheck --workspace @ardesia/web` e `npm run test --workspace @ardesia/web -- src/features/product-shell/__tests__ src/__tests__/accessibility-semantics.test.tsx --maxWorkers=1`.

Porte e dati della sessione separati. Checkout creato in questa chat e successivamente ridotto con sparse-checkout dopo misura host8GiB/spazio~1.2GiB/swap elevato. Nessun processo o file di un'altra sessione rimosso.

## Prove e limiti

- Baseline semantica4/4PASS; nuovi shell/stati7/7PASS, combinata iniziale shell4+semantica4=8/8PASS. Suite sovrapposte, non sommate.
- Percorso reale API locale4/4PASS: tre viewport390/820/1440 per Oggi→ricerca→Lezione→nota privata→refresh→lettura risorsa dal Core→quaderno→offline/online→deep link/cambio edizione; tutor con voci corrette e logout rimuove shortcut.
- Typecheck inizialePASS, poi FAIL dopo test Node dentro src; correzione solo collocazione sotto handoff, typecheck finalePASS. Nessun @types aggiunto o tsconfig allargato.
- Review separata: sette mirati6PASS/1timeout5000ms, causa non stabilita; nessun gate indebolito. P2 IME riprodotto con assertionRED e corretto, testGREEN. P2 altezza dialog: RED effettivo8px di risultati a390x320 con testo grande → GREEN, risultati e navigazione da tastiera raggiungibili. Ultima nuova suite8PASS; combinato con semantica10/12 (timeout iniziale e doppio main successivo); ricontrollo semantica isolata4/4PASS. Fallimenti conservati, nessuna causa di timeout dichiarata risolta.
- Screenshot effettivi e ispezione visiva dell'agente, distinti da giudizio umano (NOT_RUN). Geometria iniziale: nessun overflow documentale a390/820/1440. CSS zoom200% controllato separatamente; non prova del browser zoom nativo o di un device.
- Primo passaggio console visuale registra404favicon.ico solo nel laboratorio: corretto con link all'icona esistente, controprova successiva app+laboratorio0errori/avvisi console.
- Nessuna certificazione WCAG, screen reader/device/Safari o efficacia didattica umana. Nessuna approvazione scientifica/editoriale nuova. I200target rimangono fuori da questo mandato e invariati.

Misure dev1440 su tre navigazioni warm: TTFB33.3–95.6ms, FCP428–1556ms, LCP1036–2156ms, CLS0.05808; INP NOT_MEASURED. Classroom non caricato su Oggi e caricato dopo navigazione. Non produzione/p75 o confronto causale con baseline. [Snapshot di verifica](validation.json) separa prove, fallimenti e limiti. I servizi/browser S02 sono stati chiusi per rispettare la coda host comunicata da S00; nessuna build/browser successiva durante gli slot altrui.

Dettagli: [contratto](CONTRACT.md), [riuso/licenze](reuse.json), [review](review.md), [piano/decisioni](plan.md). Prove corpose consegnate nell'output utente, con digest; segreti e database esclusi. La memoria comune NEXT/RUNLOG resta al writer S00, come prescrive il mandato V2; questa consegna fornisce il testo da riconciliare.

## Tre batch successivi

1. **Integrazione S00 e adozione S01/S06/S08.** Primo passo: rileggere PR/CI e CONTRACT, montare i consumer nel root di S00 e adottare SurfaceState/SourceStatus nei namespace proprietari. Dipendenze: route reali e risposte Core. Accettazione: una prova end-to-end e review del confine per ogni consumer; CI sul merge tree e main, demo privata pertinente. Nessuna adozione esplicita dei nuovi filoni già attestata qui.
2. **Navigazione persistente dei sottoflussi S06/S00.** Primo passo: concordare identificatori reali per Quaderno/Ripasso ed Esplora; Work oggi ha tab locali e App usa replaceState. Dipendenze: ownership App/Work. Accettazione: back/refresh/deep link riaprono tab e fonte esatti, senza nuove autorità. Non modificare App o duplicare route dalla shell per simulare il risultato.
3. **Qualità trasversale e remoto.** Primo passo: ripetere journey con media/room/authoring integrati e backend S10 autorizzato; poi VoiceOver/Safari/touch reali e ascolto umano. Accettazione: stati e revoca coerenti, formule non tagliate, performance produzione misurata con target separati dalle misure. Nessun test locale trasforma il client in beta remota certificata.
