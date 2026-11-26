# Revisione indipendente isolated-plate-separation-energy-227

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta b455db658158695f249e6baf7949687d5ae7453f. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente SHA256 42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali

### AR-u6-isolated-plate-separation-energy-01

Derivazione primaria storica, conservata: Area e dielettrico invariati danno C=εA/d=C₀/s. L’isolamento mantiene Q costante su ciascuna armatura; U=Q²/(2 C)=sU₀. Con U₀=2 μJ e s=2 si ottiene U=4 μJ. L’energia del campo aumenta per il lavoro esternonecessario a separare piastre attrattive, nel limite quasi statico senza perdite; non è un’energia conservata del solo campo.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: C=C₀/s e Q costante: U=Q²/(2 C)=sU₀=4 μJ. Uno usa erroneamente V fisso, due conserva U campo, otto usa s². Apporto meccanico possibile distinto dall’isolamento elettrico.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-02

Derivazione primaria storica, conservata: L’energia ha unità joule J, qui μJ. Il fattore s=d/d₀ è puro; moltiplicare U₀ per s conserva la dimensione energetica. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: J è energia. C²/F=C·V=J; W è potenza, V tensione, C carica, F capacità. Fattore due puro.

Esito esatto indipendente: J. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-isolated-plate-separation-energy-03

Derivazione primaria storica, conservata: Da C/C₀=d₀/d=1/s e Q costante segue U/U₀=C₀/C=s. La legge richiesta è U=sU₀, non U₀/s e non s²U₀. Bisogna conservare il modello piano con separazione ancora piccola rispetto alle dimensioni laterali, anche nello stato finale.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Q resta costante e U/U₀=C₀/C=s. U₀/s vale con V mantenuta e altro circuito; quadrati non derivano da C∝1/s; Ucostante omette apporto esterno meccanico.

Esito esatto indipendente: U = s U₀. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-isolated-plate-separation-energy-04

Derivazione primaria storica, conservata: A s=2 fissato, U₀ passa da 2 a 4 μJ. Le uscite passano da 4 a 8 μJ, rapporto due. I preparati hanno energie iniziali diverse, ciascuno poi segue il proprio processo isolato; non si impone stessa Q fra preparati se cambia U₀ a C₀ fissata.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: A 4, B 8 μJ per s 2 e U₀2, 4 μJ. Due divide invece di moltiplicare, quattro ignora preparazione, sedici aggiunge fattore non previsto. Q fisso entro prova non significa stessoQ fra prove.

Esito esatto indipendente: Da 4 μJ a 8 μJ. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-05

Derivazione primaria storica, conservata: L’inversa è U₀=U/s. Con U=4 μJ e s=2 si trova U₀=2 μJ. Il denominatore è almeno uno, finito, e l’energia iniziale resta positiva. U≥U₀ nel dominio dell’allontanamento.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: U₀=4/2=2 μJ. Otto usa sU, quattro ignora s, mezzo darebbe U 1 μJ. U₀≤U nel dominio s≥1.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-06

Derivazione primaria storica, conservata: Da U=sU₀ segue s=U/U₀=4/2=2, adimensionale. Serve U₀>0 e deve risultare s≥1; una misura U<U₀ sarebbe incompatibile con allontanamento a carica costante nelle ipotesi dichiarate.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: s=4/2=2 e d 2 d₀. Mezzo è avvicinamento escluso, otto prodotto, quattro copia numero di U finale.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-07

Derivazione primaria storica, conservata: A con s=2 ha U_A=4 μJ. B con s=1 ha U_B=2 μJ. Rapporto 1/2. Il confine s=1 significa nessun allontanamento e non una distanza nulla: d=d₀>0.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: s_B 1 conserva U₀2 μJ; A 4 μJ: rapporto 1/2. Due reciproco, uno ignora s, 1/4 quadrato, zero confonde ΔU 0 con U 0.

Esito esatto indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-08

Derivazione primaria storica, conservata: Corretto U=4 μJ; proposta 8 μJ. Scarto proposto meno corretto=+4 μJ. Otto deriverebbe da U₀s² in questa sostituzione; il modello a Q fissata è invece lineare in s.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Proposta 8 meno 4=+4 μJ; ΔU rispetto allo stato iniziale è invece 2 μJ. −4 inverte, due puro è rapporto, otto copia proposta, zero non verifica.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-09

Derivazione primaria storica, conservata: Si isola U₀ dalla relazione U=sU₀ dividendo per s≥1: U₀=U/s, con unità di energia. Non si deve usare CV²/2 mantenendo contemporaneamente V fisso: in questo processo V aumenta perché Q è isolata e C diminuisce.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: U₀=U/s ha energia e 0<U₀≤U. sU è diretta, s/U energia inversa, U−s dimensioni incompatibili, U/s² aggiunge potenza.

Esito esatto indipendente: U₀ = U / s. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-isolated-plate-separation-energy-10

Derivazione primaria storica, conservata: La notazione sorgente ripete malamente s=d/d₀ nei pedici; interpreto esplicitamente s_A=d_A/d₀,A e s_B=κ₂s_A. Con U₀,B=κ₁U₀,A, le uscite sono U_A=s_AU₀,A e U_B=κ₁κ₂s_AU₀,A, quindi rapporto κ₁κ₂. Entrambi s_A e s_B devono essere almeno uno e mantenere il regime piano; i fattori singoli non devono essere interi.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: κ₁κ₂:prodotto delle due variazioni. Quozienti invertono diretta, κ₂² aggiunge potenza, somma fallisce sui fattori unitari. Entrambe le geometrie restano piastre grandi.

Esito esatto indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-isolated-plate-separation-energy-11

Derivazione primaria storica, conservata: A: U_A=2·2=4 μJ. B: U_B=3·3=9 μJ. Rapporto 9/4, puro. Il fattore 3/2 dell’energia iniziale e quello 3/2 della separazione si moltiplicano.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: U_A 4, U_B 9 μJ→9/4; 4/9 reciproco, 3/2 solo ingresso, 9/2 divide per U₀A invece diUA, uno ignora variazione.

Esito esatto indipendente: 9/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-12

Derivazione primaria storica, conservata: Media delle due uscite=(4+9)/2=13/2 μJ. Ai dati medi U₀=5/2 μJ e s=5/2, il prodotto sarebbe 25/4 μJ. Differenza 13/2−25/4=1/4 μJ. Sono medie statistiche di stati, non un singolo processo con ingresso variabile.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Media 13/2 μJ distinta da 25/4 ai dati medi, scarto 1/4.13 somma, 5/2 semidifferenza, zero non è media di energie positive.

Esito esatto indipendente: 13/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-13

Derivazione primaria storica, conservata: Il rapporto richiesto del fattore di separazione va scritto s_B/s_A nonostante la stringa sorgente ripetuta. Bersaglio U_B=(9/4)·4=9 μJ, U₀,B=3 μJ: s_B=3. Dividendo per s_A=2 segue s_B/s_A=3/2, entrambi ≥1.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Bersaglio 9 μJ e U₀B 3 μJ danno sB 3, rapporto 3/2; 2/3 reciproco, 9/4 copia rapporto energetico, 2 darebbe UB 12 μJ; 3/4 non raggiunge bersaglio.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-14

Derivazione primaria storica, conservata: Riferimento U_A=4 μJ, lettura 12: guadagno 3 unità/μJ. Lettura 27 indica U_B=9 μJ. Con s_B=3, U₀,B=9/3=3 μJ. Il display misura l’energia finale prima dell’inversione.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 3 μJ⁻¹, D 27→U 9 μJ, s 3→U₀3 μJ. Nove omette divisione fisica, 27 copiaD e omette entrambe, uno predice D 9.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-15

Derivazione primaria storica, conservata: Le uscite dei riferimenti sono 4 e 9 μJ e le letture 9 e 19. Guadagno a_cal=(19−9)/(9−4)=2 unità/μJ, offset 1. Lettura 17 dà U_C=(17−1)/2=8 μJ; s_C=2 implica U₀,C=4 μJ.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 2 μJ⁻¹, offset 1, D 17→U 8 μJ, s 2→U₀4 μJ. 17/4 omette l’offset e D 18; otto copiaUfinale; 16 prediceUC 32 e D 65.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-isolated-plate-separation-energy-16

Derivazione primaria storica, conservata: Leggo il vincolo sorgente U₀=1·s=d/d₀ come U₀=(1 μJ)s, con s=d/d₀, evitando l’uguaglianza fra energia e numero puro. Inserendo in U=sU₀ segue U[μJ]=s². Misura 4 μJ richiede s²=4: solo s=2 è ≥1, con U₀=2 μJ. La geometria finale deve restare nel regime piano.

Ipotesi fisiche controllate: Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.

Successiva lettura delle alternative e controprove indipendenti: U₀=(1 μJ)s porta U/(1 μJ)=s²=4, ramo s 2.−2 distanza negativa, 4 omette radice, mezzo avvicina e non soddisfa misura; nessuna ridondanza.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML completo e PNG nativo 640 × 1480 letti: distanze fra facce interne 50 e 100 coordinate, d₀→2 d₀, area/carica invariate e U 2→4 μJ. Barre 128/288/208 per 4/9/13/2 μJ, comune 32 coordinate/μJ. Grafico a U₀2: x=150+100 s, y=1300−20 U, segmento s 1..3 da(250, 1260) a(450, 1180), punto iniziale chiuso. Nessuna falsa retta per s<1.

UI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.

Verifier SHA256 a5f51d11754b0f931e1a3f59295256f4a6a230696ebd1833998dd897165b23ff. Package canonico SHA256 8dfd9487293f89d073cc1f122ae1baf6acb98e19ffea8b6f93436a273fd96aca. Binding canonico SHA256 44e5c1b4ec220abc392c97a13465ca02debf6b1ee29bdd52b6cc873a9463b80b. Report SHA256 97b1b03b642ce438e48c2b39025466a9e12cf72014474d3d30204456c37cc684.
