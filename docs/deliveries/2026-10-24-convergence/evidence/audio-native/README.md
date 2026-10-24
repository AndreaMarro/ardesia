# AudioRecorder — MediaRecorder nativo, 24 ottobre 2026

**Run originale: 20/20 verifiche PASS in Chromium 153.0.8010.0.** Registrazione di 1,2 secondi con il costruttore `MediaRecorder` nativo ed eventi `isTrusted`, usando un oscillatore WebAudio a 440 Hz. Nessun microfono fisico, nessun suono collegato agli altoparlanti, nessun dato studente.

Il chunk finale WebM/Opus è di 19.481 byte e il decoder nativo legge 1,199977 secondi di audio a 44.100 Hz. Ordine osservato: `dataavailable → write-start → native-stop → write-complete → marker → stop-resolved`. Revoca durante un permesso pendente, poi risolto con un vero stream: zero recorder costruiti, zero audio, zero marker, consenso OFF, tracce terminate.

## Prove originali immutate

`original-run/` contiene lo script effettivamente eseguito, risultato JSON, audio sintetico `.webm` e manifest. Il risultato originale appartiene a questo script SHA256:

```text
13e9eaf4e777009511d7908578bcdad4d9020ae9fa133ddd755eca6bd595c90b
```

Il working tree aveva HEAD `339ab08f4139da0b37e78bbde81e9fe4e83afea0` e la correzione locale di `AudioRecorder.ts`. L’identità precisa del file testato, uguale prima e dopo, è:

```text
6534bc53e1acbc00c7c25dea545d52f942cbff19dbfc4cfa999f82c310d269cd
```

Non attribuire l’esito al solo commit base né a successive modifiche del file. I percorsi temporanei nel risultato sono provenienza storica e sono preservati senza riscrittura.

Il nuovo `audio-recorder-native.cjs` esterno a `original-run/` è portabile. `runner-provenance.json` registra separatamente hash originale, hash portabile e modifiche di configurazione. La logica dei due scenari rimane la stessa; il packaging ha controllato la sintassi e l’integrità, senza dichiarare un nuovo run nativo.

## Verifica offline della copia

```sh
python3 docs/deliveries/2026-10-24-convergence/evidence/audio-native/verify_original.py
```

Verifica manifest, identità degli script, hash dell’audio, cleanup e venti esiti registrati. Non avvia Chromium e non legge il microfono. `packaged-verification.json` conserva l’output della verifica eseguita sul pacchetto.

## Ripetere la prova nativa su un nuovo working tree

Servono Node, Playwright e Chromium; il run originale usava Node 24.22.1 e `playwright-core` 1.58.2. La versione portabile non installa strumenti. Le variabili sono:

| Variabile | Uso |
|---|---|
| `ARDESIA_REPO_ROOT` | Radice del checkout; in assenza è cercata tra gli antenati dello script |
| `ARDESIA_TEST_ORIGIN` | Server Studio, default `http://127.0.0.1:5197`; ammessi solo host loopback |
| `PLAYWRIGHT_MODULE` | Percorso assoluto al modulo `playwright-core`, oppure normale risoluzione Node se omesso |
| `CHROMIUM_EXECUTABLE_PATH` | Eseguibile Chromium; in assenza si usa il browser configurato da Playwright |
| `ARDESIA_AUDIO_OUTPUT` | Directory del nuovo risultato; in assenza viene creata una directory temporanea nuova |

Avviare Studio dalla radice del repo, dopo aver predisposto le normali dipendenze del progetto:

```sh
npm --prefix apps/studio run dev -- --host 127.0.0.1 --port 5197
```

In un altro terminale, sempre dalla radice del repo:

```sh
export PLAYWRIGHT_MODULE="/percorso/toolchain/node_modules/playwright-core"
export CHROMIUM_EXECUTABLE_PATH="/percorso/assoluto/chromium"
export ARDESIA_TEST_ORIGIN="http://127.0.0.1:5197"
export ARDESIA_AUDIO_OUTPUT="$(mktemp -d)"
node docs/deliveries/2026-10-24-convergence/evidence/audio-native/audio-recorder-native.cjs
```

Lo script crea un proprio browser/context, una pagina harness locale, importa `/src/store/AudioRecorder.ts`, esercita la classe con storage in memoria, salva risultato e audio sintetico nella nuova cartella e chiude browser/AudioContext/tracce. Rifiuta di sovrascrivere i file di un run esistente e non scrive in `original-run/`. Registra hash del **nuovo script** e del **nuovo sorgente**, oltre alla versione browser.

## Confine del risultato

È una prova nativa del lifecycle della classe, con store in memoria e permesso sostituito da stream sintetico. Non verifica microfono fisico, storage FSA, Room→Journal, replay, export, UI completa o browser diversi. Non modifica dipendenze del prodotto né usa servizi esterni. Le sole richieste del run originale erano 21 GET locali. Per dimostrare l’intera slice LessonOS servono i controlli d’integrazione separati descritti nel rapporto REA.
