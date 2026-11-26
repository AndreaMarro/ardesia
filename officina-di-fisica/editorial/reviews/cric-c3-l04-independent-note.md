# Revisione indipendente cric-c3-l04

Dieci problemi distinti, risolti prima delle candidate nella primaria C3 A50 commit030d4658, SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80. Modello realmente eseguito prima dei candidati, SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali 45d53cc0c2443e2aedc5cba3bf163d4dcb7997a8 letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C3-L04 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

XML e nuovo PNG indipendente 640×1500 letti per intero. Il primo pannello è qualitativo: plateau Tfus fra solido e liquido,in ascissa Q e non tempo. La retta di fase è limitata al punto t 167 s,E 13360 J: origine(140,930),punto(474,662.8),2 coordinate/s e 1/50 coordinata/J,dunqueE/t=80 W. Le barre finali 8360/3340/5020 J hanno lunghezze 418/167/251,scala comune 1/20 coordinata/J e 167+251=418. Nessun taglio o contatto residuo; stessa immagine valida soltanto per gli identici SVG prima/dopo followup testuale 34.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Intervalli in kelvin e letture Celsius sono distinti: il confronto di opzioni equivalenti applica l’offset soltanto alle temperature assolute, non agli intervalli. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C3-Q031

Ipotesi: Liquido già alla temperatura di ebollizione; Q 45,2 kJ soltanto vaporizzazione,L 2,26 MJ/kg.

Derivazione: La massa evaporata è m=Q/L. 45,2 kJ/(2260 kJ/kg)=1/50 kg=20 g. Il campione è già al punto di ebollizione e non si aggiunge un tratto di riscaldamento sensibile.

Distrattori: 0,020 g non converte kg→g; 20000 g omette MJ→kJ; QL ha unità diverse da una massa.

Didattica: Massa trasformata e prefissi energetici coerenti.

Modalità: EXACT_ORACLE; esito True; firma 48799ed3b6cd333543cbb2b07ad2dc09949f8ff2288d617baaa4b0973fee448b.

## C3-Q032

Ipotesi: Campione puro chiuso a pressione costante,solido e liquido coesistenti al punto di fusione,energia assorbita.

Derivazione: Aumenta la frazione di fase liquida mentre il solido fonde. L’energia interna cresce nel passaggio assorbente a temperatura costante; non aumenta necessariamente l’energia cinetica media associata alla temperatura.

Distrattori: Nel plateau T non aumenta,massa totale chiusa non cresce,frazione solida cala; potenza non è imposta crescente.

Didattica: Temperatura separata dalla frazione di fase.

Modalità: AI_CONCEPTUAL; esito True; firma dc5f9b45ef6649438311c8a207588a925e03e468de5aafca51fe8ea0e8545b5a.

## C3-Q033

Ipotesi: Vapore che diventa gocce liquide; non un passaggio al solido.

Derivazione: È condensazione. Il vapore passa a liquido cedendo energia latente all’ambiente, a differenza dell’evaporazione.

Distrattori: Fusione parte dal solido,solidificazione termina nel solido,vaporizzazione opposta,sublimazione senza fase liquida.

Didattica: Nome del passaggio con verso fissato.

Modalità: AI_CONCEPTUAL; esito True; firma 360ef1a5b6fda671ce5eb7d8254a370e8fba0ff2961249139cf34f4aae8014b4.

## C3-Q034

Ipotesi: Ghiaccio 40 g già a 0°C,pressione atmosferica,L 334 kJ/kg,potenza netta 80 W costante senza altri scambi.

Derivazione: Per ghiaccio a 0 °C basta il calore latente: Q=(1/25 kg)(334000 J/kg)=13360 J. Alla potenza effettiva 80 J/s, t=13360/80=167 s. Nessuna perdita ulteriore viene sottratta a una potenza già netta.

Distrattori: 13,36 copia coefficiente Q in kJ; omissione g→kg porta durata 1000 volte maggiore; scaldare il liquido dopo è un processo aggiuntivo.

Didattica: Energia latente prima del rapporto con la potenza netta.

Modalità: EXACT_ORACLE; esito True; firma 05db4b1ea4ea5dddd78a7476abc6e5f8855ea694e5f02b952d102fca0fbba160.

## C3-Q035

Ipotesi: Goccia su piastra 22°C,aria che può ricevere vapore; si chiede un meccanismo compatibile senza ebollizione.

Derivazione: È compatibile l’evaporazione dalla superficie a temperatura inferiore all’ebollizione. Non occorre che tutta l’acqua raggiunga il punto di ebollizione per diminuire la massa liquida.

Distrattori: Evaporazione superficiale non richiede bolle; condensazione da sola aggiunge liquido; perdita volume non prova solidificazione.

Didattica: Fenomeno compatibile distinto da inferenza obbligata.

Modalità: AI_CONCEPTUAL; esito True; firma 865ad7660d34ada8859787cae955154a8fd7a564ed934c745fe857ee75335735.

## C3-Q036

Ipotesi: 30 g interamente fusi in 150 s,Pnetta 60 W,plateau a pressione fissa.

Derivazione: Nel plateau la potenza netta va alla fusione: Q=60·150=9000 J. L=9000/(3/100 kg)=300000 J/kg=300 kJ/kg. Il termine sensibile è assente durante il plateau ideale.

Distrattori: 9000 J è Q totale; 300 J/g e 300 kJ/kg sono equivalenti,non due diversi calori latenti.

Didattica: Energia del plateau divisa per la massa effettivamente fusa.

Modalità: EXACT_ORACLE; esito True; firma 6255b07dae14d4613419fc8457393a40ed6cdabafc15a658fd5d113cf6115b77.

## C3-Q037

Ipotesi: Passaggio liquido→solido con cessione di calore latente a pressione costante.

Derivazione: È solidificazione, o congelamento per l’acqua. La cessione di calore latente è compatibile con temperatura costante finché coesistono le fasi nel modello a pressione fissa.

Distrattori: Fusione inversa assorbe calore; condensazione parte dal vapore; evaporazione e sublimazione terminano nel vapore.

Didattica: Segno del calore nel cambiamento di fase.

Modalità: AI_CONCEPTUAL; esito True; firma e959a7462cdc88da706dff11cbd6f40420f54ea64f713240ae4f982f831714e6.

## C3-Q038

Ipotesi: Campione chiuso 120 g inizialmente solido,residuo solido 45 g,percentuale riferita alla massa iniziale.

Derivazione: Si fondono 120−45=75 g. La frazione iniziale trasformata è 75/120=5/8, cioè 62,5%; non si divide per la massa solida finale.

Distrattori: 37,5% è residuo; 75 copia massa fusa in g; 100% ignora residuo; 5/8% perde 100 rispetto a 5/8 come frazione.

Didattica: Percentuale dal residuo e denominatore iniziale.

Modalità: EXACT_ORACLE; esito True; firma c5fbc10eb92d3e274560d2ea41cca3d84c476a2003a70d7fcdcd38c523e44ff6.

## C3-Q039

Ipotesi: Masse uguali di vapore saturo e liquido a 100°C,stesso finale liquido 40°C epressione atmosferica.

Derivazione: Per il vapore compare anche la cessione del calore latente di condensazione mL_v a 100 °C. Dopo la condensazione, il raffreddamento dell’acqua da 100 a 40 °C è lo stesso contributo sensibile che avrebbe la massa inizialmente liquida.

Distrattori: Fasi diverse hanno energie diverse pur a ugualeT; nessun ghiaccio né getto con K assegnata; condensazione è contributo aggiuntivo.

Didattica: Bilancio a tratti con contributo comune esplicitato.

Modalità: AI_CONCEPTUAL; esito True; firma 6fbf1a7571e7c1ff634d9675ab026a096923669501a15011cbc3195efc7771f5.

## C3-Q040

Ipotesi: Acqua 100 g 20°C,ghiaccio 10 g 0°C,isolamento,recipiente trascurabile,L 334 J/g,c 4,18 J/(gK),ramo interamente fuso verificato.

Derivazione: L’acqua può cedere fino a 100·4,18·20=8360 J arrivando a 0 °C; fondere il ghiaccio richiede 10·334=3340 J, quindi tutto il ghiaccio fonde. Restano 5020 J che scaldano 110 g di acqua: θ_f=5020/(110·4,18)=25100/2299 °C. È positiva e minore di 20 °C; nessuna temperatura negativa è compatibile col ramo interamente liquido.

Distrattori: 0°C richiederebbe residuo solido escluso da 8360>3340; 20°C ignora fusione; quoziente raddoppiato non bilancia; negativo non compatibile col ramo liquido.

Didattica: Controllo del ramo prima della temperatura, risultato frazionario esatto.

Modalità: EXACT_ORACLE; esito True; firma c894f4b3385214652e60c7a12181f2c705f9f7a5dc7ff37321a9954d92837a1d.
