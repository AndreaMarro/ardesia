# Revisione indipendente freefall-time-022

Revisore AI separato dall'autore B: letti tutti i 16 enunciati, opzioni, blocchi di soluzione, hint/feedback, rispettivi record originali e SVG. Nessun import del modulo autore nell'oracolo, nessuna modifica a candidati, binding o asset. Base autore `96e6fa60`, correzione finale della figura `6277558d1986897f676ccd4f02ca94cf7e30d408` riletta prima della firma finale.

**Esito: 16/16 PASS_AI, nessun finding aperto. DRAFT e HUMAN_APPROVAL_NOT_RUN.** Questo esito non approva pubblicazione o revisioni future; non è review umana né sperimentazione didattica su studenti.

Fonte fissata: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`, SHA-256 file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Ogni `AR-u2-freefall-time-NN` è stato confrontato con l'effettivo `u2-freefall-time-NN` nel Git; hash della sorgente, hash del candidato e provenienza verificati individualmente. I digest per ID sono conservati nel report e nelle firme del verificatore. Campi g assegnati esatti, senza sostituzione implicita di una gravità terrestre.

## Modello indipendente

Da fermo, asse positivo verso l'alto e quota zero al livello d'arrivo: integrare `a_y=−g` dà `v_y=−gt` e `y=h−gt²/2`. Lo zero della posizione ha due radici algebriche; il primo arrivo dopo il rilascio seleziona `T=+sqrt(2h/g)`. h e g sono positivi, campo costante dentro ciascuna prova, niente aria. SymPy risolve il moto e le inverse; Fraction e Pint verificano calcoli e dimensioni. La continuazione della parabola dopo l'arrivo non definisce un altro tempo di primo contatto nel problema assegnato.

## Controlli individuali

| ID finale | Calcolo manuale e risultato | Opzioni, condizioni e significato |
|---|---|---|
| 01 | `2h/g=2×2/1=4 s²`; radice futura `2 s`. `y(1)=2−1/2=3/2 m`, `y(2)=0`. | Radice −2 esclusa come durata dal rilascio; nessuna calcolatrice necessaria. Figura controllata sotto. |
| 02 | Dimensione `L/(L/T²)=T²`, radice `T`; risposta **s**. | m, m/s, m/s² sono altre grandezze; s² è il radicando, non il risultato. Unica unità compatibile. |
| 03 | `mg/m=g`, `3mg/(3m)=g`; stessi dati iniziali e altezza danno `T₃m/T_m=1`. | 3, 1/3, √3, 9 introducono dipendenze dalla massa assenti. Newton con massa inerziale/gravitazionale del modello, niente aria; prerequisito C1-L005 effettivamente presente. |
| 04 | A g=1, `sqrt(2×2)=2 s` e `sqrt(2×8)=4 s`: **raddoppia da2 a4s**. | Quadruplica8, resta2, dimezza, negativo non descrivono le prove. Entrambe ripartono da ferme; non si prolunga una caduta già in moto. |
| 05 | `h=gT²/2=1×4/2=2 m`. | Quadrato dell'intera durata e fattore1/2 conservati; h è dislivello relativo al livello d'arrivo, non quota assoluta senza origine. gT sarebbe velocità. |
| 06 | `g=2h/T²=4/4=1 m/s²`. | g modulo positivo; componente su asse verso l'alto −1m/s². h/T ha dimensione di velocità, diversa dall'accelerazione richiesta. |
| 07 | Stessa h=2: T₁=2s, T₂=`sqrt(4/4)=1s`; rapporto **1/2**. | 1/4 confronta quadrati;2 e4 invertono dipendenza;1 ignora variazione del campo. Nessuna scelta equivalente. |
| 08 | T corretto2s; proposto4s meno corretto2s = **+2s**. | −2 inverte sottrazione;0,+4,+1 non coincidono con lo scarto. Proseguendo formalmente y(4)=−6m, non si ottiene il primo arrivo. |
| 09 | Quadrato T²=2h/g, poi moltiplicare g e dividere2: **h=gT²/2**. | gT² raddoppia h;gT/2 è velocità;T²/(2g) ha dimensione T⁴/L;radice di gT²/2 ha dimensione √L. Sostituzione inversa dà √T²=T sul dominio positivo. |
| 10 | Rapporto dei quadrati κ₁/κ₂, poi radice positiva: **√(κ₁/κ₂)**. | κ₁/κ₂ dimentica radice; prodotto sbaglia effetto del campo;κ₁/√κ₂ dimentica radice sull'altezza;reciproco inverte confronto. Come leggi generali sono distinte anche se coincidono per alcuni fattori particolari. |
| 11 | T₁=2s, T₂=`sqrt(2×1/2)=1s`; rapporto **1/2**. | Rapporto radicandi1/4 distinto;2,1,4 non descrivono insieme h dimezzata e campo doppio. Campi costanti all'interno delle prove. |
| 12 | Media uscite `(2+1)/2=3/2 s`. | 1 e2 ripetono una prova,3 è somma;√2 è uscita sugli ingressi medi h=3/2 e g=3/2. Distinzione esatta:9/4≠2 senza approssimare radicali. |
| 13 | `(T₂/T₁)²=1/4=(h₂/h₁)/(g₂/g₁)=(1/2)/(g₂/g₁)`; rapporto campo **2**. | g₂=2 ricostruisce T₂=1s; campo invariato darebbe √(1/2) del tempo iniziale;4 conterebbe troppo il cambiamento richiesto. |
| 14 | Riferimento T=2s, conteggio6: c=3s⁻¹. Conteggio3 dà T=1s, poi `h=(1/2)×2×1=1 m`. | Conteggi puri, guadagno inverso di tempo, offset nullo. Correzione del display prima di elevare al quadrato; massa non necessaria. |
| 15 | Riferimenti T=2,1s e S=5,3: `c=(5−3)/(2−1)=2 s⁻¹`, d=1. T=(9−1)/2=4s, h=16/2=**8m**. | 2,4,16,32m non ricostruiscono lettura e legge. 4 è il numero della durata;16 omette1/2. Offset non eliminabile con solo rapporto grezzo. |
| 16 | Per ogni λ>0, scegliere g=λm/s² e h=2λm dà `2h/g=4s²`, T=2s. **Infinite coppie positive**. | Nessuna/una/due/tre coppie tutte false: parametro continuo positivo. Il vincolo h=(2s²)g è fra dati iniziali, non un campo variabile lungo la caduta. |

Per ID16 l'oracolo verifica inoltre rango1 del Jacobiano delle due condizioni sul vincolo; la misura di T ripete lo stesso rapporto e non rende identificabili h e g separatamente. Esempi λ=1 e2 danno (h,g)=(2,1),(4,2), entrambi compatibili.

## Figura e finding risolto

`freefall-time-progressive.svg`: SHA-256 finale `6d785e6a36707b5298f39cef5f4643959b357f82301027e0893eb46f38b84e53`. Letto tutto l'XML e visualizzata la geometria in rendering Quick Look locale; upload Base64, byte locali e `/asset/hash` verificati. Questa verifica di immagine non è il test browser completo dei record a tutte le larghezze.

Schema spaziale: rilascio y_svg=150, arrivo310, differenza160px a80px/m →2m. Grafico: scala100px/s,80px/m. Bézier da (100,540), controllo(200,540), fine(300,700): parametro q dà t=2q e y=2−2q²=2−t²/2. Punto intermedio (200,580) → (1s,3/2m), iniziale tangente orizzontale, curva termina al primo zero (2s,0). Verificata l'identità simbolica dell'intera curva, non soltanto tre punti.

Finding di leggibilità segnalato all'autore: label «y=0 · arrivo» attraversata dalla linea del suolo, baseline318 controlinea310. **Risolto da B in6277558d**, spostando soltanto baseline a345; riletto diff e nuovo rendering. Scale, curva, enunciato e chiave invariati. Congelata la nuova firma01 solo dopo la verifica; vecchio pacchetto rifiutato esattamente per01.

## Hash dello snapshot finale

| Artefatto | SHA-256 canonico | SHA-256 byte |
|---|---|---|
| package freefall-time-022.json | `69a8962de9758521331194c2db9a6b20bcfc552b10a1cb0e2917519e731503e7` | `c45c01c50406b468be33f17793b46b45a46140d8fdf107a5d0436599ce75db64` |
| bindings | `89c678b3001cfe075dd21a5f94e317e27f47bedf1989ea0b2a5107da0614933b` | `0194ca2a4a07d781cb6999310f8d7ebc6184bfb7b00ceb78d997a423b2f52225` |
| scientific report | `09cfeabfd17840b3b61c587c0a7de499cf102918cc9a15e8ef4f835220363521` | `5f7659ba90ff52c9da4f75bbabc8d92670b8fdeffd21587ed6c2b85927e26dd5` |

Verificatore `freefall_time_verifier.py` SHA-256 byte `974e3b9fcda3dec043a0036ca01dbce9c0426c93af31d6cadf3dbfb29175c875`.

Controprove eseguite indipendentemente:16/16 chiavi corrette; replay canonico identico; ciascuno dei16 testi alterato con binding aggiornato rifiutato dalla firma; empty/subset/duplicate batch rifiutati; hash di sorgente ribindato rifiutato; vecchio asset/pacchetto01 rifiutato; asset mancante fallisce precisamente01; invarianti DRAFT/NOT_RUN verificate. Firme congelate separatamente dall'assemblaggio autore. Nessuna approvazione umana, pubblicazione o CI/browser completo rivendicati; eventuale rigenerazione del report con contratto condiviso aggiornato va distinta da queste impronte datate.


## Addendum: controprove riproducibili comuni

Eseguito `PYTHONDONTWRITEBYTECODE=1 ../../corpus-venv/bin/python -m unittest discover -s tests/corpus -p test_u2_orbits_freefall.py -v`: **7/7 test PASS (6,350 s)**. Il file copre i cinque lotti021/022/023/025/026, complessivamente80ID: ogni risposta mutata resta un'opzione esistente oppure un numero con unita invariata; si rigenerano binding e token soltanto in memoria e si richiede il FAIL dell'oracolo, senza errore di firma o chiave invalida. Tutte le80controprove PASS. Inoltre80mutazioni dei prompt con solo binding aggiornato vengono rifiutate dal freeze; test di insieme ID, sorgenti, figure, replay e DRAFT/NOT_RUN PASS. Due proprieta fisiche Hypothesis hanno `max_examples=50` ciascuna: comune riscalamento altezza/campo e risultante circolare radiale senza componente tangenziale.

La prima esecuzione aveva6/7PASS: il solo confronto di proprieta nel test generava1.0 con divisione Python contro Integer1; corretto nel test con `sp.Rational`, poi intero file GREEN. Non era un difetto di candidato o dell'oracolo e nessuna firma scientifica e stata cambiata per far passare la prova. SHA-256 del test finale: `c48b7153921ccc28265feb5f32720a940ec65a5ec19367296050a8f276ad15b2`. Nessun file candidato o fonte e stato modificato dai test.
