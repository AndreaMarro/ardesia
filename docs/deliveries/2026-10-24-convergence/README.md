# Ardesia — consegna di convergenza, 24 ottobre 2026

## Giudizio indipendente

La direzione tecnologica contiene basi valide; il percorso di prodotto è ancora frammentato. I microcorsi possono essere la prima offerta sostenibile, ma la quantità di quesiti e una landing curata non rendono visibile il vantaggio di Ardesia. La priorità è collegare la lezione persistente, l'evidenza dell'errore, la revisione del docente e la prova successiva.

**Ardesia è il prodotto. LessonOS è un sottosistema. Kirchhoff e i simulatori sono capacità specialistiche.** Questo principio è ripristinato nel [PRODUCT-CANON](../../PRODUCT-CANON.md), senza creare un'altra visione concorrente.

Questa consegna aggiunge codice applicativo, regressioni, prove browser e ricerca riproducibile. Non certifica una beta integrata, un nuovo deploy o una funzionalità audio attivabile nella Room.

## 1. Base, ambito e autorità

| Elemento | Rilevazione |
| --- | --- |
| Repository canonico | `AndreaMarro/ardesia` |
| Main osservato via GitHub | `b124eee04acc8062c27284f23c5d9108e3767c27` |
| Base applicativa esaminata e modificata | [PR #290](https://github.com/AndreaMarro/ardesia/pull/290), `339ab08f4139da0b37e78bbde81e9fe4e83afea0` |
| Branch di questo incremento | `pro/ardesia-living-lesson-audio-20261024` |
| Review esistenti preservate | [#291](https://github.com/AndreaMarro/ardesia/pull/291), [#293](https://github.com/AndreaMarro/ardesia/pull/293), [#295](https://github.com/AndreaMarro/ardesia/pull/295); [#296](https://github.com/AndreaMarro/ardesia/pull/296) è un indice editoriale |
| Diff applicativo | AudioRecorder, replay della room, confine Excalidraw→journal e regressioni; nessun nuovo provider o database |
| Produzione | Nessun merge, deploy o mutazione di dati reali eseguito da questa consegna |

Le basi delle PR di audit non coincidono con lo stack applicativo: non vanno unite indiscriminatamente. Questo branch deriva da #290 per ottenere un diff applicativo piccolo e revisionabile. La lunga catena ancora aperta rimane un rischio di integrazione da risolvere con un candidato esplicito e una verifica sul suo SHA finale.

La cronologia combina sorgenti e metadata dei repository accessibili, PR e conversazioni recuperate. **Non è una certificazione di lettura integrale di tutte le chat o di tutti i repository privati.** L'inventario distingue codice letto, risultati degli autori, esecuzioni nuove e aspetti non verificati. I contenuti privati di `ardesia-knowledge` e dei volumi non sono copiati qui.

## 2. Come leggere la consegna

| Documento | Contenuto e autorità |
| --- | --- |
| [architecture-report.md](architecture-report.md) | Cronologia, repository donor, inventario, debito, prove e vincoli di integrazione |
| [product-pedagogy-economics.md](product-pedagogy-economics.md) | Cinque journey, nove fonti scientifiche, otto benchmark, esperienza Poiseuille, design e scenari economici |
| [rea-research.md](rea-research.md) | REA 6.7.0, esperimento eseguito, tre protocolli, ArtCraft, riuso e licenze |
| [multimodal-mcp-contracts.md](multimodal-mcp-contracts.md) | Contratti del ponte audio/lezione/memoria e delta MCP rispetto alla RFC esistente |
| [Revisione avversariale](../../reviews/PRO_ADVERSARIAL_REVIEW_GPT61_2026-10-24.md) | Decisioni confermate, errori riprodotti, alternative, priorità e costi |
| [status.json](status.json) | Indice sintetico di stati, ownership, dipendenze e gate; snapshot, non stato live |
| [validation.md](validation.md) | Comandi, risultati, limiti, riproduzione e rollback |
| [evidence/](evidence/) | Risultati, script, log, screenshot e manifest di integrità |

Il canone dell'architettura rimane [ADR-0004](../../adr/ADR-0004-study-core-and-provider-boundaries.md). Il contratto MCP implementato rimane [services/study-mcp/README.md](../../../services/study-mcp/README.md). La [RFC #293](https://github.com/AndreaMarro/ardesia/blob/5a4d89312f6a46e3a0dd435e6c040b3c134ba9f5/docs/product/MCP-CORRECTION-WRITE-CORE-REUSE-RFC-2026-10-24.md) resta il riferimento della scrittura privata e dei gate W01–W18; qui ne precisiamo collocazione e dipendenze, senza sostituirla con un secondo sistema di correzione.

## 3. Cosa cambia nel software

**Audio lifecycle.** Lo stop conserva il chunk finale che il browser emette dopo la richiesta di arresto, attende bytes e marker, e libera subito le tracce. Il permesso risolto dopo stop/revoca/dispose non riavvia una registrazione. Il consenso viene persistito in ordine; un nuovo avvio attende il purge precedente. Gli errori di storage o marker sono osservabili. `dispose()` chiude l'oggetto e scarta callback tardivi; non sostituisce la revoca persistente e la sua cancellazione.

**Replay della lezione selezionata.** Il loader riceve la room, legge il suo journal e ne convalida identità e formato; non ripiega silenziosamente sul journal globale legacy. Titolo, errore, timeline e URL audio appartengono al caricamento corretto. Il percorso legacy resta disponibile solo quando richiesto esplicitamente da un consumer legacy.

**Lavagna reale.** Il browser ha rilevato che Excalidraw può produrre proprietà opzionali `undefined`. Il producer ora le normalizza al confine, preservando il validator canonico e il rifiuto degli altri valori non JSON. La prova non viene ottenuta disattivando la convalida del journal.

**Precisione del replay.** Il collaudo include l'ultimo istante effettivo della timeline: un cursore che si ferma prima dell'ultimo evento può mostrare una scena vuota pur avendo caricato il file corretto. Il risultato del test e l'eventuale correzione sono registrati nella validazione finale.

Questi interventi riparano il percorso critico della continuità. **L'audio resta un primitivo scollegato dalla Room v2:** non esiste ancora il ponte completo sessione→media→evento→replay→export/import. Non presentare i test del recorder come disponibilità della funzione per l'utente.

## 4. Decisioni registrate

| ID | Decisione | Classificazione | Motivo e prossimo gate |
| --- | --- | --- | --- |
| D01 | Conservare Core deterministico e adattatori provider | CONFERMATA | Riusa l'ADR e i servizi esistenti; nessuna seconda auth o memoria |
| D02 | Microcorso come prima offerta, continuità come identità | DA MIGLIORARE nel percorso | Dimostrare un ciclo completo di lezione e recupero |
| D03 | Integrare il recorder attraverso sessioni CAS e journal v2 | SPECIFIED | Round-trip con audio sintetico, pause, due room, export/import e revoca |
| D04 | LearningExperience come composizione di riferimenti CoursePack | SPECIFIED | Un autore realizza una seconda attività senza nuovo codice di dominio |
| D05 | MCP write propone revisioni private negli oggetti esistenti | SPECIFIED | RFC W01–W18; nessun publish tool nella prima beta |
| D06 | Host MCP e MCP Apps sono capacità da collaudare separatamente | CONFERMATA | Un host nominato, transport e versione fissati, auth/revoca e rilettura |
| D07 | REA fuori dalle dipendenze del prodotto, su domande circoscritte | CONFERMATA per questo incremento | Misurare costo totale contro alternativa equivalente, non il numero di target |
| D08 | Conservare palette, componenti e motori già presenti | CONFERMATA | Correggere UX e contratti; nessuna riscrittura di lavagna/solver giustificata dai dati attuali |
| D09 | Rimandare marketplace, nuova app nativa e copertura universale | PREMATURA nella finestra beta | Prima utilità docente, qualità, isolamento e domanda pagante |
| D10 | Uno stato generato e un documento autorevole per tema | CONFERMATA | Canoni storici esplicitamente datati; prove con base e limiti |

Le decisioni di prodotto e di rilascio richiedono ancora la ratifica del responsabile. Lo sviluppo e la draft PR sono autorizzati dal mandato; questo non autorizza merge, produzione, pagamenti o pubblicazione di materiale privato.

## 5. Marketing: gate del 26 ottobre

La preview esistente dimostra una pagina, quattro percorsi, esempi svolti con aiuto progressivo e ritorno al corso selezionato. È stata osservata anche dal browser pubblico. Il test REA locale verifica il build fissato, non il deploy. Nessuna delle due prove certifica una memoria studente o l'audio contestuale.

Per il nuovo verticale scegliere **Fluidi: vincolo, raggio e portata**, riusando PhysicsLab e il valutatore Core. La sequenza proposta è: prevedi → modifica il raggio → distingui pressione/portata fissata → ritrova la spiegazione → correggi → affronta il caso inverso. Non riscrivere il calcolo nel marketing.

| Finestra | Lavoro minimo | Criterio osservabile |
| --- | --- | --- |
| 24 ottobre | Correggere persistenza/replay e verificare browser | Disegno reale, cold reopen e isolamento A/B; errori espliciti |
| 24–25 ottobre | Ponte sessione/media ed esperienza fluidi | Audio sintetico decodificabile, riferimenti e tempi coerenti, nessuna nuova autorità di stato |
| 25 ottobre | Percorso studente e anteprima docente | Un errore produce un aiuto pertinente e una prova differente; pubblicazione separata dalla bozza |
| 25–26 ottobre | Qualità e accettazione | Desktop/mobile, tastiera, movimento ridotto, URL pulito, reset, nessun crash applicativo |
| 26 ottobre | Revisione del candidato e materiale commerciale | Video/screenshot dello stesso build, fonti e limiti dichiarati, invito all'azione verificato |

Le finestre sono una sequenza proposta, non lavoro già prenotato o completato. Se il ponte audio non supera il round-trip, la dimostrazione può descrivere fedelmente ciò che funziona, ma **non supera il gate multimodale integrale del mandato**. Una registrazione preregistrata o una fixture è etichettata come tale e non diventa prova di cattura live.

## 6. Beta: massimo perimetro credibile al 2 novembre

| Data proposta | Risultato | Dipendenza e gate |
| --- | --- | --- |
| 27 ottobre | Stabilizzazione del candidato unico | Tutti i gate sullo stesso SHA; niente badge ereditati da rami diversi |
| 28 ottobre | Fonte/sessione conservata e round-trip | Replay, export/import, revoca, recupero da interruzione; asset mancanti espliciti |
| 29 ottobre | Consegna→revisione→diario→trasferimento | Fonte esatta, bozza privata, revisione umana, risposta nuova senza aiuto |
| 30 ottobre | Primo MCP write locale controllato | Comandi Core riusati, W01–W18 pertinenti, rilettura esito; host nominato |
| 31 ottobre | Un tutor e una coorte invitata | Accessi separati, presenze/registro esistente, nessuna modifica ai pagamenti |
| 1 novembre | Prova con utenti e recupero | Compiti osservati, minuti docente misurati, blocchi risolti sul candidato |
| 2 novembre | Decisione di accettazione | Nessun P0, limiti dichiarati e responsabilità di supporto; autorizzazione separata per rilascio |

Perimetro: un tutor, una coorte, un CoursePack approvato, un laboratorio, una lezione con fonti autorizzate, materiale derivato revisionato, consegna e nuova prova, export e recovery. Due tutor esterni possono partecipare a un onboarding assistito; il self-service generalizzato non è promesso.

Restano fuori marketplace aperto, nuova app nativa, tutte le materie, correzione universale autonoma, comprensione affidabile automatica di qualunque tratto/voce, compatibilità write con tutti gli host, promessa di efficacia didattica o redditività già dimostrata. Un remoto con dati reali richiede prove specifiche di identità/isolamento/revoca: la modalità `synthetic_only` attuale non le sostituisce.

## 7. Filoni e passaggio di consegne

| Filone | Patrimonio disponibile | Minimo / criterio | Dipendenza, rischio, rinvio |
| --- | --- | --- | --- |
| Verità e visione | Canoni, storia, snapshot PR | Un solo indice e stati leggibili | Refresh prima di editare; nessuna nuova cronaca concorrente |
| UX e marketing | Landing, esempi, PhysicsLab | Percorso fluidi completo provato | Ponte di contesto; rinviare cataloghi aggiuntivi |
| LessonOS e MCP | Journal, sessioni CAS, Core, quattro read | Identità/versioni comuni e private write | Auth e review; rinviare host non provati |
| REA | Setup storico, E0 e verificatore | Una domanda ridotta con prove e costo | Qualità del target; rinviare nuovi donor senza consumer |
| Architettura | ADR, Core e porte | Eliminare duplicazioni sul percorso | Stack aperto; rinviare refactor generalisti |
| Commerciale | Utenti del fondatore e offerta stretta | Misurare correzione/supporto/conversione | Domanda e occupazione ignote; rinviare marketplace |
| Review indipendente | Test RED, oracle browser/nativo | Confutare la promessa sullo stesso SHA | Non confondere fixture, CI e prodotto accettato |

Protocollo per il prossimo agente: generare stato; leggere questo indice; verificare base, PR e ownership; scegliere un gate; riprodurre il difetto; modificare il consumer canonico; verificare codice e gesto reale; registrare risultati e limiti; aprire/aggiornare draft PR senza merge automatico. In questa sessione root possiede audio/documenti/pubblicazione, architecture_audit replay/journal/review, product_pedagogy prodotto/browser, rea_research esperimenti/prove native. Questa è ownership del lavoro consegnato, non una dichiarazione di agenti ancora attivi in futuro.

**Prossima attività prioritaria:** AUDIO-V2, con fixture sintetica e sessione canonica. Subito dopo: singolo episodio fluidi→errore→recupero, poi private MCP write. Non creare un nuovo CorrectionDraft, un nuovo diario o un altro frontend per aggirare i collegamenti mancanti.

## 8. Mappa dei documenti richiesti dal mandato

I nomi sono adattati ai documenti già autorevoli, come richiesto dal mandato. Questa tabella evita diciannove nuovi canoni paralleli.

| Nome richiesto | Sede effettiva |
| --- | --- |
| ARDESIA_COMPLETE_CHRONICLE | architecture-report §§3–5, fonti e pin nell'evidence JSON |
| ARDESIA_CANONICAL_VISION | PRODUCT-CANON, addendum 24 ottobre |
| FEATURE_INVENTORY | architecture-report §6 e status.json |
| PRODUCT_JOURNEYS | product-pedagogy-economics §6 |
| SYSTEM_ARCHITECTURE | ADR-0004, ARCHITECTURE-CANON e multimodal-mcp-contracts |
| TECHNICAL_DEBT_REGISTER | architecture-report §7 e review avversariale |
| DECISION_LOG | Tabella D01–D10 sopra, ADR già presenti |
| MULTIMODAL_CONTEXT_SPEC | multimodal-mcp-contracts §§2–5 |
| MCP_CORE_READ_WRITE | Study MCP README, RFC #293 e delta host di questa consegna |
| REA_RESEARCH_REPORT | rea-research §§1–6, 8–10 |
| REA_EXPERIMENTS | rea-research §7, evidence/rea e audio-native |
| SOFTWARE_REUSE_AND_LICENSES | rea-research §9, architecture-report §5 |
| VISUAL_SYSTEM_AND_MOTION | product-pedagogy-economics §7 e screenshot browser |
| LEARNING_EXPERIENCE_MODEL | product-pedagogy-economics §§2–5 |
| PRODUCT_ECONOMICS | product-pedagogy-economics §8, economics.json |
| PRO_ADVERSARIAL_REVIEW_GPT61_2026-10-24 | Percorso esplicito in docs/reviews |
| MARKETING_48H_AND_BETA_9D | §§5–6 sopra, gate nella validazione |
| PROJECT_TRUTH | Stato generato CURRENT/project.json; questo snapshot e validation.md |
| AGENT_HANDOFF_PROTOCOL | AGENTS root, protocollo di memoria, RUNLOG e NEXT-SESSION-PROMPT; §§7 e 9 |

## 9. Addendum del 24 ottobre — memoria operativa e incarico successivo

Il controllo richiesto dall'utente dopo la consegna ha rilevato un gap: il
registro generale terminava al 20 ottobre e il prompt generale era ancora lo
snapshot del 2 luglio. I rapporti sopra contenevano cronologia e handoff, ma il
ciclo di aggiornamento nei punti d'ingresso degli agenti non era completo.

Sono ora collegati e aggiornati il [registro cronologico](../../ops/ARDESIA-RUNLOG.md),
il [protocollo di memoria](../../ops/AGENTMEMORY-SEMANTIC-PROTOCOL.md) e il
[mandato successivo AUDIO-V2/Poiseuille](../../ops/NEXT-SESSION-PROMPT.md).
AGENTS richiede lettura iniziale e chiusura documentata. Le nuove voci conservano
prove, errori, decisioni superate e 3–5 suggerimenti prioritizzati con dipendenze
e criteri di accettazione. Questo è un protocollo eseguito dagli agenti, non un
servizio in background; lo stato attuale del vecchio AgentMemory esterno non è
stato verificato. Non sono state create automazioni.

Il codice applicativo verificato resta il commit
`49bf90ce782457494fed52c8e1a812bf27ba158b`: la CI generale, marketing e readiness
senza deploy sono state rilette e risultano tutte SUCCESS su quello SHA. Questo
follow-up modifica documenti e routing, senza promuovere AUDIO-V2 o la beta a
funzioni completate. Il generatore locale conserva PR/check UNAVAILABLE in
assenza del relativo accesso; la lettura GitHub è una prova separata, non una
riscrittura manuale dello stato generato.
