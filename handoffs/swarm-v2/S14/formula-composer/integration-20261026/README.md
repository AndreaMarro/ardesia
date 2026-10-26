# Formula nel Room effettivo — 26 ottobre 2026

## Risultato e provenienza

Il consumer Formula è ora applicato al vero `apps/studio/src/Room.tsx`.
Il build ordinario di Studio compone MathLive, MathJax locale, Excalidraw,
journal e il writer canonico che conserva `livingLesson`.

- Base media congelata: `c35b3e3f7d80c6361b446c1b29d525ba84579690`.
- Parent originale PR318: `dbb49121819b9ca0e60ba5b6b097737ec2b990cd`.
- Merge locale che conserva entrambi: `88e468a2b036ee2c11131e7bcd9bcb07390f4274`.
- Primo raccordo reale: `7f7623a4953234972261429f65a538b0de83ac44`.
- Prodotto finale verificato: **`4ba6c2b489965e5e0e63c8d9a9b90efd5fc9c1cb`**.
- Tree del prodotto finale: `73900d68f560f917491a56d25dce645ad3f564e9`.

S00 ha autorizzato esplicitamente l'ordine 318 prima di 311 dopo aver verificato
l'indipendenza tecnica. Le vecchie istruzioni di attesa in S00-INTEGRATION.md
rimangono uno snapshot storico. Questo tree non contiene ancora S07 né
`isInkUndoTarget`; non introduce un listener di undo alternativo.

## Comportamento verificato

Il Room rigetta l'inserimento se il canvas/journal non sono pronti, la formula
è vuota, una richiesta è già in corso o la coppia canvas/journal è cambiata
durante il rendering. Il rigetto raggiunge il composer: il campo e le azioni
restano bloccati durante l'operazione, la bozza sopravvive al fallimento ed è
riutilizzabile. Il toggle Formula esterno segue lo stesso mutex. Aprire Formula
chiude il menu mobile.

La lettura della prima schermata di riapertura ha trovato una sovrapposizione
reale: formula e annotazione del docente usavano entrambe x160/y120. Il raccordo
finale usa i bounds di Excalidraw, comprese le rotazioni, dei soli elementi vivi;
inserisce sotto il fondo corrente con 24 unità di distanza e richiama il fit
esistente. Gli elementi precedenti mantengono identità e coordinate.

Non cambia la coda `queueSceneWrite`, la serializzazione `preserveEditorial`,
il consenso audio, il formato del journal o il bundle. Nessun nuovo ledger,
driver, flag, dipendenza, lockfile o gate.

## Prove e rettifiche

| Prova | Esito | Evidenza |
| --- | --- | --- |
| Consumer originale con i quattro test v3 | 4 RED, 96 non selezionati | `evidence/room-original-red.json.gz` |
| Stessi test sul vero Room integrato | 4 GREEN | `evidence/room-v3-green.json.gz` |
| Primo insieme esteso | 117/119, due fallimenti di fixture | `evidence/targeted-fixture-failure.json.gz` |
| Fixture corretta, prima del posizionamento | 119/119 GREEN, 5 file | `evidence/targeted-before-placement-green.json.gz` |
| Primo browser su 7f7623a | 20 controlli funzionali PASS; lettura screenshot FAIL per sovrapposizione | `evidence/browser-before-placement.json`, `evidence/formula-before-placement-overlap.png` |
| Regressione del posizionamento | 1 RED | `evidence/placement-red.json.gz` |
| Insieme finale | **120/120 GREEN, 5 file** | `evidence/targeted-final-green.json.gz` |
| Typecheck e build ordinario finale | **PASS** | `evidence/typecheck-final.log.gz`, `evidence/build-final.log.gz` |
| Browser sul build finale 4ba6c2b | **21/21 PASS**, nessun errore JS inatteso | `evidence/browser-final.json` |

La fixture del test aggiunto per lo smontaggio leggeva un attributo sul body
lasciato da un test precedente: dichiarava l'API pronta prima che il nuovo
Room avesse montato il bottone. Il test successivo ereditava quindi una risposta
mock ancora pendente. Il fix resetta quell'attributo e attende il nuovo canvas;
nessun timeout o comportamento prodotto è stato indebolito.

Il primo comando Vitest in sandbox non ha completato il caricamento config:
`execFileSync` non ha restituito il Git SHA alla verifica di provenienza. Lo
stesso comando autorizzato con accesso normale ai processi figli ha completato
il RED e il GREEN. `evidence/tooling-incomplete.json` mantiene questa distinzione.

## Browser reale e bundle

`verify-browser.mjs` avvia **Vite preview del build ordinario**, senza plugin che
sostituiscono Room, copie patchate o `__MAESTRO_TEST__`. Quest'ultimo è asserito
assente. Solo la prima richiesta al bundle MathJax locale viene ritardata e
abortita per verificare il fallimento; il retry carica l'asset emesso dal build,
senza SVG o risposta renderer sintetici.

La prova crea un'annotazione dal controllo docente, verifica microfono OFF e
comando disabilitato prima del consenso, registra con MediaRecorder su dispositivo
Chromium sintetico e salva un capitolo. Successivamente esercita i template,
selezione, undo/redo, clipboard, modalità text/LaTeX e tastiera nativa MathLive.
Il testo di prova è immesso con l'API pubblica del vero mathfield.

Dopo il retry, l'SVG viene salvato dal normale writer. Il test confronta
l'intero elemento di annotazione e l'intero `livingLesson` con i valori iniziali.
La geometria finale è annotazione y120/h64.8 e formula y208.8/h24: nessuna
sovrapposizione. La navigazione UI in Continuità esegue il flush del journal;
seguono riapertura, isolamento della seconda lezione e download da Materiali.

Il file `evidence/formula.lesson` è il vero export sintetico. Le sue parti sono
lette come ZIP: SVG/fileId, evento `journal.math.insert`, capitolo e producer SHA
devono coincidere. Il producer contiene esattamente il commit del build finale.
Un contesto browser nuovo importa il file attraverso anteprima e conferma UI,
poi riapre a 390×844 e supera un ulteriore cold reload. Il controllo mobile
misura bounds e hit-test del pannello, controlli sopra il canvas e sopra la
tastiera visibile, chiusura fisica della tastiera e ripetuti mount/unmount.

Il runner legge i byte prodotti dal driver localStorage solo come osservazione
di cache; il round-trip del bundle verifica il contenitore portabile. Non inietta
scene, identità, journal o capitoli nello storage.

## Comandi riproducibili

Dal repository, dopo l'installazione delle dipendenze bloccate di root e Studio:

```sh
npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000 src/__tests__/Room.integration.test.tsx src/formula-composer/MathComposer.integration.test.tsx src/__tests__/MathComposer.test.tsx src/__tests__/MathComposerFonts.test.ts src/features/living-lesson/tests/serialization.test.ts
npm --prefix apps/studio run typecheck
npm --prefix apps/studio run build
PLAYWRIGHT_BROWSERS_PATH=/tmp/ardesia-browsers node handoffs/swarm-v2/S14/formula-composer/integration-20261026/verify-browser.mjs /tmp/ardesia-formula-browser
git diff --check
```

Il browser attende il build corrente: il manifest `.lesson` deve avere lo stesso
SHA di `git rev-parse HEAD`. Rilanciare il build dopo un nuovo commit, anche se
cambia soltanto la documentazione. Nessuna iniezione di flag prodotto; Studio
usa la base ordinaria `/`. `S14_PORT` può assegnare una porta diversa dalla 55140.

Ambiente misurato: Node24.22.1, Chromium148.0.7778.96. Il Node locale differisce
dal Node26.5.1 di CI. Il build segnala i chunk esistenti sopra 500kB; il warning
non è stato silenziato. La suite completa e la CI sul tree congiunto restano di S00.

## Review, limiti e prossimo passo

La review indipendente del writer media ha letto entrambe le delta Room e non
ha trovato una violazione dimostrata del contratto. È review tecnica di codice,
non approvazione umana scientifica. Vedi `REVIEW.md`.

I risultati riguardano una lezione locale sintetica, Chromium e microfono
sintetico; non dispositivi fisici, API remota, concessioni Core o contenuto
scientificamente approvato. Non equivalgono al percorso G0 unificato, a G1,
a CI remoto, merge o pubblicazione. Nessuna mutazione GitHub/deploy effettuata.

S00 può comporre questo head mantenendo i parent originari. Primo passo:
verificare il Room del tree congiunto, rieseguire i gate e il runner sul suo
build preciso. Se S07 entra successivamente, mantenere il suo filtro di undo e
la separazione degli overlay, insieme a questa coda unica e al fence lifecycle.
