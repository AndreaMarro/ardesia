# Revisione indipendente electric-transverse-displacement-198

Primaria completa degli 80 prompt U6-01 letti e risolti prima di candidati, opzioni e chiavi: SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, copia byte-identica in u6-independent-195-199-fixtures-20261125/primary-source-only.md. Originale ROOT primary-electric-195-199-before-candidates-20261125.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Nessuna esposizione alle chiavi U6 altrui prima della primaria; messaggi successivi di consegna limitati a SHA, file e ipotesi generali.

Successivamente ho letto integralmente e individualmente ogni campo dei sedici record finali: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie, confrontando i dati con la derivazione primaria. Sono stati letti tutto l’XML e il rendering nativo integrale dell’SVG effettivamente prodotto con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Il pin finale letto è 16e815a385061fd23fc62bef7271cf040b06c29c. La fixture è copia esatta dei byte Git e dell’asset verificato contro il payload; non sostituisce l’integrazione ROOT.

Riletti catalogo reale C4-L02/L03 e prerequisiti di meccanica: forza elettrica, legge oraria, equilibrio e lavoro/energia sono distinti. C1-L007 è pertinente per il bilancio energetico197; le condizioni non relativistiche si controllano sui dati delle prove effettive. Ogni vincolo fra preparazioni è distinto dalla legge temporale nella singola prova.

Gli oracoli SymPy derivano leggi, inverse, fattori, tarature e vincoli; Pint/Fraction controllano unità e prefissi esatti. Il decoder AST dedicato electric_exact_literals.py legge i lessemi numerici originali e non ricostruisce decimali da float binari. Il suo SHA256 è vincolato nel verificatore e riportato in ogni record, con rifiuto se cambia; nessuno dei decoder legacy o entropy_state_review è modificato. Nessun modulo autore importato o usato per ottenere le risposte.

## Prova individuale

### AR-u6-electric-transverse-displacement-01

qE=2 mN e m=1 g danno a_y=2 m/s². Con y_0=v_y0=0, s=a_y t²/2=1 m a t=1 s; v_x non entra nella componente y.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Il dato E2 non è lo spostamento; omettere il mezzo dà2 m; usare una durata lineare cambia dimensioni e iniziali.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-02

La dimensione qEt²/m è C·(N/C)·s²/kg=m. Lette tutte le alternative dopo la primaria: solo m è una lunghezza, non m/s, m/s² o un campo.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: m/s e m/s² descrivono velocità/accelerazione, N forza, N/C campo: soltanto m è lo spostamento.

Esito indipendente: m. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-electric-transverse-displacement-03

Newton lungo y: a_y=qE/m costante. Integrando prima v_y=a_y t e poi y=a_y t²/2, con iniziali nulle: s=qEt²/(2m). È una componente di spostamento, non la lunghezza della traiettoria.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Tempo lineare manca un fattore temporale; tempo al denominatore inverte crescita; omettere mezzo duplica; scambiare q e m altera unità.

Esito indipendente: s = q E t² / (2 m). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-transverse-displacement-04

A t=1 s e stessa massa/carica, E da 2 a 4 kN/C raddoppia a_y e s da 1 a 2 m. La dipendenza dal campo è lineare.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Quattro anziché2 raddoppierebbe due volte il campo; mezzo rende inversa la dipendenza; uno ignora la variazione.

Esito indipendente: Da 1 a 2 m. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-05

E=2ms/(qt²): s=1 m e t=1 s danno 2 kN/C. Denominatori q,t² positivi e unità coerenti.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: 1 kN/C produce1/2 m;4 kN/C produce2 m. Il fattore2 del moto da fermo è necessario.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-06

t²=2ms/(qE)=1 s². La durata è la radice positiva t=1 s; −1 s non è il tempo trascorso del modello.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: −1 non è durata;2 s darebbero4 m;1/2 s darebbe1/4 m. Non si ricava il tempo senza radice.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-07

Con E fermo a 2 kN/C, t da 1 a 3 s produce s_B/s_A=3²=9. Il corpo resta esplicitamente entro il campo per tutto l’intervallo.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: 3 tratta t linearmente;1 ignora il tempo;1/9 inverte;81 eleva al quadrato due volte il fattore3.

Esito indipendente: 9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-08

Il corretto è 1 m; proposta 2 m meno corretto dà +1 m. Il rapporto puro 2 è un’altra grandezza.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: −1 inverte ordine,2 m copia proposta,0 accetta errore,2 puro è rapporto e non differenza.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-09

Da 2ms=qEt² divido per qt²>0: E=2ms/(qt²). La dimensione kg·m/(C·s²)=N/C conferma l’inversa.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Prima alternativa omette2; moltiplicare per t² aggiunge quattro potenze temporali rispetto al campo; solo t lascia un tempo spurio; scambiare q/m altera dimensioni.

Esito indipendente: E = 2 m s / (q t²). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-transverse-displacement-10

Con E_B=κ₁E_A e t_B=κ₂t_A la sostituzione nella legge quadratica dà s_B/s_A=κ₁κ₂². Campo costante separatamente entro entrambe le prove.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: κ₁κ₂ perde un fattore di tempo; κ₁²κ₂ assegna quadrato al campo; entrambi i quozienti invertono una dipendenza diretta.

Esito indipendente: κ₁ κ₂². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-electric-transverse-displacement-11

A: E=2,t=1 dà s_A=1 m. B: E=1,t=2 dà s_B=2 m. Rapporto 2, metà campo per quattro dal tempo.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: 1/2 segue solo campo;1 tratta tempo linearmente;4 segue solo t²;8 raddoppia campo invece di dimezzarlo.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-12

Media delle deviazioni: (1+2)/2=3/2 m. Ingressi medi E=3/2 e t=3/2 danno 27/16 m; 3/2=24/16, quindi la differenza è 3/16 m. Nessun decimale necessario.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: 27/16 usa ingressi medi;3 non dimezza;1/2 è metà differenza;2 copia B.

Esito indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-13

B deve dare 2 m nel campo dimezzato a 1 kN/C: t_B²=2s_B/a_y=4 s², dunque t_B=2 s e t_B/t_A=2.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: 4 copia rapporto dei quadrati;1/2 inverte;√2 ignora il campo dimezzato;1 darebbe1/2 m anziché2.

Esito indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-14

A s=1 m dà guadagno 3 m⁻¹. D_B=6 implica s_B=2 m. Durata 2 s: E_B=2s_B/t_B²=1 kN/C nei numeri normalizzati.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Campo3 usa D6 come metri;2 darebbe s4 e D12;1/2 darebbe s1 e D3.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-15

Riferimenti s=1,2 m con D=3,5: guadagno 2 m⁻¹ e offset 1. D_C=2 dà s_C=1/2 m; a t=1 s richiede E_C=1 kN/C.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.

Distrattori e controprove: Campo2 omette offset e prediceD3;1/2 predice3/2;4 predice5;0 predice1 e viola E>0.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-electric-transverse-displacement-16

Si prepara E=βT con β=2 kN/(C·s), poi E è costante per 0≤τ≤T. Alla fine s(T)=qβT³/(2m)=(1 m/s³)T³. s=1 m impone T³=1 s³ e unico T=1 s. Integrare E=βτ sarebbe un altro modello e darebbe un coefficiente un terzo, non la stessa prova.

Ipotesi: Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti. Il tempo preparato T è distinto dal tempo interno τ; E=βT resta fissato durante il moto.

Distrattori e controprove: −1 non risolve T³=1 ed è negativo;2 dà8 m;1/2 dà1/8 m; infinite durate è falso perché la cubica è strettamente crescente sul ramo positivo.

Esito indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura, integrità e limiti

XML e PNG nativo integrale letti. Vista dall’alto, qpositiva, forza +y e vx +x; frecce schematiche di unità diverse e punte fuori dal corpo. Curva M100830Q300830500590: t=2u,y=4u²=t² m, con campo2 kN/C e a2 m/s²; punti(1,1),(2,4) coerenti. È legge oraria, non traiettoria. Barre1,2,3/2m larghe160,320,240 da origine130; B ha campo diverso dalla curva. Zeri non coperti dagli assi.

Il rendering è asset-only. UI del prodotto e layout a 320 px NOT_RUN in questa review; nessun marker UI generato o copiato. L’approvazione umana rimane NOT_RUN, publication DRAFT e publicationAction NONE. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Per197 il solo radicale annidato effettivamente letto √(22/3) è mappato localmente alla radice razionale esatta, senza eval e senza modificare il decoder condiviso congelato195/196.

Verifier SHA256 55f2bb21733999755567fe30212940e6233e056095ec09cc2b80bd994b6b3128. Decoder SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc. Package canonico SHA256 60c99ce495cbb2e19e4807841c3f86263013fed5ff7593e16f16be16c73c0892. Binding canonico SHA256 ee43cfb9f982e5336f29633a2c60c7c2dd0c63c9f00a237202c0305334ed629f. Report SHA256 1b0f12ff90c43f65f727652be30720de066262b6c861b8f9501e3c9088df67c3.

## Domini e alternativa qualitativa

L’alternativa«Infinite durate positive» del16 è letta come proposizione qualitativa e confutata dalla cubica strettamente crescente T³=1 sul ramo positivo. Non viene passata al parser numerico; le altre quattro durate sono confrontate esattamente. Nel primo assemblaggio del solo report il parser la trattava erroneamente come numero e rifiutava il record: quel tentativo non era una verifica positiva. La distinzione è corretta prima del congelamento, senza cambiare alcun candidato o oracolo fisico.

## Controlli automatici realmente conclusi

Run comune dei48 record:13 test PASS, exit0,2,953 s. Respinte75 mutazioni di pacchetto, incluse48 chiavi errate con binding/token/pin aggiornati solo in memoria, e3 guasti alle leggi costitutive. Provate240 configurazioni Hypothesis,48 combinazioni di argomenti non finiti/non reali e ulteriori limiti non positivi; identità canoniche fresh e saved, lessemi esatti, SHA del decoder, provenienza Git e geometrie quadratiche controllati. Il test197 contro velocità almeno c rifiuta un limite certamente esterno al modello: non pretende che qualsiasi velocità inferiore a c sia non relativistica. Il dominio lento rimane un’ipotesi esplicita e i dati effettivi producono pochi m/s. Log autentico electric-197-199-independent-tests-20261125.txt. Nessuna UI prodotto o suite completa locale, human NOT_RUN, publication DRAFT.
