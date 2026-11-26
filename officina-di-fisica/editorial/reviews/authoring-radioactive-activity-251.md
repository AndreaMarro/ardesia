# Authoring DRAFT — radioactive-activity-251

Tutti gli 80 prompt originali A250–254 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-02. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-02 SHA256 43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7. Le quantità statistiche sono distinte dai conteggi di eventi di un singolo nucleo; esponenti sempre adimensionali e parametri costanti entro una preparazione.

Entrambe le primarie sono state congelate prima dell’autoria: A per B255–259 SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4 su d0628ef617dc36ac03d018a854de21fdb3da4f28; B per A250–254 SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2 su 7518f76e54b9d05ab1b03548e6113339afd40db9, mai aperta dall’autore A. Nessun candidato, opzione, chiave, hint, solutionSteps o SVG B255–259 letto durante l’autoria A.

Letta integralmente la lezione reale C5-L08 «Una popolazione di nuclei che cambia nel tempo» al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, comprese formule e figura storica C5-emivita.svg. Copre esplicitamente popolazione media, emivita, attività, alfa/beta/gamma e condizioni del rivelatore. Skill primaria C5-L08, prerequisiti reali C1-L001/C5-L08. Nessun ID inventato.

Autore soltanto: DRAFT, SCI distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo con timeout originale: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Nessun credito di integrazione attribuito dall’autore.

SVG-only effettivamente renderizzato in browser nativo, XML e PNG completo letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. UI prodotto locale vietata e NOT_RUN; replay a 320px riservato al runner canonico. Le figure mostrano grandezze fisiche e non metriche in pixel.

## AR-u7-radioactive-activity-01 — Un tasso medio dai genitori presenti

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. Con N=20 e T=2 s, quanto vale 𝒜_m in Bq?

Procedimento d’autore: L’attività è il tasso medio di trasformazioni in quell’istante, non il numero di nuclei. Il coefficiente numerico assegnato dà (7/10)·20=14; dividendo per 2 s ottengo 7 s⁻¹, cioè 7 Bq. Non affermo che ln 2 sia esattamente 7/10.

Formule: \mathcal A_m=\frac{\eta N}{T};  \mathcal A_m=\frac{(7/10)20}{2\,\mathrm s};  \mathcal A_m=7\,\mathrm{Bq}.

Distrattori e controprove: 14 Bq omette la divisione per T e 10 Bq omette η. Il numero 20 è il conteggio presente, non un tasso. Una misura casuale in un singolo secondo non è obbligata a essere sette.

Hint: Applica prima il coefficiente assegnato, poi dividi per il tempo.

Fonte SHA256 f628730e585285fc1d2da07f23c36dfa3bbdd8cd4aa159e7dff91aa36d2e3e45. Candidato SHA256 5fc92a4e6ad73879b623affd03473f078ec3f07335340d0cc70a51412dcc377b. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-02 — L’unità dell’attività

Quale unità SI indica l’attività di una sorgente radioattiva, cioè il tasso medio di decadimenti?

Procedimento d’autore: Un becquerel corrisponde a un decadimento medio al secondo. Il conteggio delle trasformazioni è puro, dunque la dimensione è tempo inverso. Non è una dose assorbita né un’energia per emissione.

Formule: 1\,\mathrm{Bq}=1\,\mathrm{s^{-1}};  [\mathcal A]=T^{-1}.

Distrattori e controprove: Il secondo è un tempo, J energia, C carica e m lunghezza. Il solo valore dell’attività non determina l’energia o gli effetti di ciascuna emissione.

Hint: Distingui conteggio cumulativo e conteggio per unità di tempo.

Fonte SHA256 b80149442cd2d13a8f172eb07afb76d09e53983ac0e0cd1c2b7ffbf77135de70. Candidato SHA256 46676f28085a3d1a2822d8d32ed4befb2d7697f1b14e89e48a42e8ba7f6b815c. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-03 — Il beta più è un caso distinto

Caso autonomo: in un nucleo in cui il processo β⁺ è energeticamente consentito, quale trasformazione nucleare avviene?

Procedimento d’autore: Nel β⁺ nucleare un protone si trasforma in neutrone con positrone e neutrino elettronico. Il numero di massa resta A, mentre Z diminuisce di uno. La condizione energetica è del nucleo: non si sta affermando il decadimento β⁺ di un protone libero.

Formule: {}^A_ZX\longrightarrow{}^A_{Z-1}Y+e^++\nu_e;  A_f=A_i;  Z_f=Z_i-1.

Distrattori e controprove: La trasformazione neutrone→protone è β⁻ e aumenta Z. Perdere quattro nucleoni è α; una semplice γ non cambia Z. Espellere un elettrone atomico non converte un protone del nucleo.

Hint: Identifica il nucleone che cambia e conserva carica e numero di nucleoni.

Fonte SHA256 92bd844e5a3c08e016f1169d8cc3c838ed76997e5ec927849dd8027d26d28048. Candidato SHA256 5de05defebbfccb7e964195de3b30dc3f19f4658ffab7a00db0c7a16654a76d7. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-04 — Il doppio dei genitori presenti

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. A ha N=20,T=2 s; B ha N=40 allo stesso T. Come cambia 𝒜_m?

Procedimento d’autore: A emivita e coefficiente numerico fissati il tasso è lineare in N. Il doppio dei genitori fornisce il doppio dell’attività media: 14 Bq. Non si cambia la probabilità di trasformazione del singolo genitore.

Formule: \mathcal A_{m,A}=7\,\mathrm{Bq};  \mathcal A_{m,B}=14\,\mathrm{Bq};  \mathcal A_{m,B}/\mathcal A_{m,A}=2.

Distrattori e controprove: 7/2 Bq renderebbe il tasso inverso a N e 28 Bq applicherebbe il quadrato. Sette ignora la nuova quantità; quaranta copia N senza coefficienti e unità di tempo.

Hint: Mantieni costante il tasso per singolo genitore.

Fonte SHA256 fe19fc205ad0c75d30ae035ce50cb9146121f77d0719c9bcb431da819c990998. Candidato SHA256 05cdcbc163a2adf59f79ed791e59e4eb59f6f0e57c1d5a679a01b093cadda353. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-05 — Ricavare un conteggio intero

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. 𝒜_m=7 Bq e T=2 s. Quanto vale N in nuclei?

Procedimento d’autore: Moltiplico il tasso per l’emivita e divido per η: 7·2/(7/10)=20. Il risultato è puro ed è anche intero positivo. Con un dato che producesse un valore non intero non potrei descrivere quel singolo conteggio N senza precisare una media statistica diversa.

Formule: N=\frac{\mathcal A_mT}{\eta};  N=\frac{7\cdot2}{7/10};  N=20.

Distrattori e controprove: Dieci omette il fattore due della durata e darebbe 7/2 Bq. Quattordici omette la divisione per η e darebbe 49/10 Bq. Il valore 49/5 moltiplicherebbe ancora per η anziché dividerlo.

Hint: L’inversa deve recuperare sia l’unità di conteggio sia la sua integralità.

Fonte SHA256 7df7d8939a926ad634599f5eefa629b113652a6e92a83ef4ad8ad69ef3949f48. Candidato SHA256 dda48a1e6fafc88b8348c1bb7e4e81adb452cb2186b3c26a93521ed5044e5c94. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-06 — L’emivita dal tasso assegnato

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. 𝒜_m=7 Bq e N=20. Quanto vale T in secondi?

Procedimento d’autore: Da 𝒜_mT=ηN ricavo T=ηN/𝒜_m. Il numeratore è 14; diviso 7 s⁻¹ dà 2 s. Il risultato riguarda l’emivita nel modello numerico con η prescritto.

Formule: T=\frac{\eta N}{\mathcal A_m};  T=\frac{14}{7\,\mathrm{s^{-1}}};  T=2\,\mathrm s.

Distrattori e controprove: Mezzo secondo darebbe 28 Bq. Quattro secondi darebbero 7/2 Bq; venti copia il conteggio come se fosse una durata. Non si elimina η dalla relazione inversa.

Hint: Controlla che dividere per un tasso dia un tempo.

Fonte SHA256 c982fb8cf5464eb23a55ff7c7520cc4a0b5f985f81e4446a72abaf51dc930e1a. Candidato SHA256 807e122f700cc10ac495be6f296c27b13aa762a8f8fec35f2f0ad8d2a88ad090. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-07 — Stesso numero, emivita doppia

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. A ha N=20,T=2 s; B ha N=20,T=4 s. Quanto vale 𝒜_m,B/𝒜_m,A?

Procedimento d’autore: Con gli stessi genitori il tempo doppio al denominatore dimezza il tasso. A dà 7 Bq e B dà 7/2 Bq: rapporto un mezzo. Sono due preparazioni con emivite diverse, non una emivita che cambia durante la stessa prova.

Formule: \mathcal A_{m,B}=\frac72\,\mathrm{Bq};  \mathcal A_{m,B}/\mathcal A_{m,A}=\frac12.

Distrattori e controprove: Due segue T direttamente; un quarto quadra il fattore e quattro inverte quel quadrato. Uno ignora il parametro che cambia.

Hint: L’emivita è al denominatore della costante di decadimento.

Fonte SHA256 0dd4b6faafef2624db9cf04db701d26e004b5d5c917f873c32c4bc513a0a67c8. Candidato SHA256 0695bfea833ab3c607a82044a9656774d9327b6669ba98f589bbc3469e929fb1. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-08 — Lo scarto del tasso proposto

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. Con N=20,T=2 s viene proposta 𝒜_m=14 Bq. Quanto vale proposta meno corretto?

Procedimento d’autore: Il tasso numerico corretto è 7 Bq. La proposta è maggiore di 14−7=7 Bq. Il quoziente delle due attività è due e non ha l’unità dello scarto richiesto.

Formule: \delta\mathcal A_m=(14-7)\,\mathrm{Bq};  \delta\mathcal A_m=7\,\mathrm{Bq}.

Distrattori e controprove: −7 Bq scambia l’ordine della sottrazione; due è il rapporto. Quattordici ripete la proposta e zero non la verifica.

Hint: Scrivi entrambe le attività nella stessa unità prima della differenza.

Fonte SHA256 f3cc9c2b815ba827a1d9d241812a12405aaccc0dd687151b7c23658ccac280e1. Candidato SHA256 b0ae92e3cad6951b69ce06945266e1a0ef45a633308665c9058b37938a1f46ca. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-09 — Isolare N nel modello dichiarato

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. 𝒜_m e T sono noti. Quale formula ricava N?

Procedimento d’autore: Moltiplico per T e divido per η>0. Il prodotto attività·tempo è puro e restituisce un conteggio. Nella legge fisica esatta il medesimo passaggio userebbe ln 2 al posto del coefficiente numerico η.

Formule: N=\frac{\mathcal A_mT}{\eta};  N_{\rm legge\ esatta}=\frac{\mathcal AT}{\ln2}.

Distrattori e controprove: Moltiplicare per η applica di nuovo la riduzione invece dell’inversa. Il reciproco non ricostruisce N; dividere ancora per T ha dimensione s⁻² e introdurre T² conserva una durata non richiesta.

Hint: Distingui la legge fisica esatta dalla sua valutazione numerica prescritta.

Fonte SHA256 7277e75dfca571e50a93473187e9f2aaaae38f6cc077e36835bc08a22525cc47. Candidato SHA256 c5b9fd7335301ca89616fb607474b8379ba3fc8b43c1114dcd3765f5bd97812c. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-10 — Scalare numero ed emivita

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. Fra prove N_B=κ₁N_A e T_B=κ₂T_A. I fattori sono positivi e N_A,N_B interi. Quanto vale 𝒜_m,B/𝒜_m,A?

Procedimento d’autore: Il fattore η è comune e si cancella. Resta il numero iniziale scalato da κ₁ e il denominatore scalato da κ₂: rapporto κ₁/κ₂. Serve anche che κ₁N_A sia un intero, non solo un numero positivo.

Formule: \mathcal A_{m,B}/\mathcal A_{m,A}=\frac{\kappa_1}{\kappa_2}.

Distrattori e controprove: Il prodotto rende diretta la dipendenza dall’emivita. Il reciproco scambia i due stati, κ₁² aggiunge un quadrato assente e la somma dà due per prove identiche.

Hint: Semplifica il coefficiente comune e controlla il dominio dei conteggi.

Fonte SHA256 752e5995cff672597faf558a559fe6f1bbcc199d1b717b18d3ef7ee9392c754f. Candidato SHA256 86eb257f5a7158852395766ccec74a0318536e9c07531b7dfae8b30ba3a79059. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-11 — Da venti genitori a uno

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. A: N=20,T=2 s. B: N=1,T=1 s. Quanto vale 𝒜_m,B/𝒜_m,A?

Procedimento d’autore: A dà 7 Bq. B dà 7/10 Bq: un tasso medio non deve essere intero anche se N=1 lo è. Il rapporto è (7/10)/7=1/10. Il singolo decadimento resta un evento casuale.

Formule: \mathcal A_{m,B}=\frac7{10}\,\mathrm{Bq};  \mathcal A_{m,B}/\mathcal A_{m,A}=\frac1{10}.

Distrattori e controprove: Dieci inverte il rapporto, 1/20 considera soltanto N e 1/2 soltanto il fattore di durata col verso sbagliato. Uno confonde un evento con un tasso fissato a uno.

Hint: Un tasso di un evento ogni più secondi può essere minore di un becquerel.

Fonte SHA256 d59972d3c3b672af26809ac9f52be6614fa9f32efcdbed1519796fe33bc1639d. Candidato SHA256 d49989e4e258f0c65b55c5aae1e12738125d66bedafb5893a0871d74f0ce259a. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-12 — Media di tassi, non di numeri di genitori

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. A: N=20,T=2 s. B: N=1,T=1 s. Qual è la media aritmetica delle due 𝒜_m con pesi uguali?

Procedimento d’autore: Le attività numeriche sono 7 e 7/10 Bq. La loro media è 77/20 Bq. Gli ingressi medi avrebbero N=21/2, che non è un singolo conteggio fisico. Inserirli formalmente con T=3/2 s darebbe 49/10 Bq, comunque diverso dalla statistica richiesta.

Formule: \overline{\mathcal A_m}=\frac{7+7/10}{2}\,\mathrm{Bq};  \overline{\mathcal A_m}=\frac{77}{20}\,\mathrm{Bq}.

Distrattori e controprove: 77/10 Bq è la somma, 63/20 Bq la semidifferenza e 7/10 Bq copia B. Il valore 49/10 Bq appartiene soltanto all’estensione formale ai dati medi, con conteggio non intero.

Hint: Calcola due attività prima di usare i pesi statistici.

Fonte SHA256 4d4fdaaf5e6ab43ee857fb0ae475397563c353da2da4e778545b8e6fb2aa74b7. Candidato SHA256 750c23e2bdd36c6935ea214e034824e98ef46b35ae942aa1dee455a84bdaad4b. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-13 — L’emivita richiesta dal bersaglio

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. A ha N=20,T_A=2 s. B deve avere N=1 e 𝒜_m,B=𝒜_m,A/10. Quanto vale T_B/T_A?

Procedimento d’autore: Il bersaglio è 7/10 Bq. Per N=1 l’inversa T=ηN/𝒜_m dà T_B=1 s. Rispetto ai 2 s iniziali il rapporto è un mezzo. Non si trasferisce direttamente il rapporto delle attività a quello dei tempi.

Formule: T_B=\frac{7/10}{(7/10)\,\mathrm{s^{-1}}};  T_B=1\,\mathrm s;  T_B/T_A=\frac12.

Distrattori e controprove: Due inverte il rapporto; 1/10 copia il bersaglio del tasso e 1/20 il rapporto dei conteggi. Uno darebbe 7/20 Bq, non 7/10 Bq.

Hint: Ricava la nuova emivita dal nuovo conteggio e dal tasso bersaglio.

Fonte SHA256 ce188cf3890a103d47a5198333b450088e8c8acf6c546e4afec01bf2efaea58a. Candidato SHA256 ed18b9530d6610707b0f00c60ab33110711fe3307bbfa2a3ac3979ff54e70419. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-14 — Decodificare il display di attività

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. Un display continuo D=g 𝒜_m legge 21 per N=20,T=2 s. In B legge 21/10 e T=1 s. Quanto vale N_B in nuclei?

Procedimento d’autore: Il riferimento ha 𝒜_m=7 Bq e fissa g=3 Bq⁻¹. La lettura 21/10 indica 7/10 Bq. Con emivita 1 s, N=(7/10)·1/(7/10)=1, un conteggio intero.

Formule: g=3\,\mathrm{Bq^{-1}};  \mathcal A_{m,B}=\frac7{10}\,\mathrm{Bq};  N_B=1.

Distrattori e controprove: Tre nuclei ometterebbe il guadagno e predirebbe D=63/10. Due darebbe D=21/5; il numero 21/10 è una lettura continua, non già un numero di nuclei.

Hint: Rimuovi g prima dell’inversa che restituisce il conteggio.

Fonte SHA256 ea19a155b4017e7e136a1401d7f528259ed451e194262285f43f1fc53b9b4dd7. Candidato SHA256 2060a9e0f9f3d319eff34e1c9a6993e9264119cd58d5ca7c9d36dd26d4e3048e. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-15 — Due riferimenti per l’attività

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. D=g 𝒜_m+b. A: N=20,T=2 s,D=15. B: N=1,T=1 s,D=12/5. C: T=2 s,D=29. Quanto vale N_C in nuclei?

Procedimento d’autore: Le attività di riferimento sono 7 e 7/10 Bq. Dalle differenze si ottiene g=2 Bq⁻¹ e poi b=1. La lettura 29 dà 𝒜_m,C=14 Bq. Con T=2 s, N_C=14·2/(7/10)=40.

Formule: g=2\,\mathrm{Bq^{-1}};  b=1;  \mathcal A_{m,C}=14\,\mathrm{Bq};  N_C=40.

Distrattori e controprove: 580/7 ometterebbe sia offset sia guadagno; 80 ometterebbe il guadagno dopo aver tolto b e predirebbe D=57. Venti darebbe D=15. Non si accetta un conteggio non intero come singolo campione.

Hint: Sottrai prima l’offset, dividi per il guadagno e poi usa η.

Fonte SHA256 4021a0d908e401107468f79f3ebd45a3341275db304102660fdb3b9235873b41. Candidato SHA256 a6820df4b87c67d85a271f761ec6aa06a893bb069454d754d3b080e32c813c5c. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioactive-activity-16 — Una ridondanza su una scala discreta

Si considera un solo radionuclide, senza nuova produzione. N è il numero intero positivo di genitori presenti al momento considerato e T>0 la sua emivita. L’attività media istantanea esatta è 𝒜=(ln 2)N/T. Per tutti i calcoli numerici si prescrive η=7/10 al posto di ln 2 e si usa 𝒜_m=ηN/T: è un’approssimazione dell’attività fisica, con risultati esatti nel modello numerico assegnato. T si esprime in secondi e 𝒜_m in Bq. Ogni preparazione ha T costante; cambiare T fra prove significa preparare sistemi diversi. Fra preparazioni si impone N=(10 s⁻¹)T. Si misura inoltre 𝒜_m=7 Bq. Quante coppie (N,T) sono ammesse?

Procedimento d’autore: Il vincolo rende 𝒜_m=(7/10)·10 s⁻¹=7 Bq, indipendente dalla scala. Però N resta intero: per ogni N=1,2,3,… si può scegliere T=(N/10) s. Esempi (1,1/10 s) e (20,2 s). L’infinità è discreta e riguarda parametri del modello, non una lista di radionuclidi reali identificati.

Formule: T=\frac{N}{10}\,\mathrm s;  \mathcal A_m=7\,\mathrm{Bq};  N\in\{1,2,3,\ldots\}.

Distrattori e controprove: Una o due coppie sono confutate dalle scelte N=1,2,3. La risposta “Nessuna coppia” è smentita dagli esempi. Un continuo reale includerebbe numeri frazionari di genitori, esclusi dal conteggio assegnato.

Hint: La misura ridondante non cancella il dominio intero di N.

Fonte SHA256 9783e2c92352e11fcc9e9d60bbc8fed23f01b8d6bc14f189c3d97b7de28046d3. Candidato SHA256 4f4764d5521d3fba680e652369e769bd06a358a926881722137c78ca6f8a65af. Skill reale C5-L08. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 9eadf800b2225c5392da7e003d7e79ec003bdc2f761586ba44bc835437dd747d. Package file SHA256 8354f74998e7e6b672fff36900c3d0c5757d952fb4e69b5370b23df992e41203. Binding file SHA256 4f764cb9d53c6b3cae962567430be6825118cd69817d5521559c522bb623c9dd. Strutturale SHA256 d4083123bad7c7acd709a9a80f17b1abf32cbecd6fd607070481014ee801880a. Manifest asset-only SHA256 0aae3487d1b713163fb11ba744600960fa020716f8ceab7c5c6295bdd6e4e52b.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Nota geometrica d’autore: i venti punti iniziali rappresentano i venti nuclei presenti, senza attribuire loro un tempo di scadenza. Nel grafico sono segnati soltanto alcuni N interi positivi: x=150+8 N e y=1000−20𝒜_m[Bq], con T=2 s e coefficiente assegnato η=7/10. Quindi y=1000−7 N, e i punti N=20/40 danno 7/14 Bq. L’origine aperta è un riferimento escluso da N>0. Barre finali 280/28/154 per 7, 7/10 e 77/20 Bq, scala comune 40 coordinate/Bq. Letti XML e PNG nativo completo 640 × 1600, senza sovrapposizioni osservate. La scala geometrica non viene presentata allo studente come metrica responsive.
