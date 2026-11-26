# Revisione indipendente cric-c4-l03

Dieci problemi distinti, risolti prima delle candidate nella primaria C4 Q021-040 commit eaf13e0e0c782adb98d767193e39a35ec3970bab, SHA 16fddaa0a20d4180bd14648b2a47700896a9a77490e80b1daaa92efe189b31c5. Modello realmente eseguito prima dei candidati, SHA fce51a4709cd21f6f8519cad68fdd333123fc0cb14e6ae2c74f1112fc9ece962, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti i 10 record finali 493d3132b8bf706e3a861ad2e8899fa512786f7f letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C4-L03 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

Tre pannelli letti integralmente nel nuovo PNG640×1540: P dista180 coordinate da ciascuna sorgente, per due distanze0.10 m; somma scalare180−90=90 V. Quattro piani a12,8,4,0 V hanno passo100, totale300 per3 cm, con campo verso potenziale minore. Barre ΔU e ΔK partono dalla stessa origine320, hanno lunghezza180 e segni opposti per15 eV; non sono energie assolute. Nessun testo attraversato o tagliato.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Le grandezze orientate, le conversioni dei prefissi e i rapporti puri sono distinti; le opzioni equivalenti sono confrontate con la loro dimensione. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C4-Q021

Ipotesi: Vacuum point charges+2 and−1 nC, equal 0.10 m distance, zero potential at infinity and assigned Coulomb constant.

Derivazione: Il potenziale è una somma scalare con segni, V=k(q₁/r₁+q₂/r₂). Le due distanze uguali danno V=(9×10⁹)(1×10⁻⁹)/(1/10)=90 V. I contributi non vanno composti come vettori.

Distrattori: 270 V adds magnitudes;−90 V omits positive 180 V; zero would require zero charge sum.

Didattica: Signed scalar sum distinguished from vector superposition.

Modalità: EXACT_ORACLE; esito True; firma 6f4e9cb62dc11286348dcc1d81c30b9895637bfeca1417c6cd9f11d18c5c4d4a.

## C4-Q022

Ipotesi: Electrostatic field and equal endpoint potentials on one equipotential surface.

Derivazione: Il lavoro elettrostatico è W=q(V_i−V_f). Sulla stessa superficie equipotenziale la differenza è zero, quindi W=0 anche se la carica ha percorso una distanza non nulla.

Distrattori: Nonzero work needs a nonzero endpoint difference here; path length alone is insufficient.

Didattica: Work of field distinguished from distance or field magnitude.

Modalità: EXACT_ORACLE; esito True; firma b7c9818613b6847736d1e9011d92af20508e1d5b1726889899add272ac7be204.

## C4-Q023

Ipotesi: Potential difference is energy per charge, with SI units.

Derivazione: È il volt: 1 V=1 J/C. Si distingue l’unità del potenziale da quelle di campo o capacità.

Distrattori: Coulomb is charge, joule energy, newton force, ampere current; none equals J/C.

Didattica: Name the derived SI unit.

Modalità: AI_CONCEPTUAL; esito True; firma f7fd1f92255b56f471bddcdc9b5ef4861ce70930e098a440ade95e4e4fd6a431.

## C4-Q024

Ipotesi: Uniform field, distance 0.030 m measured along field, potential difference magnitude 12 V.

Derivazione: Nel campo uniforme la caduta di potenziale lungo il campo ha modulo Ed. Con d=3/100 m, E=12/(3/100)=400 V/m. Il campo punta dal potenziale maggiore al minore.

Distrattori: 4 V/m treats 3 cm as 3 m; multiplication gives wrong dimension.

Didattica: Convert cm before forming a gradient.

Modalità: EXACT_ORACLE; esito True; firma 29e99c68dca404980d467a9cb1b7e6afcadf040018597bd7efecbc621dbaed97.

## C4-Q025

Ipotesi: Distinct fixed charges+q and−q with q positive; midpoint equidistant and potential zero at infinity.

Derivazione: Nel punto medio i potenziali di +q e −q si cancellano, ma i campi si sommano nello stesso verso, dalla carica positiva alla negativa. Si ha V=0 e E non nullo per q non nullo e separazione finita; potenziale nullo non equivale a campo nullo.

Distrattori: Scalar potential cancellation does not cancel the concordant field vectors.

Didattica: Construct a counterexample to V zero implying E zero.

Modalità: AI_CONCEPTUAL; esito True; firma 2c2e63df60b286f4f00584c9ade6696ae14e6f664910978d2dd884b1fa88a062.

## C4-Q026

Ipotesi: Electron charge−e, potential rises from 2 to 17 V, only electrostatic force.

Derivazione: Per l’elettrone q=−e. Il lavoro del campo è −qΔV=e·15 V, perciò l’energia cinetica aumenta di 15 eV. Il segno negativo della carica permette un aumento di K andando a potenziale maggiore.

Distrattori: −15 eV is ΔU;19 adds endpoint potentials rather than subtracting; eV is energy.

Didattica: Charge sign and kinetic/potential changes solved separately.

Modalità: EXACT_ORACLE; esito True; firma 82c8f76fa4b775cc093e69adcc573faba37ab2e18c7fdfad227875dd633108fd.

## C4-Q027

Ipotesi: Fixed source distribution; changing additive potential origin changes no differences.

Derivazione: La parola è riferimento, o zero convenzionale. Fissare V=0 all’infinito sceglie l’origine della scala senza cambiare differenze di potenziale, campo o lavoro fra due punti finiti.

Distrattori: Reference choice is neither a path nor matter transfer and does not null the field.

Didattica: Gauge shift leaves physical differences invariant.

Modalità: AI_CONCEPTUAL; esito True; firma 1a46d1bc5bc370876a4c6484b88477bd9fdbaebda66880b4c2b039f7035dfaf4.

## C4-Q028

Ipotesi: Nonrelativistic particle at rest, mass 2 mg positive, charge+4 microC and potential drop 9 V; only electric work.

Derivazione: La massa è 2,0 mg=2×10⁻⁶ kg. Il campo cede q(V_i−V_f)=(4×10⁻⁶)·9=36×10⁻⁶ J. Da mv²/2=36×10⁻⁶ J segue v²=36 m²/s²; la rapidità finale è la radice positiva, 6 m/s, nel modello classico assegnato.

Distrattori: 36 copies the square of speed; omitting factor 2 gives sqrt 18, not 6; mg must convert to kg.

Didattica: Positive physical root of energy equation, no direction inferred.

Modalità: EXACT_ORACLE; esito True; firma e5cd1f1d4e926413c19729388ee0e8dd5926f78524c4bae44aeee84809c37a29.

## C4-Q029

Ipotesi: Same nonzero potential interval and distances along the field in two regular small regions; compare average gradient.

Derivazione: A parità del salto di potenziale tra linee adiacenti, il campo medio normale è più intenso dove la loro distanza normale è minore, perché il modulo del gradiente è circa |ΔV|/Δs. Non si confronta soltanto il valore assoluto del potenziale.

Distrattori: More distant equipotentials reduce the average field at equal nonzero interval; potential origin irrelevant.

Didattica: Average gradient is explicitly an average over a specified separation.

Modalità: AI_CONCEPTUAL; esito True; firma baad7b71c166e6912cb7d568756482e53b7811dbcd1a2db55ca5be9c6565ec7a.

## C4-Q030

Ipotesi: Four distinct point charges with nonzero charges; pair energy excludes self-energy and reversed duplicates.

Derivazione: Si includono tutte le coppie non ordinate una sola volta: 4·3/2=6 termini. Sommare coppie ordinate conterebbe due volte ciascuna energia; non si includono energie proprie infinite di cariche puntiformi.

Distrattori: 12 double-counts ordered pairs;4 counts particles rather than pairs.

Didattica: Manual enumeration 3+2+1 verifies combinatorial expression.

Modalità: EXACT_ORACLE; esito True; firma fcf57b002741aa155f0dc4f22a627174876097dc9050dbc38c892de7474e410e.
