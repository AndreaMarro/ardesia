# ARDESIA — inventario totale e stato verificato

Data: 2026-06-30
Tipo: documento additivo, non distruttivo
Scopo: rendere leggibile ARDESIA a tre lettori: Andrea, fabbrica autonoma, altri AI/umani esterni.

## Metodo

Questo documento separa evidenza verificata, stato storico e decisioni da prendere. Non assume che un repo o un deploy sia canonico solo perche' esiste.

Fonti usate nel turno:

- GitHub connector su repository AndreaMarro visibili;
- documenti canonici nel monorepo `ardesia`;
- stato `ops/knowledge/GITHUB-VERCEL-STATE.md`;
- metadati PR visibili;
- Vercel connector disponibile in chat: nessun team restituito, quindi niente claim live su Vercel.

## 1. Verdetto sintetico

L'intento giusto e' monorepo. La realta' attuale e' multi-repo per ragioni storiche, prototipali e operative. Questo e' recuperabile senza buttare nulla, ma solo se ogni pezzo viene classificato.

La regola e':

```text
AndreaMarro/ardesia = punto di ingresso e destinazione canonica.
Repo storici = lineage verificabile finche' il cutover non e' concluso.
Prototipi = sorgenti da salvare/importare o congelare, non nuove piattaforme.
Deploy Vercel = superfici demo/preview, non fonte di verita'.
```

## 2. Inventario GitHub essenziale

| Repository | Categoria | Uso corretto | Rischio |
|---|---|---|---|
| `AndreaMarro/ardesia` | Canonico | Monorepo, docs, mappa, governance operativa, destinazione finale del prodotto | Se resta solo documentazione e non assorbe i pezzi, diventa un indice morto. |
| `AndreaMarro/ardesia-studio` | Lineage/storico operativo | Lavagna, ToolHost, lavoro studio storico | Divergenza dal monorepo se il cutover non viene misurato. |
| `AndreaMarro/ardesia-tools` | Lineage/fabbrica | Tooling fabbrica, agentmemory, launchd, litellm, strategos | Rischio di avere due fabbriche: repo storico e ops/tools nel monorepo. |
| `AndreaMarro/ardesia-vault` | Governance/SoT strategico | Visione, decisioni, handoff, specifiche di Andrea | Non deve diventare repo runtime o codice prodotto. |
| `AndreaMarro/ardesia-wiki` | Knowledge/output | Wiki, ricerche, output leggibile | Non deve sovrascrivere il canon del monorepo. |
| `AndreaMarro/ardesia-lavagna` | Prototipo prodotto/demo | Canvas plugin-native, lezioni, plugin, potenziale demo Vercel | Puo' diventare seconda piattaforma se non viene importato o incapsulato. |
| `AndreaMarro/ardesia-simulator` | Prototipo plugin | Simulatore hostable, possibile plugin first-party | Puo' duplicare ELAB/simulation se non viene classificato come plugin. |

## 3. Intento prodotto canonico

ARDESIA non e' ELABTutor e non e' solo simulatore. Il prodotto e':

- lavagna didattica local-first;
- plugin-native;
- marketplace di plugin immutabili;
- memoria didattica che sedimenta materiali, lezioni, errori, contenuti;
- AI metodologica: mappa il metodo del docente e suggerisce, ma non sostituisce il docente;
- modello economico: SaaS + marketplace plugin, non fee sulle lezioni.

Formula breve:

```text
Ardesia e' l'ambiente unico di lavoro del docente/tutor.
I plugin aggiungono strumenti.
I pack aggiungono materia/metodo.
I workflow aggiungono sequenze didattiche vendibili.
```

## 4. Regola di classificazione

Ogni feature va classificata prima di essere costruita:

| Tipo | Va in | Esempi |
|---|---|---|
| Capacita' universale | Core ARDESIA | lavagna, memoria, manual-object, marketplace, student-pack, CRM didattico |
| Strumento riusabile | Plugin | simulatore, manual reader, Bode, Fasori, Arduino runner |
| Materia/metodo | Pack | ELABTutor circuiti, Analisi 1, Fisica 1 |
| Sequenza vendibile | Workflow | LED Arduino passo-passo, esercitazione guidata, template lezione |

Senza questa regola, ELAB o il simulatore rischiano di mangiarsi la piattaforma.

## 5. Stato prodotto: cosa e' reale e cosa no

### Reale o parzialmente reale

- Lavagna base: esiste come primitivo in studio/lavagna.
- ToolHost: costruito, security kernel forte, ma non montato in una route prodotto canonica.
- CircuitSolver/validator/simulatore: pezzi forti, riusabili come plugin.
- Dati ELAB: 88 lesson-path e riferimenti manuale sono materiale utile da pack.
- Study-pack engine: primitivo parziale.
- Recap engine zero-LLM: primitivo reale.
- CRM/consenso: parziale ma reale.

### Non ancora end-to-end

- Manual-object Core.
- BoardCitation come data model montabile.
- ELABTutor decoupled come Pack.
- Manifest plugin con `kind` completo.
- Marketplace reale.
- Export student-pack con board/plugin-state.
- Demo unica che mostri il flusso completo.

## 6. P0 prodotto

Il P0 non e' fare 20 plugin o rifare ELAB. Il P0 e' accoppiato:

1. montare il ToolHost in una route prodotto reale;
2. montare ELAB/simulatore attraverso l'host;
3. impedire con lint/gate che `plugins/elab-tutor` reimporti shell, auth, dashboard, memoria e funzioni AI proprie;
4. salvare o esportare una lezione con stato lavagna + plugin;
5. deployare una demo Vercel toccabile.

## 7. Vercel

La sessione corrente del connector Vercel non restituisce team, quindi non c'e' verifica live dei deploy.

Stato storico nel repo:

| Deploy/progetto | Stato storico | Azione |
|---|---|---|
| `api-vercel` | production Error/404 storico | Non usarlo come demo. Riparare solo se serve al prodotto. |
| preview moat | Ready ma SSO-gated storico | Non e' demo toccabile finche' resta gated. |
| `ardesia-lavagna` | 200 storico | Primo candidato per demo toccabile, ma da verificare live. |
| `ardesia-workspace` | 200 storico | Classificare: demo, stale o workspace. |
| `elab-tutor` | dominio prodotto ELAB | Non confondere con ARDESIA. |

## 8. Demo Vercel desiderata

La demo deve permettere ad Andrea di toccare il prodotto. La slice minima e':

```text
aprire lavagna -> aggiungere tool/plugin -> interagire -> salvare/esportare lezione -> riaprire/importare.
```

Slice migliore:

```text
lavagna -> plugin simulatore -> circuito/blink -> stato salvato dentro lezione -> export/import.
```

La demo non deve essere un clone dell'app ELAB standalone. Deve mostrare la piattaforma ARDESIA.

## 9. Fabbrica

La fabbrica deve lavorare con routing, non con forza bruta.

| Risorsa | Uso corretto |
|---|---|
| Hermes/MiniMax-M3 | audit, contesto lungo, triage, docs, verifica economica |
| Codex/OpenAI high-headroom | bug difficili, driver, gate, regressioni, architettura |
| Claude/Opus o simile | builder forte su task pinned con criteri verificabili |
| AgentMemory | recall prima, remember dopo; best effort, mai single point of failure |

Regola token:

```text
Usare il modello minimo sufficiente. Escalare solo con evidenza.
```

## 10. Headroom / riduzione token

Il repository esterno chiamato 'Headroom' non e' stato identificato con certezza in questa sessione. Finche' Andrea non fornisce URL o owner, non va trattato come dipendenza verificata.

Il principio implementabile subito e':

1. usare repo map e symbol map;
2. mai caricare tutto il repo nel prompt;
3. passare solo file e linee rilevanti;
4. usare context packets per task;
5. usare AgentMemory per esiti e repair ricorrenti;
6. avere `AGENTS.md` e documenti brevi per ogni area;
7. verificare con gate, non con claim.

## 11. Decisioni da non automatizzare

La fabbrica non deve decidere da sola:

- archiviazione o eliminazione repository;
- dominio Vercel canonico;
- rendere pubblico qualcosa;
- deploy production;
- migrazione definitiva da repo storico a monorepo;
- pricing/marketplace pubblico;
- trattamento di dati sensibili o studenti reali.

## 12. Chain of verification

- Verificato: repository ARDESIA principali visibili su GitHub.
- Verificato: `README.md` del monorepo dichiara piattaforma local-first, marketplace plugin immutabili e AI metodologica.
- Verificato: `CANON-INDEX.md` contiene la regola Core/Plugin/Pack/Workflow e segnala host costruito ma non montato.
- Verificato: `PRODUCT-CANON.md` dice che il prodotto non e' end-to-end e distingue ARDESIA da ELABTutor e simulatore.
- Verificato: `PLUGIN-MARKETPLACE-CANON.md` dice che host esiste ma marketplace e mount sono mancanti.
- Verificato: `ELAB-AS-PLUGIN-CANON.md` dice che `plugins/elab-tutor` e' oggi app standalone copiata e non plugin decoupled.
- Verificato storico: `GITHUB-VERCEL-STATE.md` mappa deploy multipli e indica `ardesia-lavagna`/`ardesia-workspace` 200 storico, `api-vercel` rotto, preview moat gated.
- Non verificato live: stato Vercel corrente, perche' il connector Vercel in questa sessione non ha restituito team.
- Non verificato: repository esterno 'Headroom', URL non identificato con certezza.
- Non fatto: merge, deploy, cancellazione repo, archiviazione repo, modifica driver runtime.
