# Atlante di riferimenti visivi — Ardesia

> Raccolta di **riferimenti progettuali**, non screenshot di funzionalità di produzione e non attestazioni di implementazione. Curato il 27 ottobre 2026 su indicazione del proprietario.

## Come leggere questa raccolta

- **Materiali forniti dall'utente:** 36 schermate PNG organizzate per famiglie sotto. Il repository registra qui titoli, criteri e collocazione prevista; la copia binaria originale viene consegnata separatamente come archivio, perché il connettore di scrittura GitHub di questa sessione accetta file testuali, non file locali binari. **Non presentare queste immagini come già caricate nella cartella GitHub.**
- **Riferimenti 3D verificati online:** vedere [Atlante simulazioni fisiche 3D](./PHYSICS_3D_REFERENCE_ATLAS.md), che incorpora anteprime tramite URL pubblici originali e rimanda alle demo reali. Queste anteprime esterne non sono asset ospitati da Ardesia.
- **Requisiti di prodotto:** vedere [Criteri di accettazione](./ACCEPTANCE.md).

## Vincoli di prodotto

1. Ardesia è una piattaforma educativa unica: lavagna, lezioni, continuità, esercizi, memorie e percorsi. Non una raccolta di dashboard indipendenti.
2. **eLab è escluso dalla direzione futura di Ardesia** secondo l'istruzione esplicita del proprietario. Non rinominare `sim` in eLab; trattare eliminazione di prodotto e decoupling come lavoro implementativo separato con test di regressione.
3. La lavagna deve prendere il meglio di Miro (libertà spaziale), Obsidian (struttura relazionale), Goodnotes (scrittura/annotazione), reader (comprensibilità) senza copiare identità visive proprietarie.
4. Preferire *simulazioni scientificamente corrette e manipolabili* a video o render decorativi; se il 3D non aggiunge comprensione, usare un grafico 2D di qualità.
5. Non scambiare status test/commit per verifiche di UX. Ogni incremento richiede percorso docente/studente usabile dal browser, su dispositivo e URL distribuito.

## Inventario immagini fornite — source-of-truth per l'import degli asset

Questi sono **nomi esatti degli allegati PNG**. Il bundle originale completo è stato preparato per l'import nel repo; l'import degli originali richiede un canale capace di trasferire i byte.

### R · Stato di partenza / baseline

| File PNG | Uso visivo |
|---|---|
| `R01_baseline_collage_dashboard_graph_student_schema.png` | Collage: cruscotto, grafo, studente, schemi |
| `R02_baseline_collage_lesson_pack_marketplace_plugin.png` | Collage: lezione, pacchetto studente, marketplace, plugin |
| `R03_dashboard_docente_baseline.png` | Cruscotto docente con evidenze e coda azioni |
| `R04_grafo_lezione_baseline.png` | Grafo della lezione e provenienza |
| `R05_lezione_live_simulatore_baseline.png` | Lezione viva con simulatore embedded e manuale |
| `R06_marketplace_baseline.png` | Catalogo plugin e contenuti |
| `R07_student_pack_builder_baseline.png` | Creazione pacchetto di ripasso |
| `R08_studio_schemi_baseline.png` | Studio schemi da fonti |
| `R09_profilo_studente_traiettoria_baseline.png` | Memoria longitudinale dello studente |
| `R10_officina_plugin_baseline.png` | Officina plugin e prove di compatibilità |

### B · Lavagna collaborativa / Miro

| File PNG | Uso visivo |
|---|---|
| `B01_miro_board_collaborativo.png` | Lavagna con oggetti collegati, evidenze, partecipanti |
| `B02_miro_mappa_lezione_estesa.png` | Mappa spaziale estesa, gruppi e collegamenti |
| `B03_workshop_docente_annotazioni.png` | Workshop docente: schema, note e feedback |
| `B04_whiteboard_progettazione_lezione.png` | Spazio di progettazione: annotazione e trascinamento |

### O · Knowledge graph / Obsidian

| File PNG | Uso visivo |
|---|---|
| `O01_obsidian_vault_graph.png` | Vista vault e grafo personale |
| `O02_obsidian_grafo_lezione_dark.png` | Grafo scuro navigabile con provenienza |
| `O03_obsidian_workspace_split.png` | Editor, grafo, backlink e strumenti affiancati |
| `O04_obsidian_document_graph_dark.png` | Documento+grafo+plugin in ambiente scuro |

### A/G · Lettura e quaderno

| File PNG | Uso visivo |
|---|---|
| `A01_reader_editoriale_apple_books.png` | Lezione editoriale leggibile stile reader |
| `G01_goodnotes_notebook_simulatore.png` | Quaderno a mano con attività interattiva incorporata |
| `G02_goodnotes_study_pack_planner.png` | Quaderno studente e percorso personale |

### AN · Analytics e qualità

| File PNG | Uso visivo |
|---|---|
| `AN01_analytics_docente_conoscenza_errori.png` | Analisi docente di copertura, errori, risultati |
| `AN02_governance_schema_provenienza.png` | Governo e verifica scientifica di schemi |

### P · Ecosistema, marketplace e creator

| File PNG | Uso visivo |
|---|---|
| `P01_premium_ecosystem_home_creator.png` | Home ecosistema premium |
| `P02_social_marketplace_tutor_materiali.png` | Scoperta sociale, tutor e contenuti |
| `P03_creator_storefront_premium.png` | Vetrina docente e contenuti |
| `P04_plugin_marketplace_moderno.png` | Marketplace strumenti moderno |
| `P05_profilo_docente_storefront_light.png` | Profilo pubblico autore e vetrina |

### E · Filiera e operazioni

| File PNG | Uso visivo |
|---|---|
| `E01_filiera_ardesia_supply_chain.png` | Filiera contenuti, verifica, apprendimento, valore |
| `E02_command_center_ideazione_valore.png` | Centro operativo e metriche dell'ecosistema |
| `E03_network_ecosystem_creator_dashboard.png` | Rete, creazione e distribuzione contenuti |

### X/MO/D · Esplorazioni e moodboard

| File PNG | Uso visivo |
|---|---|
| `X01_dark_neon_plugin_cockpit.png` | Cockpit dark: esperimento estetico, non baseline |
| `X02_neobrutalist_creator_dashboard.png` | Direzione neo-brutalista alternativa |
| `X03_gamified_learning_graph.png` | Grafo gamificato e feedback |
| `MO01_moodboard_12_direzioni.png` | Tavola comparativa di dodici direzioni |
| `D01_duplicato_social_home_feed.png` | Variante social: possibile sovrapposizione |

**Totale: 36 PNG.**

## Come usare i riferimenti

Non replicare schermate intere. Estrarre pattern verificabili per quattro surface canoniche:

| Surface | Da cosa partire | Cosa misurare |
|---|---|---|
| **Lavagna attiva** | B01/B03/G01/G02, R05 | penna fluida, focus didattico, inserimento oggetti, citazioni, iPad e LIM |
| **Lezione/corso** | A01/G02/R07 | lettura senza attrito, transizioni naturale verso simulazioni/quiz, ripresa stato |
| **Memoria e grafo** | O01/O03/R04/AN02 | differenza tra concetto, fonte, inferenza ed errore; navigazione e collegamenti |
| **Autore e gestione** | AN01/P01/P03/E01 | prossima azione leggibile, prova di impatto, stato reale invece di metriche inventate |

## Provenienza / copyright

Gli allegati sono schizzi e mockup forniti dall'utente per indirizzare un prodotto futuro. Non attribuire metriche, recensioni, persone o certificazioni visibili nei concept alla piattaforma reale. I riferimenti esterni sono collegamenti a siti terzi; verificare licenza e diritti PRIMA di copiare codice, asset, screenshot o contenuti in produzione. Le anteprime esterne sono visualizzate dalla loro fonte, non redistribuite nel repository.

## Criterio di uscita

Il risultato utile non è «37 immagini archiviate»: è una lavagna esteticamente curata, un corso coerente e **almeno tre fenomeni fisici 3D manipolabili** portati nel prodotto e dimostrati con prove scientifiche, UI e browser. La rimozione effettiva di eLab richiede una modifica separata al codice e una verifica delle dipendenze.
