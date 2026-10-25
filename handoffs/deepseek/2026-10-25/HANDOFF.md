# DeepSeek - consegna progressiva del 25 ottobre 2026

Destinatari: Codex A (integrazione e deploy) e Codex B (strumenti e plugin). Questa chat ha comunicato con entrambe le sessioni esistenti su autorizzazione esplicita di Andrea. Non ha creato altri agenti, eseguito merge, aperto PR o distribuito Vercel.

## Risultati reali

- Baseline verificata sul PDF universitario Unicz, 306024 byte, SHA256 `2650dee32028c3414d67952c4be63db511fa184b10395b921caa9b76adb4c60f`, confrontata col programma UniBo2026/27. PDF MUR diretto HTTP403: nessuna uguaglianza dei byte ministeriali attestata.
- 38 famiglie editoriali, 200 sotto-obiettivi dichiarati, 38 lezioni originali DRAFT: spiegazione, esempio svolto, pratica, trasferimento diverso, feedback, indizi, errori, riepilogo e trascrizione.
- 200 domande finali originali, una per sotto-obiettivo; 38 selezionate per il finale compatto. Dati raggruppati per i quattro CoursePack, con diagnostica, formulario e recupero item→obiettivo→lezione.
- 292 controlli PASS contro i file del worktree A: aritmetica selezionata, gate dei dati e controprove indipendenti su circuiti, onde, cinematica e gas ideale. Rapporto con hash dei sorgenti effettivamente eseguiti. Non equivale a 292 esercizi o 200 obiettivi certificati.
- Fixture Goodnotes originale di4pagine, link e outline controllati, rendering ispezionato; copione sintetico non registrato. Inventario di30scenari con stato e criterio riproducibile.

## Stato esplicito dei quattro corsi

| Percorso | Unità | Famiglie redatte | Sotto-obiettivi con contenuto e domanda | Obiettivi completamente accettati |
|---|---|---:|---:|---:|
| Strumenti e meccanica | U1,U2 | 9 | 52 | 0 |
| Fluidi e termodinamica | U3,U5 | 10 | 57 | 0 |
| Elettricità e magnetismo | U6 | 7 | 33 | 0 |
| Onde, ottica e radiazioni | U4,U7 | 12 | 58 | 0 |

`authored` significa testo e domanda tracciabili, non sufficienza didattica, efficacia, firma umana o prova remota. Tutti i materiali mantengono `editorialStatus=DRAFT` e `humanApproval=false`. La matrice `coverage-200.json` conserva per ogni sotto-obiettivo i gap di revisione, consumer, audio, riapertura e remoto. Non sono dichiarati quattro corsi completi.

A ha già importato le38famiglie nel proprio worktree, con43lezioni contando i passaggi dimostrativi. La proiezione Core letta direttamente conserva `INCOMPLETE`, `completedObjectives=0` e denominatore200. Questa misura riguarda i byte locali in lavorazione: non certifica commit integrato o deploy. Diagnostica/finale/formulario erano ancora assenti dai pack durante la prima verifica; A ha comunicato che li stava importando. Verificarne la versione finale.

## Stato tecnico verificato all'ingresso

- Main GitHub `64f6206271b218683f4d45cf953d6ee4b9d5f414`, dopo #305; #304 è realmente MERGED in `51023fc5f0e3df5cee52b40bbe3f7d47028bca5a`.
- Nessuna PR aperta nella rilevazione iniziale; CI main [40231993715](https://github.com/AndreaMarro/ardesia/actions/runs/40231993715) e readiness40231993714 SUCCESS. Questi verdi non si trasferiscono al nuovo incremento in lavorazione.
- Vercel Fisica, team `team_23uD0RgdInaTaOPEL0EGltup`, progetto `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`: ultimo deployment osservato `dpl_8aUFbXrEZKpAjf8vRj1wBmK8fyfr`, READY/production, prodotto `9fe1cef6319fc789fbfca9bc89fb5f060e6aa0d2`. L’API non prova le nuove funzioni.
- [Demo esistente](https://ardesia-fisica-preview.vercel.app): nessun nuovo deployment eseguito da questa chat. La richiesta anonima a `/version.json` restituisce404; non è un endpoint contrattuale e non permette di dedurre la SHA servita.

Worktree separato: `work/ardesia-deepseek`, branch `codex/deepseek-content-20261025`, base64f62062. Tutte le scritture di repository sono sotto `handoffs/deepseek/2026-10-25/`. RUNLOG,NEXT,registry,schema,CI,routing e lockfile restano di A.

## Controprove e correzioni

Gli oracoli DC usano numeri derivati a mano: serie12V/4Ω/8Ω→1A/12W; parallelo→4,5A/54W; polarità inversa mantiene potenze non negative. Permutazione dei resistori e casi invalidi sono controllati.

Per l’onda si verificano direzione+x, quarto di lunghezza d’onda positivo, quarto di periodo negativo, ampiezza nulla e limite di un milione di periodi. B ha trovato e corretto la perdita di fase a lungo tempo; la controprova è stata ripetuta sui byte corretti, senza attribuire il finding a questa chat. Per cinematica sono distinti8m di spostamento e10m di cammino nel caso con inversione. Il gas usa R SI precisa, derivata indipendentemente da NA·kB; non è stata modificata la costante Core per adattarla ai dati.

La review di B ha rilevato sei prompt che richiedevano i dati dell’esempio chiuso. Sono stati riscritti con tutti i dati nel testo, mantenendo risposte e problemi diversi. Il commit correttivo è `2b0f5850`; la chiusura del finding sul consumer richiede l’import della versione corretta e la prova UI di A/B. È stata inoltre chiarita la differenza fra stazionarietà statistica e campo istantaneo invariato.

## Goodnotes e REA: fatti e limiti

Metadata osservati con `plutil`: Goodnotes.app7.1.30, build3962760.264631382, bundlecom.goodnotesapp.x; macOS26.0.1/25A362. Non è stata osservata la modalità attiva Goodnotes6, né account,piano,sync o quaderni. Non attribuire i risultati a una diversa versione.

I [termini Goodnotes](https://www.goodnotes.com/terms-and-conditions), aggiornati settembre2025, limitano reverse engineering e accessi automatizzati. Non è stata stabilita una base separata per quelle tecniche. Nessuna UI automatizzata, analisi binaria, lettura dei database, uso del microfono o export di quaderni reali è stata eseguita. Le [guide ufficiali audio](https://support.goodnotes.com/hc/en-us/articles/7352688559631-Add-Audio-Recordings-to-your-documents) documentano replay e contesto temporale; le [guide dei formati](https://support.goodnotes.com/hc/en-us/articles/8537070839183-Choose-Between-Editable-and-Flattened-PDF-Export) distinguono conservazione di link e outline. Il [PDF non conserva le registrazioni](https://support.goodnotes.com/hc/en-us/articles/7352729730959-Can-I-Share-my-Audio-Recordings). Nessuna di queste letture certifica la build locale.

REA6.7.0 è disponibile: identità, help e contratto effettivo `inspect_plist` verificati. Una chiamata conpath esplicito è fallita `target_unavailable` in assenza di target aperto; nessuna cattura Goodnotes è inventata. Il fallback ha letto solo metadata non personali. Costo totaleREA `UNKNOWN`.

A ha comunicato successivamente di aver generato quattro audio originali con sintesi offline. Questi audio non sono stati ascoltati da questa chat e non cambiano lo stato della matrice Goodnotes o l’approvazione editoriale. Le trascrizioni degli altri materiali sono testo, non file audio.

## Donor: trasferimenti circoscritti

- Goodnotes: documentazione come riferimento per distinguere PDF e bundle completo, take separate e identità stabile delle ancore. Nessun codice o asset trasferito; criteri di accettazione in `protocolli/GOODNOTES.md`.
- Excalidraw: dipendenza Studio dichiarata `^0.18.1`; [repository con licenza MIT](https://github.com/excalidraw/excalidraw/blob/master/LICENSE). La versione effettivamente bloccata e i notice devono essere controllati prima di importare codice. Proposta: verificare selezione mista e undo nel percorso già esistente, non creare una seconda lavagna. Implementazione di questa proposta NOT_RUN.
- tldraw: [licenza SDK](https://tldraw.dev/community/license) distingue sviluppo e produzione con licenza appropriata. Nessuna dipendenza, trial o spesa introdotta; solo riferimento documentale. PhET/GeoGebra/Polypad non sono stati copiati né dichiarati riutilizzabili commercialmente.

## Riproduzione e handoff

1. Eseguire `build_content.py`, `full_curriculum.py`, `atomic_assessment.py`, `group_handoff.py` con Python3.12 o equivalente funzionante. I file rigenerati devono restare DRAFT.
2. Eseguire `verify_science.py --engine-root /percorso/packages/engine --report /percorso/report.json` sul candidato integrato; il rapporto include gli hash dei modelli. Senza modello gas disponibile il controllo gas non è eseguito: leggere i sorgenti elencati.
3. Integrare da A i dati nei CoursePack e i sei prompt corretti; verificare finale200,diagnostica,formulario e recupero dal consumer protetto, senza un altro motore quiz.
4. Verificare URL pubblico e preview protetta alla SHA finale, cold reopen e limiti audio. Solo A decide merge/deploy e aggiorna RUNLOG/NEXT.
5. Eseguire manualmente i30scenari Goodnotes consentiti con la sola fixture nuova; conservare i NOT_RUN finché non ci sono osservazioni reali e non saturare il disco.

Rollback della pubblicazione resta di A: ripristino del deployment noto precedente con relativo manifesto; non usare la chiusura di una PR come completamento. Nessuna PR è stata aperta o abbandonata da questa chat. Ogni commit di consegna è preservato.
