# capacitor-charge-sharing-223 — revisione indipendente per ID

Primaria completa degli 80 originali220–224 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-capacitor-networks-220-224-primary-source-only.md, SHA256 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58. Le riformulazioni finali sono state risolte nuovamente sui dati effettivi. Implementazione dei modelli indipendenti SHA85dad5e28940ee486e847302a0d2a0d5fc88925e17115e897e3b5fb43184e35a scritta dopo la prima lettura testuale220–222 a partire dalla primaria già congelata: il codice non è dichiarato fonte-only precedente ai candidati. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 351f28ae64d0a66d79ca010abbd51ef7bfa6ce63. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-capacitor-charge-sharing-01

Derivazione e calcolo manuale: Il generatore è stato rimosso. La carica totale del nodo positivo è C₀ V₀ e nello stato finale vale (C₀+C)V_f; quindi V_f=C₀ V₀/(C₀+C). Con C₀=2 μF, V₀=6 V e C=2 μF risulta 3 V. Lo stato assestato presuppone il transitorio dissipativo; non conservo l’energia del solo campo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Sei volt imporrebbe il generatore ancora collegato. Dodici copia una carica in μC come tensione; 3/2 V divide due volte e zero confonde il nodo positivo con la carica netta complessiva.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: XML e native indipendente completo 640×1580 letti. Prima: barra carica 12 μC lunga 360 da x 150, scala 30 coordinate/μC; secondo elemento scarico è punto allo zero. Circuito finale con entrambi i rami agli stessi nodi, cariche 6+6 μC e tensione comune 3 V. Ultime uscite 3/4/7/2 V in barre 240/320/280 da x 150, scala 80 coordinate/V. Origini fuori dagli assi, tutte label leggibili; scala delle cariche distinta da quella delle tensioni.

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `1b3c22aacaff7c255de9f776d214c8966e2a9bff8b1fc70c04262e24d52687ec`.

## AR-u6-capacitor-charge-sharing-02

Derivazione e calcolo manuale: La grandezza finale è una differenza di potenziale, dunque volt. Nella formula il rapporto di capacità è puro e moltiplica V₀. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: C, F, J e 1 indicano carica, capacità, energia e rapporto puro. Q divisa per la capacità totale ha unità volt.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `V`. Firma: `dc97d2e67e6564816f223fd5ceead4750db8f7cca27ca448f4afcc5aa3a42e05`.

## AR-u6-capacitor-charge-sharing-03

Derivazione e calcolo manuale: Conservo la carica del conduttore formato unendo le armature concordi: C₀ V₀=(C₀+C)V_f. Il secondo elemento inizialmente scarico contribuisce alla capacità finale ma non alla carica iniziale. Per C, C₀, V₀ positivi segue 0<V_f<V₀. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: V₀ invariata richiederebbe un generatore oppure C=0, escluso. La frazione inversa supera V₀. Usare C al numeratore assegna carica iniziale al condensatore scarico; (C₀+C)V₀ è una carica.

Didattica: Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti.

Figura: XML e native indipendente completo 640×1580 letti. Prima: barra carica 12 μC lunga 360 da x 150, scala 30 coordinate/μC; secondo elemento scarico è punto allo zero. Circuito finale con entrambi i rami agli stessi nodi, cariche 6+6 μC e tensione comune 3 V. Ultime uscite 3/4/7/2 V in barre 240/320/280 da x 150, scala 80 coordinate/V. Origini fuori dagli assi, tutte label leggibili; scala delle cariche distinta da quella delle tensioni.

Modalità AI_CONCEPTUAL. Risultato indipendente: `V_f = C₀ V₀ / (C₀ + C)`. Firma: `f14342df25070bfc44775d626b6b04a7047b4b9bcc6497fb20a4167b73d71ff9`.

## AR-u6-capacitor-charge-sharing-04

Derivazione e calcolo manuale: Portare V₀ da 6 a 8 V, con entrambe le capacità 2 μF, cambia V_f da 3 a 4 V: la dipendenza da V₀ è lineare a capacità fissate. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Otto volt copia l’ingresso B; tre ignora il cambiamento, 3/2 dimezza ancora e sei copia l’ingresso A. La capacità finale resta 4 μF ma la carica iniziale cambia fra preparazioni.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 3 a 4 V`. Firma: `816034de1162c6d24db19ffbd1624f140e3691cd2e5d0d1d978985745984e5bc`.

## AR-u6-capacitor-charge-sharing-05

Derivazione e calcolo manuale: Ricavo la tensione iniziale da V₀=V_f(C₀+C)/C₀. Con V_f=3 V, C=C₀=2 μF, ottengo 6 V. Non basta copiare la tensione dopo la redistribuzione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Tre volt copia la tensione finale; 3/2 V ripete la frazione diretta e darebbe V_f=3/4 V. Dodici volt copia il numero della carica iniziale e darebbe V_f=6 V.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `18f31907d423853083f24dd524fdd1bff4a70575450e57b1a12f091ca469932e`.

## AR-u6-capacitor-charge-sharing-06

Derivazione e calcolo manuale: Ricavo C=C₀(V₀/V_f−1). Con C₀=2 μF, V₀=6 V e V_f=3 V trovo 2 μF. Per il secondo elemento positivo finito il dominio è 0<V_f<V₀; al bordo V_f=V₀ l’elemento aggiunto avrebbe C=0. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Quattro μF omette il termine meno uno e darebbe V_f=2 V. Un μF darebbe V_f=4 V. Il confine V_f=V₀ impone C=0, fuori dal modello con secondo componente positivo.

Didattica: Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `b859d2d86e57ec59e9ac412b7069fb00db0b16d31c62202ac8c2300101bfd28d`.

## AR-u6-capacitor-charge-sharing-07

Derivazione e calcolo manuale: Riducendo C da 2 a 1 μF, V_f=2·6/3=4 V. Il rapporto rispetto ai 3 V iniziali è 4/3: minore capacità totale a carica iniziale fissata produce maggiore tensione finale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: 3/4 è il reciproco. Due usa erroneamente solo 1/C e omette C₀; un mezzo segue C direttamente e uno ignora il cambiamento. I quattro volt restano sotto i sei volt iniziali.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `26cf4e0a356ef93627ac28a5079f4ebc202804bb29db570abe4cd3c58c544824`.

## AR-u6-capacitor-charge-sharing-08

Derivazione e calcolo manuale: La proposta 6 V meno la soluzione 3 V dà +3 V. Il segno dipende dall’ordine assegnato, non da una convenzione sulla carica delle armature. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: −3 V scambia l’ordine dello scarto; sei copia la proposta e zero la accetta. Due è un rapporto puro e non una differenza di tensioni.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `daca7bb343966bd965a0b9b860dfd969ff0a4fbac44d0f27e8b390da74961c1a`.

## AR-u6-capacitor-charge-sharing-09

Derivazione e calcolo manuale: L’inversa per V₀ è V₀=V_f(1+C/C₀). Il fattore è maggiore di uno e adimensionale; la tensione iniziale deve superare quella finale nel modello con il secondo condensatore inizialmente scarico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: La frazione inversa errata riduce V₀ invece di ricostruirla. C/C₀ omette l’addendo fisso. Gli ultimi quozienti hanno unità F/V e V/F, diverse dal volt.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `V₀ = V_f (C₀ + C) / C₀`. Firma: `84b6edc8e0bf11de37af87de7ced2b1b80d70d0a0a0eedc00bd19b722f6387da`.

## AR-u6-capacitor-charge-sharing-10

Derivazione e calcolo manuale: C₀ rimane fissata. Se V₀, B=κ₁ V₀, A e C_B=κ₂ C_A, il rapporto V_f, B/V_f, A è κ₁(C₀+C_A)/(C₀+κ₂ C_A). Non si scala anche C₀ senza che il testo lo dica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: κ₂ al numeratore scala l’ingresso sbagliato. Il prodotto perde il denominatore, il reciproco inverte B/A e κ₁/κ₂ ignora il termine C₀ che resta fissato.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁ S / S_B`. Firma: `caf16fe3b70caef0313a76aeae5fdafaf0eea739aa4d3d7bc2ec8c0b9901a96c`.

## AR-u6-capacitor-charge-sharing-11

Derivazione e calcolo manuale: La prova A dà 3 V. In B V₀=12 V e C=4 μF: V_f=2·12/6=4 V. Il rapporto di uscite è 4/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: 3/4 è il reciproco; due segue soltanto V₀. Un mezzo usa 1/C ignorando C₀ e uno presume una compensazione impedita dal termine fisso della capacità iniziale.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4/3`. Firma: `3ff79e8fc93429014b0b5ad1b22575b9ef1234e97eca10662a7e8b5033bb6f2d`.

## AR-u6-capacitor-charge-sharing-12

Derivazione e calcolo manuale: La media delle tensioni finali è (3+4)/2=7/2 V. Gli ingressi medi V₀=9 V e C=3 μF darebbero 18/5 V; la differenza media delle uscite meno uscita agli ingressi medi è −1/10 V. La legge contiene un denominatore variabile. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: 18/5 V usa gli ingressi medi. Sette somma le uscite, un mezzo è la semidifferenza e quattro ripete B. La differenza rispetto ai dati medi è 1/10 V, calcolata esattamente.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: XML e native indipendente completo 640×1580 letti. Prima: barra carica 12 μC lunga 360 da x 150, scala 30 coordinate/μC; secondo elemento scarico è punto allo zero. Circuito finale con entrambi i rami agli stessi nodi, cariche 6+6 μC e tensione comune 3 V. Ultime uscite 3/4/7/2 V in barre 240/320/280 da x 150, scala 80 coordinate/V. Origini fuori dagli assi, tutte label leggibili; scala delle cariche distinta da quella delle tensioni.

Modalità EXACT_ORACLE. Risultato indipendente: `7/2`. Firma: `6996c3aece447990aef9bb7c051bb19938b0153d5af91ae7d1108e2ab21647b3`.

## AR-u6-capacitor-charge-sharing-13

Derivazione e calcolo manuale: Il rapporto 4/3 applicato ai 3 V di A impone V_f, B=4 V. Con V₀, B=12 V, C_B=2(12/4−1)=4 μF. Rispetto ai 2 μF di A, il fattore è 2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Un mezzo inverte il rapporto; 4/3 copia quello delle tensioni finali e 3/4 il suo reciproco. Quattro copia il valore numerico di C_B in μF senza normalizzarlo ai 2 μF iniziali.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `2d3fa13fe843f7ff85dbbdc125b28a6cfe9dd204fb99d8edf4455aabfb7a0903`.

## AR-u6-capacitor-charge-sharing-14

Derivazione e calcolo manuale: La taratura D=aV_f ha a=9/(3 V)=3 V⁻¹. D_B=12 significa V_f, B=4 V. Con C_B=4 μF, V₀, B=4(2+4)/2=12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: Quattro volt copia la tensione finale. Trentasei usa D=12 come tensione finale e ricostruisce D=36; otto volt darebbe D=8. La coincidenza numerica fra D=12 e V₀=12 V è contingente.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `12`. Firma: `dd67d0fb4879c8fd382e30f58522f9d22c419d9d65e06b141c391bd7552e1a4d`.

## AR-u6-capacitor-charge-sharing-15

Derivazione e calcolo manuale: I riferimenti 3 V→7 e 4 V→9 fissano a=2 V⁻¹ e b=1. D_C=13 significa V_f, C=6 V. Con C_C=3 μF si richiede V₀, C=6(2+3)/2=15 V, superiore a quella finale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: 65/4 V omette l’offset e ricostruisce D=14. Sei volt copia V_f; trenta omette il guadagno e tredici copia la lettura strumentale. Ogni esito è confutato reinserendolo nella legge.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `15`. Firma: `a17e91bb71b4df35924f103447b30203f83a3674415e47acea3ea3abfd300140`.

## AR-u6-capacitor-charge-sharing-16

Derivazione e calcolo manuale: Pongo c=C/(1 μF)>0. Il vincolo V₀=(3 V/μF)C dà V₀/(1 V)=3 c, quindi V_f/(1 V)=6 c/(2+c). Il dato 3 V impone 6 c=3(2+c), da cui c=2 e V₀=6 V. Una sola coppia positiva, senza radici spurie. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.

Distrattori: C=1 μF darebbe V_f=2 V e C=3 μF darebbe 18/5 V. −2 μF viola la positività e annulla il denominatore. Infinite soluzioni non seguono da questo vincolo con C₀ fissato.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `ccc3941cf7b511d122521368f8ca06d5595ee29b65854a7bc639395751cc508a`.
