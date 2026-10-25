# S04 — verifica del candidato

Base: main37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Ambiente: checkout isolato S04 sul MacBook, API SQLite loopback sintetica; runtime Python3.13.14 e dipendenze API già installate. Nessuna migrazione, dipendenza o pubblicazione introdotta. Browser plugin non disponibile; QA con Playwright già presente e Chrome locale.

## Prove eseguite

- Baseline banca e HTTP review:37PASS, prima dell'implementazione.
- Dominio/audit/famiglie/API:30PASS dopo correzioni; 4HTTP aggiuntivi su composizione reale senza edit app.py rieseguiti separatamente. Una deprecazione Starlette/httpx già presente, non occultata.
- Audit integrale:4000record,4000firme distinte,250famiglie di generazione,23segnalazioni per passaggi senza spiegazione,495risposte numeriche ricalcolate,2151non verificate e1354di altro tipo;0discrepanze nei controlli supportati. `audit-summary.json` conserva i23id/digest, il report integrale locale ha hash dichiarato. Non è correttezza di tutti4000.
- Famiglie:32seed per ciascuna di4proposte originali;112combinazioni distinte complessive (20/32/32/28); MRU con somma discreta, continuità con bilancio di volume, Ohm con bilancio di potenza, onda con ricostruzione dei cicli. Goldens dei quattro transfer; controprova non certifica efficacia didattica o ogni modello possibile.
- Typecheck iniziale e build Web completa `npm run build:web`:EXIT0. Vite avverte chunk math/pdf grandi, controllo non cambiato.
- UI nuova2PASS. Due test preesistenti del revisore hanno raggiunto timeout5000ms durante contesa; nessun timeout/gate/asserzione modificato. Rerun seriale ancora da registrare.
- Browser reale `http://127.0.0.1:5454`: raggiunti audit4000,4dossier,table4corsi; screenshot1440×1000 e390×844, nessun overflow nelle due asserzioni. Il test complessivo ha raggiunto timeout180s; non chiamatoPASS. Snapshot finale pubblico dopo logout e notaPENDING nelDB conservati come evidenza parziale; il journey completo deve essere ripetuto in slot assegnato.

## Errori e correzioni

1. `curl` con TLS verificato ha superato il problema del certificato del runtime Python e il403 del fetch web; PDF MUR e mirror byte-identici. Non usato `-k`; confronto SHA e prefissoPDF.
2. Distrattori iniziali MRU/continuità coincidevano con la risposta per alcuni seed: test discriminanteRED, generatore corretto,128valutazioni di seedGREEN,112combinazioni distinte. Nessun dato della banca cambiato.
3. Deduplica iniziale casefold/punteggiatura avrebbe confuso mPa/MPa e segni: RED riprodotto; ora normalizzazione NFC+spazi, preserva maiuscole/prefissi/segni/esponenti.
4. Nuovi test HTTP avevano assunto400 invece del422 canonico e revocato il token di bootstrap invece del cookie ruotato: test corretti secondo il codice Core, revoca effettiva con revoke_all_sessions; quattroPASS. Nessuna modifica al sistema auth per accomodare il test.
5. Harness avviato prima della fine build: directorydist assente, avvio fallito; riavviato solo dopo l'EXIT0. Nessun server falso dichiarato funzionante.

## Riproduzione

Dalla root del candidato:

```sh
PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study/assessment_quality services/study-api/tests/test_assessment_quality_http.py -q
PYTHONPATH=packages/engine python -m lessonos.study.assessment_quality --output /percorso/report.json
npm run test:web -- --maxWorkers=1 src/features/assessment-quality/AssessmentQuality.test.tsx src/__tests__/question-bank-review.test.tsx
npm run build:web
python handoffs/swarm-v2/S04/serve.py --data-dir /percorso/privato/s04-demo --port 5454
S04_DATA_DIR=/percorso/privato/s04-demo S04_OUTPUT_DIR=/percorso/output node node_modules/@playwright/test/cli.js test --config handoffs/swarm-v2/S04/playwright.config.ts
```

Il factory definitivo richiede l'applicazione di `api-composition.patch` da S10/S00. L'harness compone lo stesso vero adapter e il vero Core; non falsifica identità o risposte HTTP. Per provare riapertura senza reseed, riavviare con lo stesso data-dir. Non condividere il file sintetico dei token; non viene committato.

## Limiti

Non eseguiti: firma scientifica umana, pubblicazione dei4000, correzione autonoma delle23segnalazioni, acquisizione/validazione di tutti200obiettivi, tipi di risposta aperta/grafica/ordinamento come consegne Core, installazione runtime esterno, integrazione main o deploy. Le128valutazioni di seed non sono128record bancari né128attività consegnabili. Merge/deploy restano S00. RUNLOG/NEXT non modificati da S04; questa consegna è l'input per il writer comune.
