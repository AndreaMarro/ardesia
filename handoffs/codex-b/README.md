# Codex B — handoff del 25 ottobre 2026

Base verificata `64f6206271b218683f4d45cf953d6ee4b9d5f414`. #304 e #305 MERGED,
nessuna PR aperta all'ingresso, CI main 40231993715 SUCCESS. Non ho eseguito
merge, deploy, modifiche amministrative o chiusure di PR. A è l'integratore.

## Incrementi consegnati e ownership

| Commit B | Cambiamento | Prova locale |
| --- | --- | --- |
| `71fb3c837c6c6ba490dcc5071f2062c9f1877391` | Modelli SI DC a due resistori e onda armonica | 45 RED per moduli mancanti → 45 PASS; baseline 32 PASS |
| `a947cafcb90c26d70ea1e8ef12fbc09ea310ee40` | Renderer presentazionali con tabelle equivalenti | 15 PASS, typecheck PASS |
| `3071128ffc3865d6ff4943200871b62d54f98077` | Rifiuto dati finiti enormi prima della scala SVG | RED 2 FAIL + 15 PASS → 17 PASS |
| `58b03dba379641a62ebb2d7c681fadbc988f40d1` | Rappresentazioni selezionabili, un grafico alla volta | RED 3 FAIL + 14 PASS → 17 PASS, typecheck PASS |
| `a3250f8ded5931ff83191cc6eb0dded1a1b7fb37` | Cinematica analitica 2D, vettori e x-v-a | 17 nuovi Core PASS e 7 UI PASS; combinati Core 62 e UI 24 PASS |

Nessun file di routing, dispatch `activities.py`, catalogo, CI, lockfile, CSS
globale, RUNLOG o NEXT modificato da B. La prima consegna è nel branch
`codex/b-physics-tools-20261025`; il recovery dal commit 3071128f nel branch
`codex/b-tools-local-20261025`, worktree `/private/tmp/ardesia-b-tools-20261025`.
A ha confermato l'importazione dei primi quattro incrementi; verificare il
commit A finale per cinematica e consumer. Nessuna PR B: i commit sono
consegnati alla PR atomica di A, senza stack o PR lasciata aperta.

## Modelli e consumer

| File / API | Contratto | Consumer / stato |
| --- | --- | --- |
| `packages/engine/lessonos/study/electrical.py`, `evaluate_dc_circuit` | `voltage` V firmata, `resistance1/2` Ω positive, `topology` serie/parallelo; corrente, R equivalente, potenza e misure dei rami SI; 9 campioni I-V-P | `ScientificElectricalModel` e nuovo `PublicCoursePlayer` A; `BUNDLED_FIRST_PARTY` |
| `packages/engine/lessonos/study/waves.py`, `evaluate_harmonic_wave` | `speed` m/s, `frequency` Hz, `amplitude` m, `time` s, `phase` rad; λ, T, 65 campioni spaziali e 65 temporali | `ScientificWaveModel` e nuovo player A; `BUNDLED_FIRST_PARTY` |
| `packages/engine/lessonos/study/kinematics.py`, `evaluate_kinematics` | posizione, velocità e accelerazione iniziali 2D; `time`/`duration` s; posizioni/derivate, vettori, rapidità, modulo spostamento e 65 campioni | `ScientificKinematicsModel`; integrazione consumer A da verificare |

I tipi UI sono esportati dai rispettivi componenti. `result=null` nasconde
soluzioni e grafici prima della previsione. La UI esegue soltanto geometria
dei valori forniti. Non legge il wall clock, non sintetizza suono, non usa
microfono, rete o storage proprio. Tempo, reset e salvataggio spettano al
consumer Core; nessun secondo registro. Tutti gli output conservano DRAFT.

Oracoli: 12 V su 4+8 Ω in serie → 1 A/12 W; parallelo → 4,5 A/54 W. Tensione
invertita: correnti invertite, potenze positive. Onda 4 m/s, 2 Hz, A=0,1 m:
λ=2 m, T=0,5 s, y(λ/4,0)=+0,1 m e y(0,T/4)=−0,1 m, fronte verso +x. Cinematica
vx=3, vy=4, ay=−2 a t=2 → x=6 m, y=4 m, vy=0. Inversione vx=6, ax=−2 a t=4:
x=8 m, vx=−2 m/s, modulo spostamento 8 m, distanza percorsa 10 m.

DeepSeek ha fornito controprove indipendenti; ho rieseguito il suo script
contro i file effettivi: 279 controlli PASS, che includono anche verifiche
editoriali e aritmetiche. Non sommarli ai test pytest/vitest e non considerarli
firma umana, efficacia didattica o verifica remota. Il report contiene i digest
dei tre file valutati. Modelli chiusi, nessun nuovo solver numerico/MNA:
il CircuitSolver Studio resta il solver per reti generali.

## Creare e validare una risorsa di esempio

`*.parameters.json` sono esclusivamente oggetti input già accettati dal Core,
non un nuovo manifest, formato di lezione o catalogo. Il piccolo script invoca
le stesse funzioni canoniche. A collega risorse e revisioni al CoursePack.

Comandi eseguiti dal worktree B (Python 3.13 nell'ambiente esistente):

```sh
ARDESIA_PYTHON=/private/tmp/ardesia-r2-20261024/packages/engine/.venv/bin/python
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py --help
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py dc-resistance-v1 handoffs/codex-b/dc.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/dc.resource.json
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py harmonic-wave-v1 handoffs/codex-b/wave.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/wave.resource.json
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py kinematics-v1 handoffs/codex-b/kinematics.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/kinematics.resource.json
```

Su un'altra macchina impostare `ARDESIA_PYTHON` a un ambiente del progetto
Python >=3.12; il path `/private/tmp` documenta questo host. Nessun pacchetto
globale o dipendenza nuova installati. Nessuna chiave inclusa nelle risorse.

## Protocollo plugin: giugno riconciliato col codice

| Percorso verificato | Risultato attuale | Limite |
| --- | --- | --- |
| `apps/studio/src/toolhost-protocol/manifest.ts` | schema strict con kind, author, visibility, license, integrità | Il documento di giugno che li dice mancanti è superato |
| `toolhost/authoring/scaffoldPlugin.ts`, `packageFile.ts` | template, firma Ed25519 dev e pacchetto reale, installazione attraverso PluginManager | Il template generico non è automaticamente lo strumento scientifico |
| `toolhost/installer.ts`, `host.ts`, `pluginManager.ts` | verifica installata/mount, lifecycle, revoca e disinstallazione esistenti | Nessun secondo manager introdotto |
| `design/PluginWizard.tsx` | route `?vista=officina-plugin`: creazione, harness e export | Non importa il pacchetto nel nuovo player dei quattro corsi |
| `design/ToolLab.tsx`, `store/toolLabView.ts` | route `?vista=tool-lab`: mount reale del reference blink | iframe browser same origin; origin server distinto richiede shell locale; non chiamarlo sandbox scientifica Vercel |

Quattro spec correnti eseguite: `ToolScaffoldAuthoring`, `PluginPackage`,
`ToolHostMountIfEnabledRecheck`, `ToolInstaller`: 58 PASS. Provano i relativi
percorsi reali di libreria per reference/scaffold. **NOT_RUN:** ciclo completo
di un nuovo plugin scientifico installato, consumato dal corso, aggiornato,
revocato e disinstallato su Vercel, con quaderno preservato. Il gap resta aperto;
non trasformare la fallback `BUNDLED_FIRST_PARTY` in claim `INSTALLABLE`.

## Quattro corsi: residuo esplicito

| Percorso | Incremento B | Residuo che questo handoff NON completa |
| --- | --- | --- |
| strumenti-meccanica, U1/U2 | Cinematica vettoriale; Hooke già presente | Altri obiettivi U1/U2, esercizi/diagnostica/finale, audio, continuità remota e revisione umana |
| fluidi-termodinamica, U3/U5 | Nessun modello fluidi duplicato; gas sviluppato da A | Copertura U3/U5 oltre i casi presenti e tutti i gate di corso |
| elettricita-magnetismo, U6 | Due resistori e potenza | Campi/potenziale, dielettrici, condensatori, magnetismo/induzione e verifica di ogni sotto-obiettivo |
| onde-ottica-radiazioni, U4/U7 | Onda armonica, spazio/tempo | Sovrapposizione, energia/acustica, ottica, fotoni/assorbimento/decadimenti e relativi gate |

La baseline universitaria 2026/27 e il denominatore di copertura sono posseduti
da A/DeepSeek; consultato UniBo corso 568106, riscontro di elettricità/onde e
cinematica coerente. PDF MUR diretto: 403, non attestata uguaglianza dei byte.
Nessuna conversione della banca DRAFT o dei materiali privati in pubblicati.
Non ho osservato Goodnotes nativo: consumo soltanto evidenze DeepSeek quando
ricevute; nessuna cattura Ardesia viene spacciata per osservazione donor.

## Errori, recovery e prove ancora necessarie

Full Web prima dell'ultima UI: 397 PASS, 57 file. Gli ultimi cambi UI hanno
24 PASS mirati e typecheck PASS; full finale/CI/remote sono da riferire alla
head A integrata, non trasferiti automaticamente. Iniziale invocazione vitest
dalla root non trovava test: corretta al cwd `apps/web`, non considerata RED
funzionale. Typecheck/test Studio iniziali sul recovery falliti per file esclusi
dal sparse; incluse le dipendenze sorgenti e ripetuti verdi, senza cambiare
config o indebolire test. RED di aggiunta modulo distinto da test comportamento.

Disco a 1,8 GiB liberi; `.git` in Documents marcato `dataless` e letture bloccate.
Worktree originario conservato; copiati i quattro sorgenti ancora residenti in
worktree sparse `/private/tmp`, nessun reset di lavoro altrui. Prove operative
in `/private/tmp/ardesia-b-evidence-20261025`; consegna utente copiata in outputs.

Review RO segnalata ad A: prompt/feedback statici non devono restare sul vecchio
scenario quando i controlli cambiano grandezze fisiche. A possiede e corregge il
player. Integrazione, screenshot sul consumer, CI, URL/deploymentId finali,
rollback e disposizione PR rimangono ricevute da verificare con A.

### Prossime azioni effettive

1. A importa cinematica e collega l'episodio al consumer; accettazione previsione,
   parametri, grafico, prova diversa e revisione esatta; prova browser + SHA A.
2. QA del player A su 390/820/1440, tastiera e movimento ridotto; correggere prompt
   e feedback coerenti e verificare riapertura con risultato nascosto.
3. Verificare CI e deployment pubblicato da A alla SHA finale; annotare URL,
   deploymentId, limiti e rollback senza dichiarare quattro corsi completi.
4. Continuare la matrice 2026 fino a ogni sotto-obiettivo; un oggetto non copre
   l'intera unità e la firma umana non può essere sostituita dai test.
5. Completare il ciclo plugin scientifico dinamico solo sul consumer e host
   effettivi, preservando le note e usando l'installer già presente.
