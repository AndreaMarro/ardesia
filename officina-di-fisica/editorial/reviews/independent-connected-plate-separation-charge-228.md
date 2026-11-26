# Revisione indipendente connected-plate-separation-charge-228

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta df0e949226d67d210baa01717d958ee33a636f7c. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente SHA256 42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali

### AR-u6-connected-plate-separation-charge-01

Derivazione primaria storica, conservata: Con generatore ideale collegato, V resta costante entro ciascun processo. Area e dielettrico invariati danno C=C₀/s, dunque Q=CV=Q₀/s. Per Q₀=12 μC e s=2 si trova Q=6 μC su una sola piastra in modulo. La carica libera può ritornare al generatore: non è l’isolamento delle armature.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q=CVg=Q₀/s e Vg fissata durante prova danno 6 μC. 24 inverte s, 12 impone altro isolamento, 3 divide due volte. Carica può tornare al generatore.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-02

Derivazione primaria storica, conservata: La carica ha unità coulomb C e qui μC. Il rapporto s=d/d₀ è puro, quindi Q₀/s conserva la dimensione di carica. Non sono ancora state lette le cinque alternative e non si confonde la capacità con la carica. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: C è carica. s=d/d₀ puro non introduce metri; F capacità, V tensione, J energia, A corrente distinta dalla carica trasferita in intervallo.

Esito esatto indipendente: C. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-connected-plate-separation-charge-03

Derivazione primaria storica, conservata: Dal modello piano C=εA/d e dalla tensione imposta segue C/C₀=1/s e Q/Q₀=1/s. La formula richiesta è Q=Q₀/s. Un confronto fra preparazioni con Q₀ differente va realizzato con stati iniziali coerenti, ad esempio tensioni iniziali diverse; il generatore mantiene la propria tensione durante ciascuna separazione, non obbliga tutte le preparazioni ad avere lo stesso C₀ e lo stesso V insieme a Q₀ diverso.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q/Q₀=C/C₀=1/s con Vg fissa. sQ₀ inverte geometria, Q₀ costante è altro circuito, quadrati non derivano da C=εA/d.

Esito esatto indipendente: Q = Q₀ / s. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-connected-plate-separation-charge-04

Derivazione primaria storica, conservata: A s=2, Q₀=12 μC dà Q=6 μC e Q₀=1 μC dà Q=1/2 μC. Il fattore fra le due uscite è 1/12. Il cambio di Q₀ riguarda preparazioni iniziali distinte; non si afferma una variazione arbitraria di carica a C₀ e V simultaneamente fissati.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: A 6 e B 1/2 μC: rapporto 1/12. Due moltiplica nuovoQ₀1 per s 2, uno ignora separazione, sei copiaA, dodici ignora nuova preparazione. Non imposto identiciV eC₀ fra prove.

Esito esatto indipendente: Da 6 μC a 1/2 μC. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-05

Derivazione primaria storica, conservata: Q=Q₀/s si inverte moltiplicando per s: Q₀=sQ. Con Q=6 μC e s=2 si ricostruisce Q₀=12 μC. Il modulo iniziale deve essere positivo e non minore del finale nel dominio s≥1.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q₀=sQ=12 μC≥Q. Tre ripete divisione, sei ignora geometria, 24 ricostruisceQ 12 non 6.

Esito esatto indipendente: 12. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-06

Derivazione primaria storica, conservata: s=Q₀/Q=12/6=2 è un rapporto puro. Serve Q>0 e Q≤Q₀ per ottenere allontanamento. s=1 è ammesso e significa d=d₀, mentre una misura Q>Q₀ non appartiene a questo processo ideale.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: s=Q₀/Q=2, puro. Mezzo inverte, seicopia Q, settantadue prodotto invece rapporto. s≥1 e regime piano anche nello stato finale.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-07

Derivazione primaria storica, conservata: A: Q_A=12/2=6 μC. B con s=1: Q_B=12 μC. Rapporto Q_B/Q_A=2. La corrente transitoria di scambio con il generatore non è la grandezza richiesta né implica perdita di carica totale dell’intero circuito.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: B s 1 rimaneQ 12, A 6 μC: rapporto 2. Mezzo reciproco, uno ignora, quattro quadra, zero confonde ΔQ nulla con Q nulla.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-08

Derivazione primaria storica, conservata: Corretto Q=6 μC e proposta 12 μC: scarto proposto meno corretto=+6 μC. La proposta mantiene impropriamente la carica su una piastra pur mantenendo la tensione durante l’allontanamento.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Scarto+6 μC.−6 inverte, due rapporto, 12 proposta, zero sostituisce netta di due piastre alla carica di una.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-09

Derivazione primaria storica, conservata: Moltiplico Q=Q₀/s per s finito almeno uno e ricavo Q₀=sQ. Unità μC se Q è in μC. La relazione differisce dal condensatore isolato, nel quale Q₀ sarebbe uguale a Q e sarebbe V a cambiare.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q₀=sQ ha carica.Q/s è diretta, s/Q carica inversa, s²Q potenzaaggiunta, Q−s differenzia grandezze diverse.

Esito esatto indipendente: Q₀ = s Q. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-connected-plate-separation-charge-10

Derivazione primaria storica, conservata: La stringa sorgente di s nei pedici va letta s_B=κ₂s_A. Con Q₀,B=κ₁Q₀,A, Q_B/Q_A=[κ₁Q₀,A/(κ₂s_A)]/[Q₀,A/s_A]=κ₁/κ₂. Entrambe le separazioni soddisfano s≥1 e il regime piano; il generatore resta costante entro ogni prova.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: κ₁/κ₂ da Q₀/s.Prodotto rende diretto s, inverso scambia ingressi, quadrato aggiunge potenza, somma due sui fattori unitari.

Esito esatto indipendente: κ₁ / κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-connected-plate-separation-charge-11

Derivazione primaria storica, conservata: A: Q_A=12/2=6 μC. B: Q_B=9/3=3 μC. Rapporto 3/6=1/2, puro. Ogni stato iniziale è definito da Q₀ coerente con C₀V della propria preparazione.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q_A 6, Q_B 3 μC→1/2. Due reciproco, 3/4 solo Q₀, 3/2 solo s, uno presume compensazione.

Esito esatto indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-12

Derivazione primaria storica, conservata: Media delle uscite (6+3)/2=9/2 μC. Ai dati medi Q₀=21/2 μC e s=5/2, il modello darebbe 21/5 μC. Differenza 9/2−21/5=3/10 μC. Il rapporto fra medie non è in generale la media dei rapporti.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Media 9/2 μC contro 21/5 ai dati medi:scarto 3/10. Nove somma, 3/2 semidifferenza, zero somma algebrica di armature.

Esito esatto indipendente: 9/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-13

Derivazione primaria storica, conservata: Il bersaglio è Q_B=(1/2)·6=3 μC. Con Q₀,B=9 μC serve s_B=9/3=3. Il rapporto cercato s_B/s_A=3/2, nella notazione chiarita anziché nella stringa sorgente ripetuta.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Bersaglio 3 μC e Q₀B 9 richiedono sB 3: rapporto 3/2; 2/3 reciproco, mezzo copia bersaglio, 3/4 segueQ₀, 2 darebbe 9/4 μC.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-14

Derivazione primaria storica, conservata: Il riferimento Q_A=6 μC e lettura 18 dà a_cal=3 unità/μC. Lettura 9 indica Q_B=3 μC. Con s_B=3 l’inversa dà Q₀,B=9 μC. Una lettura strumentale non è direttamente Q₀.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 3 μC⁻¹, D 9→Q 3, s 3→Q₀9 μC. 27 tratta D come Q, 1 divide ancora, 3 copia il finale.

Esito esatto indipendente: 9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-15

Derivazione primaria storica, conservata: Riferimenti Q_A=6 μC e Q_B=3 μC, letture 13 e 7: a_cal=(13−7)/(6−3)=2 unità/μC e b_cal=1. Lettura 5 dà Q_C=2 μC. Con s_C=4, Q₀,C=8 μC. La sottrazione dell’offset precede la moltiplicazione per s.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 2 μC⁻¹, offset 1, D 5→Q 2, s 4→Q₀8 μC. 10 omette l’offset e D 6; 16 omette il guadagno; 2 omette inversa fisica.

Esito esatto indipendente: 8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-connected-plate-separation-charge-16

Derivazione primaria storica, conservata: Interpreto Q₀=6·s=d/d₀ come Q₀=(6 μC)s e s=d/d₀. Allora Q=Q₀/s=6 μC per ogni s≥1 compatibile col regime piano. La misura è ridondante e lascia infinite coppie (Q₀,s)=(6 s μC,s); non fissa una separazione assoluta né autorizza distanze arbitrarie fuori dall’approssimazione.

Ipotesi fisiche controllate: Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.

Successiva lettura delle alternative e controprove indipendenti: Q₀=(6 μC)s dà Q 6 μC per ogni s≥1 nel regime geometrico. Misura ridondante; infinite coppie continue, non soltanto intere, non radici discrete.

Esito esatto indipendente: Infinite coppie continue nel regime geometrico dichiarato. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

## Figura e limiti

XML completo e PNG nativo 640 × 1480 letti: due batterie concordi col segno delle piastre, Vg 2 V per entrambi gli stati del medesimo processo, gap 50→100 eQ 12→6 μC. Barre 240/120/180 per 6/3/9/2 μC, comune 40 coordinate/μC. Grafico soltanto tre punti(1, 12),(2, 6),(3, 4), x=150+100 s, y=1320−20 Q, nessuna interpolazione lineare. Zeri e label liberi, quote schematiche dichiarate.

UI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.

Verifier SHA256 14c611a829ae39877629e4e17d8bd1d2737b8e7569625a03bc9bbb65aa27d91e. Package canonico SHA256 ed42479b65ac424be4edc1243a863ba3127204d34c93c8402485a0fbc09d463b. Binding canonico SHA256 86db1b9802836c2779bd294e924943ea8f76e8d0b0a387e3adafba9644760cff. Report SHA256 3f84f5d6f442a5c433bdc22ded4bce93daf5d8756418619768363146a96ed9a4.
