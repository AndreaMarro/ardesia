# 7. AI utile, verificatori e contenuti

## Routing basato sul compito
1. Regole deterministiche per punteggio, unità, transazioni e modelli dei laboratori.
2. Retrieval autorizzato dei frammenti pertinenti e rubriche/versioni del tutor.
3. Modello economico per riformulazioni, classificazione richiesta e suggerimento contestuale.
4. Modello più capace quando il caso richiede ragionamento/visione aggiuntivi e il budget è autorizzato.
5. Chiarimento o tutor quando la lettura è incerta o il verificatore non copre il passo.

Ogni provider è un adapter, non un motore didattico alternativo. La scelta iniziale avviene su una piccola batteria cieca di casi Fisica/Analisi: errori di segno, unità, testo ambiguo, metodo alternativo, prompt injection e risposta impossibile. Loggare costo/latency/astensione/tempo di revisione; non prendere il modello più grande per tutti i task né quello locale per ogni risparmio presunto.

I prezzi delle vecchie conversazioni non sono il listino del nuovo servizio. Il ledger usa una scheda provider/versione/costo verificata e data. Costo sconosciuto → richiesta disabilitata, non estimator generico di un altro provider. No quote illimitate; configurazione iniziale del pacchetto consente zero spesa esterna fino al budget confermato. Non leggere/esporre chiavi solo per fare una demo.

## Memoria invece di lunghi prompt
Contesto = attività/versione + passaggio selezionato + pochi estratti autorizzati + ultimo tentativo pertinente + policy di aiuto. Non inviare ogni volta la storia completa o il manuale. Cache per fonte+pipeline+tenant+policy; invalidazione quando cambia la fonte o l’accesso. ASR una volta per file/versione; elaborazioni lunghe in coda. Il Mac mini M4/16GB può sperimentare un adapter locale, ma non è requisito di disponibilità pubblica né ha un benchmark di concorrenza certificato qui.

## Correzione multimodale
Upload → regioni/sequenze → lettura proposta → conferma/correzione → tentativo strutturato → verifica nel perimetro → feedback. Originale sempre recuperabile. La correzione di «8» letto come «3» crea nuova lettura; non cambia di nascosto i bytes dell’immagine. Un risultato matematico controllato su lettura errata non diventa un elaborato verificato.

La risposta mostra prima un aiuto breve e il motivo del controllo; il dettaglio si apre. Lo studente può chiedere una spiegazione più verbale o un altro metodo. Il sistema non manipola dati per mantenere l’utente nel corso. Eventuali domande urgenti al tutor sono in coda con tempi di servizio dichiarati, non «risposta umana immediata 24/7».

## Fisica Semestre Filtro: primo CoursePack
Programma 2026/27 confrontato con pagina istituzionale UniBo; accesso diretto al PDF MUR fallito (403) in questa verifica. La mappa conserva metodi della fisica, meccanica, fluidi, onde, termodinamica, elettricità/magnetismo, radiazioni. CFU non sono frequenze attese dei quesiti. Regole d’esame e calendario del pack precedente restano da certificare su fonte completa prima del claim «simulatore fedele 2026».

Le due copie dei fascicoli 2025 ospitate da WAU sono state lette e controllate visivamente su pagine campione. Servono per classificare tipi di ragionamento e ambiguità, non per inferire la probabilità dei temi futuri. Nel secondo fascicolo Q10 mostra due opzioni stampate uguali: il dataset deve ammettere `AMBIGUOUS_SOURCE`, non punire automaticamente chi seleziona una risposta equivalente. Nessuna dichiarazione di annullamento ufficiale.

Alpha Test, Testbusters e Futura: schede/indici e combinazione manuale-pratica-digitale sono benchmark, non testi da copiare. La revisione commerciale non è lettura integrale dei libri. Materiali già in Drive/GitHub rimangono candidati con paternità, licenza, hash e revisione; estrazione PDF degradata va ricontrollata sull’originale. Non serve una nuova banca di migliaia di quiz prima del corso.

## Mini-corso pilota proposto — Fluidi e ragionamento fisico
**Incontro 1:** unità, area/raggio, portata/velocità e analisi dimensionale. Attività: previsione prima dello slider e conversioni di area.
**Incontro 2:** equilibrio dei fluidi, pressione assoluta/relativa e galleggiamento. Elaborato con diagramma e convenzioni dichiarate.
**Incontro 3:** continuità, Bernoulli vs Poiseuille, ipotesi e «che cosa resta costante». Laboratorio core del primo rilascio.
**Incontro 4:** problemi misti nuovi e trasferimento, diagnosi finale e prossimo modulo consigliato solo se utile.

Le sei ore non sostituiscono tutto Fisica. Ogni incontro: breve pretest, modello visuale, ragionamento individuale, confronto dei passaggi, nuova situazione. Compiti mirati prima/dopo; un numero definito di revisioni umane incluso, non correzione senza limiti.

## Laboratorio Poiseuille originale
Modello: fluido newtoniano, moto laminare stazionario, tubo cilindrico, lunghezza e viscosità esplicite. `Q = π r⁴ Δp / (8 η L)`. È un modello ideale, non un consiglio clinico o rappresentazione universale del sangue.

Modo A, Δp fissata: cambiare r con rapporto k cambia Q con k⁴. Modo B, Q fissata: cambia Δp con 1/k⁴. Variando anche L, le relazioni cambiano e il pannello indica la grandezza imposta. Un raddoppio contemporaneo di r e L con Q fissata dà Δp/8. Con r×1.2 e L invariata, Q×2.0736 a pressione fissa. Lo studente deve prevedere prima del movimento, spiegare dopo e risolvere un caso con numeri diversi. Il movimento dello slider non vale come risposta corretta.

## Analisi 1 come prima estensione reale
Un secondo template originale usa Taylor e cancellazioni: grado di espansione, ordine del resto, dominio e verifica del limite. Mostrare più gradi senza sottrazioni numeriche instabili interpretate come verità. Soluzione simbolica con ipotesi; near-zero floating plot dichiarato illustrativo. Stesso schema di attività e consegna del primo pack, non nuovo database. Matrici/algebra e altri temi possono iniziare in modalità manuale supportata.

## Ricerca e valutazione
SciSpace è stato usato per scoperta; le conclusioni principali sono controllate sulle fonti primarie. Il RCT di Kestin et al. (Scientific Reports, 2025) riguarda lezioni universitarie specifiche e tutoring strutturato: sostiene l’attenzione al progetto didattico, non la superiorità di ogni chatbot. aiPlato (preprint 2026) studia feedback per passi in un pilot e segnala selezione volontaria: non stabilisce causalità. Queste fonti non provano che il nostro mini-corso aumenti voti o ricavi.

Misurare prima/dopo con problemi nuovi, aiuti richiesti, tempo tutor e un piccolo controllo differito. Il primo gruppo da dieci è un pilot descrittivo, non una prova statistica definitiva; nessun «+X% garantito». Le domande di validazione non devono coincidere con il materiale usato per adattare i prompt. Test software automatici possono verificare il calcolo e raccogliere misure, non sostituire una prova d’uso umana.

Fonti: syllabus/exam1/exam2/alpha/tb/futura/kestin/aiplato in SOURCES. Nessun manuale o fascicolo completo è redistribuito nel pacchetto.

## Addendum V4 — Diario degli errori e apprendimento
La classificazione degli errori è uno **strumento didattico**: osservazione AI `PROPOSED`, verifica calcolo `CHECKED_IN_SCOPE`, eventuale review tutor `REVIEWED_BY_TUTOR`. Il sistema può consigliare un esercizio nuovo, ma non dichiarare `VERIFIED_RESOLVED` senza tentativo diverso e rubrica nel perimetro corretto. Passify offre già un quaderno degli errori; la proposta di Ardesia è renderlo sensibile al passo, alla sorgente e alla lezione. Non associare un valore di “mastery” senza verifica. Disegni e formule trascritti devono essere confermati quando l'ambiguità cambia il risultato.
