# Authoring DRAFT — photon-rate-power-242

Tutti gli 80 prompt originali A240–244 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-01. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-01 SHA256 609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233. Ogni caso autonomo è conservato, senza imporre il modello numerico comune: frequenza all’interfaccia 24003, velocità di fase 24004, ordinamento fotonico 24103, soglia a un fotone 24203 e geometria EM 24303. Conteggi N interi e tassi medi sono distinti. Le unità di misura scalate non sono confuse con quantità adimensionali: ogni coefficiente numerico è definito dalla normalizzazione.

Prima di qualunque candidato sono state congelate entrambe le primarie. B per A240–244: SHA 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d su 8a82a32527171b68346cf30a933552b2a5f9366f, mai aperta dall’autore. A per B245–249: SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 su b3932757. Nessuna opzione, chiave, soluzione, SVG o modulo autore B245–249 letto durante l’autoria A.

Lettura integrale delle lezioni reali C5-L06 e C5-L07 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d: interfaccia stazionaria, campi EM, energia per fotone, potenza e frazione trasmessa. Primaria C5-L06 per 240/243 e C5-L07 per 241/242/244; prerequisiti reali del catalogo. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Non è una seconda pipeline e non attribuisce credito di integrazione o SCI.

Asset SVG-only realmente renderizzato in browser nativo, XML e PNG completo effettivamente letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. Nessuna UI prodotto locale: test a 320px e relativo marker NOT_RUN e riservati al runner canonico. I testi visibili mostrano grandezze fisiche, non pixel o altre metriche ingegneristiche.

## AR-u7-photon-rate-power-01 — Dalla potenza all’energia per fotone

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Con P=33 pW e u=1, quanto vale Ṅ in unità q_R? Inserisci il coefficiente r.

Procedimento d’autore: La potenza è energia per tempo. Per fotoni monocromatici P=Ṅhf, quindi divido per l’energia di un fotone. Qui hf=(33/5)·10⁻¹⁹ J e P=33·10⁻¹² J/s: i33 si cancellano e resta Ṅ=5·10⁷ s⁻¹=50q_R. In numeri la stessa legge è r=50p/(33u).

Formule: P=\dot Nhf;  r=\frac{50p}{33u};  r=50;  \dot N=50q_R.

Distrattori e controprove: Cento raddoppia il risultato;33 copia la potenza numerica senza dividerla per hf. Cinque perde un fattore dieci nella scala dell’uscita. Il valore prescritto di h va mantenuto in tutto il calcolo.

Hint: Dividi energia emessa per secondo per energia di un fotone.

Fonte SHA256 3b35fada1275d69d54316d57157d0f9895c5c1c0e839d81054f9d4c9fbd45409. Candidato SHA256 4388d337a08055bc5dd84fad3c9c93da3b65364fba6103a2f58042341c30abaf. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-02 — L’unità di un tasso medio

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Quale unità è dimensionalmente adatta a Ṅ?

Procedimento d’autore: Il numero di fotoni è un conteggio puro e il suo tasso medio ha unità s⁻¹. Da P/(hf), (J/s)/J restituisce1/s. La frequenza del campo ha la stessa dimensione, ma è un’altra grandezza fisica rispetto al numero di fotoni per secondo.

Formule: [\dot N]=\frac{\mathrm{J/s}}{\mathrm J};  [\dot N]=\mathrm s^{-1}.

Distrattori e controprove: J è energia di un fotone o del pacchetto, W potenza, s tempo. Il simbolo1 sarebbe adatto al coefficiente r, non al tasso fisico Ṅ. Non si identifica Ṅ con f soltanto perché condividono una dimensione.

Hint: Controlla le unità del rapporto P/(hf).

Fonte SHA256 5862bfc1bc0ab3a951bf25ab39dc50f6ca8f68717668637eeb860551cc266134. Candidato SHA256 9978abc7e5408ef0840148cb4e9925d88bd0253547ce3d0c180c465ca112cf49. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-03 — La soglia riguarda il singolo fotone

Caso autonomo: in un evento di assorbimento a un solo fotone da parte di un atomo, quale proprietà determina se il fotone può fornire l’energia necessaria a rimuovere un elettrone?

Procedimento d’autore: Il confronto energetico è fra hf del singolo fotone e la soglia del processo considerato. Aumentare il numero di fotoni aumenta la potenza o il numero di occasioni, ma non l’energia disponibile in un singolo evento a un fotone. Superare la soglia è una condizione energetica necessaria, non una promessa che ogni fotone venga assorbito e ionizzi.

Formule: E_\gamma=hf;  hf\geq E_{\rm soglia}.

Distrattori e controprove: Potenza, tasso, durata e area possono influenzare il numero complessivo di eventi, ma non sostituiscono hf nel bilancio di questo evento a un fotone. Non si invocano processi multifotonici, esclusi dal tipo di evento posto.

Hint: Separa energia per fotone da energia totale del fascio.

Fonte SHA256 67ffa8f59d1ca1746b9e4b868242c93a20b200349588788703b41b4eb64d0d6d. Candidato SHA256 abb7d203ff18c9c7fc094fb28a9c163a1c3381036ca9f155916cfcc5ae02ace4. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-04 — Potenza doppia, fotoni individuali invariati

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. u resta1 e P passa da33 a66 pW. Come cambia Ṅ?

Procedimento d’autore: La frequenza f non cambia, quindi ogni fotone porta la stessa hf. La potenza doppia deve corrispondere al doppio del tasso medio: r50→100. Non si sta raddoppiando l’energia di ciascun fotone.

Formule: r_A=50;  r_B=100;  \dot N_B/\dot N_A=2.

Distrattori e controprove: 25 inverte la dipendenza dalla potenza.200 introduce un quadrato;66 copia p_B e50 ignora il cambiamento. La potenza resta distinta dal tasso pur essendo a esso proporzionale a f fissata.

Hint: A f invariata, hf è lo stesso divisore nelle due prove.

Fonte SHA256 5198bc112682498e865617e83fa81efba54eea5aa6661295e7f7ee742a3e3e8f. Candidato SHA256 2d29b37ede2e62bcdd14b3ba9cdc151e118acbd68d331e0d586bdaac455455f5. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-05 — La potenza ricostruita dal tasso

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Ṅ=50q_R e u=1. Quanto vale P in pW?

Procedimento d’autore: Isolo P=Ṅhf. Nelle variabili numeriche p=(33/50)ru: per r50,u1 il cinquanta si cancella e p33. Quindi P33 pW. Il coefficiente r da solo non è una potenza.

Formule: P=\dot Nhf;  p=\frac{33}{50}ru;  P=33\,\mathrm{pW}.

Distrattori e controprove: Cinquanta copia r senza l’energia per fotone.66 pW darebbe r100;33/2 pW darebbe r25. Dividere ancora per hf ripeterebbe la legge diretta invece dell’inversa.

Hint: Moltiplica il tasso per l’energia di un fotone.

Fonte SHA256 bc65081bf6afb94b033dfd5cecd96961f44dff2695f05f925da72b431907ac1c. Candidato SHA256 7d387ffb0aa5a58ab3bff25e33dfec38ff4e0c493d0de1844e8f71892a4275e0. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-06 — La frequenza dal tasso a potenza nota

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Ṅ=50q_R e P=33 pW. Quanto vale f in unità di10¹⁵ Hz? Inserisci u.

Procedimento d’autore: Dalla legge r=50p/(33u) ricavo u=50p/(33r). Con p33 e r50, i prodotti al numeratore e denominatore coincidono: u1 e f10¹⁵ Hz. Tutti i denominatori sono positivi.

Formule: u=\frac{50p}{33r};  u=1;  f=10^{15}\,\mathrm{Hz}.

Distrattori e controprove: Due dimezzerebbe r a25 per la stessa potenza. Un mezzo raddoppierebbe il tasso a100.33 copia il valore numerico della potenza senza risolvere l’inversa.

Hint: A P fissata, fotoni più energetici implicano meno fotoni al secondo.

Fonte SHA256 06c127a3c5da39cbb58263ad9124037666ccc94485ab259d78a247c6df5a2d77. Candidato SHA256 9fcd6244907737a177495b672a254520ffb638b662519a5bb099b5f2fe688eff. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-07 — Frequenza doppia a pari potenza

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. A usa P=33 pW,u=1; B mantiene P e usa u=2. Quanto vale Ṅ_B/Ṅ_A?

Procedimento d’autore: L’energia per fotone raddoppia. Per trasportare la stessa potenza occorre metà del tasso: r_A50,r_B25. Il rapporto è1/2, inverso della frequenza a potenza fissata.

Formule: r_A=50;  r_B=25;  \dot N_B/\dot N_A=\frac12.

Distrattori e controprove: Due rende diretta la dipendenza da f. Un quarto introduce un quadrato;uno ignora f. Zero non segue da potenza positiva e frequenza finita.

Hint: La potenza assegnata va ripartita in fotoni di energia diversa.

Fonte SHA256 d1ce265dbe7f104ec6d3316bd9580cfed866451d189cbc6f4a94130f5a68c41d. Candidato SHA256 ccaa6d650a754957b9ab3144e1b7ef0f0518a6cc4dc40a134a11112d862f95da. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-08 — Uno scarto di tassi

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Con P=33 pW,u=1 si propone Ṅ=100q_R. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è50q_R. La proposta supera il valore di100q_R−50q_R=50q_R. Due è invece il rapporto puro dei tassi e non la differenza richiesta.

Formule: \dot N=50q_R;  \delta\dot N=(100-50)q_R;  \delta\dot N=50q_R.

Distrattori e controprove: −50q_R inverte l’ordine.100q_R copia la proposta;0q_R la accetta senza verifica. L’unità q_R è un tasso, non una carica o una potenza.

Hint: Mantieni la scala10⁶ s⁻¹ dopo la sottrazione.

Fonte SHA256 8c749f0b15f777dce7f37e511303883b221d363753d804c51f13afad627b3192. Candidato SHA256 1af9f0ac80da2bf8405f97c1b6b1c0937807677ff667f00b7505a49e1dfeed4e. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-09 — La potenza nell’inversa dimensionale

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Ṅ e f sono noti. Quale relazione isola P?

Procedimento d’autore: Ogni fotone porta hf e il tasso indica quanti ne vengono emessi mediamente per tempo. P=Ṅhf ha unità s⁻¹·J=W. La normalizzazione r non cambia la relazione fra grandezze fisiche.

Formule: P=\dot Nhf;  [P]=\mathrm W.

Distrattori e controprove: Ṅ/(hf) ripete la divisione della legge diretta e non è una potenza. hf/Ṅ ha unità J·s; le altre formule scambiano il ruolo di h o della frequenza. Non si eliminano coefficienti dimensionati perché numericamente prescritti.

Hint: Moltiplica energia per fotone e tasso.

Fonte SHA256 309cfeea4bb5101aa17a0ad2dec25b1dbcdfdbda8ae366c4d5b69924f17240e1. Candidato SHA256 4400a34d0073192b5636c62994839325226537ea1b286731b33b30bd4b68af62. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-10 — Due fattori fra sorgenti

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Fra prove P_B=κ₁P_A e u_B=κ₂u_A, con fattori positivi. Quanto vale Ṅ_B/Ṅ_A?

Procedimento d’autore: La potenza moltiplica il numeratore e la frequenza il denominatore di P/(hf). Il rapporto dei tassi èκ₁/κ₂. I tassi sono medie continue; non si impone che il prodotto di una scalatura per r sia un numero intero di fotoni.

Formule: \dot N_B/\dot N_A=\frac{\kappa_1}{\kappa_2}.

Distrattori e controprove: Il prodotto rende diretto l’effetto di f; il reciproco inverte il confronto. κ₂² aggiunge una potenza assente e la somma darebbe due per sorgenti identiche.

Hint: Conserva il denominatore hf nel confronto.

Fonte SHA256 a6b211740e8c6126c7ae642cae180b63548a60287a401c030ad55084cfd98511. Candidato SHA256 b50d8a4bc4f12cd4ee3113f2ea6f7000fcc296521ba104e2a93b02058a2541e1. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-11 — Due cambiamenti con una frazione esatta

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. A usa P=33 pW,u=1. B usa P=1 pW,u=2. Quanto vale Ṅ_B/Ṅ_A?

Procedimento d’autore: A dà r50. Per B, r=50/(33·2)=25/33. Il rapporto(25/33)/50 si semplifica dividendo25 per50:1/66. È possibile un tasso medio frazionario nella scala scelta; non significa dividere un singolo fotone.

Formule: r_A=50;  r_B=\frac{25}{33};  \dot N_B/\dot N_A=\frac1{66}.

Distrattori e controprove: Sessantasei inverte il rapporto.1/33 considera solo P,1/2 solo f euno ignora entrambi. Non si arrotonda25/33 a un intero.

Hint: Semplifica25 con50 prima di moltiplicare i denominatori.

Fonte SHA256 ec63b19ce9ed8fcdbdc5b39feb8d389501c7670f42448a9a4e84cdfb7a38497f. Candidato SHA256 72fba3a475bb7a641423ae03674185e1682ba326c545124fcfe832063c202bb0. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-12 — Media di due tassi medi

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. A usa P=33 pW,u=1; B usa P=1 pW,u=2. Qual è il coefficiente r medio, con pesi uguali?

Procedimento d’autore: Le uscite sono50 e25/33. Scrivo50=1650/33, sommo1675/33 e dimezzo: r medio1675/66. Agli ingressi medi p17,u3/2 il modello darebbe1700/99, diverso dalla media. Entrambi sono esatti e i tassi medi non hanno vincolo di integrità.

Formule: \overline r=\frac{50+25/33}{2};  \overline r=\frac{1675}{66};  r_{\rm dati\ medi}=\frac{1700}{99}.

Distrattori e controprove: 1700/99 usa i dati medi;1675/33 è la somma.1625/66 è la semidifferenza e25/33 ripete solo B. Si stanno pesando due preparazioni, non concatenando durate di emissione.

Hint: Usa il denominatore33 prima della semisomma.

Fonte SHA256 67fdea359d13382ad1e513eee7115ced8c8bc3cec196f6d1419b6c91f19e4daf. Candidato SHA256 96fb4e6abe62e2f96d8ffc586e8f9883d97707d6f13ce3685aad101043982372. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-13 — La frequenza per il tasso bersaglio

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. A ha P_A=33 pW,u_A=1. B usa P_B=1 pW e deve dare Ṅ_B=Ṅ_A/66. Quanto vale u_B/u_A?

Procedimento d’autore: Il bersaglio ha r_B50/66=25/33. Nell’inversa u=50p/(33r), con p_B1, si cancellano i33 e resta50/25=2. Il rapporto u_B/u_A è due, non il fattore66 del tasso.

Formule: r_B=\frac{25}{33};  u_B=2;  u_B/u_A=2.

Distrattori e controprove: Mezzo inverte il confronto.66 copia il reciproco del bersaglio senza il cambio di potenza;1/33 copia P_B/P_A. Frequenza invariata darebbe r50/33, doppio del bersaglio.

Hint: Ricostruisci prima r_B come frazione esatta.

Fonte SHA256 d4ebe4675077c8e7f3f9f22316dcd4f36e606871285a5581adcd2862dc8cb105. Candidato SHA256 ad2de24ef6f42982c9d0f073a1fff8a74563bf2de3704cba96109be3b9d3e050. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-14 — Un display continuo può leggere una frazione

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. D=a_cal r è continuo e adimensionale. A con P=33 pW,u=1 dà D150. B ha u=2,D=25/11. Quanto vale P_B in pW?

Procedimento d’autore: Il riferimento r50 identifica a_cal3. La lettura25/11 dà r_B=(25/11)/3=25/33. Poi p_B=(33/50)r_Bu_B=(33/50)(25/33)·2=1: P_B1 pW. Le cancellazioni evitano ogni decimale.

Formule: a_{\rm cal}=3;  r_B=\frac{25}{33};  p_B=\frac{33}{50}r_Bu_B;  P_B=1\,\mathrm{pW}.

Distrattori e controprove: Tre pW usa D come r e predice D75/11. Un mezzo pW ignora il fattore u_B2 dopo la taratura;33 pW ripete A. La lettura non è un conteggio discreto.

Hint: Dividi per il guadagno prima di invertire il rapporto potenza/frequenza.

Fonte SHA256 b02354111774d247d0a5375c5269e2fc467ba776ec097e23f0914e6f4efedf3e. Candidato SHA256 ab2b196534c5d71960683f627520d80e40c78bf35f3dc6b6639332773478137c. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-15 — Due riferimenti frazionari eliminano l’offset

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. D=a_cal r+b_cal è continuo. A:P=33 pW,u=1,D=101. B:P=1 pW,u=2,D=83/33. C:u=1,D=201. Quanto vale P_C in pW?

Procedimento d’autore: I tassi numerici di riferimento sono50 e25/33. La differenza delle letture è3250/33 e quella dei tassi1625/33: guadagno due, offset uno. D_C201 decodifica r_C100. Allora p_C=(33/50)·100·1=66 e P_C66 pW.

Formule: a_{\rm cal}=2;  b_{\rm cal}=1;  r_C=100;  P_C=66\,\mathrm{pW}.

Distrattori e controprove: 6633/100 pW omette l’offset e predice D202.132 pW sottrae b ma salta la divisione per il guadagno.33 pW darebbe D101. Non si approssimano i riferimenti frazionari.

Hint: La stessa frazione al numeratore e denominatore del guadagno si cancella.

Fonte SHA256 25ecf4d663fb665b9fa37d15b6e585f34ad75cc12bb996e857504d7fdcc9a968. Candidato SHA256 0d6619b9e671b529e1f68a5b29e7c285aa0de8dbb80e7163960f68a328c4d724. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-photon-rate-power-16 — Una misura ridondante del tasso

Una sorgente monocromatica emette potenza media P>0 alla frequenza f=u·10¹⁵ Hz, con u>0 puro. Si assume h=6,6×10⁻³⁴ J·s come valore prescritto. Definisco p=P/(1 pW), q_R=10⁶ s⁻¹ e r=Ṅ/q_R, dove Ṅ è il numero medio di fotoni emessi per secondo. p e r sono coefficienti numerici puri. Il tasso medio è continuo: non si impone un conteggio intero a r o al numero medio per secondo. Ogni confronto è fra preparazioni positive finite. Fra preparazioni P=(33 pW)u e si misura anche Ṅ=50q_R. Quante coppie positive (P,u) sono possibili?

Procedimento d’autore: Il vincolo dà p=33u. Sostituendo in r=50p/(33u), con u>0, resta sempre r50. La misura conferma la proporzione senza fissare u. Esempi:P33 pW,u1 e P66 pW,u2. Anche u non interi positivi sono ammessi, perché il vincolo riguarda un tasso medio, non un pacchetto con N intero.

Formule: p=33u;  r=50;  (P,u)=(33\,\mathrm{pW},1).

Distrattori e controprove: Una o due coppie richiederebbero una scala indipendente. La risposta “Nessuna coppia” è smentita dagli esempi. Cinquanta è il coefficiente del tasso nella scalaq_R, non il numero delle preparazioni.

Hint: Controlla che u si cancelli e distingui tasso medio da conteggio.

Fonte SHA256 41a7208a4fc1d64deefc3ce26920fd16bf19f704d6ceb306e69a26f4f4cc094e. Candidato SHA256 a5c3b664256b56dd8ad0dd09bbc3714ef343f76d319a056e69c2c5cdbe96e041. Skill reale C5-L07. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 90e6ac6a721d12727256f629f2429e3b69242eb4b98a4ecb8649033feb718707. Package file SHA256 ff4183a82adb9917cd1cf75dd2ece083c524686d082f735f4f940e0ae532c9ef. Binding file SHA256 0697fa9bbaed3a28511adbb6ac432d1d3976c27ccc2fb5774f12f152162f157b. Strutturale SHA256 75d027593157e4888f24583dd6db8a1628b3e56610367b7244bcdb59d9a89bb1. Manifest asset-only SHA256 221914660738bad6a0af73b17bace557f16627827694e7ef4e1de20ca3fa8b69.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Lettura geometrica d’autore: le barre250 e125 coordinate da origine150 rappresentano50 e25 milioni/s, scala comune5 coordinate per milione/s; il campo della sorgente ha invece frequenza10¹⁵ Hz. Nel grafico a frequenza fissata, x=150+10P[pW] e y=1280−5r, con r=Ṅ/(10⁶ s⁻¹). Il punto(480,1030) rappresenta33 pW e50 milioni/s. L’origine aperta è un limite dei dati positivi. Non si rappresenta l’oscillazione temporale del campo tramite questo tasso di fotoni. I valori frazionari delle altre preparazioni sono trattati esattamente negli svolgimenti e non sono arrotondati per disegnare queste barre. XML e nuovo PNG completo effettivamente letti.
