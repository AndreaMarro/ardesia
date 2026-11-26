# Revisione indipendente cric-c3-l01

Dieci problemi distinti, risolti prima delle candidate nella primaria C3 A50 commit030d4658, SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80. Modello realmente eseguito prima dei candidati, SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali 119fd8a8b73803079ffb50c04e6aa808bd974f3e letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C3-L01 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

XML e nuovo PNG indipendente 640×1480 letti per intero. Il vapore attraversa il confine del liquido; il calore è un possibile apporto dal fornello. Barre Kelvin da origine x 140,lunghezze 150/300 per 300/600 K,scala comune 1/2 coordinata/K. Ultimo pannello: stati 0/1/2 a x 180/330/480,non tempi; ordinate 1120/1168/1240 con scala 12 coordinate/K e letture 35/31/25°C,calo 48/72 per 4/6 K. Il tratto visibile dell’asse Celsius è troncato,senza etichetta 0: non viene assunto zero Celsius all’incrocio degli assi. Nessun contatto o taglio residuo. Asset byte-identico tra cf 9 d 08 ac e finale 119 fd 8 a 8; la ricevuta di rendering mantiene il suo riferimento originale,non viene ritaggata.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Intervalli in kelvin e letture Celsius sono distinti: il confronto di opzioni equivalenti applica l’offset soltanto alle temperature assolute, non agli intervalli. Le risposte numeric JSON devono essere interi esatti; i due risultati frazionari finali sono stringhe di scelta, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C3-Q001

Ipotesi: Liquido rimasto come sistema; vapore attraversa il confine; apporto termico possibile, non vincolo adiabatico.

Derivazione: L’acqua liquida rimasta è un sistema aperto: la massa attraversa il confine trasformandosi in vapore, ed energia può entrare dalla sorgente di calore o uscire con la materia. La pentola scoperta non rende il liquido un sistema isolato.

Distrattori: Chiuso conserva materia, isolato anche energia; il sistema aperto ha un confine e l’ebollizione non impone adiabaticità.

Didattica: Scelta esplicita del sistema prima della classificazione.

Modalità: AI_CONCEPTUAL; esito True; firma cf940f42c935399820666028585fccddc1b0f53cd502eee4f385733edb71cbf2.

## C3-Q002

Ipotesi: 311 K iniziali, lettura finale 20°C, offset esatto 273,15; variazione finale meno iniziale, non modulo.

Derivazione: Converto soltanto la lettura finale: 20,0 °C corrisponde a 293,15 K. La differenza finale meno iniziale è 293,15−311=−17,85 K=−357/20 K. Un intervallo in kelvin non richiede un secondo offset.

Distrattori: +17,85 K perde il segno; −291 K mescola scale; 293,15 K e 311 K copiano letture degli estremi, non la variazione.

Didattica: Due scale di lettura, una sola differenza con segno.

Modalità: EXACT_ORACLE; esito True; firma 2d3f6236dbefd43c992d7e7b52fdffb518da390ab6c5a0aaecdefddf488aae61.

## C3-Q003

Ipotesi: Temperatura di equilibrio come funzione di stato; confronto dello stesso stato finale, non di un qualunque processo.

Derivazione: La parola è stato. Una funzione di stato dipende dagli estremi termodinamici e non dal percorso; calore e lavoro sono invece trasferimenti dipendenti dal processo.

Distrattori: Cammino esprime la dipendenza esclusa; calore e lavoro sono trasferimenti; tempo trascorso non completa funzione di stato.

Didattica: Funzione di stato distinta dal percorso e dai trasferimenti.

Modalità: AI_CONCEPTUAL; esito True; firma 43637b26ca66cb42f9d9e0b894c1e1af1ac60e91cb3be7731c29b26748ae0629.

## C3-Q004

Ipotesi: Due blocchi con uguale T, isolati dal resto, senza reazioni, transizioni di fase o lavoro.

Derivazione: Alla medesima temperatura iniziale non vi è un gradiente termico che provochi un flusso netto di calore fra i due blocchi. Non si può dedurre uguaglianza di energia interna o capacità termica da quella sola uguaglianza; si assumono assenza di reazioni e altri processi.

Distrattori: Uguale T non implica uguale U; massa maggiore non genera da sola un diverso equilibrio; moto molecolare non si annulla.

Didattica: Equilibrio termico distinto da energia interna e moto microscopico.

Modalità: AI_CONCEPTUAL; esito True; firma 2e17edb6fd8193be3a6077d9242d51c85da4e44f66467734dcf3466de0bd3d52.

## C3-Q005

Ipotesi: Lettura iniziale 26,85°C, rapporto 2 applicato a T assoluta; ritorno finale a lettura Celsius.

Derivazione: 26,85 °C+273,15 K danno 300 K. Raddoppiare la temperatura assoluta porta a 600 K, quindi la nuova lettura Celsius è 600−273,15=326,85 °C. Non si raddoppia direttamente il numero Celsius.

Distrattori: 53,70°C raddoppia la lettura; 600°C scambia unità senza offset; 26,85°C resta iniziale; 300°C copia il coefficiente Kelvin iniziale.

Didattica: Rapporto Kelvin prima dell’offset finale; scelte lessicali esatte.

Modalità: EXACT_ORACLE; esito True; firma ccbe9155697f38548dacd189b14ab8c67daa8d5c16e6831e6ca891eb588a88a0.

## C3-Q006

Ipotesi: Forza normale media complessiva su area positiva, gas nel modello di pressione macroscopica.

Derivazione: È la pressione. Nel modello uniforme la forza normale complessiva divisa per l’area ha unità N/m²=Pa; una pressione non è la forza totale.

Distrattori: Temperatura, volume e moli hanno altre unità; forza tangenziale non è pressione e forza sola manca della divisione per area.

Didattica: Unità SI e componente normale della forza.

Modalità: AI_CONCEPTUAL; esito True; firma f205bb81eba0aa71f65e4cf5e903f1e20f6124a5256af40296a996556e8c2169.

## C3-Q007

Ipotesi: Gas uniforme diviso idealmente in volumi uguali, stesso stato intensivo e stessa composizione.

Derivazione: Una proprietà estensiva si dimezza: per esempio la quantità di sostanza, la massa, il numero di particelle, il volume o l’energia interna dello stesso gas uniforme. Pressione, temperatura e densità restano intensive. Senza alternative il prompt non identifica una sola proprietà estensiva; la futura scelta va valutata nel suo contesto.

Distrattori: p,T,ρ e c specifico restano intensivi; capacità totale sarebbe estensiva ma non è l’opzione data.

Didattica: Classificazione estensiva/intensiva con alternativa unica verificata.

Modalità: AI_CONCEPTUAL; esito True; firma bb987fbacc1c1abe285027779b0bf8baca579b69338c3c3d14addbf734346e80.

## C3-Q008

Ipotesi: Due cali successivi 4 K e 6 K, lettura iniziale 35°C; nessuna durata attribuita agli stati.

Derivazione: Gli intervalli 4 K e 6 K valgono rispettivamente 4 e 6 gradi Celsius. Sottraggo complessivamente 10 alla lettura iniziale: 35−4−6=25 °C. Non si aggiunge 273,15 agli intervalli.

Distrattori: 31°C omette il secondo calo; 29°C omette il primo; 45°C somma un aumento; gli offset non si sommano agli intervalli.

Didattica: Accumulo di intervalli, senza confonderli con temperature assolute.

Modalità: EXACT_ORACLE; esito True; firma 7126193e9ab6b2d16957e516f6a1dca139c2f3eaa78ebe14f2399f2f5fe73008.

## C3-Q009

Ipotesi: Campione descritto a pressione macroscopica uniforme solo dopo smorzamento dei transitori ed equilibrio.

Derivazione: Durante le onde di pressione non è definita una pressione uniforme d’equilibrio per tutto il gas. Occorre attendere il rilassamento meccanico, dopo avere fissato i vincoli, fino a un nuovo equilibrio; non basta mediare una lettura locale istantanea.

Distrattori: Una misura locale transiente non descrive necessariamente tutto il gas; rapido non implica isobaro; sommare pressioni spaziali non dà lo stato uniforme.

Didattica: Una grandezza d’equilibrio non è una media arbitraria di transitori.

Modalità: AI_CONCEPTUAL; esito True; firma ced53389919205748e25efcc0ef137391d6bd56935e377a7e0a2b4d5ac3e7af5.

## C3-Q010

Ipotesi: Vincolo adiabatico sulla parete mobile: Q attraverso la parete nullo, lavoro non escluso.

Derivazione: La parete è adiabatica: impedisce il trasferimento di energia come calore. Può muoversi e consentire lavoro meccanico, dunque adiabatica non significa immobile o isolata da ogni trasferimento energetico.

Distrattori: Diatermica permette calore; rigida riguarda il movimento; temperatura costante e permeabilità alla materia non seguono da Q=0.

Didattica: Calore, lavoro e materia sono vincoli indipendenti del confine.

Modalità: AI_CONCEPTUAL; esito True; firma 10520167530fb33b5ef0d8b6d03f6950754069ac4fc54728aacc7921446e5f3c.
