# AUDIO-V2 e Poiseuille — incremento utilizzabile locale

24 ottobre 2026, Europe/Rome. Base verificata [#297](https://github.com/AndreaMarro/ardesia/pull/297), head `ae25b93bec826539940e0226da1f0cd8cebff0b1`, base di quella PR `339ab08f4139da0b37e78bbde81e9fe4e83afea0`. #297 è ancora draft e non integrata. Questo incremento è nel ramo isolato `codex/ardesia-audio-v2-poiseuille-20261024`, dipendente da #297. [Draft PR #298](https://github.com/AndreaMarro/ardesia/pull/298), candidato prodotto `e1be6c9ea0a19b90d53a9e4d8a38dac5846c1270`. Il commit successivo aggiorna memoria e attribuzione delle prove mantenendo gli stessi sorgenti runtime. Nessun merge, deploy, acquisto o scheduler.

## Cosa può fare il docente e cosa vede lo studente

In Studio, il docente apre **Registra e collega un passaggio**, scrive l'annotazione, sceglie **Solo il mio microfono docente** e **Registra audio**. **Termina registrazione** conferma il salvataggio soltanto dopo il segmento finale, i byte verificati e il marker canonico. Una seconda registrazione è uno stream distinto; il tempo tra le due è una pausa. Consenso salvato e riapertura non attivano il microfono.

**Copia passaggio per il corso** produce un riferimento a lezione, sessione, registrazione, digest, oggetto/versione e tempo. In Aula → **Apri episodio guidato**, il docente incolla quel riferimento, aggiunge trascrizione/spiegazione e sceglie esplicitamente **Condividi passaggio con il gruppo**. La fonte e la sua revisione sono oggetti Core autorizzati. Il riferimento dichiara un collegamento locale: non trasferisce i byte, non concede accesso remoto e non dimostra interpretazione automatica della voce.

Lo studente, nello stesso ambiente sintetico, entra in **Aula → Apri episodio guidato**. Formula previsione e procedimento prima del risultato; a raggio doppio ottiene Q×16 con Δp fissata e Δp/16 con Q fissata. Un errore sul vincolo propone un recupero specifico, la trascrizione esatta e il replay del passaggio collegato. Affronta poi il problema diverso, raggio dimezzato a Q fissata, che richiede Δp×16. La seconda variante cambia solo dati editoriali e riferimenti del CoursePack.

In **Il mio lavoro/Correzioni**, il docente ritrova le stesse ricevute e la fonte originale del procedimento, propone e rilascia feedback, conferma un'osservazione nel diario, assegna una nuova prova e verifica l'esito. Le azioni del tutor nella prova sono esplicitamente sintetiche: non attestano una revisione scientifica umana reale. Gli aiuti osservati/dichiarati e un risultato precedente disponibile restano distinti da “nessun aiuto richiesto”; quest'ultimo non certifica assenza di aiuti esterni o padronanza.

## Portabilità e controllo dell'audio

**Materiali → Esporta .lesson** include le sole sessioni/media autorizzate della lezione selezionata. **Seleziona bundle .lesson → Importa il bundle** recupera identità, riferimenti e replay anche in un profilo/store nuovo. Il bundle canonico mantiene contenitore1 e richiede reader2 quando contiene eventi AUDIO-V2; i vecchi bundle senza quegli eventi restano reader1. Un reader precedente non viene aggirato con downgrade degli envelope.

**Revoca e cancella audio** ferma richieste/cattura e cancella i media della sessione corrente. Dopo riapertura o import, **Audio delle aperture precedenti** permette di revocare quelle registrazioni dalla UI. Importazione concorrente, rollback e revisioni esterne falsificate non possono ripristinare un OFF locale esplicito. Le copie esportate in precedenza rimangono esterne al controllo dell'app.

## Come riprodurre

Dal checkout del ramo, usando i lock esistenti. Il runtime Web previsto dalla CI è Node26.5.1/npm11.17.0; Studio è stato verificato anche con Node22.14.0/npm10.9.2. Python3.13 è fissato tramite uv:

```sh
npm ci --no-audit --no-fund
npm --prefix apps/studio ci --no-audit --no-fund
uv sync --project services/study-api --frozen --python 3.13
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5197 --strictPort
```

In terminali separati, dalla root, scegliere una directory di dati **nuova** per il seed sintetico:

```sh
services/study-api/.venv/bin/python bin/study-demo/seed_course_capabilities.py --data-dir ../study-qa-new
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir ../study-qa-new --no-seed --no-frontend --port 5321
npm run dev --workspace @ardesia/web
```

Studio: `http://127.0.0.1:5197/`; corso: `http://127.0.0.1:5320/`. Il seed scrive credenziali **sintetiche** locali in `demo-access.json`, da usare nel login senza commetterle. Le porte sono loopback, non un deployment. Per il replay su un altro archivio trasferire prima il bundle.

I runner [Studio](evidence/browser/run-studio.cjs) e [docente/studente](evidence/poiseuille/run-journey.cjs) esercitano i gesti reali con Chromium e uno stream WebAudio sintetico; nessun microfono fisico. Gli output predefiniti sono fuori Git. Impostare le variabili descritte nei runner per nuovi output e nuovo dataset. Le [prove finali](validation.md) distinguono esecuzioni, fallimenti, scope e manifest.

## Prove e limiti

- [Diagnosi CI-CATALOG e controprove](evidence/catalog/diagnosis.md): evento perso prima del listener, differente da commit React o routing; asserzione originale preservata. Il singolo run CI storico non è stato riprodotto identicamente.
- [Contratto e regressioni AUDIO-V2](evidence/audio/README.md), [review indipendente](evidence/review/independent-review.md).
- [Studio nativo/UI](evidence/browser/final/result.json): 20 controlli, due take decodificabili, A/B, profilo nuovo, revoca dopo import, sorgenti congelate; zero pageerror, warning/error console e richieste fallite.
- [Episodio reale](evidence/poiseuille/README.md): 20 controlli e fonti ricevute dal Core, desktop/390px, tastiera e movimento ridotto; zero pageerror/console error o HTTP≥400, richieste annullate conservate.
- [REA circoscritto](evidence/rea/README.md): osservazione, specifica, implementazione e oracolo18/18; costo totale e risparmio **UNKNOWN**, non sostituiti dal tempo dei comandi.

Restano fuori microfono fisico, FSA, altri browser, utenti reali, auth/RLS remota, beta commerciale e efficacia didattica. Il consumer **Engine ingest legacy** già non supportava manifest/bundle canonico v2 prima di questo incremento; ora è registrato come prossimo confine da aggiornare, non come round-trip Engine riuscito. MCP resta alle quattro letture: la scrittura privata della RFC #293 non è aggiunta qui. Il lungo stack aperto richiede ancora un candidato integrato e gate sul suo SHA.

Rollback: revert del commit di incremento nel ramo di revisione. I bundle reader2 già prodotti richiedono un reader compatibile; il rollback non deve fingere di leggerli come reader1. Non ci sono migrazioni database o cambi di produzione da annullare.
