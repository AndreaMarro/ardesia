# Authoring DRAFT — temperature-after-heating-169

Letti individualmente tutti gli 80 prompt assegnati A168–172 dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, source U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Riletti i testi reali delle lezioni C3-L01/L03/L04/L06. I casi speciali03 di170/171/172 sono preservati; i rapporti di letture Celsius saranno dichiarati come numerici e non assoluti.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN e publicationAction NONE. Queste sono note dell’autore, non un oracolo distinto né una firma scientifica.

Due assembly in processi separati danno package e binding byte identici. Importatore canonico ROOT in SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e loro versioni storiche invariati, stesso SHA. Asset SVG riletto come XML e nel rendering nativo completo. Nessun runtime, CSS, candidato ROOT, registro o checkpoint modificato.

Stato UI: Per mandato dell’integratore non sono state avviate nuove anteprime del prodotto sul runtime b963 in attesa della correzione comune dei consumer. UI finale NOT_RUN per questo lotto; il gate rimane aperto. Nessun marker è stato creato o copiato da un’altra edizione.

θ_f è esplicitamente il valore numerico della lettura Celsius; gli aumenti usano kelvin e il bilancio Q=CΔT. I rapporti6/5 e8/5 non sono rapporti termodinamici. Il caso 12 confronta65/2 con125/4 alla potenza e durata medie. Il vincolo 16 P=(1/2W/s)t vale fra preparazioni con potenza costante entro ciascuna. Non si usa una rampa istantanea. Le temperature richieste sono superiori a20°C e l’assenza di fase è dichiarata.

## AR-u5-temperature-after-heating-01 — L’energia aumenta una lettura già diversa da zero

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. P=5 W e t=10 s. Qual è la lettura finale in°C?

Procedimento d’autore: Il campione riceve cinquanta joule. Dividendo per la capacità complessiva di dieci joule per kelvin troviamo un aumento di cinque kelvin, cioè cinque gradi sulla scala Celsius. Alla lettura iniziale venti si aggiunge cinque: il termometro indica 25 °C.

Passaggi: Q=Pt;  Q=50\,\mathrm J;  \Delta T=\frac QC;  \Delta T=5\,\mathrm K;  \theta_f=25.

Distrattori: Cinque è l’aumento, non la lettura finale. Cinquanta copia l’energia e venti ignora il riscaldamento.Settanta somma il numero 50 dell’energia alla lettura 20 senza dividere per la capacità: joule e gradi Celsius non si possono sommare.

Fonte canonica SHA256 d4df60289dac077e40c564aaf5a61bcd2a1cf2b1544f91d6806aca05cb153a33. Candidato SHA256 2b7b3f1bdf761dccbd5f377a15f44ed6a2d4c8f4e7fe6b78c0a6587b78bb1793. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-02 — Lettura di temperatura e unità

Quale unità esprime una temperatura misurata con un termometro Celsius?

Procedimento d’autore: Il grado Celsius è un’unità di temperatura. Una differenza di un grado Celsius ha la stessa ampiezza di un kelvin, mentre i valori numerici delle due scale hanno zeri differenti. La domanda riguarda la lettura, non l’energia necessaria a modificarla.

Passaggi: T[\mathrm K]=\theta[{}^\circ\mathrm C]+273{,}15.

Distrattori: J è energia, W potenza, J/K capacità termica e K⁻¹ temperatura inversa. Il kelvin sarebbe dimensionalmente adatto a una temperatura, ma non è una delle cinque alternative qui proposte e non conserva lo stesso valore numerico Celsius.

Fonte canonica SHA256 1ae95485e950e9855f5be6c9368f6cb6104544b909c07ad64fb4a9a5537c39ea. Candidato SHA256 4c1b8319525ed1f2d8b4a7437322297d1af69221a979eed9e442e5c4060ffa49. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-03 — Due passaggi dal bilancio alla lettura

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Quale coppia di relazioni è corretta?

Procedimento d’autore: Prima si usa Q=Pt e Q=CΔT per ricavare l’aumento. Poi si aggiunge alla lettura iniziale il numero di kelvin dell’aumento. Perciò ΔT=Pt/C e θ_f=20+ΔT/(1 K). Scrivere soltanto Pt/C non restituisce una lettura che parte da 20 °C.

Passaggi: C\Delta T=Pt;  \Delta T=\frac{Pt}{C};  \theta_f=20+\frac{\Delta T}{1\,\mathrm K}.

Distrattori: Moltiplicare per C invece di dividere non dà una temperatura. P/(Ct) ha unità K/s². Omettere 20 scambia aumento e lettura, mentre il segno meno descriverebbe raffreddamento anziché l’ingresso termico positivo qui imposto.

Fonte canonica SHA256 bee460003db83a72ee6ebac7c9dbd28a8701af213b8ba93fc3b4562a143fda4d. Candidato SHA256 9702755ba8e589929d8b19a95cab887048c3b84627fd80fdd731a53eaa36b28c. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-04 — Raddoppia l’aumento, non la lettura iniziale

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. A ha P=5 W e t=10 s. B ha P=10 W e lo stesso t=10 s. Come cambia la lettura finale?

Procedimento d’autore: Gli aumenti sono cinque e dieci kelvin. Sommando separatamente i venti gradi iniziali si ottengono 25 e 30 °C. L’energia e l’aumento raddoppiano, ma il valore iniziale della scala non viene raddoppiato.

Passaggi: \Delta T_A=5\,\mathrm K;  \Delta T_B=10\,\mathrm K;  \theta_{f,A}=25;  \theta_{f,B}=30.

Distrattori: Cinquanta raddoppia direttamente la letturaA. Dieci è il solo aumentoB, venticinque ignora la potenza nuova e quindici sottrae energia al posto di aggiungerla.

Fonte canonica SHA256 2fbc017acd42481035c770d4fc4017e05b515862fc0b083d0f4102c1ed883889. Candidato SHA256 3baac462b896eb67feabaa1f5947b4b55deb69ca44c5ba3e02ee395d49f15d06. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-05 — La potenza necessaria per raggiungere 25 °C

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. La lettura finale è 25 °C dopo t=10 s. Quanto vale P in W?

Procedimento d’autore: L’aumento rispetto ai 20 °C iniziali è cinque kelvin. Servono dieci per cinque, cinquanta joule. Dividendo per dieci secondi si ottengono cinque watt netti, positivi come richiesto.

Passaggi: \Delta T=5\,\mathrm K;  Q=C\Delta T;  Q=50\,\mathrm J;  P=Q/t;  P=5\,\mathrm W.

Distrattori: Venticinque watt usa 25 al posto dell’aumento 5. Cinquanta watt copia il numero di joule senza dividere per il tempo; un mezzo watt divide una seconda volta per la capacità dopo averla già usata.

Fonte canonica SHA256 24308aa62e6d1e5c98e7cd32bbccd2f75d4f23ab9cf7eb4e79775f737532405a. Candidato SHA256 3fa20186250a4904d4a25374fff53fc9fabc638c0510912e747baa648e75780b. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-06 — La durata da un aumento assegnato

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. P=5 W e lettura finale 25 °C. Quanto vale t in s?

Procedimento d’autore: L’aumento è cinque kelvin e richiede 50 J. Il riscaldatore cede cinque joule ogni secondo, quindi occorrono 50/5=10 s. La durata positiva è univoca perché P è costante e non nullo.

Passaggi: \Delta T=5\,\mathrm K;  t=\frac{C\Delta T}{P};  t=10\,\mathrm s.

Distrattori: Cinquanta secondi prende la lettura 25 °C come aumento 25 K. Due secondi divide la capacità per la potenza senza includere l’aumento; meno dieci viola il tempo positivo e corrisponderebbe al verso opposto del trasferimento.

Fonte canonica SHA256 9e132825bedbf44622a45b75f87100cbb0f3b82cf056da5f7dc4356f3273a401. Candidato SHA256 92748c98279fd50063cbd3dcfe1568ef4f2e3fed907125e5f241924718ff086f. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-07 — Un rapporto dichiaratamente di letture Celsius

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. A ha P=5 W,t=10 s. B mantiene P=5 W e dura 20 s. Quanto vale θ_f,B/θ_f,A sulla scala Celsius?

Procedimento d’autore: A termina a 25 °C e B a 30 °C, perché gli aumenti sono 5 e 10 K. Il rapporto delle letture 30/25 è sei quinti. Il rapporto termodinamico sarebbe invece 303,15/298,15 fra temperature in kelvin: è un’altra quantità e non è quello richiesto.

Passaggi: \theta_{f,A}=25;  \theta_{f,B}=30;  \theta_{f,B}/\theta_{f,A}=\frac65.

Distrattori: Due è il rapporto degli aumenti o delle durate, non delle letture finali. Cinque sesti inverte il quoziente; un mezzo nega l’aumento e uno lo ignora. Il rapporto richiesto non è invariante per cambio dello zero della scala.

Fonte canonica SHA256 74ab6465e9d069816346911b13d564a1f6a91cc00960e2a6885c461f94fc254f. Candidato SHA256 38e0e1e1d086926c6c7a6471bde9d23804dc4b48ae218284c3d36ef89ae55ca0. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-08 — Lo scarto non è un rapporto di temperature

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Con P=5 W e t=10 s si propone una lettura finale 50 °C. Quanto vale proposta meno lettura corretta?

Procedimento d’autore: La lettura corretta è 25 °C. Cinquanta meno venticinque sono 25 gradi di differenza, cioè 25 K. Per una sottrazione Celsius e kelvin danno lo stesso intervallo: qui non si sta facendo un rapporto di temperature assolute.

Passaggi: \theta_f=25;  e=(50-25)\,\mathrm K;  e=25\,\mathrm K.

Distrattori: Meno venticinque inverte l’ordine dello scarto, cinquanta copia la proposta e zero la accetta. Due è il rapporto di letture 50/25, una quantità pura diversa dalla differenza.

Fonte canonica SHA256 aa4bd9f87be3bb8512e327d636035a5370bdd5c3b32a770a249c689fcac0aa28. Candidato SHA256 52f5860cd189e2ba81ee2bcfa286a34d144b2275ffd1ec029f043402cb0f52ab. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-09 — L’inversa della potenza usa una differenza

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Sono noti t e θ_f>20. Poniamo ΔT=(θ_f−20) K. Quale relazione isola P?

Procedimento d’autore: Il bilancio è Pt=CΔT. Dividendo per il tempo positivo si ottiene P=CΔT/t. Con ΔT=(θ_f−20) K compare la differenza dalla temperatura iniziale. Il prodotto capacità per intervallo è energia e la successiva divisione per il tempo dà watt.

Passaggi: Pt=C\Delta T;  P=\frac{C\Delta T}{t};  \Delta T=(\theta_f-20)\,\mathrm K.

Distrattori: Moltiplicare per t dà J·s, non watt. t/(CΔT) è il reciproco della potenza. θ_f è una lettura numerica e non l’intervallo richiesto; la quarta alternativa omette lo zero iniziale. C/(ΔTt) ha unità J/(K²s).

Fonte canonica SHA256 077e88a20de4df7ca9b94452c4df837ff949bd8825591d0a3e699e4cd3850c91. Candidato SHA256 003d224345e867b2b19f7cbe87b4b63017bca41844ef289ba62581b7c304d0d6. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-10 — Due fattori moltiplicano soltanto l’aumento

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. In A sia d=ΔT_A/(1 K)>0. B usa P_B=κ₁P_A,t_B=κ₂t_A con κ₁,κ₂>0. Quanto vale il rapporto delle letture θ_f,B/θ_f,A?

Procedimento d’autore: L’energia Pt e quindi l’aumento si moltiplicano per κ₁κ₂. La lettura iniziale 20 resta uguale: A dà 20+d e B 20+κ₁κ₂d. Il loro quoziente conserva entrambi i termini 20; non coincide in generale col rapporto degli aumenti.

Passaggi: d_B=\kappa_1\kappa_2d;  \theta_{f,A}=20+d;  \theta_{f,B}=20+\kappa_1\kappa_2d;  \frac{\theta_{f,B}}{\theta_{f,A}}=\frac{20+\kappa_1\kappa_2d}{20+d}.

Distrattori: κ₁κ₂ omette la lettura iniziale. Il rapporto inverso scambiaA eB; κ₁/κ₂ rende inversa la dipendenza dalla durata. La somma dei fattori non corrisponde all’energiaPt e, per due fattori unitari, non restituisce in generale il rapporto 1.

Fonte canonica SHA256 0ce8590ea45ed735a877a57b195d76c6c61b55340b9bfa71fb19fe93b4ed0da4. Candidato SHA256 46b8d4f1b87ca459535b87806da6e5ccd6be93eda6c82b472c5f33451a8bc709. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-11 — Quattro volte l’energia a partire dallo stesso 20

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. A ha P=5 W,t=10 s. B ha P=10 W,t=20 s. Quanto vale il rapporto delle letture finaliB/A?

Procedimento d’autore: A riceve 50 J e aumenta di 5 K, finendo a 25 °C. B riceve 200 J e aumenta di 20 K, finendo a 40 °C. Quaranta su venticinque si riduce a otto quinti. Quattro è invece il rapporto delle energie e degli aumenti.

Passaggi: \theta_{f,A}=25;  \theta_{f,B}=40;  \theta_{f,B}/\theta_{f,A}=\frac85.

Distrattori: Quattro dimentica i 20 iniziali. Cinque ottavi è il reciproco; due segue soltanto una delle due variazioni dei dati. Uno ignorerebbe entrambi i cambiamenti.

Fonte canonica SHA256 cabf5a0803a9180f2aa606fc8255e1d1ca11d5f107564359d56491dd63fb9a0f. Candidato SHA256 8c0e3ea2e98d2615aec5edd2176f31469df7bbb96535db2738ae0878a4a2d55e. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-12 — Media statistica di due letture

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. A ha P=5 W,t=10 s. B ha P=10 W,t=20 s. Qual è la media aritmetica delle letture finali in°C?

Procedimento d’autore: Le letture sono 25 e 40 °C: la metà di 65 è 65/2 °C. Se invece si usa la potenza media 15/2 W per il tempo medio 15 s, si ottiene ΔT=45/4 K e lettura 125/4 °C, diversa. La media delle uscite non è il prodotto delle medie degli ingressi.

Passaggi: \overline\theta_f=\frac{25+40}{2};  \overline\theta_f=\frac{65}{2};  \theta_f(\overline P,\overline t)=\frac{125}{4}.

Distrattori: 125/4 °C è la prova agli ingressi medi. Sessantacinque è la somma,15/2 copia la potenza media come temperatura e 30 proviene dal caso con durataB ancora 10 s. La media delle temperature si può convertire in kelvin aggiungendo 273,15 dopo la media.

Fonte canonica SHA256 24ed69580a705c5e8a9d06e9e8ff56289f5322ee4aa5b0231c13844ee6a048c4. Candidato SHA256 65c03a486a5a52c1269e6c46b013b533c4229d063540bf799f75aca3df4a96c0. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-13 — La durata richiesta dal bersaglio di lettura

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. A ha P=5 W,t_A=10 s. B usa P_B=10 W e deve avere θ_f,B=(8/5)θ_f,A. Quanto vale t_B/t_A?

Procedimento d’autore: A indica 25 °C, quindi B deve indicare 40 °C. L’aumentoB è 20 K e richiede 200 J. A 10 W occorrono 20 s; dividendo per i 10 s diA si ottiene 2. Il vincolo usa esplicitamente letture Celsius, non una moltiplicazione universale delle temperature assolute.

Passaggi: \theta_{f,B}=40;  \Delta T_B=20\,\mathrm K;  t_B=20\,\mathrm s;  t_B/t_A=2.

Distrattori: Un mezzo capovolge il rapporto. Otto quinti copia il bersaglio sulla lettura e quattro quello sull’aumento o energia. Venti è il numero di secondi della provaB e non un rapporto puro.

Fonte canonica SHA256 fc455c0656d7a4580fc1f4122f9aa094ef4336e35004a2d2dd1ca2767b30af24. Candidato SHA256 8f56cdbac9df5d9741ed1fc13c295a3a7a317af2946d690954125f3fa4edead6. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-14 — Tarare un display di letture Celsius

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Il display continuo adimensionale è S=q θ_f, con q>0 costante. A: P=5 W,t=10 s,S=75. B: t=20 s,S=120. Quanto vale P_B in W?

Procedimento d’autore: La letturaA è 25 °C, quindi q=75/25=3 per unità numerica Celsius. La letturaB è 120/3=40 °C. Il suo aumento 20 K richiede 200 J; dividendo per 20 s troviamo 10 W. La calibrazione si riferisce alla scala scelta, non alla temperatura assoluta.

Passaggi: q=3;  \theta_{f,B}=40;  Q_B=200\,\mathrm J;  P_B=10\,\mathrm W.

Distrattori: Venti watt confonde la lettura 40 con l’aumento 20 K. Sei watt deriverebbero dall’uso diretto di 120 come energia in joule. Cinque watt darebbero 30 °C e S=90, non 120.

Fonte canonica SHA256 2d771201087233944c11d763704f6622dcf9b82a1520331f2dcaf2768c1f6032. Candidato SHA256 efea1273237166779be742498d95fdb3052a3bd78f62034f05ced0e0a7df9361. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-15 — Due riferimenti separano guadagno e offset

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Il display è S=q θ_f+b, adimensionale e continuo, q>0. A: P=5 W,t=10 s,S=51. B: P=10 W,t=20 s,S=81. C: t=10 s,S=61. Quanto vale P_C?

Procedimento d’autore: A eB terminano a 25 e 40 °C. La differenza 30 delle letture divisa per 15 dàq=2 e poi b=1. PerC, (61−1)/2=30 °C: l’aumento è 10 K, l’energia 100 J e la potenza 100/10=10 W.

Passaggi: q=2;  b=1;  \theta_{f,C}=30;  \Delta T_C=10\,\mathrm K;  P_C=10\,\mathrm W.

Distrattori: 21/2 W omette l’offset: usaθ=61/2 e ΔT=21/2 K. Trenta watt usa la lettura 30 come aumento 30 K. Cinque watt tornerebbe al riferimentoA; venti watt darebbe 40 °C e S=81.

Fonte canonica SHA256 c82062fe79f1a00549af613e349a4b25e4d6f20beef11f0d7c239ec1514e37db. Candidato SHA256 2dec57fc91b7394cc2032793ffb41d384ab73dd8eaf660e48eed1c8bfeb84c1f. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-temperature-after-heating-16 — Un vincolo fra preparazioni, non una rampa di potenza

Un campione chiuso di capacità termica complessiva C=10 J/K parte da 20 °C. Riceve potenza termica netta costante P>0 per un tempo t>0, senza cambiamenti di fase né lavoro meccanico apprezzabile. C resta costante nell’intervallo considerato. Indichiamo con ΔT l’aumento di temperatura e con θ_f il valore numerico della lettura finale in gradi Celsius. Un aumento di 1 K aumenta la lettura Celsius di 1. Gli eventuali rapporti fra θ_f sono rapporti di letture sulla scala Celsius, dipendenti dallo zero scelto; non sono rapporti di temperature assolute. Fra prove si impone P=(1/2 W/s)t. Si misura una lettura finale 25 °C. Quanto vale t>0?

Procedimento d’autore: Il riscaldamento deve fornireC·5 K=50 J. Sostituendo P=αt con α=1/2 W/s nell’energia totalePt si ha αt²=50 J, quindi t²=100 s². Nel dominio t>0 resta 10 s e P=5 W. Il vincolo seleziona una potenza costante per ciascuna prova: non si integra una potenza istantaneaP(tempo) crescente.

Passaggi: \alpha=\frac12\,\mathrm{W/s};  \alpha t^2=50\,\mathrm J;  t^2=100\,\mathrm{s^2};  t=10\,\mathrm s.

Distrattori: Meno dieci è la radice scartata dal dominio. Cento copia t² senza radice e cinquanta copia l’energia. Cinque s con il vincolo darebbero 12,5 J e una lettura 21,25 °C, non 25.

Fonte canonica SHA256 24d76c0d08eae3d3e75529f02c06eb71a71473820a88e2cedbe70dd7342002ba. Candidato SHA256 6f187b4bc0d430145febcd6d85ff8f79254bd5b7543349315efba042ea073eeb. Revisione indipendente NOT_RUN; human NOT_RUN.

## Correzione della figura dopo review responsive

Le scritte visibili dichiarano soltanto grandezze, unità fisiche e valori: nessuna lunghezza in pixel. Il confronto XML prima/dopo conferma gli stessi elementi, ordine e tutti gli attributi geometrici e stilistici; cambiano i soli testi delle legende e le didascalie collegate. Tutte le chiavi e formule sono identiche. Le versioni precedenti sono conservate con manifest in author-evidence/thermal-168-172-before-responsive-figure-fix. Le cinque nuove figure sono state lette integralmente in XML e nei rendering nativi completi allegati. Questo è controllo tecnico dell’autore, non revisione scientifica indipendente. UI del prodotto sui byte correnti NOT_RUN, nessun marker corrente.

Coordinate intrinseche SVG: nel pannello2 le letture sono10 unità per grado Celsius, con base20 lunga200 unità e aumenti5/10 lunghi50/100; nel pannello3 sono8 unità per grado. Non sono pixel effettivi dopo il ridimensionamento responsive.

## Etichette dello zero, dopo review distinta

Il revisore B ha segnalato zeri attraversati dagli assi nei lotti 169–172; lo stesso difetto era presente in 168. Sono state spostate soltanto le etichette 0 indicate nel manifest di questa correzione,20 coordinate intrinseche SVG verso sinistra. Assi, barre, percorsi, tutti gli altri testi, risposte e formule sono identici. I cinque SVG finali sono stati nuovamente letti nel rendering completo; gli zeri sono separati dagli assi. I file precedenti e le loro impronte sono conservati nella cartella before-zero-label-fix. Il precedente confronto geometrico della rimozione dei riferimenti ai pixel resta storico e non viene riscritto: questa correzione dichiara esplicitamente il movimento dei soli testi 0. Due assembly e import canonico ripetuti; UI del prodotto NOT_RUN, nessun marker corrente.
