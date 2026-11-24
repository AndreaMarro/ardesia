# Note d’autore — caduta libera e quota massima 021–023

48 riscritture complete, tutte DRAFT. Queste note riportano calcoli proposti e
scelte editoriali dell’autore; non costituiscono revisione scientifica indipendente,
non assegnano PASS né firme e lasciano approvazione umana NOT_RUN. I giudizi del
reviewer, se prodotti separatamente, devono essere legati alla precisa edizione
finale e non vengono attribuiti a queste note d’autore.

Fonte letta individualmente per tutti i48ID: commit immutabile
`5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`.
Questo shard è U2-02, distinto da U2-01 dei precedenti lotti. I nomi effettivi
freefall-speed, freefall-time e vertical-maximum01..16 coincidono con il mandato.
Ogni binding conserva SHA normalizzate di sorgente, candidato e provenienza, il
percorso esatto U2-02, il compito cognitivo originale e gli asset collegati.

I dati sorgente già consentono calcoli manuali esatti: g=1,2,4,8m/s² nei casi
assegnati, radici di quadrati perfetti e frazioni. Sono stati **mantenuti** questi
moduli di campi didattici assegnati: non si è sostituito g con9,8 o10 né presentato
il modello come una misura del campo terrestre. Nel problema021-08 g non è
numericamente necessario e viene eliminato dal rapporto. In tutte le prove il
campo è uniforme e costante durante il singolo moto, senza resistenza dell’aria.
I vincoli fra dati di prove non descrivono campi variabili durante una caduta.

Si riusa l’assembly esistente con il parametro source_path U2-02. Nessuna seconda
pipeline, authority o pubblicazione. Lezioni e prerequisiti sono quelli presenti:
C1-L004 per la cinematica accelerata, C1-L001/L002/L003 come prerequisiti; la
spiegazione sulla massa in022-03 richiama anche C1-L005 per la seconda legge.
Nessun ID vertical-flight o projectile né famiglie circolari è stato modificato.

## Rapidità acquistata — freefall-speed-021

Con asse verticale positivo verso l’alto, aᵧ=−g e Δy=−h. Il corpo parte da fermo;
vᵧ²=2aᵧΔy=2gh. V=√(2gh)>0 è il modulo finale, mentre la componente finale su
quell’asse è negativa. h è dislivello caduto e non quota residua sopra il suolo.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-freefall-speed-01 | g2m/s²,h1m: V²=4m²/s²,V2m/s; componente vᵧ=−2m/s. T=0 è il rilascio da fermo. |
| u2-freefall-speed-02 | [2gh]=L²/T²; la radice restituisce L/T, unitàm/s. Modulo non significa numero puro. |
| u2-freefall-speed-03 | V=√(2gh), ramo positivo. La radice negativa rappresenterebbe una componente discendente, non il modulo; √(2h/g) è tempo. |
| u2-freefall-speed-04 | g2→8 a h1 fisso: V²4→16, V2→4m/s. Campo quadruplo produce rapidità doppia. |
| u2-freefall-speed-05 | g=V²/(2h)=4/(2·1)=2m/s². Si isola il modulo dopo il quadrato. |
| u2-freefall-speed-06 | h=V²/(2g)=4/4=1m; con asse verso l’alto lo spostamento è−1m. |
| u2-freefall-speed-07 | h1→4 con g2 fisso: rapportoV₂/V₁=√4=2, non4. |
| u2-freefall-speed-08 | H18m,v/v_f=1/3: h/H=(1/3)²=1/9,h2m; quota residua y=H−h=16m. Il campo si cancella, nessuna approssimazione. |
| u2-freefall-speed-09 | Inversa g=V²/(2h)>0. V/(2h) non ha unità di accelerazione e il reciproco cambia dimensione. |
| u2-freefall-speed-10 | V₂/V₁=√(κ₁κ₂), da rapporto dei quadratiκ₁κ₂ con fattori positivi. |
| u2-freefall-speed-11 | (g,h)=(2,1)→(8,4)nelle unitàSI: V2→8m/s, rapporto4. Radicando4→64, radici perfette. |
| u2-freefall-speed-12 | Media delle rapidità finali2e8m/s=5m/s. Medie temporali interne alle singole cadute invece1e4m/s, metà dei rispettivi finali. Ingressi medi5e5/2 danno qui ancora5 per coppie proporzionali, senza linearità generale. |
| u2-freefall-speed-13 | Rapidità finale×4 richiede V²×16;g×4 ⇒ h×4. |
| u2-freefall-speed-14 | c=6/(2m/s)=3s/m;S24→V8m/s;h4m⇒g=64/8=8m/s². |
| u2-freefall-speed-15 | Riferimenti V2,8m/s,letture5,17⇒c2s/m,d1;S9→V4m/s;h1m⇒g8m/s². |
| u2-freefall-speed-16 | Vincolo fra dati g=(2s⁻²)h;V²=(4s⁻²)h²;V2m/s⇒h²1m²⇒h1m,g2m/s². Campo costante in ogni prova, non proporzionale alla quota istantanea. |

Finding pedagogico ricevuto sul12 prima del congelamento: la prima versione
affermava che per una media temporale del singolo moto sarebbe servito anche
l’intervallo. In questo modello l’intervallo è inferibile e la media temporale
si ricava già come V_finale/2. La frase è stata sostituita in c3d84441 dopo
ac9fd49b con i valori espliciti1e4m/s, distinti dalla media5dei finali. Nessuna
chiave o asset è cambiato; il record12 e il binding sono stati rigenerati e inviati
al reviewer per rilettura. Non si ricicla una firma vecchia su quel testo nuovo.

L’SVG del problema08 confronta due istanti, con origine al suolo e scala comune
20px/m. Quota iniziale18m:360px sopra il suolo; caduta2m:40px; quota rimasta16m:320px.
La freccia g indica solo il verso del campo non assegnato numericamente. L’asse
+y punta verso l’alto e il rilascio è marcato t=0. Il disegno non confonde il
rapporto delle rapidità con il rapporto lineare delle quote.

## Tempo di caduta — freefall-time-022

Il tempo zero è il rilascio da fermo. Con y=0 al livello di arrivo, y(t)=h−gt²/2.
Per h,g>0 il primo arrivo futuro è T=√(2h/g)>0. L’altra radice non è una durata
fisica; il grafico non viene prolungato nel terreno dopo il livello di arrivo.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-freefall-time-01 | h2m,g1m/s²: T²4s²,T2s; radice−2s esclusa. Campo didattico assegnato esatto. |
| u2-freefall-time-02 | [2h/g]=T², radice⇒T;unitàs distinta da s² del radicando. |
| u2-freefall-time-03 | Massem,3m con stesse condizioni iniziali e stesso g: T₃m/T_m=1. Peso triplo e massa inerziale tripla danno la stessa accelerazione; senza aria non compare la massa nel tempo. |
| u2-freefall-time-04 | h2→8m con g1: T2→4s, raddoppio per altezza quadrupla. |
| u2-freefall-time-05 | h=gT²/2=(1/2)·1·2²=2m. Non gT, che avrebbe unità di velocità. |
| u2-freefall-time-06 | g=2h/T²=4/4=1m/s², modulo positivo; componente verso l’alto−1m/s². |
| u2-freefall-time-07 | g1→4 con h2m fisso: tempi2→1s, rapporto1/2. |
| u2-freefall-time-08 | Radicando4s²⇒T2s;proposta4s⇒scarto+2s. Non confondere T² con T. |
| u2-freefall-time-09 | Quadrato T²=2h/g, poi h=gT²/2. Sul dominio T>0 l’inversa riproduce il ramo scelto. |
| u2-freefall-time-10 | T₂/T₁=√(κ₁/κ₂), fattore dell’altezza al numeratore e del campo al denominatore. |
| u2-freefall-time-11 | (h,g)=(2,1)→(1,2)nelle unitàSI: T2→1s, rapporto1/2; radicandi4e1. |
| u2-freefall-time-12 | Media dei tempi2e1s=3/2s; sui dati medi h=g=3/2 nelle rispettive unità si ottiene√2s, diverso perché9/4≠2. Nessun decimale necessario. |
| u2-freefall-time-13 | T×1/2⇒T²×1/4;h×1/2 richiede g×2. Nuovih1m,g2m/s²⇒T1s. |
| u2-freefall-time-14 | c=6/(2s)=3s⁻¹;S3→T1s;g2m/s²⇒h=gT²/2=1m. |
| u2-freefall-time-15 | Riferimenti T2,1s,letture5,3⇒c2s⁻¹,d1;S9→T4s;g1m/s²⇒h8m. Guadagno dal rapporto di differenze coerenti. |
| u2-freefall-time-16 | Vincolo iniziale h=(2s²)g implica giàT²4s² eT2s: infinite coppie positive. Esempig1/h2 e g2/h4 nelle unità assegnate. |

SVG: prima tappa spaziale2m=160px, poi grafico con100px/s e80px/m. Per g1 e h2,
y(0)=2m,y(1s)=3/2m,y(2s)=0. La Bézier M100,540 Q200,540 300,700 ha ascissa lineare
nel parametro e ordinata quadratica: rappresenta esattamente y=2−t²/2 nelle scale
dichiarate, con tangente iniziale orizzontale. Mostra soltanto fino al primo arrivo.

## Guadagno massimo di quota — vertical-maximum-023

Lancio verticale verso l’alto, senza aria, con g uniforme costante e y positivo
verso l’alto. u(t)=v₀−gt si annulla all’apice futuro T=v₀/g; H=y_apice−y_lancio è
il guadagno e non una quota assoluta. Dall’area positiva u–t o dalla legge senza
tempo si ottiene H=v₀²/(2g). u=0 all’apice non implica accelerazione nulla.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-vertical-maximum-01 | v₀2m/s,g2m/s²: T1s,H=(1/2)2·1=1m. All’apice aᵧ resta−2m/s²; origine di quota al lancio. |
| u2-vertical-maximum-02 | H ha dimensione(L²/T²)/(L/T²)=L,unitàm. |
| u2-vertical-maximum-03 | 0=v₀²−2gH⇒H=v₀²/(2g). v₀/g è tempo e g/(2v₀²)lunghezza inversa. |
| u2-vertical-maximum-04 | v₀2→4 a g2 fisso⇒H1→4m. Raddoppiano durata e velocità media nella sola salita. |
| u2-vertical-maximum-05 | v₀²=2gH=4m²/s²⇒v₀2m/s, ramo iniziale verso l’alto. |
| u2-vertical-maximum-06 | g=v₀²/(2H)=4/2=2m/s². Non dedurre g0 da u0 all’apice. |
| u2-vertical-maximum-07 | v₀=2 m/s fisso, g=2→4 m/s²⇒H1→1/2m,rapporto1/2 positivo. |
| u2-vertical-maximum-08 | PropostaH2m,corretto1m⇒scarto+1m; rettangolo con v₀ invariata raddoppierebbe l’area. |
| u2-vertical-maximum-09 | v₀=√(2gH)>0; radice negativa non è il lancio verso l’alto richiesto. √(2H/g) è tempo. |
| u2-vertical-maximum-10 | H₂/H₁=κ₁²/κ₂, distinto daκ₁/κ₂ del tempo di salita. |
| u2-vertical-maximum-11 | (v₀,g)=(2,2)→(4,4)nelle unitàSI: H1→2m,rapporto2. T è1s in entrambe ma cambia la velocità media. |
| u2-vertical-maximum-12 | Media H1e2m=3/2m. Ingressi medi3e3 danno qui stesso risultato per Tcostante lungo il confronto; nessuna regola generale di scambio fra media e legge. |
| u2-vertical-maximum-13 | v₀raddoppia⇒fattore4 nel numeratore;Hrichiestofattore2⇒g₂/g₁=2. |
| u2-vertical-maximum-14 | c3m⁻¹;S6→H2m;g4⇒v₀²16m²/s²⇒v₀4m/s. |
| u2-vertical-maximum-15 | RiferimentiH1,2m eS3,5⇒c2m⁻¹,d1;S9→H4m;g2⇒v₀4m/s. |
| u2-vertical-maximum-16 | v₀=cg,c1s: H=c²g/2;H1m⇒g2m/s²,v₀2m/s,T1s. Vincolo fra dati selezionati, campo non variabile durante la salita. |

L’asset distingue tre rappresentazioni. Schema spaziale relativo al lancio:
120px/m, un metro di salita. Grafico u–t:160px/s e80px/(m/s), base1s e altezza2m/s,
areaH1m. Grafico z=y−y₀ contro t:160px/s e160px/m. La Bézier M100,1210 Q180,1050
260,1050 rappresenta esattamente z=2t−t² per0≤t≤1 nelle scale dichiarate; la tangente
all’apice è orizzontale. È mostrata soltanto la salita. La gravità resta−g anche
all’apice e non viene nascosta dalla velocità nulla.

## Controlli tecnici d’autore e limiti

`freefall-vertical-b-021-023-structural.json` documenta soltanto identità, assembly
e importazione canonica.48ID unici, esattamente assegnati,16per famiglia. Pacchetti
e binding rigenerati con identici byte normalizzati. Verificati hash sorgente,
candidato, provenienza e asset, con source_path corretto U2-02 per tutte le schede.

Importazione tramite l’adapter esistente in SQLite temporaneo:16bozze per lotto;
ripetizione0nuove revisioni e16invariate per lotto; tutti i48head nuovi senza live.
I991 materiali pubblicati conservano identici byte prima e dopo, digest
`99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee`.
Guardia comune dei soli letterali nelle scelte usata in sola lettura sui31record
a scelta: nessuna equivalenza numerica riconosciuta duplicata. È un controllo
limitato, non una review matematica o semantica dei distrattori.

Nessun verificatore proprio aggiunto per questi48ID e nessuna auto-firma. Nessuna
modifica a registro, checkpoint, altri autori, famiglie circolari, vertical-flight
o projectile. Nessun push o merge dell’autore. Browser, integrazione complessiva,
CI e fasi umane sono distinte dai controlli locali qui descritti.

Prossimi passi del coordinatore/reviewer:

1. Completare la rilettura indipendente dei48ID e legare i risultati ai byte finali,
   conservando il finding e la correzione del12 di021.
2. Controllare lettore a320px, formule e tre SVG; ogni modifica della presentazione
   richiede nuovo binding e rilettura della parte modificata.
3. Integrare i soli commit assegnati, ripetere importazione e gate sulla SHA risultante,
   mantenere DRAFT e risposte storiche inalterate.
4. Tenere approvazione umana e validazione reale con studenti esplicitamente NOT_RUN
   fino alle rispettive evidenze; nessun controllo tecnico le sostituisce.

Correzione di leggibilità rilevata dal reviewer sul rendering SVG: la scritta
y=0/arrivo di022 e lancio/t=0 di023 incrociavano la linea orizzontale di riferimento.
Spostate soltanto le due etichette sotto la linea, rispettivamente baseline345e378;
nessun punto, curva, scala, enunciato o risposta cambiato. Asset, pacchetti e binding01
rigenerati; ripetuti rigenerazione e import temporanei16/0revisioni per entrambi,
pubblicati invariati e nessun nuovo live. Il reviewer deve rileggere gli asset
finali prima di congelare le firme interessate.
