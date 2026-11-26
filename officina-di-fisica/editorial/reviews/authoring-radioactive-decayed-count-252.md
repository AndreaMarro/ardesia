# Authoring DRAFT — radioactive-decayed-count-252

Tutti gli 80 prompt originali A250–254 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-02. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-02 SHA256 43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7. Le quantità statistiche sono distinte dai conteggi di eventi di un singolo nucleo; esponenti sempre adimensionali e parametri costanti entro una preparazione.

Entrambe le primarie sono state congelate prima dell’autoria: A per B255–259 SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4 su d0628ef617dc36ac03d018a854de21fdb3da4f28; B per A250–254 SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2 su 7518f76e54b9d05ab1b03548e6113339afd40db9, mai aperta dall’autore A. Nessun candidato, opzione, chiave, hint, solutionSteps o SVG B255–259 letto durante l’autoria A.

Letta integralmente la lezione reale C5-L08 «Una popolazione di nuclei che cambia nel tempo» al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, comprese formule e figura storica C5-emivita.svg. Copre esplicitamente popolazione media, emivita, attività, alfa/beta/gamma e condizioni del rivelatore. Skill primaria C5-L08, prerequisiti reali C1-L001/C5-L08. Nessun ID inventato.

Autore soltanto: DRAFT, SCI distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo con timeout originale: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Nessun credito di integrazione attribuito dall’autore.

SVG-only effettivamente renderizzato in browser nativo, XML e PNG completo letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. UI prodotto locale vietata e NOT_RUN; replay a 320px riservato al runner canonico. Le figure mostrano grandezze fisiche e non metriche in pixel.

## AR-u7-radioactive-decayed-count-01 — Quanti genitori si sono già trasformati

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. Con n₀=64 e t=1 h, quanto vale N_dec nelle unità 10⁶ nuclei? Inserisci c.

Procedimento d’autore: Dopo un’emivita sopravvive metà dei genitori: 32 milioni. Il cumulativo dei trasformati è il complemento, 64−32=32 milioni. La coincidenza fra residui e trasformati è particolare di una sola emivita.

Formule: c=n_0(1-2^{-u});  c=64(1-1/2);  c=32.

Distrattori e controprove: 64 milioni conterebbe tutti i genitori come già trasformati. Sedici milioni non è il cumulativo a un’ora; zero ignora le trasformazioni. Moltiplicare sempre per 2^(−u) darebbe il residuo, che coincide con c solo in questo dato.

Hint: Calcola prima i genitori rimasti, poi sottrai dall’inizio.

Fonte SHA256 fb1a1f9fa106fe3ef6753fcb4c197be57d9e7805ef290c40802be717fd67b82f. Candidato SHA256 d5d7f60be5b6bee9afc029a4aee4964f185d95b7ab95d5d0b5f65a0e520b576d. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-02 — Una popolazione trasformata, non una attività

Quale indicazione di unità è adatta al numero medio cumulativo N_dec di nuclei genitori già trasformati?

Procedimento d’autore: Si sommano trasformazioni avvenute dall’inizio, senza dividere per la durata. Il numero medio è un conteggio puro, esprimibile anche in milioni di nuclei. È distinto dal tasso istantaneo di trasformazioni in Bq.

Formule: [N_{\rm dec}]=1;  [\mathcal A]=\mathrm{s^{-1}}.

Distrattori e controprove: Bq e nuclei/s sono tassi; s è tempo e J energia. Non si può chiamare attività un conteggio cumulativo solo perché riguarda un processo radioattivo.

Hint: Chiediti se si domanda quanti eventi in totale oppure quanti al secondo.

Fonte SHA256 2c094098005267d9e7d50f5d9b7f991e3a288879723aa612d30a302bb1777888. Candidato SHA256 2a0c954f10b5104421362baa752be3c0ca466bd98c6591bdc735ca39dc67b5fb. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-03 — Il cumulativo è un complemento

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. Quale relazione fornisce il conteggio normalizzato c?

Procedimento d’autore: Ogni genitore iniziale o è ancora presente o ha già subito la sua trasformazione. Il residuo medio è n₀2^(−u); sottraendolo da n₀ ottengo c. Per u>0 finito, 0<c<n₀: il conteggio cresce ma non supera gli iniziali.

Formule: c=n_0-n_0 2^{-u};  c=n_0(1-2^{-u});  0<c<n_0.

Distrattori e controprove: Il termine senza complemento è il residuo. Il segno più e la divisione per la frazione trasformata superano n₀. La legge lineare n₀u non descrive il decadimento esponenziale e può contare lo stesso genitore più volte.

Hint: Sottrai i sopravvissuti, senza aggiungere i decadimenti dei figli.

Fonte SHA256 379ea4eb9eb75d2d49148a7718a4a354fd682891df82c273a4b3d2c379f982f1. Candidato SHA256 27ca079131ad98ca1841cef61fd975b114c5b7903acc22cb4ab4adc008043a8d. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-04 — La metà dei genitori iniziali

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. A ha n₀=64 e t=1 h; B ha n₀=32 allo stesso tempo. Come cambia N_dec?

Procedimento d’autore: La frazione trasformata resta un mezzo. Il conteggio cumulativo è lineare nella popolazione iniziale: passa da 32 a 16 milioni. Cambia il numero di genitori disponibili, non l’emivita.

Formule: c_A=32;  c_B=32(1-1/2);  c_B=16.

Distrattori e controprove: 64 inverte la proporzione, otto introduce un altro dimezzamento e 32 ignora la nuova popolazione. Zero non segue da una popolazione positiva osservata dopo un tempo positivo.

Hint: Mantieni fissa la frazione trasformata nelle due prove.

Fonte SHA256 f13fffd207666ca84ed103f0ba65c86de434f67da74c8c231de9bd3ee75503a4. Candidato SHA256 be5e213da426fcd9ce32f8a8bfa2ee459ad3835204fd3b585b88290d6a24465f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-05 — Risalire alla popolazione iniziale

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. Si hanno c=32 dopo t=1 h. Quanto vale N₀ nelle unità 10⁶ nuclei?

Procedimento d’autore: A un’ora si è trasformata metà della popolazione iniziale. Isolo n₀=c/(1−2^(−u)) e divido 32 per un mezzo: 64. Il denominatore è positivo per u>0; al tempo zero questa inversa non sarebbe definita.

Formule: n_0=\frac{c}{1-2^{-u}};  n_0=\frac{32}{1/2};  n_0=64.

Distrattori e controprove: Sedici moltiplica ancora per la frazione; 32 presume che tutti i genitori siano già decaduti. 128 milioni darebbe c=64, non 32. Il risultato deve superare il cumulativo misurato.

Hint: La frazione da invertire è quella trasformata, non quella sopravvissuta.

Fonte SHA256 e173387525b6769ab577e5fc112b1ca89db39ee1f2a6858c896ac7457031e8d3. Candidato SHA256 8ed618d7128cf50b75ddb749665611f268e0ea5b2d496aad815f8eac3b679306. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-06 — Il tempo da genitori trasformati e iniziali

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. c=32 e n₀=64. Quanto vale t in ore?

Procedimento d’autore: La frazione trasformata è 1/2. La sopravvivenza complementare vale anch’essa 1/2, perciò 2^(−u)=1/2 e u=1. Prima del logaritmo occorre 0<c<n₀, altrimenti non esiste questo tempo positivo finito.

Formule: 2^{-u}=1-\frac{32}{64};  2^{-u}=\frac12;  u=1;  t=1\,\mathrm h.

Distrattori e controprove: Due ore darebbero c=48 milioni e tempo zero c=0. Mezz’ora darebbe 64−32√2 milioni, non 32. Non si usa c/n₀ direttamente come frazione residua in un dato generale.

Hint: Torna dal cumulativo alla frazione ancora presente.

Fonte SHA256 3c9c8695b84c25f51225e337d31bce21b4030da107b2c6a51a8b59e0d39a5e34. Candidato SHA256 9219a4363bb406cb912eaa19f68e2f63a0c582d9bd6e7c630368f94b6fea89c1. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-07 — Più tempo aumenta il cumulativo

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. A ha n₀=64,t=1 h. B mantiene n₀=64 e usa t=2 h. Quanto vale N_dec,B/N_dec,A?

Procedimento d’autore: A ha trasformato metà, cioè 32 milioni. B ha trasformato tre quarti, cioè 48 milioni. Il rapporto è 48/32=3/2: il cumulativo aumenta mentre il residuo diminuisce.

Formule: c_A=32;  c_B=64(1-1/4);  c_B=48;  N_{{\rm dec},B}/N_{{\rm dec},A}=\frac32.

Distrattori e controprove: 2/3 inverte il confronto; un mezzo è il rapporto dei residui, non dei cumulativi. Due assume un conteggio lineare nel tempo e uno ignora l’ulteriore intervallo.

Hint: A due emivite è trasformato tre quarti, non un quarto.

Fonte SHA256 f5b8476d4d4ab6373d87ee386439708b23023a05c089d03915be3317e8732436. Candidato SHA256 659703b236b00a83e23614a6ec8e55c53d4cabd6da25fc7a79b260f5a1eaa56f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-08 — Lo scarto del cumulativo proposto

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. Con n₀=64,t=1 h viene proposto N_dec=64 milioni. Quanto vale proposta meno corretto?

Procedimento d’autore: Il cumulativo corretto è 32 milioni. La proposta conta anche i genitori ancora presenti e lo supera di 32 milioni. Si mantiene l’ordine proposto meno corretto.

Formule: \delta c=64-32;  \delta c=32.

Distrattori e controprove: Il segno meno scambia l’ordine, due è un rapporto puro, 64 è la proposta e zero la accetta senza il bilancio dei genitori.

Hint: Confronta due conteggi nella stessa scala, non un conteggio e una frazione.

Fonte SHA256 9a7aff8e9fe2e08184d682128c0c7e2201e213584b5fcf131dd12ae5f0da7848. Candidato SHA256 1856a50fc6087a04f3f2b894988fc00c138df984a42e756530f772c158e65756. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-09 — L’inversa del complemento

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. N_dec e t sono noti. Quale formula isola N₀ con u=t/(1 h)?

Procedimento d’autore: Divido per la frazione trasformata, strettamente compresa fra zero e uno. L’inversa restituisce N₀>N_dec. La formula N_dec2^u sarebbe l’inversa del residuo, non del cumulativo, e coincide nel solo caso u=1.

Formule: N_0=\frac{N_{\rm dec}}{1-2^{-u}};  N_0>N_{\rm dec}.

Distrattori e controprove: Moltiplicare per il complemento riduce ancora il conteggio. Il reciproco non è l’inversa richiesta, mentre u non sostituisce una frazione esponenziale. La divisione per zero a u=0 è esclusa.

Hint: Isola l’ingresso nella legge del cumulativo e controlla il denominatore.

Fonte SHA256 1c0470949d53209a2f0bb02029184592173eb6efba1caefa67d2cdab8a63eadd. Candidato SHA256 d82426c7affccd5775cca21ddb0b76fb5852762749f6317dc0c47ce9f1e2c806. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-10 — Due modifiche del conteggio cumulativo

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. Fra prove N₀,B=κ₁N₀,A e t_B=κ₂t_A, con fattori positivi. Definiamo q=2^(−u_A), frazione sopravvissuta in A, e R=N_dec,B/N_dec,A. Quanto vale R?

Procedimento d’autore: In A la frazione trasformata è 1−q. In B sopravvive q^κ₂, dunque si è trasformata la frazione 1−q^κ₂. Il rapporto dei campioni iniziali dà κ₁. Con 0<q<1 e κ₂>0 entrambi i complementi sono positivi.

Formule: R=\kappa_1\frac{1-q^{\kappa_2}}{1-q}.

Distrattori e controprove: Prodotto o quoziente dei soli fattori non conserva il complemento. κ₁q^(κ₂−1) è il rapporto dei residui, non dei trasformati; il reciproco scambia le preparazioni.

Hint: Usa un complemento in ciascuno stato prima di formare il rapporto.

Fonte SHA256 5628abab04ff19f294e6d23542252b81f1abf68ec0d662a303a066b7f3342115. Candidato SHA256 efd4a3d7590099ad6ca137624d67be11a7a8624cc428f943beef643cb5932e8a. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-11 — Meno iniziali ma più tempo per trasformarsi

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. A: n₀=64,t=1 h. B: n₀=32,t=2 h. Quanto vale N_dec,B/N_dec,A?

Procedimento d’autore: A conta 32 milioni trasformati. B conta tre quarti di 32, cioè 24 milioni. Il rapporto è 24/32=3/4: la popolazione iniziale minore prevale qui sull’aumento della frazione trasformata.

Formule: c_A=32;  c_B=32\cdot\frac34;  c_B=24;  N_{{\rm dec},B}/N_{{\rm dec},A}=\frac34.

Distrattori e controprove: 4/3 è il reciproco; un mezzo considera soltanto l’inizio e 3/2 soltanto il cambiamento della frazione. Uno presume una compensazione che i numeri non danno.

Hint: Distinguere le due frazioni evita di usare il rapporto dei residui.

Fonte SHA256 a082b207d45cfa9f6e8a5dc4913a3580ee0fe05ee2f4ca92449d5cf4e78f5801. Candidato SHA256 e076e69b96ffde3c86a1e05578707fe69da50955209a952b86937579d1797baf. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-12 — La media dei genitori trasformati

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. A: n₀=64,t=1 h. B: n₀=32,t=2 h. Qual è la media aritmetica dei due N_dec con pesi uguali?

Procedimento d’autore: I cumulativi sono 32 e 24 milioni: media 28 milioni. Indico con c_m il modello agli ingressi medi n₀=48 e u=3/2: darebbe 48−12√2, che non è 28. La differenza è riconoscibile senza calcolatrice perché 20² è maggiore di (12√2)².

Formule: \overline c=\frac{32+24}{2};  \overline c=28;  c_m=48-12\sqrt2.

Distrattori e controprove: 56 è la somma, quattro la semidifferenza e 24 ripete B. L’espressione radicale riguarda una terza preparazione con dati medi, non la media delle due uscite.

Hint: Forma due cumulativi completi prima della media.

Fonte SHA256 3596b610ef826808399247dff459e986a8a71cdd21cb402e5b676e6469bcdf19. Candidato SHA256 2734dabc49dce2387de81b58dce6e8bcf9bb961ce9cc64736bab431e8a592734. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-13 — Il tempo che realizza il bersaglio

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. A: n₀=64,t_A=1 h. B usa n₀=32 e deve avere N_dec,B=(3/4)N_dec,A. Quanto vale t_B/t_A?

Procedimento d’autore: Il bersaglio è 24 milioni. Nel nuovo campione iniziale di 32 milioni la frazione trasformata deve essere 3/4: resta 1/4, cioè due emivite. Quindi t_B=2 h e il rapporto delle durate è due.

Formule: c_B=24;  2^{-u_B}=1-24/32;  2^{-u_B}=\frac14;  u_B=2;  t_B/t_A=2.

Distrattori e controprove: Un’ora darebbe soltanto 16 milioni. Un mezzo inverte le durate; 3/4 copia il target delle uscite e 3/2 il rapporto delle frazioni trasformate.

Hint: Ricava la frazione residua nel nuovo campione, poi conta i dimezzamenti.

Fonte SHA256 0a8e3f0ddd233669ba960d89183ee081e8f45cc7d3d91c2e6dc9aca76faa582d. Candidato SHA256 d0029c50bdbad84ba5806b2fa158c9b474fac7f0845cd8193a45fae1138d4b39. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-14 — Un display del cumulativo

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. D=g c senza offset. A ha n₀=64,t=1 h,D=96. In B si legge D=72 dopo 2 h. Quanto vale N₀,B nelle unità 10⁶ nuclei?

Procedimento d’autore: A ha c=32, dunque g=3. D=72 decodifica c_B=24. A due ore la frazione trasformata è 3/4: n₀,B=24/(3/4)=32. Non va usata qui la frazione residua 1/4.

Formule: g=3;  c_B=24;  n_{0,B}=\frac{24}{3/4};  n_{0,B}=32.

Distrattori e controprove: 96 milioni tratterebbe la lettura come c e predirebbe D=216. Novantasei si otterrebbe anche dividendo il corretto c=24 per il residuo 1/4. Ventiquattro copia il cumulativo senza l’inversa.

Hint: Decodifica prima, poi dividi per la frazione trasformata.

Fonte SHA256 40c523451c55666f4833c71a4cfb786c94e24a74e88bc70180b434ee4b59541e. Candidato SHA256 8d5b833de009c99d0cd0dfe3852cfd9557b1b4636d7583ec18cfc343d822c744. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-15 — L’offset prima della legge di decadimento

Un campione chiuso ha un solo radionuclide genitore di emivita T½=1 h, senza nuovi apporti o produzione di genitori. Si conta N_dec(t), numero medio cumulativo dei genitori iniziali già trasformati: eventuali decadimenti successivi dei figli non si contano. Definiamo u=t/(1 h)>0, n₀=N₀/(10⁶ nuclei) e c=N_dec/(10⁶ nuclei). Allora c=n₀(1−2^(−u)); non è né il residuo né il tasso di attività. Le prove sono preparazioni distinte con dati finiti. D=g c+b. A: n₀=64,t=1 h,D=65. B: n₀=32,t=2 h,D=49. C: t=1 h,D=33. Quanto vale N₀,C nelle unità 10⁶ nuclei?

Procedimento d’autore: I cumulativi di riferimento sono 32 e 24. Le differenze danno g=(65−49)/(32−24)=2, poi b=1. La lettura 33 indica c_C=16. Dopo un’ora è trasformata metà: n₀,C=32.

Formule: g=2;  b=1;  c_C=\frac{33-1}{2};  c_C=16;  n_{0,C}=32.

Distrattori e controprove: 33 milioni omette l’offset e predirebbe D=34. Sessantaquattro omette il guadagno dopo aver sottratto b; sedici lascia il risultato come cumulativo invece di ricostruire l’inizio.

Hint: L’offset del display non è una popolazione di genitori.

Fonte SHA256 cf70266ea738344ad6cf86adc78a08b6c0ca3438b1e6d89d2bd55d1eb9017385. Candidato SHA256 edb0e6fc7e99e19f1082b5e6b1d30941b1590c250a07be0dfb478e7a1d66ecb5. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-decayed-count-16 — Due cumulativi a distanza di un’ora

Caso autonomo: campione chiuso di un solo genitore, T½=1 h, senza produzione. A un tempo t>0 si sono trasformati in media 12 milioni di genitori iniziali; a t+1 h il cumulativo è 14 milioni. N₀ è ignoto. Quanto vale t in ore?

Procedimento d’autore: Nell’ora aggiuntiva si trasformano 2 milioni, metà dei genitori ancora presenti a t. Definisco r il numero residuo a t, in milioni: r=4. L’inizio era perciò 12+4=16 milioni. La frazione residua a t è 4/16=1/4: sono trascorse due emivite, quindi t=2 h.

Formule: r/2=14-12;  r=4;  n_0=12+r;  n_0=16;  2^{-u}=\frac4{16};  u=2;  t=2\,\mathrm h.

Distrattori e controprove: Un’ora con n₀=16 darebbe cumulativo 8 milioni, non 12. Quattro ore ne darebbero 15 milioni. Il rapporto diretto 14/12 non è una sopravvivenza esponenziale: va prima separato il residuo dal cumulativo.

Hint: Usa la differenza dei cumulativi per conoscere i genitori presenti al primo tempo.

Fonte SHA256 4f8974af76374ef1d2c1692ef3a63a0de9a968e1e3de5c29fba0d7d9681e11a0. Candidato SHA256 0b3d281ccc4f915b031eee572eae03065133f45d897bbdb16520d5b822867af1. Skill reale C5-L08. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 7dcb356ca10cec616a8107112c02d522cbc87e72d15e6dd4f0695c4bb5858842. Package file SHA256 5558fff07b1952687d771cc0adcf2631ef8166f4e21177338b127dbbc5af4272. Binding file SHA256 66249eab1224fb4d547c538bd35e29727b351dcc2d96e1c01946760834802d07. Strutturale SHA256 9797cbaa6671d4ba537109fdd08aec4766ebd304270b1e5dbd1765fc7582e5f7. Manifest asset-only SHA256 c1a2414de4e1f7c5d7257be2557269afb95f427ef04439e47409035e9f343d2e.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Nota geometrica d’autore: le prime barre complete valgono ciascuna 64 milioni, lunghezza 320; i segmenti residuo/trasformati sono 160/160 a 1 h e 80/240 a 2 h, con stessa scala 5. Il grafico usa x=150+110 t[h], y=1000−5 N_dec[milioni] e i punti esatti (1,32),(2,48),(3,56), con origine aperta di riferimento. Il pannello autonomo finale rappresenta un altro campione, totale 16 milioni e lunghezza 320: segmenti 80/240 per 4/12 e 40/280 per 2/14, scala 20 comune entro quel pannello. Tutti i testi e le curve letti in XML e PNG completo 640 × 1600 dopo exit 0 reale, nessuna sovrapposizione osservata. Scala tecnica documentata qui e non mostrata come pixel responsive.
