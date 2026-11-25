# Authoring DRAFT — symmetric-electric-potential-194

Letti individualmente tutti gli 80 prompt A190–194 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L01/L02/L03 per Coulomb, campo vettoriale e potenziale scalare. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B195–199 è congelata separatamente SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-symmetric-electric-potential-01 — Due contributi positivi allo stesso potenziale

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Con Q₁=1 nC e Q₂=2 nC, quanto vale V_P in volt?

Procedimento d’autore: Ogni nanocoulomb a tre metri produce 3 V. La prima sorgente dà 3 V, la seconda 6 V: il totale è 9 V. I segni delle cariche sono entrambi positivi e lo zero è comune all’infinito. Le direzioni delle congiungenti non cambiano questa somma scalare.

Passaggi: V_1=3\,\mathrm V;  V_2=6\,\mathrm V;  V_P=V_1+V_2;  V_P=9\,\mathrm V.

Distrattori: Tre V è la differenza dei moduli e non la somma dei potenziali. Diciotto V aggiunge un fattore due non presente. Zero potrebbe descrivere il campo per cariche uguali in un punto simmetrico, ma non la somma positiva di questi potenziali.

Hint: Usa lo stesso zero per i due contributi e conserva la natura scalare di V.

Fonte canonica SHA256 4b91a5b9ff90ed03fa72bf6d4dc6e564f5795a174f29091546a200a08505e450. Candidato SHA256 7cec6f8200f075b21be76f89b8e97ccbb2678e0e7e3663f31c77d98e9bd16368. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-02 — La somma di potenziali resta in volt

Due sorgenti danno potenziali V₁ e V₂ riferiti allo stesso zero. Quale unità esprime V_P=V₁+V₂?

Procedimento d’autore: I due termini sono energie potenziali per unità di carica di prova, quindi volt. Una somma di due grandezze con la stessa unità conserva quella unità. Il risultato non è un’energia finché non viene moltiplicato per una carica di prova.

Passaggi: V_P=V_1+V_2;  [V_P]=\mathrm{J/C};  [V_P]=\mathrm V.

Distrattori: J misura energia, N/C campo, C carica e N forza. Sommando volt non si ottengono né newton né joule; nessun segno geometrico trasforma una grandezza nell’altra.

Hint: Controlla le unità dei due termini prima di sommarli.

Fonte canonica SHA256 ab95a4104bdb200ea3a3c36b91a556abdc8a649f4080ab3785b00c4db0be7293. Candidato SHA256 af17e3ce557467bb4ea93e8c5a6c8f489f187b5a4b0e329778cc8a9711262899. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-03 — Campo nullo non impone potenziale nullo

Due cariche puntiformi uguali e positive sono ferme in posizioni opposte e simmetriche rispetto al loro punto medio P, alla stessa distanza d>0. Il potenziale è nullo all’infinito. Quale affermazione è corretta?

Procedimento d’autore: In P i due campi hanno moduli uguali e direzioni opposte, quindi si cancellano vettorialmente. I potenziali, invece, sono entrambi k_eQ/d>0 e si sommano in 2k_eQ/d. Il riferimento all’infinito rende questo valore positivo, anche dove il campo locale è zero. Un potenziale scalare non ha un verso da confrontare con una forza.

Passaggi: \vec E_1+\vec E_2=\vec0;  V_1=\frac{k_eQ}{d}>0;  V_P=\frac{2k_eQ}{d}>0.

Distrattori: La cancellazione vettoriale del campo non si trasferisce al potenziale. La posizione su lati opposti inverte il versore del campo, non il segno di una carica positiva in k_eQ/d. V_P=0 richiederebbe un diverso riferimento o una diversa distribuzione.

Hint: Calcola separatamente la somma dei vettori E e quella degli scalari V.

Fonte canonica SHA256 5b65d55780b91422fd6cacca93f498fd29070626169563dac6a8817f5972697d. Candidato SHA256 f9c69615e1126ba576b30374a4ca8ed1bc540ce2b55a4711adb78a7fd9a1a05a. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-04 — Cambia una sola delle due sorgenti

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Q₁ passa da 1 a 2 nC, mentre Q₂=2 nC. Come cambia V_P?

Procedimento d’autore: La somma delle cariche passa da tre a quattro nanocoulomb. Il potenziale passa perciò da 3·3=9 V a 3·4=12 V. Raddoppiare Q₁ non raddoppia l’intera somma, perché il contributo della seconda sorgente resta 6 V.

Passaggi: V_{P,A}=9\,\mathrm V;  V_{P,C}=3(2+2)\,\mathrm V;  V_{P,C}=12\,\mathrm V.

Distrattori: Diciotto V raddoppia anche il contributo di Q₂, che è fisso. Sei V fa diminuire il totale aumentando una sorgente positiva. Nove ignora il cambio e ventisette usa un fattore non ricavato dalla somma.

Hint: Ricalcola Q₁+Q₂ mantenendo invariato il secondo termine.

Fonte canonica SHA256 5f03aac068a9e458457687bb463900b0c9245eb8ebab8993b476d69dd2b11a29. Candidato SHA256 1715b97a397d1b46346b5afaa83ad3d3d0f7e7222ab2b697aa463a265ea15ba2. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-05 — La prima sorgente dal totale

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Si misura V_P=9 V e si conosce Q₂=2 nC. Quanto vale Q₁ in nC?

Procedimento d’autore: Il totale normalizzato w/3=3 rappresenta u+v. Sottraendo v=2 si ottiene u=1, quindi Q₁=1 nC. In generale, con Q₂ fissata, il ramo Q₁>0 richiede V_P>k_eQ₂/d: il totale deve superare il contributo noto.

Passaggi: u+v=w/3;  u=w/3-v;  Q_1=1\,\mathrm{nC};  V_P>\frac{k_eQ_2}{d}.

Distrattori: Tre nC copia la somma delle cariche senza sottrarre Q₂ e darebbe 15 V. Cinque nC aggiunge il termine noto invece di toglierlo e darebbe 21 V. Zero violerebbe Q₁>0 e darebbe soltanto 6 V.

Hint: Trasforma i volt in somma delle sorgenti e poi sottrai quella nota.

Fonte canonica SHA256 c5dad21fda3a6640d5d2b2db5af18943bd3b6e26289915279ddf06fbbba77b30. Candidato SHA256 7d1b3511a2c64560243a74339598ad9571da0a566f6b6940012c19a7e91f234d. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-06 — Cambiare lo zero non cambia le cariche

La distribuzione di cariche resta identica. Con V=0 all’infinito si hanno V_P=18 V e V_R=6 V. Si sceglie ora P come nuovo zero del potenziale. Quanto vale V′_R?

Procedimento d’autore: Il nuovo riferimento si ottiene sottraendo la stessa costante 18 V a tutti i potenziali. In P si ha V′_P=0 e in R si ha V′_R=6−18=−12 V. Il valore negativo non significa che siano cambiate le sorgenti: il campo e le differenze di potenziale restano invariati.

Passaggi: V^{\prime}=V-V_P;  V^{\prime}_P=0;  V^{\prime}_R=(6-18)\,\mathrm V;  V^{\prime}_R=-12\,\mathrm V.

Distrattori: Dodici V perde il segno della differenza; sei V conserva il vecchio riferimento. Ventiquattro V aggiunge invece di sottrarre la costante, e zero sposterebbe lo zero anche in R senza rispettare la differenza originaria. Non si usa qui l’ipotesi V positivo con zero all’infinito degli altri quesiti.

Hint: Sottrai il vecchio valore di P da ogni punto, non solo da P.

Fonte canonica SHA256 313995e6ac473ff112e68d247bd7e2b9a5333b6084663d40ff2034016483d28f. Candidato SHA256 b604ab66f7641758a7cf8f014c7d705e2f9cdc9a043b0cf08eb8bed342d17fd9. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-07 — Ridurre la seconda sorgente

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. A ha Q₁=1 nC, Q₂=2 nC. C mantiene Q₁ e ha Q₂=1 nC. Quanto vale V_P,C/V_P,A?

Procedimento d’autore: A ha totale 9 V. C ha due contributi da 3 V, per un totale di 6 V. Il rapporto è 6/9=2/3. Il dimezzamento di Q₂ non dimezza il contributo di Q₁, che rimane uguale.

Passaggi: V_{P,A}=9\,\mathrm V;  V_{P,C}=6\,\mathrm V;  V_{P,C}/V_{P,A}=\frac23.

Distrattori: 3/2 inverte il rapporto. Un mezzo segue la sola Q₂; uno ignora il cambio e due fa crescere il totale riducendo una sorgente positiva.

Hint: Confronta le somme delle cariche, non il solo rapporto del termine variato.

Fonte canonica SHA256 da53edcf2253299aa35f9e1e5bdadb11b0d71baffb1f2cfa5fe724fc8c17a613. Candidato SHA256 431ecfb7bbee0cf3ec86e8d71b39abb17a1d4ecd62dbfe997b26e34c63c60402. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-08 — La proposta raddoppia il totale corretto

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Con Q₁=1 nC e Q₂=2 nC, si propone V_P=18 V. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: La somma scalare corretta è 3+6=9 V. La proposta la supera di 18−9=+9 V. Il numero due è il rapporto delle letture; non ha le unità di una differenza di potenziale.

Passaggi: V_P=9\,\mathrm V;  e=(18-9)\,\mathrm V;  e=9\,\mathrm V.

Distrattori: −9 V capovolge l’ordine, diciotto V copia la proposta e zero la accetta. Due è un fattore puro, non lo scarto chiesto. Lo zero all’infinito resta comune alle due valutazioni.

Hint: Somma prima i contributi e poi sottrai il totale dalla proposta.

Fonte canonica SHA256 10261f8cc4ddb4d571536a54a7883e734c6e0b1e41e575258736c3f75fc33245. Candidato SHA256 97966f9eeaa0d31dc4eead3eb14c069b909d759f36ed966d3af8a45d5e4f9eb9. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-09 — L’inversa sottrae il contributo noto

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Quale formula fisica isola Q₁ da V_P e Q₂?

Procedimento d’autore: Moltiplicando V_P=k_e(Q₁+Q₂)/d per d/k_e si trova la somma delle sorgenti. Si sottrae poi Q₂: Q₁=V_Pd/k_e−Q₂. Entrambi i termini sono cariche in C se le grandezze sono in SI. La positività richiede che il totale superi il solo contributo di Q₂.

Passaggi: \frac{V_Pd}{k_e}=Q_1+Q_2;  Q_1=\frac{V_Pd}{k_e}-Q_2;  V_P>\frac{k_eQ_2}{d}.

Distrattori: Il segno più non annulla la somma originaria. Il reciproco del primo termine avrebbe unità C⁻¹ e non si sottrae a una carica. V_P−Q₂ mescola unità diverse e lasciare d al denominatore non inverte la legge del potenziale.

Hint: Ricava la somma delle due cariche prima di sottrarre la seconda.

Fonte canonica SHA256 5030edc41d65004066b1834f068b71a1b16710c950b07f423f521e76f82d56b0. Candidato SHA256 54788e4ec37dc7a6c515fe77cf44d06fa18190e37b875ebfa56c82379a7eb10e. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-10 — Due fattori dentro una somma scalare

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. C ha Q₁,C=κ₁Q₁,A e Q₂,C=κ₂Q₂,A, con fattori positivi. Quale legge generale dà V_P,C/V_P,A?

Procedimento d’autore: Distanza e costante sono comuni, quindi si cancellano nel rapporto. Restano però i pesi delle due sorgenti: (κ₁Q₁+κ₂Q₂)/(Q₁+Q₂). Il denominatore è positivo perché entrambe le cariche sono positive. Un fattore comune κ₁=κ₂ moltiplica l’intero potenziale per quel fattore, non per il suo quadrato.

Passaggi: \frac{V_{P,C}}{V_{P,A}}=\frac{\kappa_1Q_1+\kappa_2Q_2}{Q_1+Q_2}.

Distrattori: Il prodotto o quoziente dei soli fattori perde i pesi Q₁ e Q₂. La differenza appartiene a un altro schema di sovrapposizione e può annullare il denominatore per cariche uguali, dove il potenziale qui è invece positivo. L’ultima frazione capovolge il confronto.

Hint: Sostituisci ciascun fattore nella sua sorgente, mantenendo il segno della somma.

Fonte canonica SHA256 8d02d4f999bdfe8f18decfb785f5353c1bcd18a1db1f7dcff3dafd9a4aca6897. Candidato SHA256 6d9f28a48d43cd3e56ae09a4747f7403606714c19c35259b14b7862028d16668. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-11 — Da tre a cinque nanocoulomb complessivi

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. A ha Q₁=1 nC, Q₂=2 nC. C ha Q₁=2 nC, Q₂=3 nC. Quanto vale V_P,C/V_P,A?

Procedimento d’autore: Le somme delle cariche sono 3 e 5 nC. I potenziali sono 9 e 15 V e il rapporto è 15/9=5/3. Nessuno dei due rapporti delle singole sorgenti basta a descrivere l’intero potenziale.

Passaggi: V_{P,A}=9\,\mathrm V;  V_{P,C}=15\,\mathrm V;  V_{P,C}/V_{P,A}=\frac53.

Distrattori: 3/5 è il reciproco. Due segue soltanto Q₁ e 3/2 soltanto Q₂; uno ignora entrambe le sorgenti cresciute. Tutti i potenziali sono riferiti allo stesso zero.

Hint: Confronta la somma delle cariche di C con quella di A.

Fonte canonica SHA256 0c9d01b7e6973d7970efd8942bc4ba945b9e3c9ad77edd00672b8c727762d38c. Candidato SHA256 e1a074596801ace4f01585566d431ef39600f31d8dddefa21d951b154b6074dc. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-12 — La linearità conserva questa media

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. A usa Q₁=1 nC, Q₂=2 nC; C usa Q₁=2 nC, Q₂=3 nC. Qual è la media aritmetica delle due V_P con uguale peso?

Procedimento d’autore: A dà 9 V e C dà 15 V. La media è (9+15)/2=12 V. La legge è lineare nelle due sorgenti a distanze e riferimento fissati: con Q₁ medio 3/2 nC e Q₂ medio 5/2 nC si avrebbe ancora 3·4=12 V. Questa coincidenza è una conseguenza della somma lineare, non un principio generale sulle medie.

Passaggi: \overline{V_P}=\frac{9+15}{2}\,\mathrm V;  \overline{V_P}=12\,\mathrm V;  3\left(\frac32+\frac52\right)=12.

Distrattori: Ventiquattro V omette la metà della somma; tre V è metà della differenza. Nove e quindici V ripetono una sola prova. Le letture non descrivono quattro sorgenti presenti contemporaneamente nello stesso punto.

Hint: Media le uscite e poi verifica perché qui il modello ai dati medi coincide.

Fonte canonica SHA256 12d06305782ee5685fea49bb3ee9bd2ffd9efc1a1dffb5bf1147d9ed89723f85. Candidato SHA256 7d3759f2cc73fbf4dad1e12f254331789c97a69d55575755a7395a70b7dc3d63. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-13 — Il bersaglio determina la seconda carica

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. A ha Q₁=1 nC, Q₂,A=2 nC. C ha Q₁=2 nC e deve avere V_P,C=(5/3)V_P,A. Quanto vale Q₂,C/Q₂,A?

Procedimento d’autore: Il bersaglio è 15 V e richiede somma delle cariche pari a 5 nC. Poiché Q₁,C=2 nC, la seconda sorgente deve valere 3 nC. Il rapporto con Q₂,A=2 nC è 3/2. La sottrazione riguarda le sorgenti dopo aver usato la somma scalare del potenziale.

Passaggi: V_{P,C}=15\,\mathrm V;  Q_{2,C}=3\,\mathrm{nC};  Q_{2,C}/Q_{2,A}=\frac32.

Distrattori: 2/3 inverte il confronto; 5/3 copia il fattore dei potenziali e due quello della prima sorgente. Tre copia il numero di Q₂,C senza dividerlo per i 2 nC iniziali.

Hint: Dal potenziale bersaglio trova prima la somma richiesta e poi togli Q₁,C.

Fonte canonica SHA256 c53f56a34f4b005bdcc01e6d265c4985041a20b3a5f8cea2709a8f160fb26226. Candidato SHA256 71747920be2cdae61e7708600762aa0ab9d96c11944cbe1b4ad0a0a248fea367. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-14 — Decodificare il totale prima della sorgente

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Il display continuo adimensionale è D=aV_P, a>0. A con Q₁=1 nC, Q₂=2 nC dà D=27. C ha Q₂=3 nC e D=45. Quanto vale Q₁,C in nC?

Procedimento d’autore: Il riferimento vale 9 V: a=3 V⁻¹. La lettura C corrisponde a V_P,C=15 V, cioè somma delle cariche di 5 nC. Sottraendo Q₂,C=3 nC si trova Q₁,C=2 nC. La taratura e il riferimento all’infinito sono condizioni diverse e vanno conservate entrambe.

Passaggi: a=3\,\mathrm{V^{-1}};  V_{P,C}=15\,\mathrm V;  Q_{1,C}+Q_{2,C}=5\,\mathrm{nC};  Q_{1,C}=2\,\mathrm{nC}.

Distrattori: Dodici nC usa 45 come volt senza togliere il guadagno. Cinque nC copia la somma senza sottrarre Q₂. Tre nC copierebbe la sorgente nota e darebbe 18 V, con D=54 invece di 45.

Hint: Togli il guadagno, ricava la somma delle sorgenti e sottrai quella nota.

Fonte canonica SHA256 c666e8af12736e1735a91f6d512bf9d18ef11bc85a65ac6e1cf0d7c94c0dec89. Candidato SHA256 0c79cebd7dfdcc53884198ee29bdc1b93f4e19b9081301b37736b19f91364dbb. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-15 — Tarare prima di sottrarre la carica nota

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. D=aV_P+b è continuo e adimensionale, a>0. A: Q₁=1 nC, Q₂=2 nC, D=19. C: Q₁=2 nC, Q₂=3 nC, D=31. Prova G: Q₂=5 nC, D=49. Quanto vale Q₁,G?

Procedimento d’autore: I riferimenti hanno potenziali 9 e 15 V. Il guadagno è (31−19)/(15−9)=2 V⁻¹ e b=1. La lettura G indica V_P,G=(49−1)/a=24 V, quindi le cariche sommano 8 nC. Sottraendo i 5 nC noti si ottiene Q₁,G=3 nC.

Passaggi: a=2\,\mathrm{V^{-1}};  b=1;  V_{P,G}=24\,\mathrm V;  Q_{1,G}=3\,\mathrm{nC}.

Distrattori: 19/6 nC omette b e predice D=50. Cinque nC copia Q₂ e darebbe D=61; otto nC copia la somma e darebbe D=79. Un nC produrrebbe D=37, non 49. Il riferimento fisico del potenziale resta all’infinito.

Hint: Rimuovi b e a prima di dividere per tre e sottrarre Q₂,G.

Fonte canonica SHA256 1b1e5d36649a6961b51eee2903e1710b5d1405110009106e25270c0451afd7a7. Candidato SHA256 90ead83231901b96027b68a5e817b9c6ffc4365e6b4a0b851089f90e9afb2ec9. Revisione indipendente e human NOT_RUN.

## AR-u6-symmetric-electric-potential-16 — Un rapporto di cariche non elimina la scala

Due sorgenti puntiformi positive Q₁ e Q₂ sono mantenute fisse nel vuoto, entrambe a distanza d=3 m dal punto P. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e V=0 all’infinito per entrambe. Il potenziale totale è la somma scalare V_P=k_e(Q₁+Q₂)/d; non si sommano vettori di potenziale. Poniamo u=Q₁/(1 nC), v=Q₂/(1 nC), w=V_P/(1 V): w=3(u+v). Per questo potenziale bastano le distanze; non occorre assegnare l’angolo fra le posizioni delle sorgenti. Fra configurazioni si impone Q₁=Q₂/2. Si misura V_P=9 V. Quanto vale Q₂?

Procedimento d’autore: Sostituendo u=v/2 nella legge w=3(u+v), si trova w=(9/2)v. La misura w=9 impone v=2: Q₂=2 nC e Q₁=1 nC. Il rapporto fissato delle cariche non rende ridondante la misura, perché il potenziale continua a crescere linearmente con la loro scala.

Passaggi: w=3(v/2+v);  w=\frac92v;  v=2;  Q_2=2\,\mathrm{nC}.

Distrattori: Un nC darebbe 9/2 V e tre nC 27/2 V, non nove. Il valore negativo viola le due cariche positive. Non sono infinite soluzioni, perché la scala non si cancella dalla somma del potenziale.

Hint: Inserisci il rapporto delle cariche prima di risolvere la somma.

Fonte canonica SHA256 bd6271aab01769dc7035f966bb8b71f30d9e92cc08635d001ce68f4a897a6585. Candidato SHA256 93cb71c3391d1f7bb3406352220d53a636fdb107dfe06944ed735c6e9bfe029f. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 0f73f7116b3168a3439c8c079f8ff6f9ffecfb9c1351d655616f1933aeac485d. Package file SHA256 fcd154ade9ff7995dad312a1b44fd190acbf27dadcb4cd7682744d7698a34673. Binding file SHA256 990fdd18d64500af1f7f4911747015df54a0067b7eb8b8d993efeb6f8737bc64. Prova strutturale SHA256 5ab91e17e6271c99fd756b1fe04b17f6fec0fe2add40f9d6d64a38c50c991302. Asset-only manifest SHA256 c033ff1a2b60b24a94346ce7cbd0add3c3c8cab680164e76bab5782874210cfc.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
