# calorimeter-capacity-171 — revisione indipendente per ID

Primaria source-only congelata prima di candidati, opzioni, chiavi e SVG: editorial/reviews/u5-calorimetry-169-172-primary-source-only.md, SHA256 9419530459f9ec798423a08160d73cf87506dba711d718c1fab983961a77340a. Tutti i 64 originali delle quattro famiglie sono stati risolti individualmente prima di aprire i candidati. Il primo estratto storico contaminato di 168-01 è escluso dalla mia ownership: 168 è affidato al ROOT.

Lettura distinta completa di prompt, opzioni, svolgimenti, formule, hint, feedback e riferimenti didattici. Finali dell’autore 955436596da3ed30259421fc62e7f4073a4783f6 confrontati byte per byte con package, binding e SVG effettivi ROOT. Firme congelate soltanto dopo la rilettura dei byte finali. Nessun modulo di authoring importato; nessun candidato o asset modificato dal revisore.

La rimozione delle scale pixel visibili in 62b05381 è stata riletta come distinzione fra coordinate intrinseche SVG e dimensioni fisiche. Successivamente sette etichette zero sovrapposte agli assi sono state segnalate all’autore e rilette fuori dalle aste nel finale 95543659, con geometria quantitativa invariata. Le immagini complete indipendenti prima e dopo sono conservate con checksum nella cartella u5-calorimetry-169-172-svg-independent-evidence. Sono letture dei soli asset, non UI del prodotto né accettazione di un runtime.

Finding scientifico 16: l’esempio m_h=m_c=1 g produce 35 °C, non 32 °C. Correzione dell’autore 247c48c64c18ee1d4e6aa698c14a20d339ba26d7 riletta nel feedback/error finale; gli altri 15 record e tutte le chiavi, formule e geometrie restavano invariati.

Esiti automatici e concettuali restano distinti: EXACT_ORACLE per quantità esatte derivate con SymPy/Pint/Fraction; AI_CONCEPTUAL per leggi o enunciati letti separatamente e legati alle firme. Le prove di rinnovamento dei token sono solo controprove di test: non autorizzano una nuova lettura automatica di prose cambiate. Le controprove rilegano chiavi sbagliate e tutti i token per testare l’oracolo matematico, mentre una prova fisica falsa con chiave corretta è bloccata dalla lettura congelata.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessun credito browser o pubblicazione è assegnato da questa revisione.

## AR-u5-calorimeter-capacity-01

Derivazione e calcolo manuale: C_r/c=2 g è la massa equivalente. Con m_h=m_c=2 g: θ=[160+20·4]/6=40 °C. Il caldo cede 80 J, freddo e recipiente 40 J ciascuno.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 50 trascura il recipiente; 20 o 80 perdono un contributo positivo; 60 richiederebbe 160 J freddi contro 40 J ceduti.

Revisione didattica: Ricostruzione del bilancio prima della sostituzione, con risultato e unità della grandezza richiesta.

Figura: Primo pannello schematico dei tre contributi: caldo 80→40 °C, freddo e recipiente 20→40 °C. La barra lunga 400 unità intrinseche rappresenta 80 J ceduti e i due segmenti lunghi 200 ciascuno rappresentano 40+40 J ricevuti, dalla stessa origine. Nel terzo, lunghezze 240, 264 e 252 rappresentano 40, 44 e 42 °C. Zero Celsius distinto da zero assoluto; XML e immagine intera finali letti, con i due zeri fuori dalle aste.

Modalità: EXACT_ORACLE. Risultato indipendente: `40`. Firma finale: `8e43f1bd6dfccef1d1160be2b7d50ff3811d715ec01367b9ceb00d27aeb12823`.

## AR-u5-calorimeter-capacity-02

Derivazione e calcolo manuale: Il termometro dà °C; J/K e J/(g·K) misurano rispettivamente capacità totale e calore specifico.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: J/K è capacità, J/(g·K) calore specifico, g massa e J energia; °C misura la lettura.

Revisione didattica: Dimensione della grandezza distinta dalle altre quantità del problema e dalla scala dell’unità.

Figura: not attached to this record

Modalità: AI_CONCEPTUAL. Risultato indipendente: `°C`. Firma finale: `3fb681d9b3f5e87eb352fc1aadd1b4529a7832f87f341a7cbdfcd86a50fd1d0b`.

## AR-u5-calorimeter-capacity-03

Derivazione e calcolo manuale: Principio zero: T_B=T_A e T_C=T_A implicano T_B=T_C. Non ne seguono uguale energia interna, massa o capacità. Il termometro è stabile e non perturbante.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: Uguale temperatura non implica uguale energia interna, massa o calore specifico; il flusso netto obbligatorio contraddice l’equilibrio.

Revisione didattica: Caso speciale o legge motivati con le ipotesi pertinenti, senza usare la chiave come prova.

Figura: not attached to this record

Modalità: AI_CONCEPTUAL. Risultato indipendente: `B e C hanno la stessa temperatura e sono in equilibrio termico fra loro`. Firma finale: `2aaba1485e162656e01a539877276cdb8d8561edf21446882e77e005db684955`.

## AR-u5-calorimeter-capacity-04

Derivazione e calcolo manuale: Con m_h=4 g e m_c=2 g, caldo e lato freddo hanno entrambi 4 J/K: finale 50 °C, contro 40 in A.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 80 raddoppia la lettura, 20 la dimezza, 40 ignora la nuova massa; 60 richiede un peso caldo maggiore. Il recipiente non raddoppia.

Revisione didattica: Confronto controllato con distinzione fra ingresso modificato e risposta complessiva.

Figura: not attached to this record

Modalità: AI_CONCEPTUAL. Risultato indipendente: `Da 40 a 50`. Firma finale: `974ccca8225d570b50d35aecac9a14176f04faed01473a691671acdbbbdf9288`.

## AR-u5-calorimeter-capacity-05

Derivazione e calcolo manuale: m_h=(m_c+2 g)(θ−20)/(80−θ)=4·20/40=2 g.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 1 g omette il recipiente; 4 g copia la massa equivalente fredda senza il rapporto degli intervalli; massa negativa esclusa.

Revisione didattica: Inversa svolta dal bilancio e verificata nel dominio positivo.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `2`. Firma finale: `84bd8019b5c103fef56444bcbde28c8579f6a8e425e05de54207e9ace6acb359`.

## AR-u5-calorimeter-capacity-06

Derivazione e calcolo manuale: m_c=m_h(80−θ)/(θ−20)−2 g=2·40/20−2=2 g. L’inversa deve restituire massa strettamente positiva.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 4 g include il recipiente nella sostanza; 6 g aggiunge m₀ anziché sottrarla e zero non riproduce 40 °C.

Revisione didattica: Seconda inversa con unità e condizioni di esistenza esplicite.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `2`. Firma finale: `1ec5389f103d96d22a0d7a1fe45ffeea359008a1fcc073343e7df3813efa5d67`.

## AR-u5-calorimeter-capacity-07

Derivazione e calcolo manuale: B con m_h=2 e m_c=4 g dà θ=(160+120)/8=35 °C; 35/40=7/8.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 8/7 è il reciproco; 2 e 1/2 seguono il solo freddo, mentre 1 ignora la maggiore capacità inizialmente fredda.

Revisione didattica: Entrambe le letture ricostruite prima del rapporto e letture Celsius distinte da kelvin.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `7/8`. Firma finale: `01bdea0f84fc249a60bab2a890a5124c47d342e123a1c67955bef1bd9f943c27`.

## AR-u5-calorimeter-capacity-08

Derivazione e calcolo manuale: Proposta meno corretta: 80−40=+40 K; alla proposta il caldo non cederebbe energia, pur dovendo scaldare gli altri due contributi.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: −40 inverte l’ordine, 80 copia la proposta, zero la accetta; 2 è il rapporto, non la differenza.

Revisione didattica: Ordine dello scarto esplicito; differenza distinta da rapporto e da punto termometrico.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `40`. Firma finale: `e67849663fd4a7365199d828c25cb758a82569b7edaacc453ef42e3c2f416ff1`.

## AR-u5-calorimeter-capacity-09

Derivazione e calcolo manuale: Raccolgo c e uso m₀=C_r/c: m_h=(m_c+m₀)(θ−20)/(80−θ). Le due masse equivalenti hanno entrambe unità g.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: Omettere m₀ elimina una capacità reale; il reciproco scambia salti e −m₀ attribuisce un contributo negativo al recipiente.

Revisione didattica: Inversa simbolica con controllo delle unità e della divisione lecita.

Figura: not attached to this record

Modalità: AI_CONCEPTUAL. Risultato indipendente: `m_h = (m_c + m₀) (θ_f − 20) / (80 − θ_f)`. Firma finale: `9f402bf9ed1bf2b92a1f4504b7e0910bf108f30395468f5be2ecec46e9e3f7f0`.

## AR-u5-calorimeter-capacity-10

Derivazione e calcolo manuale: La lettura è N/D e quella nuova N_B/D_B, con m₀ fisso: rapporto N_BD/(D_BN). Un fattore comune sulle sole porzioni non si cancella in generale.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: Prodotto o quoziente dei fattori ignorano il recipiente fisso; N_B/N omette D_B e D_B/D omette N_B.

Revisione didattica: Sostituzione dei fattori nel modello completo prima di cancellare termini.

Figura: not attached to this record

Modalità: AI_CONCEPTUAL. Risultato indipendente: `N_B D / (D_B N)`. Firma finale: `3fb8c808dd050ef90beb74a8dc59b867bb02af453054f1eb436adbdb9c85a10f`.

## AR-u5-calorimeter-capacity-11

Derivazione e calcolo manuale: B con 4 g e 4 g dà θ=(320+120)/10=44 °C; 44/40=11/10.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 1 varrebbe se anche il recipiente raddoppiasse; 2 raddoppia la lettura, 10/11 è il reciproco e 44 copia θ_B.

Revisione didattica: Entrambi gli ingressi modificati usati nel medesimo bilancio prima del rapporto.

Figura: Primo pannello schematico dei tre contributi: caldo 80→40 °C, freddo e recipiente 20→40 °C. La barra lunga 400 unità intrinseche rappresenta 80 J ceduti e i due segmenti lunghi 200 ciascuno rappresentano 40+40 J ricevuti, dalla stessa origine. Nel terzo, lunghezze 240, 264 e 252 rappresentano 40, 44 e 42 °C. Zero Celsius distinto da zero assoluto; XML e immagine intera finali letti, con i due zeri fuori dalle aste.

Modalità: EXACT_ORACLE. Risultato indipendente: `11/10`. Firma finale: `819854bae096977a5be1637499e76f7cc21121f266f7cfd74bd98ddac04312fa`.

## AR-u5-calorimeter-capacity-12

Derivazione e calcolo manuale: Media=(40+44)/2=42 °C. Le masse medie 3 g e 3 g darebbero (240+100)/8=85/2 °C.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 85/2 usa le masse medie, 84 è la somma, 4 la differenza e 50 trascura il recipiente. Non avviene un nuovo contatto fisico.

Revisione didattica: Media delle uscite distinta dal modello agli ingressi medi e da un contatto fisico nuovo.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `42`. Firma finale: `b369c433fa480623f08c97a01b0c9568ffd9cbf372db5ae74939ce1401ddaf58`.

## AR-u5-calorimeter-capacity-13

Derivazione e calcolo manuale: B deve arrivare a 44 °C. La massa fredda vale 4·36/24−2=4 g; rapporto con 2 g iniziali uguale a 2.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 1/2 inverte il rapporto; 11/10 segue le letture; 3 include il recipiente usando 6/2 e 4 non divide la massa B per A.

Revisione didattica: Bersaglio ricostruito prima dell’inversa; valore dell’ingresso distinto dal suo rapporto.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `2`. Firma finale: `241e9c4f89cc26dcadac7d88101fa5c542694dee9af1113a767b6e5189137dd1`.

## AR-u5-calorimeter-capacity-14

Derivazione e calcolo manuale: q=120/40=3; S=132 dà θ=44. Con m_c=4 g, m_h=6·24/36=4 g.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 6 g copia la massa equivalente fredda; 8/3 g omette il recipiente; 132 non è né temperatura né massa.

Revisione didattica: Taratura del display continuo separata dall’inversa fisica e dall’offset termometrico.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `4`. Firma finale: `8f07e56dd11616e4a391838bb2d470b3b61f77df4954b9ce947165bab396ddba`.

## AR-u5-calorimeter-capacity-15

Derivazione e calcolo manuale: q=(89−81)/(44−40)=2, b=1; S=101 dà θ=50 e m_h=(2+2)·30/30=4 g.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: 244/59 g omette l’offset e usa 50,5 °C; 2 g omette il recipiente, 6 g non bilancia salti uguali e 50 copia θ.

Revisione didattica: Guadagno e offset strumentali ricavati da due riferimenti prima di ricostruire la grandezza.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `4`. Firma finale: `12f02231e2d05fe1230cf93b441fe8369cc065b0edd4ae7d41bc18dc899853d4`.

## AR-u5-calorimeter-capacity-16

Derivazione e calcolo manuale: Con m_h=m_c=m, θ=(100m+40)/(2m+2). Imporre 40 dà m=2 g, unica positiva. Controprove finali: m=1 g dà 35 °C e m=4 g dà 44 °C.

Ipotesi e dominio: Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.

Distrattori: La capacità fissa dà una sola massa di 2 g. 4 g producono 44 °C, 1 g produce 35 °C (fix distinto riletto) e −2 g viola il dominio.

Revisione didattica: Vincolo sostituito prima di decidere unicità e rami ammessi; preparazioni distinte dal tempo interno del processo.

Figura: not attached to this record

Modalità: EXACT_ORACLE. Risultato indipendente: `2`. Firma finale: `136d8271afa1511aff8de8721d30848ced71c1cfd57e8872cb33bc1df709d45b`.
