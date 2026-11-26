# Revisione indipendente cric-c4-l01

Dieci problemi distinti, risolti prima delle candidate nella primaria C4 Q001–020 commit 719bbd0f, SHA 34337ec50e90ae61e6a447c62a98c698bf14a4bc47b24f92586a6e4bcd27f6ea. Modello realmente eseguito prima dei candidati, SHA 5162581bc4dc366e2a1fe26c00966661f1eae97cba671a8081a1a938cd00bc3a, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali ae71218fa00fd87106584987dcf55d3330e07c7b letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C4-L01 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

Complete native 640 by 1540 and XML read. Three symbolic electron groups each denote 10000, not single particles. Point separations 80 and 240 represent 4 and 12 cm at common scale; reciprocal-force arrows have coordinate lengths 90 and 10, ratio nine, and are drawn after the small point markers so the full paths remain visible. Four separate arrow paths carry their own tips. All labels, signs and isolation boundary are readable. The two final charge labels sum to -2.5 nC.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Cariche con segno, conversioni dei prefissi e rapporti puri sono distinti; le opzioni equivalenti sono confrontate con la loro dimensione. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C4-Q001

Ipotesi: Initially neutral droplet, ordinary electron transfer, assigned elementary charge 1.60 e-19 C; final net negative charge−4.80 fC.

Derivazione: La carica negativa indica elettroni acquistati. Il numero è |Q|/e=(4,80×10⁻¹⁵)/(1,60×10⁻¹⁹)=3×10⁴=30000, conteggio intero positivo. Il segno della carica non rende negativo il numero di elettroni.

Distrattori: Negative particle count rejected;3000 gives−0.480 fC,300000 gives−48 fC; powers of ten checked.

Didattica: Integer count and sign of a charge are different quantities.

Modalità: EXACT_ORACLE; esito True; firma 5086c3ec3d32b3c9b25df301adb0883dcbf7d6c26935256d8f94656469d3dd30.

## C4-Q002

Ipotesi: Fixed nonzero point sources+q,+3 q, isolated from other sources; reciprocal forces act on different objects.

Derivazione: Le forze reciproche hanno lo stesso modulo e versi opposti, agendo su oggetti diversi. La diversa carica non produce un diverso modulo dell’interazione reciproca; masse differenti potrebbero invece dare accelerazioni differenti.

Distrattori: Charge ratio does not set reciprocal-force ratio; equal geometric direction is not equal sense; masses needed for accelerations.

Didattica: Action and reaction cannot cancel within one body force diagram.

Modalità: AI_CONCEPTUAL; esito True; firma 6619752fafe935fa6590c08a63733fb83c32a7953c444b0a02a081521e3b5df3.

## C4-Q003

Ipotesi: SI prefix is a dimensionless scale factor 10⁻⁹, independent of charge sign.

Derivazione: Il prefisso è nano. La conversione è 1 nC=10⁻⁹ C; un prefisso non cambia il segno della carica.

Distrattori: micro,pico,femto,milli correspond to different exact powers, not another spelling of nano.

Didattica: Prefix knowledge separated from sign and base unit.

Modalità: AI_CONCEPTUAL; esito True; firma 9bc9d1c0f676ee5828a2334627450235a20f1d1f89ed7737e5ff3a1d605d8b9f.

## C4-Q004

Ipotesi: Same nonzero point charges in vacuum, positive distances, force magnitude targetF/9.

Derivazione: Con cariche invariate F è proporzionale a 1/r². Per F_f/F_i=1/9 la distanza deve triplicare: r_f=3·4=12 cm. Il rapporto richiede cariche non nulle, come implicato dalla repulsione assegnata.

Distrattori: 36 cm givesF/81; decreasing distance increases magnitude; negative root is not a positive separation.

Didattica: Square-root inverse with a physical positive branch.

Modalità: EXACT_ORACLE; esito True; firma d149cc8a16749ed5abddc6a2eb28cde776cfa453da04a2fcf145cbb5d37eb3ef.

## C4-Q005

Ipotesi: Electrically isolated two-object system, total−2.5 nC, one object+1.2 nC; signed charge conservation.

Derivazione: La conservazione della carica dà Q₂=Q_tot−Q₁=−2,5−1,2=−3,7 nC. Le cariche vanno sommate con segno, non come moduli.

Distrattori: −1.3 nC sums with+1.2 to−0.1 nC; positive alternatives give positive totals; total copied to second omits first charge.

Didattica: Signed conservation before numerical subtraction.

Modalità: EXACT_ORACLE; esito True; firma 45894e9ebd68b1e7b78ce95ec40142f6ab6c72b7dcf9121c4be6fec096d22bf1.

## C4-Q006

Ipotesi: Far observation, nonzero net charge and explicitly dominant monopole contribution; size small relative to distance.

Derivazione: Il punto di osservazione deve essere molto più lontano dell’estensione del corpo, r molto maggiore della dimensione caratteristica. Con carica netta non nulla domina il termine monopolare lontano; non basta essere appena fuori dalla superficie.

Distrattori: Inside/near sources is not the far regime; net zero removes monopole; spherical boundary alone does not impose symmetric charge distribution.

Didattica: Conditions of a point approximation separated from shape alone.

Modalità: AI_CONCEPTUAL; esito True; firma 67736fa4c520263f179a63f89ca8188f78f6b8904e8192c5d4a6b0f606d41c8b.

## C4-Q007

Ipotesi: Opposite-sign stationary point charges in the electrostatic model.

Derivazione: La forza è attrattiva. La legge di Coulomb fra cariche ferme di segno opposto dirige ciascuna forza verso l’altra carica.

Distrattori: Like-sign sources repel; opposite signs do not cancel both bodies; electrostatic force follows the joining line.

Didattica: Interaction sign separated from force magnitude.

Modalità: AI_CONCEPTUAL; esito True; firma 4047dbe02aec5261b713c4ef0e8581ab1df9fa3482fe53269dc4411b2bdb81e5.

## C4-Q008

Ipotesi: Same medium, nonzero initial charges; one charge tripled and positive separation doubled.

Derivazione: Il prodotto delle cariche acquista fattore 3 e il quadrato della distanza fattore 4. F_f/F_i=3/4, assumendo cariche puntiformi ferme e mezzo invariato.

Distrattori: 3/2 uses a first power of distance;3 omits distance;4/3 reverses ratio;12 multiplies rather than divides by four.

Didattica: Independent numerator and squared-denominator scalings.

Modalità: EXACT_ORACLE; esito True; firma 9e7db4cd0278c2775b8941d46d964224c1ec534d0159be3b390e09975a532f88.

## C4-Q009

Ipotesi: Ordinary rubbing of initially neutral material, no nuclear transformations; electron transfer.

Derivazione: È coerente una perdita netta di elettroni da parte dell’oggetto. In questo modello ordinario lo strofinio trasferisce elettroni e la positività non richiede creazione di protoni.

Distrattori: Gaining electrons gives negative charge; nuclei/neutrons do not change in the ordinary rubbing preparation.

Didattica: Microscopic carrier transfer distinguished from nuclear change.

Modalità: AI_CONCEPTUAL; esito True; firma 3e57141fb950f77c6b9a9ef4ea583a17c8a0a6fcb2afae8c2e73a748ba031e10.

## C4-Q010

Ipotesi: Vacuum point charges, positive known source 2 nC, attractive force 9μN at 0.20 m, assignedk 9 e 9 SI; sign determined separately.

Derivazione: Essendo attrattiva con prima carica positiva, q₂ è negativa. Il modulo è Fr²/(kq₁)=(9×10⁻⁶)(1/25)/[(9×10⁹)(2×10⁻⁹)]=2×10⁻⁸ C=20 nC. Dunque q₂=−20 nC. Il k assegnato è parametro del calcolo, non una costante arrotondata da reinterpretare.

Distrattori: +20 nC repels;−2 nC gives 0.9μN and−200 nC gives 90μN; inverse uses radius squared and SI prefixes.

Didattica: Sign and magnitude solved in different steps and checked inversely.

Modalità: EXACT_ORACLE; esito True; firma 7a4f9dca9013565939b7632cb3b27bf3d62b076cbb1f0d3e8a735777aea2b3a5.
