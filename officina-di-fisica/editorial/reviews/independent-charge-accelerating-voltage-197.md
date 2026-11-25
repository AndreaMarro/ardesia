# Revisione indipendente charge-accelerating-voltage-197

Primaria completa degli 80 prompt U6-01 letti e risolti prima di candidati, opzioni e chiavi: SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, copia byte-identica in u6-independent-195-199-fixtures-20261125/primary-source-only.md. Originale ROOT primary-electric-195-199-before-candidates-20261125.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Nessuna esposizione alle chiavi U6 altrui prima della primaria; messaggi successivi di consegna limitati a SHA, file e ipotesi generali.

Successivamente ho letto integralmente e individualmente ogni campo dei sedici record finali: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie, confrontando i dati con la derivazione primaria. Sono stati letti tutto l’XML e il rendering nativo integrale dell’SVG effettivamente prodotto con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Il pin finale letto è 48744edef2aa133813c6a23500422343a902a311. La fixture è copia esatta dei byte Git e dell’asset verificato contro il payload; non sostituisce l’integrazione ROOT.

Riletti catalogo reale C4-L02/L03 e prerequisiti di meccanica: forza elettrica, legge oraria, equilibrio e lavoro/energia sono distinti. C1-L007 è pertinente per il bilancio energetico197; le condizioni non relativistiche si controllano sui dati delle prove effettive. Ogni vincolo fra preparazioni è distinto dalla legge temporale nella singola prova.

Gli oracoli SymPy derivano leggi, inverse, fattori, tarature e vincoli; Pint/Fraction controllano unità e prefissi esatti. Il decoder AST dedicato electric_exact_literals.py legge i lessemi numerici originali e non ricostruisce decimali da float binari. Il suo SHA256 è vincolato nel verificatore e riportato in ogni record, con rifiuto se cambia; nessuno dei decoder legacy o entropy_state_review è modificato. Nessun modulo autore importato o usato per ottenere le risposte.

## Prova individuale

### AR-u6-charge-accelerating-voltage-01

qU=(1 μC)(2 kV)=2 mJ. Da fermo e con solo lavoro elettrico mv²/2=qU: v²=4 m²/s². La rapidità positiva è 2 m/s, distinta dalla componente orientata della velocità.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 4 m/s confonde v² e v; 1 m/s darebbe K=1/2 mJ; 2 km/s tratterebbe 1 μC come 1 C: fattori 10⁶ in energia e 10³ in rapidità. Il fix01 finale è riletto contro la sostituzione diretta, non copiato dalla chiave.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-02

J/kg=m²/s² e la radice dà m/s. Dopo la primaria prompt-only ho letto tutte le cinque alternative: m/s è l’unica unità di rapidità; m/s² è accelerazione e joule è energia.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: m/s² è accelerazione; J energia; V potenziale; C carica. Solo m/s ha dimensione di rapidità.

Esito indipendente: m/s. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-charge-accelerating-voltage-03

Il lavoro del campo è q(V_A−V_B)=qU>0. K_i=0 e nessun altro lavoro danno mv²/2=qU; moltiplico per 2/m>0 e prendo la radice positiva. La relazione presuppone velocità non relativistica.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 2qU/m è v²; omettere 2 dimezza v² e non v; invertire m/(qU) dà dimensione inversa di v². Il quoziente qU/m senza radice non è una rapidità.

Esito indipendente: v = √(2 q U / m). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-charge-accelerating-voltage-04

A massa fissa quadruplicare U da 2 a 8 kV quadruplica v²: v passa da 2 a 4 m/s, non a 8. Entrambe le prove restano non relativistiche.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 8 m/s rende lineare U; 1 m/s rende inversa la radice; 2 ignora il cambio; 16 applica un quadrato spurio.

Esito indipendente: Da 2 a 4 m/s. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-05

U=mv²/(2q). Con 1 g, 2 m/s e 1 μC il lavoro è 2 mJ e la caduta richiesta 2 kV. Il denominatore q è positivo.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: Raddoppiare l’inversa o perdere il mezzo non ricostruisce qU=mv²/2. La tensione ha V, non J.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-06

m=2qU/v²=2(1 μC)(2 kV)/(4 m²/s²)=1 g. Massa positiva e v² non nullo; la carica non è una massa.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: Invertire v² o scambiare carica e massa cambia dimensioni e bilancio. 1 kg perderebbe il fattore mille.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-07

U dimezzata a 1 kV lascia v_B=√2 m/s. Rapporto con 2 m/s: √2/2. Mantengo il radicale esatto, senza decimali.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 1/2 usa direttamente il rapporto di U; 2 e √2 invertono; 1 ignora la variazione.

Esito indipendente: sqrt(2)/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-08

Proposta 4 m/s meno rapidità corretta 2 m/s=+2 m/s. Il rapporto puro 2 non è lo scarto richiesto.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: −2 inverte lo scarto; 4 copia la proposta; zero accetta l’errore; 2 puro è rapporto e manca l’unità della differenza.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-09

Da mv²/2=qU divido per q>0: U=mv²/(2q). kg·m²/s²/C=J/C=V. Non invertire l’intero rapporto.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: Gli altri rapporti non isolano U: omettere 2 raddoppia la caduta, invertire dà 1/V e usare v anziché v² altera dimensioni.

Esito indipendente: U = m v² / (2 q). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-charge-accelerating-voltage-10

Nel rapporto v_B/v_A la carica fissa si cancella: il quadrato della rapidità cambia di κ₁/κ₂, quindi il modulo cambia di √(κ₁/κ₂). I fattori sono positivi e le due prove sono esplicitamente nel dominio non relativistico.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: κ₁/κ₂ omette la radice; √(κ₂/κ₁) inverte; κ₁κ₂ rende diretta la massa; κ₁/√κ₂ perde la radice su U.

Esito indipendente: √(κ₁/κ₂). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-charge-accelerating-voltage-11

A ha v=2 m/s. B con U=9 kV e m=2 g ha v²=9 m²/s², quindi v=3 m/s. Rapporto 3/2.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 2/3 reciproco; 9/2 è rapporto dei quadrati; 1/2 segue solo la massa e 1 ignora entrambi i cambiamenti.

Esito indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-12

Le uscite 2 e 3 m/s hanno media 5/2 m/s. Ai dati medi U=11/2 kV e m=3/2 g si ha v²=22/3, dunque √(22/3) m/s. I quadrati differiscono di 22/3−25/4=13/12: le due quantità positive non coincidono, senza approssimazioni.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: √(22/3) usa ingressi medi; 5 somma senza dividere; 1/2 è metà differenza; 3 copia B.

Esito indipendente: 5/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-13

Il bersaglio v_B/v_A=3/2 impone v_B=3 m/s e v_B²=9. Con U_B=9 kV segue m_B=2·9/9=2 g: m_B/m_A=2.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 1/2 inverte masse; 3/2 copia il bersaglio di rapidità, 9/4 ne copia il quadrato senza includere U_B.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-14

Display senza offset: A v=2 dà D=6, quindi a=3 s/m. C D=9 dà v_C=3 m/s; con massa 2 g l’inversa U=mv²/(2q) dà 9 kV.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: D=9 non è una rapidità; usare il valore grezzo darebbe caduta molto maggiore. 9 kV si verifica con v3 e m2.

Esito indipendente: 9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-15

A v=2 e B v=3 con D=5 e 7 danno a=2 s/m e b=1. D_C=9 restituisce v_C=(9−1)/2=4 m/s. Massa 1 g: U_C=8 kV.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.

Distrattori e controprove: 81/8 kV omette l’offset e predice D10; 4/9/16 non producono v4 con massa1 g. La legge è quadratica in v.

Esito indipendente: 8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-charge-accelerating-voltage-16

Fra preparazioni U=αm con α=2 kV/g=2·10⁶ V/kg. Sostituzione: v²=2qα=4 m²/s², indipendente da m>0. Infinite coppie positive soddisfano la misura v=2 m/s, tutte nello stesso regime lento; non si varia la massa durante una prova.

Ipotesi: Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento. Il vincolo tra preparazioni rende la misura ridondante e lascia libera una scala positiva.

Distrattori e controprove: Una singola coppia positiva è un esempio, non identifica la scala. Nessuna coppia è falso perché U2,m1 funziona. Non si tiene U fisso mentre si varia m ignorando il rapporto imposto.

Esito indipendente: Infinite coppie positive. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

## Figura, integrità e limiti

XML e PNG nativo completo effettivamente letti. Barre di lavoro e K finale sono entrambe 2 mJ e larghe200, non energie da sommare. Curva centrale M100830 Q300830500590: parametro x=100+400u,y=830−240u², v=4u e K=8u² mJ, quindi K=v²/2 alla massa fissa1 g. I punti(2,2) e(4,8) sono esatti; è grafico K(v), non traiettoria. Barre finali v2,3,5/2 hanno larghezze200,300,250 e origine130; prova B ha massa diversa dalla curva. Testi e zeri separati dagli assi.

Il rendering è asset-only. UI del prodotto e layout a 320 px NOT_RUN in questa review; nessun marker UI generato o copiato. L’approvazione umana rimane NOT_RUN, publication DRAFT e publicationAction NONE. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Per197 il solo radicale annidato effettivamente letto √(22/3) è mappato localmente alla radice razionale esatta, senza eval e senza modificare il decoder condiviso congelato195/196.

Verifier SHA256 e44decedbd1a8926b62671c66f8d39c2746b22a3402db5f9c130fe666fc5b9c6. Decoder SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc. Package canonico SHA256 17d626552a2e5885c1172b653f271504378510054ff43cd2e461d392638b9b26. Binding canonico SHA256 8bc2d2840d75ed99f5c9238a3855c755a6e1195e552cc7cb44c090a8b36a4f3b. Report SHA256 8f0ed13bc2f83cc1c26dd7442c9fca7ae2fb1772867cb0788bf428aec9ba14dc.

## Rilettura finale del finding01

Il testo precedente98944e2 attribuiva1 m/s alla perdita del fattore2 e2 km/s alla conversione g/kg. Le controprove indipendenti mostrano invece che omettere2 sotto radice dà√2 m/s, mentre1 m/s ha energia1/2 mJ. Il fattore1000 nella rapidità nasce trattando1 μC come1 C, cioè10⁶ nel lavoro. Riletto il finale48744edef2aa133813c6a23500422343a902a311 e confrontati i byte: solo ultimo blocco/error01 e binding01 diversi, altre15 schede e tutti asset/chiavi/formule immutati. Nessun finding residuo. La curvaK(v) e i domini delle inverse sono stati controllati separatamente dalla chiave.

## Controlli automatici realmente conclusi

Run comune dei48 record:13 test PASS, exit0,2,953 s. Respinte75 mutazioni di pacchetto, incluse48 chiavi errate con binding/token/pin aggiornati solo in memoria, e3 guasti alle leggi costitutive. Provate240 configurazioni Hypothesis,48 combinazioni di argomenti non finiti/non reali e ulteriori limiti non positivi; identità canoniche fresh e saved, lessemi esatti, SHA del decoder, provenienza Git e geometrie quadratiche controllati. Il test197 contro velocità almeno c rifiuta un limite certamente esterno al modello: non pretende che qualsiasi velocità inferiore a c sia non relativistica. Il dominio lento rimane un’ipotesi esplicita e i dati effettivi producono pochi m/s. Log autentico electric-197-199-independent-tests-20261125.txt. Nessuna UI prodotto o suite completa locale, human NOT_RUN, publication DRAFT.
