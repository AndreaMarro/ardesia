---
id: ardesia-partner-vision-alignment-questionnaire-40
status: active-decision-instrument
freshness: 2026-07-15T06:26:00+02:00
authority: decision-recording-instrument
---

# Ardesia — questionario di allineamento visione in 40 domande

## Scopo e regola d'uso

Questo strumento serve ad Andrea e al socio per rendere visibili accordi,
divergenze e decisioni ancora aperte prima del founder beta. Registra scelte;
non crea consenso e non sostituisce ADR, patti societari, pareri legali, test o
ricevute runtime.

Selezionare una sola opzione per domanda. Le opzioni sono mutuamente esclusive:
se nessuna descrive la posizione condivisa, non selezionarne una per
approssimazione e marcare la decisione `IRRISOLTA` nella matrice finale. La nota
breve serve a indicare condizioni, evidenze mancanti o una quarta formulazione
da riportare in una versione successiva; non modifica implicitamente la scelta.

Le etichette hanno significati distinti:

- `TESI-ANDREA-CONFERMATA`: discende da un ordine corrente, da ADR-0004 o dal
  piano fondativo 1→9; resta una tesi, non una prova di implementazione.
- `TESI-ANDREA-DA-CONFERMARE`: è l'ipotesi operativa più coerente con il piano,
  ma Andrea deve sceglierla, correggerla o respingerla qui.
- `Alternativa credibile`: opzione realmente praticabile, con il proprio costo;
  non è una caricatura della tesi corrente.

## Mappa iniziale delle tesi

| Area | Tesi Andrea corrente | Stato | Alternative da confrontare | Domande |
|---|---|---|---|---|
| North star | AI-native nell'esperienza, evidenze autorevoli, autorità deterministica | `TESI-ANDREA-CONFERMATA` | AI-authoritative oppure prodotto solo deterministico | Q03, Q14 |
| Utente iniziale | Andrea/docente conduce il golden path; studente e istituto sono destinatari successivi | `TESI-ANDREA-CONFERMATA` | istituto-first oppure student-first | Q01, Q05, Q21 |
| Continuità | cattura e journal continuano offline; il cloud non finge persistenza | `TESI-ANDREA-CONFERMATA` | cloud-required oppure documenti manuali | Q06, Q15, Q17 |
| Prodotto | Studio unico e coerente, non collezione di demo o verticali scollegati | `TESI-ANDREA-DA-CONFERMARE` | suite separata oppure piattaforma generica | Q02, Q04, Q09 |
| Architettura | kernel isolato, porte inward, adapter sostituibili e recovery verificabile | `TESI-ANDREA-CONFERMATA` | integrazione diretta oppure riscrittura big-bang | Q11–Q20 |
| Business | founder-led beta e valore dimostrato prima di marketplace o scala commerciale | `TESI-ANDREA-DA-CONFERMARE` | vendita istituzionale precoce oppure crescita freemium | Q21–Q30 |
| Governance | una decisione esplicita ha owner, soglia, receipt e via di escalation | `TESI-ANDREA-DA-CONFERMARE` | unanimità informale oppure delega totale implicita | Q31–Q40 |
| Design | Design Canon 0.1 guida le superfici, ma non prova il runtime | `TESI-ANDREA-CONFERMATA` | UI puramente funzionale oppure redesign non versionato | Q08, Q10 |

## A. Prodotto e golden path

### Q01 — Chi è il primo utente per cui Ardesia deve essere indispensabile?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): Andrea/docente che prepara, conduce e riprende la lezione — Trade-off: ottimizza profondità e apprendimento rapido ma restringe il mercato iniziale.
- [ ] B. Alternativa credibile: coordinatore o istituto che governa più docenti — Trade-off: aumenta il valore contrattuale ma anticipa ruoli, procurement e amministrazione.
- [ ] C. Alternativa credibile: studente che studia e ripassa in autonomia — Trade-off: amplia la frequenza d'uso ma indebolisce il golden path docente-first.

**Nota breve:** ________________________________________________

### Q02 — Quale sequenza definisce il golden path del founder beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): apri lezione → cattura evidenze → usa lavagna/plugin → chiudi → riprendi con continuità — Trade-off: misura il ciclo reale ma rinvia funzioni laterali.
- [ ] B. Alternativa credibile: prepara contenuti e pack prima della lezione, senza prova live completa — Trade-off: consegna valore editoriale prima ma non dimostra LessonOS.
- [ ] C. Alternativa credibile: genera recap e materiali soltanto dopo la lezione — Trade-off: riduce il rischio live ma lascia irrisolti cattura e recovery.

**Nota breve:** ________________________________________________

### Q03 — Quale confine deve separare AI, evidenze e azioni?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): l'AI propone con citazioni; kernel e docente governano scope, attestazione e applicazione — Trade-off: più passaggi e contratti, in cambio di auditabilità.
- [ ] B. Alternativa credibile: l'AI applica automaticamente le proposte ad alta confidenza — Trade-off: velocità maggiore ma autorità probabilistica e rollback più rischioso.
- [ ] C. Alternativa credibile: nessuna AI nel percorso principale — Trade-off: massima prevedibilità ma perdita del valore AI-native di comprensione e generazione.

**Nota breve:** ________________________________________________

### Q04 — Quante superfici principali deve percepire il docente?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): un solo Ardesia Studio con Lavagna, Knowledge, Library e Marketplace coerenti — Trade-off: navigazione unificata ma maggiore disciplina sui confini interni.
- [ ] B. Alternativa credibile: applicazioni distinte per lezione, conoscenza e materiali — Trade-off: responsabilità tecniche nette ma continuità UX e dati più fragile.
- [ ] C. Alternativa credibile: dashboard modulare completamente configurabile — Trade-off: flessibilità alta ma onboarding e supporto più complessi.

**Nota breve:** ________________________________________________

### Q05 — Che cosa deve provare per primo il founder beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): Andrea completa e riprende lezioni reali con evidenza verificabile e recovery — Trade-off: campione piccolo ma prova forte del workflow.
- [ ] B. Alternativa credibile: un catalogo ampio di feature funziona in demo — Trade-off: percezione di completezza ma scarsa evidenza di uso continuativo.
- [ ] C. Alternativa credibile: più docenti iniziano l'onboarding, anche senza ciclo completo — Trade-off: segnale di domanda più ampio ma affidabilità del prodotto non dimostrata.

**Nota breve:** ________________________________________________

### Q06 — Quale promessa vale quando rete o provider AI non sono disponibili?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): cattura, journal e riapertura locali continuano; le proposte AI restano assenti o in coda visibile — Trade-off: più lavoro locale ma nessuna perdita silenziosa.
- [ ] B. Alternativa credibile: la lezione richiede connessione e si blocca esplicitamente offline — Trade-off: architettura più semplice ma rischio operativo in aula.
- [ ] C. Alternativa credibile: fallback manuale su documenti esportati — Trade-off: resilienza procedurale ma continuità e provenienza frammentate.

**Nota breve:** ________________________________________________

### Q07 — Quando un artefatto diventa visibile allo studente?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): solo dopo azione distinta di review e `publish` del docente — Trade-off: controllo forte ma maggiore carico di approvazione.
- [ ] B. Alternativa credibile: automaticamente alla chiusura della lezione — Trade-off: consegna immediata ma rischio di contenuti incompleti o non attestati.
- [ ] C. Alternativa credibile: secondo regole preapprovate per tipo di artefatto — Trade-off: scala meglio ma introduce policy e casi limite prima del beta.

**Nota breve:** ________________________________________________

### Q08 — Quale unità rende comprensibile la continuità fra lezioni?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): evidenze, concetti, errori e open loop collegati in un grafo verificabile — Trade-off: grande potere esplicativo ma proiezioni e provenienza da mantenere.
- [ ] B. Alternativa credibile: timeline cronologica di lezioni e materiali — Trade-off: più semplice da capire ma relazioni pedagogiche meno esplicite.
- [ ] C. Alternativa credibile: cartelle e tag curati manualmente — Trade-off: controllo totale al docente ma alto lavoro di manutenzione.

**Nota breve:** ________________________________________________

### Q09 — Qual è il ruolo dei plugin nel prodotto iniziale?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): strumenti capability-closed che producono evidenze nel journal, con ELAB come verticale prova — Trade-off: integrazione profonda ma contratto host rigoroso.
- [ ] B. Alternativa credibile: embed indipendenti che vivono accanto alla lavagna — Trade-off: integrazione rapida ma stato ed evidenze paralleli.
- [ ] C. Alternativa credibile: rinviare i plugin dopo il founder beta — Trade-off: kernel più focalizzato ma nessuna prova del verticale AI-native composabile.

**Nota breve:** ________________________________________________

### Q10 — Quale standard UX è bloccante per il founder beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): iPad/Safari-first, accessibile, leggibile su LIM e coerente con Design Canon 0.1 — Trade-off: test mirati e vincoli forti, in cambio di uso reale affidabile.
- [ ] B. Alternativa credibile: desktop Chrome-first fino alla stabilizzazione — Trade-off: sviluppo più rapido ma mismatch con il contesto d'aula.
- [ ] C. Alternativa credibile: responsive generico senza dispositivo prioritario — Trade-off: copertura nominale ampia ma nessun ambiente realmente ottimizzato.

**Nota breve:** ________________________________________________

## B. Tecnica e architettura

### Q11 — Quale forma architetturale governa l'evoluzione?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): monorepo modulare con dominio → kernel → application → adapter → UI e porte inward — Trade-off: migrazione disciplinata ma più contratti espliciti.
- [ ] B. Alternativa credibile: moduli verticali indipendenti con integrazione via API interne — Trade-off: autonomia locale ma duplicazione di identità e stato.
- [ ] C. Alternativa credibile: riscrittura completa del kernel prima di altre feature — Trade-off: coerenza teorica ma alto rischio big-bang e ritardo del beta.

**Nota breve:** ________________________________________________

### Q12 — Quale garanzia minima deve offrire il kernel di LessonOS?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): sequenza atomica multi-contesto e database fisicamente distinto per room validata — Trade-off: test di concorrenza e migrazione più complessi.
- [ ] B. Alternativa credibile: un database condiviso con chiavi logiche per room — Trade-off: implementazione più semplice ma isolamento più debole.
- [ ] C. Alternativa credibile: storage cloud come arbitro unico già nel beta — Trade-off: consistenza centralizzata ma dipendenza di rete e maggior rischio privacy.

**Nota breve:** ________________________________________________

### Q13 — Come si divide il runtime cloud quando sarà autorizzato?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): Vercel per Studio/edge preview e Render solo per API/worker assegnati da ADR — Trade-off: ownership chiara ma due piani operativi da provare.
- [ ] B. Alternativa credibile: tutto su Vercel, inclusi job compatibili — Trade-off: un solo provider ma limiti sui workload lunghi.
- [ ] C. Alternativa credibile: tutto su Render, incluso frontend — Trade-off: runtime uniforme ma rinuncia al flusso preview già predisposto.

**Nota breve:** ________________________________________________

### Q14 — Come entra un provider AI nell'architettura?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): adapter server-side sostituibile dietro porta, schema ed eval versionati — Trade-off: più infrastruttura ma nessun lock-in nel dominio o nel browser.
- [ ] B. Alternativa credibile: SDK del provider direttamente nell'application layer — Trade-off: time-to-market migliore ma sostituzione e test più fragili.
- [ ] C. Alternativa credibile: un solo provider fisso fino a product-market fit — Trade-off: meno complessità iniziale ma dipendenza strategica esplicita.

**Nota breve:** ________________________________________________

### Q15 — Qual è la fonte tecnica della cronologia di una lezione?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): journal append-only con eventi unici/idempotenti e proiezioni ricostruibili — Trade-off: disciplina sugli eventi ma audit e recovery robusti.
- [ ] B. Alternativa credibile: snapshot corrente salvato a ogni modifica — Trade-off: letture semplici ma storia e conflitti difficili da spiegare.
- [ ] C. Alternativa credibile: documenti separati per ciascuna superficie — Trade-off: ownership locale chiara ma una seconda fonte per ogni integrazione.

**Nota breve:** ________________________________________________

### Q16 — Che cosa deve garantire export/import prima del beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): bundle versionato, validazione ostile, hash, dry-run, rollback e restore provato per room — Trade-off: maggior lavoro di contratto ma recovery verificabile.
- [ ] B. Alternativa credibile: export leggibile per backup senza reimport automatico — Trade-off: valore immediato ma nessuna prova di continuità.
- [ ] C. Alternativa credibile: backup cloud trasparente gestito dal provider — Trade-off: UX semplice ma portabilità e autorità meno controllabili.

**Nota breve:** ________________________________________________

### Q17 — Quale livello di concorrenza supporta il founder beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): single-writer su iPad/Safari con collisioni fail-closed — Trade-off: meno casi distribuiti ma limite esplicito al multi-device.
- [ ] B. Alternativa credibile: ultimo writer vince fra più device — Trade-off: UX permissiva ma perdita di modifiche possibile.
- [ ] C. Alternativa credibile: collaborazione realtime completa — Trade-off: valore futuro alto ma CRDT, presenza e privacy ampliano troppo il primo gate.

**Nota breve:** ________________________________________________

### Q18 — Quale confine di sicurezza deve avere un plugin?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): manifest firmabile, capability minime, handshake collaudato, nessun canale laterale — Trade-off: onboarding plugin più severo ma superficie d'attacco ridotta.
- [ ] B. Alternativa credibile: plugin trusted first-party con accesso ampio — Trade-off: iterazione rapida ma contratto difficile da restringere dopo.
- [ ] C. Alternativa credibile: plugin remoto in iframe isolato — Trade-off: sandbox browser utile ma integrazione con evidenze e offline più limitata.

**Nota breve:** ________________________________________________

### Q19 — Quale telemetria è accettabile per il beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): errori ed eventi sintetici allowlisted, PII/replay/autocapture/testo libero negati per default — Trade-off: diagnosi meno ricca ma privacy verificabile.
- [ ] B. Alternativa credibile: telemetria tecnica ampia con redazione a valle — Trade-off: debug migliore ma rischio di egress prima del filtro.
- [ ] C. Alternativa credibile: nessuna telemetria esterna — Trade-off: privacy semplice ma incidenti e comportamento beta meno osservabili.

**Nota breve:** ________________________________________________

### Q20 — Quale prova rende pubblicabile un candidato?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): test/build/audit/review e artefatti legati all'esatto SHA, poi CI remota prima di pubblicare — Trade-off: ciclo più lento ma nessun falso verde cross-plane.
- [ ] B. Alternativa credibile: test locali verdi e review umana sono sufficienti — Trade-off: velocità maggiore ma ambiente remoto non provato.
- [ ] C. Alternativa credibile: preview funzionante vale come gate principale — Trade-off: feedback visivo rapido ma copertura e provenienza incomplete.

**Nota breve:** ________________________________________________

## C. Business e go-to-market

### Q21 — Qual è il primo segmento pagante da validare?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): docenti indipendenti o piccoli team con workflow pratico ricorrente — Trade-off: vendita rapida ma ticket medio contenuto.
- [ ] B. Alternativa credibile: scuole e reti scolastiche — Trade-off: contratti più grandi ma procurement, compliance e tempi lunghi.
- [ ] C. Alternativa credibile: enti di formazione tecnica e laboratori — Trade-off: fit verticale forte ma mercato iniziale più frammentato.

**Nota breve:** ________________________________________________

### Q22 — Quale unità di prezzo è più coerente con il valore iniziale?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): abbonamento per docente con soglie trasparenti di AI/storage — Trade-off: allinea uso e buyer ma richiede controllo costi per persona.
- [ ] B. Alternativa credibile: licenza annuale per istituto — Trade-off: ricavo prevedibile ma onboarding e vendita più complessi.
- [ ] C. Alternativa credibile: freemium con pack e plugin a pagamento — Trade-off: adozione più facile ma monetizzazione e marketplace prematuri.

**Nota breve:** ________________________________________________

### Q23 — Quanto tempo può passare prima del primo valore percepito?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): una lezione completa nello stesso giorno, senza setup tecnico — Trade-off: onboarding molto focalizzato ma meno personalizzazione iniziale.
- [ ] B. Alternativa credibile: una settimana di configurazione guidata — Trade-off: setup più preciso ma rischio di abbandono.
- [ ] C. Alternativa credibile: servizio assistito che prepara il primo workspace — Trade-off: successo controllato ma costo umano non scalabile.

**Nota breve:** ________________________________________________

### Q24 — Come entrano i verticali vendibili come ELAB Tutor?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): kit verticali verificati sopra il kernel comune, con buyer, risultato e unit economics propri — Trade-off: riuso della piattaforma ma validazione distinta per verticale.
- [ ] B. Alternativa credibile: un solo prodotto orizzontale configurabile — Trade-off: brand semplice ma valore meno concreto per disciplina.
- [ ] C. Alternativa credibile: prodotti verticali separati con stack autonomi — Trade-off: posizionamento netto ma duplicazione tecnica e conoscitiva.

**Nota breve:** ________________________________________________

### Q25 — Quando è opportuno aprire il marketplace?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): dopo che plugin first-party e almeno un verticale provano sicurezza, valore e supporto — Trade-off: crescita più lenta ma standard credibile.
- [ ] B. Alternativa credibile: durante il beta solo su invito — Trade-off: apprendimento anticipato ma moderazione e supply chain in scope.
- [ ] C. Alternativa credibile: subito come catalogo aperto — Trade-off: varietà rapida ma rischio alto su qualità, licenze e fiducia.

**Nota breve:** ________________________________________________

### Q26 — Qual è la prima evidenza economica sufficiente per proseguire?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): uso ricorrente più disponibilità a pagare da design partner identificati — Trade-off: segnale qualitativo forte ma campione piccolo.
- [ ] B. Alternativa credibile: prime entrate, anche da servizi manuali — Trade-off: cassa reale ma confonde software e consulenza.
- [ ] C. Alternativa credibile: crescita di utenti attivi senza prezzo testato — Trade-off: domanda più ampia ma monetizzazione ignota.

**Nota breve:** ________________________________________________

### Q27 — Quanto servizio umano accompagna il prodotto iniziale?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): onboarding founder-led misurato e trasformato in prodotto — Trade-off: apprendimento rapido ma tempo dei soci vincolato.
- [ ] B. Alternativa credibile: self-service fin dal primo beta — Trade-off: prova di scalabilità ma feedback meno contestuale.
- [ ] C. Alternativa credibile: servizio premium continuativo — Trade-off: ricavo e successo maggiori ma margine software più basso.

**Nota breve:** ________________________________________________

### Q28 — Quale limite economico governa AI e cloud?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): budget per lezione/utente con degradazione visibile e nessun overage implicito — Trade-off: esperienza più controllata ma ottimizzazione e routing necessari.
- [ ] B. Alternativa credibile: uso illimitato incluso nel prezzo — Trade-off: proposta semplice ma margine esposto a utenti intensivi.
- [ ] C. Alternativa credibile: consumo a credito separato — Trade-off: costo tracciabile ma UX e fatturazione più complesse.

**Nota breve:** ________________________________________________

### Q29 — Quale canale acquisisce i primi clienti?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): vendita founder-led a design partner e reti professionali — Trade-off: insight profondi ma crescita non automatica.
- [ ] B. Alternativa credibile: partnership con editori o fornitori scolastici — Trade-off: distribuzione ampia ma dipendenza commerciale e tempi negoziali.
- [ ] C. Alternativa credibile: contenuti, community e prova gratuita online — Trade-off: scala potenziale ma conversione lenta e supporto diffuso.

**Nota breve:** ________________________________________________

### Q30 — Quale risultato obbliga a fermare o cambiare tesi?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): stop se il golden path non è usato ricorrentemente o non riduce lavoro/errore entro la finestra beta definita — Trade-off: disciplina forte ma può tagliare apprendimento ancora immaturo.
- [ ] B. Alternativa credibile: continuare finché affidabilità tecnica e UX migliorano — Trade-off: più tempo per convergere ma rischio sunk cost.
- [ ] C. Alternativa credibile: pivotare quando una singola verticale mostra domanda superiore — Trade-off: segue il mercato ma può frammentare la piattaforma.

**Nota breve:** ________________________________________________

## D. Governance e patto fra soci

### Q31 — Chi possiede l'ultima parola sulla visione prodotto?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): Andrea è product owner finale dopo confronto e receipt della decisione — Trade-off: velocità e coerenza, con rischio di concentrazione.
- [ ] B. Alternativa credibile: consenso unanime fra soci — Trade-off: allineamento forte ma possibile stallo.
- [ ] C. Alternativa credibile: delega per area con arbitrato esterno sui conflitti — Trade-off: competenze distribuite ma processo più formale.

**Nota breve:** ________________________________________________

### Q32 — Quando diventa operativo un accordo economico fra soci?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): solo dopo documento esplicito su quote, vesting, cliff, IP e uscita, validato professionalmente — Trade-off: avvio più lento ma aspettative verificabili.
- [ ] B. Alternativa credibile: accordo semplice sulle quote, dettagli dopo il beta — Trade-off: partenza rapida ma rischio di conflitto differito.
- [ ] C. Alternativa credibile: collaborazione contrattuale senza equity fino a trazione — Trade-off: reversibilità alta ma incentivo proprietario minore.

**Nota breve:** ________________________________________________

### Q33 — Come si risolve un disaccordo che blocca una milestone?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): evidenze e stop rule predefinite, poi owner nominato decide e registra — Trade-off: decisione rapida ma richiede fiducia nell'owner.
- [ ] B. Alternativa credibile: esperimento time-boxed decide fra le opzioni — Trade-off: apprendimento falsificabile ma non tutti i conflitti sono testabili.
- [ ] C. Alternativa credibile: mediatore o advisor indipendente — Trade-off: neutralità maggiore ma tempo e possibile costo esterno.

**Nota breve:** ________________________________________________

### Q34 — Quale spesa può essere approvata autonomamente?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): soglia mensile e per acquisto scritta; oltre soglia serve consenso esplicito — Trade-off: controllo di cassa ma più passaggi.
- [ ] B. Alternativa credibile: budget separato per area e socio — Trade-off: autonomia operativa ma rischio di ottimizzazioni locali.
- [ ] C. Alternativa credibile: ogni spesa richiede doppia approvazione — Trade-off: massima prudenza ma forte attrito quotidiano.

**Nota breve:** ________________________________________________

### Q35 — Chi governa privacy e trattamento dei dati?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): ruoli, scopi, base giuridica, fornitori e incident owner sono espliciti prima di dati reali — Trade-off: gate severo ma tutela minori e accountability.
- [ ] B. Alternativa credibile: il provider cloud copre gli obblighi operativi principali — Trade-off: meno lavoro interno ma responsabilità non delegabile e visibilità ridotta.
- [ ] C. Alternativa credibile: beta solo sintetico fino a consulenza e policy complete — Trade-off: rischio minimo ma nessuna evidenza su flussi reali.

**Nota breve:** ________________________________________________

### Q36 — A chi appartengono codice, design, prompt e contenuti creati?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): IP preesistente resta attribuito; nuovo IP viene ceduto/licenziato alla società per iscritto — Trade-off: catena di titolarità chiara ma inventario iniziale oneroso.
- [ ] B. Alternativa credibile: tutto il lavoro confluisce automaticamente nella società — Trade-off: semplicità futura ma contestazioni sul pregresso.
- [ ] C. Alternativa credibile: ogni socio conserva IP e concede licenza d'uso — Trade-off: reversibilità personale ma due diligence e uscita più fragili.

**Nota breve:** ________________________________________________

### Q37 — Quale parte di Ardesia può essere open source?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): contratti/kernel selezionati aperti, dati, verticali e servizi gestiti differenzianti protetti — Trade-off: ecosistema e fiducia, con confine da mantenere.
- [ ] B. Alternativa credibile: core interamente proprietario — Trade-off: controllo commerciale ma meno adozione e contributi.
- [ ] C. Alternativa credibile: piattaforma open source con ricavi da hosting e pack — Trade-off: distribuzione ampia ma monetizzazione e supporto più impegnativi.

**Nota breve:** ________________________________________________

### Q38 — Chi autorizza release, deploy e pubblicazione agli utenti?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): gate tecnici exact-SHA più approvazione umana distinta per produzione e dati reali — Trade-off: rilascio controllato ma meno frequente.
- [ ] B. Alternativa credibile: CI verde promuove automaticamente fino a produzione — Trade-off: velocità alta ma autorità operativa automatizzata.
- [ ] C. Alternativa credibile: un socio release manager decide dopo checklist — Trade-off: ownership chiara ma bus factor elevato.

**Nota breve:** ________________________________________________

### Q39 — Chi può fermare il sistema durante un incidente?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-DA-CONFERMARE`): ogni socio può attivare kill switch; ripartenza richiede owner, evidenza e doppia conferma — Trade-off: contenimento rapido ma riavvio più lento.
- [ ] B. Alternativa credibile: solo incident owner può fermare e riavviare — Trade-off: coordinamento semplice ma rischio di indisponibilità dell'owner.
- [ ] C. Alternativa credibile: automazione ferma e riparte secondo soglie — Trade-off: reazione veloce ma false positive e autorità automatica da governare.

**Nota breve:** ________________________________________________

### Q40 — Quale esito chiude davvero l'esperimento founder beta?

- [ ] A. Tesi Andrea attuale (`TESI-ANDREA-CONFERMATA`): evidence pack con lezioni completate/riprese, failure/recovery, utilità, costo e decisione go/iterate/stop — Trade-off: prova multidimensionale ma preparazione rigorosa.
- [ ] B. Alternativa credibile: Andrea dichiara il prodotto abbastanza utile per continuare — Trade-off: decisione rapida ma criterio poco trasferibile.
- [ ] C. Alternativa credibile: soglia quantitativa di utilizzo e soddisfazione decide da sola — Trade-off: comparabilità maggiore ma campione founder troppo piccolo per overclaim.

**Nota breve:** ________________________________________________

## Matrice finale di convergenza

Compilare questa matrice dopo le 40 risposte. Una riga passa da `IRRISOLTA` a
`CONVERGENTE` soltanto se le risposte citate sono compatibili e la formulazione
comune è scritta nella colonna “Decisione registrata”. `DIVERGENTE` richiede un
owner e una data; nessun automatismo trasforma checkbox simili in consenso.

| ID | Decisione | Domande | Decisione registrata / evidenza | Owner e scadenza | Stato iniziale |
|---|---|---|---|---|---|
| D01 | Utente, golden path e prova del beta | Q01, Q02, Q05 | Da compilare | Da assegnare | `IRRISOLTA` |
| D02 | Autorità AI e pubblicazione | Q03, Q07 | Da compilare | Da assegnare | `IRRISOLTA` |
| D03 | Superfici, knowledge, plugin e UX | Q04, Q08, Q09, Q10 | Da compilare | Da assegnare | `IRRISOLTA` |
| D04 | Kernel, storage e journal | Q11, Q12, Q15, Q17 | Da compilare | Da assegnare | `IRRISOLTA` |
| D05 | Cloud, provider, recovery e qualità | Q06, Q13, Q14, Q16, Q18, Q19, Q20 | Da compilare | Da assegnare | `IRRISOLTA` |
| D06 | Segmento, prezzo e time-to-value | Q21, Q22, Q23 | Da compilare | Da assegnare | `IRRISOLTA` |
| D07 | Verticali, marketplace e prova economica | Q24, Q25, Q26 | Da compilare | Da assegnare | `IRRISOLTA` |
| D08 | Servizio, costi, canale e stop rule | Q27, Q28, Q29, Q30 | Da compilare | Da assegnare | `IRRISOLTA` |
| D09 | Diritti decisionali, accordo e spesa | Q31, Q32, Q33, Q34 | Da compilare | Da assegnare | `IRRISOLTA` |
| D10 | Privacy, IP, open source, release e incidenti | Q35, Q36, Q37, Q38, Q39, Q40 | Da compilare | Da assegnare | `IRRISOLTA` |

## Chiusura

Al termine, creare una lista separata delle sole decisioni convergenti, con
owner, data, fonte e meccanismo di revisione. Le divergenze restano visibili;
questo questionario non autorizza commit, spesa, trattamento di dati, accordi
societari, pubblicazione o deploy.
