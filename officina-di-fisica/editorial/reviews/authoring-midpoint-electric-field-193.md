# Authoring DRAFT — midpoint-electric-field-193

Letti individualmente tutti gli 80 prompt A190–194 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L01/L02/L03 per Coulomb, campo vettoriale e potenziale scalare. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B195–199 è congelata separatamente SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-midpoint-electric-field-01 — Il segno prima dei numeri

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Con Q_s=3 nC e Q_d=1 nC, quanto vale E_x in N/C?

Procedimento d’autore: Ogni nanocoulomb a un metro produce 9 N/C. La sorgente a sinistra contribuisce +27 N/C, quella a destra −9 N/C, perché entrambi i campi escono dalle rispettive sorgenti positive. La somma algebrica è 27−9=+18 N/C: il campo totale punta a destra. Aggiungere i moduli produrrebbe invece 36 N/C.

Passaggi: E_{s,x}=27\,\mathrm{N/C};  E_{d,x}=-9\,\mathrm{N/C};  E_x=18\,\mathrm{N/C}.

Distrattori: 36 N/C somma i moduli senza i versi. −18 N/C inverte l’asse o la sottrazione. Ventisette N/C e nove N/C omettono una delle sorgenti. Non si moltiplicano fra loro i due campi.

Hint: Disegna il campo uscente da ciascuna carica nel punto P, poi assegna i segni.

Fonte canonica SHA256 cdc5b3df83461462b19194f8d8fd77e8cd986ee21c2b05543a63a591aa0bb774. Candidato SHA256 0ca7f06e8286a5bc6f9d49b44be3a6285c8ce7ebc8a67c3f1f3d8476b8f220b9. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-02 — Anche una componente ha unità di campo

Si sommano le componenti lungo x dei campi di due cariche. Quale unità esprime il risultato E_x?

Procedimento d’autore: La proiezione su un asse cambia il segno e il valore del campo, non le sue unità. Ogni contributo è forza per carica di prova, quindi N/C, e si possono sommare componenti con la stessa unità.

Passaggi: E_x=E_{s,x}+E_{d,x};  [E_x]=\mathrm{N/C}.

Distrattori: N è forza, C carica, V potenziale e J energia. Per ottenere una forza dal campo occorre una carica di prova, non specificata in questo calcolo.

Hint: Controlla l’unità di ciascun contributo prima della somma.

Fonte canonica SHA256 eed32e03e63eddcfa8a9550a428363abe4317f313fbe7b118a8c4824ccfc6a2c. Candidato SHA256 7ce85256983a1c7a2660bcd022f98d3bbc464d96ac93f0f04f0c2c1e4c8dc1c5. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-03 — Due sorgenti positive non danno due segni positivi

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Quale legge fornisce e usando u e v?

Procedimento d’autore: Il verso radiale dalla sorgente sinistra verso P è +x; quello dalla sorgente destra verso P è −x. La sovrapposizione vettoriale dà E_x=k_eQ_s/d²−k_eQ_d/d². Distanze e costante sono comuni, quindi si sottraggono le cariche: e=9(u−v). La positività delle sorgenti non sostituisce il controllo della geometria.

Passaggi: E_x=\frac{k_e(Q_s-Q_d)}{d^2};  e=9(u-v);  u>v>0.

Distrattori: La somma perde la direzione del secondo campo. Scambiare u e v dà il verso opposto. Il prodotto non è una sovrapposizione e il quadrato della differenza distrugge la dipendenza lineare dalle sorgenti.

Hint: Usa il versore da ciascuna sorgente a P, non il solo segno della carica.

Fonte canonica SHA256 be355bebd4a49f9b13b5c433d9d231e2acda0e6d1da6ff9503a2cde0c9b6367c. Candidato SHA256 18e1e12fd80b156b7c02e6268f87e4cfffaa374fcc8706df4fc3bc4beaec0e57. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-04 — Aumenta solo la sorgente a sinistra

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Q_s passa da 3 a 5 nC mentre Q_d=1 nC. Come cambia E_x?

Procedimento d’autore: La differenza delle cariche passa da 3−1=2 nC a 5−1=4 nC. Il campo totale raddoppia da 18 a 36 N/C, mentre il contributo destro resta −9 N/C. Il rapporto non è 5/3, perché si confronta una differenza con un termine fisso, non il solo Q_s.

Passaggi: E_{x,A}=9(3-1)\,\mathrm{N/C};  E_{x,C}=9(5-1)\,\mathrm{N/C};  E_{x,C}=36\,\mathrm{N/C}.

Distrattori: Trenta N/C scala il totale di 5/3 come se tutto dipendesse dal solo Q_s. Cinquantaquattro N/C somma invece 45 e 9 N/C, perdendo il verso. Diciotto ignora il cambio e nove lo fa diminuire senza ragione.

Hint: Ricalcola la differenza fra sorgenti mantenendo il termine destro.

Fonte canonica SHA256 d118f7a09ffe487a36be3536b1aedb8c00e928d398a6775da1ce5b334ceedefc. Candidato SHA256 3787ef7b89eafd55f7b876227318b6f4c74167651f12e4beaad1d82b9fc05916. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-05 — La sorgente a sinistra dal totale

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Si misura E_x=18 N/C e si conosce Q_d=1 nC. Quanto vale Q_s in nC?

Procedimento d’autore: Il totale normalizzato e/9=2 è la differenza u−v. Con v=1, il valore u è 2+1=3. La carica sinistra vale quindi 3 nC ed è maggiore di quella destra come richiesto dal ramo fisico.

Passaggi: u-v=e/9;  u=e/9+v;  u=3;  Q_s=3\,\mathrm{nC}.

Distrattori: Due nC copia la differenza, senza aggiungere Q_d. Un nC sottrarrebbe invece il termine noto e darebbe totale zero. Diciotto nC confonde il numero del campo con quello della carica.

Hint: La differenza nota va aumentata della carica destra, non diminuita.

Fonte canonica SHA256 47c1151ed5f47c7ee34b590688f792bdae9594911771b55b2f9de46b288a07dc. Candidato SHA256 7a44759b55d6d67c579e765ce6da88c750096c90f5827edc04c129591ad971fd. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-06 — La carica destra deve restare positiva

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Si misura E_x=18 N/C e si conosce Q_s=3 nC. Quanto vale Q_d in nC?

Procedimento d’autore: Dal totale e=9(u−v) si ottiene v=u−e/9=3−2=1. Quindi Q_d=1 nC. In generale questa inversa richiede 0<E_x<k_eQ_s/d²: il totale deve essere positivo ma minore del contributo sinistro per lasciare Q_d positiva.

Passaggi: v=u-e/9;  v=3-2;  Q_d=1\,\mathrm{nC};  0<E_x<\frac{k_eQ_s}{d^2}.

Distrattori: Cinque nC aggiunge invece di sottrarre la differenza e invertirebbe il campo totale. Zero nC violerebbe Q_d>0; due nC darebbero soltanto 9 N/C. Un risultato negativo segnalerebbe dati fuori dal ramo, non una seconda soluzione da accettare.

Hint: Sottrai la differenza dalla carica sinistra e controlla Q_d>0.

Fonte canonica SHA256 21808c8e1ccbc3cee0482d19db6013b1092ed5b31a0ab371890a52441828e5cb. Candidato SHA256 15abba8d280e1c3711521de496aac6ed14cf42448a49eb7920c00c1925e72c4c. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-07 — Il campo opposto diventa più forte

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. A ha Q_s=3 nC, Q_d=1 nC. C mantiene Q_s e ha Q_d=2 nC. Quanto vale E_x,C/E_x,A?

Procedimento d’autore: A dà 9(3−1)=18 N/C. C dà 9(3−2)=9 N/C: il contributo opposto è cresciuto, perciò il campo totale si dimezza. Entrambe le configurazioni mantengono Q_s>Q_d e il totale resta diretto a destra.

Passaggi: E_{x,A}=18\,\mathrm{N/C};  E_{x,C}=9\,\mathrm{N/C};  E_{x,C}/E_{x,A}=\frac12.

Distrattori: Due segue il raddoppio della sola Q_d senza il suo segno opposto; uno ignora il cambio. Un terzo non ricostruisce le due differenze e il rapporto negativo violerebbe i totali positivi del ramo.

Hint: Aumentare la sorgente destra aumenta il contributo verso sinistra.

Fonte canonica SHA256 1e8355574ec2fc894b8d4c57948caa83745dc42037d2b1f9d275a584d34ddfbc. Candidato SHA256 aec2941f9666fe5bad8073d2b16476000e2c52d2f29ef7980aa0df880b36c1ca. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-08 — Lo scarto di una somma di moduli

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Con Q_s=3 nC e Q_d=1 nC si propone E_x=36 N/C. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Il valore 36 N/C è la somma 27+9 dei moduli, ma il totale orientato è 27−9=18 N/C. La proposta lo supera di 18 N/C. Questo scarto non è il campo generato da una nuova sorgente.

Passaggi: E_x=18\,\mathrm{N/C};  e_{\rm scarto}=(36-18)\,\mathrm{N/C};  e_{\rm scarto}=18\,\mathrm{N/C}.

Distrattori: −18 N/C scambia il verso della sottrazione; 36 N/C ripete la proposta; zero accetta l’errore. Due è il rapporto puro e non una differenza con unità.

Hint: Ricostruisci prima il totale con i segni e poi sottrailo dalla proposta.

Fonte canonica SHA256 b5d2eaa42d8f48c762a24e8158739523eefd886c9ee332c446d78a16e9956010. Candidato SHA256 95e14472b8bea53c79b3eb91ca5da2da2d2f5d5de977573892ca8f87efc8bdd9. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-09 — L’inversa fisica aggiunge Q_d

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Quale formula fisica isola Q_s da E_x e Q_d?

Procedimento d’autore: Dalla relazione E_xd²/k_e=Q_s−Q_d si aggiunge Q_d a entrambi i membri. Si ottiene Q_s=Q_d+E_xd²/k_e. Il secondo termine è una carica positiva, così l’inversa rispetta automaticamente Q_s>Q_d quando E_x>0.

Passaggi: \frac{E_xd^2}{k_e}=Q_s-Q_d;  Q_s=Q_d+\frac{E_xd^2}{k_e}.

Distrattori: Sottrarre Q_d non ricostruisce la differenza originaria. Il reciproco ha unità C⁻¹ e non si somma a Q_d. Sommare E_x e Q_d prima della conversione mescola campo e carica; lasciare d² al denominatore cambia le unità del secondo termine.

Hint: Porta Q_d nel membro del campo dopo aver trasformato E_x in una differenza di cariche.

Fonte canonica SHA256 fc11e28739abd69e9fbc05d80386abb32c5ed87b87c62bcc926380aebf87a035. Candidato SHA256 3b9a149b31bc2bc98e171274a27ccf1d607d061f5a7a67e18a043ec055a0a4c6. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-10 — Due fattori dentro una differenza

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. C ha Q_s,C=κ₁Q_s,A e Q_d,C=κ₂Q_d,A. I fattori sono positivi e κ₁Q_s,A>κ₂Q_d,A. Quale legge generale dà E_x,C/E_x,A?

Procedimento d’autore: Il coefficiente k_e/d² è comune alle due prove e si cancella. Rimangono però i pesi delle due cariche: (κ₁Q_s−κ₂Q_d)/(Q_s−Q_d), con simboli senza pedice riferiti ad A. Il denominatore è positivo per il ramo e il vincolo aggiuntivo mantiene positivo anche il numeratore.

Passaggi: \frac{E_{x,C}}{E_{x,A}}=\frac{\kappa_1Q_s-\kappa_2Q_d}{Q_s-Q_d};  \kappa_1Q_s>\kappa_2Q_d.

Distrattori: Un quoziente o prodotto dei soli fattori perde le cariche che pesano i contributi. La somma non rispetta il verso del campo destro. L’ultima frazione capovolge il confronto e restituisce A/C.

Hint: Sostituisci i nuovi valori dentro la differenza, senza separare artificialmente i due termini.

Fonte canonica SHA256 c9cf612150404fd31c7c7018acab5de63c40a2ac867a7a16fa1161328bc39c6b. Candidato SHA256 e578568976b7769fca2cac606530e4de8053c458b1d76d7655c5c224728949e3. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-11 — Crescono entrambe le sorgenti

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. A ha Q_s=3 nC, Q_d=1 nC. C ha Q_s=7 nC, Q_d=3 nC. Quanto vale E_x,C/E_x,A?

Procedimento d’autore: La differenza A è 2 nC, quella C è 4 nC. I totali sono quindi 18 e 36 N/C e il rapporto è due. Non si può usare 7/3 o tre da soli, perché entrambi i contributi sono cambiati.

Passaggi: E_{x,A}=18\,\mathrm{N/C};  E_{x,C}=36\,\mathrm{N/C};  E_{x,C}/E_{x,A}=2.

Distrattori: 7/3 segue soltanto Q_s; tre soltanto Q_d. Dieci quarti confronterebbe le somme 7+3 e 3+1, trascurando i versi. Un mezzo è il reciproco del totale richiesto.

Hint: Confronta le differenze delle sorgenti prima dei singoli rapporti.

Fonte canonica SHA256 4429d8ff5a483d7318782b46b6f3458530aacb0a2cd57ec87eed34eff4d3d711. Candidato SHA256 3a6ff37a080e5b6ed474e55bf1d66aa2463041bc1376945d52f8794d7ad13b43. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-12 — Una media che coincide con i dati medi

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. A usa Q_s=3 nC, Q_d=1 nC; C usa Q_s=7 nC, Q_d=3 nC. Qual è la media aritmetica dei due E_x con uguale peso?

Procedimento d’autore: Le letture sono 18 e 36 N/C, quindi la loro media è 27 N/C. In questo particolare modello lineare, anche usando prima le cariche medie Q_s=5 nC e Q_d=2 nC si ottiene 9(5−2)=27 N/C. La coincidenza è giustificata dalla linearità della differenza, non una regola da estendere alle leggi inverse o quadratiche.

Passaggi: \overline{E_x}=\frac{18+36}{2}\,\mathrm{N/C};  \overline{E_x}=27\,\mathrm{N/C};  9(5-2)=27.

Distrattori: Cinquantaquattro N/C non dimezza la somma; nove N/C è metà della differenza; diciotto e trentasei N/C copiano una sola prova. Il fatto che i dati medi funzionino qui non rende lecita qualunque media prima di una legge non lineare.

Hint: Media le due uscite e verifica poi, separatamente, la linearità di questa legge.

Fonte canonica SHA256 116749b9b0d91a0bc909f3d38437765f25b922ff77c8d42f67c25416960cfbc5. Candidato SHA256 3b01f8be6b2b0c8d88a34828294ef13c804cc76a1f858b8035a71b44900a83c3. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-13 — Ricostruire il contributo che si oppone

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. A ha Q_s=3 nC, Q_d,A=1 nC. C ha Q_s=7 nC e deve avere E_x,C=2E_x,A. Quanto vale Q_d,C/Q_d,A?

Procedimento d’autore: Il bersaglio è 36 N/C, cioè differenza 36/9=4 nC. La carica destra deve valere 7−4=3 nC. Il rapporto con 1 nC iniziale è tre e la condizione 7>3>0 è rispettata.

Passaggi: E_{x,C}=36\,\mathrm{N/C};  Q_{d,C}=3\,\mathrm{nC};  Q_{d,C}/Q_{d,A}=3.

Distrattori: Due copia il bersaglio sul campo; 7/3 segue la carica sinistra. Quattro è la differenza delle sorgenti e non Q_d,C. Un terzo inverte il rapporto ricostruito.

Hint: Dal campo bersaglio trova la differenza, poi sottraila da Q_s,C.

Fonte canonica SHA256 81a441d2ddaaeb59cde295afdbe4b24cdd75ddead2e9e39996ab679079b62069. Candidato SHA256 7f675c460b92939e858d510d33d973d7335fda01158736ae8c7f9bfece2b4c2e. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-14 — Il display del campo totale

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. D=aE_x è continuo e adimensionale, a>0. A con Q_s=3 nC, Q_d=1 nC dà D=54. C ha Q_d=3 nC e D=108. Quanto vale Q_s,C in nC?

Procedimento d’autore: Il riferimento vale 18 N/C, quindi a=3 C/N. La nuova lettura corrisponde a 36 N/C e a una differenza di cariche di 4 nC. Sommando Q_d,C=3 nC si trova Q_s,C=7 nC, che mantiene il ramo dichiarato.

Passaggi: a=3\,\mathrm{C/N};  E_{x,C}=36\,\mathrm{N/C};  Q_{s,C}-Q_{d,C}=4\,\mathrm{nC};  Q_{s,C}=7\,\mathrm{nC}.

Distrattori: Quindici nC usa D=108 come campo e trova differenza dodici invece di quattro. Quattro nC si ferma alla differenza senza aggiungere Q_d,C. Tre nC renderebbe il totale nullo e non rispetterebbe Q_s>Q_d.

Hint: Decodifica il campo e poi aggiungi la sorgente destra.

Fonte canonica SHA256 7db913cde43073b69f981526295bb5e4293f7fe3236283e5aa81d8249da18fd7. Candidato SHA256 4624fd38add199ed1d2788751cff360cc8c42220548949097efa1f1713dc58cb. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-15 — Guadagno e offset prima della somma finale

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. D=aE_x+b è continuo e adimensionale, a>0. A: Q_s=3 nC, Q_d=1 nC, D=37. C: Q_s=7 nC, Q_d=3 nC, D=73. Prova G: Q_d=1 nC, D=19. Quanto vale Q_s,G?

Procedimento d’autore: I riferimenti danno 18 e 36 N/C. Il guadagno è (73−37)/(36−18)=2 C/N e b=1. D=19 indica E_x,G=9 N/C, quindi la differenza è 1 nC. Aggiungendo Q_d=1 nC si ottiene Q_s,G=2 nC.

Passaggi: a=2\,\mathrm{C/N};  b=1;  E_{x,G}=9\,\mathrm{N/C};  Q_{s,G}=2\,\mathrm{nC}.

Distrattori: 37/18 nC omette b e predice D=20. Un nC annullerebbe il totale, tre nC ripeterebbe D=37 e quattro nC darebbe D=55. Ogni confronto usa la stessa carica destra della prova G.

Hint: Dopo la taratura, il campo misura ancora una differenza e non una carica da sola.

Fonte canonica SHA256 be4175a6e7f9bc2ec6cf533882c75653949895ba6ee1032111e031880f027295. Candidato SHA256 e1df523d19de8fc8ab8ffca60045f94679de73c17138e40688acaab777313d3c. Revisione indipendente e human NOT_RUN.

## AR-u6-midpoint-electric-field-16 — Un rapporto fissato fra le due cariche

Nel vuoto due cariche puntiformi positive sono mantenute fisse: Q_s a sinistra del punto P e Q_d a destra, entrambe a distanza d=1 m da P. L’asse x positivo punta a destra e Q_s>Q_d>0. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. In P il campo di Q_s punta a destra e quello di Q_d a sinistra; si cerca la componente totale E_x, non la somma dei moduli. Poniamo u=Q_s/(1 nC), v=Q_d/(1 nC), e=E_x/(1 N/C): e=9(u−v)>0. Fra configurazioni si impone Q_s=3Q_d. Si misura E_x=18 N/C. Quanto vale Q_d?

Procedimento d’autore: Sostituendo il vincolo, Q_s−Q_d=2Q_d. Nei numeri e=18v, quindi e=18 richiede v=1: Q_d=1 nC e Q_s=3 nC. Il rapporto delle cariche fissa la forma, mentre il campo misurato determina ancora la scala positiva.

Passaggi: e=9(3v-v);  e=18v;  v=1;  Q_d=1\,\mathrm{nC}.

Distrattori: Tre nC darebbe 54 N/C; due nC darebbero 36 N/C. Il valore negativo viola entrambe le cariche positive e il verso. Non sono infinite soluzioni, perché il campo non si cancella dopo il vincolo.

Hint: Sottrai le sorgenti soltanto dopo aver inserito Q_s=3Q_d.

Fonte canonica SHA256 c8d4d07e06711eeed642c987f62f6bd4bd460aa7637b59675d6b8bb3f2e09e75. Candidato SHA256 0c29906426526a186973c0ea762e1177b26ce58f0a1f6de7f27c208f44e97893. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 d793d4ec05028b1c66883ccbf34c5c41146e9168816cb104ab5071e15327e902. Package file SHA256 4f25d56566f199e3c73c905dade44ea50c2a4514f8477b6fbd72afcf4c15509e. Binding file SHA256 c9944116939a598eb6e2ec8e2426c5115843d7f3ad69f5ec3b5358d0538f4a35. Prova strutturale SHA256 4ca9dcf2742c0c1cd04566b7ce739c531312c1432d8281ad03fb9024613be0c7. Asset-only manifest SHA256 d89f33947917098d3a4b4037745ca6f6006371e56ba00771bb1b0f7dffbb2f9b.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
