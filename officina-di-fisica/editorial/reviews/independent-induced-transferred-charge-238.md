# Revisione indipendente — induced-transferred-charge-238

Primaria prompt-only c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc congelata prima delle candidate. I modelli sono stati scritti ed eseguiti realmente nel commit d7389745 prima di aprire qualsiasi prompt/opzione/chiave/blocco/SVG candidato B. Nessuna primaria B o modulo autore è stato letto/importato. Dopo tale congelamento tutti i 16 record finali di questa famiglia sono stati letti integralmente, insieme alle cinque figure U605 in XML e nuovi native indipendenti completi.

Le note distinguono il momento della primaria da quello della successiva lettura delle alternative. I risultati non sono stati derivati dalla chiave autore. Source e candidate sono vincolati al pin Git realmente letto; eventuali revisioni future invalidano il congelamento. UI prodotto NOT_RUN, human NOT_RUN, DRAFT e publicationAction NONE; integrazione canonica ROOT PENDING.

## AR-u6-induced-transferred-charge-01 — Integrare la corrente senza conoscere la durata

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. ΔΦ=6 mWb e R=2 Ω. Quanto vale Q in mC?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Fisso una normale: ε=−dΦ/dt e i=ε/R per la spira singola resistiva con R costante, autoinduzione trascurabile. Il flusso è monotono, quindi il modulo della carica complessivamente passata è Q=∫|i|dt=|ΔΦ|/R. Non occorre assumere corrente costante. 6 mWb/2 Ω=3 mC perché Wb/Ω=V·s/Ω=A·s=C.

Alternative e controprove: 3 mC=6 mWb/2Ω; 12 moltiplicaR, 6 ometteR, 1/2 copia 1/R. Carica di sezione non si accumula come netta della spira.

Esito esatto del modello indipendente: 3. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: XML e native indipendente completo 640 × 1720 letti. Grafico flusso: origine(130, 550), x=130+180 t[s], y=550−50 Φ[mWb], finali(310, 250)=(1 s, 6 mWb), (490, 250)=(2 s, 6 mWb). A R 2 Ω le correnti sono 3 e 3/2 mA. Rettangoli 120 × 120 e 240 × 60 hanno stessa area 14400 coordinate² e scale comuni 120 coordinate/s e 40 coordinate/mA: entrambi 3 mC. Barre 240/320/280 da 150 rappresentano 3/4/7/2 mC, scala 80 coordinate/mC; sono altre preparazioni dichiarate.

Fonte SHA256 98f5f5826de109a6a235699deb29d33d2516c9a34dc23d3827ed9e72652779a0. Candidato SHA256 56e55fc010590cfedcae80ab719302b1bc634180f90df422556671bdcc1edccb. Firma della lettura finale 9f3272e16f1e58dbea5a75a5d6b36aef156ccec79157bb6a63268253cc225ac6.

## AR-u6-induced-transferred-charge-02 — L’unità della carica trasferita

Consegna finale: Quale unità è dimensionalmente adatta alla carica totale trasferita?

Ipotesi controllate: Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.

Derivazione e procedura manuale indipendente: La grandezza richiesta ha dimensione carica, C=A·s=Wb/Ω. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.

Alternative e controprove: C=A·s=Wb/Ω; A corrente, V tensione, Wb flusso, Ω resistenza.

Esito esatto del modello indipendente: C. Scope: NO_STUDENT_CALCULATION. Modalità: AI_CONCEPTUAL.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 90d5842a200c754153304d1840917841578b9c4dff80fa02a764f73c0451443e. Candidato SHA256 ea0071536b7796b57b8fd748ec065e47e32da07a786b6fdc72bbf33804fc2c7d. Firma della lettura finale e458d50d17b56b0b19aaa2e4b01f86525f4163450cda9c77da0dd36a111548a1.

## AR-u6-induced-transferred-charge-03 — Dal bilancio integrale alla legge finale

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Quale relazione fornisce Q?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Integrando i=−(1/R)dΦ/dt si ottiene la carica orientata−ΔΦ/R; la richiesta di modulo con variazione monotona dà Q=|ΔΦ|/R. In numeri Q[mC]=ΔΦ[mWb]/R[Ω]. Senza monotonia, carica netta e totale dei moduli richiederebbero distinzione.

Alternative e controprove: Q=ΔΦ/R integrando. Dividere ancora per Δt dà A; RΔΦ ha dimensioni diverse, R/ΔΦ inversa diC, ΔΦ resta Wb.

Esito esatto del modello indipendente: Q = ΔΦ / R. Scope: SYMBOLIC_MANUAL_DERIVATION. Modalità: AI_CONCEPTUAL.

Figura: XML e native indipendente completo 640 × 1720 letti. Grafico flusso: origine(130, 550), x=130+180 t[s], y=550−50 Φ[mWb], finali(310, 250)=(1 s, 6 mWb), (490, 250)=(2 s, 6 mWb). A R 2 Ω le correnti sono 3 e 3/2 mA. Rettangoli 120 × 120 e 240 × 60 hanno stessa area 14400 coordinate² e scale comuni 120 coordinate/s e 40 coordinate/mA: entrambi 3 mC. Barre 240/320/280 da 150 rappresentano 3/4/7/2 mC, scala 80 coordinate/mC; sono altre preparazioni dichiarate.

Fonte SHA256 37fb67b980fa3980cd056b07674a95db2d94ab50e614cde22bd9299358a37d5f. Candidato SHA256 7b9664bb7b9c269075f76f258fe4939a38f6ff1e8e6825449d08493d8e54e795. Firma della lettura finale c0bfb003a1ac1945cdccf8d05ee71a4da64c6544c5f76e31aa58c9c83b4af265.

## AR-u6-induced-transferred-charge-04 — Una variazione di flusso più piccola

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Si passa da ΔΦ=6 mWb a ΔΦ=1 mWb, mantenendo R=2 Ω. Come cambia Q?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: A R 2 Ω fissata, ΔΦ passa da 6 a 1 mWb. Q passa da 3 a 1/2 mC, fattore 1/6. La durata può cambiare senza influenzare Q in questo ideale, se stessi flusso netto, monotonia e R.

Alternative e controprove: 3→1/2 mC: rapporto 1/6.18 inverte, 3/2 dimezza, 3 ignora, 1/6 mC tratta rapporto come carica.

Esito esatto del modello indipendente: Da 3 mC a 1/2 mC. Scope: EXACT_MANUAL_CALCULATION. Modalità: AI_CONCEPTUAL.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 c9352639d81f49ad9af76d06130d4937cd00e719d3dea4184d7f4044ac853228. Candidato SHA256 05cce991256d1e985e67c7fbca2d88723e6fbb54a9645e6611fa10765f735626. Firma della lettura finale 4df973b5309e6814a1766845285655dcbd9b3afe6e7f0caf3a0ef6deaa2d6c2b.

## AR-u6-induced-transferred-charge-05 — Ritrovare la variazione di flusso

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Q=3 mC e R=2 Ω. Quanto vale ΔΦ in mWb?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Isolo |ΔΦ|=QR. Con Q 3 mC e R 2 Ω: ΔΦ 6 mWb. C·Ω=V·s=Wb e milli resta milli. Moduli finiti positivi.

Alternative e controprove: QR=3·2=6 mWb.3/2 divideR e darebbe 3/4 mC; 3 copiaQ; 12 darebbe 6 mC.

Esito esatto del modello indipendente: 6. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 963b3a107970cfafb656ffa036b097c4eda6cd32d917b34013f04233ee082d7a. Candidato SHA256 d5c6ac567bf2415db12c9eb48e3cafd9f96017256f3a242396b275abfe91d926. Firma della lettura finale b99fc9d82bd698ef545d68b027c8ad9a86a3d406475eeba151e789f17dde6fd6.

## AR-u6-induced-transferred-charge-06 — La resistenza dalla carica passata

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Q=3 mC con ΔΦ=6 mWb. Quanto vale R in Ω?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Isolo R=|ΔΦ|/Q. Sei mWb divisi per 3 mC danno 2 Ω. Q>0 evita un denominatore nullo.

Alternative e controprove: R 6/3=2Ω.1/2 reciproco, 18 prodotto, 6 copiaflusso.

Esito esatto del modello indipendente: 2. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 ac5c41a4544ec81ec59e7ec4e9528b936e2a953e74f96841f4d55d86c9bdd4d1. Candidato SHA256 facae17f65652951116a745b0bc7c6a99a8afd78d4f3ce0742b7e1794d5b705b. Firma della lettura finale e88f57f79278ad808cc08a1cc3dd7ddbbe9dcdf025cffb673d3b1242420822e1.

## AR-u6-induced-transferred-charge-07 — Stesso flusso, minore resistenza

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. A usa ΔΦ=6 mWb,R=2 Ω; B mantiene ΔΦ e usa R=1 Ω. Quanto vale Q_B/Q_A?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: A 3 mC. B con R 1 Ω e stessoΔΦ 6 mWb dà 6 mC. Rapporto 2, inverso del fattore 1/2 della resistenza.

Alternative e controprove: 6/3=2.1/2 segueR diretto, 4 quadra, 6 copia caricaB, 1 ignora.

Esito esatto del modello indipendente: 2. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 c8917fadc9b46cd752f673ff797c9350d843cd85a88beb4b669987ff626b4d0f. Candidato SHA256 be0093c143c85340f59e65c14abc35619398e5dfeebcab9c7771aa3f552d882e. Firma della lettura finale 1aa7ec80da865b7880d6b1239798e13ec69c273e6c3902c0fc66476170908cd9.

## AR-u6-induced-transferred-charge-08 — Scarto della carica proposta

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Per ΔΦ=6 mWb,R=2 Ω si propone Q=6 mC. Quanto vale proposta meno corretto?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Proposta 6 mC meno corretto 3 mC=+3 mC. Il rapporto sarebbe 2; il segno dello scarto è fissato dall’ordine richiesto e non dal verso della corrente.

Alternative e controprove: +3 mC=6−3.−3 ordine, 2 rapporto, 6 proposta, 0 accettazione.

Esito esatto del modello indipendente: 3. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 24f7effdde94c33412dfa225fb4cebf5011ed72658f3fe4e581996fb9b24dd6b. Candidato SHA256 7041193e8d20d8faf1302a383385506ae7d6880848d64c106ec0bcf8248e0c6e. Firma della lettura finale ff8c5926898156787b2d9aa33bcb1dfecc7823183c4c3d366ddb8eedaf5da94a.

## AR-u6-induced-transferred-charge-09 — Isolare il flusso senza una durata

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Q e R sono noti. Quale formula isola ΔΦ?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Da Q=|ΔΦ|/R si ottiene |ΔΦ|=QR. Si conserva il ramo dei moduli positivi. La formula riguarda la variazione per una sola spira; non si aggiunge N non assegnato.

Alternative e controprove: ΔΦ=QR. Q/R non è Wb, R/Q è reciproco diQ/R, QRΔt aggiunge tempo eQ da solo èC.

Esito esatto del modello indipendente: ΔΦ = Q R. Scope: SYMBOLIC_MANUAL_DERIVATION. Modalità: AI_CONCEPTUAL.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 a090d3150987615f528c1e017f8e472d60da368114172936c64a8d774ad147cf. Candidato SHA256 099134dd5ebbea557409e569dad445e4c7ac5f730a83cec9e69da8456b4e4ae0. Firma della lettura finale 90da37a13b793453893eabe25acf5f5665404c04b780a0b7f50bd06b957402fa.

## AR-u6-induced-transferred-charge-10 — Fattori su flusso e resistenza

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. ΔΦ_B=κ₁ΔΦ_A,R_B=κ₂R_A, con fattori positivi. Quanto vale Q_B/Q_A?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Stati separati con ΔΦ_B=κ₁ΔΦ_A e R_B=κ₂R_A: Q_B/Q_A=κ₁/κ₂. Restano R costante entro ciascun processo e flusso monotono; non si assume una corrente costante nel tempo.

Alternative e controprove: κ₁/κ₂: R è costante nel processo ma può differire fra prove. Prodotto e reciproco alterano legge, quadrato/somma non giustificati.

Esito esatto del modello indipendente: κ₁ / κ₂. Scope: SYMBOLIC_MANUAL_DERIVATION. Modalità: AI_CONCEPTUAL.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 db3fb2b81fdeb46ce571bbb40956660b08dc7a27166eaeab12054a531e54dba6. Candidato SHA256 540343934c688ddf64a2e416107e8c474d2a4f5e4c28c964279e6094b385ff45. Firma della lettura finale f05a73085400a3262c38c15d6cb136dcda29359ee56b1cea3ae1c02df2bd26bf.

## AR-u6-induced-transferred-charge-11 — Due preparazioni con flusso e R diversi

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. A usa ΔΦ=6 mWb,R=2 Ω; B usa ΔΦ=12 mWb,R=3 Ω. Quanto vale Q_B/Q_A?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: A:6/2=3 mC. B:12/3=4 mC. Rapporto 4/3, puro. Il fattore due della variazione di flusso va diviso per 3/2 della resistenza.

Alternative e controprove: 4/3 da 4 mC/3 mC.3/4 reciproco, 2 flusso, 2/3 soloR, 1 falsa compensazione.

Esito esatto del modello indipendente: 4/3. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 6d579f026ace6e300122804d7d44f16f3b223f12c6f5ebbf64ce6e65aa3ceb62. Candidato SHA256 5e3ae6a9b7603496746f36f3dd109afb59d66206fb5096643e289b9a689b9ea7. Firma della lettura finale 8fb64aa878ae170e1806de5e14e71224a8ebc1886e052dcaea047c63e562a8d3.

## AR-u6-induced-transferred-charge-12 — Media di due cariche trasferite

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. A usa 6 mWb,2 Ω; B usa 12 mWb,3 Ω. Qual è la media aritmetica delle due Q?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Media(3+4)/2=7/2 mC. Ai dati medi ΔΦ 9 mWb, R 5/2 Ω si avrebbe 18/5 mC. Media meno risultato ai dati medi=35/10−36/10=−1/10 mC. Tutto si fa con frazioni esatte.

Alternative e controprove: 7/2 mC: media 3 e 4.18/5 ingressi medi, 7 somma, 1/2 semidifferenza, 4 seconda prova.

Esito esatto del modello indipendente: 7/2. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: XML e native indipendente completo 640 × 1720 letti. Grafico flusso: origine(130, 550), x=130+180 t[s], y=550−50 Φ[mWb], finali(310, 250)=(1 s, 6 mWb), (490, 250)=(2 s, 6 mWb). A R 2 Ω le correnti sono 3 e 3/2 mA. Rettangoli 120 × 120 e 240 × 60 hanno stessa area 14400 coordinate² e scale comuni 120 coordinate/s e 40 coordinate/mA: entrambi 3 mC. Barre 240/320/280 da 150 rappresentano 3/4/7/2 mC, scala 80 coordinate/mC; sono altre preparazioni dichiarate.

Fonte SHA256 095fe6796c0c3660fe977c38dbe7630c47c66ca156557aba1ced6556fb5c54e9. Candidato SHA256 82caef3ae9621b50b12caf2d5999d9978fd0c0ca763dfe161518eec53217386c. Firma della lettura finale c285e2fc2055b3ba84c23ccc45b4b0fc75ef12090190aea34d6cf58925489b6d.

## AR-u6-induced-transferred-charge-13 — La resistenza per una carica bersaglio

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. A usa 6 mWb,2 Ω. B ha ΔΦ=12 mWb e deve ottenere Q_B=(4/3)Q_A. Quanto vale R_B/R_A?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Il bersaglio è(4/3)·3=4 mC. Con ΔΦ_B 12 mWb occorre R_B=12/4=3 Ω, dunque R_B/R_A=3/2. La carica trasferita non è la corrente istantanea del nuovo processo.

Alternative e controprove: Bersaglio 4 mC:12/4=3Ω, rapporto 3/2.2/3 reciproco, 4/3 copiaQ, 2 flusso, 1 darebbe 6 mC.

Esito esatto del modello indipendente: 3/2. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 7e8a56a956d7a111a2bf71cb70ba8927883c76b4186ac16a3bcd0f24bd0389f2. Candidato SHA256 c5df1468cb207abb3877689b94688df5906ceca35a6e2a84e1da05266df85266. Firma della lettura finale 265e82529c4b0c41aadec17f901239b9c356f47a58e27e22f00d29aa08a70b7d.

## AR-u6-induced-transferred-charge-14 — Un display proporzionale alla carica

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. D=a_cal Q è continuo e adimensionale. A con ΔΦ=6 mWb,R=2 Ω dà D=9. Nella nuova prova D=12,R=3 Ω. Quanto vale ΔΦ in mWb?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Riferimento Q_A 3 mC con lettura 9: a_cal 3 unità/mC. Lettura 12 indica Q_B 4 mC. Con R_B 3 Ω, ΔΦ_B=Q_BR_B=12 mWb.

Alternative e controprove: g 3(mC)⁻¹, D 12→4 mC, QR 12 mWb.36 salta g, D 36; 4 copiaQ; 6 darebbeD 6.

Esito esatto del modello indipendente: 12. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 b0bffca7c5ef532108324b8d0a950c7ba061076bcac074dfb0a23b24c4974f0a. Candidato SHA256 9c33323e7768dc28ab5bed8996f83ab653cd6a22b5ceef26c7309fe3109f4c93. Firma della lettura finale 53d54f371526e3ca2e797bc9f393cabea07762fee576cbdfd1cd120d3c96275b.

## AR-u6-induced-transferred-charge-15 — Taratura affine e flusso finale

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. D=a_cal Q+b_cal è continuo. A: 6 mWb, 2 Ω, D=7; B: 12 mWb, 3 Ω, D=9. C ha R=5 Ω e D=5. Quanto vale ΔΦ_C in mWb?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Riferimenti Q_A 3 mC, Q_B 4 mC e letture 7, 9: guadagno 2 unità/mC e offset 1. Lettura 5 dà Q_C 2 mC. R_C 5 Ω implica ΔΦ_C 10 mWb. L’offset non è una carica fisica residua della spira.

Alternative e controprove: g 2(mC)⁻¹, b 1, D 5→2 mC, QR 10 mWb.25/2 salta b, D 6; 20 salta g; 2 copiaQ.

Esito esatto del modello indipendente: 10. Scope: EXACT_MANUAL_CALCULATION. Modalità: EXACT_ORACLE.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 061b8e58eb8549b56c796fec455176e3f406a462bce9003ff4bcf952671744b0. Candidato SHA256 a03ab633534f14db3887948f9ebf2245f3c6ebc4e2f68eb30200055be1b68892. Firma della lettura finale c124b24581201dc576f791305160a0aebb825b07768c049ffd9a42b16db032e7.

## AR-u6-induced-transferred-charge-16 — Una misura ridondante del rapporto

Consegna finale: Una sola spira chiusa ha resistenza totale R>0 costante. Il flusso esterno cambia monotonamente fra due valori: ΔΦ>0 è il modulo della differenza finale meno iniziale, in mWb. Autoinduzione ed effetti capacitivi sono trascurabili. Q>0 è il modulo della carica che attraversa una sezione del filo durante la variazione, in mC; non è la carica netta dell’intera spira. Il verso della corrente non cambia durante questo processo monotono. Fra preparazioni ΔΦ=(3 mWb/Ω)R. Si misura anche Q=3 mC. Quante coppie positive (ΔΦ,R) restano possibili?

Ipotesi controllate: Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.

Derivazione e procedura manuale indipendente: Il vincolo numerico ΔΦ=3 R equivale a |ΔΦ|=(3 mWb/Ω)R, ossia coefficiente 3 mC. La legge dà Q 3 mC per ogni R positiva finita: infinite coppie continue. Esempi(3 mWb, 1 Ω), (6 mWb, 2 Ω), misura ridondante e nessuna equazione quadratica.

Alternative e controprove: ΔΦ=[3 mWb/Ω]R implicaQ 3 mC per R continua. Esempi(3 mWb, 1Ω), (6 mWb, 2Ω); assenza/unicità/due/tre non seguono.

Esito esatto del modello indipendente: Infinite coppie continue. Scope: SYMBOLIC_MANUAL_DERIVATION. Modalità: AI_CONCEPTUAL.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Fonte SHA256 a1212e0a2f05bf27bc62e8e8d9ee74863b15f69841557a029ef69b8f3876eb66. Candidato SHA256 dc85a27a69392d3a83c30b02d67d682b7460044a6855afd332ac743ffdc7423b. Firma della lettura finale 87f837592aa00c83459fae90016a25511bb236b4892a23aee20b20e87e9bc6b3.

## Edizione e limiti

Commit candidato riletto 1f9274d1ea3ff4d3ad0a97f7f820311bdf6a05ed. Verifier SHA256 023606ae707d19d26825ced05d2d37546e78f7d908498b51a0557a0a5c7bd712. Contratto SHA256 a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60.

Le quattro formulazioni ellittiche dei feedback16 di 235/237/238/239 sono state segnalate e corrette dall’autore in 1f9274d1. Ogni record 16 è stato riletto integralmente sul finale; assert strutturali confermano solo testo finale/error e binding 16 mutati, gli altri 15 e tutte chiavi/formule/asset invariati. Il236 è rimasto identico. I nuovi native indipendenti si riferiscono agli asset identici finali, senza riuso di un’approvazione UI prodotto.

Protocollo conclusivo reale: 16 test PASS, exit 0 osservato sul wrapper; 135 mutazioni dei pacchetti con binding/token e tutti i pin di edizione sostituiti in memoria; 5 guasti costitutivi e 5 inverse errate respinti; 240 configurazioni Hypothesis contate effettivamente, 484 guardie finite/exact su tutti gli argomenti. Durata finale 3.901 s. Fonte/catalogo/hash Git, identity fresh+saved e cinque native completi controllati. Il primo builder privato fallì per la tabella unità priva di A: negativo preservato, corretto prima della generazione di report. Run01/02 reali restano storici, non retaggati come run finale. Nessun candidato B, runtime o Root modificato.
