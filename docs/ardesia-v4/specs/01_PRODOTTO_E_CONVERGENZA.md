# 1. Prodotto, decisioni e convergenza

## Decisione di prodotto V3 confermata e ampliata da V4
Ardesia organizza, vende ed eroga mini-corsi e conserva il lavoro individuale fra una lezione e la successiva. Il primo vertical è Fisica Semestre Filtro; Analisi 1 è la prima estensione dimostrata; altre discipline entrano attraverso contenuti e verificatori opzionali. Non è un chatbot, un catalogo vuoto, un LMS generalista da completare prima di vendere, né una ricostruzione integrale di ogni concorrente.

La promessa concreta è: **«Studia in un piccolo gruppo, lavora nel tuo spazio e riprendi sempre dal punto giusto.»** Il vantaggio da validare è la continuità fra materiale originale, manipolazione, ragionamento, correzione, memoria del metodo e organizzazione del corso. Non si rivendica unicità mondiale o guadagno garantito.

## Tutti i concetti emersi, in ordine di responsabilità
| Responsabilità | Requisito consolidato | Non equivale a |
|---|---|---|
| Offerta | Catalogo permanente di argomenti, edizioni con date e soglia di partenza | Tutti i gruppi sempre attivi |
| Gruppi | Argomento, prerequisiti, livello di esercizi e tutte le disponibilità compatibili; massimo 10 | Etichette rigide delle capacità personali |
| Individuale | Area permanente, bozze private, consegne, feedback e percorso fra corsi | Cartella pubblica della classe |
| Lezione | Lavagna, post-it, modelli manipolabili, esercizi, spiegazioni e interazione tutor | Video frontale con chat appesa |
| Ingressi | Foto/PDF/audio/testo/formule, originale visibile e lettura correggibile | Trasformazione infallibile di qualunque file |
| Memoria | Metodo docente + evidenze/episodi dello studente; grafo derivato | Secondo archivio di riassunti AI autorevoli |
| Morfismo | Adattamento di presentazione e trasformazioni fra host con perdite dichiarate | Compatibilità universale per la sola presenza di MCP |
| Commerciale | Prezzi, capienza, pagamenti, presenze, riacquisto utile e margine per ora | Massimizzazione di iscritti e clic a ogni costo |
| Fabbrica | REA profondo, sorgenti autorizzati, task testabili, branch e ricevute | Agenti illimitati o screenshot come prodotto |
| Estensione | Stesso nucleo per altro tutor, ateneo, materia e piattaforma | Nuovo fork per ogni esigenza |

## Riuso e nuova superficie: scelta, non ricerca indefinita
Conservare il monorepo `AndreaMarro/ardesia` e la sua storia. Introdurre `apps/web` come nuova superficie orientata a corsi e persone, riusando selettivamente canvas, post-it e modelli puri di Studio. `apps/studio` rimane sorgente della migrazione e fallback tecnico: non generare due prodotti paralleli con dati incompatibili. `packages/engine` resta LessonOS. Kirchhoff mantiene il proprio repository canonico e viene consumato da un adapter/versione fissata; non duplicarlo in un nuovo solver improvvisato.

Prima task: riconciliare HEAD, PR e patch locali, poi recuperare la microdemo `53782a1247a4804312a17d3fc1251532a7305606` se presente. La ricevuta storica non prova che la patch esista nel nuovo ambiente: identificare bundle/commit o dichiarare FILE_NOT_AVAILABLE, quindi riusare il più piccolo percorso già riproducibile. Non attendere un intero riordino del monorepo. Non cancellare licenze, vecchi dati o prove.

Una singola task può adottare una shell ancora più sottile se l’estrazione impedisce il primo flusso; la modifica richiede un ADR breve con costo e test. Niente cambio di framework per moda né migrazione di tutta la piattaforma prima del primo gruppo.

## Roadmap commerciale coerente
- **G0 — SIMULATED_COURSE_READY:** un intero ciclo tecnico con un tutor, 10 studenti sintetici, storage/API/ACL reali e pagamenti/provider simulati dichiarati. UI privata, aula, review e memoria sono un solo percorso.
- **G1 — PILOT_TECH_READY:** staging remoto, identità reale, contenuti revisionati, quattro date approvate, backup/ripristino, offerta e inviti pronti. Si dimostra anche un secondo pack Analisi senza fork del nucleo. Nessuna promessa di iscritti.
- **G2 — REAL_COHORT_STARTED:** il tutor avvia effettivamente la prima edizione con persone reali. Non ottenibile da fixture o dichiarazione di Codex.

Una pagina dimostrativa può uscire prima di G0, ma non conclude il Goal. Le finestre «un giorno / pochi giorni» sono budget di scopo proposti, non stime garantite: il risultato si accetta sui criteri, non sul calendario.

## Allocazione proposta del lavoro
Priorità al percorso reale già disponibile e ai moduli ottenibili da sorgenti autorizzati; REA deve diminuire progettazione cieca, non diventare un’attività separata dal rilascio. Ogni famiglia funzionale ha un riferimento principale e al massimo un confronto prima della prima integrazione. Il registro esteso si consulta su necessità, senza aggiungere centinaia di dipendenze. Due builder paralleli più un integratore sono un limite di lavoro simultaneo, non un numero obbligatorio di modelli a pagamento.

## Stato osservato, non aggiornamenti inventati
Ardesia main `b124eee…`, RFC #264 draft non merged; Kirchhoff main `b35a8b5…` riletti in questa sessione. Le PR #256–259 e le ricevute locali sono riferimenti storici, non funzionalità attribuibili automaticamente a main. La memoria e i post-it sono candidati reali al riuso; non è stato rieseguito qui il prodotto. Fonti: `reference/SOURCES.json` (repo-ardesia, repo-rfc, repo-kirchhoff, memory, postit).

## Addendum V4 — l’errore è un oggetto di lavoro condivisibile solo per scelta
Il **Diario degli errori** diventa **P0**, non un accessorio di Analisi o del simulatore di quiz. Vive nello spazio privato di ogni studente, alimenta il prossimo incontro del gruppo in forma autorizzata e consente di vendere microcorsi mirati senza profilarne automaticamente gli iscritti. La catena del prodotto è: **richiesta → formazione gruppo → lezione → tentativo → errore con fonte → feedback → prova nuova → diario → prossimo modulo**. Fonte unica LessonOS; `specs/13` contiene contratti e stati. I 39/49 € sono ipotesi commerciali, non garanzia di ricavi.

**REA vincolante:** non basta avere una `REA_FACTORY`. G0 richiede i sei receipt validati R0/R1/R2/R3/R8/R6 (`specs/14`), ciascuno tracciato fino a codice/test. Qualunque `BLOCKED` resta visibile e impedisce di chiamare G0 completato.
