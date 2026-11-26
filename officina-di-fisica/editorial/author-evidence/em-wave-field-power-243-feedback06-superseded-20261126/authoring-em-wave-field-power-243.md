# Authoring DRAFT — em-wave-field-power-243

Tutti gli 80 prompt originali A240–244 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-01. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-01 SHA256 609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233. Ogni caso autonomo è conservato, senza imporre il modello numerico comune: frequenza all’interfaccia 24003, velocità di fase 24004, ordinamento fotonico 24103, soglia a un fotone 24203 e geometria EM 24303. Conteggi N interi e tassi medi sono distinti. Le unità di misura scalate non sono confuse con quantità adimensionali: ogni coefficiente numerico è definito dalla normalizzazione.

Prima di qualunque candidato sono state congelate entrambe le primarie. B per A240–244: SHA 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d su 8a82a32527171b68346cf30a933552b2a5f9366f, mai aperta dall’autore. A per B245–249: SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 su b3932757. Nessuna opzione, chiave, soluzione, SVG o modulo autore B245–249 letto durante l’autoria A.

Lettura integrale delle lezioni reali C5-L06 e C5-L07 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d: interfaccia stazionaria, campi EM, energia per fotone, potenza e frazione trasmessa. Primaria C5-L06 per 240/243 e C5-L07 per 241/242/244; prerequisiti reali del catalogo. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Non è una seconda pipeline e non attribuisce credito di integrazione o SCI.

Asset SVG-only realmente renderizzato in browser nativo, XML e PNG completo effettivamente letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. Nessuna UI prodotto locale: test a 320px e relativo marker NOT_RUN e riservati al runner canonico. I testi visibili mostrano grandezze fisiche, non pixel o altre metriche ingegneristiche.

## AR-u7-em-wave-field-power-01 — Dall’ampiezza alla potenza raccolta

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. Con E₀=150 V/m e A=100 cm², quanto vale P?

Procedimento d’autore: L’intensità è150²/750=22500/750=30 W/m². L’area100 cm² è1/100 m², quindi P=30/100=3/10 W. Il fattore due della formula deriva dalla media armonica con E₀ di picco: non si sostituisce un campo efficace senza cambiare la convenzione.

Formule: I=\frac{E_0^2}{2Z_0};  I=30\,\mathrm{W/m^2};  A=\frac1{100}\,\mathrm{m^2};  P=\frac3{10}\,\mathrm W.

Distrattori e controprove: 3/5 W omette il fattore due della media.30 W copia il valore numerico dell’intensità senza l’area;3000 W usa100 come se l’area fosse in m². Zero non segue da ampiezza e area positive.

Hint: Calcola I, converti l’area e soltanto dopo forma P=IA.

Fonte SHA256 792a832aa58ed5a42c69988dbf955ca8fa17ecd2d21e2ced574fe7cf76f86a24. Candidato SHA256 dd724f293339e7849acf68728f2e06767a23a8d276658a700dd36339497aecf9. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-02 — L’unità della potenza media

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. Quale unità è dimensionalmente adatta a P?

Procedimento d’autore: Intensità per area dà(W/m²)·m²=W. La potenza è energia per tempo, non energia totale. La media temporale su un periodo non cambia questa dimensione.

Formule: [P]=\mathrm W;  \mathrm W=\mathrm{J/s}.

Distrattori e controprove: W/m² è I prima di moltiplicare per A; V/m è il campo elettrico, J energia. Il simbolo1 non rappresenta una potenza. Z₀ ha unità di impedenza, ma non è un resistore collegato al fascio.

Hint: Segui le unità dal campo all’intensità, poi all’area.

Fonte SHA256 9d40b1ccc9b61696c6e865bb31c6f0744f46c7160d741a69c45be9409964a64d. Candidato SHA256 4ae230eeabfc0bc9169cf703f4d65faef6558c23800c47e681052653833da7d5. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-03 — Tre direzioni per un’onda piana

Caso autonomo: in un’onda elettromagnetica piana propagante nel vuoto, come sono orientati E, B e la direzione di propagazione?

Procedimento d’autore: Indico con k̂ il versore di propagazione e con S il vettore di flusso energetico. L’onda piana nel vuoto è trasversa. E e B sono perpendicolari fra loro e alla direzione del flusso energetico. Il verso della propagazione è quello di E×B, quando i campi istantanei non sono nulli. Il disegno può scegliere un istante con entrambi i campi positivi; non è una traiettoria di una carica.

Formule: \vec E\perp\vec B;  \vec E\perp\hat k;  \vec B\perp\hat k;  \vec S\parallel\vec E\times\vec B.

Distrattori e controprove: Le opzioni longitudinali non descrivono questa onda piana nel vuoto. Il segno della direzione energetica non si inverte rispetto al prodotto E×B. Nei nodi temporali E e B possono annullarsi, senza cambiare la direzione di propagazione dell’onda.

Hint: Usa la mano destra su E×B.

Fonte SHA256 647b51f099745a486a9253a79b14ba4d9e2957b18b70efbc5b21be8e0338fc7d. Candidato SHA256 147a26003831a0009d9a01c0caf827b559e81dda5075f8164d37f06fe22ae4b2. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-04 — Ampiezza doppia a parità di area

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. A resta100 cm² e E₀ passa da150 a300 V/m. Come cambia P?

Procedimento d’autore: La formula media contiene E₀². Raddoppiare il picco quadruplica I e P: da3/10 W si passa a12/10=6/5 W. L’area in questa domanda non raddoppia.

Formule: E_{0,B}/E_{0,A}=2;  P_B/P_A=4;  P_B=\frac65\,\mathrm W.

Distrattori e controprove: 3/5 W segue linearmente E₀;3/20 lo rende inverso.3/10 ignora il cambio e12/5 aggiunge anche il raddoppio dell’area, che qui non è assegnato.

Hint: Eleva al quadrato il fattore dell’ampiezza.

Fonte SHA256 2f00432d055967fd5c5e74fba112e64229d8ab35b56a94c57c32d88b9c4a8070. Candidato SHA256 c6e3089cdfc5a2efe024d087b3ffbe753bbe6cedec38408691f13dfddfdd2b03. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-05 — L’ampiezza dal ramo positivo

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. P=3/10 W e A=100 cm². Quanto vale E₀ in V/m?

Procedimento d’autore: Isolo E₀²=2Z₀P/A con A in m². I dati danno22500 (V/m)²=150²(V/m)². Il ramo E₀>0 seleziona150 V/m, non la radice negativa. Si può anche usare x=E₀/(150 V/m): per questi dati x²=1.

Formule: E_0^2=\frac{2Z_0P}{A};  E_0^2=22500\,\mathrm{(V/m)^2};  E_0=150\,\mathrm{V/m}.

Distrattori e controprove: 22500 confonde il quadrato con l’ampiezza.−150 non è un picco in modulo positivo;300 V/m darebbe6/5 W. Omettere il due della media cambierebbe la radice.

Hint: Converti A, poi estrai la radice positiva.

Fonte SHA256 af8c5ff051a8027b3480cceddbf56d4885459466dac98b2dbd094bb366a165b8. Candidato SHA256 abc144c3b9f47231958e3cfa654bd67577b29e1dc0c4cb7cb244a11f5de184d4. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-06 — L’area da ampiezza e potenza

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. P=3/10 W e E₀=150 V/m. Quanto vale A in cm²?

Procedimento d’autore: L’intensità resta30 W/m². A=P/I=(3/10)/30 m²=1/100 m². Poiché1 m²=10000 cm², l’area è100 cm². L’inversa cerca una superficie, non un lato.

Formule: A=\frac{2Z_0P}{E_0^2};  A=\frac1{100}\,\mathrm{m^2};  A=100\,\mathrm{cm^2}.

Distrattori e controprove: 1/100 è il valore numerico in m², non in cm². Dieci cm² confonde una lunghezza con un’area;200 cm² darebbe3/5 W. Non si applica una radice per ricavare A.

Hint: Controlla l’unità prima e dopo la conversione finale.

Fonte SHA256 6924c762df034fc9f49cce95e36081f56f5938cf0ee1142cede8236b1d276e51. Candidato SHA256 2415a2d8a02bc5e6df91ca8806769c12cb04ef7c97a3fcc1071911acdffbc7a3. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-07 — Area doppia, stesso campo

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. A usa E₀=150 V/m,A=100 cm²; B mantiene E₀ e usa A=200 cm². Quanto vale P_B/P_A?

Procedimento d’autore: La stessa ampiezza produce la stessa intensità30 W/m². L’area doppia intercetta potenza doppia:3/10→3/5 W, rapporto due. Qui il quadrato riguarda il campo, che non è cambiato, non l’area.

Formule: P_A=\frac3{10}\,\mathrm W;  P_B=\frac35\,\mathrm W;  P_B/P_A=2.

Distrattori e controprove: Mezzo inverte il confronto, quattro eleva impropriamente al quadrato l’area, uno ignora il cambio e zero viola le grandezze positive.

Hint: La potenza è lineare nell’area a intensità uniforme fissata.

Fonte SHA256 358fc2ca89fc2fd6a348af5632757579a7986ce7772cc373dccbf4857948dddb. Candidato SHA256 efcc56b63f8a0353b1fe0848a8e5266a7f72f518754715324977e667cc5b92e4. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-08 — Scarto di una proposta di potenza

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. Con E₀=150 V/m,A=100 cm² si propone P=3/5 W. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è3/10 W. Lo scarto è3/5−3/10=3/10 W: la proposta raddoppia la potenza media. Due è il rapporto puro, non la differenza.

Formule: P=\frac3{10}\,\mathrm W;  \delta P=\left(\frac35-\frac3{10}\right)\mathrm W;  \delta P=\frac3{10}\,\mathrm W.

Distrattori e controprove: −3/10 scambia l’ordine.3/5 ripete la proposta e zero la accetta senza la media armonica. Lo scarto mantiene unità watt.

Hint: Porta entrambe le potenze al denominatore dieci.

Fonte SHA256 ebf123f399c45516b5512d44342e49d73148dac309bd923dfa587ba188295090. Candidato SHA256 d9237479eba29bede237d715cbd54b459e50adbd9a48cb3f430ebeb581683619. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-09 — L’inversa simbolica dell’ampiezza

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. P e A sono noti, con A in unità SI. Quale formula isola E₀>0?

Procedimento d’autore: Moltiplico P=E₀²A/(2Z₀) per2Z₀ e divido per A>0. Poi estraggo la radice positiva: E₀=√(2Z₀P/A). L’area sotto radice è quella in m²; se si usano i numeri in cm² occorre il fattore di conversione.

Formule: E_0^2=\frac{2Z_0P}{A};  E_0=\sqrt{\frac{2Z_0P}{A}}.

Distrattori e controprove: Senza radice si ricava il quadrato del campo. Omettere il due dà un’ampiezza più piccola di un fattore√2; moltiplicare per A cambia anche le dimensioni. L’ultima espressione ha unità inversa di campo, non V/m.

Hint: Distingui E₀ da E₀² prima di scegliere il ramo.

Fonte SHA256 eeda4142bea4bec2eb3dbd34f027cffc3f0b98290977b763b5736967f74d7e89. Candidato SHA256 8cd7bde6b3c3cc94bb672e0c67b1bed8ed2544fc672ac6655aa8564bba66d40e. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-10 — Due fattori con esponenti diversi

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. Fra preparazioni E₀,B=κ₁E₀,A e A_B=κ₂A_A, con fattori positivi. Quanto vale P_B/P_A?

Procedimento d’autore: L’ampiezza porta il fattoreκ₁² e l’area il fattoreκ₂. Z₀ e la media armonica sono comuni e si cancellano: P_B/P_A=κ₁²κ₂. Il simbolo E₀ indica sempre il picco in entrambe le prove.

Formule: P_B/P_A=\kappa_1^2\kappa_2.

Distrattori e controprove: κ₁κ₂ perde il quadrato; il quoziente inverte l’effetto dell’area. Il rapportoκ₂/κ₁² rende inverso il campo e la somma non dà uno per fattori unitari.

Hint: Usa un quadrato per il campo e una sola potenza per l’area.

Fonte SHA256 f397a174f29b6e35355a636f55718539c15bf7b368cebd46531865169ca4eace. Candidato SHA256 3231c449e2ae56613a2e8f54a59c044bc0f89efe9682b6e2db28cc298aed61db. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-11 — Due raddoppiamenti danno otto

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. A ha E₀=150 V/m,A=100 cm². B ha E₀=300 V/m,A=200 cm². Quanto vale P_B/P_A?

Procedimento d’autore: Il campo doppio dà intensità quattro volte maggiore; l’area doppia aggiunge un fattore due. Le potenze sono3/10 e12/5 W e il rapporto è otto. Non si sommano i due fattori.

Formule: P_A=\frac3{10}\,\mathrm W;  P_B=\frac{12}{5}\,\mathrm W;  P_B/P_A=8.

Distrattori e controprove: Un ottavo inverte il confronto. Quattro segue soltanto il campo, due soltanto l’area. Uno ignora entrambe le variazioni.

Hint: Moltiplica quattro per due.

Fonte SHA256 365a092d0be179f75074b4b08149c5060df4a6da4e9a6d1119af01c50f20412d. Candidato SHA256 4eb237cde159ef3cbc60fb2d35249a788f2187846417a53f7009f7074ccec2fe. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-12 — Media di due potenze medie

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. A usa E₀=150 V/m,A=100 cm²; B usa E₀=300 V/m,A=200 cm². Qual è la media aritmetica delle due P?

Procedimento d’autore: Le uscite sono3/10 e12/5=24/10 W. La semisomma è27/20 W. Agli ingressi medi E₀225 V/m e A150 cm² la formula darebbe81/80 W, inferiore alla media delle uscite di27/80 W. Questa è una media statistica di due potenze già mediate sui rispettivi periodi.

Formule: \overline P=\frac{3/10+12/5}{2}\,\mathrm W;  \overline P=\frac{27}{20}\,\mathrm W;  P_{\rm dati\ medi}=\frac{81}{80}\,\mathrm W.

Distrattori e controprove: 81/80 W usa i dati medi,27/10 è la somma,21/20 la semidifferenza e12/5 solo B. Non si può far passare la media attraverso il quadrato di E₀ e il prodotto per A.

Hint: Porta le due potenze al denominatore dieci, poi dimezza.

Fonte SHA256 5395acb083636814b9abeb8194692afd5b974ca7152199f74e1d9d6785c93630. Candidato SHA256 4440ed17fdc43945b9c82085b8614282829f7f39bedf5bd2ac897d8afc7d8095. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-13 — L’area che completa il bersaglio

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. A ha E₀,A=150 V/m,A_A=100 cm². B usa E₀,B=300 V/m e deve ottenere P_B=8P_A. Quanto vale A_B/A_A?

Procedimento d’autore: L’ampiezza doppia fornisce già un fattore quattro nella potenza. Per arrivare a otto serve un ulteriore fattore due nell’area: A_B200 cm² e rapporto due. L’area non va elevata al quadrato.

Formule: 8=4\frac{A_B}{A_A};  A_B/A_A=2;  A_B=200\,\mathrm{cm^2}.

Distrattori e controprove: Mezzo inverte il confronto. Otto copia il bersaglio; quattro scambia il fattore del campo con quello dell’area. Area invariata darebbe soltanto4P_A.

Hint: Dividi il rapporto di potenza per il quadrato del rapporto dei campi.

Fonte SHA256 bcdeadb1d8e7a08bd2082f01822fe6290d7a5129c3709071901c127c052f299e. Candidato SHA256 4ee4ddb242216e2faf6b9fbddc79142c34d35d8495e8019f3ee71edf2694930c. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-14 — Il display va decodificato prima della radice

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. D=a_cal P è continuo e adimensionale. Il riferimento E₀=150 V/m,A=100 cm² dà D=9/10. La prova B ha A=200 cm²,D=36/5. Quanto vale E₀,B in V/m?

Procedimento d’autore: P_A3/10 W identifica a_cal=(9/10)/(3/10 W)=3 W⁻¹. La nuova lettura dà P_B=(36/5)/3=12/5 W. Definendo x=E₀/(150 V/m), alla nuova area doppia si ha P_B/P_A=2x²=8: x²4 e x2. Quindi E₀,B300 V/m.

Formule: a_{\rm cal}=3\,\mathrm W^{-1};  P_B=\frac{12}{5}\,\mathrm W;  x^2=4;  E_{0,B}=300\,\mathrm{V/m}.

Distrattori e controprove: Usare D direttamente come potenza triplicherebbe P_B e darebbe300√3 V/m, non300.150 V/m darebbe P3/5 W e D9/5. Il guadagno deve essere rimosso prima del quadrato inverso.

Hint: Ricava P, poi usa la radice del rapporto dei campi.

Fonte SHA256 7f5773839f9613455a3d9491e33a550dfa42a5b747339a41d8e0702c22f0777a. Candidato SHA256 13fa87194bec84c6a8ee0f13e9b4d8e582d258d82b714fac60c98e136bb8ad12. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-15 — Taratura affine con due potenze

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. D=a_cal P+b_cal è continuo. A:E₀=150 V/m,A=100 cm²,D=8/5. B:E₀=300 V/m,A=200 cm²,D=29/5. C:A=100 cm²,D=17/5. Quanto vale E₀,C in V/m?

Procedimento d’autore: I riferimenti fisici sono P_A3/10 W e P_B12/5 W. La differenza di letture21/5 divisa per la differenza di potenze21/10 W dà a_cal2 W⁻¹; segue b_cal1. D_C17/5 decodifica P_C6/5 W. Alla stessa area di A, il rapporto P_C/P_A=4 dà ampiezza doppia:300 V/m.

Formule: a_{\rm cal}=2\,\mathrm W^{-1};  b_{\rm cal}=1;  P_C=\frac65\,\mathrm W;  E_{0,C}=300\,\mathrm{V/m}.

Distrattori e controprove: Omettere l’offset darebbe P17/10 W e non ricostruirebbe D17/5. Saltare il guadagno dopo la sottrazione raddoppierebbe P e darebbe300√2 V/m.150 V/m darebbe D8/5.

Hint: Le differenze dei riferimenti eliminano b_cal prima di ricavare il campo.

Fonte SHA256 e127a156f0b6b5360946c18eafb0e89869ae517e9fcf1b57a08c3944aa71b8c1. Candidato SHA256 86b9b340b5c9f19f81a449128f2bc5ff4a4ba6f0222e00401734aeaacc96e934. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-em-wave-field-power-16 — Un vincolo fra ampiezza e area

Un’onda elettromagnetica piana armonica nel vuoto illumina uniformemente una superficie di area A>0, perpendicolare alla propagazione. E₀>0 è l’ampiezza di picco del campo elettrico in V/m, non il valore efficace. Si fornisce I=E₀²/(2Z₀), con Z₀=375 Ω assunto per il calcolo; I è intensità media, P=IA potenza media incidente. Se A è data in cm² va convertita:1 cm²=10⁻⁴ m². Ogni prova conserva queste ipotesi e il valore prescritto di Z₀. Fra preparazioni E₀=[(3/2)(V/m)/cm²]A. Si misura P=3/10 W. Quanto vale A?

Procedimento d’autore: Pongo x=E₀/(150 V/m)>0 e a=A/(100 cm²)>0. Il vincolo dimensionato dà x=a; la formula diventa P=(3/10 W)x²a=(3/10 W)a³. La misura impone a³1, quindi a1: A100 cm² ed E₀150 V/m. Non è una legge di crescita temporale dell’area.

Formule: x=a;  P=\left(\frac3{10}\,\mathrm W\right)a^3;  a^3=1;  A=100\,\mathrm{cm^2}.

Distrattori e controprove: −100 viola l’area positiva.150 cm² darebbe81/80 W;10000 cm² rende a100 e non la potenza misurata. Il vincolo cubico è strettamente crescente per a>0 e lascia una sola area.

Hint: Normalizza le due grandezze per evitare grandi numeri nel cubo.

Fonte SHA256 1e6302568e0693d7dedf67e10d14268ac579bfd653571e4f1d7b9e19958e68fb. Candidato SHA256 3a74b570a0607f302fcf88c0cccc203e43c0f4457d5a08638cdcb4a06b3ab65e. Skill reale C5-L06. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 dcce17842e5d6a5b304627fbeef8aeefad2107d41891ca8a027b784407810e8e. Package file SHA256 1c5af7a187f6ba5fc985f89f51510288a742da49366bbfec0d1bbd7929fcad53. Binding file SHA256 a7cbe81a00d785154f1764eccc25a0e9f9c0090ba84dbd13e1daff310674b2d6. Strutturale SHA256 45ee57a3288c187201abb2ee17bc77e2aca6a169cefdc6d30b5bdeefea7c9693. Manifest asset-only SHA256 5861f98c6a3a01ab005ee051a6ebbc83774b240e54a16313b8c0197cece1b94c.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Lettura geometrica d’autore: nel primo pannello E punta verso l’alto e B è uscente, perciò E×B punta verso destra come S. Il simbolo del campo uscente non copre le punte; le frecce indicano versi senza confrontare unità o moduli differenti. Il pannello di calcolo usa150²/750=30 W/m² e100 cm²=1/100 m². Le barre30/240/135 coordinate da origine150 rappresentano3/10,12/5,27/20 W, scala comune100 coordinate/W. Non rappresentano ampiezze di campo: la barra B è otto volte A perché cambiano sia E₀ sia A. Queste coordinate restano soltanto nella nota tecnica. XML e PNG completo effettivamente letti.
