# Riesame indipendente · cinque laboratori classici

Letti integralmente i cinque record `LAB-C1` … `LAB-C5` dal commit
`5d1dc8dc7b601aef959d10d564c75462be74708d`, file
`officina-di-fisica/content/labs.json`. Il revisore AI non ha scritto questi
originali, né li ha modificati. La lettura comprende ogni blocco, la previsione,
l’osservazione e l’interpretazione; non si basa su chiavi preesistenti.

Il file sorgente verificato è di **6308 byte UTF-8 / 6241 caratteri**, con digest
SHA-256 `b8f94d6ee2b4794bea54b51f53e339da53ee635d4074d546a6afb15e732e61ab`.
I cinque digest dei record, diversi dal digest del file, sono congelati nel
verificatore dopo la lettura. Una modifica al testo, anche con legge e risultato
invariati, invalida questo giudizio. Sono inoltre congelati i quattro file del
consumer letti: `static/js/models.js`, `static/lab-models.json`,
`static/js/labs.js` e `static/js/ui.js`. Il report conserva digest effettivi e
attesi e la SHA del verificatore.

Il riesame riguarda **solo questi cinque laboratori classici e il relativo
modello runtime letto**. Non riguarda i dieci banchi 3D, le 181 esperienze
collegate, l’intero corso, il DOM, l’accessibilità o la comprensione degli studenti.
Non è una nuova edizione o una pubblicazione.

| ID | Ambito di calcolo richiesto allo studente | Esito del riesame indipendente |
|---|---|---|
| LAB-C1 | `EXACT_MANUAL_CALCULATION`: confronto numerico con la soglia d’attrito. | Forze, soglia e riavvio da fermo coerenti; conti esatti finiti. |
| LAB-C2 | `EXACT_MANUAL_CALCULATION`: frazione di portata e divisione di due letture. | Rapporto teorico 1/16; rapporto delle letture arrotondate distinto e fattibile come frazione. |
| LAB-C3 | `NO_STUDENT_CALCULATION`: nessun calcolo numerico autonomo richiesto; confronto di curve e letture. | Ordine delle pressioni e dei lavori, raffreddamento e isocora derivati, non assunti. |
| LAB-C4 | `NO_STUDENT_CALCULATION`: nessun calcolo numerico autonomo richiesto; confronto qualitativo delle cadute e delle letture. | Nodi, corrente comune, tensione comune e caso U=0 coerenti. |
| LAB-C5 | `NO_STUDENT_CALCULATION`: nessun calcolo numerico autonomo richiesto; spostamento dello schermo e costruzione dei raggi. | Ramo reale, limite al fuoco e ramo virtuale derivati separatamente. |

`NO_STUDENT_CALCULATION` significa esclusivamente che il record non domanda un
calcolo numerico autonomo: non significa assenza di fisica o esenzione dalla
prova. Valori presenti nelle tabelle dello strumento non diventano, da soli,
operazioni che lo studente debba eseguire senza calcolatrice.

## LAB-C1 · Il banco delle forze

**Blocchi e modello.** Su piano orizzontale e con trazione orizzontale, la
componente verticale della risultante è nulla: N=mg. Il contatto statico
fornisce la forza necessaria a equilibrare F finché F≤μsN. Il fattore dinamico
μk=0,75μs è una scelta esplicita di questo banco, non una costante universale
per contatti asciutti. Superata la soglia, F−fk=ma.

**Previsione e conto manuale.** Con m=2 kg, g=9,81 m/s² e μs=0,40:
N=2·9,81=19,62 N. Per moltiplicare per 0,40 si può usare 2/5:
19,62·2=39,24 e 39,24/5=7,848 N. Dunque 4<7,848<10. A 4 N il blocco resta
fermo e fs=4 N; a 10 N supera la soglia. Per controllare anche la lettura di
accelerazione, si calcolano tre quarti della soglia: 7,848/4=1,962;
1,962·3=5,886 N. Poi 10−5,886=4,114 N e 4,114/2=2,057 m/s². Non occorrono
radici, funzioni o arrotondamenti intermedi.

**Osservazione e interpretazione.** Prima del distacco la freccia dell’attrito
cresce insieme alla trazione; nel passaggio allo scorrimento scende da circa
7,848 N al valore dinamico 5,886 N. Con massa raddoppiata e trazione ancora
10 N, la nuova soglia è 15,696 N: il blocco non parte. È decisivo il testo
«ogni configurazione riparte da fermo»: non si sta simulando il proseguimento
nel tempo di un vecchio blocco già scorrevole. Il runtime implementa proprio
questa scelta con F>limite per la branca dinamica; l’uguaglianza resta statica.

**Unità e misconcezioni.** N ha unità kg·m/s²; μ è puro; (F−f)/m ha unità
m/s². Rifiutata l’idea che l’attrito statico sia sempre μsN, che la massa non
conti nella soglia o che il fattore 0,75 sia universale. La previsione è libera:
non esistono alternative multiple da marcare come «distrattori superati».

## LAB-C2 · La quarta potenza

**Blocchi e legge.** Le condizioni dichiarate sono quelle del flusso di
Poiseuille: fluido newtoniano incomprimibile, condotto cilindrico rigido,
regime stazionario laminare pienamente sviluppato e parete con no-slip. La
relazione fra portata, differenza di pressione e raggio è coerente con
[OpenStax, Viscosity and Turbulence](https://openstax.org/books/university-physics-volume-1/pages/14-7-viscosity-and-turbulence).
L’oracolo non legge la formula runtime come prova: integra
v(s)·2πs ds da 0 a r e ricava Q=πr⁴Δp/(8ηL). Verifica inoltre v(r)=0 e
v(0)=2v_media. Il fattore r⁴ dà (1/2)⁴=1/16; Δp raddoppiata dà 2Q.

**Unità e controlli.** r in mm va diviso per 1000; η in mPa·s va divisa
per 1000; L=25 cm=1/4 m. Q ha dimensione L³/T, il profilo L/T e Reynolds
è puro. Nel default r=1 mm, Δp=200 Pa, η=4 mPa·s si ricavano
Q=π/40 mL/s e, con r=0,5 mm, Q=π/640 mL/s. Il massimo Reynolds nel dominio
dei controlli è 4000/9<2000, da r=2 mm, Δp=500 Pa, η=3 mPa·s. Questo sostiene
la branca laminare assunta dal modello; non è collaudo di un tubo reale o
delle regioni d’ingresso.

**Divisione effettivamente richiesta nell’osservazione.** `labs.js` usa
`num(Q,4)`, ma l’helper `ui.js` specifica **quattro cifre significative**, non
quattro decimali. Esecuzione del modello e del formatter letto:

- r=1 mm: **0,07854 mL/s**;
- r=0,5 mm: **0,004909 mL/s**.

La divisione a mano può fermarsi a una frazione esatta:
(4909/10⁶)/(7854/10⁵)=4909/78540. Per confrontarla con 1/16 basta il prodotto
incrociato: 4909·16=78544 contro 78540. Pertanto il rapporto delle letture
supera 1/16 di 4/(16·78540)=**1/314160**. Non si richiede una lunga divisione
in decimali, né il calcolo manuale di π.

La prima lettura rappresenta il bin di arrotondamento
[0,078535;0,078545), la seconda [0,0049085;0,0049095). I valori esatti del
modello cadono nei rispettivi intervalli. L’osservazione dà quindi una stima
del rapporto teorico: non viene falsamente dichiarata l’uguaglianza fra il
quoziente dei numeri visualizzati e 1/16. L’iniziale ipotesi del revisore di
«quattro decimali» è stata corretta leggendo l’helper effettivo prima di
congelare il report. I numeri 0,0049 e 0,0785 non sono le letture di questo
runtime: per quelli il conto 49/785 e lo scarto −1/12560 sarebbero corretti,
ma riguarderebbero un altro arrotondamento.

**Osservazione e interpretazione.** Il profilo è esplicitamente normalizzato,
e la scala trasversale è dichiarata ampliata; non si deduce la velocità
assoluta dalla lunghezza delle frecce. Ripristinare r=1 mm e raddoppiare
Δp=200→400 Pa dà Q raddoppiata. A Δp=0 i flussi sono entrambi zero e il loro
rapporto non è definito: il runtime mostra il trattino per il rapporto,
non un valore numerico spurio. Rifiutati i rapporti 1/2 o 1/4 per il raggio,
il raddoppio del profilo normalizzato come misura assoluta e l’identità
fra rapporti teorici e rapporti di letture arrotondate.

Non emerge una richiesta di decimali manualmente impraticabili né un errore
fisico dell’originale che imponga di riscriverlo per dichiarare questo riesame.
Il margine dell’arrotondamento è documentato, senza modificare la consegna.

## LAB-C3 · Il pistone di vetro

**Blocchi e convenzioni.** Stato iniziale 1 L,100 kPa,300 K; gas ideale
monoatomico, equilibrio lungo il cammino e pistone senza attrito. Il lavoro
del gas è positivo in espansione. kPa·L=J; U=3pV/2 e ΔU=Q−W hanno le unità
e il segno corretti. Da Q=0 e dU=−p dV si ricava dp/p=−(5/3)dV/V, quindi
pV^(5/3)=costante. Il confronto con l’isoterma è coerente con
[OpenStax, Adiabatic Processes for an Ideal Gas](https://openstax.org/books/university-physics-volume-2/pages/3-6-adiabatic-processes-for-an-ideal-gas).

**Previsione.** Posto u=V/Vi>1, p_ad/p_iso=u^(−2/3)<1. A V=2 L
l’isoterma arriva a 50 kPa; l’adiabatica a 100/2^(5/3) kPa, inferiore.
L’adiabatica scende quindi di più. L’ordine delle curve vale su tutto il
cammino 1<V≤2, non soltanto per un punto finale campionato.

**Osservazione e interpretazione.** Integrando indipendentemente le due
pressioni si ottiene W_iso=100 ln2 J e
W_ad=150[1−2^(−2/3)] J. Entrambi sono positivi e il secondo è minore,
perché l’integrando adiabatico è minore in tutto l’intervallo interno.
T_ad=300·2^(−2/3) K<300 K: l’adiabatica usa energia interna e si raffredda;
la prova simbolica controlla dU/dV=−p lungo l’intero cammino e ΔU+W=0.
Nell’isoterma ΔU=0 implica Q=W. Nell’isocora dV=0 dà W=0: per esempio,
p=150 kPa a V=1 L dà T=450 K,ΔU=Q=75 J. Il runtime rinomina il controllo
come rapporto di pressione proprio in questo modo.

Lo studente deve confrontare curve e letture, non valutare ln2 o una radice
cubica in decimali. I risultati simbolici e numerici di questo paragrafo
sono prove del revisore, non nuovi compiti inseriti nella consegna.
Rifiutate le equivalenze «isoterma=adiabatica», «adiabatica ⇒ lavoro nullo»
e «pressione che cambia ⇒ lavoro non nullo anche a volume fisso».

## LAB-C4 · Due resistori al banco

**Blocchi e modello.** Generatore DC ideale, resistori ohmici positivi,
fili e strumenti ideali. In serie risolvo le tre equazioni indipendenti
V1=100I,V2=200I,V1+V2=6: I=1/50 A,V1=2 V,V2=4 V. La previsione può essere
risolta senza conti: corrente comune e R2>R1 implicano V2>V1.

**Parallelo e osservazione.** I due resistori condividono gli stessi nodi:
V1=V2=6 V. Le correnti sono 3/50 A e 3/100 A, con totale 9/100 A;
Req=200/3 Ω e P=27/50 W. Sono controlli del revisore sulle letture,
non numeri richiesti allo studente. La potenza in serie è 3/25 W.
A U=0 tutte le correnti e cadute sono nulle; aumentando U a resistenze
fisse crescono linearmente. Cambiare un solo resistore conserva l’uguaglianza
di corrente nella serie o di tensione nel parallelo, non i valori numerici.

**Unità e interpretazione.** V/Ω=A e VI=W. Rifiutato il modello secondo cui
in serie il resistore maggiore porterebbe più corrente o in parallelo
avrebbe una caduta maggiore. La previsione è libera e qualitativa; non
sono presenti cinque alternative da verificare. Il disegno del consumer
collega correttamente i componenti ai due nodi nei due casi.

## LAB-C5 · Il banco ottico

**Blocchi e dominio.** Lente sottile convergente in aria, oggetto reale a
sinistra, approssimazione parassiale e convenzione q>0 a destra. Dalla
relazione della lente si ricava q=fp/(p−f), con ingrandimento m=−q/p.
Queste convenzioni e i rami reale/virtuale sono coerenti con
[OpenStax, Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses).

**Previsione e tre casi.** Sul ramo p>f la derivata dq/dp=−f²/(p−f)² è
negativa: avvicinando l’oggetto da p=2f verso f, q aumenta da 2f verso
+infinito. Lo schermo va allontanato a destra e, al fuoco esatto, nessuna
posizione finita raccoglie l’immagine. A p=2f si ha q=2f,m=−1; a p<f si
ha q<0,m>0: immagine virtuale diritta a sinistra. A p=f/2, per controllo,
q=−f e m=2.

**Costruzione e runtime.** Con altezza oggetto unitaria il raggio parallelo,
dopo la lente, segue y=1−x/f; quello centrale segue y=−x/p. L’intersezione
è esattamente q dalla legge della lente. A p=f le pendenze sono uguali:
i raggi emergono paralleli. Il runtime gestisce questo caso con infinito
e ingrandimento non finito, non con una falsa immagine a distanza finita.
Per q<0 sono disegnati i prolungamenti tratteggiati. Il consumer dichiara
che le scale grafiche si adattano e possono differire; il disegno non viene
usato per misurare distanze fisiche con un righello.

Nessun calcolo numerico autonomo è richiesto allo studente: la previsione
riguarda lo schermo e l’osservazione i raggi. Derivata, limiti e punti di
controllo sono la prova indipendente di quelle affermazioni. Rifiutati
«oggetto più vicino ⇒ schermo più vicino», immagine finita al fuoco e
proiezione su schermo dell’immagine virtuale.

## Prove eseguite e limiti

Il report riproducibile contiene **5 record validati e 131 controlli**:
SymPy per equazioni, integrazioni, identità e limiti; Fraction per i conti
esatti e l’arrotondamento; Pint per dimensioni e conversioni; ragionamento
fisico AI esplicito per i confronti qualitativi. I modelli JavaScript
canonici sono stati eseguiti direttamente con Node in **21 configurazioni**
coerenti con la lettura, incluso un valore di soglia del modello di attrito.
Quest’ultimo è un controllo diretto della funzione, non una pretesa che ogni
valore reale sia selezionabile sullo slider. Non è stato aperto un database
privato o avviata una nuova applicazione.

Controprove in memoria, senza modificare il corpus o il runtime:

- cinque mutazioni dei testi di previsione, una per record, respinte dagli
  hash congelati pur conservando tutte le formule;
- cinque uscite runtime errate: attrito statico sempre alla soglia, portata
  dimezzata con potenza errata, lavoro isoterma zero, tensioni diverse in
  parallelo e segno reale per l’immagine virtuale; ciascuna respinta solo
  dal record interessato;
- deriva del digest del runtime respinta per tutti e cinque i record;
- insieme di ID mancanti rifiutato, senza certificare un lotto parziale.

Il report rigenerato dopo le controprove è identico al precedente. Non
sono emersi difetti scientifici concreti negli originali che richiedano
una nuova edizione. L’arrotondamento di C2 è un limite della lettura
strumentale dichiarato nel riesame, non mascherato da un’uguaglianza falsa.

Restano distinti e non eseguiti qui: revisione umana, prova con studenti,
verifica del lettore e collaudo UI di questa sessione. I test applicativi
preesistenti non sono sostituiti da questo oracolo scientifico.
`humanApproval=NOT_RUN`, `publicationAction=NONE`,
`originalEditionRetained=true`. Nessun conteggio viene esteso ai banchi o
alle esperienze collegate.

Riproduzione dalla directory Officina, con il venv canonico che include
SymPy/Pint e Node disponibile: caricare via `git show` il file sorgente alla
SHA indicata, trasformarlo in mappa `{record['id']:record}`, chiamare
`tools.corpus_engineering.lab_activity_verifier.report(sources)` e salvare
JSON con chiavi ordinate. Nessun digest congelato va ricalcolato per
aggirare una modifica: occorre una nuova lettura indipendente dell’edizione.
