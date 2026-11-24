# Revisione indipendente freefall-speed-021

Revisore AI separato dall'autore B: letti tutti i 16 enunciati, opzioni presenti, blocchi di soluzione, hint e feedback del pacchetto, l'authoring per confronto editoriale e la figura scientifica; letti i 16 originali pertinenti nel Git fissato. Nessun import dal modulo autore nell'oracolo, nessuna modifica a candidati/binding/asset. Firme congelate soltanto dopo questa lettura, nella versione autore finale `c3d84441` successiva ad `ac9fd49b`.

**Esito: 16/16 PASS_AI, nessun finding aperto. HUMAN_APPROVAL_NOT_RUN; tutti i contenuti restano DRAFT.** Non è un'approvazione umana, una pubblicazione, una calibrazione empirica su studenti o una certificazione dell'intero corpus.

Fonte: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`, SHA-256 file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Verificata la mappa biunivoca `AR-u2-freefall-speed-NN` → `u2-freefall-speed-NN`, digest effettivo di ogni sorgente e candidato e provenienza. I numeri di g sono campi assegnati esatti del modello; non sono presentati come gravità terrestre né sostituiti con 9,8.

## Derivazione e controlli per ID

Oracolo di base indipendente: su asse positivo verso l'alto, integrare `a_y=−g` da fermo dà `v_y=−gt`, `y=H−gt²/2`. Al dislivello positivo h il tempo futuro è `sqrt(2h/g)`, dunque la rapidità è `−v_y=sqrt(2gh)>0`. Il risultato è un modulo, distinto dalla componente verticale negativa. Campo uniforme e costante dentro ogni prova; niente aria, rilascio da fermo, h e g positivi. SymPy elimina il tempo e controlla le identità; Pint/Fraction verifica dimensioni e conversioni esatte.

### 01 — Cadere da fermo per un metro

`2gh=2×2×1=4 m²/s²`, radice positiva 2 m/s; componente finale −2 m/s. Enunciato definisce chiaramente g assegnato, t=0 e verso dell'asse; numerica 2 con unità m/s e tolleranza zero. Non si sceglie la radice negativa per il modulo. PASS.

### 02 — Le unità dopo la radice

`(L/T²)L=L²/T²`, radice `L/T`; unica unità corretta m/s. m è lunghezza, s tempo, m/s² accelerazione, 1 quantità pura: nessun'altra opzione ha la dimensione richiesta. Il numero 2 non introduce unità. PASS.

### 03 — Il modulo della velocità acquistata

Unica relazione universalmente corretta nel dominio positivo: `V=sqrt(2gh)`. `2gh` è V²; `−sqrt(2gh)` è la componente sul particolare asse verso l'alto, non il modulo; `sqrt(gh)` perde il fattore 2; `sqrt(2h/g)` è il tempo, non la rapidità. Soluzione e segni coerenti. PASS.

### 04 — Un campo quattro volte più intenso

Primo arrivo `sqrt(2×2×1)=2 m/s`, secondo `sqrt(2×8×1)=4 m/s`: raddoppia. Quadruplo descrive il quadrato, non il modulo; resta2, dimezza e negativa non soddisfano le due prove. Campo diverso tra prove, costante dentro ciascuna: non si introduce un campo dipendente dalla posizione. PASS.

### 05 — Ricavare il campo dalla rapidità

`g=V²/(2h)=4/(2×1)=2 m/s²`. Quadrato prima della divisione; unità `(m²/s²)/m=m/s²`. g positivo è modulo e non la componente negativa `a_y`. Numero 2 e unità richiesti corretti. PASS.

### 06 — Ricostruire il dislivello percorso

`h=V²/(2g)=4/(2×2)=1 m`. h è dislivello positivo; coordinata finale dipende dall'origine e spostamento su asse verso l'alto è −1 m. Soluzione non confonde le tre quantità. PASS.

### 07 — Un dislivello quadruplo

Rapidità 2 e4 m/s, rapporto V₂/V₁=2. Opzioni 4 e8 sovrastimano il fattore, 1/2 e1/4 invertono o alterano il confronto; nessun duplicato equivalente. Velocità iniziale nulla necessaria alla semplice proporzionalità V²∝h, correttamente dichiarata. PASS.

### 08 — Quota rimasta e dislivello caduto

`v²/v_f²=h/H`, quindi `(1/3)²=1/9`, `h=18/9=2 m`, quota `y=18−2=16 m`. Non serve g numerico, perché lo stesso g positivo si cancella. Opzioni:2m è dislivello già caduto;6m usa erroneamente rapporto lineare;12m sottrae quel falso6;18m è rilascio con velocità zero. Solo16m risponde alla quota residua.

SVG a tre tappe: suolo y_svg=530; rilascio170, punto successivo210, quindi quote360px=18m e320px=16m alla stessa scala20px/m, differenza40px=2m. +y verso l'alto, g verso il basso; t=0 al rilascio; caption e desc coerenti. Elementi XML tutti letti; geometria principale anche visionata in rendering locale Quick Look. Nessuna prova browser completa a tutte le larghezze rivendicata. PASS.

### 09 — L'inversa per il modulo del campo

Quadrato, poi divisione per2h≠0: `g=V²/(2h)`. `V/(2h)` ha T⁻¹; `2h/V²` reciproco dell'accelerazione; `V²h/2` ha dimensione L³/T²; `−V²/(2h)` è negativo e contraddice il modulo richiesto. Unico inverso corretto. PASS.

### 10 — Fattori sotto la radice

Rapporto dei quadrati `κ₁κ₂`, rapporto dei moduli `sqrt(κ₁κ₂)` per positività. Le altre funzioni non sono identità generali: con κ₁=κ₂=4 il rapporto corretto4 differisce da prodotto16, da κ₁sqrtκ₂=8 e da sqrt(κ₁/κ₂)=1; per separarlo dalla semisomma basta κ₁=1,κ₂=4, con2 contro5/2. Coincidenze particolari di alcune opzioni non le rendono la legge generale richiesta. PASS.

### 11 — Cambiano campo e dislivello

Entrambi gli ingressi fattore4: radicando fattore16 e modulo fattore4. Valori2 e8 m/s, rapporto4. Risposta numerica pura, unità1, coerente. PASS.

### 12 — Media di due rapidità di arrivo

Uguali pesi statistici: `(2+8)/2=5 m/s`. Distrattori4 e6 sono altre velocità non uguali alla media;10 omette la divisione;5/2 divide ancora. Distinta dalla media temporale durante le singole cadute: queste ultime sono V_finale/2, cioè1 e4 m/s. I tempi, inferibili da V/g, sono entrambi1s.

**Finding risolto dall'autore in c3d84441:** il vecchio testo diceva che la media di una singola caduta avrebbe richiesto anche il suo intervallo temporale, suggerendo un dato supplementare necessario. Segnalato al root e a B; il candidato non è stato modificato dal revisore. Ora la frase esplicita il diverso oggetto e i valori 1 e 4 m/s senza quel requisito. Riletto il record finale, quindi congelato; controprova sul pacchetto precedente rifiuta proprio ID12 con la nuova firma.

Controllato anche il commento sulle medie degli ingressi: per questa coppia proporzionale `ḡ=5`, `h̄=5/2` dà casualmente `sqrt25=5`. Non è legge generale; con (g,h)=(2,1),(2,4) la media delle uscite è3 mentre uscita sulle medie èsqrt10. PASS dopo correzione.

### 13 — Dislivello necessario nel nuovo campo

V₂/V₁=4 richiede quadrato16; g₂/g₁=4, dunque h₂/h₁=16/4=4. h₂=4m ricostruisce V₂=8m/s, quattro volte2. Numero e unità pura corretti; nessuna radice non perfetta necessaria. PASS.

### 14 — Dal display al campo

Riferimento V=2m/s e conteggio6 danno c=3s/m. Conteggio24 significa8m/s; `g=8²/(2×4)=8 m/s²`. Conteggi S sono puri, guadagno ha dimensione inversa della rapidità; offset nullo esplicitato. Applicare il quadrato al conteggio grezzo avrebbe interpretazione e dimensioni sbagliate. PASS.

### 15 — Due riferimenti per una rapidità

Due velocità fisiche2 e8m/s: `c=(17−5)/(8−2)=2s/m`, `d=5−2×2=1` puro. Nuova velocità `(9−1)/2=4m/s`, g=`16/(2×1)=8m/s²`. Unica opzione8m/s²;2 è g di riferimento,4 può derivare dallo scambio col numero della rapidità,16 dimentica il fattore2h,32 non soddisfa la taratura e legge fisica. Offset non eliminabile con semplice rapporto delle letture. PASS.

### 16 — Vincolo fra i dati delle prove

Coefficiente dimensionalmente esplicito2s⁻²: seleziona g=(2s⁻²)h fra prove, mantenendo g costante dentro ciascuna caduta. `V²=(4s⁻²)h²`, V=2m/s dà h²=1m², dominio h>0 dà1m e g2m/s². −1m è escluso dal dominio;1/2,2,4m darebbero moduli1,4,8m/s invece di2. Non si integra un campo dipendente dalla quota istantanea. PASS.

## Hash e prove

Asset protetto `freefall-speed-height-progressive.svg`: SHA-256 `0bfde22bd943a3af5b11a81a7cf531b96773d2b583ce633b1d54e60d9a61d265`, verificato nei byte locali, upload Base64 e riferimento `/asset/hash`.

| Artefatto finale | SHA-256 canonico | SHA-256 byte |
|---|---|---|
| freefall-speed-021.json | `5b11344f5586a0f7499d9101e450225c84bdb68629325afa3007a74fe0d04a6b` | `2067eaf3183ebe3c36121a294ce61cf55951128c1d6462f415888e1855f2ec77` |
| freefall-speed-021-bindings.json | `9812e4297318e2760aaae277f44e441170365af4dd6061a0fb48932ef55c1f47` | `9fb1632c5b9ac46975a14a48d6ad126f035ad39996187e0aaa83cf49083ba3d3` |
| report editorial/reviews/freefall-speed-021.json | `6c36bd66f07399fd7d1d8f87215f0177e146bdbe714323c43c275595d0b6a883` | `b4da4445441844e0946ff67c7b320deed95e713659db1225f3e0f90b3438946f` |

Verificatore `freefall_speed_verifier.py`: SHA-256 byte `8dd89d2353dbf09af15665aa4db0a08aa80bcd3d454ea9c907ac179bd0e9ef8c`. Le sedici firme individuali nel modulo legano record completo, asset effettivi e identità/hash/ref di origine.

Eseguito indipendentemente:16/16 PASS; replay identico; modifica testo di ciascun candidato con binding rigenerato → FAIL della firma; empty/subset/duplicate batch → eccezione; rebinding source hash → FAIL; pacchetto precedente alla correzione12 → FAIL esattamente12; asset locale mancante → FAIL esattamente08; tutte le dichiarazioni DRAFT/NOT_RUN conservate. Le identità di sorgente sono state confrontate con gli effettivi record Git; non soltanto con le dichiarazioni autore. Nessuna esecuzione browser completa, CI, pubblicazione o approvazione umana attestata da questa nota. I report potranno essere rigenerati dall'integratore con hash del contratto condiviso corrente senza cambiare le firme del contenuto letto.


## Addendum: controprove riproducibili comuni

Eseguito `PYTHONDONTWRITEBYTECODE=1 ../../corpus-venv/bin/python -m unittest discover -s tests/corpus -p test_u2_orbits_freefall.py -v`: **7/7 test PASS (6,350 s)**. Il file copre i cinque lotti021/022/023/025/026, complessivamente80ID: ogni risposta mutata resta un'opzione esistente oppure un numero con unita invariata; si rigenerano binding e token soltanto in memoria e si richiede il FAIL dell'oracolo, senza errore di firma o chiave invalida. Tutte le80controprove PASS. Inoltre80mutazioni dei prompt con solo binding aggiornato vengono rifiutate dal freeze; test di insieme ID, sorgenti, figure, replay e DRAFT/NOT_RUN PASS. Due proprieta fisiche Hypothesis hanno `max_examples=50` ciascuna: comune riscalamento altezza/campo e risultante circolare radiale senza componente tangenziale.

La prima esecuzione aveva6/7PASS: il solo confronto di proprieta nel test generava1.0 con divisione Python contro Integer1; corretto nel test con `sp.Rational`, poi intero file GREEN. Non era un difetto di candidato o dell'oracolo e nessuna firma scientifica e stata cambiata per far passare la prova. SHA-256 del test finale: `c48b7153921ccc28265feb5f32720a940ec65a5ec19367296050a8f276ad15b2`. Nessun file candidato o fonte e stato modificato dai test.
