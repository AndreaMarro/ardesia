# Note d’autore — vettori 007–009

48 riscritture individuali, tutte DRAFT. Queste note espongono i calcoli proposti
dall’autore e le scelte editoriali: **non sono una revisione indipendente**, non
assegnano PASS scientifici e non contengono firme di reviewer. Revisione umana
NOT_RUN. Le verifiche indipendenti, se eseguite altrove, devono riferirsi ai byte
finali e non sono attribuite a queste note.

Sorgente immutabile: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, percorso
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`.
I 48 ID sorgente esistono esattamente come assegnati. Sono stati letti per ID,
con consegna, risposta e compito cognitivo, preservando le eccezioni concettuali.
Gli ID candidati sono `AR-<sourceId>`; ogni binding conserva hash normalizzato
sorgente, candidato e provenienza, oltre agli hash degli asset usati dalla scheda.
Il campo `sourceReasoningTask` conserva il compito originale.

Il solo helper aggiunto assembla le schede usando `pipeline` e `units_authoring`:
non è un motore di verifica, importazione o pubblicazione. L’importazione resta
`draft_import.import_drafts` sopra l’importatore editoriale canonico. Nessuna
modifica al registro, checkpoint, contenuto pubblicato o esami.

## Prodotto vettoriale — vector-product-007

Salvo l’ID 06, si chiede un modulo con vettori adimensionali perpendicolari:
C=ab sin90°=ab, con a,b>0. L’area del parallelogramma è una rappresentazione
geometrica: non assegna m² a vettori adimensionali. La figura distingue il caso
a=b=2 (C=4) dal caso orientato A=2eₓ,B=3eᵧ (modulo 6).

| ID sorgente | Calcolo d’autore / attenzione per la review |
| --- | --- |
| u1-vector-product-01 | 2·2=4; due righe per due celle. Distinguere modulo da componente. |
| u1-vector-product-02 | [A][B]sinθ=1·1·1=1. Il testo ora dichiara esplicitamente che i vettori sono adimensionali. |
| u1-vector-product-03 | C=ab; zero sarebbe il prodotto scalare perpendicolare, √(a²+b²) il modulo della somma. |
| u1-vector-product-04 | C₁=4,C₂=8, rapporto 2; si raddoppia soltanto a. |
| u1-vector-product-05 | C=ab ⇒ C/b=a, 4/2=2. Segnalata coincidenza numerica della sottrazione 4−2, che non rende valida quella procedura. |
| u1-vector-product-06 | In terna destrorsa eₓ×eᵧ=e_z; B×A=−6e_z, componente z=−6, modulo 6. |
| u1-vector-product-07 | C₂/C₁=8/4=2; non rispondere col valore finale 8. |
| u1-vector-product-08 | Proposto meno corretto: 8−4=+4. Il segno dello scarto non indica il verso del vettore. |
| u1-vector-product-09 | a=C/b, b>0; sostituzione (C/b)b=C. |
| u1-vector-product-10 | C₂/C₁=(κ₁a)(κ₂b)/(ab)=κ₁κ₂; angolo fissato. |
| u1-vector-product-11 | 16/4=4, due raddoppi moltiplicati. |
| u1-vector-product-12 | Media (4+16)/2=10; prodotto degli ingressi medi 3·3=9 è un altro calcolo. |
| u1-vector-product-13 | 4=2(b₂/b₁) ⇒ b₂/b₁=2; b₂=4, C₂=16. |
| u1-vector-product-14 | g=12/4=3; C=48/3=16; a=16/4=4; controllo 3·4·4=48. |
| u1-vector-product-15 | g=(33−9)/(16−4)=2; d=1; C=(17−1)/2=8; a=8/2=4. |
| u1-vector-product-16 | a=b ⇒ b²=4 ⇒ b=2, radice positiva; senza il vincolo resterebbero molte coppie. |

Correzione ricevuta dalla review di figura: la prima versione aveva frecce con
scale diverse e un rettangolo 2×2 non quadrato. La versione corretta usa A=B=120px
nel primo caso e A=100px,B=150px nel secondo (scala comune 50px/unità). La didascalia
ora conta quattro tappe. Questo cambiamento ha richiesto nuovi hash asset e schede.

## Proiezione — vector-projection-008

P è la componente orientata di uno spostamento e R il suo modulo, in metri.
La legge P=R cosθ deriva dal cateto adiacente nel triangolo rettangolo. Per gli
esercizi con c=cosθ acuto vale R>0,0<c<1; l’eccezione 03 usa esplicitamente 120°.
La figura usa una scala comune 30px/m in tutti e tre i pannelli, anche quando il
modulo passa da 4 m a 10 m.

| ID sorgente | Calcolo d’autore / attenzione per la review |
| --- | --- |
| u1-vector-projection-01 | θ=60°, cosθ=1/2; P=4m·1/2=2m. Cateto adiacente, non opposto. |
| u1-vector-projection-02 | [P]=[R]·1=L. Il testo ora identifica uno spostamento in metri anziché chiedere un’unità senza definirne la grandezza. |
| u1-vector-projection-03 | R=10m a120°, P=10m·(−1/2)=−5m. È stata esplicitata l’unità fisica che il sorgente non indicava. |
| u1-vector-projection-04 | c fisso: P da2m a4m, fattore2. |
| u1-vector-projection-05 | R=P/c=2m/(1/2)=4m; controllo |P|≤R. |
| u1-vector-projection-06 | c=P/R=2m/4m=1/2, numero puro; riconoscibile60° senza calcolare inversa trigonometrica. |
| u1-vector-projection-07 | c₂/c₁=(3/4)/(1/2)=3/2; P da2m a3m, senza cercare i due angoli. |
| u1-vector-projection-08 | P corretto2m, scarto4m−2m=+2m. |
| u1-vector-projection-09 | R=P/c, con c>0; dimensione di lunghezza conservata. |
| u1-vector-projection-10 | P₂/P₁=κ₁κ₂; aggiunto vincolo esplicito0<κ₂c<1 perché un fattore positivo da solo non garantisce un coseno acuto. |
| u1-vector-projection-11 | P₁=2m,P₂=6m, rapporto3=2·3/2. |
| u1-vector-projection-12 | Media (2m+6m)/2=4m; prodotto degli ingressi medi 6m·5/8=15/4m diverso. |
| u1-vector-projection-13 | 3=2(c₂/c₁) ⇒ rapporto3/2; c₂=3/4 ammissibile; P₂=6m. |
| u1-vector-projection-14 | S conteggio: g=6/(2m)=3m⁻¹; P=18/g=6m; R=6m·4/3=8m. |
| u1-vector-projection-15 | g=(13−5)/(6m−2m)=2m⁻¹,d=1; P=(9−1)/g=4m; R=8m. |
| u1-vector-projection-16 | Vincolo reso dimensionale R=(8m)c; 2m=(8m)c² ⇒ c²=1/4 ⇒ c=1/2. Radice negativa fuori dominio. |

Le risposte frazionarie sono opzioni testuali esatte, così non si attribuisce al
grader numerico esistente la capacità di valutare espressioni simboliche.

## Pendenza e trigonometria — vector-angle-ratio-009

Nel primo quadrante a,b>0 sono componenti di spostamento in metri, θ è misurato
rispetto a+x e T=b/a è adimensionale. Non occorre calcolare arctan per rispondere.
L’ID03 conserva il diverso esercizio su seno/coseno nel triangolo3–4–5 in centimetri;
la figura lo sviluppa in tre tappe con scala comune40px/cm. L’ID16 conserva il
problema di indeterminazione, non lo trasforma in una falsa soluzione unica.

| ID sorgente | Calcolo d’autore / attenzione per la review |
| --- | --- |
| u1-vector-angle-ratio-01 | T=2m/2m=1, direzione45°; non richiede il modulo. |
| u1-vector-angle-ratio-02 | [T]=L/L=1; il grado esprime θ, non tanθ. |
| u1-vector-angle-ratio-03 | a=√(25−9)cm=4cm; sinθ=3/5,cosθ=4/5; controllo9/25+16/25=1. |
| u1-vector-angle-ratio-04 | b fisso: T₁=1,T₂=1/2; aumenta il denominatore, pendenza dimezzata. |
| u1-vector-angle-ratio-05 | T=b/a ⇒ Ta=b ⇒ a=b/T=2m. |
| u1-vector-angle-ratio-06 | b=Ta=2m. Spiegata la coincidenza con a/T quando T=1 e fornita controprovaT=2. |
| u1-vector-angle-ratio-07 | T₂/T₁=2; tangente può superare1, a differenza di seno/coseno. |
| u1-vector-angle-ratio-08 | T corretto1; proposto2 meno1 dà+1, senza metri. |
| u1-vector-angle-ratio-09 | a=b/T; prima moltiplicazione per a, poi divisione per T>0. |
| u1-vector-angle-ratio-10 | T₂/T₁=κ₂/κ₁; fattori uguali conservano direzione, pur cambiando modulo. |
| u1-vector-angle-ratio-11 | T₁=1,T₂=4/6=2/3; rapporto2/3, non3/2 né6. |
| u1-vector-angle-ratio-12 | Media(1+2/3)/2=5/6; rapporto componenti medie3m/4m=3/4 è diverso. |
| u1-vector-angle-ratio-13 | 2/3=(b₂/b₁)/3 ⇒ b₂/b₁=2; b₂=4m. |
| u1-vector-angle-ratio-14 | g=3; T=2/3; a=4m/(2/3)=6m; semplificare4con2 prima del prodotto. |
| u1-vector-angle-ratio-15 | ΔS=−2/3,ΔT=−1/3 ⇒ g=2,d=1; T=(2−1)/2=1/2; a=4m. |
| u1-vector-angle-ratio-16 | a=b=λ>0 ⇒ T=1 per ogniλ; infinite coppie con direzione45° e scala libera. |

Nel testo dell’asset03 le unità di Pitagora sono esplicite sui due termini:
a²=(5cm)²−(3cm)²; il risultato intermedio è16cm². Il numero è riconoscibile a mente
tramite la triade pitagorica e non richiede approssimazioni di radici o angoli.

## Verifiche tecniche d’autore e limiti

Il file `vector-b-007-009-structural.json` documenta esclusivamente:

- rigenerazione identica dei tre pacchetti e binding;
- 16 ID unici per famiglia e corrispondenza dei48 ID assegnati;
- corrispondenza SHA-256 di fonte, candidato, provenienza e dati degli asset;
- importazione tramite l’adapter canonico in un SQLite temporaneo:16 nuove bozze
  per lotto, poi0 nuove revisioni e16 invariate per lotto;
- tutti i48 head nuovi senza versione live; i991 materiali pubblicati hanno
  identici byte normalizzati prima e dopo, digest
  `99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee`.

Questi esiti non provano correttezza scientifica indipendente, accessibilità reale,
comprensione con studenti o approvazione umana. Nessuna seconda pipeline, test
scientifico d’autore con pretesa d’indipendenza o auto-firma è stata aggiunta.
Il primo tentativo di assemblaggio ha incontrato il Python di sistema senza SymPy;
la produzione finale e i controlli usano il venv condiviso indicato dal coordinatore.
Un venv locale non versionato era stato preparato prima di ricevere quel percorso.

Prossimi passi, di competenza del coordinatore/reviewer:

1. Rileggere i byte finali dei tre pacchetti e le eccezioni06/03/03/16 sopra indicate;
   accettazione: review individuali legate agli hash, senza riciclare firme vecchie.
2. Integrare i soli commit d’autore nel branch canonico assegnato; controllare
   ownership, importazione complessiva e riproducibilità con gli altri lotti.
3. Verificare nel lettore canonico formule e figure a320px e i percorsi adattivi;
   accettazione: nessuna perdita di passaggi, segni, didascalie o unità.
4. Mantenere revisione e approvazione umana separate dalle verifiche tecniche;
   nessun rilascio della banca DRAFT deriva da questa consegna.
