# Validazione della consegna — 24 ottobre 2026

## Identità della prova

Base Git: `339ab08f4139da0b37e78bbde81e9fe4e83afea0` (#290). I run applicativi includono il diff locale del branch `pro/ardesia-living-lesson-audio-20261024`; **non sono run del solo commit base immutato**. I file testati sono identificati in `evidence/source-manifest.json`. La PR conserva il commit risultante. Gli esiti CI del nuovo SHA vanno letti nella PR; questo documento non attribuisce automaticamente i run di #290 al nuovo commit.

Ambiente locale: Linux, Node 24.22.1, npm 11.9.0, Chromium 153.0.8010.0 per le nuove prove native/browser. I runner e i risultati registrano dipendenze e scope propri. Nessun microfono fisico, account studente reale, pagamento o provider AI a consumo è stato usato.

## Esiti eseguiti

| Prova | Esito | Cosa sostiene / limite |
| --- | --- | --- |
| Studio TypeScript | PASS, exit 0 | `tsc -b --noEmit` sul diff finale |
| Studio suite completa | **2.201 PASS, 5 SKIPPED**; 200 file PASS, 1 SKIPPED; exit 0 | Profilo deterministico del progetto, 116,32 s di Vitest; non è l'intera suite del monorepo |
| Studio build | PASS, exit 0 | Compilazione TypeScript e Vite; warning su chunk >500 kB conservato |
| Audio lifecycle regressioni | 12 RED iniziali → PASS | Final tail, permessi tardivi, duplicati, clock, consenso e purge |
| Audio review indipendente | 2 RED iniziali sul primo diff → 6 probe PASS; gruppo audio completo 39 PASS | Fallimenti bytes/marker, async pending, purge ed errore nativo; inclusi nella suite completa |
| Journal boundary | 7 RED nel nuovo gruppo → 72 PASS journal | Optional undefined, immutabilità snapshot e rifiuto degli altri valori non JSON |
| Replay | 43 PASS nel gruppo finale | Due room, identità fonte, stato caricamento, endpoint temporale; inclusi nella suite completa |
| Audio nativo Chromium | **20/20 PASS** | Clip sintetica breve con MediaRecorder reale; store in memoria, non Room/FSA |
| Lavagna/replay nel browser | **13 controlli, PASS_WITH_EXTERNAL_FONT_ERRORS** | Disegno reale, A/B, cold reopen, room vuota, ultimo evento, desktop/mobile |
| REA sul build marketing | Analisi statica PASS, 8 azioni browser, **12/12 verifiche indipendenti PASS** | Build locale della base #290; non una nuova feature ricostruita né il deploy |
| Igiene repository | PASS | NUL, secrets, boundary, workflow, doc claims e stato; whitespace finale PASS dopo normalizzazione delle viste dei log |
| Copia delle prove REA/audio | PASS offline | Hash archivio e payload, oracle sui risultati conservati; non nuovo run browser |

I conteggi dei gruppi si sovrappongono: non sommarli al totale della suite. I cinque skip appartengono a `src/__tests__/shots.test.ts`, che dipende dalla directory storica `~/maestro-logs/ui-shots`. Nessun test è stato disattivato per questo incremento. Le nuove prove browser hanno screenshot propri, ma non li spacciamo per il corpus legacy mancante.

## Comandi principali

Da `apps/studio`, dopo l'installazione prevista dal progetto:

```sh
npm run typecheck
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm run build
```

L'installazione locale ha usato `npm ci --ignore-scripts`; nessun lockfile è stato modificato. I gate finali sono stati eseguiti nell'executor con subprocess consentiti. In un run precedente il sandbox impediva `git rev-parse` avviato da Node e causava `spawnSync git EPERM` nel test di provenance. La stessa restrizione era riproducibile fuori Vitest. **Il test non è stato riscritto né escluso**: il run finale autorizzato passa. I warning jsdom sulla navigazione a un altro documento restano nel log.

I risultati e stdout completi sono in [local-validation/](evidence/local-validation/), incluso il JSON dei tre comandi. La verifica di igiene del repository e la corrispondenza del tree pubblicato sono registrate insieme al risultato di pubblicazione nella PR.

## Audio nativo: che cosa è stato osservato

Il test importa il sorgente effettivo via Vite. Il costruttore MediaRecorder e gli eventi finali sono nativi; `getUserMedia` viene sostituito soltanto per fornire uno stream sintetico WebAudio a 440 Hz. Lo store è una memoria controllata con scrittura ritardata. Non si ascolta né si registra una persona.

Una clip di 1,2 s, inferiore al timeslice di 30 s, produce 19.481 byte WebM/Opus. Il decoder nativo legge 1,199977 s a 44.100 Hz. Il marker arriva dopo la scrittura; `stop()` risolve dopo il marker; le tracce sono terminate. La revoca mentre il permesso è pendente rilascia lo stream tardivo senza costruire un recorder, creare chunk o emettere marker. Il consenso OFF è persistito.

SHA256 di `AudioRecorder.ts` prima/dopo la prova e al congelamento finale:

```text
6534bc53e1acbc00c7c25dea545d52f942cbff19dbfc4cfa999f82c310d269cd
```

Le prove immutate, l'audio sintetico e il runner portabile sono in [audio-native/](evidence/audio-native/README.md). Questo test non chiude sessione CAS, consumer Room, journal v2, export/import o codec di altri browser.

## Browser: percorso e screenshot

Il protocollo usa una nuova istanza Chromium e dati sintetici. Crea una lezione A e una B attraverso mouse/tastiera nell'Excalidraw reale, verifica 23 eventi v2 per lezione, apre il replay, raggiunge l'ultimo istante e riapre A a freddo. Un journal flat estraneo non viene usato dalla room vuota. Il caricamento via deep link dimostra il consumer; non dimostra discoverability di un pulsante Replay.

Il primo run RED ha riprodotto `customData: undefined` e il crash React. Il successivo ha rilevato il range che si fermava prima dell'update finale. I reperti RED sono conservati. Il run finale non ha pageerror né warning applicativi. Il cambio di lezione usa una riapertura completa, coerente con la navigazione esistente; la sola modifica dell'hash non viene presentata come routing SPA supportato.

**Limiti visivi effettivi:** 155 errori di font CDN esterni per certificato rifiutato sono registrati nel risultato; TLS non è stato disabilitato e i log non sono nascosti. A 390 px non c'è overflow della pagina, ma il contenuto iniziale può essere fuori viewport. Il comando visibile “Scorri indietro fino al contenuto” recupera il testo; il bordo destro del riquadro rimane tagliato. È un pan funzionante, non un fit automatico dell'intera scena. Non dichiariamo UX mobile commerciale conclusa.

Vedere [replay-browser/](evidence/replay-browser/README.md) per protocollo, immagini, risultato, manifest e runner. La verifica non esercita microfono, FSA, tenant remoto o studente autenticato.

## REA: perimetro della dimostrazione

REA 6.7.0 esegue analisi statica e cattura mobile dell'artefatto marketing originale. Il verificatore indipendente controlla separazione aiuto/soluzione/errore e conservazione del corso selezionato, confrontando il JS emesso col sorgente fissato. L'implementazione nuova è un verificatore, non la ricostruzione di una nuova capacità didattica.

Durate originali: 1.785 ms analisi statica, 1.869 ms comando runtime, 984 ms scenario. La query AST ristretta su un solo asset misura un lavoro diverso; non si calcola un fattore di accelerazione. Setup, triage e costo dell'agente non sono stati misurati abbastanza per una stima di risparmio.

L'[archivio REA](evidence/rea/README.md) include anche tentativi falliti, manifest e provenienza del browser. I tre esperimenti futuri E1–E3 nel report rimangono proposte; il test nativo del recorder completa una precondizione di E3, non tutto il ponte LessonOS.

## Cosa non è stato verificato

- Registrazione attivabile dalla Room canonica v2, trascrizione sincronizzata e associazione semantica automatica.
- Round-trip multimodale export/import e riapertura su altro dispositivo.
- Correzione reale di una fotografia con AI, revisione exact candidate digest e scrittura MCP nel prodotto.
- Compatibilità Ardesia nei singoli host ChatGPT/Claude/Gemini CLI/Cursor/Codex/OpenCode.
- Auth/RLS/isolamento di una beta remota su dati reali; i gate del backend effettivo restano distinti.
- Apprendimento causale, domanda commerciale, conversioni o margini effettivi.
- Suite completa di tutti i package, mobile fisico, Safari/Firefox o prestazioni di utenti reali.

## Migrazione e rollback

Non sono cambiate dipendenze, tabelle, schema v2 o formati dei dati persistiti. Lo snapshot del producer omette proprietà opzionali non serializzabili, mantenendo il contratto JSON; gli altri valori invalidi sono respinti. Il loader conserva il supporto legacy quando esplicitamente richiesto.

Il rollback tecnico consiste nel revert del commit di incremento sul branch di revisione. Non richiede una migrazione inversa dei dati; reintroduce però i difetti riprodotti. Prima di integrare altri cambi negli stessi file verificare il diff e ripetere le regressioni pertinenti. Nessun rollback di produzione è necessario perché questa sessione non ha effettuato deploy.
