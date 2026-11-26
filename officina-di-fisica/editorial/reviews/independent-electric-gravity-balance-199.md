# Revisione indipendente electric-gravity-balance-199

Primaria completa degli 80 prompt U6-01 letti e risolti prima di candidati, opzioni e chiavi: SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, copia byte-identica in u6-independent-195-199-fixtures-20261125/primary-source-only.md. Originale ROOT primary-electric-195-199-before-candidates-20261125.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Nessuna esposizione alle chiavi U6 altrui prima della primaria; messaggi successivi di consegna limitati a SHA, file e ipotesi generali.

Successivamente ho letto integralmente e individualmente ogni campo dei sedici record finali: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie, confrontando i dati con la derivazione primaria. Sono stati letti tutto l’XML e il rendering nativo integrale dell’SVG effettivamente prodotto con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Il pin finale letto è e82f91ab990e0c43ca7073dd7492aa2ba23fbfd0. La fixture è copia esatta dei byte Git e dell’asset verificato contro il payload; non sostituisce l’integrazione ROOT.

Riletti catalogo reale C4-L02/L03 e prerequisiti di meccanica: forza elettrica, legge oraria, equilibrio e lavoro/energia sono distinti. C1-L007 è pertinente per il bilancio energetico197; le condizioni non relativistiche si controllano sui dati delle prove effettive. Ogni vincolo fra preparazioni è distinto dalla legge temporale nella singola prova.

Gli oracoli SymPy derivano leggi, inverse, fattori, tarature e vincoli; Pint/Fraction controllano unità e prefissi esatti. Il decoder AST dedicato electric_exact_literals.py legge i lessemi numerici originali e non ricostruisce decimali da float binari. Il suo SHA256 è vincolato nel verificatore e riportato in ogni record, con rifiuto se cambia; nessuno dei decoder legacy o entropy_state_review è modificato. Nessun modulo autore importato o usato per ottenere le risposte.

## Prova individuale

### AR-u6-electric-gravity-balance-01

Asse +y verso l’alto: qE−mg=0. 1 mg=10⁻⁶ kg, q=2·10⁻⁶ C e mg=10⁻⁵ N; E=mg/q=5 N/C. Le forze non sono singolarmente nulle.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 10 N/C omette la carica2;5000 N/C tratta1 mg come10⁻³ kg; campo nullo non può sostenere il peso non nullo.

Esito indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-02

Dal rapporto peso/carica segue N/C, equivalente a V/m. Lette tutte le alternative dopo la primaria: N è forza, C carica, kg massa e V potenziale, non campo.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: N forza,C carica,kg massa,V potenziale. Il campo equivale a V/m, non V.

Esito indipendente: N/C. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-electric-gravity-balance-03

La componente della forza elettrica su q>0 è +qE, il peso è −mg. Equilibrio significa somma nulla, quindi E=mg/q>0. Non si tratta di azione e reazione su corpi differenti né di una prova di stabilità.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: q/(mg) dàC/N;mgq dàNC;m/(qg) cambia dimensione;−mg/q darebbe forza verso il basso su qpositiva.

Esito indipendente: E = m g / q. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-gravity-balance-04

Con q=2 μC fisso, m da 1 a 3 mg triplica il peso: campo richiesto da 5 a 15 N/C. Il nuovo campo è preparato per un altro equilibrio.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 5/3 inverte massa;10 raddoppia anziché triplicare;5 ignora cambio;45 applica quadrato del fattore3.

Esito indipendente: Da 5 a 15 N/C. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-05

m=qE/g=(2 μC)(5 N/C)/(10 m/s²)=10⁻⁶ kg=1 mg. Dividere una forza per g produce massa.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 10 mg omette divisione per g;1 g perde mille; non si sommano carica e campo per ottenere massa.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-06

q=mg/E=(10⁻⁵ N)/(5 N/C)=2·10⁻⁶ C=2 μC. Il segno positivo dà la forza verso l’alto nel campo dato.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: mgE non ha C;2 C perde micro;1 μC sostiene metà peso;segno negativo darebbe forza verso il basso.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-07

Stesso peso e carica dimezzata 2→1 μC: E deve raddoppiare 5→10 N/C. Rapporto 2.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 1/2 segue carica direttamente;1 ignora variazione;4 introduce quadrato;−2 non è rapporto di moduli positivi.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-08

Proposta 10 N/C meno corretto 5 N/C=+5 N/C. Il numero puro 2 è il rapporto, non la differenza dimensionata.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: −5 inverte scarto;10 copia proposta;0 l’accetta;2 puro non è differenza di campi.

Esito indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-09

Da qE=mg si divide per g>0: m=qE/g. N/(m/s²)=kg. Nei numeri m[mg]=q[μC]E[N/C]/10 perché entrambi i prefissi introducono 10⁻⁶.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: qEg è kg per g²;g/(qE) dà kg⁻¹;E/(qg) dàkg/C²;q/(Eg) non dàkg. SoloqE/g isola m.

Esito indipendente: m = q E / g. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-gravity-balance-10

Con m_B=κ₁m_A e q_B=κ₂q_A, E_B/E_A=κ₁/κ₂. g si cancella; fattori uguali lasciano il campo invariato.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: Prodotto rende diretta q;reciproco inverte prove;somma vale2 per prove uguali;κ₂² è quadrato assente.

Esito indipendente: κ₁/κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-gravity-balance-11

A:10·1/2=5 N/C. B:10·2/1=20 N/C. Rapporto 4, fattore due del peso per fattore due dovuto alla carica dimezzata.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 2 considera un solo cambio;1/4 reciproco;1/2 segueq nel verso sbagliato;1 presume compensazione inesistente.

Esito indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-12

Media dei campi (5+20)/2=25/2 N/C. Il modello ai dati medi m=q=3/2 nelle rispettive unità dà 10 N/C, diverso di 5/2 N/C.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 10 usa ingressi medi;25 non dimezza;15/2 è metà differenza;5 copia A.

Esito indipendente: 25/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-13

Bersaglio4E_A=20 N/C e m_B=2 mg impongono q_B=1 μC. Rapporto q_B/q_A=1/2.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 2 inverte rapporto;1 dàE10;1/4 dàE40;4 dàE5/2, tutti diversi dal bersaglio20 N/C.

Esito indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-14

A E=5 N/C con D=15 dà a=3 C/N. D_B=60 dà E_B=20 N/C. Con q_B=1 μC, m_B=q_BE_B/g=2 mg.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: D60 come campo dà6 mg;1 mg conq1 darebbeE10;20 copia campo;g non si cambia per adattare un display.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-15

Campi di riferimento5,20 N/C e display11,41: a=2 C/N,b=1. D_C=31 dà E_C=15 N/C; q_C=2 μC implica massa3 mg.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.

Distrattori e controprove: 31/10 mg omette offset e prediceD32;1 mg torna adA;2 mg prediceD21;15 mg prediceD151.

Esito indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-gravity-balance-16

β=(1/2)mg/μC=1/2 kg/C. Se m=βq, E=βg=5 N/C per ogni q>0. La misura ridondante non fissa la scala: esempi (1 mg,2 μC) e (3/2 mg,3 μC); infinite coppie positive nel modello continuo.

Ipotesi: Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi. Il vincolo tra preparazioni rende la misura ridondante e lascia libera una scala positiva.

Distrattori e controprove: Coppie singole non esauriscono infinite soluzioni;conqfisso2 non sono ammesse tutte le masse perché m/q deve restare1/2 kg/C.

Esito indipendente: Infinite coppie positive. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

## Figura, integrità e limiti

XML e PNG nativo integrale letti. Forze elettrica e peso hanno frecce simmetriche rispetto a centro(320,260), da232→120 e288→400 con medesimo marker: moduli uguali10 μN e versi opposti. Campo5 N/C separato e schematico, non confrontato in lunghezza con forze. Prefissi mg→kg eμC→C entrambi10⁻⁶. Barre5,20,25/2N/C larghe80,320,200 da origine130 con scala comune; testi e origine liberi.

Il rendering è asset-only. UI del prodotto e layout a 320 px NOT_RUN in questa review; nessun marker UI generato o copiato. L’approvazione umana rimane NOT_RUN, publication DRAFT e publicationAction NONE. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Per197 il solo radicale annidato effettivamente letto √(22/3) è mappato localmente alla radice razionale esatta, senza eval e senza modificare il decoder condiviso congelato195/196.

Verifier SHA256 4ec9f161e4b303a5ae0a78d856617a7fc9e4e2c419259916bcc5cf84cdc81625. Decoder SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc. Package canonico SHA256 c69a76ace742c26dd0034e65528542d446e29b383afc12cb84c9ae6ddbf71f03. Binding canonico SHA256 1c9b39f86ca0f0db9eed46d55a9db18d9f075cf95e14aab86246b14063c3528a. Report SHA256 79429d2cb4fa77c14e37eb29cf3769e5e0c6bcc561e68115ab8f66b0c22ed6bc.

## Competenze e stabilità

C1-L006 reale contiene gravitazione e forma locale del peso mg: il prerequisito è pertinente a questo equilibrio, distinto dal suo uso non necessario nel solo lavoro elettrostatico196. La relazione qE=mg non dimostra stabilità: nessuna forza restaurativa è assunta e la figura illustra soltanto il bilancio delle componenti.

## Controlli automatici realmente conclusi

Run comune dei48 record:13 test PASS, exit0,2,953 s. Respinte75 mutazioni di pacchetto, incluse48 chiavi errate con binding/token/pin aggiornati solo in memoria, e3 guasti alle leggi costitutive. Provate240 configurazioni Hypothesis,48 combinazioni di argomenti non finiti/non reali e ulteriori limiti non positivi; identità canoniche fresh e saved, lessemi esatti, SHA del decoder, provenienza Git e geometrie quadratiche controllati. Il test197 contro velocità almeno c rifiuta un limite certamente esterno al modello: non pretende che qualsiasi velocità inferiore a c sia non relativistica. Il dominio lento rimane un’ipotesi esplicita e i dati effettivi producono pochi m/s. Log autentico electric-197-199-independent-tests-20261125.txt. Nessuna UI prodotto o suite completa locale, human NOT_RUN, publication DRAFT.
