# Revisione indipendente cric-c4-l05

Dieci problemi distinti, risolti prima delle candidate nella primaria C4 Q041-050 commit 6fbd440c1a31462c678b126b541f5b3dc00f0218, SHA 7d8acc4e7e582836a85007a404c3486695a8b83a436464790a08f0f5fa2a84e5. Modello realmente eseguito prima dei candidati, SHA 64927c6305dc9ac7cc6d05392764eae221b37ff87fd99d9afc1c60f8d4c1fe05, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti i 10 record finali 08061cb49341ef7e9fc368c29977893398c4618d letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C4-L05 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

Tre pannelli letti integralmente nel nuovo PNG640×1540: gradini I(t) da3 mA per4 s e1 mA per6 s hanno larghezze144/216 e altezze210/70, aree coerenti12/6 mC. Filo rettangolare a profondità comune160×80 e320×40, volume costante e resistenza quadruplicata. Due soli punti I(V) a(1V,1mA)/(3V,2mA), coordinate120/360 e100/200, senza curva interpolata; rapporti statici1/1.5 kΩ. Zeri e unità leggibili, scale indipendenti tra pannelli.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Le grandezze orientate, le conversioni dei prefissi e i rapporti puri sono distinti; le opzioni equivalenti sono confrontate con la loro dimensione. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C4-Q041

Ipotesi: Two successive positive constant-current intervals 3 mA for 4 s and 1 mA for 6 s; common orientation.

Derivazione: La carica orientata è l’area sotto I(t). I due intervalli hanno lo stesso verso, perciò Q=3 mA·4 s+1 mA·6 s=18 mC. Non si fa una media aritmetica delle correnti senza pesare le durate.

Distrattori: 12 and 6 count one interval;40 multiplies summed currents by total time as if simultaneous.

Didattica: Exact signed rectangular areas give charge, not mean current.

Modalità: EXACT_ORACLE; esito True; firma 5c40f20cdbe1085c88a12718cf78e13dc4023119428ac2481a5d6903c859921a.

## C4-Q042

Ipotesi: Conventional current right in a metal, carriers are negative electrons; compare mean drift, not thermal paths.

Derivazione: La deriva media degli elettroni è verso sinistra, opposta alla corrente convenzionale, perché i portatori metallici sono negativi. Il verso della corrente è definito come verso di trasporto di carica positiva.

Distrattori: Negative carriers drift opposite current; microscopic random motion does not cancel mean drift.

Didattica: Mean carrier motion separated from conventional orientation.

Modalità: AI_CONCEPTUAL; esito True; firma 87fa2e246f66fa73b59cb28e6c57bf6b88586b7e56c06c7df1da6b24d13f277f.

## C4-Q043

Ipotesi: Ideal voltage source in admitted operating conditions fixes terminal potential difference.

Derivazione: Il generatore ideale mantiene la differenza di potenziale, detta tensione, fra i morsetti. La corrente dipende dal circuito collegato; i potenziali assoluti richiedono un riferimento.

Distrattori: Current, power and transferred charge depend on load and duration, not voltage alone.

Didattica: Source constraint separated from response of external load.

Modalità: AI_CONCEPTUAL; esito True; firma 97de75eda77ba4f69d1963fdfe6710a5b8561d0502c6db915badfed8150fd439.

## C4-Q044

Ipotesi: Constant current 0.40 mA and positive transferred charge 8 microC.

Derivazione: Con corrente costante t=Q/I. 8 μC/(0,40 mA)=20 ms, perché 1 mA·1 ms=1 μC. La durata è positiva e non è pari al numero 20 espresso in secondi.

Distrattori: 2 ms transfers 0.8 microC,200 ms transfers 80 microC; charge times current has wrong dimension.

Didattica: Inverse duration checked by multiplying current and time.

Modalità: EXACT_ORACLE; esito True; firma f455ce471fed407eeb04d26fa1906cdc6043d7e44bc24e941222e0b6e601bd40.

## C4-Q045

Ipotesi: Two ohmic resistors at fixed temperature, positive distinct slopes in I versusV through origin.

Derivazione: Per un resistore ohmico I=V/R, la pendenza del grafico I contro V è 1/R. La retta meno inclinata ha resistenza maggiore. Nel grafico opposto V contro I la pendenza sarebbe invece R.

Distrattori: I/V is conductance, whereas V/I slope of swapped axes is resistance.

Didattica: Read graph axis order before identifying a slope.

Modalità: AI_CONCEPTUAL; esito True; firma 56787fe07c759c2b32155ba63b49a07be186c056f531af443505e483831191e4.

## C4-Q046

Ipotesi: Uniform wire, positive initial geometry and resistivity, resistivity unchanged and material volume conserved, final length doubled.

Derivazione: Conservando il volume materiale, A_f L_f=A_i L_i. A lunghezza doppia corrisponde area dimezzata. Da R=ρL/A, con resistività invariata, R_f/R_i=2/(1/2)=4. Si assume filo omogeneo e stiramento uniforme.

Distrattori: Factor 2 omits area change; positive constant-volume geometry givesfactor 4, not 1/2 or 8.

Didattica: Two multiplicative geometric changes under constant volume.

Modalità: EXACT_ORACLE; esito True; firma 399def81026ded8816a45dd442dd1b7a0cd86d2dd9bd36f8074628abcccc2d80.

## C4-Q047

Ipotesi: Homogeneous wire constitutive law R=rho*l/A identifies material parameter dimensions.

Derivazione: È la resistività. ρ=RA/L ha unità Ω·m; non è la resistenza totale R né la densità di massa, che può usare lo stesso simbolo in altri contesti.

Distrattori: Resistance is ohm, conductance reciprocal ohm, current ampere; rho meaning fixed by context.

Didattica: Material property separated from a particular object resistance.

Modalità: AI_CONCEPTUAL; esito True; firma d5568eecf8fcbf6e1743355276d1b1f760d063301f1a882d8ad39e571593eb92.

## C4-Q048

Ipotesi: Uniform 0.20 m conductor, cross section 2 mm by 0.10 mm, rho 2 e-8 ohm*m at stated temperature.

Derivazione: La sezione è larghezza per spessore: A=(2×10⁻³)(1×10⁻⁴)=2×10⁻⁷ m². R=(2×10⁻⁸)(1/5)/(2×10⁻⁷)=1/50 Ω=0,020 Ω. Si convertono entrambe le dimensioni trasversali prima di moltiplicarle.

Distrattori: 0.002 or 0.20 ohm requires tenfold larger or smaller cross section; two mm dimensions form squared conversion.

Didattica: Correct transverse area and exact fraction rather than binary float answer.

Modalità: EXACT_ORACLE; esito True; firma 4e5f4956281b0c22a267d3f80cce6d797dd6612e74af475363a589410c66d144.

## C4-Q049

Ipotesi: Same component gives two data points; no assumed thermal constancy or interpolation beyond data.

Derivazione: I due rapporti V/I sono 1000 Ω e 1500 Ω, quindi quei due punti non appartengono alla stessa retta ohmica per l’origine con resistenza costante. Non si conclude la causa del cambiamento senza altri dati: può dipendere anche dalle condizioni fisiche del componente.

Distrattori: Secant 2 kΩ is not a common static V/I; data cannot identify a generator or the causal mechanism.

Didattica: Static ratio is distinct from differential/secant resistance and causal diagnosis.

Modalità: AI_CONCEPTUAL; esito True; firma 3ec6962c6df2e9e419645f4fdec7d4876e20da2b8dfa1325a09b66cbe1592784.

## C4-Q050

Ipotesi: Five-second interval with positive-equivalent charges 12 C right and 2 C left; reference right.

Derivazione: La carica netta verso destra è 12−2=10 C. La corrente media orientata è 10/5=2 A; sommare i moduli darebbe un flusso totale non orientato diverso dalla corrente convenzionale richiesta.

Distrattori: 14/5 adds magnitudes;12/5 omits reverse transport;−2 changes orientation.

Didattica: Net signed transport defines average over the whole interval.

Modalità: EXACT_ORACLE; esito True; firma c5ace68da19f0867fe2e83dbb075fc9f86c483c26e0aa9b55d797abb7087fece.
