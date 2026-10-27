# S04 — verifica del candidato

Base: main37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Ambiente: checkout isolato S04 sul MacBook, API SQLite loopback sintetica; runtime Python3.13.14 e dipendenze API già installate. Nessuna migrazione, dipendenza o pubblicazione introdotta. Browser plugin non disponibile; QA con Playwright già presente e Chrome locale.

## Prove eseguite

- Baseline banca e HTTP review:37PASS, prima dell'implementazione.
- Dominio/audit/famiglie/API:30PASS dopo correzioni; 4HTTP aggiuntivi su composizione reale senza edit app.py rieseguiti separatamente. Una deprecazione Starlette/httpx già presente, non occultata.
- Audit integrale:4000record,4000firme distinte,250famiglie di generazione,23segnalazioni per passaggi senza spiegazione,495risposte numeriche ricalcolate,2151non verificate e1354di altro tipo;0discrepanze nei controlli supportati. `audit-summary.json` conserva i23id/digest, il report integrale locale ha hash dichiarato. Non è correttezza di tutti4000.
- Famiglie:32seed per ciascuna di4proposte originali;112combinazioni distinte complessive (20/32/32/28); MRU con somma discreta, continuità con bilancio di volume, Ohm con bilancio di potenza, onda con ricostruzione dei cicli. Goldens dei quattro transfer; controprova non certifica efficacia didattica o ogni modello possibile.
- Typecheck iniziale e build Web completa `npm run build:web`:EXIT0. Vite avverte chunk math/pdf grandi, controllo non cambiato.
- UI nuova2PASS. Due test preesistenti del revisore hanno raggiunto timeout5000ms durante contesa; nessun timeout/gate/asserzione modificato. La CI esatta e5e0d642 ha poi completato tutti420testWeb con il timeout canonico.
- Browser reale `http://127.0.0.1:5454`: raggiunti audit4000,4dossier,table4corsi; screenshot1440×1000 e390×844, nessun overflow nelle due asserzioni. Primo test complessivo timeout180s, conservatoFAIL. Rerun seriale finale:PASS16.6s/runner23.1s, touch tap e focus/Enter,4dossier,notaPENDING→reload esatto,logout401/studente403,console/pageerror vuote. Evitato un secondo BrowserContext superfluo; stessi gate,timeout e asserzioni di autorità. ProcessoAPI poi chiuso e DB riaperto in nuovo processo: nota esatta e zero pubblicazioni, ricevuta cold-reopen.json.

## CI della fonte applicativa e5e0d642

Tutti7required SUCCESS, CI40246747223 e contract corretto successivo sulla stessahead. Web420PASS/61file,Engine2783PASS/29SKIP,API1100PASS/18SKIP; Studio/MCP/hygiene SUCCESS e golden advisorySUCCESS. Suite condivise non sommate. Marketing separato ancora in corso allo snapshot: non dichiaratoPASS. Il primo contract FAIL aveva owner non conforme al login GitHub; corretto il solo body, senza modificare il gate. ci-product.json conserva i riferimenti. Il commit finale aggiunge solo prove/harness; verificare la sua CI esatta prima del merge.

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
