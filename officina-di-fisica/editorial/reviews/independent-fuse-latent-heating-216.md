# Revisione indipendente fuse-latent-heating-216

Gli 80 prompt originali U6-03 B215–219 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave, soluzione o generatore. Primaria SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b; copia byte-identica nella fixture. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Nessuna esposizione anticipata alle chiavi. Nessuna primaria altrui è stata aperta. I modelli sono stati scritti e realmente eseguiti prima dei candidati: model-run-1.json documenta exit 0; il modello finale deriva da quella versione e restringe inoltre la corrente operativa al dominio I>0 dichiarato nei candidati. Conserva il docstring storico NOT_RUN dell’istante iniziale, superato dal run documentato e dai nuovi test finali.

Dopo il congelamento della primaria ho letto integralmente ogni record finale: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Nessun modulo autore è stato importato. Edizione finale letta: 0444dc79935bb8323c532fc03c4376f599253205. I risultati derivano da potenza in serie, bilancio di calore latente, modello elettrostatico piano, Q=CV e integrale di carica del condensatore lineare. Catalogo reale C4-L03/L04/L07 e C3-L03/L04 riletto per le eccezioni autonome. Il modello della fusione non descrive il successivo circuito aperto; la polarizzazione non coincide con conduzione libera; l’energia immagazzinata non è tutto il lavoro della batteria.

Le quantità numeriche sono esatte, finite e reali prima di ogni operazione; denominatori e rami positivi controllati. I parametri geometrici devono inoltre restare nel regime di piastre estese. Il decoder AST conserva i lessemi originali e non usa eval o roundtrip attraverso float. SHA256 decoder b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4. Entrambi sono controllati e riportati per ciascun record. SymPy, Pint e Fraction sono separati dall’authoring. Le formule generali sono confrontate simbolicamente con tutte le cinque alternative; le domande concettuali hanno prove fisiche specifiche, non una semplice flag.

Tutto l’XML e ciascuno dei cinque nuovi PNG nativi completi sono stati realmente letti. Il processo SVG-only è terminato exit 0 sotto mutex e guardia ≥2 GiB; bounds, dimensioni PNG e source SHA sono nel render.json e nel manifest della fixture. Nessuna app, server o dati studenti sono stati usati nel rendering. Rettifiche B rilette: 21511 identifica il reciproco della sola quota iniziale, 21514 conserva una controprova senza falsa attribuzione al guadagno; 21601 nomina il primo pannello e 21609 fissa la potenza nel confronto della durata; 21814 usa una sostituzione verificabile senza attribuzione falsa al reciproco. Tutte le chiavi, leggi e figure sono rimaste identiche. Nessun finding residuo dopo queste riletture.

## Prove individuali

### AR-u6-fuse-latent-heating-01

10 mg=1/100 g. Il calore latente richiesto è (1/100 g)(200 J/g)=2 J. La potenza Joule costante è I²R=(1 A)²·2 Ω=2 W. Tempo t=2 J/(2 W)=1 s; non si aggiunge riscaldamento sensibile, perché il filamento parte già alla temperatura di fusione.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: 10 mg=1/100 g; energia 2 J e potenza 2 W danno 1 s. Mille s tratterebbe 10 mg come 10 g; 2 s copia il numero dell’energia; 1/2 s dimezza ancora. Le barre energetiche sono nel primo pannello, come ora precisa la didascalia finale 0444dc79 riletta.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-02

Il tempo ha dimensione temporale e si esprime in s o in suoi multipli/sottomultipli. Dal bilancio t=energia/potenza segue J/W=s. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Solo s rappresenta J/W. Le alternative J,W,A,J/s misurano energia, potenza, corrente, potenza. Prova dimensionale specifica, senza calcolo numerico autonomo.

Esito esatto indipendente: s. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-fuse-latent-heating-03

Per una massa numerica m in mg, Q_f=(m/1000 g)(200 J/g)=(m/5) J. La potenza numerica è 2I² W quando I è in A. Quindi t[s]=m[mg]/(10 I[A]²). La legge fisica è t=mL_f/(I²R) con unità coerenti, non una massa in mg trattata come grammi.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Con x=m/(1 mg), i=I/(1 A), il tempo normalizzato è x/(10i²).10x/i² è cento volte il corretto; xi²/10 inverte l’effetto della potenza; x/(10i) perde il quadrato; i²/(10x) inverte la dipendenza dalla massa. Sono formule generali, non confronti a un valore particolare.

Esito esatto indipendente: t / (1 s) = x / (10 i²). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-fuse-latent-heating-04

I resta 1 A e raddoppia soltanto la massa da 10 a 20 mg. Raddoppia il calore latente da 2 a 4 J mentre P=2 W resta fisso; t passa da 1 a 2 s.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Raddoppia solo m: energia2→4 J, potenza2 W invariata, t1→2 s. Le alternative1/2,1,4,20 s invertono, ignorano, quadrano o copiano un dato di massa.

Esito esatto indipendente: Da 1 s a 2 s. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-05

Il bilancio inverte la legge: m=I²Rt/L_f. Nelle unità assegnate m[mg]=10 I[A]² t[s]. Con I=1 A e t=1 s si ottiene 10 mg. Parametri e tempo sono finiti positivi.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: La massa è10 mg, non1/100 mg. Dividere2 J per200 J/g produce1/100 g.2 mg copia il numero dei joule;200 mg copia il coefficiente L_f, non una massa ricostruita.

Esito esatto indipendente: 10. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-06

I²=mL_f/(Rt). Con m=10 mg, Q_f=2 J, R=2 Ω e t=1 s: I²=1 A². Le radici matematiche sono ±1 A; il ramo dichiarato I>0 seleziona 1 A, modulo della corrente di riscaldamento.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: I²=1 A² e il ramo positivo dà1 A. Due A darebbe8 W e1/4 s; mezzo A darebbe1/2 W e4 s; zero non trasferisce energia, −1 A è fuori dal dominio dichiarato.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-07

A massa fissa t è inversamente proporzionale a I². Da 1 a 2 A la potenza quadruplica e t_B/t_A=1/4. Il nuovo tempo è 1/4 s, non 1/2 s.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Il fattore di corrente2 produce fattore di potenza4 e di tempo1/4. Le altre scelte seguono linearmente I, rendono il tempo diretto a I/P, oppure ignorano il cambiamento.

Esito esatto indipendente: 1/4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-08

Tempo corretto 1 s, proposta 2 s: scarto +1 s. La differenza è un tempo; il rapporto 2 sarebbe adimensionale e risponderebbe a un’altra domanda.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Scarto+1 s. −1 s inverte,2 puro è rapporto,2 s copia la proposta,0 accetta l’errore. Dopo la fusione completa la sola legge di fase non descrive il successivo stato termico.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-09

Da t[s]=m[mg]/(10 I[A]²), moltiplicando per 10 I[A]² segue m[mg]=10 t[s] I[A]². In forma dimensionale m=I²Rt/L_f. La corrente non deve annullarsi nel modello di fusione a tempo finito.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: m=I²Rt/L_f ha unità g con L_f in J/g; si converte poi in mg. Un solo I altera le dimensioni; t al denominatore farebbe diminuire la massa all’aumentare della durata a potenza fissata. Non si assegna quel segno quando variano insieme P e t. Il reciproco finale ha g⁻¹. Finding 09 corretto e riletto nel finale 0444dc79.

Esito esatto indipendente: m = I² R t / L_f. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-fuse-latent-heating-10

Con m_B=κ₁m e I_B=κ₂I: t_B/t_A=κ₁/κ₂², con i fattori positivi e R,L_f invariati. Il fattore della massa è diretto; quello della corrente è inverso e quadratico.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Rapportoκ₁/κ₂². Il prodotto rende il tempo diretto alla potenza; la prima potenzaκ₂ omette il quadrato;κ₂²/κ₁ inverte B/A;κ₁² introduce una massa quadratica assente nel bilancio.

Esito esatto indipendente: κ₁ / κ₂². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-fuse-latent-heating-11

A: 10/(10·1²)=1 s. B: 80/(10·2²)=2 s. Il rapporto t_B/t_A è 2: la massa fornisce un fattore otto e la potenza un fattore quattro.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Tempi1 e2 s danno rapporto2. Otto segue solo massa, quattro copia la potenza,1/2 è reciproco,1/4 considera solo la corrente. Massa e potenza devono essere confrontate insieme.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-12

Media delle uscite (1+2)/2=3/2 s. Ai dati medi m=45 mg e I=3/2 A, il modello darebbe 45/[10·(9/4)]=2 s, diverso di 1/2 s. Il quesito chiede la prima media e non il modello applicato agli ingressi medi.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Media3/2 s; ai dati medi45 mg e3/2 A il tempo è2 s. Le alternative2,3,1/2,1 s rappresentano ingressi medi, somma, semidifferenza o sola prova A. Il tempo medio qui è statistico, non quello di una corrente variabile.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-13

Il bersaglio è t_B=2 s. Con m_B=80 mg: 2=80/(10 I_B²) ⇒ I_B²=4 A². La radice positiva è I_B=2 A; il rapporto con I_A=1 A vale 2.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Bersaglio2 s con massa80 mg impone rapporto delle correnti2. Quattro copia il quadrato del rapporto,1/2 è reciproco,otto segue massa e√2 ignora il fattore della massa.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-14

Riferimento t=1 s e lettura 3 danno a_cal=3 s⁻¹ per display adimensionale. Lettura 6 restituisce t=2 s. Con I=2 A, m[mg]=10·2·4=80. Rimuovere prima la taratura e poi invertire il bilancio.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Guadagno3 s⁻¹, lettura6→t2 s, corrente2 A→8 W e16 J, massa80 mg. Usare D come secondi dà240 mg.20 mg corrisponderebbe a mantenere I=1 A nella ricostruzione della massa; verificato nel modello reale a2 A darebbe1/2 s.8 mg perde un fattore dieci.

Esito esatto indipendente: 80. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-15

Riferimenti t_A=1 s, t_B=2 s e letture 3,5: a_cal=2 s⁻¹, b_cal=1. Lettura 6/5 restituisce t=(6/5−1)/2 s=1/10 s. Con I=1 A si trova m=10·(1/10) mg=1 mg; il risultato è positivo nonostante la piccola lettura.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Guadagno2 s⁻¹ e offset1, quindi tempo1/10 s e massa1 mg. Omettere offset dà6 mg e D11/5; omettere guadagno dà2 mg e D7/5.1/10 mg copia il tempo come massa.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-fuse-latent-heating-16

Il vincolo fra preparazioni è m[mg]=10 I[A], con coefficiente fisico 10 mg/A. Inserendo nel bilancio t[s]=1/I[A]. La misura 1 s seleziona I=1 A e m=10 mg, un’unica coppia positiva. Non è una corrente variabile durante la fusione: ogni prova ha corrente costante.

Ipotesi: Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.

Distrattori e controprove: Vincolo m=(10 mg/A)I fra prove, non una rampa nel tempo. t/(1 s)=1/i e misura1 s danno unica corrente1 A e massa10 mg. Due,mezzo,dieci A darebbero rispettivamente1/2,2,1/10 s; la misura non è ridondante.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

SVG completo e PNG indipendente 640×1480 letti. Primo pannello energie 2/16 J e barre 40/320 da origine 150. Secondo E(t): x=150+300t, y=850−100E, segmento fino a (450,650), quindi E=2Wt e fusione completa a 1 s. Ultimo tempi 1/2/3/2 s con barre 160/320/240, origine 150. Scale distinte per grandezze fisiche; zeri e testo terminale liberi, niente prosecuzione oltre fusione.

UI del prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Identità fresh/saved su fixture finali effettive; confronto con ROOT integrato e replay canonico dell’integratore PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Il push pubblico è stato esplicitamente autorizzato dall’utente tramite ROOT.

Verifier SHA256 c47f221843ed5af9181934056e1a00fe03a1d82822d10494fcc89f038b1900b0. Package canonico SHA256 33e39e1aa3c0a0160e8cd17712e55e78428cdec045e69aa0b8a7bbd01387547c. Binding canonico SHA256 3a0c29e4f3594804563ee30e44947649708b0adb1f3376b9b9958efe32ad6ba6. Report SHA256 d50e8d2a15ea0b2f8b02c9e0e98e8ca3759128e73fd77183aa3fe9bbaf570f71.
