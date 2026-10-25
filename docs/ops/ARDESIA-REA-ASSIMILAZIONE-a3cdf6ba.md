# Assimilazione REA delle sette missioni — candidato a3

I subgate originali **REA G0 e REA G1 sono PASS**, con `problems: []`, sul prodotto `a3cdf6ba8e6ad9b0bed98b212e3783a7b1f30119`. Il risultato riguarda la catena delle sette missioni: osservazione reale, fonte, contratto, componente e test. **G0 e G1 globali restano non certificati**: questo documento non attesta approvazione scientifica, pilota umano, pagamento reale o lancio.

Il root ha revisionato e installato le sette ricevute corrette; il gate originale le ha poi verificate. Gli input precedenti sono conservati; le correzioni dei metadati hanno documenti e hash propri. `synthetic: false` descrive l’attestazione di esecuzione reale. Attori, risposte del modello e materiale didattico usati nelle prove sono sintetici.

## Dalle osservazioni alle funzioni

| Missione | Osservazione realmente eseguita | Assimilazione nel prodotto a3 | Limite della prova |
|---|---|---|---|
| **R0 — continuità con la baseline** | Ardesia storica: fonte, due viste, export e ritorno | La superficie attiva è `Classroom` con `SourceBoard`; identità della fonte separata dalle viste, pin esatti e riapertura del quaderno | `StudyWorkspace` è baseline storica, non la nuova UI attiva. La baseline non dimostra upload immagine; origini diverse non diventano equivalenti |
| **R1 — fonte e viste** | AFFiNE guest: documento/canvas, identità, modifica, undo/redo e riapertura | Viste indipendenti riferite alla stessa coppia risorsa/revisione; aggiornamento esplicito del pin, salvataggio con controllo della versione, retry e rimozione della sola vista | REA a3 riapre in lettura. Spostamento/ridimensionamento GUI sono prove storiche su 2a; CAS, risposta tardiva, conflitto e detach hanno regressioni unitarie a3. Nessuna equivalenza CRDT/cloud |
| **R2 — laboratorio e tentativi** | Doenet locale 0.7.27: previsione errata, hint, variazione, risposta corretta e riapertura | `PhysicsLab` e `Work` distinguono parametri in modifica, snapshot consegnato e feedback; una modifica invalida il risultato corrente, il retry conserva il tentativo scelto | Donor osservato storicamente; nessun nuovo intero percorso laboratorio a3 o ramo audio/ASR. Correttezza numerica non equivale ad approvazione scientifica |
| **R3 — gestione mini-corsi** | Moodle demo: corso, quattro date, enrol e assignment. REA a3: nuova bozza propria, quattro date future fittizie, anteprima, conferma esplicita test e riapertura | `Courses`/`EditionManager`: gestione docente semplice, quattro sessioni con timezone e durata validate, anteprima legata alla versione, discovery autorizzata e limitata | Nessuna vendita, invito o approvazione delle date. La prova delle 52 bozze è un browser test root separato; la contesa HTTP ultimo posto registra 200/409 senza misurare sovrapposizione sul wire |
| **R8 — errore e trasferimento** | Dopo tentativo Passify e confronto Numbas, PrairieLearn pubblico: Grade/New variant/Grade | Diario privato ancorato a fonte/revisione, proposta distinta dalla conferma docente, contestazione append-only e prova di trasferimento; lettura attuale e test Core | Nessuna padronanza dedotta dal voto isolato. Il replay a3 non scrive nuova review/contestazione; licenza esatta del deploy remoto non attestata |
| **R6 — confronto e portabilità** | Baseline, C2, fe e 2a conservati, inclusa la perdita storica nell’export. REA a3 esporta dalla UI e riapre con inspect due revisioni esatte | `NotebookPanel` e Core `portable`: storia autorizzata per coppia risorsa/revisione, perdite dichiarate, lettura locale unsigned senza ripristino di autorità; grafi, trace, runtime e confronti scoped | File grande e cinque confini Unicode provati nel browser su 2a, non riattribuiti ad a3. Il quaderno a3 osservato è 101.043 byte; uguaglianza di un sottoinsieme storico non significa uguaglianza dell’intero file |
| **R4 — ripresa del contesto** | Bramble conduce al login; Logseq demo osservata senza concedere cartelle personali; AFFiNE guest: ricerca/blocco, correzione e riapertura. A3: stessa fonte, spiegazione precedente e azione successiva | `Diary`, `SourceViewer` e Core `context` riprendono riferimenti e storia esistenti, con provenienza e controlli di accesso; nessun nuovo store memoria | Il root ha accettato l’alternativa già registrata **TARGET-097** sotto la policy invariata. Scope testuale; niente audio seek o backend remoto attestato. Bramble oltre login e commit remoto AFFiNE restano sconosciuti |

## Un’esperienza centrata sul corso

La gerarchia parte dalle edizioni autorizzate, passa alle quattro sessioni e porta ad aula, fonti, lavoro individuale e diario. Il gestore separa creazione, configurazione, anteprima e conferma; un risultato non viene mostrato come salvato o confermato prima del riscontro del Core. Stati vuoti, caricamento, errore e riprova appartengono al flusso.

Il tavolo mantiene distinta la geometria di una vista dall’originale citato. Fonte, revisione, provenienza e contesto sono recuperabili insieme. Il quaderno rende leggibili le revisioni storiche e dichiara l’autenticità unsigned. Questa organizzazione rende il prodotto più prevedibile per docente e studente; non è un giudizio estetico misurato con utenti o un benchmark.

I confini restano espliciti: UI sottile, Core unico per autorità e persistenza, adattatori HTTP per trasporto. `useCourseWorkspace` applica pagine limitate e lookup esatto autorizzato, senza scaricare tutte le edizioni; actor/role, versioni e risposte tardive sono controllati. I moduli Core coinvolti comprendono `editions`, `catalog`, `store`, `view_layout`, `portable`, `context`, `diary` e `submissions`.

## Diritti e riuso

L’assimilazione è funzionale e originale. La licenza AFFiNE distingue il frontend MIT dalle aree backend/native escluse; il pin sorgente non prova l’identità della build SaaS. Radix Dialog MIT è stato esaminato come componente accessibile: l’esame non prova da solo una sua integrazione. Doenet AGPL, Moodle GPL e Logseq AGPL restano fonti di osservazione; nessun loro modulo è stato copiato nel prodotto. Per il deploy PrairieLearn osservato non si rivendica un diritto di riuso del sorgente non verificato.

Licenze, provenienza e grezzi sono conservati privatamente. Questo documento non incorpora manuali, codice donor, dati del vendor o credenziali. Non sono stati introdotti un framework o un secondo archivio di memoria per riprodurre questi flussi.

## Evidenza, beneficio e copertura

Sono preservati **148 envelope REA originali**: 87 storici già selezionati, 28 donor R4 storici e **33 nuovi da esecuzioni REA reali su a3**. Sono esecuzioni documentate, anche con esiti parziali, non 33 percorsi completi o 33 nuove visite esterne. I 257 file selezionati sono stati copiati con hash verificati; gli errori restano errori e i documenti derivati non sostituiscono gli originali.

I log di esecuzione root sul candidato riportano 499 test Core/Auth/Postgres senza skip, 81 test Web e typecheck/build. I nomi Web sono stati corretti con TypeScript AST: valori di fixture rimossi e titoli con apostrofi ripristinati. La collection pytest 499 verifica i nomi usando il percorso reale del test; **collection e inventario non sono nuovi test eseguiti**. Restano separati dai log di esecuzione. Anche la prova di riavvio applicativo con 32 proiezioni su 4 attori è distinta dalle catture REA; non dimostra riavvio di database o sistema operativo.

Il beneficio qualitativo è evitare perdita delle revisioni citate, sostituzione con una head privata, feedback su parametri diversi, perdita di bozze per risposte tardive e selezione di corsi non autorizzati. Metodo: contratti osservati, witness di perdita e regressioni più report reali. Tempo risparmiato: **UNKNOWN**; nessun benchmark prestazionale dichiarato.

Nel catalogo 139, tutte le URL d’ingresso hanno un tentativo registrato, con 91 valutazioni di pattern e 48 valutazioni di accesso. **Visita, funzionalità provata e analisi profonda sono coperture diverse**: non esiste un claim di 139 ricostruzioni complete o 139 PASS funzionali.

Le catture con rete richiesta restano **INCOMPLETE**, con `equality_eligible: false`; passi conclusi non provano tutti gli eventi. I confronti fra origini diverse conservano `capture_context_mismatch`; seed parziali, unmatched e unknown non dimostrano assenza o equivalenza completa. Questi limiti rimangono nelle ricevute scoped, anche dopo il PASS dei subgate REA.
