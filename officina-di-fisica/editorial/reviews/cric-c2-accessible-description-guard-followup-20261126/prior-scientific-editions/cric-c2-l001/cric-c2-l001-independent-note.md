# Revisione indipendente cric-c2-l001

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in 9dc54dba, SHA 34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; modello realmente eseguito prima dei candidati in e37686ebab9f1ac50919592f189ab8cf7f37184f, SHA 02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali af6a3adeecb2946e79aca6e8509c23b4bd0afe85 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C2-L001 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente640×1430 letti integralmente sui byte finali af6a3ade. Primo pannello forza normale45N e area0,015m², quoziente dimensionato corretto e risultato3kPa; nessuna scala condivisa con le prove successive. Secondo:rettangoli con stessa profondità70 e larghezze80/240, aree4/12cm² in rapporto3; vettori della stessa forza entrambi lunghi80 e pressioni18/6kPa inversamente proporzionali. Terzo:asseV9coordinate/mL,assemassa5coordinate/g; punti(20mL,20g) e(40mL,40g) sulla retta dalla stessa origine,ρ=1g/mL. Titoli, unità e zero visibili, nessun contatto o taglio residuo rilevato.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C2-Q001

Ipotesi: Liquido ordinario e solido nel campo elastico, piccolo sforzo tangenziale costante e non nullo; confronto fra risposta persistente e statica.

Derivazione manuale: Un liquido ordinario non sostiene staticamente un taglio persistente non nullo: continua a deformarsi. Un solido elastico può equilibrarlo con deformazione finita; la proprietà distingue il comportamento reologico, non la sola forma esterna.

Distrattori: Equilibrio elastico finito descrive il solido; un liquido può esercitare forza normale. Scorrere non mantiene forma fissa e non converte automaticamente taglio in pressione negativa.

Didattica: Confronto reologico legato alla direzione dello sforzo e alla durata.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 81b81db534a0e0dd2ab01d471274f822150b673584050494c9ab7264989075bb.

## C2-Q002

Ipotesi: Forza45 N interamente normale e uniformemente distribuita su area0,015 m²; conversione esatta Pa→kPa.

Derivazione manuale: p=F_normale/A=45/(15/1000)=3000 Pa=3 kPa. Il risultato usa la componente normale; la distribuzione uniforme rende uguali pressione locale e media.

Distrattori: 0,675 copia F·A, che ha dimensione N·m². 3000 kPa non converte Pa;0,003 kPa è mille volte troppo piccolo rispetto a3;45 copia il dato di forza.

Didattica: Frazione decimale e unità trattate prima della divisione.

Modalità distinta: EXACT_ORACLE; esito True. Firma 92abc2ddc16a1aee789828447ef299ec13d6731d4d3153664fd9eb731becdd1a.

## C2-Q003

Ipotesi: Liquido in quiete, superficie piccola rispetto alle variazioni spaziali di pressione, centro fissato allo stesso punto mentre cambia orientazione.

Derivazione manuale: La pressione idrostatica in un punto è isotropa e scalare. Ruotando una piccola superficie con lo stesso centro cambia la normale e quindi la direzione della forza pA, non p.

Distrattori: Cambiare orientazione non assegna due pressioni allo stesso punto; forza non resta verticale se cambia la normale. Parete orizzontale può ricevere pressione e non nasce un taglio statico dalla rotazione.

Didattica: Valore scalare distinto dal verso della forza sulla parete.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 45cce590d1ad6fb083a3d25700ff93cde305600599908810de525402fb817635.

## C2-Q004

Ipotesi: Atmosfera locale assoluta99 kPa, manometro−12 kPa relativo a essa; camera con pressione assoluta positiva.

Derivazione manuale: p_rel=p_ass−p_atm. Da−12 kPa e99 kPa assoluti ricavo p_ass=99−12=87 kPa>0. Segno relativo negativo non significa assoluta negativa.

Distrattori: 111 kPa sottrae un dato già negativo;−12 è manometrica,12 solo modulo della lettura e99 ignora la differenza.

Didattica: Riferimento e segno del manometro espliciti.

Modalità distinta: EXACT_ORACLE; esito True. Firma 26411770ace1fc03db0a09740ff4e4852d0f268ce2d8c2edf6c3d4c0d3cd8138.

## C2-Q005

Ipotesi: Due volumi20/30 mL a densità0,8/1,2 g/mL, nessuna perdita di massa e volumi additivi; densità media del campione finale.

Derivazione manuale: Le masse dei due volumi sono16 g e36 g; somma52 g,volume additivo50 mL. La densità media è52/50=26/25 g/mL, tra le densità iniziali e diversa dalla media semplice a volumi disuguali.

Distrattori: 1,00 media due densità senza pesare volumi;2,00 le somma;0,96 copia il prodotto dei coefficienti senza bilancio;52 copia i grammi totali senza dividere per50 mL.

Didattica: Masse calcolate separatamente prima della densità media.

Modalità distinta: EXACT_ORACLE; esito True. Firma ef2fd7fac383f7ff8f313f03c617c6d21ebf6306f788f0553a8ccb80ee3ac2ac.

## C2-Q006

Ipotesi: Riferimento al vuoto per pressione assoluta; atmosfera come riferimento per la particolare lettura relativa richiamata.

Derivazione manuale: Una pressione riferita al vuoto è assoluta. Pressione relativa e atmosferica sono collegate alla stessa assoluta da p_ass=p_atm+p_rel; lo zero manometrico non coincide col vuoto.

Distrattori: Relativa e differenziale atmosferica hanno altro riferimento; tangenziale indica direzione dello sforzo e volumetrica non distingue lo zero di pressione.

Didattica: Riferimento di misura distinto dallo stato del fluido.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 2b0ce2230833bcadf0d5a70483bab75915611228e3ad4843fd20caff35fec18d.

## C2-Q007

Ipotesi: Forza normale mantenuta costante, area4→12 cm²; sono confrontate pressioni medie nelle medesime unità.

Derivazione manuale: A forza normale costante p₁A₁=p₂A₂. L’area cresce3 volte e la pressione scende a18/3=6 kPa. L’opzione erronea54 kPa, insieme all’area tripla, produrrebbe invece una forza9 volte maggiore.

Distrattori: 54 kPa aumenta p eA ciascuno3 volte,quindi F9 volte.18 ignora l’area nuova;2 divide di nuovo senza ragione;72 è coefficiente del prodotto pA prima di dividerlo per12.

Didattica: Grandezza controllata identificata prima dell’inversa;controprova della forza ricalcolata.

Modalità distinta: EXACT_ORACLE; esito True. Firma 6dfdc227840b63b315430976af8c6abe378717970558c5a27a7367012eca55fd.

## C2-Q008

Ipotesi: Liquido omogeneo nello stesso stato, massa del solo liquido, grafico m verticale eV orizzontale.

Derivazione manuale: Massa del solo liquido omogeneo nello stesso stato:m=ρV. Nel grafico m controV la pendenza Δm/ΔV èρ, con dimensione massa/volume. La tara non deve essere inclusa.

Distrattori: Volume e massa sono coordinate,non pendenza;pressione ha dimensione diversa. L’inverso diρ sarebbe la pendenza del grafico ad assi scambiati;tara produrrebbe intercetta.

Didattica: Assi e assenza della tara letti prima della pendenza.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma f0597736ad2cf9b4530eda2f24c88d4b3d6688f501fdb80bf2f573a17716d48c.

## C2-Q009

Ipotesi: Gas chiuso senza scambio di materia, densità iniziale6/5 kg/m³,volume6→4 L; volume e densità possono cambiare.

Derivazione manuale: Chiusura alla materia impone stessa massa:ρ₁V₁=ρ₂V₂. Quindiρ₂=(6/5)(6/4)=9/5 kg/m³. Non occorre imporre isoterma o gas ideale per questo bilancio di massa.

Distrattori: 0,80 usa4/6 anziché6/4 e non conserva massa;1,20 conserva erroneamenteρ;7,20 e0,20 moltiplicano o dividono per6 senza usare il rapporto completo.

Didattica: Conservazione della massa sufficiente senza legge termica aggiuntiva.

Modalità distinta: EXACT_ORACLE; esito True. Firma 99877b6e946e73e1192294099f01147eec875f1fffc86c39ff6f16c86be11287.

## C2-Q010

Ipotesi: Stessa faccia con componenti di forza normale e tangenziale, richiesta della pressione media e non dello sforzo risultante totale.

Derivazione manuale: La forza normale per unità di area definisce pressione media; quella tangenziale per unità di area definisce taglio. Le unità Pa uguali non eliminano la diversa componente geometrica.

Distrattori: F_tangenziale/A è taglio;somma dei moduli non ridefinisce pressione. Prodotto di forze dàN² eforza perareaN·m²,non Pa.

Didattica: Stessa unità di pressione e taglio distinta dalla componente geometrica.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma b03251a8cc5e7b88a976eb54d3bfcc381e5c1f2328ee44dd4346f103ebbcc7b3.
