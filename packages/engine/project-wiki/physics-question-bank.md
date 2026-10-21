# Banca di Fisica per il semestre filtro

## Invariante

La banca è contenuto statico versionato, associato alle edizioni di Fisica senza
riscrivere i CoursePack immutabili. Il descrittore aggiunge `questionBankIds`,
mentre la SHA continua a essere calcolata sul JSON del pack.
Fonte: `lessonos/study/catalog.py:27`.

`QuestionBank` verifica identità, conteggio e SHA dei file. Lo snapshot congelato
non contiene identità studente o tentativi. La cache controlla i file a ogni
accesso e ricostruisce lo snapshot al cambiamento.
Fonti: `lessonos/study/question_bank.py:168`, `lessonos/study/question_bank.py:466`.

## Accesso, proiezione e risposta

L’appartenenza all’edizione persistita viene controllata prima del caricamento.
Le proiezioni studente sono allowlist: non espongono chiavi, svolgimenti,
verifiche editoriali o valori esatti nascosti delle opzioni.
Fonti: `lessonos/study/question_bank.py:490`, `lessonos/study/question_bank.py:128`.

La correzione usa frazioni esatte e un parser limitato, senza eval o CAS.
Le risposte simboliche della banca sono a scelta multipla. I tentativi restituiscono
lo svolgimento completo e dichiarano `persisted:false`: sono allenamenti, non
ricevute di valutazione o attività registrate nel diario.
Fonti: `lessonos/study/question_bank.py:81`, `lessonos/study/question_bank.py:436`.

## Simulazioni e stato editoriale

Il sampler è deterministico rispetto a seme, profilo e snapshot. Rispetta
formati, scope e unicità delle famiglie di legge; la copertura delle sette
unità è una strategia didattica dichiarata, non una quota ministeriale.
Fonte: `lessonos/study/question_bank.py:358`.

La banca consegnata contiene 4.000 quesiti e 1.000 per livello, in 27 shard.
Tutti restano DRAFT: controlli algebrici e revisione assistita non sono una
approvazione scientifica umana o una calibrazione empirica della difficoltà.
Fonti: `lessonos/study/content/physics-semestre-2026-bank/manifest.json:1`,
`../../packs/semestre-filtro-2026-27/reports/delivery-validation.json:1`.

Il pacchetto editoriale documenta 250 famiglie, le spiegazioni estese, il
programma 2026/27 e il confronto con i 62 obiettivi delle prove 2025.
Fonte: `../../packs/semestre-filtro-2026-27/README.md:1`.
