# orthogonal-electric-fields-201 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 200–204 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuits-200-204-primary-source-only.md, SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA b1e53a7b327d73d535357d58b347441a931a8fd0. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-orthogonal-electric-fields-01

Derivazione e calcolo manuale: Sovrapposizione vettoriale: E²=E₁²+E₂² perché il prodotto scalare dei contributi è zero. Con 3 e 4 N/C, E²=9+16=25 (N/C)² e il modulo positivo è 5 N/C. Sommare 3+4 darebbe un risultato valido per contributi paralleli concordi, non per questi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 7 somma, 1 sottrae moduli, 25 copia quadrato e 12 prodotto senza legge vettoriale.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: XML e immagini integrali letti. Primo triangolo cateti 240/320 e diagonale 400, scala 80 unità intrinseche/(N/C), angolo retto e vettori nello stesso punto. Secondo cateti 210/210 con scala 70, diagonale 45°; arco r 60 fra 0 e 45°, non traiettoria. Barre 5/13/9 N/C lunghe 120/312/216 da x 130, fattore 24. Nessuna intersezione residua di label con frecce.

Modalità EXACT_ORACLE. Risultato indipendente: `5`. Firma: `3fd5d250e9950fb6f99efc3a173ca80116e921e4174a314e0eb8beef615c9f5b`.

## AR-u6-orthogonal-electric-fields-02

Derivazione e calcolo manuale: Il modulo della risultante è ancora un campo: N/C, equivalente a V/m. Proiezioni e somma vettoriale conservano la dimensione di campo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: N forza, C carica, J energia, V potenziale; campoN/C=V/m.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `N/C`. Firma: `60fd345acf6937f27b779b396ae2eda255dbcc2150eb93ce9f8837aad0952044`.

## AR-u6-orthogonal-electric-fields-03

Derivazione e calcolo manuale: Dal teorema di Pitagora per componenti ortogonali, E=√(E₁²+E₂²)>0. Entrambi i quadrati hanno unità(N/C)² e la radice restituisceN/C; non occorre conoscere la posizione delle sorgenti per questa somma locale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: Somma/differenza sono collineari, senza radice campo²; √(E₁E₂) non norma vettoriale.

Didattica: Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `E = √(E₁² + E₂²)`. Firma: `1fe09dc762351d126a2ff9f4f354b32f36f604a110968e1583395213346c3796`.

## AR-u6-orthogonal-electric-fields-04

Derivazione e calcolo manuale: A dà 5 N/C. B con E₁=1 ed E₂=4 N/C dà√17 N/C, esatto. Poiché 16<17<25, si ha 4<√17<5 e il campo totale diminuisce. Non si approssima la radice né si forza una terna pitagorica non presente nei dati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 5/3 riduce tutta risultante; 5 ignora modifica, 3 sottrae moduli, 17 omette radice; √17 esatto fra 4 e 5.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 5 a √17 N/C`. Firma: `8d06b0dbcf99c1ab53a8f5978dd59abcaaa7f1c144554eb593f002fe826b7f34`.

## AR-u6-orthogonal-electric-fields-05

Derivazione e calcolo manuale: E₁=√(E²−E₂²), ramo strettamente positivo se E>E₂>0. Con 5 e 4 N/C, E₁=√(25−16)=3 N/C. La radice negativa non è un modulo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 1 sottrae 5−4; 9 omette radice; √41 somma quadrati nell’inversa; negativa non modulo.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `992fcb4c432385097e3009958bdecf591ab49249d0ee1b6ac784ab49dd4898fe`.

## AR-u6-orthogonal-electric-fields-06

Derivazione e calcolo manuale: Caso autonomo di direzione: vettore(3, 3)N/C nel primo quadrante. tanθ=E_y/E_x=1 e 0<θ<90°, quindiθ=45°=π/4 rad rispetto a+x verso+y. Il modulo 3√2 N/C è una grandezza diversa dall’angolo richiesto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 0°/90° ignorano una componente, 180° è−x e 30° non biseca il retto.

Didattica: Seconda inversa o angolo autonomo con dominio e orientazione espliciti.

Figura: XML e immagini integrali letti. Primo triangolo cateti 240/320 e diagonale 400, scala 80 unità intrinseche/(N/C), angolo retto e vettori nello stesso punto. Secondo cateti 210/210 con scala 70, diagonale 45°; arco r 60 fra 0 e 45°, non traiettoria. Barre 5/13/9 N/C lunghe 120/312/216 da x 130, fattore 24. Nessuna intersezione residua di label con frecce.

Modalità EXACT_ORACLE. Risultato indipendente: `45`. Firma: `6c85672435bc366dc0cd5a270e7134549aedae46f8e03d55bbb5a7cd4b6e7dec`.

## AR-u6-orthogonal-electric-fields-07

Derivazione e calcolo manuale: A dà 5 N/C; B con 3 e 1 N/C dà√10 N/C. Rapporto E_B/E_A=√10/5, esatto e minore di 1. Non si riduce il problema al rapporto del soloE₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 1/5 scarta componente 3, 1/2 non ha quadrato 2/5; 2 cresce nonostante norma diminuita; 5/√10 reciproco.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `sqrt(10)/5`. Firma: `c1880fb1633e3bba29642134d53d8c130b2f8184c2c103dd2eb3bee27ab0a862`.

## AR-u6-orthogonal-electric-fields-08

Derivazione e calcolo manuale: Il campo corretto è 5 N/C e la proposta 10 N/C; scarto ordinato=10−5=+5 N/C. Il rapporto 2 è adimensionale e non lo scarto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: −5 inverte, 10 proposta, 0 accetta, 2 rapporto puro.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5`. Firma: `70c6d0a43f37459100d34ef057189347bf81e8da46fbb8bc43fa707ce93195d7`.

## AR-u6-orthogonal-electric-fields-09

Derivazione e calcolo manuale: Isolo E₁²=E²−E₂² e prendo E₁=√(E²−E₂²)>0. La soluzione richiede E>E₂>0; all’uguaglianza il primo modulo sarebbe zero ed è escluso dal dominio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: E−E₂ è caso concorde; somma quadrati non isola; senza radice unità campo² e E₂/E puro.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `E₁ = √(E² − E₂²)`. Firma: `03d436931d00b0c4d74d38a55d237ead8bedbe77dcc3fde562ebaf691243f090`.

## AR-u6-orthogonal-electric-fields-10

Derivazione e calcolo manuale: Inserendo i fattori nei due quadrati: E_B/E_A=√[(κ₁²E₁²+κ₂²E₂²)/(E₁²+E₂²)]. I fattori positivi non permettono di separare una radice di somma in una somma di radici. Un fattore comuneκ dàκ. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: Somma normalizzata non norma; κ devono andare al quadrato; meno non Pitagora; scambiareκ cambia i pesi e non legge generale.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `√(κ₁² a² + κ₂² b²)`. Firma: `5845805d19cbf61f9678d93897c25903e18dea97e5e6d9ce3238e96612aab3b5`.

## AR-u6-orthogonal-electric-fields-11

Derivazione e calcolo manuale: A è la terna 3, 4, 5; B è 5, 12, 13 perché 25+144=169. Rapporto 13/5, adimensionale e non il rapporto delle singole componenti. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 5/13 reciproco; 5/3 soloE₁; 3 soloE₂; 169/25 quadrati delle norme.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `13/5`. Firma: `f44fdf6795321f71c88cae90e21aca510f14f1c1d558a4340d88cfea9a3857b9`.

## AR-u6-orthogonal-electric-fields-12

Derivazione e calcolo manuale: Media delle due letture=(5+13)/2=9 N/C. Ai contributi medi E₁=4, E₂=8 N/C si otterrebbe√80=4√5 N/C; è diverso da 9 perché 80<81. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 4√5 norma alle componenti medie; 18 somma, 4 semidifferenza, 13 solo B.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: XML e immagini integrali letti. Primo triangolo cateti 240/320 e diagonale 400, scala 80 unità intrinseche/(N/C), angolo retto e vettori nello stesso punto. Secondo cateti 210/210 con scala 70, diagonale 45°; arco r 60 fra 0 e 45°, non traiettoria. Barre 5/13/9 N/C lunghe 120/312/216 da x 130, fattore 24. Nessuna intersezione residua di label con frecce.

Modalità EXACT_ORACLE. Risultato indipendente: `9`. Firma: `d456c2e4531d3699f8b6f2418492c420a46146470bb848a16a3d342cb37b942c`.

## AR-u6-orthogonal-electric-fields-13

Derivazione e calcolo manuale: Bersaglio E_B=(13/5)5=13 N/C. Con E₁, B=5 N/C, E₂, B=√(169−25)=12 N/C. Rapporto E₂, B/E₂, A=12/4=3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 1/3 reciproco, 9 quadrati dei cateti; 13/5 norma e 12 catetoB non rapporto.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `a5a3057f30cf8ba839e249c602525b8a30e22ddfaf84ce849a35d366b0dd0640`.

## AR-u6-orthogonal-electric-fields-14

Derivazione e calcolo manuale: A dà 5 N/C e S 15, quindi a=3 nella scala strumentale perN/C. S 39 significa E_B=13 N/C. Con E₂, B=12 N/C, E₁, B=√(169−144)=5 N/C. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 1 sottrae 13−12; 25 copia quadrato; 39 usato comeE conserva erroneamente guadagno.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5`. Firma: `6ecf06818bfa6700b36ac7c3e0bd4a71e16cb2d1563fa6b6bd3cd33f23904938`.

## AR-u6-orthogonal-electric-fields-15

Derivazione e calcolo manuale: Riferimenti 5 e 13 N/C con S 11 e 27 danno a=(27−11)/(13−5)=2, b=1. S 21 decodifica E_C=(21−1)/2=10 N/C. Con E₂, C=8 N/C, E₁, C=√(100−64)=6 N/C. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 2 sottrae 10−8; 10 norma totale; 36 quadrato; √57 dànorma 11 eD23, confutazione esatta.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `38beb99b376961e476ca6ca1360991591bdc4e94910397fa9d0c5e56624eb0fd`.

## AR-u6-orthogonal-electric-fields-16

Derivazione e calcolo manuale: E₁=(3/4)E₂ rende E=√(9/16+1)E₂=(5/4)E₂ per E₂>0. Misura 5 N/C determina E₂=4 N/C e E₁=3 N/C. Unica coppia positiva; non una famiglia libera dopo la misura. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.

Distrattori: 3 altrocateto; 5 norma; −4 escluso; misura fissa scala dopo rapporto.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `3793f54632d70af37f0a8b8255b509b6f2069696276964626c8ac0bf1a995dd4`.
