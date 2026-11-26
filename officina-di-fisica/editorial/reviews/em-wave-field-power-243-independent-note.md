# Revisione indipendente em-wave-field-power-243

Primaria prompt-only 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione cc8048ccac91fc31f3601cb72ac1f579d743dc0c, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L06 copre fase, lunghezze d’onda e potenza dai campi; C5-L07 copre fotoni, tassi e bilancio radiativo, con fondazioni reali L02/L04.

XML and full 640×1480 native read. E upward and B out of plane give rightward Poynting direction; arrows schematic with unlike physical units, not comparative lengths. Peak field 150 V/m withZ 0375 ohm yields 30 W/m² and 100 cm²→1/100 m². Final bars fromx 150 have lengths 30, 240, 135 for 3/10, 12/5, 27/20 W at common 100 coordinates/W. Labels clear and no geometry/unit mismatch.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

Riletto fix 243-06 cc8048cc: 10 cm² resta dimensionalmente un’area ma darebbe P=3/100 W. Strictdiff: solo feedback/error06 e binding, altri15/chiavi/formule/SVG immutati. Il nativo conserva il suo vero ref precedente sui medesimi byte SVG, senza retag.

## AR-u7-em-wave-field-power-01

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Per un’onda piana armonica E₀ è ampiezza di picco. L’intensità media assegnata è E₀²/(2 Z₀), Z₀=375 Ω assunto. E₀=150 V/m dà I=22500/750=30 W/m²; A=100 cm²=1/100 m². P=IA=3/10 W. Nella formula con area numerica in cm² il denominatore è 7 500 000.

Distrattori: 3/5 W omette il 2 medio, 30 W copia il valore di intensità e 3000 W usa 100 m² anziché 100 cm². Dati positivi escludono zero.

Didattica: Legge motivata e unità normalizzate distinte dalle grandezze fisiche.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma cdb35f66820ef21b2ecf262f64fa3bbd1454d604e595ab767c96e55ef0cd3a87.

## AR-u7-em-wave-field-power-02

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: La potenza è energia per tempo e si esprime in watt, W=J/s. Campo elettrico, area e intensità hanno unità diverse.

Distrattori: W/m² è intensità prima dell’area, V/m campo, J energia e 1 numero puro. La media temporale non cambia la dimensione di potenza.

Didattica: Dimensione ricostruita e prefisso distinto dall’unità fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma aacd1f95f9bf8cc12e6a9c886e56c4924c7a68ae3d7176648be0de18a9e2780d.

## AR-u7-em-wave-field-power-03

Ipotesi: Caso autonomo: singola onda piana progressiva nel vuoto, E e B trasversali e ortogonali, E×B nel verso energetico quando i campi non sono nulli. Il nodo temporale non cambia il verso di propagazione.

Derivazione manuale: In un’onda elettromagnetica piana nel vuoto E e B sono ortogonali fra loro e alla direzione di propagazione; E×B indica il verso del flusso energetico. Non sono due campi longitudinali.

Distrattori: E e B sono trasversali e ortogonali, E×B nel verso energetico quando non nulli. Le opzioni longitudinali e verso opposto non valgono per la singola onda piana nel vuoto; campi nulli in un istante non invertono la propagazione.

Didattica: Caso autonomo o legge riconosciuta dalle ipotesi effettive.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 34621a626c66e5e80f2edd9ebf7cd285d61d6b3c1c5f78022ef2221dbd22703c.

## AR-u7-em-wave-field-power-04

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Raddoppiare E₀ da 150 a 300 V/m, a area fissa, quadruplica E₀² e P: da 3/10 a 6/5 W. Il coefficiente un mezzo non si rimuove perché E₀ è di picco.

Distrattori: 3/5 W tratta E linearmente, 3/20 W lo rende inverso, 3/10 W ignora E e 12/5 W cambia anche l’area non modificata qui. Campo doppio dà 6/5 W.

Didattica: Confronto controllato a un solo parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 52fbc2610146f8ca39b614e4b4979a68096af669c4d2625a70301cf1fc4429fe.

## AR-u7-em-wave-field-power-05

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: E₀=√(2 Z₀P/A_SI). Con P=3/10 W e A=1/100 m², E₀²=22500 (V/m)². Ampiezza positiva E₀=150 V/m.

Distrattori: 22500 è il quadrato del valore del campo, −150 viola il picco positivo e 300 V/m dà 6/5 W. Il campo non è il suo valore quadratico.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 370dc65bbc27d2f4d611f3d0ddcac9501ce50b87a0797d3feeddcb53273759a2.

## AR-u7-em-wave-field-power-06

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: A_SI=2 Z₀P/E₀²=750·(3/10)/22500=1/100 m², cioè 100 cm². La conversione d’area è quadratica. Riletto il fix243-06: 10cm² è ancora un’area, ma darebbe soltanto3/100W. Primo testo e formule invariati; cambiato soltanto il feedback e binding. SVG identico, nativo mantenuto sul suo vero ref precedente senza retag.

Distrattori: 1/100 è il numero in m², non cm². Il feedback 06 finale riletto confuta 10 cm² conP 3/100 W invece di attribuirgli unità di lunghezza; 200 cm² dà 3/5 W. Nessuna radice serve per A.

Didattica: Seconda inversa con dominio e unità verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f080b01908a73c94f99dfaf42b42193aababc2063408373a2cc39ce8e2bb48d9.

## AR-u7-em-wave-field-power-07

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: A campo invariato, raddoppiare l’area da 100 a 200 cm² raddoppia P; rapporto 2, nel modello di illuminazione uniforme normale.

Distrattori: 1/2 inverte il confronto, 4 quadra l’area, 1 ignora la variazione e 0 viola positività. L’area è lineare a campo fisso.

Didattica: Due uscite ricostruite prima del rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 9c67d74023db547e465024554ff2dedf3475bd1f82dd37ad8af26c6e71f5bffa.

## AR-u7-em-wave-field-power-08

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Il corretto è 3/10 W e il proposto 3/5 W. Proposto meno corretto=3/10 W positivo.

Distrattori: −3/10 W inverte lo scarto, 2 è rapporto, 3/5 W proposta e 0 l’accetta. La differenza corretta 3/10 W deriva da entrambe le potenze nella stessa unità.

Didattica: Differenza ordinata distinta da un rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f37714b96315ca29c25cd7423612f3c8278cbbc353eb8cb7262bc99a8487e73f.

## AR-u7-em-wave-field-power-09

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Inversa fisica E₀=√(2 Z₀P/A_SI), radice positiva. In valori normalizzati E₀/(V/m)=√[7 500 000 P_W/A_cm²]. Non sommo le due radici di una semplice ampiezza.

Distrattori: 2 Z₀P/A senza radice dà E₀²; omettere il 2 riduce E₀ di√2. A al numeratore modifica le dimensioni e l’ultimo reciproco ha unità inversa di campo.

Didattica: Inversa simbolica con dimensioni e dominio.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma e864adc45d4d787cfafa0bf772c78b5c83489e53234f2127cd7f6a247069fcf9.

## AR-u7-em-wave-field-power-10

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: P_B/P_A=κ₁²κ₂ per ampiezza di campo e area. I fattori sono positivi; non è κ₁κ₂ perché l’intensità è quadratica nell’ampiezza.

Distrattori: κ₁κ₂ perde il quadrato, κ₁/κ₂ inverte l’area, κ₂/κ₁² rende inverso il campo. La somma non restituisce uno per fattori unitari.

Didattica: Fattori inseriti nella legge effettiva, senza analogie improprie.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 26a7de5602f88589a20bac490a974a75262943b4ee60ff990e18cee358e7abaa.

## AR-u7-em-wave-field-power-11

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: A=3/10 W. B=300²·200/7 500 000=12/5 W. Rapporto 8, dato da quattro sul campo e due sull’area.

Distrattori: 1/8 è reciproco, 4 segue solo il campo, 2 solo l’area e 1 ignora entrambi. P 3/10 e 12/5 W danno 8.

Didattica: Entrambi gli ingressi considerati nel nuovo stato.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0f6cdd889f5a58f370fa6e2baf584968045186515e9be6918f79fd892b28cea8.

## AR-u7-em-wave-field-power-12

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Media uscite=(3/10+12/5)/2=27/20 W. Gli ingressi medi E₀=225 V/m e A=150 cm² darebbero 81/80 W. La differenza media uscite meno modello agli ingressi medi è 27/80 W.

Distrattori: 81/80 W è il modello ai dati medi, 27/10 W somma, 21/20 W semidifferenza, 12/5 W solo B. La differenza corretta media uscite meno modello medio è 27/80 W.

Didattica: Media delle uscite distinta dagli ingressi medi.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c8f2166cad88720bf4fb5e9a82ee321ce2b9e63aab109fd97cae7dded995f4d1.

## AR-u7-em-wave-field-power-13

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Target 8, con rapporto di ampiezza 2, richiede rapporto aree 8/2²=2.

Distrattori: 1/2 inverte il rapporto; 8 copia il target e 4 il fattore d’intensità. Area fissa darebbe 4 P_A, non 8 P_A.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ad81c9cfe5f8024e7f4f79f71259eca4b9287df4b8a2f741b063203c8d695767.

## AR-u7-em-wave-field-power-14

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Il riferimento P_A=3/10 W e S_A=9/10 dà guadagno 3 per watt. S=36/5 dà P=12/5 W; A=200 cm² impone E₀²=90000, cioè E₀=300 V/m.

Distrattori: D preso come P darebbe 300√3 V/m e non ricostruirebbe la lettura.150 V/m alla nuova area darebbeP 3/5 W, D 9/5. Il guadagno precede la radice.

Didattica: Taratura rimossa prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma a7391d8c7ffc2fa58617b5aa2e5133395a68f887a7f33a18c380478dc9d20261.

## AR-u7-em-wave-field-power-15

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Riferimenti P_A=3/10 W e P_B=12/5 W. ΔS=21/5 e ΔP=21/10 W danno a=2 per watt, b=1. S_C=17/5 dà P_C=6/5 W; A=100 cm² implica E₀=300 V/m.

Distrattori: Offset ignorato dàP 17/10 W e D 22/5 anziché 17/5. Guadagno ignorato dopo b dà 300√2 V/m; 150 V/m ripete D 8/5. Ramo positivo 300 V/m.

Didattica: Guadagno e offset identificati da due riferimenti distinti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 256b61cca4b8bacfa535a2e3fd05be90e5a3c3ac9f2f69f7f4ff121d34aa4712.

## AR-u7-em-wave-field-power-16

Ipotesi: Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.

Derivazione manuale: Con A numerica in cm² e E₀ numerica in V/m, E₀=(3/2)A. Sostituendo P=3 A³/10 000 000 W. P=3/10 W impone A³=1 000 000; radice cubica positiva A=100 cm² ed E₀=150 V/m. Il vincolo è fra preparazioni e ha coefficiente dimensionato.

Distrattori: −100 cm² viola il dominio; 150 cm² nel vincolo implica 225 V/m e 81/80 W; 10000 cm² implicherebbe potenza 3·10⁵W. Il cubo crescente positivo seleziona 100 cm² una volta sola.

Didattica: Vincolo sostituito prima di decidere numero e dominio delle soluzioni.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 5125369f8cf3d7cfca73011b4e9705b9255177889301320288f033aa8b887713.
