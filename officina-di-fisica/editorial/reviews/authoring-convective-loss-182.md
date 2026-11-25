# Authoring DRAFT — convective-loss-182

Letti individualmente tutti gli 80 prompt A178–182 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-04 SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. La fonte conserva i compiti e gli ID; la nuova edizione rende esplicite ipotesi, unità, segni, domini e procedimenti. Riletti i testi reali C3-L01/L05/L06 per scale, trasferimento e bilancio stazionario. La primaria degli 80 futuri ID B è stata salvata separatamente prima di candidati o chiavi B; non è un’approvazione di questi lotti A.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-convective-loss-01 — Il salto è rispetto all’aria

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Con h=5 W/(m²·K) e T_s=30 °C, quanto vale P in W?

Procedimento d’autore: La superficie è dieci kelvin più calda dell’aria. Il prodotto hA vale 5 W/K, perciò la potenza ceduta è 5·10=50 W. La lettura 30 °C non è il salto da usare: lo scambio si annullerebbe al limite T_s=T_a, non al punto arbitrario 0 °C.

Passaggi: \Delta T=(30-20)\,\mathrm K;  \Delta T=10\,\mathrm K;  hA=5\,\mathrm{W/K};  P=hA\Delta T;  P=50\,\mathrm W.

Distrattori: 150 W userebbe 30 K al posto del salto di 10 K. Cinque copia il numero di h; dieci copia l’intervallo. Nessuna conversione aggiunge 273,15 a una differenza termica.

Hint: Sottrai prima la temperatura dell’aria, poi moltiplica per hA.

Fonte canonica SHA256 4b99056f9fb25ebab5a40ba2a01a7c8cbfc37c5b3bcef9f3d6c407d711da78a2. Candidato SHA256 5a25e421352e380f4f9f08ca22fd56a3b5e86b261c02c0ab7292294702c75a29. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-02 — La dimensione del trasferimento convettivo

Si chiede la potenza ceduta per convezione da una superficie. Quale unità è adatta?

Procedimento d’autore: Il coefficiente h va moltiplicato per l’area e per un intervallo termico. Metri quadrati e kelvin si cancellano, lasciando watt: joule trasferiti ogni secondo. h da solo non è una potenza.

Passaggi: [P]=\frac{\mathrm W}{\mathrm{m^2K}}\,\mathrm{m^2}\,\mathrm K;  [P]=\mathrm W.

Distrattori: J è energia; W/(m²·K) esprime h, m² area e K intervallo termico. Senza una durata assegnata non si può ricavare un’energia totale dalla sola potenza.

Hint: Controlla l’unità del prodotto completo hAΔT.

Fonte canonica SHA256 a694174d666946926236cdd0430a3bcd78ed0a4010e52b6f0b273baa9074a971. Candidato SHA256 198d89c5d6cb7aedfedcd8f1d7b5a5a00903391f3b00376c01bc910319a9fef7. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-03 — Una legge che usa una differenza

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Quale relazione restituisce P?

Procedimento d’autore: La legge assegnata lega il modulo uscente alla differenza superficie-aria: P=hAΔT. Un aumento di 1 K del salto ha lo stesso significato di 1 °C di differenza. Usare il punto termometrico T_s anziché la differenza renderebbe la legge dipendente dallo zero della scala.

Passaggi: \Delta T=T_s-T_a;  P=hA\Delta T;  \Delta T>0.

Distrattori: Il solo T_s non si annulla quando superficie e aria hanno la stessa temperatura. Dividere per ΔT dà W/K²; ΔT/(hA) è il reciproco di una potenza. Dividere per A, invece di moltiplicare, non descrive il contributo di una superficie maggiore.

Hint: Il punto di riferimento fisico è l’aria, non lo zero Celsius.

Fonte canonica SHA256 37240c0d2cd23a52b48054ca9f0a7eb7af24af9e3aaa1c9215a771ca00ad651a. Candidato SHA256 36ed177562c98e9b7ec468567dede1e38e4815cf8fbbbe9aec43efeb45e831a7. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-04 — Cambiare le condizioni di scambio

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A ha h=5 W/(m²·K), B ha h=10 W/(m²·K); entrambe hanno T_s=30 °C. Come cambia P?

Procedimento d’autore: Il salto resta 10 K e l’area resta un metro quadrato. Un coefficiente doppio dà una potenza doppia: 50 W in A e 100 W in B. Si confrontano due condizioni mantenute, senza dedurre il moto temporale di una superficie che si raffredda.

Passaggi: \Delta T_A=\Delta T_B;  P_A=50\,\mathrm W;  P_B=100\,\mathrm W;  P_B/P_A=2.

Distrattori: 25 W rende inversa la dipendenza da h. 200 W introduce un quadrato. 300 W usa la lettura 30 come salto in B, dimenticando l’aria a 20 °C.

Hint: Mantieni il salto uguale e confronta il solo coefficiente.

Fonte canonica SHA256 58a49456e0e7f2aa61f976c5ceb09de977757421ea3a1071a7d181a2fe4c4731. Candidato SHA256 6d38e0d185f4e016ed58c9906d9d8d29a895ffed1c06ca130cbeb53e47eb9e68. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-05 — Ricavare il coefficiente h

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Si misura P=50 W con T_s=30 °C. Quanto vale h in W/(m²·K)?

Procedimento d’autore: Il salto è 10 K. Dal prodotto P=hAΔT isoliamo h dividendo per AΔT: 50 W/(1 m²·10 K)=5 W/(m²·K). Il divisore è positivo per il ramo caldo considerato.

Passaggi: \Delta T=10\,\mathrm K;  h=\frac{P}{A\Delta T};  h=5\,\mathrm{W/(m^2K)}.

Distrattori: 5/3 W/(m²·K) dividerebbe per la lettura 30 invece del salto 10. Cinquanta copia la potenza, mentre moltiplicare per ΔT non restituisce le unità del coefficiente.

Hint: Forma prima il prodotto area per salto termico al denominatore.

Fonte canonica SHA256 89f7b79806a4ba94af8cbe8650a6b578f50882915296d535666ed799f48fb759. Candidato SHA256 1b0ec4ccdccbed6212fc3a41be14e4d9f1d812165d06538a101878eeb9c91614. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-06 — Tornare dall’intervallo al punto termometrico

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. P=50 W e h=5 W/(m²·K). Quanto vale T_s in °C?

Procedimento d’autore: Dividendo per hA otteniamo il salto di 10 K. La superficie deve essere dieci gradi più calda dell’aria a 20 °C, dunque T_s=30 °C. Dieci è soltanto la differenza, non la lettura cercata.

Passaggi: \Delta T=\frac{P}{hA};  \Delta T=10\,\mathrm K;  \theta_s=20+\frac{\Delta T}{1\,\mathrm K};  \theta_s=30;  T_s=30\,{}^\circ\mathrm C.

Distrattori: 10 °C ometterebbe il riferimento dell’aria e farebbe la superficie più fredda, contraddicendo la cessione positiva. 20 °C annullerebbe il salto. 303,15 è il numero dello stesso punto in kelvin, non la lettura Celsius chiesta.

Hint: Dopo l’inversa della potenza bisogna aggiungere il riferimento termico.

Fonte canonica SHA256 a5bce7109c3410436d043249264dea256fc7196ef3c5c40c13ed1099a8caa696. Candidato SHA256 5c7849ce43c318eebe0eadc7ceb199e51f07f7396eee015301d32bdfb61f12eb. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-07 — Raddoppia il salto, non la lettura

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A ha h=5 W/(m²·K), T_s=30 °C. B mantiene h e ha T_s=40 °C. Quanto vale P_B/P_A?

Procedimento d’autore: I salti sono 30−20=10 K e 40−20=20 K. Le potenze sono 50 e 100 W, quindi il rapporto è due. Quattro terzi è il rapporto numerico delle letture Celsius 40/30, che è una grandezza diversa dal rapporto dei salti e delle potenze.

Passaggi: \Delta T_A=10\,\mathrm K;  \Delta T_B=20\,\mathrm K;  P_B/P_A=2.

Distrattori: 4/3 usa le letture anziché le differenze rispetto all’aria. Un mezzo capovolge B/A; quattro introduce un quadrato e uno trascura il nuovo salto.

Hint: Confronta T_s−T_a in entrambe le prove.

Fonte canonica SHA256 19100d13cb80b3a35b9e7397af7a8ee9de6dda7a7ae6f6b96756b6852ea175ab. Candidato SHA256 cae3e982641769c906bfc5a585502f53e10c6f34e670534d4af35345691e6ef8. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-08 — Lo scarto su una potenza proposta

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Con h=5 W/(m²·K), T_s=30 °C si propone P=100 W. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Il valore corretto è 50 W. La proposta lo supera di 100−50=50 W. È uno scarto positivo fra potenze, mentre il numero due esprime il loro rapporto puro.

Passaggi: P=50\,\mathrm W;  e=(100-50)\,\mathrm W;  e=50\,\mathrm W.

Distrattori: −50 W scambia l’ordine. 100 W copia la proposta e zero la accetta. Due non ha la dimensione della differenza di potenza richiesta.

Hint: Ricalcola il salto e la potenza prima della sottrazione.

Fonte canonica SHA256 14a5ab7d86e00ab650d4ff9b1e78aeeb1885318996444ba5621cc47da959c6a5. Candidato SHA256 dcde7e799a2afd0aec57387cc7dfb1a42d861a6313f6802e58dc1e47e1815471. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-09 — L’inversa usa area e intervallo

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Sono noti P e T_s, quindi ΔT. Quale formula ricava h?

Procedimento d’autore: Il bilancio P=hAΔT si divide per il prodotto positivo AΔT. Il risultato h=P/(AΔT) è in W/(m²·K). In questa prova ΔT=(θ_s−20) K; la lettura della superficie da sola non sostituisce la differenza rispetto all’aria.

Passaggi: P=hA\Delta T;  h=\frac P{A\Delta T};  \Delta T=(\theta_s-20)\,\mathrm K.

Distrattori: Moltiplicare per A o per ΔT cambia le unità e la dipendenza geometrica. AΔT/P è il reciproco di h. L’ultima relazione usa una temperatura puntuale al posto dell’intervallo e non ricostruisce il trasferimento assegnato.

Hint: Dividi per entrambi i fattori che moltiplicano h.

Fonte canonica SHA256 76853401aff56342da986118eabaeb5ba6d41e4acf8582c6105d7ec22b79c52c. Candidato SHA256 e287bbe1c1ae4170ac0bbd69d54d10fd5736cf3097759d6db5463b2418be16e5. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-10 — Scalare letture Celsius non scala il salto

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A ha lettura numerica θ_s>20. B usa h_B=κ₁h_A e θ_s,B=κ₂θ_s, con κ₁,κ₂>0 e κ₂θ_s>20. Quanto vale P_B/P_A?

Procedimento d’autore: Il salto A è (θ_s−20) K. In B si scala il numero della lettura, non il suo aumento sull’aria: il salto è (κ₂θ_s−20) K. Il rapporto contiene quindi κ₁(κ₂θ_s−20)/(θ_s−20). Le condizioni del prompt mantengono entrambi i salti positivi e i denominatori non nulli.

Passaggi: \Delta T_A=(\theta_s-20)\,\mathrm K;  \Delta T_B=(\kappa_2\theta_s-20)\,\mathrm K;  \frac{P_B}{P_A}=\kappa_1\frac{\kappa_2\theta_s-20}{\theta_s-20}.

Distrattori: κ₁κ₂ sarebbe corretto se κ₂ scalasse ΔT, ma qui scala la lettura Celsius. Il rapporto degli intervalli invertito cambia la dipendenza termica; κ₁/κ₂ perde il riferimento dell’aria. La somma non nasce dal prodotto della legge assegnata.

Hint: Sostituisci la lettura B prima di sottrarre i venti gradi dell’aria.

Fonte canonica SHA256 f80e9a911cbfb6ca8680c2d9acefbbf3469d096801aeb01d2a3e8fe8a84c6596. Candidato SHA256 53c8f5f75cba38f8eea1050f6d46bcb7f07751ac18e8824e2dcef38a2e7f5aed. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-11 — Due cambiamenti sulla stessa superficie

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A ha h=5 W/(m²·K), T_s=30 °C; B ha h=10 W/(m²·K), T_s=40 °C. Quanto vale P_B/P_A?

Procedimento d’autore: A ha salto 10 K e conduce verso l’aria 50 W per convezione. B ha salto 20 K e coefficiente doppio: 10·1·20=200 W. Il rapporto è 200/50=4, prodotto dei due fattori due, uno su h e uno sul salto.

Passaggi: P_A=50\,\mathrm W;  P_B=200\,\mathrm W;  P_B/P_A=4.

Distrattori: Due considera soltanto h oppure soltanto il salto. 4/3 segue le letture Celsius e 8/3 lo moltiplica per il fattore due di h, ma entrambi perdono la sottrazione dell’aria. Un quarto capovolge il confronto.

Hint: Ricostruisci le due differenze termiche prima delle potenze.

Fonte canonica SHA256 2670d15c02a18b5f2afed444f13c743b29dc69075ea63fcb4e82bea18afef044. Candidato SHA256 658989cee3123e523a24be8891351a12a1fda7c144fb0c49dbd24d8bdfa9b4c1. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-12 — Media di due condizioni mantenute

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A usa h=5 W/(m²·K), T_s=30 °C; B usa h=10 W/(m²·K), T_s=40 °C. Qual è la media aritmetica di P con uguale peso?

Procedimento d’autore: Le potenze sono 50 e 200 W, perciò la metà della somma 250 W è 125 W. Agli ingressi medi h=15/2 W/(m²·K) e T_s=35 °C il salto è 15 K: la potenza sarebbe 225/2 W. La media delle uscite è diversa dal prodotto dei dati medi.

Passaggi: \overline P=\frac{50+200}{2}\,\mathrm W;  \overline P=125\,\mathrm W;  P(\overline h,\overline T_s)=\frac{225}{2}\,\mathrm W.

Distrattori: 225/2 W usa gli ingressi medi. 250 W non dimezza la somma, 75 W è metà della differenza e 50 W ignora B. Non si stanno mescolando fisicamente due superfici per cercare una temperatura finale.

Hint: Media le due potenze dopo aver risolto ciascuna prova.

Fonte canonica SHA256 808decb3697c1546ba9495992169cd7b50dc5f205ed54f49b692b8ff6ad7c314. Candidato SHA256 ed6e703c7ada1c46e82ce92407a8069aa80d5d2fa5b6fd298ff441e66e0840fa. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-13 — Il bersaglio sulla potenza e il rapporto di letture

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. A ha h=5 W/(m²·K), T_s,A=30 °C. B ha h_B=10 W/(m²·K) e deve cedere quattro volte P_A. Quanto vale θ_s,B/θ_s,A sulla scala Celsius?

Procedimento d’autore: Il bersaglio è 200 W. Con h_BA=10 W/K serve ΔT_B=20 K, quindi T_s,B=40 °C. Il rapporto delle letture numeriche Celsius è 40/30=4/3. Due è invece il rapporto dei salti 20 K e 10 K: non coincide con la quantità chiesta.

Passaggi: P_B=200\,\mathrm W;  \Delta T_B=20\,\mathrm K;  \theta_{s,B}=40;  \theta_{s,B}/\theta_{s,A}=\frac43.

Distrattori: Due confonde il rapporto degli intervalli con quello delle letture. Tre quarti inverte B/A; quattro copia il bersaglio sulla potenza e uno non produrrebbe l’aumento richiesto. Il rapporto domandato non è una temperatura assoluta normalizzata.

Hint: Dopo l’inversa del salto, torna alla lettura Celsius e solo allora fai il rapporto.

Fonte canonica SHA256 773a216ac024ad0e2bf5429171f2bdd3d4295b5a4bbd3f01e8d7e3ca1146f4be. Candidato SHA256 fa03285e2a18e26d94c327e0a28d499c79d2cc670b22edbbb259a5049281a93a. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-14 — Tarare la potenza prima del coefficiente

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Il display continuo adimensionale segue S=qP, q>0. A con h=5 W/(m²·K), T_s=30 °C dà S=150. B dà S=600 e ha T_s=40 °C. Quanto vale h_B in W/(m²·K)?

Procedimento d’autore: A cede 50 W e quindi q=3 W⁻¹. La lettura B significa 600/3=200 W. La sua differenza rispetto all’aria è 20 K: h_B=200/(1·20)=10 W/(m²·K). Il guadagno dello strumento e il coefficiente fisico h sono fattori distinti.

Passaggi: q=3\,\mathrm{W^{-1}};  P_B=200\,\mathrm W;  \Delta T_B=20\,\mathrm K;  h_B=10\,\mathrm{W/(m^2K)}.

Distrattori: Usare 600 direttamente come watt darebbe h=30 W/(m²·K). Cinque conserverebbe il riferimento e predirebbe S=300, non 600. Venti copia il numero del salto in un’altra grandezza.

Hint: Converti prima il display in watt, poi dividili per area e salto.

Fonte canonica SHA256 05b5671a2e22f5a98fdbeb5bc39d8b20db306d17d16107808a5660f44c5a7adb. Candidato SHA256 6399cdd88b0fdf30bb0c6c93d58df3704bd5ad5513fed6f694b1f9156cfba247. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-15 — Offset strumentale e riferimento termico

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Il display è S=qP+b, continuo e adimensionale, q>0. A: h=5 W/(m²·K), T_s=30 °C,S=101. B: h=10 W/(m²·K), T_s=40 °C,S=401. C: T_s=30 °C,S=201. Quanto vale h_C?

Procedimento d’autore: I riferimenti cedono 50 e 200 W. Dalle differenze q=(401−101)/(200−50)=2 W⁻¹; dal primo b=1. C cede (201−1)/2=100 W. A 30 °C il salto è 10 K, quindi h_C=10 W/(m²·K). Si tolgono due riferimenti diversi: l’offset dal display e la temperatura dell’aria dalla lettura termica.

Passaggi: q=2\,\mathrm{W^{-1}};  b=1;  P_C=100\,\mathrm W;  \Delta T_C=10\,\mathrm K;  h_C=10\,\mathrm{W/(m^2K)}.

Distrattori: 201/20 W/(m²·K) omette b, usa P=201/2 W e predice S=202. Cinque torna ad A; venti a questo salto darebbe S=401. Cento copia il numero della potenza e darebbe S=2001.

Hint: Rimuovi l’offset, ricava P e usa la differenza superficie-aria.

Fonte canonica SHA256 aea894e539bce95aef730717dd6b0cbd7bf9be5651b29007a75f3240fc72d94a. Candidato SHA256 76034154ac34f667e9a40d74b2c1fc02969e9d056c083a3afa2698e35395b10e. Revisione indipendente e human NOT_RUN.

## AR-u5-convective-loss-16 — Un vincolo fra prove sulla lettura Celsius

Una superficie di area A=1 m² è mantenuta alla temperatura T_s>20 °C in aria a T_a=20 °C. Il coefficiente convettivo h>0, in W/(m²·K), è assegnato e costante entro ciascuna prova. Si considera soltanto la potenza convettiva ceduta P=hAΔT, con ΔT=T_s−T_a>0; non si cerca la somma con eventuali altri meccanismi. θ_s è il numero della lettura di T_s in °C, quindi ΔT=(θ_s−20) K. Le prove con h diverso rappresentano condizioni di scambio diverse, senza imporre una legge transitoria h(T_s). Eventuali rapporti fra θ_s sono rapporti di letture Celsius dichiarati, non rapporti di temperature assolute. Fra preparazioni si impone h=βθ_s, con β=1/6 W/(m²·K), poiché θ_s è un numero puro. Si misura P=50 W. Quanto vale T_s nel ramo θ_s>20?

Procedimento d’autore: Chiamiamo P₀=βA·1 K il fattore di potenza, pari a 1/6 W. Inserendo il vincolo nella legge, P=P₀θ_s(θ_s−20), quindi θ_s(θ_s−20)=300. Il polinomio θ_s²−20θ_s−300 si fattorizza come (θ_s−30)(θ_s+10): i due numeri hanno somma −20 e prodotto −300. Le radici alternative sono 30 e −10. Solo 30 rispetta θ_s>20 e dà h=5 W/(m²·K). Il vincolo confronta preparazioni diverse e non descrive un coefficiente che varia durante il raffreddamento.

Passaggi: P_0=\beta A\cdot1\,\mathrm K;  P_0=\frac16\,\mathrm W;  P=P_0\theta_s(\theta_s-20);  \theta_s(\theta_s-20)=300;  (\theta_s-30)(\theta_s+10)=0;  \theta_s=30;  T_s=30\,{}^\circ\mathrm C.

Distrattori: −10 °C è esclusa qui perché la superficie deve essere più calda di 20 °C e il vincolo darebbe h negativo, non perché tutte le letture Celsius negative siano impossibili. Dieci è anch’essa sotto l’aria; 50 e 300 non soddisfano la potenza assegnata nel vincolo.

Hint: Sostituisci il legame sul numero Celsius e controlla entrambe le condizioni fisiche delle radici.

Fonte canonica SHA256 0b5cd2fcf08fd5dda2a5a0fb7576a9a173156c03f6b9c9b0b0328979abf4230f. Candidato SHA256 eae7d0baad16da523cfd0cd7a2b1852f5b2d28168f1dcba5c0e1f416a002c1e3. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 9da88e7fec06528b65c4594d5226d072cf19e1680e479ae32a6f8f9776f9b295. Package file SHA256 bba3655e5e315dd9e1b4a8f23f4d7fad60b4ac348ea43751dd74a214171b5e69. Binding file SHA256 000c720cfd0fcc47392c5ade0c220f69959a4332a25432f7d156cd1629327e63. Prova strutturale SHA256 b9b6973c2f98f20b3d4a03d07eb5398a1c627e69646393aba74e17641c81dfbc. Asset-only manifest SHA256 5549496bedff15edfd5e86d5f1794ca00fe79920043dc81bab20de7aebad4bd2.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
