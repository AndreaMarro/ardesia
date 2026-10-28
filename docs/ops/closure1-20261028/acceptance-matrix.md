# Matrice D01–D68 — snapshot fonte 2bef prima del merge

Fonte verificata: `2bef6629b41fab4bb0c6e75ec6c269f6dec4ae81`. Snapshot del 2026-10-28T19:57:10.109556+00:00.

**42 PASS_TECHNICAL, 18 PARTIAL, 4 HUMAN_PENDING, 4 NOT_RUN; 0 FAIL correnti attestati nel perimetro provato.** Snapshot fonte completo; gate di rilascio ancora pendenti.

**0/57 obiettivi accettati; humanReview=false e humanApproval=false. Nessuna CHIUSURA1, approvazione umana o certificazione WCAG totale.** Actual main, CI dopo il merge e rollback devono ancora essere attestati.

Le regressioni tecniche osservate sono superate nei consumer distribuiti: reflow CSS, attivazione Replay dopo seek, ingresso ordinario/OpenSavedLesson e nomi SDK/zoom. Il nuovo report finale 1C è passato con hash persistiti invariati, zero richieste mutanti, logout della sola sessione propria HTTP 200 e vecchio cookie HTTP 401. I tre FAIL b807 restano nello snapshot storico JSON.

Il percorso docente reale segue Core → Studio → Materiali → anteprima/cancel → conferma originale → Room → Rivedi, senza URL manuali. La nuova stanza resta conservata e il journal esistente non viene unito, con messaggio visibile. Seek 2 → 5 → 3.25 → 4.25 → 5 → 2, wheel 460 px e zoom dinamico sono verificati. Risultati ricalcolati e assenza del confronto originale sono dichiarati; nessuna valutazione storica inventata.

Core: 20 scans axe senza violazioni e 20 incomplete. Studio: due scans a 1440/360 px, cinque tag, senza violazioni; definizioni dd e contrasti rimangono incomplete. Queste prove non attestano l’intero percorso tastiera/focus o WCAG totale. Il reflow CSS radice 200% è distribuito e verificato senza CSS correttivo iniettato; non è zoom nativo.

Le altre prove mantengono i propri SHA: 16 modelli/17 ACK/8 camere/quattro viewport e Poiseuille su 392; audio/esami/409/fonti/guard/readback/buffering su 669; D14/D24 e context loss nativo su b807. Nessuna ripetizione numerica inventata su 2bef. La pausa dei traccianti del demo originale è distinta da audio e 16 DS statiche.

D22: paste reale NOT_RUN; nessun accesso alla clipboard OS. Touch/tablet/penna, secondo dispositivo fisico e device/rete concordati NOT_RUN. p95 17.4 ms vale solo per software/SwiftShader 669; il vecchio fallimento è conservato. Restano le accettazioni umane, in particolare D02/D05/D33/D65/D66/D67.

## Conteggi

| Stato | Righe |
|---|---:|
| PASS_TECHNICAL | 42 |
| PARTIAL | 18 |
| HUMAN_PENDING | 4 |
| NOT_RUN | 4 |
| FAIL | 0 |
| Totale | 68 |

## Requisiti e accettazione

I quattro campi id, requisito, criterio e scope sono preservati esattamente dalla baseline. Ogni prova vale per lo SHA e il perimetro dichiarati, non per una nuova esecuzione totale.

### D01 — PASS_TECHNICAL

Una sola identità canonica della lezione nel corso Fluidi e termodinamica

**Criterio di accettazione:** Ingresso, pratica, fonte, feedback e ripresa riferiscono la stessa lezione/versione

**Scope:** all-fluidi-termodinamica-units

**Prova:** Ingresso, pratica/transfer, fonte, receipt e ripresa mantengono pack/lesson/versione/fase/step: matrice 669, readback 17 e 3 receipt storiche riaperte 669.

**Limiti e residui:** Nessun residuo tecnico accertato nei percorsi registrati; non trasforma 57 obiettivi in accettati.

**Fonti:** N01, N02, N03, N06, N08, N09, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D02 — HUMAN_PENDING

Obiettivi circoscritti e prerequisiti espliciti

**Criterio di accettazione:** Il docente approva la mappa fra obiettivo, spiegazione e prova

**Scope:** all-fluidi-termodinamica-units

**Prova:** Mappa 57, obiettivi/prerequisiti e riferimenti presenti; 0/57 accettati.

**Limiti e residui:** Approvazione docente nominativa della mappa richiesta, non attestata.

**Fonti:** N12. Stato nello snapshot 669: HUMAN_PENDING.

### D03 — HUMAN_PENDING

Spiegazione completa per il perimetro scelto

**Criterio di accettazione:** Nessun salto logico indispensabile, placeholder o rimando a materiale ancora assente

**Scope:** all-fluidi-termodinamica-units

**Prova:** Dieci DS e demo originale, spiegazioni/esempi/prove sono raggiungibili; smoke e review tecnica non sono sufficienza didattica umana.

**Limiti e residui:** Giudizio umano sui salti logici e sulla completezza del perimetro ancora necessario.

**Fonti:** S03, S04, N09, N12. Stato nello snapshot 669: HUMAN_PENDING.

### D04 — PASS_TECHNICAL

Diagnosi, pratica, recupero e transfer distinti

**Criterio di accettazione:** Almeno un problema cambia la struttura del ragionamento, non soltanto i numeri

**Scope:** all-fluidi-termodinamica-units

**Prova:** Tre diagnostiche e 57 prove/transfer sono distinti; tre consegne UI352 con diagnosi/pratica-aiuto/transfer strutturalmente diverso sono rilette e visibili 669; due mock reali eseguiti.

**Limiti e residui:** La qualità cognitiva/rubriche e gli esiti con studenti restano D05/D67; non si attribuiscono nuove consegne 669 allo smoke readonly.

**Fonti:** S24, S25, N08, N09, N13, N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D05 — NOT_RUN

Revisioni scientifica ed editoriale umane

**Criterio di accettazione:** Nome del revisore, versione, osservazioni risolte e data, senza approvazioni generiche al progetto

**Scope:** all-fluidi-termodinamica-units

**Prova:** Contenuti DRAFT, humanApproval=false, humanReview=NOT_RUN, 0/57 ACCEPTED.

**Limiti e residui:** Mancano revisori umani nominativi, versione, data e osservazioni risolte.

**Fonti:** N12, S03, S04. Stato nello snapshot 669: NOT_RUN.

### D06 — PASS_TECHNICAL

Completamento, esito e aiuti sono concetti distinti

**Criterio di accettazione:** Aprire la scena o ottenere un numero corretto non attribuisce automaticamente padronanza

**Scope:** all-fluidi-termodinamica-units

**Prova:** Receipt MANUAL_REVIEW_REQUIRED, aiuti separati e punteggi mock DRAFT non attribuiscono padronanza; 0/57.

**Limiti e residui:** Nessuna attestazione educativa o umana ricavata da salvataggi/score sintetici.

**Fonti:** S11, S24, N08, N09, N12, N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D07 — PASS_TECHNICAL

Prerequisiti minimi recuperabili

**Criterio di accettazione:** Poiseuille non viene presentato come primo argomento del syllabus se richiede concetti precedenti

**Scope:** all-fluidi-termodinamica-units

**Prova:** Sequenza da pressione/densità/idrostatica aPoiseuille, prerequisiti e recupero espliciti nelle lezioni.

**Limiti e residui:** Accettazione della sequenza con docente/studenti separata inD02/D66.

**Fonti:** S03, N01, N12. Stato nello snapshot 669: PASS_TECHNICAL.

### D08 — PARTIAL

Testo italiano curato

**Criterio di accettazione:** Terminologia, unità, punteggiatura, simboli, errori, titoli e suggerimenti riletti nell'interfaccia

**Scope:** all-fluidi-termodinamica-units

**Prova:** Testi italiani/microtesti corretti e osservati in UI; smoke 669 non è rilettura editoriale umana integrale.

**Limiti e residui:** Rilettura umana completa di terminologia, simboli e suggerimenti nell’interfaccia resta da attestare.

**Fonti:** S03, S04, N09. Stato nello snapshot 669: PARTIAL.

### D09 — PASS_TECHNICAL

Ipotesi e dominio dichiarati

**Criterio di accettazione:** Fluido newtoniano incomprimibile, regime laminare stazionario e sviluppato, tubo cilindrico rigido, condizioni alla parete coerenti

**Scope:** all-fluidi-termodinamica-units

**Prova:** Ipotesi, domini e osservabili dei modelli canonici sono espliciti e rilette 669 conhashesatti.

**Limiti e residui:** Validità limitata ai modelli analitici dichiarati; revisione scientifica umana separata.

**Fonti:** S06, N07, N10, N06. Stato nello snapshot 669: PASS_TECHNICAL.

### D10 — PASS_TECHNICAL

Raggio doppio, pressione differenziale fissata

**Criterio di accettazione:** Portata ×16; velocità media ×4; area ×4

**Scope:** all-fluidi-termodinamica-units

**Prova:** Followup 669 eseguito:Δpfissa, r×2→Q×16, v̄×4, A×4; oracoli indipendenti in forma diametro.

**Limiti e residui:** A è derivata numericamente dalla geometria del profilo restituito, non un nuovo osservabile prodotto; nessuna modifica runtime.

**Fonti:** N07, N10. Stato nello snapshot 669: PASS_TECHNICAL.

### D11 — PASS_TECHNICAL

Raggio doppio, portata fissata

**Criterio di accettazione:** Pressione differenziale ÷16; velocità media ÷4

**Scope:** all-fluidi-termodinamica-units

**Prova:** Followup 669 eseguito:Qfissa, r×2→Δp×0.0625 e v̄×0.25; sorgenti canoniche identiche.

**Limiti e residui:** Nessuna prova UI o approvazione umana inventata dai sei calcoli numerici.

**Fonti:** N07, N10. Stato nello snapshot 669: PASS_TECHNICAL.

### D12 — PASS_TECHNICAL

Viscosità e lunghezza raddoppiate, portata e raggio fissati

**Criterio di accettazione:** Pressione differenziale ×4

**Scope:** all-fluidi-termodinamica-units

**Prova:** Followup 669 eseguito:μ×2, L×2 conQ/rfissi→Δp×4.

**Limiti e residui:** Confronto entro dominio laminare registrato; 54 casi storici restano distinti dai 3 followup.

**Fonti:** N07, N10. Stato nello snapshot 669: PASS_TECHNICAL.

### D13 — PASS_TECHNICAL

Scena, numeri, grafico e formula coerenti

**Criterio di accettazione:** Derivano dallo stesso stato fisico; controlli indipendenti sui casi analitici

**Scope:** all-fluidi-termodinamica-units

**Prova:** Unico stato/modello genera numeri, formula, serie e geometria; controprove e 16 consumer/17 readback esatti.

**Limiti e residui:** Coerenza tecnica nel perimetro provato; non ogni valore continuo o accettazione percettiva umana.

**Fonti:** S06, S08, N07, N10, N01, N06, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D14 — PASS_TECHNICAL

Unità, arrotondamenti e tolleranze espliciti

**Criterio di accettazione:** Nessuna risposta corretta respinta per formattazione equivalente; nessuna incoerenza dimensionale accettata

**Scope:** all-fluidi-termodinamica-units

**Prova:** Sul consumer reale b807, dal normale CuratedCoursePractice/QuestionCard, il quesito canonico u3-pressure-area-01 accetta 8/2, 4.0, 4,0 e 4 Pa; respinge 4 m. Cinque POST reali con manifest/versione esatti e DRAFT/reference/humanApproval=false. Prima di ciascun tentativo il quesito esatto riapre senza soluzione/feedback.

**Limiti e residui:** Pass rappresentativo di equivalenza razionale e unità attesa: non CAS generale o conversione arbitraria di unità. Tentativi dichiarati persisted=false, non receipt da riaprire. Ledger confermato invariato; nessun grader delle risposte libere o approvazione umana. Sessione propria200→vecchio cookie401.

**Fonti:** S04, N07, N04, U09, U10, U13. Stato nello snapshot 669: PARTIAL.

### D15 — PASS_TECHNICAL

Input degeneri e limiti

**Criterio di accettazione:** Raggio/viscosità/lunghezza non positivi, campo vuoto e fuori intervallo gestiti prima del calcolo; niente NaN/Infinity visibili

**Scope:** all-fluidi-termodinamica-units

**Prova:** Domini, nonfiniti/nonpositivi e rawvuoto sono validati; B17 prova campo vuoto/invalido senza perdita ocommit improprio.

**Limiti e residui:** Non generalizzare a ogni combinazione di input/dispositivo.

**Fonti:** S08, S11, N02, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D16 — PARTIAL

Animazione non ingannevole

**Criterio di accettazione:** Traccianti medi o locali dichiarati; eventuale profilo rispettato; densità grafica non confusa con portata

**Scope:** all-fluidi-termodinamica-units

**Prova:** Profilo e geometrie coerenti con modelli; scene del corso sono illustrate e non una simulazione CFD.

**Limiti e residui:** Correttezza percettiva di traccianti/densità dove presenti richiede review visiva umanaD65; non aggiungere nuove animazioni.

**Fonti:** S06, S08, N10. Stato nello snapshot 669: PARTIAL.

### D17 — PASS_TECHNICAL

Regime laminare trattato onestamente

**Criterio di accettazione:** Con soli rapporti è un'ipotesi, non un regime numericamente verificato; dati assoluti richiedono un riferimento fisico approvato

**Scope:** all-fluidi-termodinamica-units

**Prova:** Regime/ipotesi dichiarati e dominio quantitativo controllato; followupRe massimo 400, non verifica dai soli rapporti.

**Limiti e residui:** Nessuna approvazione scientifica umana o validità fuori dominio.

**Fonti:** S06, N07, N10. Stato nello snapshot 669: PASS_TECHNICAL.

### D18 — PASS_TECHNICAL

Limiti del modello

**Criterio di accettazione:** Nessuna promessa di descrivere turbolenza, stenosi, sangue reale o CFD generale

**Scope:** all-fluidi-termodinamica-units

**Prova:** Limiti analitici espliciti, nessuna promessa CFD/turbolenza/sangue reale.

**Limiti e residui:** Non espandere a scene o modelli estranei al mandato.

**Fonti:** S07, S08, N10. Stato nello snapshot 669: PASS_TECHNICAL.

### D19 — PARTIAL

Ingresso leggibile

**Criterio di accettazione:** Lo studente riconosce obiettivo, stato e prima azione senza una spiegazione dell'operatore

**Scope:** all-fluidi-termodinamica-units

**Prova:** Ingresso reale 669, obiettivo/stato/azione e corso labfirst raggiungibili senza dashboard preliminare.

**Limiti e residui:** Riconoscimento autonomo senza suggerimenti richiede osservazione umanaD66, non un nuovo difetto tecnico.

**Fonti:** N01, N02, N09. Stato nello snapshot 669: PARTIAL.

### D20 — PASS_TECHNICAL

Navigazione coerente

**Criterio di accettazione:** Avanti, indietro, ritorno al corso, refresh, URL diretto e cronologia browser preservano il contesto previsto

**Scope:** all-fluidi-termodinamica-units

**Prova:** URL esatto, view/edition/lesson/model/Back, work→lezione dopo ACK, refresh e nuovi contesti preservano riferimenti nei casi registrati.

**Limiti e residui:** Nessun browser fresco è presentato come secondo dispositivo fisico.

**Fonti:** N01, N02, N03, N04, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D21 — PASS_TECHNICAL

Vincolo sempre identificabile

**Criterio di accettazione:** Cambio fra pressione e portata fissate aggiorna etichette, valori, scena e feedback; l'utente capisce che è un altro esperimento

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su 392 il consumer Poiseuille passa da Δp fissa a Q fissa con previsioni e confronto, formule, etichette e tabella coerenti. Raggio raddoppiato: Q circa ×16; a Q fissa la pressione ricalcolata è 7.95775 Pa. Campo e slider restano allineati.

**Limiti e residui:** Pass rappresentativo Poiseuille, distinto dagli oracoli 669; non prova comprensione autonoma degli utenti. Il collaudo della nuova istruzione decimale b807 resta pendente in D22.

**Fonti:** S06, S08, N07, N10, U04. Stato nello snapshot 669: PARTIAL.

### D22 — PARTIAL

Slider e campi concordi

**Criterio di accettazione:** Mouse, tastiera e touch portano allo stesso valore; min/max, passi, decimali con virgola e incolla hanno regole comprensibili

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su 392 sono provati input e slider nativi, raw vuoto, cambio vincolo senza sovrascrittura dei parametri archiviati e recupero esplicito. In it-IT 0.0015 è valido; Chromium trasforma 0,0015 in 00015, fuori dominio con errore visibile. Il fix 84d68a10 aggiunge la guida al punto senza cambiare parser. Su 2bef U14 verifica in cinque casi la guida al punto e aria-describedby; per Poiseuille la nota del parametro inattivo rimane visibile e collegata a campo/slider insieme alla guida decimale.

**Limiti e residui:** Guida e descrizioni ora provate nel consumer 2bef. Nessun supporto alla virgola aggiunto: la normalizzazione nativa osservata 392 resta dichiarata. Paste reale NOT_RUN, nessuna clipboard OS; touch e hardware D40 NOT_RUN; non ogni min/max/passo è provato nel browser.

**Fonti:** S08, N02, U04, U07, U08, U14. Stato nello snapshot 669: PARTIAL.

### D23 — PARTIAL

Manipolazione 3D controllabile

**Criterio di accettazione:** Nessun trascinamento ambiguo fra raggio, camera e scroll; camera iniziale leggibile e ripristino prevedibile

**Scope:** all-fluidi-termodinamica-units

**Prova:** Otto camere rispondono con cambiamento pixel; controllo esplicito camera separato dagli input, renderer uguale.

**Limiti e residui:** Valutazione camera/scroll/manipolazione su hardware previsto e giudizio di leggibilità restanoD40/D65, non nuove scene.

**Fonti:** N01, N05, N10, U03. Stato nello snapshot 669: PARTIAL.

### D24 — PASS_TECHNICAL

Pausa e ripristino corretti

**Criterio di accettazione:** Pausa ferma l'animazione, non cambia la legge fisica; reset distingue stato del modello e lavoro già consegnato

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su b807 il PhysicsLab originale nel Public anonimo calcola via Core reale. Ferma/Anima il flusso cambia CSS animation-play-state e WAAPI: pausa mantiene transform/currentTime, ripresa avanza. Parametri, previsione, risultato, misure e geometria invariati; ledger confermato invariato. Reset camera e reset scenario/guard/receipt hanno evidenze distinte precedenti; le 16 DS sono statiche.

**Limiti e residui:** Pass condizionale dove l’animazione esiste, circoscritto ai traccianti del demo originale. Non pausa audio, nuova animazione DS o benchmark. Due tentativi driver non conclusivi preservati, caso riuscito isolato: nessun singolo run tutto verde. Nessun salvataggio/consegna o reset dell’autorità persistita in questo run.

**Fonti:** S08, S25, N02, N05, U09, U13. Stato nello snapshot 669: PARTIAL.

### D25 — PASS_TECHNICAL

Previsione conservata

**Criterio di accettazione:** Confronto, nuova manipolazione e cambio passo non riscrivono il tentativo precedente

**Scope:** all-fluidi-termodinamica-units

**Prova:** Nuova modifica/manipolazione non riscrive revisioni e receipt precedenti; storici A rimangono dopoB e readback 17 conferma testi.

**Limiti e residui:** Bozza aperta e non ACK rimane volatile dichiarata; difetto di ripresa precedente superato.

**Fonti:** S11, N02, N03, N06, N08. Stato nello snapshot 669: PASS_TECHNICAL.

### D26 — PARTIAL

Feedback specifico

**Criterio di accettazione:** Distingue vincolo errato, raggio/area, portata/velocità, esponente e unità; spiega il passo utile invece di un generico «sbagliato»

**Scope:** all-fluidi-termodinamica-units

**Prova:** Il pack canonico contiene errorFeedback distinti per vincolo, raggio/area, portata/velocità, esponente e unità, con recuperi e rubriche docente. La proiezione studente protegge errorFeedback/rubriche; course-reasoning-v1 produce MANUAL_REVIEW_REQUIRED e preserva prompt/testo. Feedback docente e receipt sono raggiungibili nel consumer già provato.

**Limiti e residui:** Non esiste né si richiede un classificatore automatico dei cinque errori nel testo libero. La lacuna principale è revisione umana della diagnosi e del passo utile nelle cinque categorie, non nuovo grading. Una dimostrazione docente→feedback nel consumer per tali categorie può documentare la reachability, ma non sostituisce il giudizio didattico; i report non attestano tutti e cinque gli esiti.

**Fonti:** S03, S04, N08, N09, U09. Stato nello snapshot 669: PARTIAL.

### D27 — PASS_TECHNICAL

Esplorazione rispettata

**Criterio di accettazione:** Vedere risultati e usare aiuti nell'esplorazione non viene trattato come una penalizzazione; l'assistenza è registrata quando rilevante alla prova

**Scope:** all-fluidi-termodinamica-units

**Prova:** Aiuto reale 352 level 1 è nella receipt riaperta 669; esplorazione nonpenalizzata, assenza aiuti non prova autonomia.

**Limiti e residui:** Nessuna padronanza/efficacia inferita dal ledger.

**Fonti:** S24, N08, N09, N12. Stato nello snapshot 669: PASS_TECHNICAL.

### D28 — PASS_TECHNICAL

Fonte e annotazione

**Criterio di accettazione:** Apri, chiudi, seleziona, modifica, annulla e riapri funzionano sul riferimento esatto; nessun salto a una fonte sostitutiva silenziosa

**Scope:** all-fluidi-termodinamica-units

**Prova:** Nove casi 669:apri/chiudi, selezione reale PDF, modifica/Undo/Cancel, coldreopen exactA, nuovaB, teacher/peer e storicaA.

**Limiti e residui:** Solo fonte/annotazione originale sintetica; non si inventa un Cancel di testo semplice inesistente.

**Fonti:** N03. Stato nello snapshot 669: PASS_TECHNICAL.

### D29 — PARTIAL

Dialoghi e focus

**Criterio di accettazione:** Apertura, Escape, conferma, annullamento e ritorno del focus funzionano; niente interazioni invisibili sotto un overlay

**Scope:** all-fluidi-termodinamica-units

**Prova:** B17/D28 provano annullamento e ritorno al focus nei casi assegnati. Il successivo G3 d57 conclude 20 scans senza violazioni; restano 20 incomplete colore e osservazioni di focus che non dimostrano da sole focus visibile/non occluso. Il report finale Studio2bef aggiunge anteprima/annullamento/conferma e percorso ordinario riusciti,senza risolvere automaticamente focus o incomplete.

**Limiti e residui:** Review manuale di focus, overlay e incomplete ancora necessaria. Nessuna certificazione integrale di tutti i dialoghi; link docente guardato del nuovo stack provato localmente, non ancora nel browser distribuito.

**Fonti:** S14, N02, N03, N15, C_G3_FIX, U01, U07, U11, U14, U15. Stato nello snapshot 669: PARTIAL.

### D30 — PASS_TECHNICAL

Stati intermedi curati

**Criterio di accettazione:** Caricamento, vuoto, disabilitato, salvataggio, successo, errore ed esito incerto hanno messaggi e azioni coerenti

**Scope:** all-fluidi-termodinamica-units

**Prova:** Loading/invalidraw/ACK/error/retry/conflitti e isolamento con rete reale hanno azioni coerenti; vecchie 503 non ricompaiono nei percorsi 669.

**Limiti e residui:** Pass nei casi dichiarati, non affermazione universale su tutte le superfici del prodotto.

**Fonti:** N01, N02, N03, N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D31 — PASS_TECHNICAL

Uscita dal lavoro

**Criterio di accettazione:** Nessuna perdita silenziosa; conferma proporzionata alle modifiche effettivamente non salvate

**Scope:** all-fluidi-termodinamica-units

**Prova:** B17/17 PASS e 409 exam preservano bozze, conferme proporzionate e nuova generazione; scarto/accettazione espliciti.

**Limiti e residui:** L’esame non attesta da solo tuttoD31; l’evidenza completa èB17 con scope dichiarato.

**Fonti:** N02, N03, N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D32 — PARTIAL

Microtesti orientati allo studente

**Criterio di accettazione:** «Salvato» o «Risposta consegnata» dove appropriato; niente Core, CAS, adapter o chiavi tecniche nel percorso ordinario

**Scope:** all-fluidi-termodinamica-units

**Prova:** Microtesti ordinari studentifriendly, CTAcommercialeprivataassente; nuove scelte exam non espongono CAS all’utente.

**Limiti e residui:** Rilettura visiva/editoriale completaD65 non attestata; nessuna nuova modifica tecnica prescritta dalla sola assenza di firma.

**Fonti:** S25, N02, N09, N04. Stato nello snapshot 669: PARTIAL.

### D33 — HUMAN_PENDING

Una sola direzione visiva

**Criterio di accettazione:** Schermate approvate di ingresso, manipolazione, errore, aiuto e ripresa; stesso sistema di testo, spaziatura, colori e controlli

**Scope:** all-fluidi-termodinamica-units

**Prova:** Direzione visiva e schermate reali disponibili; non sono approvazione diAndrea.

**Limiti e residui:** Manca approvazione umana dei cinque stati ininterazione.

**Fonti:** N01, N05. Stato nello snapshot 669: HUMAN_PENDING.

### D34 — PASS_TECHNICAL

Gerarchia del compito

**Criterio di accettazione:** Una scena/attività principale; pannelli secondari contestuali; niente dashboard obbligatoria prima di iniziare

**Scope:** all-fluidi-termodinamica-units

**Prova:** Lab principale prima del problema manuale opzionale; 57 prove distinte e tutti controlli conservati; gerarchia reale 669 raggiungibile.

**Limiti e residui:** Reviewvisiva umana separataD65, non una dashboard/attivitànuova da aggiungere.

**Fonti:** S25, N01, N02, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D35 — PASS_TECHNICAL

Responsive intenzionale

**Criterio di accettazione:** Verifica a 360/390, 820 e 1440 px, portrait/landscape pertinenti; testo, formule e azioni non tagliati

**Scope:** all-fluidi-termodinamica-units

**Prova:** 360/390/820/1440 CSS px verificati su 669 senza overflow, contenuto reale e stati di lavoro.

**Limiti e residui:** Viewportsoftware distinti da hardware/orientamento del tabletD40.

**Fonti:** N01, N02, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D36 — PARTIAL

Accesso senza mouse

**Criterio di accettazione:** Percorso completo via tastiera; nomi accessibili, ordine e focus visibile; nessun compito essenziale soltanto drag

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su2bef il consumer Studio verifica menu/zoom reali: nome dinamico «110% · Ripristina ingrandimento» e due scans axe1440/360 con cinque tag senza violazioni. Percorso docente ordinario e seek/scroll funzionano senza Escape o force click. Le20 scans Core separate hanno anch’esse zero violazioni. I finding ricerca669 e SDKzoom b807 sono superati nei rispettivi casi riesaminati.

**Limiti e residui:** PARTIAL per il criterio completo via tastiera,ordine/focus visibile/non occluso e review manuale ancora non attestati integralmente. Quattro definizioni dd con aria-label e contrasti restano incomplete,non PASS né certificazione WCAG. Nessuna regressione SDK attuale lasciata fittiziamente aperta nel percorso provato.

**Fonti:** N02, N15, C_G3_FIX, U01, U05, U07, U08, U11, C_STUDIO_B807, U14, C_2BEF, U15. Stato nello snapshot 669: FAIL.

### D37 — PASS_TECHNICAL

Alternative alla scena

**Criterio di accettazione:** Dati, formula e descrizione accessibili; fallback 2D completo quando WebGL manca o viene perso

**Scope:** all-fluidi-termodinamica-units

**Prova:** Alternative 2D e dati/formule sono disponibili. Firefox e WebKit su d57 completano il percorso rappresentativo 2D/3D, camera/reset e ritorno/refresh. Le prove storiche harness di no-WebGL/context loss restano distinte. Nel sorgente è presente anche un test consumer che simula il fallimento del chunk 3D, torna in 2D e conserva la previsione; è letto, non rieseguito in questo audit. Nuova esecuzione b807 riferita dal coordinatore: WebGL context loss tramite extension, evento isTrusted=true, fallback 2D e invarianti tabella, zero scritture.

**Limiti e residui:** Caso reale documentato U12: extension WebGL_lose_context, evento nativo, recupero 2D e invarianti preservati. Prova Chromium/SwiftShader, non hardware GPU o certificazione completa.

**Fonti:** S09, N01, N10, N16, N17, U02, U09, C_NAV_B807, U12. Stato nello snapshot 669: PARTIAL.

### D38 — PARTIAL

Movimento e colore

**Criterio di accettazione:** Riduzione del movimento rispettata; significato non affidato soltanto al colore; contrasto verificato

**Scope:** all-fluidi-termodinamica-units

**Prova:** Le 26 occorrenze delle due regole serious osservate su 669 restano storiche. Il rescan reale d57 su cinque stati e quattro viewport registra zero violazioni e 20 incomplete colore; il contrasto selezionato 3.82:1 non si riproduce nei casi riesaminati. Un ulteriore audit b807 registra anch’esso 20 scans senza violazioni e 20 incomplete; non include l’intero percorso Studio. Il nuovo rescan Core 2bef conferma 20 scans, zero violazioni e 20 incomplete; nessuna certificazione totale.

**Limiti e residui:** Finding storici superati nei percorsi riesaminati. Restano20 incomplete Core e incomplete Studio:quattro definizioni dd per scan e contrasti su elementi occlusi/SVG. La review manuale è necessaria; zero violazioni axe non significa conformità WCAG totale.

**Fonti:** N02, N15, C_G3_FIX, U01, U07, U08, U11, U14, U15. Stato nello snapshot 669: FAIL.

### D39 — PARTIAL

Audio accessibile

**Criterio di accettazione:** Trascrizione completa e coerente; niente autoplay; azioni del player accessibili

**Scope:** all-fluidi-termodinamica-units

**Prova:** L’unico audio originale ha trascrizione leggibile anche offline, nessun autoplay e controlli nativi reali; buffering, recupero e rientro sono provati su 669. Il G3 d57 supera i precedenti finding nei propri stati esaminati.

**Limiti e residui:** Coerenza e completezza editoriale della trascrizione richiedono revisione umana. G3 parziale non certifica tutto il player. Dieci lezioni DS restano testuali: nessun nuovo requisito di dieci audio.

**Fonti:** N04, N14, N15, U01. Stato nello snapshot 669: PARTIAL.

### D40 — PARTIAL

Dispositivi reali della promessa

**Criterio di accettazione:** Chrome/Firefox desktop, Safari e tablet previsto verificati; la penna richiede una prova su dispositivo fisico prima di prometterne qualità

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su d57 Firefox 150.0.2 e WebKit 26.4 completano lo smoke rappresentativo: login, 2D, 3D, camera/reset, ritorno e refresh. Safari nativo 26.0.1 passa il percorso Archimede su 669. Le prove Chromium 392 coprono 16 modelli e quattro viewport CSS.

**Limiti e residui:** Il primo compat 669 fallito resta conservato. Gli smoke successivi non sono tutti i modelli su tutti gli engine. WebKit Playwright non è Safari fisico. Tablet, touch, penna e hardware previsto NOT_RUN; revoca server delle sessioni compat d57 non confermata esplicitamente, browser chiusi.

**Fonti:** N01, N05, N16, N17, U02, U03. Stato nello snapshot 669: PARTIAL.

### D41 — PASS_TECHNICAL

Leggibilità sotto stress

**Criterio di accettazione:** Zoom del testo, formule lunghe, messaggi di errore e contenuto di esempio realistico non rompono il layout

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su 2bef U14 verifica il CSS distribuito al 200% della radice a360 e1440, senza CSS correttivo iniettato: prosa e celle contenute, formula e ipotesi dentro i rispettivi contenitori, parametri/misure invariati, errore visibile e recuperato. Il clipping b807 è superato in questi casi e rimane storico.

**Limiti e residui:** Pass tecnico rappresentativo dello stress CSS; non zoom nativo del browser, non ogni testo/formula o dispositivo fisico. Le venti incomplete axe e la review manuale accessibilità restano in D29/D38. Assenza di overflow documento, da sola, non sarebbe stata prova sufficiente.

**Fonti:** N01, N02, N15, U01, U03, C_NAV_B807, U11, U12, U14. Stato nello snapshot 669: PARTIAL.

### D42 — PASS_TECHNICAL

Audio remoto realmente disponibile

**Criterio di accettazione:** Nessun import `.lesson` nascosto richiesto allo studente per ascoltare il passaggio della lezione

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su 669 la lezione original-demo-u5-01 riproduce il WAV originale via HTTP 206 senza import .lesson; 11 lezioni, dieci DS testuali esplicite.

**Limiti e residui:** Unaudio originale effettivo; non si aggiungono 10 narrazioni come criterio.

**Fonti:** N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D43 — PARTIAL

Versione e ancoraggio

**Criterio di accettazione:** Audio, trascrizione, fonte e timecode appartengono alla versione approvata

**Scope:** all-fluidi-termodinamica-units

**Prova:** Audio/transcript appartengono alla lezione/ref e al candidato pin 669; sorgenteaudio esatta nei nuovi contesti.

**Limiti e residui:** La versione non è approvata umanamente; ancoraggi editoriali approvati non attestati. Non inventare nuovi timecode oaudio perDS.

**Fonti:** N04, N12. Stato nello snapshot 669: PARTIAL.

### D44 — PASS_TECHNICAL

Player affidabile

**Criterio di accettazione:** Play/pausa, seek, fine, buffering, errore e retry provati; un rientro non riproduce un altro passaggio

**Scope:** all-fluidi-termodinamica-units

**Prova:** Su 669: play/pausa/seek/fine e offline→retry provati nei due run audio/esami; nuovo caso CDP osserva waiting reale con errore nullo, recupero dopo ripristino rete e rientro nello stesso lessonRef/src/transcript.

**Limiti e residui:** Pass tecnico nel perimetro registrato. Stalled non osservato; non viene inventato. Prova funzionale Chromium, non prestazioni o hardware; primo tentativo di readiness non conclusivo preservato.

**Fonti:** N04, N14. Stato nello snapshot 669: PASS_TECHNICAL.

### D45 — PASS_TECHNICAL

Salvataggio confermato

**Criterio di accettazione:** «Salvato» compare solo dopo riscontro autorevole; stato locale temporaneo distinguibile

**Scope:** all-fluidi-termodinamica-units

**Prova:** 17 ACK autoritativi e 17 readback distinti; indiceWork→Lessonprima refresh, late ACK nuova generationguard eautosaveexam confermati.

**Limiti e residui:** Nessun semplice link precedente spacciato per nuovo ACK.

**Fonti:** N01, N02, N04, N06, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D46 — PARTIAL

Ripresa reale

**Criterio di accettazione:** Refresh, browser nuovo e secondo dispositivo autorizzato ritrovano passo, risposta, nota, aiuti e feedback confermati

**Scope:** all-fluidi-termodinamica-units

**Prova:** Vecchio FAIL prodotto 503/ripresa risolto:refresh, nuovo contesto browser, readback HTTP17, risposte/note/aiuti/feedback confermati sui riferimenti esatti.

**Limiti e residui:** Secondo dispositivo fisico autorizzato NOT_RUN. Browserfresh e API reali non sono hardware; nessun vecchio FAIL prodotto lasciato aperto. Il diverso difetto di rendering storico ReplayView è registrato inD50/D68,non riapre come503 il percorso corso già provato.

**Fonti:** N01, N02, N03, N04, N06. Stato nello snapshot 669: PARTIAL.

### D47 — PASS_TECHNICAL

Commit con risposta persa

**Criterio di accettazione:** Retry con la stessa identità di comando non duplica consegna o feedback

**Scope:** all-fluidi-termodinamica-units

**Prova:** Replayidempotente comando/receipt e bodychanged 409 nelle prove registrate; consumer/codeidentity e 3 receipt conservate 669.

**Limiti e residui:** Storia API/contratti dichiarata, non nuova simulazione 669 di ogni risposta persa e nessuna nuova autorità.

**Fonti:** S11, S14, S17, S24, N08, N13. Stato nello snapshot 669: PASS_TECHNICAL.

### D48 — PASS_TECHNICAL

Concorrenza e conflitti

**Criterio di accettazione:** Due tab o due modifiche non sovrascrivono silenziosamente; scelta di recupero comprensibile

**Scope:** all-fluidi-termodinamica-units

**Prova:** Due tabrealicon 409 mantengono bozzaperdente; exam due 409, retry CAS/scarto consapevoli, 0 autosaveextra nei log richieste.

**Limiti e residui:** Nooverwrite silenzioso nei casi provati; non un’attestazione umana diusabilità.

**Fonti:** N02, N03, N04. Stato nello snapshot 669: PASS_TECHNICAL.

### D49 — PASS_TECHNICAL

Sessione scaduta

**Criterio di accettazione:** Riautenticazione e recupero senza attribuire il lavoro all'account successivo

**Scope:** all-fluidi-termodinamica-units

**Prova:** Sessione propria revocata 401, relogin, cleanup privato senza prompt, altra sessioneB200, recupero solo confermato; niente public/course 404.

**Limiti e residui:** Nessungloballogout e nessuna attribuzione alpeer; ambito identità sintetiche realiAuth.

**Fonti:** N02. Stato nello snapshot 669: PASS_TECHNICAL.

### D50 — PASS_TECHNICAL

Revisione editoriale nuova

**Criterio di accettazione:** Vecchi tentativi restano legati alla fonte e al problema usati; migrazione esplicita e verificabile

**Scope:** all-fluidi-termodinamica-units

**Prova:** Fonti,problemi,revisioni e vecchie receipt restano legati ai riferimenti esatti nelle prove corso. Il consumer Studio2bef apre realmente la lezione salvata dal normale percorso docente,con anteprima/annullamento/conferma esplicita e link all’originale,senza URL manuali. Nuova stanza e journal nonempty sono preservati; seek avanti/indietro ricostruisce gli stati storici con hash persistiti invariati.

**Limiti e residui:** Pass tecnico nei casi registrati: risultato ricalcolato e assenza del confronto originale sono dichiarati,nessuna valutazione storica inventata. Ripristino di id estraneo resta rifiutato; memoria esistente non unita con avviso visibile. Nessuna migrazione implicita o accettazione umana ricavata dall’apertura del file.

**Fonti:** S20, N03, N05, N08, N09, C_REPLAY, U05, U06, U07, U08, C_STUDIO_B807, U14, C_2BEF, U15. Stato nello snapshot 669: PARTIAL.

### D51 — PASS_TECHNICAL

Crash e lavoro locale

**Criterio di accettazione:** Autosalvataggi confermati sopravvivono; eventuale intervallo non ancora salvato dichiarato, recupero locale limitato e isolato se previsto

**Scope:** all-fluidi-termodinamica-units

**Prova:** Stati ACK sopravvivono aclose/newcontext/refresh e 17 letture indipendenti; intervallo non ACK resta bozza volatile protetta, senza nuovostore.

**Limiti e residui:** Non eseguito killfisico/processo: prova durata dei confermati e limiti della bozza, non recupero universale del non ACK.

**Fonti:** S14, N02, N04, N06. Stato nello snapshot 669: PASS_TECHNICAL.

### D52 — PASS_TECHNICAL

Backup e ripristino

**Criterio di accettazione:** Prova concreta su dati sintetici del verticale, inclusi riferimenti media e autorizzazioni; non basta che il provider dichiari backup

**Scope:** all-fluidi-termodinamica-units

**Prova:** Restore concretoPG17.11/71 tabelle, digest, Authrecord, receipt/revisioni/media eACLprovati.

**Limiti e residui:** Ambito verticale sintetico dichiarato, non standaloneSupabaseDR/restorelive oautorizzazioneproduzione.

**Fonti:** S19. Stato nello snapshot 669: PASS_TECHNICAL.

### D53 — PARTIAL

Identità reali e ruoli

**Criterio di accettazione:** Un docente e due studenti distinti; niente scorciatoie sintetiche nel runtime distribuito

**Scope:** all-fluidi-termodinamica-units

**Prova:** Docente+dueprincipali studenti reali SupabaseAuth/ruoli server-owned, ACL e sessioni distinte.

**Limiti e residui:** Runtime autorizzato resta SYNTHETIC_ACCEPTANCE, syntheticOnly eproductionReady=false; non è accettazione di utenti umani/produzione ordinaria.

**Fonti:** S16, N02, N03, N08. Stato nello snapshot 669: PARTIAL.

### D54 — PASS_TECHNICAL

Isolamento e revoca

**Criterio di accettazione:** Fonte privata, risposta, nota, URL copiato e sessione revocata provati contro accessi non autorizzati

**Scope:** all-fluidi-termodinamica-units

**Prova:** Fonte/nota/receipt/originali privati eURLcopiati negati apeer; revoca 401/teacherpin/propriocontesto reali.

**Limiti e residui:** Isolamento tecnico sintetico, non consenso/pubblicazioneproduzione.

**Fonti:** S18, N02, N03, N04, N08, N11. Stato nello snapshot 669: PASS_TECHNICAL.

### D55 — PASS_TECHNICAL

Dati e media controllati

**Criterio di accettazione:** Validazione input, limiti upload dove presenti, sanificazione rendering, diritti degli asset, gestione di cancellazione e conservazione definita

**Scope:** all-fluidi-termodinamica-units

**Prova:** Providerchain reale PASS dopoV2 reviewed:orphan→cleanup→assenza→samekeyretry 1 receipt; metadatawins/originale/ACLprotetti, workerdisabilitato/capabilityrevocata.

**Limiti e residui:** Prova storica circoscritta all’app 8e442 e al worker b505; retention operativa dichiarata con scadenza di review, non esecuzione permanente o scheduling in produzione.

**Fonti:** S21, N11. Stato nello snapshot 669: PASS_TECHNICAL.

### D56 — PASS_TECHNICAL

Un'autorità dei dati

**Criterio di accettazione:** Niente secondo store di progresso, scoring, memoria o scheduler per aggirare un'integrazione

**Scope:** all-fluidi-termodinamica-units

**Prova:** Core/risorse/receipt/aiuti/esami restano ledgeresistenti; guard UI effimera, nonsecondoprogressoscoringmemoria.

**Limiti e residui:** Cache/localStorage Studio esplicitamente nonautoritativi.

**Fonti:** S11, S24, N04, N06, N08. Stato nello snapshot 669: PASS_TECHNICAL.

### D57 — PASS_TECHNICAL

Manutenibilità

**Criterio di accettazione:** Separazione comprensibile fra modello scientifico, stato educativo, trasporto e renderer; dipendenze bloccate e documentazione minima utile

**Scope:** all-fluidi-termodinamica-units

**Prova:** Modello/stato/trasporto/renderer separati, lock/build registrati e candidateCI669 SUCCESS riferita; niente duplicati autoritativi.

**Limiti e residui:** Gate finale/postmerge ancoraD61, non inferito dal buildstorico.

**Fonti:** S08, S23, N10, N13, C669. Stato nello snapshot 669: PASS_TECHNICAL.

### D58 — PASS_TECHNICAL

Test del rischio reale

**Criterio di accettazione:** Controprove scientifiche, contratti Core, isolamento, un percorso E2E completo e recuperi principali; niente quantità di test usata come surrogato di qualità

**Scope:** all-fluidi-termodinamica-units

**Prova:** Il rischio è coperto da controprove scientifiche indipendenti,contratti Core,ACL/peer denial,corso16modelli/17ACK,readback17,guard e risposte409,mediaoffline/buffering e due esami reali con ripresa,più il percorso docente completo Core→OpenSaved→Replay2bef. Le regressioni osservate di reflow,seek e nomi SDK hanno correzioni riesaminate nel consumer distribuito; RED originali conservati.

**Limiti e residui:** PASS tecnico attribuito alle fonti e ai loro SHA,non conteggio di test come surrogato di qualità né ripetizione totale su2bef. Restano aree manuali/hardware e D22paste esplicite nelle righe; actualmain/CIpostmerge/rollback sono gate separati D61/D63. Nessuna approvazione scientifica umana.

**Fonti:** S04, N07, N01, N02, N03, N04, N05, N06, N08, N15, C_REPLAY, U01, U03, U05, U06, U07, U08, U11, U14, C_2BEF, U15. Stato nello snapshot 669: PARTIAL.

### D59 — PARTIAL

Prestazioni misurate

**Criterio di accettazione:** Dispositivo e rete dichiarati, budget concordati, niente misure del solo computer dello sviluppatore

**Scope:** all-fluidi-termodinamica-units

**Prova:** G3 completato:100 campioni validi sulla pagina visibile/focalizzata, p95 DOMcommit2.3ms e next-rAF17.4ms, soglia100ms PASS solo per Chromium/SwiftShader dichiarato. Storico270.4/280.1ms fallito conservato.

**Limiti e residui:** Device/rete/budget concordati NOT_RUN; questa misura software non prova input hardware,paint,FPS o tutti i modelli. Non sostituisce il criterio del dispositivo concordato.

**Fonti:** S09, N15. Stato nello snapshot 669: PARTIAL.

### D60 — PASS_TECHNICAL

Diagnostica operativa

**Criterio di accettazione:** Errori e versioni ricostruibili senza esporre token o risposte private nei log; procedura di ripristino conosciuta

**Scope:** all-fluidi-termodinamica-units

**Prova:** Health/release/errorireali ehashricostruibili senza segreti; restore/runbook ecleanupoperativoeseguiti con limitiautorità.

**Limiti e residui:** Rollbackcandidato separatoD63; nessuna credenziale o risposta privata ripubblicata inquesta matrice.

**Fonti:** S19, N01, N02, N04, N11. Stato nello snapshot 669: PASS_TECHNICAL.

### D61 — PARTIAL

Identità del rilascio

**Criterio di accettazione:** Commit, build, flag, contenuti e ambiente corrispondono alla versione accettata; CI richiesta verde

**Scope:** all-fluidi-termodinamica-units

**Prova:** Preview protetta 2bef con release/index esatti prima/dopo nella prova Core U14; HEAD locale letta corrispondente. Questa matrice non interroga CI né main finale.

**Limiti e residui:** In attesa di integrazione effettiva finale, actual main e CI post-merge, oltre al collaudo Studio corrente. Nessuna equivalenza fra preview e rilascio definitivamente accettato.

**Fonti:** N01, N02, N04, N05, N06, C669, U08, C_2BEF. Stato nello snapshot 669: PARTIAL.

### D62 — PASS_TECHNICAL

Browser dopo pubblicazione

**Criterio di accettazione:** Percorso reale verificato sulla URL destinata agli utenti con servizi effettivi, non soltanto su localhost

**Scope:** all-fluidi-termodinamica-units

**Prova:** Percorsi sullaURLprotettareale con servizieffettivi eSHA669, nonlocalhost; scenari indipendenti e limiti archiviati.

**Limiti e residui:** Ambito privatosintetico, nessuna dichiarazione di rilascio pubblico o hardware.

**Fonti:** N01, N02, N03, N04, N05, N06, N09, U03. Stato nello snapshot 669: PASS_TECHNICAL.

### D63 — NOT_RUN

Ritorno alla versione precedente

**Criterio di accettazione:** Rollback esercitato su candidato e compatibilità dei dati dichiarata

**Scope:** all-fluidi-termodinamica-units

**Prova:** Preparazione/versioniprecedenti e runbook presenti.

**Limiti e residui:** Rollback sul candidato ecompatibilitàdati finale non esercitati; SHAprecedente non equivale aprova.

**Fonti:** C669. Stato nello snapshot 669: NOT_RUN.

### D64 — PASS_TECHNICAL

eLab eliminato dal prodotto

**Criterio di accettazione:** Nessun ingresso, plugin «Sim» rinominato, consumer o dipendenza runtime residua; storia conservabile come archivio

**Scope:** all-fluidi-termodinamica-units

**Prova:** Rimozione 6223 percorsi/tombstone/boundarygate conSDK/Core generici conservati, nessunrenameSim runtime.

**Limiti e residui:** StoriaGit conservabile; prova sorgente/gate, nondistruzione archivio.

**Fonti:** S27. Stato nello snapshot 669: PASS_TECHNICAL.

### D65 — NOT_RUN

Revisione visiva nell'interazione

**Criterio di accettazione:** Andrea valuta i cinque stati principali in uso, non soltanto un mockup statico

**Scope:** all-fluidi-termodinamica-units

**Prova:** Schermate/interazioni disponibili per revisione; nessuna firma diAndrea inquesto audit.

**Limiti e residui:** Andrea deve valutare i cinque stati inuso; screenshotAI nonvalgonoaccettazione.

**Fonti:** C669. Stato nello snapshot 669: NOT_RUN.

### D66 — NOT_RUN

Osservazione di almeno cinque studenti rappresentativi

**Criterio di accettazione:** Almeno quattro su cinque completano i compiti UX principali senza suggerimenti dell'operatore; tutti i blocchi ricorrenti vengono risolti

**Scope:** all-fluidi-termodinamica-units

**Prova:** Nessun pilot di 5 studenti rappresentativi attestato; accountAuthsintetici distinti non sono partecipanti.

**Limiti e residui:** Osservare 5 studenti con 4/5 compiti senza aiuto e risolvere blocchi; non inventare risultati.

**Fonti:** C669, N12. Stato nello snapshot 669: NOT_RUN.

### D67 — HUMAN_PENDING

Transfer separato dall'usabilità

**Criterio di accettazione:** Risposte e motivazioni confrontate con rubrica; un insuccesso concettuale non viene nascosto da una UI facile

**Scope:** all-fluidi-termodinamica-units

**Prova:** 57 rubriche/transfer e 3 receipt tecnichereali presenti; nessuno score/clicksintetico prova comprensione.

**Limiti e residui:** Confronto umano risposte/motivazioni conrubriche e separazione dall’usabilità ancoraassenti.

**Fonti:** N12, N08. Stato nello snapshot 669: HUMAN_PENDING.

### D68 — PARTIAL

Chiusura dei difetti del perimetro

**Criterio di accettazione:** Nessuna perdita dati, errore scientifico, accesso indebito, funzione promessa assente o blocco del percorso; le rifiniture approvate sono effettivamente presenti

**Scope:** all-fluidi-termodinamica-units

**Prova:** Nello scope tecnico provato su2bef,Core e Studio superano i finding precedenti:reflow distribuito,apertura ordinaria della lezione salvata,interazione dopo seek e nomi SDK/zoom. Il report finale1C conferma hash persistiti invariati,zero richieste mutanti,logout proprio200 e vecchio cookie401. I tre FAIL b807 sono preservati come snapshot storico,non difetti correnti lasciati aperti.

**Limiti e residui:** PARTIAL globale per review manuali/incomplete,hardware e ambiente concordati,accettazioni umane e gate finali actualmain/CIpostmerge/rollback non attestati. Non è CHIUSURA1 o WCAG totale. Distinguere questi residui dalle regressioni tecniche chiuse nel perimetro testato:0/57 ACCEPTED,humanReview=false,humanApproval=false.

**Fonti:** N01, N02, N03, N04, N05, N06, N07, N11, N14, N15, C_G3_FIX, C_REPLAY, C669, U01, U03, U04, U05, U06, U07, U08, C_NAV_B807, U11, C_STUDIO_B807, U14, C_2BEF, U15. Stato nello snapshot 669: FAIL.

## Residui e gate

- D22: Paste reale NOT_RUN,clipboard OS non letta/modificata;non ogni min/max/passo è stato provato nel browser. Punto supportato,virgola nel campo numerico non promessa.
- D29, D36, D38, D39: Percorso completo tastiera/focus/occlusione,20 incomplete Core e definizioni dd/contrasti Studio,coerenza trascrizione richiedono review manuale;non certificazione WCAG totale.
- D40, D46, D59: Tablet/touch/penna,secondo dispositivo fisico,device/rete/budget concordati non eseguiti;browser/API/p95software sono prove distinte.
- D61, D63, D68: Actualmain,integrazione/CIpostmerge finale e rollback con compatibilità dati non attestati in questo snapshot.

D26 resta review umana della specificità dei cinque feedback: rubriche private e MANUAL_REVIEW_REQUIRED non diventano autograding libero. Le regressioni tecniche chiuse sono separate da questi residui e da D68 globale.

## Provenienza

Baseline: [requirements-baseline.json](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/work/plans/requirements-baseline.json), SHA-256 `4447d30c760fa84afa1811042658e80ea2f0f86e9b4633db0620a13ed9d92786`. Documento decisionale SHA-256 `64cac698ffad811966c61d39afab5250626b1aa9888e106eb8df3a024d36693c`. Tutti i 68 testi e scope sono identici. Snapshot 669 e vecchia draft immutati; sourceSnapshots.b807 conserva i tre FAIL precedenti.

Il JSON conserva l’intero catalogo fonti e gli hash storici S01–S30/N01–N17. Nuove fonti:

- **[U01](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/outputs/evidenze/g3-audit-d57b7c45.json)**: G3 hosted: 20 scans, zero violazioni, 20 incomplete colore; focus e conformità complessiva richiedono review manuale. Nessuna nuova misura performance. SHA-256 `3e0cbf7aaaf0a3a1f8a0294e7b32de259e1735f26f1e2fbf1fa216664aac9be1`.
- **[U02](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/outputs/evidenze/browser-compat-d57b7c45.json)**: Firefox e WebKit: smoke rappresentativo 2D/3D, camera/reset e ritorno/refresh completati; nessuna prova tablet/penna o fallback da context loss. SHA-256 `33b10aae016fe872bcb7900547f653b295869a69137f9b3adf893b0117106c09`.
- **[U03](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/outputs/evidenze/course-browser-matrix-392fff40.json)**: Matrice hosted: 16 modelli, 17 ACK, 8 controlli camera, quattro viewport CSS; passed=true. SHA-256 `46a84441470ce1c1b052af0ead2398a913a474064c81703db8208250a4cb4efb`.
- **[U04](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/work/plans/course-poiseuille-392fff40.json)**: Poiseuille hosted it-IT: Δp/Q, variazione raggio, campo/slider, nota parametri inattivi, raw vuoto e recupero; punto valido, virgola respinta dal dominio dopo normalizzazione nativa; nessun paste o salvataggio. SHA-256 `e5955697d76bda7b033acfda059edac5fc465856cdb42ffe21702c85ab6dd4fb`.
- **[U05](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/outputs/evidenze/studio-replay-red-392fff40.json)**: Replay reale: dati storici e readonly conservati; RED riprodotto di attivazione SDK dopo seek e due finding nomi accessibili. Report fallito preservato. SHA-256 `7d272e0aa1f98ede679c088f9b48119b745d6e3f88c8080af75dddc794d41755`.
- **[U06](/private/tmp/ardesia-closure1-recovery/work/plans/studio-replay-activation-report.md)**: Report writer: RED 10 regressioni, GREEN 72 test e typecheck Studio; fix attivazione integrato come 9007bdea. Collaudo browser ancora pendente. SHA-256 `10a2bc1ea94629051a90e32f08e94f852a4fe85f0b83369d65589353891e63af`.
- **[U07](/private/tmp/ardesia-closure1-recovery/work/plans/studio-replay-ui-followups-report.md)**: Report writer: link docente guardato, istruzione punto decimale, nomi SDK Replay; 74+12+13 test finali e typecheck Studio/Web PASS. Prove locali, nessun collaudo hosted dei fix. SHA-256 `9e448869a30e77fa22d9d12269380aae53b75b70757877620c42f6ef5b8c1cca`.
- **U08**: HEAD letta nel repository locale. Integrazione dei quattro fix presente; nuova preview e collaudo Studio finale non verificati da questo audit.
- **U09**: Lettura di contratti, consumer e definizioni test canonici per distinguere D14/D24/D26/D37. Non è nuovo test PASS o prova hosted. Nessun testo libero è trasformato in grader automatico.
- **C_NAV_B807**: Coordinatore riferisce WebGL context-loss reale con extension/isTrusted=true, fallback 2D e tabella invariati, zero writes. Stress CSS 200% a 360 px rileva clipping formula/ipotesi: no document overflow non equivale a reflow PASS. Fix CSS assegnato e retest pendente.
- **[U10](/private/tmp/ardesia-closure1-recovery/work/evidence/numeric-pause-b8075876-2026-10-28T19-23-23-213Z/report.json)**: D14 PASS reale canonico; D24 non raggiunto dal percorso autenticato: report misto preservato, non PASS totale. SHA-256 `5f38ad00c75f781de3b23dc7ae4d46a8d4f3015ffe191d1c1247bf01c71a182d`.
- **[U11](/private/tmp/ardesia-closure1-recovery/work/evidence/g3-a11y-2026-10-28T19-17-13-825Z/report.json)**: G3 b807: 20 scans, zero violazioni, 20 incomplete. Non copre tutto Studio e non certifica WCAG. SHA-256 `6782345887f0912ff43d80adc0fadabd1d240e649ffd33756ed63e52c4629708`.
- **[U12](/private/tmp/ardesia-closure1-recovery/work/evidence/g3-a11y-2026-10-28T19-21-13-166Z/report.json)**: Context loss nativo b807 con isTrusted=true e recupero 2D, parametri/previsione/note/tabella invariati, zero scritture. CSS root 200% è stress, non zoom browser; clipping riferito dal coordinatore, nessun reflow PASS dedotto dal no-overflow. SHA-256 `4bf464b7d58334b0d180126689d42e1ebd10a3a962cec1ff6e9d56b8a4ff8d20`.
- **[U13](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/work/plans/course-numeric-pause-b8075876-report.json)**: D14 e D24 PASS in run distinti; primi due D24 non conclusivi preservati, nessun singolo run globale verde. Own logout200/oldcookie401, ledger invariato, browser chiusi. SHA-256 `aed434fcff177f58120b0aea6b00c13ccaba5588dda3a550113fcf9b6a4ec54d`.
- **C_STUDIO_B807**: Coordinatore conferma SDK reset-zoom con percentuale tra parentesi ancora in violazione axe nel consumer Studio; la scansione Web non lo copre. OpenSavedLesson UX non conclusa: ripristinare file con diverso lesson id nel workspace nuovo è correttamente rifiutato; serve azione ordinaria distinta, senza allentare validazione. Fix zoom 7f8934ab con 53 test PASS riferiti, fix CSS e media in corso: non accettazione hosted b807 né nuova head.
- **[U14](/private/tmp/ardesia-closure1-recovery/work/evidence/g3-a11y-2026-10-28T19-37-57-319Z/report.json)**: Core 2bef: 20 scans axe, 0 violazioni, 20 incomplete; reflow CSS200 distribuito a360/1440 senza CSS correttivo iniettato, nessun overflow prosa/celle, parametri/misure invariati, errore visibile e recuperato. Guida decimale e note inattive collegate; link docente nativo44px osservato, non attivato. Zero scritture, ledger invariato. Non Studio, native zoom, hardware o performance. SHA-256 `9fbe02cd064409789bdf4b1197b2e14a5a0284d7059f4b6a7586544cbd506b44`.
- **C_2BEF**: Preview protetta corrente 2bef; review 1C delle due patch e zoom CLEAN. Collaudo browser Studio ancora in attesa; nessuna nuova numerica necessaria perché sorgenti fisica/corso immutate secondo coordinatore. Non nuova esecuzione dei casi storici.
- **[U15](/Users/andreamarro/Documents/Codex/2026-10-28/files-pasted-by-the-user-ardesia/outputs/evidenze/studio-replay-2bef6629.json)**: 1C finale: docente Core→Studio→Materiali→OpenSaved→anteprima/cancel/conferma originale→Room→Replay, senza URL manuali. Stanza nuova conservata, journal esistente non unito con messaggio visibile. Seek2→5→3.25→4.25→5→2 e wheel460px, zoom110% dinamico PASS; axe1440/360 con cinque tag,zero violazioni,quattro dd e contrasto incomplete. Hashpersistenza invariati,zero observedWrites e richieste mutanti,logout proprio200/oldcookie401,tutti browser chiusi riferiti. Risultati storici ricalcolati distinti da confronto originale; Pascal/3D resta prova b807 separata. Pubblico prelogin /study/course404 conservato,fuori dal consumer privato provato. SHA-256 `725628aaef0b9ca73ca0f31e3e777337e62c26f17f22cfef62e31a6cfe1a5d78`.

Generazione dello snapshot soltanto documentale, senza nuovi browser/build/test. Il follow-up D14/D24 è una prova precedente separata e autorizzata. Root gestisce integrazione e rilascio; nessun documento Root o sorgente prodotto modificato.
